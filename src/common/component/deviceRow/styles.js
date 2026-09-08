import {StyleSheet, Dimensions} from 'react-native';
const {width , height }  = Dimensions.get('window')
const styles = StyleSheet.create ({
    container : {
        flex : 1 
    },
    emptyContainer:{
        height:height*0.75,
        justifyContent:'center',
        alignItems:'center',
        height: height*0.75
    },text : {
        fontSize : width*0.05,
        fontWeight:'bold',
        width: width*0.91,
        height:height*0.20,
        marginTop: height*0.20
      },
      signInButton : {
        width:width*0.84,
        left:width*0.08,
        height:50,
        marginTop: 10
    },
    flatListContainer:{
width,
height:height*0.60,
    },
    rowContainer: {
        width: width*0.94,
        height: height*0.15,
        borderRadius: height*0.01,
        borderWidth:1,
        marginTop:16
    },
    normalRowText:{
        fontSize: height*0.022,
        marginTop:height*0.015,
        color:'rgba(124,124,124,1.0)'
    },
    rowText:{
        marginLeft:width*0.03,
        fontSize: height*0.025,
        marginTop:height*0.012,
        fontWeight:'600'
    },
    row: {
        flexDirection: 'row'
    },
    optionContainer:{
        width: (width*0.935)/3,
        height:height*0.044,
        justifyContent:'center',
        alignItems: 'center',
      },
    operationContainer:{
        width:width*0.935,
        height:height*0.037,
        borderBottomRightRadius:8,
        borderBottomLeftRadius:8,
        marginTop:height*0.01,
        flexDirection:'row'
    }
});

export default styles;