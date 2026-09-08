import React, { Component , createRef} from 'react';
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
  DatePickerIOS
} from 'react-native';

import getStateItem from '../../state/getStateItem'
import {DB_KEY} from '../../common/helper/keys'
import styles from './styles'
import Orientation from 'react-native-orientation-locker'
import {OrientationDidChange} from '../../state/emitters'
import {LineChart} from "react-native-chart-kit";
import Icon from 'react-native-vector-icons/Feather'
import Icon2 from 'react-native-vector-icons/Entypo'
import moment from 'moment'
import DropDownPicker from 'react-native-dropdown-picker'
import 'abortcontroller-polyfill'
import CalendarPicker from 'react-native-calendar-picker';
import { TimePickerModal } from 'react-native-paper-dates'
const {width, height} = Dimensions.get('window')
import TIMEZONE from '../../common/helper/timezone'
import {getLastDataFromAlerts, executeApiWith} from '../../api'
import { API_TIMEOUT } from '../../common/helper/util';
import { GraphExitLandscapeMode } from '../../state/emitters';
import getHeaders from '../../../galenApiLibrary/config/getHeader';
import { getBaseURL } from '../../../galenApiLibrary/config/getBaseURL';
import { isEndPointCardio } from '../../../galenApiLibrary/config/getBaseURL';
import{fetchGraphData} from '../../../galenApiLibrary/graphLandscape/index'

export default class GraphNewLandscape extends Component{
  
    constructor(props){
        super(props)

        this.controller = new AbortController()

        this._onOrientationDidChange = this._onOrientationDidChange.bind(this)
        this.getGraphPlotData = this.getGraphPlotData.bind(this)
        this.state = {
                        themeChanged:getStateItem(DB_KEY.IS_DARK_MODE), 
                        redraw:false,
                        selectedHour:2, 
                        devId:props.navigation.state.params.devId,
                        friendlyName:props.navigation.state.params.friendlyName,
                        macAddress:props.navigation.state.params.macAddress,
                        isLoadingExtended:false,
                        heartArrayExtended:[],
                        respiratoryArrayExtended:[],
                        stressArrayExtended:[],
                        motionArrayExtended:[],
                        heartArrayTimeExtended:[],
                        respiratoryArrayTimeExtended:[],
                        stressArrayTimeExtended:[],
                        heartArrayTimeExtended:[],
                        currentSelectedGraph:props.navigation.state.params.selected?props.navigation.state.params.selected:2,
                        hr:'',
                        rr:'',
                        stress:'',
                        motion:'',
                        timeArray:[],
                        dataPlotes:[],
                        selectedInterval:'',
                        startTime:'',
                        endTime:'',
                        isFetching:false,
                        showingGraph:1,
                        dataPlotsHr:[],
                        timePlotsHR:[],
                        isFetchingSecondGraph:false,
                        showPicker:false,
                        selectedStartDate: '',
                        showTimePicker:false,
                        dateTimeModified:false,
                        alertsArray:[],
                        timeZoneAbr:'CST', 
                        timeZoneStr:'America/Chicago'
                      }
    }


    defaultTimeZone(){
      this.setState({timeZoneAbr:'CST', timeZoneStr:'America/Chicago'})
    }

    getTimeZoneAbr(timeZoneStr){
      let filtered =  TIMEZONE.filter((timezone)=>{
          return timezone.value === timeZoneStr
       })

       if (filtered.length > 0) {
           return filtered[0].abbr
       }

       return ''
   }

   getTimeZone(timeZoneStr){
      let filtered =  TIMEZONE.filter((timezone)=>{
          return timezone.value === timeZoneStr
      })

      if (filtered.length > 0) {
          return filtered[0].utc[0]
      }

      return ''
   }

    componentDidMount(){

      setTimeout(() => {
        Orientation.unlockAllOrientations()
        Orientation.lockToLandscapeLeft()
        StatusBar.setHidden(true);
      }, 500);
          
      
           Orientation.addOrientationListener(this._onOrientationDidChange);
           
           let allResident = getStateItem(DB_KEY.RESIDENT_DATA)
           let filtered = allResident.filter((resident)=> resident.data.Devid.value === this.state.macAddress)
           var currentTimeZonStr = 'America/Chicago'

           if (filtered.length > 0){
             let  resident = filtered[0]
             if (resident.data !== undefined && resident.data !== null && resident.data.Timezone !== undefined && resident.data.Timezone !== null ){
                  let timezone =  resident.data.Timezone.value
                  let abr = this.getTimeZoneAbr(timezone)
                  if (abr !== ''){
                        if (abr == 'CDT'){
                          this.setState({timeZoneAbr:'CDT', timeZoneStr:'America/Chicago'})
                        }else{
                          let tz = this.getTimeZone(timezone)
                          currentTimeZonStr = tz
                          this.setState({timeZoneAbr:abr, timeZoneStr:tz})
                        }
                  }else{
                    this.defaultTimeZone()
                  }
    
             }
           }else{
            this.defaultTimeZone()
           }
                



           var moment = require('moment-timezone');
       
           var timeTDate =  moment.tz( moment.utc(),  currentTimeZonStr)
           
           var todayEndDate = timeTDate.format("DD MMM hh:mm a");
           var todayStartDate = timeTDate.subtract(1,"hours").format("DD MMM hh:mm a"); 
           let tempDataPlotsHr = this.state.heartArrayExtended
           var tempDataPlots  = this.state.respiratoryArrayExtended

           let time2Array = []
           let timeT = moment(todayStartDate, "DD MMM hh:mm a")
           
           var devisor = 15;
           
  
           time2Array.push(timeT.add(devisor*0,'minute').format("hh:mm a"))
           time2Array.push(timeT.add(devisor*1,'minute').format("hh:mm a"))
           time2Array.push(timeT.add(devisor*1,'minute').format("hh:mm a"))
           time2Array.push(timeT.add(devisor*1,'minute').format("hh:mm a"))
           time2Array.push(timeT.add(devisor*1,'minute').format("hh:mm a"))
           //time2Array.push(timeT.add(devisor*1,'minute').format("hh:mm a"))
          // time2Array.push(timeT.add(devisor*1,'minute').format("hh:mm a"))
            
           let currentTime =  moment.tz( moment.utc(),  this.state.timeZoneStr)
           var displayNextBtn = true
           if (currentTime.isAfter(todayEndDate) || currentTime.isSame(timeTDate)){
            displayNextBtn = false
           }
               
   
              //this.setState({startTime:todayStartDate,endTime:todayEndDate,showNextBtn:displayNextBtn ,dataPlotsHr:tempDataPlotsHr, dataPlotes:tempDataPlots, timePlotsHR:time2Array, timeArray:time2Array,timeZoneStr:currentTimeZonStr})
   
              // CALL 2 api and show heart and respiratory rate graph
              
              //let item = {label: '30 mins', value: '30 mins'}

              //this.intervalModified(item, currentTimeZonStr)
   
              //this.fetchLatestData()
              var lteinterval = getStateItem('lteInterval')
              if (lteinterval === undefined || lteinterval === null) {
                lteinterval = 120
              }

             let lteIntervalMiliSeconds = lteinterval * 60 * 1000
              let timeInterval = isEndPointCardio() === true ? 10000 : lteIntervalMiliSeconds // 1o seconds and 200 seconds
                  
             this._interval =   setInterval(() => {this.fetchLatestData()}, timeInterval)
   
             this.getAlerts()
             this._intervalAlert = setInterval(() => {this.getAlerts()}, timeInterval)
              
             setTimeout(() => {
              let item = {label: '2 HR', value: '2 HR'}
              this.intervalModified(item, this.state.timeZoneStr)
            }, 1000);
       }

