import React, { Component } from 'react';
import {
  View,
  Text,
  Dimensions,
  Switch,
  TouchableOpacity,
  Platform
 } from 'react-native';
import getStateItem from '../../state/getStateItem'
import {DB_KEY} from '../../common/helper/keys'
import TopHeader from '../../common/component/topHeader'
import styles from './styles'
import ButtonK from '../../common/component/Button'
import Loader from '../../common/component/loader'
import URLS from '../../common/helper/urls'
import HEADER from '../../common/helper/constants'
const {width, height} = Dimensions.get('window')
import moment from 'moment'
import {TimezoneModified} from '../../state/emitters'
import TIMEZONE from '../../common/helper/timezone'
//import {Dropdown} from 'react-native-material-dropdown-v2'
import DropDownPicker from 'react-native-dropdown-picker';
import {writeData, getDevicePropertySet} from '../../api'
import { API_TIMEOUT } from '../../common/helper/util';

export default class TimezoneScreen extends Component {
    constructor(props){
        super(props)
        this.state = {themeChanged:getStateItem(DB_KEY.IS_DARK_MODE),loading:false,data:props.navigation.state.params.data, timezone:props.navigation.state.params.timezone}
    }

    back(){
        this.props.navigation.goBack()
    }

    componentDidMount(){
       TIMEZONE.sort((a, b) => a.value.localeCompare(b.value))
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

   
    async updateTapped(){
         const {timezone} = this.state

         if (timezone !== this.props.navigation.state.params.timezone) {
            this.setState({loading:true})
            const promiseGetDevicePropertySetTimeout = new Promise((resolve) => (setTimeout(() => resolve(false),  API_TIMEOUT.INTERVAL)))
            const deviceId = 'd36a4373-fbdc-44a3-8c96-4bb920041e40-id'
            
            const res = await Promise.race([promiseGetDevicePropertySetTimeout,getDevicePropertySet(deviceId,  "timezone:updateTapped:75")])
            if (!res) {
                this.setState({loading:false})
                alert("API Delayed response for timezone:updateTapped:75 ")
                return
            }
            
            if (res.status === 200){
               let jsonResponse = await res.json()
               let  dataToPut = {"Timezone":this.state.timezone,"TimestampI":moment.utc().format()}
               let body = {"deviceDataModelId":deviceId, "deviceDataId":this.state.data.deviceDataId,"data":dataToPut, "devicePropertySetId":jsonResponse.content[0].devicePropertySetId}
               
               console.log("promiseWriteDataTimeout: body: "+JSON.stringify(body))
               const promiseWriteDataTimeout = new Promise((resolve) => (setTimeout(() => resolve(false),  API_TIMEOUT.INTERVAL)))
               const resWriteData = await Promise.race([promiseWriteDataTimeout,writeData(JSON.stringify(body), "timezone:updateTapped:88")])
               if (!resWriteData) {
                   this.setState({loading:false})
                   alert("API Delayed response for timezone:updateTapped:88");
                   return
               }
    
               if (resWriteData.status === 201 || resWriteData.status === 200){
                   let jsonResponseDeviceData = await resWriteData.text()
                   
                   this.setState({loading:false})
                   TimezoneModified.emit('TIMEZONE_MODIFIED')
                   alert('Timezone modified')
                 
               }else{
                   this.setState({loading:false})
                   alert('Not able to update Timezone, Please try again later')
               }
     
              
             }else{
               this.setState({loading:false})
               alert('Not able to update Timezone, Please try again later')
             }
   
         }else{
            alert('Please update the timezone')
         }
 }



   onChangeText(text){



    this.setState({timezone:text})

    }
  
/**
 * 
 * @returns 
 */

async timezoneSelected(item) {
    if (item.value !== 'Select Timezone' && item.value !== this.state.timezone) {
        this.setState({timezone:item.value})
    }
    
}
    render(){
        const {themeChanged, timezone} = this.state;
        var timezoneStr = timezone.length > 0 ? 'Your timezone is '+timezone:'Default Timezone is CST'
        let userListArray = getStateItem(DB_KEY.USERS_LIST_ARRAY);
        let data = [{label: 'Select Timezone', value: 'Select Timezone'}];
        
          for (var index = 0; index < TIMEZONE.length - 1; index++) {
            let dataDict = {
              label: TIMEZONE[index].value,
              value:TIMEZONE[index].value,
            };
            data.push(dataDict);
          }
        
       
    return(
        <View style ={[styles.container, {backgroundColor: themeChanged ? 'rgba(27,26,29,1.0)':'rgba(249,249,249,1.0)'}]}>
         <TopHeader leftTitle={'Timezone'} isDarkMode = {themeChanged} onLeftIconPress={()=> this.back()} macAddress={''}/>
       
        <Text  allowFontScaling={false} style={{marginLeft:10, marginTop:30}}>{timezoneStr}</Text>
        
         <View style ={styles.timeZoneContainer}>
         <DropDownPicker
            controller={instance => (this.userDropdown = instance)}
            items={data}
            defaultValue={'Select Timezone'}
            containerStyle={{height: 40}}
            dropDownMaxHeight={300}
            labelStyle={{fontSize: 10, textAlign: 'left'}}
            style={{backgroundColor: '#fafafa'}}
            itemStyle={{
              justifyContent: 'flex-start',
            }}
            dropDownStyle={{backgroundColor: '#fafafa'}}
            onChangeItem={item => this.timezoneSelected(item)}
           />
        </View>
         

         <ButtonK title={'Save'} style={styles.signInButton} onPress={()=> this.updateTapped()} titleColor={'white'} titleFont={20} titleWeight={'bold'} />
            
          {this._renderLoader()} 

        
         </View>

        )
    }

}