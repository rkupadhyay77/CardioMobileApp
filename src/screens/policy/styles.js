import { StyleSheet,Dimensions } from 'react-native'
import {DARK_THEME_COLORS} from '../../common/helper/colors'
const {width, height} = Dimensions.get('window')


const styles = StyleSheet.create({
    container : {
        flex : 1,
      },
    backgroundImageContainer : {
       width,
       height,
       position : 'absolute'
     }, 
     welcomeText : {
         color : DARK_THEME_COLORS.welcomeText,
         left : width * 0.08,
         fontSize : width*0.08,
         fontWeight:'bold',
         marginTop : height * 0.08 ,

     },
     timezoneContainer:{
height:40,
width: width*0.92,
marginLeft: width*0.04,
position: 'absolute',
marginTop: height*0.35
},
     flexDirection:{
       flexDirection: 'row',
       left : width * 0.04,
     },
     singInText : {
        color : 'rgba(144,144,144,1.0)',
        left : width * 0.08,
        fontSize : width*0.04,
        fontWeight:'normal',
        marginTop : height * 0.01,

    },
    normalText : {
        color : 'rgba(144,144,144,1.0)',
        fontSize : width*0.05,
        fontWeight:'bold',
      
    },
    logo : {
        width : width * 0.60,
        left : width * 0.20,
        height: height * 0.15,
        resizeMode: 'contain',
        marginTop: height*0.15,
    },

    emailTextFieldContainer: {
        left : width*0.08 ,
        width : width*0.84,
        marginTop:height*0.05,
    },
    emailTextField: {
        width : width*0.84,
        height: 50, 
        left:5, 
        color : DARK_THEME_COLORS.welcomeText,
    },
    passwordTextField : {
        width : width*0.84,
        height:50, 
        left:5,
        color : DARK_THEME_COLORS.welcomeText,
    },

    passwordTextFieldContainer: {
        left : width*0.08 ,
        width : width*0.84,
        marginTop:height*0.02,
   },
  
    signInButton : {
        width:width*0.84,
        left:width*0.08,
        height:50,
        marginTop:height*0.05,
    },
    buttonTop : {
       marginTop:height*0.01
    },
    buttonTopTerms : {
        marginTop:height*0.01
     },
     termsCondition : {
        height:40,
        fontSize: 16, 
        textAlign:'left',
       
     },
     biometricText : {
        height:40,
        fontSize: 16, 
        width,
        textAlign:'center',
       
     },
    forgetPassword : {
        right:width*0.08,
        height:40,
        fontSize: 16, 
        textAlign:'right'
    },
    layout : {
        borderColor :'rgba(240,240,240,1.0)',
        borderWidth : 1,
        borderRadius : 8,
        height: 50,
    },
    contentContainer : {
        width: width*0.98,
        borderRadius:12,
        backgroundColor:'white',
        marginLeft: width*0.01,
        marginTop:height*0.10,
        
      },

});

export default styles