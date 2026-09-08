import React, { Component } from 'react';
import {
  View,
  Text,
  Dimensions,
  Switch,
  TouchableOpacity,
  Platform,
  TextInput
 } from 'react-native';
import getStateItem from '../../state/getStateItem'
import setStateItem from '../../state/setState/setStateItem'
import TopHeader from '../../common/component/topHeader'
import styles from './styles'
import ButtonK from '../../common/component/Button'
const {width, height} = Dimensions.get('window')
import {DB_KEY} from '../../common/helper/keys'
import {TimezoneModified} from '../../state/emitters'
import IconFontisto from 'react-native-vector-icons/Fontisto'
import messaging from "@react-native-firebase/messaging"
import Loader from '../../common/component/loader'
import URLS from '../../common/helper/urls'
import HEADER from '../../common/helper/constants'
import moment from 'moment'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { checkGenericYesType } from '../../common/helper/util';
import {executeApiWith,writeData, getDevicePropertySet} from '../../api'
import { API_TIMEOUT } from '../../common/helper/util';
import { getBaseURL } from '../../../galenApiLibrary/config/getBaseURL';
import getHeaders from '../../../galenApiLibrary/config/getHeader';



export default class NotificationScreen extends Component {
    constructor(props){
        super(props)
        this.state = {themeChanged:getStateItem(DB_KEY.IS_DARK_MODE),isEnabled:false,isChecked:true, checkedEmail:false, checkedPush:false,identityData:props.navigation.state.params.identityData,data:props.navigation.state.params.data,loading:false,lowHeartRate:'',highHeartRate:'',lowBreadthRate:'',highBreadthRate:'',lowStress:'',highStress:'',lowMotion:'',hightMotion:'',thresholdData:null}
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


    async getThresholdData(){
        var myHeaders = this.getHeader()
        let user = getStateItem(DB_KEY.USERS_LIST_ARRAY)[0]
  

        let userId = user.userId
    
        var raw = JSON.stringify({
            "deviceDataModelId": "d36a4373-fbdc-44a3-8c96-4bb920041e40-th",
            "deviceCriteria": [
              {
                "key": "DevidThresholds",
                "operator": "Equal",
                "value": this.state.data.data.Devid.value.trim()
              }
            ],
            "ownerFilter": {
              "users": [
                userId
              ]
            }
          });

          var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
          };
//V3

        let url1 = getBaseURL + 'data/devicedata-advanced?pageSize=1&pageNumber=0'
        let response = await executeApiWith(url1, 'POST', raw, myHeaders, "NotificationScreen:getThresholdData")
        if (response.status === 200) {
            let result = await response.json()
            this.setThresholdData(result)
        }
  }

    setThresholdData(result){
        if(result.content !== undefined && result.content !== null && result.content.length > 0){
            this.setState({thresholdData:result.content[0]})
            var timeZoneStr = 'CST'
        if (result.content[0] !== null && result.content[0].data !== undefined && result.content[0].data !== null){
// "AlertMinmt":this.state.lowMotion === '' ? 0 :this.state.lowMotion, "AlertMinrr":this.state.lowBreadthRate === '' ? 0 :this.state.lowBreadthRate, "AlertMinst":this.state.lowStress === '' ? 0 :this.state.lowStress,"TimestampT":moment.utc().format()}
                      
            if (result.content[0].data.AlertMaxhr !== undefined && result.content[0].data.AlertMaxhr !== null ){
               this.setState({highHeartRate:result.content[0].data.AlertMaxhr.value})
            }

            if (result.content[0].data.AlertMaxmt !== undefined && result.content[0].data.AlertMaxmt !== null ){
                this.setState({hightMotion:result.content[0].data.AlertMaxmt.value})
             }

             if (result.content[0].data.AlertMaxrr !== undefined && result.content[0].data.AlertMaxrr !== null ){
                this.setState({highBreadthRate:result.content[0].data.AlertMaxrr.value})
             }

             if (result.content[0].data.AlertMaxst !== undefined && result.content[0].data.AlertMaxst !== null ){
                this.setState({highStress:result.content[0].data.AlertMaxst.value})
             }



             if (result.content[0].data.AlertMinhr !== undefined && result.content[0].data.AlertMinhr !== null ){
                this.setState({lowHeartRate:result.content[0].data.AlertMinhr.value})
             }

             if (result.content[0].data.AlertMinmt !== undefined && result.content[0].data.AlertMinmt !== null ){
                this.setState({lowMotion:result.content[0].data.AlertMinmt.value})
             }


             if (result.content[0].data.AlertMinrr !== undefined && result.content[0].data.AlertMinrr !== null ){
                this.setState({lowBreadthRate:result.content[0].data.AlertMinrr.value})
             }


             if (result.content[0].data.AlertMinst !== undefined && result.content[0].data.AlertMinst !== null ){
                this.setState({lowStress:result.content[0].data.AlertMinst.value})
             }


           
        }
        } 
   }

