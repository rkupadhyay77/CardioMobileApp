import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Alert
} from 'react-native';
import getStateItem from '../../state/getStateItem'
import {DB_KEY} from '../../common/helper/keys'
import TopHeader from '../../common/component/topHeader'
import ButtonK from '../../common/component/Button'
import styles from './styles'
import { WebView } from 'react-native-webview';
import Loader from '../../common/component/loader'
import URLS from '../../common/helper/urls'
import HEADER from '../../common/helper/constants'
import moment from 'moment'
import {executeApiWith, writeData, getDevicePropertySet, getTablesData} from '../../api'
import { API_TIMEOUT } from '../../common/helper/util';
import { getBaseURL } from '../../../galenApiLibrary/config/getBaseURL';
import IconFontisto from 'react-native-vector-icons/Fontisto'
const {width, height} = Dimensions.get('window')

export default class QRReadyScreen extends Component {
    constructor(props){
        super(props)

        this.state = {themeChanged:getStateItem(DB_KEY.IS_DARK_MODE),isForProduct:props.navigation.state.params.isForProduct,isDetailSubmitted:true,firstName:'',lastName:'',email:'', loading:false, consumerRegistration: false, companyUserCreation:false
    }
    }

    back(){
        this.props.navigation.goBack()
    }

   


    continueTapped=()=>{
        const {companyUserCreation, consumerRegistration} = this.state
        if (companyUserCreation === false && consumerRegistration === false){
            alert('Please select the role check box.')
        }
        else if (consumerRegistration === true) {
            alert('Contact  your company admin to create an account')
        }
        else if (companyUserCreation === true) {
            Alert.alert(
                            "",
                            "The account created  will not be part of any company.",
                            [
                              { text: "OK", onPress: () => this.props.navigation.navigate('ScannerScreen')},
                              {
                                text: 'No',
                                onPress: () => console.log('Cancel Pressed'),
                                style: 'cancel',
                              },
                            ],
                            { cancelable: false }
                          );
                      
        }
     //  this.props.navigation.navigate('ScannerScreen')
     
     
     //this.props.navigation.navigate('CreateUserScreen')

     //this.props.navigation.navigate('CreateUserScreen', {macId:'MAC=>C4:7F:51:8D:F7:52',serialNumber:'928144-0002',manufacturer:'MN=>ATX2410-GW'});
     
    }

    submitButton(){
        const {firstName, lastName, email}  = this.state
        var message = ""


        if (firstName.trim().length === 0){
            message = "Please provide first name"
        }else if (lastName.trim().length === 0){
            message = "Please provide last name"
        }else if (email.trim().length === 0){
            message = "Please provide Email Address"
        }else if (!this.ValidateEmail(email.trim())){
            message = "Email address is not valid"
        }

        if (message.length > 0){
            alert(message)
        }else{
            this.setState({loading:true})
            // write the data in table
            this.createData(firstName,lastName,email)

        }
       

    }

    async createData(firstName,lastName,emailAddress){
        const header = this.getHeader()
        const promiseGetTablesDataTimeout = new Promise((resolve) => (setTimeout(() => resolve(false),  API_TIMEOUT.INTERVAL)))
        const resGetTablesData = await Promise.race([promiseGetTablesDataTimeout,getTablesData("QRReadyScreen:createData:74")])
        if (! resGetTablesData) {
            this.setState({loading:false})
            alert("API Delayed response for QRReadyScreen:createData:75")
            return
        }
       
        var requestOptions = {
        method: 'GET',
        headers: header,
         };

        if (resGetTablesData.status === 200){
            let jsonResponse = await resGetTablesData.json()
            
            let content = jsonResponse.content

            let filteredData = content.filter((data)=> data.name === 'ATX2410-USERx')
            
            if (filteredData.length > 0){
                 let deviceData = filteredData[0]
                 let deviceId = deviceData.deviceId
                 

                  // get the url for device property
                  const promiseGetDevicePropertySetTimeout = new Promise((resolve) => (setTimeout(() => resolve(false),  API_TIMEOUT.INTERVAL)))
                const resGetDevicePropertySet = await Promise.race([promiseGetDevicePropertySetTimeout,getDevicePropertySet(deviceId,  "QRReadyScreen:createData:96")])
                if (! resGetDevicePropertySet) {
                   this.setState({loading:false})
                    alert("API Delayed response for QRReadyScreen:createData:96")
                    return
                }
                
                if (resGetDevicePropertySet.status === 200){
                    let jsonResponse2 = await resGetDevicePropertySet.json()
                    let content2 = jsonResponse2.content

                    if (content2.length > 0){
                        let data = {"FirstName":firstName, "Lastname":lastName, "Email":emailAddress, "Mobile":"", "TimestampU":moment.utc().format()}
                          
                        let body = {"deviceDataModelId":deviceId, "data":data, "devicePropertySetId":jsonResponse2.content[0].devicePropertySetId}
                        const promiseWriteDataTimeout = new Promise((resolve) => (setTimeout(() => resolve(false),  API_TIMEOUT.INTERVAL)))
                        const resWriteData = await Promise.race([promiseWriteDataTimeout,writeData( JSON.stringify(body), "QRReadyScreen:createData")])
                        if (!resWriteData) {
                            this.setState({loading:false})
                            alert("API Delayed response for QRReadyScreen:createData");
                            return
                        }
                      if (resWriteData.status === 201 || resWriteData.status === 200){
                            let jsonResponseDeviceData = await resWriteData.text()
                            //console.log('jsonResponseDeviceData ::::: '+jsonResponseDeviceData)
                            this.setState({loading:false, isDetailSubmitted:true})
                            alert('Thanks for sharing the detail')
    
                          }else{
                            this.setState({loading:false})
                            alert('Some error occurred,Please try again later')
                          }
                        

                    }else{
                        this.setState({loading:false})
                    alert('Some error occurred,Please try again later')
                    }

                  }else{
                    this.setState({loading:false})
                    alert('Some error occurred,Please try again later')
                  }
             }else{
                this.setState({loading:false})
                alert('Some error occurred,Please try again later')
            }
        
        }else{
            this.setState({loading:false})
            alert('Some error occurred,Please try again later')
        }









        
       
    }

