import {NativeModules, Linking, Share} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import assign from 'object-assign';
import EventEmitter from 'events';
import getStateItem from '../../../state/getStateItem';
import {DB_KEY} from '../keys';
import EventLoggingChange from '../../../state/emitters/eventLoggingChange';

export const LogFilesEventEmitter = assign(EventEmitter.prototype, {
  addLogFilesChangeListener: function (cb) {
    this.on('LOG_FILES_CHANGED', cb);
  },
  removeLogFilesChangeListener: function (cb) {
    this.removeListener('LOG_FILES_CHANGED', cb);
  },
  emitChange: function () {
    this.emit('LOG_FILES_CHANGED');
  },
});

export const getCurrentUserIdentifier = () => {
  try {
    const user = getStateItem(DB_KEY.USER);
    if (user) {
      if (user.emailAddress && typeof user.emailAddress === 'string') {
        return user.emailAddress.trim();
      }
      if (user.userId) {
        return String(user.userId).trim();
      }
      if (user.username && typeof user.username === 'string') {
        return user.username.trim();
      }
    }
    const email = getStateItem(DB_KEY.USER_EMAIL);
    if (email && typeof email === 'string') {
      return email.trim();
    }
    const name = getStateItem(DB_KEY.USER_NAME);
    if (name && typeof name === 'string') {
      return name.trim();
    }
  } catch (e) {
    console.log('Error getting current user identifier:', e);
  }
  return 'default_user';
};

export const getSafeUserKey = userIdentifier => {
  const id = userIdentifier || getCurrentUserIdentifier();
  return id.replace(/[^a-zA-Z0-9_-]/g, '_');
};

class LogFileManager {
  constructor() {
    this.isSessionActive = false;
    this.sessionStartTime = null;
    this.sessionUser = null;
    this.currentSessionEvents = [];

    // Automatically capture events emitted across the app
    EventLoggingChange.addEventLoggingChangeListener(() => {
      const isLoggingEnabled = getStateItem(DB_KEY.IS_EVENT_LOGIN_ENABLED);
      if (!isLoggingEnabled) {
        return;
      }
      const eventLogArray = getStateItem(DB_KEY.EVENT_LOG_ARRAY) || [];
      if (eventLogArray.length > 0) {
        this.addEvent(eventLogArray[0]);
      }
    });
  }

  startSession(user) {
    if (this.isSessionActive) {
      return;
    }
    this.isSessionActive = true;
    this.sessionStartTime = new Date();
    this.sessionUser = user || getCurrentUserIdentifier();
    this.currentSessionEvents = [];

    const existingLogs = getStateItem(DB_KEY.EVENT_LOG_ARRAY) || [];
    if (existingLogs.length > 0) {
      this.currentSessionEvents = [...existingLogs];
    }
    console.log(
      `[LogFileManager] Session started for user: ${this.sessionUser} at ${this.sessionStartTime.toISOString()}`,
    );
  }

  addEvent(event) {
    const isLoggingEnabled = getStateItem(DB_KEY.IS_EVENT_LOGIN_ENABLED);
    if (!isLoggingEnabled) {
      return;
    }
    if (!this.isSessionActive) {
      this.startSession();
    }
    if (event) {
      // Avoid duplicate consecutive entries
      const last = this.currentSessionEvents[0];
      if (
        last &&
        last._time === event._time &&
        last.description === event.description
      ) {
        return;
      }
      this.currentSessionEvents.unshift(event);
    }
  }

