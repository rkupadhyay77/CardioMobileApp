import GALEN_URL from "../config";
import METHOD from '../config/Method';
import getHeader from '../config/getHeader'
import TABLE from "../config/TableIdentifier";
import moment from "moment";
import {fetchLastUnreadAlertCount} from '../residents'
import getStateItem from "../../src/state/getStateItem";
import { getBaseURL } from "../config/getBaseURL";



export async function fetchLatestDataPVital(userListArray, macAddress) {
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
    const startDateTime = moment.utc().subtract(totalMinutes,  'minutes');
    let body = JSON.stringify({ "deviceDataModelId": TABLE.PVITALS, "deviceCriteria": [{key: 'Timestamp', operator: 'Between', valueFrom: startDateTime,valueTo: endDateTime}, {"key":"DevidPvital","operator":"Equal","value":macAddress}],"ownerFilter": { "users":userListArray}});
    let requestOptions = { method: METHOD.POST, headers: header, body:body, redirect: 'follow'};
    let response = await fetch(url, requestOptions)
    if  (response.status === 200) {
        const  jsonResponse = await response.json()
        return jsonResponse.content
    }else {
         return []
    }
}


export async function fetchLatestThirtyMinutesDataPVital(userListArray, macAddress) {
    let header = getHeader()
    let url = getBaseURL()+GALEN_URL.DATA_PVITAL

    const endDateTime = moment.utc();
    const startDateTime = moment.utc().subtract(30, 'minutes');
    let body = JSON.stringify({ "deviceDataModelId": TABLE.PVITALS, "deviceCriteria": [{key: 'Timestamp', operator: 'Between', valueFrom: startDateTime,valueTo: endDateTime}, {"key":"DevidPvital","operator":"Equal","value":macAddress}],"ownerFilter": { "users":userListArray}});
    let requestOptions = { method: METHOD.POST, headers: header, body:body, redirect: 'follow'};
    let response = await fetch(url, requestOptions)
    if  (response.status === 200) {
        const  jsonResponse = await response.json()
        return jsonResponse.content
    }else {
         return []
    }
}


// export async function fetchLastUnreadAlertCount(macAddress) {
//   return fetchLastUnreadAlertCount(macAddress)
// }

export async function fetchGraphData(macAddress, startTime, endTime) {
    let header = getHeader()
    let url = GALEN_URL.NEW_CARDIO_BASE_URL+GALEN_URL.DEVICES+macAddress+'/vital-samples?maxPoints=100&from='+startTime+'&to='+endTime
    let requestOptions = { method: METHOD.GET, headers: header, redirect: 'follow'};
    console.log('fetchGraphData url', url)
    let response = await fetch(url, requestOptions)
    if  (response.status === 200) {
        const  jsonResponse = await response.json()
        return jsonResponse
    }else {
         return []
    }
}




