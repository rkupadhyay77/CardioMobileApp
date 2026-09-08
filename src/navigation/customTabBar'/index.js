
import BottomNav  from '../bottomTabBar'
import { Dimensions,  View } from 'react-native';


export default class CustomTabBar extends Component{

    _renderCustom() {
        return (
         <View  style ={{position: 'absolute', width : '100%', height : 30, backgroundColor: 'red'}}></View>   
        )
    }
    render(){
        return(
            <View>
              <BottomNav />
              {this._renderCustom()}
             
            </View>
        );
    }
}