    componentWillUnmount(){
      StatusBar.setHidden(false);
    }

    onDateChange(date) {
      this.setState({
        selectedStartDate: date,
      });
    }

    async getAlerts(){
      const {devId,macAddress} = this.state

      const promiseGetLastDataFromAlertsTimeout = new Promise((resolve) => (setTimeout(() => resolve(false),  API_TIMEOUT.INTERVAL)))
      const reseGetLastDataFromAlerts = await Promise.race([promiseGetLastDataFromAlertsTimeout,getLastDataFromAlerts(macAddress,"GraphNewLandscape:getAlerts" )])
      if (! reseGetLastDataFromAlerts) {
          alert("API Delayed response for GraphNewLandscape:getAlerts")
          return
      }

      if (reseGetLastDataFromAlerts.status === 200) {
        const res = await reseGetLastDataFromAlerts.json()
        const content = res.content
        if (content.length > 0){
          this.setState({alertsArray:content})
        }
      }
   }

    _onOrientationDidChange = (orientation) => {
        this.setState({redraw:true})
     }

    

    back(){
         clearInterval(this._interval)
         clearInterval( this._intervalAlert )
        OrientationDidChange.emit('ORIENTATION_DID_CHANGE')
        GraphExitLandscapeMode.emit('GRAPH_EXIT_LANDSCAPE_MODE')
        this.props.navigation.goBack()
    }

    intervalModified(item, timeZoneStr1){
      
      const {startTime, endTime,selectedInterval,dateTimeModified,timeZoneStr} = this.state

      if (item.value === selectedInterval){
        return
      }
      
     

      var moment = require('moment-timezone');
      let timeTDate ;

      if (!dateTimeModified){
        timeTDate =  moment.tz( moment.utc(),  timeZoneStr1)
      }else{
        timeTDate= moment(startTime, "DD MMM hh:mm a")
      }
      

         this.setState({selectedInterval:item.value})
        //  var moment = require('moment-timezone');
        //  var timeTDate =  moment.tz( moment.utc(),  'America/Chicago')
        //  var todayEndDate = timeTDate.format("DD MMM hh:mm a");
         var todayStartDate = ''
         var todayEndDate = ''
         
       
         if (item.value === '2 HR'){
          if (!dateTimeModified){
            todayEndDate = timeTDate.format("DD MMM hh:mm a");
          todayStartDate = timeTDate.subtract(2,"hours").format("DD MMM hh:mm a");
          }else{
            todayStartDate = timeTDate.add(2,"hours").format("DD MMM hh:mm a");
          todayEndDate = timeTDate.add(2,"hours").format("DD MMM hh:mm a");
          }
 
         }else if (item.value === '4 HR'){
          if (!dateTimeModified){
            todayEndDate = timeTDate.format("DD MMM hh:mm a");
          todayStartDate = timeTDate.subtract(4,"hours").format("DD MMM hh:mm a");
          }else{
            todayStartDate = timeTDate.add(4,"hours").format("DD MMM hh:mm a");
          todayEndDate = timeTDate.add(4,"hours").format("DD MMM hh:mm a");
          }
 
         }else if (item.value === '6 HR'){
          if (!dateTimeModified){
            todayEndDate = timeTDate.format("DD MMM hh:mm a");
          todayStartDate = timeTDate.subtract(6,"hours").format("DD MMM hh:mm a");
          }else{
            todayStartDate = timeTDate.add(6,"hours").format("DD MMM hh:mm a");
          todayEndDate = timeTDate.add(6,"hours").format("DD MMM hh:mm a");
          }
         }else if (item.value === '8 HR'){
          if (!dateTimeModified){
            todayEndDate = timeTDate.format("DD MMM hh:mm a");
          todayStartDate = timeTDate.subtract(8,"hours").format("DD MMM hh:mm a");
          }else{
            todayStartDate = timeTDate.add(8,"hours").format("DD MMM hh:mm a");
          todayEndDate = timeTDate.add(8,"hours").format("DD MMM hh:mm a");
          }
 
         }else if (item.value === '24 HR'){
          if (!dateTimeModified){
            todayEndDate = timeTDate.format("DD MMM hh:mm a");
          todayStartDate = timeTDate.subtract(24,"hours").format("DD MMM hh:mm a");
          }else{
            todayStartDate = timeTDate.add(24,"hours").format("DD MMM hh:mm a");
          todayEndDate = timeTDate.add(24,"hours").format("DD MMM hh:mm a");
          }
 
         }else if (item.value === '10 HR'){
          if (!dateTimeModified){
            todayEndDate = timeTDate.format("DD MMM hh:mm a");
          todayStartDate = timeTDate.subtract(10,"hours").format("DD MMM hh:mm a");
          }else{
            todayStartDate = timeTDate.add(10,"hours").format("DD MMM hh:mm a");
          todayEndDate = timeTDate.add(10,"hours").format("DD MMM hh:mm a");
          }
          }else if (item.value === '12 HR'){
            if (!dateTimeModified){
              todayEndDate = timeTDate.format("DD MMM hh:mm a");
            todayStartDate = timeTDate.subtract(12,"hours").format("DD MMM hh:mm a");
            }else{
              todayStartDate = timeTDate.add(12,"hours").format("DD MMM hh:mm a");
            todayEndDate = timeTDate.add(12,"hours").format("DD MMM hh:mm a");
            }
             
 
            
         }
         // cancel the previous api
       this.controller.abort()

// change time end date to utc
       var fmt   = "DD MMM hh:mm a";  // must match the input
       var zone  = timeZoneStr1



     let endDateTime = moment.tz(todayEndDate, fmt, zone).utc()
     let currentDateTime = moment.utc()

     var displayNextBtn = true
     if (endDateTime.isAfter(currentDateTime) || endDateTime.isSame(currentDateTime) ){
      displayNextBtn = false
     }

         this.setState({startTime:todayStartDate, endTime:todayEndDate, showNextBtn:displayNextBtn,selectedInterval:item.value,isFetching:true,isFetchingSecondGraph:true,dataPlotes:[],dataPlotsHr:[]}, function () {
            this.getGraphPlotData(todayStartDate, todayEndDate)
          
        }.bind(this));
        
         
    }

    async getGraphPlotData(startTime,endTime) {
         const {macAddress, timeZoneStr} = this.state
         var fmt   = "DD MMM hh:mm a";  // must match the input
        var zone  = timeZoneStr
        var moment = require('moment-timezone');
        let startDateTime = moment.tz(startTime, fmt, zone).utc().format()
        let endDateTime = moment.tz(endTime, fmt, zone).utc().format()
         let res = await fetchGraphData(macAddress, startDateTime, endDateTime)
         this._processGraphPlotResponse(res)
    }

