import HEADER from "./Header";
import {getGalenBerarToken} from "./getBearerToken";
export default function getGalenHeaders(platform = "ios", isLogin=false) {
    var myHeaders = new Headers();
    myHeaders.append("X-APP-TYPE", HEADER.APP_TYPE);
    myHeaders.append("X-TENANT-DOMAIN", HEADER.TENANT_DOMAIN);
    myHeaders.append("X-API-VERSION", HEADER.API_VERSION);
    if (isLogin){
        myHeaders.append("Content-Type", "multipart/form-data");
      }else{
        myHeaders.append("Content-Type", "application/json");
      } 

    if (isLogin === false){
        myHeaders.append("Authorization", getGalenBerarToken());
   
    }
    return myHeaders;
}
