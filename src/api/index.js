import {ResidentsChange} from '../state/emitters';
import setStateItem from '../state/setState/setStateItem';
import getStateItem from '../state/getStateItem';
import URLS from '../common/helper/urls';
import {DB_KEY, RESPONSE_MESSAGE} from '../common/helper/keys';
import checkStatus from './HelperFunctions/CheckStatus';
import checkUserCreatedStatus from './HelperFunctions/status';
import setResidents from '../state/setState/residents/setResidents';
import LoginChange from '../state/emitters/loginChange';
import RESIDENT_DATA from '../dummyData/residents';
import moment from 'moment';
import { API_TIMEOUT } from '../common/helper/util';
import  getV2Header  from '../../galenApiLibrary/config/getV2Header';
import { getBaseURL, isEndPointCardio } from '../../galenApiLibrary/config/getBaseURL';

import perf from '@react-native-firebase/perf';
import {
  PasswordChanged,
  SendOtpDidChange,
  ResetPasswordDidChange,
  RegisterUserDidChange,
  ValidateUserDidChange,
  InviteObserveDidChange,
  ObserveListDidChange,
  UsersListDidChange,
  CustomDataObtained,
  CustomDataChange,
} from '../state/emitters';

import {getSupplierId, getUserId} from '../common/helper/validate';
import HEADER from '../common/helper/constants';
import {getHeader} from './Header';

const residentUrl = getBaseURL()+ URLS.RESIDENTS;

import {Platform} from 'react-native';

import getHeaders  from '../../galenApiLibrary/config/getHeader'


export async function getSensors(shouldEmit) {
  // var myHeaders = new Headers();
  // myHeaders.append('X-APP-TYPE', HEADER.APP_TYPE);
  // myHeaders.append('X-TENANT-DOMAIN', HEADER.TENANT_DOMAIN);
  // myHeaders.append('X-API-VERSION', HEADER.API_VERSION);
  // myHeaders.append('Content-Type', 'application/json');
  // myHeaders.append('Authorization', getStateItem(DB_KEY.ACCESS_TOKEN));

  const myHeaders = getHeaders()

  var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow',
  };
  //V3
  var finalArray = [];
  // now iterate user array
  let userArray = getStateItem(DB_KEY.USERS_LIST_ARRAY);
  for (var index = 0; index < userArray.length; index++) {
    let user = userArray[index];
    let urlMultipleSensor = getBaseURL() + URLS.MULTIPLE_SENSOR;
    var raw = JSON.stringify({
      deviceDataModelId: 'd36a4373-fbdc-44a3-8c96-4bb920041e40-id',
      ownerFilter: {
        users: [user.userId],
      },
    });
    
   
    var options = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow',
    };

    const resp = await executeApiWith(urlMultipleSensor, "POST" , raw, myHeaders, "getSensors")

    if (resp.status === 200) {
      const responseP = await resp.json();

      let content = responseP.content;

      if (content.length > 0) {
        for (var index2 = 0; index2 < content.length; index2++) {
          let dataToPush = content[index2];
          finalArray.push(dataToPush);
        }
      }
    }
  }

  let length = finalArray.length;

  setStateItem(DB_KEY.TOTAL_ARRAY_COUNT, length);
  setStateItem(DB_KEY.RESIDENT_DATA, finalArray);
  if (shouldEmit) {
    ResidentsChange.emit('RESIDENTS_CHANGE');
  }
}

export async function getSensorsForUserId(userId, shouldEmit){
  var myHeaders = getHeaders()
  
    var requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow'
    };
  //V3
    var finalArray = []
    // now iterate user array
    let urlMultipleSensor = getBaseURL()+URLS.MULTIPLE_SENSOR
    //console.log("RKDebug:getSensorsForUserId:urlMultipleSensor"+urlMultipleSensor)
             
    var raw = JSON.stringify(
      {
        "deviceDataModelId":"d36a4373-fbdc-44a3-8c96-4bb920041e40-id",
        "ownerFilter": {
          "users":[userId]
        }
      }
    );

    let resp  = await executeApiWith(urlMultipleSensor, 'POST' , raw ,  myHeaders , "API")
    // var options = {
    //   method: 'POST',
    //   headers: myHeaders,
    //   body: raw,
    //   redirect: 'follow'
    // };

    // const resp = await fetch(urlMultipleSensor, options)
    if (resp.status === 200){
      const  responseP = await resp.json()
      let content = responseP.content
      if (content.length > 0){
         for(var index2 = 0 ; index2 < content.length; index2++){
          let dataToPush =  content[index2]
          finalArray.push(dataToPush)
         }
      }
    }
    let length = finalArray.length
    setStateItem(DB_KEY.TOTAL_ARRAY_COUNT,length)     
    setStateItem(DB_KEY.RESIDENT_DATA,finalArray)
   if (shouldEmit){
      ResidentsChange.emit('RESIDENTS_CHANGE')
    } 
  }


