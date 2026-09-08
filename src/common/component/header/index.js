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
import getStateItem from '../../../state/getStateItem';
import {DB_KEY} from '../../../common/helper/keys';
import moment from 'moment';
import Icon from 'react-native-vector-icons/Feather';
import {LastSyncChanged, AlertsNumberChanged} from '../../../state/emitters';
import {getUnreadAlertCount} from '../../helper/validate';
import Icon3 from 'react-native-vector-icons/FontAwesome';
import { getEndPoint } from '../../../../galenApiLibrary/config/getBaseURL';

const {width, height} = Dimensions.get('window');

export default class Header extends Component {
  constructor(props) {
    super(props);
    this.eventLastSyncChanged = this.eventLastSyncChanged.bind(this);
    this.eventAlertsNumberChanged = this.eventAlertsNumberChanged.bind(this);

    this.state = {
      lastSyncTime: getStateItem(DB_KEY.LAST_SYNCED),
      alertCount: getStateItem(DB_KEY.NUMBER_OF_ALERTS),
      alertArrayCount: getStateItem(DB_KEY.ALERTS_ARRAY).length,
      isOnline: true,
    };
  }

  componentDidMount() {
    LastSyncChanged.addLastSyncChangedListener(this.eventLastSyncChanged);
    AlertsNumberChanged.addAlertsNumberChangedListener(
      this.eventAlertsNumberChanged,
    );

    const alert = getUnreadAlertCount();
    this.setState({alertCount: alert});
  }

  // `

  componentWillUnmount() {
    LastSyncChanged.removeLastSyncChangedListener(this.eventLastSyncChanged);
    AlertsNumberChanged.removeAlertsNumberChangedListener(
      this.eventAlertsNumberChanged,
    );
  }

  eventLastSyncChanged() {
    this.setState({lastSyncTime: getStateItem(DB_KEY.LAST_SYNCED)});
  }

  eventAlertsNumberChanged() {
    const alert = getUnreadAlertCount();
    this.setState({alertCount: alert});
  }

  getTheAlertCount() {
    const alertCount = getStateItem(DB_KEY.TOTAL_UNREAD_ALERT);

    return alertCount;
  }

