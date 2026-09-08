import React, {Component} from 'react';
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import styles from './styles';
import Icon from 'react-native-vector-icons/FontAwesome';
import getStateItem from '../../../state/getStateItem';
import URLS from '../../helper/urls';
import {DB_KEY} from '../../helper/keys';
const {width, height} = Dimensions.get('window');
import moment from 'moment';
import Icon2 from 'react-native-vector-icons/Feather';
import HEADER from '../../../common/helper/constants';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {checkGenericNoType} from '../../helper/util';
import {executeApiWith} from '../../../api'
import { fetchLastUnreadAlertCount } from '../../../../galenApiLibrary/residents';
import setStateItem from '../../../state/setState/setStateItem';
import { AlertsNumberChanged } from '../../../state/emitters';
import {getLastDataForDevHealthFor} from '../../../../galenApiLibrary/setting/sensor';


export default class ResidentsRow extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isOnline: true,
      manipulatedData: null,
      isExistInAlert: false,
      alertCount: 0,
      totalAlert:0,
      currentHardwareVersion: '',
      rssValue: '',
      showData: false

    };
  }

  componentDidMount() {
    const {data, isDarkMode, isAlert, onPress, ...props} = this.props;
  this.fetchAlert()
  const macAddress = data.data
      ? data.data.Devid
        ? data.data.Devid.value
        : ''
      : '';
      console.log("ResidentsRow componentDidMount: macAddress : "+macAddress)

      if (macAddress !== '') {
        this.getDataFromDevHealth(macAddress)
      }


      this.interval = setInterval(() => {
        this.setState({ showData: true });
      }, 4000);
  } 

  async getDataFromDevHealth(macAddress) {
     const user = getStateItem(DB_KEY.USER)
     let res = await getLastDataForDevHealthFor(macAddress,user.userId)
     console.log("getDataFromDevHealth: res : "+res.status)
    if (res.status === 200){
      let response = await res.json()
      console.log("getDataFromDevHealth: response : "+JSON.stringify(response))
      if (response.content !== undefined && response.content !== null && response.content.length > 0){
        const lastObject = response.content[0]
        
        let currentVersionStr = lastObject.data.Fwvers ? lastObject.data.Fwvers.value : 'NA'
        let currentHardwareVersion = lastObject.data.Hwvers ? lastObject.data.Hwvers.value : ''
        let rssValue = lastObject.data.WifiRss ? lastObject.data.WifiRss.value : 'NA'
  
        this.setState({currentHardwareVersion:currentVersionStr,rssValue: rssValue})
    }
    }

  }

  async fetchAlert() {
    let totalAlert = await this.checkForTheAlertCount();
   
    var TOTAL_UNREAD_ALERT = getStateItem(DB_KEY.TOTAL_UNREAD_ALERT)
    TOTAL_UNREAD_ALERT += totalAlert
    this.setState({totalAlert: totalAlert})
    setStateItem(DB_KEY.TOTAL_UNREAD_ALERT, TOTAL_UNREAD_ALERT)
     AlertsNumberChanged.emit('ALERTS__NUMBER_CHANGED')
  }

  eventAppInBackground = () => {
  
  };

  eventAppInForeground = () => {};

  componentWillUnmount() {
    // AppInBackground.removeAppInBackgroundListener(this.eventAppInBackground)
    // AppInForeground.removeAppInForegroundListener(this.eventAppInForeground)
    // ResidentsChange.removeResidentsChangeListener(this.eventResidentsChange)
    clearTimeout(this.timeout);
    
  }

  

  _renderProfileImage(sensorColor) {
    const {data, isDarkMode, isAlert, onPress, ...props} = this.props;
    const {isOnline, manipulatedData} = this.state;
    let isGalen = getStateItem(DB_KEY.GALEN);
    let name = isGalen ? (data.owner ? data.owner.fullName : '') : data.name;
    const friendlyName = data.data
      ? data.data.FriendlyName
        ? data.data.FriendlyName.value
        : ''
      : '';

    let firstLetter = friendlyName.substring(0, 1).toUpperCase();
    const lastSyncedAt = data.lastSyncedAt;
    const difference = (new Date() - lastSyncedAt) / 1000;
    let isEXIST = data.alertData ? true : false;

    let message = 'Last synced -- sec ago';

    let color = 'rgba(139,203,46,1.0)';

    if (isEXIST) {
      color = 'rgba(154,0,0,1.0)';
    }

    if (manipulatedData !== null) {
      message =
        'Device last synced ' + manipulatedData.syncedBefore + ' seconds ago';
    }

    const localDbUser = getStateItem(DB_KEY.LOCAL_DB_USER);
    let profileImagePath;
    if (
      localDbUser !== null &&
      localDbUser !== undefined &&
      localDbUser.residents !== undefined &&
      localDbUser.residents !== null &&
      localDbUser.residents.length > 0
    ) {
      for (var index = 0; index < localDbUser.residents.length; index++) {
        const residents = localDbUser.residents[index];
        let uniqueId = getStateItem(DB_KEY.GALEN) ? data.ownerId : data.devid;
        if (residents.devId === uniqueId) {
          profileImagePath = residents.profileImage;
          break;
        }
      }
    }

    if (profileImagePath !== undefined && profileImagePath !== null) {
      return (
        <View>
          <Image
            source={{uri: profileImagePath}}
            style={{
              width: styles.circle.width,
              height: styles.circle.height,
              borderRadius: styles.circle.borderRadius,
            }}
          />
          <Icon
            name={'circle'}
            size={height * 0.02}
            color={sensorColor}
            style={{
              position: 'absolute',
              top: height * 0.055,
              left: width * 0.062,
            }}
          />
        </View>
      );
    } else {
      return (
        <View>
          <Text allowFontScaling={false} style={styles.firstText}>
            {firstLetter}
          </Text>
        </View>
      );
    }
  }

  _renderBars() {
    const {data, panResponder, style, ...props} = this.props;
    const {totalAlert} = this.state
    let isAlert = false;
  
    return (
      <View {...panResponder.panHandlers} style={styles.imgContainer}>
        <Icon
          name={'bars'}
          size={height * 0.03}
          color={'rgba(214, 214, 214,1.0)'}
        />
      </View>
    );
    //    if (totalAlert !== 0){
    //     return (<View />)

    //    }else{
    //     return (
    //         <View {...panResponder.panHandlers} style={styles.imgContainer}>
    //         <Icon name={'bars'} size={height*0.03} color={'rgba(214, 214, 214,1.0)'} />
    //        </View>
    //        )
    //    }
  }

  _renderAlertCount() {
    const {onPressAlerts} = this.props;
    const numberOfAlerts = 1000;
    let number = numberOfAlerts > 999 ? '999+' : numberOfAlerts;
    if (numberOfAlerts > 0 && numberOfAlerts < 1000) {
      return (
        <TouchableOpacity
          style={{
            width: 30,
            height: 30,
            borderRadius: 15,
            backgroundColor: 'rgba(164,6,12,1.0)',
            right: 15,
            justifyContent: 'center',
            alignItems: 'center',
            position: 'absolute',
          }}
          onPress={onPressAlerts}>
          <Text
            allowFontScaling={false}
            style={{
              color: 'rgba(243,243,243,1.0)',
              fontSize: 12,
              fontWeight: 'bold',
            }}>
            {number}
          </Text>
        </TouchableOpacity>
      );
    } else if (numberOfAlerts > 0 && numberOfAlerts > 1000) {
      return (
        <TouchableOpacity
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: 'rgba(164,6,12,1.0)',
            right: 18,
            justifyContent: 'center',
            alignItems: 'center',
            position: 'absolute',
          }}
          onPress={onPressAlerts}>
          <Text
            allowFontScaling={false}
            style={{
              color: 'rgba(243,243,243,1.0)',
              fontSize: 12,
              fontWeight: 'bold',
            }}>
            {number}
          </Text>
        </TouchableOpacity>
      );
    } else {
      return <View />;
    }
  }

  navToAlerts(macAddress) {
    let nav = getStateItem(DB_KEY.LOGIN_NAV);
    nav.navigate('AlertsScreen', {devId: macAddress});
  }

  async checkForTheAlertCount() {
    const {data, ...props} = this.props;
    let macAddress = data.data.Devid.value;
    let friendlyName = data.data.FriendlyName.value;
    let res = await fetchLastUnreadAlertCount(macAddress)
    if (res.status === 200) {
      let resJson  = await res.json()
      let array = resJson.content
      let totalElements = resJson.totalElements !== undefined ? resJson.totalElements : 0
      if (totalElements > 999 && totalElements !== 0) {
        return '999+';
      } else if (totalElements !== 0 && totalElements < 1000) {
        return totalElements;
      }

    }


    return 0










    // console.log("checkForTheAlertCount: macAddress : "+macAddress+ "friendlyName : "+friendlyName)

    // let alertsCountArray = getStateItem(DB_KEY.ALERTS_COUNT_ARRAY);

    // console.log("checkForTheAlertCount: alertsCountArray : "+JSON.stringify(alertsCountArray))


    // if (
    //   alertsCountArray !== undefined &&
    //   alertsCountArray !== null &&
    //   alertsCountArray.length > 0
    // ) {
    //   let filtered = alertsCountArray.filter(
    //     content => content.macAddress === macAddress,
    //   );

    //   console.log("checkForTheAlertCount: filtered : "+JSON.stringify(filtered))
    //   if (filtered.length > 0) {
    //     let totalElements = filtered[0].totalElements;

    //     if (totalElements > 999 && totalElements !== 0) {
    //       console.log("checkForTheAlertCount: 999+ : ")
    //       return '999+';
    //     } else if (totalElements !== 0 && totalElements < 1000) {
    //       console.log("checkForTheAlertCount: "+totalElements)
    //       return totalElements;
    //     }
    //   } else {
    //     console.log("checkForTheAlertCount: 0-")
    //     return 0;
    //   }
    // } else {
    //   console.log("checkForTheAlertCount: 0---")
    //   return 0;
    // }
  }

  renderDot(isOffline) {
    if (isOffline) {
      return (
        <View>
          <Image
            source={require('../../../img/redCircle.gif')}
            style={{
              width: height * 0.026,
              height: height * 0.026,
              resizeMode: 'contain',
              marginTop: -height * 0.007,
              marginLeft: -width * 0.016,
            }}
          />
        </View>
      );
    } else {
      return (
        <View>
          <Icon name={'circle'} size={height * 0.014} color={'green'} />
        </View>
      );
    }
  }

  _renderData(HRToDisplay, RRToDisplay, StressToDisplay, MotionToDisplay, sensorOffline, sensorOccupied) {
    const {
      data,
      isDarkMode,
      onPress,
      panResponder,
      draggingIdx,
      style,
      sVitalArray,
      ...props
    } = this.props;

    const {showData} = this.state;
    let user = getStateItem(DB_KEY.USER);
    let userRole = user?.currentRole ? user?.currentRole?.role : '';
    var isAdmin = false;
    if (userRole === 'TenantAdmin') {
      isAdmin = true;
    }
    

        let isFDAView = getStateItem(DB_KEY.STATS_THEME) === "H-R View"
    if (sensorOffline === true && showData === true) {
      return (
        <View
                style={{
                  width: width * 0.6,
                  height: 22,
                  flexDirection: 'row',
                  marginTop: isAdmin ? height * 0.008 : height * 0.014,
                  justifyContent : 'center'
                }}>
                 <View
                style={{
                  width: 160,
                  height: 36,
                  backgroundColor: 'red',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 8
                }}>
                  <Text allowFontScaling={false} style={{color:'white', fontWeight: 'bold', fontSize: 16}}>DEVICE  OFFLINE</Text>
                </View>
                  
                </View>
      )
    } 
    else if (sensorOccupied === false && showData === true) {
      return (
        <View
                style={{
                  width: width * 0.6,
                  height: 22,
                  flexDirection: 'row',
                  marginTop: isAdmin ? height * 0.008 : height * 0.014,
                   justifyContent : 'center'
                }}>
                 <View
                style={{
                  width: 140,
                  height: 36,
                  backgroundColor: 'rgba(63,112,202,1.0)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 8
                }}>
                  <Text allowFontScaling={false} style={{color:'white', fontWeight: 'bold', fontSize: 16}}>ROOM  EMPTY</Text>
                </View>
                  
                </View>
      )
    }  
    else  {
    return (  
<View
                style={{
                  width: width * 0.6,
                  height: 22,
                  flexDirection: 'row',
                  marginTop: isAdmin ? height * 0.008 : height * 0.014,
                  marginLeft: isFDAView ? width* 0.15 : 0,
                }}>
                <View
                  style={{
                    width: width * 0.15,
                    height: 30,
                    flexDirection: 'row',
                  }}>
                  <Image
                    source={require('../../../img/heart.png')}
                    style={{width: 20, height: 18, marginTop: -5}}
                  />
                  <Text
                    allowFontScaling={false}
                    style={[
                      styles.nameText,
                      {
                        color: isDarkMode ? 'white' : 'rgba(70,70,70,1.0)',
                        fontSize: isAdmin ? 22: 28,
                        marginLeft: height * 0.005,
                        fontWeight: 'bold'
                      },
                    ]}>
                    {HRToDisplay}
                  </Text>
                </View>

                <View
                  style={{
                    width: width * 0.15,
                    height: 30,
                    flexDirection: 'row',
                  }}>
                  <Image
                    source={require('../../../img/respiratory.png')}
                    style={{
                      width: 20.5,
                      height: 15.5,
                      marginLeft: height * 0.01,
                      marginTop: -5,
                    }}
                  />
                  <Text
                    allowFontScaling={false}
                    style={[
                      styles.nameText,
                      {
                        color: isDarkMode ? 'white' : 'rgba(70,70,70,1.0)',
                        fontSize: isAdmin ? 22:  28,
                        marginLeft: height * 0.005,
                        fontWeight: 'bold'
                      },
                    ]}>
                    {RRToDisplay}
                  </Text>
                </View>

                {!isFDAView && <View
                  style={{
                    width: width * 0.15,
                    height: 30,
                    flexDirection: 'row',
                  }}>
                  <Image
                    source={require('../../../img/stress.png')}
                    style={{width: 20, height: 24.5, marginLeft: height * 0.02, marginTop: -5}}
                  />
                  <Text
                    allowFontScaling={false}
                    style={[
                      styles.nameText,
                      {
                        color: isDarkMode ? 'white' : 'rgba(70,70,70,1.0)',
                        fontSize: isAdmin ? 22:  26,
                        marginLeft: height * 0.005
                      },
                    ]}>
                    {StressToDisplay}
                  </Text>
                </View>}
                {!isFDAView && <View
                  style={{
                    width: width * 0.15,
                    height: 30,
                    flexDirection: 'row',
                  }}>
                  <Image
                    source={require('../../../img/motion.png')}
                    style={{width: 10, height: 20, marginLeft: height * 0.01, marginTop: -5}}
                  />
                  <Text
                    allowFontScaling={false}
                    style={[
                      styles.nameText,
                      {
                        color: isDarkMode ? 'white' : 'rgba(70,70,70,1.0)',
                        fontSize: isAdmin ? 22:  26,
                        marginLeft: height * 0.005
                      },
                    ]}>
                    {MotionToDisplay}
                  </Text>
                </View>}
              </View>
    )
  }
  }

  render() {
    const {
      data,
      isDarkMode,
      onPress,
      panResponder,
      draggingIdx,
      style,
      sVitalArray,
      ...props
    } = this.props;
    const {isOnline, manipulatedData, totalAlert} = this.state;
    let isGalen = getStateItem(DB_KEY.GALEN);
    let name = isGalen ? (data.owner ? data.owner.fullName : '') : data.name;
    const friendlyName = data.data
      ? data.data.FriendlyName
        ? data.data.FriendlyName.value
        : ''
      : '';
    const devid = data.data
      ? data.data.Devid
        ? data.data.Devid.value
        : ''
      : '';
    const locationName = data.data
      ? data.data.Location
        ? data.data.Location.value
        : ''
      : '';
    const showLocation = locationName === '' ? '' : '(' + locationName + ')';
    let firstLetter = friendlyName.substring(0, 1);
    const lastSyncedAt = data.lastSyncedAt;
    const difference = (new Date() - lastSyncedAt) / 1000;
    var isActive = 'Yes';
    console.log("In Render totalAlert: "+data)

    let user = getStateItem(DB_KEY.USER);
    // check if supplierId not Genral wellness and role is Admin the show or supplierId is Genral wellness and role is Pateint the show or
    let userRole = user?.currentRole ? user?.currentRole?.role : '';
    var isAdmin = false;
    if (userRole === 'TenantAdmin') {
      isAdmin = true;
    }

    var sensorOffline = true;
    var apnea = '--';

    var isOccupied = false;
    var occupiedStr = '';
    var occupiedColor = 'orange';

    if (sVitalArray !== undefined && sVitalArray !== null) {
      let filtered = sVitalArray.filter(
        data => data.data.DevidSvital.value === devid,
      );

      if (filtered.length > 0) {
        let firstData = filtered[0];

        if (firstData.data !== undefined && firstData.data !== null) {
          if (
            firstData.data.Apneaperminute !== undefined &&
            firstData.data.Apneaperminute !== null
          ) {
           
            apnea = firstData.data.Apneaperminute.value;
          }
        }
      }
    }

    let completeStr;
    if (friendlyName.length > 0 && locationName.length > 0) {
      completeStr = friendlyName.trim() + ' | ' + locationName.trim();
    } else if (friendlyName.length > 0) {
      completeStr = friendlyName.trim();
    } else if (locationName.length > 0) {
      completeStr = locationName.trim();
    } else {
      completeStr = '';
    }

    let message = 'Last synced -- sec ago';

    let color = 'rgba(139,203,46,1.0)';
    let hr = '--';
    let rr = '--';
    let stress = '--';
    let temp = '--';

    if (manipulatedData !== null && isGalen === false) {
      message = manipulatedData.syncedBefore ;
      if (
        manipulatedData.deviceData !== null &&
        manipulatedData.deviceData !== undefined
      ) {
        hr =
          parseInt(manipulatedData.deviceData.hr) == 0
            ? '--'
            : parseInt(manipulatedData.deviceData.hr);
        rr =
          parseInt(manipulatedData.deviceData.rr) == 0
            ? '--'
            : parseInt(manipulatedData.deviceData.rr);
        stress =
          parseInt(manipulatedData.deviceData.lfhf) == 0
            ? '--'
            : parseInt(manipulatedData.deviceData.lfhf);
        temp =
          parseInt(manipulatedData.deviceData.mot) == 0
            ? '--'
            : parseInt(manipulatedData.deviceData.mot);
      }
    } else {
      if (getStateItem(DB_KEY.GALEN)) {
        hr = '--';
        if (data !== null && data !== undefined) {
          if (data.data !== null && data.data !== undefined) {
            hr = data?.data?.Hr ? data?.data?.Hr : '--';
          }
        }

        rr = '--';
        if (data !== null && data !== undefined) {
          if (data.data !== null && data.data !== undefined) {
            rr = data?.data?.Rr ? data?.data?.Rr  : '--';
          }
        }

        stress = '--';
        if (data !== null && data !== undefined) {
          if (data.data !== null && data.data !== undefined) {
            console.log()
          //  stress = data?.data?.Stress ? data?.data?.Stress >= 10 ? Math.round( data?.data?.Stress) :  data?.data?.Stress.toFixed(1) : '--';
             stress = data?.data?.Stress ? data?.data?.Stress : '--';
          }
        }

        temp = '--';
        if (data !== null && data !== undefined) {
          if (data.data !== null && data.data !== undefined) {
            temp = data?.data?.Motion ? data?.data?.Motion  : '--';
          }
        }

        if (
          data !== null &&
          data !== undefined &&
          data.data.Active !== undefined &&
          data.data.Active !== null
        ) {
          isActive = data.data.Active.value;
        }

        console.log('ResidentsRow  : sensorOffline' + sensorOffline);
        console.log('ResidentsRow  : friendlyName' + friendlyName);
        console.log('ResidentsRow  : data' + JSON.stringify(data.data));
        console.log('ResidentsRow  : Online' + data?.data?.Online?.value);

        if (data !== undefined && data !== null) {
          if (data.data !== null && data.data !== undefined) {
            let Online = data?.data?.Online ? data?.data?.Online  : null;
            if (Online !== undefined && Online !== null) {
              sensorOffline = Online == 0 ? true : false
            }

            let Occupied = data?.data?.Occupied ? data?.data?.Occupied: null;
            if (Occupied !== undefined && Occupied !== null) {
              isOccupied = Occupied === 1 ? true : false;
            }
          }
        }

        //Occupied

        occupiedStr = isOccupied ? 'Occupied' : 'Unoccupied';
        occupiedColor = isOccupied ? 'green' : 'red';
       
        if (data !== null && data !== undefined) {
          if (data !== null && data !== undefined) {
            var cloudDate = data?.data?.Timestamp
              ? data?.data?.Timestamp
              : '--';
            var date = moment.utc(cloudDate).format('YYYY-MM-DD HH:mm:ss');

            var stillUtc = moment.utc(date).toDate();
            var local = moment(stillUtc).local().format('hh:mm:ss A');

            message = local;
          }
        }
      }
    }

    // let color = 'rgba(139,203,46,1.0)'
    // if (!isOnline){
    //     color = 'rgba(154,0,0,1.0)'
    //     message = 'Device seems to be offline'
    // }
    var isEXIST = false;
    let isAlert = this.state.alertCount !== 0;

    if (data.data !== null && data.data !== undefined) {
     let online =  data?.data?.Online ? data?.data?.Online  : null;
      if (online !== null) {
        isEXIST = online === 1 ? false : true;
      }
    }

   

    let backgroundColor;
    let shadowColor;
    
      backgroundColor = isDarkMode ? 'rgba(37,40,44,1.0)' : '#FFF';
      shadowColor = isDarkMode ? '#000' : 'rgba(124,124,124,1.0)';
    

    let HRToDisplay = hr !== '--' && hr !== 0 ? Math.round(hr) : '--';
    let RRToDisplay = rr !== '--' && rr !== 0 ? Math.round(rr) : '--';

    let StressToDisplay =
      stress !== '--' && stress !== 0 ? Math.round(stress) : '--';

    let MotionToDisplay = temp !== '--' && temp !== 0 ? Math.round(temp) : '--';

    let sensorColor = sensorOffline === false ? 'green' : 'red';
    let sensorLabel = sensorOffline === false ? 'Online' : 'Offline';

    const macAddress = data.data.Devid.value;
    var nameToShow = isAdmin ? name : '';
    let isFDAView = getStateItem(DB_KEY.STATS_THEME) === "H-R View"

    if (sensorOffline === true) {
      const loginTime = getStateItem(DB_KEY.LOGIN_TIME);
      var date = moment.utc(loginTime).format('YYYY-MM-DD HH:mm:ss');

      var stillUtc = moment.utc(date).toDate();
      var local = moment(stillUtc).local().format('hh:mm:ss A');
      message = local;
    }

    let hwDetail = 'Ver: '+ this.state.currentHardwareVersion + ' | WIFI: '+ this.state.rssValue + ' | '+ message

    
    
    


    return (
      <TouchableOpacity style={[style, styles.container]} onPress={onPress}>
        <View
          style={[
            style,
            styles.subContainer,
            {
              backgroundColor: backgroundColor,
              shadowColor: totalAlert !== 0 ? 'red' : shadowColor,
              borderColor: totalAlert !== 0 ? 'red' : 'transparent',
            },
          ]}>
          <View style={styles.rowContainer}>
            
            <MaterialIcons style={{position: 'absolute', marginLeft: 10, marginTop: height*0.012}}name={ sensorOffline === true ?  'wifi-off' : 'wifi' } size={25} color={ isDarkMode ? 'floralwhite' : 'black'}></MaterialIcons>


            <View
              style={[
                styles.circle,
                {
                  shadowColor: sensorOffline ? 'red' : 'green',
                  shadowOffset: {
                    width: 0,
                    height: sensorOffline ? 5 : 1,
                  },
                },
              ]}>
              {this._renderProfileImage(sensorColor)}
            </View>
            {totalAlert !== 0 && !isFDAView && (
              <TouchableOpacity
                style={{
                  width: 80,
                  height: 80,
                  position: 'absolute',
                  marginLeft: width - 100,
                  alignItems: 'center',
                }}
                onPress={() => this.navToAlerts(macAddress)}>
                <View
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 13,
                    backgroundColor: 'rgba(164,6,12,1.0)',
                    marginLeft: 16,
                    marginTop: 6,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Text
                    allowFontScaling={false}
                    style={{
                      color: 'rgba(243,243,243,1.0)',
                      fontSize: 8,
                      fontWeight: 'bold',
                    }}>
                    {totalAlert}
                  </Text>
                </View>
                <Icon2
                  name={'bell'}
                  size={20}
                  color={'rgba(164,6,12,1.0)'}
                  style={{top: -7}}
                />
              </TouchableOpacity>
            )}
            <View style={styles.nameContainer}>
              <View style={styles.rowContainer}>
                <Text
                  allowFontScaling={false}
                  style={[
                    styles.nameText,
                    {
                      color: isDarkMode ? 'white' : 'rgba(70,70,70,1.0)',
                      fontWeight: 'bold',
                    },
                  ]}>
                  {friendlyName}
                </Text>
                {locationName.length > 0 && (
                  <Text
                    allowFontScaling={false}
                    style={[
                      styles.nameText,
                      {
                        color: isDarkMode ? 'white' : 'rgba(138,138,138,1.0)',
                        fontSize: height * 0.016,
                        marginTop: height * 0.005,
                      },
                    ]}>
                    {' '}
                    ({locationName})
                  </Text>
                )}
              </View>

              {isAdmin && (
                <Text
                  allowFontScaling={false}
                  style={[
                    styles.nameText,
                    {
                      color: isDarkMode
                        ? 'floralwhite'
                        : 'rgba(138,138,138,1.0)',
                      fontSize: height * 0.016,
                      marginTop: 2,
                    },
                  ]}>
                  {nameToShow}
                </Text>
              )}
          

              {this._renderData(HRToDisplay, RRToDisplay, StressToDisplay, MotionToDisplay, sensorOffline, isOccupied)}


              
              <View style={{flexDirection: 'row', justifyContent: 'flex-end', marginTop: height * 0.03}}>
                <Text
                  allowFontScaling={false}
                  style={[
                    styles.descriptionText,
                    {
                      color: isDarkMode
                        ? 'floralwhite'
                        : 'rgba(138,138,138,1.0)',
                      marginTop: 2,
                      width: null,
                      fontSize: isAdmin ? height * 0.012 : height * 0.015,
                    },
                  ]}>
                  {hwDetail}
                </Text>
                {isAdmin && (
                  <Text
                    allowFontScaling={false}
                    style={[
                      styles.descriptionText,
                      {
                        color: isDarkMode
                          ? 'floralwhite'
                          : 'rgba(138,138,138,1.0)',
                        width: null,
                        marginLeft: 8,
                      },
                    ]}>
                    Apnea : {apnea}
                  </Text>
                )}
              </View>
            </View>
          </View>
          {this._renderBars()}

          {checkGenericNoType(isActive) && (
            <View
              style={[
                style,
                styles.subContainer,
                {
                  position: 'absolute',
                  backgroundColor: 'rgba(114,114,114,0.3)',
                  marginLeft: 0,
                },
              ]}>
              <Text
                allowFontScaling={false}
                style={{
                  color: 'floralwhite',
                  marginTop: 5,
                  fontWeight: 'bold',
                  width: styles.subContainer.width - 20,
                  textAlign: 'right',
                }}>
                In Active{' '}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }
}
