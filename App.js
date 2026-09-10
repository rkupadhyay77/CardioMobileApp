/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import {
  View,
  TouchableOpacity,
  Dimensions,
  Platform,
  Alert,
  Linking,
  PermissionsAndroid,
} from 'react-native';

const {width, height} = Dimensions.get('window');

import AnimatedSplash from 'react-native-animated-splash-screen';

import NAV from './src/navigation';

import {
  ShowThemeAlertChanged,
  ShowUnitTypeAlert,
  UploadImageTapped,
  UploadImageSelected,
  StatsTabTapped,
  ShowStatsThemeChanged,
  StatsThemeChanged,
  ShowPracticeListChanged,
} from './src/state/emitters';
import ActionSheet from './src/common/component/actionSheet';
import setStateItem from './src/state/setState/setStateItem';
import getStateItem from './src/state/getStateItem';
import {DB_KEY} from './src/common/helper/keys';
import ThemeChange from './src/state/emitters/themeChange';
import {UnitTypeChanged} from './src/state/emitters';
import DatabaseManager from './src/Database';
import * as Sentry from '@sentry/react-native';
import {checkVersion} from 'react-native-check-version';
import PracticeDropdown from './src/screens/practiceDropdown';
import FacilityScreenSheet from './src/screens/facilityScreen';
import messaging from '@react-native-firebase/messaging';
import {GraphTypeChanged, FloatingWindowChanged} from './src/state/emitters';
import FloatingWindow from './src/common/component/floatingWindow';

Sentry.init({
  dsn: 'https://fff295ee731b84ea7bf0e65a094904a3@o4507294527717376.ingest.us.sentry.io/4507368780660736',
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
  // We recommend adjusting this value in production.
  tracesSampleRate: 1.0,
  _experiments: {
    // profilesSampleRate is relative to tracesSampleRate.
    // Here, we'll capture profiles for 100% of transactions.
    profilesSampleRate: 1.0,
  },
});

class App extends React.Component {
  constructor(props) {
    super(props);
    this.showThemeAlertChanged = this.showThemeAlertChanged.bind(this);
    this.showPracticeListChanged = this.showPracticeListChanged.bind(this);
    this.showUnitTypeAlert = this.showUnitTypeAlert.bind(this);
    this.eventUploadImageTapped = this.eventUploadImageTapped.bind(this);
    this.showStatsThemeChanged = this.showStatsThemeChanged.bind(this);
    this.showFloatingWindowChanged = this.showFloatingWindowChanged.bind(this);

    this.state = {
      timer: null,
      isLoaded: false,
      check: true,
      showAlertTheme: false,
      showAlertUnit: false,
      showStatsTheme: false,
      showAlertUploadImage: false,
      showPracticeData: false,
      showFloatingWindow: false,
      floatingWindowData: null,
    };
  }

  okTapped() {
    if (Platform.OS === 'ios') {
      let appUrl = 'itms-apps://itunes.apple.com/app/cardi-o/id1548710257?mt=8';
      Linking.canOpenURL(appUrl).then(supported => {
        if (supported) {
          Linking.openURL(appUrl);
        } else {
          // console.log("Don't know how to open URI:" + appUrl);
        }
      });
    }
  }

  async getIno() {
    let currentVersion = getStateItem('version');
    const version = await checkVersion({
      platform: 'ios',
      bundleId: 'com.app.cardio',
      currentVersion: currentVersion,
    });

    if (version.needsUpdate) {
      Alert.alert(
        'Update Available',
        `cardio ${version.version}  is available, Do You want to upgrade?`,
        [
          {
            text: 'No',
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel',
          },
          {text: 'Yes', onPress: () => this.okTapped()},
        ],
      );
    }
  }

  componentDidMount() {
    let timer = setInterval(this.tick, 2000);
    this.setState({timer});


    this.getIno();
    ShowThemeAlertChanged.addShowThemeAlertChangedistener(
      this.showThemeAlertChanged,
    );
    ShowUnitTypeAlert.addSShowUnitTypeAlertListener(this.showUnitTypeAlert);
    UploadImageTapped.addUploadImageTappedListener(this.eventUploadImageTapped);
    ShowStatsThemeChanged.addShowStatsThemeChangedChangedListener(
      this.showStatsThemeChanged,
    );

    ShowPracticeListChanged.addShowPracticeListListener(
      this.showPracticeListChanged,
    );
    FloatingWindowChanged.addFloatingWindowChangeListener(
      this.showFloatingWindowChanged,
    );

    // https://apps.apple.com/us/app/cardi-o/id1548710257
    let APP_VERSION_NUMBER_IOS = getStateItem(DB_KEY.APP_VERSION_NUMBER_IOS);
    let APP_BUILD_NUMBER_IOS = getStateItem(DB_KEY.APP_BUILD_NUMBER_IOS);
    let APP_VERSION_NUMBER_ANDROID = getStateItem(
      DB_KEY.APP_VERSION_NUMBER_ANDROID,
    );
    let APP_BUILD_NUMBER_ANDROID = getStateItem(
      DB_KEY.APP_BUILD_NUMBER_ANDROID,
    );



    const unsubscribe = messaging().onMessage(async (remoteMessage = {}) => {
      const notification = remoteMessage.notification || {};
      const title = notification.title;
      const body = notification.body;
      if (title) {
        Alert.alert(title, body);
      }
    });
  }

