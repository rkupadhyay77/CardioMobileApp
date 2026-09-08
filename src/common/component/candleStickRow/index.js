import React, { Component } from 'react'
import {View,Dimensions, Image,Text} from 'react-native'
import styles from './styles'
import { VictoryCandlestick, VictoryChart, VictoryTheme, VictoryAxis } from "victory-native";
import { getReportsFor } from '../../../../galenApiLibrary/reports';
const {width, height} = Dimensions.get('window');
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import getStateItem from '../../../state/getStateItem';
import { DB_KEY } from '../../helper/keys';
import ThemeChange from '../../../state/emitters/themeChange';


export default class CandleStickRow extends Component {
    constructor(props) {
        super(props)


        this.state = {hrReports:[], RrReports:[], loading: true, tabIndex: 0, themeEnabled: getStateItem(DB_KEY.IS_DARK_MODE), storeDate: '', reports:[]}
        this.fetchReports = this.fetchReports.bind(this);
        this.prepareHearReportsData = this.prepareHearReportsData.bind(this);
        this.prepareRespiratoryReportsData = this.prepareRespiratoryReportsData.bind(this);
       

    }

    componentDidMount() {
      this.setState({loading: true})
       this.fetchReports()
    }

   async fetchReports() {
           const {isDarkMode,payload, ...props} = this.props
           const macAddress  = payload.data?payload.data.Devid?payload.data.Devid.value:'':''
           if (macAddress.length > 0) {
             let reports = await getReportsFor(60, macAddress)
            let lastDaysData = this.filterDataByDays(reports, 7)
             if (lastDaysData.length > 0){
               this.prepareHearReportsData(lastDaysData)
               this.prepareRespiratoryReportsData(lastDaysData)
              }
              this.setState({loading: false, reports : reports})
          }
    }

     filterDataByDays(dataArray, days) {
      // Validate input
      if (!Array.isArray(dataArray)) {
        throw new Error('Input must be an array');
      }
      
      if (typeof days !== 'number' || days <= 0) {
        throw new Error('Days must be a positive number');
      }
      
      // Calculate the cutoff date (current time minus specified days)
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      // Filter the array based on minValueProvidedOn date
      return dataArray.filter(item => {
        if (!item || !item.minValueProvidedOn) return false;
        
        // Parse the UTC date string
        const itemDate = new Date(item.minValueProvidedOn);
        
        // Check if the item date is within the specified range (on or after cutoff date)
        return itemDate >= cutoffDate;
      });
    }
    
    // Example usage:
    // const filteredData = filterDataByDays(yourArray, 3); // Last 3 days

  //   prepareHearReportsData(reports) {
  //     var tempHearReportsData = []
  //     const allDatesArray = [...new Set(reports.map(report => report.minValueProvidedOn.substring(0, 10)))];
  //     console.log("allDatesArray"+JSON.stringify(allDatesArray))
  //     if (allDatesArray.length > 0) {
  //       for (index=0; index < allDatesArray.length; index++) {
  //                let reportDate = allDatesArray[index];
  //                const allDataForReportDate = reports.find(report => report.minValueProvidedOn.substring(0, 10) === reportDate);
  //                console.log("allDataForReportDate"+JSON.stringify(allDataForReportDate))
  //                if (allDataForReportDate.length > 0) {
  //                 debugger
  //                 const newD = allDataForReportDate[0];
                  
  //                 const hrMax = allDataForReportDate.map(allData => allData.data.HrMax.value).reduce((accumulator, currentValue) => accumulator + currentValue, 0);
  //                 const hrMin = allDataForReportDate.map(allData => allData.data.HrMin.value).reduce((accumulator, currentValue) => accumulator + currentValue, 0);
  //                 const hrAvg = allDataForReportDate.map(allData => allData.data.HrAvg.value).reduce((accumulator, currentValue) => accumulator + currentValue, 0);
  //                 let time =   reportDate.substring(8, 10);
  //                 console.log("hrMax:"+hrMax)
  //                 console.log("hrMin:"+hrMin)
  //                 console.log("hrAvg:"+hrAvg)
  //                 console.log("time:"+time)
  //                 if (hrMax !== 0 && hrMin !== 0 && hrAvg !== 0) {
  //                   const dataObject =  { x: time, open: hrAvg/allDataForReportDate.length -.5, close: hrAvg/allDataForReportDate.length+0.5, high: hrMax/allDataForReportDate.length , low: hrMin/allDataForReportDate.length  }
  //                   tempHearReportsData.push(dataObject)
  //                   console.log("dataObject"+JSON.stringify(dataObject))
          
  //                  }
  //                }

  //       }
  //     }
  //     this.setState({hrReports: tempHearReportsData})
  // }

