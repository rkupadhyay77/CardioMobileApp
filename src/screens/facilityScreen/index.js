import React, {Component} from 'react';
import {
  View,
  Dimensions,
  Text,
  Animated,
   TouchableOpacity
} from 'react-native';
import style from './styles';

import Loader from '../../common/component/loader';
import DropDownPicker from 'react-native-dropdown-picker';
const {height} = Dimensions.get('window');
import { fetchPracticeList } from '../../../galenApiLibrary/facility';
import getStateItem from '../../state/getStateItem';
import { DB_KEY } from '../../common/helper/keys';
import setStateItem from '../../state/setState/setStateItem';
import { SelectedPracticeChanged } from '../../state/emitters';

export default class FacilityScreenSheet extends Component {
  constructor() {
    super();

    this.state = {yPos: height, bounceValue: new Animated.Value(height), theme: false, isLoading : false,  country: 'uk', isApplyEnabled: false, isOpen: this.controller?.isOpen, dropDownDataList: [], selectcedValue: ''};
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

  callHide() {
    this.hideSheet();
    setTimeout(() => {
      this.props.onPress();
    }, 500);
  }

 
practiceSelected(practice) {
    const {selectcedValue} = this.state;
    if (selectcedValue !== practice.value) {
        this.setState({selectcedValue: practice.value, isApplyEnabled: true})
    }
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
     onChangeItem={practice => this.practiceSelected(practice)}
 />
             </View>
 )
   }


   applyTapped() {
     const {selectcedValue} = this.state
     setStateItem(DB_KEY.SELECTED_PRACTICE_ID, selectcedValue);
     this.callHide()
     
     SelectedPracticeChanged.emit('SELECTED__PRACTICE_CHANGED')
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
          <TouchableOpacity style={[style.buttonStyle, {backgroundColor: color}]} onPress={()=> this.applyTapped()}>
           <Text style={[style.applyStyle, {color: isApplyEnabled ? 'rgba(21,21,21,1)' : 'rgba(21,21,21,0.4)'}]}> Save</Text>
         </TouchableOpacity>
      </View> 
      )
    }
  }

  render() {
  
    return (
      <TouchableOpacity
        style={style.container}
        onPress={() => this.callHide()}>
        <Animated.View
          style={[
            style.actionContainer,
            {transform: [{translateY: this.state.bounceValue}]},
          ]}>
          <View style={style.separatorLine} />
          <Text style={[style.textStyle, {color: 'rgba(241,241,241,0.7)'}]}>Select the Practice from Dropdown:</Text>
      
          {this._renderLoader()} 
         {this._renderPracticeDropDown()}
         {this._renderButton()}
        </Animated.View>
      </TouchableOpacity>
    );
  }
}
