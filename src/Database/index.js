/**
 * @class DatabaseManager
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import getStateItem from '../state/getStateItem';
import setStateItem from '../state/setState/setStateItem';
import {DB_KEY} from '../common/helper/keys';

export default class DatabaseManager {
  /**
   * get the user profile Data
   * @param callback Users profile data
   */

  static getUserProfileData(userName, callback) {
    AsyncStorage.getItem(userName).then(value => {
      let profileData = null;
      try {
        profileData = JSON.parse(value);
      } catch (ex) {}
      callback(profileData);
    });
  }

  static saveUserProfileData(userName, userData) {
    AsyncStorage.setItem(userName, JSON.stringify(userData));
  }

  static setLastSyncFor(devId, lastSyncedAt) {
    let signalSyncArray = getStateItem(DB_KEY.SIGNAL_SYNC_ARRAY);
    // blank array
    if (signalSyncArray.length === 0) {
      let data = {devId: devId, lastSyncedAt: lastSyncedAt};
      signalSyncArray.push(data);
      setStateItem(DB_KEY.SIGNAL_SYNC_ARRAY, signalSyncArray);
    } else {
      let foundIndex;
      for (var index = 0; index < signalSyncArray.length; index++) {
        let data = signalSyncArray[index];
        if (data.devId === devId) {
          foundIndex = index;
          data.lastSyncedAt = lastSyncedAt;
          signalSyncArray[index] = data;
          break;
        }
      }

      if (foundIndex === undefined) {
        let data = {devId: devId, lastSyncedAt: lastSyncedAt};
        signalSyncArray.push(data);
      }

      setStateItem(DB_KEY.SIGNAL_SYNC_ARRAY, signalSyncArray);
    }
  }

  static getLastSyncFor(devId) {
    let lastSyncedAt;
    let signalSyncArray = getStateItem(DB_KEY.SIGNAL_SYNC_ARRAY);
    if (signalSyncArray.length > 0) {
      for (var index = 0; index < signalSyncArray.length; index++) {
        let data = signalSyncArray[index];
        if (data.devId === devId) {
          lastSyncedAt = data.lastSyncedAt;
          break;
        }
      }
    }
    return lastSyncedAt;
  }

  static setResidentLastSyncFor(devId, lastSyncedAt) {
    let signalSyncArray = getStateItem(DB_KEY.RESIDENT_SIGNAL_SYNC_ARRAY);
    // blank array
    if (signalSyncArray.length === 0) {
      let data = {devId: devId, lastSyncedAt: lastSyncedAt};
      signalSyncArray.push(data);
      setStateItem(DB_KEY.RESIDENT_SIGNAL_SYNC_ARRAY, signalSyncArray);
    } else {
      let foundIndex;
      for (var index = 0; index < signalSyncArray.length; index++) {
        let data = signalSyncArray[index];
        if (data.devId === devId) {
          foundIndex = index;
          data.lastSyncedAt = lastSyncedAt;
          signalSyncArray[index] = data;
          break;
        }
      }

      if (foundIndex === undefined) {
        let data = {devId: devId, lastSyncedAt: lastSyncedAt};
        signalSyncArray.push(data);
      }

      setStateItem(DB_KEY.RESIDENT_SIGNAL_SYNC_ARRAY, signalSyncArray);
    }
  }

  static getResidentLastSyncFor(devId) {
    let lastSyncedAt;
    let signalSyncArray = getStateItem(DB_KEY.RESIDENT_SIGNAL_SYNC_ARRAY);
    if (signalSyncArray.length > 0) {
      for (var index = 0; index < signalSyncArray.length; index++) {
        let data = signalSyncArray[index];
        if (data.devId === devId) {
          lastSyncedAt = data.lastSyncedAt;
          break;
        }
      }
    }
    return lastSyncedAt;
  }

  static checkIfAlertAlreadyExist(forAlertType, devId) {
    let existAt;
    let alertsArray = getStateItem(DB_KEY.ALERTS_ARRAY);
    if (alertsArray.length > 0) {
      for (var index = 0; index < alertsArray.length; index++) {
        let alert = alertsArray[index];

        if (alert.alertType === forAlertType && alert.devId === devId) {
          existAt = index;
          break;
        }
      }
    }

    return existAt;
  }

  static addNotes(devId, notesData, macAddress) {
    let localDbUser = getStateItem(DB_KEY.LOCAL_DB_USER);
    if (
      localDbUser !== undefined &&
      localDbUser !== null &&
      localDbUser.residentNotesArray !== undefined &&
      localDbUser.residentNotesArray !== null &&
      localDbUser.residentNotesArray.length > 0
    ) {
      this.addNotesTo(
        devId,
        notesData,
        localDbUser.residentNotesArray,
        macAddress,
      );
    } else {
      // there is nno notes and this is the first one
      let residentNotesArray = [];
      let notesArray = [];
      notesArray.push(notesData);
      let dataToSave = {
        devId: devId,
        notesArray: notesArray,
        macAddress: macAddress,
      };
      residentNotesArray.push(dataToSave);
      let localDbUser = getStateItem(DB_KEY.LOCAL_DB_USER);
      localDbUser.residentNotesArray = residentNotesArray;
      let username =
        getStateItem(DB_KEY.GALEN) === true
          ? getStateItem(DB_KEY.USER).emailAddress
          : getStateItem(DB_KEY.USER).username;
      DatabaseManager.saveUserProfileData(username, localDbUser);
      setStateItem(DB_KEY.LOCAL_DB_USER, localDbUser);
    }
  }

  static addNotesTo(devId, notesData, notesArray, macAddress) {
    // considering case we don't have any notes for this resident
    // case :-2 we have notes but this is new note
    // case:3 we have notes and it is edit for that note

    let user =
      getStateItem(DB_KEY.GALEN) === true
        ? getStateItem(DB_KEY.USER).emailAddress
        : getStateItem(DB_KEY.USER).username;

    let userName =
      getStateItem(DB_KEY.GALEN) === true
        ? getStateItem(DB_KEY.USER).emailAddress
        : getStateItem(DB_KEY.USER).username;

    // case:1
    // search for the notes Array for this resident
    let residentIndex = -1;
    let residentNotesArray = [];
    for (var index = 0; index < notesArray.length; index++) {
      let data = notesArray[index];
      if (data.devId === devId && data.macAddress === macAddress) {
        residentNotesArray = data.notesArray;
        residentIndex = index;
        break;
      }
    }

    if (residentNotesArray.length === 0) {
      //<- case:1 we need to only create array and push it back
      let residentNotesArray = [];
      residentNotesArray.push(notesData);
      let dataToSave = {
        devId: devId,
        notesArray: residentNotesArray,
        macAddress: macAddress,
      };
      notesArray.push(dataToSave);
      let localDbUser = getStateItem(DB_KEY.LOCAL_DB_USER);
      localDbUser.residentNotesArray = notesArray;
      DatabaseManager.saveUserProfileData(userName, localDbUser);
      setStateItem(DB_KEY.LOCAL_DB_USER, localDbUser);
    } else {
      //<- case:2 and case 3 we need to only create array and push it back

      let dataFound = false;
      for (var index = 0; index < residentNotesArray.length; index++) {
        let data = residentNotesArray[index];

        if (data.timestamp === notesData.timestamp) {
          dataFound = true;
          residentNotesArray[index] = notesData;
          // update this and exit from the loop
          let dataToSave = {
            devId: devId,
            notesArray: residentNotesArray,
            macAddress: macAddress,
          };
          notesArray[residentIndex] = dataToSave;
          let localDbUser = getStateItem(DB_KEY.LOCAL_DB_USER);
          localDbUser.residentNotesArray = notesArray;
          DatabaseManager.saveUserProfileData(userName, localDbUser);
          setStateItem(DB_KEY.LOCAL_DB_USER, localDbUser);
          return;
        }
      }

      if (dataFound === false) {
        residentNotesArray.push(notesData);
        let dataToSave = {
          devId: devId,
          notesArray: residentNotesArray,
          macAddress: macAddress,
        };
        notesArray[residentIndex] = dataToSave;
        let localDbUser = getStateItem(DB_KEY.LOCAL_DB_USER);
        localDbUser.residentNotesArray = notesArray;
        DatabaseManager.saveUserProfileData(userName, localDbUser);

        setStateItem(DB_KEY.LOCAL_DB_USER, localDbUser);
      }
    }
  }

  static getNotesForResident(devId, macAddress) {
    let residentNotesArray = [];
    let localDbUser = getStateItem(DB_KEY.LOCAL_DB_USER);

    if (
      localDbUser !== undefined &&
      localDbUser !== null &&
      localDbUser.residentNotesArray !== undefined &&
      localDbUser.residentNotesArray !== null
    ) {
      for (
        var index = 0;
        index < localDbUser.residentNotesArray.length;
        index++
      ) {
        let data = localDbUser.residentNotesArray[index];
        if (data.devId === devId && data.macAddress === macAddress) {
          residentNotesArray = data.notesArray;
          break;
        }
      }
    }

    return residentNotesArray;
  }

  static deleteNotesForResident(devId, timestamp, macAddress) {
    let user =
      getStateItem(DB_KEY.GALEN) === true
        ? getStateItem(DB_KEY.USER).emailAddress
        : getStateItem(DB_KEY.USER).username;

    let userName =
      getStateItem(DB_KEY.GALEN) === true
        ? getStateItem(DB_KEY.USER).emailAddress
        : getStateItem(DB_KEY.USER).username;

    let notesArray = [];
    let localDbUser = getStateItem(DB_KEY.LOCAL_DB_USER);

    if (
      localDbUser !== undefined &&
      localDbUser !== null &&
      localDbUser.residentNotesArray !== undefined &&
      localDbUser.residentNotesArray !== null
    ) {
      let residentNotesArray = localDbUser.residentNotesArray;
      for (var index = 0; index < residentNotesArray.length; index++) {
        let data = residentNotesArray[index];
        if (data.devId === devId && data.macAddress === macAddress) {
          notesArray = data.notesArray;
          // now iterate and remove notes from found index
          if (notesArray.length === 1) {
            // this resident has only one note remove resident
            residentNotesArray.splice(index, 1);
            localDbUser.residentNotesArray = residentNotesArray;
            DatabaseManager.saveUserProfileData(userName, localDbUser);
            setStateItem(DB_KEY.LOCAL_DB_USER, localDbUser);
            break;
          } else {
            for (newIndex = 0; newIndex < notesArray.length; newIndex++) {
              let notes = notesArray[newIndex];
              if (notes.timestamp === timestamp) {
                notesArray.splice(newIndex, 1);
                let dataToSave = {
                  devId: devId,
                  notesArray: notesArray,
                  macAddress: macAddress,
                };
                residentNotesArray[index] = dataToSave;
                localDbUser.residentNotesArray = residentNotesArray;
                DatabaseManager.saveUserProfileData(userName, localDbUser);
                setStateItem(DB_KEY.LOCAL_DB_USER, localDbUser);
                break;
              }
            }
          }
        }
      }
    }
  }

  static setBiometricConfigured() {
    AsyncStorage.setItem('biometricConfigured', 'true');
  }

  static getBiometricConfigured(callback) {
    AsyncStorage.getItem('biometricConfigured').then(status => {
      callback(status);
    });
  }

  // set Sensor mac address for email address
  static getMacAddressForEmail(email, callback) {
    AsyncStorage.getItem(email).then(value => {
      let macAddress = '';
      try {
        macAddress = value;
      } catch (ex) {}
      callback(macAddress);
    });
  }

  static setMacAddress(macAddress, email) {
    AsyncStorage.setItem(email, macAddress);
  }
}