    _processGraphPlotResponse(res){
      const {startTime,selectedInterval} = this.state
        this.setState({isFetching: false, isFetchingSecondGraph:false});
        let content = res.data || [];
        const heartRateArray = [];
        const timeArray = [];
        const respiratoryRateArray = [];
        const stressArray = [];
        const motionArray = [];
        var moment = require('moment-timezone');
        if (content.length > 0){
          for (var index = 0 ; index < content.length ; index++){
            let subContent = content[index]

            let dataValueHr = subContent.attributes ? subContent.attributes?.hr:0
            heartRateArray.push(dataValueHr)

            let dataValueRr = subContent.attributes ? subContent.attributes?.rr:0
            respiratoryRateArray.push(dataValueRr)

            let dataValueStress = subContent.attributes ? subContent.attributes?.stress:0
            stressArray.push(dataValueStress)


            let dataValueMotion = subContent.attributes ? subContent.attributes?.motion:0
            motionArray.push(dataValueMotion)
             
          }

         }

         
         let time2Array = []
         var moment = require('moment-timezone');
         let timeT = moment(startTime, "DD MMM hh:mm a")
         
         var devisor;
         var numberInterval = 4
         if (selectedInterval === '30 mins'){
            devisor = 30/numberInterval
          }if (selectedInterval === '1 HR'){
            devisor = 60/numberInterval
          }if (selectedInterval === '2 HR'){
            devisor = 60*2/numberInterval
          }if (selectedInterval === '4 HR'){
            devisor = 60*4/numberInterval
          }if (selectedInterval === '6 HR'){
            devisor = 60*6/numberInterval
          }if (selectedInterval === '8 HR'){
            devisor = 60*8/numberInterval
          }if (selectedInterval === '10 HR'){
            devisor = 60*10/numberInterval
          }if (selectedInterval === '12 HR'){
            devisor = 60*12/numberInterval
          }if (selectedInterval === '24 HR'){
            devisor = 24*4/numberInterval
          }


         time2Array.push(timeT.add(devisor*0,'minute').format("hh:mm a"))
         time2Array.push(timeT.add(devisor*1,'minute').format("hh:mm a"))
         time2Array.push(timeT.add(devisor*1,'minute').format("hh:mm a"))
         time2Array.push(timeT.add(devisor*1,'minute').format("hh:mm a"))
         time2Array.push(timeT.add(devisor*1,'minute').format("hh:mm a"))
         
         var timeIntervalArray = []
         if(content.length > 3){
          let startDate = content[0].attributes.timestamp
          let endDate = content[content.length-1].attributes.timestamp

          var d = new Date(startDate);
         var d2 = new Date(endDate);
         let numberOfIntervals = 4;
         let diff =  d2.getTime() - d.getTime();
         let intervalLength = diff/numberOfIntervals;

         for(let i = 0 ; i <= numberOfIntervals;i++){
          
          timeIntervalArray.push(moment.tz( moment.utc(d.getTime()+i*intervalLength),  this.state.timeZoneStr).format("hh:mm a"))
          }
         }
        this.setState({heartArrayExtended:heartRateArray, respiratoryArrayExtended:respiratoryRateArray, stressArrayExtended:stressArray, motionArrayExtended:motionArray,timeArray:timeIntervalArray.length > 0 ? timeIntervalArray:time2Array })
       
    }

    previousTimeTapped(){
       // subtract the start date by interval 
       const {startTime, endTime,selectedInterval} = this.state

       var moment = require('moment-timezone');
       let timeT = moment(startTime, "DD MMM hh:mm a")
       var startDate;
       var endDate;
       if (selectedInterval === '30 mins'){
            startDate = timeT.subtract(30, 'minutes').format('DD MMM hh:mm a')
            endDate =  timeT.add(30, 'minutes').format('DD MMM hh:mm a')
           
       }else if (selectedInterval=== '1 HR'){
           
         startDate = timeT.subtract(1, 'hours').format('DD MMM hh:mm a')
            endDate = timeT.add(1, 'hours').format('DD MMM hh:mm a')
      }else if (selectedInterval === '2 HR'){
       
         startDate = timeT.subtract(2, 'hours').format('DD MMM hh:mm a')
            endDate = timeT.add(2, 'hours').format('DD MMM hh:mm a')
     }else if (selectedInterval === '4 HR'){
         startDate = timeT.subtract(4, 'hours').format('DD MMM hh:mm a')
            endDate = timeT.add(4, 'hours').format('DD MMM hh:mm a')
     }else if (selectedInterval=== '6 HR'){
         startDate = timeT.subtract(6, 'hours').format('DD MMM hh:mm a')
         endDate = timeT.add(6, 'hours').format('DD MMM hh:mm a')
     }else if (selectedInterval === '8 HR'){
         startDate = timeT.subtract(8, 'hours').format('DD MMM hh:mm a')
            endDate = timeT.add(8, 'hours').format('DD MMM hh:mm a')
     }else if (selectedInterval === '24 HR'){
         startDate = timeT.subtract(24, 'hours').format('DD MMM hh:mm a')
            endDate = timeT.add(24, 'hours').format('DD MMM hh:mm a')
     }else if (selectedInterval === '10 HR'){
         startDate = timeT.subtract(10, 'hours').format('DD MMM hh:mm a')
            endDate = timeT.add(10, 'hours').format('DD MMM hh:mm a')
     }else if (selectedInterval === '12 HR'){
         startDate = timeT.subtract(12, 'hours').format('DD MMM hh:mm a')
            endDate = timeT.add(12, 'hours').format('DD MMM hh:mm a')
          
     }

     // change time end date to utc
var fmt   = "DD MMM hh:mm a";  // must match the input
var zone  = this.state.timeZoneStr



     let endDateTime = moment.tz(endDate, fmt, zone).utc()
     let currentDateTime = moment.utc()

     var showNext = true
     if (endDateTime.isAfter(currentDateTime) || endDateTime.isSame(currentDateTime) ){
      showNext = false
     }


     this.setState({startTime:startDate, endTime:endDate,showNextBtn:showNext,isFetchingSecondGraph:true,dataPlotes:[],dataPlotsHr:[]}, function () {
      this.getGraphPlotData(startDate, endDate)
  }.bind(this));
  

    }
    nextTimeTapped(){
        const {startTime, endTime,selectedInterval} = this.state

       var moment = require('moment-timezone');
       let timeT = moment(startTime, "DD MMM hh:mm a")

       var startDate;
       var endDate;
       
       if (selectedInterval === '30 mins'){
            startDate = timeT.add(30, 'minutes').format('DD MMM hh:mm a')
            endDate =  timeT.add(30, 'minutes').format('DD MMM hh:mm a')
       }else if (selectedInterval=== '1 HR'){
           
         startDate = timeT.add(1, 'hours').format('DD MMM hh:mm a')
            endDate = timeT.add(1, 'hours').format('DD MMM hh:mm a')
      }else if (selectedInterval === '2 HR'){
       
         startDate = timeT.add(2, 'hours').format('DD MMM hh:mm a')
            endDate = timeT.add(2, 'hours').format('DD MMM hh:mm a')
     }else if (selectedInterval === '4 HR'){
         startDate = timeT.add(4, 'hours').format('DD MMM hh:mm a')
            endDate = timeT.add(4, 'hours').format('DD MMM hh:mm a')
     }else if (selectedInterval=== '6 HR'){
         startDate = timeT.add(6, 'hours').format('DD MMM hh:mm a')
         endDate = timeT.add(6, 'hours').format('DD MMM hh:mm a')
     }else if (selectedInterval === '8 HR'){
         startDate = timeT.add(8, 'hours').format('DD MMM hh:mm a')
            endDate = timeT.add(8, 'hours').format('DD MMM hh:mm a')
     }else if (selectedInterval === '24 HR'){
         startDate = timeT.add(24, 'hours').format('DD MMM hh:mm a')
            endDate = timeT.add(24, 'hours').format('DD MMM hh:mm a')
     }else if (selectedInterval === '10 HR'){
         startDate = timeT.add(10, 'hours').format('DD MMM hh:mm a')
            endDate = timeT.add(10, 'hours').format('DD MMM hh:mm a')
     }else if (selectedInterval === '12 HR'){
         startDate = timeT.add(12, 'hours').format('DD MMM hh:mm a')
            endDate = timeT.add(12, 'hours').format('DD MMM hh:mm a')
           
     }

     this.setState({startTime:startDate, endTime:endDate,isFetchingSecondGraph:true,dataPlotes:[],dataPlotsHr:[]}, function () {
      this.getGraphPlotData(startDate, endDate)
  }.bind(this));
    }
    dateTapped(){
    this.setState({showPicker:true})
    }

