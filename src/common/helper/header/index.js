import HEADER from '../constants'
import getStateItem from '../../../state/getStateItem'
import {DB_KEY} from '../keys'
import getHeaders from '../../../../galenApiLibrary/config/getHeader';

export function getApiHeader(includeAuthrization){
    var myHeaders = new Headers();
    myHeaders.append("X-APP-TYPE", HEADER.APP_TYPE);
    myHeaders.append("X-TENANT-DOMAIN", HEADER.TENANT_DOMAIN);
    myHeaders.append("X-API-VERSION", HEADER.API_VERSION);
    myHeaders.append("Content-Type", "application/json");
    if (includeAuthrization){
        myHeaders.append("Authorization", getStateItem(DB_KEY.ACCESS_TOKEN));
    }
    

    return getHeaders("ios",!includeAuthrization)
}