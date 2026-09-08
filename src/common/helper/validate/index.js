import getStateItem from '../../../state/getStateItem'
import {DB_KEY} from '../../../common/helper/keys'

export function ValidateEmail(inputText)
{
var mailformat = /^w+([.-]?w+)*@w+([.-]?w+)*(.w{2,3})+$/;
if(inputText.value.match(mailformat))
{
return true;
}
else
{
return false;
}
}


export function checkString(str)
 {
    var ch;
    var capitalFlag = false;
    var lowerCaseFlag = false;
    var numberFlag = false;
    for(var i=0;i < str.length();i++) {
        ch = str.charAt(i);
        if( Character.isDigit(ch)) {
            numberFlag = true;
        }
        else if (Character.isUpperCase(ch)) {
            capitalFlag = true;
        } else if (Character.isLowerCase(ch)) {
            lowerCaseFlag = true;
        }
        if(numberFlag && capitalFlag && lowerCaseFlag)
            return true;
    }
    return false;


}


export function checkIfUserHasPermissionToAddDevice() {
    
    // get the user
    let user = getStateItem(DB_KEY.USER)
    // check if supplierId not Genral wellness and role is Admin the show or supplierId is Genral wellness and role is Pateint the show or 
    let userRole = user.currentRole?user.currentRole.role:''
    let supplierId = getSupplierId()
//supllier Id for Genral wellness "cd5dc314-6e25-48a8-9d47-9e574b8fe3a0"
    if (supplierId  === "cd5dc314-6e25-48a8-9d47-9e574b8fe3a0" && userRole === "Patient"){
         return true
    }else if(supplierId  !== "cd5dc314-6e25-48a8-9d47-9e574b8fe3a0" && userRole.includes("Admin")){
        return true
    }
    
    return false
}


export function getSupplierId() {
    
    let supplierId = 'cd5dc314-6e25-48a8-9d47-9e574b8fe3a0'
    // get the user
    let user = getStateItem(DB_KEY.USER)
    // check if supplierId not Genral wellness and role is Admin the show or supplierId is Genral wellness and role is Pateint the show or 
   if (user !== null && user.currentRole !== null && user.currentRole !== undefined ){
    if (user.currentRole.supplier !== null && user.currentRole.supplier !== undefined ){
        if (user.currentRole.supplier.supplierId !== null && user.currentRole.supplier.supplierId !== undefined ){
            supplierId = user.currentRole.supplier.supplierId
        }
    }
   }
//supllier Id for Genral wellness "cd5dc314-6e25-48a8-9d47-9e574b8fe3a0"
  
    return supplierId
}


export function getUserId() {
    
    
    // get the user
    let user = getStateItem(DB_KEY.USER)
    let userId = user?user.userId:''
    return userId
}


export function getUserEmailAddress() {
    // get the user
    let user = getStateItem(DB_KEY.USER)
     return user?user.emailAddress:''
}

export function getUnreadAlertCount(){
    let alertCount = getStateItem(DB_KEY.TOTAL_UNREAD_ALERT)

    return alertCount
}

export function checkIfSensorHasAnAlert(macAddress){
    
    let totalAlertsArray = getStateItem(DB_KEY.ALERTS_ARRAY)
    if (totalAlertsArray.length > 0){
        
        let totalAlertForThisSensor = totalAlertsArray.filter((alert)=> alert.data.DevidAlerts.value === macAddress )

        let readAlertsArray = getStateItem(DB_KEY.LOCAL_READ_ALERT_ARRAY)
        let totalReadAlertForThisSensor = readAlertsArray.filter((alert)=> alert.macAddress === macAddress )
    
        return  totalAlertForThisSensor.length - totalReadAlertForThisSensor.length
    }
   
return false

} 

export function checkIfSensorHasAnAlertFor(macAddress, alertMode){
    
    
    let totalAlertsArray = getStateItem(DB_KEY.ALERTS_ARRAY)
    if (totalAlertsArray.length > 0){
        
        let totalAlertForThisSensor = totalAlertsArray.filter((alert)=> (alert.data? alert.data.DevidAlerts?  alert.data.DevidAlerts.value === macAddress:false:false && alert.data? alert.data.AlertType?  alert.data.AlertType.value === alertMode:false:false))

        let readAlertsArray = getStateItem(DB_KEY.LOCAL_READ_ALERT_ARRAY)
        let totalReadAlertForThisSensor = readAlertsArray.filter((alert)=> (alert.macAddress === macAddress  && alert.alertType === alertMode))
    
        return  totalAlertForThisSensor.length - totalReadAlertForThisSensor.length
    }
   
return false

} 