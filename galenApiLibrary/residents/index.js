import GALEN_URL from "../config";
import METHOD from '../config/Method';
import getHeader from '../config/getHeader'
import TABLE from "../config/TableIdentifier";
import moment from "moment";
import getStateItem from "../../src/state/getStateItem";
import { getBaseURL } from "../config/getBaseURL";
import URLS from "../../src/common/helper/urls";


export async function getAllSensorFor(userId) {
    let header = getHeader()
    let url = getBaseURL()+GALEN_URL.ALL_SENSOR

    let body = JSON.stringify({ "deviceDataModelId": TABLE.IDENTITY,  "ownerFilter": { "users":[userId]}});
   console.log("getAllSensorFor:url"+url)
   console.log("getAllSensorFor:header"+JSON.stringify(header))
    let requestOptions = { method: METHOD.POST, headers: header, body:body, redirect: 'follow'};
    let response = await fetch(url, requestOptions)
    //console.log("getAllSensorFor: response status"+response.status)
    if  (response.status === 200) {
        const  jsonResponse = await response.json()
        return jsonResponse.content
    }else {
         return []
    }
   
}


export async function getAllSensorForOwners(ownerIds) {
    let header = getHeader()
    let url = getBaseURL()+GALEN_URL.ALL_SENSOR

    let body = JSON.stringify({ "deviceDataModelId": TABLE.IDENTITY,  "ownerFilter": { "users":ownerIds}});
   console.log("getAllSensorForOwners:url"+url)
   console.log("getAllSensorForOwners:body"+JSON.stringify(body))
    let requestOptions = { method: METHOD.POST, headers: header, body:body, redirect: 'follow'};
    let response = await fetch(url, requestOptions)
    console.log("getAllSensorFor: response status"+response.status)
    
    if  (response.status === 200) {
        const  jsonResponse = await response.json()
        console.log("getAllSensorFor: response length"+ jsonResponse.content.length)
        return jsonResponse.content
    }else {
         return []
    }
   
}




export async function fetchLatestDataFor(userId) {
    console.log("fetchLatestDataFor:userId:"+userId)
    let header = getHeader()
    let url = 'https://webportalapi.cardioatx.com/v2/owners/'+userId+'/devices/latest';
    console.log("fetchLatestDataFor:url:"+url)
    let requestOptions = { method: METHOD.GET, headers: header, redirect: 'follow'};
    let response = await fetch(url, requestOptions)
    if  (response.status === 200) {
        const  jsonResponse = await response.json()
        return jsonResponse.devices
    }
    else {
         return []
    }
}


export async function fetchLatestDataForOwner(ownerId) {
    console.log("fetchLatestDataForOwners:ownerIds:"+ownerId)
    let header = getHeader()
    let url = GALEN_URL.CARDIO_V3_BASE_URL+ 'owners/'+ownerId+'/device-latest';
    console.log("fetchLatestDataForOwners:url:"+url)
    let requestOptions = { method: METHOD.GET, headers: header, redirect: 'follow'};
    let response = await fetch(url, requestOptions)
    if  (response.status === 200) {
        const  jsonResponse = await response.json()
        return jsonResponse.data
    }
    else {
         return []
    }
}


export async function fetchLatestDataPVital(userListArray) {
    let header = getHeader()
    let url = getBaseURL()+GALEN_URL.DATA_PVITAL

     var lteinterval = getStateItem('lteInterval')
        if (lteinterval === undefined || lteinterval === null) {
          lteinterval = 120
        }
    
        var bufferValue = getStateItem('bufferValue')
        if (bufferValue === undefined || bufferValue === null) {
            bufferValue = 5
        }
    
        let totalMinutes = lteinterval + bufferValue

    const endDateTime = moment.utc();
    const startDateTime = moment.utc().subtract(totalMinutes, 'minutes');
    let body = JSON.stringify({ "deviceDataModelId": TABLE.PVITALS, "deviceCriteria": [{key: 'Timestamp', operator: 'Between', valueFrom: startDateTime,valueTo: endDateTime,}],"ownerFilter": { "users":userListArray}});
   console.log("fetchLatestDataPVital:body"+body)
   console.log("fetchLatestDataPVital:url"+url)
    let requestOptions = { method: METHOD.POST, headers: header, body:body, redirect: 'follow'};
    let response = await fetch(url, requestOptions)
    if  (response.status === 200) {
        const  jsonResponse = await response.json()
        return jsonResponse.content
    }else {
         return []
    }
}


