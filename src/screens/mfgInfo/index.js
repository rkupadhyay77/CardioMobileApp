import React, { Component } from 'react';
import getStateItem from '../../state/getStateItem';
import {DB_KEY,RESPONSE_MESSAGE} from '../../common/helper/keys'
import styles from './styles'
import { checkGenericYesType } from '../../common/helper/util';
import TopHeader from '../../common/component/topHeader'
import URLS from '../../common/helper/urls'
import HEADER from '../../common/helper/constants'
import Loader from '../../common/component/loader'
import DropDownPicker from 'react-native-dropdown-picker'
import moment from 'moment'
import {
  View,
  Text,
  TextInput,
  Dimensions,
  Alert
 } from 'react-native';

 const {width, height} = Dimensions.get('window')
 const lteModeData =  [{"value": "Yes","label": "Yes"},{"value": "No","label": "No"} ]
 import ButtonK from '../../common/component/Button'
 import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import {writeData, getDevicePropertySet, getLastDataFromGevHealth, getLastDataFromParams, getLastDataFromIdentity} from '../../api';
import { API_TIMEOUT } from '../../common/helper/util';

import getHeaders from '../../../galenApiLibrary/config/getHeader';


export default class MfgInfoScreen extends Component {
    constructor(props){
        super(props)
        this.state = {themeChanged:getStateItem(DB_KEY.IS_DARK_MODE),loading:false,bpfSelect:'',gainSelect:'',pVitalsData:props.navigation.state.params.pVitalsData,identityData:null,macAddress:props.navigation.state.params.macAddress,HrLimitHi:'',Ltemode:'No', HrLimitLo:'',xMode:'',developerMode:'',forceFw:'',routerMac1:'',routerMac2:'',location:'',friendlyName:''}
    }