function saveToken(res){
  // check the status of the API response, throw an error if it is not 200
  // the error dewill be caught by the individual request and processed accordingly
  
  if (res.status === 200) {
    
    let authorization = res.headers.map.authorization
    setStateItem(DB_KEY.ACCESS_TOKEN,authorization);
    return res
  } else {
    throw {error: res}
  }
}



export function changePassword(userId,newPassword,currentPassword,newConfirmPassword){

let url = getBaseURL()+URLS.GALEN_CHANGE_PASSWORD
// var myHeaders = new Headers();
// myHeaders.append("X-APP-TYPE", HEADER.APP_TYPE);
// myHeaders.append("X-TENANT-DOMAIN", HEADER.TENANT_DOMAIN);
// myHeaders.append("X-API-VERSION", HEADER.API_VERSION);
// myHeaders.append("Content-Type", "application/json");
// myHeaders.append("Authorization", getStateItem(DB_KEY.ACCESS_TOKEN));

const myHeaders = getHeaders()

var raw = JSON.stringify({"userId":userId.trim(),"currentPassword":currentPassword.trim(),"newPassword":newPassword.trim(),"newConfirmPassword":newConfirmPassword.trim()});

var requestOptions = {
  method: 'PUT',
  headers: myHeaders,
  body: raw,
  redirect: 'follow'
};

fetch(url, requestOptions)
  .then(response => response.text())
  .then(result => {
    setStateItem(RESPONSE_MESSAGE.SUCCESS, 'Password changed successfully')
    PasswordChanged.emit('PASSWORD_CHANGED')
  })
  .catch(error => {
    setStateItem(RESPONSE_MESSAGE.FAILURE,error)
    PasswordChanged.emit('PASSWORD_CHANGED')
  });

}


export function sendOtp(email){
  
  let url = getBaseURL()+URLS.GALEN_SEND_OTP+email

let data = {
  method: 'POST',
  headers: {
      'X-APP-TYPE' : HEADER.APP_TYPE,
      'X-TENANT-DOMAIN' : HEADER.TENANT_DOMAIN,
      'X-API-VERSION' : HEADER.API_VERSION,
      'Content-Type': 'application/json'
   },
}
//V3
fetch( url,data)
.then((res) => checkStatus(res))
.then((res) => {
  // set the Data TO the Model
  

 setStateItem(RESPONSE_MESSAGE.SUCCESS, 'OTP sent successfully on email')
 SendOtpDidChange.emit('SEND_OTP_DID_CHANGE')
})
.catch((e) => {
  
   // Handel error and emit the change
  // setStateItem(DB_KEY.RESIDENT_ARRAY,[])
  // ResidentsChange.emit('RESIDENTS_CHANGE')
  setStateItem(RESPONSE_MESSAGE.FAILURE, 'ERROR , Not able to reset password')
 SendOtpDidChange.emit('SEND_OTP_DID_CHANGE')
});
}

export function verifyOtp(email, otpCode, newPassword, confirmPassword){
  
  let url = getBaseURL()+URLS.RESET_PASSWORD

  let body = JSON.stringify({
    "emailAddress" : email,
    "otpCode" : otpCode,
    "newPassword" : newPassword,
    "confirmPassword" : confirmPassword,
})


let data = {
  method: 'POST',
  headers: {
      'X-APP-TYPE' : HEADER.APP_TYPE,
      'X-TENANT-DOMAIN' : HEADER.TENANT_DOMAIN,
      'X-API-VERSION' : HEADER.API_VERSION,
      'Content-Type': 'application/json'
   },
   body : body
}

//V3
fetch( url,data)
.then((res) => checkStatus(res))
.then((res) => {
  // set the Data TO the Model
  

 setStateItem(RESPONSE_MESSAGE.SUCCESS, 'Password changes successfully')
  ResetPasswordDidChange.emit('RESET_PASSWORD_DID_CHANGE')
})
.catch((e) => {
  
   // Handel error and emit the change
  // setStateItem(DB_KEY.RESIDENT_ARRAY,[])
  // ResidentsChange.emit('RESIDENTS_CHANGE')
  if (e.error.status === 412){
    setStateItem(RESPONSE_MESSAGE.FAILURE, ' This password was used previously or Format is not correct')
  }else{
    setStateItem(RESPONSE_MESSAGE.FAILURE, ' There is some issue while resting password')
  
  }
  ResetPasswordDidChange.emit('RESET_PASSWORD_DID_CHANGE')
});
}


