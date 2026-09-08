import GALEN_URL from "../config";
import METHOD from '../config/Method';
import getHeader from '../config/getHeader'
import TABLE from "../config/TableIdentifier";
import moment from "moment";
import { getBaseURL } from "../config/getBaseURL";



export async function getFirstTenAlerts(userId,macAddress= "") {
    let header = getHeader()
    let url = getBaseURL()+GALEN_URL.TEN_ALERTS_URL
    var body=null;
    if (macAddress.length > 0) {
        body = JSON.stringify({ "deviceDataModelId": TABLE.ALERTS, "deviceCriteria":[{"key":"DevidAlerts","operator":"Equal","value":macAddress}], "ownerFilter": {"users":[userId]}});
    }else{
        body = JSON.stringify({ "deviceDataModelId": TABLE.ALERTS, "ownerFilter": {"users":[userId]}});
    }
    let requestOptions = { method: METHOD.POST, headers: header, body:body, redirect: 'follow'};
    let response = await fetch(url, requestOptions)
    if  (response.status === 200) {
        const  jsonResponse = await response.json()
        return jsonResponse.content
    }else {
         return []
    }
}