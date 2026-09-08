
import GALEN_URL from "../../../config";
import METHOD from '../../../config/Method';
import getHeader from '../../../config/getHeader'
import { getBaseURL } from "../../../config/getBaseURL";
import TABLE from "../../../config/TableIdentifier";
import moment from "moment";

export async function getCustomData(supplierId) {
    const headre = getHeader()
    const url =  getBaseURL()+GALEN_URL.CUSTOM_FIELD+supplierId
    let requestOptions = { method: METHOD.GET, headers: header, redirect: 'follow'};
    let response = await fetch(url, requestOptions)
    return response
}


export async function setDataInIdentity(macAddress, userId, timezone, dayLightSavingEnabled) {
  debugger
  console.log("setDataInIdentity macAddress:", macAddress, "userId:", userId, "timezone:", timezone, "dayLightSavingEnabled:", dayLightSavingEnabled) 
  const headre = getHeader()
  const url =  getBaseURL()+GALEN_URL.LAST_DATA
  const body = JSON.stringify({
    deviceDataModelId: TABLE.IDENTITY,
    "deviceCriteria": [{ "key": "Devid", "operator": "Equal","value": macAddress }],
    "ownerFilter": {
      "users": [userId]
    }
  });
  let requestOptions = { method: METHOD.POST, headers: headre, body: body, redirect: 'follow'};
  let response = await fetch(url, requestOptions)
  console.log("setDataInIdentity response.status:", response.status, "url:", url, "body:", body)
  let data = await response.json()
  var deviceDataId = ''
  if (data.content && data.content.length > 0) {
    deviceDataId = data.content[0].deviceDataId
  }

  console.log("setDataInIdentity deviceDataId:", deviceDataId)

  // fetch device property set for the deviceDataId
  const url2 =  getBaseURL()+GALEN_URL.GET_DEVICE_PROPERTY+TABLE.IDENTITY
  let requestOptions2 = { method: METHOD.GET, headers: headre, redirect: 'follow'};
  let response2 = await fetch(url2, requestOptions2)
  console.log("setDataInIdentity response2.status:", response2.status, "url2:", url2)
  let data2 = await response2.json()
  var devicePropertySetId = ''
  if (data2.content && data2.content.length > 0) {
    devicePropertySetId = data2.content[0].devicePropertySetId
  }
  console.log("setDataInIdentity devicePropertySetId:", devicePropertySetId)

  // write the data into identity table
  const dataToPut = { "Active": "Yes", "TimestampI": moment.utc().format(), "Timezone": timezone, "DaylightSavings": dayLightSavingEnabled === true ? 1: 0 , "FindMySensor":"No", "NotificationType": "push"}
  var body2;
  if (deviceDataId === '' ) {
   body2 = {"deviceDataModelId":TABLE.IDENTITY,"data":dataToPut, "devicePropertySetId":devicePropertySetId}
  }
  else{
    body2 = {"deviceDataModelId":TABLE.IDENTITY, "deviceDataId":deviceDataId,"data":dataToPut, "devicePropertySetId":devicePropertySetId}
  }

  // write the data into identity table
  const url3 =  getBaseURL()+GALEN_URL.WRITE_DEVICE_DATA
  let requestOptions3 = { method: METHOD.PUT, headers: headre, body: JSON.stringify(body2), redirect: 'follow'};
  let response3 = await fetch(url3, requestOptions3)
  console.log("setDataInIdentity response3.status:", response3.status, "url3:", url3, "body2:", JSON.stringify(body2))
  return response3
                           
}






