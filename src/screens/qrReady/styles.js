import {StyleSheet, Dimensions} from 'react-native';
const {width , height }  = Dimensions.get('window');
import {DARK_THEME_COLORS} from '../../common/helper/colors'


const styles = StyleSheet.create ({
    container : {
        flex : 1 
    },signInButton : {
        width:width*0.84,
        left:width*0.08,
        height:50,
        marginTop:height*0.80,
        position: 'absolute',
    },backgroundImageContainer : {
        width,
        height,
        position : 'absolute'
      },
      textContainer : {
        width: width*0.94,
        justifyContent : 'center',
        height : height*0.75 - 125,
        position : 'absolute'
      },singInText : {
        color : 'rgba(144,144,144,1.0)',
        fontSize : width*0.05,
        fontWeight:'500',
        marginLeft: width* 0.03
      
    },welcomeText : {
      color : DARK_THEME_COLORS.welcomeText,
      width : width ,
      fontSize : width*0.061,
      fontWeight:'bold',
      textAlign:'center',
      marginTop : height * 0.08 ,

  },emailTextFieldContainer: {
    left : width*0.08 ,
    width : width*0.84,
    marginTop:height*0.02,
},
emailTextField: {
    width : width*0.84,
    height: 50, 
    left:5, 
    color : DARK_THEME_COLORS.welcomeText,
},layout : {
  borderColor :'rgba(240,240,240,1.0)',
  borderWidth : 1,
  borderRadius : 8,
  height: 50,
},submitButton : {
  width:width*0.84,
  left:width*0.08,
  height:50,
  marginTop:height*0.05
},checkBoxContainer:{
  width:width, 
  height:30, 
  flexDirection:'row'
}
});

export default styles;
