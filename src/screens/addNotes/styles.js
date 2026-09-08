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
      layout : {
        borderColor :'rgba(211,211,211,1.0)',
        borderWidth : 1,
        borderRadius : 8,
        height: 50,
      },
      titleTextFieldContainer: {
        left : width*0.06 ,
        width : width*0.88,
        marginTop:height*0.01,
    },
    titleTextField: {
        width : width*0.84,
        height: 50, 
        left:5, 
    },singInText : {
        color : 'rgba(144,144,144,1.0)',
        marginLeft : width * 0.06,
        fontSize : width*0.04,
        fontWeight:'normal',
        marginTop : height * 0.01,

    },signInButton : {
        width:width*0.84,
        left:width*0.08,
        height:50,
        marginTop:height*0.10,
    },
    buttonTop : {
       marginTop:height*0.02
    },
   
})

export default styles