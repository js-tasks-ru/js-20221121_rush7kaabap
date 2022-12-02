/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
    if ( size == 0) return '';
    if ( size == undefined ) return string;
    if ( string == undefined ) return '';

    let rezString = string.slice( 0, size );
    const restString = string.slice( size );

    for ( const char of restString){
        let tmpString = rezString + char; 
        if ( !tmpString.endsWith( char.repeat( size + 1 ) ) ){
            rezString += char;
        };
    }; 
    return rezString;
}
