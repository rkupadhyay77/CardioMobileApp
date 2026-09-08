import { StyleSheet,Dimensions } from 'react-native'
import {DARK_THEME_COLORS} from '../../common/helper/colors'
const {width, height} = Dimensions.get('window')


const styles = StyleSheet.create({
    container : {
        flex: 1,
        justifyContent: 'center',
        alignItems : 'center'
    }
});
export default styles;