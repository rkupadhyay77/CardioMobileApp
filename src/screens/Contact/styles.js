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
      rowContainer :{
          width : width,
          height : height*0.11,
      },
      separator :{
        width,
        height : 1 ,
        marginTop:height*0.11,
        backgroundColor : 'rgba(240,240,240,1.0)'
      },
      smallText : {
          color:'rgba(173,180,184,1.0)',
           fontSize:height*0.015,
           marginLeft : width*0.05,
           marginTop : height*0.05,
           position:'absolute'
        },
        largeText : {
            color:'rgba(173,180,184,1.0)',
             fontSize:height*0.022,
             marginLeft : width*0.05,
             marginTop : height*0.074,
             position:'absolute',
             fontWeight:'bold'
          }
})

export default styles