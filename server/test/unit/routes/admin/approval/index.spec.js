var chai = require('chai');
var chaiHttp = require('chai-http');
const models = require('../../../../../models/index');
//var server = require('../../../../../../server').app;
//require {app} from '../../../../../../server';}
//var express = require('express');
//const app = express();
const admin = require('../../../../integration/utils/admin').admin.thing;
const thing3 = require('../../../../../../server').admin.thing;
const thing1 = require('../../../../../../server').thing1;
const thing2 = require('../../../../../../server').thing2;
const app = require('../../../../../../server').appy;
var should = chai.should();
chai.use(chaiHttp);

const expect = require('chai').expect;
const sinon = require('sinon');


const approval = require('../../../../../routes/admin/approval')

const testUser = {
  username: 'pickle-pop-panda'
};

sinon.stub(models.login, 'findOne').callsFake(async (args) => {
  if (args.where.username === testUser.username) {
    return testUser;
  } else {
    return null;
  }
});

describe('approval route', () => {
  describe('approval()', () => {
    it('should add a SINGLE blob on /blobs POST', function(done) {
      console.log("********************************* thing3: " + thing3);
      console.log("********************************* server thing1: " + thing1);
      console.log("********************************* server thing2: " + thing2.me);
      console.log("********************************* server address: " + app.address);
      chai.request(app)
        .post('/api/admin/approval')
        .send({ username: testUser.username })
        .end(function(err, res){
          res.should.have.status(200);
         /* res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.have.property('SUCCESS');
          res.body.SUCCESS.should.be.a('object');
          res.body.SUCCESS.should.have.property('name');
          res.body.SUCCESS.should.have.property('lastName');
          res.body.SUCCESS.should.have.property('_id');
          res.body.SUCCESS.name.should.equal('Java');
          res.body.SUCCESS.lastName.should.equal('Script');*/
          done();
        });
    });
  });
});
