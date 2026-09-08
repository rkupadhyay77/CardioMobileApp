import {StyleSheet, Dimensions} from 'react-native';
const {width , height }  = Dimensions.get('window');
const styles = StyleSheet.create ({
    container : {
        flex : 1 
    }, singInText : {
        color : 'rgba(144,144,144,1.0)',
        marginLeft : width * 0.06,
        fontSize : width*0.04,
        fontWeight:'normal',
        marginTop : height * 0.01,

    },layout : {
        borderColor :'rgba(211,211,211,1.0)',
        borderRadius : 8,
        height: 40,
        borderBottomWidth:1
      },
      titleTextFieldContainer: {
        left : width*0.06 ,
        width : width*0.20,
        marginTop:height*0.01,
    }, titleTextField: {
        width : width*0.20,
        height: 40, 
        left:5, 
        fontSize:16
    } ,signInButton : {
        width:width*0.84,
        left:width*0.08,
        height:50,
        marginTop:height*0.10,
    },
});

export default styles;