    timeTapped(){
    this.setState({showTimePicker:true})
    }

    handleStartDateTapped(){
      
        this.setState({showPicker:true})
    }

    handleStartTimeTapped(){
      this.setState({showPicker:true})
    }

    _renderBackButton(){
        const {themeChanged, startTime, endTime} = this.state

        const dateStr = startTime.substring(0, 6)
        const timeStr = startTime.substring(7, 15)+'('+this.state.timeZoneAbr+')'

       
       

    
        return(
            <TouchableOpacity style={{width:70,height:40,alignItems:'center',flexDirection:'row',marginTop:5}} onPress={()=> this.back()}>
                 <View style={styles.iconContainer} >
                  <Icon name = {'chevron-left'} size = {20} color={themeChanged ? 'rgba(249,249,249,1.0)' : 'rgba(60,60,60,1.0)' }/>
                  <Text  allowFontScaling={false} style={{color: themeChanged?'rgba(230,230,230,1.0)':'rgba(60,60,60,1.0)',marginTop:2}}>Back</Text> 
                  </View> 

                  <View style = {{marginLeft:height*0.12,height:40,width:100,borderRadius:8}}>
                  <DropDownPicker
    items={[
       {label: '2 HR', value: '2 HR'},
        {label: '4 HR', value: '4 HR'},
        {label: '6 HR', value: '6 HR'},
        {label: '8 HR', value: '8 HR'},
        {label: '10 HR', value: '10 HR'},
        {label: '12 HR', value: '12 HR'},
        {label: '24 HR', value: '24 HR'},
    ]}
    defaultValue={this.state.selectedInterval}
    containerStyle={{height: 40}}
    style={{backgroundColor: '#fafafa'}}
    itemStyle={{
        justifyContent: 'flex-start'
    }}
    dropDownStyle={{backgroundColor: '#fafafa'}}
   onChangeItem={item => this.intervalModified(item, this.state.timeZoneStr)
   }
/>
                  </View>


                  <TouchableOpacity style={{marginLeft:height*0.03, width:25,height:25,marginTop:8}} onPress={()=> this.previousTimeTapped()}>
                  <Icon2 name = {'arrow-bold-left'} size = {18} color={themeChanged ? '#fafafa' : 'rgba(10,26,181,0.6)'  } />
                  </TouchableOpacity>
                 
                 <TouchableOpacity style = {{height:32,width:null,borderRadius:8, borderWidth:1,borderColor: themeChanged ? '#fafafa': 'blue'}} onPress={()=> this.dateTapped()}>
                 <Text  allowFontScaling={false} style={[styles.statsText,{fontSize:16,marginTop:6, marginLeft:5,color:themeChanged ? '#fafafa': 'rgba(10,26,181,0.6)' }]}>{dateStr} </Text>
                
                </TouchableOpacity>

                <TouchableOpacity style = {{height:32,width:130,borderRadius:8, borderWidth:1,borderColor:themeChanged ? '#fafafa':'blue',marginLeft:5}} onPress={()=> this.timeTapped()}>
                 <Text  allowFontScaling={false} style={[styles.statsText,{fontSize:16,marginTop:6, marginLeft:5,color:themeChanged ? '#fafafa':'rgba(10,26,181,0.6)' }]}>{timeStr}</Text>
                
                </TouchableOpacity>

                 {this.state.showNextBtn && <TouchableOpacity style={{width:25,height:25,marginTop:8,marginLeft:5}} onPress={()=> this.nextTimeTapped()}>
                  <Icon2 name = {'arrow-bold-right'} size = {18} color={themeChanged ? '#fafafa':'rgba(10,26,181,0.6)'}/>
             
                  </TouchableOpacity>} 

                  
                 
                  <View style={{marginLeft:height*0.6,position:'absolute',width:null,height:null,flexDirection:'row'}} >
                  <Text  allowFontScaling={false} style={[styles.statsText,{fontSize:height*0.023,marginTop:width*0.01,color:'rgba(147,147,147,1.0)'}]}>{endTime}</Text>
                 
                </View>
                  

            </TouchableOpacity>
        )
    }
    nextGraphTapped(){
      const {currentSelectedGraph} = this.state
      var graphValue = currentSelectedGraph
       if (currentSelectedGraph === 2){
         graphValue = 3
      }else if (currentSelectedGraph === 3){
         graphValue = 4
      }

      this.setState({currentSelectedGraph:graphValue})

    }

    previousGraphTapped(){
         const {currentSelectedGraph} = this.state
         var graphValue = currentSelectedGraph
         if (currentSelectedGraph === 4){
            graphValue = 3
         }else if (currentSelectedGraph === 3){
            graphValue = 2
         }

         this.setState({currentSelectedGraph:graphValue})
    }