export async function registerUser(email, password, confirmPassword, firstName, lastName){
  
  //V3

  let url = getBaseURL()+URLS.REGISTER_USER

  var myHeaders = new Headers();
  myHeaders.append("X-APP-TYPE", HEADER.APP_TYPE);
  myHeaders.append("X-TENANT-DOMAIN", HEADER.TENANT_DOMAIN);
  myHeaders.append("X-API-VERSION", HEADER.API_VERSION);
   myHeaders.append("Content-Type", "application/json");


  let body = JSON.stringify({"user":{"firstName":firstName,"lastName":lastName,"emailAddress":email,"contactInfo":{"streetAddress1":"1 Moore","streetAddress2":"Suite","city":"Houston","state":"TX","country":"US","zipCode":"12345"},"role":"Patient","supplier":{"supplierId":"cd5dc314-6e25-48a8-9d47-9e574b8fe3a0","active":true,"createdBy":"2c00fbe2-07ae-4e0c-a6a2-b2a669974fec","createdOn":"2020-11-07T17:25:49.6251","emailAddress":"generalwellness@cardio.io","lastUpdatedBy":null,"lastUpdatedOn":null,"name":"General Wellness","status":"Active","tenantId":"ATS-DEV","contactInfo":{"city":"Austin","country":"US","primaryPhone":"+15128528057","secondaryPhone":null,"state":"TX","streetAddress1":"3815 Jarrett Way","streetAddress2":null,"zipcode":"78728"}},"tenant":{"accountId":null,"contactInfo":{"city":"Austin","country":"US","primaryPhone":"+18882922208","secondaryPhone":"","state":"TX","streetAddress1":"3815 Jarrett Way","streetAddress2":"Suite A100","zipcode":"78728"},"createdBy":"SYS-ADMIN-1","createdOn":"2020-06-16T14:19:56.953617","emailAddress":"info@atsdev.com","lastUpdatedBy":null,"lastUpdatedOn":null,"logo":null,"name":"ATS Dev","status":"Active","subdomain":"ats-dev","subscriptionLevel":"Premier","tenantId":"ATS-DEV","themeConfiguration":null,"themeFileIdentifier":null}},"password":password,"confirmPassword":confirmPassword,"timezone":"CST"});


  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: body,
    redirect: 'follow'
  };
  
  
  let res = await executeApiWith(url,'POST', body, myHeaders, "createUser" )
  if (res.status === 200 || res.status === 201) {
    setStateItem(RESPONSE_MESSAGE.SUCCESS, 'REGISTERED')
    RegisterUserDidChange.emit('REGISTER_USER_CHANGE')
  }else if (res.status === 412 ) {
    setStateItem(RESPONSE_MESSAGE.FAILURE, 'Email already exist')
    RegisterUserDidChange.emit('REGISTER_USER_CHANGE')
  }else{
    setStateItem(RESPONSE_MESSAGE.FAILURE, "something went wrong")
    RegisterUserDidChange.emit('REGISTER_USER_CHANGE')
  } 
}


export function activateUser(email, otp){

  
  let url = getBaseURL()+URLS.ACTIVATE_USER

  var myHeaders = new Headers();
  myHeaders.append("X-APP-TYPE", HEADER.APP_TYPE);
  myHeaders.append("X-TENANT-DOMAIN", HEADER.TENANT_DOMAIN);
  myHeaders.append("X-API-VERSION", HEADER.API_VERSION);
   myHeaders.append("Content-Type", "application/json");


  let body = JSON.stringify({"emailAddress":email,"otpCode":otp});

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: body,
    redirect: 'follow'
  };
  
  //V3
  fetch(url, requestOptions)
  .then((res) => checkStatus(res))
  .then((res) => res.json())
  .then((res) => {
    
   
    if (res.firstName){
      
      setStateItem(RESPONSE_MESSAGE.SUCCESS, 'Activated')
    }else{
      
      setStateItem(RESPONSE_MESSAGE.SUCCESS, 'provided otp is wrong')
    }
    
    ValidateUserDidChange.emit('VALIDATE_USER_CHANGE')
  })
  .catch((error) => {
    
  setStateItem(RESPONSE_MESSAGE.FAILURE, error)
  ValidateUserDidChange.emit('VALIDATE_USER_CHANGE')
  });


}


