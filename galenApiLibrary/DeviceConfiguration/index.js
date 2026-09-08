import GALEN_URL from "../config";
import METHOD from '../config/Method';
import getHeader from '../config/getHeader'
import TABLE from "../config/TableIdentifier";
import HEADER from "../config/Header";
import {getBerarToken} from "../config/getBearerToken";
import { getBaseURL } from "../config/getBaseURL";


export async function verifySensor(macAddress) {
    let token = "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJlbWFpbEFkZHJlc3MiOiJlNzU0YTk5Yy01OGY2LTRmNjAtYjRmMC1iYzRhNjkyNDU5ODBAZ2FsZW5jbG91ZC5jb20iLCJyb2xlIjoiVGVuYW50QWRtaW4iLCJhcHBUeXBlIjoiREVWSUNFIiwiaXNzIjoiR2FsZW5DbG91ZCIsInRlbmFudElkIjoiQVRTLURFViIsInByaW5jaXBhbElkIjoiZTc1NGE5OWMtNThmNi00ZjYwLWI0ZjAtYmM0YTY5MjQ1OTgwIiwiZXhwIjoxNzk4NzgzMTc1LCJ0b2tlblR5cGUiOiJNYXN0ZXJUb2tlbiIsInByaW5jaXBhbFR5cGUiOiJVc2VyIn0.dDPxypg3d69n4TbgvvVvnUdd0HJ77hBBfe9g0-PosmSDjmfbzu0FOay7uvix6v8anyVK5T0YR0uDb08oz3Q0KA"
  
    var myHeaders = new Headers();
    myHeaders.append("X-APP-TYPE", HEADER.APP_TYPE);
    myHeaders.append("X-TENANT-DOMAIN", HEADER.TENANT_DOMAIN);
    myHeaders.append("X-API-VERSION", HEADER.API_VERSION);
     myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", token);

    let url = getBaseURL()+GALEN_URL.VERIFY_SENSOR
    let body = JSON.stringify({ "deviceDataModelId": TABLE.IDENTITY, "deviceCriteria": [{key: 'Devid', operator: 'Equal', value: macAddress}]});
    let requestOptions = { method: METHOD.POST, headers: myHeaders, body:body, redirect: 'follow'};
   console.log("url: "+url)
   console.log("body: "+body)
   console.log("myHeaders: "+myHeaders)
    let response = await fetch(url, requestOptions)
    if  (response.status === 200) {
        const  jsonResponse = await response.json()
        return jsonResponse.content
    }else {
         return []
    }
}

