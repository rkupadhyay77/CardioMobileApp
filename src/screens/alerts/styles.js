import {StyleSheet, Dimensions} from 'react-native';
const {width , height }  = Dimensions.get('window')
const styles = StyleSheet.create ({
    container : {
        flex : 1 
    },
    rowStyle: {
        marginLeft: width*0.02,
        marginRight: width*0.02,
        height: 100,
        marginTop: height*0.01,
        borderRadius:4,
        borderColor:'rgba(241,241,241,1.0)',
        borderWidth:1
    },
    rowDirection: {
        flexDirection: 'row'
    },
    columnDirection: {
        flexDirection: 'column'
    },
    imgContainer:{
        width: 60,
        alignItems:'center',
        justifyContent:'center'
    },
    topMargin: {
        marginTop : 20
    },
    margin: {
        marginTop : 2
    },
    textStyle :{
        fontSize: 14,
        fontWeight: '700'
    },
    timeStampMargin: {
        marginTop : 10
    },
    filterContainerView: {
        width,
        height : 40,
        borderWidth : 1 , 
        borderTopColor : 'gray',
        borderBottomColor : 'gray',
        backgroundColor : 'rgba(141,141,141,0.6)',
     },
    textFilter : {
        fontSize : 16 ,
        width,
        marginLeft : width * 0.03,
        marginTop: 8
    },
    footerLoader: {
        width: '100%', 
        height: 50, 
        position: 'absolute',
        marginTop: height*0.88 - 50
    }
    
});

export default styles;