import HEADER from "../../common/helper/constants";
import getStateItem from "../../state/getStateItem";
import { DB_KEY } from "../../common/helper/keys";
import getHeaders from "../../../galenApiLibrary/config/getHeader";

export function getHeader () {
     var myHeaders = new Headers();
      myHeaders.append("X-APP-TYPE", HEADER.APP_TYPE);
      myHeaders.append("X-TENANT-DOMAIN", HEADER.TENANT_DOMAIN);
      myHeaders.append("X-API-VERSION", HEADER.API_VERSION);
       myHeaders.append("Content-Type", "application/json");
      myHeaders.append("Authorization", getStateItem(DB_KEY.ACCESS_TOKEN));
      return getHeaders();
}


export function getV2Header () {
      var myHeaders = new Headers();
       myHeaders.append("X-APP-TYPE", "DEVICE");
       myHeaders.append("X-TENANT-DOMAIN", "ats-dev2.galencloud.com");
       myHeaders.append("X-API-VERSION", "2");
        myHeaders.append("Content-Type", "application/json");
       myHeaders.append("Authorization", getStateItem(DB_KEY.ACCESS_TOKEN));
       return myHeaders;
 }