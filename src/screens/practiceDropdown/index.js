import React, {Component} from 'react';
import {
    Dimensions,
    Animated,
    Text, 
    View,
    TouchableOpacity
} from 'react-native';

import style from './style';
import TopHeader from '../../common/component/topHeader';

import Loader from '../../common/component/loader';
import DropDownPicker from 'react-native-dropdown-picker';
const {height} = Dimensions.get('window');
import { fetchPracticeList } from '../../../galenApiLibrary/facility';
import getStateItem from '../../state/getStateItem';
import { DB_KEY } from '../../common/helper/keys';

export default class PracticeDropdown extends Component {
  constructor() {
    super();
    this.fetchData = this.fetchData.bind(this);
    this.fillPracticeData = this.fillPracticeData.bind(this);
    this.controller;
    this.state = {yPos: height, bounceValue: new Animated.Value(height), theme: false, isLoading : false,  country: 'uk', isApplyEnabled: false, isOpen: this.controller?.isOpen, dropDownDataList: [], selectcedValue: ''};
  }

    showSheet() {
      Animated.spring(this.state.bounceValue, {
        // eslint-disable-next-line no-undef
        toValue: 0,
        velocity: 3,
        tension: 2,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }
  
    hideSheet() {
      Animated.spring(this.state.bounceValue, {
        // eslint-disable-next-line no-undef
        toValue: height,
        velocity: 3,
        tension: 2,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }

  componentDidMount() {
    this.showSheet()
    this.fetchData()
  }

  async fetchData() {
    this.setState({isLoading: true})
    let user = getStateItem(DB_KEY.USER);
    let supplierId = user?.currentRole?.practice?.supplierId
    let practiceList = await fetchPracticeList(supplierId)
    this.fillPracticeData(practiceList)
    this.setState({isLoading: false})
  }

  fillPracticeData(practiceData) {
    var practiceDataList = []
    for (var index = 0; index < practiceData.length ; index++) {
      let practiceName =  practiceData[index]?.name
      let practiceId =  practiceData[index]?.practiceId
      let data = {label: practiceName, value: practiceId}
      practiceDataList.push(data);
    }

    this.setState({dropDownDataList: practiceDataList})
  }

  _renderLoader() {
    const {isLoading} = this.state
    if (isLoading) {
      return(<Loader></Loader>)
    }
    else {
      return (<View></View>)
    }
  }
  practiceSelected(item) {

  }

  _renderPracticeDropDown() {
   const {dropDownDataList} = this.state
    return (
    <View style={style.dropdownContainer}>
  <DropDownPicker
  controller={instance => this.controller = instance}
    items={dropDownDataList}
    containerStyle={{height: 40}}
    style={{backgroundColor: '#fafafa'}}
    itemStyle={{
        justifyContent: 'flex-start'
    }}
    dropDownStyle={{backgroundColor: '#fafafa'}}
    onChangeItem={practice => this.setState({
        country: practice.value
    })}
/>
            </View>
)
  }

 

  

  

applyTapped() {

}

_renderButton() {
  const {isOpen, isApplyEnabled} = this.state
 var color = isApplyEnabled ? 'white' : 'gray'
  if (isOpen) {
    return (<View></View>)
  }
  else{
    return (
    <View>
        <TouchableOpacity style={[style.buttonStyle, {backgroundColor: color}]}>
         <Text style={[style.applyStyle, {color: isApplyEnabled ? 'rgba(21,21,21,1)' : 'rgba(21,21,21,0.4)'}]}> Save</Text>
       </TouchableOpacity>
    </View> 
    )
  }
}

onHide() {

}

render() {
 // const theme = getStateItem(DB_KEY.IS_DARK_MODE)
 const{ theme, isApplyEnabled} = this.state

    return (
      <TouchableOpacity
        style={style.container}
        onPress={() => this.onHide()}>
         <Animated.View
          style={[
            style.actionContainer,
            {transform: [{translateY: this.state.bounceValue}]},
          ]}>
                       
       {this._renderPracticeDropDown()}
       {this._renderLoader()} 
       {this._renderButton()}


       <Text style={[style.textStyle, {color: 'rgba(241,241,241,0.7)' , width: '100%', marginLeft: 0, textAlign: 'center'}]}>Touch anywhere on the screen to close</Text>
       </Animated.View>
      </TouchableOpacity>
    );
  }
}