  componentWillUnmount() {
    FloatingWindowChanged.removeFloatingWindowChangeListener(
      this.showFloatingWindowChanged,
    );
  }

  showFloatingWindowChanged(payload) {
    let isEventLoggingEnabled = getStateItem(DB_KEY.IS_EVENT_LOGIN_ENABLED);
    if (payload && payload.toggle) {
      if (!isEventLoggingEnabled) {
        this.setState({showFloatingWindow: false});
        return;
      }
      this.setState(prevState => ({
        showFloatingWindow: !prevState.showFloatingWindow,
        floatingWindowData: payload.data || null,
      }));
    } else if (payload && payload.visible !== undefined) {
      this.setState({
        showFloatingWindow: Boolean(payload.visible && isEventLoggingEnabled),
        floatingWindowData: payload.data || null,
      });
    }
  }

  // Setup a listener so that if the token is refreshed while the
  // app is in memory we get the updated token.
  // messaging().onTokenRefresh((token) => {
  //   setToken(token);
  // });

  showThemeAlertChanged() {
    this.setState({showAlertTheme: true});
  }

  showPracticeListChanged() {
    this.setState({showPracticeData: true});
  }

  showStatsThemeChanged() {
    this.setState({showStatsTheme: true});
  }

  showUnitTypeAlert() {
    this.setState({showAlertUnit: true});
  }

  tick = () => {
    this.setState({
      isLoaded: true,
    });
    // this.clearInterval(this.state.timer);
    if (Platform.OS === 'android') {
      PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
    }
  };

  _render2() {
    return (
      <View
        style={{
          width,
          height,
          backgroundColor: 'rgba(31,31,31,0.4)',
          position: 'absolute',
        }} />
    );
  }

  LightTapped() {
    this.closeSheet();
    const isDarkTheme = getStateItem(DB_KEY.IS_DARK_MODE);
    if (isDarkTheme) {
      setStateItem(DB_KEY.IS_DARK_MODE, false);
      ThemeChange.emit('THEME_CHANGE');

      // save in local Db
      let username =
        getStateItem(DB_KEY.GALEN) === true
          ? getStateItem(DB_KEY.USER).emailAddress
          : getStateItem(DB_KEY.USER).username;
      let localDbUser = getStateItem(DB_KEY.LOCAL_DB_USER);
      localDbUser.isDarkTheme = false;
      DatabaseManager.saveUserProfileData(username, localDbUser);
    }
  }

  darkTapped() {
    this.closeSheet();
    const isDarkTheme = getStateItem(DB_KEY.IS_DARK_MODE);
    if (!isDarkTheme) {
      setStateItem(DB_KEY.IS_DARK_MODE, true);
      setStateItem(DB_KEY.REPORTS_ARRAY, []);
      ThemeChange.emit('THEME_CHANGE');

      // save in local Db
      let username =
        getStateItem(DB_KEY.GALEN) === true
          ? getStateItem(DB_KEY.USER).emailAddress
          : getStateItem(DB_KEY.USER).username;
      let localDbUser = getStateItem(DB_KEY.LOCAL_DB_USER);
      localDbUser.isDarkTheme = true;
      DatabaseManager.saveUserProfileData(username, localDbUser);
    }
  }

  closeFacility() {
    this.setState({showPracticeData: false});
  }

  closeSheet() {
    const {
      showAlertTheme,
      showAlertUnit,
      showAlertUploadImage,
      showStatsTheme,
    } = this.state;
    if (showAlertTheme) {
      this.setState({showAlertTheme: false});
    } else if (showAlertUnit) {
      this.setState({showAlertUnit: false});
    } else if (showAlertUploadImage) {
      this.setState({showAlertUploadImage: false});
    } else if (showStatsTheme) {
      this.setState({showStatsTheme: false});
    } else {
    }
  }

