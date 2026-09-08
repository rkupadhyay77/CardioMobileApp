/**
 * cardio App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { Component } from 'react';
import {
  Image,
  View,
  Text,
  Alert,
  TextInput,
  TouchableOpacity,
  PermissionsAndroid,
  AlertIOS,
  Dimensions,
  Platform,
  StatusBar
} from 'react-native';


import ButtonK from '../../common/component/Button'
import styles from './styles'
import Loader from '../../common/component/loader'

import {RESPONSE_MESSAGE, DB_KEY} from '../../common/helper/keys'
import setStateItem from '../../state/setState/setStateItem'
import getStateItem from '../../state/getStateItem'
import DatabaseManager from '../../Database'
import Icon from 'react-native-vector-icons/Ionicons'
import IconFontisto from 'react-native-vector-icons/Fontisto'
import TouchID from 'react-native-touch-id'
import {checkBiometricSupportedEnrolled} from '../../biometric'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import {LoginMounted,CustomDataObtained,CustomDataChange} from '../../state/emitters'
import Policy from '../../screens/policy'
import messaging from '@react-native-firebase/messaging';

import { setEndPoint } from '../../../galenApiLibrary/config/getBaseURL';
import { App_login , Do_Galen_login, Galen_login, Do_Cardio_login} from "../../../galenApiLibrary/login";
import Orientation from 'react-native-orientation-locker'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { identifyUser } from '../../analytics/posthog';

const {width, height} = Dimensions.get('window')
const OsVer = Platform.constants['Release'];
export default class LoginScreen extends Component {
  constructor(props) {
      super(props)
      
      
      this.requestCameraPermission = this.requestCameraPermission.bind(this);
      this.loginWithCredential =  this.loginWithCredential.bind(this)
      this.eventLoginMounted = this.eventLoginMounted.bind(this)
      this.eventCustomDataObtained = this.eventCustomDataObtained.bind(this)
      this.eventCustomDataChange = this.eventCustomDataChange.bind(this)
      this.checkForStatsTheme =  this.checkForStatsTheme.bind(this)

       this.state = {
        email: getStateItem(DB_KEY.USER_EMAIL)?getStateItem(DB_KEY.USER_EMAIL):'',
        password: getStateItem(DB_KEY.USER_PASSWORD) ?  getStateItem(DB_KEY.USER_PASSWORD) : '',
        loading:false,
        checked:getStateItem(DB_KEY.TERMS_CHECKED),
        privacyChecked:getStateItem(DB_KEY.PRIVACY_CHECKED),
        showBiometricOption:false,
        previousUser:'',
        showPolicy:false,
        isChecked:getStateItem(DB_KEY.USER_PASSWORD) ? true : false,
        showPractice: false,
        selectedEndpoint: 'Auto'
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
        //this.setState({qrValue:'', openScanner:true})
      } else {
        //alert('CAMERA permission denied');
      }
    } catch (err) {
     // alert('Camera permission err', err);
     // console.warn(err);
    }
  }


 async getsm(){
  let result = await checkBiometricSupportednEnrolled()
 
 }

 eventCustomDataObtained=()=>{
   this.setState({loading:false,showPolicy:true})
 }

 eventCustomDataChange=()=>{
  this.setState({loading:true})
  this.props.navigation.navigate('CustomTabBar');
  this.checkForStatsTheme()
  this.setState({showPolicy:false});
 }

 eventLoginMounted=()=>{
  
   
   DatabaseManager.getBiometricConfigured((status)=>{
    if (status !== null && status !== undefined){
      this.setState({showBiometricOption:true})
    }
  })

   this.setState({ email:getStateItem(DB_KEY.USER_EMAIL)?getStateItem(DB_KEY.USER_EMAIL):'',
   password: getStateItem(DB_KEY.USER_PASSWORD)?getStateItem(DB_KEY.USER_PASSWORD):'',
   loading:false,
   checked:!getStateItem(DB_KEY.TERMS_CHECKED),
   privacyChecked:!getStateItem(DB_KEY.PRIVACY_CHECKED),
   showBiometricOption:false,
   })

   this.setEmailPassword()

   
 }

 async setEmailPassword() {
   var email = await AsyncStorage.getItem(DB_KEY.KEY_CHAIN_EMAIL);
  var password = await AsyncStorage.getItem(DB_KEY.KEY_CHAIN_PASSWORD);
  if (email && email.trim() !== '') {
    console.log('Email exists:', email);
  } else {
    console.log('Email is missing or empty');
    email = ''
  }


  if (password && password.trim() !== '') {
    console.log('Password exists');
  } else {
    console.log('Password is missing or empty');
    password = ''
  }

  this.setState({email: email, password: password})
 }

 async requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
  }
}




  componentDidMount(){
    LoginMounted.addLoginMountedListener(this.eventLoginMounted)
    CustomDataObtained.addCustomDataObtainedListener(this.eventCustomDataObtained)
    CustomDataChange.addCustomDataChangeListener(this.eventCustomDataChange)


    setTimeout(() => {
      Orientation.unlockAllOrientations()
      Orientation.lockToPortrait()
      StatusBar.setHidden(false);
    }, 500);


    this.clearData()

    this.setState({checked:getStateItem(DB_KEY.TERMS_CHECKED),
    privacyChecked:getStateItem(DB_KEY.PRIVACY_CHECKED)})

  
   


    DatabaseManager.getBiometricConfigured((status)=>{
      if (status !== null && status !== undefined){
        this.setState({showBiometricOption:true})
      }
    })


    if (Platform.OS === 'android') {
            
      // Calling the camera permission function
      if (parseInt(OsVer) < 10){
      this.requestCameraPermission();
      }
      PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
    }else{
      this.requestUserPermission()
    }

 
    if (this.state.email.length === 0) {
     // this.setState({email: getStateItem(DB_KEY.USER_EMAIL)?getStateItem(DB_KEY.USER_EMAIL):'', password: getStateItem(DB_KEY.USER_PASSWORD) ?  getStateItem(DB_KEY.USER_PASSWORD) : ''})
     this.setEmailPassword()
   }
    
  }

  componentWillUnmount(){
    LoginMounted.removeLoginMountedListener(this.eventLoginMounted)
    CustomDataObtained.removeCustomDataObtainedListener(this.eventCustomDataObtained)
    CustomDataChange.removeCustomDataChangeListener(this.eventCustomDataChange)
  }

  handleEmail(text){
    this.setState({ email: text })
  }
  
  handlePassword = (text) => {
    this.setState({ password: text })
  }

  async handleAllow(){
    DatabaseManager.setBiometricConfigured()
  }


  

 

  _handelUserCredantials(){
    
    const {email, password, isChecked,showBiometricOption} = this.state
    if (isChecked){
     
    if (showBiometricOption === false){
        Alert.alert(
          "Biometric login",
          "Please allow biometric to login in cardio application",
          [
            {
              text: "Not now",
              style: "cancel"
            },
            { text: "Allow", onPress: () => this.handleAllow()}
          ],
          { cancelable: true }
        );
      }
    }

  }


  goToResidentsSimulation(){
    const {isChecked} = this.state
    const userName =  getStateItem(DB_KEY.USER).emailAddress
    setStateItem(DB_KEY.USER_NAME,userName)
    setStateItem(DB_KEY.USER_EMAIL,userName)
    setStateItem(DB_KEY.USER_PASSWORD, isChecked === true ? this.state.password: '')
  
    setStateItem(DB_KEY.LOGIN_TIME, new Date().getTime()) 
    setStateItem(DB_KEY.LOGIN_NAV, this.props.navigation)
    setStateItem(DB_KEY.REPORTS_ARRAY,[])
    this.checkForStatsTheme()
    // set data in localDB for the user
    DatabaseManager.getUserProfileData(userName,(profileData)=>{
      if (profileData !== null && profileData !== undefined){
        if (profileData.localReadAlertArray !== undefined && profileData.localReadAlertArray !== null){
          setStateItem(DB_KEY.LOCAL_READ_ALERT_ARRAY,profileData.localReadAlertArray )
        }else{
          setStateItem(DB_KEY.LOCAL_READ_ALERT_ARRAY,[])
        }

        setStateItem(DB_KEY.LOCAL_DB_USER,profileData)
        let  designView = profileData.designView 
        setStateItem(DB_KEY.STATS_THEME, designView)

        setStateItem(DB_KEY.IS_DARK_MODE, profileData.isDarkTheme)
        setStateItem(DB_KEY.IS_UNIT_FAHRENHEIT, profileData.isFahrenheit)
        this._handelUserCredantials()
        this.props.navigation.navigate('CustomTabBar');
        this.checkForStatsTheme()
        setStateItem(RESPONSE_MESSAGE.SUCCESS,'')
      }else{
        const localDbUser = { isDarkTheme: false  , isFahrenheit : true , profilePicPath : "", filterApplied:['ALL']}
        setStateItem(DB_KEY.IS_DARK_MODE, false)
        setStateItem(DB_KEY.IS_UNIT_FAHRENHEIT, true)
        setStateItem(DB_KEY.LOCAL_DB_USER,localDbUser)

        let  user = getStateItem(DB_KEY.USER)
        let TERMS_CHECKED= user.acceptedTermsOfUse?user.acceptedTermsOfUse:false
      
        if (TERMS_CHECKED !== undefined &&  TERMS_CHECKED !== null && TERMS_CHECKED === true){
          this._handelUserCredantials()
          this.props.navigation.navigate('CustomTabBar');
        
        }else{
          this.setState({loading:false,showPolicy:true})
        }

        this.checkForStatsTheme()

        setStateItem(RESPONSE_MESSAGE.SUCCESS,'')
        
      
      }

    })
  }


  goToResidents(){
    const {isChecked} = this.state
    const userName =  getStateItem(DB_KEY.USER).emailAddress
    setStateItem(DB_KEY.USER_NAME,userName)
    setStateItem(DB_KEY.USER_EMAIL,userName)
    setStateItem(DB_KEY.USER_PASSWORD, isChecked === true ? this.state.password: '')
  
    setStateItem(DB_KEY.LOGIN_TIME, new Date().getTime()) 
       setStateItem(DB_KEY.LOGIN_NAV, this.props.navigation)
       setStateItem(DB_KEY.REPORTS_ARRAY,[])
       this.checkForStatsTheme()
// check if settings exist for the same user in localDB

                    DatabaseManager.getUserProfileData(userName,(profileData)=>{
                      
                      if (profileData !== null && profileData !== undefined){
                          // set the user in state to be used at other place in the app

                          
                          if (profileData.localReadAlertArray !== undefined && profileData.localReadAlertArray !== null){
                            setStateItem(DB_KEY.LOCAL_READ_ALERT_ARRAY,profileData.localReadAlertArray )
                          }else{
                            setStateItem(DB_KEY.LOCAL_READ_ALERT_ARRAY,[])
                          }

                          setStateItem(DB_KEY.LOCAL_DB_USER,profileData)
                         let  designView = profileData.designView 
                          setStateItem(DB_KEY.STATS_THEME, designView)
                          console.log('RKDebug:goToResidents:designView:', designView)
                         // GraphTypeChanged.emit('GRAPH_TYPE_CHANGED');

                          setStateItem(DB_KEY.IS_DARK_MODE, profileData.isDarkTheme)
                          setStateItem(DB_KEY.IS_UNIT_FAHRENHEIT, profileData.isFahrenheit)
                          
                          const localDb = getStateItem(DB_KEY.LOCAL_DB_USER)
                        

                        let  user = getStateItem(DB_KEY.USER)
                        let TERMS_CHECKED= true //user.acceptedTermsOfUse?user.acceptedTermsOfUse:false

                          if (TERMS_CHECKED !== undefined &&  TERMS_CHECKED !== null && TERMS_CHECKED === true){
                            checkBiometricSupportedEnrolled((result)=>{
                              if (result !== true && this.state.showBiometricOption === false){
                              Alert.alert(
                                "Error",
                                result,
                                [
                                  {
                                    text: "OK",
                                    style: "cancel"
                                  }],
                                { cancelable: true }
                              );
                              }else if (this.state.isChecked === true && result === true){
                              
                              if (this.state.showBiometricOption === false){
                                Alert.alert(
                                  "Biometric login",
                                  "Please allow biometric to login in cardio application",
                                  [
                                    {
                                      text: "Not now",
                                      style: "cancel"
                                    },
                                    { text: "Allow", onPress: () => this.handleAllow()}
                                  ],
                                  { cancelable: true }
                                );
                              }
                              }
                            })

                            this.props.navigation.navigate('CustomTabBar');
                          
                          }else{
                            this.setState({loading:false,showPolicy:true})
                          }
                          this.checkForStatsTheme()
                          setStateItem(RESPONSE_MESSAGE.SUCCESS,'')
                      }else{
                        
                          // user does not exist in the local Database create one with default properties 
                          // save to local DB & also to the state to be used in other part of the application
                          const localDbUser = { isDarkTheme: false  , isFahrenheit : true , profilePicPath : "", filterApplied:['ALL']}
                          setStateItem(DB_KEY.IS_DARK_MODE, false)
                          setStateItem(DB_KEY.IS_UNIT_FAHRENHEIT, true)
                          setStateItem(DB_KEY.LOCAL_DB_USER,localDbUser)
                          //let TERMS_CHECKED = getStateItem(DB_KEY.TERMS_CHECKED)

                          
                          let  user = getStateItem(DB_KEY.USER)
                          let TERMS_CHECKED= user.acceptedTermsOfUse?user.acceptedTermsOfUse:false
                        
                          if (TERMS_CHECKED !== undefined &&  TERMS_CHECKED !== null && TERMS_CHECKED === true){
                            checkBiometricSupportedEnrolled((result)=>{
                              if (result !== true && this.state.showBiometricOption === false){
                              Alert.alert(
                                "Error",
                                result,
                                [
                                  {
                                    text: "OK",
                                    style: "cancel"
                                  }],
                                { cancelable: true }
                              );
                              }else if (this.state.isChecked === true && result === true){
                               
  
                              if (this.state.showBiometricOption === false){
                                Alert.alert(
                                  "Biometric login",
                                  "Please allow biometric to login in cardio application",
                                  [
                                    {
                                      text: "Not now",
                                      style: "cancel"
                                    },
                                    { text: "Allow", onPress: () => this.handleAllow()}
                                  ],
                                  { cancelable: true }
                                );
                              }
                              }
                            })
                             this.props.navigation.navigate('CustomTabBar');
                          
                          }else{
                            this.setState({loading:false,showPolicy:true})
                          }

                          this.checkForStatsTheme()

                         setStateItem(RESPONSE_MESSAGE.SUCCESS,'')
                      
                      }
                    })


             }

  validate(){
    var message = ''

    if(this.state.email.length === 0){
      message = 'Please enter username/email'
    }else if(this.state.password.length === 0){
      message = 'Please enter password'
    }

    return message
  }

  validateCheckbox(){
    var message = ''

    if(this.state.checked === false){
      message = 'Please read the terms & condition first'
    }else if(this.state.privacyChecked === false){
      message = 'Please read the privacy policy first'
    }

    return message
  }



  async signInTapped(){
    const {email, password, isChecked} = this.state;
    let message = this.validate()
    if  (message === ''){
      if (isChecked) {
        setStateItem(DB_KEY.KEY_CHAIN_EMAIL, this.state.email)
        setStateItem(DB_KEY.KEY_CHAIN_PASSWORD, this.state.password)

        await AsyncStorage.setItem(DB_KEY.KEY_CHAIN_EMAIL, email);
        await AsyncStorage.setItem(DB_KEY.KEY_CHAIN_PASSWORD, password);
       
      }

      this.setState({loading:true})
      let response = await Do_Cardio_login(email, password, Platform.OS)
      this.setState({loading:false})
      if (response.status === "success") {
        setEndPoint('NEW')
        let res = response.response
        setStateItem(DB_KEY.USER, res)
        console.log('userId:', res.userId, 'emailAddress:', res.emailAddress, 'fullName:', res.fullName);

        identifyUser(
          res.userId,
          res.emailAddress,
          res.fullName
        );
       // this.goToResidentsSimulation()
        this.goToResidents()
       }else{
          alert(response.message)
       }
    }else{
      alert(message)
    }
  }

  termsCondition= (isForTerms) => {
    this.props.navigation.navigate('TermsScreen',{isForTerms:isForTerms})
}

  forgetPasswordTapped = () => {
     this.props.navigation.navigate('ForgetPassword')
}

hasMedhabDomain(email) {
  // Regex: 
  // ^.+@    : Start with any characters, followed by @
  // medhab  : Literal string 'medhab'
  // \.      : Followed by a dot (domain extension)
  // /i      : Case insensitive

  if (email === "sajol_office2@cardio.io") {
    return true
  }
  
  const regex = /^.+@medhab\./i;                
  return regex.test(email);
 
}

_renderLoader() {
    const {loading} = this.state

    if (loading) {
        return (<Loader />)
    }else{
        return (<View />)
    }
}

clearData(){
  setStateItem(DB_KEY.ACCESS_TOKEN,'')
  setStateItem(DB_KEY.USER,null)
  setStateItem(DB_KEY.IS_DARK_MODE,false)
  setStateItem(DB_KEY.RESIDENT_DATA,null)
  setStateItem(DB_KEY.SELECTED_DEVICE_ID,null)
  setStateItem(DB_KEY.SELECTED_MAC_ADDRESS,null)  
  setStateItem(DB_KEY.SIGNAL_SYNC_ARRAY,[])
  setStateItem(DB_KEY.RESIDENT_SIGNAL_SYNC_ARRAY,[])
  setStateItem(RESPONSE_MESSAGE.SUCCESS,'')
  setStateItem(RESPONSE_MESSAGE.FAILURE,'')
  setStateItem(DB_KEY.ALERTS_ARRAY,[])
  setStateItem(DB_KEY.NUMBER_OF_ALERTS,0)
  setStateItem(DB_KEY.LOCAL_RESIDENT_LIST,[])
  setStateItem(DB_KEY.DRAWER_NAV,null)

}

checkUnCheckTerms(){
  this.setState({checked:!this.state.checked})
  setStateItem(DB_KEY.TERMS_CHECKED, this.state.checked)
  
}

checkUnCheckPrivacy(){
  this.setState({privacyChecked:!this.state.privacyChecked})
  setStateItem(DB_KEY.PRIVACY_CHECKED, this.state.privacyChecked)
}

checkIfBiometricEnabled(){
  const optionalConfigObject = {
    unifiedErrors: false, // use unified error messages (default false)
    passcodeFallback: false // if true is passed, it will allow isSupported to return an error if the device is not enrolled in touch id/face id etc. Otherwise, it will just tell you what method is supported, even if the user is not enrolled.  (default false)
}
  TouchID.isSupported(optionalConfigObject)
  .then(biometryType => {
    if (biometryType) {
      alert(True);
  } else {
let fingerprintLableForOS = Platform.OS == "ios" ? "Touch ID" : "Fingerprint";
alert( fingerprintLableForOS + " is not available on this device");
  }
  }).catch(error => {
 // iOS Error Format and android error formats are different
               // android use code and ios use name
               // check at https://github.com/naoufal/react-native-touch-id
               let errorCode = Platform.OS == "ios" ? error.name : error.code;
               if (errorCode === "LAErrorTouchIDNotEnrolled" || errorCode === "NOT_AVAILABLE" || errorCode === "NOT_ENROLLED") {
             let fingerprintLableForOS = Platform.OS == "ios" ? "Touch ID" : "Fingerprint";
                   alert(fingerprintLableForOS + " has no enrolled fingers. Please go to settings and enable " + fingerprintLableForOS + " on this device.");
               } else {
                alert(Platform.OS == "ios" ? error.message : translations.t(error.code));
               }
  })
}

async loginWithCredential(username,password){
  const {selectedEndpoint} = this.state;
    this.setState({loading:true})
     let response = await App_login(username, password, Platform.OS)
    if (selectedEndpoint === 'NEW') {
      let response1 = await Do_Galen_login(email, password, Platform.OS)
    }
     this.setState({loading:false})
     if (response.status === "success") {
      let res = response.response
      setStateItem(DB_KEY.USER, res)
      this.goToResidents()
     }else{
        alert(response.message)
     }
}

async startAuthentication(){
  TouchID.authenticate()
  .then(success => {
    this.setState({loading:true})
    var username = getStateItem(DB_KEY.KEY_CHAIN_EMAIL)
    var password = getStateItem(DB_KEY.KEY_CHAIN_PASSWORD)

   
    

    if (username !== '' && password != ''){

      let response = Do_Cardio_login(username, password, Platform.OS)
      this.setState({loading:false})
      if (response.status === "success") {
        setEndPoint('NEW')
        let res = response.response
        setStateItem(DB_KEY.USER, res)
        this.goToResidents()
       }else{
          //alert(response.message)
          this.setState({loading:false})
       }
    }
    else {
      alert('Not able to fetch credantials from Keychain.')
      this.setState({loading:false})
    }
  
  
  })
  .catch(error => {
    AlertIOS.alert(error.message);
  });
}

async handelLogin() {
  const email = await AsyncStorage.getItem(DB_KEY.KEY_CHAIN_EMAIL);
  const password = await AsyncStorage.getItem(DB_KEY.KEY_CHAIN_PASSWORD);
  

 if (email.length > 0  && password.length > 0){
   let response = await Do_Cardio_login(email, password, Platform.OS)
      this.setState({loading:false})
      if (response.status === "success") {
        setEndPoint('NEW')
        let res = response.response
        setStateItem(DB_KEY.USER, res)
        this.goToResidents()
       }else{
          //alert(response.message)
          this.setState({loading:false})
       }
      }else{
        alert('Error while fetching credantials from keychain')
        return
      }
}

async biometricLogin(){

  checkBiometricSupportedEnrolled((result)=>{
    
    if(result !== true){
     Alert.alert(
       "Error",
       result,
       [
         {
           text: "OK",
           style: "cancel"
         }],
       { cancelable: true }
     );
    }else if(result===true){
     
      let result =  TouchID.authenticate()
      if (result) {
        this.handelLogin()
      }
      else{
        alert('Failed to authenticate TouchId')
        return
      }
    
    }
  })
 
  
}



async biometricLoginTapped(){
 


   

   checkBiometricSupportedEnrolled((result)=>{
    
     if(result !== true){
      Alert.alert(
        "Error",
        result,
        [
          {
            text: "OK",
            style: "cancel"
          }],
        { cancelable: true }
      );
     }else if(result===true){
      
      this.startAuthentication()
     
     }
   })


   
}

_renderBiometricLoginOption(){
  const {showBiometricOption} = this.state
  if (showBiometricOption){
    return(
<View style={styles.biometricContainer}>
      <TouchableOpacity style={[styles.buttonTop,{flexDirection:'row'}]} onPress={ ()=> this.biometricLogin()}>
       <Icon name={'finger-print'} size={20} color={'rgba(94,21,42,1.0)'} />
      <Text  allowFontScaling={false} style={styles.biometricText}>Tap to Biometric Login</Text>
    </TouchableOpacity>
    </View>
    )
  }
}

signupTapped=()=>{
  this.props.navigation.navigate('QRReadyScreen',{isForProduct:false})
  
}

goHereTapped=()=>{
  this.props.navigation.navigate('QRReadyScreen',{isForProduct:true})
  
}

_renderSignupButton(){
  return(
    <View style={styles.signupBtnContainer}>
          <Text  allowFontScaling={false} style={[styles.initialText, {fontSize:16, fontWeight: 'bold'}]}>Don't have an account?</Text>
          <TouchableOpacity onPress={()=> this.signupTapped()}><Text allowFontScaling={false} style={styles.signupText} > Sign Up</Text></TouchableOpacity>
     </View> 
  )
}



_renderNoDeviceButton(){
  return(
    <View style={[styles.noDeviceBtnContainer]}>
          <Text  allowFontScaling={false} style={[styles.initialText,{marginTop:4, fontSize:15}]}>If you don't have the Hardware Device?</Text>
          <TouchableOpacity onPress={()=> this.goHereTapped()}><Text allowFontScaling={false}  style={[styles.signupText,{fontSize:15,marginTop:4}]} > Go Here</Text></TouchableOpacity>
     </View> 
  )
}


onPress(){
 this.setState({loading:true})
 const localDb = getStateItem(DB_KEY.LOCAL_DB_USER)
 localDb.isPrivacyTapped = true

 DatabaseManager.saveUserProfileData(getStateItem(DB_KEY.USER).emailAddress, localDb)

 this.setState({loading:true})
  this.props.navigation.navigate('CustomTabBar');
  this.checkForStatsTheme()
  this.setState({showPolicy:false});

 //setUsersCustomData()

}

checkForStatsTheme() {
  console.log('RKDebug:checkForStatsTheme called:', getStateItem(DB_KEY.STATS_THEME))
  if (getStateItem(DB_KEY.STATS_THEME) === null || getStateItem(DB_KEY.STATS_THEME) === ''){
    setStateItem(DB_KEY.STATS_THEME, 'H-R View')
    console.log('RKDebug:checkForStatsTheme set to H-R View')
  //  GraphTypeChanged.emit('GRAPH_TYPE_CHANGED');
  }
  else {
    let theme = getStateItem(DB_KEY.STATS_THEME)
    if (theme !== 'Classic View' && theme !== 'PlotView' && theme !== "H-R View") {
      setStateItem(DB_KEY.STATS_THEME, 'H-R View')
      console.log('RKDebug:checkForStatsTheme set to H-R View')
     // GraphTypeChanged.emit('GRAPH_TYPE_CHANGED');
    }
  }
}

endpointSelected(endpoint) {
  const {selectedEndpoint} = this.state
  if (endpoint !== selectedEndpoint) {
    this.setState({selectedEndpoint: endpoint})
  }
}

_renderUi(){
  const {showPolicy} = this.state
  const {checked,privacyChecked,showBiometricOption, selectedEndpoint} = this.state
  const isSelectedGalen = selectedEndpoint === 'Galen'
  const isSelectedNew = selectedEndpoint === 'New'
  const isSelectedAuto = selectedEndpoint === 'Auto'
  if (showPolicy){
    return(<Policy onPress={()=>this.onPress()} nav={this.props.navigation}/>)
  }else{
    return(
      <View>
      <Text  allowFontScaling={false} style= {styles.welcomeText}>Welcome,</Text>
      
      <Image style = {[styles.logo, {marginTop:showBiometricOption ? height*0.05 : height*0.08 , height: showBiometricOption ? height*0.12 : height*0.13}]} source ={require('../../img/cardioLogo.png')}  /> 

      {this._renderSignupButton()}
     
     {/*
       <View style={styles.spacerContainer}>
           <View style={styles.spacer}>
                <TouchableOpacity  style={[styles.buttonSpacer, {backgroundColor : isSelectedGalen ? 'gray' : 'transparent', borderColor:  isSelectedGalen ? 'transparent' : 'gray' }]} onPress={()=> this.endpointSelected('Galen')}>
                    <Text> Galen Cloud</Text>
                </TouchableOpacity>
                <TouchableOpacity  style={[styles.buttonSpacerMiddle,  {backgroundColor : isSelectedNew ? 'gray' : 'transparent', borderColor:  isSelectedNew ? 'transparent' : 'gray' } ]}  onPress={()=> this.endpointSelected('New')}>
                <Text> Cardio Cloud</Text>
                </TouchableOpacity>
                <TouchableOpacity  style={[styles.buttonSpacerRight,  {backgroundColor : isSelectedAuto ? 'gray' : 'transparent', borderColor:  isSelectedAuto ? 'transparent' : 'gray' } ]}  onPress={()=> this.endpointSelected('Auto')}>
                <Text> Auto Login</Text>
                </TouchableOpacity>
             </View>
      </View>
     */}
    
     
     <View style={styles.topHeight}>
     <Text  allowFontScaling={false} style= {styles.singInText}>Sign into your account</Text>
     
     <View style={[styles.emailTextFieldContainer, styles.layout]}> 
      <TextInput
      allowFontScaling={false}  
      style={styles.emailTextField} 
      onSubmitEditing={() => { this.passwordTextInput.focus(); }}
      returnKeyType = {'next'}
      keyboardType = {'email-address'}
      selectionColor={'black'}
      underlineColorAndroid = {'transparent'}
      placeholder = "Enter email address"
      placeholderTextColor = "rgba(189,189,189,1.0)"
      autoCapitalize = "none"
      onChangeText={(email) => this.setState({email})}
      value={this.state.email}
     />
      </View>


      <View style={[styles.passwordTextFieldContainer, styles.layout]}> 
      <TextInput
       allowFontScaling={false}  
     style={styles.passwordTextField} 
       ref={(input) => { this.passwordTextInput = input; }}
       returnKeyType = {'done'}
       keyboardType = {'default'}
      selectionColor={'black'}
      underlineColorAndroid = {'transparent'}
      placeholder = "Password"
      placeholderTextColor = "rgba(189,189,189,1.0)"
      autoCapitalize = "none"
      secureTextEntry = {true}
      onChangeText={(password) => this.setState({password})}
      value={this.state.password}
