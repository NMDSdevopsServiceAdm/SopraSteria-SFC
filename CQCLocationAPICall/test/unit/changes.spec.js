const SequelizeMock = require('sequelize-mock');
const AWS = require('aws-sdk-mock');
const expect = require('chai').expect;
const fs = require("fs");
const appConfig = require('../../config/config');
const changes = require('../../changes');

AWS.mock('SQS', 'sendMessage', (params, callback) => {
  callback(null, "successfully received message");
});
AWS.mock('S3', 'getItem', Buffer.from(fs.readFileSync("test/mockdata/s3.json")));
AWS.mock('S3', 'putItem', (params, callback) => {
  console.log(params);
  params.should.be.an.Object();
  params.should.have.property('Bucket', appConfig.get('aws.bucketname').toString());
  params.should.have.property('Key');
  params.should.have.property('Body');
  params.should.have.property('ContentType', 'application/json; charset=utf-8');
  fs.writeFile("test/mockdata/s3.json", params.Body, 'utf8');

  callback(null, {
    ETag: 'SomeETag"',
    Location: 'PublicWebsiteLink',
    Key: 'RandomKey',
    Bucket: 'TestBucket'
  });
});

const dbMock = new SequelizeMock();
const db = {};

db.cqclog = dbMock.define('cqclog', {
  'success': true,
  'message': 'Call Successful',
  'createdAt': '2019-10-31 05:12:20.736+00',
  'lastUpdatedAt': '2019-10-30T18:20:11Z'
});
db.location = dbMock.define('location', {
});

const changesTest = changes.handler(null, null);

describe('changes.js', () => {
  before(async () => {

  });
  it('should return a status of 200', () => {
    expect(changesTest.status).to.equal(200);
    expect(changesTest.body).to.equal("Call Successful");
  });
});
