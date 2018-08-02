'use strict';

module.exports = (obj, h = {}) => {
    for (let h_prop in h) {
        if (h.hasOwnProperty(h_prop)) {

            let obj_prop = h_prop;
            
            if (h_prop[0] === '_') {
                obj_prop = h_prop.slice(1);
            }

            if (!obj.hasOwnProperty(obj_prop)) {
                continue;
            }
            
            if (h_prop[0] !== '_' && obj[obj_prop] === '') {
                return new Error(`${h_prop} is required`);
            } 
            
            if (h[h_prop] instanceof RegExp && !h[h_prop].test(obj[obj_prop])) {
                return new Error(`${h_prop} must be in ${h[h_prop]}`);
            }
            
            if (typeof h[h_prop] === 'number' && isNaN(obj[obj_prop])) {
                return new Error(`${h_prop} must be a type number`);
            }
        }
    }
}