  OldStatsTapped() {
    this.closeSheet();
    const statsTheme = getStateItem(DB_KEY.STATS_THEME);
    console.log('RKDebug:OldStatsTapped: '+statsTheme);
    if (statsTheme !== 'PlotView') {
      setStateItem(DB_KEY.STATS_THEME, 'PlotView');
      console.log('RKDebug:OldStatsTapped: '+statsTheme);
      StatsThemeChanged.emit('STATS_THEME_CHANGED');

      // save in local Db
      let username =
        getStateItem(DB_KEY.GALEN) === true
          ? getStateItem(DB_KEY.USER).emailAddress
          : getStateItem(DB_KEY.USER).username;
      let localDbUser = getStateItem(DB_KEY.LOCAL_DB_USER);
      localDbUser.designView = 'PlotView';
      DatabaseManager.saveUserProfileData(username, localDbUser);
      GraphTypeChanged.emit('GRAPH_TYPE_CHANGED');
    }
  }

  NewStatsTapped() {
    this.closeSheet();
    const statsTheme = getStateItem(DB_KEY.STATS_THEME);
    console.log('RKDebug:NewStatsTapped: '+statsTheme);
    if (statsTheme !== 'Classic View') {
      setStateItem(DB_KEY.STATS_THEME, 'Classic View');
      console.log('RKDebug:NewStatsTapped: '+statsTheme);
      StatsThemeChanged.emit('STATS_THEME_CHANGED');

      // save in local Db
      let username =
        getStateItem(DB_KEY.GALEN) === true
          ? getStateItem(DB_KEY.USER).emailAddress
          : getStateItem(DB_KEY.USER).username;
      let localDbUser = getStateItem(DB_KEY.LOCAL_DB_USER);
      localDbUser.designView = 'Classic View';
      DatabaseManager.saveUserProfileData(username, localDbUser);
      GraphTypeChanged.emit('GRAPH_TYPE_CHANGED');
    }
  }

  FahrenheitTapped() {
    this.closeSheet();
    const isFahrenheit = getStateItem(DB_KEY.IS_UNIT_FAHRENHEIT);
    if (!isFahrenheit) {
      setStateItem(DB_KEY.IS_UNIT_FAHRENHEIT, true);
      UnitTypeChanged.emit('UNIT_TYPE_CHANGED');

      // save in local Db
      let username =
        getStateItem(DB_KEY.GALEN) === true
          ? getStateItem(DB_KEY.USER).emailAddress
          : getStateItem(DB_KEY.USER).username;
      let localDbUser = getStateItem(DB_KEY.LOCAL_DB_USER);
      localDbUser.isFahrenheit = true;
      DatabaseManager.saveUserProfileData(username, localDbUser);
    }
  }

  CelsiusTapped() {
    this.closeSheet();
    const isFahrenheit = getStateItem(DB_KEY.IS_UNIT_FAHRENHEIT);
    if (isFahrenheit) {
      setStateItem(DB_KEY.IS_UNIT_FAHRENHEIT, false);
      UnitTypeChanged.emit('UNIT_TYPE_CHANGED');

      // save in local Db
      let username =
        getStateItem(DB_KEY.GALEN) === true
          ? getStateItem(DB_KEY.USER).emailAddress
          : getStateItem(DB_KEY.USER).username;
      let localDbUser = getStateItem(DB_KEY.LOCAL_DB_USER);
      localDbUser.isFahrenheit = false;
      DatabaseManager.saveUserProfileData(username, localDbUser);
    }
  }

  eventUploadImageTapped = () => {
    this.setState({showAlertUploadImage: true});
  };

  openCameraTapped() {
    setStateItem(DB_KEY.UPLOAD_IMAGE_SELECTED, 1);
    this.closeSheet();
    UploadImageSelected.emit('UPLOAD_IMAGE_SELECTED');
  }

  choseFromGalleryTapped() {
    setStateItem(DB_KEY.UPLOAD_IMAGE_SELECTED, 2);
    this.closeSheet();
    UploadImageSelected.emit('UPLOAD_IMAGE_SELECTED');
  }

  fdaStatsTapped() {
    this.closeSheet();
    const statsTheme = getStateItem(DB_KEY.STATS_THEME);
    console.log('RKDebug:fdaStatsTapped: '+statsTheme);
    if (statsTheme !== 'H-R View') {
      setStateItem(DB_KEY.STATS_THEME, 'H-R View');
      console.log('RKDebug:fdaStatsTapped: '+statsTheme);
      StatsThemeChanged.emit('STATS_THEME_CHANGED');

      // save in local Db
      let username =
        getStateItem(DB_KEY.GALEN) === true
          ? getStateItem(DB_KEY.USER).emailAddress
          : getStateItem(DB_KEY.USER).username;
      let localDbUser = getStateItem(DB_KEY.LOCAL_DB_USER);
      localDbUser.designView = 'H-R View';
      DatabaseManager.saveUserProfileData(username, localDbUser);
      GraphTypeChanged.emit('GRAPH_TYPE_CHANGED');
    }
  }

