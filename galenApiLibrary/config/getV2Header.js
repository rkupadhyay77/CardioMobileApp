import HEADER from "./Header";
import {getBerarToken} from "./getBearerToken";


export default function getV2Header () {
    var myHeaders = new Headers();
    myHeaders.append("X-APP-TYPE", "DEVICE");
    myHeaders.append("X-TENANT-DOMAIN", "ats-dev2.galencloud.com");
    myHeaders.append("X-API-VERSION", "2");
     myHeaders.append("Content-Type", "application/json");
     myHeaders.append("Authorization", getBerarToken());
    return myHeaders;
}