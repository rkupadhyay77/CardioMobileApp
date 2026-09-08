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
  KeyboardAvoidingView,
  Switch
} from 'react-native';

import ButtonK from '../../common/component/Button'
import styles from './styles'
import Icon from 'react-native-vector-icons/Fontisto'
import {RESPONSE_MESSAGE, DB_KEY} from '../../common/helper/keys'
import setStateItem from '../../state/setState/setStateItem'
import getStateItem from '../../state/getStateItem'
import URLS from '../../common/helper/urls'
import HEADER from '../../common/helper/constants'
import TIMEZONE from '../../common/helper/timezone'
import DropDownPicker from 'react-native-dropdown-picker';
import {executeApiWith} from '../../api'

import getHeaders from '../../../galenApiLibrary/config/getHeader';
import { getBaseURL } from '../../../galenApiLibrary/config/getBaseURL';

export default class PrivacyScreen extends Component{
    constructor(props) {
        super(props)
  
         this.state = {
          checked:getStateItem(DB_KEY.TERMS_CHECKED),
          privacyChecked:getStateItem(DB_KEY.PRIVACY_CHECKED),
          customDataArray:[],
          timezone:''
         }
       
    }

    componentDidMount(){
      // get the custom fields first
     
       this.fetchCustomData()

    }

   async fetchCustomData(){
     
     const header = this.getHeader()
     var requestOptions = {
      method: 'GET',
      headers: header,
       };

let enableAlertsFieldData = ["None"]
    const company = getStateItem(DB_KEY.USER).currentRole?getStateItem(DB_KEY.USER).currentRole.supplier?getStateItem(DB_KEY.USER).currentRole.supplier.name:'':''
    if (company.length > 0){
      let supplierId = getStateItem(DB_KEY.USER).currentRole?getStateItem(DB_KEY.USER).currentRole.supplier?getStateItem(DB_KEY.USER).currentRole.supplier.supplierId:'':''
      if (supplierId !== ''){
        const getDefaults= getBaseURL()+'user/custom-field/data/'+supplierId
        //V3
        let resGetDefaults = await executeApiWith(getDefaults, 'GET', null, header, "PrivacyScreen:fetchCustomData")
        
        if (resGetDefaults.status === 200){
          let jsonResponseGetDefaults = await resGetDefaults.json()
          
          if (jsonResponseGetDefaults.length > 0){
            
            let filteredEnableAlerts = jsonResponseGetDefaults.filter((subContent)=> subContent.field.name.includes('Enable Alerts'))
            if (filteredEnableAlerts.length > 0){
              enableAlertsFieldData = filteredEnableAlerts[0].fieldData
            }
          }
        }
      }
    }


    let urlGetCustomFields = getBaseURL()+'user/custom-field?fieldArea=UserProfile'
   
     
      
       var customDataArray = []
        let res = await executeApiWith(urlGetCustomFields, 'GET', null, header, "PrivacyScreen:fetchCustomData")
        
       if (res.status === 200){
         let response = await res.json()
         
         let content = response.content

         for(var index = 0 ; index < content.length ; index++){
           let customData = content[index]

           if (customData.name === 'Enable Alerts'){
             let dataToAdd = {"field":customData,"fieldData":enableAlertsFieldData}
             customDataArray.push(dataToAdd)
           }else if (customData.name === 'DayLight_Savings'){
            let dataToAdd = {"field":customData,"fieldData":"No"}
            customDataArray.push(dataToAdd)
          }else if (customData.name === 'T&C accepted'){
            let dataToAdd = {"field":customData,"fieldData":"Yes"}
            customDataArray.push(dataToAdd)
          } else if (customData.name === 'Privacy Policy Accepted'){
            let dataToAdd = {"field":customData,"fieldData":"Yes"}
            customDataArray.push(dataToAdd)
          } else if (customData.name === 'Plot_range_default (secs)'){
            let dataToAdd = {"field":customData,"fieldData":"1 Hr"}
            customDataArray.push(dataToAdd)
          } else if (customData.name === 'TimeZone'){
            let dataToAdd = {"field":customData,"fieldData":"Central Standard Time"}
            customDataArray.push(dataToAdd)
          } else if (customData.name === 'Change Password'){
            let dataToAdd = {"field":customData,"fieldData":"No"}
            customDataArray.push(dataToAdd)
          } else if (customData.name === 'Enable Reports'){
            let dataToAdd = {"field":customData,"fieldData":["None"]}
            customDataArray.push(dataToAdd)
          } else if (customData.name === 'Guest Account'){
            let dataToAdd = {"field":customData,"fieldData":"No"}
            customDataArray.push(dataToAdd)
          } else if (customData.name === 'APP_view'){
            let dataToAdd = {"field":customData,"fieldData":"GW"}
            customDataArray.push(dataToAdd)
          } 
          
        

         }

         //console.log(JSON.stringify(customDataArray))
         this.setState({customDataArray:customDataArray})

       }
    }


checkUnCheckTerms(){
    this.setState({checked:!this.state.checked})
    setStateItem(DB_KEY.TERMS_CHECKED, this.state.checked)
    
  }
  
