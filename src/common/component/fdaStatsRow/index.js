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
import {executeApiWith, getLastDataFromAlerts, getThirtyMinutesData} from '../../../api'
import { API_TIMEOUT } from '../../helper/util';
import Icon4 from 'react-native-vector-icons/Feather'
import { isEndPointCardio } from '../../../../galenApiLibrary/config/getBaseURL';

const {width, height} = Dimensions.get('window');

export default class FDAStatsRow extends Component {
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
            alertCount : 0,
            alertText: '',
            alertTime: ''

          };
    }

      componentDidMount() {
         StatsSectionTapped.addStatsSectionTappedListener( this.eventStatsSectionTapped);
         GraphExitLandscapeMode.addGraphExitLandscapeMode(this.eventGraphExitLandscapeMode)
         this.getHourlyData()
       //  this.fetchAlertData()
      }

     async fetchAlertData() {
        const {data, ...props} = this.props;
        const macAddress = data.data.Devid.value;
        let res = await getLastDataFromAlerts(macAddress, "H-R View")
        if (res.status === 200) {
          let json = await res.json()
          let content = json.content
         this.setState({alertText: content[0].data?.Atext?.value, alertTime: content[0].data?.Atext?.valueProvidedOn})
         
        

        }
      }

      eventStatsSectionTapped(){

      }

      eventGraphExitLandscapeMode(){

      }


  getHourlyData() {
    

    this.setState({loading: true});
    this._getOneHourData();
     let timeInterval = isEndPointCardio() === true ? 100000 : 200000 // 1o seconds and 200 seconds
        
    this._intervalHourly = setInterval(() => {
      this._getOneHourData();
    }, timeInterval);
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
        this.setState({loading:false})
        alert("API Delayed response for StatsRow:_getPlotData")
        return
    }
       
     this.setState({loading: false});
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


      _renderHeartData() {
         const {isDarkMode, data, ...props} = this.props;
         let heartRate = '--';
         let friendlyName = ''
  
         if (data !== null && data !== undefined) {
            if (data.data !== null && data.data !== undefined) {
                if (data.data.Hr !== null && data.data.Hr !== undefined) {
                heartRate = data.data.Hr ? Math.round(data.data.Hr.value) : '--';
                friendlyName = data.data?.FriendlyName?.value
                }
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

        return (
            <View
              style={[
                styles.subRow,
                {
                  backgroundColor: isDarkMode ? 'rgba(37,40,44,1.0)' : '#FFF',
                  shadowColor: 'transparent',
                  height: height * 0.34,
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
                  top: -height * 0.024,
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
                  marginTop: Platform.OS === 'ios' ? height * 0.126 : height * 0.138,
                  alignItems: 'center',
                }}>
                
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
                  position: 'absolute',
                  left: styles.subRow.width - 25,
                  marginTop: height * 0.15,
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


  _renderContentForHeart() {
    const {heartHistoryArray, heartTimeArray} = this.state;
    const {isDarkMode} = this.props;
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

   if (heartHistoryArray.length > 0) {
      return (
        <TouchableOpacity>
          <LineChart
            data={data}
            width={styles.subRow.width}
            height={height * 0.10}
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

  _renderRespiratoryData() {
    const {isDarkMode, data, ...props} = this.props;
   
    let RespiratoryRate = '--';
 
    let motion = 0;
   
      if (data !== null && data !== undefined) {
          if (data.data !== null && data.data !== undefined) {
            if (data.data.Rr !== null && data.data.Rr !== undefined) {
              RespiratoryRate = data.data.Rr
                ? Math.round(data.data.Rr.value)
                : '--';
            }
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

    return (
      <View
        style={[
          styles.subRow,
          {
            backgroundColor: isDarkMode ? 'rgba(37,40,44,1.0)' : '#FFF',
            shadowColor: 'transparent',
            height: height * 0.34,
          },
        ]}>
        <Text
          allowFontScaling={false}
          style={[
            styles.statsText,
            {
              fontSize: height * 0.018,
              marginTop: height * 0.01,
              marginLeft: width * 0.03,
              color: 'rgba(115,177,248,1.0)',
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
            top: height * 0.004,
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


        

        <TouchableOpacity
          style={{
            position: 'absolute',
            left: styles.subRow.width - 25,
            width: 25,
            height: 25,
            marginTop: height * 0.18,
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

  _renderContentForRespiratory() {
    const {respiratoryHistoryArray, respiratoryTimeArray} =
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

  if (respiratoryHistoryArray.length > 0) {
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
            height={height * 0.10}
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


      _renderSpinner() {
          if (this.state.loading) {
            return (
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '80%'
                }}>
                <ActivityIndicator size="large" color="gray" />
              </View>
            );
          }
          else {
            return(<View></View>)
          }
        }

    render() {
        const {isDarkMode, data, ...props} = this.props;
        const {loading, alertText, alertTime} = this.state
       
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

        var momentTz = require('moment-timezone');
        var date = ''
        date =  momentTz.tz(alertTime,  'America/Chicago').format("YYYY-MM-DD HH:mm:ss") 
          var myDate =  moment(alertTime,"YYYY-MM-DD").format("DD-MM-YYYY");
        var todayDate = moment().format("DD-MM-YYYY");  
        var yesterdayDate = moment().subtract(1, 'days').format("DD-MM-YYYY");  
        
        if (myDate === todayDate){
            var newTime = moment(alertTime).format("h:mm a");
            date = "Today "+newTime
        }else if (myDate === yesterdayDate){
            var newTime = moment(alertTime).format("h:mm a");
            date = "Yesterday "+newTime
        }else{
            var newTime = moment(alertTime).format("DD MMM  YY, h:mm a");
            date = newTime

        }

        let themeChnaged = getStateItem(DB_KEY.IS_DARK_MODE)
    
        return(
            <View
            style={[
              styles.slideInnerContainer,
              {
                backgroundColor: backgroundColor,
                shadowColor: shadowColor,
                height: height * 0.68
              },
            ]}>
            {this._renderSpinner()}
            {loading === false && this._renderHeartData()}
            {loading === false && this._renderRespiratoryData()}
           
           
            {alertText.length > 0 && <View style={styles.alertView}>
            <View style={styles.rowView}>
               <Icon4 name={'bell'} size = {20} color={'rgba(164,6,12,1.0)'}  />
              <Text style={[styles.alertText, {color: themeChnaged ? 'white' : 'black', fontWeight : themeChnaged ? '300' : 'bold'}]}>{alertText}</Text>
              </View>

              <View style={{alignItems: 'flex-end'}}>
              <Text style={[styles.alertTimeText, {color: themeChnaged ? 'white' : 'black'}]}>{date}</Text>
             </View>  
            </View>}
            </View> 

        )
    }
}