export async function fetchLatestDataFromPVital(macAddress, userId) {
    let header = getHeader()
    let url = GALEN_URL.NEW_BASE_URL+GALEN_URL.DATA_PVITAL

   
    
    let totalMinutes = 2

    const endDateTime = moment.utc();
    const startDateTime = moment.utc().subtract(totalMinutes, 'minutes');
    let body = JSON.stringify({ "deviceDataModelId": TABLE.PVITALS, "deviceCriteria": [{key: 'Timestamp', operator: 'Between', valueFrom: startDateTime,valueTo: endDateTime}, {key: "DevidPvital", operator: 'Equal', value: macAddress }],"ownerFilter": { "users":[userId]}});
   console.log("fetchLatestDataFromPVital:body"+body)
   console.log("fetchLatestDataFromPVital:url"+url)
    let requestOptions = { method: METHOD.POST, headers: header, body:body, redirect: 'follow'};
    let response = await fetch(url, requestOptions)
    if  (response.status === 200) {
        const  jsonResponse = await response.json()
        return jsonResponse.content
    }else {
         return []
    }
}


export async function fetchLastUnreadAlertCount(macAddress) {
    let header = getHeader()
    let url = getBaseURL()+GALEN_URL.LAST_ALERT

     let body = JSON.stringify({ "deviceDataModelId": TABLE.ALERTS, "deviceCriteria": [{key: 'AlertFlag', operator: 'Equal', value: 1}, {key: "DevidAlerts", operator: 'Equal', value: macAddress }]});
    let requestOptions = { method: METHOD.POST, headers: header, body:body, redirect: 'follow'};
    console.log("fetchLastUnreadAlertCount:url:"+url+"body:"+body)
                   
    let response = await fetch(url, requestOptions)
    return response
}


export async function fetchLastUnreadAlertCountForUser(userListArray) {
    let header = getHeader()
    let url = getBaseURL()+GALEN_URL.LAST_ALERT

     let body = JSON.stringify({ "deviceDataModelId": TABLE.ALERTS, "deviceCriteria": [{key: 'AlertFlag', operator: 'Equal', value: 1}],"ownerFilter": { "users":userListArray}});
    let requestOptions = { method: METHOD.POST, headers: header, body:body, redirect: 'follow'};
    
    let response = await fetch(url, requestOptions)
    return response
}

export async function getSesnsorPositionForUserId(userId) {
    let header = getHeader()
    let url = getBaseURL()+GALEN_URL.DEVICE_DATA

    let body = JSON.stringify({ "deviceDataModelId": TABLE.SENSOR_POSITION, "deviceCriteria": [{key: 'Userid', operator: 'Equal', value: userId}]});
    let requestOptions = { method: METHOD.POST, headers: header, body:body, redirect: 'follow'};
    
    let response = await fetch(url, requestOptions)
    if  (response.status === 200) {
        const  jsonResponse = await response.json()
        return jsonResponse.content
    }else {
         return []
    }
}


export async function getMaxLteValue(userListArray) {
    let header = getHeader()
    let url = getBaseURL()+GALEN_URL.DEVICE_DATA
    let body = JSON.stringify({ "deviceDataModelId": TABLE.PARAMS, "ownerFilter": { "users":userListArray}});
    let requestOptions = { method: METHOD.POST, headers: header, body:body, redirect: 'follow'};
    
    let response = await fetch(url, requestOptions)
    if  (response.status === 200) {
        const  jsonResponse = await response.json()
        let content = jsonResponse.content
        var maxValue = 0
        if (content.length > 0 ){
             for (var index = 0 ; index < content.length ; index++){
                let lteMode = content[index].Ltemode ? content[index].Ltemode.value : "No"
                 let lteinterval = content[index].data.Lteinterval ? content[index].data.Lteinterval.value : 0
                 if (lteinterval > maxValue && lteMode === "Yes"){
                    maxValue = lteinterval
                 }
             }
             return maxValue
        }
        return 0
    }else {
         return 0
    }
}


