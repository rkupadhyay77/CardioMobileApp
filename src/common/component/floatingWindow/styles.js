import {StyleSheet, Dimensions} from 'react-native';

const {width, height} = Dimensions.get('window');
const WINDOW_HEIGHT = height / 3;

export const FLOATING_WINDOW_HEIGHT = WINDOW_HEIGHT;
export const FLOATING_WINDOW_WIDTH = width;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    width: width,
    height: WINDOW_HEIGHT,
    zIndex: 99999,
    elevation: 25,
    paddingHorizontal: 10,
    paddingBottom: 6,
  },
  minimizedContainer: {
    height: 54,
  },
  card: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 2,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 12,
  },
  cardLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#007AFF',
  },
  cardDark: {
    backgroundColor: '#1E1E20',
    borderColor: '#0A84FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(150, 150, 150, 0.25)',
  },
  dragHandleContainer: {
    position: 'absolute',
    top: 4,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dragHandle: {
    width: 44,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(150, 150, 150, 0.5)',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    flex: 1,
  },
  titleText: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
  },
  titleTextLight: {
    color: '#222222',
  },
  titleTextDark: {
    color: '#F5F5F5',
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  iconButton: {
    padding: 6,
    marginLeft: 8,
    borderRadius: 14,
    backgroundColor: 'rgba(150, 150, 150, 0.15)',
  },
  content: {
    flex: 1,
    padding: 12,
  },
  defaultContentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultContentTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  defaultContentSubtitle: {
    fontSize: 12,
    textAlign: 'center',
    color: '#888888',
    paddingHorizontal: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
  },
  statBox: {
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(150, 150, 150, 0.08)',
    minWidth: 90,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 11,
    color: '#888888',
    marginTop: 2,
  },
  eventLogContainer: {
    flex: 1,
   
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
});

export default styles;
