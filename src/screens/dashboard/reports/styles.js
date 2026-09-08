import { StyleSheet,Dimensions } from 'react-native'
import {DARK_THEME_COLORS} from '../../common/helper/colors'
const {width, height} = Dimensions.get('window')


const styles = StyleSheet.create({
    container : {
        flex: 1,
     },
     paginationContainer: {
        marginTop:-10
     },
     paginationDot: {
         width: 12,
         height: 12,
         borderRadius: 6,
         marginHorizontal: -3
     },
     slider: {
        marginTop: 10,
        overflow: 'visible' // for custom animations
    },
    sliderContentContainer: {
        paddingVertical: 3// for custom animation
    }
});
export default styles;