import React, {Component} from 'react';
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import styles from './styles';
import Icon from 'react-native-vector-icons/Entypo';
import Icon2 from 'react-native-vector-icons/FontAwesome5';
import Icon3 from 'react-native-vector-icons/Feather';
import URLS from '../../helper/urls';
import getStateItem from '../../../state/getStateItem';
import {DB_KEY} from '../../helper/keys';
import CircularGraph from '../../component/circularGraph';
import {StatsSectionTapped, GraphEnterLandscapeMode, GraphExitLandscapeMode} from '../../../state/emitters';

import {LineChart} from 'react-native-chart-kit';
import setStateItem from '../../../state/setState/setStateItem';
import moment from 'moment';
import {checkIfSensorHasAnAlertFor} from '../../../common/helper/validate';
import {getApiHeader} from '../../helper/header';
import {checkGenericNoType} from '../../helper/util';
import {executeApiWith, getLastDataFromGevHealth, getLastDataFromThrreshold, getLastDataFromParams, getThirtyMinutesData} from '../../../api'
import { API_TIMEOUT } from '../../helper/util';
import { getBaseURL } from '../../../../galenApiLibrary/config/getBaseURL';
import { isEndPointCardio } from '../../../../galenApiLibrary/config/getBaseURL';

const {width, height} = Dimensions.get('window');

export default class StatsRow extends Component {
  constructor(props) {
    super(props);

    this.eventStatsSectionTapped = this.eventStatsSectionTapped.bind(this);
    this.eventGraphExitLandscapeMode = this.eventGraphExitLandscapeMode.bind(this);
    this.state = {
      loading: false,
      items: {},
      currentTapped: '',
      isButtonTapped: false,
      loadingGraph: false,
      heartHistoryArray: [],
      respiratoryHistoryArray: [],
      stressHistoryArray: [],
      tempHistoryArray: [],
      isGraphTapped: false,
      selectedGraphIndex: 0,
      selectedHour: 1,
      heartArrayExtended: [],
      respiratoryArrayExtended: [],
      stressArrayExtended: [],
      tempArrayExtended: [],
      currentSelectedGraph: 2,
      isUniqueNameLoading: true,
      GainSelect: 'N/A',
      BpfSelect: 'N/A',
      latestVersion: '',
      currentHardwareVersion: '',
      thresholds: [],
      app_view: '',
      heartTimeArray: [],
      respiratoryTimeArray: [],
      stressTimeArray: [],
      motionTimeArray: [],
      renderData: false,
      alertCount : 0
    };
  }


  componentDidMount() {

    StatsSectionTapped.addStatsSectionTappedListener(
      this.eventStatsSectionTapped,
    );

    GraphExitLandscapeMode.addGraphExitLandscapeMode(this.eventGraphExitLandscapeMode)

    let isGalen = getStateItem(DB_KEY.GALEN);

    this.getAlertAccount();
    // this.fetchThreshold();
    // this.fetchCustomDats();
    // this.getCurrentHardwareVersion();
  }

  async fetchCustomDats() {
    let url =
      getBaseURL() + 'user/user-custom/' + this.props.data.owneId;
    var myHeaders = getApiHeader(true);
    var requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow',
    };
    //console.log("RKDebug:StatsRow:fetchCustomDats:url:"+url)
     
