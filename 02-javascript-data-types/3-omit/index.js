/**
 * omit - creates an object composed of enumerable property fields
 * @param {object} obj - the source object
 * @param {...string} fields - the properties paths to omit
 * @returns {object} - returns the new object
 */
export const omit = (obj, ...fields) => {
    const res_obj = {};

    const ar_keys = Object.keys(obj)
    ar_keys.forEach(element => {
        if ( !fields.includes(element) ) {
            res_obj[element] = obj[element];
        }          
    });
    return res_obj;
};