   ValidateEmail(inputText){
         var mailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if(inputText.match(mailFormat)){
            return true; 
        }else{
            return false
        }
  }

  async getHeader(){

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
    let url1 = getBaseURL() + "auth/refresh-token?deviceId=d36a4373-fbdc-44a3-8c96-4bb920041e40"
    let response = await executeApiWith(url1, 'POST', rawBody, headers, "QRReadyScreen:getHeader")
       
    var token = ""
    if (response.status === 200) {
      token = res.headers.map.authorization
    }

   let accessToken = "Bearer "+token
    let randomNumber = Math.floor((Math.random() * 4) + 1);
    var myHeaders = new Headers();
    myHeaders.append("X-APP-TYPE", HEADER.APP_TYPE);
    myHeaders.append("X-TENANT-DOMAIN", HEADER.TENANT_DOMAIN);
    myHeaders.append("X-API-VERSION", HEADER.API_VERSION);
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization",accessToken);

    return myHeaders
}

    
   renderWebview(){
    const {themeChanged,isForProduct,isDetailSubmitted} = this.state;
    let url = 'https://cardio.io/products/cardio'
    
    if (isForProduct && isDetailSubmitted){
        
       return(
        <WebView
        source={{
        uri: url
      }}
      style={{ flex:1}}
      />
       )
    }else if (isForProduct && !isDetailSubmitted){
        
        return(
            <View >
           
           <Text allowFontScaling={false} style= {styles.welcomeText}>Details Required</Text>

           <View style={[styles.emailTextFieldContainer, styles.layout]}> 
                  <TextInput
                            style={styles.emailTextField} 
                            onSubmitEditing={() => { this.lastNameTextInput.focus(); }}
                            returnKeyType = {'next'}
                            keyboardType = {'default'}
                            selectionColor={'black'}
                            underlineColorAndroid = {'transparent'}
                            placeholder = "Enter First Name"
                            placeholderTextColor = "rgba(189,189,189,1.0)"
                            autoCapitalize = "words"
                            onChangeText={(firstName) => this.setState({firstName})}
                            value={this.state.firstName}
                   />
            </View>


            <View style={[styles.emailTextFieldContainer, styles.layout]}> 
                  <TextInput
                            style={styles.emailTextField} 
                            onSubmitEditing={() => { this.emailTextInput.focus(); }}
                            ref={(input) => { this.lastNameTextInput = input; }}
                            returnKeyType = {'next'}
                            keyboardType = {'default'}
                            selectionColor={'black'}
                            underlineColorAndroid = {'transparent'}
                            placeholder = "Enter Last Name"
                            placeholderTextColor = "rgba(189,189,189,1.0)"
                            autoCapitalize = "words"
                            onChangeText={(lastName) => this.setState({lastName})}
                            value={this.state.lastName}
                   />
      </View>


      <View style={[styles.emailTextFieldContainer, styles.layout]}> 
                  <TextInput
                            style={styles.emailTextField} 
                            ref={(input) => { this.emailTextInput = input; }}
                            returnKeyType = {'done'}
                            keyboardType = {'email-address'}
                            selectionColor={'black'}
                            underlineColorAndroid = {'transparent'}
                            placeholder = "Enter Email Address"
                            placeholderTextColor = "rgba(189,189,189,1.0)"
                            autoCapitalize = "none"
                            onChangeText={(email) => this.setState({email})}
                            value={this.state.email}
                   />
      </View>
      
             <ButtonK title={'Submit'} style={styles.submitButton} onPress={()=> this.submitButton()} titleColor={'white'} titleFont={20} titleWeight={'bold'} />
              
           </View>
        )
     }else{
        return(<View />)
    }
   }

