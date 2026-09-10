import React, { Component } from 'react';
import {
  View,
  Text,
  Dimensions,
  TextInput,
  Alert,
  TouchableOpacity,
  Switch,
  Platform,
  NativeModules,
  ActivityIndicator
} from 'react-native';
import getStateItem from '../../state/getStateItem'
import setStateItem from '../../state/setState/setStateItem'
import {DB_KEY, RESPONSE_MESSAGE} from '../../common/helper/keys'
import URLS from '../../common/helper/urls'
import TopHeader from '../../common/component/topHeader'
import ButtonK from '../../common/component/Button'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import {ValidateEmail} from '../../common/helper/validate'
import Loader from '../../common/component/loader'
import Icon from 'react-native-vector-icons/Entypo'
import HEADER from '../../common/helper/constants'
import moment from 'moment'
import Toast, {DURATION} from 'react-native-easy-toast'
import {SensorDataChange,SensorAddedForResident} from '../../state/emitters'
import {getSensors} from '../../api'
import { checkGenericNoType } from '../../common/helper/util';
import {executeApiWith, writeData, getDevicePropertySet, getTablesData} from '../../api'
import { API_TIMEOUT } from '../../common/helper/util';
//import WifiManager from "react-native-wifi-reborn";
//import TCP from 'react-native-tcp'
import getHeaders from '../../../galenApiLibrary/config/getHeader'
import { verifySensor } from '../../../galenApiLibrary/DeviceConfiguration';

import styles from './styles'
import { getBaseURL } from '../../../galenApiLibrary/config/getBaseURL';
import TIMEZONE from '../../common/helper/timezone'
import DropDownPicker from 'react-native-dropdown-picker';
import * as RNLocalize from "react-native-localize";
import { addNewSensor } from '../../../galenApiLibrary/setting/sensor/addSensor';
import TempLogger from '../tempLogger';

const {width , height }  = Dimensions.get('window')
import { captureEvent } from '../../analytics/posthog';

import EventLoggingChange from '../../state/emitters/eventLoggingChange';
import {checkForSensorInIdentity} from '../../../galenApiLibrary/residents';

export default class ConnectWiFiScreen extends Component {
    constructor(props){
        super(props)
       //macAddress:props.navigation.state.params.macAddress 
       this.connectToSensor = this.connectToSensor.bind(this)
       this.isValidStringData =  this.isValidStringData.bind(this)
        this.state = {themeChanged:getStateItem(DB_KEY.IS_DARK_MODE),wifiSSIDName:'',location:'',password:'',loading:false, passwordEyeOn:false,friendlyName:'',macAddress:props.navigation.state.params.macAddress,isFromResident:props.navigation.state.params.isFromResident?props.navigation.state.params.isFromResident:false ,showDialog:false ,serialNumber:props.navigation.state.params.serialNumber ,manufacturer:props.navigation.state.params.manufacturer, selectedTimezone:'', dayLightSavingEnabled: true, showTempLogger: false, apiExecutionTime:0}
    }

   

    componentDidMount(){
      
      let residentsData = getStateItem(DB_KEY.RESIDENT_DATA)
      this.getTheTimezone()
      if (residentsData !== null && residentsData.length > 0) {
        let filtered = residentsData.filter((content)=> content.data.Devid.value === this.state.macAddress)
        if (filtered.length > 0){ 
              let item =  filtered[0]
              if (item.data !== undefined && item.data !== null){
               if (item.data.Active !== undefined && item.data.Active !== null && checkGenericNoType(item.data.Active.value)){
                 this.setState({friendlyName:item.data.FriendlyName.value, location:item.data.Location.value})
               }
              }
          }
      }

      
      
    }

    componentWillUnmount(){
    }

   
    back(){
      
        this.props.navigation.goBack()
    }



    requestOptions(method){
        const header = this.getHeader()
        return {
            method: method?method:'GET',
            headers: header,
             };
    }

    handleNoTapped(){
      this.setState({password:'',showDialog:false,loading:false})
      let access_point = Platform.OS === 'ios' ? 'Cardio_'+this.state.macAddress.replaceAll(':','') : 'Cardio_'+this.state.macAddress.replace(/:/g, '')

      //Please re-try and reconnect Wifi to Cardio_C4---54
      Alert.alert(
        "Failed to connect",
        "Please re-try and reconnect Wifi to "+access_point,
        [
         { text: "Ok"}
        ],
        { cancelable: false }
      );
     
      
    }

    handleYesTapped(){
        // hit the api
        let eventLogArray = getStateItem(DB_KEY.EVENT_LOG_ARRAY)
        eventLogArray.unshift({description: "Sensor Configuration start...", _time: this.getCurrentTime()})
        setStateItem(DB_KEY.EVENT_LOG_ARRAY, eventLogArray)
        EventLoggingChange.emit('EVENT_LOGGING_CHANGED')
        captureEvent(getStateItem(DB_KEY.USER).userId, 'Sensor Configuration', 'Started the configuration', {macAddress: this.state.macAddress, friendlyName: this.state.friendlyName, location: this.state.location});
        this.setState({loading:true})
        this.addSensorDevice(this.state.macAddress, this.state.friendlyName, this.state.location)
       // this.addDevice(this.state.macAddress, this.state.friendlyName, this.state.location)
    }


