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
 import {UpdateSensorChanged} from '../../state/emitters'
 import {getSensors, executeApiWith} from '../../api'
 import setStateItem from '../../state/setState/setStateItem'
 import URLS from '../../common/helper/urls'
 import HEADER from '../../common/helper/constants'
 import {SensorDataChange} from '../../state/emitters'
 import { API_TIMEOUT } from '../../common/helper/util';

 import getHeaders from '../../../galenApiLibrary/config/getHeader';

 import { getTablesData , getDevicePropertySet, writeData} from '../../../galenApiLibrary/setting/sensor';
 
import { getBaseURL } from '../../../galenApiLibrary/config/getBaseURL';

 import moment from 'moment'
 
export default class UpdateSensor extends Component{
    constructor(props){
        super(props)

        this.eventUpdateSensorChanged = this.eventUpdateSensorChanged.bind(this)
        this.isValidStringData = this.isValidStringData.bind(this)
        this.state = {themeChanged:getStateItem(DB_KEY.IS_DARK_MODE), friendlyName : '' , location : '' , loading:false, data:props.navigation.state.params.data}
    }


    componentDidMount(){

        const {data} = this.state
        const friendlyName = data.data?data.data.FriendlyName?data.data.FriendlyName.value:'' :''
        const location = data.data?data.data.Location?data.data.Location.value:'' :''

        this.setState({friendlyName, location})
        UpdateSensorChanged. addUpdateSensorChangedListener(this.eventUpdateSensorChanged)
    }

    componentWillUnmount(){
        UpdateSensorChanged.removeUpdateSensorChangedListener(this.eventUpdateSensorChanged)
    }