    _renderFirstGraph(){
      const {dataPlotsHr, timePlotsHR,themeChanged,showingGraph,isFetching,alertsArray, selectedInterval, timeArray,heartArrayExtended} = this.state

      if (heartArrayExtended.length > 0){
        const data = {
            labels: timeArray,
            datasets: [
              {
                data: heartArrayExtended,
                color: (opacity = 1) => themeChanged? `rgba(255, 255, 255, ${opacity})`: `rgba(163, 38, 38, ${opacity})`, // optional
                strokeWidth: 2, // optional
              }
            ],
          };

          const chartConfig = {
            backgroundGradientFrom: 'rgba(230,230,230,1.0)',
            backgroundGradientFromOpacity: 0,
            backgroundGradientTo: 'rgba(163,38,38,1.0)',
            backgroundGradientToOpacity: 0.5,
            color: themeChanged ?(opacity = 1) => `rgba(255, 255, 255, ${opacity})` : (opacity = 1) => `rgba(131, 131, 131, ${opacity})`,
            strokeWidth: 2, // optional, default 3
            barPercentage: 0.5,
            useShadowColorFromDataset: false // optional
          };

          let labelColor = 'rgba(163,38,38,1.0)'
          let labelMessage = 'Heart Rate' 

          const highestValue = this.getHighestValue(heartArrayExtended)
          const minimumValue = this.getMinimumValue(heartArrayExtended)
          const averageValue = this.getAverageValue(heartArrayExtended)

          var alertType = ''; 
          if (alertsArray.length > 0){
             if (alertsArray[0].data){
                if (alertsArray[0].data.AlertType === 'Hr'){
                  alertType = alertsArray[0].data.AlertType.value
                }
             }
          }

          const alertMessage = alertType.length > 0 ? 'Last Alert:'+ alertsArray[0].data.TimestampA.value+' '+alertsArray[0].data.Atext.value:  'Last Alert: NA'
          var latestHR = 0 

          if (heartArrayExtended.length > 0){
            const lastObject = heartArrayExtended[heartArrayExtended.length-1]
            latestHR = Math.round(lastObject) 
          }

          var currentHR = latestHR//this.state.hr > 0 ? Math.round(this.state.hr) : this.state.hr

          var fmt   = "DD MMM hh:mm a";  // must match the input
      var zone  = this.state.timeZoneStr
      
      
      
      var moment = require('moment-timezone');
       
      var timeTDate =  moment.tz( moment.utc(),  this.state.timeZoneStr)
      
      var todayEndDate = timeTDate.format("DD MMM hh:mm a");

          if (selectedInterval == '30 mins' && this.state.endTime === todayEndDate){
            currentHR = latestHR
          }



          return(
            <View style={{width:height,height:width*0.5 - 20,position:'absolute',marginTop:40}}>
            
             <LineChart
                    data={data}
                    width={height*0.98 - width*0.42}
                    height={width*0.5 - 20}
                    withDots = {false}
                     isDecimal = {false}
                     withVerticalLabels={timeArray.length !== 5}
                     verticalLabelRotation={0}
                     withInnerLines={true}
                     withOuterLines={true}
                     withVerticalLines={false}
                     withHorizontalLines={true}
                    chartConfig={chartConfig}
                    bezier
                />

               {timeArray.length === 5 &&  <View style={{marginTop:width*0.5 - 45, marginLeft:40,height:30, width:height*0.98 - width*0.42-40,position:'absolute', flexDirection:'row'}} >
                <Text  allowFontScaling={false} style={{flex:0.20, textAlign:'left', color:'gray'}}>{timeArray[0]}</Text>
                <Text  allowFontScaling={false} style={{flex:0.20, textAlign:'center', color:'gray'}}>{timeArray[1]}</Text>
                <Text  allowFontScaling={false} style={{flex:0.20, textAlign:'center', color:'gray'}}>{timeArray[2]}</Text>
                <Text  allowFontScaling={false} style={{flex:0.20, textAlign:'right', color:'gray'}}>{timeArray[3]}</Text>
                <Text  allowFontScaling={false} style={{flex:0.20, textAlign:'right', color:'gray'}}>{timeArray[4]}</Text>
                </View>}

<Text allowFontScaling={false} style={{fontSize:height*0.019,position:'absolute',width:height*0.97 - width*0.42,textAlign:'right'}}>Heart Rate: {latestHR} BPM</Text>
             
              <View style={{position:'absolute', marginLeft: height*0.98 - width*0.42+ 10, width:width*0.42+ 5 - 10, height: width*0.42+ 5 - 10,borderColor:'gray',shadowColor: '#000',shadowOffset: { width: 0, height: 1 },shadowOpacity: 0.8,shadowRadius: width*0.01,  elevation: 2,borderRadius:width*0.01,borderWidth:1, marginTop: width*0.02,backgroundColor:'rgba(241,241,241,1.0)' }}>
              <Text  allowFontScaling={false} style={{fontSize:height*0.029, fontWeight:'bold',color:labelColor,position:'absolute',width:width*0.42+ 5 - 10,textAlign:'center'}}>{labelMessage}</Text>
              <Text  allowFontScaling={false} style={{fontSize:height*0.11, fontWeight:'bold',color:labelColor,position:'absolute',width:width*0.42+ 5 - 10,textAlign:'center',marginTop:width*0.02,shadowColor: '#000',shadowOffset: { width: 0, height: 0.3 },shadowOpacity: 0.8,  elevation: 2,}}>{currentHR}</Text>
             <Text  allowFontScaling={false} style={{fontSize:height*0.018, fontWeight:'600',color:labelColor,position:'absolute',textAlign:'right',marginTop:width*0.26,width:width*0.40}}>Beats per minute</Text>
              
              <View style={{width:width*0.42+ 5 - 12, height:width*0.043, backgroundColor:'#E2C9CB',position:'absolute',marginTop:width*0.33-5,borderBottomWidth:0.5,borderBottomColor:'gray',justifyContent:'center'}} >
              <Text  allowFontScaling={false} style={{fontSize:width*0.026, fontWeight:'bold',color:labelColor,width:width*0.42+ 5 - 10,textAlign:'center'}}>Average:{averageValue} High:{highestValue} Low:{minimumValue}</Text>
             
              </View>
                  


             <View style={{width:width*0.42+ 5 - 12 , backgroundColor:'#E2C9CB', borderBottomRightRadius:width*0.01,borderBottomLeftRadius:width*0.01,height:width*0.043,position:'absolute',marginTop:width*0.37-4,justifyContent:'center'}} />
             <Text  allowFontScaling={false} style={{fontSize:width*0.023, fontWeight:'bold',color:labelColor,width:width*0.42+ 5 - 10,textAlign:'center',marginTop:width*0.36+3,position:'absolute'}}>{alertMessage} </Text>
             
              </View>

            </View>
          )


      }else if (isFetching){
         return (
            <View style={{width:height,height:width*0.5 - 20,position:'absolute',marginTop:40,justifyContent:'center',alignItems:'center'}}>
              <ActivityIndicator size="small" color="rgba(163,38,38,1.0)" />
            </View>
          )
      }else{
        return( <View style={{width:height,height:width*0.5 - 20,position:'absolute',marginTop:40,justifyContent:'center',alignItems:'center'}}>
            
        <Text style={{color : themeChanged ? '#fafafa': 'black'}}>No Heart graph data from {this.state.startTime} to {this.state.endTime}</Text>
      </View>)
     }

      
      
    }

   
    async fetchLatestData(){
      let url = getBaseURL() + "data/devicedata-advanced?sortBy=data.Timestamp.value&sortOrder=DESC"
           const header = getHeaders()
            const now = moment();

             var lteinterval = getStateItem('lteInterval')
                          if (lteinterval === undefined || lteinterval === null) {
                            lteinterval = 120
                          }
                      
                          var bufferValue = getStateItem('bufferValue')
                          if (bufferValue === undefined || bufferValue === null) {
                              bufferValue = 5
                          }
                      
                          let totalMinutes = lteinterval + bufferValue
            let endDateTime = now.utc().format()
            let startDateTime = now.utc().subtract(totalMinutes,"minutes").format()
        
           var raw = JSON.stringify(
              {
                "deviceDataModelId": "d36a4373-fbdc-44a3-8c96-4bb920041e40",
                "devicePropertyCodes": ["DevidPvital","Rr","Hr","Stress","Motion","TimeStamp"],
                "deviceCriteria":[{"key":"Timestamp","operator":"Between","valueFrom":startDateTime,"valueTo":endDateTime},{"key":"DevidPvital","operator":"Equal","value":this.state.macAddress}],
          }
            );
  
        
            
           
            let heartHistoryArray = []
            let respiratoryHistoryArray = []
            let stressHistoryArray = []
            let tempHistoryArray = []
            let timeArray = []

            const res = await executeApiWith(url, "Post", raw, header, "graphNewLandscape:fetchLatestData" )

            
            if (res.status === 200){
              let jsonData = await res.json()
            
              
   
                     if (jsonData.content.length > 0){
                     
                       let reversedArray = jsonData.content
   
                     
   
                          let lastObject = reversedArray[0]
                          let hr = lastObject.data.Hr? parseInt(lastObject.data.Hr.value):''
                          let rr = lastObject.data.Rr?parseInt(lastObject.data.Rr.value):''
                          let stress = lastObject.data.Stress ? lastObject.data.Stress.value >= 10 ? Math.round( lastObject.data.Stress.value) :  lastObject.data.Stress.value.toFixed(1) : '';
                         let motion = lastObject.data.Motion?parseInt(lastObject.data.Motion.value):''
                     
                          
                            this.setState({hr:hr,rr:rr, stress:stress,motion:motion})
                           
                    }
            }
           
      
    }

