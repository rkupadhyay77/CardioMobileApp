import React, { Component , createRef} from 'react';
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Switch,
  Alert
 } from 'react-native';

const {width, height} = Dimensions.get('window')

import getStateItem from '../../state/getStateItem'
import {executeApiWith} from '../../api'
import {DB_KEY, RESPONSE_MESSAGE} from '../../common/helper/keys'
import TopHeader from '../../common/component/topHeader'
import URLS from '../../common/helper/urls'
import styles from './styles'
import Loader from '../../common/component/loader'
 import HEADER from '../../common/helper/constants'
 import moment from 'moment'
import {NightModeModified,TimezoneModified} from '../../state/emitters'
import TIMEZONE from '../../common/helper/timezone'
import {checkGenericYesType } from '../../common/helper/util'
import getHeaders from '../../../galenApiLibrary/config/getHeader';
import { getLastDataForDevHealth, getDevicePropertySet, writeData} from '../../../galenApiLibrary/setting/sensor'
import { writeEnableReports } from '../../../galenApiLibrary/setting/sensor';
import { getBaseURL } from '../../../galenApiLibrary/config/getBaseURL';

export default class FirmwareScreen extends Component{
    constructor(props){
        super(props)
        this.nightModeModified = this.nightModeModified.bind(this)
        this.timezoneModified = this.timezoneModified.bind(this)
        this.showAlertEnableAlerts = this.showAlertEnableAlerts.bind(this)
        this.state = {themeChanged:getStateItem(DB_KEY.IS_DARK_MODE), loading:false, item:props.navigation.state.params.item, latestVersion:'NA', currentVersion:'NA', hardwareVersion:'NA',pVitalsData:null, identityData:null, timezoneIdentity:'',buttonLabel:'Restart',enableAlerts:false, notificationType:'',timeZoneStr:'America/Chicago',reload:true, isEnabled: true}
    }


    getTimeZone(timeZoneStr){
        let filtered =  TIMEZONE.filter((timezone)=>{
            return timezone.value === timeZoneStr
         })
    
         if (filtered.length > 0) {
             return filtered[0].utc[0]
         }
    
         return ''
     }

     defaultTimeZone(){
        this.setState({timeZoneStr:'America/Chicago'})
      }

      getTimezoneData(){
        // this.state.item.data.Devid.value.trim()
        let allResident = getStateItem(DB_KEY.RESIDENT_DATA)
        let filtered = allResident.filter((resident)=> resident.data.Devid.value === this.state.item.data.Devid.value.trim())
         var currentTimeZonStr = 'America/Chicago'
         if (filtered.length > 0){
             let  resident = filtered[0]
              if (resident.data !== undefined && resident.data !== null && resident.data.Timezone !== undefined && resident.data.Timezone !== null ){
                 let timezone =  resident.data.Timezone.value
                 let abr = this.getTimeZoneAbr(timezone)
                 if (abr !== ''){
                     if (abr == 'CDT'){
                     }else{
                       let tz = this.getTimeZone(timezone)
                       currentTimeZonStr = tz
                      }
               }
              }
 
         }
 
         return currentTimeZonStr
      }


    componentDidMount(){
// hit the api and get the detail and display it on the UI
      //  alert(JSON.stringify(getStateItem(DB_KEY.USER)))
      NightModeModified.addNightModeModified(this.nightModeModified)
      TimezoneModified.addTimezoneModified(this.timezoneModified)

      this.getParamsData()
      this.getIdentityData()
     }

    componentWillUnmount(){
       // NightModeModified.removeNightModeModified(this.nightModeModified)
    }
    timezoneModified(){
        console.log('timezoneModified Called')
        this.getIdentityData()
    }

    nightModeModified(){
        //console.log('nightModeModified Called')
        this.getParamsData()
    }

    nightModeTapped(){
        this.props.navigation.navigate('NightModeScreen',{ item:this.state.item, data: this.state.pVitalsData})
    }

    notificationTapped(){
        this.props.navigation.navigate('NotificationScreen',{identityData:this.state.identityData,data: this.state.item})
   
    }


