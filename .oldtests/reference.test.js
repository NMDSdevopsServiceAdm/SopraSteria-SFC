// tests for reference services

// mock the general console loggers - removes unnecessary output while running
// global.console = {
//     log: jest.fn(),
//     warn: jest.fn(),
//     error: jest.fn()
// }

const supertest = require('supertest');
const baseEndpoint = require('../utils/baseUrl').baseurl;
const apiEndpoint = supertest(baseEndpoint);

describe ("Expected reference services", () => {
    beforeAll(async () => {
    });

    beforeEach(async () => {
    });

    it("should fetch services", async () => {
        const services = await apiEndpoint.get('/services')
            .expect('Content-Type', /json/)
            .expect(200);
        expect(services.body).toMatchSnapshot();
    });

    it("should fetch Non-CQC main services by category", async () => {
        const services = await apiEndpoint.get('/services/byCategory?cqc=false')
            .expect('Content-Type', /json/)
            .expect(200);
        expect(services.body).toMatchSnapshot();
    });
    it("should fetch CQC main services by category", async () => {
        const services = await apiEndpoint.get('/services/byCategory?cqc=true')
            .expect('Content-Type', /json/)
            .expect(200);
        // note - the snapshot here catches "Live-in care" (id=35) to NOT be present for CQC main services
        expect(services.body).toMatchSnapshot();
    });

    it("should fetch jobs", async () => {
        const jobs = await apiEndpoint.get('/jobs')
            .expect('Content-Type', /json/)
            .expect(200);
        expect(jobs.body).toMatchSnapshot();
    });

    it("should fetch Local Authorities", async () => {
        const laS = await apiEndpoint.get('/localAuthority')
            .expect('Content-Type', /json/)
            .expect(200);
        expect(laS.body).toMatchSnapshot();
    });
    it("should fetch Primary Authority", async () => {
        const primartAuthority = await apiEndpoint.get('/localAuthority/SE19%203NS')
            .expect('Content-Type', /json/)
            .expect(200);
        expect(primartAuthority.body).toMatchSnapshot();
    });

    it("should fetch Ethnicities", async () => {
        const ethnicities = await apiEndpoint.get('/ethnicity')
            .expect('Content-Type', /json/)
            .expect(200);
        expect(ethnicities.body).toMatchSnapshot();
    });

    it("should fetch Nationalities", async () => {
        const nationalities = await apiEndpoint.get('/nationality')
            .expect('Content-Type', /json/)
            .expect(200);
        expect(nationalities.body).toMatchSnapshot();
    });

    it("should fetch countries", async () => {
        const countries = await apiEndpoint.get('/country')
            .expect('Content-Type', /json/)
            .expect(200);
        expect(countries.body).toMatchSnapshot();
    });
    
    it("should fetch qualifications", async () => {
        const qualification = await apiEndpoint.get('/qualification')
            .expect('Content-Type', /json/)
            .expect(200);
        expect(qualification.body).toMatchSnapshot();
    });
    
    it("should fetch qualifications", async () => {
        const recruitedFrom = await apiEndpoint.get('/recruitedFrom')
            .expect('Content-Type', /json/)
            .expect(200);
        expect(recruitedFrom.body).toMatchSnapshot();
    });

    it("should fetch worker leave reasons", async () => {
        const workerLeaverReasons = await apiEndpoint.get('/worker/leaveReasons')
            .expect('Content-Type', /json/)
            .expect(200);
        expect(workerLeaverReasons.body).toMatchSnapshot();
    });

    it("should fetch service users", async () => {
        const serviceUsers = await apiEndpoint.get('/serviceUsers')
            .expect('Content-Type', /json/)
            .expect(200);
        expect(serviceUsers.body).toMatchSnapshot();
    });
});