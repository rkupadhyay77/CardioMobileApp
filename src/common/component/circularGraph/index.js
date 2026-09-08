import React, { Component } from 'react'
import { View , Text, Dimensions, TouchableOpacity, Image} from 'react-native'
import styles from './styles'
import { AnimatedCircularProgress } from 'react-native-circular-progress';


export default class circularGraph extends Component{
    render(){
        const {size,fill,tintColor,source,isDarkMode,imgWidth,imgHeight,percentage, ...props} = this.props;
        const outerSize = size+60
        const innerSize = size+30
       return (
         <View style = {[styles.container,{width:outerSize, height:outerSize, borderRadius: outerSize/2,shadowColor:isDarkMode?'#000':'rgba(124,124,124,1.0)'}]}>
            <View style = {[styles.subContainer,{width:innerSize, height:innerSize, borderRadius: innerSize/2,shadowColor:isDarkMode?'#000':'rgba(124,124,124,1.0)'}]}>
              <Text  allowFontScaling={false} style={{position:'absolute', fontSize:size*0.44, fontWeight : 'bold'}}>{fill === 0 ? '--':fill}</Text>
               
              <AnimatedCircularProgress
                size={size}
                width={8}
                backgroundWidth={3}
                fill={percentage}
                tintColor={tintColor}
                backgroundColor="rgba(217,215,216,1.0)"
                arcSweepAngle={300}
                rotation={210}
                lineCap="round"
            />
            <Image source={source} style={[styles.imgContainer, {width:imgWidth, height:imgHeight}]}/>
            </View> 
         </View> 
       )
    }
}