const URLS = {
  BASE_URL: 'https://api.cardioatx.com/',
  GALEN_BASE_URL: 'https://api.galencloud.com/',
  LOGIN : '',
  GALEN_CHANGE_PASSWORD: '/user/updatepassword',
  GALEN_SENSOR_DATA:
    'data/devicedata-advanced/user?sortBy=data.Timestamp.value&sortOrder=DESC',
  GALEN_SENSOR_HISTORY:
    'data/devicedata-advanced?sortBy=sortBy=data.Timestamp.value&sortOrder=DESC',
  GALEN_SEND_OTP: 'user/password/send-reset-code?email=',
  RESET_PASSWORD: 'user/password/reset',
  REGISTER_USER: 'user/register',
  OBSERVE_LIST:
    'observer/observers?pageNumber=0&pageSize=20&sortBy=createdOn&sortOrder=DESC',
  USERS_LIST:
    'user/user?pageNumber=0&pageSize=500&sortBy=lastName&sortOrder=ASC&supplierId=',
  MULTIPLE_SENSOR:
    'data/devicedata-advanced/owner?sortBy=data.TimestampI.value&sortOrder=DESC',
  INVITE_OBSERVE: 'observer/invite',
  USER_DEVICE: 'user/device',
  DEVICE_PROPERTY: 'user/deviceproperty?deviceDataModelId=',
  PATIENT_DEVICE: 'user/patientdevice?userId=',
  DEVICE_PROPERTY_SET: 'user/devicepropertyset?deviceDataModelId=',
  CUSTOM_DATA: 'user/custom-field/data/',
  SET_CUSTOM_DATA: 'user/user-custom',
  ACTIVATE_USER: 'user/activate',
  USER_AUTH: 'auth/login',
  RESIDENTS: 'user/me',
  AMAZON_GET:
    'https://outpn8jt8l.execute-api.us-east-1.amazonaws.com/dev/reporting/',
  RESEND_CODE: 'user/register/send-code',
  DEVICEDATA_DELETE : "devicedata/delete",
  ADVANCE_DATA_DEVHEALTH : "data/devicedata-advanced?sortBy=data.TimestampD.value&sortOrder=DESC&pageSize=1&pageNumber=0",
  ADVANCE_DATA_PARAMS : "data/devicedata-advanced?sortBy=data.TimestampP.value&sortOrder=DESC&pageSize=1&pageNumber=0",
  ADVANCE_DATA_IDENTITY : "data/devicedata-advanced?sortBy=data.TimestampI.value&sortOrder=DESC&pageSize=1&pageNumber=0",
  ADVANCE_DATA_PVITAL : "data/devicedata-advanced?sortBy=data.Timestamp.value&sortOrder=DESC&pageSize=1&pageNumber=0",
  ADVANCE_DATA_THRESHOLD  : "data/devicedata-advanced?sortBy=data.TimestampT.value&sortOrder=DESC&pageSize=1&pageNumber=0",
  ADVANCE_DATA_ALERTS  : "data/devicedata-advanced?sortBy=data.TimestampA.value&sortOrder=DESC&pageSize=1&pageNumber=0",
  DATA_PVITAL : "data/devicedata-advanced?sortBy=data.Timestamp.value&sortOrder=DESC",
  


};

export default URLS;