    prepareHearReportsData(reports) {
        var tempHearReportsData = []
        for (var index = 0 ; index < reports.length ; index++) {
           let data  = reports[index].data
           let hrMax = data? data.HrMax? data.HrMax.value: 0: 0
           let hrMin = data? data.HrMin? data.HrMin.value: 0: 0
           let hrAvg = data? data.HrAvg? data.HrAvg.value: 0: 0
           let time =   reports[index].minValueProvidedOn.substring(8, 10);
          // if (hrMax !== 0 && hrMin !== 0 && hrAvg !== 0) {
            const dataObject =  { x: time, open: hrAvg-2, close: hrAvg+2, high: hrMax, low: hrMin }
            tempHearReportsData.push(dataObject)

          // }
          
        }
        this.setState({hrReports: tempHearReportsData})
    }

    prepareRespiratoryReportsData(reports) {
      var tempRespiratoryReportsData = []
      for (var index = 0 ; index < reports.length ; index++) {
         let data  = reports[index].data
         let rrMax = data? data.RrMax? data.RrMax.value: 0: 0
         let rrMin = data? data.RrMin? data.RrMin.value: 0: 0
         let rrAvg = data? data.RrAvg? data.RrAvg.value: 0: 0
         let time =   reports[index].minValueProvidedOn.substring(8, 10);
       //  if (rrMax !== 0 && rrMin !== 0 && rrAvg !== 0) {
          const dataObject =  { x: time, open: rrAvg-.5, close: rrAvg+0.5, high: rrMax, low: rrMin}
          tempRespiratoryReportsData.push(dataObject)
        // }
        
      }
       
      this.setState({RrReports: tempRespiratoryReportsData})
  }

     _renderLogo(){
      const {themeEnabled} = this.state
            return(
                <View style={{width:110, height:35,position:'absolute'}}>
                           <Image source={themeEnabled? require('../../../img/cardioLogoWhite.png'):require('../../../img/cardioLogo.png')} style={{width:100,height:35, marginTop:10}} resizeMode={'contain'}/>
                        </View>
            )
        }

        renderName(){
            const {isDarkMode,payload, ...props} = this.props
            const {themeEnabled} = this.state
            const friendlyName  = payload.data?payload.data.FriendlyName?payload.data.FriendlyName.value:'':''
            const locationName  = payload.data?payload.data.Location?payload.data.Location.value:'':''
            const showLocation =  locationName === ''?'': '('+locationName+')'
            return(
                <View style={{flexDirection:'row',width:width*0.8 - 100, marginLeft: 110, justifyContent: 'flex-end'}}>
                 <Text  allowFontScaling={false} style={{fontSize:height*0.02,color:themeEnabled?'rgba(216,216,217,1.0)':'rgba(216,216,217,1.0)', fontWeight:'bold', marginTop: 10}}>{friendlyName}</Text>
                  {showLocation.length > 0 && <Text  allowFontScaling={false} style={[styles.statsText,{fontSize:height*0.016, marginLeft: width*0.02,color:'rgba(216,216,217,1.0)'}]}>{showLocation}</Text>}
                 </View>
            )
        }

        setTabIndex(index) {

        }

        _renderCandleStick() {
          const {hrReports, themeEnabled} = this.state
          if (hrReports.length > 0 ) {
                return(
                  <View style={styles.graphContainer}>
                          <VictoryChart
                            domainPadding={{ x: 25 }}
                            theme={VictoryTheme.clean}
                            height={height*0.30}
                           >
                           <VictoryAxis
                                dependentAxis // This is the Y-axis
                                style={{
                                  axis: { stroke: "#FF0000" }, // Red Y-axis line
                                  tickLabels: { fill: "#FF0000" }, // Red Y-axis labels
                                  grid: { stroke: "rgba(255, 0, 0, 0.2)" } // Light red grid lines
                                }}
                              />
                              <VictoryAxis
                                style={{
                                  axis: { stroke: themeEnabled ? "#00FF00" : "#010101" }, // Green X-axis line
                                  tickLabels: { fill: themeEnabled ? "#00FF00" : "#010101",  fontSize: 12 }, // Green X-axis labels
                                  grid: { stroke: themeEnabled ? "rgba(0, 255, 0, 0.0)" : "rgba(131, 231, 31, 0.0)" } // Light green grid lines
                                }}
                              />
                            <VictoryCandlestick
                             candleRatio={0.4}
                            candleColors={{
                                positive: "#a4060c",
                                negative: "#a4060c",
                              }}
                              data={hrReports}
                            />
                          </VictoryChart>
                  </View>
                )
              }
              else {
                return(<View></View>)
              }
        }

