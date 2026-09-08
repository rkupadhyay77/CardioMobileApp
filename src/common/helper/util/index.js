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


export  const API_TIMEOUT = { INTERVAL : 4000000000000000000000000000000000000000000000000000000000000000000000}