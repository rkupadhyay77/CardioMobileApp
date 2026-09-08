import React from 'react';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import LoginScreen from '../screens/login'
import ForgetPassword from '../screens/forgetPassword'
import CustomTabBar from './bottomTabBar'
import EnterCode from '../screens/enterCode'
import AboutScreen from '../screens/about'
import ContactScreen from '../screens/Contact'
import TermsScreen from '../screens/terms'
import FAQScreen from '../screens/faq'
import ChangePassword from '../screens/changePassword'
import AddNotes from '../screens/addNotes'
import NotesListing from '../screens/notesListing'
import GraphNewLandscape from '../screens/graphNewLandscape'
import PrivacyScreen from '../screens/policy'
import CreateUserScreen from '../screens/user/createUser'
import QRReadyScreen from '../screens/qrReady'
import ScannerScreen from '../screens/scanner'
import ValidateUserScreen from '../screens/user/activateUser'
import ObserveListScreen from '../screens/observe/observeList'
import InviteObserveScreen from '../screens/observe/addObserve'
import DeviceConfigScannerScreen from '../screens/configureDevice/scanner'
import ConnectWiFiScreen from '../screens/wifi'
import DeviceList from '../screens/deviceList';
import UpdateSensor from '../screens/updateSensor'
import AlertsScreen from '../screens/alerts'
import UpdateWiFi from '../screens/updateWiFi'
import FirmwareScreen from '../screens/firmware'
import NightModeScreen from '../screens/nightmode'
import TimezoneScreen from '../screens/timezone'
import NotificationScreen from '../screens/notification'
import MfgInfoScreen from '../screens/mfgInfo'
import MedicalTextScreen from '../screens/desclaimerText';
import PracticeDropdown from '../screens/practiceDropdown';
import NewLogin from '../screens/login/NewLogin';
import TempLogger from '../screens/tempLogger';


const config = {
  animation: 'spring',
  config: {
    stiffness: 1000,
    damping: 50,
    mass: 3,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },
};
//TempLoginScreen:{screen : TempLoginScreen},
  
const AppNavigator = createStackNavigator({
   LoginScreen: { screen: LoginScreen },
   TempLogger: { screen: TempLogger },
  PracticeDropdown: { screen: PracticeDropdown },
  AlertsScreen: { screen: AlertsScreen },
  FirmwareScreen: { screen: FirmwareScreen },
  UpdateWiFi: { screen: UpdateWiFi },
  QRReadyScreen: { screen: QRReadyScreen },
  ScannerScreen: { screen: ScannerScreen },
  CreateUserScreen: { screen: CreateUserScreen },
  ValidateUserScreen: { screen: ValidateUserScreen },
  PrivacyScreen: {screen: PrivacyScreen},
  ForgetPassword: { screen: ForgetPassword },
  EnterCode: { screen: EnterCode },
  CustomTabBar: { screen: CustomTabBar },
  ConnectWiFiScreen:{screen:ConnectWiFiScreen},
   TermsScreen : {screen :TermsScreen},
  ContactScreen: {screen :ContactScreen},
  AboutScreen : {screen :AboutScreen},
  FAQScreen : {screen : FAQScreen},
  ChangePassword: { screen: ChangePassword },
  NotesListing: { screen: NotesListing },
  AddNotes: { screen: AddNotes },
  GraphNewLandscape:{screen:GraphNewLandscape},
  ObserveListScreen: { screen: ObserveListScreen },
  InviteObserveScreen: { screen: InviteObserveScreen },
  DeviceConfigScannerScreen: { screen: DeviceConfigScannerScreen },
  DeviceList: { screen: DeviceList },
  UpdateSensor:{screen:UpdateSensor},
  NightModeScreen:{screen:NightModeScreen},
  TimezoneScreen:{screen:TimezoneScreen},
  NotificationScreen:{screen:NotificationScreen},
  MfgInfoScreen:{screen:MfgInfoScreen},
  MedicalTextScreen:{screen:MedicalTextScreen},
},{
  headerMode: 'none',
  navigationOptions: {
      gesturesEnabled: false,
      transitionSpec: {
        open: config,
        close: config,
      }, 
    },
     
}
);

export default createAppContainer(AppNavigator);