import React, { Component } from 'react';
import {
  View,
  Text,
  Dimensions,
  TextInput,
  Alert,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import getStateItem from '../../../state/getStateItem'
import setStateItem from '../../../state/setState/setStateItem'
import {DB_KEY, RESPONSE_MESSAGE} from '../../../common/helper/keys'
import TopHeader from '../../../common/component/topHeader'
import ButtonK from '../../../common/component/Button'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import {ValidateEmail} from '../../../common/helper/validate'
import Loader from '../../../common/component/loader'
import Icon from 'react-native-vector-icons/Entypo'
import DatabaseManager from '../../../Database'

// import emitter and the api 

import { registerUser } from '../../../../galenApiLibrary/createUser';

import { setEndPoint } from '../../../../galenApiLibrary/config/getBaseURL';
import styles from './styles'

const {width , height }  = Dimensions.get('window')

export default class CreateUserScreen extends Component {
    constructor(props){
        super(props)
        //macId:props.navigation.state.params.macId
        this.eventRegisterUserDidChange = this.eventRegisterUserDidChange.bind(this);
        this.state = {themeChanged:getStateItem(DB_KEY.IS_DARK_MODE),macId:props.navigation.state.params.macId,serialNumber:props.navigation.state.params.serialNumber,manufacturer:props.navigation.state.params.manufacturer,firstName:'',email:'',lastName:'',password:'',confirmPassword:'',loading:false, passwordEyeOn:false,confirmPasswordEyeOn:false}
    }

    componentDidMount(){
         setEndPoint('NEW')
     }

    componentWillUnmount(){
    }

    eventRegisterUserDidChange(){
        // callback when registration is done with either error or success
        
        this.setState({loading:false})
        console.log("eventRegisterUserDidChange"+getStateItem(RESPONSE_MESSAGE.FAILURE))
    
    if (getStateItem(RESPONSE_MESSAGE.FAILURE).length > 0){
        const message = getStateItem(RESPONSE_MESSAGE.FAILURE)
        if (message === 'DuplicateItemException: user-email-address-already-exists-for-this-tenant' || message === 'An account with this email already exists'){
            setStateItem(RESPONSE_MESSAGE.FAILURE,'')
            Alert.alert(
                'Error',
                "Email address "+this.state.email+" already exist, Do you want to send activation code on this email?",
                [
                  {text: 'Yes', onPress: () => this.props.navigation.navigate('ValidateUserScreen', {email:this.state.email})},
                  {text: 'No',style: "cancel"}
                ],
                { cancelable: false }
              )
        }else{
            alert(message)
        }
      
      
    }else if (getStateItem(RESPONSE_MESSAGE.SUCCESS).length > 0){
      setStateItem(RESPONSE_MESSAGE.SUCCESS,'')
      
      let scannedUserArray = getStateItem(DB_KEY.SCANNED_USER_ARRAY)
      // check if
      var isDataFound = false 
      if (scannedUserArray.length > 0){
          for(var index=0; index < scannedUserArray.length ; index++){
              let data = scannedUserArray[index]

                if (data.email === this.state.email){
                    let dataToPush={macId:this.state.macId, serialNumber:this.state.serialNumber,email:this.state.email,manufacturer:this.state.manufacturer}
                    scannedUserArray[index] = dataToPush
                    isDataFound = true
                }
          }
      }

      if (isDataFound === false){
        let dataToPush={macId:this.state.macId, serialNumber:this.state.serialNumber,email:this.state.email,manufacturer:this.state.manufacturer}
        scannedUserArray.push(dataToPush)
      }
      
     setStateItem(DB_KEY.SCANNED_USER_ARRAY,scannedUserArray)

      DatabaseManager.setMacAddress(this.state.macId,this.state.email)
      Alert.alert(
        'Success',
        "1. One-time passcode sent to e-mail address provided.\n\n 2. Check inbox/spam folder for email from info@galendata.com\n\n 3. Copy passcode from “Account Activation Code” email received.\n\n 4.  Press Register to enter passcode on next screen.",
        [
          {text: 'Register', onPress: () => this.props.navigation.navigate('ValidateUserScreen', {email:this.state.email})},
          {text: 'Cancel',style: "cancel"}
        ],
        { cancelable: false }
      )
    }
        
    }

    back(){
        this.props.navigation.goBack()
    }

    async registerUser(){
        
        const {firstName, lastName, email, password, confirmPassword} = this.state
         let message = this.validation()
         if (message.length > 0){
             alert(message)
         }else{
             this.setState({loading:true})
            let res = await registerUser(email, password, confirmPassword, firstName, lastName)
            console.log("status"+res.status)
            if (res.status === 200 || res.status === 201) {
                console.log("if block"+res.status)
                setStateItem(RESPONSE_MESSAGE.SUCCESS, 'REGISTERED')
                setStateItem(RESPONSE_MESSAGE.FAILURE, "")
              }else{
                console.log("else  block"+res.status)
                let errorText = await res.text()
                console.log("else  errorText"+errorText)
                setStateItem(RESPONSE_MESSAGE.FAILURE, errorText)
                setStateItem(RESPONSE_MESSAGE.SUCCESS, '')
              } 

              this.eventRegisterUserDidChange()
         }
      
        
    }

    validation(){
        // validate if all the fields are given properly
        const {firstName, lastName, email, password, confirmPassword} = this.state
var message = ''

        if (firstName.length === 0){
            message = 'Please provide user first name'
        }else if (lastName.length === 0){
            message = 'Please provide user last name'
        }else if (email.length === 0){
            message = 'Please provide user email address'
        }else if (password.length === 0){
            message = 'Please provide user password'
        }else if (confirmPassword.length === 0){
            message = 'Please provide user confirm password'
        }else if (password.length < 8){
            message = 'Please must be 8 characters long and should be in format Abc1234# format'
        }else if (password !== confirmPassword){
            message = 'Password and confirm password does not match'
        }else{
            const pattern = /[^A-Za-z0-9]/;
            if (pattern.test(password) === false){
                 message = "Password does not meet the criteria \n\n 1. Must be 8 characters  \n 2. Includes at least (1) uppercase \n 3. Includes at least (1) lowercase \n 4. Includes at least (1) number \n 5. Includes at least and (1) special character." 
             }
        }

        return message
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
        const {themeChanged,passwordEyeOn,confirmPasswordEyeOn} = this.state;
         
        
        return(
            <KeyboardAwareScrollView
            style ={[styles.container, {backgroundColor: themeChanged ? 'rgba(27,26,29,1.0)':'rgba(249,249,249,1.0)'}]}
            resetScrollToCoords={{ x: 0, y: 0 }}
            contentContainerStyle={styles.container}
            scrollEnabled={false}
          >
             <TopHeader leftTitle={'New User'} isDarkMode = {themeChanged} onLeftIconPress={()=> this.back()} macAddress={''}/>
              <ScrollView>
             
              <Text  allowFontScaling={false} style= {[styles.secondaryText,  {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)',marginTop:height*0.01}]}>First Name</Text>
                        <View style={[styles.textContainer, styles.layout]}> 
                            <TextInput
                            allowFontScaling={false}
                            style={[styles.textField,{color:themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)'}]}  
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

                    
                        <Text  allowFontScaling={false} style= {[styles.secondaryText,  {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)',marginTop:height*0.03}]}>Last Name</Text>
                        <View style={[styles.textContainer, styles.layout]}> 
                            <TextInput
                            allowFontScaling={false}
                            style={[styles.textField,{color:themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)'}]}  
                            ref={(input) => { this.lastNameTextInput = input; }}
                            onSubmitEditing={() => { this.emailNameTextInput.focus(); }}
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

                        <Text  allowFontScaling={false} style= {[styles.secondaryText,  {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)',marginTop:height*0.03}]}>Email Address</Text>
                        <View style={[styles.textContainer, styles.layout]}> 
                            <TextInput
                            allowFontScaling={false}
                            style={[styles.textField,{color:themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)'}]}  
                            ref={(input) => { this.emailNameTextInput = input; }}
                            onSubmitEditing={() => { this.passwordTextInput.focus(); }}
                            returnKeyType = {'next'}
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

                               

                        <Text  allowFontScaling={false} style= {[styles.secondaryText,  {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)',marginTop:height*0.03}]}>Password</Text>
                        <View style={[styles.textContainer, styles.layout]}> 
                            <TextInput
                            allowFontScaling={false}
                            style={[styles.textField,{color:themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)'}]}  
                            ref={(input) => { this.passwordTextInput = input; }}
                            onSubmitEditing={() => { this.confirmPasswordTextInput.focus(); }}
                            returnKeyType = {'next'}
                            keyboardType = {'default'}
                            selectionColor={'black'}
                            underlineColorAndroid = {'transparent'}
                            placeholder = "Enter Password"
                            placeholderTextColor = "rgba(189,189,189,1.0)"
                            autoCapitalize = "none"
                            secureTextEntry={!passwordEyeOn}
                            onChangeText={(password) => this.setState({password})}
                            value={this.state.password}
                            />
                             <TouchableOpacity style={{position:'absolute', width:30,height:30, marginLeft:width*0.88-40, marginTop:10}} onPress={()=> this.setState({passwordEyeOn:!this.state.passwordEyeOn})}><Icon name={passwordEyeOn?'eye':'eye-with-line'} color={'gray'} size={25} /></TouchableOpacity> 
                        
                        </View> 
                 

                        <Text  allowFontScaling={false} style= {[styles.secondaryText,  {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)',marginTop:height*0.03}]}>Confirm Password</Text>
                        <View style={[styles.textContainer, styles.layout]}> 
                            <TextInput
                            allowFontScaling={false}
                            style={[styles.textField,{color:themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)'}]}  
                            ref={(input) => { this.confirmPasswordTextInput = input; }}
                            returnKeyType = {'done'}
                            keyboardType = {'default'}
                            selectionColor={'black'}
                            underlineColorAndroid = {'transparent'}
                            placeholder = "Enter Confirm Password"
                            placeholderTextColor = "rgba(189,189,189,1.0)"
                            autoCapitalize = "none"
                            secureTextEntry={!confirmPasswordEyeOn}
                            onChangeText={(confirmPassword) => this.setState({confirmPassword})}
                            value={this.state.confirmPassword}
                            />
                         <TouchableOpacity style={{position:'absolute', width:30,height:30, marginLeft:width*0.88-40, marginTop:10}} onPress={()=> this.setState({confirmPasswordEyeOn:!this.state.confirmPasswordEyeOn})}><Icon name={confirmPasswordEyeOn?'eye':'eye-with-line'} color={'gray'} size={25} /></TouchableOpacity> 
                        </View>           
                        <Text  allowFontScaling={false} style= {[styles.secondaryText,  {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)',marginTop:height*0.01,fontSize:width*0.03}]}>Password must contain a minimum 8 characters that includes at least (1) uppercase, (1) lowercase, (1) number, and (1) special character.</Text>        
        
            <ButtonK title={'Register'} style={styles.signInButton} onPress={()=> this.registerUser()} titleColor={'white'} titleFont={20} titleWeight={'bold'} />
            </ScrollView>
                   {this._renderLoader()}  

            </KeyboardAwareScrollView>   

            
        )
    }
}