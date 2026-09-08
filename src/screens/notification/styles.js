import {StyleSheet, Dimensions} from 'react-native';
const {width , height }  = Dimensions.get('window');
const styles = StyleSheet.create ({
    container : {
        flex : 1 
    },
    nameFieldContainer : {
        width ,
        height:60, 
        marginTop: 20
     },

    passwordTextFieldContainer: {
        left : width*0.06 ,
        width : width*0.84,
        marginTop:height*0.02,
   },
  
    signInButton : {
        width:width*0.84,
        left:width*0.08,
        height:50,
        marginTop:height*0.10,
    },
    buttonTop : {
       marginTop:height*0.02
    },
    singInText : {
        color : 'rgba(144,144,144,1.0)',
        marginLeft : width * 0.06,
        fontSize : width*0.04,
        fontWeight:'normal',
        marginTop : height * 0.01,

    },signInButton : {
        width:width*0.84,
        left:width*0.08,
        height:60,
        marginTop:height*0.05,
    }
});

export default styles;