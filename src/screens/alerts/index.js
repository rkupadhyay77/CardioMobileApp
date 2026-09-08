import React, { Component } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert
 } from 'react-native';
import getStateItem from '../../state/getStateItem'
import setStateItem from '../../state/setState/setStateItem'
import {DB_KEY, RESPONSE_MESSAGE} from '../../common/helper/keys'
import TopHeader from '../../common/component/topHeader'
import Loader from '../../common/component/loader'
import HEADER from '../../common/helper/constants'
import {AlertsNumberChanged} from '../../state/emitters'
import DatabaseManager from '../../Database'
import Icon2 from 'react-native-vector-icons/FontAwesome'
import styles from './styles'
import moment from 'moment'
import DropDownPicker from 'react-native-dropdown-picker';
import Icon from 'react-native-vector-icons/Feather';
import URLS from '../../common/helper/urls';
import {AlertsChanged} from '../../state/emitters/index'
import {executeApiWith, writeData, getDevicePropertySet} from '../../api'
import { API_TIMEOUT } from '../../common/helper/util';
import { getBaseURL } from '../../../galenApiLibrary/config/getBaseURL';
const {width, height} = Dimensions.get('window')
import getHeaders from '../../../galenApiLibrary/config/getHeader';
import { getFirstTenAlerts } from '../../../galenApiLibrary/alerts';
import { isEndPointCardio } from '../../../galenApiLibrary/config/getBaseURL';

export default class AlertsScreen extends Component {
    _keyExtractor = (item, index) =>  index.toString()

    constructor(props){
        super(props)
        
       this.state = {themeChanged:getStateItem(DB_KEY.IS_DARK_MODE),loading:false,refresh:false, dataSource:[],mostRecentAlert:[],macAddress:'',filterOption: getStateItem(DB_KEY.LOCAL_DB_USER).filterApplied,filterTapped:false,tabIndex:0,pageNumber:-1,devId:props.navigation.state.params.devId,isSwiping:false, isFilterApplied:true, loadingMore: false}
    }

  
   
    getFilterDevId(){
        if (this.props.navigation.state.params.devId !== undefined && this.props.navigation.state.params.devId !== null &&  this.props.navigation.state.params.devId.length > 0){
           return this.props.navigation.state.params.devId
        }

        return ''
    }

    _getUniqueArray(arr) {
        // Set to get unique objects
        
            let setObj = new Set(arr.map(JSON.stringify));
            let output = Array.from(setObj).map(JSON.parse);
            return output
    }

    componentDidMount(){
        const {navigation} = this.props;
       navigation.addListener('didFocus', () => {
            setStateItem(DB_KEY.CURRENTLY_SELECTED,'alerts')
        })

        this.setState({loading:true})
        this.setState({dataSource:[], mostRecentAlert:[]})
        this.fetchFreshAlert()
        
      // this.filterTheData()
  let timeInterval = isEndPointCardio() === true ? 10000 : 200000 // 1o seconds and 200 seconds
      
      this._intervalForAlert = setInterval(() => {
        this._checkNewAlert();
      }, 200000);
  }

  _getUserId() {
    let userListArray = []
    let userArray = getStateItem(DB_KEY.USERS_LIST_ARRAY)
    return userArray[0].userId
 }

  async _checkNewAlert() {
    let res = await getFirstTenAlerts(this._getUserId(),this.state.devId)
    if (res.length > 0){
        // check for first alert
        let firstAlert = res[0]
        if (this.state.mostRecentAlert.length === 0){
            this.setState({mostRecentAlert:[firstAlert], refresh: !this.state.refresh})
        }else{
            //maxValueProvidedOn
            let existingFirstAlert = this.state.mostRecentAlert[0]
            if (existingFirstAlert.maxValueProvidedOn !== firstAlert.maxValueProvidedOn) {
                this.setState({mostRecentAlert:[firstAlert], refresh: !this.state.refresh})
            }
        }

        let reversed = res.reverse();
        var modified = false
        var array = this.state.dataSource
        for(var index = 0 ; index < reversed.length ; index++) {
            let alert = reversed[index]
            if (!this.state.dataSource.includes(alert)){
                modified = true
                array.unshift(alert);
            }
        }
        if (modified === true) {
            let uniqueArray = this._getUniqueArray(array)
            this.setState({dataSource:uniqueArray, refresh: !this.state.refresh})
            this.filterDataFor(this.state.filterOption, this.state.tabIndex)
        }
     }
  }

   async fetchFreshAlert() {
        let res = await getFirstTenAlerts(this._getUserId(),this.state.devId)
        this.setState({loading:false})
        if (res.length > 0) {
            let page = this.state.pageNumber
              setStateItem(DB_KEY.ALERTS_ARRAY, res)
               this.setState({dataSource:getStateItem(DB_KEY.ALERTS_ARRAY),mostRecentAlert:[getStateItem(DB_KEY.ALERTS_ARRAY)[0]] , refresh:!this.state.refresh,pageNumber:page+1})
        } 
    }

    filterTheData() {
        const {dataSource} = this.state
        if (this.props.navigation.state.params.devId !== undefined && this.props.navigation.state.params.devId !== null &&  this.props.navigation.state.params.devId.length > 0){
            const devId = this.props.navigation.state.params.devId
       
            const filtered = this.getDataForDevId(dataSource,devId)
            if (filtered.length > 0){
                let uniqueArray = this._getUniqueArray(filtered)
                 this.setState({dataSource:uniqueArray, refresh:!this.state.refresh})
                this.initialSetUp()
            }else{
                this.setState({dataSource:[]})
                this.loadNextData()
            }
            
        }else{
            this.initialSetUp()
        }
    }

    initialSetUp(){
        const {dataSource} = this.state
        let localDbUser = getStateItem(DB_KEY.LOCAL_DB_USER)
        if (localDbUser.localReadArray !== undefined && localDbUser.localReadArray !== null && localDbUser.localReadArray.length > 0){
       setStateItem(DB_KEY.LOCAL_READ_ALERT_ARRAY, localDbUser.localReadArray)
        }else{
            setStateItem(DB_KEY.LOCAL_READ_ALERT_ARRAY, [])
        }

        this.filterDataFor(this.state.filterOption,0)
        setTimeout(()=>{
            this.handleTabsChange(1)
        },100)
    }


    getDataForDevId(content,devId){
        
        const {dataSource} = this.state
        const filtered = content.filter((data) =>data.data.DevidAlerts.value === devId)
       return filtered
    }

    componentWillUnmount(){
        clearInterval(this._intervalForAlert)
    }

   
    back(){
        this.props.navigation.goBack()
        AlertsChanged.emit('ALERTS_CHANGED')
    }