  async saveCurrentSessionToFile(keepActive = false) {
    // Check if state has any additional events
    const stateLogs = getStateItem(DB_KEY.EVENT_LOG_ARRAY) || [];
    if (stateLogs.length >= this.currentSessionEvents.length && stateLogs.length > 0) {
      this.currentSessionEvents = [...stateLogs];
    }

    if (this.currentSessionEvents.length === 0) {
      console.log('[LogFileManager] No events to save. File not saved.');
      if (!keepActive) {
        this.isSessionActive = false;
        this.currentSessionEvents = [];
        this.sessionUser = null;
        this.sessionStartTime = null;
      }
      return null;
    }

    const savedAt = new Date();
    const timestampFormatted = moment(savedAt).format('YYYY-MM-DD_HH-mm-ss');
    const fileName = `Log_${timestampFormatted}.txt`;
    const userDisplay = this.sessionUser || getCurrentUserIdentifier();
    const userKey = getSafeUserKey(userDisplay);

    let content = `========================================\n`;
    content += `CARDIO EVENT LOG FILE\n`;
    content += `User: ${userDisplay}\n`;
    content += `Saved At: ${moment(savedAt).format('YYYY-MM-DD HH:mm:ss')}\n`;
    content += `Total Events: ${this.currentSessionEvents.length}\n`;
    content += `========================================\n\n`;

    const eventsToFormat = [...this.currentSessionEvents].reverse();
    eventsToFormat.forEach((item, index) => {
      const time = item._time || item.timestamp || '';
      const desc =
        item.description ||
        item.message ||
        (typeof item === 'string' ? item : JSON.stringify(item));
      content += `[${time}] #${index + 1}: ${desc}\n`;
    });
    content += `\n========================================\nEnd of Log File\n`;

    const fileId = `${userKey}_${savedAt.getTime()}_${Math.random()
      .toString(36)
      .substring(2, 7)}`;
    let filePath = '';

    // Write file to native filesystem if react-native-fs is available
    try {
      if (NativeModules && NativeModules.RNFSManager) {
        const RNFS = require('react-native-fs');
        const logsDir = `${RNFS.DocumentDirectoryPath}/logs/${userKey}`;
        await RNFS.mkdir(logsDir).catch(() => {});
        filePath = `${logsDir}/${fileName}`;
        await RNFS.writeFile(filePath, content, 'utf8');
        console.log('[LogFileManager] File written to disk at:', filePath);
      }
    } catch (fsErr) {
      console.log('[LogFileManager] Native FS write warning:', fsErr);
    }

    const fileRecord = {
      id: fileId,
      fileName,
      savedAt: savedAt.toISOString(),
      formattedDate: moment(savedAt).format('MMM D, YYYY h:mm:ss A'),
      eventCount: this.currentSessionEvents.length,
      sizeBytes: content.length,
      filePath,
      user: userDisplay,
      userKey,
      content,
    };

    const storageKey = `@Cardio:logs:${userKey}`;
    try {
      const existingJson = await AsyncStorage.getItem(storageKey);
      const existingList = existingJson ? JSON.parse(existingJson) : [];
      existingList.unshift(fileRecord);
      if (existingList.length > 50) {
        existingList.splice(50);
      }
      await AsyncStorage.setItem(storageKey, JSON.stringify(existingList));
      console.log(`[LogFileManager] Saved log file record to AsyncStorage for user: ${userKey}`);
    } catch (storageErr) {
      console.log('[LogFileManager] AsyncStorage save error:', storageErr);
    }

    if (!keepActive) {
      this.isSessionActive = false;
      this.currentSessionEvents = [];
      this.sessionUser = null;
      this.sessionStartTime = null;
    }

    LogFilesEventEmitter.emitChange();
    return fileRecord;
  }

  async stopSessionAndSaveFile() {
    return this.saveCurrentSessionToFile(false);
  }

  async getLogFilesForUser(userIdentifier) {
    const userKey = getSafeUserKey(userIdentifier);
    const storageKey = `@Cardio:logs:${userKey}`;
    try {
      const data = await AsyncStorage.getItem(storageKey);
      if (data) {
        const files = JSON.parse(data);
        return Array.isArray(files) ? files : [];
      }
    } catch (err) {
      console.log('[LogFileManager] Error fetching log files:', err);
    }
    return [];
  }

  async deleteLogFile(fileId, userIdentifier) {
    const userKey = getSafeUserKey(userIdentifier);
    const storageKey = `@Cardio:logs:${userKey}`;
    try {
      const data = await AsyncStorage.getItem(storageKey);
      if (data) {
        const files = JSON.parse(data);
        const fileToDelete = files.find(f => f.id === fileId);
        const filtered = files.filter(f => f.id !== fileId);
        await AsyncStorage.setItem(storageKey, JSON.stringify(filtered));

        // Delete from native disk if file path exists
        if (fileToDelete && fileToDelete.filePath) {
          try {
            if (NativeModules && NativeModules.RNFSManager) {
              const RNFS = require('react-native-fs');
              const exists = await RNFS.exists(fileToDelete.filePath);
              if (exists) {
                await RNFS.unlink(fileToDelete.filePath);
              }
            }
          } catch (delErr) {
            console.log('[LogFileManager] Native file unlink warning:', delErr);
          }
        }
        LogFilesEventEmitter.emitChange();
        return true;
      }
    } catch (err) {
      console.log('[LogFileManager] Error deleting log file:', err);
    }
    return false;
  }

  async emailLogFile(file) {
    if (!file) return;

    const subject = `Cardio Log File: ${file.fileName}`;
    const body = file.content || 'Log file content';
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;

    try {
      const supported = await Linking.canOpenURL(mailtoUrl);
      if (supported) {
        await Linking.openURL(mailtoUrl);
      } else {
        await Share.share({
          title: file.fileName,
          message: body,
        });
      }
    } catch (err) {
      console.log('[LogFileManager] Email dispatch fallback to Share:', err);
      try {
        await Share.share({
          title: file.fileName,
          message: body,
        });
      } catch (shareErr) {
        console.log('[LogFileManager] Share error:', shareErr);
      }
    }
  }
}

const instance = new LogFileManager();
export default instance;
