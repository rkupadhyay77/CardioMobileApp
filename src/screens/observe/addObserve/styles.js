import {StyleSheet, Dimensions} from 'react-native';
const {width , height }  = Dimensions.get('window');
const styles = StyleSheet.create ({
    container : {
        flex : 1 
    } ,contentContainer: {
        width,
         height:height*0.75,
         justifyContent:'center',
         alignItems:'center'
     },singInText : {
        color : 'rgba(144,144,144,1.0)',
        marginLeft : width * 0.06,
        fontSize : width*0.04,
        fontWeight:'normal',
        marginTop : height * 0.01,

    },layout : {
        borderColor :'rgba(211,211,211,1.0)',
        borderWidth : 1,
        borderRadius : 8,
        height: 50,
      },
      titleTextFieldContainer: {
       width : width*0.88,
        marginTop:height*0.01,
    },titleTextField: {
        width : width*0.84,
        height: 50, 
        left:5, 
    },signInButton : {
        width:width*0.84,
        left:width*0.08,
        height:60,
        marginTop:height*0.85,
        position: 'absolute',
    }
});

export default styles;