    _renderIcon(item, index){
        let alertType = item.data ?item.data.AlertType? item.data.AlertType.value:'N/A' : 'N/A'
        
        if (alertType !== undefined && alertType !== undefined){
            if (alertType === 'Heart Rate'){
                return(
                    <View style ={styles.imgContainer} >
                        <Image source={require('../../img/heart.png')} style={{width:20,height:18}} />
                          </View>  
                   
               )
            }else if (alertType === 'Breath Rate'){
                return(
                    <View style ={styles.imgContainer} >
                       <Image source={require('../../img/respiratory.png')} style={{width:32.5,height:28.5}}/>  
                          </View>  
                   
               )
            }else if (alertType === 'Stress'){
                return(
                    <View style ={styles.imgContainer} >
                        <Image source={require('../../img/stress.png')} style={{width:30,height:34.5}}/>  
              </View>  
                   
               )
            }else if (alertType === 'Motion'){
                return(
                    <View style ={styles.imgContainer} >
                        <Image source={require('../../img/motion.png')} style={{width:30,height:30}}/>  
            </View>  
                   
               )
            }else {
                return(
                    <View style ={styles.imgContainer} >
                    </View>  
                   
               )
            }
        }else{
            return(
                <View style ={styles.imgContainer} >
                </View>  
               
           )
        }
        
    }

    _renderSensorName(item, index){
        const {themeChanged} = this.state;
        const macAddress = item.data? item.data.DevidAlerts ? item.data.DevidAlerts.value:'N/A' :'N/A'
        const alertTime = item.data? item.data.Atext ? item.data.Atext.valueProvidedOn:'N/A' :'N/A'
         const alertType =  item.data? item.data.AlertType ? item.data.AlertType.value:'N/A' :'N/A'
         const alertFlag =  item.data? item.data.AlertFlag ? item.data.AlertFlag.value:0 :0
       
        const name = this.getUserNameFor(macAddress)
       let alreadyRead = alertFlag === 0 ? true : false
        return(
            <View style={styles.topMargin}>
                 <Text  allowFontScaling={false} style={[styles.textStyle, {fontWeight:alreadyRead? 'normal':'bold',fontSize:alreadyRead? 14:16,color: themeChanged ? 'rgba(255,255,255,1.0)':'rgba(27,26,29,1.0)' }]}>{name}</Text>
                  </View>  
           
       )
    }

    _renderSensorAlert(item, index){
        let alertText = item.data? item.data.Atext ? item.data.Atext.value:'N/A' :'N/A'
        const macAddress = item.data? item.data.DevidAlerts ? item.data.DevidAlerts.value:'N/A' :'N/A'
        const alertTime = item.data? item.data.Atext ? item.data.Atext.valueProvidedOn:'N/A' :'N/A'
         const alertType =  item.data? item.data.AlertType ? item.data.AlertType.value:'N/A' :'N/A'
         const alertFlag =  item.data? item.data.AlertFlag ? item.data.AlertFlag.value:0 :0
       
         let alreadyRead = alertFlag === 0 ? true : false
        const {themeChanged} = this.state;

        return(
            <View style={styles.margin}>
                 <Text  allowFontScaling={false} style={[styles.textStyle, {fontWeight:alreadyRead? 'normal':'bold',fontSize:alreadyRead? 14:16,color: themeChanged ? 'rgba(255,255,255,1.0)':'rgba(27,26,29,1.0)' }]}>{alertText}</Text>
                  </View>  
           
       )
    }
    _renderAlertTime(item, index){
        
        var momentTz = require('moment-timezone');
        //var date = moment().tz("America/Los_Angeles").format();
        const macAddress = item.data? item.data.DevidAlerts ? item.data.DevidAlerts.value:'N/A' :'N/A'
       const alertTime = item ? item.minValueProvidedOn : 'N/A'
        const timeZone = item.user ? item.user.timeZone?item.user.timeZone :'' :''
        const {themeChanged} = this.state;
        const alertType =  item.data? item.data.AlertType ? item.data.AlertType.value:'N/A' :'N/A'
        const alertFlag =  item.data? item.data.AlertFlag ? item.data.AlertFlag.value:0 :0
       
        var date = ''
           date =  momentTz.tz(alertTime,  'America/Chicago').format("YYYY-MM-DD HH:mm:ss") + " "+timeZone;
            let alreadyRead = alertFlag === 0 ? true : false
    
    
            var myDate =  moment(alertTime,"YYYY-MM-DD").format("DD-MM-YYYY");
            var todayDate = moment().format("DD-MM-YYYY");  
            var yesterdayDate = moment().subtract(1, 'days').format("DD-MM-YYYY");  
            
            if (myDate === todayDate){
                var newTime = moment(alertTime).format("h:mm a");
                date = "Today "+newTime+ " "+timeZone;
            }else if (myDate === yesterdayDate){
                var newTime = moment(alertTime).format("h:mm a");
                date = "Yesterday "+newTime+ " "+timeZone;
            }else{
                var newTime = moment(alertTime).format("DD MMM  YY, h:mm a");
                date = newTime+ " "+timeZone;
    
            }
        
      


        return(
            <View style={styles.timeStampMargin}>
                <Text  allowFontScaling={false} style={[styles.textStyle, {fontWeight:alreadyRead? 'normal':'bold',fontSize:alreadyRead? 14:16,color: themeChanged ? 'rgba(255,255,255,1.0)':'rgba(27,26,29,1.0)' }]}>{date}</Text>
                  </View>  
           
       )
    }

    async deleteAlertApi(item,index){
        // get the device devicePropertySetId first
        
         const headers = this.getHeaders()
         const alerts_Device_Id = 'd36a4373-fbdc-44a3-8c96-4bb920041e40-as'
        

         let url =  getBaseURL()+"data/d36a4373-fbdc-44a3-8c96-4bb920041e40-as/"+URLS.DEVICEDATA_DELETE
         let raw = JSON.stringify({"deviceDataIds":[item.deviceDataId]})
         var requestOptions = {
            method: 'POST',
            headers: headers,
            body: raw,
            redirect: 'follow'
          
        };
        
        let res = await executeApiWith(url, 'POST' , raw, headers, "AlertScreen:deleteAlertApi")
        if (res.status === 200 || res.status === 201){
            var alerts = this.state.dataSource
            alerts.splice(index, 1);
            setStateItem(DB_KEY.ALERTS_ARRAY,alerts)
            let uniqueArray = this._getUniqueArray(alerts)
             this.setState({dataSource:uniqueArray, refresh:!this.state.refresh,loading:false})
            this.getUnreadAlertCount()
         }else{
             this.setState({loading:false})
             alerts('Some error occured while deleting the alert')
         }
    }

