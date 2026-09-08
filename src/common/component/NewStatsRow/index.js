import React, { Component } from 'react'
import { View, Dimensions, Image, Text , ActivityIndicator, TouchableOpacity} from 'react-native'
import styles from './styles'
import Icon from 'react-native-vector-icons/FontAwesome5'
import HEADER from '../../helper/constants'
import getStateItem from '../../../state/getStateItem'
import URLS from '../../helper/urls'
import { DB_KEY } from '../../helper/keys'
import TIMEZONE from '../../helper/timezone'
import {writeData,getDevicePropertySet} from '../../../api'
import { API_TIMEOUT } from '../../helper/util';
import getHeaders from '../../../../galenApiLibrary/config/getHeader'

const {width, height} = Dimensions.get('window')

export default class NewStatsRow extends Component {
    constructor(props){
         super(props)

         this.state = {isAlertHR:false, isAlertRR:false, isLoadingHR:false, isLoadingRR:false}
    }

    _renderLogo(){
        const {isDarkMode,data, ...props} = this.props
        return(
            <View style={{width:width*0.8, height:null,position:'absolute',justifyContent:'center',alignItems:'center'}}>
                       <Image source={isDarkMode? require('../../../img/cardioLogoWhite.png'):require('../../../img/cardioLogo.png')} style={{width:100,height:35, marginTop:10}} resizeMode={'contain'}/>
                    </View>
        )
    }

    _renderName(){
        const {isDarkMode,data, ...props} = this.props
        const friendlyName  = data.data?data.data.FriendlyName?data.data.FriendlyName.value:'':''
        const locationName  = data.data?data.data.Location?data.data.Location.value:'':''
        const showLocation =  locationName === ''?'': '('+locationName+')'
        return(
            <View style={{flexDirection:'row',width:width*0.8,justifyContent:'center',alignItems:'center', marginTop:30 }}>
             <Text  allowFontScaling={false} style={[styles.statsText,{fontSize:height*0.02, marginLeft: width*0.02,color:isDarkMode?'rgba(216,216,217,1.0)':'rgba(89,89,89,1.0)', fontWeight:'bold'}]}>{friendlyName}</Text>
              {showLocation.length > 0 && <Text  allowFontScaling={false} style={[styles.statsText,{fontSize:height*0.016, marginLeft: width*0.02,color:'rgba(138,138,138,1.0)'}]}>{showLocation}</Text>}
             </View>
        )
    }

    _renderStats(){
        return(
            <View style={{flex:1}}>
                 {this._renderHeartRate()}
                 {this._renderRespiratoryRate()}
            </View>
        )
    }

    getHeaders(){
        var myHeaders = new Headers();
        myHeaders.append("X-APP-TYPE", HEADER.APP_TYPE);
        myHeaders.append("X-TENANT-DOMAIN", HEADER.TENANT_DOMAIN);
        myHeaders.append("X-API-VERSION",HEADER.API_VERSION);
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Authorization", getStateItem(DB_KEY.ACCESS_TOKEN));

        return getHeaders()
     }

    async onPressAlertHr(data){

        this.setState({isLoadingHR:true})
        // get the device devicePropertySetId first
        const promiseGetDevicePropertySetTimeout = new Promise((resolve) => (setTimeout(() => resolve(false),  API_TIMEOUT.INTERVAL)))
        const alerts_Device_Id = 'd36a4373-fbdc-44a3-8c96-4bb920041e40-as'
        const res = await Promise.race([promiseGetDevicePropertySetTimeout,getDevicePropertySet(alerts_Device_Id,  "NewStatsRow:onPressAlertHr")])
        if (!res) {
            this.setState({isAlertHR:false})
            alert("API Delayed response for NewStatsRow:onPressAlertHr:74")
            return
        }
     
        if (res.status === 200) {
              let json = await res.json()
              
              let content = json.content

              if (content.length > 0){
                  let devicePropertySetId = content[0].devicePropertySetId
 // now we have this
                 let raw = JSON.stringify({"deviceDataModelId":"d36a4373-fbdc-44a3-8c96-4bb920041e40-as", "data":{"AlertFlag":0}, "deviceDataId":
                  data.deviceDataId,"devicePropertySetId":"192be2fb-e680-40d0-90cf-660e7baa6735"})
                  const promiseWriteDataTimeout = new Promise((resolve) => (setTimeout(() => resolve(false),  API_TIMEOUT.INTERVAL)))
                  const resWriteData = await Promise.race([promiseWriteDataTimeout,writeData( raw, "NewStatsRow:onPressAlertRr")])
                  if (!resWriteData) {
                    alert("API Delayed response for NewStatsRow:onPressAlertRr");
                    return
                  }
                   this.setState({isAlertHR:false})
            }
        }

        this.setState({isLoadingHR:false})
    } 
    
