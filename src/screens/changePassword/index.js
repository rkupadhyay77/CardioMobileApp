import React, { Component , createRef} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Alert
} from 'react-native';


const {width , height }  = Dimensions.get('window')

import getStateItem from '../../state/getStateItem'
import {DB_KEY, RESPONSE_MESSAGE} from '../../common/helper/keys'
import TopHeader from '../../common/component/topHeader'
import styles from './styles'
import ButtonK from '../../common/component/Button'
 import Loader from '../../common/component/loader'
 import {PasswordChanged} from '../../state/emitters'
 import {changePassword} from '../../api'
 import setStateItem from '../../state/setState/setStateItem'



export default class ChangePassword extends Component{
    constructor(props){
        super(props)

        this.eventPasswordChanged = this.eventPasswordChanged.bind(this)
        this.state = {themeChanged:getStateItem(DB_KEY.IS_DARK_MODE), oldPassword : '' , currentPassword : '' , confirmCurrentPassword : '', loading:false}
    }


    componentDidMount(){
        PasswordChanged. addPasswordChangedListener(this.eventPasswordChanged)
    }

    componentWillUnmount(){
        PasswordChanged.removePasswordChangedListener(this.eventPasswordChanged)
    }

    eventPasswordChanged(){
        
        this.setState({loading:false})
       
        
        if (getStateItem(RESPONSE_MESSAGE.FAILURE).length > 0){
          alert(RESPONSE_MESSAGE.FAILURE)
          setStateItem(RESPONSE_MESSAGE.FAILURE,'')
        }else if (getStateItem(RESPONSE_MESSAGE.SUCCESS).length > 0){
            Alert.alert(
                "",
                RESPONSE_MESSAGE.SUCCESS,
                [
                  { text: "OK", onPress: () => this.back()}
                ],
                { cancelable: false }
              );
          
            setStateItem(RESPONSE_MESSAGE.SUCCESS,'')

            this.setState({oldPassword:'', currentPassword:'', confirmCurrentPassword:''})
        }
    }

    back(){
        this.props.navigation.goBack()
    }


    updatePasswordTapped() {
       const  {oldPassword, currentPassword, confirmCurrentPassword} = this.state
        const message = this.validate()

        if (message === ''){
            this.setState({loading:true})
            if (getStateItem(DB_KEY.GALEN)){
                
              let userId = getStateItem(DB_KEY.USER) ? getStateItem(DB_KEY.USER).userId:'';
              changePassword(userId,currentPassword,oldPassword,confirmCurrentPassword)
            }else{
                PasswordChangedApi(oldPassword,currentPassword)
            }
            
        }else{
            alert(message)
        }
    }

    validate(){
        var message = '';
      const  {oldPassword, currentPassword, confirmCurrentPassword} = this.state
        if (oldPassword.length === 0){
            message = 'Please enter old password.'
        }else if (currentPassword.length === 0){
            message = 'Please enter new password.'
        }else if (confirmCurrentPassword.length === 0){
            message = 'Please enter confirm new password.'
        }else if (confirmCurrentPassword !== currentPassword){
            message = 'New password does not match.'
        }else{
            var message = '';
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
        const {themeChanged} = this.state
        return(
            <View style ={[styles.container, {backgroundColor: themeChanged ? 'rgba(27,26,29,1.0)':'rgba(249,249,249,1.0)'}]}>
                <TopHeader leftTitle={'Change  Password'} isDarkMode = {themeChanged} onLeftIconPress={()=> this.back()} macAddress={''}/>
                    <Text  allowFontScaling={false} style= {[styles.singInText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)',marginTop:height*0.05}]}>Current Password</Text>
                        <View style={[styles.emailTextFieldContainer, styles.layout]}> 
                            <TextInput
                            style={[styles.emailTextField,{color:themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)'}]}  
                            onSubmitEditing={() => { this.newPasswordTextInput.focus(); }}
                            returnKeyType = {'next'}
                            keyboardType = {'default'}
                            selectionColor={'black'}
                            underlineColorAndroid = {'transparent'}
                            placeholder = "Enter old password"
                            placeholderTextColor = "rgba(189,189,189,1.0)"
                            autoCapitalize = "none"
                            onChangeText={(oldPassword) => this.setState({oldPassword})}
                            value={this.state.oldPassword}
                            />
                        </View>


                        <Text  allowFontScaling={false} style= {[styles.singInText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)',marginTop:height*0.04}]}>New Password</Text>
                        <View style={[styles.emailTextFieldContainer, styles.layout]}> 
                            <TextInput
                            onSubmitEditing={() => { this.confirmPasswordTextInput.focus(); }}
                            ref={(input) => { this.newPasswordTextInput = input; }}
                            style={[styles.emailTextField,{color:themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)'}]}  
                            returnKeyType = {'next'}
                            keyboardType = {'default'}
                            selectionColor={'black'}
                            underlineColorAndroid = {'transparent'}
                            placeholder = "Enter new password"
                            placeholderTextColor = "rgba(189,189,189,1.0)"
                            autoCapitalize = "none"
                            onChangeText={(currentPassword) => this.setState({currentPassword})}
                            value={this.state.currentPassword}
                            />
                        </View>


                        <Text  allowFontScaling={false} style= {[styles.singInText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)',marginTop:height*0.04}]}>Confirm New Password</Text>
                        <View style={[styles.passwordTextFieldContainer, styles.layout]}> 
                            <TextInput
                            ref={(input) => { this.confirmPasswordTextInput = input; }}
                            style={[styles.passwordTextField, {color:themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)'}]} 
                            returnKeyType = {'done'}
                            keyboardType = {'default'}
                            selectionColor={'black'}
                            underlineColorAndroid = {'transparent'}
                            placeholder = "Confirm new password"
                            placeholderTextColor = "rgba(189,189,189,1.0)"
                            autoCapitalize = "none"
                            secureTextEntry = {true}
                            onChangeText={(confirmCurrentPassword) => this.setState({confirmCurrentPassword})}
                            value={this.state.confirmCurrentPassword}
                            />
                        </View>

                 <ButtonK title={'UPDATE PASSWORD'} style={styles.signInButton} onPress={()=> this.updatePasswordTapped()} titleColor={'white'} titleFont={20} titleWeight={'bold'} />
                
                 {this._renderLoader()}
           
            </View>
        );
    }
}