/**
 * cardio App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import {getUsersList, executeApiWith, writeData} from '../../../api';
import {
  ResidentsChange,
  ResidentsTapped,
  AlertsChanged,
  AlertsNumberChanged,
  LastSyncChanged,
  AppInBackground,
  AppInForeground,
  UsersListDidChange,
ShowPracticeListChanged,
  SensorAddedForResident,
  SensorDataChange,
  SelectedPracticeChanged,
  OrientationDidChange
} from '../../../state/emitters';
import { API_TIMEOUT } from '../../../common/helper/util';
import ThemeChange from '../../../state/emitters/themeChange';
import getStateItem from '../../../state/getStateItem';
import {DB_KEY} from '../../../common/helper/keys';
import styles from './styles';
import Header from '../../../common/component/header';
import ResidentsRow from '../../../common/component/residentsRow';
import moment from 'moment';
import {checkIfSensorHasAnAlert} from '../../../common/helper/validate';
import DropDownPicker from 'react-native-dropdown-picker';
import React, {Component} from 'react';
import APIHelper from '../../../apiHelper';
import messaging from "@react-native-firebase/messaging";
import IconVector from "react-native-vector-icons/FontAwesome";
import Orientation from 'react-native-orientation-locker';
import {
  View,
  FlatList,
  Text,
  Alert,
  Dimensions,
  PanResponder,
  Animated,
  ActivityIndicator,
  AppState,
  Platform,
  TouchableOpacity,
  TextInput
} from 'react-native';
import setStateItem from '../../../state/setState/setStateItem';
import ButtonK from '../../../common/component/Button';
import { getBaseURL } from '../../../../galenApiLibrary/config/getBaseURL';
const {width, height} = Dimensions.get('window');
import {ReportsEnabledChanged, ReportsDisableChanged} from '../../../state/emitters'
import { isEndPointCardio } from '../../../../galenApiLibrary/config/getBaseURL';
import { isPLotViewTheme } from '../../../common/helper/util';

function immutableMove(arr, from, to) {
  return arr.reduce((prev, current, idx, self) => {
    if (from === to) {
      prev.push(current);
    }
    if (idx === from) {
      return prev;
    }
    if (from < to) {
      prev.push(current);
    }
    if (idx === to) {
      prev.push(self[from]);
    }
    if (from > to) {
      prev.push(current);
    }
    return prev;
  }, []);
}

////////////////////////////////////////////New API//////////////////////////////////////////////////
import {getAllSensorFor, getAllSensorForOwners, fetchLatestDataPVital, fetchLastUnreadAlertCountForUser, getSesnsorPositionForUserId, writeOnlineBit,fetchLatestDataForOwner} from '../../../../galenApiLibrary/residents'
import getHeaders from '../../../../galenApiLibrary/config/getHeader';
import { getUsersListForPractice , getUsersListForPracticeForCompany} from '../../../api';
import { fetchPracticeList, fetchAllUsersForCompany } from '../../../../galenApiLibrary/facility';
////////////////////////////////////////////New API//////////////////////////////////////////////////

import { GraphEnterLandscapeMode, GraphExitLandscapeMode } from '../../../state/emitters';

export default class Residents extends Component {
  _keyExtractor = (item, index) => index.toString();
  point = new Animated.ValueXY();
  currentY = 0;
  scrollOffset = 0;
  flatlistTopOffset = 70.0;
  rowHeight = Platform.OS === 'ios' ? height * 0.168 : height * 0.17;
  currentIdx = -1;
  active = false;
  flatList = React.createRef();
  flatListHeight = 0;

  constructor(props) {
    super(props);
     this._panResponder = PanResponder.create({
      // Ask to be the responder:
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

      onPanResponderGrant: (evt, gestureState) => {
        this.currentIdx = this.yToIndex(gestureState.y0);
        this.currentY = gestureState.y0;
        Animated.event([{y: this.point.y}])({
          y: gestureState.y0 - this.rowHeight / 2,
          useNativeDriver: true,
        });
        this.active = true;

        this.setState({dragging: true, draggingIdx: this.currentIdx}, () => {
          this.animateList();
        });
        // The gesture has started. Show visual feedback so the user knows
        // what is happening!
        // gestureState.d{x,y} will be set to zero now
      },
      onPanResponderMove: (evt, gestureState) => {
        this.currentY = gestureState.moveY;
        Animated.event([{y: this.point.y}])({y: gestureState.moveY});
        // The most recent move distance is gestureState.move{X,Y}
        // The accumulated gesture distance since becoming responder is
        // gestureState.d{x,y}
      },
      onPanResponderTerminationRequest: (evt, gestureState) => false,
      onPanResponderRelease: (evt, gestureState) => {
        this.reset();
        // The user has released all touches while this view is the
        // responder. This typically means a gesture has succeeded
      },
      onPanResponderTerminate: (evt, gestureState) => {
        this.reset();
        // Another component has become the responder, so this gesture
        // should be cancelled
      },
      onShouldBlockNativeResponder: (evt, gestureState) => {
        // Returns whether this component should block native components from becoming the JS
        // responder. Returns true by default. Is currently only supported on android.
        return true;
      },
    });

    this.residentsChange = this.residentsChange.bind(this);
    this.themeChange = this.themeChange.bind(this);
    this.alertsChanged = this.alertsChanged.bind(this);
    this.alertsNumberChanged = this.alertsNumberChanged.bind(this);
    this.eventAppInBackground = this.eventAppInBackground.bind(this);
    this.eventAppInForeground = this.eventAppInForeground.bind(this);
    this.eventUsersListDidChange = this.eventUsersListDidChange.bind(this);
    this.eventSensorAddedForResident =
      this.eventSensorAddedForResident.bind(this);
    this.eventSensorDataChange =
      this.eventSensorDataChange.bind(this);
      
    this.intervalModified = this.intervalModified.bind(this);
    this.friendlyNameModified = this.friendlyNameModified.bind(this);
    this.userSelected = this.userSelected.bind(this);
    this._searchWithText = this._searchWithText.bind(this);
    this.selectedPracticeChanged = this.selectedPracticeChanged.bind(this);
    this.eventOrientationDidChange = this.eventOrientationDidChange.bind(this);
    this.eventGraphEnterLandscapeMode = this.eventGraphEnterLandscapeMode.bind(this);
    this.eventGraphExitLandscapeMode = this.eventGraphExitLandscapeMode.bind(this);
    this.stopTimers = this.stopTimers.bind(this);
    this.startTimers = this.startTimers.bind(this);
  this.state = {
      loading: false,
      themeChanged: getStateItem(DB_KEY.IS_DARK_MODE),
      residentsList: [],
      refresh: false,
      alertsArray: [],
      dragging: false,
      draggingIdx: -1,
      isLoading: false,
      appState: AppState.currentState,
      showAddDevice: false,
      isPutInBackground: false,
      sVitalArray: [],
      showSeachInput:false,
      searchText:'',
      reload: true, 
      searchedUsersArray:[],
      emitOneTime: false,
      friendlyNameData1:[{label: 'All', value: 'All'}],
      dummyFriendlyNameData:[{label: 'All', value: 'All'}],
       selectedUser: {label: 'All', value: '', deviceDataIdUP: ''},
       lastSyncTime : null,
       practiceDataList:[],
       companyUsersArray:[],
       companyFriendlyName:[],
       selectedFacility: 'Select All',
       selectedFacilityUser: 'Select All',
       selectedFriednlyName : 'Select All',
    };
  }

  _handleAppStateChange = nextAppState => {
    this.setState({appState: nextAppState});

    if (nextAppState === 'background') {
      // Do something here on app background.
      AppInBackground.emit('APP_IN_BACKGROUND');
      // stop all the the timer
    }

    if (nextAppState === 'active') {
      // Do something here on app active foreground mode.
      AppInForeground.emit('APP_IN_FOREGROUND');
    }

    if (nextAppState === 'inactive') {
      // Do something here on app inactive mode.
    }
  };

  stopTimers = () => {
    console.log('[TIMER_DEBUG] Residents: stopTimers called. Cleared _interval:', !!this._interval, '_intervalsVital:', !!this._intervalsVital);
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = null;
    }
    if (this._intervalsVital) {
      clearInterval(this._intervalsVital);
      this._intervalsVital = null;
    }
  };

  startTimers = () => {
    let currentlySelected = getStateItem(DB_KEY.CURRENTLY_SELECTED);
    console.log('[TIMER_DEBUG] Residents: startTimers called. CURRENTLY_SELECTED =', currentlySelected);
    if (currentlySelected !== 'residents') {
      console.log('[TIMER_DEBUG] Residents: startTimers skipped because CURRENTLY_SELECTED is not residents');
      return;
    }
    this.stopTimers();

    let residentsInfo = getStateItem(DB_KEY.RESIDENT_DATA);
    if (residentsInfo !== null && residentsInfo !== undefined && residentsInfo.length > 0) {
      let residentsArray = getStateItem(DB_KEY.GALEN)
        ? residentsInfo
        : residentsInfo.deviceInfo;
      this.setState({
        residentsList: residentsArray,
        refresh: !this.state.refresh,
      });

      this.fetchLatestData();
      var lteinterval = getStateItem('lteInterval');
      if (lteinterval === undefined || lteinterval === null) {
        lteinterval = 120;
      }

      let lteIntervalMiliSeconds = lteinterval * 60 * 1000;
      let timeInterval = isEndPointCardio() === true ? 10000 : lteIntervalMiliSeconds;

      console.log('[TIMER_DEBUG] Residents: starting _interval (fetchLatestData) every', timeInterval, 'ms');
      this._interval = setInterval(() => {
        let current = getStateItem(DB_KEY.CURRENTLY_SELECTED);
        if (current !== 'residents') {
          console.log('[TIMER_DEBUG] Residents: _interval tick aborted - CURRENTLY_SELECTED is', current);
          this.stopTimers();
          return;
        }
        console.log('[TIMER_DEBUG] Residents: _interval tick -> calling fetchLatestData()');
        this.fetchLatestData();
      }, timeInterval);

      let user = getStateItem(DB_KEY.USER);
      let userRole = user ? (user.currentRole ? user.currentRole.role : '') : '';
      if (userRole === 'TenantAdmin') {
        this.fetchSVitalsData();
        console.log('[TIMER_DEBUG] Residents: starting _intervalsVital (fetchSVitalsData) every', timeInterval, 'ms');
        this._intervalsVital = setInterval(() => {
          let current = getStateItem(DB_KEY.CURRENTLY_SELECTED);
          if (current !== 'residents') {
            console.log('[TIMER_DEBUG] Residents: _intervalsVital tick aborted - CURRENTLY_SELECTED is', current);
            this.stopTimers();
            return;
          }
          console.log('[TIMER_DEBUG] Residents: _intervalsVital tick -> calling fetchSVitalsData()');
          this.fetchSVitalsData();
        }, timeInterval);
      }
    }
  };

  eventGraphEnterLandscapeMode = () => {
    console.log('[TIMER_DEBUG] Residents: eventGraphEnterLandscapeMode received - stopping timers');
    this.stopTimers();
  };

  eventGraphExitLandscapeMode = () => {
    let currentlySelected = getStateItem(DB_KEY.CURRENTLY_SELECTED);
    console.log('[TIMER_DEBUG] Residents: eventGraphExitLandscapeMode received. CURRENTLY_SELECTED =', currentlySelected);
    if (currentlySelected === 'residents') {
      this.startTimers();
    } else {
      this.stopTimers();
    }
  };

  eventAppInBackground = () => {
    this.stopTimers();
    console.log("called residentsChange 220");
    this.residentsChange();
  };

  eventAppInForeground = () => {
    // call api
    const {isPutInBackground} = this.state;
    if (isPutInBackground) {
      this.setState({isLoading: true, isPutInBackground: false});
      let user = getStateItem(DB_KEY.USER);
      // check if supplierId not Genral wellness and role is Admin the show or supplierId is Genral wellness and role is Pateint the show or

      let userRole = user.currentRole ? user.currentRole.role : '';

      if (userRole === 'TenantAdmin') {
        //console.log("RKDebug:eventAppInForeground:getUsersList")
        getUsersList(true);
      }else if (userRole === 'PracticeAdmin') {
        //console.log("RKDebug:eventAppInForeground:getUsersList")
       
        getUsersListForPractice()
      } else {
        /// get the data for this patient
        this.setState({isLoading: true});

        let user = getStateItem(DB_KEY.USER);
        let userListArray = [];
        userListArray.push(user);
        setStateItem(DB_KEY.USERS_LIST_ARRAY, userListArray);
        //getSensors(true);
        //console.log("RKDebug:eventAppInForeground:getSensorsForUserId")
       // getSensorsForUserId(user.userId, true);
       this.getAllSesnorForUser(user.userId)
        
      }
    }
  };

 

  eventUsersListDidChange = () => {
    let user = getStateItem(DB_KEY.USER);

    let userRole = user.currentRole ? user.currentRole.role : '';

    if (userRole === 'TenantAdmin') {
      // getSensors(true)
      this.setState({loading: false});
      this.userDropdown.open();
    } else if (userRole === 'PracticeAdmin') {
      //console.log("RKDebug:eventAppInForeground:getUsersList")
     
      this.setState({loading: false});
      this.userDropdown.open();
    }else if (userRole === 'SupplierAdmin') {
      //console.log("RKDebug:eventAppInForeground:getUsersList")
   
      this.setState({loading: false});
      this.userDropdown.open();
    }else {
      /// get the data for this patient
      let userListArray = [];
      let userData = {userId: user.userId, fullName: user.fullName};
      userListArray.push(user);

      setStateItem(DB_KEY.USERS_LIST_ARRAY, userListArray);
      //getSensors(true);
      //console.log("RKDebug:eventUsersListDidChange:getSensorsForUserId")
       
      //getSensorsForUserId(user.userId, true);
      this.getAllSesnorForUser(user.userId)
    }
  };

  eventSensorDataChange() {
    let array = getStateItem(DB_KEY.RESIDENT_DATA);
    console.log("RKDebug: eventSensorDataChange: "+JSON.stringify())
    if (array !== null && array !== undefined && array.length > 0) {
      console.log("called residentsChange 286")
      this.setResidentsData();
    }
  }

  eventSensorAddedForResident() {
    let array = getStateItem(DB_KEY.RESIDENT_DATA);
    if (array !== null && array !== undefined && array.length > 0) {
      console.log("called residentsChange 286")
      this.residentsChange();
    } else {
      let user = getStateItem(DB_KEY.USER);
      // check if supplierId not Genral wellness and role is Admin the show or supplierId is Genral wellness and role is Pateint the show or
      //this.setState({isLoading:true})
      // let userRole = user.currentRole?user.currentRole.role:''

      // if (userRole === 'TenantAdmin'){

      //   getUsersList()
      // }else{
      //   /// get the data for this patient

      //   let user = getStateItem(DB_KEY.USER)
      //   let userListArray = []
      //   userListArray.push(user)
      //   setStateItem(DB_KEY.USERS_LIST_ARRAY, userListArray)

      //   // users list array is set
      //   // now get the sensors for the user
      //   getSensors(true)
      // }
    }
  }

  componentDidMount() {
    //Here is the Trick
    const {navigation} = this.props;
    //Adding an event listner om focus
    //So whenever the screen will have focus it will set the state to zero
  
    this.focusListener = navigation.addListener('didFocus', () => {
      console.log('[TIMER_DEBUG] Residents: didFocus - setting CURRENTLY_SELECTED = residents');
      AppInBackground.addAppInBackgroundListener(this.eventAppInBackground);
      AppInForeground.addAppInForegroundListener(this.eventAppInForeground);

      setStateItem(DB_KEY.CURRENTLY_SELECTED, 'residents');
   
      let array = getStateItem(DB_KEY.RESIDENT_DATA);
      console.log("RKDebug:residentArray:" + JSON.stringify(array));

      if (array !== null && array !== undefined && array.length > 0) {
        console.log("called residentsChange 328");
        this.setResidentsData();
        this.setState({refresh: !this.state.refresh});
      }
    });

    this.willBlurListener = navigation.addListener('willBlur', () => {
      console.log('[TIMER_DEBUG] Residents: willBlur - stopping timers');
      this.stopTimers();
    });

    this.blurListener = navigation.addListener('didBlur', () => {
      console.log('[TIMER_DEBUG] Residents: didBlur - stopping timers');
      this.stopTimers();
    });

    GraphEnterLandscapeMode.addGraphEnterLandscapeMode(
      this.eventGraphEnterLandscapeMode,
    );
    GraphExitLandscapeMode.addGraphExitLandscapeMode(
      this.eventGraphExitLandscapeMode,
    );

    AppState.addEventListener('change', this._handleAppStateChange);
 
    ResidentsChange.addResidentsChangeListener(this.residentsChange);
    ThemeChange.addThemeChangeListener(this.themeChange);
    AlertsChanged.addAlertsChangedListener(this.alertsChanged);
    AlertsNumberChanged.addAlertsNumberChangedListener(
      this.alertsNumberChanged,
    );
    SensorAddedForResident.addSensorAddedForResident(
      this.eventSensorAddedForResident,
    );

    SensorDataChange.addSensorDataChangeListener(
      this.eventSensorDataChange,
    );

    OrientationDidChange.addOrientationDidChangeListener(
          this.eventOrientationDidChange,
        );

    UsersListDidChange.addUsersListListener(this.eventUsersListDidChange);
    SelectedPracticeChanged.addSelectedPracticeChangedListener(this.selectedPracticeChanged)
    setStateItem(DB_KEY.DRAWER_NAV, this.props.navigation);

    let user = getStateItem(DB_KEY.USER);
    // check if user role is patient then their is no need to get user list as their is only one user other wise if role is admin or some other higher then get the user list
    // get the user
    let userRole = user.currentRole ? user.currentRole.role : '';

    if (userRole === 'TenantAdmin') {
      //console.log("RKDebug:componentDidMount:getUsersList")
       
      getUsersList();
    } else if (userRole === 'PracticeAdmin') {
      //console.log("RKDebug:eventAppInForeground:getUsersList")
      getUsersListForPractice()
    }else if (userRole === 'SupplierAdmin') {
      //console.log("RKDebug:eventAppInForeground:getUsersList")
    //  ShowPracticeListChanged.emit('SHOW__PRACTICE_LIST')
    this.fetchData()
    }else {
      /// get the data for this patient
     let userListArray = [];
      userListArray.push(user);
      setStateItem(DB_KEY.USERS_LIST_ARRAY, userListArray);

      this.setState({isLoading: true});
      //console.log("RKDebug:componentDidMount:getSensorsForUserId")
       
      //getSensorsForUserId(user.userId, true)

      this.getAllSesnorForUser(user.userId)
    }
  }

  selectedPracticeChanged() {

    getUsersListForPracticeForCompany()
  }

   eventOrientationDidChange = () => {
      Orientation.lockToPortrait();
    };

  async getAllSesnorForUser(userId) {
    
    var allSensor = await getAllSensorFor(userId)
    console.log("allSensor:: "+JSON.stringify(allSensor))
    let length = allSensor.length

    setStateItem(DB_KEY.TOTAL_ARRAY_COUNT,length)    
    // get the resident order and arrange accordingly

    let sensrPosition = await getSesnsorPositionForUserId(userId);
    console.log("RKDebug: sensrPosition: "+JSON.stringify(sensrPosition))
    if (sensrPosition.length > 0) {
      let sensorpositionText =  sensrPosition[0].data?.Sensorposition?.value
      console.log("sensorpositionText:: "+sensorpositionText)
    
      const myArray = sensorpositionText.split(";");
      var arr = [];
      myArray.forEach(sortArray);

      function sortArray(value, index, array) {
          let splitElement = value.split("/")
          let index1 = parseInt(splitElement[1]);
          let itemToInsert = splitElement[0];
          arr[index1 - 1] = itemToInsert;
      }
      console.log("myArray:: "+myArray)
      console.log("myArray length:: "+myArray.length)
    
      var newResidentArrayarr = [];
     // arr.forEach(repositionArray);
      var indexCount = 0

      console.log("indexCount"+indexCount)
      

      for(var sensorIndex = 0 ; sensorIndex < arr.length ; sensorIndex++){
        let value = arr[sensorIndex]
        let foundData = allSensor.filter(function(item)
        {
             return item.data.Devid.value === value;
        });

        if (foundData.length > 0){
          
          let element = foundData[0]
          newResidentArrayarr[indexCount] = element
          indexCount ++
          const indexOfElement = allSensor.indexOf(element);
          if (indexOfElement > -1) { // only splice array when item is found
            allSensor.splice(indexOfElement, 1); // 2nd parameter means remove one item only
          }
        }
      }

     if(allSensor.length > 0) {
        newResidentArrayarr = allSensor.concat(newResidentArrayarr)
        console.log("in If newResidentArrayarr:: "+JSON.stringify(newResidentArrayarr))
     
      }

     setStateItem(DB_KEY.RESIDENT_DATA,newResidentArrayarr.length > 0 ? newResidentArrayarr : allSensor)

     this._getFrindlyNameData()

     let enableReportsArray = newResidentArrayarr.filter((content) => content?.data?.EnableReports?.value === "Yes")
     if (enableReportsArray.length > 0 && this.state.emitOneTime === false) {
      this.setState({emitOneTime: true})
       ReportsEnabledChanged.emit('REPORTS_ENABLED_MODE')
     }

    }else{
      setStateItem(DB_KEY.RESIDENT_DATA,allSensor)

     this._getFrindlyNameData()
    }
    console.log("called residentsChange 459")
    this.residentsChange()

    // setTimeout(() => {
    //   this.logicToSubscribe()
    // }, 3000);
  }

  async logicToSubscribe(){
      // logic to subscribe and unsubscribe    

      let notificationArray = getStateItem(DB_KEY.SUBSCRIPTION_ARRAY_LIST);
      if (notificationArray.length > 0) {
        for (var i = 0; i < notificationArray.length; i++) {
          let topic =  notificationArray[i]
         // console.log(myStringArray[i]);
          //Do something
         await messaging()
          .unsubscribeFromTopic(topic)
          let subscriptionArrayList = getStateItem(DB_KEY.SUBSCRIPTION_ARRAY_LIST)
          const index = subscriptionArrayList.indexOf(topic);
          if (index > -1) { // only splice array when item is found
              subscriptionArrayList.splice(index, 1); // 2nd parameter means remove one item only
          }
          setStateItem(DB_KEY.SUBSCRIPTION_ARRAY_LIST, subscriptionArrayList)
      }
      }


      // subscribe 


      let residentsData = getStateItem(DB_KEY.RESIDENT_DATA);
      if (residentsData.length > 0) {
      for (var i = 0; i < residentsData.length; i++) {
        let residents = residentsData[i];
        let enableAlerts = residents.data?.EnableAlerts?.value
        let notificationType = residents.data?.NotificationType?.value
        let devid = residents.data?.Devid?.value
        if (enableAlerts === "Yes" || notificationType.length > 2) {
          let topic = devid+'-Alerts'
          await messaging().unsubscribeFromTopic(topic)
          await messaging().subscribeToTopic(topic)
          let subscriptionArrayList = getStateItem(DB_KEY.SUBSCRIPTION_ARRAY_LIST)
        if (!subscriptionArrayList.includes(topic)) {
            subscriptionArrayList.push(topic)
        }
        setStateItem(DB_KEY.SUBSCRIPTION_ARRAY_LIST, subscriptionArrayList)

        }

      }
      }
  }

 async fetchSVitalsData() {
    let currentlySelected = getStateItem(DB_KEY.CURRENTLY_SELECTED);
    if (currentlySelected !== 'residents') {
      console.log('[TIMER_DEBUG] Residents: fetchSVitalsData BLOCKED because CURRENTLY_SELECTED is', currentlySelected);
      this.stopTimers();
      return;
    }
    console.log('[TIMER_DEBUG] Residents: fetchSVitalsData EXECUTING api call');
  var lteinterval = getStateItem('lteInterval')
          if (lteinterval === undefined || lteinterval === null) {
            lteinterval = 120
          }
      
          var bufferValue = getStateItem('bufferValue')
          if (bufferValue === undefined || bufferValue === null) {
              bufferValue = 5
          }
      
          let totalMinutes = lteinterval + bufferValue

    let endDateTime = moment.utc();

    let startDateTime;
    startDateTime = moment.utc().subtract(totalMinutes, 'minutes');

    // var myHeaders = new Headers();
    // myHeaders.append('X-APP-TYPE', HEADER.APP_TYPE);
    // myHeaders.append('X-TENANT-DOMAIN', HEADER.TENANT_DOMAIN);
    // myHeaders.append('X-API-VERSION', HEADER.API_VERSION);
    // myHeaders.append('Content-Type', 'application/json');
    // myHeaders.append('Authorization', getStateItem(DB_KEY.ACCESS_TOKEN));

    const myHeaders  = getHeaders()

    var deviceCriteriaArray = [];

    for (var index = 0; index < this.state.residentsList.length; index++) {
      let resident = this.state.residentsList[index];

      let macAddress = resident.data.Devid.value;

      let dict = {key: 'DevidSvital', operator: 'Equal', value: macAddress};

      deviceCriteriaArray.push(dict);
    }

    let timeIntervalDict = {
      key: 'TimestampSv',
      operator: 'Between',
      valueFrom: startDateTime,
      valueTo: endDateTime,
    };
    deviceCriteriaArray.push(timeIntervalDict);

    var raw = JSON.stringify({
      deviceDataModelId: 'd36a4373-fbdc-44a3-8c96-4bb920041e40-sv',
      deviceCriteriaGroup: {isOr: true, groupElements: deviceCriteriaArray},
      devicePropertyCodes: ['Occupied', 'Apneaperminute', 'DevidSvital'],
    });

    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow',
    };

    let url =
      getBaseURL() + 'data/devicedata-advanced?sortBy=data.TimestampSv.value&sortOrder=DESC';
    //V3
    //console.log("RKDebug:Resident:fetchSVitalsData:url"+url+"body:"+raw)
    let res = await executeApiWith(url, 'POST', raw, myHeaders, "ResidentsScreen:fetchSVitalsData")
    if (res.status === 200) {
      let response = await res.json();
      let content = response.content;
      if (content !== undefined && content !== null && content.length > 0) {
        this.setState({sVitalArray: content});
      }
    }else{
      this.setState({sVitalArray: []});
    }
  }

  moveAlertSensorUp(alerts) {
    // iterate resident and check if same
    const {residentsList} = this.state;
    const residentListLength = residentsList.length;
  }

  checkAlertCount() {
    const {residentsList} = this.state;
    const newArray = [];

    var count = 0;
    residentsList.map(item => {
      const checkIfAlert = checkIfSensorHasAnAlert(item.data.Devid.value);
      if (checkIfAlert) {
        newArray.splice(0, 0, item);
      } else {
        newArray.push(item);
      }
    });

    this.setState({residentsList: newArray, refresh: !this.state.refresh});
  }

  async fetchAlertData() {
    let endDateTime = moment.utc();

    let userListArray = [];
    let userArray = getStateItem(DB_KEY.USERS_LIST_ARRAY);

    userArray.map(content => {
      if (content.fullName.length > 0) {
        userListArray.push(content.userId);
      }
    });

    let startDateTime;
    startDateTime = moment.utc().subtract(7, 'days');

    // var myHeaders = new Headers();
    // myHeaders.append('X-APP-TYPE', HEADER.APP_TYPE);
    // myHeaders.append('X-TENANT-DOMAIN', HEADER.TENANT_DOMAIN);
    // myHeaders.append('X-API-VERSION', HEADER.API_VERSION);
    // myHeaders.append('Content-Type', 'application/json');
    // myHeaders.append('Authorization', getStateItem(DB_KEY.ACCESS_TOKEN));

    const myHeaders  = getHeaders()

    var deviceCriteriaArray = [];

    for (var index = 0; index < this.state.residentsList.length; index++) {
      let resident = this.state.residentsList[index];

      let macAddress = resident.data.Devid.value;

      let dict = {key: 'DevidAlerts', operator: 'Equal', value: macAddress};

      deviceCriteriaArray.push(dict);
    }

    var raw;

    let user = getStateItem(DB_KEY.USER);
    // check if user role is patient then their is no need to get user list as their is only one user other wise if role is admin or some other higher then get the user list
    // get the user
    //this.setState({isLoading:true})
    let userRole = user.currentRole ? user.currentRole.role : '';
    let url;
    if (userRole === 'TenantAdmin') {
      url =
        getBaseURL() + 'data/devicedata-advanced?pageNumber=0&pageSize=100';
      raw = JSON.stringify({
        deviceDataModelId: 'd36a4373-fbdc-44a3-8c96-4bb920041e40-as',
        deviceCriteriaGroup: {isOr: true, groupElements: deviceCriteriaArray},
      });
    } else {
      url =
        getBaseURL() + 'data/devicedata-advanced?pageNumber=0&pageSize=1';
      let userListArray = [];
      let userArray = getStateItem(DB_KEY.USERS_LIST_ARRAY);

      userArray.map(content => {
        if (content.fullName.length > 0) {
          userListArray.push(content.userId);
        }
      });

      raw = JSON.stringify({
        deviceDataModelId: 'd36a4373-fbdc-44a3-8c96-4bb920041e40-as',
        deviceCriteria: [
          {
            key: 'AlertFlag',
            operator: 'Equal',
            value: 1,
          },
        ],
        ownerFilter: {
          users: userListArray,
        },
      });
    }
    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow',
    };
   
    //V3
    //console.log("RKDebug:Resident:fetchAlertData:url"+url+"body:"+raw)
    
    const res = await fetchLastUnreadAlertCountForUser(userListArray)
    if (res.status === 200){
      let jsonData1  = await res.json()
      let array = jsonData1.content;
      setStateItem(DB_KEY.ALERTS_ARRAY, array);
      //totalElements
      let totalElements =
        jsonData1.totalElements !== undefined ? jsonData1.totalElements : 0;

      setStateItem(DB_KEY.TOTAL_UNREAD_ALERT, totalElements);
     

      AlertsNumberChanged.emit('ALERTS__NUMBER_CHANGED');

      this.setState({refresh: !this.state.refresh});
      this.checkAlertCount();
    }else{
  
      setStateItem(DB_KEY.ALERTS_ARRAY, []);
      setStateItem(DB_KEY.ALERTS_COUNT_ARRAY, []);
      
      
     

      AlertsNumberChanged.emit('ALERTS__NUMBER_CHANGED');

      this.setState({refresh: !this.state.refresh});
      this.checkAlertCount();
    }
  }

  async fetchLatestData() {
    let currentlySelected = getStateItem(DB_KEY.CURRENTLY_SELECTED);
    if (currentlySelected !== 'residents') {
      console.log('[TIMER_DEBUG] Residents: fetchLatestData BLOCKED because CURRENTLY_SELECTED is', currentlySelected);
      this.stopTimers();
      return;
    }
    console.log('[TIMER_DEBUG] Residents: fetchLatestData EXECUTING api call');

     
    let userListArray = [];
    let userArray = getStateItem(DB_KEY.USERS_LIST_ARRAY);

    userArray.map(content => {
      if (content.fullName.length > 0) {
        userListArray.push(content.userId);
      }
    });

    let user = getStateItem(DB_KEY.USER);

 
    let currentTimeStamp = new Date().getTime();
    setStateItem(DB_KEY.LAST_SYNCED, currentTimeStamp);
   
    let res = await fetchLatestDataForOwner(user.userId)
    console.log("res: fetchLatestDataPVital: length:"+res.length)
    if (res.length > 0) {
       var offlineSensorArray = [];
         for (var index = 0; index < this.state.residentsList.length; index++) {
            let dataAt = this.state.residentsList[index];
            let devid = dataAt.data.Devid.value;
  
            let filteredArray = res.filter(
              content => content.id === devid,
            );
  
            if (filteredArray.length > 0) {
              console.log("res: filteredArray: length:"+JSON.stringify(filteredArray[0]))
              let firstObj = filteredArray[0];
              let dataObj = dataAt.data;
  
              let manupulatedObj = {
                Rr: firstObj.attributes?.latest?.rr,
                Hr: firstObj.attributes?.latest?.hr,
                Stress: firstObj.attributes?.latest?.stress,
                Motion: firstObj.attributes?.latest?.motion,
                RssHrMv: firstObj.attributes?.latest?.rssHrMv,
                Active: dataAt.data.Active,
                EnableReports: dataAt.data.EnableReports,
                RssRrMv: firstObj.attributes?.latest?.rssRrMv,
                RssWifi: firstObj.attributes?.latest?.rssWifi,
                Devsn: dataObj.Devsn,
                Timezone: dataObj.Timezone,
                Model: dataObj.Model,
                FriendlyName: dataObj.FriendlyName,
                Location: dataObj.Location,
                Devid: dataObj.Devid,
                Timestamp: firstObj.attributes?.latest?.timestamp,
                Occupied: firstObj.attributes?.latest?.occupied,
                Online : firstObj.attributes?.latest?.online,
                dataLoaded: true
              };
              dataAt.data = manupulatedObj;
              dataAt.minValueProvidedOn = firstObj.minValueProvidedOn;
              console.log("res: manupulatedObj::"+JSON.stringify(manupulatedObj))
              this.state.residentsList[index] = dataAt;
            } else {
              offlineSensorArray.push(devid);
            }
          }
  
          if (offlineSensorArray.length > 0) {
            let user = getStateItem(DB_KEY.USER);
            let userListArray = [];
            let userArray = getStateItem(DB_KEY.USERS_LIST_ARRAY);
        
            userArray.map(content => {
              if (content.fullName.length > 0) {
                userListArray.push(content.userId);
              }
            });
            console.log("offlineSensorArray:"+JSON.stringify(offlineSensorArray))
            writeOnlineBit(userListArray, offlineSensorArray)
            //let offlineDataWriter = new OfflineDataWriter()
            //offlineDataWriter.writeOfflineData(offlineSensorArray, user.userId)
          }
        LastSyncChanged.emit('LAST_SYNC_CHANGED');
  
        this.setState({refresh: !this.state.refresh});
      
    }
  }

 

  componentWillUnmount() {
    console.log('[TIMER_DEBUG] Residents: componentWillUnmount - cleaning up timers and listeners');
    this.stopTimers();
    GraphEnterLandscapeMode.removeGraphEnterLandscapeMode(
      this.eventGraphEnterLandscapeMode,
    );
    GraphExitLandscapeMode.removeGraphExitLandscapeMode(
      this.eventGraphExitLandscapeMode,
    );
    if (this.focusListener) this.focusListener.remove();
    if (this.blurListener) this.blurListener.remove();
    if (this.willBlurListener) this.willBlurListener.remove();
    AppInBackground.removeAppInBackgroundListener(this.eventAppInBackground);
    AppInForeground.removeAppInForegroundListener(this.eventAppInForeground);
    UsersListDidChange.removeUsersListListener(this.eventUsersListDidChange);
    SensorAddedForResident.removeSensorAddedForResident(
      this.eventSensorAddedForResident,
    );
    SensorDataChange.removeSensorDataChangeListener(this.eventSensorDataChange);
  }

  setResidentsData() {
    this.setState({isLoading: false});
    this.setState({refresh: !this.state.refresh});
    let residentsInfo = getStateItem(DB_KEY.RESIDENT_DATA);

    // check if user is patient
    let user = getStateItem(DB_KEY.USER);
    let userRole = user ? (user.currentRole ? user.currentRole.role : '') : '';

    if (residentsInfo !== null && residentsInfo.length > 0) {
      let residentsArray = getStateItem(DB_KEY.GALEN)
        ? residentsInfo
        : residentsInfo.deviceInfo;
      this.setState({
        residentsList: residentsArray,
        refresh: !this.state.refresh,
      });

      this.startTimers();

      let instance = new APIHelper();
      console.log("RKDebug:Resident:residentsChange:APIHelper");
         // instance.getAlerts();
    
          //  if(this.state.selectedUser.label !== 'All'){
          //    this.intervalModified(this.state.selectedUser)
          //  }
          //this.removeAlerts()
          if (residentsArray.length !== this.state.residentsList.length) {
            this.setState({
              residentsList: residentsArray,
              refresh: !this.state.refresh,
            });
            setStateItem(DB_KEY.LOCAL_RESIDENT_LIST, this.state.residentsList);
    
            let isGalen = getStateItem(DB_KEY.GALEN);
            if (isGalen) {
              //this.removeAlerts()
    
              const localDbUser = getStateItem(DB_KEY.LOCAL_DB_USER);
    
              if (
                localDbUser !== undefined &&
                localDbUser !== null &&
                localDbUser.residentOrder !== undefined &&
                localDbUser.residentOrder !== null
              ) {
                const residentOrder = localDbUser.residentOrder;
    
                let newArray = [];
                const arr = this.state.residentsList;
    
                for (var index = 0; index < residentOrder.length; index++) {
                  let content = residentOrder[index];
    
                  let devid = content.devId;
    
                  const nameToBeFind = element => element.devid == devid;
    
                  const findAt = arr.findIndex(nameToBeFind);
    
                  if (findAt >= 0) {
                    let data = arr[findAt];
                    newArray.push(data);
                    arr.splice(findAt, 1);
                  }
                }
    
                this.setState({residentsList: newArray.concat(arr)});
                setStateItem(DB_KEY.TEMP_RESIDENT_ARRAY, this.state.residentsList);
              }
            }
          }
        } else {
          let scannedUserArray = getStateItem(DB_KEY.SCANNED_USER_ARRAY);
    
          let user = getStateItem(DB_KEY.USER);
          let email = user.emailAddress;
          // check if
          var isDataFound = false;
          if (scannedUserArray.length > 0) {
            for (var index = 0; index < scannedUserArray.length; index++) {
              let data = scannedUserArray[index];
    
              if (data.email === email) {
                isDataFound = true;
              }
            }
          }
    
          this.setState({
            showAddDevice: isDataFound && user.currentRole.role === 'Patient',
            residentsList: [],
            refresh: !this.state.refresh,
          });
        }
  }

  async residentsChange() {
    console.log("residentsChange")
   this.setState({isLoading: false})
   let user = getStateItem(DB_KEY.USER);
   let userRole = user.currentRole ? user.currentRole.role : '';
   let isManufacturer = userRole === 'PracticeAdmin' ||userRole === 'SupplierAdmin';
   if (isManufacturer) {
    this.setResidentsData()
   }
   else {
    if (this.state.lastSyncTime === null) {
      console.log("residentsChange:999")
      this.setState({lastSyncTime: new Date()});
      this.setResidentsData()
    }
    else {
      console.log("residentsChange:1004")
      const diffInMilliseconds = new Date() - this.state.lastSyncTime;
      const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
      if (diffInMinutes > 90) {
        console.log("residentsChange:1008")
        this.setResidentsData()
      }
    }
   }
}

  alertsChanged() {
    let alertsArray = getStateItem(DB_KEY.ALERTS_ARRAY);
    this.setState({alertsArray: alertsArray});
    //this.removeAlerts()
    console.log("called residentsChange 1021")
    this.residentsChange();
  }

  alertsDevIdsArray() {
    let alertsArray = getStateItem(DB_KEY.ALERTS_ARRAY);
    var array = [];
    alertsArray.forEach(function (item) {
      var items = Object.keys(item);
      array.push(item.devId);
    });

    return array;
  }

  removeAlerts() {
    let alertsArray = getStateItem(DB_KEY.ALERTS_ARRAY);
    if (alertsArray.length > 0) {
      for (var index1 = 0; index1 < alertsArray.length; index1++) {
        let lastObject = alertsArray[index1];

        let residentsInfo = getStateItem(DB_KEY.RESIDENT_DATA);
        if (residentsInfo !== null) {
          let residentsArray = this.state.residentsList;
          let isGalen = getStateItem(DB_KEY.GALEN);
          let existAt;

          for (var index = 0; index < residentsArray.length; index++) {
            if (isGalen) {
              let user = residentsArray[index].user;
              let userId = user.userId;
              if (userId === lastObject.devId) {
                existAt = index;
                break;
              }
            } else {
              if (residentsArray[index].devid === lastObject.devId) {
                existAt = index;
                break;
              }
            }
          }

          const isLargeNumber = element =>
            isGalen ? element.ownerId : element.devid == lastObject.devId;
          const findIndex = residentsArray.findIndex(isLargeNumber);
          if (existAt >= 0) {
            let content = residentsArray[existAt];
            residentsArray.splice(existAt, 1);
            content.isAlert = true;
            content.alertData = lastObject;
            residentsArray.splice(0, 0, content);
          }

          this.setState({
            residentsList: residentsArray,
            refresh: !this.state.refresh,
          });
          setStateItem(DB_KEY.TEMP_RESIDENT_ARRAY, this.state.residentsList);
          setStateItem(DB_KEY.LOCAL_RESIDENT_LIST, this.state.residentsList);
        }
      }
    }
  }

  themeChange() {
    //
    this.setState({themeChanged: getStateItem(DB_KEY.IS_DARK_MODE)});
  }

  residentTapped(item) {
    console.log('[TIMER_DEBUG] Residents: residentTapped - stopping timers, isPLotViewTheme =', isPLotViewTheme());
    this.stopTimers();
    if (isPLotViewTheme()) {
      let nav = getStateItem(DB_KEY.LOGIN_NAV);
      setStateItem('PREVIOUS_SELECTED_BEFORE_GRAPH', 'residents');
      GraphEnterLandscapeMode.emit('GRAPH_ENTER_LANDSCAPE_MODE');

      nav.navigate('GraphNewLandscape', {
        devId: item.ownerId,
        selected: 2,
        macAddress: item.data.Devid.value,
        friendlyName: item.data.FriendlyName.value,
        heartArrayExtended: [],
        stressArrayExtended: [],
        respiratoryArrayExtended: [],
        tempArrayExtended: [],
      });
    } else {
      let devid = item.ownerId;
      setStateItem(DB_KEY.SELECTED_DEVICE_ID, devid);
      setStateItem(DB_KEY.SELECTED_MAC_ADDRESS, item.data.Devid.value);
      setStateItem(DB_KEY.SELECTED_SENSOR_MAC_ADDRESS, item.data.Devid.value);
      setStateItem(DB_KEY.SELECTED_SENSOR_USER_ID, devid);
      ResidentsTapped.emit('RESIDENTS_TAPPED');
      this.props.navigation.navigate('Stats');
    }
  }

  clearAlertTapped(item) {
    Alert.alert(
      'Clear Alert',
      'Are you sure you want to clear this alert?',
      [{text: 'Yes', onPress: () => this.clearFromAlert(item)}, {text: 'No'}],
      {cancelable: false},
    );
  }

  getAlertNumber() {
    let alertCount = 0;
    const {residentsList} = this.state;
    for (var index = 0; index < residentsList.length; index++) {
      let content = residentsList[index];

      if (content.isAlert !== undefined) {
        if (content.isAlert === true) {
          alertCount += 1;
        }
      }
    }

    return alertCount;
  }

  clearFromAlert(item) {
    const {residentsList} = this.state;
    let devId = item.devid;
    const isLargeNumber = element => element.devid == devId;
    const findIndex = residentsList.findIndex(isLargeNumber);

    if (findIndex >= 0) {
      let content = residentsList[findIndex];
      residentsList.splice(findIndex, 1);
      content.isAlert = false;
      residentsList.splice(residentsList.length, 0, content);

      this.setState({
        residentsList: residentsList,
        refresh: !this.state.refresh,
      });
      setStateItem(DB_KEY.TEMP_RESIDENT_ARRAY, this.state.residentsList);
      // now remove it from Alert
      const alertsArray = getStateItem(DB_KEY.ALERTS_ARRAY);
      let filter = element => element.devId == devId;
      const existAt = alertsArray.findIndex(filter);

      if (existAt >= 0) {
        const tempData = alertsArray[existAt];
        tempData.isRemovedFromAlert = true;
        alertsArray[existAt] = tempData;
        AlertsNumberChanged.emit('ALERTS__NUMBER_CHANGED');
      }
    }
  }

  alertsNumberChanged() {
    this.setState({refresh: !this.state.refresh});
  }

  async saveResidentOrder() {
    let user = getStateItem(DB_KEY.USER);
    let userRole = user.currentRole ? user.currentRole.role : '';

    if (
      (getStateItem(DB_KEY.FILTER_APPLIED) &&
        getStateItem(DB_KEY.FILTERED_ARRAY).length > 0) ||
      userRole === 'Patient'
    ) {
      //console.log("RKDebug:Resident:saveResidentOrder:APIHelper")
       
      let apiHelper = new APIHelper();
      let sensorPositionArray = await apiHelper.getSensorPosition(user.userId);
      let deviceDataIdUP = '';

      if (sensorPositionArray.length > 0) {
        deviceDataIdUP = sensorPositionArray[0].deviceDataId;
      }

      const devicePropertySetId = 'a1569a21-28c5-4288-9069-1ad55aac40f8';

      // var myHeaders = new Headers();
      // myHeaders.append('X-APP-TYPE', HEADER.APP_TYPE);
      // myHeaders.append('X-TENANT-DOMAIN', HEADER.TENANT_DOMAIN);
      // myHeaders.append('X-API-VERSION', HEADER.API_VERSION);
      // myHeaders.append('Content-Type', 'application/json');
      // myHeaders.append('Authorization', getStateItem(DB_KEY.ACCESS_TOKEN));

      const myHeaders  = getHeaders()

      var sensorPosition = '';
      for (var index = 1; index <= this.state.residentsList.length; index++) {
        let resident = this.state.residentsList[index - 1];
        let macId = resident.data.Devid.value;
        let pos = macId + '/' + index;
        if (index === this.state.residentsList.length) {
          sensorPosition = sensorPosition + pos;
        } else {
          sensorPosition = sensorPosition + pos + ';';
        }
      }

      if (userRole === 'Patient') {
        setStateItem(DB_KEY.RESIDENT_DATA, this.state.residentsList);
        setStateItem(DB_KEY.CURRENT_ACTIVE_INDEX, 0);
      } else {
        setStateItem(DB_KEY.FILTERED_ARRAY, this.state.residentsList);
      }

      let dataToPut;
      let body;
      if (deviceDataIdUP !== '') {
        dataToPut = {
          Sensorposition: sensorPosition,
          TimestampUp: moment.utc().format(),
        };
        body = {
          deviceDataModelId: '6df2d80f-be28-47ac-a509-8f0b6aa3bbb8',
          deviceDataId: deviceDataIdUP,
          data: dataToPut,
          devicePropertySetId: devicePropertySetId,
        };
      } else {
        dataToPut = {
          Sensorposition: sensorPosition,
          TimestampUp: moment.utc().format(),
          Fullname: user.fullName,
          Userid: user.userId,
        };
        body = {
          deviceDataModelId: '6df2d80f-be28-47ac-a509-8f0b6aa3bbb8',
          data: dataToPut,
          devicePropertySetId: devicePropertySetId,
        };
      }

      const promiseWriteDataTimeout = new Promise((resolve) => (setTimeout(() => resolve(false),  API_TIMEOUT.INTERVAL)))
      const resWriteData = await Promise.race([promiseWriteDataTimeout,writeData( JSON.stringify(body), "ResidentsScreen:saveResidentOrder")])
      if (!resWriteData) {
          alert("API Delayed response for ResidentsScreen:saveResidentOrder");
          return
      }

      let res2 = await resWriteData.text();
    }
  }

  onPressAlerts(residentData) {
    let nav = getStateItem(DB_KEY.LOGIN_NAV);
    nav.navigate('AlertsScreen', {devId: residentData.data.Devid.value});
  }

  renderRow(item, index) {
    const {draggingIdx, dragging, themeChanged, sVitalArray} = this.state;

    const checkIfAlert = true; //checkIfSensorHasAnAlert(item.data.Devid.value)
    const isAlert = false; //item.isAlert
    // getStateItem(DB_KEY.GALEN)?false:item.isAlert ? item.isAlert : false
    let dataDetail;
    if (isAlert === true || item.data === undefined || item.data === null) {
      if (getStateItem(DB_KEY.GALEN)) {
        dataDetail = {deviceName: item.user.fullName};
      } else {
        dataDetail = item.alertData;
      }
    }

    if (item !== undefined && item !== null) {
      return (
        <ResidentsRow
          style={{opacity: index === draggingIdx ? 0 : 1}}
          onPressAlerts={() => this.onPressAlerts(item)}
          data={item}
          sVitalArray={sVitalArray}
          isDarkMode={this.state.themeChanged}
          isAlert={checkIfAlert}
          onPress={() => this.residentTapped(item)}
          panResponder={this._panResponder}
        />
      );
    } else {
      return <View />;
    }
  }

  renderDraggingRow(item, index) {
    const {draggingIdx, dragging, themeChanged, residentsList} = this.state;
    const isAlert = false;
    //getStateItem(DB_KEY.GALEN)?false:item.isAlert ? item.isAlert : false
    let dataDetail;
    if (isAlert === true) {
      dataDetail = item.alertData;
    }

    return (
      <ResidentsRow
        style={{opacity: index === draggingIdx ? 0 : 1}}
        data={item}
        isDarkMode={this.state.themeChanged}
        isAlert={false}
        onPress={() => this.residentTapped(item)}
        panResponder={this._panResponder}
      />
    );

    //  if (isAlert === true) {
    //       return(
    //           <AlertRow data={dataDetail} isDarkMode={this.state.themeChanged}  onPress={()=> this.residentTapped(item)} clearAlertTapped={()=> this.clearAlertTapped(item)}/>
    //       )
    //   }else{
    //       return(
    //           <ResidentsRow style={{opacity: index===draggingIdx?0:1}} data={item} isDarkMode={this.state.themeChanged} isAlert={false} onPress={()=> this.residentTapped(item)} panResponder={this._panResponder} />
    //       )
    //   }
  }

  animateList = () => {
    const {residentsList} = this.state;
    if (!this.active) {
      return;
    }

    requestAnimationFrame(() => {
      // check if we are near the bottom or top
      if (this.currentY + 100 > this.flatListHeight) {
        this.flatList.current.scrollToOffset({
          offset: this.scrollOffset + 20,
          animated: false,
        });
      } else if (this.currentY < 100) {
        this.flatList.current.scrollToOffset({
          offset: this.scrollOffset - 20,
          animated: false,
        });
      }

      // check y value see if we need to reorder
      const newIdx = this.yToIndex(this.currentY);
      if (this.currentIdx !== newIdx) {
        const dataToBeMoved = residentsList[newIdx];
        const shouldMove = dataToBeMoved.isAlert
          ? !dataToBeMoved.isAlert
          : true;
        if (shouldMove) {
          this.setState({
            residentsList: immutableMove(
              this.state.residentsList,
              this.currentIdx,
              newIdx,
            ),
            draggingIdx: newIdx,
          });
          setStateItem(DB_KEY.TEMP_RESIDENT_ARRAY, this.state.residentsList);
          this.currentIdx = newIdx;
        }
      }

      this.animateList();
    });
  };
  yToIndex = y => {
    let user = getStateItem(DB_KEY.USER);
    // check if supplierId not Genral wellness and role is Admin the show or supplierId is Genral wellness and role is Pateint the show or
    let userRole = user.currentRole ? user.currentRole.role : '';

    let flatlistTopOffset = userRole === 'TenantAdmin' || userRole === 'PracticeAdmin' ? 70 : 10;
    const value = Math.floor(
      (this.scrollOffset + y - this.flatlistTopOffset) / this.rowHeight,
    );

    if (value < 0) {
      return 0;
    }

    if (value > this.state.residentsList.length - 1) {
      return this.state.residentsList.length - 1;
    }

    return value;
  };

  reset = () => {
    this.active = false;
    this.setState({dragging: false, draggingIdx: -1});

    setStateItem(DB_KEY.LOCAL_RESIDENT_LIST, this.state.residentsList);
    this.saveResidentOrder();
  };

  addSensorTapped() {
    const role = getStateItem(DB_KEY.USER).currentRole.role;

    const company = getStateItem(DB_KEY.USER).currentRole
      ? getStateItem(DB_KEY.USER).currentRole.supplier
        ? getStateItem(DB_KEY.USER).currentRole.supplier.name
        : ''
      : '';

      

    if (role !== "Patient") {
      //(role.includes("Admin") || role.includes("Supplier")){
      alert('Only Patient can add a New Device.');
      return;
    }
    let nav = getStateItem(DB_KEY.LOGIN_NAV);
    //nav.navigate('DeviceConfigScannerScreen')
    nav.navigate('MedicalTextScreen');
  }
  addDeviceTapped() {
    // this.props.navigation.navigate('ConnectWiFiScreen',{macAddress: this.state.enterManually? this.state.manualMacAddress: this.state.macAddress, serialNumber:this.state.serialNumber, manufacturer:this.state.manufacturer});
    // let nav = getStateItem(DB_KEY.LOGIN_NAV)
    // nav.navigate('DeviceConfigScannerScreen')

    //  let scannedUserArray = getStateItem(DB_KEY.SCANNED_USER_ARRAY)
    //       let user = getStateItem(DB_KEY.USER)
    //       let email = user.emailAddress
    //       // check if
    //       var dataFound ;
    //       if (scannedUserArray.length > 0){
    //           for(var index=0; index < scannedUserArray.length ; index++){
    //               let data = scannedUserArray[index]

    //                 if (data.email === email){
    //                   dataFound = scannedUserArray[index]
    //                   break
    //                 }
    //           }
    //       }

    let nav = getStateItem(DB_KEY.LOGIN_NAV);
    // nav.navigate('DeviceConfigScannerScreen')
    nav.navigate('MedicalTextScreen');

    // nav.navigate('ConnectWiFiScreen',{macAddress: dataFound.macId, serialNumber:dataFound.serialNumber, manufacturer:dataFound.manufacturer});
  }



  async userSelected(item) {
    // setStateItem(DB_KEY.FILTERED_ARRAY,[])
    
    this.setState({selectedUser: item, isLoading: true, residentsList: [], searchText: ''});
    let userId = item.value;

    let allUsersArray = getStateItem(DB_KEY.ALL_USERS_ARRAY);
    let filteredUser =   allUsersArray.filter(
      user => user.userId === userId
    );

    if (filteredUser.length > 0) {
        setStateItem(DB_KEY.USERS_LIST_ARRAY, filteredUser)
         setStateItem(DB_KEY.TOTAL_UNREAD_ALERT, 0)
    }
    //console.log("RKDebug:Residents:userSelected")
    this.stopTimers();
  //  getSensorsForUserId(userId, true);
  //ReportsDisableChanged.emit('REPORTS_DISABLE_MODE')
  this.setState({searchedUsersArray: [], showSeachInput:false, emitOneTime: false})
    this.getAllSesnorForUser(userId)
    setStateItem(DB_KEY.REPORTS_ARRAY,[])
  }

  async intervalModified(item) {
    if (item.value === 'All') {
      this.controller.selectItem('All');
      let residentsList = getStateItem(DB_KEY.RESIDENT_DATA);
      this.setState({
        residentsList: residentsList,
        refresh: !this.state.refresh,
        selectedUser: item,
      });
      setStateItem(DB_KEY.FILTERED_ARRAY, []);
      setStateItem(DB_KEY.FILTER_APPLIED, false);
    } else {
      let userId = item.value;

      let filtered = [];
      let residentsList = getStateItem(DB_KEY.RESIDENT_DATA);
      for (var index = 0; index < residentsList.length - 1; index++) {
        let dataDict = residentsList[index];

        if (dataDict.userId === userId) {
          filtered.push(dataDict);
        }
      }

      this.setState({deviceDataIdUP: ''});
      if (filtered.length > 0) {
        this.setState({
          residentsList: filtered,
          refresh: !this.state.refresh,
          selectedUser: item,
        });
        setStateItem(DB_KEY.FILTERED_ARRAY, filtered);
        setStateItem(DB_KEY.FILTER_APPLIED, true);
        if (filtered.length > 1) {
          this.setState({loading: true});
          //console.log("RKDebug:Resident:intervalModified:APIHelper")
       
          let apiHelper = new APIHelper();
          let sensorPositionArray = await apiHelper.getSensorPosition(userId);
          if (sensorPositionArray.length > 0) {
            let sensorPosition =
              sensorPositionArray[0].data.Sensorposition.value;
            let modifiedArray = this.repositionMacAddress(sensorPosition);
            if (modifiedArray.length > 0) {
              let newA = [];
              let deviceDataId = sensorPositionArray[0].deviceDataId;
              this.setState({deviceDataIdUP: deviceDataId});
              for (var index = 0; index < modifiedArray.length; index++) {
                let macId = modifiedArray[index];
                let filteredItem = filtered.filter(
                  subContent => subContent.data.Devid.value === macId,
                );
                if (filteredItem.length > 0) {
                  newA.push(filteredItem[0]);
                }
              }

              this.setState({
                residentsList: newA,
                refresh: !this.state.refresh,
              });
              setStateItem(DB_KEY.FILTERED_ARRAY, newA);
              setStateItem(DB_KEY.FILTER_APPLIED, true);
            }
          }
          this.setState({loading: false});
        }
      } else {
        alert('No Sensor Configured for ' + item.label);
        let data = [{label: 'All', value: 'All'}];
        this.intervalModified(data);
      }
    }
  }

  repositionMacAddress(sensorPos) {
    let array = sensorPos.split(';');
    let newArray = [];
    for (var index = 1; index <= array.length; index++) {
      for (var index2 = 1; index2 <= array.length; index2++) {
        let element = array[index2 - 1];
        let splitItem = element.split('/');

        if (parseInt(splitItem[1]) === index) {
          newArray.push(splitItem[0]);
        }
      }
    }
    return newArray;
  }

  friendlyNameModified(item) {
    if (item.value === 'All') {
      this.userSelected(this.state.selectedUser);
    } else {
      let filtered = [];
      let arrayToFilter = getStateItem(DB_KEY.RESIDENT_DATA);

      for (var index = 0; index < arrayToFilter.length - 1; index++) {
        let dataDict = arrayToFilter[index];

        if (
          dataDict.data.Devid.value === item.value &&
          dataDict.userId === this.state.selectedUser.value
        ) {
          filtered.push(dataDict);
        }
      }

      // setStateItem(DB_KEY.FILTERED_ARRAY,filtered)
      this.setState({residentsList: filtered, refresh: !this.state.refresh});
      //setStateItem(DB_KEY.FILTER_APPLIED, true)
    }
  }

  _renderResidentsList() {
    const {residentsList, dragging} = this.state;
    let user = getStateItem(DB_KEY.USER);
    let userRole = user.currentRole ? user.currentRole.role : '';
    let isManufacturer = userRole === 'TenantAdmin' || userRole === 'PracticeAdmin' ||userRole === 'SupplierAdmin';
    const ITEM_HEIGHT = Platform.OS === 'ios' ? height*0.14 :height*0.145
    if (residentsList.length > 0) {
      return (
        <View>
          <FlatList
            ref={this.flatList}
            scrollEnabled={!dragging}
            style={{
              marginTop: isManufacturer ? 70 : 10,
              height: isManufacturer ? height * 0.77 - 70 : height * 0.77 - 10,
            }}
            extraData={this.state.refresh}
            data={residentsList}
            onScroll={e => {
              this.scrollOffset = e.nativeEvent.contentOffset.y;
            }}
            onLayout={e => {
              this.flatlistTopOffset = e.nativeEvent.layout.y;
              this.flatListHeight = e.nativeEvent.layout.height;
            }}
            getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT, //  WIDTH + (MARGIN_HORIZONTAL * 2)
          offset: (ITEM_HEIGHT + height * 0.01) * (index),  //  ( WIDTH + (MARGIN_HORIZONTAL*2) ) * (index)
          index,
        })}
            scrollEventThrottle={16}
            renderItem={({item, index}) => this.renderRow(item, index)}
            keyExtractor={this._keyExtractor}></FlatList>
        </View>
      );
    }
  }

  _getFrindlyNameData(){
    
    
    const {
     selectedUser,
    } = this.state;
    let user = getStateItem(DB_KEY.USER);
    let userRole = user.currentRole ? user.currentRole.role : '';

    let userListArray = getStateItem(DB_KEY.ALL_USERS_ARRAY);
    let data = [{label: 'Select User', value: 'Select User'}];
    if (
      userListArray !== undefined &&
      userListArray !== null &&
      userListArray.length > 0
    ) {
      for (var index = 0; index < userListArray.length - 1; index++) {
        let dataDict = {
          label: userListArray[index].fullName,
          value: userListArray[index].userId,
        };
        data.push(dataDict);
      }
    }

    var friendlyNameData = [{label: 'All', value: 'All'}];
    this.setState({friendlyNameData1:friendlyNameData, dummyFriendlyNameData:friendlyNameData, loading:false})
    if (selectedUser.value !== 'All') {
      let arrayToFilter = getStateItem(DB_KEY.RESIDENT_DATA);
      if (
        arrayToFilter !== undefined &&
        arrayToFilter !== null &&
        arrayToFilter.length > 0
      ) {
        for (var index = 0; index < arrayToFilter.length - 1; index++) {
           if (arrayToFilter[index].ownerId === this.state.selectedUser.value) {
            let friendlyName = arrayToFilter[index].data.FriendlyName.value;
            let macAddress = arrayToFilter[index].data.Devid.value;

            let dataDict = {label: friendlyName, value: macAddress};
            friendlyNameData.push(dataDict);
          }
        }
      }
    }

    friendlyNameData.sort((a, b) => a.label.localeCompare(b.label))
    this.setState({friendlyNameData1:friendlyNameData, dummyFriendlyNameData:friendlyNameData, loading:false})
  }


  facilitySelected(item) {
       let currentFacility = getStateItem(DB_KEY.SELECTED_PRACTICE_ID)
        if (currentFacility !== item.value) {
          setStateItem(DB_KEY.SELECTED_PRACTICE_ID, item.value)
          let user = getStateItem(DB_KEY.USER);
          let supplierId = user?.currentRole?.supplier?.supplierId
          getUsersListForPracticeForCompany(supplierId, item.value)
        }
  }


    async fetchData() {
        let user = getStateItem(DB_KEY.USER);
        let supplierId = user?.currentRole?.supplier?.supplierId
        console.log("supplierId:::"+supplierId)
       
        let practiceList = await fetchPracticeList(supplierId);
        let allUsers = await fetchAllUsersForCompany(supplierId);
        console.log("practiceList:::"+practiceList.length)
        console.log("allUsers:::"+allUsers.length)
        var userListArray = []
        if (allUsers.length > 0 ) {
           // set the Users Array and emit
               
                allUsers.map((content)=> {
                  if (content.fullName.length > 0){
                    userListArray.push(content)
                  }
                })
                  
                setStateItem(DB_KEY.USERS_LIST_ARRAY, userListArray)
                setStateItem(DB_KEY.ALL_USERS_ARRAY, userListArray)
        }
        this.setState({practiceDataList: practiceList, companyUsersArray: userListArray})
      }

  


  _renderAdminUI() {
    // render 3 dropdown 
    // 1 for FacilityName
    // 2 for the user under facility
    // 3 for the residents

    const {
      themeChanged,
      dragging,
      residentsList,
      draggingIdx,
      showAddDevice,
      isLoading,
      selectedUser,
      practiceDataList
    } = this.state;


    let user = getStateItem(DB_KEY.USER);
    let userRole = user.currentRole ? user.currentRole.role : '';
    let isManufacturer = userRole === 'TenantAdmin' || userRole === 'PracticeAdmin' || userRole === 'SupplierAdmin';
    let isPracticeAdmin = userRole === 'PracticeAdmin' 
   


   
    let userListArray = this.state.searchedUsersArray.length > 0 ? this.state.searchedUsersArray : getStateItem(DB_KEY.ALL_USERS_ARRAY);
    let newA = userListArray.sort((a, b) => a.firstName < b.firstName ? -1 : 1)
    var data = [];
    var defaultValue = ''
   if (isPracticeAdmin) {
    let name = user.currentRole.practice.name
    data = [{label: name, value:name}];
    defaultValue = name
   }
   else {
    if (
      practiceDataList !== undefined &&
      practiceDataList !== null &&
      practiceDataList.length > 0
    ) {
      for (var index = 0; index < practiceDataList.length; index++) {
        let dataDict = {
          label: practiceDataList[index].name,
          value: practiceDataList[index].practiceId,
        };
        data.push(dataDict);
      }
    }
   }




    var userData = [{label: 'Select User', value: 'Select User'}];
    if (
      userListArray !== undefined &&
      userListArray !== null &&
      userListArray.length > 0
    ) {
      for (var index = 0; index < newA.length; index++) {
        let dataDict = {
          label: newA[index].fullName,
          value: newA[index].userId,
        };
        userData.push(dataDict);
      }
    }

    return(
      <View>
         {this._renderResidentsList()}
          <View style={{
            width : '100%',
            position:'absolute'
            }}>
                    <View
                      style={{
                        width: width * 0.3,
                        marginLeft: width * 0.025,
                      }}>
                        <Text style={{fontSize: height * 0.01, marginTop: 10}}>
                        Select Facility
                      </Text>

                      <DropDownPicker
                        controller={instance => (this.facilityDropdown = instance)}
                        items={data}
                        defaultValue={defaultValue}
                        containerStyle={{height: 40}}
                        labelStyle={{fontSize: 10, textAlign: 'left'}}
                        style={{backgroundColor: '#fafafa'}}
                        itemStyle={{
                          justifyContent: 'flex-start',
                        }}
                        dropDownStyle={{backgroundColor: '#fafafa'}}
                        onChangeItem={item => this.facilitySelected(item)}
                      />
                     </View>

                     <View
                      style={{
                        width: width * 0.3,
                        marginLeft: width * 0.35,
                        position: 'absolute'
                      }}>
                        <Text style={{fontSize: height * 0.01, marginTop: 10}}>
                        Select User
                      </Text>

                      <DropDownPicker
                        controller={instance => (this.userDropdown = instance)}
                        items={userData}
                        defaultValue={'Select User'}
                        containerStyle={{height: 40}}
                        labelStyle={{fontSize: 10, textAlign: 'left'}}
                        style={{backgroundColor: '#fafafa'}}
                        itemStyle={{
                          justifyContent: 'flex-start',
                        }}
                        dropDownStyle={{backgroundColor: '#fafafa'}}
                        onChangeItem={item => this.userSelected(item)}
                      />
                     </View>


                     <View
                      style={{
                        width: width * 0.3,
                        marginLeft: width * 0.675,
                        position: 'absolute'
                      }}>
                        <Text style={{fontSize: height * 0.01, marginTop: 10}}>
                        Select Friendly Name
                      </Text>

                      <DropDownPicker
                         items={this.state.friendlyNameData1}
                          defaultValue={'All'}
                          containerStyle={{height: 40}}
                          labelStyle={{fontSize: 10, textAlign: 'left'}}
                          style={{backgroundColor: '#fafafa'}}
                          itemStyle={{
                            justifyContent: 'flex-start',
                          }}
                          dropDownStyle={{backgroundColor: '#fafafa'}}
                          onChangeItem={item => this.friendlyNameModified(item)}
                        />
                     </View>
                     
          </View>
       
      </View>
    )
  }



  _renderManufacturerUI() {
    const {
      themeChanged,
      dragging,
      residentsList,
      draggingIdx,
      showAddDevice,
      isLoading,
      selectedUser,
    } = this.state;
    let user = getStateItem(DB_KEY.USER);
    let userRole = user.currentRole ? user.currentRole.role : '';

    let userListArray = this.state.searchedUsersArray.length > 0 ? this.state.searchedUsersArray : getStateItem(DB_KEY.ALL_USERS_ARRAY);
    let newA = userListArray.sort((a, b) => a.firstName < b.firstName ? -1 : 1)
    var data = [{label: 'Select User', value: 'Select User'}];
    if (
      userListArray !== undefined &&
      userListArray !== null &&
      userListArray.length > 0
    ) {
      for (var index = 0; index < newA.length; index++) {
        let dataDict = {
          label: newA[index].fullName,
          value: newA[index].userId,
        };
        data.push(dataDict);
      }
    }
   
    return (
      <View>
        {this._renderResidentsList()}
        <View
          style={{
            width: width * 0.4,
            marginLeft: width * 0.04,
            position: 'absolute'
          }}>
          <Text style={{fontSize: height * 0.01, marginTop: 10}}>
            Select User
          </Text>
          <DropDownPicker
            controller={instance => (this.userDropdown = instance)}
            items={data}
            defaultValue={'Select User'}
            containerStyle={{height: 40}}
            labelStyle={{fontSize: 10, textAlign: 'left'}}
            style={{backgroundColor: '#fafafa'}}
            itemStyle={{
              justifyContent: 'flex-start',
            }}
            dropDownStyle={{backgroundColor: '#fafafa'}}
            onChangeItem={item => this.userSelected(item)}
          />
        </View>

       

        <View
          style={{
            width: width * 0.4,
            marginLeft: width * 0.04,
            position: 'absolute',
            marginLeft: width * 0.6
          }}>
          <Text style={{fontSize: height * 0.01, marginTop: 10}}>
            Select FriendlyName
          </Text>
          <DropDownPicker
            items={this.state.friendlyNameData1}
            defaultValue={'All'}
            containerStyle={{height: 40}}
            labelStyle={{fontSize: 10, textAlign: 'left'}}
            style={{backgroundColor: '#fafafa'}}
            itemStyle={{
              justifyContent: 'flex-start',
            }}
            dropDownStyle={{backgroundColor: '#fafafa'}}
            onChangeItem={item => this.friendlyNameModified(item)}
          />
        </View>

        <TouchableOpacity style={{ width:35,
            marginLeft: width * 0.44 + 10,
            position: 'absolute',
            marginTop: 25}} onPress={() => this._startSearching()}>
        <IconVector name="search" size={20} color="#900" />
         
        </TouchableOpacity>
        {this._renderSearchInput()}
       
      </View>
    );
  }

  comanySelected(item) {
    
      let currentFacility = getStateItem(DB_KEY.SELECTED_PRACTICE_ID)
      setStateItem(DB_KEY.SELECTED_PRACTICE_ID, item.value)
       let allUsers = getStateItem(DB_KEY.ALL_USERS_ARRAY)
       var filteredUser
       if (item.value === 'Select All') {
        filteredUser = allUsers
       }
       else {
        filteredUser = allUsers.filter((content) => content?.currentRole?.practice?.practiceId === item.value)
       }
       this.facilityUserDropdown.close()
       this.facilityFriendlyDropdown.close()
       this.setState({companyUsersArray:filteredUser, selectedFacility: item.value, selectedFacilityUser: 'Select All', selectedFriednlyName:'Select All'})
       this.facilityUserDropdown.selectItem('Select All')
       this.facilityFriendlyDropdown.selectItem('Select All')
      
  }

  async companyUserSelected(item) {
    let userId = item.value;
    let allSensor = await getAllSensorFor(userId)
    this.facilityFriendlyDropdown.close()
    this.setState({companyFriendlyName: allSensor, selectedFriednlyName:'Select All',selectedFacilityUser: userId, selectedUser: item})
    this.facilityFriendlyDropdown.selectItem('Select All')
  }

  companyFrindlyNameSelected(item) {
    let friendlyName = item.value;
    this.setState({selectedFriednlyName: friendlyName})
  }
  
  _rendeSupplierAdminUI() {
    const {
     practiceDataList,
     companyUsersArray,
     companyFriendlyName,
     selectedFacility,
     selectedFriednlyName,
     selectedFacilityUser
    } = this.state;
    var data = [{label: 'Select All', value: 'Select All'}];
    var defaultValue = 'Select All';
    if (
      practiceDataList !== undefined &&
      practiceDataList !== null &&
      practiceDataList.length > 0
    ) {
      for (var index = 0; index < practiceDataList.length; index++) {
        let dataDict = {
          label: practiceDataList[index].name,
          value: practiceDataList[index].practiceId,
        };
        data.push(dataDict);
      }
    }

    let userListArray = companyUsersArray;
    let newA = companyUsersArray.sort((a, b) => a.firstName < b.firstName ? -1 : 1)

    var userData = [{label: 'Select All', value: 'Select All'}];
    if (
      userListArray !== undefined &&
      userListArray !== null &&
      userListArray.length > 0
    ) {
      for (var index = 0; index < newA.length; index++) {
        let dataDict = {
          label: newA[index].fullName,
          value: newA[index].userId,
        };
        userData.push(dataDict);
      }
    }

    var friendlyNameData = [{label: 'Select All', value: 'Select All'}];
    if (
      companyFriendlyName !== undefined &&
      companyFriendlyName !== null &&
      companyFriendlyName.length > 0
    ) {
      for (var index = 0; index < companyFriendlyName.length; index++) {
        let dataDict = {
          label: companyFriendlyName[index].data?.FriendlyName?.value,
          value: companyFriendlyName[index].data?.Devid?.value,
        };
        friendlyNameData.push(dataDict);
      }
    }

   

   return (
    <View>
     {this._renderResidentsList()}
     <View style={{
            width : '100%',
            position:'absolute'
            }}>
               <View
                style={{
                  width: width * 0.25,
                  marginLeft: width * 0.025,
                }}>
                  <Text style={{fontSize: height * 0.01, marginTop: 10}}>
                  Select Facility : 
                </Text>

                <DropDownPicker
                       items={data}
                        defaultValue={selectedFacility}
                        containerStyle={{height: 40}}
                        labelStyle={{fontSize: 10, textAlign: 'left'}}
                        style={{backgroundColor: '#fafafa'}}
                        itemStyle={{
                          justifyContent: 'flex-start',
                        }}
                        dropDownStyle={{backgroundColor: '#fafafa'}}
                        onChangeItem={item => this.comanySelected(item)}
                      />
              </View>



              <View
                      style={{
                        width: width * 0.25,
                        marginLeft: width * 0.57,
                        position: 'absolute'
                      }}>

                   <Text style={{fontSize: height * 0.01, marginTop: 10}}>
                        FriendlyName : 
                      </Text>

                      <DropDownPicker
                      controller={instance => (this.facilityFriendlyDropdown = instance)}
                       items={friendlyNameData}
                        defaultValue={selectedFriednlyName}
                        containerStyle={{height: 40}}
                        labelStyle={{fontSize: 10, textAlign: 'left'}}
                        style={{backgroundColor: '#fafafa'}}
                        itemStyle={{
                          justifyContent: 'flex-start',
                        }}
                        dropDownStyle={{backgroundColor: '#fafafa'}}
                        onChangeItem={item => this.companyFrindlyNameSelected(item)}
                      />
                    
                    </View>

                    <View
                      style={{
                        width: width * 0.25,
                        marginLeft: width * 0.30,
                        position: 'absolute'
                      }}>

                   <Text style={{fontSize: height * 0.01, marginTop: 10}}>
                        User : 
                      </Text>

                      <DropDownPicker
                       controller={instance => (this.facilityUserDropdown = instance)}
                        items={userData}
                        defaultValue={selectedFacilityUser}
                        containerStyle={{height: 40}}
                        labelStyle={{fontSize: 10, textAlign: 'left'}}
                        style={{backgroundColor: '#fafafa'}}
                        itemStyle={{
                          justifyContent: 'flex-start',
                        }}
                        dropDownStyle={{backgroundColor: '#fafafa'}}
                        onChangeItem={item => this.companyUserSelected(item)}
                      />
                    
                    </View>
                    
                    <TouchableOpacity
                      style={styles.fetchButton}
                       onPress={()=> this.fetchDataTapped()}
                      >
                        <Text>Fetch</Text>
                      </TouchableOpacity>
                      </View>
    </View>
   )
  }

  async fetchDataTapped() {
      // there could be 4 scenario
      //1. no one selected fetch data for all the facilityIds
      // 2. Facility is selected fetch all the users under that facility
      //3. User under facility is selected then fetch all the sensor under that user
      //4. if friendlyName is selected then fetch the data only for that
      const {selectedFacility, selectedFacilityUser, selectedFriednlyName,companyFriendlyName, selectedUser} = this.state
      
      if (selectedFacilityUser === 'Select All') {
        alert('Please select the user first');
        return
      }

      this.setState({isLoading: true, residentsList: [], refresh: !this.state.refresh})
  
      
       
      if (selectedFacility === 'Select All' && selectedFacilityUser === 'Select All' && selectedFriednlyName === 'Select All') {
        // fetch all the data
         let owndersArray = this.state.companyUsersArray.map((practiceUser) => practiceUser.userId)
        let allSensor = await getAllSensorForOwners(owndersArray)
        setStateItem(DB_KEY.TOTAL_ARRAY_COUNT,allSensor.length)  
        setStateItem(DB_KEY.RESIDENT_DATA, allSensor)  
         this.residentsChange()
       
      }
      else if (selectedFacility !== 'Select All' && selectedFacilityUser === 'Select All' && selectedFriednlyName === 'Select All') {
        // fetch all the data
         let owndersArray = this.state.companyUsersArray.map((practiceUser) => practiceUser.userId)
         let allSensor = await getAllSensorForOwners(owndersArray)
         setStateItem(DB_KEY.TOTAL_ARRAY_COUNT,allSensor.length)  
        setStateItem(DB_KEY.RESIDENT_DATA, allSensor)  
         this.residentsChange()
   }
      else if ( selectedFacilityUser !== 'Select All' && selectedFriednlyName === 'Select All') {
        // fetch all the data
        
        this.setState({isLoading: false});
        let owndersArray = [selectedUser]

        let allSensor =  companyFriendlyName
        setStateItem(DB_KEY.TOTAL_ARRAY_COUNT,allSensor.length)  
        setStateItem(DB_KEY.RESIDENT_DATA, allSensor)  
        setStateItem(DB_KEY.FILTER_APPLIED, false)
        setStateItem(DB_KEY.FILTERED_ARRAY, [])
        this.residentsChange()
      }
      else if ( selectedFacilityUser !== 'Select All' && selectedFriednlyName !== 'Select All') {
        // fetch all the data
        let filtered = [];
        let arrayToFilter = companyFriendlyName;
  
        for (var index = 0; index < arrayToFilter.length - 1; index++) {
          let dataDict = arrayToFilter[index];
  
          if (
            dataDict.data.Devid.value === selectedFriednlyName 
          ) {
            filtered.push(dataDict);
          }
        }
  
         setStateItem(DB_KEY.FILTER_APPLIED, true)
        setStateItem(DB_KEY.FILTERED_ARRAY, filtered)
            
        // setStateItem(DB_KEY.FILTERED_ARRAY,filtered)
        this.setState({residentsList: filtered, refresh: !this.state.refresh, isLoading: false});
      }
      

  }
  _renderNewUI() {
    const {
      themeChanged,
      dragging,
      residentsList,
      draggingIdx,
      showAddDevice,
      isLoading,
      selectedUser,
    } = this.state;

    let user = getStateItem(DB_KEY.USER);
    let userRole = user.currentRole ? user.currentRole.role : '';
    let isManufacturer = userRole === 'TenantAdmin' || userRole === 'PracticeAdmin' || userRole === 'SupplierAdmin';
    let isAdmin = userRole === 'PracticeAdmin' 
    let isSupplierAdmin = userRole === 'SupplierAdmin';
    if (isSupplierAdmin) {
      return <View>{this._rendeSupplierAdminUI()}</View>;
    }
    else if (isAdmin) {
      return <View>{this._renderAdminUI()}</View>;
    }else if (isManufacturer) {
      return <View>{this._renderManufacturerUI()}</View>;
    } else if (residentsList.length > 0) {
      return <View>{this._renderResidentsList()}</View>;
    } else if (showAddDevice) {
      return (
        <View style={styles.subContainer}>
          <ButtonK
            title={'Add Device'}
            style={styles.signInButton}
            onPress={() => this.addDeviceTapped()}
            titleColor={'white'}
            titleFont={20}
            titleWeight={'bold'}
          />
        </View>
      );
    } else if (!isLoading) {
      return (
        <View style={styles.subContainer}>
          <Text
            allowFontScaling={false}
            style={{
              fontSize: height * 0.023,
              fontWeight: 'bold',
              color: 'rgba(144,144,144,1.0)',
              width: width * 0.9,
              textAlign: 'center',
              marginTop: height * 0.3,
            }}>
            No device is configured for you
          </Text>
          <Text
            allowFontScaling={false}
            style={{
              fontSize: height * 0.023,
              fontWeight: 'bold',
              color: 'rgba(144,144,144,1.0)',
              width: width * 0.9,
              textAlign: 'center',
            }}>
            Take your first step and add the device
          </Text>

          <ButtonK
            title={'Add Device'}
            style={styles.signInButton}
            onPress={() => this.addSensorTapped()}
            titleColor={'white'}
            titleFont={20}
            titleWeight={'bold'}
          />
        </View>
      );
    }
  }

  
  _startSearching() {
    this.userDropdown.open();
    this.setState({showSeachInput: true})
  }

  renderUI() {
    const {
      themeChanged,
      dragging,
      residentsList,
      draggingIdx,
      showAddDevice,
      isLoading,
      selectedUser,
    } = this.state;
    let user = getStateItem(DB_KEY.USER);
    let userRole = user.currentRole ? user.currentRole.role : '';

    let userListArray = this.state.searchedUsersArray.length > 0 ? this.state.searchedUsersArray : getStateItem(DB_KEY.ALL_USERS_ARRAY);
    let data = [{label: 'All', value: 'All'}];
    if (
      userListArray !== undefined &&
      userListArray !== null &&
      userListArray.length > 0
    ) {
      for (var index = 0; index < userListArray.length - 1; index++) {
        let dataDict = {
          label: userListArray[index].fullName,
          value: userListArray[index].userId,
        };
        data.push(dataDict);
      }
    }
    //console.log("data : "+JSON.stringify(data))

  

    let isManufacturer = userRole === 'TenantAdmin' || userRole === 'PracticeAdmin';
    const ITEM_HEIGHT = Platform.OS === 'ios' ? height*0.14 :height*0.145
    
    if (residentsList.length > 0) {
      return (
        <View>
          <FlatList
            ref={this.flatList}
            scrollEnabled={!dragging}
            style={{
              marginTop: isManufacturer ? 70 : 10,
              height: isManufacturer ? height * 0.77 - 70 : height * 0.77 - 10,
            }}
            extraData={this.state.refresh}
            data={residentsList}
            onScroll={e => {
              this.scrollOffset = e.nativeEvent.contentOffset.y;
            }}
            onLayout={e => {
              this.flatlistTopOffset = e.nativeEvent.layout.y;
              this.flatListHeight = e.nativeEvent.layout.height;
            }}
            getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT, //  WIDTH + (MARGIN_HORIZONTAL * 2)
          offset: (ITEM_HEIGHT + height * 0.01) * (index),  //  ( WIDTH + (MARGIN_HORIZONTAL*2) ) * (index)
          index,
        })}
            scrollEventThrottle={16}
            renderItem={({item, index}) => this.renderRow(item, index)}
            keyExtractor={this._keyExtractor}
          />

          {isManufacturer && (
            <View
              style={{
                width: width * 0.4,
                marginLeft: width * 0.04,
                position: 'absolute',
              }}>
              <Text style={{fontSize: height * 0.01, marginTop: 10}}>
                Select User
              </Text>
              <DropDownPicker
                items={data}
                defaultValue={'All'}
                containerStyle={{height: 40}}
                labelStyle={{fontSize: 10, textAlign: 'left'}}
                style={{backgroundColor: '#fafafa'}}
                itemStyle={{
                  justifyContent: 'flex-start',
                }}
                dropDownStyle={{backgroundColor: '#fafafa'}}
                onChangeItem={item => this.intervalModified(item)}
              />
            </View>
          )}

          {isManufacturer && (
            <View
              style={{
                width: width * 0.4,
                marginLeft: width * 0.04,
                position: 'absolute',
                marginLeft: width * 0.6,
              }}>
              <Text style={{fontSize: height * 0.01, marginTop: 10}}>
                Select FriendlyName
              </Text>
              <DropDownPicker
                controller={instance => (this.controller = instance)}
                items={this.state.friendlyNameData1}
                defaultValue={'All'}
                containerStyle={{height: 40}}
                labelStyle={{fontSize: 10, textAlign: 'left'}}
                style={{backgroundColor: '#fafafa'}}
                itemStyle={{
                  justifyContent: 'flex-start',
                }}
                dropDownStyle={{backgroundColor: '#fafafa'}}
                onChangeItem={item => this.friendlyNameModified(item)}
              />
            </View>
          )}
        </View>
      );
    } else if (showAddDevice) {
      return (
        <View style={styles.subContainer}>
          <ButtonK
            title={'Add Device'}
            style={styles.signInButton}
            onPress={() => this.addDeviceTapped()}
            titleColor={'white'}
            titleFont={20}
            titleWeight={'bold'}
          />
        </View>
      );
    } else if (!isLoading) {
      return (
        <View style={styles.subContainer}>
          <Text
            allowFontScaling={false}
            style={{
              fontSize: height * 0.023,
              fontWeight: 'bold',
              color: 'rgba(144,144,144,1.0)',
              width: width * 0.9,
              textAlign: 'center',
              marginTop: height * 0.3,
            }}>
            No device is configured for you
          </Text>
          <Text
            allowFontScaling={false}
            style={{
              fontSize: height * 0.023,
              fontWeight: 'bold',
              color: 'rgba(144,144,144,1.0)',
              width: width * 0.9,
              textAlign: 'center',
            }}>
            Take your first step and add the device
          </Text>

          <ButtonK
            title={'Add Device'}
            style={styles.signInButton}
            onPress={() => this.addSensorTapped()}
            titleColor={'white'}
            titleFont={20}
            titleWeight={'bold'}
          />
        </View>
      );
    }
  }

  bellIconTapped() {
    let nav = getStateItem(DB_KEY.LOGIN_NAV);
    nav.navigate('AlertsScreen', {devId: ''});
    //this.props.navigation.navigate('AlertsScreen')
  }

  renderLoading() {
    const {isLoading, residentsList, themeChanged} = this.state;

    if (isLoading && residentsList.length === 0) {
      return (
        <View
          style={[
            styles.container,
            {
              backgroundColor: 'transparent',
              justifyContent: 'center',
              alignItems: 'center',
            },
          ]}>
          <ActivityIndicator size="large" color="rgba(131,131,131,1.0)" />
        </View>
      );
    }
  }

  _searchWithText(text) {
    this.setState({searchText:text})
   
   var searchedData = []
    if (text.length > 2) {
      

      let user = getStateItem(DB_KEY.USER);
    let userListArray = getStateItem(DB_KEY.ALL_USERS_ARRAY);
        if (
          userListArray !== undefined &&
          userListArray !== null &&
          userListArray.length > 0
        ) {
          for (var index = 0; index < userListArray.length - 1; index++) {
            let fullName =  userListArray[index].fullName
           
            if (fullName.includes(text)) {
              searchedData.push( userListArray[index]);
           }
          
          }
        }

        if (searchedData.length > 0) {
          this.setState({searchedUsersArray: searchedData, reload: !this.state.reload})
        }
    }else{
      this.setState({searchedUsersArray: [], reload: !this.state.reload})
    }
  }

  _renderSearchInput() {
    const {showSeachInput} = this.state;
    if (showSeachInput) {
      return(<View style={{width:width * 0.4 - 10, height:38, marginTop:13 + height * 0.01, marginLeft:width * 0.04 + 2, backgroundColor: '#fafafa'}}>
        <TextInput
          style={{height:38, width:width * 0.4 - 8, marginLeft : 2, position:'absolute'}}
          placeholder="Type here to search"
          clearButtonMode="always"
          onChangeText={(searchText) => this._searchWithText(searchText)}
          value={this.state.searchText}
        />
      </View>)
    }else{
      return(<View></View>)
    }
  }

  render() {
    const {themeChanged, dragging, residentsList, draggingIdx} = this.state;

    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: themeChanged
              ? 'rgba(27,26,29,1.0)'
              : 'rgba(249,249,249,1.0)',
          },
        ]}>
        <Header
          isForResidents={true}
          bellIconTapped={() => this.bellIconTapped()}
          isDarkMode={themeChanged}
          style={{
            backgroundColor: themeChanged ? 'rgba(30,30,32,1.0)' : 'white',
            textColor: themeChanged
              ? 'rgba(249,249,249,1.0)'
              : 'rgba(50,50,50,1.0)',
          }}
        />
        {dragging && (
          <Animated.View
            style={{
              position: 'absolute',
              zIndex: 1,
              width: '100%',
              top: this.point.getLayout().top,
            }}>
            {this.renderDraggingRow(residentsList[draggingIdx], -1)}
          </Animated.View>
        )}
        {this._renderNewUI()}
        {this.renderLoading()}
      </View>
    );
  }
}