    back(){
        this.props.navigation.goBack()
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


    async getDevHealthData(){
        
        this.setState({loading:true})
        const macId = this.state.macAddress;
        const promiseGetLastDataFromGevHealthTimeout = new Promise((resolve) => (setTimeout(() => resolve(false),  API_TIMEOUT.INTERVAL)))
        const resGetLastDataFromGevHealth = await Promise.race([promiseGetLastDataFromGevHealthTimeout,getLastDataFromGevHealth(macId, "MFGInfoScren:getDevHealthData")])
        if (! resGetLastDataFromGevHealth) {
          this.setState({loading:false})
           alert("API Delayed response for MFGInfoScren:getDevHealthData")
           return
        } 
          
         if (resGetLastDataFromGevHealth.status ===  200){
              let jsonResponse = await resGetLastDataFromGevHealth.json()
              
              if (jsonResponse.content !== undefined && jsonResponse.content !== null && jsonResponse.content.length > 0){
                let devHealthData = jsonResponse.content[0]
                let routerMac1 = devHealthData.data.RouterMac1 ? devHealthData.data.RouterMac1.value :''
                let routerMac2 = devHealthData.data.RouterMac2 ? devHealthData.data.RouterMac2.value :''
                this.setState({routerMac1, routerMac2})
              }

              this.setState({loading:false})
          }else{
              this.setState({loading:false})
          }
  
      }

      async getParamsData(){
        this.setState({loading:true})
        const macId = this.state.macAddress
        const promiseGetLastDataFromParamsTimeout = new Promise((resolve) => (setTimeout(() => resolve(false),  API_TIMEOUT.INTERVAL)))
        const resGetLastDataFromParams = await Promise.race([promiseGetLastDataFromParamsTimeout,getLastDataFromParams(macId, "MFGInfoScren:getParamshData")])
        if (! resGetLastDataFromParams) {
          this.setState({loading:false})
           alert("API Delayed response for MFGInfoScren:getParamshData")
           return
        } 
      
        if (resGetLastDataFromParams.status ===  200){
            let jsonResponse = await resGetLastDataFromParams.json()
            this.setState({loading:false})
           this.setParamsData(jsonResponse)
        }
      }

      setParamsData(res){

        
        if (res.content !== undefined && res.content !== null && res.content.length > 0){
          let pVitalsData = res.content[0]
          let bpfSelect = pVitalsData.data.BpfSelect ? pVitalsData.data.BpfSelect.value :''
          let gainSelect = pVitalsData.data.GainSelect ? pVitalsData.data.GainSelect.value :''
          let HrLimitLo = pVitalsData.data.HrLimitLo ? pVitalsData.data.HrLimitLo.value :''
          let HrLimitHi = pVitalsData.data.HrLimitHi ? pVitalsData.data.HrLimitHi.value :''
          let Ltemode =  pVitalsData.data.Ltemode ? pVitalsData.data.Ltemode.value  :'No'
          
          this.setState({pVitalsData,bpfSelect,gainSelect,HrLimitHi,HrLimitLo,Ltemode })
        }
  }

    async getIdentityData(){
        
      const macId = this.state.macAddress
      const promiseGetLastDataFromIdentityTimeout = new Promise((resolve) => (setTimeout(() => resolve(false),  API_TIMEOUT.INTERVAL)))
      const resGetLastDataFromIdentity = await Promise.race([promiseGetLastDataFromIdentityTimeout,getLastDataFromIdentity(macId, "MFGInfoScren:getIdentityData")])
      if (! resGetLastDataFromIdentity) {
        this.setState({loading:false})
         alert("API Delayed response for MFGInfoScren:getIdentityData")
         return
      }   
         if (resGetLastDataFromIdentity.status ===  200){
            let jsonResponse = await resGetLastDataFromIdentity.json()
            this.setIdentityData(jsonResponse)
        }

        this.getDevHealthData()

    }

    setIdentityData(res){
          if (res.content !== undefined && res.content !== null && res.content.length > 0){
            let identityData = res.content[0]
           let forceFw = identityData.data.ForceFw ? identityData.data.ForceFw.value :''
            let developerMode = identityData.data.DeveloperMode ? identityData.data.DeveloperMode.value:'No'
            let location = identityData.data.Location ? identityData.data.Location.value:'No'
            let friendlyName = identityData.data.FriendlyName ? identityData.data.FriendlyName.value:'No'
           
            let xMode = identityData.data.XMode ? identityData.data.XMode.value :'No'
           
            this.setState({identityData, forceFw,developerMode, xMode,location, friendlyName })
          }
    }

    componentDidMount(){
     
        this.getParamsData()
        this.getIdentityData()

       
        
               
    }


    _renderLoader(){
        if (this.state.loading){
            return(<Loader></Loader>)
        }else{
            return(<View></View>)
        }
    }
    lteModified(item){

    }

    LTEModified(item){
      
      if (checkGenericYesType(item.value)){
        if (checkGenericYesType(item.value)){
            this.setState({Ltemode : "Yes" })
            }else{
                this.setState({Ltemode:"No" })
            }
        }
    }

    developerModeModified(item){
      
      if (checkGenericYesType(item.value)){
        if (checkGenericYesType(item.value)){
            this.setState({xMode:"No",developerMode:"Yes" })
            }else{
                this.setState({developerMode:"No" })
            }
        }else{
            this.setState({developerMode:"No" })
        }
    }

    xModeModified(item){
      if (checkGenericYesType(item.value)){
        if (checkGenericYesType(item.value)){
               this.setState({developerMode:"No", xMode:"Yes"})
            }else{
                this.setState({xMode:"No" })
            }
        }else{
            this.setState({xMode:"No" })
        }
    } 
    
    async updateTapped(){
        this.setState({loading:true})
        
        // fetch devicepropertySetId for Identity
        let  header = this.getHeader()
        const identity_table_id = "d36a4373-fbdc-44a3-8c96-4bb920041e40-id"
        const promiseGetDevicePropertySetTimeout = new Promise((resolve) => (setTimeout(() => resolve(false),  API_TIMEOUT.INTERVAL)))
        const resGetDevicePropertySet = await Promise.race([promiseGetDevicePropertySetTimeout,getDevicePropertySet(identity_table_id,  "MFGInfoScren:updateTapped:262")])
        if (! resGetDevicePropertySet) {
          this.setState({loading:false})
            alert("API Delayed response for MFGInfoScren:updateTapped:262")
            return
        }

        var requestOptions = {
            method: 'GET',
            headers: header,
             };
//V3
             if (resGetDevicePropertySet.status === 200){
                
                let jsonResponse = await resGetDevicePropertySet.json()  
                let  dataToPut = {"XMode":this.state.xMode,"DeveloperMode":this.state.developerMode,"ForceFw":this.state.forceFw,"TimestampI":moment.utc().format()}
                
                let body = {"deviceDataModelId":"d36a4373-fbdc-44a3-8c96-4bb920041e40-id", "deviceDataId":this.state.identityData.deviceDataId,"data":dataToPut, "devicePropertySetId":jsonResponse.content[0].devicePropertySetId}
                const promiseWriteDataTimeout = new Promise((resolve) => (setTimeout(() => resolve(false),  API_TIMEOUT.INTERVAL)))
                const resWriteData = await Promise.race([promiseWriteDataTimeout,writeData( JSON.stringify(body), "MFGInfoScren:updateTapped:274")])
                if (!resWriteData) {
                    this.setState({loading:false})
                    alert("API Delayed response for MFGInfoScren:updateTapped:274");
                    return
                }
                 let jsonResponseDeviceData = await resWriteData.text()
                
             }


             // params
             const params_table_id = 'd36a4373-fbdc-44a3-8c96-4bb920041e40-pa'
             const promiseSetTimeout = new Promise((resolve) => (setTimeout(() => resolve(false),  API_TIMEOUT.INTERVAL)))
             const resParams = await Promise.race([promiseSetTimeout,getDevicePropertySet(params_table_id,  "MFGInfoScren:updateTapped:295")])
             if (! resParams) {
               this.setState({loading:false})
                 alert("API Delayed response for MFGInfoScren:updateTapped:295")
                 return
             }

             requestOptions = {
                 method: 'GET',
                 headers: header,
                  };
                  //V3
                 if (resParams.status === 200){
                     let jsonResponseParams = await resParams.json()  
                     
                     let  dataToPutParams = {"BpfSelect":this.state.bpfSelect,"GainSelect":this.state.gainSelect,"HrLimitHi":this.state.HrLimitHi != "" ? parseInt(this.state.HrLimitHi):"","HrLimitLo":this.state.HrLimitLo != "" ? parseInt(this.state.HrLimitLo):"","Ltemode":this.state.Ltemode,"TimestampP":moment.utc().format()}
                     
                     let bodyParams = {"deviceDataModelId":"d36a4373-fbdc-44a3-8c96-4bb920041e40-pa", "deviceDataId":this.state.pVitalsData.deviceDataId,"data":dataToPutParams, "devicePropertySetId":jsonResponseParams.content[0].devicePropertySetId}
                     const promiseWriteDataTimeout = new Promise((resolve) => (setTimeout(() => resolve(false),  API_TIMEOUT.INTERVAL)))
                        const resWriteData = await Promise.race([promiseWriteDataTimeout,writeData( JSON.stringify(bodyParams), "MFGInfoScren:updateTapped:300")])
                        if (!resWriteData) {
                            this.setState({loading:false})
                            alert("API Delayed response for MFGInfoScren:updateTapped:300");
                            return
                        }
                        let jsonResponseDeviceDataParams = await resWriteData.text()
                     
                  }

                  this.setState({loading:false})
                  Alert.alert(
                    "Success",
                    "MFG Info modified",
                    [
                     { text: "Ok", onPress: () => this.back()}],
                    { cancelable: false }
                  );
                        
    }

    render(){
        const {themeChanged, HrLimitHi, HrLimitLo, forceFw,Ltemode, xMode, developerMode, routerMac1, routerMac2, friendlyName, location} = this.state;
        let valHrLimitHi = HrLimitHi === '' ? HrLimitHi :HrLimitHi.toString()
        let valHrLimitLo = HrLimitLo === '' ? HrLimitLo :HrLimitLo.toString()
        let valRouterMac1 = routerMac1 === '' ? routerMac1 :routerMac1.toString()
       
        let valForceFw = forceFw === '' ? forceFw :forceFw.toString()
       
        let data = [{label: 'Yes' , value : 'Yes'}, {label: 'No' , value : 'No'}]
        let name = "Mfg Info"
        if (friendlyName != '' && location != ''){
          name = "Mfg Info - "+friendlyName+"("+location+")"
        }else  if (friendlyName != ''){
          name = "Mfg Info - "+friendlyName
        }

    return(
        <KeyboardAwareScrollView 
        keyboardShouldPersistTaps={Platform.OS =='android' ? "handled": "always"}
        style ={[styles.container, {backgroundColor: themeChanged ? 'rgba(27,26,29,1.0)':'rgba(249,249,249,1.0)'}]}
        showsVerticalScrollIndicator={false}>
         <TopHeader leftTitle={name} isDarkMode = {themeChanged} onLeftIconPress={()=> this.back()} macAddress={''}/>
         <View style={{flexDirection:'row'}}>
            <View style={{flexDirection:'column'}}>
            <Text  allowFontScaling={false} style= {[styles.singInText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)',marginTop:height*0.04}]}>BPF Select</Text>
                         <View style={[styles.titleTextFieldContainer, styles.layout]}> 
                            <TextInput
                             style={[styles.titleTextField,{color:themeChanged ? 'rgba(223,223,223,1.0)' : 'black'}]}  
                            returnKeyType = {'done'}
                            keyboardType = {'number-pad'}
                            selectionColor={themeChanged?'white':'black'}
                            underlineColorAndroid = {'transparent'}
                            placeholder = "ENTER BPF"
                            placeholderTextColor = "rgba(189,189,189,1.0)"
                            autoCapitalize = "none"
                            onChangeText={(bpfSelect) => this.setState({bpfSelect})}
                            value={this.state.bpfSelect}
                            />
                        </View>


            </View>

            <View style={{flexDirection:'column', marginLeft:width*0.07}}>
            <Text  allowFontScaling={false} style= {[styles.singInText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)',marginTop:height*0.04}]}>GAIN Select</Text>
                         <View style={[styles.titleTextFieldContainer, styles.layout]}> 
                            <TextInput
                             style={[styles.titleTextField,{color:themeChanged ? 'rgba(223,223,223,1.0)' : 'black'}]}  
                            returnKeyType = {'done'}
                            selectionColor={themeChanged?'white':'black'}
                            underlineColorAndroid = {'transparent'}
                            placeholder = "ENTER GAIN"
                            placeholderTextColor = "rgba(189,189,189,1.0)"
                            autoCapitalize = "none"
                            onChangeText={(gainSelect) => this.setState({gainSelect})}
                            value={this.state.gainSelect}
                            />
                        </View>

                        
            </View>


            <View style={{flexDirection:'column', marginLeft:width*0.07}}>
            <Text  allowFontScaling={false} style= {[styles.singInText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)',marginTop:height*0.04}]}>LTE Select</Text>
            <DropDownPicker
    items={data}
    defaultValue={Ltemode}
    containerStyle={{height: 40, width:80, marginTop:height*0.04 + styles.singInText.fontSize + 10 , marginLeft:15, position:'absolute'}}
    labelStyle = {{fontSize:14, textAlign:'left'}}
    style={{backgroundColor: '#fafafa'}}
    itemStyle={{
        justifyContent: 'flex-start'
    }}
    dropDownStyle={{backgroundColor: '#fafafa'}}
    onChangeItem={item => this.LTEModified(item)}
  
   
/>

                        
            </View>
         </View>

         <Text  allowFontScaling={false} style= {[styles.singInText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)',marginTop:height*0.04}]}>Router Mac 1</Text>
         <View style={[styles.titleTextFieldContainer, styles.layout, {width:width*0.80}]}> 
                            <TextInput
                             style={[styles.titleTextField,{color:themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)',width:width*0.80}]}  
                            returnKeyType = {'done'}
                
                            keyboardType = {'number-pad'}
                            selectionColor={themeChanged?'white':'black'}
                            underlineColorAndroid = {'transparent'}
                            placeholder = ""
                            placeholderTextColor = "rgba(189,189,189,1.0)"
                            autoCapitalize = "none"
                            editable={false}
                            onChangeText={(gainSelect) => this.setState({gainSelect})}
                            value={valRouterMac1}
                            />
                     </View>


                     <Text  allowFontScaling={false} style= {[styles.singInText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)',marginTop:height*0.04}]}>Router Mac 2</Text>
         <View style={[styles.titleTextFieldContainer, styles.layout, {width:width*0.80}]}> 
                            <TextInput
                             style={[styles.titleTextField,{color:themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)',width:width*0.80}]}  
                            returnKeyType = {'done'}
                            keyboardType = {'number-pad'}
                            selectionColor={themeChanged?'white':'black'}
                            underlineColorAndroid = {'transparent'}
                            placeholder = ""
                            editable={false}
                            placeholderTextColor = "rgba(189,189,189,1.0)"
                            autoCapitalize = "none"
                            onChangeText={(gainSelect) => this.setState({gainSelect})}
                            value={routerMac2}
                            />
                     </View> 



                     <View style={{flexDirection:'row'}}>
            <View style={{flexDirection:'column'}}>
            <Text  allowFontScaling={false} style= {[styles.singInText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)',marginTop:height*0.04}]}>HR Limit Hi</Text>
                         <View style={[styles.titleTextFieldContainer, styles.layout, {width:width*0.36}]}> 
                            <TextInput
                             style={[styles.titleTextField,{color:themeChanged ? 'rgba(223,223,223,1.0)' : 'black', width: width*0.36}]}  
                            returnKeyType = {'done'}
                            keyboardType = {'number-pad'}
                            selectionColor={themeChanged?'white':'black'}
                            underlineColorAndroid = {'transparent'}
                            placeholder = "ENTER HR Limit High"
                            placeholderTextColor = "rgba(189,189,189,1.0)"
                            autoCapitalize = "none"
                            onChangeText={(HrLimitHi) => this.setState({HrLimitHi})}
                            value={valHrLimitHi}
                            />
                        </View>


            </View>

            <View style={{flexDirection:'column', marginLeft:width*0.07}}>
            <Text  allowFontScaling={false} style= {[styles.singInText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)',marginTop:height*0.04}]}>HR Limit Low</Text>
                         <View style={[styles.titleTextFieldContainer, styles.layout, {width : width*0.36}]}> 
                            <TextInput
                             style={[styles.titleTextField,{color:themeChanged ? 'rgba(223,223,223,1.0)' : 'black', width: width*0.36}]}  
                            returnKeyType = {'done'}
                            keyboardType = {'number-pad'}
                            selectionColor={themeChanged?'white':'black'}
                            underlineColorAndroid = {'transparent'}
                            placeholder = "ENTER HR Limit Low"
                            placeholderTextColor = "rgba(189,189,189,1.0)"
                            autoCapitalize = "none"
                            onChangeText={(HrLimitLo) => this.setState({HrLimitLo})}
                            value={valHrLimitLo}
                            />
                        </View>

                        
            </View>


          
         </View>

         <View style={{flexDirection:'row'}}>
            <View style={{flexDirection:'column'}}>
            <Text  allowFontScaling={false} style= {[styles.singInText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)',marginTop:height*0.04}]}>Developer Mode</Text>
            <DropDownPicker
    items={data}
    defaultValue={developerMode}
    containerStyle={{height: 40, width:width* 0.30, marginTop:height*0.04 + styles.singInText.fontSize + 10 , marginLeft:15, position:'absolute'}}
    labelStyle = {{fontSize:14, textAlign:'left'}}
    style={{backgroundColor: '#fafafa'}}
    itemStyle={{
        justifyContent: 'flex-start'
    }}
    dropDownStyle={{backgroundColor: '#fafafa'}}
    onChangeItem={item => this.developerModeModified(item)
   }
   
/>


            </View>

            <View style={{flexDirection:'column', marginLeft:width*0.01}}>
            <Text  allowFontScaling={false} style= {[styles.singInText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)',marginTop:height*0.04}]}>X Mode</Text>
            <DropDownPicker
    items={data}
    defaultValue={xMode}
    containerStyle={{height: 40, width:width* 0.30, marginTop:height*0.04 + styles.singInText.fontSize + 10 , marginLeft:10, position:'absolute'}}
    labelStyle = {{fontSize:14, textAlign:'left'}}
    style={{backgroundColor: '#fafafa'}}
    itemStyle={{
        justifyContent: 'flex-start'
    }}
    dropDownStyle={{backgroundColor: '#fafafa'}}
    onChangeItem={item => this.xModeModified(item)
   }
   
/>
                        
            </View>


            <View style={{flexDirection:'column', marginLeft:width*0.07}}>
            <Text  allowFontScaling={false} style= {[styles.singInText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)',marginTop:height*0.04}]}>Force FW</Text>
            <View style={[styles.titleTextFieldContainer, styles.layout, {width : width*0.36, marginTop : height * 0.008}]}> 
                            <TextInput
                             style={[styles.titleTextField,{color:themeChanged ? 'rgba(223,223,223,1.0)' : 'black'}]}  
                            returnKeyType = {'done'}
                            keyboardType = {'number-pad'}
                            selectionColor={themeChanged?'white':'black'}
                            underlineColorAndroid = {'transparent'}
                            placeholder = "Force FW"
                            placeholderTextColor = "rgba(189,189,189,1.0)"
                            autoCapitalize = "none"
                            onChangeText={(forceFw) => this.setState({forceFw})}
                            value={valForceFw}
                            />
                        </View>
                        
            </View>
         </View>
         <ButtonK title={'Save'} style={styles.signInButton} onPress={()=> this.updateTapped()} titleColor={'white'} titleFont={20} titleWeight={'bold'} />
           
{this._renderLoader()}
         </KeyboardAwareScrollView>

        )
    }

}
