import { StyleSheet , Dimensions} from 'react-native'
const {width , height }  = Dimensions.get('window')

const styles = StyleSheet.create({
    container : {
        justifyContent:'center',
        alignItems : 'center',
        backgroundColor:'rgba(243,243,243,1.0)',
        marginTop:height*0.03,
        shadowColor: "rgba(124,124,124,1.0)",
        borderBottomColor:'#ddd',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.8,
        elevation: 1,
        
    },
    subContainer : {
        justifyContent:'center',
        alignItems : 'center',
        backgroundColor:'rgba(238,238,238,1.0)',
        shadowColor: "rgba(124,124,124,1.0)",
        borderBottomColor:'#ddd',
       shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.8,
        elevation: 1,
    },
    imgContainer : {
        position:'absolute',
        top : height*0.10
        
    }
})

export default styles
