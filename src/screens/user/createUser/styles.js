import {StyleSheet, Dimensions} from 'react-native';
const {width, height} = Dimensions.get('window');
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  secondaryText: {
    color: 'rgba(144,144,144,1.0)',
    marginLeft: width * 0.06,
    fontSize: width * 0.04,
    fontWeight: 'normal',
    marginTop: height * 0.01,
  },
  textContainer: {
    left: width * 0.06,
    width: width * 0.88,
    marginTop: height * 0.01,
  },
  layout: {
    borderColor: 'rgba(240,240,240,1.0)',
    borderWidth: 1,
    borderRadius: 8,
    height: 50,
  },
  textField: {
    width: width * 0.84,
    height: 50,
    fontSize: 18,
    left: 5,
  },
  signInButton: {
    width: width * 0.84,
    left: width * 0.08,
    height: 50,
    marginTop: height * 0.02,
  },
});

export default styles;