export async function writeOnlineBit(userListArray, macAddressArray) {
console.log("writeOnlineBit: macAddressArray:"+macAddressArray)
    let header = getHeader()

    var devicePropertySetId = "c2db5786-9c39-4eb5-83b2-26205f2befd3"

//     if (devicePropertySetId === "") {
//        devicePropertySetId = await this.getDeviceProprtySet(TABLE.PVITALS)
//    }

   for (var index = 0 ; index < macAddressArray.length ; index++) {
    
    let macAddress = macAddressArray[index]
    let url = getBaseURL()+GALEN_URL.LAST_ALERT
    let body = JSON.stringify({ "deviceDataModelId": TABLE.PVITALS, "deviceCriteria": [{key: "DevidPvital", operator: 'Equal', value: macAddress }], "ownerFilter": { "users":userListArray}});
    let requestOptions = { method: METHOD.POST, headers: header, body:body, redirect: 'follow'};
    console.log("LAST_ALERT::URL:"+url)
    console.log("LAST_ALERT::body:"+body)
    var deviceDataId = ""
    var online = 1
    let response = await fetch(url, requestOptions)
   console.log("LAST_ALERT::response:status"+response.status)
    if  (response.status === 200) {
        const  jsonResponse = await response.json()
        let content = jsonResponse.content
        console.log("LAST_ALERT::response:content"+JSON.stringify(content[0]))
        var maxValue = 1
        if (content.length > 0 ){
             deviceDataId =  content[0].deviceDataId
             online = content[0].data ? content[0].data.Online ? content[0].data.Online.value : 1 : 1
        }
     }else{
        continue;
     }

     if (online === 0) {
        console.log("Skipped online bit for macAddress"+macAddress)
        continue;
     }

  
if (devicePropertySetId !== "" && deviceDataId !== ""){
            let url = getBaseURL()+GALEN_URL.WRITE_DEVICE_DATA
            let body = JSON.stringify({"deviceDataModelId":TABLE.PVITALS, "data":{"Online":0, "Timestamp": moment.utc().format()}, "devicePropertySetId":devicePropertySetId, "deviceDataId": deviceDataId});
           
            let requestOptions = { method: METHOD.POST, headers: header, body:body, redirect: 'follow'};
            console.log("WRITE_DEVICE_DATA::url:"+url)
            console.log("WRITE_DEVICE_DATA::body:"+body)
   
           let response = await fetch(url, requestOptions)
           //console.log("WRITE_DEVICE_DATA::response:status"+response.status)
   
            if  (response.status === 200 ||response.status === 201 ) {
                console.log("successfully written data for deviceDataId:"+deviceDataId)
             }
        }else{
           // console.log("deviceDataId missing:"+deviceDataId)
        }
   }
    
   }

export async function getDeviceProprtySet(deviceId) {
    let header = getHeader()
    let url = getBaseURL()+GALEN_URL.GET_DEVICE_PROPERTY+deviceId
   let requestOptions = { method: METHOD.GET, headers: header, redirect: 'follow'};
    
    var devicePropertySetId = ""
    let response = await fetch(url, requestOptions)
    if  (response.status === 200) {
        const  jsonResponse = await response.json()
        let content = jsonResponse.content
        var maxValue = 0
        if (content.length > 0 ){
            devicePropertySetId =  content[0].devicePropertySetId
        }
     }

     return devicePropertySetId
}

export async function writeOnlineBitData(deviceDataId, devicePropertySetId) {
    let header = getHeader()
    let url = getBaseURL()+GALEN_URL.WRITE_DEVICE_DATA
    let body = JSON.stringify({"deviceDataModelId":TABLE.PVITALS, "data":{"Online":0, "Timestamp": moment.utc().format()}, "devicePropertySetId":devicePropertySetId, "deviceDataId": deviceDataId});
   
    let requestOptions = { method: METHOD.POST, headers: header, body:body, redirect: 'follow'};
    
   let response = await fetch(url, requestOptions)
    if  (response.status === 200 ||response.status === 201 ) {
       // console.log("successfully written data for deviceDataId:"+deviceDataId)
     }
}

export async function checkForSensorInIdentity(macAddress, userId) {
    let header = getHeader()
    let url = GALEN_URL.NEW_BASE_URL+GALEN_URL.LAST_DATA

    let body = JSON.stringify({ "deviceDataModelId": TABLE.IDENTITY, "deviceCriteria": [{key: "Devid", operator: 'Equal', value: macAddress }], "ownerFilter": { "users":[userId]}});
   console.log("checkForSensorInIdentity:url"+url)
   console.log("checkForSensorInIdentity:header"+JSON.stringify(body))
    let requestOptions = { method: METHOD.POST, headers: header, body:body, redirect: 'follow'};
    let response = await fetch(url, requestOptions)
    //console.log("getAllSensorFor: response status"+response.status)
    return response.status
  
   
}