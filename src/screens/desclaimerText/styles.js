import {StyleSheet, Dimensions} from 'react-native';
const {width , height }  = Dimensions.get('window')

const styles = StyleSheet.create ({
    container : {
        flex : 1 
    },
    signInButton : {
      width:width*0.84,
      left:width*0.08,
      height:50,
      marginTop: height - 70,
      position :'absolute'
  },
  scrollViewContainer : {
    width:width,
    height : height*0.78,
  },
  heading : {
    width : width,
    textAlign : 'center',
    fontWeight : 'bold',
    fontSize : width*0.04,
    top:5
  },
  description:{
    width : width*.96,
    textAlign : 'left',
    marginLeft:width*0.02,
    fontSize : width*0.03,
    top:15
  }
});

export default styles;