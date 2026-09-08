import {StyleSheet, Dimensions} from 'react-native';
const {width , height }  = Dimensions.get('window');
const styles = StyleSheet.create ({
    container : {
        flex : 1 
    },signInButton : {
        width:width*0.84,
        left:width*0.08,
        height:60,
        marginTop:height*0.85,
        position: 'absolute',
    },containerView:{
        width,
        height:height*0.70,
    }
});

export default styles;
