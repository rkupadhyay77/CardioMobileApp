import HEADER from "./Header";
import {getBerarToken} from "./getBearerToken";
export default function getHeaders(platform = "ios", isLogin=false) {
    var myHeaders = new Headers();
    myHeaders.append("X-APP-TYPE", HEADER.APP_TYPE);
    myHeaders.append("X-TENANT-DOMAIN", HEADER.TENANT_DOMAIN);
    myHeaders.append("X-API-VERSION", HEADER.API_VERSION);
    myHeaders.append("Content-Type", "application/json");
      

    if (isLogin === false){
        myHeaders.append("Authorization", getBerarToken());
   
    }
    return myHeaders;
}




