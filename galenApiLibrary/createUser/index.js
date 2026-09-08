import GALEN_URL from "../config";
import METHOD from '../config/Method';
import getHeader from '../config/getHeader'
import { getBaseURL , getEndPoint} from "../config/getBaseURL";




export async function registerUser(email, password, confirmPassword, firstName, lastName){
  
    const header = getHeader("ios", true)
    let url = getBaseURL()+GALEN_URL.REGISTER_USER
    let isGalen = getEndPoint() === 'GALEN'
    var body;
    if (isGalen) {
      body = JSON.stringify({
        "user": {
          "firstName": firstName,
          "lastName": lastName,
          "emailAddress": email,
          "contactInfo": {
            "streetAddress1": "1 Moore",
            "streetAddress2": "Suite",
            "city": "Houston",
            "state": "TX",
            "country": "US",
            "zipCode": "12345"
          },
          "role": "Patient",
          "supplier": {
            "supplierId": "cd5dc314-6e25-48a8-9d47-9e574b8fe3a0",
            "active": true,
            "createdBy": "2c00fbe2-07ae-4e0c-a6a2-b2a669974fec",
            "createdOn": "2020-11-07T17:25:49.6251",
            "emailAddress": "generalwellness@cardio.io",
            "lastUpdatedBy": null,
            "lastUpdatedOn": null,
            "name": "General Wellness",
            "status": "Active",
            "tenantId": "ATS-DEV",
            "contactInfo": {
              "city": "Austin",
              "country": "US",
              "primaryPhone": "+15128528057",
              "secondaryPhone": null,
              "state": "TX",
              "streetAddress1": "3815 Jarrett Way",
              "streetAddress2": null,
              "zipcode": "78728"
            }
          },
          "tenant": {
            "accountId": null,
            "contactInfo": {
              "city": "Austin",
              "country": "US",
              "primaryPhone": "+18882922208",
              "secondaryPhone": "",
              "state": "TX",
              "streetAddress1": "3815 Jarrett Way",
              "streetAddress2": "Suite A100",
              "zipcode": "78728"
            }
          }
        },
        "password": password,
        "confirmPassword": confirmPassword,
        "timezone": "CST"
      })
    }
    else {
      body = JSON.stringify({
                "emailAddress": email,  
                "password": password,  
                "firstName": firstName,  
                "lastName": lastName
      })
      
    }
   


  
 const requestOptions = { method: METHOD.POST, headers: header,  body: body, redirect: 'follow'};
  let response = await fetch(url, requestOptions)
  console.log("body:"+body)
  console.log("header:"+header)
  console.log("url:"+url)
  console.log("response:"+response.status)
  return response
}

export async function deleteUserAccount(userId){
  let header = getHeader()
  let url = getBaseURL()+GALEN_URL.DELETE_ACCOUNT+userId

  let requestOptions = { method: METHOD.DELETE, headers: header, redirect: 'follow'};
 
  let response = await fetch(url, requestOptions)
  
  return response
}