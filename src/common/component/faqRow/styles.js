import {StyleSheet, Dimensions} from 'react-native'

import {DARK_THEME_COLORS} from '../../helper/colors'
const {width , height }  = Dimensions.get('window')
import {DB_KEY} from '../../../common/helper/keys'
import getStateItem from '../../../state/getStateItem'


const isDarkMode  = getStateItem(DB_KEY.IS_DARK_MODE) 
const styles = StyleSheet.create ({
    container : {
        width:width,
        borderBottomColor : 'rgba(241,241,241,1.0)',
        borderBottomWidth : 1,
        paddingBottom : height*0.02
    },
    welcomeText : {
        color : DARK_THEME_COLORS.welcomeText,
        left : width * 0.05,
        width : width*0.85,
        fontSize : width*0.05,
        fontWeight:'bold',
        marginTop : height * 0.02 ,
        color : isDarkMode?'white':'rgba(124,124,124,1.0)',
     },
    userText : {
        color : 'rgba(144,144,144,1.0)',
        left : width * 0.05,
        fontSize : width*0.03,
        fontWeight:'normal',
        
    },
    title : {
        left:width*0.04,
         width:width*0.50,
         fontSize:height*0.02, 
         color:'rgba(124,124,124,1.0)',
    },
    circle :{
        marginTop : height*0.042,
        height : height*0.07,
        width : height*0.07,
        marginLeft : width*0.05,
        borderRadius:height*0.035,
        backgroundColor: 'white',
        justifyContent:'center',
        alignItems:'center',
        shadowColor: "rgba(124,124,124,1.0)",
        borderBottomColor:'#ddd',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.8,
        elevation: 1,
        
    },
    rowContainer :{
         flexDirection:'row'
    },
    firstText : {
        fontSize : height*0.03,
        color : 'rgba(164,47,46,1.0)',
        fontWeight:'bold'
    },
    
})

export default styles