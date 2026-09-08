import React, { Component } from 'react';
import {
  View,
  Text,
  Dimensions,
  Alert,
  TextInput,
  Platform,
  PermissionsAndroid
 } from 'react-native';
import getStateItem from '../../../state/getStateItem'
import {DB_KEY} from '../../../common/helper/keys'
import TopHeader from '../../../common/component/topHeader'
import styles from './styles'
import ButtonK from '../../../common/component/Button'
// import CameraKitCameraScreen
import {CameraKitCameraScreen} from 'react-native-camera-kit'
const {width , height }  = Dimensions.get('window');
import HEADER from '../../../common/helper/constants'
const OsVer = Platform.constants['Release'];
import getHeaders from '../../../../galenApiLibrary/config/getHeader';
import { getBaseURL } from '../../../../galenApiLibrary/config/getBaseURL';


export default class DeviceConfigScannerScreen extends Component {
    constructor(props){
        super(props)
        this.requestCameraPermission = this.requestCameraPermission.bind(this);
       
        this.state = {themeChanged:getStateItem(DB_KEY.IS_DARK_MODE),qrValue:'',openScanner:false,manufacturer:'',macAddress:'',serialNumber:'', enterManually:false,manualMacAddress:'',userFound:false, clickedIndex:0}
    }

    back(){
        this.props.navigation.goBack()
    }

    checkIfUserExist(){
      let scannedUserArray = getStateItem(DB_KEY.SCANNED_USER_ARRAY)
      let user = getStateItem(DB_KEY.USER)
      let email = user.emailAddress
      // check if
      var dataFound ; 
      if (scannedUserArray.length > 0){
          for(var index=0; index < scannedUserArray.length ; index++){
              let data = scannedUserArray[index]

                if (data.email === email){
                  dataFound = scannedUserArray[index]
                  this.setState({userFound:true})
                  this.setState({macAddress:dataFound.macId, manufacturer:dataFound.manufacturer, serialNumber:dataFound.serialNumber})
                  break
                }
          }
      }


      
      
  }


