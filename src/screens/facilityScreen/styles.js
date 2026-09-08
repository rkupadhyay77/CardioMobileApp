import {StyleSheet, Dimensions} from 'react-native';

const {width, height} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(21,21,21,0.7)',
    position: 'absolute',
    width,
    height,
  },
  actionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    height: height,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  separatorLine: {
    width: width * 0.3,
    left: width * 0.35,
    height: 6,
    borderRadius: 3,
    marginTop: 20,
    backgroundColor: 'rgba(223,223,223,1.0)',
  },
  textContainer: {
    width: width * 0.94,
    height: 60,
    left: width * 0.05,
    borderBottomColor: 'rgba(223,223,223,1.0)',
    borderBottomWidth: 1,
    justifyContent: 'center'
  },
  text: {
    color: 'rgba(76,76,76,1.0)',
    fontSize: 18,
  },
  icon : {
    position: 'absolute',
     marginLeft: width*0.80
    },
  textStyle : {
    fontSize : height * 0.02,
    marginTop: height * 0.20, 
    marginLeft : 20,
    fontWeight: '700',
  },
  dropdownContainer: {
    marginLeft: 20 ,
    width: width - 40,
    marginTop: 10
  },
  buttonStyle: {
    width : 100,
    height :40 , 
    borderRadius : 50,
    marginLeft: width - 130,
    marginTop : -height * 0.2,
    position: 'absolute'
  },
  applyStyle : {
    width : 100,
   fontSize : 22 ,
   fontWeight: 'bold',
   textAlign: 'center',
   marginTop: 8
  },
  actionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height
  },
});

export default styles;
