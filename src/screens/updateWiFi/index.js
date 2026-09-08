import React, { Component , createRef} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Alert,
  NativeModules,
  Platform,
  ActivityIndicator
} from 'react-native';



const {width , height }  = Dimensions.get('window')

import getStateItem from '../../state/getStateItem'
import {DB_KEY, RESPONSE_MESSAGE} from '../../common/helper/keys'
import TopHeader from '../../common/component/topHeader'
import styles from './styles'
import ButtonK from '../../common/component/Button'
 import Loader from '../../common/component/loader'
 import Icon from 'react-native-vector-icons/Entypo'
 import HEADER from '../../common/helper/constants'
 import Toast, {DURATION} from 'react-native-easy-toast'
 import {getLastDataFromGevHealth} from '../../api'
 import { API_TIMEOUT } from '../../common/helper/util';

 import getHeaders from '../../../galenApiLibrary/config/getHeader'

export default class UpdateWiFi extends Component{
    constructor(props){
        super(props)

        this.updateTapped = this.updateTapped.bind(this)
        this.state = {themeChanged:getStateItem(DB_KEY.IS_DARK_MODE), friendlyName : '' , location : '', wiFiSSIDName:'',wiFiPassword:'' ,isContinueTapped:false, loading:false, data:props.navigation.state.params.data,btnTitle:'Continue',passwordEyeOn:true,tapCount:0,wiFiSsidName:'N/A',wiFiStrength:'N/A',rssValue:'N/A',showDialog:false, devHealthData:null}
    }


    componentDidMount(){

        const {data} = this.state
        const friendlyName = data.data?data.data.FriendlyName?data.data.FriendlyName.value:'' :''
        const location = data.data?data.data.Location?data.data.Location.value:'' :''
        this.apiGetWiFiDetail()
        this.setState({friendlyName, location})
       
    }

    componentWillUnmount(){
       
    }



    back(){
        this.props.navigation.goBack()
    }

    validateWiFi(){

        const  {btnTitle,tapCount, wiFiSSIDName, wiFiPassword} = this.state
        if(btnTitle === 'Continue' && tapCount === 0){
            this.setState({tapCount:1})
        }else if(btnTitle === 'Continue' && tapCount === 1){
         this.setState({btnTitle:'Update WiFi', isContinueTapped:true})
        }else{
            const {data} = this.state
            const macAddress = data.data.Devid.value
            let access_point = Platform.OS === 'ios' ? 'Cardio_'+macAddress.replaceAll(':','') : 'Cardio_'+macAddress.replace(/:/g, '')
      
            //Please re-try and reconnect Wifi to Cardio_C4---54
            Alert.alert(
              "Confirmation",
              "Please make sure you are connected to Wifi : "+access_point,
              [
               { text: "Yes", onPress: () =>this.updateTapped()},
               { text: "No"}
              ],
              { cancelable: false }
            );
        }
 }


