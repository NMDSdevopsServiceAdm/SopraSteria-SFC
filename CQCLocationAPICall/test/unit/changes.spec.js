const SequelizeMock = require('sequelize-mock');
const AWS = require('aws-sdk-mock');
const expect = require('chai').expect;
const fs = require('fs');
const sinon = require('sinon');
const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');

const appConfig = require('../../config/config');
const changes = require('../../changes');

describe('changes.js', () => {
  let sandbox = null;
  let cqcLogFind = null;
  before(async () => {
    const mock = new MockAdapter(axios);

    sandbox = sinon.sandbox.create();
    cqcLogFind = sanbox.stub(User, 'find');

    const startTimestamp = '2019-10-30T18:20:11Z';

    db.cqclog = dbMock.define('cqclog', {
      success: true,
      message: 'Call Successful',
      createdAt: '2019-10-31 05:12:20.736+00',
      lastUpdatedAt: startTimestamp,
    });
    db.location = dbMock.define('location', {});

    mock.onAny().reply(200, {
      total: 10,
      firstPageUri:
        '/changes/location?page=1&perPage=1000&startTimestamp=2019-03-10T06:30:00Z&endTimestamp=2019-03-14T06:30:00Z',
      page: 1,
      perPage: 1000,
      totalPages: 1,
      changes: [
        '1-108946357',
        '1-110299837',
        '1-1134752815',
        '1-114347996',
        '1-115269563',
        '1-117277871',
        '1-117277887',
        '1-117277911',
        '1-118801845',
        '1-119173823',
      ],
    });

    AWS.mock('SQS', 'sendMessage', (params, callback) => {
      callback(null, 'successfully received message');
    });
    AWS.mock('S3', 'getObject', Buffer.from(fs.readFileSync('test/mockdata/s3.json')));
    AWS.mock('S3', 'putObject', (params, callback) => {
      expect(params).to.have.property('Bucket', appConfig.get('aws.bucketname').toString());
      expect(params).to.have.property('Key');
      expect(params).to.have.property('Body');
      expect(params).to.have.property('ContentType', 'application/json; charset=utf-8');
      fs.writeFileSync('test/mockdata/s3.json', params.Body, 'utf8');

      callback(null, {
        ETag: 'SomeETag"',
        Location: null,
        Key: params.Key,
        Bucket: params.Bucket,
      });
    });
  });
  it('should return a status of 200',async () => {
    const changesTest = await changes.handler(null, null);
    expect(changesTest.status).to.equal(200);
    expect(changesTest.body).to.equal('Call Successful');
  });
});