    _renderSecondGraph(){
      const {timeArray,themeChanged,isFetchingSecondGraph,currentSelectedGraph,alertsArray,selectedInterval, respiratoryArrayExtended, stressArrayExtended, motionArrayExtended} = this.state
     
      var dataPlotToShow = [] 
      if (currentSelectedGraph === 2){
        dataPlotToShow = respiratoryArrayExtended
      }
      else if (currentSelectedGraph === 3){
        dataPlotToShow = stressArrayExtended
      }
      else if (currentSelectedGraph === 4){
        dataPlotToShow = motionArrayExtended
      }
      else{
        dataPlotToShow = []
      }

      console.log('dataPlotToShow', dataPlotToShow.length)

      if (dataPlotToShow.length > 0){
         const chartConfigRR = {
            backgroundGradientFrom: 'rgba(230,230,230,1.0)',
            backgroundGradientFromOpacity: 0,
            backgroundGradientTo: 'rgba(115,177,248,1.0)',
            backgroundGradientToOpacity: 0.5,
            color: themeChanged ?(opacity = 1) => `rgba(255, 255, 255, ${opacity})` : (opacity = 1) => `rgba(131, 131, 131, ${opacity})`,
            strokeWidth: 4, // optional, default 3
            barPercentage: 0.8,
            useShadowColorFromDataset: false // optional
          };
  
  
          const dataRR = {
            labels: this.state.timeArray,
            datasets: [
              {
                data: respiratoryArrayExtended,
                color: (opacity = 1) => themeChanged? `rgba(255,255,255, ${opacity})`:`rgba(53, 131, 247, ${opacity})`, // optional
                strokeWidth: 2, // optional
              }
            ],
          };
  
  
          const chartConfigStress = {
            backgroundGradientFrom: 'rgba(230,230,230,0.4)',
            backgroundGradientFromOpacity: 0,
            backgroundGradientTo: 'rgba(160,206,221,1.0)',
            backgroundGradientToOpacity: 0.5,
            color: themeChanged ?(opacity = 1) => `rgba(255, 255, 255, ${opacity})` : (opacity = 1) => `rgba(131, 131, 131, ${opacity})`,
            strokeWidth: 2, // optional, default 3
            barPercentage: 0.5,
            useShadowColorFromDataset: false // optional
          };
  
  
          const dataStress = {
            labels: this.state.timeArray,
            datasets: [
              {
                data: stressArrayExtended,
                color: (opacity = 1) => `rgba(82, 161, 189, ${opacity})`,
                strokeWidth: 2, // optional
              }
            ],
          };
  
  
          const chartConfigTemp = {
            backgroundGradientFrom: 'rgba(230,230,230,0.4)',
            backgroundGradientFromOpacity: 0,
            backgroundGradientTo: 'rgba(244,206,138,1.0)',
            backgroundGradientToOpacity: 0.5,
            color: themeChanged ?(opacity = 1) => `rgba(255, 255, 255, ${opacity})` : (opacity = 1) => `rgba(131, 131, 131, ${opacity})`,
            strokeWidth: 2, // optional, default 3
            barPercentage: 0.5,
            useShadowColorFromDataset: false // optional
          };
  
  
          const dataTemp = {
            labels: this.state.timeArray,
            datasets: [
              {
                data: motionArrayExtended,
                color: (opacity = 1) => `rgba(237, 153, 14, ${opacity})`,
                strokeWidth: 2, // optional
              }
            ],
          };

          var dataForSecondGraph;
          var chartConfigForSecondGraph;
          var errorLabel;
          var labelColor;
          var labelMessage;
          var currentValue;
          var boxMessage;
          var boxColor;


          var alertType = ''; 
          if (alertsArray.length > 0){
             if (alertsArray[0].data){
                if (alertsArray[0].data.AlertType === 'Hr'){
                  alertType = alertsArray[0].data.AlertType.value
                }
             }
          }

          const alertMessage =  'Last Alert: NA'

          var latestHR = 0 

          if (dataPlotToShow.length > 0){
            const lastObject = dataPlotToShow[dataPlotToShow.length-1]
            latestHR = Math.round(lastObject)
          }

          if (currentSelectedGraph === 2){
            dataForSecondGraph = dataRR
            chartConfigForSecondGraph = chartConfigRR
            errorLabel = "Breath graph"
            labelColor = 'rgba(115,177,248,1.0)'
            labelMessage = 'Breath Rate'
            currentValue = this.state.rr
            boxMessage = 'Breath per minute'
            boxColor = '#D0DEEE'

          }else if (currentSelectedGraph === 3){
            dataForSecondGraph = dataStress
            chartConfigForSecondGraph = chartConfigStress
            errorLabel = "Stress graph"
            labelMessage = 'Stress'
            
            labelColor = 'rgba(160,206,221,1.0)'
            currentValue = this.state.stress
            boxMessage = ''
            boxColor = '#E4EDF0'

          }else if (currentSelectedGraph === 4){
            dataForSecondGraph = dataTemp
            chartConfigForSecondGraph = chartConfigTemp
            errorLabel = "Motion graph"
            labelMessage = 'Motion'
            labelColor = 'rgba(244,206,138,1.0)'
            currentValue = this.state.motion
            boxMessage = ''
            boxColor = '#F5EEE1'

          }

          currentValue = currentValue > 0 ? Math.round(currentValue):currentValue
          var fmt   = "DD MMM hh:mm a";  // must match the input
          var zone  = this.state.timeZoneStr
          var moment = require('moment-timezone');
       
          var timeTDate =  moment.tz( moment.utc(),  this.state.timeZoneStr)
          
          var todayEndDate = timeTDate.format("DD MMM hh:mm a");


          if (selectedInterval == '30 mins' && this.state.endTime === todayEndDate){
            currentValue = latestHR
          }

          const highestValue = this.getHighestValue(dataPlotToShow)
          const minimumValue = this.getMinimumValue(dataPlotToShow)
          const averageValue = this.getAverageValue(dataPlotToShow)

 
           return(
             <View style={{width:height,height:width*0.5 - 10,position:'absolute',marginTop:width*0.5+20}}>
             
              <LineChart
                     data={dataForSecondGraph}
                     width={height*0.98 - width*0.42}
                     height={width*0.5 - 20}
                     withDots = {false}
                     isDecimal = {false}
                     withVerticalLabels={this.state.timeArray.length !== 5}
                     verticalLabelRotation={0}
                     withInnerLines={true}
                     withOuterLines={true}
                     withVerticalLines={false}
                     withHorizontalLines={true}
                     chartConfig={chartConfigForSecondGraph}
                     bezier
                 />
                 
                 {this.state.timeArray.length === 5 &&  <View style={{marginTop:width*0.5 - 45, marginLeft:40,height:30, width:height*0.98 - width*0.42-40,position:'absolute', flexDirection:'row'}} >
                <Text  allowFontScaling={false} style={{flex:0.20, textAlign:'left', color:'gray'}}>{this.state.timeArray[0]}</Text>
                <Text  allowFontScaling={false} style={{flex:0.20, textAlign:'center', color:'gray'}}>{this.state.timeArray[1]}</Text>
                <Text  allowFontScaling={false} style={{flex:0.20, textAlign:'center', color:'gray'}}>{this.state.timeArray[2]}</Text>
                <Text  allowFontScaling={false} style={{flex:0.20, textAlign:'right', color:'gray'}}>{this.state.timeArray[3]}</Text>
                <Text  allowFontScaling={false} style={{flex:0.20, textAlign:'right', color:'gray'}}>{this.state.timeArray[4]}</Text>
                </View>}
                 <Text  allowFontScaling={false} style={{fontSize:height*0.019,position:'absolute',width:height*0.97 - width*0.42,textAlign:'right'}}>{labelMessage}: {latestHR}</Text>
 
              <TouchableOpacity style={{position:'absolute',marginLeft:2, width:30,height:currentSelectedGraph === 2 ? 0 :30,marginTop:width*0.35 - 5}} onPress={()=> this.previousGraphTapped()}>
                  <Icon2 name = {'arrow-bold-left'} size = {20} color={themeChanged ? 'rgba(249,249,249,1.0)' : 'rgba(60,60,60,1.0)' } />
                  </TouchableOpacity>

                <TouchableOpacity style={{position:'absolute',marginLeft:height*0.96-width*0.42, width:30,height:currentSelectedGraph === 4 ? 0 :30,marginTop:width*0.35 - 5}} onPress={()=> this.nextGraphTapped()}>
                  <Icon2 name = {'arrow-bold-right'} size = {20} color={themeChanged ? 'rgba(249,249,249,1.0)' : 'rgba(60,60,60,1.0)' } />
                  </TouchableOpacity>

                  <View style={{position:'absolute', marginLeft: height*0.98 - width*0.42+ 10, width:width*0.42+ 5 - 10, height: width*0.42+ 5 - 10,borderColor:'gray',shadowColor: '#000',shadowOffset: { width: 0, height: 1 },shadowOpacity: 0.8,shadowRadius: width*0.01,  elevation: 2,borderRadius:width*0.01,borderWidth:1, marginTop: width*0.02,backgroundColor:'rgba(241,241,241,1.0)' }}>
              <Text  allowFontScaling={false} style={{fontSize:height*0.029, fontWeight:'bold',color:labelColor,position:'absolute',width:width*0.42+ 5 - 10,textAlign:'center'}}>{labelMessage}</Text>
              <Text  allowFontScaling={false} style={{fontSize:height*0.11, fontWeight:'bold',color:labelColor,position:'absolute',width:width*0.42+ 5 - 10,textAlign:'center',marginTop:width*0.02,shadowColor: '#000',shadowOffset: { width: 0, height: 0.3 },shadowOpacity: 0.8,  elevation: 2,}}>{latestHR}</Text>
             <Text  allowFontScaling={false} style={{fontSize:height*0.018, fontWeight:'600',color:labelColor,position:'absolute',textAlign:'right',marginTop:width*0.26,width:width*0.40}}>{boxMessage}</Text>
              
              <View style={{width:width*0.42+ 5 - 12, height:width*0.043, backgroundColor:boxColor,position:'absolute',marginTop:width*0.33-5,borderBottomWidth:0.5,borderBottomColor:'gray',justifyContent:'center'}} >
              <Text  allowFontScaling={false} style={{fontSize:width*0.026, fontWeight:'bold',color:labelColor,width:width*0.42+ 5 - 10,textAlign:'center'}}>Average {averageValue} High: {highestValue} Low: {minimumValue}</Text>
             
              </View>
                  


             <View style={{width:width*0.41+ 5 - 8 , backgroundColor:boxColor, borderBottomRightRadius:width*0.01,borderBottomLeftRadius:width*0.01,height:width*0.043,position:'absolute',marginTop:width*0.37-4,justifyContent:'center'}} />
             <Text  allowFontScaling={false} style={{fontSize:width*0.023, fontWeight:'bold',color:labelColor,width:width*0.42+ 5 - 10,textAlign:'center',marginTop:width*0.36+3,position:'absolute'}}>{alertMessage}</Text>
             
              </View>

            </View>
           )
 
 
       }else if (isFetchingSecondGraph){
          return (
             <View style={{width:height,height:width*0.5 - 20,position:'absolute',marginTop:width*0.5+30,justifyContent:'center',alignItems:'center'}}>
               <ActivityIndicator size="small" color="rgba(163,38,38,1.0)" />
             </View>
           )
       }else{
          return( <View style={{width:height,height:width*0.5 - 20,position:'absolute',marginTop:width*0.5+30,justifyContent:'center',alignItems:'center'}}>
          <Text style={{color : themeChanged ? '#fafafa': 'black'}}>No graph data from {this.state.startTime} to {this.state.endTime}</Text>
        </View>)
       }
      
    }

