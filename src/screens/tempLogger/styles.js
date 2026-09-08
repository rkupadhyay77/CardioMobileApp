import {StyleSheet, Dimensions} from 'react-native'
import { FlatList } from 'react-native-gesture-handler'



const {width , height }  = Dimensions.get('window')

const styles = StyleSheet.create ({
    container : {
        flex : 1 , 
        backgroundColor : 'rgba(21,21,21,0.9)'
    },
    crossBtnContainer :{
        left: width*0.85,
        top: height*0.1,
        width : width*0.10,
        height : width*0.10,
        borderRadius : width*0.05,
        backgroundColor : 'rgba(255,255,255,1.0)',
        alignContent:'center',
        justifyContent:'center',
        alignItems:'center'
    },
    crossText :{    
        fontWeight: 'bold',
        fontSize:  width*0.05,
        color : 'rgba(21,21,21,1.0)'
    },
    apiDataContainer :{
        width : width*0.90,
        left : width*0.05,
        marginTop : height*0.13,
        height : height*0.70,
        borderWidth:1,
        borderColor:'rgba(240,240,240,1.0)',
        borderRadius:5,
        backgroundColor : 'rgba(255,255,255,1.0)',
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 1,
      },
      shadowOpacity: 0.8,
      elevation: 2,
    },
    flatListContainer :{
        width : width*0.90,
        height : height*0.70
    },
    rowContainer :{
        height:50, 
        justifyContent:'center',
    },
    seprator :{
        width : width*0.90 - 2,
        height : 1,
        backgroundColor : 'rgba(21,21,21,0.6)',
        position:'absolute',
        top : 49
    },
    descriptionText :{
       left : 10
    }
        
})

export default styles