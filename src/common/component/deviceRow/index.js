import React, { Component } from 'react'
import {View,Text,TouchableOpacity,Dimensions,Platform} from 'react-native'
import styles from './styles'
import Icon from  'react-native-vector-icons/AntDesign'
import Icon2 from  'react-native-vector-icons/FontAwesome'
import Icon3 from  'react-native-vector-icons/Ionicons'
import Icon4 from  'react-native-vector-icons/Entypo'
const {width,height} = Dimensions.get('window')
import moment from  'moment'
import { checkGenericNoType } from '../../helper/util'
import {getLastDataForDevHealth} from '../../../../galenApiLibrary/setting/sensor'



export default class DeviceRow extends Component {
    constructor(props){
        super(props)

        this.state = {rssValue:'',infoTapped:false,latestVersion:'',currentHardwareVersion:''}
    }

    componentDidMount(){
        const {item, ...props} = this.props
        const devId = item.data?item.data.Devid?item.data.Devid.value.trim():'':''
        
        
    }

   async getCurrentHardwareVersion(devId){

     const resGetLastDataFromGevHealth = await getLastDataForDevHealth(devId)
     if (resGetLastDataFromGevHealth.status === 200){
             let response = await resGetLastDataFromGevHealth.json()
            // console.log('response'+JSON.stringify(response))
           
             if (response.content !== undefined && response.content !== null && response.content.length > 0){
                const lastObject = response.content[0]
                
                let currentVersionStr = lastObject.data.Fwvers ? lastObject.data.Fwvers.value : 'NA'
                let currentHardwareVersion = lastObject.data.Hwvers ? lastObject.data.Hwvers.value : ''
                this.setState({latestVersion:currentVersionStr,currentHardwareVersion:currentHardwareVersion})
            }
         }
            
     }
          
        
        
          
         getCurrentVersion(response){
                
                if (response.content !== undefined && response.content !== null && response.content.length > 0){
                  const lastObject = response.content[0]
        
                  let currentVersionStr = lastObject.data.Fwvers ? lastObject.data.Fwvers.value : 'NA'
                  let currentHardwareVersion = lastObject.data.Hwvers ? lastObject.data.Hwvers.value : ''
                  let rssValue = lastObject.data.WifiRss ? lastObject.data.WifiRss.value : 'NA'

                  this.setState({latestVersion:currentVersionStr,currentHardwareVersion:currentHardwareVersion,rssValue:rssValue})
              }else{
                this.setState({latestVersion:'',currentHardwareVersion:''})
              }
          }

  _renderDetail(){
    const {themeChanged,item,updateWiFiInfo,updateLocation,removeSensor,firmwareTapped, ...props} = this.props
    const macAddress = item.data?item.data.Devid?item.data.Devid.value.trim():'':''
    const Devsn = item.data?item.data.Devsn?item.data.Devsn.value:'N/A':'N/A'
    const model = item.data?item.data.Model?item.data.Model.value:'N/A':'N/A'
    const rssValue = this.state.rssValue.length > 0 ? '  RSS: ('+this.state.rssValue+')':''
    const modelValue = '  Model: '+model
    let replaceMacAddress = Platform.OS === 'ios' ? macAddress.replaceAll(':','') : macAddress.replace(/:/g, '')
       
    const {infoTapped} = this.state
    if (infoTapped){
        return(
<View>           
<Text allowFontScaling={false} style={[styles.normalRowText,{ marginTop:height*0.007, marginLeft:width*0.03, fontSize: height*0.018 }]}>Mac Address: {replaceMacAddress} {rssValue}</Text>
<View style={{flexDirection:'row'}}> 
<View style={{width:width*0.47}}> 
 <Text allowFontScaling={false} style={[styles.normalRowText,{ marginTop:height*0.006, marginLeft:width*0.03, fontSize: height*0.018 }]}>Serial: {Devsn} </Text>
 </View> 
 <View style={{width:width*0.47-15}}> 
 <Text  allowFontScaling={false} style={[styles.normalRowText,{ marginTop:height*0.006, marginLeft:width*0.03, fontSize: height*0.018,textAlign:'right'}]}>{modelValue} </Text>
 </View> 
 </View> 

 <View style={{flexDirection:'row'}}> 
<View style={{width:width*0.47}}> 
 <Text allowFontScaling={false} style={[styles.normalRowText,{ marginTop:height*0.006, marginLeft:width*0.03, fontSize: height*0.018 }]}>FW Ver: {this.state.latestVersion} </Text>
 </View> 
 <View style={{width:width*0.47-15}}> 
 <Text allowFontScaling={false} style={[styles.normalRowText,{ marginTop:height*0.006, marginLeft:width*0.03, fontSize: height*0.018,textAlign:'right'}]}>HW Ver: {this.state.currentHardwareVersion}</Text>
 </View> 
 </View> 


 </View>        
        )
    }else{
        return(<View />)
    }
}

infoBtnTapped(){
    const {infoTapped} = this.state
    this.setState({infoTapped:!this.state.infoTapped})
    const {item, ...props} = this.props
       
    const devId = item.data?item.data.Devid?item.data.Devid.value.trim():'':''
    this.getCurrentHardwareVersion(devId)
}



