'use strict';

const csv = require('csvtojson');
const validator = require('./validator');

module.exports = (file, h = {}, cb = () => {}) => {
    let arr = [], errMsg = [];

    if (typeof h === 'function') {
        cb = h;
        h = {};
    }

    return new Promise((resolve, reject) => {
        csv()
            .fromFile(file)
            .on('json', (obj, idx) => {
                
                const err = validator(obj, h);
        
                if (err instanceof Error) {
                    errMsg.push(`Row ${idx+1}: ${err.message}`);
                }

                arr.push(obj);
            })
            .on('done', err => {
                if (err || errMsg.length) {
                    cb(err || errMsg);
                    return reject(err || errMsg);
                }
                
                cb(null, arr);
                resolve(arr);
            });
    });
};