  hideTapped() {
    this.setState({showPracticeData: false});
  }

  _renderPracticeList() {

     const {showPracticeData} = this.state;
    if (showPracticeData) {
      return <FacilityScreenSheet onPress={() => this.closeFacility()} />;
    } else {
      return <View />;
    }
  }

  renderActionSheet() {
    const {
      showAlertTheme,
      showAlertUnit,
      showAlertUploadImage,
      showStatsTheme,
    } = this.state;
    const isDarkTheme = getStateItem(DB_KEY.IS_DARK_MODE);
    const statsTheme = getStateItem(DB_KEY.STATS_THEME);
    console.log('RKDebug:renderActionSheet: '+statsTheme);
    const isFahrenheit = getStateItem(DB_KEY.IS_UNIT_FAHRENHEIT);
    let selectedTheme = isDarkTheme ? 'Dark' : 'Light';
    let selectedUnit = isFahrenheit ? 'Fahrenheit' : 'Celsius';
    let selectedStatsTheme = statsTheme;
    if (showAlertTheme) {
      return (
        <ActionSheet
          titleOne={'Light'}
          titleSecond={'Dark'}
          selectedTitle={selectedTheme}
          onPressTitleOne={() => this.LightTapped()}
          onPressTitleTwo={() => this.darkTapped()}
          onPress={() => this.closeSheet()}
        />
      );
    } else if (showAlertUnit) {
      return (
        <ActionSheet
          titleOne={'Fahrenheit'}
          titleSecond={'Celsius'}
          selectedTitle={selectedUnit}
          onPressTitleOne={() => this.FahrenheitTapped()}
          onPressTitleTwo={() => this.CelsiusTapped()}
          onPress={() => this.closeSheet()}
        />
      );
    } else if (showStatsTheme) {
      return (
        <ActionSheet
          titleOne={'PlotView'}
          titleSecond={'Classic View'}
          titleThree={'H-R View'}
          selectedTitle={selectedStatsTheme}
          onPressTitleOne={() => this.OldStatsTapped()}
          onPressTitleTwo={() => this.NewStatsTapped()}
          onPressTitleThree={() => this.fdaStatsTapped()}
          onPress={() => this.closeSheet()}
        />
      );
    } else if (showAlertUploadImage) {
      return (
        <ActionSheet
          titleOne={'Open Camera'}
          titleSecond={'Chose from gallery'}
          selectedTitle={''}
          onPressTitleOne={() => this.openCameraTapped()}
          onPressTitleTwo={() => this.choseFromGalleryTapped()}
          onPress={() => this.closeSheet()}
        />
      );
    } else {
      return <View />;
    }
  }

  renderDummyButton() {
    return (
      <TouchableOpacity
        style={{
          left: width * 0.33,
          width: width * 0.33,
          height: 60,
          backgroundColor: 'red',
          position: 'absolute',
          bottom: 30,
        }}
        onPress={() => this.openStats()} />
    );
  }

  renderFloatingWindow() {
    const {showFloatingWindow, floatingWindowData} = this.state;
    const isEventLoggingEnabled = getStateItem(DB_KEY.IS_EVENT_LOGIN_ENABLED);
    if (!showFloatingWindow || !isEventLoggingEnabled) {
      return null;
    }
    return (
      <FloatingWindow
        visible={showFloatingWindow && isEventLoggingEnabled}
        data={floatingWindowData}
        onClose={() => {
          setStateItem(DB_KEY.IS_EVENT_LOGIN_ENABLED, false);
          this.setState({showFloatingWindow: false});
          FloatingWindowChanged.hide();
        }}
      />
    );
  }

  render() {
    return (
      <AnimatedSplash
        translucent={true}
        isLoaded={this.state.isLoaded}
        imageBackgroundSource={require('./src/img/Splash.png')}
        logoImage={require('./src/img/logo.png')}
        logoHeight={1}
        logoWidht={1}>
        <NAV />
        {this.renderActionSheet()}
        {this._renderPracticeList()}
        {this.renderFloatingWindow()}
      </AnimatedSplash>
    );
  }
}

export default Sentry.wrap(App);