  async requestCameraPermission(){
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'App needs permission for camera access',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        // If CAMERA Permission is granted
        this.setState({qrValue:'', openScanner:true})
      } else {
        //alert('CAMERA permission denied');
      }
    } catch (err) {
      //alert('Camera permission err', err);
     // console.warn(err);
    }
  }

    componentDidMount(){
      if (Platform.OS === 'android' && parseInt(OsVer) < 10) {
           
            // Calling the camera permission function
            this.requestCameraPermission();
          } else {
              this.setState({qrValue:'', openScanner:true})
              this.checkiOSCameraPermission()
          }

          this.checkIfUserExist()
      
    }

    async checkiOSCameraPermission(){
      const isCameraAuthorized = await Camera.checkDeviceCameraAuthorizationStatus();
              if (!isCameraAuthorized){
                Alert.alert(
                  "Unable to access the Camera",
                  "This is not a General Wellness device.To enable access, go to Settings > Privacy > Camera and turn on Camera access for this app.",
                  [
                    {
                      text: "ok"
                    }
                  ],
                  { cancelable: false }
                );
              }
    }


    continueTapped(){
      if(this.state.clickedIndex === 0){
        this.setState({clickedIndex:1})
      }else  if(this.state.clickedIndex === 1){
        this.props.navigation.navigate('ConnectWiFiScreen',{macAddress: this.state.enterManually? this.state.manualMacAddress: this.state.macAddress, serialNumber:this.state.serialNumber, manufacturer:this.state.manufacturer,isFromResident:this.state.userFound});
      }
    }

     onBarcodeScan = (qrValue) => {
         
        // Called after te successful scanning of QRCode/Barcode
        if (qrValue !== '' && this.state.qrValue === ''){
            
            this.setState({qrValue:qrValue, openScanner:false})
            this.validateQrCode(qrValue)
        }
       
      }

      validateQrCode(qrValue){
         
        // check if scanned QR value contains ATX240 
        // get the cardio wifi name
           
            var chars = qrValue.split(";");


            if (chars !== undefined && chars !== null && chars.length > 1) {
              var mnt = chars[0];
              var mnt1 = mnt.split("MN=>");
              
              var mac = chars[1];
              var mac1 = mac.split("MAC=>");
              
              var sn = chars[2];
              var sn1 = sn.split("SN=>");
  
              if (mnt1[1] === "ATX2410-GW" || mnt1[1] === "ATX2410-EQ" || mnt1[1] === "ATX2410-VT" || mnt1[1] === "ATX2410-MD" || mnt1[1] === "ATX2410-ME"){
               this.setState({macAddress:mac1[1], manufacturer:mnt1[1], serialNumber:sn1[1]})
               // this.props.navigation.navigate('CreateUserScreen', {macId:mac1[1]});
               this.getIdentityData()
              }else{
                Alert.alert(
                  "Alert",
                  "This is not a Cardio device.",
                  [
                    {
                      text: "Enter Mac Id Manually",
                      onPress: () => this.setState({enterManually:true})
                    },
                    {
                      text: "Cancel",
                      onPress: () => console.log("cancel"),
                      style: "cancel"
                    }
                  ],
                  { cancelable: false }
                );
            
              }
            }else{
              Alert.alert(
                "Alert",
                "This is not a Cardio device.",
                [
                  {
                    text: "Enter Mac Id Manually",
                    onPress: () => this.setState({enterManually:true})
                  },
                  {
                    text: "Cancel",
                    onPress: () => console.log("cancel"),
                    style: "cancel"
                  }
                ],
                { cancelable: false }
              );
          
            }
            
            
            // var mnt = chars[0];
            // var mnt1 = mnt.split("MN=>");
            
            // var mac = chars[1];
            // var mac1 = mac.split("MAC=>");
            
            // var sn = chars[2];
            // var sn1 = sn.split("SN=>");

           

           
            // if (mnt1[1] === "ATX2410-GW") {
            //   this.setState({manufacturer:mnt1[1], macAddress:mac1[1], serialNumber:sn1[1],openScanner:false})
            // }else{
            //   Alert.alert(
            //     "Alert",
            //     "This is not a General Wellness device.",
            //     [
            //       {
            //         text: "Enter Mac Id Manually",
            //         onPress: () => this.setState({enterManually:true})
            //       },
            //       {
            //         text: "Cancel",
            //         onPress: () => console.log("cancel"),
            //         style: "cancel"
            //       }
            //     ],
            //     { cancelable: false }
            //   );
          
            // }

           

      }

      continue(){
        if (this.state.manualMacAddress.length === 0){
          alert('Please enter Mac Address')
        }else{
          this.setState({macAddress:this.state.manualMacAddress})
          this.getIdentityData()
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


     async getIdentityData() {

       // check for local first 
            let residentsData = getStateItem(DB_KEY.RESIDENT_DATA)
            let filtered = residentsData.filter((content)=> content.data.Devid.value === this.state.macAddress)
            if (filtered.length > 0){ 
                  let item =  filtered[0]
                  if (item.data !== undefined && item.data !== null){
                    if (item.data.Active !== undefined && item.data.Active !== null && item.data.Active.value !== 'No'){
                        Alert.alert(
                          "Error",
                          "This sensor is already associated to you and active",
                          [
                            {
                              text: "ok",
                              onPress: () =>  this.back()
                            }
                          ],
                          { cancelable: false }
                        );
                    }
                  }
            }else{

       // get the bearer token first
                  const headers = new Headers();
                  headers.append("X-APP-TYPE", "EUWP");
                  headers.append("X-TENANT-DOMAIN", "ats-dev2.galencloud.com");
                  headers.append("X-API-VERSION", "3");
                  headers.append("Content-Type", "text/plain");

                  const rawBody = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJlbWFpbEFkZHJlc3MiOiI2ODcxMjUzYy00ZjNlLTQ4NGItOTA2OC05ZjEyZmJjOWNiNTRAZ2FsZW5jbG91ZC5jb20iLCJyb2xlIjoiVGVuYW50VXNlciIsImFwcFR5cGUiOiJERVZJQ0UiLCJpc3MiOiJHYWxlbkNsb3VkIiwidGVuYW50SWQiOiJBVFMtREVWIiwicHJpbmNpcGFsSWQiOiI2ODcxMjUzYy00ZjNlLTQ4NGItOTA2OC05ZjEyZmJjOWNiNTQiLCJ0b2tlblR5cGUiOiJNYXN0ZXJUb2tlbiIsImV4cCI6MTc2NzIwMzExM30.FTw5a2NzMAO8G9zrhUOrNhC484wM6qEaN-2eMqVM1kPHFDy5Qgitho8X0Gm9MHwqW8w6VYQhSb1dmVoHWGNdGA";

                  const request = {
                    method: "POST",
                    headers: headers,
                    body: rawBody,
                    redirect: "follow"
                  };
                  //V3
                  let tokenUrl = getBaseURL()+"auth/refresh-token?deviceDataModelId=d36a4373-fbdc-44a3-8c96-4bb920041e40"
                  let response = await executeApiWith(tokenUrl, 'POST', rawBody, headers, "DeviceConfigurationScreen:getIdentityData")
                    
                  var token = ""
                  if (response.status === 200) {
                    token = res.headers.map.authorization
                  }

                  if (token !== "") {
                    let accessToken = "Bearer "+token
                    let randomNumber = Math.floor((Math.random() * 4) + 1);
                    var myHeaders = new Headers();
                    myHeaders.append("X-APP-TYPE", HEADER.APP_TYPE);
                    myHeaders.append("X-TENANT-DOMAIN", HEADER.TENANT_DOMAIN);
                    myHeaders.append("X-API-VERSION", HEADER.API_VERSION);
                    myHeaders.append("Content-Type", "application/json");
                    myHeaders.append("Authorization", accessToken);

                    let user = getStateItem(DB_KEY.USER)

                    var raw = JSON.stringify({
                      "deviceDataModelId": "d36a4373-fbdc-44a3-8c96-4bb920041e40-id",
                      "deviceCriteria": [
                        {
                          "key": "Devid",
                          "operator": "Equal",
                          "value": this.state.macAddress
                        }
                      ]
                    });

                    //console.log('raw'+raw)

                  

                    var requestOptions = {
                      method: 'POST',
                      headers: myHeaders,
                      body: raw,
                      redirect: 'follow'
                    };
//V3
                    let url1 = getBaseURL()+"data/devicedata-advanced?pageSize=1&pageNumber=0"
                    let res = await executeApiWith(url1, 'POST', raw, myHeaders, "DeviceConfigurationScreen:getIdentityData")
                     //console.log('status'+res.status)
                      if (res.status === 200){
                        // show Alert
                        Alert.alert(
                          "Error",
                          "This sensor is associated with someone, You can not configure this sensor",
                          [
                            {
                              text: "ok",
                              onPress: () =>  this.back()
                            }
                          ],
                          { cancelable: false }
                        );
                      }
                    
                  }

            }

    }

    onSuccess = e => {
      // this.setState({scannedQR:e.data})
      let qrValue = e.data
      if (qrValue !== '' && this.state.qrValue === ''){
          
        this.setState({qrValue:qrValue, openScanner:false})
        this.validateQrCode(qrValue)
    }
     };


    _renderScanner(){
      if (Platform.OS === 'android'){
        return (
                  <CameraKitCameraScreen
                            showFrame={true}
                            // Show/hide scan frame
                            scanBarcode={true}
                            // Can restrict for the QR Code only
                            laserColor={'green'}
                            // Color can be of your choice
                            frameColor={'yellow'}
                            // If frame is visible then frame color
                            colorForScannerFrame={'black'}
                            // Scanner Frame color
                            zoomMode="on"
                            zoom = {5}
                             maxZoom={10}
                            onReadCode={(event) =>
                              this.onBarcodeScan(event.nativeEvent.codeStringValue)
                            }
                          />
               )
       }else{
        return(
          <CameraKitCameraScreen
          showFrame={true}
          // Show/hide scan frame
          scanBarcode={true}
          // Can restrict for the QR Code only
          laserColor={'green'}
          // Color can be of your choice
          frameColor={'yellow'}
          // If frame is visible then frame color
          colorForScannerFrame={'black'}
          zoomMode="on"
          zoom = {5}
          maxZoom={10}
          // Scanner Frame color
          onReadCode={(event) =>
            this.onBarcodeScan(event.nativeEvent.codeStringValue)
          }
        />
        )
      }
    }


      _renderIntroductionText(){
           // condition to render introduction text
           const {manufacturer, macAddress,openScanner,themeChanged,enterManually,clickedIndex} = this.state
          
           if (macAddress.length > 0 && clickedIndex === 0){
               // render text
               const message1 = 'Please follow the following steps to connect to the sensor network:'
              const line1 = '1) Perform a Factory Reset-press and hold the RESET button on the sensor until the RED LED blinks 4 times. (Approximately 15 seconds) The LED will be turn RED continuously after you release the RESET button.'
              const line2 = '2) Go to Settings->WiFi on your smart phone and connect to the WIFi network:'
              const line3 = Platform.OS === 'ios' ? 'Cardio_'+macAddress.replaceAll(':','') : 'Cardio_'+macAddress.replace(/:/g, '')
              const line4 = '3) Return to the Cardi/o APP, press CONTINUE to complete the process to add the sensor to your network.'
             
               return(
                <View>
                    <View style={[styles.containerView,{justifyContent:'center',backgroundColor:'transparent'}]} >
               <Text  allowFontScaling={false} allowFontScaling={false} style={{color:themeChanged?'white':'rgba(70,70,70,1.0)',fontSize:height*0.024, fontWeight:'bold', marginLeft:width*0.03}}>{message1}</Text>
               <Text  allowFontScaling={false} allowFontScaling={false}style={{color:themeChanged?'white':'rgba(70,70,70,1.0)',fontSize:height*0.024, fontWeight:'bold', marginLeft:width*0.03,marginTop: height*0.03}}>STEP 1:</Text>  
       
               <Text  allowFontScaling={false} allowFontScaling={false}style={{color:themeChanged?'white':'rgba(70,70,70,1.0)',fontSize:height*0.024, marginLeft:width*0.03,marginTop:height*0.02}}>You need to perform a Factory Reset:​</Text>
                <View style={{flexDirection:'row'}}>
                    <View style={{width:width*0.15}}>
                          <Text  allowFontScaling={false} allowFontScaling={false}style={{color:themeChanged?'white':'rgba(70,70,70,1.0)',fontSize:height*0.024, marginLeft:width*0.03,marginTop:height*0.01}}>-</Text>
                    </View>

                   <View style={{width:width*0.80}}>
                           <Text  allowFontScaling={false} allowFontScaling={false}style={{color:themeChanged?'white':'rgba(70,70,70,1.0)',fontSize:height*0.024, marginLeft:width*0.01,marginTop:height*0.01}}>Press and hold the RESET button on the sensor until the LED on the sensor turns RED</Text>
                   </View>
                </View>

                <View style={{flexDirection:'row'}}>
                        <View style={{width:width*0.15}}>
                              <Text  allowFontScaling={false} allowFontScaling={false}style={{color:themeChanged?'white':'rgba(70,70,70,1.0)',fontSize:height*0.024, marginLeft:width*0.03,marginTop:height*0.01}}>-</Text>
                         </View>

                         <View style={{width:width*0.80}}>
                               <Text  allowFontScaling={false} allowFontScaling={false}style={{color:themeChanged?'white':'rgba(70,70,70,1.0)',fontSize:height*0.024, marginLeft:width*0.01,marginTop:height*0.01}}>Then click CONTINUE below and follow the onscreen instructions​</Text>
                          </View>

                </View>


                <Text  allowFontScaling={false} allowFontScaling={false}style={{color:themeChanged?'white':'rgba(70,70,70,1.0)',fontSize:height*0.024, marginLeft:width*0.03,marginTop:height*0.03}}>NOTE: the Factory Reset will clear all current sensor WiFi SSID information​</Text>
       
              </View>
          <ButtonK title={'Continue'} style={styles.signInButton} onPress={()=> this.continueTapped()} titleColor={'white'} titleFont={20} titleWeight={'bold'} />
         </View>   
              )
               
           }else  if (macAddress.length > 0 && clickedIndex === 1){
            // render text
            const message1 = 'Please follow the following steps to connect to the sensor network:'
           const line1 = '1) Perform a Factory Reset-press and hold the RESET button on the sensor until the RED LED blinks 4 times. (Approximately 15 seconds) The LED will be turn RED continuously after you release the RESET button.'
           const line2 = '2) Go to Settings->WiFi on your smart phone and connect to the WIFi network:'
           const devId = Platform.OS === 'ios' ? macAddress.replaceAll(':','') : macAddress.replace(/:/g, '')
           const line4 = '3) Return to the Cardi/o APP, press CONTINUE to complete the process to add the sensor to your network.'
          
            return(
             <View>

                <View style={[styles.containerView,{justifyContent:'center',backgroundColor:'transparent'}]} >
             
                   <Text  allowFontScaling={false} style={{color:themeChanged?'white':'rgba(70,70,70,1.0)',fontSize:height*0.024, fontWeight:'bold', marginLeft:width*0.03,marginTop:height*0.05}}>STEP 2:</Text>  
                   
                   <Text  allowFontScaling={false} style={{color:themeChanged?'white':'rgba(70,70,70,1.0)',fontSize:height*0.024, marginLeft:width*0.03,marginTop:height*0.02}}>Go to your Smart phone home screen​​</Text>
                   
                   <View style={{flexDirection:'row'}}>
                   <View style={{width:width*0.15}}>
                   <Text  allowFontScaling={false} style={{color:themeChanged?'white':'rgba(70,70,70,1.0)',fontSize:height*0.024, marginLeft:width*0.03,marginTop:height*0.01}}>-</Text>
                   
                   </View>
                   <View style={{width:width*0.80}}>
                   <Text  allowFontScaling={false} style={{color:themeChanged?'white':'rgba(70,70,70,1.0)',fontSize:height*0.024, marginLeft:width*0.01,marginTop:height*0.01}}>Go to Settings->WiFi​</Text>
                   
                   </View>
           
                   
                   </View>
           
                   <View style={{flexDirection:'row'}}>
                   <View style={{width:width*0.15}}>
                   <Text  allowFontScaling={false} style={{color:themeChanged?'white':'rgba(70,70,70,1.0)',fontSize:height*0.024, marginLeft:width*0.03,marginTop:height*0.01}}>-</Text>
                   
                   </View>
                   <View style={{width:width*0.80}}>
                   <Text  allowFontScaling={false} style={{color:themeChanged?'white':'rgba(70,70,70,1.0)',fontSize:height*0.024, marginLeft:width*0.01,marginTop:height*0.01}}>Manually connect the smart phone to the sensor access point Cardio_{devId}</Text>
                   
                   </View>
           
                   
                   </View>

                   <View style={{flexDirection:'row'}}>
                   <View style={{width:width*0.15}}>
                   <Text  allowFontScaling={false} allowFontScaling={false}style={{color:themeChanged?'white':'rgba(70,70,70,1.0)',fontSize:height*0.024, marginLeft:width*0.03,marginTop:height*0.01}}>-</Text>
                   
                   </View>
                   <View style={{width:width*0.80}}>
                   <Text  allowFontScaling={false} allowFontScaling={false}style={{color:themeChanged?'white':'rgba(70,70,70,1.0)',fontSize:height*0.024, marginLeft:width*0.01,marginTop:height*0.01}}>After it successfully connects,  return to the Cardio APP and press CONTINUE below to continue the setup process​</Text>
                   
                   </View>
           
                   
                   </View>
             </View>      
           
       <ButtonK title={'Continue'} style={styles.signInButton} onPress={()=> this.continueTapped()} titleColor={'white'} titleFont={20} titleWeight={'bold'} />
      </View>   
           )
            
        }else if (enterManually){
            // render QR code
           return(
             <View style={styles.containerView} >
                     <Text  allowFontScaling={false} allowFontScaling={false}style= {[styles.secondaryText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)',marginTop:height*0.04}]}>Mac Address</Text>
                        <View style={[styles.textContainer, styles.layout]}> 
                            <TextInput
                            style={[styles.textField,{color:themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)'}]}  
                             keyboardType = {'default'}
                            selectionColor={'black'}
                            underlineColorAndroid = {'transparent'}
                            placeholder = "Enter Mac Address"
                            placeholderTextColor = "rgba(189,189,189,1.0)"
                            autoCapitalize = "none"
                            onChangeText={(manualMacAddress) => this.setState({manualMacAddress})}
                            value={this.state.manualMacAddress}
                            />
                        </View>
                        <ButtonK title={'Continue'} style={styles.signInButton} onPress={()=> this.continue()} titleColor={'white'} titleFont={20} titleWeight={'bold'} />
           </View>
      
           )
        }else{
               // render QR code
              return(
                <View style={styles.containerView} >
                       {this._renderScanner()}
              </View>
         
              )
           }

      }


    render(){
        const {themeChanged} = this.state;
        return(
            <View style ={[styles.container, {backgroundColor: themeChanged ? 'rgba(27,26,29,1.0)':'rgba(249,249,249,1.0)'}]}>
             <TopHeader leftTitle={'Scan'} isDarkMode = {themeChanged} onLeftIconPress={()=> this.back()} macAddress={''}/>
             {this._renderIntroductionText()}
            </View>   

            
        )
    }
}