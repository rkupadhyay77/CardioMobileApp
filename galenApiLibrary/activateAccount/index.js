import GALEN_URL from "../config";
import METHOD from '../config/Method';
import getHeader from '../config/getHeader'
import { getBaseURL } from "../config/getBaseURL";


export async function activateUser(email, otp){
    const header = getHeader("android", true)
    let url = getBaseURL()+GALEN_URL.ACTIVATE_USER
    console.log("activateUser:url:"+url)
    let body = JSON.stringify({"emailAddress":email,"code":otp});
    const requestOptions = { method: METHOD.POST, headers: header,  body: body, redirect: 'follow'};
    console.log("body:url:"+body)
    console.log("body:header:"+header)
    
    let response = await fetch(url, requestOptions)
     return response
}

export async function resendActivationCode(email) {
    const header = getHeader("android", true)
    let url = getBaseURL()+GALEN_URL.RESEND_CODE
    console.log("resendActivationCode:url:"+url)
     var formData = new FormData();
    formData.append("email", email);
    let body = JSON.stringify({"emailAddress":email});
    const requestOptions = { method: METHOD.POST, headers: header,  body: body, redirect: 'follow'};
    let response = await fetch(url, requestOptions)
    return response
}
    
   
 