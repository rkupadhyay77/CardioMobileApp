import GALEN_URL from "../config";
import METHOD from '../config/Method';
import getHeader from '../config/getHeader'
import TABLE from "../config/TableIdentifier";
import moment from "moment";
import { getBaseURL } from "../config/getBaseURL";


export async function getReportsFor(mode, macAddress) {
    let header = getHeader()
    let url = getBaseURL()+GALEN_URL.DATA_PSTATS
     const startDateTime = moment.utc().subtract(mode, 'days')
    const endDateTime = moment.utc()

    let body = JSON.stringify({ "deviceDataModelId": TABLE.PSTATS, "deviceCriteria": [{key: 'DevidPs', operator: 'Equal', value: macAddress}, {key: "TimestampPs", operator: 'Between', valueFrom: startDateTime,valueTo: endDateTime}]});
  // console.log("getReportsFor: url : "+url+":body :"+body)
   //console.log("getReportsFor: header : "+JSON.stringify(header))
    let requestOptions = { method: METHOD.POST, headers: header, body:body, redirect: 'follow'};
    let response = await fetch(url, requestOptions)
    if  (response.status === 200) {
        const  jsonResponse = await response.json()
       // console.log("getReportsFor: jsonResponse : "+JSON.stringify(jsonResponse))
        return jsonResponse.content
    }else {
       // console.log("getReportsFor: empty : ")
         return []
    }
    
}


export async function getReportsEnabledSensor(userId) {
   let header = getHeader()
    let url = getBaseURL()+GALEN_URL.ALL_SENSOR

    let body = JSON.stringify({ "deviceDataModelId": TABLE.IDENTITY ,"deviceCriteria": [{key: 'EnableReports', operator: 'Equal', value: "Yes"}],"ownerFilter": { "users":[userId]}});
  // console.log("getReportsEnabledSensor:url"+url)
   //console.log("getReportsEnabledSensor:header"+JSON.stringify(header))
    let requestOptions = { method: METHOD.POST, headers: header, body:body, redirect: 'follow'};
    let response = await fetch(url, requestOptions)
   // console.log("getAllSensorFor: response status"+response.status)
    if  (response.status === 200) {
        const  jsonResponse = await response.json()
        return jsonResponse.content
    }else {
         return []
    }
    
}