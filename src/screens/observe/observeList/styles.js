import {StyleSheet, Dimensions} from 'react-native';
const {width , height }  = Dimensions.get('window');
const styles = StyleSheet.create ({
    container : {
        flex : 1 
    },
    row:{
        width,
        height:height*0.10,
    },
    rowContainer:{
        width:width*0.94,
        marginLeft:width*0.03,
        height:height*0.08,
        marginTop:height*0.01,
        backgroundColor:'yellow',
        borderRadius:height*0.008,
        justifyContent:'center'
    } ,
    welcomeText : {
        color : 'rgba(52,52,52,1.0)',
        marginLeft : width * 0.15,
        width : width*0.60,
        fontWeight:'bold',
         
      },
      contentContainer: {
         width,
          height:height*0.5,
          justifyContent:'center',
          alignItems:'center'
      },
      inviteObserveContainer:{
          width,
          height:50,
          flexDirection:'row',
          alignItems:'center',
          justifyContent:'center'

      }
});

export default styles;