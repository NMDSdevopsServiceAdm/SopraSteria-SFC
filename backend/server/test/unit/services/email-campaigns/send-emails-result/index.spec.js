const expect = require('chai').expect;
const sinon = require('sinon');
const RedisClient = require('ioredis');
const httpMocks = require('node-mocks-http');
const redisStore = require('../../../../../routes/admin/email-campaigns/send-emails-result/loadSendEmailsResult');
const { getSendEmailsResult } = require('../../../../../routes/admin/email-campaigns/send-emails-result');

describe('send emails results', () => {
  const mockResultsFromRedis = [
    {
      result: 'successful',
      templateId: 1,
      to: { name: 'test', email: 'test@example.com' },
      messageId: '19dd0b57-b21e-4ac1-bd88-01bbb068cb70',
      timestamp: '2026-09-18T13:41:17.810Z',
    },
    {
      result: 'failed',
      templateId: 2,
      to: { name: 'test', email: 'test-another@example.com' },
      messageId: '8bfd12d0-ba31-4c54-92c6-4fb54d365972',
      timestamp: '2026-09-18T14:03:01.894Z',
    },
    {
      result: 'successful',
      templateId: 1,
      to: { name: 'test', email: 'test@example.com' },
      messageId: '19dd0b57-b21e-4ac1-bd88-01bbb068cb71',
      timestamp: '2026-09-18T13:43:30.170Z',
    },
  ];

  describe('loadSendEmailResult', () => {
    const mockToday = new Date('2026-09-17T12:34:56.000Z');
    let clock;

    before(() => {
      clock = sinon.useFakeTimers(mockToday);
    });

    afterEach(() => {
      sinon.restore();
      clock.restore();
    });

    it('should load the send email results of today from redis(valkey) store and give the counts of successful / failed', async () => {
      const loadRedisSpy = sinon
        .stub(RedisClient.prototype, 'lrange')
        .resolves(mockResultsFromRedis.map((data) => JSON.stringify(data)));

      const result = await redisStore.loadSendEmailsResult();

      expect(loadRedisSpy).to.have.been.calledWith('2026-09-17');
      expect(result).to.deep.equal({
        date: '2026-09-17',
        successful: [mockResultsFromRedis[0], mockResultsFromRedis[2]],
        successfulCounts: 2,
        failed: [mockResultsFromRedis[1]],
        failedCounts: 1,
      });
    });
  });

  describe('GET /send-emails-result', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return 200 with the send email results of today', async () => {
      sinon.stub(redisStore, 'loadSendEmailsResult').resolves({
        date: '2026-09-17',
        successful: [mockResultsFromRedis[0], mockResultsFromRedis[2]],
        successfulCounts: 2,
        failed: [mockResultsFromRedis[1]],
        failedCounts: 1,
      });

      const defaultMockRequest = {
        method: 'GET',
        url: '/api/admin/email-campaigns/send-emails-result',
      };

      const req = httpMocks.createRequest(defaultMockRequest);
      const res = httpMocks.createResponse();

      await getSendEmailsResult(req, res);

      expect(res.statusCode).to.equal(200);
      expect(res._getData()).to.deep.equal({
        date: '2026-09-17',
        successful: [mockResultsFromRedis[0], mockResultsFromRedis[2]],
        successfulCounts: 2,
        failed: [mockResultsFromRedis[1]],
        failedCounts: 1,
      });
    });
  });
});
