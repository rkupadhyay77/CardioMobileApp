import React, { Component } from 'react'
import { View , Text, Dimensions, TouchableOpacity, Image} from 'react-native'
import styles from './styles'
import getStateItem from '../../../state/getStateItem'
import {DB_KEY} from '../../../common/helper/keys'
import Icon from 'react-native-vector-icons/Feather'
import Icon2 from 'react-native-vector-icons/FontAwesome'
import moment from 'moment'

const {width , height }  = Dimensions.get('window')

export default class NotesRow extends Component{
    

   

    _renderCollapse(){
        const {item, isExpanded,onFaqPress,isDarkMode,...props} = this.props
        if (!isExpanded){
            return(
                <View style={styles.container}>
                    <View style={styles.rowContainer}>
                     <Text  allowFontScaling={false}style={styles.welcomeText}>{item.title}</Text>
                     <TouchableOpacity onPress={onFaqPress}>
                     <Icon name={isExpanded?'chevron-up' : 'chevron-down'} color={isDarkMode ? 'rgba(241,241,241,1.0)' : 'rgba(124,124,124,1.0)'} size={width*0.05} style={{marginTop : height*0.04, marginLeft : width*0.07}}/>
                     </TouchableOpacity>
                     </View>
                </View>
            );
        }
       
    }

   
   

    _renderExpanded(){
       const {item, isExpanded=true,onFaqPress,isDarkMode,onEditTapped,onDeleteTapped,...props} = this.props
       var stillUtc = moment.utc(item.timestamp).toDate();
       var local = moment(stillUtc).local().format('DD MMM');


       var completeTime = moment(stillUtc).local().format('DD MMM,hh:mm A');
       var date = completeTime.substring(0, 2);

       var month = completeTime.substring(6, 2);


        if (isExpanded){
            return(
                <View style={[styles.container, {backgroundColor:isDarkMode?'rgba(26,27,32,1.0)':'rgba(238,238,238,1.0)'}]}>
                 <View style={{width:height*0.07,height:height*0.07,marginTop:-height*0.035,left:-height*0.01,backgroundColor:isDarkMode?'rgba(30,31,32,0.9)':'rgba(219,219,219,0.9)',borderRadius:height*0.035,position:'absolute',justifyContent:'center',alignItems:'center',borderWidth:1,borderColor:'gray'}}>
                    <Text  allowFontScaling={false}style={{color:isDarkMode ?'rgba(241,241,241,1.0)': styles.welcomeText.color, fontSize:height*0.034,fontWeight: 'bold'}}>{date}</Text>
                    <Text  allowFontScaling={false}style={{color:isDarkMode ?'rgba(241,241,241,1.0)': styles.welcomeText.color,top:-4,fontSize:height*0.02,fontWeight: 'normal'}}>{month}</Text>
                    </View>   
                 <View style={styles.rowContainer}>
                     <Text  allowFontScaling={false}style={[styles.welcomeText,{color:isDarkMode ?'rgba(241,241,241,1.0)': styles.welcomeText.color, fontSize:width*0.05, marginTop:height*0.01}]}>           {item.title}</Text>
                 </View>
                     <Text  allowFontScaling={false}style={[styles.welcomeText,{color:isDarkMode ?'rgba(241,241,241,1.0)': styles.welcomeText.color, fontSize:width*0.04, marginTop:height*0.01,fontWeight : 'normal'}]}>{item.desc}</Text>
                  
                <View style={styles.rowContainer}>
                <TouchableOpacity onPress={onEditTapped}>    
                <Text  allowFontScaling={false}style={[styles.welcomeText,{color:isDarkMode ?'rgba(241,241,241,1.0)': styles.welcomeText.color, fontSize:width*0.03, marginTop:height*0.01,width:null}]}>Edit</Text>
                <Icon2 name={'pencil'} color={isDarkMode ? 'rgba(241,241,241,1.0)' : 'rgba(124,124,124,1.0)'} size={width*0.05} style={{marginLeft:60,marginTop:-width*0.06}}/>
                </TouchableOpacity>

                <TouchableOpacity onPress={onDeleteTapped}>    
                <Icon2 name={'trash-o'} color={isDarkMode ? 'rgba(241,241,241,1.0)' : 'rgba(124,124,124,1.0)'} size={width*0.05} style={{marginLeft:20}}/>
                </TouchableOpacity>
                <View style={{flex:1}}>  
                <Text  allowFontScaling={false}style={{color:isDarkMode ?'rgba(241,241,241,1.0)': styles.welcomeText.color, fontSize:width*0.03, marginTop:height*0.01,textAlign:'right',marginRight:10}}>{completeTime}</Text>
                </View>
                </View>
                     </View>
            );
        }
       
    }
    render(){
        return(
            <View >
               {this._renderExpanded()}
            </View>
        );
    }
}