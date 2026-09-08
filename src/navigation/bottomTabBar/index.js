import React, { Component } from 'react';
import {View, Dimensions, TouchableOpacity} from 'react-native'
import {createAppContainer} from 'react-navigation'
import  {createMaterialBottomTabNavigator} from 'react-navigation-material-bottom-tabs'
const {width} = Dimensions.get("window");

import Residents from '../../screens/dashboard/residents'
import Settings from '../../screens/dashboard/setting'
import Stats from '../../screens/dashboard/stats'
import Reports from '../../screens/dashboard/reports';
import Icon from 'react-native-vector-icons/FontAwesome'
import IconFeather from 'react-native-vector-icons/Feather'
import IconIonicons from 'react-native-vector-icons/Ionicons'

import ThemeChange from '../../state/emitters/themeChange'
import getStateItem from '../../state/getStateItem'
import setStateItem from '../../state/setState/setStateItem'

import {DARK_THEME_COLORS, LIGHT_THEME_COLORS} from '../../common/helper/colors'
import { DB_KEY } from '../../common/helper/keys';
import Orientation from 'react-native-orientation-locker';
import { StatsTabTapped } from '../../state/emitters';
import {ReportsEnabledChanged, ReportsDisableChanged, GraphTypeChanged, GraphEnterLandscapeMode, GraphExitLandscapeMode} from '../../state/emitters'
import { isPLotViewTheme } from '../../common/helper/util';

class CustomTabBar extends Component{
constructor(props){
  super(props)
  
  this.themeChangeListener = this.themeChangeListener.bind(this)
  this._orientationDidChange = this._orientationDidChange.bind(this)
  this._reportsEnabledChanged = this._reportsEnabledChanged.bind(this)
  this._reportsDisableChanged = this._reportsDisableChanged.bind(this)
  this._graphTypeChanged = this._graphTypeChanged.bind(this)

  this.state = {tabBackgroundColor:getStateItem(DB_KEY.IS_DARK_MODE)?DARK_THEME_COLORS.tabBackgroundColor :LIGHT_THEME_COLORS.tabBackgroundColor, selectedScreen:'Residents',renderReport : false, renderStats: true} 

  
}

_graphTypeChanged() {
   this.setState({renderStats: isPLotViewTheme() ? false : true});
}

componentDidMount(){
Orientation.lockToPortrait();

this.setState({renderStats: isPLotViewTheme() ? false : true});
  setStateItem(DB_KEY.NAVIGATOR, this.props.navigation)
  ThemeChange.addThemeChangeListener(this.themeChangeListener)
  Orientation.addOrientationListener(this._orientationDidChange)
  ReportsEnabledChanged.addReportsEnabledChangedMode(this._reportsEnabledChanged)
  ReportsDisableChanged.addReportsDisableChangedMode(this._reportsDisableChanged)
  GraphTypeChanged.addGraphTypeChanged(this._graphTypeChanged)

  const parentNav = this.props.navigation;
  if (parentNav && parentNav.addListener) {
    this.parentWillBlurListener = parentNav.addListener('willBlur', () => {
      console.log('[TIMER_DEBUG] BottomTabBar (parentNav): willBlur - emitting GraphEnterLandscapeMode');
      GraphEnterLandscapeMode.emit('GRAPH_ENTER_LANDSCAPE_MODE');
    });
    this.parentDidFocusListener = parentNav.addListener('didFocus', () => {
      console.log('[TIMER_DEBUG] BottomTabBar (parentNav): didFocus - emitting GraphExitLandscapeMode');
      GraphExitLandscapeMode.emit('GRAPH_EXIT_LANDSCAPE_MODE');
    });
  }
}

_reportsEnabledChanged() {
  const {renderReport} = this.state;
  if (renderReport === false) {
    this.setState({renderReport: true})
  }
}

_reportsDisableChanged() {
  const {renderReport} = this.state;
  if (renderReport === true) {
    this.setState({renderReport: false})
  }
}

_orientationDidChange = (orientation) => {
  if (orientation === 'LANDSCAPE') {
    // do something with landscape layout
    //Orientation.lockToPortrait()
  } else {
    // do something with portrait layout
  }
}

componentWillUnmount(){
  if (this.parentWillBlurListener) this.parentWillBlurListener.remove();
  if (this.parentDidFocusListener) this.parentDidFocusListener.remove();
  ThemeChange.removeThemeChangeListener(this.themeChangeListener)
  ReportsEnabledChanged.removeReportsEnabledChangedMode(this._reportsEnabledChanged)
  ReportsDisableChanged.removeReportsDisableChangedMode(this._reportsDisableChanged)
  GraphTypeChanged.removeGraphTypeChanged(this._graphTypeChanged)
}

/*_renderCustomButton() {
  return (
     <TouchableOpacity
       style={{
         left: width * 0.25,
         width: width * 0.25,
         height: 60,
         backgroundColor: 'transparent',
         position: 'absolute',
         bottom: 10,
       }}
       onPress={() => this.openStats()}></TouchableOpacity>
   );
}*/

_renderCustomButton() {
  const {renderReport} = this.state
  return (
     <TouchableOpacity
       style={{
         left: renderReport === true ? width * 0.25 : width * 0.33,
         width: renderReport === true ? width * 0.25 : width * 0.33,
         height: 60,
         backgroundColor: 'transparent',
         position: 'absolute',
         bottom: 10,
       }}
       onPress={() => this.openStats()}></TouchableOpacity>
   );
}

openStats() {
  const nav = getStateItem(DB_KEY.DRAWER_NAV);
  if (nav !== null && nav !== undefined) {
    nav.navigate('Stats');
    StatsTabTapped.emit('STATS_TAB_TAPPED');
  }
}

themeChangeListener(){
 
   var color = LIGHT_THEME_COLORS.tabBackgroundColor
   if (getStateItem(DB_KEY.IS_DARK_MODE) === true){
    color = DARK_THEME_COLORS.tabBackgroundColor
   }
   //Residents
   //Settings
 this.setState({tabBackgroundColor:color, selectedScreen :'Residents'})
 }

