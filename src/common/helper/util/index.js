import getStateItem from '../../../state/getStateItem'
import {DB_KEY} from '../keys'

export function getFilteredData(){
    let c = getStateItem(DB_KEY.FILTER_APPLIED)
    if (c){
        return getStateItem(DB_KEY.FILTERED_ARRAY)
    }
   
    return getStateItem(DB_KEY.RESIDENT_DATA)

}

export function isPLotViewTheme(){
   const statsTheme = getStateItem(DB_KEY.STATS_THEME);
   return statsTheme === 'PlotView'
}

export function checkGenericYesType(value) {
    if (value === "Yes" || value === "true" || value === 1) {
        return true
    }

    return false
} 


export function checkGenericNoType(value) {
    if (value === "No" || value === "false" || value === 0) {
        return true
    }

    return false
} 



export function getCurrentTime() {
    const now = new Date();

    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    const ampm = hours >= 12 ? 'pm' : 'am';

    hours = hours % 12;
    hours = hours || 12;

    return `${String(hours).padStart(2, '0')}:${minutes}:${seconds} ${ampm}`;
}


export  const API_TIMEOUT = { INTERVAL : 4000000000000000000000000000000000000000000000000000000000000000000000}