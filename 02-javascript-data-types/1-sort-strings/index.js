/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */

export function sortStrings(arr = [], param = 'asc') {
    const directions = {
        asc: 1,
        desc: -1
    };

    const direction = directions[param]; //undefined

    return [...arr].sort( (string1, string2 ) => {
        return direction * string1.localeCompare( string2,
                ['ru','en'] ,
                {caseFirst: 'upper'});
    });
};

/*
export function sortStrings_old(arr, param = 'asc') {
    //let  sorted_arr = arr.sort( (a, b) => a.localeCompare(b) )

    const sorted_arr = arr.slice( ).sort((a, b) => {
        const srt_result1 = a.localeCompare( b, 'ru' );
        const srt_result2 = a.toLowerCase( ).localeCompare( b.toLowerCase( ) , 'ru');
        if ( srt_result1 == srt_result2 ){
            return srt_result1;
        } else {
            return  0 - srt_result1; 
   
        };
    })
    if ( param != 'asc' ) {
        sorted_arr.reverse( );
    }
    return sorted_arr;
}
*/