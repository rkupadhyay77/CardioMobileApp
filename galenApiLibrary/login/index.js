import GALEN_URL from "../config";
import METHOD from '../config/Method';
import {setBerarToken, setGalenToken} from "../config/setBearerToken";
import API_RESPONSE_STATUS from "../config/Status";
import getHeader from '../config/getHeader'
import getBearerToken from "../config/getBearerToken";
import { getBaseURL , getEndPoint} from "../config/getBaseURL";

export async function App_login(email, password, platform) {
    console.log("Login:App_login called email:"+email+"password:"+password)
    let myHeaders =  getHeader(platform, true)
    

    var formdata = new FormData();
    formdata.append("emailAddress", email.trim());
    formdata.append("password", password.trim());

    let body = JSON.stringify({ "emailAddress":email.trim(), "password":password.trim()} );
  

    var requestOptions ; 
     

     let endPoint = getEndPoint()
      if (endPoint === 'GALEN') {
        requestOptions = { method: METHOD.POST, headers: myHeaders, body: formdata, redirect: 'follow'};
      }
      else {
        requestOptions = { method: METHOD.POST, headers: myHeaders, body: body, redirect: 'follow'};
      }

    let loginUrl = getBaseURL()+GALEN_URL.AUTH
    console.log("Login:App_login loginUrl:"+loginUrl)
    console.log("Login:App_login body:"+body)
    
    let res = await fetch(loginUrl, requestOptions)
    console.log("Login:res"+res.status)
    if (res.status === 200){
        let authorization = res.headers.map.authorization
       // console.log("Login:authorization"+authorization)
        setBerarToken(authorization)
       // console.log("Login:getBearerToken"+getBearerToken())
        let jsonResponse = await res.json()
        let returnResponse = {status : API_RESPONSE_STATUS.SUCCESS, response : jsonResponse , message: "Login SuccessFul"}
       return returnResponse
    }else if (res.status === 412){
        let error = await res.text()
         let returnResponse = {status : API_RESPONSE_STATUS.FAILURE, response : null , message: error}
        return returnResponse
    }else{
        let returnResponse = {status : API_RESPONSE_STATUS.FAILURE, response : null , message: "Something went wrong"}
       return returnResponse
    }
}


export async function Galen_login(email, password, platform) {
  console.log("Login:Galen_login called email:"+email+"password:"+password)
  let myHeaders =  getHeader(platform, true)
  

  var formdata = new FormData();
  formdata.append("emailAddress", email.trim());
  formdata.append("password", password.trim());

  const requestOptions = { method: METHOD.POST, headers: myHeaders, body: formdata, redirect: 'follow'};

  let loginUrl = GALEN_URL.BASE_URL+GALEN_URL.AUTH
  console.log("Galen_login:loginUrl"+loginUrl)
 
  let res = await fetch(loginUrl, requestOptions)
  console.log("Login:res"+res.status)
  if (res.status === 200){
      let authorization = res.headers.map.authorization
      console.log("Login:authorization"+authorization)
      setBerarToken(authorization)
      let jsonResponse = await res.json()
      let returnResponse = {status : API_RESPONSE_STATUS.SUCCESS, response : jsonResponse , message: "Login SuccessFul"}
     return returnResponse
  }else if (res.status === 412){
      let error = await res.text()
       let returnResponse = {status : API_RESPONSE_STATUS.FAILURE, response : null , message: error}
      return returnResponse
  }else{
      let returnResponse = {status : API_RESPONSE_STATUS.FAILURE, response : null , message: "Something went wrong"}
     return returnResponse
  }
}


export async function Do_Galen_login(email, password, platform) {
  alert("email:"+email+"password:"+password)
  
   let myHeaders =  getHeader(platform, true)
   

   var formdata = new FormData();
   formdata.append("emailAddress", email.trim());
   formdata.append("password", password.trim());

   let body = JSON.stringify({ "emailAddress":email.trim(), "password":password.trim()} );
 

   var requestOptions = { method: METHOD.POST, headers: myHeaders, body: formdata, redirect: 'follow'};
   

   let loginUrl = GALEN_URL.BASE_URL+GALEN_URL.AUTH
   
   let res = await fetch(loginUrl, requestOptions)
  // console.log("Login:res"+res.status)
   if (res.status === 200){
       let authorization = res.headers.map.authorization
      // console.log("Login:authorization"+authorization)
      setGalenToken(authorization)
      // console.log("Login:getBearerToken"+getBearerToken())
       let jsonResponse = await res.json()
       let returnResponse = {status : API_RESPONSE_STATUS.SUCCESS, response : jsonResponse , message: "Login SuccessFul"}
      return returnResponse
   }else if (res.status === 412){
       let error = await res.text()
        let returnResponse = {status : API_RESPONSE_STATUS.FAILURE, response : null , message: error}
       return returnResponse
   }else{
       let returnResponse = {status : API_RESPONSE_STATUS.FAILURE, response : null , message: "Something went wrong"}
      return returnResponse
   }
}


export async function Do_Cardio_login(email, password, platform) {
  // alert("Login:Do_Cardio_login called email:"+email+"password:"+password)
   let myHeaders =  getHeader(platform, true)
   

   var formdata = new FormData();
   formdata.append("emailAddress", email.trim());
   formdata.append("password", password.trim());

   let body = JSON.stringify({ "emailAddress":email.trim(), "password":password.trim()} );
 

    

    let endPoint = GALEN_URL.NEW_BASE_URL
     
      let requestOptions = { method: METHOD.POST, headers: myHeaders, body: body, redirect: 'follow'};
      

   let loginUrl = endPoint+GALEN_URL.AUTH
   console.log("Login:Do_Cardio_login called loginUrl:"+loginUrl)
   console.log("Login:Do_Cardio_login called body:"+body)
   
   let res = await fetch(loginUrl, requestOptions)
   
   if (res.status === 200){
       let authorization = res.headers.map.authorization
      // console.log("Login:authorization"+authorization)
       setBerarToken(authorization)
      // console.log("Login:getBearerToken"+getBearerToken())
       let jsonResponse = await res.json()
       let returnResponse = {status : API_RESPONSE_STATUS.SUCCESS, response : jsonResponse , message: "Login SuccessFul"}
      return returnResponse
   }else if (res.status === 412){
       let error = await res.text()
        let returnResponse = {status : API_RESPONSE_STATUS.FAILURE, response : null , message: error}
       return returnResponse
   }else{
       let returnResponse = {status : API_RESPONSE_STATUS.FAILURE, response : null , message: "Something went wrong"}
      return returnResponse
   }
}