/>
      </View>
     </View>
   

   <View style={styles.checkBoxContainer} >
   <TouchableOpacity style={{marginLeft:width*0.08,marginTop:15,width:20,height:20}} onPress={()=> this.setState({isChecked:!this.state.isChecked})}>
      <IconFontisto name={this.state.isChecked ? 'checkbox-active' : 'checkbox-passive'} size={18} color={'gray'} />
   </TouchableOpacity>

      <Text  allowFontScaling={false} style={styles.rememberCredantial}>Remember my credential</Text>

   </View>
      {this._renderBiometricLoginOption()}

    <ButtonK title={'Sign In'} style={styles.signInButton} onPress={()=> this.signInTapped()} titleColor={'white'} titleFont={20} titleWeight={'bold'} />
  
    <TouchableOpacity style={styles.buttonTop} onPress={ ()=> this.forgetPasswordTapped()}>
      <Text  allowFontScaling={false} style={styles.forgetPassword}>Forgot Password? </Text>
    </TouchableOpacity>
  
 
  {this._renderNoDeviceButton()}
  {this._renderVersions()}

    {this._renderLoader()}
      
      </View>
    )
  }
}

_renderVersions() {
  let version = getStateItem("version")
  return (
    <View style={styles.versionContainer}>
      <Text>version : {version}</Text>
    </View>
  )
}
  

  render(){
    const {checked,privacyChecked} = this.state
  
    
      return(
        <KeyboardAwareScrollView
      style={{ backgroundColor: '#4c69a5' }}
      resetScrollToCoords={{ x: 0, y: 0 }}
      contentContainerStyle={styles.container}
      scrollEnabled={false}
    >
            <Image source = {require('../../img/background.png')}  style = {styles.backgroundImageContainer} />
            {this._renderUi()} 
           
           
           </KeyboardAwareScrollView>

      )
  }
}