    async makeRead(item,index){
        
       
        let alertFlag = item.data.AlertFlag
        alertFlag.value = 0
        item.data.AlertFlag = alertFlag

        let alerts = this.state.dataSource
        alerts[index] = item

        setStateItem(DB_KEY.ALERTS_ARRAY,alerts)
        let uniqueArray = this._getUniqueArray(alerts)
            
        this.setState({dataSource:uniqueArray, refresh:!this.state.refresh})

        const macAddress = item.data? item.data.DevidAlerts ? item.data.DevidAlerts.value:'N/A' :'N/A'
        const timeStamp = item ? item.minValueProvidedOn : 'N/A'
        const alertType =  item.data? item.data.AlertType ? item.data.AlertType.value:'N/A' :'N/A'
        const deviceDataId = item.deviceDataId

        
        // get the device devicePropertySetId first
        const headers = this.getHeaders()
        const alerts_Device_Id = 'd36a4373-fbdc-44a3-8c96-4bb920041e40-as'
        const promiseGetDevicePropertySetTimeout = new Promise((resolve) => (setTimeout(() => resolve(false),  API_TIMEOUT.INTERVAL)))
        const res = await Promise.race([promiseGetDevicePropertySetTimeout,getDevicePropertySet(alerts_Device_Id,  "AlertScreen:makeRead:296")])
        if (!res) {
             alert("API Delayed response for AlertScreen:makeRead:296 ")
            return
        }
        
        if (res.status === 200) {
              let json = await res.json()
              let content = json.content

              if (content.length > 0){
                  let devicePropertySetId = content[0].devicePropertySetId

                  // now we have this
                  let body = {"deviceDataModelId":alerts_Device_Id, "data":{"AlertFlag":0}, "deviceDataId":deviceDataId,"devicePropertySetId":devicePropertySetId}
                  let raw = JSON.stringify({"deviceDataModelId":"d36a4373-fbdc-44a3-8c96-4bb920041e40-as", "data":{"AlertFlag":0}, "deviceDataId":
                  deviceDataId,"devicePropertySetId":"192be2fb-e680-40d0-90cf-660e7baa6735"})

                  const promiseWriteDataTimeout = new Promise((resolve) => (setTimeout(() => resolve(false),  API_TIMEOUT.INTERVAL)))
                    const resWriteData = await Promise.race([promiseWriteDataTimeout,writeData(raw, "AlertScreen:makeRead")])
                    if (!resWriteData) {
                        alert("API Delayed response for AlertScreen:makeRead");
                        return
                    }

                  this.getUnreadAlertCount()
            }
        }

 

       // this.saveToRead(macAddress,timeStamp, alertType)
        //this.setState({refresh: !this.state.refresh})
    }

    checkIfAlertIsRead(macAddress, timeStamp, alertType){
        let localReadAlertArray = getStateItem(DB_KEY.LOCAL_READ_ALERT_ARRAY)
        let filtered = localReadAlertArray.filter((alert)=>  (alert.timeStamp === timeStamp && alert.macAddress === macAddress && alert.alertType === alertType ))

        return  filtered.length > 0

    }

    checkIfAlertExist(){
        let localReadAlertArray = getStateItem(DB_KEY.LOCAL_READ_ALERT_ARRAY)
        let alerts = getStateItem(DB_KEY.ALERTS_ARRAY)

        return localReadAlertArray.length !== alerts.length
    }

    saveToRead(macAddress, timeStamp, alertType){

        // first get the user profileData
        let userEmail = getStateItem(DB_KEY.USER_EMAIL)
        

        let localDbUser = getStateItem(DB_KEY.LOCAL_DB_USER)
        if (localDbUser.localReadArray !== undefined && localDbUser.localReadArray !== null && localDbUser.localReadArray.length > 0){
            let localReadArray = localDbUser.localReadArray
            let dataToInsert = {timeStamp:timeStamp,macAddress:macAddress, alertType:alertType}
            localReadArray.push(dataToInsert)
            localDbUser.localReadArray = localReadArray
            
            AlertsNumberChanged.emit('ALERTS__NUMBER_CHANGED')

            setStateItem(DB_KEY.LOCAL_READ_ALERT_ARRAY, localReadArray)

            DatabaseManager.saveUserProfileData(userEmail,localDbUser )
        }else{
            let localReadArray = []
            let dataToInsert = {timeStamp:timeStamp,macAddress:macAddress, alertType:alertType}
            localReadArray.push(dataToInsert)
            localDbUser.localReadArray = localReadArray
            
            AlertsNumberChanged.emit('ALERTS__NUMBER_CHANGED')

            setStateItem(DB_KEY.LOCAL_READ_ALERT_ARRAY, localReadArray)

            DatabaseManager.saveUserProfileData(userEmail,localDbUser )
        }

  }

    makeReadAlert(){
        Alert.alert(
            "Read Alert",
            "Are you sure to mark all Alerts as Read?",
            [
              {
                text: "No",
                style: "cancel"
              },
              { text: "Yes" }
            ]
          )
    }

    // makeRead(){
    //     for(var index=0; index < this.state.dataSource.length; index++){
    //         const item = this.state.dataSource[index]

    //         this.makeRead(item,0)
    //     }
    // }


    _renderMarkAsRead(){
        const {themeChanged} = this.state;
        if (this.checkIfAlertExist()){
            return (
                <TouchableOpacity style={{width:width*0.5,height:50, flexDirection:'row',marginLeft:30,marginTop:10}} onPress={()=> this.makeReadAlert()}>
                     <Icon name="message-square" size={18} color="#900" />
                     <Text  allowFontScaling={false} style={[styles.textStyle, {fontWeight:'bold',fontSize:16,color: themeChanged ? 'rgba(255,255,255,1.0)':'rgba(27,26,29,1.0)' }]}>   Mark as Read</Text>
                 
                </TouchableOpacity>    
            )
        }
    }

    deleteAlert(item,index){
        this.setState({loading:true})
        this.deleteAlertApi(item,index)
    }

    tap(item,index){
        this.swipe.recenter()
       
      
        Alert.alert(
            "Delete",
            "Are you sure to want to delete this Alert?",
            [
              {
                text: "No",
                style: "cancel"
              },
              { text: "Yes", onPress: () => {this.deleteAlert(item,index)} }
            ]
          )
        Alert
      }

    /*renderRow(item, index){
        const {themeChanged,currentlyOpenSwipeable} = this.state;
        const itemProps = {
          onOpen: (event, gestureState, swipeable) => {
            if (currentlyOpenSwipeable && currentlyOpenSwipeable !== swipeable) {
              currentlyOpenSwipeable.recenter();
            }
    
            this.setState({currentlyOpenSwipeable: swipeable});
          },
          onClose: () => this.setState({currentlyOpenSwipeable: null})
        };
        return(
            <Swipeable
            onRef={ref => this.swipe = ref}
            onSwipeStart={() => this.setState({isSwiping: true})}
      onSwipeRelease={() => this.setState({isSwiping: false})}
            rightButtons={[
    
              <TouchableOpacity onPress={()=> this.tap(item,index)} style={[styles.subContainer,{backgroundColor: themeChanged? 'rgba(37,40,44,1.0)':'#FFF',shadowColor:themeChanged?'#000':'rgba(124,124,124,1.0)', width:60, top: height*0.01,height:100, marginLeft:0, justifyContent:'center', alignItems:'center'}]} >
              <Icon2 name={'trash'}  color={'red'} size={25} />
                <Text  allowFontScaling={false} style={[styles.nameText,{color:themeChanged?'white':'rgba(70,70,70,1.0)', fontSize:height*0.018}]}>Clear Alert</Text>
              </TouchableOpacity>,
           ]}
            onRightButtonsOpenRelease={itemProps.onOpen}
            onRightButtonsCloseRelease={itemProps.onClose}
          >
            <TouchableOpacity style ={[styles.rowStyle, styles.rowDirection, {backgroundColor: themeChanged ? 'rgba(27,26,29,1.0)':'rgba(255,255,255,1.0)'}]} onPress={()=> this.makeRead(item,index)}>
                 {this._renderIcon(item, index)} 
                 <View style = {styles.columnDirection}>
                     {this._renderSensorName(item, index)}
                     {this._renderSensorAlert(item, index)}
                     {this._renderAlertTime(item, index)}
                 </View>
                 
             </TouchableOpacity>   
             </Swipeable>
        )
    }*/

