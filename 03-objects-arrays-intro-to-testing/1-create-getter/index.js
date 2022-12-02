/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
    return function(obj) {
        const pathArr = path.split(".");

        let curObject = obj;
        for (let i = 0; i < pathArr.length; i++) {
            if (curObject[pathArr[i]] === undefined){
                return undefined;
            };
            curObject = curObject[pathArr[i]];
        };
        return curObject;    
    };

}
