
import GALEN_URL from "../config";
import METHOD from '../config/Method';
import getHeader from '../config/getHeader'
import TABLE from "../config/TableIdentifier";
import { getBaseURL } from "../config/getBaseURL";
export async function fetchPracticeList(supplierId) {
    let header = getHeader()
    let url = getBaseURL()+GALEN_URL.FACILITY_LIST+supplierId
    let requestOptions = { method: METHOD.GET, headers: header, redirect: 'follow'};
    console.log('fetchPracticeList: url'+url)
    let response = await fetch(url, requestOptions)
    if  (response.status === 200) {
        const  jsonResponse = await response.json()
        return jsonResponse.content
    }else {
         return []
    }
}


export async function fetchAllUsersForCompany(supplierId) {
    let header = getHeader()
    let url = getBaseURL()+GALEN_URL.ALL_USER_COMPANY+supplierId
    let requestOptions = { method: METHOD.GET, headers: header, redirect: 'follow'};
    console.log('fetchAllUsersForCompany: url'+url)
    let response = await fetch(url, requestOptions)
    if  (response.status === 200) {
        const  jsonResponse = await response.json()
        return jsonResponse.content
    }else {
         return []
    }
}
