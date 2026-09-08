import { StyleSheet,Dimensions } from 'react-native'
import {DARK_THEME_COLORS} from '../../common/helper/colors'
const {width, height} = Dimensions.get('window')


const styles = StyleSheet.create({
    container : {
        flex : 1,
      },
    backButtonContainer : {
        flexDirection : 'row', 
        width, 
        height: height*0.08, 
        marginTop:height*0.06, 
        alignItems:'center'
    }, 
     forgotButton :{
         color : DARK_THEME_COLORS.welcomeText, 
         fontWeight:'bold' ,
         fontSize: width*0.08, 
         left : 15
    },
     singInText : {
        color : 'rgba(144,144,144,1.0)',
        left : width * 0.08,
        width:width*0.70,
        fontSize : width*0.04,
        fontWeight:'normal',
        marginTop : height * 0.01,

    },
    tokenNotGet : {
        color : 'rgba(144,144,144,1.0)',
        fontSize : width*0.04,
        fontWeight:'normal',
        marginTop : 10,

    },
    logo : {
        width : width * 0.60,
        left : width * 0.20,
        height: height * 0.1,
        resizeMode: 'contain',
        marginTop: height*0.08,
    },

    emailTextField : {
        left : width*0.08 ,
        width : width*0.84,
        marginTop:height*0.05
    },

    passwordTextField : {
        left : 8 ,
        width : width*0.84,
        marginTop:height*0.02,
        color:'black'
    },
    signInButton : {
        width:width*0.84,
        left:width*0.08,
        height:50,
        marginTop:height*0.10,
        backgroundColor:'yellow'
    },
    buttonTop : {
       marginTop:height*0.02
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
    passwordTextFieldContainer: {
        left : width*0.08 ,
        width : width*0.84,
        marginTop:height*0.05,
   },
    borderStyleBase: {
        width: 50,
        height: 50
      },
    
      borderStyleHighLighted: {
        borderColor: "#03DAC6",
      },
    
      underlineStyleBase: {
        width: 40,
        height: 40,
        borderWidth: 1,
        borderRadius: 4,
        color:'black'
      },
    
      underlineStyleHighLighted: {
        borderColor: "#03DAC6",
        width: 40,
        height: 40,
        borderWidth: 1,
        borderRadius: 4
      },
});

export default styles