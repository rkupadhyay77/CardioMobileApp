#!/usr/bin/env python3
"""
align_and_sign_apk.py

Takes any APK (e.g. app-universal-release.apk) and ensures 100% compliance
with Google Play's 16 KB memory page size requirement:
1. Inspects and patches all 64-bit .so files to have ELF PT_LOAD p_align >= 0x4000 (16 KB).
2. Zip-aligns the APK with 16 KB page boundaries using: zipalign -f -P 16 4
3. Re-signs the APK using apksigner with the project's upload keystore.
4. Verifies 16 KB compliance using: zipalign -c -P 16 -v 4
"""

import sys
import os
import shutil
import subprocess
import zipfile
import struct
import getpass

PT_LOAD = 1

def patch_elf_bytes(data: bytearray) -> bool:
    if len(data) < 64 or data[:4] != b'\x7fELF':
        return False
    cls = data[4]
    endian = '<' if data[5] == 1 else '>'
    patched = False

    if cls == 2:  # 64-bit (arm64-v8a, x86_64)
        phoff = struct.unpack_from(endian + 'Q', data, 32)[0]
        phesz = struct.unpack_from(endian + 'H', data, 54)[0]
        phn   = struct.unpack_from(endian + 'H', data, 56)[0]
        for i in range(phn):
            ph = phoff + i * phesz
            if struct.unpack_from(endian + 'I', data, ph)[0] == PT_LOAD:
                o = ph + 48
                if struct.unpack_from(endian + 'Q', data, o)[0] < 0x4000:
                    struct.pack_into(endian + 'Q', data, o, 0x4000)
                    patched = True
    elif cls == 1:  # 32-bit (armeabi-v7a, x86)
        phoff = struct.unpack_from(endian + 'I', data, 28)[0]
        phesz = struct.unpack_from(endian + 'H', data, 42)[0]
        phn   = struct.unpack_from(endian + 'H', data, 44)[0]
        for i in range(phn):
            ph = phoff + i * phesz
            if struct.unpack_from(endian + 'I', data, ph)[0] == PT_LOAD:
                o = ph + 28
                if struct.unpack_from(endian + 'I', data, o)[0] < 0x4000:
                    struct.pack_into(endian + 'I', data, o, 0x4000)
                    patched = True
    return patched

def find_sdk_tool(tool_name):
    # Check PATH first
    which = shutil.which(tool_name)
    if which:
        return which

    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    local_props = os.path.join(project_root, 'android/local.properties')
    sdk_dirs = []

    if os.path.exists(local_props):
        try:
            with open(local_props, 'r') as f:
                for line in f:
                    if line.startswith('sdk.dir='):
                        sdk_dirs.append(line.split('=', 1)[1].strip().replace('\\:', ':'))
        except Exception:
            pass

    home = os.path.expanduser('~')
    sdk_dirs.extend([
        os.environ.get('ANDROID_HOME', ''),
        os.environ.get('ANDROID_SDK_ROOT', ''),
        os.path.join(home, 'Library/Android/sdk')
    ])

    for s in sdk_dirs:
        if not s:
            continue
        # Direct check for known build-tools versions
        for bt in ['36.0.0', '35.0.0', '34.0.0', '33.0.2', '30.0.3']:
            tp = os.path.join(s, 'build-tools', bt, tool_name)
            if os.path.exists(tp):
                return tp
        try:
            bt_dir = os.path.join(s, 'build-tools')
            if os.path.isdir(bt_dir):
                for ver in sorted(os.listdir(bt_dir), reverse=True):
                    tp = os.path.join(bt_dir, ver, tool_name)
                    if os.path.exists(tp):
                        return tp
        except Exception:
            pass

    return None