        _renderRespiratoryCandleStick() {
          const {RrReports, themeEnabled} = this.state
          if (RrReports.length > 0 ) {
                return(
                  <View style={styles.graphContainer}>
                          <VictoryChart
                            domainPadding={{ x: 25 }}
                            theme={VictoryTheme.clean}
                            height={height*0.3}
                          >
                            <VictoryAxis
                                dependentAxis // This is the Y-axis
                                style={{
                                  axis: { stroke: "#FF0000" }, // Red Y-axis line
                                  tickLabels: { fill: "#FF0000" }, // Red Y-axis labels
                                  grid: { stroke: "rgba(255, 0, 0, 0.2)" } // Light red grid lines
                                }}
                              />
                              <VictoryAxis
                                style={{
                                  axis: { stroke: themeEnabled ? "#00FF00" : "#010101" }, // Green X-axis line
                                  tickLabels: { fill: themeEnabled ? "#00FF00" : "#010101" }, // Green X-axis labels
                                  grid: { stroke: themeEnabled ? "rgba(0, 255, 0, 0.0)" : "rgba(31, 31, 31, 0.0)" } // Light green grid lines
                                }}
                              />
                            <VictoryCandlestick
                            candleRatio={0.4}
                            candleColors={{
                                positive: "#1478fa",
                                negative: "#a4060c",
                              }}
                              data={RrReports}
                            />
                          </VictoryChart>
                  </View>
                )
              }
              else {
                return(<View></View>)
              }
         }

         _renderEmptyContent() {
          const {RrReports, hrReports, loading} = this.state
          let  message = loading === true ? 'Fetching Data, Please Wait...' : 'No Data to show'
          let isDark = getStateItem(DB_KEY.IS_DARK_MODE)
          if (RrReports.length === 0 && hrReports.length === 0){
            return(
              <View style={{justifyContent:'center', alignItems: 'center', marginTop: 30}}>
                <Text style={{color: isDark ? 'white' : 'black', fontSize: 14, fontWeight: 'bold'}}>{message}</Text>
              </View>
            )
          }
          else {
            return (
              <View />
            )
          }
         }

     async changeTabIndex(tabIndexC){
      
      this.setState({loading: true,RrReports: [], hrReports:[]})
       const {isDarkMode,payload, ...props} = this.props
       const macAddress  = payload.data?payload.data.Devid?payload.data.Devid.value:'':''
       
      // debugger
      var days = 7
      if (tabIndexC === 1) {
        days = 14
      }else if (tabIndexC === 2) {
        days = 30
      }else if (tabIndexC === 3) {
        days = 60
      }else{
        days = 7
      }

      if (this.state.reports.length === 0) {
       if (macAddress.length > 0) {
          let reports = await getReportsFor(60, macAddress)
          this.setState({loading: false, reports : reports})
          let lastDaysData = this.filterDataByDays(this.state.reports, days)
          if (lastDaysData.length > 0){
            this.prepareHearReportsData(lastDaysData)
            this.prepareRespiratoryReportsData(lastDaysData)
           }
        }
      }
      else {
 // filter the data 
 let lastDaysData = this.filterDataByDays(this.state.reports, days)
 if (lastDaysData.length > 0){
   this.prepareHearReportsData(lastDaysData)
   this.prepareRespiratoryReportsData(lastDaysData)
  }
      }
     


      // this.setState({loading: true})
      // let reports = await getReportsFor(days, macAddress)
      //  this.setState({loading: false})
      // if (reports.length > 0){
      // this.prepareHearReportsData(reports)
      // this.prepareRespiratoryReportsData(reports)
      // }
    }     
        
    render() {
      const {themeEnabled, storeDate} = this.state
       
          var backgroundColor = themeEnabled
          ? 'rgba(30,30,32,1.0)'
          : 'rgba(31,31,31,0.3)';
        var shadowColor = false ? '#000' : 'rgba(124,124,124,1.0)';
        return(
            <View
            style={[
              styles.slideInnerContainer,
              {
                backgroundColor: backgroundColor,
                shadowColor: shadowColor,
                height: height * 0.65,
              },
            ]}>
            {this._renderLogo()}
            {this.renderName()}
            <View style={{width: width * 0.8 - 20, marginLeft:10, marginTop: 10}}>
            <SegmentedControl
    values={['7 Days', '14 Days', '30 Days', '60 Days']}
    selectedIndex={this.state.tabIndex}
    tintColor= {'white'}
    backgroundColor= {'rgba(31,31,31,0.4)'}
    activeFontStyle={{color: 'black'}}
    fontStyle={{color: 'white'}}
    onChange={(event) => this.changeTabIndex(event.nativeEvent.selectedSegmentIndex)}
  />
            </View>
     
            {this._renderEmptyContent()}
            <View style={styles.graphContainerCandelStick}>
            {this.state.hrReports.length > 0 && <Text
              allowFontScaling={false}
              style={
                {
                  fontSize: height * 0.02,
                  marginTop: 10,
                  marginLeft: width * 0.03,
                  color: 'rgba(176,70,62,1.0)',
                }
              }>
              Heart Rate
            </Text>}
            {this._renderCandleStick()}
            </View>
            <View style={styles.graph2ContainerCandelStick}>
            {this.state.RrReports.length > 0 && <Text
              allowFontScaling={false}
              style={
                {
                  fontSize: height * 0.02,
                  marginTop: 10,
                  marginLeft: width * 0.03,
                  color: 'rgba(20,104,250,1.0)',
                  
                }}>
              Respiratory Rate
            </Text>}
            {this._renderRespiratoryCandleStick()}
            </View>
            
           
           
          
                
            </View>
        )
    }
}