    getHeader(){
        var myHeaders = new Headers();
        myHeaders.append("X-APP-TYPE", HEADER.APP_TYPE);
        myHeaders.append("X-TENANT-DOMAIN", HEADER.TENANT_DOMAIN);
        myHeaders.append("X-API-VERSION", HEADER.API_VERSION);
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Authorization", getStateItem(DB_KEY.ACCESS_TOKEN));

        return getHeaders()
    }

    navigateToMainPage(){
      let nav = getStateItem('deviceListNav')
      nav.goBack()
    }
    showConfirmationAlert(){
      this.setState({showDialog:false})
           
        Alert.alert(
            "Confirm",
            "Do you see the solid BLUE LED?\n\n It could take up to a full minute, so please be patient.\n\nIf you do not see a solid BLUE LED within 2 minutes, then either the WiFi SSID or password is incorrect or your device is too far away from your wireless network. Correct WiFi SSID password if it in is error, OR move your device closer to wireless network and then repeat procedure to add the device.",
            [
             { text: "No", onPress: () => this.handleNoTapped()},
              { text: "Yes", onPress: () => this.handleYesTapped()}
            ],
            { cancelable: false }
          );
    }

    async validateSensorIfExist(macAddress) {
          let resExist  = await verifySensor(macAddress)
          if (resExist.length > 0) {
            let sensorData = resExist[0]?.data
            let ownerData =  resExist[0]?.owner
            console.log("sensorData: "+JSON.stringify(sensorData))
            console.log("ownerData: "+JSON.stringify(ownerData))
            // check if sensor belongs to same user
            const user = getStateItem(DB_KEY.USER)
            console.log("user.userId: "+user.userId)
            console.log("ownerData.userId: "+ownerData.userId)
            if (user.userId === ownerData.userId) {
              // sensor belong to same user
              // now check if it is non Active
              let isNotActive = sensorData?.Active?.value !== "Yes"
              console.log("isNotActive: "+isNotActive)
              if (isNotActive === false) {
                alert("This sensor is already attached to the same user.")
                return true
             }
            }
            else {
              alert("This sensor is already attached to some other user. First delete the sensor")
              return true
            }

          }
         
          return false
    }

    async checkSensorInIdentity(macAddress, userId) {
      let eventLogArray = getStateItem(DB_KEY.EVENT_LOG_ARRAY)  
      eventLogArray.unshift({description: "Checking in identity...", _time: this.getCurrentTime()})
      setStateItem(DB_KEY.EVENT_LOG_ARRAY, eventLogArray)
      EventLoggingChange.emit('EVENT_LOGGING_CHANGED')
      let isSensorInIdentity = await checkForSensorInIdentity(macAddress, userId)

      let eventLogArray2 = getStateItem(DB_KEY.EVENT_LOG_ARRAY)
      eventLogArray2.unshift({description: "Got "+isSensorInIdentity, _time: this.getCurrentTime()})  
      setStateItem(DB_KEY.EVENT_LOG_ARRAY, eventLogArray2)
      EventLoggingChange.emit('EVENT_LOGGING_CHANGED')
 }


    async  addSensorDevice(macAddress, friendlyName, location) {
      
      let supplierId = getStateItem(DB_KEY.USER).currentRole?getStateItem(DB_KEY.USER).currentRole.supplier?getStateItem(DB_KEY.USER).currentRole.supplier.supplierId:'':''
      let tenantId = getStateItem(DB_KEY.USER).tenant.tenantId
      let email = getStateItem(DB_KEY.USER).emailAddress
      let userId = getStateItem(DB_KEY.USER).userId
      this._setUpResponseTimeInterval()
      // hit multiple api with await so that loader can be show until device is added
      let eventLogArray = getStateItem(DB_KEY.EVENT_LOG_ARRAY)
      eventLogArray.unshift({description: "Sensor Configuration Api Start...", _time: this.getCurrentTime()})
      setStateItem(DB_KEY.EVENT_LOG_ARRAY, eventLogArray)
      EventLoggingChange.emit('EVENT_LOGGING_CHANGED')


      captureEvent(getStateItem(DB_KEY.USER).userId, 'Sensor Configuration', 'API started', {macAddress: this.state.macAddress, friendlyName: this.state.friendlyName, location: this.state.location});
      let res = await addNewSensor(macAddress, supplierId, tenantId, email, friendlyName, location, this.state.serialNumber,userId, this.state.selectedTimezone, this.state.dayLightSavingEnabled, this.state.manufacturer)
      this._clearResponseTimeInterval()
      this.setState({loading:false})
      captureEvent(getStateItem(DB_KEY.USER).userId, 'Sensor Configuration', 'API retured:'+res.status, {macAddress: this.state.macAddress, friendlyName: this.state.friendlyName, location: this.state.location});
     
      let eventLogArray2 = getStateItem(DB_KEY.EVENT_LOG_ARRAY)
      

     if (res.status === 200 || res.status === 201){  
      eventLogArray2.unshift({description: "Sensor configure response: "+res.status, _time: this.getCurrentTime()})
      setStateItem(DB_KEY.EVENT_LOG_ARRAY, eventLogArray2)
      EventLoggingChange.emit('EVENT_LOGGING_CHANGED')

     await getSensors(true)
     await this.checkSensorInIdentity(macAddress, userId)
     SensorDataChange.emit('SENSOR_DATA_CHANGED')
      if (this.state.isFromResident){
        SensorAddedForResident.emit('SENSOR__FOR_RESIDENT')
      }

     // this.setState({showTempLogger:true})
      Alert.alert(
        "Success",
        "Sensor added successfully.",
        [
         { text: "Ok", onPress: () => this.navigateToMainPage()},
        ],
        { cancelable: false }
      );
  }
     else { 
      eventLogArray2.unshift({description: "Got api response: "+res.status, _time: this.getCurrentTime()})
      setStateItem(DB_KEY.EVENT_LOG_ARRAY, eventLogArray2)
      EventLoggingChange.emit('EVENT_LOGGING_CHANGED')

      var message =    "Some error occurred while adding sensor, please try again."
      if (res.status === 403) {
        message = "Device belongs to a different company and cannot be moved across companies."
      }
      Alert.alert(
        "Error",
        message,
        [
         { text: "Ok"},
        ],
        { cancelable: false }
      );
     }
 }