    componentDidMount(){
        const {identityData} = this.state
       
        if (identityData !== null && identityData.data !== undefined && identityData.data !== null){
           
            if (identityData.data.EnableAlerts !== undefined && identityData.data.EnableAlerts !== null && identityData.data.EnableAlerts.value !== null  && identityData.data.EnableAlerts.value !== undefined ){
                let EnableAlerts = checkGenericYesType(identityData.data.EnableAlerts.value) ? true : false
                let  emailCheck = false
                let pushCheck  = false
                if (identityData.data.NotificationType !== undefined && identityData.data.NotificationType !== null && identityData.data.NotificationType.value !== undefined && identityData.data.NotificationType.value !== null ){
                    let  notificationType =  identityData.data.NotificationType.value
                    if (notificationType.length > 0) {
                    emailCheck = notificationType.includes("Email");
                     pushCheck = notificationType.includes("Push");
                    }
                }
               
                
                this.setState({isEnabled:EnableAlerts, checkedEmail:  emailCheck, checkedPush:pushCheck})
            }
         }

         this.getThresholdData()
   }

   async  requestUserPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  
    if (enabled) {
     // console.log('Authorization status:', authStatus);
      messaging()
      .getToken()
      .then((token) => {
        setToken(token);
      });
    }
  }

    componentWillUnmount(){
   }

   enableNotification(value){
   this.setState({isEnabled:value})
   if (!value){
       this.setState({checkedEmail:value, checkedPush: value})
   }
   setStateItem(DB_KEY.ENABLE_NOTIFICATION, value)
   if (value){
       this.requestUserPermission()
   }
   }



  _renderEnabledNightMode(){
        const {themeChanged,isEnabled} = this.state
       
      
      
        return(
            <View style ={[styles.nameFieldContainer, { flexDirection:'row',borderTopColor:'rgba(240,240,240,1.0)',borderTopWidth:1}]}>
                  <Text  allowFontScaling={false} style= {[styles.singInText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)', marginTop: height*0.023, marginLeft: 20}]}>Enable Notification</Text>
                  <View style={{marginLeft:width*0.85,marginTop:15, position:'absolute', width:null,height:null,justifyContent:'center'}}>
                  <Switch
        trackColor={{ false: "#767577", true: 'green' }}
        thumbColor={"#f4f3f4"}
        ios_backgroundColor="#3e3e3e"
        onValueChange={(value)=> this.enableNotification(value)}
        value={isEnabled}
      />
                  </View>
                
            </View>
        )
    }

    async subscribeForNotificationTopic(){
        let data = getStateItem(DB_KEY.RESIDENT_DATA)
        for (var index = 0 ; index < data.length ; index++){
          let resident = data[index]
    
          let macAddress = resident.data.Devid.value
          let newMacAddress = Platform.OS === 'ios' ? macAddress.replaceAll(':','-') : macAddress.replace(/:/g, '-')
    
          let topic = newMacAddress+'-Alerts'
    
          messaging()
          .subscribeToTopic(topic)
          .then(() => {
            let subscriptionArrayList = getStateItem(DB_KEY.SUBSCRIPTION_ARRAY_LIST)
            if (!subscriptionArrayList.includes(topic)) {
                subscriptionArrayList.push(topic)
            }
            setStateItem(DB_KEY.SUBSCRIPTION_ARRAY_LIST, subscriptionArrayList)
          })
    
        }
      }

      async unSubscribeForNotificationTopic(){
        let data = getStateItem(DB_KEY.RESIDENT_DATA)
        for (var index = 0 ; index < data.length ; index++){
          let resident = data[index]
    
          let macAddress = resident.data.Devid.value
          let newMacAddress = Platform.OS === 'ios' ? macAddress.replaceAll(':','-') : macAddress.replace(/:/g, '-')
    
          let topic = newMacAddress+'-Alerts'
    
           messaging()
          .unsubscribeFromTopic(topic)
          .then(() =>{
            let subscriptionArrayList = getStateItem(DB_KEY.SUBSCRIPTION_ARRAY_LIST)
            const index = subscriptionArrayList.indexOf(topic);
            if (index > -1) { // only splice array when item is found
                subscriptionArrayList.splice(index, 1); // 2nd parameter means remove one item only
            }
            setStateItem(DB_KEY.SUBSCRIPTION_ARRAY_LIST, subscriptionArrayList)
          });
    
       }
      }

    enableEmailNotification(){
        if(this.state.isEnabled){
        this.setState({checkedEmail:!this.state.checkedEmail})
        }
        }

        enablePushNotification(){
            if(this.state.isEnabled){
                
                this.setState({checkedPush:!this.state.checkedPush})
              
           
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

            async updateThresholdTable(){
                
                this.setState({loading:true})
                const deviceId = 'd36a4373-fbdc-44a3-8c96-4bb920041e40-th'
                const promiseGetDevicePropertySetTimeout = new Promise((resolve) => (setTimeout(() => resolve(false),  API_TIMEOUT.INTERVAL)))
                const resGetDevicePropertySet = await Promise.race([promiseGetDevicePropertySetTimeout,getDevicePropertySet(deviceId,  "NotificationScreen:updateThresholdTable:283")])
                if (! resGetDevicePropertySet) {
                   this.setState({loading:false})
                    alert("API Delayed response for NotificationScreen:updateThresholdTable:283")
                    return
                }
                
                let header = this.getHeader()
                var requestOptions = {
                 method: 'GET',
                 headers: header,
                  };
                  
                  
                  if (resGetDevicePropertySet.status === 200){
                    let jsonResponse = await resGetDevicePropertySet.json()
                   // console.log('jsonResponse ::::: '+JSON.stringify(jsonResponse))
                   let dataToPut = {"AlertMaxhr":this.state.highHeartRate === '' ? 0 :this.state.highHeartRate , "AlertMaxmt":this.state.hightMotion === '' ? 0 :this.state.hightMotion, "AlertMaxrr":this.state.highBreadthRate === '' ? 0 :this.state.highBreadthRate, "AlertMaxst":this.state.highStress === '' ? 0 :this.state.highStress, "AlertMinhr":this.state.lowHeartRate === '' ? 0 :this.state.lowHeartRate,"AlertMinmt":this.state.lowMotion === '' ? 0 :this.state.lowMotion, "AlertMinrr":this.state.lowBreadthRate === '' ? 0 :this.state.lowBreadthRate, "AlertMinst":this.state.lowStress === '' ? 0 :this.state.lowStress,"TimestampT":moment.utc().format()}
                   
                   var body;
                    if (this.state.thresholdData === null) {
                        body = {"deviceDataModelId":deviceId, "data":dataToPut, "devicePropertySetId":jsonResponse.content[0].devicePropertySetId}
                    }   
                    else {
                        body = {"deviceDataModelId":deviceId, "deviceDataId": this.state.thresholdData.deviceDataId,"data":dataToPut, "devicePropertySetId":jsonResponse.content[0].devicePropertySetId}
                    }  
                     
                    console.log('body ::::: '+JSON.stringify(body))
                    const promiseWriteDataTimeout = new Promise((resolve) => (setTimeout(() => resolve(false),  API_TIMEOUT.INTERVAL)))
                    const resWriteData = await Promise.race([promiseWriteDataTimeout,writeData( JSON.stringify(body), "NotificationScreen:updateThresholdTable")])
                    if (!resWriteData) {
                        this.setState({loading:false})
                        alert("API Delayed response for NotificationScreen:updateThresholdTable");
                        return
                    }

                    if (resWriteData.status === 201 || resWriteData.status === 200){
                        let jsonResponseDeviceData = await resWriteData.text()
                        console.log('jsonResponseDeviceData ::::: '+jsonResponseDeviceData)
                        
                        this.setState({loading:false})
                       // TimezoneModified.emit('TIMEZONE_MODIFIED')
                        alert('Notification setting modified')
                      
                    }else{
                        this.setState({loading:false})
                        alert('Not able to update Threshold setting, Please try again later')
                    }
          
                   
                  }else{
                    this.setState({loading:false})
                    alert('Not able to update  Threshold setting, Please try again later')
                  }
            } 


            async handleUpdateTapped(showSuccessAlert){
               let text = this.state.isEnabled ? "Yes":"No"
                var textNotificationType= ""
                if (this.state.checkedEmail && this.state.checkedPush){
                    textNotificationType = "Email,Push"
                }else  if (this.state.checkedPush){
                    textNotificationType = "Push"
                }else  if (this.state.checkedEmail){
                    textNotificationType = "Email"
                }
       
                this.setState({loading:true})
                const deviceId = 'd36a4373-fbdc-44a3-8c96-4bb920041e40-id'
                const promiseGetDevicePropertySetTimeout = new Promise((resolve) => (setTimeout(() => resolve(false),  API_TIMEOUT.INTERVAL)))
                const resGetDevicePropertySet = await Promise.race([promiseGetDevicePropertySetTimeout,getDevicePropertySet(deviceId,  "NotificationScreen:handleUpdateTapped:346")])
                if (! resGetDevicePropertySet) {
                   this.setState({loading:false})
                    alert("API Delayed response for NotificationScreen:handleUpdateTapped:346")
                    return
                }
                       
                let header = this.getHeader()
                var requestOptions = {
                    method: 'GET',
                    headers: header,
                    };
       
                  //V3
                 if (resGetDevicePropertySet.status === 200){
                   let jsonResponse = await resGetDevicePropertySet.json()
                   //console.log('jsonResponse ::::: '+JSON.stringify(jsonResponse))
                   let  dataToPut = {"EnableAlerts":text,"TimestampI":moment.utc().format(), "NotificationType": "push"}
       
                   let body = {"deviceDataModelId":deviceId, "deviceDataId":this.state.data.deviceDataId,"data":dataToPut, "devicePropertySetId":jsonResponse.content[0].devicePropertySetId}
                   const promiseWriteDataTimeout = new Promise((resolve) => (setTimeout(() => resolve(false),  API_TIMEOUT.INTERVAL)))
                    const resWriteData = await Promise.race([promiseWriteDataTimeout,writeData( JSON.stringify(body), "NotificationScreen:handleUpdateTapped")])
                    if (!resWriteData) {
                        this.setState({loading:false})
                        alert("API Delayed response for NotificationScreen:handleUpdateTapped");
                        return
                    }

                    if (resWriteData.status === 201 || resWriteData.status === 200){
                                let jsonResponseDeviceData = await resWriteData.text()
                                //console.log('jsonResponseDeviceData ::::: '+jsonResponseDeviceData)
                            
                                this.setState({loading:false})
                                TimezoneModified.emit('TIMEZONE_MODIFIED')
                                if (showSuccessAlert){alert('Notification setting modified')}
                                
                                
                            }else{
                                this.setState({loading:false})
                                alert('Not able to update Notification setting, Please try again later')
                            }
                    
                            
                            }else{
                            this.setState({loading:false})
                            alert('Not able to update  Notification setting, Please try again later')
                            }
       
          
           }
               


    _renderNotificationType(){
        const {themeChanged,isEnabled} = this.state
       
      
      
        return(
            <View style ={[styles.nameFieldContainer, { flexDirection:'row',borderTopColor:'rgba(240,240,240,1.0)',borderTopWidth:1,borderBottomWidth:1,borderBottomColor:'rgba(240,240,240,1.0)'}]}>
                  <Text  allowFontScaling={false} style= {[styles.singInText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)', marginTop: height*0.023, marginLeft: 20}]}>Notification Type</Text>
                  <View style={{marginLeft:width*0.35,marginTop:10, position:'absolute', width:null,height:null,justifyContent:'center', flexDirection:'row'}}>
                  <Text  allowFontScaling={false} style= {[styles.singInText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(0,0,0,1.0)', marginTop: height*0.014, fontSize:width*0.03}]}>Email</Text>
                  <TouchableOpacity style={{marginLeft:10,marginTop: height*0.014,width:20,height:20}} onPress={()=> this.enableEmailNotification()}>
      <IconFontisto name={this.state.checkedEmail ? 'checkbox-active' : 'checkbox-passive'} size={18} color={'black'} backgroundColor={this.state.isEnabled ? 'transparent':"#3e3e3e"}/>
   </TouchableOpacity>


   <Text  allowFontScaling={false} style= {[styles.singInText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)', marginTop: height*0.014, fontSize:width*0.03}]}>SMS</Text>
                  <TouchableOpacity style={{marginLeft:10,marginTop: height*0.014,width:20,height:20}} >
      <IconFontisto name={'checkbox-passive'} size={18} color={'gray'} backgroundColor={"#3e3e3e"}/>
   </TouchableOpacity>


   <Text  allowFontScaling={false} style= {[styles.singInText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(0,0,0,1.0)', marginTop: height*0.014, fontSize:width*0.03}]}>PUSH</Text>
                  <TouchableOpacity style={{marginLeft:10,marginTop: height*0.014,width:20,height:20}} onPress={()=> this.enablePushNotification()}>
      <IconFontisto name={this.state.checkedPush ? 'checkbox-active' : 'checkbox-passive'} size={18} color={'black'} backgroundColor={this.state.isEnabled ? 'transparent':"#3e3e3e"}/>
   </TouchableOpacity>
                  </View>
                
            </View>
        )
    }

    validateData(){
        
        if (this.state.isEnabled){
            if(!this.state.checkedEmail && !this.state.checkedPush){
                alert('Please select at least one notification type')
                return false
            }else{
                if(this.state.highHeartRate === '' && this.state.highBreadthRate === '' && this.state.highStress === '' && this.state.hightMotion  === '' ){
                    alert('Please select at least threshold value for high')
                    return false
                }else if (parseInt(this.state.highHeartRate) > 150 || parseInt(this.state.lowHeartRate) < 30){
                    alert('Heart rate threshold must be in range 30 to 150')
                    return false
                }else if (parseInt(this.state.highHeartRate) < parseInt(this.state.lowHeartRate) ){
                    alert('Heart rate high threshold must greater than low threshold')
                    return false
                }else if (parseInt(this.state.highBreadthRate) > 60 || parseInt(this.state.lowBreadthRate) < 8){
                    alert('Breath rate threshold must be in range 8 to 60')
                    return false
                }else if (parseInt(this.state.highBreadthRate) < parseInt(this.state.lowBreadthRate) ){
                    alert('Breath rate high threshold must greater than low threshold')
                    return false
                }else if (parseInt(this.state.highStress) > 10 || parseInt(this.state.lowStress) < 0){
                    alert('Stress threshold must be in range 0 to 10')
                    return false
                }else if (parseInt(this.state.highStress) < parseInt(this.state.lowStress) ){
                    alert('Stress high threshold must greater than low threshold')
                    return false
                }else if (parseInt(this.state.hightMotion) > 10 || parseInt(this.state.lowMotion) < 0){
                    alert('Motion threshold must be in range 0 to 10')
                    return false
                }else if (parseInt(this.state.hightMotion) < parseInt(this.state.lowMotion) ){
                    alert('Motion high threshold must greater than low threshold')
                    return false
                }

            }
        }
        return true
    }

    updateTapped(){
        
        if (!this.state.isEnabled){
            this.unSubscribeForNotificationTopic()
            this.handleUpdateTapped(true)
        }else if (this.validateData()){
            this.subscribeForNotificationTopic()
            this.handleUpdateTapped(false)
            this.updateThresholdTable(false)
        }
    }


   

   renderHeartBox(){
    const {themeChanged} = this.state;
    let HRHighBackgroundColor = 'transparent'
    let HRLowBackgroundColor = 'transparent'
    let color = themeChanged?'rgba(223,223,223,1.0)' : 'rgba(0,0,0,1.0)'
    if (this.state.highHeartRate !== ''){
        HRHighBackgroundColor = (parseInt(this.state.highHeartRate) > 150 || parseInt(this.state.highHeartRate) < 30) ? 'red' : color
    }

    if (this.state.lowHeartRate !== ''){
        HRLowBackgroundColor =  (parseInt(this.state.lowHeartRate) > 150 || parseInt(this.state.lowHeartRate) < 30) ? 'red' :color
    }
     
      return(
           <View style={{width:width, height:height*0.10,flexDirection:'row'}}>
               <View style={{marginLeft:20, width:width*0.35,height:height*0.10,justifyContent:'center',alignItems:'center',borderWidth:1,borderColor:'gray'}}>
               <Text  allowFontScaling={false} style= {[styles.singInText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)', marginTop: 0, marginLeft: 0}]}>Heart Rate</Text>
               </View>

               <View style={{height:height*0.10,flexDirection:'column', width:width*0.20}}>
               <View style={{height:height*0.05, width:width*0.20, borderTopWidth:1,borderRightWidth:1,borderTopColor:'gray',borderRightColor:'gray',borderBottomWidth:1,borderBottomColor:'gray', flexDirection:'row',alignItems:'center'}}>
               <Text  allowFontScaling={false} style= {[styles.singInText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)', marginTop: 0, marginLeft: 3}]}>H</Text>
              
               <TextInput
                             style={{color:HRHighBackgroundColor, height:height*0.05,width: width*0.12, marginLeft:15,textAlign:'center'}}  
                            returnKeyType = {'done'}
                            keyboardType = {'numeric'}
                            selectionColor={themeChanged?'white':'black'}
                            underlineColorAndroid = {'transparent'}
                            placeholder = "High"
                            placeholderTextColor = "rgba(189,189,189,1.0)"
                            autoCapitalize = "none"
                            onChangeText={(highHeartRate) => this.setState({highHeartRate})}
                            value={this.state.highHeartRate}
                            /> 
                </View>

                   <View style={{height:height*0.05, width:width*0.20, borderRightWidth:1,borderRightColor:'gray',borderBottomWidth:1,borderBottomColor:'gray',alignItems:'center', flexDirection:'row'}}>
                   <Text  allowFontScaling={false} style= {[styles.singInText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)', marginTop: 0, marginLeft: 3}]}>L</Text>
              
               <TextInput
                             style={{color:HRLowBackgroundColor, height:height*0.05,width: width*0.12, marginLeft:15,textAlign:'center'}}  
                            returnKeyType = {'done'}
                            keyboardType = {'numeric'}
                            selectionColor={themeChanged?'white':'black'}
                            underlineColorAndroid = {'transparent'}
                            placeholder = "Low"
                            placeholderTextColor = "rgba(189,189,189,1.0)"
                            autoCapitalize = "none"
                            onChangeText={(lowHeartRate) => this.setState({lowHeartRate})}
                            value={this.state.lowHeartRate}
                            /> 
                   </View>
               </View>

               <View style={{height:height*0.10, width:width*0.45 - 40,borderTopWidth:1,borderRightWidth:1,borderTopColor:'gray',borderRightColor:'gray',borderBottomWidth:1,borderBottomColor:'gray',justifyContent:'center',alignItems:'center'}}>
               <Text  allowFontScaling={false} style= {[styles.singInText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)', marginTop: 0, marginLeft: 0}]}>30 to 150</Text>
               
               </View>
           </View>
       )
   }


   renderStressBox(){
    const {themeChanged} = this.state;
    let stressHighBackgroundColor = 'transparent'
    let stressLowBackgroundColor = 'transparent'
    let color = themeChanged?'rgba(223,223,223,1.0)' : 'rgba(0,0,0,1.0)'
    if (this.state.highStress !== ''){
        stressHighBackgroundColor = (parseInt(this.state.highStress) > 10 || parseInt(this.state.highStress) < 0) ? 'red' : color
    }

    if (this.state.lowStress !== ''){
        stressLowBackgroundColor =  (parseInt(this.state.lowStress) > 10 ||parseInt( this.state.lowStress) < 0) ? 'red' : color
    }
     
    
   
       return(
           <View style={{width:width, height:height*0.10,flexDirection:'row'}}>
               <View style={{marginLeft:20, width:width*0.35,height:height*0.10,justifyContent:'center',alignItems:'center',borderWidth:1,borderColor:'gray'}}>
               <Text  allowFontScaling={false} style= {[styles.singInText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)', marginTop: 0, marginLeft: 0}]}>Stress</Text>
               </View>

               <View style={{height:height*0.10,flexDirection:'column', width:width*0.20}}>
               <View style={{height:height*0.05, width:width*0.20, borderTopWidth:1,borderRightWidth:1,borderTopColor:'gray',borderRightColor:'gray',borderBottomWidth:1,borderBottomColor:'gray', flexDirection:'row',alignItems:'center'}}>
               <Text  allowFontScaling={false} style= {[styles.singInText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)', marginTop: 0, marginLeft: 3}]}>H</Text>
              
               <TextInput
                             style={{color:stressHighBackgroundColor, height:height*0.05,width: width*0.12, marginLeft:15,textAlign:'center'}}  
                            returnKeyType = {'done'}
                            keyboardType = {'numeric'}
                            selectionColor={themeChanged?'white':'black'}
                            underlineColorAndroid = {'transparent'}
                            placeholder = "High"
                            placeholderTextColor = "rgba(189,189,189,1.0)"
                            autoCapitalize = "none"
                            onChangeText={(highStress) => this.setState({highStress})}
                            value={this.state.highStress}
                            /> 
                </View>

                   <View style={{height:height*0.05, width:width*0.20, borderRightWidth:1,borderRightColor:'gray',borderBottomWidth:1,borderBottomColor:'gray',alignItems:'center', flexDirection:'row'}}>
                   <Text  allowFontScaling={false} style= {[styles.singInText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)', marginTop: 0, marginLeft: 3}]}>L</Text>
              
               <TextInput
                             style={{color:stressLowBackgroundColor, height:height*0.05,width: width*0.12, marginLeft:15,textAlign:'center'}}  
                            returnKeyType = {'done'}
                            keyboardType = {'numeric'}
                            selectionColor={themeChanged?'white':'black'}
                            underlineColorAndroid = {'transparent'}
                            placeholder = "Low"
                            placeholderTextColor = "rgba(189,189,189,1.0)"
                            autoCapitalize = "none"
                            onChangeText={(lowStress) => this.setState({lowStress})}
                            value={this.state.lowStress}
                            /> 
                   </View>
               </View>

               <View style={{height:height*0.10, width:width*0.45 - 40,borderTopWidth:1,borderRightWidth:1,borderTopColor:'gray',borderRightColor:'gray',borderBottomWidth:1,borderBottomColor:'gray',justifyContent:'center',alignItems:'center'}}>
               <Text  allowFontScaling={false} style= {[styles.singInText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)', marginTop: 0, marginLeft: 0}]}>0 to 10</Text>
               
               </View>
           </View>
       )
   }


   renderMotionRateBox(){
    const {themeChanged} = this.state;
    
    let motionHighBackgroundColor = 'transparent'
    let motionLowBackgroundColor = 'transparent'
    let color = themeChanged?'rgba(223,223,223,1.0)' : 'rgba(0,0,0,1.0)'
    if (this.state.hightMotion !== ''){
        motionHighBackgroundColor = (parseInt(this.state.hightMotion) > 10 || parseInt(this.state.hightMotion) < 0) ? 'red' : color
    }

    if (this.state.lowMotion !== ''){
        motionLowBackgroundColor =   (parseInt(this.state.lowMotion) > 10 || parseInt(this.state.lowMotion) < 0) ? 'red' : color
    }
     


   
       return(
           <View style={{width:width, height:height*0.10,flexDirection:'row'}}>
               <View style={{marginLeft:20, width:width*0.35,height:height*0.10,justifyContent:'center',alignItems:'center',borderWidth:1,borderColor:'gray'}}>
               <Text  allowFontScaling={false} style= {[styles.singInText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)', marginTop: 0, marginLeft: 0}]}>Motion</Text>
               </View>

               <View style={{height:height*0.10,flexDirection:'column', width:width*0.20}}>
               <View style={{height:height*0.05, width:width*0.20, borderTopWidth:1,borderRightWidth:1,borderTopColor:'gray',borderRightColor:'gray',borderBottomWidth:1,borderBottomColor:'gray', flexDirection:'row',alignItems:'center'}}>
               <Text  allowFontScaling={false} style= {[styles.singInText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)', marginTop: 0, marginLeft: 3}]}>H</Text>
              
               <TextInput
                             style={{color:motionHighBackgroundColor, height:height*0.05,width: width*0.12, marginLeft:15,textAlign:'center'}}  
                            returnKeyType = {'done'}
                            keyboardType = {'numeric'}
                            selectionColor={themeChanged?'white':'black'}
                            underlineColorAndroid = {'transparent'}
                            placeholder = "High"
                            placeholderTextColor = "rgba(189,189,189,1.0)"
                            autoCapitalize = "none"
                            onChangeText={(hightMotion) => this.setState({hightMotion})}
                            value={this.state.hightMotion}
                            /> 
                </View>

                   <View style={{height:height*0.05, width:width*0.20, borderRightWidth:1,borderRightColor:'gray',borderBottomWidth:1,borderBottomColor:'gray',alignItems:'center', flexDirection:'row'}}>
                   <Text  allowFontScaling={false} style= {[styles.singInText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)', marginTop: 0, marginLeft: 3}]}>L</Text>
              
               <TextInput
                             style={{color:motionLowBackgroundColor, height:height*0.05,width: width*0.12, marginLeft:15,textAlign:'center'}}  
                            returnKeyType = {'done'}
                            keyboardType = {'numeric'}
                            selectionColor={themeChanged?'white':'black'}
                            underlineColorAndroid = {'transparent'}
                            placeholder = "Low"
                            placeholderTextColor = "rgba(189,189,189,1.0)"
                            autoCapitalize = "none"
                            onChangeText={(lowMotion) => this.setState({lowMotion})}
                            value={this.state.lowMotion}
                            /> 
                   </View>
               </View>

               <View style={{height:height*0.10, width:width*0.45 - 40,borderTopWidth:1,borderRightWidth:1,borderTopColor:'gray',borderRightColor:'gray',borderBottomWidth:1,borderBottomColor:'gray',justifyContent:'center',alignItems:'center'}}>
               <Text  allowFontScaling={false} style= {[styles.singInText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)', marginTop: 0, marginLeft: 0}]}>0 to 10</Text>
               
               </View>
           </View>
       )
   }


   renderBreadthRateBox(){
    const {themeChanged} = this.state;

    let breadthHighBackgroundColor = 'transparent'
    let breadthLowBackgroundColor = 'transparent'
    let color = themeChanged?'rgba(223,223,223,1.0)' : 'rgba(0,0,0,1.0)'
    if (this.state.highBreadthRate !== ''){
        breadthHighBackgroundColor = (parseInt(this.state.highBreadthRate) > 60 || parseInt(this.state.highBreadthRate) < 8) ? 'red'  : color
    }

    if (this.state.lowBreadthRate !== ''){
        breadthLowBackgroundColor =    (parseInt(this.state.lowBreadthRate) > 60 || parseInt(this.state.lowBreadthRate) < 8) ? 'red' : color
    }

      return(
           <View style={{width:width, height:height*0.10,flexDirection:'row'}}>
               <View style={{marginLeft:20, width:width*0.35,height:height*0.10,justifyContent:'center',alignItems:'center',borderWidth:1,borderColor:'gray'}}>
               <Text  allowFontScaling={false} style= {[styles.singInText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)', marginTop: 0, marginLeft: 0}]}>Breath Rate</Text>
               </View>

               <View style={{height:height*0.10,flexDirection:'column', width:width*0.20}}>
               <View style={{height:height*0.05, width:width*0.20, borderTopWidth:1,borderRightWidth:1,borderTopColor:'gray',borderRightColor:'gray',borderBottomWidth:1,borderBottomColor:'gray', flexDirection:'row',alignItems:'center'}}>
               <Text  allowFontScaling={false} style= {[styles.singInText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)', marginTop: 0, marginLeft: 3}]}>H</Text>
              
               <TextInput
                             style={{color:breadthHighBackgroundColor, height:height*0.05,width: width*0.12, marginLeft:15,textAlign:'center'}}  
                            returnKeyType = {'done'}
                            keyboardType = {'numeric'}
                            selectionColor={themeChanged?'white':'black'}
                            underlineColorAndroid = {'transparent'}
                            placeholder = "High"
                            placeholderTextColor = "rgba(189,189,189,1.0)"
                            autoCapitalize = "none"
                            onChangeText={(highBreadthRate) => this.setState({highBreadthRate})}
                            value={this.state.highBreadthRate}
                            /> 
                </View>

                   <View style={{height:height*0.05, width:width*0.20, borderRightWidth:1,borderRightColor:'gray',borderBottomWidth:1,borderBottomColor:'gray',alignItems:'center', flexDirection:'row'}}>
                   <Text  allowFontScaling={false} style= {[styles.singInText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)', marginTop: 0, marginLeft: 3}]}>L</Text>
              
               <TextInput
                             style={{color: breadthLowBackgroundColor, height:height*0.05,width: width*0.12, marginLeft:15,textAlign:'center'}}  
                            returnKeyType = {'done'}
                            keyboardType = {'numeric'}
                            selectionColor={themeChanged?'white':'black'}
                            underlineColorAndroid = {'transparent'}
                            placeholder = "Low"
                            placeholderTextColor = "rgba(189,189,189,1.0)"
                            autoCapitalize = "none"
                            onChangeText={(lowBreadthRate) => this.setState({lowBreadthRate})}
                            value={this.state.lowBreadthRate}
                            /> 
                   </View>
               </View>

               <View style={{height:height*0.10, width:width*0.45 - 40,borderTopWidth:1,borderRightWidth:1,borderTopColor:'gray',borderRightColor:'gray',borderBottomWidth:1,borderBottomColor:'gray',justifyContent:'center',alignItems:'center'}}>
               <Text  allowFontScaling={false} style= {[styles.singInText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)', marginTop: 0, marginLeft: 0}]}>8 to 60</Text>
               
               </View>
           </View>
       )
   }

  

    render(){
        const {themeChanged} = this.state;
    return(
        <KeyboardAwareScrollView
          style ={[styles.container, {backgroundColor: themeChanged ? 'rgba(27,26,29,1.0)':'rgba(249,249,249,1.0)'}]}
          resetScrollToCoords={{ x: 0, y: 0 }}
          enableOnAndroid = {true}
          contentContainerStyle={styles.container}
          enableAutomaticScroll={true}
          extraHeight={height*0.15} 
          extraScrollHeight={height*0.15}
        >
        <TopHeader leftTitle={'Notification'} isDarkMode = {themeChanged} onLeftIconPress={()=> this.back()} macAddress={''}/>
         {this._renderEnabledNightMode()}
         {this._renderNotificationType()}
         <Text  allowFontScaling={false} style= {[styles.singInText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)', marginTop: 10, marginLeft: 20, marginBottom:20}]}>User Selectable Alert Thresholds</Text>
              
         {this.renderHeartBox()}
         {this.renderBreadthRateBox()}
         {this.renderStressBox()}
         {this.renderMotionRateBox()}
         <ButtonK title={'Save'} style={styles.signInButton} onPress={()=> this.updateTapped()} titleColor={'white'} titleFont={20} titleWeight={'bold'} />
       {this._renderLoader()}
         </KeyboardAwareScrollView>

        )
    }

}