    eventUpdateSensorChanged(){
        
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

            this.setState({friendlyName:'', location:''})
        }
    }

    back(){
      SensorDataChange.emit('SENSOR_DATA_CHANGED')
        this.props.navigation.goBack()
    }


    updateTapped() {
       const  {friendlyName, location, data} = this.state
        const message = this.validate()
        
        if (message === ''){
            this.setState({loading:true})
            
            const macAddress = data.data?data.data.Devid?data.data.Devid.value:'' :''
            const deviceDataId = data.deviceDataId
            this.addDevice(macAddress, friendlyName, location, deviceDataId)
            
            
        }else{
           
        
        }
    }

    isValidStringData(str) {
        return /[`~!@#%\^&*()={}\[\]\|\\:;"'?\/>.<,]/.test(str);
    }

    validate(){
        var message = '';
      const  {friendlyName, location} = this.state
        if (friendlyName.length === 0){
            message = 'Please enter FriendlyName.'
        }else if (location.length === 0){
            message = 'Please enter Location'
        }else if (this.isValidStringData(friendlyName)){
            alert('Friendly Name contains invalid charecter')
            return
        }
        else if (this.isValidStringData(location)){
          alert('Location contains invalid charecter')
          return
      }
        else{
            var message = '';
        }

        return message
    }



    async  addDevice(macAddress, friendlyName, location, deviceDataId){
        // hit multiple api with await so that loader can be show until device is added

        //API -1 ---------------------------
        // get the something 
        
        let user = getStateItem(DB_KEY.USERS_LIST_ARRAY)
        var userId = ''
        if (user.length > 0) {
            userId = user[0].userId
        }
        
        const  {data} = this.state
        
        this.setState({loading:true})
        
        const resGetTablesData = await getTablesData()
        let jsonResponse = await resGetTablesData.json()
        console.log("getTablesData jsonResponse :"+JSON.stringify(jsonResponse));
        const header = getHeaders()
        

        let content = jsonResponse.content
        
        let dataLength = content !== undefined && content !== null && content.length > 0 ? content.length : 0
        
        if (dataLength > 0){
                // iterate content of device
                for (var index = 0 ;  index < dataLength ; index++){
                    


                    let subContent = jsonResponse.content[index]

                    let deviceId = subContent.deviceId

                    // get the url for device property
                   


                    if (deviceId.toUpperCase().includes("ID") || deviceId.toUpperCase().includes("PA") || deviceId.toUpperCase().includes("TH")){

                        
                       // get the last deviceDataId for the sensor

                       let deviceCriteria ;
                       if (deviceId.toUpperCase().includes("ID")) {
                           // get the device Id for Identity
                           deviceCriteria = [{
                            "key": "Devid",
                            "operator": "Equal",
                            "value": macAddress
                          }]
                       }else if (deviceId.toUpperCase().includes("PA")) {
                        // get the device Id for Identity
                        deviceCriteria = [{
                         "key": "DevidParams",
                         "operator": "Equal",
                         "value": macAddress
                       }]
                    }else if (deviceId.toUpperCase().includes("TH")) {
                        // get the device Id for Identity
                        deviceCriteria = [{
                         "key": "DevidThresholds",
                         "operator": "Equal",
                         "value": macAddress
                       }]
                    }

                    let  bodyForDataDeviceId = {"deviceDataModelId":deviceId, "deviceCriteria":deviceCriteria, "ownerFilter": {
                        "users":[userId]
                      }}
                    var requestOptionsDataDeviceId = {
                        method: 'POST',
                        headers: header,
                        body : JSON.stringify(bodyForDataDeviceId)
                         };
                   
                      let getDeviDataUrl = getBaseURL()+'data/devicedata-advanced?pageSize=1&pageNumber=0'
                      console.log("getDeviDataUrl :"+getDeviDataUrl +"body:: "+JSON.stringify(bodyForDataDeviceId));
        
                      var deviceDataIdToSend = deviceDataId
                      let resGetDeviDataUrl = await executeApiWith(getDeviDataUrl, 'POST', JSON.stringify(bodyForDataDeviceId), header, "updateSensor:addDevice")
        
                    if  (resGetDeviDataUrl.status === 200){
                        let jsonRes = await resGetDeviDataUrl.json()
                        if (jsonRes.content.length > 0){
                            let content = jsonRes.content[0]
                            deviceDataIdToSend = content.deviceDataId
                        }
                    }

                        const resGetDevicePropertySet = await getDevicePropertySet(deviceId)
                        let jsonResponse = await resGetDevicePropertySet.json()

                         let dataToPut;

                         if (deviceId.toUpperCase().includes("ID")){
                           
                           dataToPut = {"Devid":macAddress, "FriendlyName":friendlyName, "Location":location,"TimestampI":moment.utc().format()}
                         }else if (deviceId.toUpperCase().includes("PA")){
                            dataToPut = {"DevidParams":macAddress, "FriendlyNamePa":friendlyName,"ParamsLastupdate":moment.utc().format()}
                          }else if (deviceId.toUpperCase().includes("TH")){
                            dataToPut = { "DevidThresholds":macAddress, "FriendlyNameT":friendlyName}
                          }


                          
                          let body = {"deviceDataModelId":deviceId, "deviceDataId":deviceDataIdToSend,"data":dataToPut, "devicePropertySetId":jsonResponse.content[0].devicePropertySetId}
                        
                          console.log("body :"+JSON.stringify(body));
        
                          var requestOptionsPost = {
                            method: 'POST',
                            headers: header,
                            body : JSON.stringify(body)
                             };
                      //V3
                          this.writeDataOnCloude( JSON.stringify(body), "updateSensor:addDevice")


                    }





                }

    // get the sensor data amd emit the change

await getSensors(false)


let array = getStateItem(DB_KEY.RESIDENT_DATA)
console.log("getSensors:::array::"+JSON.stringify(array));
   
      let length = array.length

      setStateItem(DB_KEY.TOTAL_ARRAY_COUNT,length)     
      setStateItem(DB_KEY.RESIDENT_DATA,array)
      SensorDataChange.emit('SENSOR_DATA_CHANGED')
      


  
           
                this.setState({loading:false})


                Alert.alert(
                    "Success",
                    'Sensor updated',
                    [
                      { text: "OK", onPress: () => this.back()}
                    ],
                    { cancelable: false }
                  );
              
        
        }
        
    }


async writeDataOnCloude(body, caller) {
  const res = await writeData(body)
     
  if (res.status !== 200 || res.status !== 201) {
      this.setState({loading:false})
      //alert("API Delayed response for "+caller);
      return
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

    getHeader(){
        var myHeaders = new Headers();
        myHeaders.append("X-APP-TYPE", HEADER.APP_TYPE);
        myHeaders.append("X-TENANT-DOMAIN", HEADER.TENANT_DOMAIN);
        myHeaders.append("X-API-VERSION", HEADER.API_VERSION);
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Authorization", getStateItem(DB_KEY.ACCESS_TOKEN));

        return getHeaders()
    }

    render(){
        const {themeChanged, data} = this.state
        const name = data.data.FriendlyName.value
       
        return(
            <View style ={[styles.container, {backgroundColor: themeChanged ? 'rgba(27,26,29,1.0)':'rgba(249,249,249,1.0)'}]}>
                <TopHeader leftTitle={name} isDarkMode = {themeChanged} onLeftIconPress={()=> this.back()} macAddress={''}/>
                    <Text  allowFontScaling={false} style= {[styles.singInText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)',marginTop:height*0.05}]}>Friendly Name</Text>
                        <View style={[styles.emailTextFieldContainer, styles.layout]}> 
                            <TextInput
                            style={[styles.emailTextField,{color:themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)'}]}  
                            onSubmitEditing={() => { this.newPasswordTextInput.focus(); }}
                            returnKeyType = {'next'}
                            maxLength={14}
                            keyboardType = {'default'}
                            selectionColor={'black'}
                            underlineColorAndroid = {'transparent'}
                            placeholder = "Enter Friendly Name"
                            placeholderTextColor = "rgba(189,189,189,1.0)"
                            autoCapitalize = "none"
                            onChangeText={(friendlyName) => this.setState({friendlyName})}
                            value={this.state.friendlyName}
                            />
                        </View>
                        <Text  allowFontScaling={false} style= {[styles.errorText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)',marginTop:3}]}>Friendly Name can have max 14 Characters</Text>
                    

                        <Text  allowFontScaling={false} style= {[styles.singInText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)',marginTop:height*0.04}]}>Location</Text>
                        <View style={[styles.emailTextFieldContainer, styles.layout]}> 
                            <TextInput
                            ref={(input) => { this.newPasswordTextInput = input; }}
                            style={[styles.emailTextField,{color:themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)'}]}  
                            returnKeyType = {'done'}
                            keyboardType = {'default'}
                            selectionColor={'black'}
                            maxLength={14}
                            underlineColorAndroid = {'transparent'}
                            placeholder = "Enter Location"
                            placeholderTextColor = "rgba(189,189,189,1.0)"
                            autoCapitalize = "none"
                            onChangeText={(location) => this.setState({location})}
                            value={this.state.location}
                            />
                        </View>
                        <Text  allowFontScaling={false} style= {[styles.errorText, {color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(144,144,144,1.0)',marginTop:3}]}>Location can have max 14 Characters</Text>
                    

                        

                 <ButtonK title={'UPDATE '} style={styles.signInButton} onPress={()=> this.updateTapped()} titleColor={'white'} titleFont={20} titleWeight={'bold'} />
                
                 {this._renderLoader()}
           
            </View>
        );
    }
}