import { StyleSheet,Dimensions } from 'react-native'
import {DARK_THEME_COLORS} from '../../common/helper/colors'
const {width, height} = Dimensions.get('window')


const styles = StyleSheet.create({
    container : {
        flex : 1,
        backgroundColor:'white'
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
     flexDirection:{
       flexDirection: 'row',
       left : width * 0.04,
     },
     singInText : {
        color : 'rgba(144,144,144,1.0)',
        left : width * 0.08,
        fontSize : width*0.04,
        fontWeight:'normal',
        marginBottom:2
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
        marginTop: height*0.10,
    },
   emailTextFieldContainer: {
        left : width*0.08 ,
        width : width*0.84,
        marginTop : 10
       
    },
    topHeight: { marginTop:height*0.05 - 40},
    emailTextField: {
        width : width*0.84,
        height: 50, 
        left:5, 
        color : DARK_THEME_COLORS.welcomeText,
        fontSize :18,
    },
    passwordTextField : {
        width : width*0.84,
        height:50, 
        left:5,
        color : DARK_THEME_COLORS.welcomeText,
        fontSize :18,
    },

    spacerContainer: {
        width : width,
        height : 40
    },
    spacer : {
        marginLeft: width * 0.05,
        flexDirection: 'row'
    },
    buttonSpacer : {
        width : width * 0.3,
        borderWidth : 1,
        height: 30,
        borderTopLeftRadius: 4,
        borderBottomLeftRadius: 4,
        borderColor: 'gray',
        justifyContent: 'center',
        alignItems : 'center'
    },
    buttonSpacerRight : {
        width : width * 0.3,
        borderWidth : 1,
        height: 30,
        borderTopRightRadius: 4,
        borderBottomRightRadius: 4,
        backgroundColor: 'gray',
         justifyContent: 'center',
        alignItems : 'center'
    },
    buttonSpacerMiddle : {
        width : width * 0.3,
        borderWidth : 1,
        height: 30,
         backgroundColor: 'gray',
         justifyContent: 'center',
        alignItems : 'center'
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
        marginTop:height*0.02,
    },
    buttonTop : {
       marginTop:height*0.01
    },
    biometricContainer:{
        left : width*0.08 ,
        width : width*0.84,
        marginTop:height*0.03,
        justifyContent:'center',
        alignItems:'center',
    },
    buttonTopTerms : {
        marginTop:height*0.01
     },
     termsCondition : {
        height:30,
        fontSize: 16, 
        textAlign:'left',
       
     },
     biometricText : {
        height:30,
        fontSize: 16, 
        marginLeft:5,
        fontWeight:'bold',
        textAlign:'center',
      },
     ORText : {
        height:20,
        fontSize: 12, 
        width,
        textAlign:'center',
       
     },
    forgetPassword : {
        right:width*0.08,
        height:40,
        fontSize: 16, 
        textAlign:'right'
    },
    rememberCredantial : {
        height:22,
        fontSize: 16, 
        textAlign:'left',
        marginLeft: 8,
        marginTop : 15

    },
    layout : {
        borderColor :'rgba(240,240,240,1.0)',
        borderWidth : 1,
        borderRadius : 8,
        height: 50,
    },
    switchContainer : {
        width:'100%',
        height:30,
        position:'absolute',
        marginTop:height*0.23,
        justifyContent:'center',
        alignItems:'center',
        flexDirection:'row',
    },
    noDeviceBtnContainer:{
        width:width*1.1,
        height:30,
        marginTop: height - 50,
        position:'absolute',
        justifyContent:'center',
        flexDirection:'row',
        borderColor:'gray',
        borderWidth:1

    }, 

    versionContainer:{
        width,
        height:30,
        marginTop: height - 80,
        position:'absolute',
        alignItems:'center',
    }, 
    signupBtnContainer:{
        width,
        height:30,
        marginTop: height * 0.01,
        justifyContent:'center',
        flexDirection:'row'

    }, 
    signupText : {
        color : 'rgba(94,21,42,1.0)',
        fontSize : 20,
        fontWeight:'bold',
        textDecorationLine:'underline',
        marginTop : -4
       
    },initialText : {
        height:40,
        fontSize: 16, 
        textAlign:'right'
    },checkBoxContainer:{
        width:width, 
        height:30, 
        flexDirection:'row'
    }
});

export default styles