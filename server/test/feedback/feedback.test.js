// mock the general console loggers - removes unnecessary output while running
// global.console = {
//     log: jest.fn(),
//     warn: jest.fn(),
//     error: jest.fn()
// }

const supertest = require('supertest');
const baseEndpoint = require('../utils/baseUrl').baseurl;
const apiEndpoint = supertest(baseEndpoint);

describe ("Feedback", async () => {
    beforeAll(async () => {
    });

    beforeEach(async () => {
    });

    it("should create feedback entry", async () => {
        // fetch the current set of CQC and non CQC services (to set main service)
        await apiEndpoint.post('/feedback')
            .send({
                "doingWhat" : "test doing what",
                "tellUs" : "test tell us",
                "name": "Test name",
                "email": "test.mail.com"
            })
            .expect(201);
    });
});