/**
 * cardio App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {Component} from 'react';
import {
  View,
  Text,
  AppState,
  Dimensions,
} from 'react-native';

import Header from '../../../common/component/header';
import moment from 'moment';
import styles from './styles';
import getStateItem from '../../../state/getStateItem';
import ThemeChange from '../../../state/emitters/themeChange';
import {
  ResidentsChange,
  UploadImageTapped,
  UploadImageSelected,
  StatsTabTapped,
  StatsSectionTapped,
  AlertsNumberChanged,
  OrientationDidChange,
  AppInBackground,
  AppInForeground,
  GraphEnterLandscapeMode,
  GraphExitLandscapeMode
} from '../../../state/emitters';
import {DB_KEY} from '../../../common/helper/keys';
import Carousel, {Pagination} from 'react-native-snap-carousel';
import {LastSyncChanged} from '../../../state/emitters';
import StatsRow from '../../../common/component/statsRow';
import NewStatsRow from '../../../common/component/NewStatsRow';
import style, {
  sliderWidth,
  itemWidth,
} from '../../../common/component/statsRow/styles';

// importing Event Emitter
import {ResidentsTapped} from '../../../state/emitters';
import setStateItem from '../../../state/setState/setStateItem';
import ImagePicker from 'react-native-image-crop-picker';

import DatabaseManager from '../../../Database';
import {getFilteredData, checkGenericNoType} from '../../../common/helper/util';

const SLIDER_1_FIRST_ITEM = 0;

import Orientation from 'react-native-orientation-locker';

import ButtonK from '../../../common/component/Button';
import {executeApiWith} from '../../../api'
const {width, height} = Dimensions.get('window');
import getHeaders from '../../../../galenApiLibrary/config/getHeader';
import {fetchLatestDataPVital, fetchLastUnreadAlertCount} from '../../../../galenApiLibrary/residents';
import FDAStatsRow from '../../../common/component/fdaStatsRow';
import { getBaseURL } from '../../../../galenApiLibrary/config/getBaseURL';
import { isEndPointCardio } from '../../../../galenApiLibrary/config/getBaseURL';


export default class Stats extends Component {
  constructor(props) {
    super(props);
    this.residentsChange = this.residentsChange.bind(this);
    this.themeChange = this.themeChange.bind(this);
    this.residentsTapped = this.residentsTapped.bind(this);
    this.eventUploadImageSelected = this.eventUploadImageSelected.bind(this);
    this.eventStatsTabTapped = this.eventStatsTabTapped.bind(this);
    this.eventOrientationDidChange = this.eventOrientationDidChange.bind(this);
    this.eventAppInBackground = this.eventAppInBackground.bind(this);
    this.eventAppInForeground = this.eventAppInForeground.bind(this);
    this.fetchLastAlertsData = this.fetchLastAlertsData.bind(this);
    this.changeActiveIndex = this.changeActiveIndex.bind(this);
    this.eventGraphEnterLandscapeMode = this.eventGraphEnterLandscapeMode.bind(this);
    this.eventGraphExitLandscapeMode = this.eventGraphExitLandscapeMode.bind(this);

    this.state = {
      themeChanged: getStateItem(DB_KEY.IS_DARK_MODE),
      refresh: false,
      activeIndex: SLIDER_1_FIRST_ITEM,
      statsList: [],
      refreshData: false,
      isResidentTapped: false,
      residentData: null,
      numberOfIndex: -1,
      thresholds: [],
      appState: AppState.currentState,
      isSensorOffline: true,
      isOccupied: false,
      statsTheme: getStateItem(DB_KEY.STATS_THEME),
      alertsArray: [],
      isOccupiedPVital: false,
      alertCount: 0
      
    };
  }

  _renderFDAStatsItem({item, index}) {
    const {themeChanged, alertsArray, isOccupied, activeIndex} = this.state;
  
    return (
      <FDAStatsRow
        data={item}
        isDarkMode={themeChanged}
      />
    );
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

  eventAppInBackground = () => {
    clearInterval(this._interval);
    clearInterval(this._intervalSVital);
  };

  eventGraphEnterLandscapeMode= () => {
    clearInterval(this._interval);
    clearInterval(this._intervalSVital);
  };


  eventGraphExitLandscapeMode= () => {
    this.fetchLatestData();
    var lteinterval = getStateItem('lteInterval')
    if (lteinterval === undefined || lteinterval === null) {
      lteinterval = 120
    }

    let lteIntervalMiliSeconds = lteinterval * 60 * 1000
     let timeInterval = isEndPointCardio() === true ? 10000 : lteIntervalMiliSeconds // 1o seconds and 200 seconds
                
    this._interval = setInterval(() => {
      this.fetchLatestData();
    }, timeInterval);
  };

  filterResidentData() {
    let residentsList = getFilteredData();
    if (residentsList.length > 0) {
      let selectedUser = getStateItem(DB_KEY.SELECTED_USER);
      if (selectedUser.value === 'All') {
        return residentsList;
      } else {
        let userId = selectedUser.value;

        let filtered = [];
        for (var index = 0; index < residentsList.length - 1; index++) {
          let dataDict = residentsList[index];

          if (dataDict.userId === userId) {
            filtered.push(dataDict);
          }
        }

        let selectedFriendlyName = getStateItem(DB_KEY.SELECTED_FRIENDLY_NAME);
        if (selectedFriendlyName.value === 'All') {
          return filtered;
        } else {
          let filtered = [];

          for (var index = 0; index < filtered.length - 1; index++) {
            let dataDict = filtered[index];

            if (
              dataDict.data.Devid.value === item.value &&
              dataDict.userId === this.state.selectedUser.value
            ) {
              filtered.push(dataDict);
            }
          }

          return filtered;
        }
      }
    }
  }

  eventAppInForeground = () => {
    const macAddress = getStateItem(DB_KEY.SELECTED_SENSOR_MAC_ADDRESS);
    const userId = getStateItem(DB_KEY.SELECTED_SENSOR_USER_ID);

    let residentsInfo = getFilteredData(); //getStateItem(DB_KEY.RESIDENT_DATA)
    if (residentsInfo !== null) {
      let residentsArray = getStateItem(DB_KEY.GALEN)
        ? residentsInfo
        : residentsInfo.deviceInfo;
      this.setState({statsList: residentsArray});
    }

    if (macAddress.length > 0) {
      this.calculateMoveToIndex(userId, macAddress);
    }
    this.fetchLatestData();
    var lteinterval = getStateItem('lteInterval')
    if (lteinterval === undefined || lteinterval === null) {
      lteinterval = 120
    }

    let lteIntervalMiliSeconds = lteinterval * 60 * 1000
    let timeInterval = isEndPointCardio() === true ? 10000 : lteIntervalMiliSeconds // 1o seconds and 200 seconds
      
    this._interval = setInterval(() => {
      this.fetchLatestData();
    }, timeInterval);
  };

  componentDidMount() {
    ResidentsChange.addResidentsChangeListener(this.residentsChange);
    ThemeChange.addThemeChangeListener(this.themeChange);
    ResidentsTapped.addResidentsTappedListener(this.residentsTapped);
    UploadImageSelected.addUploadImageSelectedListener(
      this.eventUploadImageSelected,
    );
    StatsTabTapped.addStatsTabTappedListener(this.eventStatsTabTapped);
    OrientationDidChange.addOrientationDidChangeListener(
      this.eventOrientationDidChange,
    );
    GraphEnterLandscapeMode.addGraphEnterLandscapeMode(this.eventGraphEnterLandscapeMode)
    GraphExitLandscapeMode.addGraphExitLandscapeMode(this.eventGraphExitLandscapeMode)

    //Here is the Trick
    const {navigation} = this.props;
    //Adding an event listner om focus
    //So whenever the screen will have focus it will set the state to zero

    

    this.focusListener = navigation.addListener('didFocus', () => {
      AlertsNumberChanged.emit('ALERTS__NUMBER_CHANGED');
      setStateItem(DB_KEY.CURRENTLY_SELECTED,'stats')
   
      let selectedDeviceId = getStateItem(DB_KEY.SELECTED_DEVICE_ID);
      if (selectedDeviceId === null) {
        this.setState({residentData: null, isResidentTapped: false});
      } else {
        setStateItem(DB_KEY.SELECTED_DEVICE_ID, null);
        setStateItem(DB_KEY.SELECTED_MAC_ADDRESS, null);
      }

      AppInBackground.addAppInBackgroundListener(this.eventAppInBackground);
      AppInForeground.addAppInForegroundListener(this.eventAppInForeground);
      this.setState({statsTheme: getStateItem(DB_KEY.STATS_THEME)});
      this.fetchLatestData();
      var lteinterval = getStateItem('lteInterval')
      if (lteinterval === undefined || lteinterval === null) {
        lteinterval = 120
      }
  
      let lteIntervalMiliSeconds = lteinterval * 60 * 1000
      let timeInterval = isEndPointCardio() === true ? 10000 : lteIntervalMiliSeconds // 1o seconds and 200 seconds
     
      this._interval = setInterval(() => {
        this.fetchLatestData();
      }, timeInterval);
      if(this.carousel !== null &&  this.carousel !== undefined){
        let residentsInfo = getFilteredData(); //getStateItem(DB_KEY.RESIDENT_DATA)
        if (residentsInfo !== null) {
          let residentsArray = getStateItem(DB_KEY.GALEN)
            ? residentsInfo
            : residentsInfo.deviceInfo;
          this.setState({statsList: residentsArray});
        }
    
        let selectedDevice = getStateItem(DB_KEY.SELECTED_DEVICE_ID);
        let selectedMacAddress = getStateItem(DB_KEY.SELECTED_MAC_ADDRESS);
        if (selectedDevice !== null && selectedDevice !== undefined) {
          this.calculateMoveToIndex(selectedDevice, selectedMacAddress);
        }
      }
    });

    this.blurListener = navigation.addListener('didBlur', () => {
      let array = getFilteredData(); //getStateItem(DB_KEY.RESIDENT_DATA)
      clearInterval(this._interval);
      clearInterval(this._intervalSVital);
      if (this.state.statsList.length > 0) {
       // alert('Stopping stats interval')
       this.setState({residentData: null,refresh : !this.state.refresh});
        clearInterval(this._interval);
        clearInterval(this._intervalSVital);
      }

      AppInBackground.removeAppInBackgroundListener(this.eventAppInBackground);
      AppInForeground.removeAppInForegroundListener(this.eventAppInForeground);
    });
     
   

    let residentsInfo = getFilteredData(); //getStateItem(DB_KEY.RESIDENT_DATA)
    if (residentsInfo !== null) {
      let residentsArray = getStateItem(DB_KEY.GALEN)
        ? residentsInfo
        : residentsInfo.deviceInfo;
      this.setState({statsList: residentsArray});
    }

    let selectedDevice = getStateItem(DB_KEY.SELECTED_DEVICE_ID);
    let selectedMacAddress = getStateItem(DB_KEY.SELECTED_MAC_ADDRESS);
    if (selectedDevice !== null && selectedDevice !== undefined) {
      this.calculateMoveToIndex(selectedDevice, selectedMacAddress);
    }
  }

  getOfflineStatus() {
    const {activeIndex, statsList} = this.state;
    var offlineValue = true;
    if (statsList.length > activeIndex) {
      let stats = statsList[activeIndex];
      let data = stats.data ? stats.data : null;

      if (data !== undefined && data !== null) {
        let Offline = data.Offline ? data.Offline : null;
        if (Offline !== undefined && Offline !== null) {
          offlineValue = checkGenericNoType(Offline.value) ? false : true;
        }


        let Online = data.Online ? data.Online : null;
        if (Online !== undefined && Online !== null) {
          offlineValue = Online == 1 ? false : true;
        }
      }
    }
    this.setState({isSensorOffline: offlineValue});
  }

  async fetchLastAlertsData() {
    const {statsList, activeIndex} = this.state;
    if (this.state.statsList.length > 0) {
      // var myHeaders = new Headers();
      // myHeaders.append('X-APP-TYPE', HEADER.APP_TYPE);
      // myHeaders.append('X-TENANT-DOMAIN', HEADER.TENANT_DOMAIN);
      // myHeaders.append('X-API-VERSION', HEADER.API_VERSION);
      // myHeaders.append('Content-Type', 'application/json');
      // myHeaders.append('Authorization', getStateItem(DB_KEY.ACCESS_TOKEN));

      const myHeaders  = getHeaders()

      var macAddress = '';
      if (statsList.length > 0 && statsList.length > activeIndex) {
        let dataAtIndex = statsList[activeIndex];
        macAddress = dataAtIndex.data.Devid.value;
      }

      var raw;
      if (macAddress !== '') {
        raw = JSON.stringify({
          deviceDataModelId: 'd36a4373-fbdc-44a3-8c96-4bb920041e40-as',
          deviceCriteria: [
            {
              key: 'DevidAlerts',
              operator: 'Equal',
              value: macAddress,
            },
          ],
        });
      }

      var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow',
      };

      let url =
        getBaseURL() + 'data/devicedata-advanced?pageSize=1&pageNumber=0';
      //V3
      //console.log("RKDebug:Stats:fetchLastAlertsData:url:"+url+"body:"+raw)
      const response = await executeApiWith(url, 'POST', raw, myHeaders, "StatsScreen:fetchLastAlertsData", true)
      if (response.status === 200) {
        let res = await response.json()
        let content = res.content;
        if (content !== undefined && content !== null && content.length > 0) {
          this.setState({alertsArray: content});
        }
      }else{
        this.setState({alertsArray: []});
      }
    }
  }

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
    // nav.navigate('DeviceConfigScannerScreen')
    nav.navigate('MedicalTextScreen');
  }

  getUserListArray() {
    let userListArray = [];
    let userArray = getStateItem(DB_KEY.USERS_LIST_ARRAY);

    for (var index = 0; index < userArray.length ; index++) {
      let content =  userArray[index]
      if (content.fullName.length > 0) {
        userListArray.push(content.userId);
      }
    }
    return userListArray
  }  

  async fetchLatestDataTimestampNewLogic() {
    const {statsList} = this.state;
    let userListArray = this.getUserListArray()
     let res = await fetchLatestDataPVital(userListArray)
        if (res.length > 0) {
            for (var index = 0; index < this.state.statsList.length; index++) {
                let dataAt = this.state.statsList[index];
                let devid = dataAt.data.Devid.value;
               // console.log("Stats look for MacId: "+devid+ "FriendlyName : "+dataAt.data.FriendlyName.value);

                let filteredArray = res.filter(
                  content => content.data.DevidPvital.value === devid,
                );
      
                if (filteredArray.length > 0) {
                  let firstObj = filteredArray[0];
                  let dataObj = dataAt.data;
                  //console.log("Stats firstObj: "+JSON.stringify(firstObj));


                  if (
                    this.state.isOccupiedPVital === false &&
                    firstObj.data.Occupied !== undefined &&
                    firstObj.data.Occupied !== null
                  ) {
                    this.setState({isOccupiedPVital: firstObj.data.Occupied.value === 0 ? true : false});
                  }
      
                  let manupulatedObj = {
                    Rr: firstObj.data.Rr,
                    Hr: firstObj.data.Hr,
                    Stress: firstObj.data.Stress,
                    Motion: firstObj.data.Motion,
                    RssHrMv: firstObj.data.RssHrMv,
                    Active: dataAt.data.Active,
                    RssRrMv: firstObj.data.RssRrMv,
                    RssWifi: firstObj.data.RssWifi,
                    Devsn: dataObj.Devsn,
                    Timezone: dataObj.Timezone,
                    Model: dataObj.Model,
                    FriendlyName: dataObj.FriendlyName,
                    Location: dataObj.Location,
                    Devid: dataObj.Devid,
                    Offline: firstObj.data.Offline,
                    Timestamp: firstObj.data.Timestamp,
                    Occupied: firstObj.data.Occupied,
                    EnableReports: firstObj.data.EnableReports,
                    Online : firstObj.data.Online
                  };
                  dataAt.data = manupulatedObj;
                  dataAt.minValueProvidedOn = firstObj.minValueProvidedOn;
                 // console.log("Stats manupulatedObj: "+JSON.stringify(dataAt.data));

                  this.state.statsList[index] = dataAt;
                 // console.log("Stats statsList: "+JSON.stringify(this.state.statsList));
                } else {
                  this.setEmptyData(devid);
                }
              }
      
              let currentTimeStamp = new Date().getTime();
              setStateItem(DB_KEY.LAST_SYNCED, currentTimeStamp);
              LastSyncChanged.emit('LAST_SYNC_CHANGED');
        }

  }

  async fetchLatestDataTimestamp() {
    const {activeIndex, statsList} = this.state;

    var macAddress = '';
    if (statsList.length > 0 && statsList.length > activeIndex) {
      let dataAtIndex = statsList[activeIndex];
     // console.log("stats:dataAtIndex::"+JSON.stringify());
      macAddress = dataAtIndex.data.Devid.value;
    }

 

    let url =
      getBaseURL() + 'data/devicedata-advanced?sortBy=data.Timestamp.value&sortOrder=DESC';

    // var myHeaders = new Headers();
    // myHeaders.append('X-APP-TYPE', HEADER.APP_TYPE);
    // myHeaders.append('X-TENANT-DOMAIN', HEADER.TENANT_DOMAIN);
    // myHeaders.append('X-API-VERSION', HEADER.API_VERSION);
    // myHeaders.append('Content-Type', 'application/json');
    // myHeaders.append('Authorization', getStateItem(DB_KEY.ACCESS_TOKEN));

    const myHeaders  = getHeaders()


    // let endDateTime = moment.utc().add(30, 'minutes');

    // let startDateTime;
    

      var lteinterval = getStateItem('lteInterval')
              if (lteinterval === undefined || lteinterval === null) {
                lteinterval = 120
              }
          
              var bufferValue = getStateItem('bufferValue')
              if (bufferValue === undefined || bufferValue === null) {
                  bufferValue = 5
              }
          
              let totalMinutes = lteinterval + bufferValue

    const endDateTime = moment.utc();

    const startDateTime = moment.utc().subtract(totalMinutes, 'minutes');

    let userListArray = this.getUserListArray()
    
    let raw;
    if (macAddress !== '') {
      raw = JSON.stringify({
        deviceDataModelId: 'd36a4373-fbdc-44a3-8c96-4bb920041e40',
        deviceCriteria: [
          {
            key: 'Timestamp',
            operator: 'Between',
            valueFrom: startDateTime,
            valueTo: endDateTime,
          },
          {
            key: 'DevidPvital',
            operator: 'Equal',
            value: macAddress,
          },
        ],
        devicePropertyCodes: [
          'Hr',
          'Rr',
          'Stress',
          'Motion',
          'DevidPvital',
          'Occupied',
          'FriendlyNameP',
          'LocationP',
          'RssHrMv',
          'RssRrMv',
          'Timestamp',
          'RssWifi',
          'Offline',
          'Online'
        ],
        ownerFilter: {
          users: userListArray,
        },
      });
    } else {
      raw = JSON.stringify({
        deviceDataModelId: 'd36a4373-fbdc-44a3-8c96-4bb920041e40',
        deviceCriteria: [
          {
            key: 'Timestamp',
            operator: 'Between',
            valueFrom: startDateTime,
            valueTo: endDateTime,
          },
        ],
        devicePropertyCodes: [
          'Hr',
          'Rr',
          'Stress',
          'Motion',
          'DevidPvital',
          'Occupied',
          'FriendlyNameP',
          'LocationP',
          'RssHrMv',
          'RssRrMv',
          'Timestamp',
          'RssWifi',
          'Offline',
          'Online'
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
    //console.log("RKDebug:Stats:FetchLatestDataTimestamp:url:"+url+"body:"+raw)
     
    const response = await executeApiWith(url, 'POST', raw, myHeaders, "StatsScreen:fetchLatestDataTimestamp", true)
    if (response.status === 200) {
      let jsonData = await response.json();

      if (
        jsonData !== undefined &&
        jsonData !== null &&
        jsonData.content !== undefined &&
        jsonData.content !== null &&
        jsonData.content.length > 0
      ) {
        let minValueProvidedOn = jsonData.content.minValueProvidedOn;

        // get the difference in time
        let currentUtcTime = moment.utc();

        
          for (var index = 0; index < this.state.statsList.length; index++) {
            let dataAt = this.state.statsList[index];
            let devid = dataAt.data.Devid.value;

            //console.log("Stats look for MacId: "+devid+ "FriendlyName : "+dataAt.data.FriendlyName.value);

            let filteredArray = jsonData.content.filter(
              content => content.data.DevidPvital.value === devid,
            );

            if (filteredArray.length > 0) {
              let firstObj = filteredArray[0];
              //console.log("Stats Found: "+JSON.stringify(firstObj));

              let dataObj = dataAt.data;
              if (
                this.state.isOccupiedPVital === false &&
                firstObj.data.Occupied !== undefined &&
                firstObj.data.Occupied !== null
              ) {
                this.setState({isOccupiedPVital: true});
              }

              let manupulatedObj = {
                Rr: firstObj.data.Rr,
                Active: dataAt.data.Active,
                Hr: firstObj.data.Hr,
                Occupied: firstObj.data.Occupied
                  ? firstObj.data.Occupied
                  : null,
                EnableReports:firstObj.data.EnableReports
                  ? firstObj.data.EnableReports
                  : null,
                Stress: firstObj.data.Stress,
                Motion: firstObj.data.Motion,
                RssHrMv: firstObj.data.RssHrMv,
                RssRrMv: firstObj.data.RssRrMv,
                RssWifi: firstObj.data.RssWifi,
                Devsn: dataObj.Devsn,
                Timezone: dataObj.Timezone,
                Model: dataObj.Model,
                FriendlyName: dataObj.FriendlyName,
                Location: dataObj.Location,
                Devid: dataObj.Devid,
                Offline: firstObj.data.Offline,
                Timestamp: firstObj.data.Timestamp,
                Occupied: firstObj.data.Occupied,
                Online: firstObj.data.Online
              };
              dataAt.data = manupulatedObj;
              dataAt.minValueProvidedOn = firstObj.minValueProvidedOn;
              dataAt.minValueProvidedOn = firstObj.minValueProvidedOn;
              //console.log("Stats manupulatedObj: "+JSON.stringify(dataAt.data));

              this.state.statsList[index] = dataAt;
              //console.log("Stats statsList: "+JSON.stringify(this.state.statsList));
            }
          }
        
      } else {
        // no data is obtained from
        this.setEmptyData(macAddress);
      }

      let currentTimeStamp = new Date().getTime();
      setStateItem(DB_KEY.LAST_SYNCED, currentTimeStamp);
      LastSyncChanged.emit('LAST_SYNC_CHANGED');

    } else {
      this.setEmptyData(macAddress);

      let currentTimeStamp = new Date().getTime();
      setStateItem(DB_KEY.LAST_SYNCED, currentTimeStamp);
      LastSyncChanged.emit('LAST_SYNC_CHANGED');
     }
  }


  setEmptyData(macAddress) {
    const {statsList} = this.state;

    let filteredDataList = this.state.statsList.filter(
      content => content.data.Devid.value === macAddress,
    );
    if (filteredDataList.length > 0) {
      let filteredData = filteredDataList[0];

      let index = statsList.indexOf(filteredData);

      let dataObj = filteredData.data;

      let heartRateData = dataObj.Hr ? dataObj.Hr : {};
      heartRateData.value = 0;
      heartRateData.valueProvidedOn = moment.utc().format();
      dataObj.Hr = heartRateData;

      let breathRateData = dataObj.Rr ? dataObj.Rr : {};
      breathRateData.value = 0;
      breathRateData.valueProvidedOn = moment.utc().format();

      dataObj.Rr = breathRateData;

      let StressRateData = dataObj.Stress ? dataObj.Stress : {};
      StressRateData.value = 0;
      StressRateData.valueProvidedOn = moment.utc().format();
      dataObj.Stress = StressRateData;

      let MotionRateData = dataObj.Motion ? dataObj.Motion : {};
      MotionRateData.value = 0;
      MotionRateData.valueProvidedOn = moment.utc().format();
      dataObj.Motion = MotionRateData;
      filteredData.data = dataObj;

      statsList[index] = filteredData;
    }
  }
  async fetchLatestData() {
    const {statsTheme} = this.state
    let currentlySelected = getStateItem(DB_KEY.CURRENTLY_SELECTED)
  if (currentlySelected !== 'stats') {
    clearInterval(this._intervalSVital);
   clearInterval(this._interval);
  }
    this.getOfflineStatus();

    this.fetchLatestDataTimestampNewLogic();
    if (statsTheme === 'Classic View'){
      this.fetchLastAlertsData();
    }
  }

  eventUploadImageSelected() {
    const selectedOption = getStateItem(DB_KEY.UPLOAD_IMAGE_SELECTED);

    if (selectedOption === 1) {
      // open camera
      ImagePicker.openCamera({
        width: 300,
        height: 400,
        cropping: true,
      }).then(image => {
        this.updateLocalDbForProfileImage(image.path);
      });
    } else if (selectedOption === 2) {
      // open Gallery
      ImagePicker.openPicker({
        width: 300,
        height: 400,
        cropping: true,
      }).then(image => {
        this.updateLocalDbForProfileImage(image.path);
      });
    }
  }

  eventOrientationDidChange = () => {
    Orientation.lockToPortrait();
  };

  residentsChange() {
    let residentsInfo = getFilteredData(); //getStateItem(DB_KEY.RESIDENT_DATA)
    if (residentsInfo !== null) {
      let residentsArray = getStateItem(DB_KEY.GALEN)
        ? residentsInfo
        : residentsInfo.deviceInfo;
      this.setState({statsList: residentsArray});
    }
  }
  eventStatsTabTapped() {
    const {isResidentTapped} = this.state;
    setStateItem(DB_KEY.SELECTED_SENSOR_MAC_ADDRESS, '');
    setStateItem(DB_KEY.SELECTED_SENSOR_USER_ID, '');
    let currentActiveIndex = getStateItem(DB_KEY.CURRENT_ACTIVE_INDEX);
    if (currentActiveIndex !== this.state.activeIndex) {
      let residentsInfo = getStateItem(DB_KEY.RESIDENT_DATA);
      if (residentsInfo !== null) {
        let residentsArray = getStateItem(DB_KEY.GALEN)
          ? residentsInfo
          : residentsInfo.deviceInfo;

        this.setState({
          statsList: residentsArray,
          isResidentTapped: false,
          residentData: null,
        });
        setTimeout(() => {
          this.moveSlider();
        }, 1000);
      }
    }
  }

  moveSlider = () => {
    const {numberOfIndex, statsList} = this.state;
    if (this.carousel !== undefined && this.carousel !== null) {
      this.carousel.snapToItem(0, false);

      this.carousel.snapToItem(numberOfIndex, false);
      this.setState({activeIndex: numberOfIndex});
      this.setState({numberOfIndex: -1});
    }
  };

  calculateMoveToIndex(devId, macAddress) {
    setStateItem(DB_KEY.SELECTED_SENSOR_MAC_ADDRESS, '');
      setStateItem(DB_KEY.SELECTED_SENSOR_USER_ID, '');
    this.setState({isResidentTapped: true});

    const {statsList, numberOfIndex} = this.state;

    if (statsList.length === 0) {
      let residentsInfo = getFilteredData(); //getStateItem(DB_KEY.RESIDENT_DATA)
      if (residentsInfo !== null) {
        let residentsArray = getStateItem(DB_KEY.GALEN)
          ? residentsInfo
          : residentsInfo.deviceInfo;

        this.setState({statsList: residentsArray, activeIndex: 0});
      }
    }

    let residentsInfo = getFilteredData(); //getStateItem(DB_KEY.RESIDENT_DATA)
    let residentsArray = getStateItem(DB_KEY.GALEN)
      ? residentsInfo
      : residentsInfo.deviceInfo;

    let residentData = null;
    let selectedIndex = -1;
    for (var index = 0; index < residentsArray.length; index++) {
      let stat = residentsArray[index];

      let uniqId = getStateItem(DB_KEY.GALEN) ? stat.userId : stat.devid;

      if (stat.data.Devid.value === macAddress && numberOfIndex !== index) {
        selectedIndex = index;
        break;
      }
    }

    if (selectedIndex !== -1) {
      this.setState({
        numberOfIndex: selectedIndex,
      });
     // StatsSectionTapped.emit('STATS_SELECTION_TAPPED');
      setStateItem(DB_KEY.SELECTED_SENSOR_MAC_ADDRESS, '');
      setStateItem(DB_KEY.SELECTED_SENSOR_USER_ID, '');
      
      if (this.state.activeIndex !== selectedIndex) {
        setTimeout(() => {
          this.moveSlider();
        }, 1000);
      }
     
    }

    //
  }
  uploadProfile() {
    UploadImageTapped.emit('UPLOAD_IMAGE_TAPPED');
  }

  getResidentDataFor(residentId, residentArray) {
    let indexExistAt;
    for (var index = 0; index < residentArray.length; index++) {
      let info = residentArray[index];

      if (info.devId === residentId) {
        indexExistAt = index;
        break;
      }
    }

    return indexExistAt;
  }

  updateLocalDbForProfileImage(imgPath) {
    const localDbUser = getStateItem(DB_KEY.LOCAL_DB_USER);

    const {residentData} = this.state;

    // check if profile image array for residents exist or not
    if (localDbUser.residents !== undefined && localDbUser.residents !== null) {
      let residents = localDbUser.residents;

      // check if data for same resident exist or not
      let indexExistAt = this.getResidentDataFor(
        getStateItem(DB_KEY.GALEN) ? residentData.userId : residentData.devid,
        residents,
      );

      if (indexExistAt !== undefined && indexExistAt !== null) {
        let residentDataToReturn = residents[indexExistAt];
        residentDataToReturn.profileImage = imgPath;
        residents[indexExistAt] = residentDataToReturn;
        localDbUser.residents = residents;
      } else {
        let residentsInfo = {
          devId: getStateItem(DB_KEY.GALEN)
            ? residentData.ownerId
            : residentData.devid,
          profileImage: imgPath,
        };
        residents.push(residentsInfo);
        localDbUser.residents = residents;
      }
    } else {
      let residents = [];

      let residentsInfo = {
        devId: getStateItem(DB_KEY.GALEN)
          ? residentData.ownerId
          : residentData.devid,
        profileImage: imgPath,
      };
      residents.push(residentsInfo);
      localDbUser.residents = residents;
    }

    let username =
      getStateItem(DB_KEY.GALEN) === true
        ? getStateItem(DB_KEY.USER).emailAddress
        : getStateItem(DB_KEY.USER).username;
    setStateItem(DB_KEY.LOCAL_DB_USER, localDbUser);
    DatabaseManager.saveUserProfileData(username, localDbUser);
    this.setState({refreshData: !this.state.refresh});
    // update the event to set profile pic
  }

  residentsTapped() {
    // capture on local instance
    const {numberOfIndex} = this.state
    let selectedDeviceId = getStateItem(DB_KEY.SELECTED_DEVICE_ID);
    let selectedMacAddress = getStateItem(DB_KEY.SELECTED_MAC_ADDRESS);

    this.calculateMoveToIndex(selectedDeviceId, selectedMacAddress);
  }

  componentWillUnmount() {
    this.setState({isResidentTapped: false});
    GraphEnterLandscapeMode.removeGraphEnterLandscapeMode(this.eventGraphEnterLandscapeMode)
    GraphExitLandscapeMode.removeGraphExitLandscapeMode(this.eventGraphExitLandscapeMode)
  }

  bellIconTapped() {
    let nav = getStateItem(DB_KEY.LOGIN_NAV);
    nav.navigate('AlertsScreen', {devId: ''});
    //this.props.navigation.navigate('AlertsScreen')
  }

  themeChange() {
    this.setState({themeChanged: getStateItem(DB_KEY.IS_DARK_MODE)});
  }

  _renderItem({item, index}) {
    const {themeChanged, alertCount} = this.state;

    return (
      <StatsRow
        data={item}
        isDarkMode={themeChanged}
        alertCount = {alertCount}
        onPressAlerts={() => this.onPressAlerts(item)}
        onPressAddNotes={() => this.onPressAddNotes(item)}
      />
    );
  }

  _renderNewStatsItem({item, index}) {
    const {themeChanged, alertsArray, isOccupied, activeIndex} = this.state;
    let occupied = false;
    if (this.state.statsList.length > 0) {
      let smData = this.state.statsList[activeIndex];
      if (smData?.data.Occupied !== undefined && smData?.data.Occupied !== null) {
        occupied = smData.data.Occupied.value === 1 ? true : false;
      } else {
        occupied = this.state.isOccupied;
      }
    }
    return (
      <NewStatsRow
        data={item}
        isDarkMode={themeChanged}
        alertsArray={alertsArray}
        isOccupied={occupied}
      />
    );
  }

  onPressAddNotes(residentData) {
    let nav = getStateItem(DB_KEY.LOGIN_NAV);
    nav.navigate('NotesListing', {
      macAddress: residentData.data.Devid.value,
      devId: getStateItem(DB_KEY.GALEN)
        ? residentData.ownerId
        : residentData.devid,
      name: getStateItem(DB_KEY.GALEN)
        ? residentData.user.fullName
        : residentData.name,
    });
  }

  onPressAlerts(residentData) {
    let nav = getStateItem(DB_KEY.LOGIN_NAV);
    nav.navigate('AlertsScreen', {devId: residentData.data.Devid.value});
  }

  async changeActiveIndex(index) {
   
    this.setState({isOccupiedPVital: false});
    this.setState({activeIndex: index, alertsArray: []});
    setStateItem(DB_KEY.CURRENT_ACTIVE_INDEX, index);
    clearInterval(this._intervalSVital);
    var macAddress = '';
    if (statsList.length > 0 && statsList.length > index) {
      let dataAtIndex = statsList[index];
      macAddress = dataAtIndex.data.Devid.value;
    }
    let res = await fetchLastUnreadAlertCount(macAddress)
    if (res.status === 200) {
      let resJson  = await res.json()
      let array = resJson.content
          setStateItem(DB_KEY.ALERTS_ARRAY, array)
          //totalElements
          let totalElements = resJson.totalElements !== undefined ? resJson.totalElements : 0
          this.setState({alertCount: totalElements})
    }else{
      this.setState({alertCount: 0})
    }
  }

  async getAlertCount(index) {
    var macAddress = '';
    if (statsList.length > 0 && statsList.length > index) {
      let dataAtIndex = statsList[index];
      macAddress = dataAtIndex.data.Devid.value;
    }
    let res = await fetchLastUnreadAlertCount(macAddress)
    if (res.status === 200) {
      let resJson  = await res.json()
      let array = resJson.content
          setStateItem(DB_KEY.ALERTS_ARRAY, array)
          //totalElements
          let totalElements = resJson.totalElements !== undefined ? resJson.totalElements : 0
          this.setState({alertCount: totalElements})
    }else{
      this.setState({alertCount: 0})
    }
  }

  _renderUI() {
    const {
      themeChanged,
      isResidentTapped,
      residentData,
      statsList,
      statsTheme,
    } = this.state;

    console.log("residentData::"+JSON.stringify(residentData)+"statsTheme::"+statsTheme+"statsList:"+statsList.length);

    if (residentData !== null && statsTheme === 'PlotView') {
      return (
        <View style={styles.statsContainer}>
          <StatsRow
            data={residentData}
            isDarkMode={themeChanged}
            onPressAlerts={() => this.onPressAlerts(residentData)}
            onPressAddNotes={() => this.onPressAddNotes(residentData)}
          />
        </View>
      );
    } else if (statsList.length > 0 && statsTheme === 'PlotView') {
      return (
        <View>
          <Carousel
            layout={'default'}
            ref={ref => (this.carousel = ref)}
            data={this.state.statsList}
            sliderWidth={sliderWidth}
            itemWidth={itemWidth}
            firstItem={SLIDER_1_FIRST_ITEM}
            inactiveSlideScale={0.94}
            inactiveSlideOpacity={0.7}
            renderItem={this._renderItem.bind(this)}
            containerCustomStyle={style.slider}
            contentContainerCustomStyle={style.sliderContentContainer}
            loop={false}
            loopClonesPerSide={2}
            onSnapToItem={index => this.changeActiveIndex(index)}
          />

          <Pagination
            dotsLength={statsList.length}
            activeDotIndex={this.state.activeIndex}
            containerStyle={styles.paginationContainer}
            dotColor={'rgba(91, 20, 44, 1.0)'}
            dotStyle={styles.paginationDot}
            inactiveDotColor={'gray'}
            inactiveDotOpacity={0.4}
            inactiveDotScale={0.6}
            carouselRef={this.carousel}
            tappableDots={!!this.carousel}
          />
        </View>
      );
    } else if (statsList.length > 0 && statsTheme === 'Classic View') {
      return (
        <View>
          <Carousel
            layout={'default'}
            ref={ref => (this.carousel = ref)}
            data={this.state.statsList}
            sliderWidth={sliderWidth}
            itemWidth={itemWidth}
            firstItem={SLIDER_1_FIRST_ITEM}
            inactiveSlideScale={0.94}
            inactiveSlideOpacity={0.7}
            renderItem={this._renderNewStatsItem.bind(this)}
            containerCustomStyle={style.slider}
            contentContainerCustomStyle={style.sliderContentContainer}
            loop={false}
            loopClonesPerSide={2}
            onSnapToItem={index => this.changeActiveIndex(index)}
          />

          <Pagination
            dotsLength={statsList.length}
            activeDotIndex={this.state.activeIndex}
            containerStyle={styles.paginationContainer}
            dotColor={'rgba(91, 20, 44, 1.0)'}
            dotStyle={styles.paginationDot}
            inactiveDotColor={'gray'}
            inactiveDotOpacity={0.4}
            inactiveDotScale={0.6}
            carouselRef={this.carousel}
            tappableDots={!!this.carousel}
          />
        </View>
      );
    } else if (residentData !== null && statsTheme === 'H-R View') {
      return (
        <View style={styles.statsContainer}>
          <FDAStatsRow
            data={residentData}
            isDarkMode={themeChanged}
           />
        </View>
      );
    }
    else if (statsList.length > 0 && statsTheme === 'H-R View') {
      return (
        <View>
          <Carousel
            layout={'default'}
            ref={ref => (this.carousel = ref)}
            data={this.state.statsList}
            sliderWidth={sliderWidth}
            itemWidth={itemWidth}
            firstItem={SLIDER_1_FIRST_ITEM}
            inactiveSlideScale={0.94}
            inactiveSlideOpacity={0.7}
            renderItem={this._renderFDAStatsItem.bind(this)}
            containerCustomStyle={style.slider}
            contentContainerCustomStyle={style.sliderContentContainer}
            loop={false}
            loopClonesPerSide={2}
            onSnapToItem={index => this.changeActiveIndex(index)}
          />

          <Pagination
            dotsLength={statsList.length}
            activeDotIndex={this.state.activeIndex}
            containerStyle={styles.paginationContainer}
            dotColor={'rgba(91, 20, 44, 1.0)'}
            dotStyle={styles.paginationDot}
            inactiveDotColor={'gray'}
            inactiveDotOpacity={0.4}
            inactiveDotScale={0.6}
            carouselRef={this.carousel}
            tappableDots={!!this.carousel}
          />
        </View>
      );
    }else if (statsList.length == 0 && !this.state.loading) {
      return (
        <View style={styles.subContainer}>
          <Text
            allowFontScaling={false}
            style={{
              fontSize: height * 0.023,
              fontWeight: 'bold',
              color: 'rgba(144,144,144,1.0)',
              width: width * 0.90,
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
              width:  width * 0.90,
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

  render() {
    const {
      themeChanged,
      isResidentTapped,
      residentData,
      activeIndex,
      isSensorOffline,
      isOccupied,
    } = this.state;

    let smData = null;
    let forResidents = true;
    let online = 'No';
    let occupied = false;
    let isOffline = true
    if (this.state.statsList.length > 0) {
      smData = this.state.statsList[activeIndex];
      //console.log("Stats smData: "+JSON.stringify(smData));

      if (smData.data.Occupied !== undefined && smData.data.Occupied !== null) {
        occupied = smData.data.Occupied.value === 1 ? true : false;
      } else {
        occupied = this.state.isOccupied;
      }

      if (smData.data.Online !== undefined && smData.data.Online !== null) {
        isOffline = smData.data.Online.value === 0 ? true : false;
      } 

      forResidents = false;
    }

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
          isOffline={isOffline}
          isOccupied={occupied}
          isForStats={!forResidents}
          isForResidents={forResidents}
          bellIconTapped={() => this.bellIconTapped()}
          isResidentTapped={isResidentTapped}
          residentData={smData}
          isDarkMode={themeChanged}
          style={{
            backgroundColor: themeChanged ? 'rgba(30,30,32,1.0)' : 'white',
            textColor: themeChanged
              ? 'rgba(249,249,249,1.0)'
              : 'rgba(50,50,50,1.0)',
          }}
          onPress={() => this.uploadProfile()}
        />
        {this._renderUI()}
      </View>
    );
  }
}
