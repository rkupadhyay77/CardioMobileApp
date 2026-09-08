import getStateItem from '../state/getStateItem'
import setStateItem from '../state/setState/setStateItem';
import {DB_KEY} from '../common/helper/keys'
import {getApiHeader} from '../common/helper/header'
import {AlertsNumberChanged} from '../state/emitters'
import {executeApiWith} from '../api'
import {fetchLastUnreadAlertCount} from '../../galenApiLibrary/residents'
// setStateItem(DB_KEY.TOTAL_UNREAD_ALERT,totalElements)
//if (Platform.OS === 'ios') {  PushNotificationIOS.setApplicationIconBadgeNumber(totalElements)
//}

//AlertsNumberChanged.emit('ALERTS__NUMBER_CHANGED')

export default class APIHelper {
    constructor() {
      if (APIHelper._instance) {
        return APIHelper._instance
      }
      APIHelper._instance = this;
  
      // ... Your rest of the constructor code goes after this
      
    }


    getHeader(){
    return getApiHeader(true)
    }

   
     async getSensorPosition(userId){
      
      let header = this.getHeader()

      let url = getBaseURL() + 'data/devicedata-advanced'
      let raw = JSON.stringify({
          "deviceDataModelId":"6df2d80f-be28-47ac-a509-8f0b6aa3bbb8",
          "deviceCriteria": [
          {
              "key": "Userid",
              "operator": "Equal",
              "value": userId
            }],
        });
      
      let requestOptions = {
        method: 'POST',
        headers: header,
        body: raw,
        redirect: 'follow'
      };
      //V3
     
      //console.log("RKDebug:APIHelper:url:"+url+"body:"+raw)
       
      const  response = await executeApiWith(url, 'POST', raw,header, "APIHelper:getSensorPosition" )
      
      if (response.status === 200){
        
          let jsonData = await response.json()
          
          if (jsonData.content !== undefined && jsonData.content !== null && jsonData.content.length > 0){
            return jsonData.content
          }else{
              return []
          }
    
      }else{
      return []
      }
    }

    // start the api call for Alerts
   async getAlerts(){
    console.log("RKDebug:getAlerts")
           let residentsData = getStateItem(DB_KEY.RESIDENT_DATA)
           console.log("RKDebug:residentsData:length--"+residentsData.length)
           if (residentsData.length > 0) {
            let alertsCountArray = []
            let totalAlert = 0
            let myHeaders = this.getHeader()
                 for(var index = 0 ; index < residentsData.length; index++){
                    let resident = residentsData[index]

                     let macAddress = resident.data.Devid.value
                     let friendlyName = resident.data.FriendlyName.value

                    let url = getBaseURL() + 'data/devicedata-advanced?pageSize=1&pageNumber=0'
                    let raw = JSON.stringify({"deviceDataModelId":"d36a4373-fbdc-44a3-8c96-4bb920041e40-as","deviceCriteria": [
                        {
                            "key": "AlertFlag",
                            "operator": "Equal",
                            "value": 1
                          },
                          {
                            "key": "DevidAlerts",
                            "operator": "Equal",
                            "value": macAddress
                          }
                        ],"devicePropertyCodes":[
                          "FriendlyNameA",
                          "DevidAlerts",
                          "AlertFlag",
                          "AlertType",
                          "Atext",
                          "TimestampA"]});

                    let requestOptions = {
                        method: 'POST',
                        headers: myHeaders,
                        body: raw,
                        redirect: 'follow'
                      };
                      //V3
                     // let  res = await executeApiWith(url, 'POST', raw,myHeaders, "APIHelper:getAlerts" )
                     console.log("RKDebug:getAlerts:macAddress:"+macAddress+"friendlyName:"+friendlyName)
                      let res = await fetchLastUnreadAlertCount(macAddress)
                      if (res.status === 200) {
                        let resJson  = await res.json()
                        let array = resJson.content
                            setStateItem(DB_KEY.ALERTS_ARRAY, array)
                            //totalElements
                           let totalElements = resJson.totalElements !== undefined ? resJson.totalElements : 0

                           totalAlert += totalElements
                           let obj  = {"macAddress":macAddress, "totalElements":totalElements}
                           console.log("RKDebug:getAlerts:macAddress:"+macAddress+"friendlyName:"+friendlyName+"alertCount:"+totalElements)
                           alertsCountArray.push(obj)

                           setStateItem(DB_KEY.ALERTS_COUNT_ARRAY, alertsCountArray)
                         
                            // store this in array
                            if (index === residentsData.length - 1){
                              console.log("emittingChange")
                    
                                setStateItem(DB_KEY.TOTAL_UNREAD_ALERT,totalAlert)
                                AlertsNumberChanged.emit('ALERTS__NUMBER_CHANGED')
                            }
                      }
      
                      
                      // if (res.status === 200){
                      //   let resJson = await res.json()
                        
                      //   if (resJson.content !== undefined && resJson.content !== null && resJson.content.length > 0){
                      //       let array = resJson.content
                      //     //  setStateItem(DB_KEY.ALERTS_ARRAY, array)
                      //       //totalElements
                      //      let totalElements = resJson.totalElements !== undefined ? resJson.totalElements : 0

                      //      totalAlert += totalElements
                      //      let obj  = {"macAddress":macAddress, "totalElements":totalElements}
                      //      alertsCountArray.push(obj)

                      //      setStateItem(DB_KEY.ALERTS_COUNT_ARRAY, alertsCountArray)
                         
                      //       // store this in array
                      //       if (index === residentsData.length - 1){
                      //           setStateItem(DB_KEY.TOTAL_UNREAD_ALERT,totalAlert)
                      //           AlertsNumberChanged.emit('ALERTS__NUMBER_CHANGED')
                      //       }
                      //     }

                      // }
                    
                    }
                    
                  }
           }
    
  }