   _handelConsumerRegistrationCheckBox(){
    const {consumerRegistration, companyUserCreation} = this.state;
    if (consumerRegistration === true){
        this.setState({consumerRegistration: false})
    }
    else{
        this.setState({consumerRegistration: true, companyUserCreation: false}) 
    }
   
   }

   _handelCompanyUserCreationCheckBox(){
    const {consumerRegistration, companyUserCreation} = this.state;
    if (companyUserCreation === true){
        this.setState({companyUserCreation: false})
    }
    else{
        this.setState({companyUserCreation: true, consumerRegistration: false}) 
    }
   }

   renderSignupContent(){
    const {themeChanged,isForProduct, consumerRegistration, companyUserCreation} = this.state;
    if (!isForProduct){
        return(
            <View >
                <View style={styles.textContainer} >
                    <Text  allowFontScaling={false} style={styles.singInText}>To get started, please be ready with the Cardi/o device to scan the QR code on the box.</Text> 
                    <Text  allowFontScaling={false} style={styles.singInText}>  </Text> 
                    <Text  allowFontScaling={false} style={styles.singInText}>  </Text> 
                    
                   
                    <Text  allowFontScaling={false} style={styles.singInText}>  </Text> 
                   
                    <View style={styles.checkBoxContainer} >
   <TouchableOpacity style={{marginLeft:width*0.03,marginTop:15,width:20,height:20}} onPress={()=> this._handelConsumerRegistrationCheckBox()}>
      <IconFontisto name={consumerRegistration ? 'checkbox-active' : 'checkbox-passive'} size={18} color={'gray'} />
   </TouchableOpacity>

      <Text  allowFontScaling={false} style={[styles.singInText, {marginTop: 15,  fontSize : width*0.04, marginLeft: 5, height: 20}]}>Creating an account as part of the company.</Text>
     
   </View>
   <Text  allowFontScaling={false} style={[styles.singInText, {marginTop: 15,  fontSize : width*0.03, height: 20}]}>Contact  your company admin to create an account.</Text>

              
   <View style={styles.checkBoxContainer} >
   <TouchableOpacity style={{marginLeft:width*0.03,marginTop:15,width:20,height:20}} onPress={()=> this._handelCompanyUserCreationCheckBox()}>
      <IconFontisto name={companyUserCreation ? 'checkbox-active' : 'checkbox-passive'} size={18} color={'gray'} />
   </TouchableOpacity>

   <Text  allowFontScaling={false} style={[styles.singInText, {marginTop: 15,  fontSize : width*0.04, marginLeft: 5, height: 20}]}>Creating an account as a Consumer</Text>
     
   </View>
   <Text  allowFontScaling={false} style={[styles.singInText, {marginTop: 15,  fontSize : width*0.03, height: 20}]}>The account created  will not be part of any company.</Text>

              
              
              
               </View>
               
    
              <ButtonK title={'Continue'} style={styles.signInButton} onPress={()=> this.continueTapped()} titleColor={'white'} titleFont={20} titleWeight={'bold'} />
                  
               </View>
           )
    }else{
        return(<View />)
    }
       
      
   }
   renderBackgroundImage(){
    const {themeChanged,isForProduct} = this.state;
    if (!isForProduct){
        <Image source = {require('../../img/background.png')}  style = {styles.backgroundImageContainer} />
           
    }else{
        return(<View />)
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

    render(){
        const {themeChanged,isForProduct} = this.state;
        let headerTitle = isForProduct ? 'Cardio' : 'Sign up'
        return(
            <View style ={[styles.container, {backgroundColor: themeChanged ? 'rgba(27,26,29,1.0)':'rgba(249,249,249,1.0)'}]}>
           {this.renderBackgroundImage()}
               <TopHeader leftTitle={headerTitle} isDarkMode = {themeChanged} onLeftIconPress={()=> this.back()} macAddress={''}/>

            {this.renderSignupContent()}  
            {this.renderWebview()}  
            {this._renderLoader()}   
            </View>   

            
        )
    }
}