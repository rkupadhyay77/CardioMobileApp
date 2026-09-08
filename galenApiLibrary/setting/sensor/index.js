import GALEN_URL from "../../config";
import METHOD from '../../config/Method';
import getHeader from '../../config/getHeader'
import TABLE from "../../config/TableIdentifier";
import moment from "moment";
import { getBaseURL } from "../../config/getBaseURL";


export async function getTablesData() {
    const header = getHeader()
    const url = getBaseURL()+GALEN_URL.USER_DEVICE+'?nameLike=ATX2410'
    let requestOptions = { method: METHOD.GET, headers: header, redirect: 'follow'};
    let response = await fetch(url, requestOptions)
    return response
  }


  export async function getDevicePropertySet(deviceDataModelId) {
    const header = getHeader()
    let url = getBaseURL()+GALEN_URL.GET_DEVICE_PROPERTY+deviceDataModelId
    let requestOptions = { method: METHOD.GET, headers: header, redirect: 'follow'};
    let response = await fetch(url, requestOptions)
    return response
  }


export async function writeData(body) {
    const header = getHeader()
    let deviceDataUrl = getBaseURL() + GALEN_URL.WRITE_DEVICE_DATA;
    let requestOptions = { method: METHOD.POST, headers: header, body:body, redirect: 'follow'};
    let response = await fetch(deviceDataUrl, requestOptions)
   // console.log("writeData:::deviceDataUrl::"+deviceDataUrl+"body::"+body);
    return response
}

export async function getLastDataForDevHealth(macAddress) {
  const header = getHeader()
  const body =  JSON.stringify({"deviceDataModelId":TABLE.DEVHEALTH,"deviceCriteria":[{"key":"DevidDevhealth","operator":"Equal","value":macAddress}]});
  const url = getBaseURL()+GALEN_URL.DATA_DEVHEALTH
  console.log("getLastDataForDevHealth:url:"+url+"body:"+body+":header:"+header)
  let requestOptions = { method: METHOD.POST, headers: header, body:body, redirect: 'follow'};
  let response = await fetch(url, requestOptions)
  return response
}

export async function getLastDataForDevHealthFor(macAddress, userId) {
  const header = getHeader()
  const body =  JSON.stringify({"deviceDataModelId":TABLE.DEVHEALTH,"deviceCriteria":[{"key":"DevidDevhealth","operator":"Equal","value":macAddress}],"ownerFilter":{"users":[userId]}});
  const url = getBaseURL()+GALEN_URL.DATA_DEVHEALTH
  console.log("getLastDataForDevHealthFor:url:"+url+"body:"+body+":header:"+header)
  let requestOptions = { method: METHOD.POST, headers: header, body:body, redirect: 'follow'};
  let response = await fetch(url, requestOptions)
  return response
}

export async function getLastDeviceDataIdIdentity(macAddress) {
  const header = getHeader()
  const body =  JSON.stringify({"deviceDataModelId":TABLE.IDENTITY,"deviceCriteria":[{"key":"Devid","operator":"Equal","value":macAddress}]});
  const url = getBaseURL()+GALEN_URL.DATA_IDENTITY
  let requestOptions = { method: METHOD.POST, headers: header, body:body, redirect: 'follow'};
  let response = await fetch(url, requestOptions)

  return response
}

export async function writeEnableReports(value, macAddress) {
  const header = getHeader()
  let lastData = await getLastDeviceDataIdIdentity(macAddress)
  var deviceDataId = ""
  if (lastData.status === 200) {
    let res = await lastData.json()
    deviceDataId = res.content[0].deviceDataId
  //  console.log("deviceDataId::"+deviceDataId)
    
  }
  else {
    
    return
  }
  let devicePropertySet = await getDevicePropertySet(TABLE.IDENTITY)
  let jsonResponse = await devicePropertySet.json();
  let dataToPut = {EnableReports: value === true ? "Yes" : "No", TimestampI: moment.utc().format()};
  let body = {
    deviceDataModelId: TABLE.IDENTITY,
    deviceDataId: deviceDataId,
    data: dataToPut,
    devicePropertySetId: jsonResponse.content[0].devicePropertySetId,
  };
  let writeValue = await writeData(JSON.stringify(body))
}


