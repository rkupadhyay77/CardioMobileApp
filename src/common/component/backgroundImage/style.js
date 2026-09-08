import { StyleSheet,Dimensions } from 'react-native'
const {width, height} = Dimensions.get('window')


const styles = StyleSheet.create({
     backgroundImageContainer : {
       width,
       height,
       position : 'absolute'
     }
});

export default styles