  checkUnCheckPrivacy(){
    this.setState({privacyChecked:!this.state.privacyChecked})
    setStateItem(DB_KEY.PRIVACY_CHECKED, this.state.privacyChecked)
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

  async apiAcceptTerms(){

    let acceptedTermsOfUseForTenant = getBaseURL() + 'user/user-custom'
    let acceptedTermsOfUse = getBaseURL()+'user/termsagreement?acceptedTermsOfUse=true'
    let acceptedTermsOfUseP = getBaseURL()+'user/tenant/termsagreement?acceptedTermsOfUseForTenant=true'

     const header = this.getHeader()
         var user  = getStateItem(DB_KEY.USER)
         user.roles[0].defaultRole = true
         user.currentRole.defaultRole = true
         user.defaultRole.defaultRole = true

         var raw = JSON.stringify({"user":user,"customData":this.state.customDataArray})
         
        var requestOptions = {
        method: 'PUT',
        headers: header,
        body: raw,
        redirect: 'follow'
         };

         

        // let res = await executeApiWith(acceptedTermsOfUseForTenant, 'PUT', raw, header, "PrivacyScreen:APIAcceptTerm")
        
        
        //  if (res.status === 200){

        //  }
       

         let res2 = await executeApiWith(acceptedTermsOfUse, 'PUT', raw, header, "PrivacyScreen:APIAcceptTerm")
        
         
          if (res2.status === 200){
 
          }

          let res3 = await executeApiWith(acceptedTermsOfUseP, 'PUT', raw, header, "PrivacyScreen:APIAcceptTerm")
        
         
          if (res3.status === 200){
 
          }

          
  }

  termsCondition= (isForTerms) => {
    this.props.nav.navigate('TermsScreen',{isForTerms:isForTerms})
   }

   submitButton = ()=> {
    const {checked, privacyChecked,timezone} = this.state;
    const {onPress} = this.props
    if(this.state.checked === false){
        alert('Please read the terms of use first');
        return
      }else if(this.state.privacyChecked === false){
        alert('Please read the privacy policy first');
        return
      } 

      this.apiAcceptTerms()
   // 
   
      onPress();
   }

   onChangeText(text){



     this.setState({timezone:text})

     for(var index = 0  ; index < this.state.customDataArray.length ; index++){
       var customData = this.state.customDataArray[index]
       var field = customData.field

       if (field.name === 'TimeZone'){
         let dataToAdd = {"field":field,"fieldData":text}
         this.state.customDataArray[index] = dataToAdd
        }  
       }

       //console.log('customDataArray'+JSON.stringify(this.state.customDataArray))
     }

     timezoneSelected(item) {
      for(var index = 0  ; index < this.state.customDataArray.length ; index++){
          var customData = this.state.customDataArray[index]
          var field = customData.field
   
          if (field.name === 'TimeZone'){
            let dataToAdd = {"field":field,"fieldData":item.value}
            this.state.customDataArray[index] = dataToAdd
           }  
          }
     }
   

    render(){
        const {checked, privacyChecked, timezone} = this.state
        
       var timezoneStr = timezone.length > 0 ? 'Your timezone is '+timezone:'Default Timezone is CDT'

       let data = [{label: 'Select Timezone', value: 'Select Timezone'}];
        
       for (var index = 0; index < TIMEZONE.length - 1; index++) {
         let dataDict = {
           label: TIMEZONE[index].value,
           value:TIMEZONE[index].value,
         };
         data.push(dataDict);
       }
       
        return(
            <View style={styles.container}>
            <Image source = {require('../../img/background.png')}  style = {styles.backgroundImageContainer} />
            
            <View  style = {[styles.backgroundImageContainer,{backgroundColor:'rgba(31,31,31,0.3)'}]} />
            <Image style = {styles.logo} source ={require('../../img/cardioLogo.png')}  /> 
            
             <View style={styles.contentContainer}>
                <View style={[styles.flexDirection,{marginTop:10}]}>

                <TouchableOpacity onPress={()=> this.checkUnCheckTerms()}>
                    <Icon name={checked?'checkbox-active':'checkbox-passive'} size={20} color={styles.welcomeText.color} style={{top:6}}/>
                </TouchableOpacity>
     
                <Text  allowFontScaling={false} style={[styles.termsCondition,{top:8, left:5}]}>I have read and accepted the   </Text>
                 <TouchableOpacity style={styles.buttonTopTerms} onPress={ ()=> this.termsCondition(true)}>
                   <Text  allowFontScaling={false} style={[styles.termsCondition,{ textDecorationLine:'underline'}]}>Terms of Use</Text>
                 </TouchableOpacity>
                 </View>
     
     
                 <View style={[styles.flexDirection,{marginTop:-10}]}>
                 <TouchableOpacity onPress={()=> this.checkUnCheckPrivacy()}>
                     <Icon name={privacyChecked?'checkbox-active':'checkbox-passive'} size={20} color={styles.welcomeText.color} style={{top:6}}/>
                 </TouchableOpacity>
      
                 <Text  allowFontScaling={false} style={[styles.termsCondition,{top:8, left:5}]}>I have read and accepted the   </Text>
                  <TouchableOpacity style={styles.buttonTopTerms} onPress={ ()=> this.termsCondition(false)}>
                    <Text  allowFontScaling={false} style={[styles.termsCondition,{ textDecorationLine:'underline'}]}>Privacy Policy</Text>
                  </TouchableOpacity>
                  </View>
                </View>
{/*
                <View style={[styles.contentContainer,{marginTop:10}]}>
                <View style={{marginTop:10, height:65}}>
                  <Text  allowFontScaling={false} style={{marginLeft:10}}>Select Timezone (if you want to change it)</Text>
           

<DropDownPicker
            controller={instance => (this.userDropdown = instance)}
            items={data}
            defaultValue={'Select Timezone'}
            containerStyle={{height: 40}}
            dropDownMaxHeight={240}
            labelStyle={{fontSize: 10, textAlign: 'left'}}
            style={{backgroundColor: '#fafafa'}}
            itemStyle={{
              justifyContent: 'flex-start',
            }}
            dropDownStyle={{backgroundColor: '#fafafa'}}
            onChangeItem={item => this.timezoneSelected(item)}
           />
          

            </View>
                </View>
                 */}

                <ButtonK title={'Submit'} style={styles.signInButton} onPress={()=> this.submitButton()} titleColor={'white'} titleFont={20} titleWeight={'bold'} />
           
            </View>
        );
    }
}