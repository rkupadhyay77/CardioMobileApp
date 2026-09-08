import assign from 'object-assign';
import EventEmitter from 'events';

// emitter for residents data change

export const ResidentsChange = assign(EventEmitter.prototype, {
  addResidentsChangeListener: function (cb) {
    this.on('RESIDENTS_CHANGE', cb);
  },
  removeResidentsChangeListener: function (cb) {
    this.removeListener('RESIDENTS_CHANGE', cb);
  },
});

// emitter for residents Tapped

export const ResidentsTapped = assign(EventEmitter.prototype, {
  addResidentsTappedListener: function (cb) {
    this.on('RESIDENTS_TAPPED', cb);
  },
  removeResidentsTappedListener: function (cb) {
    this.removeListener('RESIDENTS_TAPPED', cb);
  },
});

// emitter for Alerts

export const AlertsChanged = assign(EventEmitter.prototype, {
  addAlertsChangedListener: function (cb) {
    this.on('ALERTS_CHANGED', cb);
  },
  removeAlertsChangedListener: function (cb) {
    this.removeListener('ALERTS_CHANGED', cb);
  },
});

export const AlertsNumberChanged = assign(EventEmitter.prototype, {
  addAlertsNumberChangedListener: function (cb) {
    this.on('ALERTS__NUMBER_CHANGED', cb);
  },
  removeAlertsNumberChangedListener: function (cb) {
    this.removeListener('ALERTS__NUMBER_CHANGED', cb);
  },
});

export const ShowThemeAlertChanged = assign(EventEmitter.prototype, {
  addShowThemeAlertChangedistener: function (cb) {
    this.on('SHOW__THEME_ALERT', cb);
  },
  removeShowThemeAlertChangedListener: function (cb) {
    this.removeListener('SHOW__THEME_ALERT', cb);
  },
});

export const ShowPracticeListChanged = assign(EventEmitter.prototype, {
  addShowPracticeListListener: function (cb) {
    this.on('SHOW__PRACTICE_LIST', cb);
  },
  removeShowPracticeListListener: function (cb) {
    this.removeListener('SHOW__PRACTICE_LIST', cb);
  },
});

export const ShowStatsThemeChanged = assign(EventEmitter.prototype, {
  addShowStatsThemeChangedChangedListener: function (cb) {
    this.on('SHOW__STATS_THEME', cb);
  },
  removeShowStatsThemeChangedListener: function (cb) {
    this.removeListener('SHOW__STATS_THEME', cb);
  },
});

export const SelectedPracticeChanged = assign(EventEmitter.prototype, {
  addSelectedPracticeChangedListener: function (cb) {
    this.on('SELECTED__PRACTICE_CHANGED', cb);
  },
  removeSelectedPracticeChangedListener: function (cb) {
    this.removeListener('SELECTED__PRACTICE_CHANGED', cb);
  },
});

export const ShowUnitTypeAlert = assign(EventEmitter.prototype, {
  addSShowUnitTypeAlertListener: function (cb) {
    this.on('SHOW__UNIT_ALERT', cb);
  },
  removeShowUnitTypeAlertListener: function (cb) {
    this.removeListener('SHOW__UNIT_ALERT', cb);
  },
});

export const UnitTypeChanged = assign(EventEmitter.prototype, {
  addUnitTypeChangedListener: function (cb) {
    this.on('UNIT_TYPE_CHANGED', cb);
  },
  removeUnitTypeChangedListener: function (cb) {
    this.removeListener('UNIT_TYPE_CHANGED', cb);
  },
});

export const StatsThemeChanged = assign(EventEmitter.prototype, {
  addStatsThemeChangedListener: function (cb) {
    this.on('STATS_THEME_CHANGED', cb);
  },
  removeStatsThemeChangedListener: function (cb) {
    this.removeListener('STATS_THEME_CHANGED', cb);
  },
});

export const LastSyncChanged = assign(EventEmitter.prototype, {
  addLastSyncChangedListener: function (cb) {
    this.on('LAST_SYNC_CHANGED', cb);
  },
  removeLastSyncChangedListener: function (cb) {
    this.removeListener('LAST_SYNC_CHANGED', cb);
  },
});

export const UploadImageTapped = assign(EventEmitter.prototype, {
  addUploadImageTappedListener: function (cb) {
    this.on('UPLOAD_IMAGE_TAPPED', cb);
  },
  removeUploadImageTappedListener: function (cb) {
    this.removeListener('UPLOAD_IMAGE_TAPPED', cb);
  },
});

export const UploadImageSelected = assign(EventEmitter.prototype, {
  addUploadImageSelectedListener: function (cb) {
    this.on('UPLOAD_IMAGE_SELECTED', cb);
  },
  removeUploadImageSelectedListener: function (cb) {
    this.removeListener('UPLOAD_IMAGE_SELECTED', cb);
  },
});

