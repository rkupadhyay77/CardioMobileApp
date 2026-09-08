import {StyleSheet, Dimensions} from 'react-native'

const {width , height }  = Dimensions.get('window')

const styles = StyleSheet.create ({
    container : {
        width:width,
        height : height*0.07,
        flexDirection : 'row' , 
        borderBottomWidth:1,
        borderBottomColor : 'rgba(234,234,234,1.0)',
       
    },
    title : {
        left:width*0.04,
         width:width*0.70,
         fontSize:height*0.02, 
         color:'rgba(124,124,124,1.0)',
         
    },
    titleContainer : {
        width:width*0.50, 
        justifyContent:'center'
    },
    selectedTypeContainer : {
        width:width*0.40, 
        justifyContent:'center'
    },
    iconContainer:{
        width:width*0.10, 
        justifyContent:'center'
    },
    selectedType : {
        left:width*0.04,
        width:width*0.30,
        fontSize:height*0.018, 
        color:'rgba(124,124,124,1.0)',
        textAlign:'right',
       
        
    }
    
})

export default styles