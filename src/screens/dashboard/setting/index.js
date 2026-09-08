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
  ScrollView,
  Alert,
  Linking
} from 'react-native';

import styles from './styles'

import SettingRow from '../../../common/component/settingRow'
import Header from '../../../common/component/header'
import ActionSheet from '../../../common/component/actionSheet'
import getStateItem from '../../../state/getStateItem'
import setStateItem from '../../../state/setState/setStateItem'
import ThemeChange from '../../../state/emitters/themeChange'
import {ShowThemeAlertChanged, ShowUnitTypeAlert, UnitTypeChanged , AlertsNumberChanged, LoginMounted, NotificationModified , ShowStatsThemeChanged , StatsThemeChanged} from '../../../state/emitters'
import Loader from '../../../common/component/loader';
import {DB_KEY, RESPONSE_MESSAGE} from '../../../common/helper/keys'
import { StackActions, NavigationActions } from 'react-navigation'
import {deleteUserAccount} from '../../../../galenApiLibrary/createUser';
import GetStateItem from '../../../state/getStateItem';


export default class Setting extends Component {
  constructor(props){
      super(props)

      this.eventThemeChange = this.eventThemeChange.bind(this)
      this.eventUnitTypeChanged = this.eventUnitTypeChanged.bind(this)
      this.notificationModified = this.notificationModified.bind(this)
      this.statsThemeChanged =  this.statsThemeChanged.bind(this)
      this.state = {showActionSheet:false, themeChanged:getStateItem(DB_KEY.IS_DARK_MODE), isFahrenheit : getStateItem(DB_KEY.IS_UNIT_FAHRENHEIT), statsTheme:getStateItem(DB_KEY.STATS_THEME),textNotification:'', loading:false}

  }

  componentDidMount(){
    const { navigation } = this.props;
    this.focusListener = navigation.addListener('didFocus', () => {
      console.log('[TIMER_DEBUG] Setting: didFocus - setting CURRENTLY_SELECTED = settings');
      AlertsNumberChanged.emit('ALERTS__NUMBER_CHANGED')
      setStateItem(DB_KEY.CURRENTLY_SELECTED,'settings')

      
   });
    ThemeChange.addThemeChangeListener(this.eventThemeChange)
    UnitTypeChanged.addUnitTypeChangedListener(this.eventUnitTypeChanged)
    NotificationModified.addNotificationModified(this.notificationModified)
    StatsThemeChanged.addStatsThemeChangedListener(this.statsThemeChanged)
    this.notificationModified()

   
  }

  componentWillUnmount(){
    console.log('[TIMER_DEBUG] Setting: componentWillUnmount');
    if (this.focusListener) this.focusListener.remove();
    ThemeChange.removeThemeChangeListener(this.eventThemeChange)
    UnitTypeChanged.removeUnitTypeChangedListener(this.eventUnitTypeChanged)
    NotificationModified.removeNotificationModified(this.notificationModified)
    StatsThemeChanged.removeStatsThemeChangedListener(this.statsThemeChanged)
  }

  notificationModified(){
    let enableNotification = getStateItem(DB_KEY.ENABLE_NOTIFICATION)
     
    let textNotification = enableNotification ? 'ON': 'OFF'
    this.setState({textNotification:textNotification})
  }

  statsThemeChanged(){
    let statsTheme = getStateItem(DB_KEY.STATS_THEME)
    this.setState({statsTheme:statsTheme})
  }
  
  
  
