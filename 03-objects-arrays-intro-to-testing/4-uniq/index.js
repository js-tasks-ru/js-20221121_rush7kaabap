/**
 * uniq - returns array of uniq values:
 * @param {*[]} arr - the array of primitive values
 * @returns {*[]} - the new array with uniq values
 */
export function uniq(arr) {
    const newSet = new Set(arr); 
    return [...newSet];
}

/*
export function uniq(arr) {
    return arr.map( (item, ind, newArr) => {
        if ( !newArr.includes(item) ) {
            return item;
        } else {
            return;
        }
        
    })
}
*/
