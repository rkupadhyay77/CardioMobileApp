import GALEN_URL from "../config";
import METHOD from '../config/Method';
import getHeader from '../config/getHeader'
import moment from "moment";
import { getBaseURL } from "../config/getBaseURL";




export async function getGuestList() {
    let url  = getBaseURL()+GALEN_URL.GET_GUEST_LIST
    let header = getHeader()
    let requestOptions = { method: METHOD.GET, headers: header, redirect: 'follow'};
   
    let res = await fetch(url, requestOptions)
    return res
}

export async function deleteObserveInvite(userObserverId) {
    const header = getHeader()
    let url = getBaseURL()+'observer/'+userObserverId
    let requestOptions = { method: METHOD.DELETE, headers: header, redirect: 'follow'};
   
    let res = await fetch(url, requestOptions)
    return res
  }


  export async function inviteObserve(email){
    const header = getHeader() 
    let endDateTime = moment.utc().add(1 , 'year').format()
    let body = JSON.stringify({"emailAddress":email, "validUntil":endDateTime,"guestInvite":true});
    let requestOptions = { method: METHOD.POST, headers: header, body:body, redirect: 'follow'};
   
     let url = getBaseURL()+GALEN_URL.INVITE_OBSERVE 
     let res = await fetch(url, requestOptions)
     return res
  }
