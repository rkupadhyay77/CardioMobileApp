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
        marginLeft: width* 0.4,
        width:width*0.10, 
        justifyContent:'center'
    },
    switchContainer:{
        marginLeft: width* 0.3,
        justifyContent:'center'
    },
    selectedType : {
        left:width*0.04,
        width:width*0.30,
        fontSize:height*0.018, 
        color:'rgba(124,124,124,1.0)',
        textAlign:'right',
       
        
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBackdropTouchable: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    modalContainer: {
        width: width * 0.82,
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        paddingTop: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 8,
        textAlign: 'center',
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#666666',
        marginBottom: 16,
        textAlign: 'center',
        paddingHorizontal: 16,
    },
    modalInput: {
        width: '85%',
        height: 42,
        borderColor: '#CCCCCC',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        fontSize: 16,
        color: '#000000',
        backgroundColor: '#F9F9F9',
        marginBottom: 10,
    },
    modalErrorText: {
        color: '#FF3B30',
        fontSize: 13,
        marginBottom: 8,
        textAlign: 'center',
    },
    modalButtonContainer: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: '#E5E5E5',
        width: '100%',
        height: 48,
        marginTop: 6,
    },
    modalButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalCancelButtonText: {
        fontSize: 16,
        color: '#FF3B30',
        fontWeight: '500',
    },
    modalSubmitButtonText: {
        fontSize: 16,
        color: '#007AFF',
        fontWeight: 'bold',
    },
    modalButtonDivider: {
        width: 1,
        backgroundColor: '#E5E5E5',
        height: '100%',
    }
})

export default styles