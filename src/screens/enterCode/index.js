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
  TextInput,
  TouchableOpacity,
  Dimensions,
  Alert
} from 'react-native';

import BackgroundImage from '../../common/component/backgroundImage'
import Icon from 'react-native-vector-icons/FontAwesome'
import ButtonK from '../../common/component/Button'
import styles from './style'

import OTPInputView from '@twotalltotems/react-native-otp-input'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Loader from '../../common/component/loader';
import {DARK_THEME_COLORS} from '../../common/helper/colors';
import {ResetPasswordDidChange} from '../../state/emitters'
import {verifyOtp} from '../../api'
import getStateItem from '../../state/getStateItem'
import setStateItem from '../../state/setState/setStateItem'
const {width, height} = Dimensions.get('window')
import {DB_KEY, RESPONSE_MESSAGE} from '../../common/helper/keys'

export default class EnterCode extends Component {
    constructor(props) {
        super(props)

        this.eventResetPasswordDidChange = this.eventResetPasswordDidChange.bind(this);
        this.state = {code:'',newPassword:'',confirmNewPassword:'',email:props.navigation.state.params.email,loading:false}
    }
    componentDidMount(){
        ResetPasswordDidChange.addResetPasswordDidChangeListener(this.eventResetPasswordDidChange)
    }

    componentWillUnmount(){
        ResetPasswordDidChange.removeResetPasswordDidChangeListener(this.eventResetPasswordDidChange)
    }

    eventResetPasswordDidChange(){
        this.setState({loading:false})
        if (getStateItem(RESPONSE_MESSAGE.FAILURE).length > 0){
            alert(getStateItem(RESPONSE_MESSAGE.FAILURE))
            setStateItem(RESPONSE_MESSAGE.FAILURE,'')
          }else if (getStateItem(RESPONSE_MESSAGE.SUCCESS).length > 0){
            Alert.alert(
                'Success!',
                "Password Updated. Please login with your credentials.",
                [
                  {text: 'Ok', onPress: () => this.props.navigation.popToTop()}
                ],
                { cancelable: true}
              )
            setStateItem(RESPONSE_MESSAGE.SUCCESS,'')
            
          }
    }

    backButtonPressed = () => {
        this.props.navigation.goBack()
    }

    validate(){
        const {code, newPassword, confirmNewPassword, email} = this.state;
        if (code.length === 0 ){
            return 'Please enter sent on '+email
        }else if (newPassword.length < 5 ){
            return 'Please enter password, password must be 6 characters long'
        }else if (confirmNewPassword !==  newPassword){
            return 'Both the passwords do not match'
        }

        return ''
    }

    confirmTapped = () => {
        let validate = this.validate()
        if (validate.length > 0){
            alert(validate)
        }else{
            const {code, newPassword, confirmNewPassword, email} = this.state;
            this.setState({loading:true})
            verifyOtp(email, code, newPassword, confirmNewPassword)
        }
    }



    _renderBackButton(){
        return (
            <TouchableOpacity style = {styles.backButtonContainer} onPress= {this.backButtonPressed}>
              <Icon name={'chevron-left'} size={width*0.08} color={DARK_THEME_COLORS.welcomeText} style={{marginLeft:width*0.08}}/>
                 <Text  allowFontScaling={false} style={styles.forgotButton}>Verify Your Mail</Text>
                
            </TouchableOpacity>
        )
    }

    _renderLoader() {
        const {loading} = this.state
    
        if (loading) {
            return (<Loader />)
        }else{
            return (<View />)
        }
    }

    _renderForgetTextInput =()=> {
        return (
            <View style={{justifyContent:'center',alignItems:'center', marginTop:height*0.01}}>
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
</View>
         )
    }

    _renderConfirmButton = () => {
        return (
            <ButtonK title={'CONFIRM'} style={styles.signInButton} onPress={this.confirmTapped} titleColor={'white'} titleFont={20} titleWeight={'bold'} />
            
        )
    }
    resendCodeTapped = () => {
        alert('resendCodeTapped')
    }

    render(){
        const {email} = this.state;
        const text = 'Please Enter the 6 digit code sent on email '+email;
        return (
            <KeyboardAwareScrollView style={styles.container}>
               <BackgroundImage />
                 {this._renderBackButton()}
                 <Text  allowFontScaling={false} style= {styles.singInText} numberOfLines={2}>{text}</Text>
                 <Image style = {styles.logo} source ={require('../../img/cardioLogo.png')}  />
                 {this._renderForgetTextInput()}
                 <View style={{flexDirection:'row', justifyContent:'center',alignItems:'center', top: height*0.02}}>
                 <Text  allowFontScaling={false} style= {styles.tokenNotGet}>Didn't get the code?</Text>
                 <TouchableOpacity onPress={this.resendCodeTapped}>
                 <Text  allowFontScaling={false} style= {[styles.tokenNotGet,{color: 'rgba(179,85,79,1.0)'}]}>  Resend now</Text>
                </TouchableOpacity>
                 </View>

                 <View style={[styles.passwordTextFieldContainer, styles.layout]}> 
                 <TextInput
                 style={styles.passwordTextField} 
                 onSubmitEditing={() => { this.passwordTextInput.focus(); }}
                 
                 returnKeyType = {'next'}
                 keyboardType = {'default'}
                 selectionColor={'black'}
                 underlineColorAndroid = {'transparent'}
                 placeholder = "Enter New Password"
                 placeholderTextColor = "rgba(189,189,189,1.0)"
                 autoCapitalize = "none"
                 onChangeText={(newPassword) => this.setState({newPassword})}
                 value={this.state.newPassword}
                 secureTextEntry={true}
        />
                 </View>

                 <View style={[styles.passwordTextFieldContainer, styles.layout,{marginTop:10}]}> 
                 <TextInput
                 style={styles.passwordTextField} 
                 ref={(input) => { this.passwordTextInput = input; }}
                 returnKeyType = {'done'}
                 keyboardType = {'default'}
                 selectionColor={'black'}
                 underlineColorAndroid = {'transparent'}
                 placeholder = "Confirm New Password"
                 placeholderTextColor = "rgba(189,189,189,1.0)"
                 autoCapitalize = "none"
                 onChangeText={(confirmNewPassword) => this.setState({confirmNewPassword})}
                 value={this.state.confirmNewPassword}
        />
                 </View>
                 
                 {this._renderConfirmButton()}
                 {this._renderLoader()}
              </KeyboardAwareScrollView>
        )
    }
}