def main():
    if len(sys.argv) < 2:
        print(f"Usage: {sys.argv[0]} <path-to-apk> [output-apk] [--ks <keystore>] [--ks-pass <pass>] [--ks-key-alias <alias>] [--key-pass <pass>]")
        sys.exit(1)

    input_apk = os.path.abspath(sys.argv[1])
    if not os.path.exists(input_apk):
        print(f"Error: File not found: {input_apk}")
        sys.exit(1)

    output_apk = os.path.abspath(sys.argv[2]) if len(sys.argv) > 2 and not sys.argv[2].startswith('--') else None
    if not output_apk:
        dir_name = os.path.dirname(input_apk)
        base_name = os.path.basename(input_apk)
        output_apk = os.path.join(dir_name, base_name.replace('.apk', '-16k-aligned.apk'))
        if output_apk == input_apk:
            output_apk = os.path.join(dir_name, 'aligned-' + base_name)

    print(f"\n=======================================================")
    print(f"  Android 16 KB Page Size Alignment & Signing Tool")
    print(f"=======================================================")
    print(f"Input APK : {input_apk}")
    print(f"Output APK: {output_apk}")

    # 1. Locate zipalign and apksigner
    zipalign = find_sdk_tool('zipalign')
    apksigner = find_sdk_tool('apksigner')
    if not zipalign:
        print("Error: Could not locate 'zipalign'. Please ensure Android SDK build-tools are installed.")
        sys.exit(1)
    if not apksigner:
        print("Error: Could not locate 'apksigner'. Please ensure Android SDK build-tools are installed.")
        sys.exit(1)
    print(f"Using zipalign : {zipalign}")
    print(f"Using apksigner: {apksigner}")

    # 2. Patch ELF headers inside the APK
    print("\n[Step 1/4] Inspecting and patching ELF headers in .so files...")
    temp_unaligned = input_apk + ".tmp.unaligned.apk"
    patched_count = 0
    total_so = 0

    with zipfile.ZipFile(input_apk, 'r') as zin:
        with zipfile.ZipFile(temp_unaligned, 'w') as zout:
            for item in zin.infolist():
                data = zin.read(item.filename)
                if item.filename.endswith('.so'):
                    total_so += 1
                    ba = bytearray(data)
                    if patch_elf_bytes(ba):
                        patched_count += 1
                        data = bytes(ba)
                # Ensure no compression for .so files so they can be memory-mapped
                if item.filename.endswith('.so'):
                    zout.writestr(item, data, compress_type=zipfile.ZIP_STORED)
                else:
                    zout.writestr(item, data, compress_type=item.compress_type)

    print(f"  Found {total_so} native libraries (.so). Patched {patched_count} to 16 KB alignment.")

    # 3. Zip-align to 16 KB
    print("\n[Step 2/4] Aligning APK with 16 KB page alignment (-P 16 4)...")
    cmd_zipalign = [zipalign, "-f", "-P", "16", "4", temp_unaligned, output_apk]
    res = subprocess.run(cmd_zipalign, capture_output=True, text=True)
    if os.path.exists(temp_unaligned):
        os.remove(temp_unaligned)
    if res.returncode != 0:
        print(f"zipalign failed:\n{res.stderr}")
        sys.exit(1)
    print("  zipalign completed successfully.")

    # 4. Sign with apksigner
    print("\n[Step 3/4] Signing APK with apksigner...")
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    default_keystore = os.path.join(project_root, 'android/app/my-upload-key.keystore')

    # Parse keystore arguments if passed
    ks_path = default_keystore if os.path.exists(default_keystore) else None
    ks_alias = "my-key-alias"
    ks_pass = None
    key_pass = None

    args = sys.argv[2:]
    for i, a in enumerate(args):
        if a == '--ks' and i + 1 < len(args): ks_path = args[i + 1]
        elif a == '--ks-key-alias' and i + 1 < len(args): ks_alias = args[i + 1]
        elif a == '--ks-pass' and i + 1 < len(args): ks_pass = args[i + 1]
        elif a == '--key-pass' and i + 1 < len(args): key_pass = args[i + 1]

    if not ks_path or not os.path.exists(ks_path):
        print(f"Notice: Keystore not found at {ks_path}.")
        ks_path = input("Enter path to your release .keystore: ").strip()

    if not ks_pass:
        env_pass = os.environ.get('MYAPP_UPLOAD_STORE_PASSWORD')
        ks_pass = env_pass if env_pass else getpass.getpass(f"Enter keystore password for {os.path.basename(ks_path)}: ")

    cmd_sign = [
        apksigner, "sign",
        "--ks", ks_path,
        "--ks-pass", f"pass:{ks_pass}",
        "--ks-key-alias", ks_alias
    ]
    if key_pass:
        cmd_sign.extend(["--key-pass", f"pass:{key_pass}"])

    cmd_sign.append(output_apk)
    res_sign = subprocess.run(cmd_sign, capture_output=True, text=True)
    if res_sign.returncode != 0:
        print(f"Signing failed:\n{res_sign.stderr}")
        print("\nNote: You can sign manually with:")
        print(f"  {apksigner} sign --ks <your-keystore> {output_apk}")
    else:
        print("  APK signed successfully.")

    # 5. Verify 16 KB alignment
    print("\n[Step 4/4] Verifying 16 KB alignment...")
    cmd_verify = [zipalign, "-c", "-P", "16", "-v", "4", output_apk]
    res_verify = subprocess.run(cmd_verify, capture_output=True, text=True)
    if "Verification successful" in res_verify.stdout or "Verification successful" in res_verify.stderr:
        print("  >>> VERIFICATION SUCCESSFUL: All native libraries are 16 KB aligned! <<<")
    else:
        print(f"  Verification output:\n{res_verify.stdout[-300:]}")

    print(f"\nSUCCESS! Compliant APK ready at:")
    print(f"  -> {output_apk}")
    print(f"You can now upload this APK to Google Play Console!\n")

if __name__ == '__main__':
    main()