    updateTapped() {
       const  {btnTitle,tapCount, wiFiSSIDName, wiFiPassword} = this.state
       if(btnTitle === 'Continue' && tapCount === 0){
           this.setState({tapCount:1})
       }else if(btnTitle === 'Continue' && tapCount === 1){
        this.setState({btnTitle:'Update WiFi', isContinueTapped:true})
    }else{

        if (this.state.wiFiSSIDName.length === 0){
            alert('Please enter wifi ssid name.')
            return
        }else if (this.state.wiFiPassword.length === 0){
            alert('Please enter wifi password.')
            return
        }
        

        if (Platform.OS === 'ios'){
            const option = {"wiFiSSIDName": this.state.wiFiSSIDName,"wiFiSSIDPassword": this.state.wiFiPassword}
            const socket = NativeModules.Socket
            this.setState({showDialog:true})
            socket.createConnect(option,(callback)=>{
               this.toast.show(callback);
               this.setState({showDialog:false})
                if (callback.includes('Paired')){
                    this.showConfirmationAlert()
                         // hit the apis
                     }else{

                     }
            })
        }else{

            if (Platform.OS === 'android'){
            const ipAddress = "192.168.10.1"
            const portAddress = 54709
            
            let TCP = require('react-native-tcp')

            let client = TCP.createConnection(portAddress, ipAddress, function() {
            // NSString *command  = [NSString stringWithFormat:@"1:1.0%@2:%@%@3:%@%@0%@",cLE,self.wiFiSSID,cLE,self.wiFiPassword,cLE,cLE];
            //NSLog(@"Sending command::::%@",command);
            //let command = '1:1.0\r\n2:iPhone\r\n3:123456789\r\n0\r\n';
            let command = '1:1.0\r\n2:'+wiFiSSIDName+'\r\n3:'+wiFiPassword+'\r\n0\r\n';
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
       
    }

    showConfirmationAlert(){
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

    getHeader(){
        var myHeaders = new Headers();
        myHeaders.append("X-APP-TYPE", HEADER.APP_TYPE);
        myHeaders.append("X-TENANT-DOMAIN", HEADER.TENANT_DOMAIN);
        myHeaders.append("X-API-VERSION", HEADER.API_VERSION);
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Authorization", getStateItem(DB_KEY.ACCESS_TOKEN));

        return getHeaders()
    }

   

    handleNoTapped(){
        this.setState({wiFiPassword:'',showDialog:false})
        const {data} = this.state
        const macAddress = data.data.Devid.value


        let access_point ;
        if(Platform.OS === 'ios'){
           access_point = 'Cardio_'+macAddress.replaceAll(':','')
        }else{
          access_point = 'Cardio_'+macAddress.replace(/:/g, '')
        } Alert.alert(
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
        this.toast.show('You have successfully connected the sensor with wiFi '+this.state.wiFiSSIDName);
      
      }

     async apiGetWiFiDetail(){
        const macAddress = this.state.data.data.Devid.value.trim()
        
        const promiseGetLastDataFromGevHealthTimeout = new Promise((resolve) => (setTimeout(() => resolve(false),  API_TIMEOUT.INTERVAL)))
        const resGetLastDataFromGevHealth = await Promise.race([promiseGetLastDataFromGevHealthTimeout,getLastDataFromGevHealth(macAddress, "updateWifi:apiGetWifiDetail")])
        if (! resGetLastDataFromGevHealth) {
          // alert("API Delayed response for updateWifi:apiGetWifiDetail")
           return
        } 
       
        if (resGetLastDataFromGevHealth.status === 200) {
            let result = await resGetLastDataFromGevHealth.json()
            this.getCurrentVersion(result)
        }
    }
  
  
  
    
  
    getCurrentVersion(response){
        
        if (response.content !== undefined && response.content !== null && response.content.length > 0){
          const lastObject = response.content[0]
  
          let WifiSsidStr = lastObject.data.WifiSsid ? lastObject.data.WifiSsid.value : 'NA'
          let WifiStrengthStr = lastObject.data.WifiStrength ? lastObject.data.WifiStrength.value : 'NA'
          let rssValue = lastObject.data.WifiRss ? lastObject.data.WifiRss.value : 'NA'
          this.setState({wiFiSsidName:WifiSsidStr,wiFiStrength:WifiStrengthStr,rssValue:rssValue, devHealthData :lastObject })

      }else{
        this.setState({wiFiSsidName:'',wiFiStrength:''})
      }
  }
  

   
        

  

    _renderLoader() {
        const {loading} = this.state
    
        if (loading) {
            return (<Loader />)
        }else{
            return (<View />)
        }
    }


    _renderContent() {
        const {isContinueTapped,themeChanged, passwordEyeOn,data,tapCount,wiFiSsidName,wiFiStrength,rssValue} = this.state
        const wifiDetail = 'WiFiSSID : '+wiFiSsidName+'\n'+'Signal Strength: '+wiFiStrength+'\n\n\n'
        const message = 'Please go to Settings->Wi-Fi on your smart phone and manually connect to Cardi/o’s Wi-Fi network Cardio_'+Platform.OS === 'ios' ?   data.data.Devid.value.replaceAll(':','') : data.data.Devid.value.replace(/:/g, '')+' and then return to the Cardi/o app to continue the setup process. \n\n'
const resetInformation = wifiDetail+'To perform a Factory Reset or to update the device\'/s WiFi SSID and Password - Press and hold the RESET button on the device for at least 15 seconds until the RED LED blinks 4 times on the device then turns RED after you release the RESET button.. After the LED turns RED, click CONTINUE and follow the on-screen instructions \nNote: a factory Reset will clear the device WiFi SSID information'
      
if (isContinueTapped){
return(
    <View>
        <Text  allowFontScaling={false} style={{color:themeChanged?'white':'rgba(70,70,70,1.0)',fontSize:height*0.024, fontWeight:'bold', marginLeft:width*0.06,marginTop:height*0.05}}>STEP 3:</Text>  
                   
    <Text  allowFontScaling={false} style= {[styles.singInText, {color :themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)',marginTop:height*0.05}]}>WiFi SSID Name</Text>
    <View style={[styles.emailTextFieldContainer, styles.layout]}> 
        <TextInput
        allowFontScaling={false}
        style={[styles.emailTextField,{color:themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)'}]}  
        onSubmitEditing={() => { this.newPasswordTextInput.focus(); }}
        returnKeyType = {'next'}
        keyboardType = {'default'}
        selectionColor={themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)'}
        underlineColorAndroid = {'transparent'}
        placeholder = "Enter WiFi Name"
        placeholderTextColor = "rgba(189,189,189,1.0)"
        autoCapitalize = "none"
        onChangeText={(wiFiSSIDName) => this.setState({wiFiSSIDName})}
        value={this.state.wiFiSSIDName}
        />
    </View>


    <Text  allowFontScaling={false} style= {[styles.singInText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)',marginTop:height*0.04}]}>WiFi Password</Text>
    <View style={[styles.emailTextFieldContainer, styles.layout]}> 
        <TextInput
        allowFontScaling={false}
        ref={(input) => { this.newPasswordTextInput = input; }}
        style={[styles.emailTextField,{color:themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)'}]}  
        returnKeyType = {'done'}
        keyboardType = {'default'}
        selectionColor={themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)'}
        underlineColorAndroid = {'transparent'}
        placeholder = "Enter Password"
        placeholderTextColor = "rgba(189,189,189,1.0)"
        autoCapitalize = "none"
        secureTextEntry={passwordEyeOn}
        onChangeText={(wiFiPassword) => this.setState({wiFiPassword})}
        value={this.state.wiFiPassword}
        />
         <TouchableOpacity style={{position:'absolute', width:30,height:30, marginLeft:width*0.88-40, marginTop:10}} onPress={()=> this.setState({passwordEyeOn:!this.state.passwordEyeOn})}><Icon name={passwordEyeOn?'eye':'eye-with-line'} color={'gray'} size={25} /></TouchableOpacity> 
    </View>
    </View>

)
        }else {
            if(tapCount === 0){
                return(
    <View style={styles.buttonTop}>
        <View style={styles.wifiInfoBox} >
        <Text  allowFontScaling={false} style={{color:themeChanged?'white':'rgba(70,70,70,1.0)',fontSize:height*0.026, fontWeight:'bold', marginLeft:width*0.03}}>Sensor WiFi Info</Text>
            <View style={{flexDirection:'row'}}>  
              <View style={styles.ssidBox}>
                <Text  allowFontScaling={false} style={{color:themeChanged?'white':'rgba(70,70,70,1.0)',fontSize:height*0.022,textAlign:'right',width:width*0.45}}>SSID: </Text>
                <Text  allowFontScaling={false} style={{color:themeChanged?'white':'rgba(70,70,70,1.0)',fontSize:height*0.022,textAlign:'left',width:width*0.45}}>   {wiFiSsidName}</Text>
               </View>
            </View> 

             <View style={styles.ssidBox}>
                <Text  allowFontScaling={false} style={{color:themeChanged?'white':'rgba(70,70,70,1.0)',fontSize:height*0.022,textAlign:'right',width:width*0.45}}>Signal Strength: </Text>
                <Text  allowFontScaling={false} style={{color:themeChanged?'white':'rgba(70,70,70,1.0)',fontSize:height*0.022}}>   {wiFiStrength}</Text>
                <Text  allowFontScaling={false} style={{color:themeChanged?'white':'rgba(70,70,70,1.0)',fontSize:height*0.020,marginLeft:10}}>{rssValue}</Text>
                <Text  allowFontScaling={false} style={{color:themeChanged?'white':'rgba(70,70,70,1.0)',fontSize:height*0.018,marginLeft:5}}>dbm</Text>
              

               </View>
           

        </View>


        <Text  allowFontScaling={false} style={{color:themeChanged?'white':'rgba(70,70,70,1.0)',fontSize:height*0.024, fontWeight:'bold', marginLeft:width*0.03}}>To change Sensor WiFi SSID/password:</Text>
        <Text  allowFontScaling={false} style={{color:themeChanged?'white':'rgba(70,70,70,1.0)',fontSize:height*0.024, fontWeight:'bold', marginLeft:width*0.03}}>STEP 1:</Text>  
       
        <Text  allowFontScaling={false} style={{color:themeChanged?'white':'rgba(70,70,70,1.0)',fontSize:height*0.024, marginLeft:width*0.03,marginTop:height*0.02}}>You need to perform a Factory Reset:​</Text>
        
        <View style={{flexDirection:'row'}}>
        <View style={{width:width*0.15}}>
        <Text  allowFontScaling={false} style={{color:themeChanged?'white':'rgba(70,70,70,1.0)',fontSize:height*0.024, marginLeft:width*0.03,marginTop:height*0.01}}>-</Text>
        
        </View>
        <View style={{width:width*0.80}}>
        <Text  allowFontScaling={false} style={{color:themeChanged?'white':'rgba(70,70,70,1.0)',fontSize:height*0.024, marginLeft:width*0.01,marginTop:height*0.01}}>Press and hold the RESET button on the sensor until the LED on the sensor turns RED</Text>
        
        </View>

        
        </View>

        <View style={{flexDirection:'row'}}>
        <View style={{width:width*0.15}}>
        <Text  allowFontScaling={false} style={{color:themeChanged?'white':'rgba(70,70,70,1.0)',fontSize:height*0.024, marginLeft:width*0.03,marginTop:height*0.01}}>-</Text>
        
        </View>
        <View style={{width:width*0.80}}>
        <Text  allowFontScaling={false} style={{color:themeChanged?'white':'rgba(70,70,70,1.0)',fontSize:height*0.024, marginLeft:width*0.01,marginTop:height*0.01}}>Then click CONTINUE below and follow the onscreen instructions​</Text>
        
        </View>

        
        </View>


        <Text  allowFontScaling={false} style={{color:themeChanged?'white':'rgba(70,70,70,1.0)',fontSize:height*0.024, marginLeft:width*0.03,marginTop:height*0.03}}>NOTE: the Factory Reset will clear all current sensor WiFi SSID information​</Text>
       
    </View>
                )
            }else{
                let lblText = "Go to Settings -> WiFi"
                return(
                    <View style={styles.buttonTop}>
                    
                    <Text  allowFontScaling={false} style={{color:themeChanged?'white':'rgba(70,70,70,1.0)',fontSize:height*0.024, fontWeight:'bold', marginLeft:width*0.03,marginTop:height*0.05}}>STEP 2:</Text>  
                   
                    <Text  allowFontScaling={false} style={{color:themeChanged?'white':'rgba(70,70,70,1.0)',fontSize:height*0.024, marginLeft:width*0.03,marginTop:height*0.02}}>Go to your Smart phone home screen​​</Text>
                    
                    <View style={{flexDirection:'row'}}>
                    <View style={{width:width*0.15}}>
                    <Text  allowFontScaling={false} style={{color:themeChanged?'white':'rgba(70,70,70,1.0)',fontSize:height*0.024, marginLeft:width*0.03,marginTop:height*0.01}}>-</Text>
                    
                    </View>
                    <View style={{width:width*0.80}}>
                    <Text  allowFontScaling={false} style={{color:themeChanged?'white':'rgba(70,70,70,1.0)',fontSize:height*0.024, marginLeft:width*0.01,marginTop:height*0.01}}>{lblText}​</Text>
                    
                    </View>
            
                    
                    </View>
            
                    <View style={{flexDirection:'row'}}>
                    <View style={{width:width*0.15}}>
                    <Text  allowFontScaling={false} style={{color:themeChanged?'white':'rgba(70,70,70,1.0)',fontSize:height*0.024, marginLeft:width*0.03,marginTop:height*0.01}}>-</Text>
                    
                    </View>
                    <View style={{width:width*0.80}}>
                    <Text  allowFontScaling={false} style={{color:themeChanged?'white':'rgba(70,70,70,1.0)',fontSize:height*0.024, marginLeft:width*0.01,marginTop:height*0.01}}>Manually connect the smart phone to the sensor access point Cardio_{Platform.OS === 'ios' ? this.state.data.data.Devid.value.replaceAll(':','') : this.state.data.data.Devid.value.replace(/:/g, '')}</Text>
                    
                    </View>
            
                    
                    </View>

                    <View style={{flexDirection:'row'}}>
                    <View style={{width:width*0.15}}>
                    <Text  allowFontScaling={false} style={{color:themeChanged?'white':'rgba(70,70,70,1.0)',fontSize:height*0.024, marginLeft:width*0.03,marginTop:height*0.01}}>-</Text>
                    
                    </View>
                    <View style={{width:width*0.80}}>
                    <Text  allowFontScaling={false} style={{color:themeChanged?'white':'rgba(70,70,70,1.0)',fontSize:height*0.024, marginLeft:width*0.01,marginTop:height*0.01}}>After it successfully connects,  return to the Cardio APP and press CONTINUE below to continue the setup process​</Text>
                    
                    </View>
            
                    
                    </View>
            
            
                </View>
                                )
            }
        }
    }

    _renderDailog(){
        const {themeChanged,showDialog,data} = this.state
        const color =  themeChanged ? 'rgba(27,26,29,1.0)':'rgba(249,249,249,1.0)'
        const bgColor =  'rgba(141,141,141,1.0)'
        const macAddress = data.data.Devid.value
        let access_point ;
        if(Platform.OS === 'ios'){
           access_point = 'Cardio_'+macAddress.replaceAll(':','')
        }else{
          access_point = 'Cardio_'+macAddress.replace(/:/g, '')
        } let cancelMessage = 'If the sensor doesn\'t connect in 2 minutes, press Cancel, then connect to '+ access_point+ ' and press connect'
        
        let message = 'Connecting with Sensor...'
        
        if (this.state.showDialog){
            return(
                <View style={{width,height,backgroundColor:'rgba(31,31,31,0.4)',position:'absolute',alignItems:'center',justifyContent:'center'}}>

{message == 'Connecting with Sensor...' && <View style={{alignItems:'center',justifyContent:'center'}}>
                    <Text  allowFontScaling={false} style= {[styles.secondaryText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(223,223,223,1.0)',marginTop:height*0.01, width:width*0.94,marginLeft:0,fontWeight:'bold',backgroundColor:'rgba(31,31,31,0.5)',fontSize:height*0.020,marginTop:-height*0.10}]}>{cancelMessage}</Text>

                    </View>}


                     <View style={{padding:10,backgroundColor:bgColor,borderRadius:12}}>
                    <ActivityIndicator size={'large'} color={color} />
                    <Text  allowFontScaling={false}  style= {[styles.secondaryText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(31,31,31,1.0)',marginTop:height*0.01}]}>{message}</Text>
                    </View>

                  {message == 'Connecting with Sensor...' && <View style={{alignItems:'center',justifyContent:'center'}}>
                    <TouchableOpacity style={{width:width*0.50,height:40,borderColor:'gray',borderWidth:1,borderRadius:8,marginTop:20,backgroundColor:'rgba(31,31,31,0.6)',justifyContent:'center',alignItems:'center'}} onPress={()=> this.setState({showDialog:false})}>
                        <Text  allowFontScaling={false} style={{color:'rgba(223,223,223,1.0)',fontSize:22,fontWeight:'bold'}}>Cancel</Text>
                    </TouchableOpacity>
                    </View>}
                </View>
            )
        }
    }

    

    render(){
        const {themeChanged, data,btnTitle} = this.state
        const name = data.data.FriendlyName.value
       
        return(
            <View style ={[styles.container, {backgroundColor: themeChanged ? 'rgba(27,26,29,1.0)':'rgba(249,249,249,1.0)'}]}>
                <TopHeader leftTitle={name} isDarkMode = {themeChanged} onLeftIconPress={()=> this.back()} macAddress={''} />
                  


                       {this._renderContent()} 

                 <ButtonK title={btnTitle} style={styles.signInButton} onPress={()=> this.validateWiFi()} titleColor={'white'} titleFont={20} titleWeight={'bold'} />
                
                 {this._renderLoader()}
           
                 <Toast ref={(toast) => this.toast = toast}/>

                 {this._renderDailog()}
            </View>
        );
    }
}