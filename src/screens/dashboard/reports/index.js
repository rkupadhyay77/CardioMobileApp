/**
 * cardio App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { Component } from 'react';
import {
  View,
  Platform
} from 'react-native';

import styles from './styles'
import Header from '../../../common/component/header'
import Loader from '../../../common/component/loader';
import {DB_KEY, RESPONSE_MESSAGE} from '../../../common/helper/keys'
import getStateItem from '../../../state/getStateItem' 
import Carousel, {Pagination} from 'react-native-snap-carousel';
import { getFilteredData,  } from '../../../common/helper/util';
import { getReportsEnabledSensor } from '../../../../galenApiLibrary/reports';

import style, {
  sliderWidth,
  itemWidth,
} from '../../../common/component/candleStickRow/styles';
import CandleStickRow from '../../../common/component/candleStickRow';
import setStateItem from '../../../state/setState/setStateItem';

const SLIDER_1_FIRST_ITEM = 0;

export default class Reports extends Component {
  constructor(props){
      super(props)
      this.state = {themeChanged:getStateItem(DB_KEY.IS_DARK_MODE), loading: false, reportsList: [],activeIndex:0}
  }

  componentDidMount(){
    const {navigation} = this.props;
    this.focusListener = navigation.addListener('didFocus', () => {
      let residentsInfo = getFilteredData(); //getStateItem(DB_KEY.RESIDENT_DATA)
      if (residentsInfo !== null) {
        let residentsArray = getStateItem(DB_KEY.GALEN)
        ? residentsInfo
        : residentsInfo.deviceInfo;
        var reportsListArray = []
       
        for (var index = 0 ; index < residentsArray.length ; index++) {
          let item = residentsArray[index]
        //  console.log("FName:"+item.data?.FriendlyName?.value+"EnableReports:"+item.data?.EnableReports?.value)
          if (item.data?.EnableReports?.value === "Yes") {
            reportsListArray.push(item)
          }
         }
         this.setState({reportsList: reportsListArray});
      }

      let reports = getStateItem(DB_KEY.REPORTS_ARRAY);
      if (reports.length === 0) {
        this.fetchReports()
      }
    })
}

async fetchReports() {
  let user = getStateItem(DB_KEY.USERS_LIST_ARRAY)[0];
  let result = await getReportsEnabledSensor(user.userId)
  this.setState({reportsList: result});
  setStateItem(DB_KEY.REPORTS_ARRAY,result)
}



  componentWillUnmount(){
  }

  
  
 

  _renderLoader() {
    const {loading} = this.state

    if (loading) {
        return (<Loader />)
    }else{
        return (<View />)
    }
}
changeActiveIndex(index) {
this.setState({activeIndex: index})
}

_renderItem({item, index}) {
    const {themeChanged, alertCount} = this.state;

    return (
      <CandleStickRow payload={item} isDarkMode={false}/>
    );
  }

_renderUI() {
  const {reportsList} = this.state
  if (reportsList.length > 0) {
    return(
      <View>
      <Carousel
        layout={'default'}
        ref={ref => (this.carousel = ref)}
        data={this.state.reportsList}
        sliderWidth={sliderWidth}
        itemWidth={itemWidth}
        firstItem={SLIDER_1_FIRST_ITEM}
        inactiveSlideScale={0.94}
        inactiveSlideOpacity={0.7}
        renderItem={this._renderItem.bind(this)}
        containerCustomStyle={styles.slider}
        contentContainerCustomStyle={styles.sliderContentContainer}
        loop={false}
        loopClonesPerSide={2}
        onSnapToItem={index => this.changeActiveIndex(index)}
      />

      <Pagination
        dotsLength={reportsList.length}
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
    )
  }
}



    render(){
      const {themeChanged} = this.state
     
        return (
            <View style= {[styles.container, {backgroundColor:themeChanged?'rgba(27,26,29,1.0)':'rgba(249,249,249,1.0)'}]}>
            <Header isForReports={true} bellIconTapped = {()=> this.bellIconTapped()} style={{backgroundColor:themeChanged?'rgba(30,30,32,1.0)':'white',textColor:themeChanged?'rgba(249,249,249,1.0)':'rgba(50,50,50,1.0)'}}/>
          {this._renderUI()}
             {this._renderLoader()}
            </View>
        )
    }
}