    render(){
        const {themeChanged,item,updateWiFiInfo,updateLocation,removeSensor,firmwareTapped,findSensorTapped, ...props} = this.props
        const  backgroundColor = themeChanged? 'rgba(37,40,44,1.0)':'transparent'
        const shadowColor = themeChanged?'rgba(223,223,223,1.0)':'rgba(124,124,124,1.0)'
        const friendlyName = item.data?item.data.FriendlyName?item.data.FriendlyName.value.trim():'':''
        const location = item.data?item.data.Location?item.data.Location.value.trim():'':''
        const macAddress = item.data?item.data.Devid?item.data.Devid.value.trim():'':''
        const rssValue = this.state.rssValue.length > 0 ? '  RSS: ('+this.state.rssValue+')':''
        const  infoTapped = this.state.infoTapped
        let message = ''
        if (item.data !== null &&item.data !==undefined){
            if (item.minValueProvidedOn !== null && item.minValueProvidedOn !== undefined){
                var date = moment.utc(item.minValueProvidedOn).format('YYYY-MM-DD HH:mm:ss');

                var stillUtc = moment.utc(date).toDate();
                var local = moment(stillUtc).local().format('hh:mm:ss A');
        
                message = 'Last synced '+local
            }
        }
        
   
        var isActive = "Yes"
        if (item.data !== null && item.data !==undefined && item.data.Active !== undefined && item.data.Active !== null ){
            isActive = item.data.Active.value
         }

       
      
        return(
            <View style={[styles.rowContainer,{backgroundColor:backgroundColor, shadowColor:shadowColor,borderColor:shadowColor,height: infoTapped ? Platform.OS === 'ios' ? height*0.218 :height*0.222  :  Platform.OS === 'ios' ? height*0.12 : height*0.13}]} >
            
            {checkGenericNoType(isActive) && <View style ={[styles.rowContainer,{position:'absolute',backgroundColor:'rgba(114,114,114,0.3)',marginLeft:0,height:infoTapped ? Platform.OS === 'ios' ? height*0.218 :height*0.222 : Platform.OS === 'ios' ? height*0.12 : height*0.13,marginTop:0}]} >
                        <Text allowFontScaling={false} style={{color:'floralwhite',marginTop:5, fontWeight:'bold',width: styles.rowContainer.width - 20, textAlign:'right'
                        }}>In Active </Text>
                         </View> 
                           }


            <View style={styles.row}>
             <TouchableOpacity style={{width:30,height:30,marginLeft:width*0.94-40,marginTop:height*0.012,justifyContent:'center',alignItems:'center',position:'absolute'}} onPress={()=> this.infoBtnTapped()}>
             <Icon4 name={'info-with-circle'} size={25} color={themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(71,71,71,1.0)'} />
             </TouchableOpacity>       
            <Text allowFontScaling={false} style={[styles.rowText,{color : themeChanged ? 'rgba(223,223,223,1.0)' : 'rgba(71,71,71,1.0)'}]}>{friendlyName}</Text>
            <Text allowFontScaling={false} style={styles.normalRowText}> ({location})</Text>
            </View>
            <View style={styles.row}>
             
            <Text allowFontScaling={false} style={[styles.normalRowText,{ marginTop:0, marginLeft:width*0.03 ,fontSize: height*0.018}]}>{message}</Text>
            <TouchableOpacity style={styles.row} onPress={findSensorTapped}>
            <Icon3 name={'hardware-chip-sharp'} size={height*0.018} style={{marginLeft:10}}color={'rgba(164,6,12,1.0)'} />
            <Text allowFontScaling={false} style={[styles.normalRowText,{ marginTop:0, marginLeft:width*0.01 ,fontSize: height*0.018}]}>Find my sensor</Text>
            </TouchableOpacity>
       </View>
            {this._renderDetail()}
             <View style={[styles.operationContainer, {borderTopColor:shadowColor, borderTopWidth:1}]} >
             <TouchableOpacity style={[styles.optionContainer,{borderRightColor:shadowColor,borderRightWidth:1, width:width*0.22}]} onPress={updateWiFiInfo}>
                 <Icon name={'wifi'} size={height*0.018} color={'rgba(164,6,12,1.0)'} />
             <Text allowFontScaling={false} style={[styles.normalRowText,{ marginTop:height*0.0, fontSize: height*0.012 }]}>Modify WiFi Info</Text>
             </TouchableOpacity> 

             <TouchableOpacity style={[styles.optionContainer,{borderRightColor:shadowColor,borderRightWidth:1, width:width*0.28}]} onPress={updateLocation}>
             <Icon2 name={'location-arrow'} size={height*0.018} color={'rgba(164,6,12,1.0)'} />
             <Text  allowFontScaling={false} style={[styles.normalRowText,{ marginTop:height*0.0, fontSize: height*0.012}]}>Modify Sensor Name</Text>
             </TouchableOpacity> 

             <TouchableOpacity style={[styles.optionContainer,{borderRightColor:shadowColor,borderRightWidth:1, width:width*0.22}]}  onPress={removeSensor}>
             <Icon name={'delete'} size={height*0.018} color={'rgba(164,6,12,1.0)'} />
             
             <Text allowFontScaling={false} style={[styles.normalRowText,{marginTop:height*0.0, fontSize: height*0.012 }]}>Delete Sensor</Text>

             </TouchableOpacity> 

             <TouchableOpacity style={[styles.optionContainer,{width:width*0.22}]}  onPress={firmwareTapped}>
             <Icon3 name={'hardware-chip-sharp'} size={height*0.018} color={'rgba(164,6,12,1.0)'} />
             
             <Text allowFontScaling={false} style={[styles.normalRowText,{marginTop:height*0.0, fontSize: height*0.012 }]}>Sensor Control</Text>

             </TouchableOpacity> 
              </View>  


               



             </View>   
        )
    }
}