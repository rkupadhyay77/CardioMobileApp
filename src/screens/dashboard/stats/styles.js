import {StyleSheet, Dimensions} from 'react-native'
import getStateItem from '../../../state/getStateItem'
import {DB_KEY} from '../../../common/helper/keys'


const {width , height }  = Dimensions.get('window')

const isDarkMode  = false 

const styles = StyleSheet.create ({
    container : {
        flex : 1 , 
        backgroundColor : getStateItem(DB_KEY.IS_DARK_MODE)?'rgba(31,31,31,1.0)':'rgba(249,249,249,1.0)'
      },
      paginationContainer: {
         marginTop:-10
      },
      paginationDot: {
          width: 12,
          height: 12,
          borderRadius: 6,
          marginHorizontal: -3
      },
      statsContainer: {
          justifyContent:'center',
          alignItems:'center',
           marginTop : height*0.02
    },signInButton : {
        width:width*0.84,
        left:width*0.08,
        height:50,
        marginTop:height*0.1,
    },subContainer:{
        flex:1,
      }
})

export default styles