  _renderActionSheet(){
     const {showActionSheet} = this.state

     if (showActionSheet){
       return (<ActionSheet />)
     }else{
       return(<View />)
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

  eventThemeChange(){
    const theme = getStateItem(DB_KEY.IS_DARK_MODE)
    this.setState({themeChanged: theme})
  }

  eventUnitTypeChanged(){
    const isFahrenheit = getStateItem(DB_KEY.IS_UNIT_FAHRENHEIT)
    this.setState({isFahrenheit: isFahrenheit})
  }

  unitChangedTapped(){
    ShowUnitTypeAlert.emit('SHOW__UNIT_ALERT')
  }

  themeChangedTapped(){
    const {themeChanged} = this.state
    
    ShowThemeAlertChanged.emit('SHOW__THEME_ALERT')
}


statsThemeChangedTapped(){
  
  ShowStatsThemeChanged.emit('SHOW__STATS_THEME')
}

  logOutUser(){
     this.reset()
  }

  aboutTapped(){
    let nav = getStateItem(DB_KEY.LOGIN_NAV)
   nav.navigate('AboutScreen')
}

changePasswordTapped(){
  let nav = getStateItem(DB_KEY.LOGIN_NAV)
 nav.navigate('ChangePassword')
}




contactTapped(){
  
  let nav = getStateItem(DB_KEY.LOGIN_NAV)
  nav.navigate('ContactScreen')
}

termsTapped(){
  let nav = getStateItem(DB_KEY.LOGIN_NAV)
 nav.navigate('TermsScreen',{isForTerms:true})
 
}

  reset() {
    setStateItem(DB_KEY.ACCESS_TOKEN,'')
    setStateItem(DB_KEY.USER,null)
    setStateItem(DB_KEY.IS_DARK_MODE,false)
    setStateItem(DB_KEY.RESIDENT_DATA,null)
    setStateItem(DB_KEY.SELECTED_DEVICE_ID,null)
    setStateItem(DB_KEY.SELECTED_MAC_ADDRESS,null)  
    setStateItem(DB_KEY.SIGNAL_SYNC_ARRAY,[])
    setStateItem(DB_KEY.RESIDENT_SIGNAL_SYNC_ARRAY,[])
    setStateItem(RESPONSE_MESSAGE.SUCCESS,'')
    setStateItem(RESPONSE_MESSAGE.FAILURE,'')
    setStateItem(DB_KEY.ALERTS_ARRAY,[])
    setStateItem(DB_KEY.NUMBER_OF_ALERTS,0)
    setStateItem(DB_KEY.LOCAL_RESIDENT_LIST,[])
    setStateItem(DB_KEY.DRAWER_NAV,null)
    setStateItem(DB_KEY.LOCAL_READ_ALERT_ARRAY,[])
    setStateItem(DB_KEY.CURRENTLY_SELECTED,'')
    setStateItem(DB_KEY.REPORTS_ARRAY,[])
   
    let nav = getStateItem(DB_KEY.NAVIGATOR)
    nav.goBack()
    
    LoginMounted.emit('LOGIN_MOUNTED')
  }

  faqTapped(){
    let nav = getStateItem(DB_KEY.LOGIN_NAV)
   nav.navigate('FAQScreen')
  }

  logoutTapped(){
    Alert.alert(
      'Logout',
      "Are you sure you want to Logout?",
      [
        {text: 'Yes', onPress: () => this.logOutUser()},
        {text: 'No'},
      ],
      { cancelable: false }
    )
  }

  handleVideoClick = () => {
    const url = 'https://youtu.be/cIb2dqZNDto'
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        alert("can't open URI: " + url);
      }
    });
  };

  ObserveTapped(){
    let nav = getStateItem(DB_KEY.LOGIN_NAV)
    nav.navigate('ObserveListScreen')
  }

  deleteUser(){
    Alert.alert(
      'DELETE',
      "Are you sure you want to delete your account? All the associated sensor and their data will be deleted and can not be recovered.",
      [
        {text: 'Yes', onPress: () => this.deleteUserData()},
        {text: 'No'},
      ],
      { cancelable: false }
    )
  }

  async deleteUserData() {
    const userId = getStateItem(DB_KEY.USER).userId

    this.setState({loading:true})
    let res = await deleteUserAccount(userId)
    this.setState({loading:false})
    if (res.status === 200 || res.status === 201){
      alert('Your account deleted successfully...');
      this.logOutUser()
    }else{
      alert('something went wrong...');
    }


  }

  ConfigureDeviceTapped(){
    let nav = getStateItem(DB_KEY.LOGIN_NAV)
    nav.navigate('DeviceList')
    //nav.navigate('DeviceConfigScannerScreen')
    
  }

  bellIconTapped(){
    let nav = getStateItem(DB_KEY.LOGIN_NAV)
    nav.navigate('AlertsScreen',{devId:''})
    //this.props.navigation.navigate('AlertsScreen')
    
  }

  _renderROWForSpecificUser(){
    const role = getStateItem(DB_KEY.USER).currentRole.role
    if (role.includes("Admin") || role.includes("Supplier") || role.includes("Patient")){
      return(
        <View>
           <SettingRow title={'Guest'} isIcon = {true} onPress={()=> this.ObserveTapped()} /> 
              <SettingRow title={'Add/Remove/Manage device'}  isIcon = {true}  onPress={()=> this.ConfigureDeviceTapped()} />
          </View>
      )
    }
  }

  _renderDeleteUser(){
    const role = getStateItem(DB_KEY.USER).currentRole.role
    if (role.includes("Patient")){
      return(
        <View>
           <SettingRow title={'Delete Account'} isIcon = {false} onPress={()=> this.deleteUser()} /> 
           </View>
      )
    }
  }

  rateAndReviewTapped(){
    Linking.openURL('itms-apps://apps.apple.com/app/id1548710257?action=write-review')
  }

  notificationTapped(){
    
    let nav = getStateItem(DB_KEY.LOGIN_NAV)
    nav.navigate('NotificationScreen')
  }
    render(){
      const {themeChanged,isFahrenheit,textNotification,statsTheme} = this.state
    
        return (
            <View style= {[styles.container, {backgroundColor:themeChanged?'rgba(27,26,29,1.0)':'rgba(249,249,249,1.0)'}]}>
            <Header isForSetting={true} bellIconTapped = {()=> this.bellIconTapped()} style={{backgroundColor:themeChanged?'rgba(30,30,32,1.0)':'white',textColor:themeChanged?'rgba(249,249,249,1.0)':'rgba(50,50,50,1.0)'}}/>
            <ScrollView>
            {this._renderROWForSpecificUser()}
           <SettingRow title={'Change Password'} isIcon = {true} onPress={()=> this.changePasswordTapped()} /> 
             <SettingRow title={'About'}  isIcon = {true}  onPress={()=> this.aboutTapped()} />
              <SettingRow title={'FAQ\'S'}  isIcon = {true} onPress={()=> this.faqTapped()} />
              <SettingRow title={'Contact Us'}  isIcon = {true}  onPress={()=> this.contactTapped()} />
              <SettingRow title={'Terms of Use'}  isIcon = {true} onPress={()=> this.termsTapped()} />
              {/*<SettingRow title={'Unit Type'}  selectedType={isFahrenheit?'Fahrenheit' : 'Celsius'} isIcon = {true}  onPress={()=> this.unitChangedTapped()} /> */}
              <SettingRow title={'Rate & Review'}  onPress={()=> this.rateAndReviewTapped()} />
              <SettingRow title={'Switch Theme'}  selectedType={themeChanged?'Dark':'Light'}  onPress={()=> this.themeChangedTapped()} />
              <SettingRow title={'Stats Theme'}  selectedType={statsTheme}  onPress={()=> this.statsThemeChangedTapped()} />
              <SettingRow title={'Video Tutorial'}  selectedType={'info/video/tutorial'} onPress={()=> this.handleVideoClick()} />
              {this._renderDeleteUser()}
              <SettingRow title={'Log Out'}  onPress={()=> this.logoutTapped()} />
              </ScrollView>
              {this._renderLoader()}
            </View>
        )
    }
}