export async function getUsersListForPracticeForCompany(supplierId, practiceId) {
  const myHeaders = getHeaders()
  let url = getBaseURL() + "user/user?role=Patient&supplierId="+supplierId+"&practiceId="+practiceId;
  //V3
    let res = await executeApiWith(url, 'GET', null, myHeaders, "API")
    if (res.status === 200) {
      let response = await res.json();
      // set the Users Array and emit
      let userListArray = []
      response.content.map((content)=> {
        if (content.fullName.length > 0){
          userListArray.push(content)
        }
      })
        
      setStateItem(DB_KEY.USERS_LIST_ARRAY, userListArray)
      setStateItem(DB_KEY.ALL_USERS_ARRAY, userListArray)
      UsersListDidChange.emit('USERS_LIST_CHANGE')
    }
    else{
      setStateItem(DB_KEY.USERS_LIST_ARRAY, [])
      UsersListDidChange.emit('USERS_LIST_CHANGE');
    }
}


export async function getUsersListForPractice() {
   let user = getStateItem(DB_KEY.USER);
   let supplierId = user?.currentRole?.practice?.supplierId
   let practiceId = user?.currentRole?.practice?.practiceId
   const myHeaders = getHeaders()
   let url = getBaseURL() + "user/user?role=Patient&supplierId="+supplierId+"&practiceId="+practiceId;
   //V3
     let res = await executeApiWith(url, 'GET', null, myHeaders, "API")
     if (res.status === 200) {
       let response = await res.json();
       // set the Users Array and emit
       let userListArray = []
       response.content.map((content)=> {
         if (content.fullName.length > 0){
           userListArray.push(content)
         }
       })
         
       setStateItem(DB_KEY.USERS_LIST_ARRAY, userListArray)
       setStateItem(DB_KEY.ALL_USERS_ARRAY, userListArray)
       UsersListDidChange.emit('USERS_LIST_CHANGE')
     }
     else{
       setStateItem(DB_KEY.USERS_LIST_ARRAY, [])
       UsersListDidChange.emit('USERS_LIST_CHANGE');
     }
}

export async function getUsersList() {
  // var myHeaders = new Headers();
  // myHeaders.append('X-APP-TYPE', HEADER.APP_TYPE);
  // myHeaders.append('X-TENANT-DOMAIN', HEADER.TENANT_DOMAIN);
  // myHeaders.append('X-API-VERSION', HEADER.API_VERSION);
  // myHeaders.append('Content-Type', 'application/json');
  // myHeaders.append('Authorization', getStateItem(DB_KEY.ACCESS_TOKEN));

  const myHeaders = getHeaders()
  
  let url = getBaseURL() + URLS.USERS_LIST + getSupplierId();
//V3
  let res = await executeApiWith(url, 'GET', null, myHeaders, "API")
  if (res.status === 200) {
    let response = await res.json();
    // set the Users Array and emit
    let userListArray = []
    response.content.map((content)=> {
      if (content.fullName.length > 0){
        userListArray.push(content)
      }
    })
      
    setStateItem(DB_KEY.USERS_LIST_ARRAY, userListArray)
    setStateItem(DB_KEY.ALL_USERS_ARRAY, userListArray)
    UsersListDidChange.emit('USERS_LIST_CHANGE')
  }
  else{
    setStateItem(DB_KEY.USERS_LIST_ARRAY, [])
    UsersListDidChange.emit('USERS_LIST_CHANGE');
  }
}