 render() {
  const { selectedScreen, renderReport , renderStats} = this.state; // Assuming renderReport is in state
 // Or if it comes from props

  // Create the base tab configuration


  var tabs = {}
  if (renderReport === true) {
      tabs = {
            Residents: {
                screen: Residents,
                navigationOptions: {
                    tabBarIcon: ({ tintColor }) => (
                        <View>
                            <Icon style={[{ color: tintColor }]} size={25} name={'user'} />
                        </View>
                    ),
                }
            },
            Stats: {
                screen: Stats,
                navigationOptions: {
                    tabBarIcon: ({ tintColor }) => (
                        <View>
                            <IconFeather name={'activity'} size={25} style={[{ color: tintColor }]} />
                        </View>
                    ),
                    activeColor: 'rgba(164,6,12,1.0)',
                    inactiveColor: 'gray',
                    barStyle: { backgroundColor: this.state.tabBackgroundColor },
                    gesturesEnabled: false,
                },
            },
            Reports: {
              screen: Reports,
                navigationOptions: {
                    tabBarIcon: ({ tintColor }) => (
                        <View>
                            <IconIonicons name={'document-text-sharp'} size={25} style={[{ color: tintColor }]} />
                        </View>
                    ),
                    activeColor: 'rgba(164,6,12,1.0)',
                    inactiveColor: 'gray',
                    barStyle: { backgroundColor: this.state.tabBackgroundColor },
                    gesturesEnabled: false,
                },
            },
            Settings: {
                screen: Settings,
                navigationOptions: {
                    tabBarIcon: ({ tintColor }) => (
                        <View>
                            <Icon name={'cog'} size={25} style={[{ color: tintColor }]} />
                        </View>
                    ),
                    activeColor: 'rgba(164,6,12,1.0)',
                    inactiveColor: 'gray',
                    barStyle: { backgroundColor: this.state.tabBackgroundColor },
                    gesturesEnabled: false,
                },
            },
        };

  
  }
  else {
     tabs = {
          Residents: {
              screen: Residents,
              navigationOptions: {
                  tabBarIcon: ({ tintColor }) => (
                      <View>
                          <Icon style={[{ color: tintColor }]} size={25} name={'user'} />
                      </View>
                  ),
              }
          },
          Stats: {
              screen: Stats,
              navigationOptions: {
                  tabBarIcon: ({ tintColor }) => (
                      <View>
                          <IconFeather name={'activity'} size={25} style={[{ color: tintColor }]} />
                      </View>
                  ),
                  activeColor: 'rgba(164,6,12,1.0)',
                  inactiveColor: 'gray',
                  barStyle: { backgroundColor: this.state.tabBackgroundColor },
                  gesturesEnabled: false,
              },
          },
          Settings: {
              screen: Settings,
              navigationOptions: {
                  tabBarIcon: ({ tintColor }) => (
                      <View>
                          <Icon name={'cog'} size={25} style={[{ color: tintColor }]} />
                      </View>
                  ),
                  activeColor: 'rgba(164,6,12,1.0)',
                  inactiveColor: 'gray',
                  barStyle: { backgroundColor: this.state.tabBackgroundColor },
                  gesturesEnabled: false,
              },
          },
      };
    }

  if (renderStats === false) {
    // If it's a PlotView theme, remove the Stats tab
    delete tabs.Stats;
  }
  
  
  
  

  const TabNavigator = createAppContainer(createMaterialBottomTabNavigator(
      tabs,
      {
          initialRouteName: selectedScreen,
          activeColor: 'rgba(164,6,12,1.0)',
          inactiveColor: 'gray',
          barStyle: { backgroundColor: this.state.tabBackgroundColor },
          gesturesEnabled: false,
      }
  ));

  return (
      <View style={{ flex: 1 }}>
          <TabNavigator />
          {this._renderCustomButton()}
      </View>
  );
}

 
  
}




export default CustomTabBar



