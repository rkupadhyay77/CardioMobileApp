import * as Keychain from 'react-native-keychain';
import { Platform } from "react-native";
const SERVICE_NAME = 'com.cardio.login';



export const saveKeyChainCredentials = async (
  email,
  password,
) => {
  try {
    await Keychain.setGenericPassword(
      email,
      password,
      {
        service: SERVICE_NAME,
        accessControl:
          Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
        accessible:
          Keychain.ACCESSIBLE.WHEN_UNLOCKED,
      },
    );

    console.log('Credentials saved successfully');
    console.log('RKDebug:Fetched credentials:', this.getStoredKeyChainCredentials());
    let credential = this.getStoredKeyChainCredentials()
  
    return true;
  } catch (error) {
    console.log('Save Credentials Error', error);
    return false;
  }
};


export const getStoredKeyChainCredentials = async () => {
  try {

    const credentials =
      await Keychain.getGenericPassword({
        service: SERVICE_NAME,
      });
     

    return credentials;
  } catch (error) {
    console.log(
      'Get Credentials Error',
      error,
    );
    return null;
  }
};

export const removeKeyChainCredentials = async () => {
  try {
    await Keychain.resetGenericPassword({
      service: SERVICE_NAME,
    });

    return true;
  } catch (error) {
    console.log(
      'Remove Credentials Error',
      error,
    );
    return false;
  }
};

export const getBiometricType = async () => {
  try {
    return await Keychain.getSupportedBiometryType();
  } catch (error) {
    return null;
  }
};



export async function saveCredentials(username, password) {
  try {
    await Keychain.setGenericPassword(username, JSON.stringify(password), {
      accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
      authenticationPrompt: {
        title: 'Authenticate to save credentials',
      },
    });

    return true;
  } catch (error) {
    console.log('Save Error:', error);
    return false;
  }
}


export async function setCredentials(username,password){
  try {
    await Keychain.setGenericPassword(username, JSON.stringify(password), {
      accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
      authenticationPrompt: {
        title: 'Authenticate to save credentials',
      },
    });

    return true;
  } catch (error) {
    console.log('Save Error:', error);
    return false;
  }
}


export async function isSavedInKeychain() {
    try {
      const credentials = await Keychain.getGenericPassword();
  
      if (!credentials) return false;
  
      return true;
    } catch (error) {
      console.log("Get Error:", error);
      return false;
    }
  }
  

export async function updateCredentials(username,password,callback){
  try {

    // remove old credentials
    await Keychain.resetGenericPassword();

    // save new credentials
    await Keychain.setGenericPassword(
      username,
      JSON.stringify(password),
      {
        accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
      }
    );

    callback(true);

  } catch (error) {
    console.log("Replace Error:", error);
    callback(false);
  }
}

export async function getCredentials(){
  try {
    const credentials = await Keychain.getGenericPassword({
      authenticationPrompt: {
        title: 'Authenticate to login',
      },
    });

    if (credentials) {
      return {
        username: credentials.username,
        password: JSON.parse(credentials.password),
      };
    }

    return null;
  } catch (error) {
    console.log('Get Error:', error);
    return null;
  }
}