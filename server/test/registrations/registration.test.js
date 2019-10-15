// this test script runs through a few various different registrations
//  including the catching of duplicate registrations

// mock the general console loggers - removes unnecessary output while running
// global.console = {
//     log: jest.fn(),
//     warn: jest.fn(),
//     error: jest.fn()
// }

const supertest = require('supertest');
const baseEndpoint = require('../utils/baseUrl').baseurl;
const apiEndpoint = supertest(baseEndpoint);

// mocked real postcode/location data
// http://localhost:3000/api/test/locations/random?limit=5
const locations = require('../mockdata/locations').data;
const postcodes = require('../mockdata/postcodes').data;

const registrationUtils = require('../utils/registration');
const serviceUtils = require('../utils/services');

describe("Registrations", () => {
    let cqcServices = null;
    let nonCqcServices = null;
    beforeAll(async () => {
        // clean the database
        if (process.env.CLEAN_DB) {
            await apiEndpoint.post('/test/clean')
                .send({})
                .expect(200);
        }

        // fetch the current set of CQC and non CQC services (to set main service)
        const cqcServicesResults = await apiEndpoint.get('/services/byCategory?cqc=true')
            .expect('Content-Type', /json/)
            .expect(200);
        cqcServices = cqcServicesResults.body;

        const nonCqcServicesResults = await apiEndpoint.get('/services/byCategory?cqc=false')
            .expect('Content-Type', /json/)
            .expect(200);
        nonCqcServices = nonCqcServicesResults.body;
    });

    beforeEach(async () => {
    });

    // it("should fail for non-CQC site trying to register with CQC service", async () => {
    //     const registeredEstablishment = await apiEndpoint.post('/registration')
    //         .send([{
    //             locationName: "Warren Care non-CQC",
    //             addressLine1: "Line 1",
    //             addressLine2: "Line 2 Part 1, Line 2 Part 2",
    //             townCity: "My Town",
    //             county: "My County",
    //             postalCode: "DY10 3RR",
    //             mainService: "Nurses agency",           // this is a CQC service
    //             isRegulated: false,
    //             user: {
    //                 fullname: "Warren Ayling",
    //                 jobTitle: "Backend Nurse",
    //                 email: "bob@bob.com",
    //                 phone: "01111 111111",
    //                 username: "aylingw",
    //                 password: "Password00",
    //                 securityQuestion: "What is dinner?",
    //                 securityQuestionAnswer: "All Day"
    //             }
    //         }])
    //         .expect('Content-Type', /json/)
    //         .expect(400);
    //     expect(registeredEstablishment.body.status).toEqual(-300);
    //     expect(registeredEstablishment.body.message).toEqual('Unexpected main service');
    // });
    // it("should fail for CQC site trying to register with unknown service", async () => {
    //     const registeredEstablishment = await apiEndpoint.post('/registration')
    //         .send([{
    //             locationId: "1-110055065",
    //             locationName: "Warren Care non-CQC",
    //             addressLine1: "Line 1",
    //             addressLine2: "Line 2 Part 1, Line 2 Part 2",
    //             townCity: "My Town",
    //             county: "My County",
    //             postalCode: "DY10 3RR",
    //             mainService: "WOZiTech Nurses",
    //             isRegulated: true,
    //             user: {
    //                 fullname: "Warren Ayling",
    //                 jobTitle: "Backend Nurse",
    //                 email: "bob@bob.com",
    //                 phone: "01111 111111",
    //                 username: "aylingw",
    //                 password: "Password00",
    //                 securityQuestion: "What is dinner?",
    //                 securityQuestionAnswer: "All Day"
    //             }
    //         }])
    //         .expect('Content-Type', /json/)
    //         .expect(400);
    //     expect(registeredEstablishment.body.status).toEqual(-300);
    //     expect(registeredEstablishment.body.message).toEqual('Unexpected main service');
    // });

    let nonCQCSite = null;
    let cqcSite = null;
    let duplicateCqcSite = null;
    it("should create a non-CQC registation", async () => {
        nonCQCSite = registrationUtils.newNonCqcSite(postcodes[0], nonCqcServices);
        const registeredEstablishment = await apiEndpoint.post('/registration')
            .send([nonCQCSite])
            .expect('Content-Type', /json/)
            .expect(200);
        expect(registeredEstablishment.body.status).toEqual(1);
        expect(Number.isInteger(registeredEstablishment.body.establishmentId)).toEqual(true);
    });


    it("should create a CQC registation of known location id", async () => {
        cqcSite = registrationUtils.newCqcSite(locations[0], cqcServices);
        const registeredEstablishment = await apiEndpoint.post('/registration')
            .send([cqcSite])
            .expect('Content-Type', /json/)
            .expect(200);
        expect(registeredEstablishment.body.status).toEqual(1);
        expect(Number.isInteger(registeredEstablishment.body.establishmentId)).toEqual(true);
    });

    it("should create a second CQC registation of different known location id but same postcode and name", async () => {
        duplicateCqcSite = registrationUtils.newCqcSite(locations[1], cqcServices);
        duplicateCqcSite.postalCode = cqcSite.postalCode;
        duplicateCqcSite.locationName = cqcSite.locationName;
        const registeredEstablishment = await apiEndpoint.post('/registration')
            .send([duplicateCqcSite])
            .expect('Content-Type', /json/)
            .expect(200);
        expect(registeredEstablishment.body.status).toEqual(1);
        expect(Number.isInteger(registeredEstablishment.body.establishmentId)).toEqual(true);
    });

    it("should fail on CQC if site with location id, postcode and name already existing", async () => {
        const registeredEstablishment = await apiEndpoint.post('/registration')
            .send([cqcSite])
            .expect('Content-Type', /json/)
            .expect(400);
        expect(registeredEstablishment.body.status).toEqual(-190);
        expect(registeredEstablishment.body.message).toEqual('Duplicate Establishment');
    });

    it("should fail on non-CQC site with postcode and name already existing", async () => {
        const registeredEstablishment = await apiEndpoint.post('/registration')
            .send([nonCQCSite])
            .expect('Content-Type', /json/)
            .expect(400);
        expect(registeredEstablishment.body.status).toEqual(-190);
        expect(registeredEstablishment.body.message).toEqual('Duplicate Establishment');
    });

    it("should fail if username is already existing", async () => {
        const newNonCQCSite = registrationUtils.newNonCqcSite(postcodes[0], nonCqcServices);
        newNonCQCSite.user.username = nonCQCSite.user.username;
        const registeredEstablishment = await apiEndpoint.post('/registration')
            .send([newNonCQCSite])
            .expect('Content-Type', /json/)
            .expect(400);
        expect(registeredEstablishment.body.status).toEqual(-200);
        expect(registeredEstablishment.body.message).toEqual('Duplicate Username');
    });


    it("should lookup a known service with success", async () => {
        const knownService = serviceUtils.lookupRandomService(cqcServices);
        const registeredEstablishment = await apiEndpoint.get('/registration/service/' + encodeURIComponent(knownService.name))
            .expect('Content-Type', /json/)
            .expect(200);
        expect(registeredEstablishment.body.status).toEqual("1");
        expect(registeredEstablishment.body.message).toEqual(`Service name '${knownService.name}' found`);
    });
    it("should lookup an unknown service with success", async () => {
        const registeredEstablishment = await apiEndpoint.get('/registration/service/' + encodeURIComponent('unKNown serViCE'))
            .expect('Content-Type', /json/)
            .expect(200);
        expect(registeredEstablishment.body.status).toEqual("0");
        expect(registeredEstablishment.body.message).toEqual('Service name \'unKNown serViCE\' not found');
    });

    it("should lookup a known username with success", async () => {
        const knownUsername = nonCQCSite.user.username;
        const registeredEstablishment = await apiEndpoint.get('/registration/username/' + encodeURIComponent(knownUsername))
            .expect('Content-Type', /json/)
            .expect(200);
        expect(registeredEstablishment.body.status).toEqual("1");
        expect(registeredEstablishment.body.message).toEqual(`Username '${knownUsername.toLowerCase()}' found`);
    });
    it("should lookup an unknown username with success", async () => {
        const registeredEstablishment = await apiEndpoint.get('/registration/username/' + encodeURIComponent('unKNown UsEr'))
            .expect('Content-Type', /json/)
            .expect(200);
        expect(registeredEstablishment.body.status).toEqual("0");
        expect(registeredEstablishment.body.message).toEqual(`Username '${'unKNown UsEr'.toLowerCase()}' not found`);
    });


    it("should lookup a known username via usernameOrPasswword with success", async () => {
        const knownUsername = nonCQCSite.user.username;
        await apiEndpoint.get('/registration/usernameOrEmail/' + encodeURIComponent(knownUsername))
            .expect(200);
    });
    it("should lookup an unknown username via usernameOrPasswword with not found", async () => {
        const unknownUsername = nonCQCSite.user.username + 'A';
        await apiEndpoint.get('/registration/usernameOrEmail/' + encodeURIComponent(unknownUsername))
            .expect(404);
    });
    it("should lookup a known email via usernameOrPasswword with success", async () => {
        const knownEmail = nonCQCSite.user.email;
        await apiEndpoint.get('/registration/usernameOrEmail/' + encodeURIComponent(knownEmail))
            .expect(200);
    });
    it("should lookup an unknown email via usernameOrPasswword with not found", async () => {
        const unknownEmail = nonCQCSite.user.email + 'A';
        await apiEndpoint.get('/registration/usernameOrEmail/' + encodeURIComponent(unknownEmail))
            .expect(404);
    });

    it("should lookup a known establishment by name with success", async () => {
        const knownEstablishmentName = cqcSite.locationName;
        const registeredEstablishment = await apiEndpoint.get('/registration/estbname/' + encodeURIComponent(knownEstablishmentName))
            .expect('Content-Type', /json/)
            .expect(200);
        expect(registeredEstablishment.body.status).toEqual("1");
        expect(registeredEstablishment.body.message).toEqual(`Establishment by name '${knownEstablishmentName}' found`);
    });
    it("should lookup an unknown establishment by name with success", async () => {
        const registeredEstablishment = await apiEndpoint.get('/registration/estbname/' + encodeURIComponent('unKNown esTABliShmENt'))
            .expect('Content-Type', /json/)
            .expect(200);
        expect(registeredEstablishment.body.status).toEqual("0");
        expect(registeredEstablishment.body.message).toEqual('Establishment by name \'unKNown esTABliShmENt\' not found');
    });

    it("should lookup a known establishment by name and location id with success", async () => {
        const knownEstablishmentName = duplicateCqcSite.locationName;
        const knownEstablishmentLocationId = duplicateCqcSite.locationId;
        const registeredEstablishment = await apiEndpoint.get('/registration/estb/' + encodeURI(knownEstablishmentName) + '/' + encodeURI(knownEstablishmentLocationId))
            .expect('Content-Type', /json/)
            .expect(200);
        expect(registeredEstablishment.body.status).toEqual("1");
        expect(registeredEstablishment.body.message).toEqual(`Establishment by name '${knownEstablishmentName}' and by location id '${knownEstablishmentLocationId}' found`);
    });
    it("should lookup an unknown establishment by name and location id with success", async () => {
        const knownEstablishmentName = duplicateCqcSite.locationName;
        const registeredEstablishment = await apiEndpoint.get('/registration/estb/' + encodeURI(knownEstablishmentName) + '/' + encodeURIComponent('i-00000000000000'))
            .expect('Content-Type', /json/)
            .expect(200);
        expect(registeredEstablishment.body.status).toEqual("0");
        expect(registeredEstablishment.body.message).toEqual(`Establishment by name '${knownEstablishmentName}' and by location id 'i-00000000000000' not found`);
    });
});