    const response = await executeApiWith(url, 'GET', null, myHeaders, "StatsRow:fetchCustomDats")
    if (response.status === 200) {
      let jsonData = await response.json();

      if (jsonData.length > 0) {
       //APP_view
        let filter = jsonData.filter(
          content => content.field.name === 'APP_view',
        );
        if (filter.length > 0) {
          let app_view = filter[0].fieldData;
          this.setState({app_view: app_view});
        }
      }
    }
  }

  eventGraphExitLandscapeMode = () => {
    const {currentTapped} = this.state
    if (currentTapped.length > 0) {
      this._getOneHourData();
      let timeInterval = isEndPointCardio() === true ? 10000 : 200000 // 1o seconds and 200 seconds
      this._intervalHourly = setInterval(() => {
        this._getOneHourData();
      }, timeInterval);
    }
  }

  async fetchThreshold() {
     const macAddress = this.props.data.data.Devid.value
    const promiseGetLastDataFromThrresholdTimeout = new Promise((resolve) => (setTimeout(() => resolve(false),  API_TIMEOUT.INTERVAL)))
    const resGetLastDataFromThrreshold = await Promise.race([promiseGetLastDataFromThrresholdTimeout,getLastDataFromThrreshold(macAddress, "StatsRow:fetchThreshold")])
    if (! resGetLastDataFromThrreshold) {
       alert("API Delayed response for StatsRow:fetchThreshold")
       return
    } 

   
    if (resGetLastDataFromThrreshold.status === 200) {
      let jsonData = await resGetLastDataFromThrreshold.json();
      if (jsonData.content.length > 0) {
        let thresholds = jsonData.content;

        this.setState({thresholds: thresholds});
      }
    }
  }

  async getCurrentHardwareVersion() {
    const macId = this.props.data.data.Devid.value.trim()
    const promiseGetLastDataFromGevHealthTimeout = new Promise((resolve) => (setTimeout(() => resolve(false),  API_TIMEOUT.INTERVAL)))
    const resGetLastDataFromGevHealth = await Promise.race([promiseGetLastDataFromGevHealthTimeout,getLastDataFromGevHealth(macId, "StatsRow:getCurrentHardwareVersion")])
    if (! resGetLastDataFromGevHealth) {
       alert("API Delayed response for StatsRow:getCurrentHardwareVersion")
       return
    } 
    
    if (resGetLastDataFromGevHealth.status === 200) {
      let result = await resGetLastDataFromGevHealth.json()
      this.getCurrentVersion(result)
    }
  }

  getCurrentVersion(response) {
    if (
      response.content !== undefined &&
      response.content !== null &&
      response.content.length > 0
    ) {
      const lastObject = response.content[0];

      let currentVersionStr = lastObject.data.Fwvers
        ? lastObject.data.Fwvers.value
        : 'NA';
      let currentHardwareVersion = lastObject.data.Hwvers
        ? lastObject.data.Hwvers.value
        : '';
      this.setState({
        latestVersion: currentVersionStr,
        currentHardwareVersion: currentHardwareVersion,
      });
    } else {
      this.setState({latestVersion: '', currentHardwareVersion: ''});
    }
  }

  eventStatsSectionTapped() {
    let isGalen = getStateItem(DB_KEY.GALEN);
    if (isGalen === false) {
      this.setState({loading: true, isButtonTapped: false, currentTapped: ''});
      this.getData();
    } else {
      this.fetchThreshold();
      this.setState({isButtonTapped: false, currentTapped: ''});
    }
    // this._getOneHourData()
  }

  getHourlyData() {
   
    this.setState({loadingGraph: true});
   // this._getOneHourData();
    let timeInterval = isEndPointCardio() === true ? 10000 : 200000 // 1o seconds and 200 seconds
     
    // this._intervalHourly = setInterval(() => {
    //   this._getOneHourData();
    // }, timeInterval);
  }

  async _getOneHourData() {
  let currentlySelected = getStateItem(DB_KEY.CURRENTLY_SELECTED)
 if (currentlySelected !== 'stats') {
      clearInterval(this._interval);
    clearInterval(this._intervalHourly);
    }



    const {data, ...props} = this.props;
    const {items, currentTapped} = this.state;

    const macAddress = data.data.Devid.value;
    const promiseGetThirtyMinutesDataTimeout = new Promise((resolve) => (setTimeout(() => resolve(false),  API_TIMEOUT.INTERVAL)))
    const resGetThirtyMinutesData = await Promise.race([promiseGetThirtyMinutesDataTimeout,getThirtyMinutesData(macAddress, "StatsRow:_getPlotData")])
    if (! resGetThirtyMinutesData) {
      this.setState({loadingGraph:false})
      alert("API Delayed response for StatsRow:_getPlotData")
      return
  }
     
   this.setState({loadingGraph: false});
    if (resGetThirtyMinutesData.status === 200) {
      let jsonData = await resGetThirtyMinutesData.json();

      let heartHistoryArray = [];
      let respiratoryHistoryArray = [];
      let stressHistoryArray = [];
      let tempHistoryArray = [];
      let heartTimeArray = [];
      let respiratoryTimeArray = [];
      let stressTimeArray = [];
      let tempTimeArray = [];

      if (jsonData.content.length > 0) {
        let reversedArray = jsonData.content.reverse();

        for (var index = 0; index < reversedArray.length; index++) {
          let lastObject = reversedArray[index];

          heartHistoryArray.push(
            lastObject.data.Hr ? lastObject.data.Hr.value : 0,
          );
          if (
            lastObject !== undefined &&
            lastObject !== null &&
            lastObject.data !== undefined &&
            lastObject.data !== null &&
            lastObject.data.Hr !== undefined &&
            lastObject.data.Hr !== null &&
            lastObject.data.Hr.valueProvidedOn !== undefined &&
            lastObject.data.Hr.valueProvidedOn !== null
          ) {
            heartTimeArray.push(
              lastObject.data.Hr ? lastObject.data.Hr.valueProvidedOn : 0,
            );
          }

          respiratoryHistoryArray.push(
            lastObject.data.Rr ? lastObject.data.Rr.value : 0,
          );
          if (
            lastObject !== undefined &&
            lastObject !== null &&
            lastObject.data !== undefined &&
            lastObject.data !== null &&
            lastObject.data.Rr !== undefined &&
            lastObject.data.Rr !== null &&
            lastObject.data.Rr.valueProvidedOn !== undefined &&
            lastObject.data.Rr.valueProvidedOn !== null
          ) {
            respiratoryTimeArray.push(
              lastObject.data.Rr ? lastObject.data.Rr.valueProvidedOn : 0,
            );
          }

          stressHistoryArray.push(
            lastObject.data.Stress ? lastObject.data.Stress.value >= 10 ? Math.round( lastObject.data.Stress.value) :  lastObject.data.Stress.value : 0,
          );
          if (
            lastObject !== undefined &&
            lastObject !== null &&
            lastObject.data !== undefined &&
            lastObject.data !== null &&
            lastObject.data.Stress !== undefined &&
            lastObject.data.Stress !== null &&
            lastObject.data.Stress.valueProvidedOn !== undefined &&
            lastObject.data.Stress.valueProvidedOn !== null
          ) {
            stressTimeArray.push(
              lastObject.data.Stress
                ? lastObject.data.Stress.valueProvidedOn
                : 0,
            );
          }

          tempHistoryArray.push(
            lastObject.data.Motion ? lastObject.data.Motion.value : 0,
          );

          if (
            lastObject !== undefined &&
            lastObject !== null &&
            lastObject.data !== undefined &&
            lastObject.data !== null &&
            lastObject.data.Motion !== undefined &&
            lastObject.data.Motion !== null &&
            lastObject.data.Motion.valueProvidedOn !== undefined &&
            lastObject.data.Motion.valueProvidedOn !== null
          ) {
            tempTimeArray.push(
              lastObject.data.Motion
                ? lastObject.data.Motion.valueProvidedOn
                : 0,
            );
          }
        }
        this.setState({
          heartHistoryArray: heartHistoryArray,
          respiratoryHistoryArray: respiratoryHistoryArray,
          stressHistoryArray: stressHistoryArray,
          tempHistoryArray: tempHistoryArray,
          heartTimeArray: heartTimeArray,
          respiratoryTimeArray: respiratoryTimeArray,
          stressTimeArray: stressTimeArray,
          motionTimeArray: tempTimeArray,
        });
        setStateItem(DB_KEY.HEART_HISTORY_DATA, this.state.heartHistoryArray);
        setStateItem(
          DB_KEY.RESPIRATORY_HISTORY_DATA,
          this.state.respiratoryHistoryArray,
        );
        setStateItem(DB_KEY.STRESS_HISTORY_DATA, this.state.stressHistoryArray);
        setStateItem(DB_KEY.TEMP_HISTORY_DATA, this.state.tempHistoryArray);
      }
    }
  }

  componentWillUnmount() {
    clearInterval(this._interval);
    clearInterval(this._intervalHourly);
    GraphExitLandscapeMode.removeGraphExitLandscapeMode(this.eventGraphExitLandscapeMode)
  }

  _renderSpinner() {
    const {heartHistoryArray} = this.state;
    if (this.state.loading) {
      return (
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            height: height * 0.4,
          }}>
          <ActivityIndicator size="large" color="gray" />
        </View>
      );
    }
  }

  openHeart() {
    const {items, currentTapped, heartHistoryArray} = this.state;
    let str = currentTapped === 'Heart' ? '' : 'Heart';
    this.setState({currentTapped: str});
    
      
    if (str.length > 0 && heartHistoryArray.length === 0) {
      clearInterval(this._intervalHourly);
       this.getHourlyData();
    }
  }

  openRespiratory() {
    const {items, currentTapped, respiratoryHistoryArray} = this.state;
    let str = currentTapped === 'Respiratory' ? '' : 'Respiratory';
    this.setState({currentTapped: str});
  
    if (str.length > 0 && respiratoryHistoryArray.length === 0) {
      clearInterval(this._intervalHourly);
       this.getHourlyData();
    }
  }

  openStress() {
    const {items, currentTapped, stressHistoryArray} = this.state;
    let str = currentTapped === 'Stress' ? '' : 'Stress';
    this.setState({currentTapped: str});
    
    if (str.length > 0 && stressHistoryArray.length === 0) {
      clearInterval(this._intervalHourly);
      this.getHourlyData();
    }
  }

  openTemperature() {
    const {items, currentTapped, tempHistoryArray} = this.state;
    let str = currentTapped === 'Motion' ? '' : 'Motion';
    this.setState({currentTapped: str});
   
    if (str.length > 0 && tempHistoryArray.length === 0) {
      clearInterval(this._intervalHourly);
       this.getHourlyData();
    }
  }

  _onLongPressButton() {}

  /**
   * Heart Layout
   */

  _renderContentForHeart() {
    const {loadingGraph, heartHistoryArray, heartTimeArray} = this.state;
    const {isDarkMode} = this.props;
    const chartConfig = {
      backgroundGradientFrom: 'rgba(230,230,230,1.0)',
      backgroundGradientFromOpacity: 0,
      backgroundGradientTo: 'rgba(163,38,38,1.0)',
      backgroundGradientToOpacity: 0.5,
      color: isDarkMode ?(opacity = 1) => `rgba(255, 255, 255, ${opacity})` : (opacity = 1) => `rgba(131, 131, 131, ${opacity})`,
      strokeWidth: 2, // optional, default 3
      barPercentage: 0.5,
      useShadowColorFromDataset: false, // optional
    };

    let array = [];
    if (heartTimeArray.length > 1) {
      let firstDate = new Date(heartTimeArray[0]);
      let lastDate = new Date(heartTimeArray[heartTimeArray.length - 1]);

      const d = new Date(firstDate);
      const d2 = new Date(lastDate);
      let diff = d2 - d;
      var minutes = Math.floor(diff / 60000);
      // if (minutes >= 25 && minutes < 30) {
      //   minutes = 30;
      // }

      array.push(0);
      array.push((minutes / 3).toFixed(1));
      array.push((minutes / 2).toFixed(1));
      array.push(minutes);
    } else {
      array = ['30', '20', '10', '0'];
    }

    array = ['2', '1', '0'];

    const data = {
      labels: array,
      datasets: [
        {
          data: heartHistoryArray,
          color: (opacity = 1) =>
            isDarkMode
              ? `rgba(115, 177, 248, ${opacity})`
              : `rgba(163, 38, 38, ${opacity})`, // optional
          strokeWidth: 2, // optional
        },
      ],
    };

    if (loadingGraph) {
      return <ActivityIndicator size="large" color="gray" />;
    } else if (heartHistoryArray.length > 0) {
      return (
        <TouchableOpacity>
          <LineChart
            data={data}
            width={styles.subRow.width}
            height={height * 0.12}
            withDots={false}
            isDecimal={false}
            withVerticalLabels={false}
            verticalLabelRotation={0}
            withInnerLines={false}
            withOuterLines={false}
            withVerticalLines={false}
            withHorizontalLines={false}
            chartConfig={chartConfig}
            bezier
          />
          <View
            style={{
              flexDirection: 'row',
              left: width * 0.032,
              height: height * 0.02,
            }}>
            <Text
              allowFontScaling={false}
              style={{
                color: 'rgba(131,131,131,1.0)',
                fontSize: height * 0.016,
              }}>
              (hours){array[2]}
            </Text>
            <Text
              allowFontScaling={false}
              style={{
                color: 'rgba(131,131,131,1.0)',
                fontSize: height * 0.016,
                marginLeft: width * 0.3,
              }}>
              {array[1]}
            </Text>
            <Text
              allowFontScaling={false}
              style={{
                color: 'rgba(131,131,131,1.0)',
                fontSize: height * 0.016,
                marginLeft: width * 0.3,
              }}>
              {array[0]}
            </Text>
           </View>
        </TouchableOpacity>
      );
    } else {
      return (
        <Text
          style={[
            styles.statsText,
            {fontSize: height * 0.02, color: 'rgba(142,28,21,1.0)"'},
          ]}>
          No graphs to display
        </Text>
      );
    }
  }

  expandTapped(selected) {
    const {data, ...props} = this.props;

    let nav = getStateItem(DB_KEY.LOGIN_NAV);
    GraphEnterLandscapeMode.emit('GRAPH_ENTER_LANDSCAPE_MODE')
    clearInterval(this._interval);
    clearInterval(this._intervalHourly);
    nav.navigate('GraphNewLandscape', {
      devId: getStateItem(DB_KEY.GALEN) ? data.ownerId : data.devid,
      selected: selected,
      macAddress: data.data.Devid.value,
      friendlyName: data.data.FriendlyName.value,
      heartArrayExtended: this.state.heartHistoryArray,
      stressArrayExtended: this.state.stressHistoryArray,
      respiratoryArrayExtended: this.state.respiratoryHistoryArray,
      tempArrayExtended: this.state.tempHistoryArray,
    });
  }

  _renderHearDataOpen() {
    const {isDarkMode, data, ...props} = this.props;
    const {items, currentTapped} = this.state;
    let heartRate = '--';
    let friendlyName = '';
    let motion = 0;
    if (items === null || items === undefined) {
    } else {
      if (getStateItem(DB_KEY.GALEN)) {
        if (data !== null && data !== undefined) {
          if (data.data !== null && data.data !== undefined) {
            heartRate = data.data.Hr ? Math.round(data.data.Hr.value) : '--';
            motion = data.data.Motion ? Math.round(data.data.Motion.value) : 0;
            if (
              data.data.FriendlyName !== null &&
              data.data.FriendlyName !== undefined
            ) {
              friendlyName = data.data.FriendlyName.value;
            }
          }
        }
      } else {
        heartRate = Math.round(items.hr);
      }
    }

    let tintColor;
    let percentage;

    if (heartRate !== '--') {
      // calculate percentage and color to be shown
      percentage = (heartRate * 100) / 180;

      if (heartRate > 49 && heartRate <= 100) {
        tintColor = 'green';
      } else if (heartRate > 100 || heartRate < 50) {
        tintColor = 'red';
      } else {
      }
    }

    const message = 'Your heart rate is ' + heartRate + ' BPM';

    let motionGaugeHeight = height * 0.126 - 12;

    let perCent = motionGaugeHeight / 10;

    let fractionHeight = perCent * motion;

    return (
      <View
        style={[
          styles.subRow,
          {
            backgroundColor: isDarkMode ? 'rgba(37,40,44,1.0)' : '#FFF',
            shadowColor: 'transparent',
            marginTop: height * 0.01,
            height: height * 0.37,
          },
        ]}>
        <Text
          allowFontScaling={false}
          style={[
            styles.statsText,
            {
              fontSize: height * 0.02,
              marginTop: height * 0.0,
              marginLeft: width * 0.03,
              color: 'rgba(176,70,62,1.0)',
            },
          ]}>
          Heart Rate
        </Text>
        <Text
          allowFontScaling={false}
          style={{
            color: 'rgba(113,113,113,1.0)',
            fontSize: height * 0.015,
            marginLeft: width * 0.03,
          }}>
          BPM
        </Text>

        <View
          style={{
            width: styles.subRow.width,
            height: height * 0.2,
            top: -height * 0.02,
            justifyContent: 'center',
            alignItems: 'center',
            position: 'absolute',
          }}>
          <CircularGraph
            size={height * 0.1}
            tintColor={tintColor}
            percentage={percentage}
            fill={heartRate === '--' ? 0 : Math.round(heartRate)}
            source={require('../../../img/heart.png')}
            isDarkMode={isDarkMode}
            imgWidth={20}
            imgHeight={18}
          />
        </View>

        <View
          style={{
            width: styles.subRow.width,
            marginTop: Platform.OS === 'ios' ? height * 0.146 : height * 0.138,
            alignItems: 'center',
          }}>
          <Text
            allowFontScaling={false}
            style={[
              styles.statsText,
              {
                fontSize: height * 0.018,
                marginLeft: width * 0.03,
                color: isDarkMode
                  ? 'rgba(216,216,217,1.0)'
                  : 'rgba(89,89,89,1.0)',
              },
            ]}>
            {message}
          </Text>
        </View>

        <View
          style={{
            width: styles.subRow.width,
            height: height * 0.19,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: Platform.OS === 'ios' ? -height * 0.02 : -height * 0.025,
          }}>
          {this._renderContentForHeart()}
        </View>

        <Text
          allowFontScaling={false}
          style={{
            color: isDarkMode ? 'rgba(216,216,217,1.0)' : 'rgba(89,89,89,1.0)',
            position: 'absolute',
            marginLeft: width * 0.55,
            width: width * 0.25,
            textAlign: 'right',
            marginTop: height * 0.01,
          }}>
          {friendlyName}
        </Text>

        <TouchableOpacity
          style={{
            marginLeft: width * 0.7,
            marginTop: height * 0.03,
            position: 'absolute',
          }}
          onPress={() => this.openHeart()}>
          <Icon
            name={'chevron-up'}
            color={isDarkMode ? 'rgba(216,216,217,1.0)' : 'rgba(89,89,89,1.0)'}
            size={25}
          />
        </TouchableOpacity>

        <View
          style={{
            position: 'absolute',
            width: 20,
            height: height * 0.126 - 10,
            borderWidth: 1,
            borderRadius: 10,
            borderColor: 'gray',
            marginTop: height * 0.03 + 25,
            marginLeft: width * 0.72,
            transform: [{rotate: '180deg'}],
          }}>
          <View
            style={{
              width: 18,
              height: fractionHeight,
              borderBottomRightRadius: 10,
              borderBottomLeftRadius: 10,
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10,
              backgroundColor: 'rgba(244,206,138,1.0)',
            }}></View>
          <Text
            style={{
              position: 'absolute',
              width: 40,
              marginTop: -15,
              fontSize: 8,
              marginLeft: -10,
              transform: [{rotate: '180deg'}],
            }}>
            Motion
          </Text>
        </View>

        <TouchableOpacity
          style={{
            position: 'absolute',
            left: styles.subRow.width - 25,
            marginTop: height * 0.2,
            width: 25,
            height: 25,
          }}
          onPress={() => this.expandTapped(2)}>
          <Icon2
            name={'expand'}
            size={20}
            color={isDarkMode ? 'rgba(216,216,217,1.0)' : 'rgba(89,89,89,1.0)'}
          />
        </TouchableOpacity>
      </View>
    );
  }

  _renderHearDataCollapsed() {
    const {isDarkMode, data, ...props} =
      this.props;
    const {items, currentTapped} = this.state;

    const alertFor = checkIfSensorHasAnAlertFor(data.data.Devid.value, 'HR');

    let heartRate = '--';
    if (items === null || items === undefined) {
    } else {
      if (getStateItem(DB_KEY.GALEN)) {
        if (data !== null && data !== undefined) {
          if (data.data !== null && data.data !== undefined) {
            if (data.data.Hr !== null && data.data.Hr !== undefined) {
              heartRate = data.data.Hr ? Math.round(data.data.Hr.value) : '--';
            }
          }
        }
      } else {
        heartRate = Math.round(items.hr);
      }
    }

    //this.setState({renderData:!this.state.renderData})
    let str = heartRate === 0 ? '--' : Math.round(heartRate);
    let display = str;

    return (
      <View
        style={[
          styles.subRow,
          {
            backgroundColor: isDarkMode ? 'rgba(37,40,44,1.0)' : '#FFF',
            shadowColor: alertFor
              ? 'red'
              : isDarkMode
              ? '#000'
              : 'rgba(124,124,124,1.0)',
            marginTop: height * 0.01,
            height: height * 0.1,
          },
        ]}>
        <View
          style={{
            width: width * 0.8,
            height: height * 0.06,
            flexDirection: 'row',
            borderColor: 'red',
          }}>
          <Icon
            name={'heart'}
            color={'red'}
            size={30}
            style={{
              marginLeft: width * 0.04,
              marginTop: height * 0.03,
              height: 30,
            }}
          />
          <Text
            allowFontScaling={false}
            style={[
              styles.statsText,
              {
                color: isDarkMode
                  ? 'rgba(216,216,217,1.0)'
                  : 'rgba(89,89,89,1.0)',
                marginTop: height * 0.025,
                height: height * 0.1,
              },
            ]}>
            {display}
          </Text>
         <View
            style={{
              width: width * 0.45,
              height: height * 0.1,
              position: 'absolute',
              marginLeft: width * 0.3,
              justifyContent: 'center',
              flexDirection: 'column',
            }}>
            <Text
              allowFontScaling={false}
              style={[
                styles.statsText,
                {
                  fontSize: height * 0.02,
                  marginTop: height * 0,
                  marginLeft: width * 0,
                  color: isDarkMode
                    ? 'rgba(216,216,217,1.0)'
                    : 'rgba(89,89,89,1.0)',
                },
              ]}>
              Heart Rate
            </Text>
            <Text
              allowFontScaling={false}
              style={{
                color: 'rgba(122,125,131,1.0)',
                fontSize: height * 0.015,
                marginLeft: width * 0,
                marginTop: height * 0,
              }}>
              BPM
            </Text>
          </View>

          <TouchableOpacity
            style={{
              marginLeft: width * 0.7,
              marginTop: height * 0.03,
              position: 'absolute',
            }}
            onPress={() => this.openHeart()}>
            <Icon
              name={'chevron-down'}
              color={
                isDarkMode ? 'rgba(216,216,217,1.0)' : 'rgba(89,89,89,1.0)'
              }
              size={25}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  _renderHeartData() {
    const {isDarkMode, data, ...props} = this.props;
    const {items, currentTapped, isGraphTapped} = this.state;
    let heartRate = '--';
    if (items === null || items === undefined) {
    } else {
      if (getStateItem(DB_KEY.GALEN)) {
        if (data !== null && data !== undefined) {
          if (data.data !== null && data.data !== undefined) {
            if (data.data.Hr !== null && data.data.Hr !== undefined) {
              heartRate = data.data.Hr ? Math.round(data.data.Hr.value) : '--';
            }
          }
        }
      } else {
        heartRate = Math.round(items.hr);
      }
    }

    let isCurrentTapped = currentTapped === 'Heart' ? true : false;

    if (this.state.loading === false && !isGraphTapped) {
      if (isCurrentTapped) {
        return <View>{this._renderHearDataOpen()}</View>;
      } else {
        return <View>{this._renderHearDataCollapsed()}</View>;
      }
    } else {
      return <View />;
    }
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  _renderContentForRespiratory() {
    const {loadingGraph, respiratoryHistoryArray, respiratoryTimeArray} =
      this.state;
    const {isDarkMode} = this.props;
    const chartConfig = {
      backgroundGradientFrom: 'rgba(230,230,238,1.0)',
      backgroundGradientFromOpacity: 0,
      backgroundGradientTo: 'rgba(115,177,248,1.0)',
      backgroundGradientToOpacity: 0.5,
      color: (opacity = 1) => `rgba(131, 131, 131, ${opacity})`,
      strokeWidth: 2, // optional, default 3
      barPercentage: 0.5,
      useShadowColorFromDataset: false, // optional
    };

    let array = [];
    if (respiratoryTimeArray.length > 1) {
      let firstDate = new Date(respiratoryTimeArray[0]);
      let lastDate = new Date(
        respiratoryTimeArray[respiratoryTimeArray.length - 1],
      );

      const d = new Date(firstDate);
      const d2 = new Date(lastDate);
      let diff = d2 - d;
      var minutes = Math.floor(diff / 60000);
      if (minutes >= 25 && minutes < 30) {
        minutes = 30;
      }

      array.push(0);
      array.push((minutes / 3).toFixed(1));
      array.push((minutes / 2).toFixed(1));
      array.push(minutes);
    } else {
      array = ['30', '20', '10', '0'];
    }

    array = ['2', '1',  '0'];

    const data = {
      labels: array,
      datasets: [
        {
          data: respiratoryHistoryArray,
          color: (opacity = 1) =>
            isDarkMode
              ? `rgba(244,206,138, ${opacity})`
              : `rgba(53, 131, 247, ${opacity})`, // optional
          strokeWidth: 2, // optional
        },
      ],
    };

    if (loadingGraph) {
      return <ActivityIndicator size="large" color="gray" />;
    } else if (respiratoryHistoryArray.length > 0) {
      return (
        <TouchableOpacity
          onPress={() =>
            this.setState({
              currentSelectedGraph: 2,
              selectedHour: 1,
            })
          }>
          <LineChart
            data={data}
            width={styles.subRow.width}
            height={height * 0.12}
            withDots={false}
            isDecimal={false}
            withVerticalLabels={false}
            verticalLabelRotation={0}
            withInnerLines={false}
            withOuterLines={false}
            withVerticalLines={false}
            withHorizontalLines={false}
            chartConfig={chartConfig}
            bezier
          />
          <View
            style={{
              flexDirection: 'row',
              left: width * 0.032,
              height: height * 0.02,
            }}>
            <Text
              allowFontScaling={false}
              style={{
                color: 'rgba(131,131,131,1.0)',
                fontSize: height * 0.016,
              }}>
              (hours){array[2]}
            </Text>
            <Text
              allowFontScaling={false}
              style={{
                color: 'rgba(131,131,131,1.0)',
                fontSize: height * 0.016,
                marginLeft: width * 0.30,
              }}>
              {array[1]}
            </Text>
            <Text
              allowFontScaling={false}
              style={{
                color: 'rgba(131,131,131,1.0)',
                fontSize: height * 0.016,
                marginLeft: width * 0.30,
              }}>
              {array[0]}
            </Text>
          </View>
        </TouchableOpacity>
      );
    } else {
      return (
        <Text
          style={[
            styles.statsText,
            {fontSize: height * 0.02, color: 'rgba(47,116,219,1.0)'},
          ]}>
          No graphs to display
        </Text>
      );
    }
  }

  _renderRespiratoryDataOpen() {
    const {isDarkMode, data, ...props} = this.props;
    const {items, currentTapped} = this.state;

    let RespiratoryRate = '--';
    let friendlyName = '';
    let motion = 0;
    if (items === null || items === undefined) {
    } else {
      if (getStateItem(DB_KEY.GALEN)) {
        if (data !== null && data !== undefined) {
          if (data.data !== null && data.data !== undefined) {
            if (data.data.Rr !== null && data.data.Rr !== undefined) {
              RespiratoryRate = data.data.Rr
                ? Math.round(data.data.Rr.value)
                : '--';
              motion = data.data.Motion
                ? Math.round(data.data.Motion.value)
                : 0;
              if (
                data.data.FriendlyName !== null &&
                data.data.FriendlyName !== undefined
              ) {
                friendlyName = data.data.FriendlyName.value;
              }
            }
          }
        }
      } else {
        RespiratoryRate = Math.round(items.rr);
      }
    }

    let tintColor;
    let percentage;

    if (RespiratoryRate !== '--') {
      // calculate percentage and color to be shown
      percentage = (RespiratoryRate * 100) / 60;

      if (RespiratoryRate > 9 && RespiratoryRate <= 29) {
        tintColor = 'green';
      } else if (RespiratoryRate > 29 || RespiratoryRate < 10) {
        tintColor = 'red';
      } else {
      }
    }

    const message = 'Your respiratory rate is ' + RespiratoryRate + ' bpm';
    let motionGaugeHeight = height * 0.126 - 12;

    let perCent = motionGaugeHeight / 10;

    let fractionHeight = perCent * motion;

    return (
      <View
        style={[
          styles.subRow,
          {
            backgroundColor: isDarkMode ? 'rgba(37,40,44,1.0)' : '#FFF',
            shadowColor: 'transparent',
            marginTop: height * 0.01,
            height: height * 0.37,
          },
        ]}>
        <Text
          allowFontScaling={false}
          style={[
            styles.statsText,
            {
              fontSize: height * 0.02,
              marginTop: height * 0,
              marginLeft: width * 0.03,
              color: 'rgba(176,70,62,1.0)',
            },
          ]}>
          Respiratory Rate
        </Text>
        <Text
          allowFontScaling={false}
          style={{
            color: 'rgba(113,113,113,1.0)',
            fontSize: height * 0.015,
            marginLeft: width * 0.03,
          }}>
          bpm
        </Text>

        <View
          style={{
            width: styles.subRow.width,
            height: height * 0.2,
            top: -height * 0.014,
            justifyContent: 'center',
            alignItems: 'center',
            position: 'absolute',
          }}>
          <CircularGraph
            size={height * 0.1}
            tintColor={tintColor}
            percentage={percentage}
            fill={RespiratoryRate === '--' ? 0 : RespiratoryRate}
            source={require('../../../img/respiratory.png')}
            isDarkMode={isDarkMode}
            imgWidth={20.5}
            imgHeight={15.5}
          />
        </View>

        <View
          style={{
            width: styles.subRow.width,
            marginTop: Platform.OS === 'ios' ? height * 0.146 : height * 0.138,
            alignItems: 'center',
          }}>
          <Text
            allowFontScaling={false}
            style={[
              styles.statsText,
              {
                fontSize: height * 0.018,
                marginLeft: width * 0.03,
                color: isDarkMode
                  ? 'rgba(216,216,217,1.0)'
                  : 'rgba(89,89,89,1.0)',
              },
            ]}>
            {message}
          </Text>
        </View>

        <View
          style={{
            width: styles.subRow.width,
            height: height * 0.19,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: -height * 0.02,
          }}>
          {this._renderContentForRespiratory()}
        </View>

        <Text
          allowFontScaling={false}
          style={{
            color: isDarkMode ? 'rgba(216,216,217,1.0)' : 'rgba(89,89,89,1.0)',
            position: 'absolute',
            marginLeft: width * 0.55,
            width: width * 0.25,
            textAlign: 'right',
            marginTop: height * 0.01,
          }}>
          {friendlyName}
        </Text>

        <TouchableOpacity
          style={{
            marginLeft: width * 0.7,
            marginTop: height * 0.03,
            position: 'absolute',
          }}
          onPress={() => this.openRespiratory()}>
          <Icon
            name={'chevron-down'}
            color={isDarkMode ? 'rgba(216,216,217,1.0)' : 'rgba(89,89,89,1.0)'}
            size={25}
          />
        </TouchableOpacity>

        <View
          style={{
            position: 'absolute',
            width: 20,
            height: height * 0.126 - 10,
            borderWidth: 1,
            borderRadius: 10,
            borderColor: 'gray',
            marginTop: height * 0.03 + 25,
            marginLeft: width * 0.72,
            transform: [{rotate: '180deg'}],
          }}>
          <View
            style={{
              width: 18,
              height: fractionHeight,
              borderBottomRightRadius: 10,
              borderBottomLeftRadius: 10,
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10,
              backgroundColor: 'rgba(244,206,138,1.0)',
            }}></View>
          <Text
            style={{
              position: 'absolute',
              width: 40,
              marginTop: -15,
              fontSize: 8,
              marginLeft: -10,
              transform: [{rotate: '180deg'}],
            }}>
            Motion
          </Text>
        </View>

        <TouchableOpacity
          style={{
            position: 'absolute',
            left: styles.subRow.width - 25,
            width: 25,
            height: 25,
            marginTop: height * 0.2,
          }}
          onPress={() => this.expandTapped(2)}>
          <Icon2
            name={'expand'}
            size={20}
            color={isDarkMode ? 'rgba(216,216,217,1.0)' : 'rgba(89,89,89,1.0)'}
          />
        </TouchableOpacity>
      </View>
    );
  }

  _renderRespiratoryCollapsed() {
    const {isDarkMode, data, ...props} = this.props;
    const {items, currentTapped} = this.state;

    const alertFor = checkIfSensorHasAnAlertFor(data.data.Devid.value, 'RR');
    let RespiratoryRate = '--';
    if (items === null || items === undefined) {
    } else {
      if (getStateItem(DB_KEY.GALEN)) {
        if (data !== null && data !== undefined) {
          if (data.data !== null && data.data !== undefined) {
            if (data.data.Rr !== null && data.data.Rr !== undefined) {
              RespiratoryRate = data.data.Rr
                ? Math.round(data.data.Rr.value)
                : '--';
            }
          }
        }
      } else {
        RespiratoryRate = Math.round(items.rr);
      }
    }

    return (
      <View
        style={[
          styles.subRow,
          {
            backgroundColor: isDarkMode ? 'rgba(37,40,44,1.0)' : '#FFF',
            shadowColor: alertFor
              ? 'red'
              : isDarkMode
              ? '#000'
              : 'rgba(124,124,124,1.0)',
            height: height * 0.1,
          },
        ]}>
        <View
          style={{
            width: width * 0.8,
            height: height * 0.06,
            flexDirection: 'row',
          }}>
          <Image
            source={require('../../../img/respiratory.png')}
            style={{
              width: 32.5,
              height: 28.5,
              marginLeft: width * 0.04,
              marginTop: height * 0.03,
            }}
          />
          <Text
            allowFontScaling={false}
            style={[
              styles.statsText,
              {
                color: isDarkMode
                  ? 'rgba(216,216,217,1.0)'
                  : 'rgba(89,89,89,1.0)',
                marginTop: height * 0.025,
                height: height * 0.1,
              },
            ]}>
            {RespiratoryRate === 0 ? '--' : RespiratoryRate}
          </Text>

          <View
            style={{
              width: width * 0.45,
              height: height * 0.1,
              position: 'absolute',
              marginLeft: width * 0.3,
              justifyContent: 'center',
              flexDirection: 'column',
            }}>
            <Text
              allowFontScaling={false}
              style={[
                styles.statsText,
                {
                  fontSize: height * 0.02,
                  marginTop: height * 0,
                  marginLeft: width * 0,
                  color: isDarkMode
                    ? 'rgba(216,216,217,1.0)'
                    : 'rgba(89,89,89,1.0)',
                },
              ]}>
              Respiratory Rate
            </Text>
            <Text
              allowFontScaling={false}
              style={{
                color: 'rgba(122,125,131,1.0)',
                fontSize: height * 0.015,
                marginLeft: width * 0,
                marginTop: height * 0,
              }}>
              bpm
            </Text>
          </View>
          <TouchableOpacity
            style={{
              marginLeft: width * 0.7,
              marginTop: height * 0.03,
              position: 'absolute',
            }}
            onPress={() => this.openRespiratory()}>
            <Icon
              name={'chevron-down'}
              color={
                isDarkMode ? 'rgba(216,216,217,1.0)' : 'rgba(89,89,89,1.0)'
              }
              size={25}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  _renderRespiratoryData() {
    const {isDarkMode, data, ...props} = this.props;
    const {items, currentTapped, isGraphTapped} = this.state;

    let RespiratoryRate = '--';
    if (items === null || items === undefined) {
    } else {
      if (getStateItem(DB_KEY.GALEN)) {
        if (data !== null && data !== undefined) {
          if (data.data !== null && data.data !== undefined) {
            if (data.data.Rr !== null && data.data.Rr !== undefined) {
              RespiratoryRate = data.data.Rr
                ? Math.round(data.data.Rr.value)
                : '--';
            }
          }
        }
      } else {
        RespiratoryRate = Math.round(items.rr);
      }
    }

    let isCurrentTapped = currentTapped === 'Respiratory' ? true : false;

    if (this.state.loading === false && !isGraphTapped) {
      if (isCurrentTapped) {
        return <View>{this._renderRespiratoryDataOpen()}</View>;
      } else {
        return <View>{this._renderRespiratoryCollapsed()}</View>;
      }
    } else {
      return <View />;
    }
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  _renderContentForStress() {
    const {loadingGraph, stressHistoryArray, stressTimeArray} = this.state;
    const chartConfig = {
      backgroundGradientFrom: 'rgba(230,230,238,1.0)',
      backgroundGradientFromOpacity: 0,
      backgroundGradientTo: 'rgba(160,206,221,1.0)',
      backgroundGradientToOpacity: 0.5,
      color: (opacity = 1) => `rgba(131, 131, 131, ${opacity})`,
      strokeWidth: 2, // optional, default 3
      barPercentage: 0.5,
      useShadowColorFromDataset: false, // optional
    };

    let array = [];
    if (stressTimeArray.length > 1) {
      let firstDate = new Date(stressTimeArray[0]);
      let lastDate = new Date(stressTimeArray[stressTimeArray.length - 1]);

      const d = new Date(firstDate);
      const d2 = new Date(lastDate);
      let diff = d2 - d;
      var minutes = Math.floor(diff / 60000);
      if (minutes >= 25 && minutes < 30) {
        minutes = 30;
      }

      array.push(0);
      array.push((minutes / 3).toFixed(1));
      array.push((minutes / 2).toFixed(1));
      array.push(minutes);
    } else {
      array = ['30', '20', '10', '0'];
    }

    array = ['2', '1', '0'];

    const data = {
      labels: array,
      datasets: [
        {
          data: stressHistoryArray,
          color: (opacity = 1) => `rgba(11, 171, 230, ${opacity})`, // optional
          strokeWidth: 2, // optional
        },
      ],
    };

    if (loadingGraph) {
      return <ActivityIndicator size="large" color="gray" />;
    } else if (stressHistoryArray.length > 0) {
      return (
        <TouchableOpacity
          onPress={() =>
            this.setState({
              currentSelectedGraph: 3,
              selectedHour: 1,
            })
          }>
          <LineChart
            data={data}
            width={styles.subRow.width}
            height={height * 0.12}
            withDots={false}
            isDecimal={true}
            withVerticalLabels={false}
            verticalLabelRotation={0}
            withInnerLines={false}
            withOuterLines={false}
            withVerticalLines={false}
            withHorizontalLines={false}
            chartConfig={chartConfig}
            bezier
          />
          <View
            style={{
              flexDirection: 'row',
              left: width * 0.032,
              height: height * 0.02,
            }}>
            <Text
              allowFontScaling={false}
              style={{
                color: 'rgba(131,131,131,1.0)',
                fontSize: height * 0.016,
              }}>
              (hours){array[2]}
            </Text>
            <Text
              allowFontScaling={false}
              style={{
                color: 'rgba(131,131,131,1.0)',
                fontSize: height * 0.016,
                marginLeft: width * 0.30,
              }}>
              {array[1]}
            </Text>
            <Text
              allowFontScaling={false}
              style={{
                color: 'rgba(131,131,131,1.0)',
                fontSize: height * 0.016,
                marginLeft: width * 0.30,
              }}>
              {array[0]}
            </Text>
           
          </View>
        </TouchableOpacity>
      );
    } else {
      return (
        <Text
          style={[
            styles.statsText,
            {fontSize: height * 0.02, color: 'rgba(66,124,146,1.0)'},
          ]}>
          No graphs to display
        </Text>
      );
    }
  }

  _renderStressDataOpen() {
    const {isDarkMode, data, ...props} = this.props;
    const {items, currentTapped} = this.state;
    let stress = '--';
    let friendlyName = '';
    if (items === null || items === undefined) {
    } else {
      stress = 0;
      if (getStateItem(DB_KEY.GALEN)) {
        if (data !== null && data !== undefined) {
          if (data.data !== null && data.data !== undefined) {
            if (data.data.Stress !== null && data.data.Stress !== undefined) {
              let stressValue = data.data.Stress.value > 0 ? data.data.Stress.value  : 0
             stress = stressValue >= 10 ? Math.round( stressValue) : stressValue.toFixed(1)
              if (
                data.data.FriendlyName !== null &&
                data.data.FriendlyName !== undefined
              ) {
                friendlyName = data.data.FriendlyName.value;
              }
            }
          }
        }
      } else {
        stress = Math.round(items.lfhf);
      }
    }

    let tintColor;
    let percentage;

    if (stress !== '--') {
      // calculate percentage and color to be shown
      percentage = (stress * 100) / 10;

      if (stress > 3) {
        tintColor = 'red';
      } else if (stress <= 3) {
        tintColor = 'green';
      }
    }

    const message = 'Your stress level is ' + stress;
    return (
      <View
        style={[
          styles.subRow,
          {
            backgroundColor: isDarkMode ? 'rgba(37,40,44,1.0)' : '#FFF',
            shadowColor: 'transparent',
            marginTop: height * 0.01,
            height: height * 0.37,
          },
        ]}>
        <Text
          allowFontScaling={false}
          style={[
            styles.statsText,
            {
              fontSize: height * 0.02,
              marginTop: height * 0.02,
              marginLeft: width * 0.03,
              color: 'rgba(176,70,62,1.0)',
            },
          ]}>
          Stress
        </Text>

        <View
          style={{
            width: styles.subRow.width,
            height: height * 0.2,
            top: -height * 0.015,
            justifyContent: 'center',
            alignItems: 'center',
            position: 'absolute',
          }}>
          <CircularGraph
            size={height * 0.1}
            percentage={percentage}
            tintColor={tintColor}
            fill={stress === '--' ? 0 : stress}
            source={require('../../../img/stress.png')}
            isDarkMode={isDarkMode}
            imgWidth={20}
            imgHeight={24.5}
          />
        </View>

        <View
          style={{
            width: styles.subRow.width,
            marginTop: Platform.OS === 'ios' ? height * 0.146 : height * 0.138,
            alignItems: 'center',
          }}>
          <Text
            allowFontScaling={false}
            style={[
              styles.statsText,
              {
                fontSize: height * 0.018,
                marginLeft: width * 0.03,
                color: isDarkMode
                  ? 'rgba(216,216,217,1.0)'
                  : 'rgba(89,89,89,1.0)',
              },
            ]}>
            {message}
          </Text>
        </View>

        <View
          style={{
            width: styles.subRow.width,
            height: height * 0.19,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: -height * 0.02,
          }}>
          {this._renderContentForStress()}
        </View>

        <Text
          allowFontScaling={false}
          style={{
            color: isDarkMode ? 'rgba(216,216,217,1.0)' : 'rgba(89,89,89,1.0)',
            position: 'absolute',
            marginLeft: width * 0.55,
            width: width * 0.25,
            textAlign: 'right',
            marginTop: height * 0.01,
          }}>
          {friendlyName}
        </Text>

        <TouchableOpacity
          style={{
            marginLeft: width * 0.7,
            marginTop: height * 0.03,
            position: 'absolute',
          }}
          onPress={() => this.openStress()}>
          <Icon
            name={'chevron-up'}
            color={isDarkMode ? 'rgba(216,216,217,1.0)' : 'rgba(89,89,89,1.0)'}
            size={25}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            position: 'absolute',
            left: styles.subRow.width - 25,
            width: 25,
            height: 25,
            marginTop: height * 0.2,
          }}
          onPress={() => this.expandTapped(3)}>
          <Icon2
            name={'expand'}
            size={20}
            color={isDarkMode ? 'rgba(216,216,217,1.0)' : 'rgba(89,89,89,1.0)'}
          />
        </TouchableOpacity>
      </View>
    );
  }

  _renderStressDataCollapsed() {
    const {isDarkMode, data, ...props} = this.props;
    const {items, currentTapped} = this.state;

    const alertFor = checkIfSensorHasAnAlertFor(data.data.Devid.value, 'ST');
    let stress = '--';
    if (items === null || items === undefined) {
    } else {
      stress = 0;
      if (getStateItem(DB_KEY.GALEN)) {
        if (data !== null && data !== undefined) {
          if (data.data !== null && data.data !== undefined) {
            if (data.data.Stress !== null && data.data.Stress !== undefined) {
              stress = data.data.Stress
                ? Math.round(data.data.Stress.value)
                : 0;
            }
          }
        }
      } else {
        stress = Math.round(items.lfhf);
      }
    }

    return (
      <View
        style={[
          styles.subRow,
          {
            backgroundColor: isDarkMode ? 'rgba(37,40,44,1.0)' : '#FFF',
            shadowColor: alertFor
              ? 'red'
              : isDarkMode
              ? '#000'
              : 'rgba(124,124,124,1.0)',
            height: height * 0.1,
          },
        ]}>
        <View
          style={{
            width: width * 0.8,
            height: height * 0.06,
            flexDirection: 'row',
          }}>
          <Image
            source={require('../../../img/stress.png')}
            style={{
              width: 30,
              height: 34.5,
              marginLeft: width * 0.04,
              marginTop: height * 0.03,
            }}
          />
          <Text
            allowFontScaling={false}
            style={[
              styles.statsText,
              {
                color: isDarkMode
                  ? 'rgba(216,216,217,1.0)'
                  : 'rgba(89,89,89,1.0)',
                marginTop: height * 0.025,
                height: height * 0.1,
              },
            ]}>
            {stress === 0 ? '--' : stress}
          </Text>

          <View
            style={{
              width: width * 0.45,
              height: height * 0.1,
              position: 'absolute',
              marginLeft: width * 0.3,
              justifyContent: 'center',
              flexDirection: 'column',
            }}>
            <Text
              allowFontScaling={false}
              style={[
                styles.statsText,
                {
                  fontSize: height * 0.02,
                  marginTop: height * 0,
                  marginLeft: width * 0,
                  color: isDarkMode
                    ? 'rgba(216,216,217,1.0)'
                    : 'rgba(89,89,89,1.0)',
                },
              ]}>
              Stress
            </Text>
            <Text
              allowFontScaling={false}
              style={{
                color: 'rgba(122,125,131,1.0)',
                fontSize: height * 0.015,
                marginLeft: width * 0,
                marginTop: height * 0,
              }}></Text>
          </View>

          <TouchableOpacity
            style={{
              marginLeft: width * 0.7,
              marginTop: height * 0.03,
              position: 'absolute',
            }}
            onPress={() => this.openStress()}>
            <Icon
              name={'chevron-down'}
              color={
                isDarkMode ? 'rgba(216,216,217,1.0)' : 'rgba(89,89,89,1.0)'
              }
              size={25}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  _renderStressData() {
    const {isDarkMode, data, ...props} = this.props;
    const {items, currentTapped, isGraphTapped} = this.state;
    let stress = '--';
    if (items === null || items === undefined) {
    } else {
      stress = items.lfhf;
    }

    let isCurrentTapped = currentTapped === 'Stress' ? true : false;

    if (this.state.loading === false && !isGraphTapped) {
      if (isCurrentTapped) {
        return <View>{this._renderStressDataOpen()}</View>;
      } else {
        return <View>{this._renderStressDataCollapsed()}</View>;
      }
    } else {
      return <View />;
    }
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  _renderContentForTemp() {
    const {loadingGraph, tempHistoryArray, motionTimeArray} = this.state;
    const chartConfig = {
      backgroundGradientFrom: 'rgba(230,230,238,1.0)',
      backgroundGradientFromOpacity: 0,
      backgroundGradientTo: 'rgba(244,206,138,1.0)',
      backgroundGradientToOpacity: 0.5,
      color: (opacity = 1) => `rgba(131, 131, 131, ${opacity})`,
      strokeWidth: 2, // optional, default 3
      barPercentage: 0.5,
      useShadowColorFromDataset: false, // optional
    };

    let array = [];
    if (motionTimeArray.length > 1) {
      let firstDate = new Date(motionTimeArray[0]);
      let lastDate = new Date(motionTimeArray[motionTimeArray.length - 1]);

      const d = new Date(firstDate);
      const d2 = new Date(lastDate);
      let diff = d2 - d;
      var minutes = Math.floor(diff / 60000);
      if (minutes >= 25 && minutes < 30) {
        minutes = 30;
      }

      array.push(0);
      array.push((minutes / 3).toFixed(1));
      array.push((minutes / 2).toFixed(1));
      array.push(minutes);
    } else {
      array = ['30', '20', '10', '0'];
    }

    array = ['2', '1', '0'];

    const data = {
      labels: array,
      datasets: [
        {
          data: tempHistoryArray,
          color: (opacity = 1) => `rgba(237, 153, 14, ${opacity})`, // optional
          strokeWidth: 2, // optional
        },
      ],
    };

    if (loadingGraph) {
      return <ActivityIndicator size="large" color="gray" />;
    } else if (tempHistoryArray.length > 0) {
      return (
        <TouchableOpacity
          onPress={() =>
            this.setState({
              currentSelectedGraph: 4,
              selectedHour: 1,
            })
          }>
          <LineChart
            data={data}
            width={styles.subRow.width}
            height={height * 0.12}
            withDots={false}
            isDecimal={true}
            withVerticalLabels={false}
            verticalLabelRotation={0}
            withInnerLines={false}
            withOuterLines={false}
            withVerticalLines={false}
            withHorizontalLines={false}
            chartConfig={chartConfig}
            bezier
          />
          <View
            style={{
              flexDirection: 'row',
              left: width * 0.032,
              height: height * 0.02,
            }}>
            <Text
              allowFontScaling={false}
              style={{
                color: 'rgba(131,131,131,1.0)',
                fontSize: height * 0.016,
              }}>
              (hours){array[2]}
            </Text>
            <Text
              allowFontScaling={false}
              style={{
                color: 'rgba(131,131,131,1.0)',
                fontSize: height * 0.016,
                marginLeft: width * 0.3,
              }}>
              {array[1]}
            </Text>
            <Text
              allowFontScaling={false}
              style={{
                color: 'rgba(131,131,131,1.0)',
                fontSize: height * 0.016,
                marginLeft: width * 0.3,
              }}>
              {array[0]}
            </Text>
            <Text
              allowFontScaling={false}
              style={{
                color: 'rgba(131,131,131,1.0)',
                fontSize: height * 0.016,
                marginLeft: width * 0.16,
              }}>
              {array[0]}
            </Text>
          </View>
        </TouchableOpacity>
      );
    } else {
      return (
        <Text
          style={[
            styles.statsText,
            {fontSize: height * 0.02, color: 'rgba(236,173,76,1.0)'},
          ]}>
          No graphs to display
        </Text>
      );
    }
  }

  async getAlertAccount() {
    const {data, ...props} = this.props;
    let macAddress = data.data.Devid.value;

    const headers = getApiHeader(true);
    var raw = JSON.stringify({
      deviceDataModelId: 'd36a4373-fbdc-44a3-8c96-4bb920041e40-as',
      deviceCriteria: [
        {
          key: 'AlertFlag',
          operator: 'Equal',
          value: 1,
        },
        {
          key: 'DevidAlerts',
          operator: 'Equal',
          value: macAddress,
        },
      ],
    });

    var requestOptions = {
      method: 'POST',
      headers: headers,
      body: raw,
      redirect: 'follow',
    };

    let url =
      getBaseURL() + 'data/devicedata-advanced?pageSize=1&pageNumber=0';
    //V3
    //console.log("RKDebug:StatsRow:getAlertAccount:url:"+url+"body:"+raw)
     
    let res = await executeApiWith(url, 'POST', raw, headers, "StatsRow:getAlertAccount")
   

    if (res.status === 200) {
      let json = await res.json();

      let totalElements = json.totalElements;

      if (
        totalElements > 999 &&
        totalElements !== 0 &&
        totalElements !== this.state.alertCount
      ) {
        this.setState({alertCount: '999+'});
      } else if (
        totalElements !== 0 &&
        totalElements < 1000 &&
        totalElements !== this.state.alertCount
      ) {
        this.setState({alertCount: totalElements});
      }
    }else if (res.status === 404) {
      this.setState({alertCount: 0});
    }
  }

  _renderTemperatureDataOpen() {
    const {isDarkMode, data, ...props} = this.props;
    const {items, currentTapped} = this.state;

    let temperature = '--';
    let friendlyName = '';
    if (items === null || items === undefined) {
    } else {
      temperature = 0;
      if (getStateItem(DB_KEY.GALEN)) {
        if (data !== null && data !== undefined) {
          if (data.data !== null && data.data !== undefined) {
            if (data.data.Motion !== null && data.data.Motion !== undefined) {
              temperature = data.data.Motion
                ? Math.round(data.data.Motion.value)
                : 0;
              if (
                data.data.FriendlyName !== null &&
                data.data.FriendlyName !== undefined
              ) {
                friendlyName = data.data.FriendlyName.value;
              }
            }
          }
        }
      } else {
        temperature = Math.round(items.mot);
      }
    }

    let tintColor = 'red';
    let percentage = 1;

    if (temperature !== '--') {
      percentage = (temperature * 100) / 10;
      if (temperature >= 1 && temperature <= 4) {
        tintColor = 'green';
      } else if (temperature >= 5) {
        tintColor = 'red';
      }
    }

    const message = 'Your motion is ' + temperature;

    return (
      <View
        style={[
          styles.subRow,
          {
            backgroundColor: isDarkMode ? 'rgba(37,40,44,1.0)' : '#FFF',
            shadowColor: 'transparent',
            marginTop: height * 0.01,
            height: height * 0.37,
          },
        ]}>
        <Text
          allowFontScaling={false}
          style={[
            styles.statsText,
            {
              fontSize: height * 0.02,
              marginTop: height * 0.0,
              marginLeft: width * 0.03,
              color: 'rgba(176,70,62,1.0)',
            },
          ]}>
          Motion
        </Text>
        <Text
          allowFontScaling={false}
          style={{
            color: 'rgba(113,113,113,1.0)',
            fontSize: height * 0.015,
            marginLeft: width * 0.03,
          }}></Text>

        <View
          style={{
            width: styles.subRow.width,
            height: height * 0.2,
            top: -height * 0.015,
            justifyContent: 'center',
            alignItems: 'center',
            position: 'absolute',
          }}>
          <CircularGraph
            size={height * 0.1}
            tintColor={tintColor}
            percentage={percentage}
            fill={temperature === '--' ? 0 : temperature}
            source={require('../../../img/motion.png')}
            isDarkMode={isDarkMode}
            imgWidth={25}
            imgHeight={25}
          />
        </View>

        <View
          style={{
            width: styles.subRow.width,
            marginTop: Platform.OS === 'ios' ? height * 0.146 : height * 0.138,
            alignItems: 'center',
          }}>
          <Text
            allowFontScaling={false}
            style={[
              styles.statsText,
              {
                fontSize: height * 0.018,
                marginLeft: width * 0.03,
                color: isDarkMode
                  ? 'rgba(216,216,217,1.0)'
                  : 'rgba(89,89,89,1.0)',
              },
            ]}>
            {message}
          </Text>
        </View>

        <View
          style={{
            width: styles.subRow.width,
            height: height * 0.19,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: -height * 0.02,
          }}>
          {this._renderContentForTemp()}
        </View>

        <Text
          allowFontScaling={false}
          style={{
            color: isDarkMode ? 'rgba(216,216,217,1.0)' : 'rgba(89,89,89,1.0)',
            position: 'absolute',
            marginLeft: width * 0.55,
            width: width * 0.25,
            textAlign: 'right',
            marginTop: height * 0.01,
            fontWeight: 'bold',
          }}>
          {friendlyName}
        </Text>

        <TouchableOpacity
          style={{
            marginLeft: width * 0.7,
            marginTop: height * 0.03,
            position: 'absolute',
          }}
          onPress={() => this.openTemperature()}>
          <Icon
            name={'chevron-up'}
            color={isDarkMode ? 'rgba(216,216,217,1.0)' : 'rgba(89,89,89,1.0)'}
            size={25}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            position: 'absolute',
            left: styles.subRow.width - 25,
            width: 25,
            height: 25,
            marginTop: height * 0.2,
          }}
          onPress={() => this.expandTapped(4)}>
          <Icon2
            name={'expand'}
            size={20}
            color={isDarkMode ? 'rgba(216,216,217,1.0)' : 'rgba(89,89,89,1.0)'}
          />
        </TouchableOpacity>
      </View>
    );
  }

  fahrenheitToCelsiusConversion(temp) {
    const celsius = ((temp - 32) * 5) / 9;
    return Math.round(celsius);
  }

  _renderTemperatureDataCollapsed() {
    const {isDarkMode, data, ...props} = this.props;
    const {items, currentTapped} = this.state;

    const alertFor = checkIfSensorHasAnAlertFor(data.data.Devid.value, 'MT');

    let temperature = '--';
    if (items === null || items === undefined) {
    } else {
      temperature = 0;
      if (getStateItem(DB_KEY.GALEN)) {
        if (data !== null && data !== undefined) {
          if (data.data !== null && data.data !== undefined) {
            if (data.data.Motion !== null && data.data.Motion !== undefined) {
              temperature = data.data.Motion
                ? Math.round(data.data.Motion.value)
                : 0;
            }
          }
        }
      } else {
        temperature = Math.round(items.mot);
      }
    }

    return (
      <View
        style={[
          styles.subRow,
          {
            backgroundColor: isDarkMode ? 'rgba(37,40,44,1.0)' : '#FFF',
            shadowColor: alertFor
              ? 'red'
              : isDarkMode
              ? '#000'
              : 'rgba(124,124,124,1.0)',
            height: height * 0.1,
          },
        ]}>
        <View
          style={{
            width: width * 0.8,
            height: height * 0.06,
            flexDirection: 'row',
          }}>
          <Image
            source={require('../../../img/motion.png')}
            style={{
              width: 30,
              height: 30,
              marginLeft: width * 0.05,
              marginTop: height * 0.03,
            }}
          />
          <Text
            allowFontScaling={false}
            style={[
              styles.statsText,
              {
                marginLeft: width * 0.04,
                color: isDarkMode
                  ? 'rgba(216,216,217,1.0)'
                  : 'rgba(89,89,89,1.0)',
                marginTop: height * 0.025,
                height: height * 0.1,
              },
            ]}>
            {temperature === 0 ? '--' : temperature}
          </Text>

          <View
            style={{
              width: width * 0.45,
              height: height * 0.1,
              position: 'absolute',
              marginLeft: width * 0.3,
              justifyContent: 'center',
              flexDirection: 'column',
            }}>
            <Text
              allowFontScaling={false}
              style={[
                styles.statsText,
                {
                  fontSize: height * 0.02,
                  marginTop: height * 0,
                  marginLeft: width * 0,
                  color: isDarkMode
                    ? 'rgba(216,216,217,1.0)'
                    : 'rgba(89,89,89,1.0)',
                },
              ]}>
              Motion
            </Text>
            <Text
              allowFontScaling={false}
              style={{
                color: 'rgba(122,125,131,1.0)',
                fontSize: height * 0.015,
                marginLeft: width * 0,
                marginTop: height * 0,
              }}></Text>
          </View>

          <TouchableOpacity
            style={{
              marginLeft: width * 0.7,
              marginTop: height * 0.03,
              position: 'absolute',
            }}
            onPress={() => this.openTemperature()}>
            <Icon
              name={'chevron-down'}
              color={
                isDarkMode ? 'rgba(216,216,217,1.0)' : 'rgba(89,89,89,1.0)'
              }
              size={25}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  _renderTemperatureData() {
    const {isDarkMode, data, ...props} = this.props;
    const {items, currentTapped, isGraphTapped} = this.state;
    let isCurrentTapped = currentTapped === 'Motion' ? true : false;

    let temperature = '--';
    if (items === null || items === undefined) {
    } else {
      temperature = items.mot;
    }
    if (this.state.loading === false && !isGraphTapped) {
      if (isCurrentTapped) {
        return <View>{this._renderTemperatureDataOpen()}</View>;
      } else {
        return <View>{this._renderTemperatureDataCollapsed()}</View>;
      }
    } else {
      return <View />;
    }
  }

  _renderProfileImage() {
    const {isDarkMode, data, ...props} = this.props;
    const {currentTapped, isButtonTapped} = this.state;
    let isGalen = getStateItem(DB_KEY.GALEN);

    const name = isGalen ? (data.owner ? data.owner.fullName : '') : data.name;
    let firstLetter = name.length > 0 ? name.substring(0, 1) : '';
    let isCurrentTapped = currentTapped !== '' ? true : false;
    if (isButtonTapped === true) {
      isCurrentTapped = true;
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
        <View style={styles.circle}>
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
        <View style={styles.circle}>
          <Text
            allowFontScaling={false}
           style={{
              color: 'rgba(158,40,33,1.0)',
              fontSize: height * 0.03,
              fontWeight: 'bold',
            }}>
            {firstLetter}
          </Text>
        </View>
      );
    }
  }

  _renderProfileData() {
    const {isDarkMode, data, onPressAddNotes, onPressAlerts, ...props} =
      this.props;
    const {items, currentTapped, alertCount} = this.state;

    let isGalen = getStateItem(DB_KEY.GALEN);
    const name = isGalen ? (data.owner ? data.owner.fullName : '') : data.name;
    const email = data.owner ? data.owner.emailAddress : '';
    const friendlyName = data.data
      ? data.data.FriendlyName
        ? data.data.FriendlyName.value
        : ''
      : '';
    const locationName = data.data
      ? data.data.Location
        ? data.data.Location.value
        : ''
      : '';
    const showLocation = locationName === '' ? '' : '(' + locationName + ')';
    const completeStr = friendlyName + showLocation;
    let firstLetter = name.length > 0 ? name.substring(0, 1) : '';
    let message;
    if (
      items === null ||
      items === undefined ||
      data.data === undefined ||
      data.data === null
    ) {
      message = 'Device is offline';
    } else {
      message = 'Last updated ' + items.syncedBefore + ' seconds ago';
    }

    if (data !== null && data !== undefined) {
      if (data !== null && data !== undefined) {
        var cloudDate = data.minValueProvidedOn
          ? data.minValueProvidedOn
          : '--';
        var date = moment.utc(cloudDate).format('YYYY-MM-DD HH:mm:ss');

        var stillUtc = moment.utc(date).toDate();
        var local = moment(stillUtc).local().format('hh:mm:ss A');

        message = 'Last synced ' + local;
      }
    }

    let isCurrentTapped = currentTapped !== '' ? true : false;
    let alertText = alertCount !== 0 ? 'Alert' : 'No Alert';

    if (isCurrentTapped === false) {
      return (
        <View style={styles.detailContainerRow}>
          {this._renderProfileImage()}

          <View
            style={{
              width: width * 0.55,
              height: height * 0.07,
              marginLeft: width * 0.02,
              marginTop: height * 0.02,
              flexDirection: 'column',
            }}>
            <View style={{flexDirection: 'row'}}>
              <Text
                allowFontScaling={false}
                style={[
                  styles.statsText,
                  {
                    fontSize: height * 0.02,
                    marginTop: height * 0.007,
                    marginLeft: width * 0.02,
                    color: isDarkMode
                      ? 'rgba(216,216,217,1.0)'
                      : 'rgba(89,89,89,1.0)',
                    fontWeight: 'bold',
                  },
                ]}>
                {friendlyName}
              </Text>
              {showLocation.length > 0 && (
                <Text
                  allowFontScaling={false}
                  style={[
                    styles.statsText,
                    {
                      fontSize: height * 0.016,
                      marginTop: height * 0.0072,
                      marginLeft: width * 0.02,
                      color: 'rgba(138,138,138,1.0)',
                    },
                  ]}>
                  {showLocation}
                </Text>
              )}
            </View>
            <Text
              allowFontScaling={false}
              style={{
                color: 'rgba(122,125,131,1.0)',
                fontSize: height * 0.015,
                marginLeft: width * 0.02,
              }}>
              {message}
            </Text>
          </View>

          <TouchableOpacity
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              width: width * 0.09,
              height: height * 0.15,
            }}
            onPress={onPressAddNotes}>
            <Icon2
              name={'notes-medical'}
              size={height * 0.026}
              color={isDarkMode ? '#FFF' : 'rgba(37,40,44,1.0)'}
            />
            <Text
              allowFontScaling={false}
              style={{
                color: 'rgba(122,125,131,1.0)',
                fontSize: height * 0.011,
                marginTop: 2,
                textAlign: 'center',
              }}>
              Notes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              width: width * 0.09,
              height: height * 0.06,
              position: 'absolute',
              marginLeft: width * 0.61 + height * 0.07,
            }}
            onPress={onPressAlerts}>
            {alertCount!== 0 && (
              <Text
                allowFontScaling={false}
                style={{
                  color: 'rgba(243,243,243,1.0)',
                  fontSize: height * 0.013,
                  marginTop: 0,
                  textAlign: 'center',
                  backgroundColor: 'rgba(164,6,12,1.0)',
                  borderRadius:12,
                  padding : 5
                }}>
                {alertCount}
              </Text>
            )}

            {alertCount !== 0 && (
              <Icon3
                name={'bell'}
                size={height * 0.026}
                color={'red'}
                style={{marginTop: -5}}
              />
            )}
            <Text
              allowFontScaling={false}
              style={{
                color: 'rgba(122,125,131,1.0)',
                fontSize: height * 0.011,
                marginTop: 2,
                textAlign: 'center',
              }}>
              {alertText}
            </Text>
          </TouchableOpacity>
        </View>
      );
    } else {
      return <View />;
    }
  }

  _renderBottomBox() {
    const {isDarkMode, data, ...props} = this.props;
    const {currentTapped, isButtonTapped, items, BpfSelect, GainSelect} =
      this.state;
    let isGalen = getStateItem(DB_KEY.GALEN);

    let hrss = '--';
    if (getStateItem(DB_KEY.GALEN)) {
      if (data !== null && data !== undefined) {
        if (data.data !== null && data.data !== undefined) {
          hrss = data.data.RssHrMv ? Math.round(data.data.RssHrMv.value) : '--';
        }
      }
    } else {
      hrss = items ? items.hrss : '--';
    }

    let rrss = '--';

    if (getStateItem(DB_KEY.GALEN)) {
      if (data !== null && data !== undefined) {
        if (data.data !== null && data.data !== undefined) {
          rrss = data.data.RssRrMv ? Math.round(data.data.RssRrMv.value) : '--';
        }
      }
    } else {
      rrss = items ? items.rrss : '--';
    }

    let rssWifi = '--';

    if (getStateItem(DB_KEY.GALEN)) {
      if (data !== null && data !== undefined) {
        if (data.data !== null && data.data !== undefined) {
          rssWifi = data.data.RssWifi
            ? Math.round(data.data.RssWifi.value)
            : '--';
        }
      }
    }

    let online = 'Offline';

    if (data !== null && data !== undefined) {
      if (data.data !== null && data.data !== undefined) {
        online = data.data.Offline
          ? data.data.Offline.value == 'Yes'
            ? 'Offline'
            : 'Online'
          : 'Offline';
      }
    }

    let color = online === 'Online' ? 'green' : 'red';

    if (isButtonTapped) {
      return (
        <View
          style={{
            width: width * 0.84,
            height: height * 0.01,
            flexDirection: 'row',
          }}>
          <View
            style={[
              styles.subRow,
              {
                backgroundColor: isDarkMode ? 'rgba(37,40,44,1.0)' : '#FFF',
                shadowColor: isDarkMode ? '#000' : 'rgba(124,124,124,1.0)',
                width: width * 0.38,
                height: height * 0.06,
                justifyContent: 'center',
                alignItems: 'center',
              },
            ]}>
            <Text
              allowFontScaling={false}
              style={[
                styles.statsText,
                {
                  fontSize: height * 0.015,
                  marginTop: 0,
                  marginLeft: 0,
                  color: isDarkMode
                    ? 'rgba(216,216,217,1.0)'
                    : 'rgba(89,89,89,1.0)',
                },
              ]}>
              rss: {hrss} / {rrss} / {rssWifi}
            </Text>
            <View style={{flexDirection: 'row'}}>
              <Text
                allowFontScaling={false}
                style={[
                  styles.statsText,
                  {
                    fontSize: height * 0.015,
                    marginTop: 0,
                    marginLeft: 0,
                    color: isDarkMode
                      ? 'rgba(216,216,217,1.0)'
                      : 'rgba(89,89,89,1.0)',
                  },
                ]}>
                Mode: {BpfSelect}
                {GainSelect} / {this.state.app_view}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.subRow,
              {
                backgroundColor: isDarkMode ? 'rgba(37,40,44,1.0)' : '#FFF',
                shadowColor: isDarkMode ? '#000' : 'rgba(124,124,124,1.0)',
                width: width * 0.38,
                marginLeft: width * 0.04,
                height: height * 0.06,
                justifyContent: 'center',
                alignItems: 'center',
              },
            ]}>
            {this._renderUniqueName()}
          </View>
        </View>
      );
    } else {
      return <View />;
    }
  }

  async getAddSelectApi() {
    const {isDarkMode, data, ...props} = this.props;
    const macAddress = data.data.Devid.value;

    const promiseGetLastDataFromParamsTimeout = new Promise((resolve) => (setTimeout(() => resolve(false),  API_TIMEOUT.INTERVAL)))
    const resGetLastDataFromParams = await Promise.race([promiseGetLastDataFromParamsTimeout,getLastDataFromParams(macAddress, "StatsRow:getAddSelectApi")])
    if (! resGetLastDataFromParams) {
       alert("API Delayed response for StatsRow:getAddSelectApi")
       return
    } 


   if (resGetLastDataFromParams.status === 200) {
      let response = await resGetLastDataFromParams.json();
      this.setState({isUniqueNameLoading: false});

      let content = response.content;
      if (content.length > 0) {
        let paramsData = content[0];
        let GainSelect = paramsData.data
          ? paramsData.data.GainSelect
            ? paramsData.data.GainSelect.value
            : 'N/A'
          : 'N/A';
        let BpfSelect = paramsData.data
          ? paramsData.data.BpfSelect
            ? paramsData.data.BpfSelect.value
            : 'N/A'
          : 'N/A';
        this.setState({GainSelect: GainSelect, BpfSelect: BpfSelect});
      }
    } else {
      this.setState({isUniqueNameLoading: false});
    }
  }

  _renderUniqueName() {
    const {isUniqueNameLoading, GainSelect, BpfSelect} = this.state;
    const {isDarkMode, data, ...props} = this.props;

    if (isUniqueNameLoading) {
      return <ActivityIndicator />;
    } else {
      return (
        <View style={{justifyContent: 'center', alignItems: 'center'}}>
          <Text
            allowFontScaling={false}
            style={[
              styles.statsText,
              {
                fontSize: height * 0.015,
                marginTop: 0,
                marginLeft: 0,
                color: isDarkMode
                  ? 'rgba(216,216,217,1.0)'
                  : 'rgba(89,89,89,1.0)',
              },
            ]}>
            FW ver: {this.state.latestVersion}{' '}
          </Text>
          <Text
            allowFontScaling={false}
            style={[
              styles.statsText,
              {
                fontSize: height * 0.015,
                marginTop: 0,
                marginLeft: 0,
                color: isDarkMode
                  ? 'rgba(216,216,217,1.0)'
                  : 'rgba(89,89,89,1.0)',
              },
            ]}>
            HW ver: {this.state.currentHardwareVersion}
          </Text>
        </View>
      );
    }
  }

  _renderThreshold() {
    const {isDarkMode, data, ...props} = this.props;
    const {currentTapped, isButtonTapped, items, thresholds} = this.state;
    let hrMax = '';
    let hrMin = '';
    let rrMax = '';
    let rrMin = '';
    let stMax = '';
    let stMin = '';
    let mtMax = '';
    let mtMin = '';
    if (thresholds.length > 0) {
      let values = thresholds[0];
      hrMax = values.data
        ? values.data.AlertMaxhr
          ? values.data.AlertMaxhr.value
          : ''
        : '';
      hrMin = values.data
        ? values.data.AlertMinhr
          ? values.data.AlertMinhr.value
          : ''
        : '';

      rrMax = values.data
        ? values.data.AlertMaxrr
          ? values.data.AlertMaxrr.value
          : ''
        : '';
      rrMin = values.data
        ? values.data.AlertMinrr
          ? values.data.AlertMinrr.value
          : ''
        : '';

      stMax = values.data
        ? values.data.AlertMaxst
          ? values.data.AlertMaxst.value
          : ''
        : '';
      stMin = data.data
        ? values.data.AlertMinst
          ? values.data.AlertMinst.value
          : ''
        : '';

      mtMax = values.data
        ? values.data.AlertMaxmt
          ? values.data.AlertMaxmt.value
          : ''
        : '';
      mtMin = values.data
        ? values.data.AlertMinmt
          ? values.data.AlertMinmt.value
          : ''
        : '';
    }

    if (isButtonTapped) {
      return (
        <View style={{width: width * 0.84, height: height * 0.05}}>
          <View
            style={{
              width: width * 0.8,
              height: 22,
              flexDirection: 'row',
              position: 'absolute',
              bottom: 5,
            }}>
            <View
              style={{width: width * 0.2, height: 22, flexDirection: 'row'}}>
              <Image
                source={require('../../../img/heart.png')}
                style={{width: 20, height: 18}}
              />
              <Text
                allowFontScaling={false}
                style={[
                  styles.nameText,
                  {
                    color: isDarkMode ? 'white' : 'rgba(70,70,70,1.0)',
                    fontSize: 13,
                    marginLeft: height * 0.005,
                  },
                ]}>
                {hrMin}-{hrMax}
              </Text>
            </View>

            <View
              style={{width: width * 0.2, height: 22, flexDirection: 'row'}}>
              <Image
                source={require('../../../img/respiratory.png')}
                style={{width: 20.5, height: 15.5, marginLeft: height * 0.01}}
              />
              <Text
                allowFontScaling={false}
                style={[
                  styles.nameText,
                  {
                    color: isDarkMode ? 'white' : 'rgba(70,70,70,1.0)',
                    fontSize: 13,
                    marginLeft: height * 0.005,
                  },
                ]}>
                {rrMin}-{rrMax}
              </Text>
            </View>

            <View
              style={{width: width * 0.2, height: 22, flexDirection: 'row'}}>
              <Image
                source={require('../../../img/stress.png')}
                style={{width: 20, height: 24.5, marginLeft: height * 0.01}}
              />
              <Text
                allowFontScaling={false}
                style={[
                  styles.nameText,
                  {
                    color: isDarkMode ? 'white' : 'rgba(70,70,70,1.0)',
                    fontSize: 13,
                    marginLeft: height * 0.005,
                  },
                ]}>
                {stMin}-{stMax}
              </Text>
            </View>
            <View
              style={{width: width * 0.2, height: 22, flexDirection: 'row'}}>
              <Image
                source={require('../../../img/motion.png')}
                style={{width: 20, height: 20, marginLeft: height * 0.01}}
              />
              <Text
                allowFontScaling={false}
                style={[
                  styles.nameText,
                  {
                    color: isDarkMode ? 'white' : 'rgba(70,70,70,1.0)',
                    fontSize: 13,
                    marginLeft: height * 0.005,
                  },
                ]}>
                {mtMin}-{mtMax}
              </Text>
            </View>
          </View>
        </View>
      );
    } else {
      return <View />;
    }
  }

  _renderLargeGraph() {
    const {selectedGraphIndex, selectedHour, currentSelectedGraph} = this.state;
    const {isDarkMode} = this.props;
    let heartData, respiratoryData, stressData, tempData;
    let timeInterval;
    if (selectedHour === 1) {
      heartData = this.state.heartHistoryArray;
      respiratoryData = this.state.respiratoryHistoryArray;
      stressData = this.state.stressHistoryArray;
      tempData = this.state.tempHistoryArray;
      timeInterval = 60;
    } else {
      heartData = this.state.heartArrayExtended;
      respiratoryData = this.state.respiratoryArrayExtended;
      stressData = this.state.stressArrayExtended;
      tempData = this.state.tempArrayExtended;
      timeInterval = 60 * selectedHour;
    }

    const {
      loadingGraph,
      heartHistoryArray,
      respiratoryHistoryArray,
      stressHistoryArray,
      tempHistoryArray,
    } = this.state;

    let backgroundGradientFrom;
    let backgroundGradientTo;

    if (selectedGraphIndex == 0) {
      backgroundGradientFrom = 'rgba(163,38,38,0.3)';
      backgroundGradientTo = 'rgba(163,38,38,1.0)';
    } else if (selectedGraphIndex == 1) {
      backgroundGradientFrom = 'rgba(115,177,248,0.4)';
      backgroundGradientTo = 'rgba(115,177,248,1.0)';
    } else if (selectedGraphIndex == 2) {
      backgroundGradientFrom = 'rgba(160,206,221,0.4)';
      backgroundGradientTo = 'rgba(160,206,221,1.0)';
    } else if (selectedGraphIndex == 3) {
      backgroundGradientFrom = 'rgba(244,206,138,0.4)';
      backgroundGradientTo = 'rgba(244,206,138,1.0)';
    }

    const chartConfig = {
      backgroundGradientFrom: 'rgba(230,230,230,1.0)',
      backgroundGradientFromOpacity: 0,
      backgroundGradientTo: 'rgba(163,38,38,1.0)',
      backgroundGradientToOpacity: 0.5,
      color: (opacity = 1) => `rgba(131, 131, 131, ${opacity})`,
      strokeWidth: 2, // optional, default 3
      barPercentage: 0.5,
      useShadowColorFromDataset: false, // optional
    };

    const data = {
      labels: ['60', '45', '30', '15', '0'],
      datasets: [
        {
          data: heartData,
          color: (opacity = 1) =>
            isDarkMode
              ? `rgba(115, 177, 248, ${opacity})`
              : `rgba(163, 38, 38, ${opacity})`, // optional
          strokeWidth: 2, // optional
        },
      ],
    };

    const chartConfigRR = {
      backgroundGradientFrom: 'rgba(230,230,230,1.0)',
      backgroundGradientFromOpacity: 0,
      backgroundGradientTo: 'rgba(115,177,248,1.0)',
      backgroundGradientToOpacity: 0.5,
      color: (opacity = 1) => `rgba(131, 131, 131, ${opacity})`,
      strokeWidth: 2, // optional, default 3
      barPercentage: 0.5,
      useShadowColorFromDataset: false, // optional
    };

    const dataRR = {
      labels: ['60', '45', '30', '15', '0'],
      datasets: [
        {
          data: respiratoryData,
          color: (opacity = 1) =>
            isDarkMode
              ? `rgba(244,206,138, ${opacity})`
              : `rgba(53, 131, 247, ${opacity})`, // optional
          strokeWidth: 2, // optional
        },
      ],
    };

    const chartConfigStress = {
      backgroundGradientFrom: 'rgba(230,230,230,0.4)',
      backgroundGradientFromOpacity: 0,
      backgroundGradientTo: 'rgba(160,206,221,1.0)',
      backgroundGradientToOpacity: 0.5,
      color: (opacity = 1) => `rgba(131, 131, 131, ${opacity})`,
      strokeWidth: 2, // optional, default 3
      barPercentage: 0.5,
      useShadowColorFromDataset: false, // optional
    };

    const dataStress = {
      labels: ['60', '45', '30', '15', '0'],
      datasets: [
        {
          data: stressData,
          color: (opacity = 1) => `rgba(82, 161, 189, ${opacity})`,
          strokeWidth: 2, // optional
        },
      ],
    };

    const chartConfigTemp = {
      backgroundGradientFrom: 'rgba(230,230,230,0.4)',
      backgroundGradientFromOpacity: 0,
      backgroundGradientTo: 'rgba(244,206,138,1.0)',
      backgroundGradientToOpacity: 0.5,
      color: (opacity = 1) => `rgba(131, 131, 131, ${opacity})`,
      strokeWidth: 2, // optional, default 3
      barPercentage: 0.5,
      useShadowColorFromDataset: false, // optional
    };

    const dataTemp = {
      labels: ['60', '45', '30', '15', '0'],
      datasets: [
        {
          data: tempData,
          color: (opacity = 1) => `rgba(237, 153, 14, ${opacity})`,
          strokeWidth: 2, // optional
        },
      ],
    };

    let label;
    let labelColor;
    let dataForSecondGraph;
    let configForSecondGraph;
    let isDecimal = false;

    if (currentSelectedGraph === 2) {
      label = 'Respiratory Rate';
      labelColor = 'rgba(115,177,248,1.0)';
      dataForSecondGraph = dataRR;
      configForSecondGraph = chartConfigRR;
    } else if (currentSelectedGraph === 3) {
      isDecimal = true;
      label = 'Stress';
      labelColor = 'rgba(160,206,221,1.0)';
      dataForSecondGraph = dataStress;
      configForSecondGraph = chartConfigStress;
    } else if (currentSelectedGraph === 4) {
      isDecimal = true;
      label = 'Motion';
      labelColor = 'rgba(244,206,138,1.0)';
      dataForSecondGraph = dataTemp;
      configForSecondGraph = chartConfigTemp;
    }

    if (loadingGraph) {
      return <ActivityIndicator size="large" color="gray" />;
    } else if (heartData.length > 0) {
      return (
        <View style={{left: width * 0.01}}>
          <View style={{height: height * 0.34}}>
            <Text
              allowFontScaling={false}
              style={[
                styles.statsText,
                {
                  fontSize: height * 0.02,
                  marginTop: height * 0.04,
                  marginLeft: width * 0.03,
                  color: 'rgba(176,70,62,1.0)',
                },
              ]}>
              Heart Rate
            </Text>

            <LineChart
              data={data}
              width={width * 0.95}
              height={140}
              withDots={false}
              isDecimal={false}
              withVerticalLabels={false}
              verticalLabelRotation={0}
              withInnerLines={false}
              withOuterLines={false}
              withVerticalLines={true}
              withHorizontalLines={true}
              chartConfig={chartConfig}
              bezier
            />
            <View
              style={{
                flexDirection: 'row',
                left: width * 0.06,
                height: height * 0.02,
              }}>
              <Text
                allowFontScaling={false}
                style={{
                  color: 'rgba(131,131,131,1.0)',
                  fontSize: height * 0.016,
                }}>
                (mins){timeInterval}
              </Text>

              <Text
                allowFontScaling={false}
                style={{
                  color: 'rgba(131,131,131,1.0)',
                  fontSize: height * 0.016,
                  marginLeft: width * 0.15,
                }}>
                {timeInterval * 0.75}
              </Text>
              <Text
                allowFontScaling={false}
                style={{
                  color: 'rgba(131,131,131,1.0)',
                  fontSize: height * 0.016,
                  marginLeft: width * 0.15,
                }}>
                {timeInterval * 0.5}
              </Text>
              <Text
                allowFontScaling={false}
                style={{
                  color: 'rgba(131,131,131,1.0)',
                  fontSize: height * 0.016,
                  marginLeft: width * 0.15,
                }}>
                {timeInterval * 0.25}
              </Text>
              <Text
                allowFontScaling={false}
                style={{
                  color: 'rgba(131,131,131,1.0)',
                  fontSize: height * 0.016,
                  marginLeft: width * 0.15,
                }}>
                0
              </Text>
            </View>
          </View>

          <View style={{height: height * 0.34}}>
            <Text
              allowFontScaling={false}
              style={[
                styles.statsText,
                {
                  fontSize: height * 0.02,
                  marginTop: height * 0.02,
                  marginLeft: width * 0.03,
                  color: labelColor,
                },
              ]}>
              {label}
            </Text>

            <LineChart
              data={dataForSecondGraph}
              width={width * 0.95}
              height={140}
              withDots={false}
              isDecimal={isDecimal}
              withVerticalLabels={false}
              verticalLabelRotation={0}
              withInnerLines={false}
              withOuterLines={false}
              withVerticalLines={true}
              withHorizontalLines={true}
              chartConfig={configForSecondGraph}
              bezier
            />
            <View
              style={{
                flexDirection: 'row',
                left: width * 0.06,
                height: height * 0.02,
              }}>
              <Text
                allowFontScaling={false}
                style={{
                  color: 'rgba(131,131,131,1.0)',
                  fontSize: height * 0.016,
                }}>
                (mins){timeInterval}
              </Text>
              <Text
                allowFontScaling={false}
                style={{
                  color: 'rgba(131,131,131,1.0)',
                  fontSize: height * 0.016,
                  marginLeft: width * 0.15,
                }}>
                {timeInterval * 0.75}
              </Text>
              <Text
                allowFontScaling={false}
                style={{
                  color: 'rgba(131,131,131,1.0)',
                  fontSize: height * 0.016,
                  marginLeft: width * 0.15,
                }}>
                {timeInterval * 0.5}
              </Text>
              <Text
                allowFontScaling={false}
                style={{
                  color: 'rgba(131,131,131,1.0)',
                  fontSize: height * 0.016,
                  marginLeft: width * 0.15,
                }}>
                {timeInterval * 0.25}
              </Text>
              <Text
                allowFontScaling={false}
                style={{
                  color: 'rgba(131,131,131,1.0)',
                  fontSize: height * 0.016,
                  marginLeft: width * 0.15,
                }}>
                0
              </Text>
            </View>
          </View>
        </View>
      );
    } else {
      return (
        <Text
          style={[
            styles.statsText,
            {fontSize: height * 0.02, color: 'rgba(142,28,21,1.0)"'},
          ]}>
          No graphs to display
        </Text>
      );
    }
  }

  inntervalaApi() {
    let currentlySelected = getStateItem(DB_KEY.CURRENTLY_SELECTED)
 
    if (currentlySelected !== 'stats') {
      clearInterval(this._interval);
      clearInterval(this._intervalHourly);
    }

    this.getAddSelectApi();
    this.getCurrentHardwareVersion();
  }
  BottomButtonTappeed() {
    this.setState({isButtonTapped: !this.state.isButtonTapped});
    if (!this.state.isButtonTapped) {
      this.fetchThreshold();
      this.getAddSelectApi();
      this.getCurrentHardwareVersion();
      let timeInterval = isEndPointCardio() === true ? 10000 : 200000 // 1o seconds and 200 seconds
    
      this._interval = setInterval(() => {
        this.inntervalaApi();
      }, timeInterval);
    } else {
      clearInterval(this._interval);
      this.setState({isUniqueNameLoading: true});
    }
  }

  _renderBottomButton() {
    const {isButtonTapped, currentTapped, loading} = this.state;
    let isCurrentTapped = currentTapped !== '' ? true : false;

    if (isCurrentTapped === false && loading === false) {
      return (
        <TouchableOpacity
          style={{
            width: width * 0.84,
            height: height * 0.04,
            alignItems: 'center',
            marginTop: isButtonTapped ? height * 0.07 : height * 0.03,
          }}
          onPress={() => this.BottomButtonTappeed()}>
          <Image
            source={
              isButtonTapped
                ? require('../../../img/doubleArrowUp.png')
                : require('../../../img/doubleArrowDown.png')
            }
            style={{width: 30, height: 26}}
          />
        </TouchableOpacity>
      );
    } else {
      return <View />;
    }
  }

 

  _renderExtendedUi() {
    return (<View>{this._renderLargeGraph()}</View>) 
  }

  _renderGraphBigMode() {
    const {isGraphTapped, selectedHour} = this.state;
    const {isDarkMode, ...props} = this.props;

    if (isGraphTapped) {
      return (
        <View
          style={{
            width: width * 0.975,
            height: height * 0.75,
            position: 'absolute',
            backgroundColor: isDarkMode
              ? 'rgba(30,30,32,1.0)'
              : 'rgba(255,255,255,1.0)',
            marginLeft: -width * 0.05,
            borderColor: 'gray',
            borderWidth: 1,
            borderRadius: 9,
          }}>
          <TouchableOpacity
            onPress={() => this.setState({isGraphTapped: false})}>
            <Icon
              name={'cross'}
              size={25}
              color={
                isDarkMode ? 'rgba(230,230,230,1.0)' : 'rgba(30,32,36,1.0)'
              }
              style={{marginLeft: width - 45, marginTop: 10}}
            />
          </TouchableOpacity>
          <View
            style={{
              width: width * 0.975,
              height: 40,
              alignItems: 'center',
              flexDirection: 'row',
            }}>
            <TouchableOpacity
              style={{
                width: 80,
                height: 40,
                backgroundColor:
                  selectedHour === 1 ? 'rgba(90,200,186,1.0)' : 'transparent',
                borderRadius: 20,
                borderColor: 'rgba(111,111,111,0.4)',
                borderWidth: 1,
                justifyContent: 'center',
                alignItems: 'center',
                marginLeft: width * 0.975 - 320,
              }}>
              <Text
                allowFontScaling={false}
                style={{
                  color: isDarkMode
                    ? 'rgba(230,230,230,1.0)'
                    : 'rgba(131,131,131,1.0)',
                }}>
                1 Hour
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                width: 80,
                height: 40,
                borderRadius: 20,
                backgroundColor:
                  selectedHour === 2 ? 'rgba(90,200,186,1.0)' : 'transparent',
                borderColor: 'rgba(111,111,111,0.4)',
                borderWidth: 1,
                justifyContent: 'center',
                marginLeft: 10,
                alignItems: 'center',
              }}>
              <Text
                allowFontScaling={false}
                style={{
                  color: isDarkMode
                    ? 'rgba(230,230,230,1.0)'
                    : 'rgba(131,131,131,1.0)',
                }}>
                2 Hour
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                width: 80,
                height: 40,
                borderRadius: 20,
                borderColor: 'rgba(111,111,111,0.4)',
                backgroundColor:
                  selectedHour === 4 ? 'rgba(90,200,186,1.0)' : 'transparent',
                borderWidth: 1,
                justifyContent: 'center',
                marginLeft: 10,
                alignItems: 'center',
              }}>
              <Text
                allowFontScaling={false}
                style={{
                  color: isDarkMode
                    ? 'rgba(230,230,230,1.0)'
                    : 'rgba(131,131,131,1.0)',
                }}>
                4 Hour
              </Text>
            </TouchableOpacity>
          </View>
          {this._renderExtendedUi()}
        </View>
      );
    }
  }

  render() {
    const {isDarkMode, data, ...props} = this.props;
    const {currentTapped, isButtonTapped} = this.state;
    let isCurrentTapped = currentTapped !== '' ? true : false;
    if (isButtonTapped === true) {
      isCurrentTapped = true;
    }

    var isActive = 'Yes';
    if (
      data !== null &&
      data !== undefined &&
      data.data.Active !== undefined &&
      data.data.Active !== null
    ) {
      isActive = data.data.Active.value;
    }

    var backgroundColor = isDarkMode
      ? 'rgba(30,30,32,1.0)'
      : 'rgba(255,255,255,1.0)';
    var shadowColor = isDarkMode ? '#000' : 'rgba(124,124,124,1.0)';

    return (
      <View
        style={[
          styles.slideInnerContainer,
          {
            backgroundColor: backgroundColor,
            shadowColor: shadowColor,
            height: isCurrentTapped ? height * 0.75 : height * 0.65,
          },
        ]}>
        {this._renderProfileData()}
        {this._renderSpinner()}
        {this._renderHeartData()}
        {this._renderRespiratoryData()}
        {this._renderStressData()}
        {this._renderTemperatureData()}
        {this._renderBottomBox()}
        {this._renderBottomButton()}
        {this._renderThreshold()}
        {this._renderGraphBigMode()}

        {checkGenericNoType(isActive) && (
          <View
            style={[
              styles.slideInnerContainer,
              {
                position: 'absolute',
                backgroundColor: 'rgba(114,114,114,0.3)',
                marginLeft: 0,
                height: isCurrentTapped ? height * 0.75 : height * 0.65,
              },
            ]}>
            <Text
              allowFontScaling={false}
              style={{
                color: 'floralwhite',
                marginTop: 5,
                fontWeight: 'bold',
                width: styles.slideInnerContainer.width - 20,
                textAlign: 'right',
              }}>
              In Active{' '}
            </Text>
          </View>
        )}
      </View>
    );
  }
}
