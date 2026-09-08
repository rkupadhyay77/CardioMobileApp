import React, { Component } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput
 } from 'react-native';
import getStateItem from '../../../state/getStateItem'
import setStateItem from '../../../state/setState/setStateItem'
import {DB_KEY,RESPONSE_MESSAGE} from '../../../common/helper/keys'
import TopHeader from '../../../common/component/topHeader'
import styles from './styles'
import ButtonK from '../../../common/component/Button'
import Loader from '../../../common/component/loader'
import { API_TIMEOUT } from '../../../common/helper/util';
import { inviteObserve } from '../../../../galenApiLibrary/guestUser';

// import api and emitter
// import api and emitter

import { InviteObserveDidChange } from '../../../state/emitters';


export default class InviteObserveScreen extends Component {
    constructor(props){
        super(props)
        this.state = {email:'',themeChanged:getStateItem(DB_KEY.IS_DARK_MODE),loading:false}
    }

    back(){
        this.props.navigation.goBack()
    }

    componentDidMount(){
    }

    componentWillUnmount(){
    }

     _renderLoader() {
        const {loading} = this.state
    
        if (loading) {
            return (<Loader />)
        }else{
            return (<View />)
        }
    }
    

    inviteObserveTapped(){
      const {email} = this.state
      if (email.length === 0) {
        alert('Please enter the email address');
        return
      }
      this.setState({loading:true})
      this.inviteObserveThroughCloud()
    }

   async inviteObserveThroughCloud() {
    const {email} = this.state
        let res = await inviteObserve(email)

        this.setState({loading:false})
        if (res.status === 201) {
            alert('Observe invited')
            this.setState({email:''})
            InviteObserveDidChange.emit('INVITE_OBSERVE_CHANGE')
        }else if (res.status === 403) {
            alert('User is not a patient')
        }else if (res.status === 400) {
            alert('User does not exist, Do you want to send him invite. Click on Invite again')
        }else if (res.status === 404) {
            alert('User is not registered')
        }else if (res.status === 201) {
            alert('User already invited')
        }else if (res.status === 412) {
            alert('User Invite already exist')
        }
    }

    render(){
        const {themeChanged} = this.state;
    return(
        <View style ={[styles.container, {backgroundColor: themeChanged ? 'rgba(27,26,29,1.0)':'rgba(249,249,249,1.0)'}]}>
         <TopHeader leftTitle={'Invite Observe'} isDarkMode = {themeChanged} onLeftIconPress={()=> this.back()} macAddress={''}/>
          <View style={styles.contentContainer}>
          <Text  allowFontScaling={false} style= {[styles.singInText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)'}]}>Please provide Observe Email Address</Text>
                        <View style={[styles.titleTextFieldContainer, styles.layout]}> 
                            <TextInput
                             style={[styles.titleTextField,{color:themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)'}]}  
                            returnKeyType = {'done'}
                            keyboardType = {'email-address'}
                            selectionColor={themeChanged?'white':'black'}
                            underlineColorAndroid = {'transparent'}
                            placeholder = "Provide observe email"
                            placeholderTextColor = "rgba(189,189,189,1.0)"
                            autoCapitalize = "none"
                            onChangeText={(email) => this.setState({email})}
                            value={this.state.email}
                            />
                        </View>
              </View>
              <ButtonK title={'Invite'} style={styles.signInButton} onPress={()=> this.inviteObserveTapped()} titleColor={'white'} titleFont={20} titleWeight={'bold'} />
             {this._renderLoader()} 
         </View>

        )
    }

}