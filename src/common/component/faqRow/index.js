import React, { Component } from 'react'
import { View , Text, Dimensions, TouchableOpacity, Image} from 'react-native'
import styles from './styles'
import getStateItem from '../../../state/getStateItem'
import {DB_KEY} from '../../../common/helper/keys'
import Icon from 'react-native-vector-icons/Feather'

const {width , height }  = Dimensions.get('window')

export default class FAQRow extends Component{
    

   

    _renderCollapse(){
        const {item, isExpanded,onFaqPress,isDarkMode,...props} = this.props
        if (!isExpanded){
            return(
                <View style={styles.container}>
                    <View style={styles.rowContainer}>
                     <Text allowFontScaling={false} style={styles.welcomeText}>{item.question}</Text>
                     <TouchableOpacity onPress={onFaqPress}>
                     <Icon name={isExpanded?'chevron-up' : 'chevron-down'} color={isDarkMode ? 'rgba(241,241,241,1.0)' : 'rgba(124,124,124,1.0)'} size={width*0.05} style={{marginTop : height*0.04, marginLeft : width*0.07}}/>
                     </TouchableOpacity>
                     </View>
                </View>
            );
        }
       
    }

    _renderExpanded(){
       const {item, isExpanded,onFaqPress,isDarkMode,...props} = this.props
        if (isExpanded){
            return(
                <View style={[styles.container, {backgroundColor:isDarkMode?'rgba(26,27,32,1.0)':'rgba(238,238,238,1.0)'}]}>
                    <View style={styles.rowContainer}>
                     <Text  allowFontScaling={false} style={[styles.welcomeText,{color:isDarkMode ?'rgba(241,241,241,1.0)': styles.welcomeText.color, fontSize:width*0.05}]}>{item.question}</Text>
                     <TouchableOpacity onPress={onFaqPress}>
                     <Icon name={isExpanded?'chevron-up' : 'chevron-down'} color={isDarkMode ? 'rgba(241,241,241,1.0)' : 'rgba(124,124,124,1.0)'} size={width*0.05} style={{marginTop : height*0.04, marginLeft : width*0.07}}/>
                     </TouchableOpacity>
                     </View>
                     <Text  allowFontScaling={false} style={[styles.welcomeText,{color:isDarkMode ?'rgba(241,241,241,1.0)': styles.welcomeText.color, fontSize:width*0.04, fontWeight : 'normal'}]}>{item.answer}</Text>
                </View>
            );
        }
       
    }
    render(){
        return(
            <View >
               {this._renderCollapse()}
               {this._renderExpanded()}
            </View>
        );
    }
}