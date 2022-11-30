/**
 * pick - Creates an object composed of the picked object properties:
 * @param {object} obj - the source object
 * @param {...string} fields - the properties paths to pick
 * @returns {object} - returns the new object
 */
export const pick = (obj, ...fields) => {
    const res_obj = {};

    for (const [key, value] of Object.entries( obj ) ) {
        if (fields.includes(key)) {
          res_obj[key] = value;
        }
    }
    return res_obj;
};

/*
 // for ... in + Object.hasOwn\Object.hasOwnProperty
export const pick = (obj, ...fields) => {
  const res_obj = {};
  fields.forEach(element => {
    if (Object.hasOwn( element ) ) {
      res_obj[element] = obj[element];
    }    
  });
  return res_obj;
};
*/