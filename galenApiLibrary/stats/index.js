import GALEN_URL from "../config";
import METHOD from '../config/Method';
import getHeader from '../config/getHeader'
import TABLE from "../config/TableIdentifier";
import { getBaseURL } from "../config/getBaseURL";
import moment from "moment";

import {fetchLatestDataPVital, fetchLastUnreadAlertCount, fetchLastUnreadAlertCountForUser} from '../residents'




export async function fetchStatsLatestDataPVital(userListArray) {
    return await fetchLatestDataPVital(userListArray)
}


export async function fetchStatsLastUnreadAlertCount(macAddress) {
    return await fetchLastUnreadAlertCount(macAddress)
}

export async function fetchStatsLastUnreadAlertCountForUser(userListArray) {
    return await fetchLastUnreadAlertCountForUser(userListArray)
}

export async function fetchStatsThresholdDataPVital(macAddress) {
    const header = getHeader()
    let url = getBaseURL()+GALEN_URL.DATA_THRESHOLD
    let body = JSON.stringify({ "deviceDataModelId": TABLE.THRESHOLD, "deviceCriteria": [{key: 'DevidThresholds', operator: 'Equal', value: macAddress}]});
    let requestOptions = { method: METHOD.POST, headers: header, body:body, redirect: 'follow'};
    
    let response = await fetch(url, requestOptions)
    if (response.status === 200) {
        let jsonResponse = await response.json()
        return jsonResponse.content
    }
    return []
}


export async function fetchStatsParamsDataPVital(macAddress) {
    const header = getHeader()
    let url = getBaseURL()+GALEN_URL.DATA_PARAMS
    let body = JSON.stringify({ "deviceDataModelId": TABLE.PARAMS, "deviceCriteria": [{key: 'DevidParams', operator: 'Equal', value: macAddress}]});
    let requestOptions = { method: METHOD.POST, headers: header, body:body, redirect: 'follow'};
    
    let response = await fetch(url, requestOptions)
    if (response.status === 200) {
        let jsonResponse = await response.json()
        return jsonResponse.content
    }
    return []
}

export async function fetchStatsDevHealthDataPVital(macAddress) {
    const header = getHeader()
    let url = getBaseURL()+GALEN_URL.DATA_DEVHEALTH
    let body = JSON.stringify({ "deviceDataModelId": TABLE.DEVHEALTH, "deviceCriteria": [{key: 'DevidDevhealth', operator: 'Equal', value: macAddress}]});
    let requestOptions = { method: METHOD.POST, headers: header, body:body, redirect: 'follow'};
    
    let response = await fetch(url, requestOptions)
    if (response.status === 200) {
        let jsonResponse = await response.json()
        return jsonResponse.content
    }
    return []
}