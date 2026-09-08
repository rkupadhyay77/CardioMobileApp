import TouchID from 'react-native-touch-id';

export  async function  checkBiometricSupportedEnrolled(callback){
    const optionalConfigObject = {
        unifiedErrors: false, // use unified error messages (default false)
        passcodeFallback: false // if true is passed, it will allow isSupported to return an error if the device is not enrolled in touch id/face id etc. Otherwise, it will just tell you what method is supported, even if the user is not enrolled.  (default false)
    }

    TouchID.isSupported(optionalConfigObject)
    .then(biometryType => {
         // Success code.
         // as we are focusing on fingerprint for now 
         if (biometryType) {
          callback(true)
         } else {
            let fingerprintLableForOS = Platform.OS == "ios" ? "Touch ID" : "Fingerprint";
            callback( fingerprintLableForOS + " is not available on this device");
              }
          }).catch(error => {
            
               // iOS Error Format and android error formats are different
               // android use code and ios use name
               // check at https://github.com/naoufal/react-native-touch-id
               let errorCode = Platform.OS == "ios" ? error.name : error.code;
               if (errorCode === "LAErrorTouchIDNotEnrolled" || errorCode === "NOT_AVAILABLE" || errorCode === "NOT_ENROLLED") {
             let fingerprintLableForOS = Platform.OS == "ios" ? "Touch ID" : "Fingerprint";
             callback(fingerprintLableForOS + " has no enrolled fingers. Please go to settings and enable " + fingerprintLableForOS + " on this device.");
               } else {
                callback(Platform.OS == "ios" ? error.message : translations.t(error.code));
               }
           });
}


// export const checkBiometricSupportednEnrolled = async () => {
//    const optionalConfigObject = {
//        unifiedErrors: false, // use unified error messages (default false)
//        passcodeFallback: false // if true is passed, it will allow isSupported to return an error if the device is not enrolled in touch id/face id etc. Otherwise, it will just tell you what method is supported, even if the user is not enrolled.  (default false)
//    }
//    return new Promise((resolve, reject) => {
//        //isSupported returns both cases 1. if supported 2. Is enabled/configured/enrolled
//        TouchID.isSupported(optionalConfigObject)
//            .then(biometryType => {

//                // Success code.
//          // as we are focusing on fingerprint for now 
//                if (biometryType) {
//                    resolve(true);
//                } else {
//              let fingerprintLableForOS = Platform.OS == "ios" ? "Touch ID" : "Fingerprint";
//                    reject( fingerprintLableForOS + " is not available on this device");
//                }
//            })
//            .catch(error => {

//                // iOS Error Format and android error formats are different
//                // android use code and ios use name
//                // check at https://github.com/naoufal/react-native-touch-id
//                let errorCode = Platform.OS == "ios" ? error.name : error.code;
//                if (errorCode === "LAErrorTouchIDNotEnrolled" || errorCode === "NOT_AVAILABLE" || errorCode === "NOT_ENROLLED") {
//              let fingerprintLableForOS = Platform.OS == "ios" ? "Touch ID" : "Fingerprint";
//                    resolve(fingerprintLableForOS + " has no enrolled fingers. Please go to settings and enable " + fingerprintLableForOS + " on this device.");
//                } else {
//                    reject(Platform.OS == "ios" ? error.message : translations.t(error.code));
//                }
//            });
//    });
// }