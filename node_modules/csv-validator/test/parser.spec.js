'use strict';

const assert = require('assert');
const should = require('chai').should();
const csv = require(__dirname + '/../lib');
const csvFilePath = require('path').join(__dirname, '/data/test.csv');

const headers = {
    name: '',
    phone: 1,
    email: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    country: ''
};

describe('parser', () => {

    it('should parse csv file with promise', (done) => {
        csv(csvFilePath)
            .then(a => {
                assert(a);
                assert(a.length === 2);
                a.should.be.a('array');
                done();
            })
            .catch(err => {
                assert(err);
                done(err);
            });
    });

    it('should parse csv file with callback without validating', (done) => {
        csv(csvFilePath, (err, arr) => {
            should.equal(err, null);
            assert(arr);
            assert(arr.length === 2);
            arr.should.be.a('array');
            done();
        });
    });

    it('should parse csv file with callback with validating', (done) => {
        csv(csvFilePath, headers, (err, arr) => {
            should.equal(err, null);
            assert(arr);
            assert(arr.length === 2);
            arr.should.be.a('array');
            done();
        });
    });

});