export async function setDataInParams(macAddress, userId, friendlyName) {
  console.log("setDataInParams macAddress:", macAddress, "userId:", userId) 
  const headre = getHeader()
  const url =  getBaseURL()+GALEN_URL.LAST_DATA
  const body = JSON.stringify({
    deviceDataModelId: TABLE.PARAMS,
    "deviceCriteria": [{ "key": "DevidParams", "operator": "Equal","value": macAddress }],
    "ownerFilter": {
      "users": [userId]
    }
  });
  let requestOptions = { method: METHOD.POST, headers: headre, body: body, redirect: 'follow'};
  let response = await fetch(url, requestOptions)
  console.log("setDataInParams response.status:", response.status, "url:", url, "body:", body)
  let data = await response.json()
  var deviceDataId = ''
  if (data.content && data.content.length > 0) {
    deviceDataId = data.content[0].deviceDataId
  }

  console.log("setDataInParams deviceDataId:", deviceDataId)

  // fetch device property set for the deviceDataId
  const url2 =  getBaseURL()+GALEN_URL.GET_DEVICE_PROPERTY+TABLE.PARAMS
  let requestOptions2 = { method: METHOD.GET, headers: headre, redirect: 'follow'};
  let response2 = await fetch(url2, requestOptions2)
  console.log("setDataInParams response2.status:", response2.status, "url2:", url2)
  let data2 = await response2.json()
  var devicePropertySetId = ''
  if (data2.content && data2.content.length > 0) {
    devicePropertySetId = data2.content[0].devicePropertySetId
  }
  console.log("setDataInParams devicePropertySetId:", devicePropertySetId)

  // write the data into identity table
  const dataToPut = {  "TimestampP":  moment.utc().format() , "FriendlyNamePa":friendlyName,"NightMode":"Yes","NightModeStart":"00:00:00","NightModeEnd":"00:00:00","Ltemode":"Yes","Lteinterval":60}
  var body2;
  if (deviceDataId === '' ) {
   body2 = {"deviceDataModelId":TABLE.PARAMS,"data":dataToPut, "devicePropertySetId":devicePropertySetId}
  }
  else{
    body2 = {"deviceDataModelId":TABLE.PARAMS, "deviceDataId":deviceDataId,"data":dataToPut, "devicePropertySetId":devicePropertySetId}
  }

  // write the data into identity table
  const url3 =  getBaseURL()+GALEN_URL.WRITE_DEVICE_DATA
  let requestOptions3 = { method: METHOD.PUT, headers: headre, body: JSON.stringify(body2), redirect: 'follow'};
  let response3 = await fetch(url3, requestOptions3)
  console.log("setDataInParams response3.status:", response3.status, "url3:", url3, "body2:", JSON.stringify(body2))
  return response3
                           
}


export async function setDataInThreeshold(macAddress, userId, friendlyName) {
  console.log("setDataInThreeshold macAddress:", macAddress, "userId:", userId) 
  const headre = getHeader()
  const url =  getBaseURL()+GALEN_URL.LAST_DATA
  const body = JSON.stringify({
    deviceDataModelId: TABLE.THRESHOLD,
    "deviceCriteria": [{ "key": "DevidThresholds", "operator": "Equal","value": macAddress }],
    "ownerFilter": {
      "users": [userId]
    }
  });
  let requestOptions = { method: METHOD.POST, headers: headre, body: body, redirect: 'follow'};
  let response = await fetch(url, requestOptions)
  console.log("setDataInThreeshold response.status:", response.status, "url:", url, "body:", body)
  let data = await response.json()
  var deviceDataId = ''
  if (data.content && data.content.length > 0) {
    deviceDataId = data.content[0].deviceDataId
  }

  console.log("setDataInThreeshold deviceDataId:", deviceDataId)

  // fetch device property set for the deviceDataId
  const url2 =  getBaseURL()+GALEN_URL.GET_DEVICE_PROPERTY+ TABLE.THRESHOLD
  let requestOptions2 = { method: METHOD.GET, headers: headre, redirect: 'follow'};
  let response2 = await fetch(url2, requestOptions2)
  console.log("setDataInThreeshold response2.status:", response2.status, "url2:", url2)
  let data2 = await response2.json()
  var devicePropertySetId = ''
  if (data2.content && data2.content.length > 0) {
    devicePropertySetId = data2.content[0].devicePropertySetId
  }
  console.log("setDataInThreeshold devicePropertySetId:", devicePropertySetId)

  // write the data into identity table
  const dataToPut = { "TimestampT":  moment.utc().format(), "FriendlyNameT":friendlyName }
  var body2;
  if (deviceDataId === '' ) {
   body2 = {"deviceDataModelId":TABLE.THRESHOLD,"data":dataToPut, "devicePropertySetId":devicePropertySetId}
  }
  else{
    body2 = {"deviceDataModelId":TABLE.THRESHOLD, "deviceDataId":deviceDataId,"data":dataToPut, "devicePropertySetId":devicePropertySetId}
  }

  // write the data into identity table
  const url3 =  getBaseURL()+GALEN_URL.WRITE_DEVICE_DATA
  let requestOptions3 = { method: METHOD.PUT, headers: headre, body: JSON.stringify(body2), redirect: 'follow'};
  let response3 = await fetch(url3, requestOptions3)
  console.log("setDataInThreeshold response3.status:", response3.status, "url3:", url3, "body2:", JSON.stringify(body2))
  return response3
                           
}