    async  addDevice(macAddress, friendlyName, location){
      // hit multiple api with await so that loader can be show until device is added

      //API -1 ---------------------------
      // get the something
      
     let isExist = await this.validateSensorIfExist(macAddress)
     if (isExist === false) {
     const header = this.getHeader()
     
      var requestOptions = {
      method: 'GET',
      headers: header,
       };
//V3
      let AlertMinhr = '30'
      let AlertMaxhr = '65'
      let AlertMinrr = '8'
      let AlertMaxrr = '30'
      let AlertMinst = '0'
      let AlertMaxst = '5'
      let AlertMinmt = '0'
      let AlertMaxmt = '5'
      let GainSelect = 'M'

      let BpfSelect = '2'
      let OfflineTimeout = '1'
      let Offline = true
    

      // get the default value
     
      const company = getStateItem(DB_KEY.USER).currentRole?getStateItem(DB_KEY.USER).currentRole.supplier?getStateItem(DB_KEY.USER).currentRole.supplier.name:'':''
      const companyId = getStateItem(DB_KEY.USER).currentRole?getStateItem(DB_KEY.USER).currentRole.supplier?getStateItem(DB_KEY.USER).currentRole.supplier.supplierId:'':''
      
      let supplierId = getStateItem(DB_KEY.USER).currentRole?getStateItem(DB_KEY.USER).currentRole.supplier?getStateItem(DB_KEY.USER).currentRole.supplier.supplierId:'':''
 

      
      const deviceUrl = getBaseURL()+URLS.USER_DEVICE+'?nameLike=ATX2410'
      let res = await executeApiWith(deviceUrl, "GET", null, header, "addSensoScreen:addDevice")
      console.log("deviceUrl:"+deviceUrl)
      let jsonResponse = await res.json()
      console.log("jsonResponse1"+JSON.stringify(jsonResponse))
      
      let content = jsonResponse.content
      const tablsArray = [ 'd36a4373-fbdc-44a3-8c96-4bb920041e40-id', 'd36a4373-fbdc-44a3-8c96-4bb920041e40','d36a4373-fbdc-44a3-8c96-4bb920041e40-as', 'd36a4373-fbdc-44a3-8c96-4bb920041e40-th','d36a4373-fbdc-44a3-8c96-4bb920041e40-pa','d36a4373-fbdc-44a3-8c96-4bb920041e40-dh', '296f0b26-f21f-4847-8b7d-b9ed80b860df','056ba1dd-b0e8-4bf3-9529-70fdcaa8c587']
      
      
      if (content !== undefined && content !== null && content.length > 0){
              // iterate content of device
              for (var index = 0 ;  index < content.length ; index++){
                  let subContent = content[index]

                  let deviceId = subContent.deviceId
                  console.log("Table deviceId: "+deviceId+ "Contains: "+tablsArray.includes(deviceId))
                  // here add the logic to fetch the data only for few tabls
                  if (tablsArray.includes(deviceId)) {
                      // get the url for device property
                      let devicePropertyUrl = getBaseURL()+URLS.DEVICE_PROPERTY+deviceId
                      console.log("devicePropertyUrl"+devicePropertyUrl)
                      //V3
                      let res = await executeApiWith(devicePropertyUrl, 'GET', null, header, "addSensoScreen:addDevice")
                      let jsonResponse = res.status === 200 || res.status === 201 ? await res.json() : null;
                      console.log("jsonResponse:321"+res.status)
                      if (jsonResponse !== undefined && jsonResponse !== null && jsonResponse.length > 0){
                          for (var index2 = 0 ;  index2 < jsonResponse.length ; index2++){
                              let devicePropertyContent = jsonResponse[index2]

                              let devicePropertyName = devicePropertyContent.name
                              let devicePropertyCode = devicePropertyContent.propertyCode
                              console.log("devicePropertyName"+devicePropertyName)
                              console.log("deviceId"+deviceId)

                              // check if devicePropertyName contains devId

                                  if (devicePropertyName.toUpperCase().includes("DEVID")){
                                      
                                      const user = getStateItem(DB_KEY.USER)
                                      const url = getBaseURL()+URLS.PATIENT_DEVICE+user.userId+'&deviceDataModelId='+deviceId+'&propertyCode='+devicePropertyCode+'&value='+macAddress.trim()
                                      let res = await executeApiWith(url, 'POST', null, header, "addSensoScreen:addDevice")
                                      console.log("url:335"+url)
                                      console.log("res:336"+res.status)
                                       let jsonResponse = await res.text()
                                      break
                                      
                                  }
                          }
                       }


                      if (deviceId.toUpperCase().includes("ID") || deviceId.toUpperCase().includes("PA") || deviceId.toUpperCase().includes("TH") || deviceId === "056ba1dd-b0e8-4bf3-9529-70fdcaa8c587" || deviceId === "296f0b26-f21f-4847-8b7d-b9ed80b860df"){


                           // check if already it exist
                        
                         const urlCheckIfExist = getBaseURL()+'data/devicedata-advanced?sortOrder=DESC&pageSize=1&pageNumber=0'
                         var deviceCriteria ;
                         var user = getStateItem(DB_KEY.USER)
                         console.log("urlCheckIfExist:"+urlCheckIfExist)


                        if (deviceId.toUpperCase().includes("ID")){
                           deviceCriteria = { "key": "Devid", "operator": "Equal","value": macAddress }
                        }
                        // else if (deviceId.toUpperCase().includes("PA")){
                        //    deviceCriteria = { "key": "DevidParams", "operator": "Equal","value": macAddress }
                        // }else if (deviceId.toUpperCase().includes("TH")){
                        // deviceCriteria = { "key": "DevidThresholds", "operator": "Equal","value": macAddress }
                        // }
                        // else if (deviceId === "056ba1dd-b0e8-4bf3-9529-70fdcaa8c587"){
                        // deviceCriteria = { "key": "DevidWi", "operator": "Equal","value": macAddress }
                        // }else if (deviceId === "296f0b26-f21f-4847-8b7d-b9ed80b860df"){
                        // deviceCriteria = { "key": "DevidPs", "operator": "Equal","value": macAddress }
                        // }

                           var raw = JSON.stringify({
                            "deviceDataModelId": deviceId,
                            "deviceCriteria": [deviceCriteria],
                            "ownerFilter": {
                              "users": [user.userId ]
                            }
                          });

                          let myHeaders = this.getHeader()

                          var requestParameter = {
                            method: 'POST',
                            headers: myHeaders,
                            body: raw,
                            redirect: 'follow'
                          };

                         //V3
                          let res = await executeApiWith(urlCheckIfExist, 'POST', raw, myHeaders, "addSensoScreen:addDevice")
                         let jsonObj = res.status === 200 ? await res.json() : null
                          console.log("urlCheckIfExist"+urlCheckIfExist)
                          console.log("deviceCriteria"+raw)
                           console.log("status"+res.status)
                         if (jsonObj !== null && jsonObj.content.length > 0) {


                            let url = getBaseURL()+URLS.DEVICE_PROPERTY_SET+deviceId
                            console.log("url:396:"+url)
                            //V3
                            let res2 = await executeApiWith(url, 'GET', null, header, "addSensoScreen:addDevice")
                            console.log("url:res2:349:"+res2.status)
                            

                            let jsonResponse2 = await res2.json()

                            let jsonResponse = jsonObj
                            let  dataToPut ;
                            if (deviceId.toUpperCase().includes("ID")){
                              dataToPut = { "Active": "Yes", "TimestampI": moment.utc().format(), "FriendlyName":friendlyName, "Location":location,"Timezone": this.state.selectedTimezone, "DaylightSavings": this.state.dayLightSavingEnabled === true ? 1: 0 , "NotificationType": "push"}
                           }else if (deviceId.toUpperCase().includes("PA")){
                            dataToPut = { "TimestampP":  moment.utc().format() , "FriendlyNamePa":friendlyName,"NightMode":"Yes","NightModeStart":"00:00:00","NightModeEnd":"00:00:00","Ltemode":"Yes","Lteinterval":60}
                           }else if (deviceId.toUpperCase().includes("TH")){
                              dataToPut ={ "TimestampT":  moment.utc().format(), "FriendlyNamePa":friendlyName }
                           }else if (deviceId === "056ba1dd-b0e8-4bf3-9529-70fdcaa8c587"){
                            dataToPut ={ "TimestampWi":  moment.utc().format(), "FriendlyNameWi":friendlyName, "Ssid":this.state.wifiSSIDName, "Pw":this.state.password }
                            }else if (deviceId === "296f0b26-f21f-4847-8b7d-b9ed80b860df"){
                              dataToPut ={ "TimestampPs":  moment.utc().format(), "FriendlyNamePs":friendlyName, "RrAvg":0, "RrMax":0, "RrMin":0,"HrMin":0, "HrAvg": 0, "HrMax":0}
                            }
                
                            let body = {"deviceDataModelId":deviceId, "deviceDataId":jsonResponse.content[0].deviceDataId,"data":dataToPut, "devicePropertySetId":jsonResponse2.content[0].devicePropertySetId}
                           
                            console.log("body"+JSON.stringify(body))
                             var requestOptionsPost = {
                              method: 'POST',
                              headers: header,
                              body : JSON.stringify(body)
                               };
                          //V3
                            let deviceDataUrl = getBaseURL()+'data/devicedata'
                            let resDeviceData = await executeApiWith(deviceDataUrl, 'POST', JSON.stringify(body), header, "addSensoScreen:addDevice")
                            let jsonResponseDeviceData = await resDeviceData.text()

                          }else{
                            let url = getBaseURL()+URLS.DEVICE_PROPERTY_SET+deviceId
                            console.log("url22"+url)
                           let res = await executeApiWith(url, 'GET', null, header, "addSensoScreen:addDevice")
         
                            //V3
                            let jsonResponse = await res.json()
                           // console.log("jsonResponse22"+jsonResponse)
                            let data;

                            if (deviceId.toUpperCase().includes("ID")){
                              data = {"Devid":macAddress, "FriendlyName":friendlyName, "Location":location, "Model":this.state.manufacturer, "Devsn":this.state.serialNumber,"TimestampI":moment.utc().format(),"FindMySensor":"No","Active":"Yes","Timezone": this.state.selectedTimezone, "DaylightSavings": this.state.dayLightSavingEnabled === true ? 1: 0, "NotificationType": "push" }
                            }else if (deviceId.toUpperCase().includes("PA")){
                               data = {"BpfSelect":BpfSelect, "OfflineTimeout":OfflineTimeout, "DevidParams":macAddress, "FriendlyNamePa":friendlyName, "GainSelect":GainSelect, "ParamsLastupdate":moment.utc().format(),"TimestampP":moment.utc().format(),"NightMode":"No"}
                             }else if (deviceId.toUpperCase().includes("TH")){
                               data = {"AlertMaxhr":0, "AlertMaxmt":0, "AlertMaxrr":0, "AlertMaxst":0, "AlertMinhr":0,"AlertMinmt":0, "AlertMinrr":0, "AlertMinst":0, "DevidThresholds":macAddress, "FriendlyNameT":friendlyName,"TimestampT":moment.utc().format()}
                             }
                             else if (deviceId === "056ba1dd-b0e8-4bf3-9529-70fdcaa8c587"){
                              data ={ "DevidWi":macAddress,"TimestampWi":  moment.utc().format(), "FriendlyNameWi":friendlyName, "Ssid":"Ssid", "Pw":"Pw" }
                              }else if (deviceId === "296f0b26-f21f-4847-8b7d-b9ed80b860df"){
                                data ={ "DevidPs": macAddress,"TimestampPs":  moment.utc().format(), "FriendlyNamePs":friendlyName, "RrAvg":0, "RrMax":0, "RrMin":0,"HrMin":0, "HrAvg": 0, "HrMax":0}
                              }
                  


                             let body = {"deviceDataModelId":deviceId, "data":data, "devicePropertySetId":jsonResponse.content[0].devicePropertySetId}
                             

                             var requestOptionsPost = {
                               method: 'POST',
                               headers: header,
                               body : JSON.stringify(body)
                             };
                           //V3
                           console.log("body22"+JSON.stringify(body))
                             let deviceDataUrl = getBaseURL()+'data/devicedata'
                            let resDeviceData = await executeApiWith(deviceDataUrl, 'POST', JSON.stringify(body), header, "addSensoScreen:addDevice")
         
                             let jsonResponseDeviceData = await resDeviceData.text()


                          }

                       }


                  }
                  else {
                      continue
                  }

               }
         await getSensors(true)
         this.setState({loading:false})
              SensorDataChange.emit('SENSOR_DATA_CHANGED')

              if (this.state.isFromResident){
                SensorAddedForResident.emit('SENSOR__FOR_RESIDENT')
              }


             
              Alert.alert(
                "Success",
                "Sensor added successfully.",
                [
                 { text: "Ok", onPress: () => this.navigateToMainPage()},
                ],
                { cancelable: false }
              );
      }
     }else{
      this.setState({loading: false})
     }
}

async writeDataOnCloude(body, caller) {
  const promiseWriteDataTimeout = new Promise((resolve) => (setTimeout(() => resolve(false),  API_TIMEOUT.INTERVAL)))
  const res = await Promise.race([promiseWriteDataTimeout,writeData(body, caller)])
  if (!res) {
      this.setState({loading:false})
     // alert("API Delayed response for "+caller);
      return
  }
}


validateWiFi(){


      let access_point = Platform.OS === 'ios' ? 'Cardio_'+this.state.macAddress.replaceAll(':','') : 'Cardio_'+this.state.macAddress.replace(/:/g, '')

      //Please re-try and reconnect Wifi to Cardio_C4---54
      Alert.alert(
        "Confirmation",
        "Please make sure you are connected to Wifi : "+access_point,
        [
         { text: "Yes", onPress: () =>this.connectToSensor()},
         { text: "No"}
        ],
        { cancelable: false }
      );



    }

