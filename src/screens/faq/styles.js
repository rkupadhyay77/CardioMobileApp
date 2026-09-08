import {StyleSheet, Dimensions} from 'react-native'
import getStateItem from '../../state/getStateItem'
import {DB_KEY} from '../../common/helper/keys'


const {width , height }  = Dimensions.get('window')

const isDarkMode  = false 

const styles = StyleSheet.create ({
    container : {
        flex : 1 , 
        backgroundColor : getStateItem(DB_KEY.IS_DARK_MODE)?'rgba(31,31,31,1.0)':'rgba(249,249,249,1.0)'
      },
      viewContainer :{
          width : width*0.90,
          left : width*0.05,
          top : height*0.05,
          height : height*0.73,
          borderWidth:1,
          borderColor:'rgba(240,240,240,1.0)',
          borderRadius:5,
          backgroundColor : 'rgba(255,255,255,1.0)',
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.8,
        elevation: 2,
         
      },
      boxContainer :{
        width : width*0.40,
        height : height*0.055,
        borderColor:'rgba(234,234,234,1.0)',
        borderRadius:5,
        borderWidth:2,
        left : width*0.23,
        top : height*0.03,
        justifyContent :'center',
        alignItems:'center',
        flexDirection:'row'
       
      },
      scrollContainer :{
        width : width*0.84,
        left : width*0.03,
        top : height*0.01,
        height : height*0.62,
       
     },
      separator :{
        width,
        height : 1 ,
        marginTop:height*0.15,
        backgroundColor : 'rgba(240,240,240,1.0)'
      },
      smallText : {
          color:'rgba(173,180,184,1.0)',
           fontSize:height*0.02,
           marginLeft : width*0.05,
           marginTop : height*0.05,
           position:'absolute'
        },
        largeText : {
            color:'rgba(173,180,184,1.0)',
             fontSize:height*0.015,
             fontWeight:'bold'
          }
})

export default styles