  _renderAlertCount() {
    const numberOfAlerts = this.state.alertCount;
    let number = numberOfAlerts > 999 ? '999+' : numberOfAlerts;
   

    if (numberOfAlerts > 0 && numberOfAlerts < 1000) {
      return (
        <View
          style={{
            width: 30,
            height: 30,
            borderRadius: 15,
            backgroundColor: 'rgba(164,6,12,1.0)',
            position: 'absolute',
            right: 15,
            top: height * 0.046,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text
            allowFontScaling={false}
            style={{
              color: 'rgba(243,243,243,1.0)',
              fontSize: 12,
              fontWeight: 'bold',
            }}>
            {number}
          </Text>
        </View>
      );
    } else if (numberOfAlerts > 0 && numberOfAlerts > 1000) {
      return (
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: 'rgba(164,6,12,1.0)',
            position: 'absolute',
            right: 18,
            top: height * 0.044,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text
            allowFontScaling={false}
            style={{
              color: 'rgba(243,243,243,1.0)',
              fontSize: 12,
              fontWeight: 'bold',
            }}>
            {number}
          </Text>
        </View>
      );
    } else {
      return <View />;
    }
  }
  _renderProfileImage() {
    const {
      style,
      isForSetting,
      isForStats,
      isForResidents,
      isDarkMode,
      onPress,
      residentData,
      ...props
    } = this.props;
    let name = '';
    if (getStateItem(DB_KEY.GALEN)) {
      if (
        residentData !== undefined &&
        residentData !== null &&
        residentData.owner !== undefined &&
        residentData.owner !== null &&
        residentData.owner.fullName !== undefined &&
        residentData.owner.fullName !== null
      ) {
        name = residentData.owner.fullName;
      } else {
        name = '';
      }
    } else {
      name = residentData.name;
    }
    let firstLetter = name.substring(0, 1);
    const localDbUser = getStateItem(DB_KEY.LOCAL_DB_USER);

    let profileImagePath;
    if (
      localDbUser !== null &&
      localDbUser !== undefined &&
      localDbUser.residents !== undefined &&
      localDbUser.residents !== null &&
      localDbUser.residents.length > 0
    ) {
      for (index = 0; index < localDbUser.residents.length; index++) {
        const residents = localDbUser.residents[index];
        let uniqueId = getStateItem(DB_KEY.GALEN)
          ? residentData.userId
          : residentData.devid;
        if (residents.devId === uniqueId) {
          profileImagePath = residents.profileImage;
          break;
        }
      }
    }

    if (profileImagePath !== undefined && profileImagePath !== null) {
      return (
        <View
          style={[
            styles.circle,
            {
              backgroundColor: isDarkMode ? 'rgba(37,40,44,1.0)' : '#FFF',
              shadowColor: isDarkMode ? '#000' : 'rgba(124,124,124,1.0)',
            },
          ]}>
          <Image
            source={{uri: profileImagePath}}
            style={{
              width: styles.circle.width,
              height: styles.circle.height,
              borderRadius: styles.circle.borderRadius,
            }}
          />
        </View>
      );
    } else {
      return (
        <View
          style={[
            styles.circle,
            {
              backgroundColor: isDarkMode ? 'rgba(37,40,44,1.0)' : '#FFF',
              shadowColor: isDarkMode ? '#000' : 'rgba(124,124,124,1.0)',
            },
          ]}>
          <Text allowFontScaling={false} style={styles.firstText}>
            {firstLetter}
          </Text>
        </View>
      );
    }
  }

  _renderForStats() {
    const {
      style,
      isForSetting,
      isForStats,
      isForResidents,
      isDarkMode,
      onPress,
      isResidentTapped,
      residentData,
      bellIconTapped,
      isOffline,
      isOccupied,
      ...props
    } = this.props;
    let name;
    let firstLetter;
    const localDbUser = getStateItem(DB_KEY.LOCAL_DB_USER);
    const time = this.state.lastSyncTime;
    //  let timeTo = momet.utc(time).format('DD MMM YY HH:mm:ss')

    var date = moment.utc(time).format('YYYY-MM-DD HH:mm:ss');
    let color = isOffline === false ? 'green' : 'red';
    let status = isOffline === false ? 'Online' : 'Offline';

    var stillUtc = moment.utc(date).toDate();
    var local = moment(stillUtc).local().format('DD MMMM YYYY hh:mm:ss A');

    let occupiedStr = isOccupied ? 'Occupied' : 'Unoccupied';
    let occupiedColor = isOccupied ? 'green' : 'red';
    let user = getStateItem(DB_KEY.USER)
    let userRole = user?.currentRole ? user?.currentRole?.role : '';
    let isSupplierAdmin =  userRole === 'SupplierAdmin'
 
    let companyName = isSupplierAdmin ? user?.currentRole?.supplier?.name :''
    var friendlyName = ''; //residentData.data? residentData.data.FriendlyName?residentData.data.FriendlyName.value: "" :""
    if (residentData !== null && residentData !== undefined) {
      if (getStateItem(DB_KEY.GALEN)) {
        if (
          residentData !== undefined &&
          residentData !== null &&
          residentData.owner !== undefined &&
          residentData.owner !== null &&
          residentData.owner.fullName !== undefined &&
          residentData.owner.fullName !== null
        ) {
          name = residentData.owner.fullName;
          friendlyName = residentData.data
            ? residentData.data.FriendlyName
              ? residentData.data.FriendlyName.value
              : ''
            : '';
        } else {
          name = '';
        }
      } else {
        name = residentData.name;
        
      }
      firstLetter = name.substring(0, 1);
    }
    let isFDAView = getStateItem(DB_KEY.STATS_THEME) === "H-R View"
    
    

    if (isResidentTapped) {
      return (
        <View>
          <View style={{flexDirection: 'row'}}>
            {this._renderProfileImage()}
            <View style={{flexDirection: 'column'}}>
              <View style={{flexDirection: 'row', width: width * 0.68}}>
                <Text
                  allowFontScaling={false}
                  style={[
                    styles.welcomeText,
                    {
                      color: style.textColor,
                      marginTop: height * 0.055,
                      marginLeft: -width * 0.02,
                    },
                  ]}>
                  {name}
                </Text>
              </View>

              <View style={{flexDirection: 'row'}}>
                <TouchableOpacity
                  style={{flexDirection: 'row'}}
                  onPress={onPress}>
                  <Image
                    source={require('../../../img/photo.png')}
                    style={{
                      width: width * 0.1,
                      height: width * 0.05,
                      marginLeft: -width * 0.01,
                    }}
                    resizeMode={'cover'}
                  />
                  <Text
                    allowFontScaling={false}
                    style={[
                      styles.userText,
                      {textDecorationLine: 'underline', left: -5},
                    ]}>
                    Upload Image
                  </Text>
                </TouchableOpacity>
                <Icon3
                  name={'circle'}
                  size={13}
                  style={{marginLeft: 10}}
                  color={color}
                />
                <Text
                  allowFontScaling={false}
                  style={[styles.userText, {left: 5}]}>
                  {status}
                </Text>

                <Icon3
                  name={'circle'}
                  size={13}
                  style={{marginLeft: 13}}
                  color={occupiedColor}
                />
                <Text
                  allowFontScaling={false}
                  style={[styles.userText, {left: 5}]}>
                  {occupiedStr}
                </Text>
              </View>
            </View>
          </View>
          {!isFDAView && <TouchableOpacity
            style={{
              height: height * 0.15,
              width: width * 0.2,
              left: width * 0.8,
              position: 'absolute',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={bellIconTapped}>
            <Icon
              name={'bell'}
              size={25}
              color={'rgba(164,6,12,1.0)'}
              style={{top: height * 0.014}}
            />
            {this._renderAlertCount()}
          </TouchableOpacity>}
        </View>
      );
    } else {
      return (
        <View>
          <Text
            allowFontScaling={false}
            style={[styles.welcomeText, {color: style.textColor}]}>
            Stats
          </Text>
          <Text
                  allowFontScaling={false}
                  style={[styles.userText, {left: width * 0.05}]}>
                  {companyName}
                </Text>
          <Text allowFontScaling={false} style={styles.userText}>
            {local}
          </Text>
          {!isFDAView && <TouchableOpacity
            style={{
              height: height * 0.15,
              width: width * 0.2,
              left: width * 0.8,
              position: 'absolute',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={bellIconTapped}>
            <Icon
              name={'bell'}
              size={25}
              color={'rgba(164,6,12,1.0)'}
              style={{top: height * 0.014}}
            />
            {this._renderAlertCount()}
          </TouchableOpacity>}
        </View>
      );
    }
  }

  _renderHeader() {
    const {
      style,
      isForSetting,
      isForStats,
      isForResidents,
      isForReports,
      isDarkMode,
      onPress,
      isResidentTapped,
      bellIconTapped,
      ...props
    } = this.props;
    // const name = getStateItem(DB_KEY.GALEN)===true?getStateItem(DB_KEY.USER).fullName:getStateItem(DB_KEY.USER).username

    let name = '';
    let email = '';
    let user = getStateItem(DB_KEY.USER)
    let userRole = user?.currentRole ? user?.currentRole?.role : '';
    let isSupplierAdmin =  userRole === 'SupplierAdmin'
    
    if (getStateItem(DB_KEY.GALEN)) {
      if (
        getStateItem(DB_KEY.USER) !== undefined &&
        getStateItem(DB_KEY.USER) !== null &&
        getStateItem(DB_KEY.USER).fullName !== undefined &&
        getStateItem(DB_KEY.USER).fullName !== null
      ) {
        name = isSupplierAdmin ? user.currentRole?.supplier?.name : getStateItem(DB_KEY.USER).fullName;
        email = getStateItem(DB_KEY.USER).emailAddress;
      } else {
        name = '';
      }
    } else {
      name = getStateItem(DB_KEY.USER).username;
    }

    const localDbUser = getStateItem(DB_KEY.LOCAL_DB_USER);
    let firstLetter = name.substring(0, 1);

    const deviceInfoLength = getStateItem(DB_KEY.TOTAL_ARRAY_COUNT);
    let alertCount = getStateItem(DB_KEY.ALERTS_ARRAY).length;
    let sowingOf = deviceInfoLength - alertCount;

    const time = this.state.lastSyncTime;
    //  let timeTo = momet.utc(time).format('DD MMM YY HH:mm:ss')

    var date = moment.utc(time).format('YYYY-MM-DD HH:mm:ss');

    var stillUtc = moment.utc(date).toDate();
    var local = moment(stillUtc).local().format('DD MMMM YYYY hh:mm:ss A');
    let nnnn = name //getStateItem(DB_KEY.USER)?.fullName ;
    //Active {sowingOf} of {deviceInfoLength}
    let isFDAView = getStateItem(DB_KEY.STATS_THEME) === "H-R View"

    let texter = getEndPoint() === "GALEN" ? "GALEN Cloud" : "Cardio Cloud"
    

    if (isForSetting) {
      return (
        <View>
          <Text
            allowFontScaling={false}
            style={[
              styles.welcomeText,
              {color: style.textColor, marginTop: height * 0.04},
            ]}>
            Settings
          </Text>
          <Text allowFontScaling={false} style={styles.userText}>
            Logged in as: {name} ({email})
          </Text>
          <Text allowFontScaling={false} style={styles.userText}>
            Last updated at {local}
          </Text>
         {!isFDAView && <TouchableOpacity
            style={{
              height: height * 0.15,
              width: width * 0.2,
              left: width * 0.8,
              position: 'absolute',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={bellIconTapped}>
            <Icon
              name={'bell'}
              size={25}
              color={'rgba(164,6,12,1.0)'}
              style={{top: height * 0.014}}
            />
            {this._renderAlertCount()}
            
          </TouchableOpacity>}
        </View>
      );
    } else if (isForStats) {
      return <View>{this._renderForStats()}</View>;
    } else if (isForReports) {
      return (
        <View>
        <Text
          allowFontScaling={false}
          style={[
            styles.welcomeText,
            {color: style.textColor, marginTop: height * 0.06},
          ]}>
          Reports
        </Text>
        <Text allowFontScaling={false} style={styles.userText}>
          {nnnn}
        </Text>
        <View
          style={{
            width,
            height: height * 0.15,
            position: 'absolute',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Image
            source={
              isDarkMode
                ? require('../../../img/cardioLogoWhite.png')
                : require('../../../img/cardioLogo.png')
            }
            style={{
              width: width * 0.3,
              height: height * 0.07,
              top: height * 0.02,
            }}
          />
        </View>

        {!isFDAView && <TouchableOpacity
          style={{
            height: height * 0.15,
            width: width * 0.2,
            left: width * 0.8,
            position: 'absolute',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={bellIconTapped}>
          <Icon
            name={'bell'}
            size={25}
            color={'rgba(164,6,12,1.0)'}
            style={{top: height * 0.014}}
          />
          {this._renderAlertCount()}
        </TouchableOpacity>}
      </View>
      );
    }
      else if (isForResidents) {
      return (
        <View>
          <Text
            allowFontScaling={false}
            style={[
              styles.welcomeText,
              {color: style.textColor, marginTop: height * 0.06},
            ]}>
            Residents
          </Text>
          <Text allowFontScaling={false} style={styles.userText}>
            {nnnn}
          </Text>
          <Text allowFontScaling={false} style={[styles.userText, {color: 'black', fontSize: width * 0.027}]}>{texter}</Text>
          <View
            style={{
              width,
              height: height * 0.15,
              position: 'absolute',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Image
              source={
                isDarkMode
                  ? require('../../../img/cardioLogoWhite.png')
                  : require('../../../img/cardioLogo.png')
              }
              style={{
                width: width * 0.25,
                height: height * 0.05,
                top: height * 0.012,
              }}
            />
           
          </View>
          {!isFDAView && <TouchableOpacity
            style={{
              height: height * 0.15,
              width: width * 0.2,
              left: width * 0.8,
              position: 'absolute',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={bellIconTapped}>
            <Icon
              name={'bell'}
              size={25}
              color={'rgba(164,6,12,1.0)'}
              style={{top: height * 0.014}}
            />
            {this._renderAlertCount()}
          </TouchableOpacity>}
        </View>
      );
    } else {
      return <View />;
    }
  }

  render() {
    const {title, style, ...props} = this.props;
    return (
      <View
        style={[styles.container, {backgroundColor: style.backgroundColor}]}>
        {this._renderHeader()}
      </View>
    );
  }
}
