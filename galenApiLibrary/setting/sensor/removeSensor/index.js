

import METHOD from '../../../config/Method';
import getHeader from '../../../config/getHeader'


export async function deleteSensor(macId) {
    const header = getHeader()
    const url =  "https://webportalapi-v3.cardioatx.com/v3/devices/"+macId
    let requestOptions = { method: METHOD.DELETE, headers: header, redirect: 'follow'};
    console.log("deleteSensor:URl:"+url)
    let response = await fetch(url, requestOptions)
    return response
}