    renderRow(item, index){
        const {themeChanged} = this.state;
        return (
        <View>
             <TouchableOpacity style ={[styles.rowStyle, styles.rowDirection, {backgroundColor: themeChanged ? 'rgba(27,26,29,1.0)':'rgba(255,255,255,1.0)'}]} onPress={()=> this.makeRead(item,index)}>
                 {this._renderIcon(item, index)} 
                 <View style = {styles.columnDirection}>
                     {this._renderSensorName(item, index)}
                     {this._renderSensorAlert(item, index)}
                     {this._renderAlertTime(item, index)}
                 </View>
                 
             </TouchableOpacity>   
        </View>
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

    getUserNameFor(macAddress){
       let sensorData =  getStateItem(DB_KEY.RESIDENT_DATA)
       let filtered = sensorData.filter((item)=>item.data.Devid.value === macAddress)
       if (filtered !== undefined && filtered !== null && filtered.length > 0){
            let item =  filtered[0]
            const friendlyName = item.data?item.data.FriendlyName?item.data.FriendlyName.value:'':''
            const location = item.data?item.data.Location?item.data.Location.value:'':''
            const fullName = item.user?item.user.fullName:''

            return fullName + ' | '+ friendlyName + ' | ' +location
       }

       return ''
        //  const friendlyName = item.data?item.data.FriendlyName?item.data.FriendlyName.value:'':''
        //const location = item.data?item.data.Location?item.data.Location.value:'':''
        
    }

    getFriendlyNameFor(macAddress){
        let sensorData =  getStateItem(DB_KEY.RESIDENT_DATA)
        let filtered = sensorData.filter((item)=>item.data.Devid.value === macAddress)
        if (filtered !== undefined && filtered !== null && filtered.length > 0){
             let item =  filtered[0]
             const friendlyName = item.data?item.data.FriendlyName?item.data.FriendlyName.value:'':''
            return friendlyName 
        }
 
        return ''
     }

    filterAction(){
        this.setState({filterTapped:!this.state.filterTapped})
        //this.controller.open();
    }

    filterOptionChanged(item){
        
        if (item.value !== 'ALL'){
            const filterOption = this.state.filterOption
            const index = filterOption.indexOf('ALL');
            if (index > -1) {
                filterOption.splice(index, 1);
            }
             if (!filterOption.includes(item.value )){
                filterOption.push(item.value )
                this.setState({
                    filterOption: filterOption,
                    filterTapped:false
                })
              
           
                this.saveFilterOption(this.state.filterOption)
                this.filterDataFor(this.state.filterOption, this.state.tabIndex)
            }else{
                const index = filterOption.indexOf(item.value);
                if (index > -1) {
                    filterOption.splice(index, 1);
                }

                if(filterOption.length === 0){
                    filterOption.push('ALL')
                }
                this.setState({
                    filterOption: filterOption,
                    filterTapped:false
                })
                
                this.saveFilterOption(this.state.filterOption)
                 this.filterDataFor(this.state.filterOption, this.state.tabIndex)
            }
            
        }else{
            let filterOption = this.state.filterOption
            filterOption = ['ALL']
            this.setState({
                filterOption: ['ALL'],
                filterTapped:false
            })
            this.saveFilterOption([item.value])
            this.filterDataFor([item.value], this.state.tabIndex)
        }
       

       
    }

    saveFilterOption(filterOption){
        let localDbUser = getStateItem(DB_KEY.LOCAL_DB_USER)
      if (localDbUser.filterApplied !== undefined && localDbUser.filterApplied !== null && localDbUser.filterApplied.length > 0){
        localDbUser.filterApplied = filterOption
        }else{
            localDbUser.filterApplied = filterOption
        }

        DatabaseManager.saveUserProfileData(getStateItem(DB_KEY.USER_EMAIL),localDbUser)
    }

    getFilterType(filter) {
         if (filter.toUpperCase() === "HR") {
            return "Heart Rate"
         }else if(filter.toUpperCase() === "RR") {
            return "Breath Rate"
         }else if(filter.toUpperCase() === "ST") {
            return "Stress"
         }else if(filter.toUpperCase() === "MT") {
            return "Motion"
         }
    }

    filterDataFor(filterMode,tabIndex){
        
        const {dataSource,filterOption} = this.state

        if (filterMode.includes('ALL')){
            if(this.getFilterDevId() !== ''){
               let filtered = this.getDataForDevId(getStateItem(DB_KEY.ALERTS_ARRAY),this.getFilterDevId())
               let uniqueArray = this._getUniqueArray(filtered)
               this.setState({dataSource:uniqueArray, refresh:!this.state.refresh})
            }else{
                let uniqueArray = this._getUniqueArray(getStateItem(DB_KEY.ALERTS_ARRAY))
              
                this.setState({dataSource:uniqueArray, refresh:!this.state.refresh})
           }
        }else{
            
            if (filterOption.length === 4) {
                if (tabIndex === 1){
                    if(this.getFilterDevId() !== ''){
                        let filtered = this.getDataForDevId(getStateItem(DB_KEY.ALERTS_ARRAY),this.getFilterDevId())
                        const lastWeek = this.getLastWeekFilteredData(filtered)
                        let uniqueArray = this._getUniqueArray(lastWeek)
              
               
                        this.setState({dataSource:uniqueArray, refresh:!this.state.refresh})
                    }else{
                        const lastWeek = this.getLastWeekFilteredData(getStateItem(DB_KEY.ALERTS_ARRAY))
                        let uniqueArray = this._getUniqueArray(lastWeek)
              
                        this.setState({dataSource:uniqueArray, refresh:!this.state.refresh})
                    }
                    
                }else{
                    if(this.getFilterDevId() !== ''){
                        let filtered = this.getDataForDevId(getStateItem(DB_KEY.ALERTS_ARRAY),this.getFilterDevId())
                        let uniqueArray = this._getUniqueArray(filtered)
              
                        this.setState({dataSource:uniqueArray, refresh:!this.state.refresh})
                     }else{
                        let filtered = getStateItem(DB_KEY.ALERTS_ARRAY)
                        let uniqueArray = this._getUniqueArray(filtered)
              
                         this.setState({dataSource:uniqueArray, refresh:!this.state.refresh})
                    }
                }
                

            }else if (filterOption.length === 3) {
                let option1 = filterOption[0]
                let option2 = filterOption[1]
                let option3 = filterOption[2]

                let option1Filter = this.getFilterType(option1)
                let option1Filter2 = this.getFilterType(option2)
                let option1Filter3 = this.getFilterType(option3)
               
                const filtered = getStateItem(DB_KEY.ALERTS_ARRAY).filter((data) => (data.data.AlertType.value === option1Filter || data.data.AlertType.value === option1Filter2 || data.data.AlertType.value === option1Filter3 ))
                
                if (tabIndex=== 1){
                    const lastWeek = this.getLastWeekFilteredData(filtered)
                    if(this.getFilterDevId() !== ''){
                        const filterForDev = this.getDataForDevId(lastWeek, this.getFilterDevId())
                        let uniqueArray = this._getUniqueArray(filterForDev)
              
                        this.setState({dataSource:uniqueArray,refresh:!this.state.refresh})
                    }else{
                        let uniqueArray = this._getUniqueArray(lastWeek)
              
                        this.setState({dataSource:uniqueArray,refresh:!this.state.refresh})
                    }
                
                    
                }else{
                    if(this.getFilterDevId() !== ''){
                        const filterForDev = this.getDataForDevId(filtered,this.getFilterDevId())
                        let uniqueArray = this._getUniqueArray(filterForDev)
              
                        this.setState({dataSource:uniqueArray,refresh:!this.state.refresh})
                    }else{
                        let uniqueArray = this._getUniqueArray(filtered)
              
                        this.setState({dataSource:uniqueArray, refresh:!this.state.refresh})
                    }
                    
                }
            }else if (filterOption.length === 2) {
                let option1 = filterOption[0]
                let option2 = filterOption[1]

                let option1Filter = this.getFilterType(option1)
                let option1Filter2 = this.getFilterType(option2)

                //console.log('option1Filter'+option1Filter)
                //console.log('option1Filter2'+option1Filter2)
                
               //console.log('alerts'+JSON.stringify(getStateItem(DB_KEY.ALERTS_ARRAY)))
                const filtered = getStateItem(DB_KEY.ALERTS_ARRAY).filter((data) => (data.data.AlertType.value=== option1Filter || data.data.AlertType.value === option1Filter2))
                if (tabIndex=== 1){
                    const lastWeek = this.getLastWeekFilteredData(filtered)
                    if(this.getFilterDevId() !== ''){
                        const filterForDev = this.getDataForDevId(lastWeek, this.getFilterDevId())
                        let uniqueArray = this._getUniqueArray(filterForDev)
              
                        this.setState({dataSource:uniqueArray,refresh:!this.state.refresh})
                    }else{
                        let uniqueArray = this._getUniqueArray(lastWeek)
              
                        this.setState({dataSource:uniqueArray,refresh:!this.state.refresh})
                    }
                
                    
                }else{
                    if(this.getFilterDevId() !== ''){
                        const filterForDev = this.getDataForDevId(filtered, this.getFilterDevId())
                        let uniqueArray = this._getUniqueArray(filterForDev)
              
                        this.setState({dataSource:uniqueArray,refresh:!this.state.refresh})
                    }else{
                        let uniqueArray = this._getUniqueArray(filtered)
              
                        this.setState({dataSource:uniqueArray, refresh:!this.state.refresh})
                    }
                    
                }
                
            }else{
                let option = filterOption[0]
               
               // console.log('ALERTS_ARRAY'+JSON.stringify(getStateItem(DB_KEY.ALERTS_ARRAY)))
                let option1Filter = this.getFilterType(option)
                //console.log('option1Filter'+option1Filter)
               
                const filtered = getStateItem(DB_KEY.ALERTS_ARRAY).filter((data) => (data.data.AlertType.value === option1Filter))
                //console.log('filtered'+JSON.stringify(filtered))
               
                if (tabIndex=== 1){
                    const lastWeek = this.getLastWeekFilteredData(filtered)
                    if(this.getFilterDevId() !== ''){
                        const filterForDev = this.getDataForDevId(lastWeek, this.getFilterDevId())
                        let uniqueArray = this._getUniqueArray(filterForDev)
              
                        this.setState({dataSource:uniqueArray,refresh:!this.state.refresh})
                    }else{
                        let uniqueArray = this._getUniqueArray(lastWeek)
              
                        this.setState({dataSource:uniqueArray,refresh:!this.state.refresh})
                    }
                
                    
                }else{
                    if(this.getFilterDevId() !== ''){
                        const filterForDev = this.getDataForDevId(filtered, this.getFilterDevId())
                        let uniqueArray = this._getUniqueArray(filterForDev)
              
                        this.setState({dataSource:uniqueArray,refresh:!this.state.refresh})
                    }else{
                        let uniqueArray = this._getUniqueArray(filtered)
              
                        this.setState({dataSource:uniqueArray, refresh:!this.state.refresh})
                    }
                    
                }
            } 
        }
    }

    getLastWeekFilteredData(array){
        
        let newDataSource = []
                for (var index = 0; index < array.length ; index++){
                    let item = array[index]
                    const alertTime = item ? item.minValueProvidedOn : 'N/A'
                   
                    if (alertTime !== 'N/A'){
                        var myDate =  moment(alertTime,"YYYY-MM-DD").format("DD-MM-YYYY");
                        var todayDate = moment().format("DD-MM-YYYY");  
                        var dateofvisit = moment(myDate, 'DD-MM-YYYY');
                        var today = moment();
                       const difference =  today.diff(dateofvisit, 'days');
           
                        if (difference <= 7){
                          newDataSource.push(item)
                        }
                    }
                    
                }
      
                return newDataSource
    }

    _renderDropDown(){
        if(this.state.filterTapped){
            return(
                <DropDownPicker
                items={[
                    this.state.filterOption.includes('ALL') ? {label: 'ALL', value: 'ALL', icon: () => <Icon name="check" size={18} color="#900" />} :  {label: 'ALL', value: 'ALL'},
                   this.state.filterOption.includes('HR') ? {label: 'HR', value: 'HR', icon: () => <Icon name="check" size={18} color="#900" />} :  {label: 'HR', value: 'HR'},
                   this.state.filterOption.includes('RR') ? {label: 'RR', value: 'RR', icon: () => <Icon name="check" size={18} color="#900" />} :  {label: 'RR', value: 'RR'},
                   this.state.filterOption.includes('ST') ? {label: 'STRESS', value: 'ST', icon: () => <Icon name="check" size={18} color="#900" />} :  {label: 'STRESS', value: 'ST'},
                   this.state.filterOption.includes('MT') ? {label: 'MOTION', value: 'MT', icon: () => <Icon name="check" size={18} color="#900" />} :  {label: 'MOTION', value: 'MT'},
                    ]}
                isVisible={true}
               controller={instance => this.controller = instance}
                containerStyle={{height: 0,width:width*0.30,top:-20,marginLeft:width*0.66}}
                style={{backgroundColor: '#fafafa'}}
                itemStyle={{
                    justifyContent: 'flex-start'
                }}
                dropDownStyle={{backgroundColor: '#fafafa'}}
                onChangeItem={item => this.filterOptionChanged(item)}
            />
            )
        }
    }

      handleTabsChange = index => {
       this.setState({tabIndex:index})
       if (index === 0 ){
        const {filterOption} = this.state
        this.filterDataFor(filterOption,index)
       }else{
           // filter the available data for next 7 days only 
          
           let newDataSource = []
          for (var index = 0; index < this.state.dataSource.length ; index++){
              let item = this.state.dataSource[index]
              const alertTime = item ? item.minValueProvidedOn : 'N/A'
             
              
              var myDate =  moment(alertTime,"YYYY-MM-DD").format("DD-MM-YYYY");
              var todayDate = moment().format("DD-MM-YYYY");  
              var dateofvisit = moment(myDate, 'DD-MM-YYYY');
              var today = moment();
             const difference =  today.diff(dateofvisit, 'days');
 
              if (difference <= 7){
                newDataSource.push(item)
              }
          }
          let uniqueArray = this._getUniqueArray(newDataSource)
              
          this.setState({dataSource:uniqueArray,refresh:!this.state.refresh})
       }

     };

 getHeaders(){
        var myHeaders = new Headers();
        myHeaders.append("X-APP-TYPE", HEADER.APP_TYPE);
        myHeaders.append("X-TENANT-DOMAIN", HEADER.TENANT_DOMAIN);
        myHeaders.append("X-API-VERSION",HEADER.API_VERSION);
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Authorization", getStateItem(DB_KEY.ACCESS_TOKEN));

        return getHeaders()
     }



     async getUnreadAlertCount(){
       
        let userListArray = []
         let userArray = getStateItem(DB_KEY.USERS_LIST_ARRAY)
      
        userArray.map((content)=> {
         if (content.fullName.length > 0){
           userListArray.push(content.userId)
         }
        
       })
      
      
  
        // var myHeaders = new Headers();
        // myHeaders.append("X-APP-TYPE", HEADER.APP_TYPE);
        // myHeaders.append("X-TENANT-DOMAIN", HEADER.TENANT_DOMAIN);
        // myHeaders.append("X-API-VERSION",HEADER.API_VERSION);
        // myHeaders.append("Content-Type", "application/json");
        // myHeaders.append("Authorization", getStateItem(DB_KEY.ACCESS_TOKEN));

        const myHeaders  = getHeaders()
  
         var deviceCriteriaArray = []

         let residentsList = getStateItem(DB_KEY.RESIDENT_DATA)
  
        for (var index = 0 ; index < residentsList.length ; index++){
          let resident = residentsList[index]
  
          let macAddress = resident.data.Devid.value
  
          let dict = {"key":"DevidAlerts","operator":"Equal","value":macAddress}
  
          deviceCriteriaArray.push(dict)

          if (index === residentsList.length - 1) {
            let dict2 = {
                "key": "AlertFlag",
                "operator": "Equal",
                "value": 1
              }

              deviceCriteriaArray.push(dict2)

          }

        }
        
        var raw;
        if(this.state.devId !== ''){
            raw = JSON.stringify({"deviceDataModelId":"d36a4373-fbdc-44a3-8c96-4bb920041e40-as","deviceCriteria":[{"key":"DevidAlerts","operator":"Equal","value":this.state.devId},{
                "key": "AlertFlag",
                "operator": "Equal",
                "value": 1
              }]});
        
        }else{
            raw = JSON.stringify({"deviceDataModelId":"d36a4373-fbdc-44a3-8c96-4bb920041e40-as","deviceCriteriaGroup":{"isOr":true,"groupElements":deviceCriteriaArray}});
         }
       
        var requestOptions = {
          method: 'POST',
          headers: myHeaders,
          body: raw,
          redirect: 'follow'
        };

        let page = this.state.pageNumber

        let pageNumber = page + 1
  
      
        let url = getBaseURL() + "data/devicedata-advanced?pageNumber=0&pageSize=1&sortBy=data.Timestamp.value&sortOrder=DESC"
       //V3
        
        let response1 = await executeApiWith(url, 'POST', raw, myHeaders, "AlertScreen:getUnreadAlertCount")
        
        if (response1.status === 200) {
            let jsonData1 = await response1.json() 
            
            if (jsonData1.content !== undefined && jsonData1.content !== null && jsonData1.content.length > 0){
                let totalElements = jsonData1.totalElements

                setStateItem(DB_KEY.TOTAL_UNREAD_ALERT,totalElements)

                AlertsNumberChanged.emit('ALERTS__NUMBER_CHANGED')
              }else{
                setStateItem(DB_KEY.TOTAL_UNREAD_ALERT,0)

                AlertsNumberChanged.emit('ALERTS__NUMBER_CHANGED')
              }
        }else{
            setStateItem(DB_KEY.TOTAL_UNREAD_ALERT,0)
            setStateItem(DB_KEY.ALERTS_COUNT_ARRAY, [])
                           
            AlertsNumberChanged.emit('ALERTS__NUMBER_CHANGED')
        }
        
     }






     async loadNextData(){
        this.setState({loadingMore:true})
        let userListArray = []
        let userArray = getStateItem(DB_KEY.USERS_LIST_ARRAY)
     
       userArray.map((content)=> {
        if (content.fullName.length > 0){
          userListArray.push(content.userId)
        }
       
      })
     
     
 
    //    var myHeaders = new Headers();
    //    myHeaders.append("X-APP-TYPE", HEADER.APP_TYPE);
    //    myHeaders.append("X-TENANT-DOMAIN", HEADER.TENANT_DOMAIN);
    //    myHeaders.append("X-API-VERSION",HEADER.API_VERSION);
    //    myHeaders.append("Content-Type", "application/json");
    //    myHeaders.append("Authorization", getStateItem(DB_KEY.ACCESS_TOKEN));

       const myHeaders  = getHeaders()

       let user = getStateItem(DB_KEY.USERS_LIST_ARRAY)
       var userId = ''
       if (user.length > 0) {
           userId = user[0].userId
       }
 
        var deviceCriteriaArray = []

        let residentsList = getStateItem(DB_KEY.RESIDENT_DATA)
 
       for (var index = 0 ; index < residentsList.length ; index++){
         let resident = residentsList[index]
 
         let macAddress = resident.data.Devid.value
 
         let dict = {"key":"DevidAlerts","operator":"Equal","value":macAddress}
 
         deviceCriteriaArray.push(dict)
 
       }
       
       var raw;
       if(this.state.devId !== ''){
           raw = JSON.stringify({"deviceDataModelId":"d36a4373-fbdc-44a3-8c96-4bb920041e40-as","deviceCriteria":[{"key":"DevidAlerts","operator":"Equal","value":this.state.devId}]});
       
       }else{
           raw = JSON.stringify({"deviceDataModelId":"d36a4373-fbdc-44a3-8c96-4bb920041e40-as","ownerFilter": {
               "users":[userId]
             }});
        }
      
       var requestOptions = {
         method: 'POST',
         headers: myHeaders,
         body: raw,
         redirect: 'follow'
       };

       let page = this.state.pageNumber

       let pageNumber = page + 1
 
     
       let url = getBaseURL() + "data/devicedata-advanced?pageNumber="+pageNumber+"&pageSize=10&sortBy=maxValueProvidedOn&sortOrder=DESC"
      //V3
     // console.log("RKDebug:loadNextData+url: "+url+" body: "+raw)
     let response1 = await executeApiWith(url, 'POST', raw, myHeaders, "AlertScreen:loadNextData")
       
      // console.log("RKDebug:loadNextData:status: "+response1.status)
      this.setState({loadingMore:false})
       if (response1.status === 200) {
           let jsonData1 = await response1.json() 
           
           if (jsonData1.content !== undefined && jsonData1.content !== null && jsonData1.content.length > 0){
               var array = this.state.dataSource
               let newData =  jsonData1.content

               if (newData.length > 0 ){
                   for (var index = 0 ; index < newData.length ; index++){
                       array.push(newData[index])
                   }
               }
               
               setStateItem(DB_KEY.ALERTS_ARRAY, array)
               let uniqueArray = this._getUniqueArray(getStateItem(DB_KEY.ALERTS_ARRAY))
          
               this.setState({dataSource:uniqueArray,mostRecentAlert:[getStateItem(DB_KEY.ALERTS_ARRAY)[0]] , refresh:!this.state.refresh,pageNumber:page+1})
              this.filterDataFor(this.state.filterOption, this.state.tabIndex)
             }else{
               setStateItem(DB_KEY.ALERTS_ARRAY, [])
               let uniqueArray = this._getUniqueArray(getStateItem(DB_KEY.ALERTS_ARRAY))
          
               this.setState({dataSource:uniqueArray,mostRecentAlert:[],refresh:!this.state.refresh,pageNumber:-1})
               this.filterDataFor(this.state.filterOption, this.state.tabIndex)
             }
       }


       this.setState({loading:false})
       
     }
//{this._renderMarkAsRead()}
     _renderContent(){
        const {themeChanged,tabIndex,filterOption} = this.state;
        
         if (this.state.dataSource.length > 0){
return(
    <View style={{flex:1}}>
         <FlatList
                scrollEnabled={!this.state.isSwiping}
                style = {{paddingTop:0}}
                extraData = {this.state.refresh}
                data={this.state.dataSource}
               renderItem = {({item, index})=> this.renderRow(item, index)}
                keyExtractor = {this._keyExtractor}
                onEndReached = {this.loadNextData.bind(this)}
               
                / >
                {this.renderFooter()}
                     
            </View>
             
    
)
         }else{
             return(
                 <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
                      <Text  allowFontScaling={false} style={[styles.textStyle, {color: themeChanged ? 'rgba(255,255,255,1.0)':'rgba(27,26,29,1.0)' , fontSize:height*0.023}]}>There is  no alert for this sensor</Text>
                  
                 </View>
             )
         }
     }

     async deleteAllAlert(){


          // get last 1 year date
          this.setState({loading:true})
          let todayDate = moment.utc().format()
          let oneYearDate = moment.utc().subtract(365,"days").format()
         // let oneYearDate = moment.utc().add(365,"days").format("YYYY-MM-DD'T'HH:mm:ssZ")

          let url = getBaseURL()+"data/d36a4373-fbdc-44a3-8c96-4bb920041e40-as/devicedata/delete"

          {/* var myHeaders = new Headers();
        myHeaders.append("X-APP-TYPE", 'EUWP');
        myHeaders.append("X-TENANT-DOMAIN", HEADER.TENANT_DOMAIN);
        myHeaders.append("X-API-VERSION",HEADER.API_VERSION);
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Authorization", getStateItem(DB_KEY.ACCESS_TOKEN)); */}

        const myHeaders  = getHeaders()

        let user = getStateItem(DB_KEY.USERS_LIST_ARRAY)[0]
        
  

var deviceCriteria;
        if (this.props.navigation.state.params.devId !== undefined && this.props.navigation.state.params.devId !== null &&  this.props.navigation.state.params.devId.length > 0){
            const devId = this.props.navigation.state.params.devId
                deviceCriteria =  [
                    {
                    "key": "TimestampA",
                    "operator": "Between",
                    "valueFrom": oneYearDate,
                    "valueTo": todayDate
                    },{
                        "key": "DevidAlerts",
                    "operator": "Equal", 
                    "value" : devId
                    }
             ]
            }else{
                deviceCriteria =  [
                    {
                    "key": "TimestampA",
                    "operator": "Between",
                    "valueFrom": oneYearDate,
                    "valueTo": todayDate
                    }
             ]
            }
        
            //Debug:deleteAllAlert:users"+user)
//V3
        let raw = JSON.stringify({
            "deviceDataModelId":"d36a4373-fbdc-44a3-8c96-4bb920041e40-as",
            "deviceCriteria": deviceCriteria,
             "ownerFilter": {
                 "users": [
                    user.userId
                  ]}
        })
        
        var requestOptions = {
          method: 'POST',
          headers: myHeaders,
          body: raw,
          redirect: 'follow'
        };

       // console.log("RKDebug:deleteAllAlert:url"+url+"body"+raw)
//V3
        let res = await executeApiWith(url, 'POST', raw, myHeaders, "AlertScreen:deleteAllAlert")
      
        
        if (res.status === 200){
             // call the api to get alerts
             this.setState({loading:true})
             this.fetchFreshAlert()
             this.loadNextData()
             this.getUnreadAlertCount()
            
             this.setState({loading:false , dataSource : [], refresh: !this.state.refresh})
             alert('Alert deleted successfully')
        }else{
            alert('Some error occurred, Please try again later')
            this.setState({loading:false})
        }
  

     }

    

    async keepLast7DaysAlert(){
 // get last 1 year date
 this.setState({loading:true})
        // let startDate = moment.utc().add(7,"days").format("YYYY-MM-DD'T'HH:mm:ssZ")
        //  let oneYearDate = moment.utc().add(365,"days").format("YYYY-MM-DD'T'HH:mm:ssZ")

        let startDate = moment.utc().subtract(7,"days").format()
          let oneYearDate = moment.utc().subtract(365,"days").format()

          let url = getBaseURL()+"data/d36a4373-fbdc-44a3-8c96-4bb920041e40-as/devicedata/delete"

          {/* var myHeaders = new Headers();
        myHeaders.append("X-APP-TYPE", 'EUWP');
        myHeaders.append("X-TENANT-DOMAIN", HEADER.TENANT_DOMAIN);
        myHeaders.append("X-API-VERSION",HEADER.API_VERSION);
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Authorization", getStateItem(DB_KEY.ACCESS_TOKEN)); */}

        const myHeaders  = getHeaders()

        let user = getStateItem(DB_KEY.USERS_LIST_ARRAY)[0]
        
var deviceCriteria;
 if (this.props.navigation.state.params.devId !== undefined && this.props.navigation.state.params.devId !== null &&  this.props.navigation.state.params.devId.length > 0){
            const devId = this.props.navigation.state.params.devId
                deviceCriteria =  [
                    {
                    "key": "TimestampA",
                    "operator": "Between",
                    "valueFrom": oneYearDate,
                    "valueTo": startDate
                    },{
                        "key": "DevidAlerts",
                    "operator": "Equal", 
                    "value" : devId
                    }
             ]
            }else{
                deviceCriteria =  [
                    {
                    "key": "TimestampA",
                    "operator": "Between",
                    "valueFrom": oneYearDate,
                    "valueTo": startDate
                    }
             ]
            }
        

        let raw = JSON.stringify({
            "deviceDataModelId":"d36a4373-fbdc-44a3-8c96-4bb920041e40-as",
            "deviceCriteria": deviceCriteria,
             "ownerFilter": {
                 "users": [
                    user.userId
                  ]}
        })
        
        var requestOptions = {
          method: 'POST',
          headers: myHeaders,
          body: raw,
          redirect: 'follow'
        };
//V3
        let res = await executeApiWith(url, 'POST', raw, myHeaders, "AlertScreen:keepLast7DaysAlert")
      
        
        if (res.status === 200){
             // call the api to get alerts
             
             this.setState({loading:false , dataSource : [], pageNumber: -1})
             this.setState({loading:true})
             this.fetchFreshAlert()
             this.loadNextData()
             this.getUnreadAlertCount()
             alert('Alert deleted successfully')
        }else{
            alert('Some error occurred, Please try again later')
            this.setState({loading:false})
        }
  
     }

     showDeleteAlertDialog(){
        const message = 'Are you sure you to delete the Alerts?'

Alert.alert(
    "Delete Alert",
    message,
        [
      
              {
                text: "Delete All Alerts",
                onPress: () => this.deleteAllAlert(),
                style: "cancel"
              },
              { text: "Keep last 7 Days Alerts", onPress: () => this.keepLast7DaysAlert() },
              {
                text: "Cancel",
                style: "cancel"
              }
            ]
)
     }

    
    renderFooter = () => {
        const {loadingMore, themeChanged} = this.state;
        let color = themeChanged ? "white" : "black";
        let bgcolor = themeChanged ? "black" : "white";
  
    if (loadingMore === true) {
        return (
      <View style={[styles.footerLoader, {backgroundColor: bgcolor}]}>
        <ActivityIndicator size="small" color={color} />
        <Text style={{color: color, width: '100%', textAlign: 'center'}}>Loading more...</Text>
      </View>
    );
    }
    else {
        return(<View></View>)
    }
    
  };
    

    _renderDataOnUI() {
        const {themeChanged,tabIndex,filterOption,devId,isFilterApplied} = this.state;
        const isAlert = this.checkIfAlertExist()
        var filterApplied = ''
        let name = 'All Sensor'
        if (devId !== ''){
            name = this.getFriendlyNameFor(devId)
        }


      

         filterOption.map((option)=> filterApplied = filterApplied+ ' '+option+',')
            filterApplied = filterApplied.slice(0, -1)
        if (isFilterApplied === true){
            return(
            <View style={{flex:1}}>
                <View style={styles.filterContainerView}>
                     <Text style={styles.textFilter}>Most Recent Alert</Text>
                </View>
                
                <View style={{marginTop: - height*0.01,}}>
                    <FlatList
                            scrollEnabled={!this.state.isSwiping}
                            extraData = {this.state.refresh}
                            data={this.state.mostRecentAlert}
                        renderItem = {({item, index})=> this.renderRow(item, index)}
                            keyExtractor = {this._keyExtractor}
                            onEndReached = {this.loadNextData.bind(this)}
                           

                    / >
                     
            </View>

         

                <View style={[styles.filterContainerView, {flexDirection: 'row'}]}>
                                    
                    <Text  allowFontScaling={false} style={[styles.textStyle, {fontWeight:'bold',fontSize:16,color: '#0482f7', marginLeft:width*0.03,marginTop:8,width:'50%'}]}>Filter Applied: {filterApplied}</Text>
                    
                            <TouchableOpacity style = {{marginLeft:width*0.46 - 30, width:25, height: 25, marginTop:8}} onPress={()=> this.showDeleteAlertDialog()}>
                                <Icon2 name = {'trash'} color = {'red'} size={25}></Icon2>
                            </TouchableOpacity>
                </View>

                <View style={{marginTop: - height*0.01,}}>
                    <FlatList
                            scrollEnabled={!this.state.isSwiping}
                            extraData = {this.state.refresh}
                            data={this.state.dataSource}
                        renderItem = {({item, index})=> this.renderRow(item, index)}
                            keyExtractor = {this._keyExtractor}
                            onEndReached = {this.loadNextData.bind(this)}
                    / >
                     
            </View>
            {this.renderFooter()}
            </View>
            )
        }else{
            return(
               <View>
                        <View style={{width:width*0.92,marginLeft:width*0.04}}>
                                    
                                    </View>
                                    <View style={{flexDirection:'row'}}>
                                    
                                    <Text  allowFontScaling={false} style={[styles.textStyle, {fontWeight:'bold',fontSize:16,color: '#0482f7', marginLeft:width*0.03,marginTop:-5,width:'50%'}]}>Filter Applied: {filterApplied}</Text>
                                
                                <TouchableOpacity style = {{marginLeft:width*0.46 - 30, width:25, height: 25}} onPress={()=> this.showDeleteAlertDialog()}>
                                <Icon2 name = {'trash'} color = {'red'} size={25}></Icon2>
                                    
                                </TouchableOpacity>
                                    </View>
                                
                            <View style={{width,height:isAlert?height*0.8:height*0.9}}>
                            {this. _renderContent()} 
                                
                        </View>  
                 </View>
            )
        }
       
    }
 
    render(){
        const {themeChanged,tabIndex,filterOption,devId} = this.state;
        const isAlert = this.checkIfAlertExist()
        var filterApplied = ''
        let name = 'All Sensor'
        if (devId !== ''){
            name = this.getFriendlyNameFor(devId)
        }


      

         filterOption.map((option)=> filterApplied = filterApplied+ ' '+option+',')
            filterApplied = filterApplied.slice(0, -1)
        
        
        return(
            <View
            style ={[styles.container, {backgroundColor: themeChanged ? 'rgba(27,26,29,1.0)':'rgba(249,249,249,1.0)'}]}
            >
             <TopHeader name={name} leftTitle={'Alerts'} themeChanged = {themeChanged} bellIcon={true} filterAction={()=> this.filterAction()} onLeftIconPress={()=> this.back()} macAddress={devId}/>
            {this._renderDropDown()}

       
           {this._renderDataOnUI()}
            {this._renderLoader()}   


            </View>  
        )
    }
}