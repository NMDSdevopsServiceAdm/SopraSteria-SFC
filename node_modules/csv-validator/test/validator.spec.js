'use strict';

const assert = require('assert');
const validator = require(__dirname + '/../lib/validator');

describe('validator', () => {

    it('should return error message for wrong type', done => {
        const h = {
            phone: 1,
        };
        const obj = { name: 'john', phone: '123ab', email: 'john@ph.com', country: 'AS' }
        
        const err = validator(obj, h);
        err.should.be.a('error');
        err.message.should.equal('phone must be a type number');
        done();
    });

    it('should return error message for required fields', done => {
        const h = {
            country: ''
        };
        const obj = { name: 'john', phone: '123ab', email: 'john@ph.com', country: '' }
        
        const err = validator(obj, h);
        err.should.be.a('error');
        err.message.should.equal('country is required');
        done();
    });

    it('should return error message for wrong regex', done => {
        const h = {
            email: /^\w+(?:\.\w+)*@\w+(?:\.\w+)+$/
        };
        const obj = { name: 'john', phone: '123ab', email: 'not_email', country: '' }
        
        const err = validator(obj, h);
        err.should.be.a('error');
        err.message.should.equal('email must be in /^\\w+(?:\\.\\w+)*@\\w+(?:\\.\\w+)+$/');
        done();
    });

    it('should notreturn error message for correct regex', done => {
        const h = {
            email: /^\w+(?:\.\w+)*@\w+(?:\.\w+)+$/
        };
        const obj = { name: 'john', phone: '123ab', email: 'correct@email.com', country: '' };
        
        const err = validator(obj, h);
        assert(err == null);
        done();
    });

    it('should not return error message for non-required fields', done => {
        const h = {
            _country: ''
        };
        const obj = { name: 'john', phone: '123ab', email: 'john@ph.com', country: 'AS' };
        
        const err = validator(obj, h);
        assert(err == null);
        done();
    });

});