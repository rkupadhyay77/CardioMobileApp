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
  Dimensions
} from 'react-native';

import BackgroundImage from '../../common/component/backgroundImage'
import Icon from 'react-native-vector-icons/FontAwesome'
import ButtonK from '../../common/component/Button'
import styles from './style'
import Loader from '../../common/component/loader';
import {sendOtp} from '../../api'
import {SendOtpDidChange} from '../../state/emitters'
import getStateItem from '../../state/getStateItem'
import setStateItem from '../../state/setState/setStateItem'
import {DARK_THEME_COLORS} from '../../common/helper/colors'
import {RESPONSE_MESSAGE} from '../../common/helper/keys'

const {width} = Dimensions.get('window')

export default class ForgetPassword extends Component {
    constructor(props) {
        super(props)

        this.eventSendOtpDidChange = this.eventSendOtpDidChange.bind(this)
        this.state = {email:'',loading:false}
    }

    componentDidMount(){
        SendOtpDidChange.addSendOtpDidChangeListener(this.eventSendOtpDidChange)
    }

    componentWillUnmount(){
        SendOtpDidChange.removeSendOtpDidChangeListener(this.eventSendOtpDidChange)
    }

    eventSendOtpDidChange(){
        
        this.setState({loading:false})
        if (getStateItem(RESPONSE_MESSAGE.FAILURE).length > 0){
            alert(RESPONSE_MESSAGE.FAILURE)
            setStateItem(RESPONSE_MESSAGE.FAILURE,'')
          }else if (getStateItem(RESPONSE_MESSAGE.SUCCESS).length > 0){
            setStateItem(RESPONSE_MESSAGE.SUCCESS,'')
            this.props.navigation.navigate('EnterCode',{email: this.state.email})
          }
    
    }

    backButtonPressed = () => {
        this.props.navigation.goBack()
    }

    resetPasswordTapped = () => {
        this.setState({loading:true})
        sendOtp(this.state.email)
        
    }

    _renderLoader() {
        const {loading} = this.state
    
        if (loading) {
            return (<Loader />)
        }else{
            return (<View />)
        }
    }

    _renderBackButton(){
        return (
            <TouchableOpacity style = {styles.backButtonContainer} onPress= {this.backButtonPressed}>
              <Icon name={'chevron-left'} size={width*0.08} color={DARK_THEME_COLORS.welcomeText} style={{marginLeft:width*0.08}}/>
                 <Text  allowFontScaling={false} style={styles.forgotButton}>Forgot Password</Text>
                
            </TouchableOpacity>
        )
    }

    _renderForgetTextInput =()=> {
        return (
            <View style={[styles.emailTextField, styles.layout]}> 
            <TextInput
            style={{width:styles.emailTextField.width,height:styles.layout.height, left:5, color:'black'}} 
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
        )
    }

    _renderResetPasswordButton = () => {
        return (
            <ButtonK title={'RESET   PASSWORD'} style={styles.signInButton} onPress={this.resetPasswordTapped} titleColor={'white'} titleFont={20} titleWeight={'bold'} />
            
        )
    }

    render(){
        return (
            <View style={styles.container}>
               <BackgroundImage />
                 {this._renderBackButton()}
                 <Text  allowFontScaling={false} style= {styles.singInText} numberOfLines={2}>Enter your email address associated with this account</Text>
              
                 <Image style = {styles.logo} source ={require('../../img/cardioLogo.png')}  /> 
                {this._renderForgetTextInput()}
                {this._renderResetPasswordButton()}
                {this._renderLoader()}
              </View>
        )
    }
}