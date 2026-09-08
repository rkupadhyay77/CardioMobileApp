import React, { Component } from 'react';
import {
  View,
  Text,
  Dimensions,
  Switch,
  TouchableOpacity,
  Platform
 } from 'react-native';
import getStateItem from '../../state/getStateItem'
import setStateItem from '../../state/setState/setStateItem'
import {DB_KEY,RESPONSE_MESSAGE} from '../../common/helper/keys'
import TopHeader from '../../common/component/topHeader'
import styles from './styles'
import ButtonK from '../../common/component/Button'
import Loader from '../../common/component/loader'
import URLS from '../../common/helper/urls'
import { TimePickerModal } from 'react-native-paper-dates'
import HEADER from '../../common/helper/constants'
const {width, height} = Dimensions.get('window')
import moment from 'moment'
import {NightModeModified} from '../../state/emitters'
import TIMEZONE from '../../common/helper/timezone'
import { checkGenericYesType } from '../../common/helper/util';
import {writeData, getDevicePropertySet} from '../../api';
import { API_TIMEOUT } from '../../common/helper/util';


export default class NightModeScreen extends Component {
    constructor(props){
        super(props)
        this.state = {themeChanged:getStateItem(DB_KEY.IS_DARK_MODE),loading:false, item:props.navigation.state.params.item,isEnabled:false, data:props.navigation.state.params.data,showTimePicker:false, sensorStartTime:'--', sensorEndTime:'', isStartTimeTapped:false,timeZoneStr:'America/Chicago',timeZoneAbr:'CST'}
    }