export const PasswordChanged = assign(EventEmitter.prototype, {
  addPasswordChangedListener: function (cb) {
    this.on('PASSWORD_CHANGED', cb);
  },
  removePasswordChangedListener: function (cb) {
    this.removeListener('PASSWORD_CHANGED', cb);
  },
});

export const UpdateSensorChanged = assign(EventEmitter.prototype, {
  addUpdateSensorChangedListener: function (cb) {
    this.on('UPDATE_SENSOR_CHANGED', cb);
  },
  removeUpdateSensorChangedListener: function (cb) {
    this.removeListener('UPDATE_SENSOR_CHANGED', cb);
  },
});

export const AppInBackground = assign(EventEmitter.prototype, {
  addAppInBackgroundListener: function (cb) {
    this.on('APP_IN_BACKGROUND', cb);
  },
  removeAppInBackgroundListener: function (cb) {
    this.removeListener('APP_IN_BACKGROUND', cb);
  },
});

export const AppInForeground = assign(EventEmitter.prototype, {
  addAppInForegroundListener: function (cb) {
    this.on('APP_IN_FOREGROUND', cb);
  },
  removeAppInForegroundListener: function (cb) {
    this.removeListener('APP_IN_FOREGROUND', cb);
  },
});

export const StatsTabTapped = assign(EventEmitter.prototype, {
  addStatsTabTappedListener: function (cb) {
    this.on('STATS_TAB_TAPPED', cb);
  },
  removeStatsTabTappedListener: function (cb) {
    this.removeListener('STATS_TAB_TAPPED', cb);
  },
});

export const StatsSectionTapped = assign(EventEmitter.prototype, {
  addStatsSectionTappedListener: function (cb) {
    this.on('STATS_SELECTION_TAPPED', cb);
  },
  removeStatsSectionTappedListener: function (cb) {
    this.removeListener('STATS_SELECTION_TAPPED', cb);
  },
});

export const NotesListingChange = assign(EventEmitter.prototype, {
  addNotesListingChangeListener: function (cb) {
    this.on('NOTES_LISTING_CHANGE', cb);
  },
  removeNotesListingChangeListener: function (cb) {
    this.removeListener('NOTES_LISTING_CHANGE', cb);
  },
});

export const OrientationDidChange = assign(EventEmitter.prototype, {
  addOrientationDidChangeListener: function (cb) {
    this.on('ORIENTATION_DID_CHANGE', cb);
  },
  removeOrientationDidChangeListener: function (cb) {
    this.removeListener('ORIENTATION_DID_CHANGE', cb);
  },
});

export const LoginMounted = assign(EventEmitter.prototype, {
  addLoginMountedListener: function (cb) {
    this.on('LOGIN_MOUNTED', cb);
  },
  removeLoginMountedListener: function (cb) {
    this.removeListener('LOGIN_MOUNTED', cb);
  },
});

export const SendOtpDidChange = assign(EventEmitter.prototype, {
  addSendOtpDidChangeListener: function (cb) {
    this.on('SEND_OTP_DID_CHANGE', cb);
  },
  removeSendOtpDidChangeListener: function (cb) {
    this.removeListener('SEND_OTP_DID_CHANGE', cb);
  },
});

export const ResetPasswordDidChange = assign(EventEmitter.prototype, {
  addResetPasswordDidChangeListener: function (cb) {
    this.on('RESET_PASSWORD_DID_CHANGE', cb);
  },
  removeResetPasswordDidChangeListener: function (cb) {
    this.removeListener('RESET_PASSWORD_DID_CHANGE', cb);
  },
});

export const RegisterUserDidChange = assign(EventEmitter.prototype, {
  addRegisterUserListener: function (cb) {
    this.on('REGISTER_USER_CHANGE', cb);
  },
  removeRegisterUserListener: function (cb) {
    this.removeListener('REGISTER_USER_CHANGE', cb);
  },
});

export const ValidateUserDidChange = assign(EventEmitter.prototype, {
  addValidateUserListener: function (cb) {
    this.on('VALIDATE_USER_CHANGE', cb);
  },
  removeValidateUserListener: function (cb) {
    this.removeListener('VALIDATE_USER_CHANGE', cb);
  },
});

export const InviteObserveDidChange = assign(EventEmitter.prototype, {
  addInviteObserveListener: function (cb) {
    this.on('INVITE_OBSERVE_CHANGE', cb);
  },
  removeInviteObserveListener: function (cb) {
    this.removeListener('INVITE_OBSERVE_CHANGE', cb);
  },
});

export const ObserveListDidChange = assign(EventEmitter.prototype, {
  addObserveListListener: function (cb) {
    this.on('OBSERVE_LIST_CHANGE', cb);
  },
  removeObserveListListener: function (cb) {
    this.removeListener('OBSERVE_LIST_CHANGE', cb);
  },
});