export async function setUsersCustomData(){
  
  
  // setting up user Object
  let userObject =  getStateItem(DB_KEY.USER)
  let currentRole = userObject.currentRole
  currentRole.defaultRole = true
  userObject.currentRole = currentRole

  let defaultRole = userObject.defaultRole
  defaultRole.defaultRole = true
  userObject.defaultRole = defaultRole

  let roles = userObject.roles

  for(var index = 0 ; index < roles.length ; index++){
    let role =  roles[index]

    let roleString = role.role

    if (roleString === "Patient"){
      role.defaultRole = true
      roles[index] = role
      break
    }
  }

  userObject.roles = roles
  
 
  // setting up custom data

  let customDataArray = getStateItem(DB_KEY.CUSTOM_DATA_ARRAY)

  let modifiedCustomDataArray = []
  for(var index = 0 ; index < customDataArray.length ; index++){
    let customData = customDataArray[index]

    if  (index === 0){
         customData.fieldData = "YES";
         modifiedCustomDataArray.push(customData)
    }else if  (index === 1){
      customData.fieldData = "YES";
      modifiedCustomDataArray.push(customData)
    }else if  (index === 2){
      customData.fieldData = "GW";
      modifiedCustomDataArray.push(customData)
    }else if  (index === 3){
      customData.fieldData = "NO";
      modifiedCustomDataArray.push(customData)
    }else if  (index === 4){
      customData.fieldData = ["None"];
      modifiedCustomDataArray.push(customData)
    }else if  (index === 5){
      customData.fieldData = ["None"];
      modifiedCustomDataArray.push(customData)
    }else if  (index === 7){
      customData.fieldData = "NO";
      modifiedCustomDataArray.push(customData)
    }else if  (index === 8){
         customData.fieldData = "2 secs";
      modifiedCustomDataArray.push(customData)
    }else if  (index === 9){
      customData.fieldData = "NO";
      modifiedCustomDataArray.push(customData)
    }

  }



  let body = JSON.stringify({ "user":userObject,"customData":modifiedCustomDataArray});
 



let header = {
  'Authorization' : getStateItem(DB_KEY.ACCESS_TOKEN),
  'Content-Type': 'application/json'
}

  let data = {
    method: 'PUT',
    headers: header,
      body: body  
  }

  
  let url = getBaseURL()+URLS.SET_CUSTOM_DATA
  let res = await executeApiWith(url, 'PUT', raw,header, "API:setUsersCustomData" )
      if (res.status === 200) {
        CustomDataChange.emit('CUSTOM_DATA_CHANGED')
      }else{
        CustomDataChange.emit('CUSTOM_DATA_CHANGED')
      }
}

 export async function executeApiWith(url, method, body, header, caller, isRecursive = false) {
    // trace.putAttribute('body', body);
     // console.log("url"+url)
     // console.log("body"+body)
      //console.log("caller"+caller)
      //console.log("method"+method)
      //console.log("header"+JSON.stringify(header))
    
    
      var requestOptions = { method: method, headers: header, body: body, redirect: 'follow' };
      if (body === null) {
        requestOptions = { method: method, headers: header, redirect: 'follow' };
      }
      

      if (isRecursive === true) {
        const response  =  await fetch(url, requestOptions)
         return response
     
      }else{
   
      const response  =  await fetch(url, requestOptions)
      return response
    }
   }

/////New APIS goes here
export async function getObserveList(){
    const header = getHeader()  
    let url = getBaseURL()+URLS.OBSERVE_LIST 
    let res = await executeApiWith(url, 'GET', null,header, "ObserveList:getObserveList" )
    return res;
}

export async function inviteObserve(email){
  const header = getHeader() 
  let endDateTime = moment.utc().add(1 , 'year').format()
  let body = JSON.stringify({"emailAddress":email, "validUntil":endDateTime,"guestInvite":true});
   let url = getBaseURL()+URLS.INVITE_OBSERVE 
   let res = await executeApiWith(url, 'POST', body, header, "AddObserve:inviteObserve")
   return res;
}

export async function deleteObserveInvite(userObserverId) {
  const header = getHeader()
  let url = getBaseURL()+'observer/'+userObserverId
  let res = await executeApiWith(url, 'DELETE', null, header, "ObserveList:delegateGuestInvite")
  return res
}

export async function writeData(body,caller) {
  const header = getHeader()
  let deviceDataUrl = getBaseURL() + 'data/devicedata';
  let res = await executeApiWith(deviceDataUrl, 'POST', body, header, caller)
  return res
}

export async function getDevicePropertySet(deviceDataModelId, caller) {
  const header = getHeader()
  let url = getBaseURL()+URLS.DEVICE_PROPERTY_SET+deviceDataModelId
  let res = await executeApiWith(url, 'GET', null, header, caller)
  return res
}


export async function getTablesData(caller) {
  const header = getHeader()
  const url = getBaseURL()+URLS.USER_DEVICE+'?nameLike=ATX2410'
  let res = await executeApiWith(url, 'GET', null, header, caller)
  return res
}

