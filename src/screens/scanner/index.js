import React, { Component } from 'react';
import {
  View,
  Text,
  PermissionsAndroid,
  Platform,
 } from 'react-native';
import getStateItem from '../../state/getStateItem'
import {DB_KEY} from '../../common/helper/keys'
import TopHeader from '../../common/component/topHeader'
import styles from './styles'
import ButtonK from '../../common/component/Button'
// import CameraKitCameraScreen
import {CameraKitCameraScreen} from 'react-native-camera-kit'

const OsVer = Platform.constants['Release'];

export default class ScannerScreen extends Component {
    constructor(props){
        super(props)
        this.requestCameraPermission = this.requestCameraPermission.bind(this);
        this.onSuccess = this.onSuccess.bind(this)
        this.state = {themeChanged:getStateItem(DB_KEY.IS_DARK_MODE),qrValue:'',openScanner:false}
    }

    back(){
        this.props.navigation.goBack()
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

    async checkiOSCameraPermission(){
      const isCameraAuthorized = await Camera.checkDeviceCameraAuthorizationStatus();
              if (!isCameraAuthorized){
                Alert.alert(
                  "Unable to access the Camera",
                  "This is not a Cardio device.To enable access, go to Settings > Privacy > Camera and turn on Camera access for this app.",
                  [
                    {
                      text: "ok",
                      onPress: () =>  console.log("cancel")
                    }
                  ],
                  { cancelable: false }
                );
              }
    }

    componentDidMount(){
        if (Platform.OS === 'android') {
            
            // Calling the camera permission function
            if (parseInt(OsVer) < 10){
            this.requestCameraPermission();
            }
          } else {
              this.setState({qrValue:'', openScanner:true})

              this.checkiOSCameraPermission()
          }
    }


    continueTapped(){
        this.props.navigation.navigate('CreateUserScreen');
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
            
            if (chars !== undefined && chars !== null && chars.length > 0) {
              var mnt = chars[0];
              var mnt1 = mnt.split("MN=>");
              
              var mac = chars[1];
              var mac1 = mac.split("MAC=>");
              
              var sn = chars[2];
              var sn1 = sn.split("SN=>");
  
              if (mnt1[1] === "ATX2410-GW" || mnt1[1] === "ATX2410-EQ" || mnt1[1] === "ATX2410-VT" || mnt1[1] === "ATX2410-MD" || mnt1[1] === "ATX2410-ME"){
                
                this.props.navigation.navigate('CreateUserScreen', {macId:mac1[1],serialNumber:sn1[1],manufacturer:mnt1[1]});
              }else{
                alert('This is not a Cardio device. Please contact your administrator to setup your account.')
              }
            }else{
              alert('This is not a Cardio device. Please contact your administrator to setup your account.')
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
            // Scanner Frame color
            zoomMode="on"
            zoom = {5}
            maxZoom={10}
            onReadCode={(event) =>
              this.onBarcodeScan(event.nativeEvent.codeStringValue)
            }
          />
          )
        }
      }


    render(){
        const {themeChanged} = this.state;
        return(
            <View style ={[styles.container, {backgroundColor: themeChanged ? 'rgba(27,26,29,1.0)':'rgba(249,249,249,1.0)'}]}>
             <TopHeader leftTitle={'Scan'} isDarkMode = {themeChanged} onLeftIconPress={()=> this.back()} macAddress={''}/>
             <View style={styles.containerView}>
               {this._renderScanner()}
             </View>
            </View>   

            
        )
    }
}