    back(){
        this.props.navigation.goBack()
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

     defaultTimeZone(){
        this.setState({timeZoneAbr:'CST', timeZoneStr:'America/Chicago'})
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
                      this.setState({timeZoneAbr:'CDT', timeZoneStr:'America/Chicago'})
                    }else{
                      let tz = this.getTimeZone(timezone)
                      currentTimeZonStr = tz
                      this.setState({timeZoneAbr:abr, timeZoneStr:tz})
                      
                    }
              }else{
                this.defaultTimeZone()
              }
             }

        }else{
            this.defaultTimeZone()
        }

        return currentTimeZonStr
     }

    

    componentDidMount(){
        const {themeChanged, data} = this.state

        let  currentTimeZonStr = this.getTimezoneData()

        if (data !== undefined && data !== null && data.data !== undefined && data.data !== null && data.data.NightMode !== undefined && data.data.NightMode !== null){
            if (checkGenericYesType(data.data.NightMode.value)) {
                this.setState({isEnabled:true})
           }else{
            this.setState({isEnabled:false})
           }

           var startTime = data.data.NightModeStart ? data.data.NightModeStart.value :'--'
           if (startTime.includes("am") || startTime.includes("Am") || startTime.includes("AM") || startTime.includes("pm") || startTime.includes("Pm") || startTime.includes("PM")){

           }else{
            startTime = this.getTimeInFormat(startTime)
           }
           

           var momentT = require('moment-timezone');
           let startTimeLocal = momentT.utc(startTime,'hh:mm a').tz(currentTimeZonStr).format('hh:mm a')
          var  endTime =  data.data.NightModeEnd ? data.data.NightModeEnd.value :'--'
          if (endTime.includes("am") || endTime.includes("Am") || endTime.includes("AM") || endTime.includes("pm") || endTime.includes("Pm") || endTime.includes("PM")){

        }else{
            endTime = this.getTimeInFormat(endTime)
        }
           
           let endTimeLocal = momentT.utc(endTime,'hh:mm a').tz(currentTimeZonStr).format('hh:mm a')
         

           this.setState({sensorStartTime:startTimeLocal,sensorEndTime: endTimeLocal})
        }
 }

    componentWillUnmount(){
   }

 
   

    _renderLoader() {
        const {loading} = this.state
    
        if (loading) {
            return (<Loader />)
        }else{
            return (<View />)
        }
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

    getHourValue(){
        
        const {isStartTimeTapped, data} = this.state
        var hourValue = "00"
        if (data !== null){
           
            if (isStartTimeTapped){
                let startTime = data.data.NightModeStart ? data.data.NightModeStart.value :'--'
                if  (startTime !== '--'){
                    let array =  this.state.sensorStartTime.split(':');
                    if ( this.state.sensorStartTime.includes('pm')){
                        let array =  this.state.sensorStartTime.split(':');
                        hourValue =  parseInt(array[0]) + 12
                    }else{
                        hourValue =  parseInt(array[0])
                    }
                    
                }
            }else{
                let  endTime =  data.data.NightModeEnd ? data.data.NightModeEnd.value :'--'
                if  (endTime !== '--'){
                    let array  =  this.state.sensorEndTime.split(':');
                    if ( this.state.sensorEndTime.includes('pm')){
                        hourValue = parseInt(array[0]) + 12
                    }else{
                        hourValue = parseInt(array[0])
                    }
                    
                }
            }
            }
            return hourValue
    }

    getMinutesValue(){
        const {isStartTimeTapped, data} = this.state
        var minutesValue = "00"
        if (data !== null){
           
            if (isStartTimeTapped){
                let startTime = data.data.NightModeStart ? data.data.NightModeStart.value :'--'
                if  (startTime !== '--'){
                    let array =  startTime.split(':');
                    minutesValue = array[1]
                }
            }else{
                let  endTime =  data.data.NightModeEnd ? data.data.NightModeEnd.value :'--'
                if  (endTime !== '--'){
                    let array  =  endTime.split(':');
                    minutesValue = array[1]
                }
            }
            }
            return minutesValue
    }

    onConfirm(hours, minutes){
        const {isStartTimeTapped} = this.state
        let hourStr = hours < 10 ? "0"+hours : hours
        let minutesStr = (minutes < 10 && minutes > 0) ? "0"+minutes : minutes
        let timeStr = hourStr+":"+minutesStr
        if (isStartTimeTapped){
            let startTime = this.getTimeInFormat(timeStr)
            this.setState({sensorStartTime:startTime,showTimePicker:false})
        }else{
            let endTime = this.getTimeInFormat(timeStr)
            this.setState({sensorEndTime:endTime,showTimePicker:false})
        }
       
    }

    showTimePicker(value){
        this.setState({showTimePicker:true,isStartTimeTapped:value})
    }

    getTimeBack(time){
        if(time.includes('am')){
            let timeStr = Platform.OS === 'ios' ? time.replaceAll('am','') :time.replace(/am/g, '')
           return timeStr.trim()

        }else if(time.includes('pm')){
            let timeStr = Platform.OS === 'ios' ? time.replaceAll('pm','') :time.replace(/pm/g, '')
            let hours = timeStr.split(':');
            let hourStr = parseInt(hours[0]) + 12
            return hourStr+":"+hours[1].trim()

        }
        return ''
    }


    _renderEnabledNightMode(){
        const {themeChanged,isEnabled, data} = this.state

    
       
        return(
            <View style ={[styles.nameFieldContainer, { flexDirection:'row',borderTopColor:'rgba(240,240,240,1.0)',borderTopWidth:1}]}>
                  <Text  allowFontScaling={false} style= {[styles.singInText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)', marginTop: height*0.023, marginLeft: 20}]}>Enable Night Mode</Text>
                  <View style={{marginLeft:width*0.85,marginTop:15, position:'absolute', width:null,height:null,justifyContent:'center'}}>
                  <Switch
        trackColor={{ false: "#767577", true: 'green' }}
        thumbColor={"#f4f3f4"}
        ios_backgroundColor="#3e3e3e"
        onValueChange={(value)=> this.setState({isEnabled:value})}
        value={isEnabled}
      />
                  </View>
                
            </View>
        )
    }

    _renderStartTime(){
        const {themeChanged, sensorStartTime} = this.state
       
       
        return(
            <TouchableOpacity style ={[styles.nameFieldContainer, { flexDirection:'row',marginTop:0,borderTopColor:'rgba(240,240,240,1.0)',borderTopWidth:1}]} onPress = {()=> this.showTimePicker(true)}>
                  <Text  allowFontScaling={false} style= {[styles.singInText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)', marginTop: height*0.023, marginLeft: 20}]}>Start Time ({this.state.timeZoneAbr})</Text>
                  <Text  allowFontScaling={false} style= {[styles.singInText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)', marginTop: height*0.023, marginLeft: width * 0.50, width: width*0.50 - 25,textAlign:'right', position:'absolute'}]}>{sensorStartTime}</Text>
                
            </TouchableOpacity>
        )
    }

    _renderEndTime(){
        const {themeChanged,sensorEndTime} = this.state
        
        return(
            <TouchableOpacity style ={[styles.nameFieldContainer, { flexDirection:'row',marginTop:0,borderTopColor:'rgba(240,240,240,1.0)',borderTopWidth:1,borderBottomWidth:1,borderBottomColor:'rgba(240,240,240,1.0)'}]} onPress = {()=> this.showTimePicker(false)}>
                  <Text  allowFontScaling={false} style= {[styles.singInText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)', marginTop: height*0.023, marginLeft: 20}]}>End Time ({this.state.timeZoneAbr})</Text>
                  <Text  allowFontScaling={false} style= {[styles.singInText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)', marginTop: height*0.023, marginLeft: width * 0.50, width: width*0.50 - 25,textAlign:'right', position:'absolute'}]}>{sensorEndTime}</Text>
                
            </TouchableOpacity>
        )
    }

    async updateTapped(){
        const {sensorStartTime, sensorEndTime, isEnabled} = this.setState

        this.setState({loading:true})


        var fmt   = "hh:mm a";  // must match the input
        var zone  = this.state.timeZoneStr
        var momentT = require('moment-timezone');
           
          
         let startTime = this.getTimeBack(this.state.sensorStartTime)
         let startTimeUtc = momentT.tz(startTime, fmt, zone).utc().format("HH:mm:ss")
         //moment(startTime,'hh:mm a').utc().format('hh:mm a')
         let endTime = this.getTimeBack(this.state.sensorEndTime)
         let endTimeUtc = momentT.tz(endTime, fmt, zone).utc().format("HH:mm:ss")
         //console.log("startTimeUtc::"+startTimeUtc)
        let status = this.state.isEnabled ? "Yes" : "No"
         
        const deviceId = 'd36a4373-fbdc-44a3-8c96-4bb920041e40-pa'
        const promiseGetDevicePropertySetTimeout = new Promise((resolve) => (setTimeout(() => resolve(false),  API_TIMEOUT.INTERVAL)))
        const resGetDevicePropertySet = await Promise.race([promiseGetDevicePropertySetTimeout,getDevicePropertySet(deviceId,  "NIghtModeScreen:updateTapped:342")])
        if (! resGetDevicePropertySet) {
        this.setState({loading:false})
            alert("API Delayed response for NIghtModeScreen:updateTapped:342")
            return
        }
                
       
           if (resGetDevicePropertySet.status === 200){
            let jsonResponse = await resGetDevicePropertySet.json()
            let  dataToPut = {"NightMode":status,"NightModeStart":startTimeUtc,"NightModeEnd":endTimeUtc,"TimestampP":moment.utc().format()}

            let body = {"deviceDataModelId":deviceId, "deviceDataId":this.state.data.deviceDataId,"data":dataToPut, "devicePropertySetId":jsonResponse.content[0].devicePropertySetId}
           console.log("updateNight Mode: body: "+JSON.stringify(body))
            const promiseWriteDataTimeout = new Promise((resolve) => (setTimeout(() => resolve(false),  API_TIMEOUT.INTERVAL)))
            const resWriteData = await Promise.race([promiseWriteDataTimeout,writeData( JSON.stringify(body), "NIghtModeScreen:updateTapped")])
            if (!resWriteData) {
                this.setState({loading:false})
                alert("API Delayed response for NIghtModeScreen:updateTapped");
                return
            }
  
  
            if (resWriteData.status === 201 || resWriteData.status === 200){
                let jsonResponseDeviceData = await resWriteData.text()
                //console.log('jsonResponseDeviceData ::::: '+jsonResponseDeviceData)
           
                this.setState({loading:false})
       
                alert('Night Mode data modified')
                NightModeModified.emit('NIGHT_MODE_MODIFIED')
            }else{
                this.setState({loading:false})
                alert('Not able to modify NightMode, Please try again later')
            }
  
           
          }else{
            this.setState({loading:false})
            alert('Not able to modify NightMode, Please try again later 1')
          }

        



    }

  

    render(){
        const {themeChanged,showTimePicker} = this.state;
        let hour = this.getHourValue()
        let minutes = this.getMinutesValue()
    return(
        <View style ={[styles.container, {backgroundColor: themeChanged ? 'rgba(27,26,29,1.0)':'rgba(249,249,249,1.0)'}]}>
         <TopHeader leftTitle={'Night Mode'} isDarkMode = {themeChanged} onLeftIconPress={()=> this.back()} macAddress={''}/>
         {this._renderEnabledNightMode()}
         {this._renderStartTime()}
         {this._renderEndTime()}
         <ButtonK title={'Save'} style={styles.signInButton} onPress={()=> this.updateTapped()} titleColor={'white'} titleFont={20} titleWeight={'bold'} />
            
          {this._renderLoader()} 

          <TimePickerModal
        visible={showTimePicker}
        onDismiss={()=> this.setState({showTimePicker:false})}
        onConfirm = {({hours, minutes})=> this.onConfirm(hours, minutes)}
        hours={hour} // default: current hours
        minutes={minutes} // default: current minutes
        label="Select time" // optional, default 'Select time'
        cancelLabel="Cancel" // optional, default: 'Cancel'
        confirmLabel="Ok" // optional, default: 'Ok'
        animationType="fade" // optional, default is 'none'
        locale={'en'} // optional, default is automically detected by your system
      />
         </View>

        )
    }

}