    async onPressAlertRr(data){
        this.setState({isLoadingRR:true})
        const promiseGetDevicePropertySetTimeout = new Promise((resolve) => (setTimeout(() => resolve(false),  API_TIMEOUT.INTERVAL)))
        const alerts_Device_Id = 'd36a4373-fbdc-44a3-8c96-4bb920041e40-as'
        const res = await Promise.race([promiseGetDevicePropertySetTimeout,getDevicePropertySet(alerts_Device_Id,  "NewStatsRow:onPressAlertRr")])
        if (!res) {
            this.setState({isLoadingRR:false})
            alert("API Delayed response for NewStatsRow:onPressAlertRr")
            return
        }
       
        if (res.status === 200) {
              let json = await res.json()
              let content = json.content

              if (content.length > 0){
                  let devicePropertySetId = content[0].devicePropertySetId

                  // now we have this
                  let raw = JSON.stringify({"deviceDataModelId":"d36a4373-fbdc-44a3-8c96-4bb920041e40-as", "data":{"AlertFlag":0}, "deviceDataId":
                  data.deviceDataId,"devicePropertySetId":"192be2fb-e680-40d0-90cf-660e7baa6735"})

                  const promiseWriteDataTimeout = new Promise((resolve) => (setTimeout(() => resolve(false),  API_TIMEOUT.INTERVAL)))
                  const resWriteData = await Promise.race([promiseWriteDataTimeout,writeData( raw, "NewStatsRow:onPressAlertRr")])
                  if (!resWriteData) {
                    alert("API Delayed response for NewStatsRow:onPressAlertRr");
                    return
                  }
                this.setState({isLoadingRR:false})
            }
        }
        this.setState({isLoadingRR:false})
       
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
  
     getTimeZone(timeZoneStr){
      let filtered =  TIMEZONE.filter((timezone)=>{
          return timezone.value === timeZoneStr
       })
  
       if (filtered.length > 0) {
           return filtered[0].utc[0]
       }
  
       return ''
   }



    _renderHeartRate(){
        const {isDarkMode,data,alertsArray,isOccupied, ...props} = this.props
        const {isLoadingHR} = this.state
        let heartRate = '--'
          if (data !== null && data !==undefined){
                    if (data.data !== null && data.data !== undefined){
                        heartRate = data.data.Hr?Math.round(data.data.Hr.value):'--'
                     }
            } 

            var showAlert = false
            var message = ""
            let filtered ; 
            var color = 'green'
            var currentTimeZonStr = 'America/Chicago'
            var abbr = 'CST'
            if (data.data !== undefined && data.data !== null && data.data.Timezone !== undefined && data.data.Timezone !== null ){
                let timezone =  data.data.Timezone.value
                let abr = this.getTimeZoneAbr(timezone)
                if (abr !== ''){
                    if (abr == 'CDT'){
                        abbr = abr
                    }else{
                        let tz = this.getTimeZone(timezone)
                        currentTimeZonStr = tz
                        abbr = abr
                    }
                }
                
           

            }



            if (alertsArray.length > 0 ){
                 filtered = alertsArray.filter((data)=> data.data.AlertType.value === "Heart Rate"  && data.data.AlertFlag.value === 1)
                if (filtered.length > 0){
                    showAlert = true
                    color = 'red'
                    if (this.state.isAlertHR === false){
                        this.setState({isAlertHR:true})
                    }
                    let content = filtered[0].data.Atext.value
                    var moment = require('moment-timezone');
       
                  var timeTDate =  moment.tz( filtered[0].data.TimestampA.value,  currentTimeZonStr)
                    // let trim = content.split(":")
                    var todayEndDate = timeTDate.format("DD MMM YY, hh:mm a");
                     message = content+ " At "+ todayEndDate + " "+abbr
                }
            }

            if(isOccupied === false){
                color = 'rgba(201,201,201,1.0)'
                heartRate = '--'
           }
            
        
        

        return(
            <View style={{flex:1,alignItems:'center'}}>
                  <Text  allowFontScaling={false} style={[styles.statsText,{fontSize:height*0.02, marginLeft: width*0.02,color:isDarkMode?'rgba(216,216,217,1.0)':'rgba(89,89,89,1.0)', fontWeight:'bold'}]}>Heart Rate</Text>
                  <View style = {{backgroundColor:isDarkMode?'rgba(216,216,217,1.0)':'rgba(89,89,89,1.0)',width:height*0.22,height:height*0.22,borderRadius:height*0.11,marginTop:height*0.01,justifyContent:'center',alignItems:'center'}}>
                  <View style = {{backgroundColor:color,width:height*0.20,height:height*0.20,borderRadius:height*0.10,alignItems:'center'}}>
                        <Icon name={'heartbeat'} color={'white'} size={height*0.03} style={{marginTop:height*0.014}}></Icon>
                        <Text  allowFontScaling={false} style={[styles.statsText,{fontSize:height*0.1,color:'rgba(255,255,255,1.0)', fontWeight:'bold',marginTop:0,marginLeft:0}]}>{heartRate}</Text>
                        <Text  allowFontScaling={false} style={[styles.statsText,{fontSize:height*0.016, marginLeft: width*0.02,color:'rgba(255,255,255,1.0)', fontWeight:'bold',marginTop:0,marginLeft:0}]}>Beats/min</Text>
                 
                  </View> 
                  </View> 
                  {showAlert && <TouchableOpacity style={{marginLeft:width*0.02,marginTop:5,width:width*0.84, height:22, borderColor:isDarkMode?'rgba(216,216,217,1.0)':'rgba(89,89,89,1.0)', borderWidth:1, borderRadius:4, justifyContent:'center', alignItems:'center'}} onPress={()=> this.onPressAlertHr(filtered[0])}>
                  {isLoadingHR === false && <Text allowFontScaling={false} style={[styles.statsText,{fontSize:11,color:isDarkMode?'rgba(216,216,217,1.0)':'rgba(89,89,89,1.0)', fontWeight:'bold', marginTop:0, marginLeft:0}]}>{message}</Text>}
                 {isLoadingHR && <ActivityIndicator size="small" color="gray" />}
                  </TouchableOpacity> }
                  
             </View>
        )
    }

    _renderRespiratoryRate(){
        const {isDarkMode,data,alertsArray,isOccupied, ...props} = this.props
        const {isLoadingRR} = this.state
        let respiratoryRate = '--'
        var showAlert = false
        if (data !== null && data !==undefined){
                  if (data.data !== null && data.data !== undefined){
                    respiratoryRate = data.data.Rr?Math.round(data.data.Rr.value):'--'
                   }
              } 
var message = ""
var color = 'green'
let filtered ; 

var currentTimeZonStr = 'America/Chicago'
var abbr = 'CST'
if (data.data !== undefined && data.data !== null && data.data.Timezone !== undefined && data.data.Timezone !== null ){
    let timezone =  data.data.Timezone.value
    let abr = this.getTimeZoneAbr(timezone)
    if (abr !== ''){
        if (abr == 'CDT'){
            abbr = abr
        }else{
            let tz = this.getTimeZone(timezone)
            currentTimeZonStr = tz
            abbr = abr
        }
    }
    


}

              if (alertsArray.length > 0 ){
                 filtered = alertsArray.filter((data)=> data.data.AlertType.value === "Breath Rate" && data.data.AlertFlag.value === 1)
                if (filtered.length > 0){
                    showAlert = true
                    color = 'red'
                    if (this.state.isAlertRR === false){
                        this.setState({isAlertRR:true})
                    }
                    
                    
                    let content = filtered[0].data.Atext.value
                    var moment = require('moment-timezone');
       
                  var timeTDate =  moment.tz( filtered[0].data.TimestampA.value,  currentTimeZonStr)
                    // let trim = content.split(":")
                    var todayEndDate = timeTDate.format("DD MMM YY, hh:mm a");
                     message = content+ " At "+ todayEndDate + " "+abbr
                }
            }
            
            if(isOccupied === false){
                 color = 'rgba(201,201,201,1.0)'
                 respiratoryRate = '--'
            }
             
        return(
            <View style={{flex:1,alignItems:'center',marginTop:-10}}>
                  <Text  allowFontScaling={false} style={[styles.statsText,{fontSize:height*0.02, marginLeft: width*0.02,color:isDarkMode?'rgba(216,216,217,1.0)':'rgba(89,89,89,1.0)', fontWeight:'bold'}]}>Respiratory Rate</Text>
                  <View style = {{backgroundColor:isDarkMode?'rgba(216,216,217,1.0)':'rgba(89,89,89,1.0)',width:height*0.22,height:height*0.22,borderRadius:height*0.11,marginTop:height*0.01,justifyContent:'center',alignItems:'center'}}>
                  <View style = {{backgroundColor:color,width:height*0.20,height:height*0.20,borderRadius:height*0.10,alignItems:'center'}}>
                  <Icon name={'lungs'} color={'white'} size={height*0.03} style={{marginTop:height*0.014}}></Icon>
                        <Text  allowFontScaling={false} style={[styles.statsText,{fontSize:height*0.1,color:'rgba(255,255,255,1.0)', fontWeight:'bold',marginTop:0,marginLeft:0}]}>{respiratoryRate}</Text>
                        <Text  allowFontScaling={false} style={[styles.statsText,{fontSize:height*0.016, marginLeft: width*0.02,color:'rgba(255,255,255,1.0)', fontWeight:'bold',marginTop:0,marginLeft:0}]}>Breaths/min</Text>
                 
                  </View> 
                  </View> 

                  {showAlert && <TouchableOpacity style={{marginLeft:width*0.02,width:width*0.84,marginTop:5, height:22, borderColor:isDarkMode?'rgba(216,216,217,1.0)':'rgba(89,89,89,1.0)', borderWidth:1, borderRadius:4, justifyContent:'center', alignItems:'center', marginTop:10}} onPress={()=> this.onPressAlertRr(filtered[0])}>
                  {isLoadingRR === false && <Text allowFontScaling={false} style={[styles.statsText,{fontSize:11,color:isDarkMode?'rgba(216,216,217,1.0)':'rgba(89,89,89,1.0)', fontWeight:'bold', marginTop:0, marginLeft:0}]}>{message}</Text>}
                 {isLoadingRR && <ActivityIndicator size="small" color="gray" />}
                  </TouchableOpacity> }
             </View>
        )
    }

    render(){
        const {isDarkMode,data, ...props} = this.props
        var isActive = "Yes"
        if (data !== null && data !==undefined && data.data.Active !== undefined && data.data.Active !== null ){
            isActive = data.data.Active.value
         }

         var backgroundColor = isDarkMode?'rgba(30,30,32,1.0)':'rgba(255,255,255,1.0)'
         var shadowColor = isDarkMode?'#000':'rgba(124,124,124,1.0)'
        return (
            <View style={[styles.slideInnerContainer,{backgroundColor:backgroundColor,shadowColor:shadowColor,height:height*0.70}]}>
            {this._renderLogo()}
            {this._renderName()}
            {this._renderStats()}
                   
          
            </View>
        )
    }
}