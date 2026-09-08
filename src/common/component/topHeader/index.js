
import React, { Component } from 'react'
import { View , Text, Dimensions, TouchableOpacity, Image} from 'react-native'
import styles from './styles'
import getStateItem from '../../../state/getStateItem'
import {DB_KEY} from '../../../common/helper/keys'
import {AlertsNumberChanged} from '../../../state/emitters'
import HEADER from '../../../common/helper/constants'
import Icon from 'react-native-vector-icons/Feather'
import {getUnreadAlertCount} from '../../helper/validate'
import {executeApiWith} from '../../../api'
import getHeaders from '../../../../galenApiLibrary/config/getHeader'
import TABLE from '../../../../galenApiLibrary/config/TableIdentifier'
import { getBaseURL } from '../../../../galenApiLibrary/config/getBaseURL'

const {width , height }  = Dimensions.get('window')

export default class TopHeader extends Component{

  constructor(props){
    super(props)
    this.eventAlertsNumberChanged = this.eventAlertsNumberChanged.bind(this)


    this.state = {alertNumber:0, themeChanged: getStateItem(DB_KEY.IS_DARK_MODE)}
  }

  _getUserId() {
    let userListArray = []
    let userArray = getStateItem(DB_KEY.USERS_LIST_ARRAY)
    return userArray[0].userId
 }

  async getAlertAccount(){
       
    

    const {macAddress, ...props} = this.props;
    
    const headers = this.getHeaders()
    var raw=null;
    let userId = this._getUserId()
    if (macAddress.length > 0) {
      raw = JSON.stringify({ "deviceDataModelId": TABLE.ALERTS, "deviceCriteria":[{"key":"DevidAlerts","operator":"Equal","value":macAddress},{"key":"AlertFlag","operator":"Equal","value":1}], "ownerFilter": {"users":[userId]}});
    }else{
      raw = JSON.stringify({ "deviceDataModelId": TABLE.ALERTS,"deviceCriteria":[{"key":"AlertFlag","operator":"Equal","value":1}], "ownerFilter": {"users":[userId]}});
    }
   
      var requestOptions = {
        method: 'POST',
        headers: headers,
        body: raw,
        redirect: 'follow'
      };

      let url = getBaseURL() + 'data/devicedata-advanced?pageSize=1&pageNumber=0'
      //V3
      let res = await executeApiWith(url, 'POST', raw, headers, "TopHeader:getAlertAccount")
      
      if (res.status === 200){
          let json = await res.json()
          
          let totalElements = json.totalElements
          if (totalElements > 999 && totalElements !== 0 && totalElements !== this.state.alertNumber){
              this.setState({alertNumber:'999+'})
          }else if (totalElements !== 0 && totalElements < 1000 && totalElements !== this.state.alertNumber){
            this.setState({alertNumber:totalElements})
          }
      }
}

getHeaders(){
        
  var myHeaders = new Headers();
  myHeaders.append("X-APP-TYPE", HEADER.APP_TYPE);
  myHeaders.append("X-TENANT-DOMAIN", HEADER.TENANT_DOMAIN);
  myHeaders.append("X-API-VERSION",HEADER.API_VERSION);
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Authorization", getStateItem(DB_KEY.ACCESS_TOKEN));

  return getHeaders()
}

  componentDidMount(){
    AlertsNumberChanged.addAlertsNumberChangedListener(this.eventAlertsNumberChanged)
    this.getAlertAccount()
  }

  componentWillUnmount(){
    AlertsNumberChanged.removeAlertsNumberChangedListener(this.eventAlertsNumberChanged)

  }

  eventAlertsNumberChanged(){
    
    const unreadAlertCount =  getUnreadAlertCount()
    this.setState({alertNumber:unreadAlertCount})
  }

  _renderBellIcon(){
    const {bellIcon,filterAction, ...props} = this.props;
    const {themeChanged} = this.state;
    if (bellIcon){
      return(
      <View style={styles.bellContainer}> 
      <TouchableOpacity onPress={filterAction}>
       
       <Icon name={'filter'} size = {25} color={'rgba(164,6,12,1.0)'} style={{top:height*0.014}} />
       </TouchableOpacity>
     <Icon name={'bell'} size = {25} color={'rgba(164,6,12,1.0)'} style={{top:height*0.014, marginLeft:10}} />
     
      {this.renderAlertNumber()}

      </View>
      )
    }
  }

  renderAlertNumber(){
    const {alertNumber} = this.state
   
    if (alertNumber === '999+'){
      return (
        <View style={[styles.bellContainer, {backgroundColor:'rgba(164,6,12,1.0)',position:'absolute',width:35, height:35, marginTop:-10, marginLeft:42,borderRadius:17.5,alignItems:'center',justifyContent:'center'}]}  >
        <Text  allowFontScaling={false} style={{color:'rgba(243,243,243,1.0)', fontSize: 12, fontWeight: 'bold'}}>{alertNumber}</Text>
          </View> 
      )
    }else  if (alertNumber !== 0){
      return(
        <View style={[styles.bellContainer, {backgroundColor:'rgba(164,6,12,1.0)',position:'absolute',width:36, height:36, marginTop:-14, marginLeft:39,borderRadius:18,alignItems:'center',justifyContent:'center'}]}  >
        <Text  allowFontScaling={false} style={{color:'rgba(243,243,243,1.0)', fontSize: 12, fontWeight: 'bold'}}>{alertNumber}</Text>
          </View> 
      )
    }else{
      return (<View></View>)
    }

  }
    render(){
        const {leftTitle,onLeftIconPress,name,style,macAddress, ...props} = this.props;
        const {themeChanged} = this.state;
            let title = leftTitle
         
        return(
            <View style={[styles.container, {backgroundColor: themeChanged ?'rgba(30,30,32,1.0)':'rgba(255,255,255,1.0)', shadowColor : themeChanged ?  "#000" : "rgba(240,240,240,1.0)", borderBottomColor:themeChanged? "#000" : 'rgba(240,240,240,1.0)'}]}>
             {title === 'Alerts' && <Text  allowFontScaling={false} style={[styles.leftTitle, {textAlign:'center',width:width,color : themeChanged ? 'rgba(249,249,249,1.0)' : 'rgba(60,60,60,1.0)',position:'absolute'}]}>{name}</Text>}
              
            <View style={styles.rowContainer}>  
            <View style={styles.rowContainer} >
              
              <Icon style={{marginTop:height*0.06}} name = {'chevron-left'} size = {height*0.04} color={themeChanged ? 'rgba(249,249,249,1.0)' : 'rgba(60,60,60,1.0)' }/>
               <Text  allowFontScaling={false} style={[styles.leftTitle, {color : themeChanged ? 'rgba(249,249,249,1.0)' : 'rgba(60,60,60,1.0)'}]}>{title}</Text>
               <TouchableOpacity style={styles.iconContainer} onPress={onLeftIconPress}>
                 
                 </TouchableOpacity> 
                 
             </View>  
           
            {this._renderBellIcon()}
             </View> 

            </View>
        );
    }
}