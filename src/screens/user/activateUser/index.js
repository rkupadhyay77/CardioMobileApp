import React, { Component } from 'react';
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Alert,
  Keyboard
} from 'react-native';
import getStateItem from '../../../state/getStateItem'
import setStateItem from '../../../state/setState/setStateItem'
import {DB_KEY,RESPONSE_MESSAGE} from '../../../common/helper/keys'
import TopHeader from '../../../common/component/topHeader'
import ButtonK from '../../../common/component/Button'
import OTPInputView from '@twotalltotems/react-native-otp-input'
import { OtpInput } from "react-native-otp-entry";
import styles from './styles'
import Loader from '../../../common/component/loader'
import Icon from 'react-native-vector-icons/Ionicons'

const {width , height }  = Dimensions.get('window')

// import emitter and the api 

import { activateUser, resendActivationCode } from '../../../../galenApiLibrary/activateAccount';


export default class ValidateUserScreen extends Component {
    constructor(props){
        super(props)

        this.eventValidateUserDidChange = this.eventValidateUserDidChange.bind(this);
    this.state = {themeChanged:getStateItem(DB_KEY.IS_DARK_MODE),loading:false,email:props.navigation.state.params.email,code:'',loading:false}
    }
    //props.navigation.state.params.email

    componentDidMount(){
   
    }

    componentWillUnmount(){
    }

    eventValidateUserDidChange(){
        // callback when registration is done with either error or success
        
        this.setState({loading:false})
    
    if (getStateItem(RESPONSE_MESSAGE.FAILURE).length > 0){
      alert(getStateItem(RESPONSE_MESSAGE.FAILURE))
      setStateItem(RESPONSE_MESSAGE.FAILURE,'')
    }else if (getStateItem(RESPONSE_MESSAGE.SUCCESS).length > 0){
      setStateItem(getStateItem(RESPONSE_MESSAGE.SUCCESS,''))
      Alert.alert(
        'Success!',
        "Account registration completed. Please login with your credentials.",
        [
          {text: 'Ok', onPress: () => this.props.navigation.popToTop()}
        ],
        { cancelable: true}
      )

        
    }
    }
    resendActionCodeTapped(){
        Keyboard.dismiss()
        this.setState({loading:true})

        this.apiResendToken()
    }

    back(){
        this.props.navigation.goBack()
    }

    async apiResendToken(){
       const {email} =this.state
       this.setState({loading:true})
       let res = await resendActivationCode(email)
        if (res.status === 200 || res.status === 201){
            alert('Activation has been sent successfully on'+email)
            this.setState({loading:false})
        }else{
            let response = await res.text()
            this.setState({loading:false})
            alert(response)
         }
    }

    async validateUser(){
    
        if (this.state.code.length > 0){
            this.setState({loading:true})
           let res = await activateUser(this.state.email, this.state.code)
           
           if (res.status === 200) {
            let jsonRes = await res.json()
            if (jsonRes.firstName){
                  setStateItem(RESPONSE_MESSAGE.SUCCESS, 'Activated')
              }else{
                setStateItem(RESPONSE_MESSAGE.SUCCESS, 'provided otp is wrong')
              }
            }else{
                let errorText = await res.text()
                setStateItem(RESPONSE_MESSAGE.FAILURE, errorText)
            }
            this.eventValidateUserDidChange()
        }else{
            alert('Please enter pass code sent over email: '+this.state.email)
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
        const {themeChanged} = this.state;
        return(
            <View style ={[styles.container, {backgroundColor: themeChanged ? 'rgba(27,26,29,1.0)':'rgba(249,249,249,1.0)'}]}>
             <TopHeader leftTitle={'Validate User'} isDarkMode = {themeChanged} onLeftIconPress={()=> this.back()} macAddress={''} />
             <View style={styles.OTPContainer}>
            {/*
            <OTPInputView
    style={{width: '80%', height: 40}}
    pinCount={6}
    code={this.state.code} //You can supply this prop or not. The component will be used as a controlled / uncontrolled component respectively.
    onCodeChanged = {code => { this.setState({code})}}
    autoFocusOnLoad
    codeInputFieldStyle={styles.underlineStyleBase}
    codeInputHighlightStyle={styles.underlineStyleHighLighted}
    onCodeFilled = {(code => {
       
    })}
/>
            
             */} 
             <View style={{width: '80%', height: 40}}>

             <OtpInput 
  numberOfDigits={6}
  onTextChange={(text) => console.log(text)}
  onFilled={(code) => {
    this.setState({ code }, () => {
      Keyboard.dismiss();
    });
  }}
/>
 </View>

<View style={{width:'80%',height:40,marginTop:height*0.04,flexDirection:'row',justifyContent:'flex-end'}}>
  <TouchableOpacity style={{flexDirection:'row',justifyContent:'flex-end'}} onPress={()=> this.resendActionCodeTapped()}>  
 <Icon name={'reload'} size={20} color={'black'} />
<Text allowFontScaling={false} style={{color:'black', fontSize:16, marginLeft:10}}>Resend code</Text> 
</TouchableOpacity>
</View>
</View>
             <ButtonK title={'Validate'} style={styles.signInButton} onPress={()=> this.validateUser()} titleColor={'white'} titleFont={20} titleWeight={'bold'} />
           {this._renderLoader()}
            </View>   

            
        )
    }
}