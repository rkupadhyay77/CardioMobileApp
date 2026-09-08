import React, {Component} from 'react';
import {
  View,
  Dimensions,
  Text,
  Animated,
   TouchableOpacity
} from 'react-native';
import style from './style';

import Icon from 'react-native-vector-icons/AntDesign'

const {height} = Dimensions.get('window');
export default class CustomActionSheet extends Component {
  constructor() {
    super();

    this.state = {yPos: height, bounceValue: new Animated.Value(300)};
  }
  componentDidMount() {
    this.showSheet()
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
      toValue: 300,
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

  callOnPressTitleTwo() {
    this.hideSheet();
    setTimeout(() => {
      this.props.onPressTitleTwo();
    }, 500);
  }


  callOnPressTitleOne() {
    this.hideSheet();
    setTimeout(() => {
      this.props.onPressTitleOne();
    }, 500);
  }

  callOnPressThirdOne() {
    this.hideSheet();
    setTimeout(() => {
      this.props.onPressTitleThree();
    }, 500);
  }


  renderTopIcon(){
    const {
      titleOne,
      selectedTitle,
     } = this.props;

     if (titleOne === selectedTitle){
       return(
        <Icon name={'checkcircle'} size={30} color={style.text.color} style={[style.icon, {marginTop : 76.5}]} /> 
       )
     }else{
       return (
         <View />
       )
     }
  }

  renderBottomIcon(){
    const {
      titleSecond,
      selectedTitle,
     } = this.props;

     if (titleSecond === selectedTitle){
       return(
        <Icon name={'checkcircle'} size={30} color={style.text.color} style={[style.icon, {marginTop : 136.5}]} /> 
       )
     }else{
       return (
         <View />
       )
     }
  }


  renderlastIcon(){
    const {
      titleThree,
      selectedTitle,
     } = this.props;

     if (titleThree === selectedTitle){
       return(
        <Icon name={'checkcircle'} size={30} color={style.text.color} style={[style.icon, {marginTop : 196.5}]} /> 
       )
     }else{
       return (
         <View />
       )
     }
  }

  render() {
    const {
      titleOne,
      titleSecond,
      titleThree,
      selectedTitle,
      onPressTitleOne,
      onPressTitleTwo,
    } = this.props;
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

          {this.renderTopIcon()}
          {this.renderBottomIcon()}
          {this.renderlastIcon()}
          <TouchableOpacity
            style={[style.textContainer, {marginTop: 35}]}
            onPress={() => this.callOnPressTitleOne()}>
            <Text  allowFontScaling={false} style={style.text}>{titleOne}</Text>
             
            </TouchableOpacity>
          
          
            <TouchableOpacity
            style={style.textContainer}
            onPress={() => this.callOnPressTitleTwo()}>
            <Text  allowFontScaling={false} style={style.text}>{titleSecond}</Text>
               
            </TouchableOpacity>

            {titleThree !== null && titleThree?.length > 0 &&  <TouchableOpacity
            style={style.textContainer}
            onPress={() => this.callOnPressThirdOne()}>
            <Text  allowFontScaling={false} style={style.text}>{titleThree}</Text>
               
            </TouchableOpacity>}
        </Animated.View>
      </TouchableOpacity>
    );
  }
}