    async getIdentityData(){
        
      
        var myHeaders = this.getHeader()
        let user = getStateItem(DB_KEY.USER)
        let userId = user.userId
    
        var raw = JSON.stringify({
            "deviceDataModelId": "d36a4373-fbdc-44a3-8c96-4bb920041e40-id",
            "deviceCriteria": [
              {
                "key": "Devid",
                "operator": "Equal",
                "value": this.state.item.data.Devid.value.trim()
              }
            ]
          });

          var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
          };
//V3      
//console.log("RKDebug:getIdentityData:body: "+raw)
let url1 = getBaseURL() + "data/devicedata-advanced?sortBy=data.TimestampI.value&sortOrder=DESC&pageSize=1"
let response = await executeApiWith(url1, 'POST', raw, myHeaders, "FirmwareScreen:getIdentityData")

if (response.status === 200) {
    let result = await response.json()
    this.setIdentityData(result)
}
 }

     async getParamsData(){
        var myHeaders = this.getHeader()
        let user = getStateItem(DB_KEY.USER)
        let userId = user.userId
    
       

        var raw = JSON.stringify({
            "deviceDataModelId": "d36a4373-fbdc-44a3-8c96-4bb920041e40-pa",
            "deviceCriteria": [
              {
                "key": "DevidParams",
                "operator": "Equal",
                "value": this.state.item.data.Devid.value.trim()
              }
            ]
          });

          var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
          };

          
          let url1 = getBaseURL() + "data/devicedata-advanced?pageSize=1&pageNumber=0"
            let response = await executeApiWith(url1, 'POST', raw, myHeaders, "FirmwareScreen:getParamsData")
            if (response.status === 200) {
                let result = await response.json()
                this.setPVitalsData(result)
            }
     }

    setPVitalsData(result){
         if(result.content !== undefined && result.content !== null && result.content.length > 0){
             this.setState({pVitalsData:result.content[0]})
         } 
    }

    setIdentityData(result){
        if(result.content !== undefined && result.content !== null && result.content.length > 0){
            this.setState({identityData:result.content[0]})
            var timeZoneStr = 'CST'
        if (result.content[0] !== null && result.content[0].data !== undefined && result.content[0].data !== null){
            var isDaylightSavingsEnabled = true
            isDaylightSavingsEnabled = result.content[0].data?.DaylightSavings?.value === "Yes" ? true : false ?? true
            if (result.content[0].data.EnableAlerts !== undefined && result.content[0].data.EnableAlerts !== null ){
               
   
                let EnableAlerts = checkGenericYesType(result.content[0].data.EnableAlerts.value) ? true : false
                var enableNotification = ""
                //EnableNotifications
                if (result.content[0].data.NotificationType !== null && result.content[0].data.NotificationType !== undefined) {
                    enableNotification = result.content[0].data.NotificationType.value
                }
                this.setState({enableAlerts:EnableAlerts, notificationType:  enableNotification})
            }
  
            if (result.content[0].data.Timezone !== undefined && result.content[0].data.Timezone !== null ){
                
                timeZoneStr = result.content[0].data.Timezone.value
                timeZoneStr = result.content[0].data.Timezone.value
               
               this.setState({timezoneIdentity:timeZoneStr, isDaylightSavingsEnabled:isDaylightSavingsEnabled})
               this.modifyLocalResident(result.content[0].data.Devid.value, timeZoneStr)
    
            }
        }
        } 
   }


   modifyLocalResident(macAddress, timezone){
       let residents = getStateItem(DB_KEY.RESIDENT_DATA)
       for (var index = 0 ; index < residents.length ; index++){
           let resident = residents[index]

           if (resident.data.Devid.value === macAddress){
            resident.data.Timezone.value = timezone
            break
           }
       }

   }


    async apiGetCurrentVersion(){
        const macAddress = this.state.item.data.Devid.value.trim()

        const resGetLastDataFromGevHealth = await getLastDataForDevHealth(macAddress)
         
        if (resGetLastDataFromGevHealth.status === 200) {
            let result = await resGetLastDataFromGevHealth.json()
            this.getCurrentVersion(result)
        }
}

    async getDisplayData(){
var myHeaders = this.getHeader()
var requestOptions = {
  method: 'GET',
  headers: myHeaders,
  redirect: 'follow'
};
//V3

    let url1 = getBaseURL()+"user/firmware?deviceId=d36a4373-fbdc-44a3-8c96-4bb920041e40&pageNumber=0&pageSize=20&sortBy=versionNumber&sortOrder=ASC"
    let response = await executeApiWith(url1, 'GET', null, myHeaders, "FirmwareScreen:getDisplayData")
    if (response.status === 200) {
        let result = await response.json()
        this.getLatestVersion(result)
    }
 }


    getLatestVersion(response){
          if (response.content !== undefined && response.content !== null && response.content.length > 0){
            const lastObject = response.content[response.content.length - 1]

            let latestVersionStr = lastObject.displayVersion
            this.setState({latestVersion:latestVersionStr})
        }
    }

    getCurrentVersion(response){
        
        if (response.content !== undefined && response.content !== null && response.content.length > 0){
          const lastObject = response.content[0]

          let currentVersionStr = lastObject.data.Fwvers ? lastObject.data.Fwvers.value : 'NA'
          let hardwareVersionStr = lastObject.data.Hwvers ? lastObject.data.Hwvers.value : 'NA'
          this.setState({currentVersion:currentVersionStr,hardwareVersion:hardwareVersionStr})
      }else{
        this.setState({currentVersion:'NA',hardwareVersion:'NA'})
      }
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



    back(){
        this.props.navigation.goBack()
    }


    


  

    _renderLoader() {
        const {loading} = this.state
    
        if (loading) {
            return (<Loader />)
        }else{
            return (<View />)
        }
    }

    _renderFriendlyName(){
        const {themeChanged, item} = this.state
        let friendlyName = item.data ? item.data.FriendlyName ? item.data.FriendlyName.value :'' : ''
        return(
            <View style ={[styles.nameFieldContainer, { flexDirection:'row',borderTopWidth:1, borderTopColor:'rgba(240,240,240,1.0)',borderBottomColor:'rgba(240,240,240,1.0)',borderBottomWidth:1}]}>
                  <Text  allowFontScaling={false} style= {[styles.singInText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)', marginTop: height*0.023, marginLeft: 20}]}>Friendly Name</Text>
                  <Text  allowFontScaling={false} style= {[styles.singInText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)', marginTop: height*0.023, marginLeft: width * 0.50, width: width*0.50 - 25,textAlign:'right', position:'absolute'}]}>{friendlyName}</Text>
                
            </View>
        )
    }

    timezoneTapped(){
       //TimezoneScreen
       this.props.navigation.navigate('TimezoneScreen',{ timezone:this.state.timezoneIdentity,data: this.state.item})
   
    }


    getTimeZoneAbr(timeZoneStr){
       let filtered =  TIMEZONE.filter((timezone)=>{
           return timezone.value === timeZoneStr
        })

        if (filtered.length > 0) {
            return filtered[0].abbr
        }

        return ''
    }

    _renderTimezone(){
        const {themeChanged,identityData} = this.state
        var timeZoneStr = 'CST'
        //console.log("RKDebug:_renderTimezone:identityData:"+JSON.stringify(identityData))
        if (identityData !== null && identityData.data !== undefined && identityData.data !== null){
            if (identityData.data.Timezone !== undefined && identityData.data.Timezone !== null ){
                timeZoneStr = identityData.data.Timezone.value
            }
        }

        if (timeZoneStr !== 'CST'){
            let abbr = this.getTimeZoneAbr(timeZoneStr)
            if (abbr !== ''){
                timeZoneStr = abbr
            }
        }
        return(
            <TouchableOpacity style ={[styles.nameFieldContainer, {flexDirection:'row',borderTopWidth:1, borderTopColor:'rgba(240,240,240,1.0)'}]} onPress={()=> this.timezoneTapped()}>
                  <Text  allowFontScaling={false} style= {[styles.singInText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)', marginTop: height*0.023, marginLeft: 20}]}>Timezone</Text>
                  <Text  allowFontScaling={false} style= {[styles.singInText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)', marginTop: height*0.023, marginLeft: width * 0.50, width: width*0.50 - 25,textAlign:'right', position:'absolute'}]}>{timeZoneStr}</Text>
                
            </TouchableOpacity>
        )
    }

    getTimeInFormat(time){
        var str = "--";
        if (time !== '--'){
            
            var array = time.split(':');
            if (parseInt(array[0]) > 12){
            let diff = parseInt(array[0]) - 12
            if (diff < 10 ){
            str = "0"+ diff+ ":"+array[1]+ " pm"
            }else{
            str = array[0] - 12 + ":"+array[1]+ " pm"
            }

            }else{
            str = array[0]+ ":"+array[1]+ " am"
            }
        }
        return str
    }

    _renderNightMode(){
        const {themeChanged,pVitalsData,identityData} = this.state
        let status = 'OFF'
        let startTime = '--'
        let endTime = '--'

        var timeZoneStr = 'CST'
        if (identityData !== null && identityData.data !== undefined && identityData.data !== null){
            if (identityData.data.Timezone !== undefined && identityData.data.Timezone !== null ){
                timeZoneStr = identityData.data.Timezone.value
            }
        }

        if (timeZoneStr !== 'CST'){
            let abbr = this.getTimeZoneAbr(timeZoneStr)
            if (abbr !== ''){
                timeZoneStr = abbr
            }
        }
        if (pVitalsData !== null){
            // pVitalsData.data.NightMode.value === "Yes" ? 'ON':'OFF'
            status = pVitalsData.data.NightMode ?  checkGenericYesType(pVitalsData.data.NightMode.value) ? 'ON':'OFF' : 'OFF'
            if (status == 'ON'){
                startTime = pVitalsData.data.NightModeStart ? pVitalsData.data.NightModeStart.value :'--'
                startTime = this.getTimeInFormat(startTime)
                endTime =  pVitalsData.data.NightModeEnd ? pVitalsData.data.NightModeEnd.value :'--'
                endTime = this.getTimeInFormat(endTime)
                var momentT = require('moment-timezone');
               
                startTime = momentT.utc(startTime,'hh:mm a').tz(this.getTimezoneData()).format('hh:mm a')
                endTime = momentT.utc(endTime,'hh:mm a').tz(this.getTimezoneData()).format('hh:mm a')
            }
            
        }

        if(endTime === '--'){
            timeZoneStr=''
        }
        return(
            <TouchableOpacity style ={[styles.nameFieldContainer, { flexDirection:'row', marginTop:0, borderTopWidth:1, borderTopColor:'rgba(240,240,240,1.0)'}]} onPress = {()=> this.nightModeTapped()}>
                  <Text  allowFontScaling={false} style= {[styles.singInText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)', marginTop: height*0.023, marginLeft: 20}]}>NightMode</Text>
                 {status === 'ON' && <Text  allowFontScaling={false} style= {[styles.singInText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)', marginTop: height*0.047, marginLeft: 20,fontSize : width*0.03, position:'absolute'}]}>{startTime} - {endTime} {timeZoneStr}</Text>} 
                  
                  <Text  allowFontScaling={false} style= {[styles.singInText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)', marginTop: height*0.023, marginLeft: width * 0.50, width: width*0.50 - 25,textAlign:'right', position:'absolute'}]}>{status} </Text>
                
            </TouchableOpacity>
        )
    }

    _renderAlertThreshold(){
        const {themeChanged} = this.state
        let onText = ">On >"
        return(
            <View style ={[styles.nameFieldContainer, { flexDirection:'row', marginTop:0, borderTopWidth:1, borderTopColor:'rgba(240,240,240,1.0)'}]}>
                  <Text  allowFontScaling={false} style= {[styles.singInText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)', marginTop: height*0.023, marginLeft: 20}]}>Alert Threshold</Text>
                 
                  <Text  allowFontScaling={false} style= {[styles.singInText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)', marginTop: height*0.023, marginLeft: width * 0.50, width: width*0.50 - 25,textAlign:'right', position:'absolute'}]}>{onText}</Text>
                
            </View>
        )
    }


    _renderNotification(){
        const {themeChanged,enableAlerts,notificationType} = this.state
        let value = enableAlerts ? 'ON' : 'OFF'
        let notificationTypeStr = ''
        if (notificationType === 'Email,Push'){
            notificationTypeStr = 'Email / Push'
        }else if (notificationType === 'Email'){
            notificationTypeStr = 'Email '
        }else if (notificationType === 'Push'){
            notificationTypeStr = 'Push '
        }
        return(
            <TouchableOpacity style ={[styles.nameFieldContainer, { flexDirection:'row', marginTop:0, borderTopWidth:1, borderTopColor:'rgba(240,240,240,1.0)'}]} onPress = {()=> this.notificationTapped()}>
                  <Text  allowFontScaling={false} style= {[styles.singInText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)', marginTop: height*0.023, marginLeft: 20}]}>Notification</Text>
                  <Text  allowFontScaling={false} style= {[styles.singInText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)', marginTop: height*0.047, marginLeft: 20,fontSize : width*0.03, position:'absolute'}]}>{notificationTypeStr}</Text>
                  
                  <Text  allowFontScaling={false} style= {[styles.singInText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)', marginTop: height*0.023, marginLeft: width * 0.50, width: width*0.50 - 25,textAlign:'right', position:'absolute'}]}>{value}</Text>
                
            </TouchableOpacity>
        )
    }


    _renderRestartSensor(){
        const {themeChanged,buttonLabel} = this.state
        let backgroundColor = 'transparent'
        if (buttonLabel !== 'Restart'){
            backgroundColor = 'gray'
        }
        return(
            <View style ={[styles.nameFieldContainer, { flexDirection:'row', marginTop:0, borderTopWidth:1, borderTopColor:'rgba(240,240,240,1.0)',borderBottomColor:'rgba(240,240,240,1.0)',borderBottomWidth:1}]}>
                  <Text  allowFontScaling={false} style= {[styles.singInText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)', marginTop: height*0.023, marginLeft: 20}]}>Restart Sensor</Text>
                 <TouchableOpacity style={{width:80, height:25,borderColor:'green',borderWidth:1,borderRadius:5,justifyContent:'center',alignItems:'center',marginLeft:width - 220,marginTop:15,backgroundColor:backgroundColor}} onPress={()=> this.restartSensor()}>
                     <Text  allowFontScaling={false} style={{color:buttonLabel === 'Restart' ? 'green':'black'}}>{buttonLabel}</Text>
                 </TouchableOpacity>
            </View>
        )
    }

    _renderMfgInfo(){
        const {themeChanged,buttonLabel} = this.state
        let backgroundColor = 'transparent'
        const role = getStateItem(DB_KEY.USER).currentRole.role
        if (role.includes("Admin") || role.includes("Supplier")){
            return(
                <View style ={[styles.nameFieldContainer, { flexDirection:'row', marginTop:0, borderTopWidth:1, borderTopColor:'rgba(240,240,240,1.0)',borderBottomColor:'rgba(240,240,240,1.0)',borderBottomWidth:1}]}>
                      <Text  allowFontScaling={false} style= {[styles.singInText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)', marginTop: height*0.023, marginLeft: 20}]}>Mfg Info</Text>
                     <TouchableOpacity style={{width:80, height:25,borderColor:'green',borderWidth:1,borderRadius:5,justifyContent:'center',alignItems:'center',marginLeft:width - 175,marginTop:15,backgroundColor:backgroundColor}} onPress={()=> this.mfgInfoTapped()}>
                         <Text  allowFontScaling={false} style={{color:buttonLabel === 'Restart' ? 'green':'black'}}>Mfg Info</Text>
                     </TouchableOpacity>
                </View>
            )
        }else{
            return <View></View>
        }
        
    }

    enableReports(value){
        const {item} = this.state
        let macAddress =  item.data.Devid.value
        writeEnableReports(value, macAddress)
    }

    showAlertEnableAlerts() {
        const {item} = this.state
        let friendlyName = item.data ? item.data.FriendlyName ? item.data.FriendlyName.value :'' : ''
        alert('Please contact your service provider to modify the settings for Reporting ');
        return 
    }
    changeEnableReports(value) {
        // const {item} = this.state
        //   let friendlyName = item.data ? item.data.FriendlyName ? item.data.FriendlyName.value :'' : ''
        // alert('Please contact your service provider to modify the settings for Reporting ');
        // return
        const {item} = this.state
        this.setState({isEnabled:value})
        if (value === true) {
            let friendlyName = item.data ? item.data.FriendlyName ? item.data.FriendlyName.value :'' : ''
            this.showEnableReportsAlert(friendlyName, value);
           
        }
        else {
            this.setReportFalse()
        }
       
    }

    setReportFalse () {
        this.setState({isEnabled:false})
        this.enableReports(false)
    }

    showEnableReportsAlert(friendlyName, value) {
        Alert.alert(
            'Confirmation',
            `Are you sure ypu want to enable report feature for `+friendlyName+'?',
            [
              {
                text: 'No',
                onPress: () =>  this.setReportFalse(),
                style: 'cancel',
              },
              {text: 'Yes', onPress: () => this.enableReports(value)},
            ],
          );
    }


    async changesDaylightSavings(value){
        const { identityData} = this.state
        this.setState({isDaylightSavingsEnabled: value})
        let deviceId = "d36a4373-fbdc-44a3-8c96-4bb920041e40-id"
        const resGetDevicePropertySet = await getDevicePropertySet(deviceId)
        if (resGetDevicePropertySet.status === 200 || resGetDevicePropertySet.status === 201) {
            let jsonResponse = await resGetDevicePropertySet.json()
            let DaylightSavings = value === true ? "Yes" : "No"
            let  dataToPut = {"DaylightSavings":DaylightSavings, "TimestampI":moment.utc().format()}
                     let body = {"deviceDataModelId":deviceId, "deviceDataId":identityData.deviceDataId,"data":dataToPut, "devicePropertySetId":jsonResponse.content[0].devicePropertySetId}
                     const resWriteData = await writeData( JSON.stringify(body))
                     let jsonResponseDeviceData = await resWriteData.text()
         }
       
    }

    _renderEnableReports() {
        const {themeChanged,item, isEnabled} = this.state
        let enableReports = item.data ? item.data.EnableReports ?item.data.EnableReports.value  === "Yes" ? true : false : false : false;
         return(
                <View style ={[styles.nameFieldContainer, { flexDirection:'row', marginTop:0, borderTopWidth:1, borderTopColor:'rgba(240,240,240,1.0)',borderBottomColor:'rgba(240,240,240,1.0)',borderBottomWidth:1}]}>
                      <Text  allowFontScaling={false} style= {[styles.singInText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)', marginTop: height*0.023, marginLeft: 20}]}>Enable Reports</Text>
                      <View style={{marginLeft: '85%', top: 15,width: 50, height: 30, position: 'absolute'}}>
                      <Switch
                               trackColor={{ false: "#767577", true: 'green' }}
                               thumbColor={"#f4f3f4"}
                               ios_backgroundColor="#3e3e3e"
                               onValueChange={(value)=> this.changeEnableReports(value)}
                               value={enableReports}
                             />
                     
                              <TouchableOpacity style= {{width: 40, height: 30, position:'absolute'}} onPress={() => this.showAlertEnableAlerts() }></TouchableOpacity>
                     
                      </View>
                       
                   
                </View>
            )
    }


    _renderEnableDayLight() {
        const {themeChanged,isDaylightSavingsEnabled} = this.state
        //console.log("RKDebug:_renderTimezone:identityData:"+JSON.stringify(identityData))
       

         return(
                <View style ={[styles.nameFieldContainer, { flexDirection:'row', marginTop:0, borderTopWidth:1, borderTopColor:'rgba(240,240,240,1.0)',borderBottomColor:'rgba(240,240,240,1.0)',borderBottomWidth:1}]}>
                      <Text  allowFontScaling={false} style= {[styles.singInText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)', marginTop: height*0.023, marginLeft: 20}]}>Enable DayLight Saving</Text>
                      <View style={{marginLeft: '85%', top: 15,width: 50, height: 30, position: 'absolute'}}>
                      <Switch
                               trackColor={{ false: "#767577", true: 'green' }}
                               thumbColor={"#f4f3f4"}
                               ios_backgroundColor="#3e3e3e"
                               onValueChange={(value)=> this.changesDaylightSavings(value)}
                               value={isDaylightSavingsEnabled}
                             />
                      </View>
                       
                   
                </View>
            )
    }


    mfgInfoTapped(){
        // navigate to new screen
        this.props.navigation.navigate('MfgInfoScreen',{ pVitalsData:this.state.pVitalsData,macAddress:this.state.item.data.Devid.value.trim()})
   
        //
    }


    async restartSensor(){
       const {buttonLabel} = this.state
       if (buttonLabel === 'Pending'){
           return
       }else{
        
           this.setState({loading:true})
           let deviceId = "d36a4373-fbdc-44a3-8c96-4bb920041e40-pa"
           let deviceCriteria  = [{ "key": "DevidParams", "operator": "Equal","value": this.state.item.data.Devid.value.trim()}]
           let  bodyForDataDeviceId = {"deviceDataModelId":deviceId, "deviceCriteria":deviceCriteria}
           var requestOptionsDataDeviceId = {method: 'POST',headers: this.getHeader(),body : JSON.stringify(bodyForDataDeviceId) }
           let getDeviDataUrl = getBaseURL()+'data/devicedata-advanced?pageSize=1&pageNumber=0'
           //V3
          // console.log("RKDebug:restartSensor:getDeviDataUrl"+getDeviDataUrl+"body"+JSON.stringify(bodyForDataDeviceId))
           let resGetDeviDataUrl = await executeApiWith(getDeviDataUrl, 'POST',  JSON.stringify(bodyForDataDeviceId), this.getHeader(),"FirmwareScreen:restartSensor")
                    
           if  (resGetDeviDataUrl.status === 200){
               let jsonRes = await resGetDeviDataUrl.json()
               let deviceDataIdToSend;
                if (jsonRes.content.length > 0){
                    let content = jsonRes.content[0]
                    deviceDataIdToSend = content.deviceDataId
                }

                const resGetDevicePropertySet = await getDevicePropertySet(deviceId)
                
                let  requestOption = {
                    method: 'GET',
                    headers: this.getHeader()  
                };
                
                let jsonResponse = await resGetDevicePropertySet.json()
                let  dataToPut = {"Restart":"Yes", "TimestampP":moment.utc().format()}
                let body = {"deviceDataModelId":deviceId, "deviceDataId":deviceDataIdToSend,"data":dataToPut, "devicePropertySetId":jsonResponse.content[0].devicePropertySetId}
                const resWriteData = await writeData( JSON.stringify(body))
                let jsonResponseDeviceData = await resWriteData.text()
                this.setState({loading:false})
           }else{
            this.setState({loading:false})
           }
       }
    }

    render(){
        const {themeChanged} = this.state
      
        return(
            <View style ={[styles.container, {backgroundColor: themeChanged ?'rgba(27,26,29,1.0)':'rgba(249,249,249,1.0)'}]}>
                <TopHeader leftTitle={'Sensor Control'} isDarkMode = {themeChanged} onLeftIconPress={()=> this.back()} macAddress={''}/>
                  {this._renderFriendlyName()}
                  {this._renderTimezone()}
                  {this._renderEnableDayLight()}
                  {this._renderNightMode()}
                {this._renderNotification()}
                {this._renderEnableReports()}
                  {this._renderRestartSensor()}
                {this._renderMfgInfo()}
                  {this._renderLoader()}
           
            </View>
        );
    }
}

//  {this._renderAlertThreshold()}
//{this._renderNotification()}