import {StyleSheet, Dimensions} from 'react-native'
import getStateItem from '../../../state/getStateItem'
import {DB_KEY} from '../../../common/helper/keys'


const {width , height }  = Dimensions.get('window')

const isDarkMode  = false 

const styles = StyleSheet.create ({
    container : {
        flex : 1 , 
        backgroundColor : getStateItem(DB_KEY.IS_DARK_MODE)?'rgba(31,31,31,1.0)':'rgba(249,249,249,1.0)'
      },subContainer:{
        flex:1,
      }, signInButton : {
        width:width*0.84,
        left:width*0.08,
        height:50,
        marginTop:height*0.1,
    },
    fetchButton: {
      width: width * 0.15,
      marginLeft: width * 0.83,
      position: 'absolute',
      backgroundColor : 'rgba(164,6,12,1.0)',
      marginTop: 12 + height * 0.01,
      height: 40,
      justifyContent :'center',
      alignItems: 'center',
      borderRadius: 9
    }
})

export default styles