     hideDatePicker = () => {
     this.setState({showPicker:false})
    };
  
     handleConfirm = (date) => {
      
      hideDatePicker();
    };

    confirmBtnTapped(){

     // if (this.state.selectedStartDate.length > 0){
       if(this.state.selectedStartDate.length === 0){
        this.setState({showPicker:false})
       }else{
        var moment = require('moment-timezone')
        let dateStr = moment(this.state.selectedStartDate).format('DD MMM')
  
        const {startTime} = this.state
       const timeStr = startTime.substring(7, 15)
  
          let time = dateStr+' '+timeStr
          this.setState({startTime:time,showTimePicker:false})
  
        this.setState({showPicker:false,selectedStartDate:''})
  
        this.handelEndTimeAndCallApi(this.state.selectedInterval,time)
       }
        
      // }else{
      //   
      // }
     
     
    }

    handelEndTimeAndCallApi(selectedInterval,startTime){
    
      var moment = require('moment-timezone');
       let timeTDate = moment(startTime, "DD MMM hh:mm a")

       var todayStartDate = ''
      
    
      if (selectedInterval === '2 HR'){
        
          todayStartDate = timeTDate.add(2,"hours").format("DD MMM hh:mm a");

      }else if (selectedInterval === '4 HR'){
        
          todayStartDate = timeTDate.add(4,"hours").format("DD MMM hh:mm a");

      }else if (selectedInterval === '6 HR'){
        
          todayStartDate = timeTDate.add(6,"hours").format("DD MMM hh:mm a");
      }else if (selectedInterval === '8 HR'){
        
          todayStartDate = timeTDate.add(8,"hours").format("DD MMM hh:mm a");

      }else if (selectedInterval === '24 HR'){
        
          todayStartDate = timeTDate.add(24,"hours").format("DD MMM hh:mm a");

      }else if (selectedInterval === '10 HR'){
        
          todayStartDate = timeTDate.add(10,"hours").format("DD MMM hh:mm a");
}else if (selectedInterval === '12 HR'){
        
         var todayStartDate = timeTDate.add(12,"hours").format("DD MMM hh:mm a");

         
      }
      // cancel the previous api

          // change time end date to utc
var fmt   = "DD MMM hh:mm a";  // must match the input
var zone  = this.state.timeZoneStr



     let endDateTime = moment.tz(todayStartDate, fmt, zone).utc()
     let currentDateTime = moment.utc()

     var displayNextBtn = true
     if (endDateTime.isAfter(currentDateTime) || endDateTime.isSame(currentDateTime) ){
      displayNextBtn = false
     }

    this.controller.abort()
      this.setState({startTime:startTime, endTime:todayStartDate,showNextBtn:displayNextBtn,isFetching:true,isFetchingSecondGraph:true,dataPlotes:[],dataPlotsHr:[],dateTimeModified:true}, function () {
        this.getGraphPlotData(startTime, todayStartDate)
     }.bind(this));
    }


