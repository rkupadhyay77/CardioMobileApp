import {StyleSheet, Dimensions, Platform} from 'react-native'

const {width , height }  = Dimensions.get('window')
const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window');

function wp (percentage) {
    const value = (percentage * viewportWidth) / 100;
    return Math.round(value);
}

const slideHeight = viewportHeight * 0.60;
const slideWidth = wp(85);
const itemHorizontalMargin = wp(1);

export const sliderWidth = viewportWidth;
export const itemWidth = slideWidth + itemHorizontalMargin * 2;

const entryBorderRadius = 8;


const styles = StyleSheet.create ({
    slideInnerContainer: {
        width: itemWidth,
        height: slideHeight,
        paddingHorizontal: itemHorizontalMargin,
        borderRadius:11,
        shadowColor: "#000",
        borderBottomColor:'#ddd',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.8,
        elevation: 1,
     },
     slider: {
        marginTop: 10,
        overflow: 'visible' // for custom animations
    },
    sliderContentContainer: {
        paddingVertical: 3// for custom animation
    },
    subRow : {
        width : width*0.86,
        height:height*0.10,
        backgroundColor: 'rgba(37,40,44,1.0)',
        
       
    },
    detailContainerRow :{
        width : width*0.86,
        height:height*0.10,
        flexDirection : 'row',
        
      },
    statsText :{
        fontSize:height*0.016,
        color: 'rgba(216,216,217,1.0)',
        fontWeight:'bold',
        marginTop:height*0.014,
    },
    circle : {
        width:height*0.07,
        height:height*0.07,
        borderRadius:height*0.035,
        backgroundColor:'rgba(216,216,217,1.0)',
        marginLeft:width*0.04,
        marginTop:height*0.02,
        justifyContent:'center',
        alignItems:'center',
        shadowColor: "rgba(124,124,124,1.0)",
        borderBottomColor:'#ddd',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.8,
        elevation: 1,
    },
    alertView : {
        marginTop: height * 0.01
    },
    sepratorView : {
        marginTop: height * 0.03,
        borderTopWidth: 1
    },
    rowView : {
     flexDirection : 'row'
    },
    alertText : {
        fontSize: height * 0.016,
        marginLeft: 10
    },
    alertTimeText: {
        fontSize: height * 0.01,
        marginRight: 10
    }

})

export default styles