# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# React Native core
-keep class com.facebook.react.** { *; }
-keep class com.facebook.jni.** { *; }
-keepclasseswithmembernames class * {
    native <methods>;
}
-keepclassmembers class * {
    @com.facebook.react.uimanager.annotations.ReactProp <methods>;
    @com.facebook.react.uimanager.annotations.ReactPropGroup <methods>;
}

# Hermes engine
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }

# React Native Reanimated
-keep class com.swmansion.reanimated.** { *; }
-keepclassmembers class * implements com.facebook.react.bridge.JavaScriptModule {
    public *;
}

# React Native Gesture Handler & Screens
-keep class com.swmansion.gesturehandler.** { *; }
-keep class com.swmansion.rnscreens.** { *; }

# React Native SVG & WebView
-keep class com.horcrux.svg.** { *; }
-keep class com.reactnativecommunity.webview.** { *; }

# React Native Keychain & AsyncStorage
-keep class com.oblador.keychain.** { *; }
-keep class com.reactnativecommunity.asyncstorage.** { *; }

# React Native Permissions & Device Info & Localize
-keep class com.zoontek.rnpermissions.** { *; }
-keep class com.learnium.RNDeviceInfo.** { *; }
-keep class com.zoontek.rnlocalize.** { *; }

# Image Picker & Camera Kit & Touch ID
-keep class com.reactnative.ivpusic.imagepicker.** { *; }
-keep class com.camerakit.** { *; }
-keep class com.rnfingerprint.** { *; }

# Fresco & Animated GIF
-keep class com.facebook.imagepipeline.** { *; }
-keep class com.facebook.animated.gif.** { *; }

# Sentry
-keep class io.sentry.** { *; }
-dontwarn io.sentry.**

# Firebase
-keep class io.invertase.firebase.** { *; }
-dontwarn io.invertase.firebase.**

# Network / OkHttp / Okio
-dontwarn okhttp3.**
-dontwarn okio.**
-dontwarn javax.annotation.**
-dontwarn org.conscrypt.**

# Metadata-extractor (used by image crop picker)
-dontwarn java.awt.**