     isValidStringData(str) {
      return /[`~!@#%\^&*()={}\[\]\|\\:;"'?\/>.<,]/.test(str);
    }

    connectToSensor(){
      
 const {wifiSSIDName, password, friendlyName,location, selectedTimezone} = this.state

     

        if (wifiSSIDName.length === 0){
            alert('Please enter wifi ssid name.')
            return
        }else if (password.length === 0){
            alert('Please enter wifi password.')
            return
        }
        else if (friendlyName.length === 0){
            alert('Please enter Friendly Name')
            return
        }
        else if (location.length === 0){
            alert('Please enter location')
            return
        }
        else if (this.isValidStringData(friendlyName)){
          alert('Friendly Name contains invalid charecter')
          return
      }
      else if (this.isValidStringData(location)){
        alert('Location contains invalid charecter')
        return
    }else if (selectedTimezone === 'Select Timezone'){
      alert('Please select the timezone')
      return
  }

      
         if (Platform.OS === 'ios'){
            const option = {"wiFiSSIDName": this.state.wifiSSIDName,"wiFiSSIDPassword": this.state.password}
             const socket = NativeModules.Socket
             this.setState({showDialog:true})
             socket.createConnect(option,(callback)=>{
                this.setState({showDialog:false})
           
                if (callback.includes('Paired')){
                     this.showConfirmationAlert()
                          // hit the apis
                      }else{
                          alert(callback)
                        this.setState({loading:false})
                        
                      }
             })
         }else{

          if (Platform.OS === 'android'){
            const ipAddress = "192.168.10.1"
            const portAddress = 54709
  
            let TCP = require('react-native-tcp')
  
  
            let client = TCP.createConnection(portAddress, ipAddress, function() {
            let command = '1:1.0\r\n2:'+wifiSSIDName+'\r\n3:'+password+'\r\n0\r\n';
            client.write(command)
           });
  
           client.on('error', function(error) {
            let newclient = TCP.createConnection(portAddress, ipAddress, function() {
              let ackCommand = 'ACK\r\n0\r\n';
              newclient.write(ackCommand)
             });
          });
          
          client.on('data', (data)=>{
            if(data.toString().includes('OK')){
                let ackCommand = 'ACK\r\n0\r\n';
                client.write(ackCommand)
  
                this.showConfirmationAlert()
             }
          })
          }
        

      }
    }



    connect(){
        // do the validation

     // this.showConfirmationAlert()
     // this.
        this.validateWiFi()

       //  this.handleYesTapped()




       
    }

   

    _renderDailog(){
        const {themeChanged,loading, apiExecutionTime} = this.state
        const color =  themeChanged ? 'rgba(27,26,29,1.0)':'rgba(249,249,249,1.0)'
        const bgColor =  'rgba(141,141,141,1.0)'


        const macAddress = this.state.macAddress
        let access_point ;
        if(Platform.OS === 'ios'){
           access_point = 'Cardio_'+macAddress.replaceAll(':','')
        }else{
          access_point = 'Cardio_'+macAddress.replace(/:/g, '')
        }
       
        let cancelMessage = 'If the sensor doesn\'t connect in 2 minutes, press Cancel, then connect to '+ access_point+ ' and press connect'
        
        let message = loading?'Configuring with cloud...':'Connecting with Sensor...'
        const apiResponseMessage = 'API Execution time: '+apiExecutionTime
        
        if (this.state.showDialog || this.state.loading){
            return(
                <View style={{width,height,backgroundColor:'rgba(31,31,31,0.4)',position:'absolute',alignItems:'center',justifyContent:'center'}}>
                     {message == 'Connecting with Sensor...'&&<View style={{alignItems:'center',justifyContent:'center'}}>
                     <Text  allowFontScaling={false} style= {[styles.secondaryText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(223,223,223,1.0)',marginTop:height*0.01, width:width*0.94,marginLeft:0,fontWeight:'bold',backgroundColor:'rgba(31,31,31,0.5)',fontSize:height*0.020,marginTop:-height*0.15}]}>{cancelMessage}</Text>
</View>}

                     <View style={{padding:10,backgroundColor:bgColor,borderRadius:12}}>
                    <ActivityIndicator size={'large'} color={color} />
                    <Text  allowFontScaling={false} style= {[styles.secondaryText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(31,31,31,1.0)',marginTop:height*0.01}]}>{message}</Text>
                    </View>


                    {message == 'Connecting with Sensor...'&&<View style={{alignItems:'center',justifyContent:'center'}}>
                    <TouchableOpacity style={{width:width*0.50,height:40,borderColor:'gray',borderWidth:1,borderRadius:8,marginTop:20,backgroundColor:'rgba(31,31,31,0.6)',justifyContent:'center',alignItems:'center'}} onPress={()=> this.setState({showDialog:false})}>
                        <Text  allowFontScaling={false} style={{color:'rgba(223,223,223,1.0)',fontSize:22,fontWeight:'bold'}}>Cancel</Text>
                    </TouchableOpacity>
                    </View>}

                    {message == 'Configuring with cloud...' && <View style={{ marginTop: 10}}>
                    <Text  allowFontScaling={false} style= {[styles.secondaryText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(31,31,31,1.0)',marginTop:height*0.01, fontWeight: 'bold'}]}>{apiResponseMessage}</Text>
                    </View>}
    
                    
                </View>
            )
        }
    }


    timezoneSelected(item){
      
    }

    _setUpResponseTimeInterval() {
      this.callInterval()
              
         
    }

    callInterval() {
      const {apiExecutionTime} = this.state
      let timeInterval =  1000  
      var counter = 0
      this._intervalApiExecutionTime = setInterval(() => {
        if (counter < 30){
          counter += 1
          this.setState({apiExecutionTime: counter})
        }
        else {
          clearInterval(this._intervalApiExecutionTime)
          this.setState({loading: false})
          alert('API seems to be not responding. Please try again...')
        }
       
       
      }, timeInterval);
    }

    _clearResponseTimeInterval() {
      clearInterval(this._intervalApiExecutionTime)
    }

    enableDayLight(value){
      const {dayLightSavingEnabled} = this.state;
      if (dayLightSavingEnabled !== value){
       this.setState({dayLightSavingEnabled: value})
   
      }
     }

       getCurrentTime() {
         const now = new Date();
     
         let hours = now.getHours();
         const minutes = String(now.getMinutes()).padStart(2, '0');
         const seconds = String(now.getSeconds()).padStart(2, '0');
     
         const ampm = hours >= 12 ? 'pm' : 'am';
     
         hours = hours % 12;
         hours = hours || 12;
     
         return `${String(hours).padStart(2, '0')}:${minutes}:${seconds} ${ampm}`;
     }

     getTheTimezone() {
        if (TIMEZONE.length > 0) {
          const timeZone = RNLocalize.getTimeZone();
        let filteredTimezone = TIMEZONE.filter((subContent)=> subContent.utc.includes(timeZone))
          if (filteredTimezone.length > 0) {
            let selectedTimezone = filteredTimezone[0].value
            this.setState({selectedTimezone: selectedTimezone})
          }
           
        }
     }

     _showTempLogger(){
      const {showTempLogger, macAddress} = this.state;
      const user = getStateItem(DB_KEY.USER)
      console.log("user.userId: "+user.userId)
      if (showTempLogger){
        return(
          <View style={{position: 'absolute', width: width, height: height}}>
                 <TempLogger onClose={()=> this.setState({showTempLogger:false})} macAddress={macAddress} userId={user.userId}/>
          </View>
        )
      }
    }

 
    render(){
        const {themeChanged,passwordEyeOn,dayLightSavingEnabled, selectedTimezone} = this.state;
        let data = [{label: 'Select Timezone', value: 'Select Timezone'}];
        
        for (var index = 0; index < TIMEZONE.length - 1; index++) {
          let dataDict = {
            label: TIMEZONE[index].value,
            value:TIMEZONE[index].value,
          };
          data.push(dataDict);
        }
      
        return(
          <KeyboardAwareScrollView
              style={[styles.container, { backgroundColor: themeChanged ? 'rgba(27,26,29,1.0)' : 'rgba(249,249,249,1.0)' }]}
              resetScrollToCoords={{ x: 0, y: 0 }}
              enableOnAndroid={true}
              // FIX: Use flexGrow instead of blindly applying styles.container if it contains flex: 1
              contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }} 
              enableAutomaticScroll={true}
              extraHeight={height * 0.25}
              extraScrollHeight={height * 0.25}
            >
             <TopHeader leftTitle={'Connect to Local WiFi'} isDarkMode = {themeChanged} onLeftIconPress={()=> this.back()} macAddress={''}/>

             <Toast ref={(toast) => this.toast = toast}/>

               <View style={{flexDirection:'row'}}>
               <Text allowFontScaling={false} style= {[styles.secondaryText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)',marginTop:height*0.02}]}>WiFi SSID For Sensor</Text>
               <Text allowFontScaling={false} style= {[styles.secondaryText, {color : 'red',marginTop:height*0.044, marginLeft:1, fontSize:width*0.03,marginTop:height*0.022}]}> (MUST BE A 2.5G NETWORK )</Text>
                         
               </View>
               <View style={[styles.textContainer, styles.layout]}> 
                            <TextInput
                            allowFontScaling={false}
                            style={[styles.textField,{color:themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)'}]}  
                            onSubmitEditing={() => { this.passwordTextInput.focus(); }}
                            returnKeyType = {'next'}
                            keyboardType = {'default'}
                            selectionColor={'black'}
                            underlineColorAndroid = {'transparent'}
                            placeholder = "Enter WiFi SSID For Sensor"
                            placeholderTextColor = "rgba(189,189,189,1.0)"
                            autoCapitalize = "none"
                            onChangeText={(wifiSSIDName) => this.setState({wifiSSIDName})}
                            value={this.state.wifiSSIDName}
                            />
                        </View>


                <Text  allowFontScaling={false} style= {[styles.secondaryText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)',marginTop:height*0.04}]}>WiFi Password</Text>
                        <View style={[styles.textContainer, styles.layout]}> 
                            <TextInput
                            allowFontScaling={false}
                            style={[styles.textField,{color:themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)'}]}  
                            ref={(input) => { this.passwordTextInput = input; }}
                            onSubmitEditing={() => { this.friendlyNameTextInput.focus(); }}
                            returnKeyType = {'next'}
                            keyboardType = {'default'}
                            selectionColor={'black'}
                            underlineColorAndroid = {'transparent'}
                            placeholder = "Enter WiFi Password"
                            placeholderTextColor = "rgba(189,189,189,1.0)"
                            autoCapitalize = "none"
                            secureTextEntry={!passwordEyeOn}
                            onChangeText={(password) => this.setState({password})}
                            value={this.state.password}
                            />
                             <TouchableOpacity style={{position:'absolute', width:30,height:30, marginLeft:width*0.88-40, marginTop:10}} onPress={()=> this.setState({passwordEyeOn:!this.state.passwordEyeOn})}><Icon name={passwordEyeOn?'eye':'eye-with-line'} color={'gray'} size={25} /></TouchableOpacity> 
                        
                        </View>  


                        <Text allowFontScaling={false} style= {[styles.secondaryText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)',marginTop:height*0.04}]}>Sensor Device Location</Text>
                        <View style={{flexDirection: 'row'}}>
                        <View style={[styles.textContainer, styles.layout, { zIndex: 1000, width: width * 0.44}]}> 
                        <DropDownPicker
                          controller={instance => (this.userDropdown = instance)}
                          items={data}
                          defaultValue={selectedTimezone}
                          containerStyle={{height: 40}}
                          dropDownMaxHeight={300}
                          labelStyle={{fontSize: 10, textAlign: 'left'}}
                          style={{backgroundColor: '#fafafa', borderWidth: 0, elevation: 0}}
                          itemStyle={{
                            justifyContent: 'flex-start',
                          }}
                          dropDownStyle={{backgroundColor: '#fafafa',borderWidth: 0, elevation: 0}}
                          onChangeItem={item => this.timezoneSelected(item)}
                        />
                        </View> 
                        
                        <View style={{flexDirection: 'row'}}>
                        <Text allowFontScaling={false} style= {[styles.errorText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)',marginTop:20}]}>    Enable DayLight:    </Text>
                     
                        <View style={{marginTop:13}}>
                           <Switch
                                  trackColor={{ false: "#767577", true: 'green' }}
                                  thumbColor={"#f4f3f4"}
                                  ios_backgroundColor="#3e3e3e"
                                  onValueChange={(value)=> this.enableDayLight(value)}
                                  value={dayLightSavingEnabled}
                                />
                                 </View>
                        </View>
                        </View>
                  


                <Text allowFontScaling={false} style= {[styles.secondaryText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)',marginTop:height*0.04}]}>Sensor Friendly Name</Text>
                        <View style={[styles.textContainer, styles.layout]}> 
                            <TextInput
                            allowFontScaling={false}
                            style={[styles.textField,{color:themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)'}]}  
                            ref={(input) => { this.friendlyNameTextInput = input; }}
                            onSubmitEditing={() => { this.lastNameTextInput.focus(); }}
                            returnKeyType = {'next'}
                            keyboardType = {'default'}
                            selectionColor={'black'}
                            underlineColorAndroid = {'transparent'}
                            maxLength = {14}
                            placeholder = "Enter Sensor Friendly Name"
                            placeholderTextColor = "rgba(189,189,189,1.0)"
                            autoCapitalize = "none"
                            secureTextEntry={false}
                            onChangeText={(friendlyName) => this.setState({friendlyName})}
                            value={this.state.friendlyName}
                            />
                           
                        </View>   
                   <Text allowFontScaling={false} style= {[styles.errorText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)',marginTop:3}]}>Sensor Friendly Name can have max 14 Characters</Text>
                                   

                    
                <Text allowFontScaling={false} style= {[styles.secondaryText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)',marginTop:height*0.04}]}>Sensor Device Location</Text>
                        <View style={[styles.textContainer, styles.layout]}> 
                            <TextInput
                            allowFontScaling={false}
                            style={[styles.textField,{color:themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)'}]}  
                            ref={(input) => { this.lastNameTextInput = input; }}
                            returnKeyType = {'done'}
                            keyboardType = {'default'}
                            selectionColor={'black'}
                            underlineColorAndroid = {'transparent'}
                            placeholder = "Enter Sensor Location"
                            maxLength = {14}
                            placeholderTextColor = "rgba(189,189,189,1.0)"
                            autoCapitalize = "none"
                            multiline={false}
                            onChangeText={(location) => this.setState({location})}
                            value={this.state.location}
                            />
                        </View> 
                        <Text allowFontScaling={false} style= {[styles.errorText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)',marginTop:3}]}>Sensor Device Location can have max 14 Characters</Text>
                     
                  
                        
            <ButtonK title={'Connect'} style={styles.signInButton} onPress={()=> this.connect()} titleColor={'white'} titleFont={20} titleWeight={'bold'} />
           
            
             {this._renderDailog()}  
             {this._showTempLogger()} 
            </KeyboardAwareScrollView>   

            
        )
    }
}