export async function getLastDataFromGevHealth(macAddress,caller) {
  const header = getHeader()
  const body =  JSON.stringify({"deviceDataModelId":"d36a4373-fbdc-44a3-8c96-4bb920041e40-dh","deviceCriteria":[{"key":"DevidDevhealth","operator":"Equal","value":macAddress}]});
  const url = getBaseURL()+URLS.ADVANCE_DATA_DEVHEALTH
  console.log("getLastDataFromGevHealth: url: "+url)
  console.log("getLastDataFromGevHealth: body: "+body)
  let res = await executeApiWith(url, 'POST', body, header, caller, true)
  return res
}

export async function getLastDataFromParams(macAddress,caller) {
  const header = getHeader()
  const body =  JSON.stringify({"deviceDataModelId":"d36a4373-fbdc-44a3-8c96-4bb920041e40-pa","deviceCriteria":[{"key":"DevidParams","operator":"Equal","value":macAddress}]});
  const url = getBaseURL()+URLS.ADVANCE_DATA_PARAMS
  let res = await executeApiWith(url, 'POST', body, header, caller, true)
  return res
  
}

export async function getLastDataFromIdentity(macAddress,caller) {
  const header = getHeader()
  const body =  JSON.stringify({"deviceDataModelId":"d36a4373-fbdc-44a3-8c96-4bb920041e40-id","deviceCriteria":[{"key":"Devid","operator":"Equal","value":macAddress}]});
  const url = getBaseURL()+URLS.ADVANCE_DATA_IDENTITY
  let res = await executeApiWith(url, 'POST', body, header, caller)
  return res
}

export async function getLastDataFrompVitals(macAddress,caller) {
  const header = getHeader()
  const body =  JSON.stringify({"deviceDataModelId":"d36a4373-fbdc-44a3-8c96-4bb920041e40","deviceCriteria":[{"key":"DevidPvital","operator":"Equal","value":macAddress}]});
  const url = getBaseURL()+URLS.ADVANCE_DATA_PVITAL
  let res = await executeApiWith(url, 'POST', body, header, caller)
  return res
}

export async function getLastDataFromThrreshold(macAddress,caller) {
  const header = getHeader()
  const body =  JSON.stringify({"deviceDataModelId":"d36a4373-fbdc-44a3-8c96-4bb920041e40-th","deviceCriteria":[{"key":"DevidThresholds","operator":"Equal","value":macAddress}]});
  const url = getBaseURL()+URLS.ADVANCE_DATA_THRESHOLD
  let res = await executeApiWith(url, 'POST', body, header, caller, true)
  return res
}

export async function getLastDataFromAlerts(macAddress,caller) {
  const header = getHeader()
  const body =  JSON.stringify(
    {
      "deviceDataModelId":"d36a4373-fbdc-44a3-8c96-4bb920041e40-as",
       "deviceCriteria":[
        {"key":"DevidAlerts","operator":"Equal","value":macAddress}
      ]
    });
  const url = getBaseURL()+URLS.ADVANCE_DATA_ALERTS
  let res = await executeApiWith(url, 'POST', body, header, caller, true)
  return res
}


export async function getThirtyMinutesData(macAddress,caller) {
    const now = moment();
    let endDateTime = now.utc().format();
    let startDateTime = now.utc().subtract(120, 'minutes').format();
    var body = JSON.stringify({
      deviceDataModelId: 'd36a4373-fbdc-44a3-8c96-4bb920041e40',
      deviceCriteria: [
        {key: 'DevidPvital', operator: 'Equal', value: macAddress},
        {
          key: 'Timestamp',
          operator: 'Between',
          valueFrom: startDateTime,
          valueTo: endDateTime,
        },
      ],
    });
     if (isEndPointCardio() === false ){
      body = JSON.stringify({
        deviceId: 'd36a4373-fbdc-44a3-8c96-4bb920041e40',
        deviceCriteria: [
          {key: 'DevidPvital', operator: 'Equal', value: macAddress},
          {
            key: 'Timestamp',
            operator: 'Between',
            valueFrom: startDateTime,
            valueTo: endDateTime,
          },
        ],
      });
    }
    const header = getV2Header()
   

     const url = getBaseURL()+URLS.DATA_PVITAL
     console.log("getThirtyMinutesData: url:"+url + ": body: "+body)
     let res = await executeApiWith(url, 'POST', body, header, caller, true)
     return res
}


export async function getLatestPVitalsData(body,caller) {
  const header = getHeader()
  const url = getBaseURL()+URLS.DATA_PVITAL
   let res = await executeApiWith(url, 'POST', body, header, caller, true)
   return res
}

    