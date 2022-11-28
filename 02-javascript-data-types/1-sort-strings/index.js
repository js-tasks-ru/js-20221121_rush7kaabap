/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
    //let  sorted_arr = arr.sort( (a, b) => a.localeCompare(b) )

    let sorted_arr = arr.slice( ).sort((a, b) => {
        let srt_result1 = a.localeCompare( b, 'ru' );
        let srt_result2 = a.toLowerCase( ).localeCompare( b.toLowerCase( ) , 'ru');
        if ( srt_result1 == srt_result2 ){
            return srt_result1;
        } else {
            return  0 - srt_result1; 
            /*if ( srt_result2 == 0 )  {
                
            }
            return srt_result2; */
        };
    })
    if ( param != 'asc' ) {
        sorted_arr.reverse( );
    }
    return sorted_arr;
}
