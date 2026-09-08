import URLS from "../common/helper/urls";
import HEADER from "../common/helper/constants";
import getStateItem from "../state/getStateItem";
import setStateItem from "../state/setState/setStateItem";
import { DB_KEY, API_METHOD } from "../common/helper/keys";
import getHeaders from "../../galenApiLibrary/config/getHeader";
import { getBaseURL } from "../../galenApiLibrary/config/getBaseURL";

export function getHeader (includeAUthentication = true) {
     var myHeaders = new Headers();
      myHeaders.append("X-APP-TYPE", HEADER.APP_TYPE);
      myHeaders.append("X-TENANT-DOMAIN", HEADER.TENANT_DOMAIN);
      myHeaders.append("X-API-VERSION", HEADER.API_VERSION);
       myHeaders.append("Content-Type", HEADER.CONTENT_TYPE);
       if(includeAUthentication === true) {
        myHeaders.append("Authorization", getStateItem(DB_KEY.ACCESS_TOKEN));
       }
      return getHeaders("ios", !includeAUthentication);
}




export async function login(email, password, reponseKeys) {
    const header = this.getHeader(false)
     var formdata = new FormData();
     formdata.append("emailAddress", email.trim());
     formdata.append("password", password.trim());
     const requestOptions = { method: API_METHOD.POST, headers: header,body: formdata };
     let loginUrl = getBaseURL()+URLS.LOGIN
     const response = await fetch(loginUrl, requestOptions)
     if (response.status === 200) {
        let authorization = response.headers.map.authorization
        setStateItem(DB_KEY.ACCESS_TOKEN,authorization);
           return await response.json()
     }else{
       return ""
     }
}