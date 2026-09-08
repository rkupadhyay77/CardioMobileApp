import {StyleSheet, Dimensions, Platform} from 'react-native'

const {width , height }  = Dimensions.get('window')

const styles = StyleSheet.create ({
    container : {
        width:width,
        height :Platform.OS === 'ios' ? height*0.15 :height*0.155 ,
        justifyContent : 'center',
      },
    subContainer : {
        marginLeft : width*0.04,
        width:width*0.92,
        height :Platform.OS === 'ios' ? height*0.14 :height*0.145,
        backgroundColor:'white',
        shadowColor: "#000",
        borderBottomColor:'#ddd',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.8,
        elevation: 1,
        borderRadius:height*0.007
    },
    circle :{
        marginTop : height*0.03,
        height : height*0.08,
        width : height*0.08,
        marginLeft : width*0.05,
        borderRadius:height*0.04,
        backgroundColor: 'rgba(216,216,217,1.0)',
        shadowColor: "rgba(124,124,124,1.0)",
        borderBottomColor:'#ddd',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.8,
        elevation: 1,
        
    },
    rowContainer :{
         flexDirection:'row'
    },
    firstText : {
        fontSize : height*0.03,
        color : 'rgba(164,47,46,1.0)',
        marginTop : height*0.022,
        marginLeft :height*0.03, 
        fontWeight:'bold'
    },
    nameContainer :{
        marginLeft : height*0.02,
        width : width*0.6,
        height : height*0.10,
        marginTop:height*0.016,
   },

    nameText :{
        fontSize : height*0.023,
        color : 'white',
     },
     locationText :{
      fontSize : height*0.018,
      color : 'white',
      marginTop: height*0.003
   },
     descriptionText : {
        fontSize : height*0.018,
        width : width*0.60,
      },
  listItem: {
    height: 75,
    alignItems: 'center',
    justifyContent: 'center'
  },
  leftSwipeItem: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: 20
  },
  rightSwipeItem: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 20
  },
  imgContainer : {
    position:'absolute',
    justifyContent:'center',
    alignItems: 'center',
    left : width*.92 - 30 ,
    width:30,
    height:50,
    marginTop:height*0.07 - 25
 },
 img :{
  position:'absolute',
  width:30,
  height:17,
 }
})

export default styles