export async function checkSensorExist(macAddress, userId, tableName) {
  const headre = getHeader()
  const url =  getBaseURL()+GALEN_URL.LAST_DATA
  var deviceCriteria;
  if (tableName === TABLE.IDENTITY) {
    deviceCriteria = { "key": "Devid", "operator": "Equal","value": macAddress }
  }
  else if (tableName === TABLE.PARAMS) {
    deviceCriteria = { "key": "DevidParams", "operator": "Equal","value": macAddress }
  }
  else if (tableName === TABLE.THRESHOLD) {
    deviceCriteria = { "key": "DevidThresholds", "operator": "Equal","value": macAddress }
  }

  var body = JSON.stringify({
    "deviceDataModelId": deviceId,
    "deviceCriteria": [deviceCriteria],
    "ownerFilter": {
      "users": [userId]
    }
  });

  let requestOptions = { method: METHOD.POST, headers: headre, body: body, redirect: 'follow'};
  let response = await fetch(url, requestOptions)
  return response
}



export async function addNewSensor(macAddress, supplierId, tenantId, email, friendlyName, location, serialNumber, userId, timezone, dayLightSavingEnabled, model) {
     // fetch for the same user and see if data exist with the same mac address          
   const headre = getHeader()
  const url =  'https://webportalapi-v3.cardioatx.com/'+GALEN_URL.ADD_NEW_SENSOR
  const newBody =  JSON.stringify({
    "data": {
      "type": "devices",
      "id": macAddress,
      "attributes": {
        "supplierId": supplierId,
        "friendlyName": friendlyName,
        "location": location,
        "serialNumber": serialNumber,
         "model": model,
         "tenantId":tenantId,
        "email": email,
        "parameters": {
          "identity": {
            "Active": "Yes",
            "DaylightSaving": "Yes",
            "Timezone": timezone,
            "NotificationType": "push"
          },
          "params": {
            "BpfSelect":"1",
            "OfflineTimeout":"1",
            "NightMode": "0",
            "GainSelect": "M",
            "FriendlyNamePa":friendlyName
          },
          "thresholds": {
            "FriendlyNameT":friendlyName,
            "AlertMaxhr": 0,
            "AlertMaxmt": 0,
            "AlertMaxrr": 0,
            "AlertMaxst": 0,
            "AlertMinhr": 0,
            "AlertMinmt": 0,
            "AlertMinrr": 0,
            "AlertMinst": 0
          }
        }
      },
      "relationships": {
        "owner": {
          "data": {
            "type": "users",
            "id": userId
          }
        }
      }
    }
  }
  )
 
  //const body = JSON.stringify({deviceId: macAddress, supplierId: supplierId, tenantId: tenantId, email: email, friendlyName: friendlyName, location: location})
  let requestOptions = { method: METHOD.POST, headers: headre, body: newBody, redirect: 'follow'};
  
  let response = await fetch(url, requestOptions)
  console.log("addNewSensor response:status:", response.status)
  console.log("addNewSensor url:", url)
  console.log("addNewSensor newBody:", newBody)
  // if (response.status === 201 || response.status === 200) {
  //    await setDataInIdentity(macAddress, userId, timezone, dayLightSavingEnabled)
  //    await setDataInParams(macAddress, userId, friendlyName)
  //    await setDataInThreeshold(macAddress, userId, friendlyName)
  // }
  
  return response
}