    getHighestValue(data){
      var highestValue = 0 
      var dataSource = data
     

     for(var index = 0; index < dataSource.length ; index++){
       let point = dataSource[index]
       if (point > highestValue){
        highestValue = point
       }
     }

     return  Math.round(highestValue)
    }

    getMinimumValue(data){
      var minimumValue = 0
      var dataSource = data
      

      if (dataSource.length > 0){
        minimumValue = dataSource[0]
      }

     for(var index = 1; index < dataSource.length ; index++){
       let point = dataSource[index]
       if ( point < minimumValue){
              minimumValue = point
       }
     }

     return Math.round(minimumValue)
    }


    getAverageValue(data){
      var totalValue = 0 
      var dataSource = data
      

     for(var index = 0; index < dataSource.length ; index++){
       let point = dataSource[index]
       totalValue += point
     }

     return Math.round(totalValue/dataSource.length)
    }

    _renderCalendarPicker(){
      if(this.state.showPicker){
        return(
          <View style={{width:height, height: width, position:'absolute',backgroundColor:'white'}}>
             

             <CalendarPicker style={{marginTop:10}}
                onDateChange={(date)=> this.setState({selectedStartDate:date})}/>

        <View style={{width:height, height: 40, flexDirection:'row',marginTop:width-75,position:'absolute'}}>
                 <TouchableOpacity style={{width:height*0.40,marginLeft:height*0.05,marginTop:5, borderColor:'black',borderWidth:1,borderRadius:10,justifyContent:'center',alignItems:'center'}} onPress={()=> this.setState({showPicker:false})}>
                     <Text  allowFontScaling={false} style={{fontSize:16, fontWeight:'800'}}>Cancel</Text>
                 </TouchableOpacity>

                 <TouchableOpacity style={{width:height*0.40,marginLeft:height*0.05,marginTop:5,borderColor:'black',borderWidth:1,borderRadius:10,justifyContent:'center',alignItems:'center'}} onPress={()=> this.confirmBtnTapped()}>
                     <Text  allowFontScaling={false} style={{fontSize:16, fontWeight:'800', color:'rgba(11,161,87,1.0)'}}>Confirm</Text>
                 </TouchableOpacity>
 </View>
          </View>
        )
      }
    }

    onConfirm(hours, minutes){
      const {startTime} = this.state
      const dateStr = startTime.substring(0, 6)
        const timeStr = startTime.substring(7, 15)
      if (hours > 12){
       const hour =  hours - 12
       let hourStr = hour <= 9 ? '0'+hour : hour
        let time = dateStr+' '+hourStr+':'+minutes+' pm'
        this.setState({startTime:time,showTimePicker:false})
        this.handelEndTimeAndCallApi(this.state.selectedInterval,time )
      }else{
        let hourStr = hours <= 9 ? '0'+hours : hours
        
        let time = dateStr+' '+hourStr+':'+minutes+' am'
        this.setState({startTime:time,showTimePicker:false})

        this.handelEndTimeAndCallApi(this.state.selectedInterval,time )
      }


     
    }

    getHourValue(){
      const {startTime} = this.state
      const timeStr = startTime.substring(7, 15)
      var hour = timeStr.substring(0, 2);
       let mode = timeStr.substring(6, 8);
       if (mode == 'pm'){
        hour = parseInt(hour)+12
       }
       return hour

    }

    getMinutesValue(){
      const {startTime} = this.state
      const timeStr = startTime.substring(7, 15)
      let minutes = timeStr.substring(3, 5);
       return minutes

    }

    _renderTimePickerModal(){
      const {showTimePicker} = this.state
      const hour = this.getHourValue()
        const minutes = this.getMinutesValue()
      if (showTimePicker){
        return(
          <View>
            <TimePickerModal
                    visible={showTimePicker}
                    onDismiss={()=> this.setState({showTimePicker:false})}
                    onConfirm = {({hours, minutes})=> this.onConfirm(hours, minutes)}
                    hours={hour} // default: current hours
                    minutes={minutes} // default: current minutes
                    label="Select time" // optional, default 'Select time'
                    cancelLabel="Cancel" // optional, default: 'Cancel'
                    confirmLabel="Ok" // optional, default: 'Ok'
                    animationType="fade" // optional, default is 'none'
                    locale={'en'} // optional, default is automically detected by your system
                />
          </View>
        )
      }
      else {
        return (<View></View>)
      }  
    }      



    render(){
        const {themeChanged, showTimePicker,currentSelectedGraph,friendlyName,showPicker,dataPlotes,dataPlotsHr} = this.state

        var labelInstant = currentSelectedGraph === 2 ? 'Vitals as of now' : ''
        const hour = this.getHourValue()
        const minutes = this.getMinutesValue()
        if (dataPlotes.length === 0 || dataPlotsHr.length === 0){
          labelInstant = ''
        }

        return(
            <View style ={[styles.container, {backgroundColor: themeChanged ? 'rgba(27,26,29,1.0)':'rgba(249,249,249,1.0)'}]}>
              {this._renderFirstGraph()}
              {this._renderSecondGraph()}
                {this._renderBackButton()}
               
                {this._renderCalendarPicker()}
                {this._renderTimePickerModal()}
                <Text  allowFontScaling={false} style={{position:'absolute', marginLeft:height*0.83, width:null,marginTop:20,textAlign:'right', fontWeight:'bold',fontSize:20}}>{friendlyName}</Text>
                <Text  allowFontScaling={false} style={{position:'absolute', width:height*0.98 - width*0.06,marginTop:showPicker?10000:width*0.48+ 20,textAlign:'right', fontWeight:'bold'}}>{labelInstant}</Text>
                     
            </View>  
        )
    }
}