export const UsersListDidChange = assign(EventEmitter.prototype, {
  addUsersListListener: function (cb) {
    this.on('USERS_LIST_CHANGE', cb);
  },
  removeUsersListListener: function (cb) {
    this.removeListener('USERS_LIST_CHANGE', cb);
  },
});

export const CustomDataObtained = assign(EventEmitter.prototype, {
  addCustomDataObtainedListener: function (cb) {
    this.on('CUSTOM_DATA_OBTAINED', cb);
  },
  removeCustomDataObtainedListener: function (cb) {
    this.removeListener('CUSTOM_DATA_OBTAINED', cb);
  },
});

export const CustomDataChange = assign(EventEmitter.prototype, {
  addCustomDataChangeListener: function (cb) {
    this.on('CUSTOM_DATA_CHANGED', cb);
  },
  removeCustomDataChangeListener: function (cb) {
    this.removeListener('CUSTOM_DATA_CHANGED', cb);
  },
});

export const SensorDataChange = assign(EventEmitter.prototype, {
  addSensorDataChangeListener: function (cb) {
    this.on('SENSOR_DATA_CHANGED', cb);
  },
  removeSensorDataChangeListener: function (cb) {
    this.removeListener('SENSOR_DATA_CHANGED', cb);
  },
});

export const SensorAddedForResident = assign(EventEmitter.prototype, {
  addSensorAddedForResident: function (cb) {
    this.on('SENSOR__FOR_RESIDENT', cb);
  },
  removeSensorAddedForResident: function (cb) {
    this.removeListener('SENSOR__FOR_RESIDENT', cb);
  },
});

export const NightModeModified = assign(EventEmitter.prototype, {
  addNightModeModified: function (cb) {
    this.on('NIGHT_MODE_MODIFIED', cb);
  },
  removeNightModeModified: function (cb) {
    this.removeListener('NIGHT_MODE_MODIFIED', cb);
  },
});

export const TimezoneModified = assign(EventEmitter.prototype, {
  addTimezoneModified: function (cb) {
    this.on('TIMEZONE_MODIFIED', cb);
  },
  removeTimezoneModified: function (cb) {
    this.removeListener('TIMEZONE_MODIFIED', cb);
  },
});

export const NotificationModified = assign(EventEmitter.prototype, {
  addNotificationModified: function (cb) {
    this.on('NOTIFICATION_MODIFIED', cb);
  },
  removeNotificationModified: function (cb) {
    this.removeListener('NOTIFICATION_MODIFIED', cb);
  },
});

export const GraphEnterLandscapeMode = assign(EventEmitter.prototype, {
  addGraphEnterLandscapeMode: function (cb) {
    this.on('GRAPH_ENTER_LANDSCAPE_MODE', cb);
  },
  removeGraphEnterLandscapeMode: function (cb) {
    this.removeListener('GRAPH_ENTER_LANDSCAPE_MODE', cb);
  },
});

export const GraphExitLandscapeMode = assign(EventEmitter.prototype, {
  addGraphExitLandscapeMode: function (cb) {
    this.on('GRAPH_EXIT_LANDSCAPE_MODE', cb);
  },
  removeGraphExitLandscapeMode: function (cb) {
    this.removeListener('GRAPH_EXIT_LANDSCAPE_MODE', cb);
  },
});

export const ReportsEnabledChanged = assign(EventEmitter.prototype, {
  addReportsEnabledChangedMode: function (cb) {
    this.on('REPORTS_ENABLED_MODE', cb);
  },
  removeReportsEnabledChangedMode: function (cb) {
    this.removeListener('REPORTS_ENABLED_MODE', cb);
  },
});

export const ReportsDisableChanged = assign(EventEmitter.prototype, {
  addReportsDisableChangedMode: function (cb) {
    this.on('REPORTS_DISABLE_MODE', cb);
  },
  removeReportsDisableChangedMode: function (cb) {
    this.removeListener('REPORTS_DISABLE_MODE', cb);
  },
});

export const GraphTypeChanged = assign(EventEmitter.prototype, {
  addGraphTypeChanged: function (cb) {
    this.on('GRAPH_TYPE_CHANGED', cb);
  },
  removeGraphTypeChanged: function (cb) {
    this.removeListener('GRAPH_TYPE_CHANGED', cb);
  },
});

export const FloatingWindowChanged = assign(EventEmitter.prototype, {
  addFloatingWindowChangeListener: function (cb) {
    this.on('FLOATING_WINDOW_CHANGED', cb);
  },
  removeFloatingWindowChangeListener: function (cb) {
    this.removeListener('FLOATING_WINDOW_CHANGED', cb);
  },
  show: function (data) {
    this.emit('FLOATING_WINDOW_CHANGED', {visible: true, data: data || null});
  },
  hide: function () {
    this.emit('FLOATING_WINDOW_CHANGED', {visible: false});
  },
  toggle: function (data) {
    this.emit('FLOATING_WINDOW_CHANGED', {toggle: true, data: data || null});
  },
});
