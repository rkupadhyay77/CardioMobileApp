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
      iconContainer :{
        marginTop:15,
         marginLeft:5,
         position: 'absolute',
         flexDirection:'row'
        },
        topMenuContainer : {
          width:width,
          height:50,
          flexDirection:'row',
          backgroundColor: 'red' 
        }
})

export default styles