
// this test script runs through a few various different actions on a specific workers (having first registered its own establishments)

// mock the general console loggers - removes unnecessary output while running
// global.console = {
//     log: jest.fn(),
//     warn: jest.fn(),
//     error: jest.fn()
// }

const supertest = require('supertest');
const uuid = require('uuid');
const baseEndpoint = require('../utils/baseUrl').baseurl;

const apiEndpoint = supertest(baseEndpoint);

// mocked real postcode/location data
const postcodes = require('../mockdata/postcodes').data;
const jobs = require('../mockdata/jobs').data;
const ethnicities = require('../mockdata/ethnicity').data;
const nationalities = require('../mockdata/nationalities').data;
const countries = require('../mockdata/countries').data;
const recruitedOrigins = require('../mockdata/recruitedFrom').data;
const qualifications = require('../mockdata/qualifications').data;

const Random = require('../utils/random');

const registrationUtils = require('../utils/registration');
const workerUtils = require('../utils/worker');
const ethnicityUtils = require('../utils/ethnicity');
const nationalityUtils = require('../utils/nationalities');
const countryUtils = require('../utils/countries');
const qualificationUtils = require('../utils/qualifications');
const recruitedFromUtils = require('../utils/recruitedFrom');
const jobUtils = require('../utils/jobs');

// change history validation
const validatePropertyChangeHistory = require('../utils/changeHistory').validatePropertyChangeHistory;
let MIN_TIME_TOLERANCE = process.env.TEST_DEV ? 1000 : 400;
let MAX_TIME_TOLERANCE = process.env.TEST_DEV ? 3000 : 1000;
const PropertiesResponses = {};

const randomString = require('../utils/random').randomString;

describe ("worker", () => {
    let nonCqcServices = null;
    let establishment1 = null;
    let establishment2 = null;
    let establishment1Token = null;
    let establishment2Token = null;
    let establishment1Username = null;
    let establishment2Username = null;
    let timeDifference = null;

    describe("Establishment 1 against " + baseEndpoint, () => {
        let establishmentId = null;
        let establishmentUid = null;
        let workerUid = null;

        beforeAll(async () => {
            // clean the database
            if (process.env.CLEAN_DB) {
                await apiEndpoint.post('/test/clean')
                    .send({})
                    .expect(200);
            }

            console.log("Testing against: ", baseEndpoint);

            // offset local time and server time
            const serverTimeResponse = await apiEndpoint.get('/test/timestamp');
            if (serverTimeResponse.headers['x-timestamp']) {
                const serverTime = parseInt(serverTimeResponse.headers['x-timestamp']);
                const localTime = new Date().getTime();
                timeDifference = localTime - serverTime;
                // console.log("TEST DEBUG: local time: ", localTime);
                // console.log("TEST DEBUG: remote time: ", serverTime);
                // console.log("TEST DEBUG: time difference: ", timeDifference);
            }                


            // setup reference test data - two establishments
            const nonCqcServicesResults = await apiEndpoint.get('/services/byCategory?cqc=false')
                .expect('Content-Type', /json/)
                .expect(200);
            
            nonCqcServices = nonCqcServicesResults.body;
            const site1 =  registrationUtils.newNonCqcSite(postcodes[2], nonCqcServices);
            const site1Response = await apiEndpoint.post('/registration')
                .send([site1])
                .expect('Content-Type', /json/)
                .expect(200);
            establishment1 = site1Response.body;
            establishmentId = establishment1.establishmentId;


            // need to login to get JWT token
            let site1LoginResponse = null;
            site1LoginResponse = await apiEndpoint.post('/login')
                .send({
                    username: site1.user.username,
                    password: site1.user.password
                });

            // the worker test is sometimes failing with authentication issue
            if (site1LoginResponse.body && site1LoginResponse.body.fullname) {
                establishment1Token = site1LoginResponse.header.authorization;
                establishment1Username = site1.user.username;
                establishmentUid = site1LoginResponse.body.establishment.uid;
                expect(site1LoginResponse.body.establishment.id).toEqual(establishmentId);
            } else {
                // login a second time
                site1LoginResponse = await apiEndpoint.post('/login')
                    .send({
                        username: site1.user.username,
                        password: site1.user.password
                    });
                establishment1Token = site1LoginResponse.header.authorization;
                establishment1Username = site1.user.username;
                establishmentUid = site1LoginResponse.body.establishment.uid;
                expect(site1LoginResponse.body.establishment.id).toEqual(establishmentId);
            }
        });

        let newWorker = null;
        it("should create a Worker", async () => {
            expect(establishment1).not.toBeNull();
            expect(establishmentUid).not.toBeNull();
            expect(Number.isInteger(establishmentId)).toEqual(true);

            // proven validation errors
            await apiEndpoint.post(`/establishment/${establishmentId}/worker`)
                .set('Authorization', establishment1Token)
                .send({
                    "nameId" : "Misspelt attribute name - effectively missing",
                    "contract" : "Temporary",
                    "mainJob" : {
                        "jobId" : 12,
                        "title" : "Care Worker"
                    }
                })
                .expect('Content-Type', /html/)
                .expect(400);
            await apiEndpoint.post(`/establishment/${establishmentId}/worker`)
                .set('Authorization', establishment1Token)
                .send({
                    "nameOrId" : "Warren Ayling",
                    "contractt" : "Mispelt",
                    "mainJob" : {
                        "jobId" : 12,
                        "title" : "Care Worker"
                    }
                })
                .expect('Content-Type', /html/)
                .expect(400);
            await apiEndpoint.post(`/establishment/${establishmentId}/worker`)
                .set('Authorization', establishment1Token)
                .send({
                    "nameOrId" : "Warren Ayling",
                    "contract" : "Temporary",
                    "maimnJob" : {
                        "jobId" : 12,
                        "title" : "Misspelt"
                    }
                })
                .expect('Content-Type', /html/)
                .expect(400);
            await apiEndpoint.post(`/establishment/${establishmentId}/worker`)
                .set('Authorization', establishment1Token)
                .send({
                    "nameOrId" : "Warren Ayling",
                    "contract" : "Temporary",
                    "mainJob" : {
                        "jobIId" : 20,
                        "titlee" : "misspelt"
                    }
                })
                .expect('Content-Type', /html/)
                .expect(400);
            await apiEndpoint.post(`/establishment/${establishmentId}/worker`)
                .set('Authorization', establishment1Token)
                .send({
                    "nameOrId" : "Warren Ayling",
                    "contract" : "Temporary",
                    "mainJob" : {
                        "jobId" : 200,
                        "title" : "Out of range"
                    }
                })
                .expect('Content-Type', /html/)
                .expect(400);
            await apiEndpoint.post(`/establishment/${establishmentId}/worker`)
                .set('Authorization', establishment1Token)
                .send({
                    "nameOrId" : "Warren Ayling",
                    "contract" : "Temporary",
                    "mainJob" : {
                        "title" : "Unknown Job Title innit"
                    }
                })
                .expect('Content-Type', /html/)
                .expect(400);
            await apiEndpoint.post(`/establishment/${establishmentId}/worker`)
                .set('Authorization', establishment1Token)
                .send({
                    "nameOrId" : "Warren Ayling",
                    "contract" : "unknown",
                    "mainJob" : {
                        "jobId" : 12,
                        "title" : "Care Worker"
                    }
                })
                .expect('Content-Type', /html/)
                .expect(400);


            // incorrect establishment id and worker facts
            const unknownEstablishmentId = 1723785475876865;
            const unknownEstablishmentUId = uuid.v4();
            await apiEndpoint.post(`/establishment/${unknownEstablishmentId}/worker`)
                .set('Authorization', establishment1Token)
                .send({})
                .expect('Content-Type', /html/)
                .expect(403);
            await apiEndpoint.post(`/establishment/${unknownEstablishmentUId}/worker`)
                .set('Authorization', establishment1Token)
                .send({})
                .expect('Content-Type', /html/)
                .expect(403);
            await apiEndpoint.post(`/establishment/${unknownEstablishmentId}/worker`)
                //.set('Authorization', establishment1Token)
                .send({})
                .expect('Content-Type', /html/)
                .expect(401);
        
            // create the Worker having tested all failures first; minimises the response time being create and update (next)
            newWorker = workerUtils.newWorker(jobs);
            const newWorkerResponse = await apiEndpoint.post(`/establishment/${establishmentUid}/worker`)
                .set('Authorization', establishment1Token)
                .send(newWorker)
                .expect('Content-Type', /json/)
                .expect(201);

            expect(newWorkerResponse.body.uid).not.toBeNull();
            workerUid = newWorkerResponse.body.uid;

            const uuidRegex = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/;
            expect(uuidRegex.test(workerUid.toUpperCase())).toEqual(true);            
        });

        it("should update a Worker's mandatory properties", async () => {
            expect(establishment1).not.toBeNull();
            expect(establishmentUid).not.toBeNull();
            expect(workerUid).not.toBeNull();

            const updatedNameId = newWorker.nameOrId + " updated";
            const updatedContract = newWorker.contract == "Agency" ? "Permanent" : "Agency";
            const updatedJobId = newWorker.mainJob.jobId == 20 ? 19 : 20;
            const updatedWorkerResponse = await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    "nameOrId" : updatedNameId,
                    "contract" : updatedContract,
                    "mainJob" : {
                        "jobId" : updatedJobId
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200);

            expect(updatedWorkerResponse.body.uid).not.toBeNull();
            expect(updatedWorkerResponse.body.uid).toEqual(workerUid);
            expect(updatedWorkerResponse.body.nameOrId).toEqual(updatedNameId);
            expect(updatedWorkerResponse.body.contract).toEqual(updatedContract);
            expect(updatedWorkerResponse.body.mainJob.jobId).toEqual(updatedJobId);

            let requestEpoch = new Date().getTime();
            let workerChangeHistory =  await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}?history=full`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);

            let updatedEpoch = new Date(workerChangeHistory.body.updated).getTime();
            expect(Math.abs(requestEpoch-updatedEpoch)).toBeLessThan(MIN_TIME_TOLERANCE);   // allows for slight clock slew

            validatePropertyChangeHistory('NameOrId',
                                          PropertiesResponses,
                                          workerChangeHistory.body.nameOrId,
                                          updatedNameId,
                                          newWorker.nameOrId,
                                          establishment1Username,
                                          requestEpoch,
                                          (ref, given) => {
                                            return ref == given
                                          });
            validatePropertyChangeHistory('contract',
                PropertiesResponses,
                workerChangeHistory.body.contract,
                updatedContract,
                newWorker.contract,
                establishment1Username,
                requestEpoch,
                (ref, given) => {
                  return ref == given
                });
            validatePropertyChangeHistory('mainJob',
                PropertiesResponses,
                workerChangeHistory.body.mainJob,
                updatedJobId,
                newWorker.mainJob.jobId,
                establishment1Username,
                requestEpoch,
                (ref, given) => {
                    return ref.jobId == given
                });

            // now update all properties but with same value - expect no change
            let lastSavedDate = workerChangeHistory.body.nameOrId.lastSaved;
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    "nameOrId" : updatedNameId,
                    "contract" : updatedContract,
                    "mainJob" : {
                        "jobId" : updatedJobId
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200);
            workerChangeHistory =  await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}?history=property`)
            .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(workerChangeHistory.body.nameOrId.currentValue).toEqual(updatedNameId);
            expect(workerChangeHistory.body.nameOrId.lastChanged).toEqual(new Date(lastSavedDate).toISOString());                             // lastChanged is equal to the previous last saved
            expect(new Date(workerChangeHistory.body.nameOrId.lastSaved).getTime()).toBeGreaterThan(new Date(lastSavedDate).getTime());       // most recent last saved greater than the previous last saved
            expect(workerChangeHistory.body.contract.currentValue).toEqual(updatedContract);
            expect(workerChangeHistory.body.contract.lastChanged).toEqual(new Date(lastSavedDate).toISOString());                             // lastChanged is equal to the previous last saved
            expect(new Date(workerChangeHistory.body.contract.lastSaved).getTime()).toBeGreaterThan(new Date(lastSavedDate).getTime());       // most recent last saved greater than the previous last saved
            expect(workerChangeHistory.body.mainJob.currentValue.jobId).toEqual(updatedJobId);
            expect(workerChangeHistory.body.mainJob.lastChanged).toEqual(new Date(lastSavedDate).toISOString());                             // lastChanged is equal to the previous last saved
            expect(new Date(workerChangeHistory.body.mainJob.lastSaved).getTime()).toBeGreaterThan(new Date(lastSavedDate).getTime());       // most recent last saved greater than the previous last saved
        

            // successful updates of each property at a time
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    "nameOrId" : "Updated Worker Name"
                })
                .expect('Content-Type', /json/)
                .expect(200);
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    "contract" : "Pool/Bank"
                })
                .expect('Content-Type', /json/)
                .expect(200);
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    "contract" : "Temporary"
                })
                .expect('Content-Type', /json/)
                .expect(200);
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    "contract" : "Agency"
                })
                .expect('Content-Type', /json/)
                .expect(200);
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    "contract" : "Other"
                })
                .expect('Content-Type', /json/)
                .expect(200);
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    "contract" : "Permanent"
                })
                .expect('Content-Type', /json/)
                .expect(200);
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    "mainJob" : {
                        "jobId" : 19
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200);
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({})
                .expect('Content-Type', /json/)
                .expect(200);

            // proven validation errors
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    "nameOrId" : "ten nine \"eight\" seven 6543210 (!'£$%^&*) \\ special"
                })
                .expect('Content-Type', /html/)
                .expect(400);
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    "contract" : "Undefined"
                })
                .expect('Content-Type', /html/)
                .expect(400);
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    "mainJob" : {
                        "jobId" : 32,
                        "title" : "Out of range"
                    }
                })
                .expect('Content-Type', /html/)
                .expect(400);

            // incorrect establishment id and worker facts
            const unknownUuid = uuid.v4();
            const unknownestablishmentUid = uuid.v4();
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${unknownUuid}`)
                .set('Authorization', establishment1Token)
                .send({})
                .expect('Content-Type', /html/)
                .expect(404);
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/2f8bd309-2a3e`)
                .set('Authorization', establishment1Token)
                .send({})
                .expect('Content-Type', /html/)
                .expect(400);
            await apiEndpoint.put(`/establishment/${unknownestablishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({})
                .expect('Content-Type', /html/)
                .expect(403);
            await apiEndpoint.put(`/establishment/${unknownestablishmentUid}/worker/${workerUid}`)
                //.set('Authorization', establishment1Token)
                .send({})
                .expect('Content-Type', /html/)
                .expect(401);            
        });

        it("should update a Worker's Approved Mental Health Worker property", async () => {
            expect(establishmentUid).not.toBeNull();

            // NOTE - the approvedMentalHealthWorker options are case sensitive (know!)
            const updatedWorkerResponse = await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    "approvedMentalHealthWorker" : "Don't know"
                })
                .expect('Content-Type', /json/)
                .expect(200);
            expect(updatedWorkerResponse.body.approvedMentalHealthWorker).toEqual('Don\'t know');

            let fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(fetchedWorkerResponse.body.approvedMentalHealthWorker).toEqual("Don't know");

            // update once with change
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    "approvedMentalHealthWorker" : "Yes"
                })
                .expect('Content-Type', /json/)
                .expect(200);

            fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(fetchedWorkerResponse.body.approvedMentalHealthWorker).toEqual("Yes");

            // now test change history
            let requestEpoch = new Date().getTime();
            let workerChangeHistory =  await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}?history=full`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            let updatedEpoch = new Date(workerChangeHistory.body.updated).getTime();
            expect(Math.abs(requestEpoch-updatedEpoch)).toBeLessThan(MIN_TIME_TOLERANCE);   // allows for slight clock slew

            validatePropertyChangeHistory(
                'approvedMentalHealthWorker',
                PropertiesResponses,
                workerChangeHistory.body.approvedMentalHealthWorker,
                "Yes",
                "Don't know",
                establishment1Username,
                requestEpoch,
                (ref, given) => {
                    return ref == given
                });

            // now update the property but with same value - expect no change
            let lastSavedDate = workerChangeHistory.body.approvedMentalHealthWorker.lastSaved;
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
            .set('Authorization', establishment1Token)
                .send({
                    "approvedMentalHealthWorker" : "Yes"
                })
                .expect('Content-Type', /json/)
                .expect(200);
            workerChangeHistory =  await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}?history=property`)
            .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(workerChangeHistory.body.approvedMentalHealthWorker.currentValue).toEqual('Yes');
            expect(workerChangeHistory.body.approvedMentalHealthWorker.lastChanged).toEqual(new Date(lastSavedDate).toISOString());                             // lastChanged is equal to the previous last saved
            expect(new Date(workerChangeHistory.body.approvedMentalHealthWorker.lastSaved).getTime()).toBeGreaterThan(new Date(lastSavedDate).getTime());       // most recent last saved greater than the previous last saved

            // expected failures
            apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    "approvedMentalHealthWorker" : "No"
                })
                .expect('Content-Type', /json/)
                .expect(200);

            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    "approvedMentalHealthWorker" : "Undefined"
                })
                .expect('Content-Type', /html/)
                .expect(400);
        });

        it("should update a Worker's Main Job Start Date property", async () => {
            const updatedWorkerResponse = await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    "mainJobStartDate" : "2019-01-15"
                })
                .expect('Content-Type', /json/)
                .expect(200);
            expect(updatedWorkerResponse.body.mainJobStartDate).toEqual("2019-01-15");

            const fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(fetchedWorkerResponse.body.mainJobStartDate).toEqual("2019-01-15");

            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    "mainJobStartDate" : "2019-01-14"
                })
                .expect('Content-Type', /json/)
                .expect(200);

            // now test change history
            let requestEpoch = new Date().getTime();
            let workerChangeHistory =  await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}?history=full`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            let updatedEpoch = new Date(workerChangeHistory.body.updated).getTime();
            expect(Math.abs(requestEpoch-updatedEpoch)).toBeLessThan(MIN_TIME_TOLERANCE);   // allows for slight clock slew

            validatePropertyChangeHistory(
                'mainJobStartDate',
                PropertiesResponses,
                workerChangeHistory.body.mainJobStartDate,
                "2019-01-14",
                "2019-01-15",
                establishment1Username,
                requestEpoch,
                (ref, given) => {
                    return ref == given
                });

            // now update the property but with same value - expect no change
            let lastSavedDate = workerChangeHistory.body.mainJobStartDate.lastSaved;
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    "mainJobStartDate" : "2019-01-14"
                })
                .expect('Content-Type', /json/)
                .expect(200);
            workerChangeHistory =  await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}?history=property`)
            .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(workerChangeHistory.body.mainJobStartDate.currentValue).toEqual('2019-01-14');
            expect(workerChangeHistory.body.mainJobStartDate.lastChanged).toEqual(new Date(lastSavedDate).toISOString());                             // lastChanged is equal to the previous last saved
            expect(new Date(workerChangeHistory.body.mainJobStartDate.lastSaved).getTime()).toBeGreaterThan(new Date(lastSavedDate).getTime());       // most recent last saved greater than the previous last saved

            // expected failures
            const tomorrow = new Date();
            tomorrow.setDate(new Date().getDate()+1);
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    "mainJobStartDate" : tomorrow.toISOString().slice(0,10)
                })
                .expect('Content-Type', /html/)
                .expect(400);
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    "mainJobStartDate" : "2018-02-29"
                })
                .expect('Content-Type', /html/)
                .expect(400);
        });

        it("should update a Worker's NI Number property", async () => {
            const updatedWorkerResponse = await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    "nationalInsuranceNumber" : "NY 21 26 12 A"
                })
                .expect('Content-Type', /json/)
                .expect(200);
            expect(updatedWorkerResponse.body.nationalInsuranceNumber).toEqual("NY 21 26 12 A");
            const fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(fetchedWorkerResponse.body.nationalInsuranceNumber).toEqual("NY 21 26 12 A");

            // now test change history
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    "nationalInsuranceNumber" : "NY 21 26 12 B"
                })
                .expect('Content-Type', /json/)
                .expect(200);

            let requestEpoch = new Date().getTime();
            let workerChangeHistory =  await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}?history=full`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            let updatedEpoch = new Date(workerChangeHistory.body.updated).getTime();
            expect(Math.abs(requestEpoch-updatedEpoch)).toBeLessThan(MIN_TIME_TOLERANCE);   // allows for slight clock slew

            validatePropertyChangeHistory('nationalInsuranceNumber',
                PropertiesResponses,
                workerChangeHistory.body.nationalInsuranceNumber,
                "NY 21 26 12 B",
                "NY 21 26 12 A",
                establishment1Username,
                requestEpoch,
                (ref, given) => {
                    return ref == given
                });

            // now update the property but with same value - expect no change
            let lastSavedDate = workerChangeHistory.body.nationalInsuranceNumber.lastSaved;
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
            .set('Authorization', establishment1Token)
                .send({
                    "nationalInsuranceNumber" : "NY 21 26 12 B"
                })
                .expect('Content-Type', /json/)
                .expect(200);
            workerChangeHistory =  await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}?history=property`)
            .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(workerChangeHistory.body.nationalInsuranceNumber.currentValue).toEqual('NY 21 26 12 B');
            expect(workerChangeHistory.body.nationalInsuranceNumber.lastChanged).toEqual(new Date(lastSavedDate).toISOString());                             // lastChanged is equal to the previous last saved
            expect(new Date(workerChangeHistory.body.nationalInsuranceNumber.lastSaved).getTime()).toBeGreaterThan(new Date(lastSavedDate).getTime());       // most recent last saved greater than the previous last saved

            // "NI" is not a valid prefix for a NI Number.
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    "nationalInsuranceNumber" : "NI 21 26 12 A"
                })
                .expect('Content-Type', /html/)
                .expect(400);
            // NI is more than 13 characters
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    "mainJobStartDate" : "NY   21 26  12 A"
                })
                .expect('Content-Type', /html/)
                .expect(400);
        });

        it("should update a Worker's DOB property", async () => {
            const updatedWorkerResponse = await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    "dateOfBirth" : "1994-01-15"
                })
                .expect('Content-Type', /json/)
                .expect(200);
            expect(updatedWorkerResponse.body.dateOfBirth).toEqual("1994-01-15");
            const fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(fetchedWorkerResponse.body.dateOfBirth).toEqual("1994-01-15");

            // now test change history
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    "dateOfBirth" : "1994-01-16"
                })
                .expect('Content-Type', /json/)
                .expect(200);

            let requestEpoch = new Date().getTime();
            let workerChangeHistory =  await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}?history=full`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            let updatedEpoch = new Date(workerChangeHistory.body.updated).getTime();
            expect(Math.abs(requestEpoch-updatedEpoch)).toBeLessThan(MIN_TIME_TOLERANCE);   // allows for slight clock slew

            validatePropertyChangeHistory(
                'dateOfBirth',
                PropertiesResponses,
                workerChangeHistory.body.dateOfBirth,
                "1994-01-16",
                "1994-01-15",
                establishment1Username,
                requestEpoch,
                (ref, given) => {
                    return ref == given
                });

            // now update the property but with same value - expect no change
            let lastSavedDate = workerChangeHistory.body.dateOfBirth.lastSaved;
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    "dateOfBirth" : "1994-01-16"
                })
                .expect('Content-Type', /json/)
                .expect(200);
            workerChangeHistory =  await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}?history=property`)
            .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(workerChangeHistory.body.dateOfBirth.currentValue).toEqual('1994-01-16');
            expect(workerChangeHistory.body.dateOfBirth.lastChanged).toEqual(new Date(lastSavedDate).toISOString());                             // lastChanged is equal to the previous last saved
            expect(new Date(workerChangeHistory.body.dateOfBirth.lastSaved).getTime()).toBeGreaterThan(new Date(lastSavedDate).getTime());       // most recent last saved greater than the previous last saved
            
            // forced failures
            // 1994 is not a leap year, so there are only 28 days in Feb
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    "dateOfBirth" : "1994-02-29"
                })
                .expect('Content-Type', /html/)
                .expect(400);
            
            const tenYearsAgo = new Date();
            tenYearsAgo.setDate(new Date().getDate()-(10*366));
            const childLabourResponse = await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    "dateOfBirth" : tenYearsAgo.toISOString().slice(0,10)
                })
                .expect('Content-Type', /html/)
                .expect(400);
        });

        it("should update a Worker's postcode property", async () => {
            // NOTE - the approvedMentalHealthWorker options are case sensitive (know!)
            const updatedWorkerResponse = await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    "postcode" : "SE13 7SN"
                })
                .expect('Content-Type', /json/)
                .expect(200);
            expect(updatedWorkerResponse.body.postcode).toEqual("SE13 7SN");
            const fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(fetchedWorkerResponse.body.postcode).toEqual("SE13 7SN");

            // now test change history
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    "postcode" : "SE13 7SS"
                })
                .expect('Content-Type', /json/)
                .expect(200);

            let requestEpoch = new Date().getTime();
            let workerChangeHistory =  await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}?history=full`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            let updatedEpoch = new Date(workerChangeHistory.body.updated).getTime();
            expect(Math.abs(requestEpoch-updatedEpoch)).toBeLessThan(MIN_TIME_TOLERANCE);   // allows for slight clock slew

            validatePropertyChangeHistory(
                'postcode',
                PropertiesResponses,
                workerChangeHistory.body.postcode,
                "SE13 7SS",
                "SE13 7SN",
                establishment1Username,
                requestEpoch,
                (ref, given) => {
                    return ref == given
                });

            // now update the property but with same value - expect no change
            let lastSavedDate = workerChangeHistory.body.postcode.lastSaved;
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    "postcode" : "SE13 7SS"
                })
                .expect('Content-Type', /json/)
                .expect(200);
            workerChangeHistory =  await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}?history=property`)
            .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(workerChangeHistory.body.postcode.currentValue).toEqual('SE13 7SS');
            expect(workerChangeHistory.body.postcode.lastChanged).toEqual(new Date(lastSavedDate).toISOString());                             // lastChanged is equal to the previous last saved
            expect(new Date(workerChangeHistory.body.postcode.lastSaved).getTime()).toBeGreaterThan(new Date(lastSavedDate).getTime());       // most recent last saved greater than the previous last saved
            
            // forced failures
            // 1994 is not a leap year, so there are only 28 days in Feb
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    "postcode" : "SE13 7S"
                })
                .expect('Content-Type', /html/)
                .expect(400);
        });

        it("should update a Worker's gender", async () => {
            // NOTE - the gender options are case sensitive (know!); test all expected options
            const updatedWorkerResponse = await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    "gender" : "Male"
                })
                .expect('Content-Type', /json/)
                .expect(200);
            expect(updatedWorkerResponse.body.gender).toEqual("Male");
            let fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(fetchedWorkerResponse.body.gender).toEqual("Male");
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    "gender" : "Female"
                })
                .expect('Content-Type', /json/)
                .expect(200);

            // now test change history
            let requestEpoch = new Date().getTime();
            let workerChangeHistory =  await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}?history=full`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            let updatedEpoch = new Date(workerChangeHistory.body.updated).getTime();
            expect(Math.abs(requestEpoch-updatedEpoch)).toBeLessThan(MIN_TIME_TOLERANCE);   // allows for slight clock slew

            validatePropertyChangeHistory(
                'gender',
                PropertiesResponses,
                workerChangeHistory.body.gender,
                "Female",
                "Male",
                establishment1Username,
                requestEpoch,
                (ref, given) => {
                    return ref == given
                });

            // now update the property but with same value - expect no change
            let lastSavedDate = workerChangeHistory.body.gender.lastSaved;
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    "gender" : "Female"
                })
                .expect('Content-Type', /json/)
                .expect(200);
            workerChangeHistory =  await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}?history=property`)
            .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(workerChangeHistory.body.gender.currentValue).toEqual('Female');
            expect(workerChangeHistory.body.gender.lastChanged).toEqual(new Date(lastSavedDate).toISOString());                             // lastChanged is equal to the previous last saved
            expect(new Date(workerChangeHistory.body.gender.lastSaved).getTime()).toBeGreaterThan(new Date(lastSavedDate).getTime());       // most recent last saved greater than the previous last saved

            // update using each expected value
            fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(fetchedWorkerResponse.body.gender).toEqual("Female");
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    "gender" : "Other"
                })
                .expect('Content-Type', /json/)
                .expect(200);
            fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(fetchedWorkerResponse.body.gender).toEqual("Other");
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    "gender" : "Don't know"
                })
                .expect('Content-Type', /json/)
                .expect(200);
            fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(fetchedWorkerResponse.body.gender).toEqual("Don't know");

            // forced failure
            // 1994 is not a leap year, so there are only 28 days in Feb
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    "gender" : "unknown"
                })
                .expect('Content-Type', /html/)
                .expect(400);
        });

        it("should update a Worker's disability", async () => {
            // NOTE - the gender options are case sensitive (know!); test all expected options
            const updatedWorkerResponse = await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    "disability" : "Yes"
                })
                .expect('Content-Type', /json/)
                .expect(200);
            expect(updatedWorkerResponse.body.disability).toEqual("Yes");
            let fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(fetchedWorkerResponse.body.disability).toEqual("Yes");
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    "disability" : "No"
                })
                .expect('Content-Type', /json/)
                .expect(200);

            // now test change history
            let requestEpoch = new Date().getTime();
            let workerChangeHistory =  await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}?history=full`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            let updatedEpoch = new Date(workerChangeHistory.body.updated).getTime();
            expect(Math.abs(requestEpoch-updatedEpoch)).toBeLessThan(MIN_TIME_TOLERANCE);   // allows for slight clock slew

            validatePropertyChangeHistory(
                'disability',
                PropertiesResponses,
                workerChangeHistory.body.disability,
                "No",
                "Yes",
                establishment1Username,
                requestEpoch,
                (ref, given) => {
                    return ref == given
                });

            // now update the property but with same value - expect no change
            let lastSavedDate = workerChangeHistory.body.disability.lastSaved;
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    "disability" : "No"
                })
                .expect('Content-Type', /json/)
                .expect(200);
            workerChangeHistory =  await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}?history=property`)
            .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(workerChangeHistory.body.disability.currentValue).toEqual('No');
            expect(workerChangeHistory.body.disability.lastChanged).toEqual(new Date(lastSavedDate).toISOString());                             // lastChanged is equal to the previous last saved
            expect(new Date(workerChangeHistory.body.disability.lastSaved).getTime()).toBeGreaterThan(new Date(lastSavedDate).getTime());       // most recent last saved greater than the previous last saved

            fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(fetchedWorkerResponse.body.disability).toEqual("No");
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    "disability" : "Undisclosed"
                })
                .expect('Content-Type', /json/)
                .expect(200);
            fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(fetchedWorkerResponse.body.disability).toEqual("Undisclosed");
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    "disability" : "Don't know"
                })
                .expect('Content-Type', /json/)
                .expect(200);
            fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(fetchedWorkerResponse.body.disability).toEqual("Don't know");

            // 1994 is not a leap year, so there are only 28 days in Feb
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    "disability" : "Other"
                })
                .expect('Content-Type', /html/)
                .expect(400);
        });

        it("should update a Worker's ethnicity", async () => {
            const randomEthnicity = ethnicityUtils.lookupRandomEthnicity(ethnicities);

            const updatedWorkerResponse = await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    ethnicity : {
                        ethnicityId: randomEthnicity.id
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200);
            expect(updatedWorkerResponse.body.ethnicity.ethnicityId).toEqual(randomEthnicity.id);
            expect(updatedWorkerResponse.body.ethnicity.ethnicity).toEqual(randomEthnicity.ethnicity);

            let fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(fetchedWorkerResponse.body.ethnicity.ethnicityId).toEqual(randomEthnicity.id);
            expect(fetchedWorkerResponse.body.ethnicity.ethnicity).toEqual(randomEthnicity.ethnicity);

            const secondEthnicity = randomEthnicity.id == 11 ? 12 : 11;
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    ethnicity : {
                        ethnicityId: secondEthnicity
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200);

            // now test change history
            let requestEpoch = new Date().getTime();
            let workerChangeHistory =  await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}?history=full`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            let updatedEpoch = new Date(workerChangeHistory.body.updated).getTime();
            expect(Math.abs(requestEpoch-updatedEpoch)).toBeLessThan(MIN_TIME_TOLERANCE);   // allows for slight clock slew

            validatePropertyChangeHistory(
                'ethnicity',
                PropertiesResponses,
                workerChangeHistory.body.ethnicity,
                secondEthnicity,
                randomEthnicity.id,
                establishment1Username,
                requestEpoch,
                (ref, given) => {
                    return ref.ethnicityId == given
                });

            // now update the property but with same value - expect no change
            let lastSavedDate = workerChangeHistory.body.ethnicity.lastSaved;
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    ethnicity : {
                        ethnicityId: secondEthnicity
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200);
            workerChangeHistory =  await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}?history=property`)
            .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(workerChangeHistory.body.ethnicity.currentValue.ethnicityId).toEqual(secondEthnicity);
            expect(workerChangeHistory.body.ethnicity.lastChanged).toEqual(new Date(lastSavedDate).toISOString());                             // lastChanged is equal to the previous last saved
            expect(new Date(workerChangeHistory.body.ethnicity.lastSaved).getTime()).toBeGreaterThan(new Date(lastSavedDate).getTime());       // most recent last saved greater than the previous last saved            

            // update ethnicity by name
            const secondRandomEthnicity = ethnicityUtils.lookupRandomEthnicity(ethnicities);
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    ethnicity : {
                        ethnicity: secondRandomEthnicity.ethnicity
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200);
            fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(fetchedWorkerResponse.body.ethnicity.ethnicityId).toEqual(secondRandomEthnicity.id);
            expect(fetchedWorkerResponse.body.ethnicity.ethnicity).toEqual(secondRandomEthnicity.ethnicity);

            // out of range ethnicity id
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    ethnicity : {
                        ethnicityId: 100
                    }
                })
                .expect('Content-Type', /html/)
                .expect(400);
            // unknown ethnicity (by name)
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    ethnicity : {
                        ethnicity: "UnKnown"
                    }
                })
                .expect('Content-Type', /html/)
                .expect(400);
        });

        it("should update a Worker's nationality", async () => {
            const randomNationality = nationalityUtils.lookupRandomNationality(nationalities);

            const updatedWorkerResponse = await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    nationality : {
                        value : "Other",
                        other : {
                            nationalityId : randomNationality.id
                        }
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200);
            expect(updatedWorkerResponse.body.nationality.other.nationalityId).toEqual(randomNationality.id);
            expect(updatedWorkerResponse.body.nationality.other.nationality).toEqual(randomNationality.nationality);

            let fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(fetchedWorkerResponse.body.nationality.other.nationalityId).toEqual(randomNationality.id);
            expect(fetchedWorkerResponse.body.nationality.other.nationality).toEqual(randomNationality.nationality);

            const secondNationality = randomNationality.id == 222 ? 111 : 222;
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    nationality : {
                        value : "Other",
                        other : {
                            nationalityId : secondNationality
                        }
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200);

            // now test change history
            let requestEpoch = new Date().getTime();
            let workerChangeHistory =  await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}?history=full`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            let updatedEpoch = new Date(workerChangeHistory.body.updated).getTime();
            expect(Math.abs(requestEpoch-updatedEpoch)).toBeLessThan(MIN_TIME_TOLERANCE);   // allows for slight clock slew

            validatePropertyChangeHistory(
                'nationality',
                PropertiesResponses,
                workerChangeHistory.body.nationality,
                secondNationality,
                randomNationality.id,
                establishment1Username,
                requestEpoch,
                (ref, given) => {
                    return ref.value === 'Other' && ref.other.nationalityId == given
                });

            // now update the property but with same value - expect no change
            let lastSavedDate = workerChangeHistory.body.nationality.lastSaved;
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    nationality : {
                        value : "Other",
                        other : {
                            nationalityId : secondNationality
                        }
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200);
            workerChangeHistory =  await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}?history=property`)
            .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(workerChangeHistory.body.nationality.currentValue.other.nationalityId).toEqual(secondNationality);
            expect(workerChangeHistory.body.nationality.lastChanged).toEqual(new Date(lastSavedDate).toISOString());                             // lastChanged is equal to the previous last saved
            expect(new Date(workerChangeHistory.body.nationality.lastSaved).getTime()).toBeGreaterThan(new Date(lastSavedDate).getTime());       // most recent last saved greater than the previous last saved            

            // update nationaltity by given value
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    nationality : {
                        value : "British"
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200);
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    nationality : {
                        value : "Don't know"
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200);
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    nationality : {
                        value : "Other"     // even though value is other, "other" is optional
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200);
            
            // update nationaltity by name
            const secondRandomNationality = nationalityUtils.lookupRandomNationality(nationalities);
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    nationality : {
                        value : "Other",
                        other : {
                            nationality : secondRandomNationality.nationality
                        }
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200);
            fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(fetchedWorkerResponse.body.nationality.other.nationalityId).toEqual(secondRandomNationality.id);
            expect(fetchedWorkerResponse.body.nationality.other.nationality).toEqual(secondRandomNationality.nationality);

            // unknown given nationality
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    nationality : {
                        value : "Don't Know"          // case sensitive
                    }
                })
                .expect('Content-Type', /html/)
                .expect(400);
            // out of range nationality id
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    nationality : {
                        value : "Other",
                        other : {
                            nationalityId : 10000
                        }
                    }
                })
                .expect('Content-Type', /html/)
                .expect(400);
            // unknown nationality (by name)
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    nationality : {
                        value : "Other",
                        other : {
                            nationality : "wozietian"
                        }
                    }
                })
                .expect('Content-Type', /html/)
                .expect(400);
        });

        it("should update a Worker's country of birth", async () => {
            const randomCountry = countryUtils.lookupRandomCountry(countries);

            const updatedWorkerResponse = await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    countryOfBirth : {
                        value : "Other",
                        other : {
                            countryId : randomCountry.id
                        }
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200);
            expect(updatedWorkerResponse.body.countryOfBirth.other.countryId).toEqual(randomCountry.id);
            expect(updatedWorkerResponse.body.countryOfBirth.other.country).toEqual(randomCountry.country);

            let fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(fetchedWorkerResponse.body.countryOfBirth.other.countryId).toEqual(randomCountry.id);
            expect(fetchedWorkerResponse.body.countryOfBirth.other.country).toEqual(randomCountry.country);

            const secondCountry = randomCountry.id == 99 ? 33 : 32;
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    countryOfBirth : {
                        value : "Other",
                        other : {
                            countryId : secondCountry
                        }
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200);

            // now test change history
            let requestEpoch = new Date().getTime();
            let workerChangeHistory =  await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}?history=full`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            let updatedEpoch = new Date(workerChangeHistory.body.updated).getTime();
            expect(Math.abs(requestEpoch-updatedEpoch)).toBeLessThan(MIN_TIME_TOLERANCE);   // allows for slight clock slew

            validatePropertyChangeHistory(
                'countryOfBirth',
                PropertiesResponses,
                workerChangeHistory.body.countryOfBirth,
                secondCountry,
                randomCountry.id,
                establishment1Username,
                requestEpoch,
                (ref, given) => {
                    return ref.value === 'Other' && ref.other.countryId == given
                });

            // now update the property but with same value - expect no change
            let lastSavedDate = workerChangeHistory.body.countryOfBirth.lastSaved;
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    countryOfBirth : {
                        value : "Other",
                        other : {
                            countryId : secondCountry
                        }
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200);
            workerChangeHistory =  await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}?history=property`)
            .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(workerChangeHistory.body.countryOfBirth.currentValue.other.countryId).toEqual(secondCountry);
            expect(workerChangeHistory.body.countryOfBirth.lastChanged).toEqual(new Date(lastSavedDate).toISOString());                             // lastChanged is equal to the previous last saved
            expect(new Date(workerChangeHistory.body.countryOfBirth.lastSaved).getTime()).toBeGreaterThan(new Date(lastSavedDate).getTime());       // most recent last saved greater than the previous last saved            

            // update country by given value
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    countryOfBirth : {
                        value : "United Kingdom"
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200);
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    countryOfBirth : {
                        value : "Don't know"
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200);
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    countryOfBirth : {
                        value : "Other"     // even though value is other, "other" is optional
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200);

            // update country of birth by name
            const secondRandomCountry = countryUtils.lookupRandomCountry(countries);
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    countryOfBirth : {
                        value : "Other",
                        other : {
                            country : secondRandomCountry.country
                        }
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200);
            fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(fetchedWorkerResponse.body.countryOfBirth.other.countryId).toEqual(secondRandomCountry.id);
            expect(fetchedWorkerResponse.body.countryOfBirth.other.country).toEqual(secondRandomCountry.country);

            // unknown given country
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    countryOfBirth : {
                        value : "Don't Know"          // case sensitive
                    }
                })
                .expect('Content-Type', /html/)
                .expect(400);
            // out of range country id
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    countryOfBirth : {
                        value : "Other",
                        other : {
                            countryId : 10000
                        }
                    }
                })
                .expect('Content-Type', /html/)
                .expect(400);
            // unknown country (by name)
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    countryOfBirth : {
                        value : "Other",
                        other : {
                            country : "woziland"
                        }
                    }
                })
                .expect('Content-Type', /html/)
                .expect(400);
        });

        it("should update a Worker's recruited from", async () => {
            const randomOrigin = recruitedFromUtils.lookupRandomRecruitedFrom(recruitedOrigins);

            const updatedWorkerResponse = await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    recruitedFrom : {
                        value : "Yes",
                        from : {
                            recruitedFromId : randomOrigin.id
                        }
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200);
            expect(updatedWorkerResponse.body.recruitedFrom.from.recruitedFromId).toEqual(randomOrigin.id);
            expect(updatedWorkerResponse.body.recruitedFrom.from.from).toEqual(randomOrigin.from);

            let fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(fetchedWorkerResponse.body.recruitedFrom.from.recruitedFromId).toEqual(randomOrigin.id);
            expect(fetchedWorkerResponse.body.recruitedFrom.from.from).toEqual(randomOrigin.from);

            const secondOrigin = randomOrigin.id == 3 ? 7 : 3;
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    recruitedFrom : {
                        value : "Yes",
                        from : {
                            recruitedFromId : secondOrigin
                        }
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200);

            // now test change history
            let requestEpoch = new Date().getTime();
            let workerChangeHistory =  await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}?history=full`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            let updatedEpoch = new Date(workerChangeHistory.body.updated).getTime();
            expect(Math.abs(requestEpoch-updatedEpoch)).toBeLessThan(MIN_TIME_TOLERANCE);   // allows for slight clock slew

            validatePropertyChangeHistory(
                'recruitedFrom',
                PropertiesResponses,
                workerChangeHistory.body.recruitedFrom,
                secondOrigin,
                randomOrigin.id,
                establishment1Username,
                requestEpoch,
                (ref, given) => {
                    return ref.value === 'Yes' && ref.from.recruitedFromId == given
                });

            // now update the property but with same value - expect no change
            let lastSavedDate = workerChangeHistory.body.recruitedFrom.lastSaved;
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    recruitedFrom : {
                        value : "Yes",
                        from : {
                            recruitedFromId : secondOrigin
                        }
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200);
            workerChangeHistory =  await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}?history=property`)
            .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(workerChangeHistory.body.recruitedFrom.currentValue.from.recruitedFromId).toEqual(secondOrigin);
            expect(workerChangeHistory.body.recruitedFrom.lastChanged).toEqual(new Date(lastSavedDate).toISOString());                             // lastChanged is equal to the previous last saved
            expect(new Date(workerChangeHistory.body.recruitedFrom.lastSaved).getTime()).toBeGreaterThan(new Date(lastSavedDate).getTime());       // most recent last saved greater than the previous last saved            

            // update recruited from by given value
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    recruitedFrom : {
                        value : "No"
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200);
            
             // update recruited from by name
            const secondRandomOrigin = recruitedFromUtils.lookupRandomRecruitedFrom(recruitedOrigins);
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    recruitedFrom : {
                        value : "Yes",
                        from : {
                            from : secondRandomOrigin.from
                        }
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200);
            fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(fetchedWorkerResponse.body.recruitedFrom.from.recruitedFromId).toEqual(secondRandomOrigin.id);
            expect(fetchedWorkerResponse.body.recruitedFrom.from.from).toEqual(secondRandomOrigin.from);

            // unknown given recruited from
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    recruitedFrom : {
                        value : "yes"          // case sensitive
                    }
                })
                .expect('Content-Type', /html/)
                .expect(400);
            // out of range recruited from id
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    recruitedFrom : {
                        value : "Yes",
                        from : {
                            recruitedFromId : 100
                        }
                    }
                })
                .expect('Content-Type', /html/)
                .expect(400);
            // unknown recruited from (by name)
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    recruitedFrom : {
                        value : "Yes",
                        from : {
                            from : 'wozitech'
                        }
                    }
                })
                .expect('Content-Type', /html/)
                .expect(400);
        });

        it("should update a Worker's British Citizenship", async () => {
            const updatedWorkerResponse = await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    britishCitizenship : "Yes"
                })
                .expect('Content-Type', /json/)
                .expect(200);
            expect(updatedWorkerResponse.body.britishCitizenship).toEqual('Yes');
            let fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(fetchedWorkerResponse.body.britishCitizenship).toEqual('Yes');

            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    britishCitizenship : "No"
                })
                .expect('Content-Type', /json/)
                .expect(200);
            fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(fetchedWorkerResponse.body.britishCitizenship).toEqual('No');

            // now test change history
            let requestEpoch = new Date().getTime();
            let workerChangeHistory =  await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}?history=full`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            let updatedEpoch = new Date(workerChangeHistory.body.updated).getTime();
            expect(Math.abs(requestEpoch-updatedEpoch)).toBeLessThan(MIN_TIME_TOLERANCE);   // allows for slight clock slew

            validatePropertyChangeHistory('britishCitizenship',
                PropertiesResponses,
                workerChangeHistory.body.britishCitizenship,
                'No',
                'Yes',
                establishment1Username,
                requestEpoch,
                (ref, given) => {
                    return ref == given
                });

            // now update the property but with same value - expect no change
            let lastSavedDate = workerChangeHistory.body.britishCitizenship.lastSaved;
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    britishCitizenship : "No"
                })
                .expect('Content-Type', /json/)
                .expect(200);
            workerChangeHistory =  await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}?history=property`)
            .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(workerChangeHistory.body.britishCitizenship.currentValue).toEqual('No');
            expect(workerChangeHistory.body.britishCitizenship.lastChanged).toEqual(new Date(lastSavedDate).toISOString());                             // lastChanged is equal to the previous last saved
            expect(new Date(workerChangeHistory.body.britishCitizenship.lastSaved).getTime()).toBeGreaterThan(new Date(lastSavedDate).getTime());       // most recent last saved greater than the previous last saved            

            // last update with expected value
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    britishCitizenship : "Don't know"
                })
                .expect('Content-Type', /json/)
                .expect(200);
            fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(fetchedWorkerResponse.body.britishCitizenship).toEqual("Don't know");
            
            // unknown citizenship value
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    britishCitizenship : "Don't Know"       // case sensitive
                })
                .expect('Content-Type', /html/)
                .expect(400);
        });

        it("should update a Worker's Year of Arrival", async () => {
            const updatedWorkerResponse = await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    yearArrived: {
                        value: "Yes",
                        year: 2019              // upper boundary - this year (yes, I could have used a date to calculate, but you'll need to update the tests in one years time - good time to review tests)
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200);
            expect(updatedWorkerResponse.body.yearArrived.value).toEqual('Yes');
            expect(updatedWorkerResponse.body.yearArrived.year).toEqual(2019);

            let fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(fetchedWorkerResponse.body.yearArrived.value).toEqual('Yes');
            expect(fetchedWorkerResponse.body.yearArrived.year).toEqual(2019);

            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    yearArrived: {
                        value: "Yes",
                        year: 1919              // lower boundary - this year (yes, I could have used a date to calculate, but you'll need to update the tests in one years time - good time to review tests)
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200);
            fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(fetchedWorkerResponse.body.yearArrived.value).toEqual('Yes');
            expect(fetchedWorkerResponse.body.yearArrived.year).toEqual(1919);

            // now test change history
            let requestEpoch = new Date().getTime();
            let workerChangeHistory =  await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}?history=full`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            let updatedEpoch = new Date(workerChangeHistory.body.updated).getTime();
            expect(Math.abs(requestEpoch-updatedEpoch)).toBeLessThan(MIN_TIME_TOLERANCE);   // allows for slight clock slew

            validatePropertyChangeHistory(
                'yearArrived',
                PropertiesResponses,
                workerChangeHistory.body.yearArrived,
                1919,
                2019,
                establishment1Username,
                requestEpoch,
                (ref, given) => {
                    return ref.value = 'Yes' && ref.year == given
                });

            // now update the property but with same value - expect no change
            let lastSavedDate = workerChangeHistory.body.yearArrived.lastSaved;
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    yearArrived: {
                        value: "Yes",
                        year: 1919              // lower boundary - this year (yes, I could have used a date to calculate, but you'll need to update the tests in one years time - good time to review tests)
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200);
            workerChangeHistory =  await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}?history=property`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(workerChangeHistory.body.yearArrived.currentValue.value).toEqual('Yes');
            expect(workerChangeHistory.body.yearArrived.lastChanged).toEqual(new Date(lastSavedDate).toISOString());                             // lastChanged is equal to the previous last saved
            expect(new Date(workerChangeHistory.body.yearArrived.lastSaved).getTime()).toBeGreaterThan(new Date(lastSavedDate).getTime());       // most recent last saved greater than the previous last saved

            // last update with expected value
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    yearArrived: {
                        value: "No"
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200);
            fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(fetchedWorkerResponse.body.yearArrived.value).toEqual('No');
            
            // unknown given value
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    yearArrived: {
                        value: "no"         // case sensitive
                    }
                })
                .expect('Content-Type', /html/)
                .expect(400);

            // upper and lower year boundaries
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    yearArrived: {
                        value: "Yes",
                        year: 1918              // lower boundary - this year (yes, I could have used a date to calculate, but you'll need to update the tests in one years time - good time to review tests)
                    }
                })
                .expect('Content-Type', /html/)
                .expect(400);
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    yearArrived: {
                        value: "Yes",
                        year: 2020              // upper boundary - this year (yes, I could have used a date to calculate, but you'll need to update the tests in one years time - good time to review tests)
                    }
                })
                .expect('Content-Type', /html/)
                .expect(400);
        });

        it("should update a Worker's Social Care Start Date", async () => {
            const updatedWorkerResponse = await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    socialCareStartDate: {
                        value: "Yes",
                        year: 2019              // upper boundary - this year (yes, I could have used a date to calculate, but you'll need to update the tests in one years time - good time to review tests)
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200);
            expect(updatedWorkerResponse.body.socialCareStartDate.value).toEqual('Yes');
            expect(updatedWorkerResponse.body.socialCareStartDate.year).toEqual(2019);

            let fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(fetchedWorkerResponse.body.socialCareStartDate.value).toEqual('Yes');
            expect(fetchedWorkerResponse.body.socialCareStartDate.year).toEqual(2019);

            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    socialCareStartDate: {
                        value: "Yes",
                        year: 1919              // lower boundary - this year (yes, I could have used a date to calculate, but you'll need to update the tests in one years time - good time to review tests)
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200);
            fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
                expect(fetchedWorkerResponse.body.socialCareStartDate.value).toEqual('Yes');
                expect(fetchedWorkerResponse.body.socialCareStartDate.year).toEqual(1919);

            // now test change history
            let requestEpoch = new Date().getTime();
            let workerChangeHistory =  await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}?history=full`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            let updatedEpoch = new Date(workerChangeHistory.body.updated).getTime();
            expect(Math.abs(requestEpoch-updatedEpoch)).toBeLessThan(MIN_TIME_TOLERANCE);   // allows for slight clock slew

            validatePropertyChangeHistory(
                'socialCareStartDate',
                PropertiesResponses,
                workerChangeHistory.body.socialCareStartDate,
                1919,
                2019,
                establishment1Username,
                requestEpoch,
                (ref, given) => {
                    return ref.value = 'Yes' && ref.year == given
                });

            // now update the property but with same value - expect no change
            let lastSavedDate = workerChangeHistory.body.socialCareStartDate.lastSaved;
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    socialCareStartDate: {
                        value: "Yes",
                        year: 1919              // lower boundary - this year (yes, I could have used a date to calculate, but you'll need to update the tests in one years time - good time to review tests)
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200);
            workerChangeHistory =  await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}?history=property`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(workerChangeHistory.body.socialCareStartDate.currentValue.year).toEqual(1919);
            expect(workerChangeHistory.body.socialCareStartDate.lastChanged).toEqual(new Date(lastSavedDate).toISOString());                             // lastChanged is equal to the previous last saved
            expect(new Date(workerChangeHistory.body.socialCareStartDate.lastSaved).getTime()).toBeGreaterThan(new Date(lastSavedDate).getTime());       // most recent last saved greater than the previous last saved

            // last update with expected value
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    socialCareStartDate: {
                        value: "No"
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200);
            fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(fetchedWorkerResponse.body.socialCareStartDate.value).toEqual('No');
            
            // unknown given value
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    socialCareStartDate: {
                        value: "no"         // case sensitive
                    }
                })
                .expect('Content-Type', /html/)
                .expect(400);

            // upper and lower year boundaries
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    socialCareStartDate: {
                        value: "Yes",
                        year: 1918              // lower boundary - this year (yes, I could have used a date to calculate, but you'll need to update the tests in one years time - good time to review tests)
                    }
                })
                .expect('Content-Type', /html/)
                .expect(400);
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    socialCareStartDate: {
                        value: "Yes",
                        year: 2020              // upper boundary - this year (yes, I could have used a date to calculate, but you'll need to update the tests in one years time - good time to review tests)
                    }
                })
                .expect('Content-Type', /html/)
                .expect(400);
        });

        it("should update a Worker's Other Jobs", async () => {
            const firstRandomJob = jobUtils.lookupRandomJob(jobs);
            const updatedWorkerResponse = await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    otherJobs : [
                        {
                            jobId: firstRandomJob.id
                        }
                    ]
                })
                .expect('Content-Type', /json/)
                .expect(200);
            expect(updatedWorkerResponse.body.otherJobs.length).toEqual(1);
            expect(updatedWorkerResponse.body.otherJobs[0].jobId).toEqual(firstRandomJob.id);
            expect(updatedWorkerResponse.body.otherJobs[0].title).toEqual(firstRandomJob.title);

            let fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            
            expect(Array.isArray(fetchedWorkerResponse.body.otherJobs)).toEqual(true);
            expect(fetchedWorkerResponse.body.otherJobs.length).toEqual(1);
            expect(fetchedWorkerResponse.body.otherJobs[0].jobId).toEqual(firstRandomJob.id);
            expect(fetchedWorkerResponse.body.otherJobs[0].title).toEqual(firstRandomJob.title);

            // replace the contents - with another single count set
            const secondRandomJobId = firstRandomJob.id == 7 ? 8 : 7;
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    otherJobs : [
                        {
                            jobId: secondRandomJobId
                        }
                    ]
                })
                .expect('Content-Type', /json/)
                .expect(200);
            fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(Array.isArray(fetchedWorkerResponse.body.otherJobs)).toEqual(true);
            expect(fetchedWorkerResponse.body.otherJobs.length).toEqual(1);
            expect(fetchedWorkerResponse.body.otherJobs[0].jobId).toEqual(secondRandomJobId);

            // now test change history
            let requestEpoch = new Date().getTime();
            let workerChangeHistory =  await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}?history=full`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            let updatedEpoch = new Date(workerChangeHistory.body.updated).getTime();
            expect(Math.abs(requestEpoch-updatedEpoch)).toBeLessThan(MIN_TIME_TOLERANCE);   // allows for slight clock slew

            validatePropertyChangeHistory(
                'otherJobs',
                PropertiesResponses,
                workerChangeHistory.body.otherJobs,
                secondRandomJobId,
                firstRandomJob.id,
                establishment1Username,
                requestEpoch,
                (ref, given) => {
                    if (ref.hasOwnProperty('value')) {
                        return ref.otherJobs[0].jobId == given
                    } else {
                        return ref[0].jobId == given
                    }
                });

            // now update the property but with same value - expect no change
            let lastSavedDate = workerChangeHistory.body.otherJobs.lastSaved;
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    otherJobs : [
                        {
                            jobId: secondRandomJobId
                        }
                    ]
                })
                .expect('Content-Type', /json/)
                .expect(200);
            workerChangeHistory =  await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}?history=property`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(workerChangeHistory.body.otherJobs.currentValue.length).toEqual(1);
            expect(workerChangeHistory.body.otherJobs.currentValue[0].jobId).toEqual(secondRandomJobId);
            expect(workerChangeHistory.body.otherJobs.lastChanged).toEqual(new Date(lastSavedDate).toISOString());                             // lastChanged is equal to the previous last saved
            expect(new Date(workerChangeHistory.body.otherJobs.lastSaved).getTime()).toBeGreaterThan(new Date(lastSavedDate).getTime());       // most recent last saved greater than the previous last saved

            // with two additional jobs
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    otherJobs : [
                        {
                            jobId: 1
                        },
                        {
                            jobId: 2
                        }
                    ]
                })
                .expect('Content-Type', /json/)
                .expect(200);
            fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
                expect(fetchedWorkerResponse.body.otherJobs.length).toEqual(2);
            // with three additional jobs
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    otherJobs : [
                        {
                            jobId: 1
                        },
                        {
                            jobId: 2
                        },
                        {
                            jobId: 3
                        }
                    ]
                })
                .expect('Content-Type', /json/)
                .expect(200);
            fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(fetchedWorkerResponse.body.otherJobs.length).toEqual(3);
            // with zero jobs
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    otherJobs : []
                })
                .expect('Content-Type', /json/)
                .expect(200);
            fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(fetchedWorkerResponse.body.otherJobs.length).toEqual(0);


            // now resolving on job title
            const thirdRandomJob = jobUtils.lookupRandomJob(jobs);
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    otherJobs : [
                        {
                            title: thirdRandomJob.title
                        }
                    ]
                })
                .expect('Content-Type', /json/)
                .expect(200);
            fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(Array.isArray(fetchedWorkerResponse.body.otherJobs)).toEqual(true);
            expect(fetchedWorkerResponse.body.otherJobs.length).toEqual(1);
            expect(fetchedWorkerResponse.body.otherJobs[0].jobId).toEqual(thirdRandomJob.id);
            expect(fetchedWorkerResponse.body.otherJobs[0].title).toEqual(thirdRandomJob.title);
            
            // out of range job id
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    otherJobs : [
                        {
                            jobId: 100
                        }
                    ]
                })
                .expect('Content-Type', /html/)
                .expect(400);
            
            // unknown job title
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    otherJobs : [
                        {
                            title: "This job does not exist"
                        }
                    ]
                })
                .expect('Content-Type', /html/)
                .expect(400);

            // other jobs is not an array
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    otherJobs : {
                        title: "This job does not exist"
                    }
                })
                .expect('Content-Type', /html/)
                .expect(400);

            // missing job id
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    otherJobs : [
                        {
                            id: thirdRandomJob.id
                        }
                    ]
                })
                .expect('Content-Type', /html/)
                .expect(400);
        
            
            // missing job title
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    otherJobs : [
                        {
                            job: thirdRandomJob.title
                        }
                    ]
                })
                .expect('Content-Type', /html/)
                .expect(400);
        });

        it("should update a Worker's Sick Days", async () => {
            const updatedWorkerResponse = await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    daysSick : {
                        value : "Yes",
                        days : 1.7
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200);
            expect(updatedWorkerResponse.body.daysSick.value).toEqual('Yes');
            expect(updatedWorkerResponse.body.daysSick.days).toEqual(1.5);  // rounds to nearest 0.5

            let fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(fetchedWorkerResponse.body.daysSick.value).toEqual('Yes');
            expect(fetchedWorkerResponse.body.daysSick.days).toEqual(1.5);  // rounds to nearest 0.5

            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    daysSick : {
                        value : "Yes",
                        days : 12.2
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200);
            fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(fetchedWorkerResponse.body.daysSick.value).toEqual('Yes');
            expect(fetchedWorkerResponse.body.daysSick.days).toEqual(12.0);  // rounds to nearest 0.5

            // now test change history
            let requestEpoch = new Date().getTime();
            let workerChangeHistory =  await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}?history=full`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            let updatedEpoch = new Date(workerChangeHistory.body.updated).getTime();
            expect(Math.abs(requestEpoch-updatedEpoch)).toBeLessThan(MIN_TIME_TOLERANCE);   // allows for slight clock slew

            validatePropertyChangeHistory(
                'daysSick',
                PropertiesResponses,
                workerChangeHistory.body.daysSick,
                12.0,
                1.5,
                establishment1Username,
                requestEpoch,
                (ref, given) => {
                    return ref.value = 'Yes' && ref.days == given
                });

            // now update the property but with same value - expect no change
            let lastSavedDate = workerChangeHistory.body.daysSick.lastSaved;
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    daysSick : {
                        value : "Yes",
                        days : 12.2
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200);
            workerChangeHistory =  await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}?history=property`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(workerChangeHistory.body.daysSick.currentValue.days).toEqual(12.0);
            expect(workerChangeHistory.body.daysSick.lastChanged).toEqual(new Date(lastSavedDate).toISOString());                             // lastChanged is equal to the previous last saved
            expect(new Date(workerChangeHistory.body.daysSick.lastSaved).getTime()).toBeGreaterThan(new Date(lastSavedDate).getTime());       // most recent last saved greater than the previous last saved            

            // days sick with expected value
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    daysSick: {
                        value: "No"
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200);
            fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(fetchedWorkerResponse.body.daysSick.value).toEqual('No');
            
            // unknown given value
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    daysSick: {
                        value: "no"         // case sensitive
                    }
                })
                .expect('Content-Type', /html/)
                .expect(400);

            // upper and lower day boundaries
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    daysSick : {
                        value : "Yes",
                        days : 0
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200);
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    daysSick : {
                        value : "Yes",
                        days : -0.5
                    }
                })
                .expect('Content-Type', /html/)
                .expect(400);
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    daysSick : {
                        value : "Yes",
                        days : 366
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200);
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    daysSick : {
                        value : "Yes",
                        days : 366.1        // rounds to nearest 0.5, but test is for any greater than 366.0
                    }
                })
                .expect('Content-Type', /html/)
                .expect(400);

            // invalid input structure
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    daysSick : {
                        sick : "Yes"
                    }
                })
                .expect('Content-Type', /html/)
                .expect(400);
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    daysSick : {
                        value : "Yes",
                        rate: 3
                    }
                })
                .expect('Content-Type', /html/)
                .expect(400);
        });

        it("should update a Worker's zero hours contract", async () => {
            const updatedWorkerResponse = await await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    zeroHoursContract : "No"
                })
                .expect('Content-Type', /json/)
                .expect(200);
            expect(updatedWorkerResponse.body.zeroHoursContract).toEqual('No');
            let fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(fetchedWorkerResponse.body.zeroHoursContract).toEqual('No');

            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    zeroHoursContract : "Yes"
                })
                .expect('Content-Type', /json/)
                .expect(200);
            fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(fetchedWorkerResponse.body.zeroHoursContract).toEqual('Yes');

            // now test change history
            let requestEpoch = new Date().getTime();
            let workerChangeHistory =  await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}?history=full`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            let updatedEpoch = new Date(workerChangeHistory.body.updated).getTime();
            expect(Math.abs(requestEpoch-updatedEpoch)).toBeLessThan(MIN_TIME_TOLERANCE);   // allows for slight clock slew

            validatePropertyChangeHistory(
                'zeroHoursContract',
                PropertiesResponses,
                workerChangeHistory.body.zeroHoursContract,
                'Yes',
                'No',
                establishment1Username,
                requestEpoch,
                (ref, given) => {
                    return ref == given
                });

            // now update the property but with same value - expect no change
            let lastSavedDate = workerChangeHistory.body.zeroHoursContract.lastSaved;
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    zeroHoursContract : "Yes"
                })
                .expect('Content-Type', /json/)
                .expect(200);
            workerChangeHistory =  await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}?history=property`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(workerChangeHistory.body.zeroHoursContract.currentValue).toEqual('Yes');
            expect(workerChangeHistory.body.zeroHoursContract.lastChanged).toEqual(new Date(lastSavedDate).toISOString());                             // lastChanged is equal to the previous last saved
            expect(new Date(workerChangeHistory.body.zeroHoursContract.lastSaved).getTime()).toBeGreaterThan(new Date(lastSavedDate).getTime());       // most recent last saved greater than the previous last saved            

            // zero contract with expected value
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    zeroHoursContract : "Don't know"
                })
                .expect('Content-Type', /json/)
                .expect(200);
            fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
                expect(fetchedWorkerResponse.body.zeroHoursContract).toEqual("Don't know");
            
            // unexpected given value
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    zeroHoursContract : "Don't Know"        // case sensitive
                })
                .expect('Content-Type', /html/)
                .expect(400);
        });

        it("should update a Worker's Weekly Average Hours", async () => {
            const updatedWorkerResponse = await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    weeklyHoursAverage : {
                        value : "Yes",
                        hours : 37.5
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200);
            expect(updatedWorkerResponse.body.weeklyHoursAverage.value).toEqual('Yes');
            expect(updatedWorkerResponse.body.weeklyHoursAverage.hours).toEqual(37.5);

            let fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(fetchedWorkerResponse.body.weeklyHoursAverage.value).toEqual('Yes');
            expect(fetchedWorkerResponse.body.weeklyHoursAverage.hours).toEqual(37.5);

            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    weeklyHoursAverage : {
                        value : "No"
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200);
            fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(fetchedWorkerResponse.body.weeklyHoursAverage.value).toEqual('No');
            expect(fetchedWorkerResponse.body.weeklyHoursAverage.hours).toEqual(undefined);
    
            // now test change history
            let requestEpoch = new Date().getTime();
            let workerChangeHistory =  await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}?history=full`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            let updatedEpoch = new Date(workerChangeHistory.body.updated).getTime();
            expect(Math.abs(requestEpoch-updatedEpoch)).toBeLessThan(MIN_TIME_TOLERANCE);   // allows for slight clock slew

            validatePropertyChangeHistory(
                'weeklyHoursAverage',
                PropertiesResponses,
                workerChangeHistory.body.weeklyHoursAverage,
                'No',
                'Yes',
                establishment1Username,
                requestEpoch,
                (ref, given) => {
                    return ref.value == given
                });

            // now update the property but with same value - expect no change
            let lastSavedDate = workerChangeHistory.body.weeklyHoursAverage.lastSaved;
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    weeklyHoursAverage : {
                        value : "No"
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200);
            workerChangeHistory =  await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}?history=property`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(workerChangeHistory.body.weeklyHoursAverage.currentValue.value).toEqual('No');
            expect(workerChangeHistory.body.weeklyHoursAverage.lastChanged).toEqual(new Date(lastSavedDate).toISOString());                             // lastChanged is equal to the previous last saved
            expect(new Date(workerChangeHistory.body.weeklyHoursAverage.lastSaved).getTime()).toBeGreaterThan(new Date(lastSavedDate).getTime());       // most recent last saved greater than the previous last saved            

            // round the the nearest 0.5
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    weeklyHoursAverage : {
                        value : "Yes",
                        hours: 37.3
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200);
            fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(fetchedWorkerResponse.body.weeklyHoursAverage.value).toEqual('Yes');
            expect(fetchedWorkerResponse.body.weeklyHoursAverage.hours).toEqual(37.5);

            // upper and lower boundary values
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    weeklyHoursAverage : {
                        value : "Yes",
                        hours: 75                   // upper boundary
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200);
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    weeklyHoursAverage : {
                        value : "Yes",
                        hours: 75.1
                    }
                })
                .expect('Content-Type', /html/)
                .expect(400);
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    weeklyHoursAverage : {
                        value : "Yes",
                        hours: 0                    // lower boundary
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200);
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    weeklyHoursAverage : {
                        value : "Yes",
                        hours: -0.1
                    }
                })
                .expect('Content-Type', /html/)
                .expect(400);
            
            // unexpected value and structure
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    weeklyHoursAverage : {
                        value: "yes",           // case sensitive
                        hours: 37.5
                    }
                })
                .expect('Content-Type', /html/)
                .expect(400);
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    weeklyHoursAverage : {
                        test: "No"
                    }
                })
                .expect('Content-Type', /html/)
                .expect(400);
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    weeklyHoursAverage : {
                        value: "Yes",
                        given: 37.5
                    }
                })
                .expect('Content-Type', /html/)
                .expect(400);
        });

        it("should update a Worker's Weekly Contracted Hours", async () => {
            const updatedWorkerResponse = await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    weeklyHoursContracted : {
                        value : "Yes",
                        hours : 37.5
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200);
            expect(updatedWorkerResponse.body.weeklyHoursContracted.value).toEqual('Yes');
            expect(updatedWorkerResponse.body.weeklyHoursContracted.hours).toEqual(37.5);

            let fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(fetchedWorkerResponse.body.weeklyHoursContracted.value).toEqual('Yes');
            expect(fetchedWorkerResponse.body.weeklyHoursContracted.hours).toEqual(37.5);

            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    weeklyHoursContracted : {
                        value : "No"
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200);
            fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(fetchedWorkerResponse.body.weeklyHoursContracted.value).toEqual('No');
            expect(fetchedWorkerResponse.body.weeklyHoursContracted.hours).toEqual(undefined);
    
            // now test change history
            let requestEpoch = new Date().getTime();
            let workerChangeHistory =  await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}?history=full`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            let updatedEpoch = new Date(workerChangeHistory.body.updated).getTime();
            expect(Math.abs(requestEpoch-updatedEpoch)).toBeLessThan(MIN_TIME_TOLERANCE);   // allows for slight clock slew

            validatePropertyChangeHistory(
                'weeklyHoursContracted',
                PropertiesResponses,
                workerChangeHistory.body.weeklyHoursContracted,
                'No',
                'Yes',
                establishment1Username,
                requestEpoch,
                (ref, given) => {
                    return ref.value == given
                });

            // now update the property but with same value - expect no change
            let lastSavedDate = workerChangeHistory.body.weeklyHoursContracted.lastSaved;
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    weeklyHoursContracted : {
                        value : "No"
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200);
            workerChangeHistory =  await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}?history=property`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(workerChangeHistory.body.weeklyHoursContracted.currentValue.value).toEqual('No');
            expect(workerChangeHistory.body.weeklyHoursContracted.lastChanged).toEqual(new Date(lastSavedDate).toISOString());                             // lastChanged is equal to the previous last saved
            expect(new Date(workerChangeHistory.body.weeklyHoursContracted.lastSaved).getTime()).toBeGreaterThan(new Date(lastSavedDate).getTime());       // most recent last saved greater than the previous last saved            

            // round the the nearest 0.5
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    weeklyHoursContracted : {
                        value : "Yes",
                        hours: 37.3
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200);
            fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(fetchedWorkerResponse.body.weeklyHoursContracted.value).toEqual('Yes');
            expect(fetchedWorkerResponse.body.weeklyHoursContracted.hours).toEqual(37.5);

            // upper and lower boundary values
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    weeklyHoursContracted : {
                        value : "Yes",
                        hours: 75                   // upper boundary
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200);
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    weeklyHoursContracted : {
                        value : "Yes",
                        hours: 75.1
                    }
                })
                .expect('Content-Type', /html/)
                .expect(400);
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    weeklyHoursContracted : {
                        value : "Yes",
                        hours: 0                    // lower boundary
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200);
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    weeklyHoursContracted : {
                        value : "Yes",
                        hours: -0.1
                    }
                })
                .expect('Content-Type', /html/)
                .expect(400);
            
            // unexpected value and structure
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    weeklyHoursContracted : {
                        value: "yes",           // case sensitive
                        hours: 37.5
                    }
                })
                .expect('Content-Type', /html/)
                .expect(400);
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    weeklyHoursContracted : {
                        test: "No"
                    }
                })
                .expect('Content-Type', /html/)
                .expect(400);
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    weeklyHoursContracted : {
                        value: "Yes",
                        given: 37.5
                    }
                })
                .expect('Content-Type', /html/)
                .expect(400);
        });

        it("should update a Worker's Annual/Hourly Rate", async () => {
            const updatedWorkerResponse = await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    annualHourlyPay : {
                        value : "Hourly",
                        rate : 50.00
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200);
            expect(updatedWorkerResponse.body.annualHourlyPay.value).toEqual('Hourly');
            expect(updatedWorkerResponse.body.annualHourlyPay.rate).toEqual(50.00);

            let fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(fetchedWorkerResponse.body.annualHourlyPay.value).toEqual('Hourly');
            expect(fetchedWorkerResponse.body.annualHourlyPay.rate).toEqual(50.00);

            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    annualHourlyPay : {
                        value : "Annually",
                        rate : 25677
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200);
            fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
                expect(fetchedWorkerResponse.body.annualHourlyPay.value).toEqual('Annually');
                expect(fetchedWorkerResponse.body.annualHourlyPay.rate).toEqual(25677);
    
            // now test change history
            let requestEpoch = new Date().getTime();
            let workerChangeHistory =  await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}?history=full`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            let updatedEpoch = new Date(workerChangeHistory.body.updated).getTime();
            expect(Math.abs(requestEpoch-updatedEpoch)).toBeLessThan(MIN_TIME_TOLERANCE);   // allows for slight clock slew

            // test change history for both the rate and the value
            validatePropertyChangeHistory(
                'annualHourlyPay',
                PropertiesResponses,
                workerChangeHistory.body.annualHourlyPay,
                25677,
                50.00,
                establishment1Username,
                requestEpoch,
                (ref, given) => {
                    return ref.rate == given
                });
            validatePropertyChangeHistory(
                'annualHourlyPay',
                PropertiesResponses,
                workerChangeHistory.body.annualHourlyPay,
                'Annually',
                'Hourly',
                establishment1Username,
                requestEpoch,
                (ref, given) => {
                    return ref.value == given
                });

            // now update the property but with same value - expect no change
            let lastSavedDate = workerChangeHistory.body.annualHourlyPay.lastSaved;
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    annualHourlyPay : {
                        value : "Annually",
                        rate : 25677
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200);
            workerChangeHistory =  await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}?history=property`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(workerChangeHistory.body.annualHourlyPay.currentValue.rate).toEqual(25677);
            expect(workerChangeHistory.body.annualHourlyPay.lastChanged).toEqual(new Date(lastSavedDate).toISOString());                             // lastChanged is equal to the previous last saved
            expect(new Date(workerChangeHistory.body.annualHourlyPay.lastSaved).getTime()).toBeGreaterThan(new Date(lastSavedDate).getTime());       // most recent last saved greater than the previous last saved            
    
            // round the the nearest 0.01 (for hourly)
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    annualHourlyPay : {
                        value : "Hourly",
                        rate : 11.147
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200);
            fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(fetchedWorkerResponse.body.annualHourlyPay.rate).toEqual(11.15);

            // round the the nearest whole number (for annual)
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    annualHourlyPay : {
                        value : "Annually",
                        rate : 28576.57
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200);
            fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(fetchedWorkerResponse.body.annualHourlyPay.rate).toEqual(28577);
        
            // expected and unexpected values
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    annualHourlyPay : {
                        value : "Don't know"
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200);
            fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(fetchedWorkerResponse.body.annualHourlyPay.value).toEqual("Don't know");
            expect(fetchedWorkerResponse.body.annualHourlyPay.rate).toEqual(undefined);
            
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    annualHourlyPay : {
                            value : "Don't Know"      // case sensitive
                    }
                })
                .expect('Content-Type', /html/)
                .expect(400);
            
            // upper and lower boundary values for hourly rate
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    annualHourlyPay : {
                        value : "Hourly",
                        rate : 200                  // upper boundary
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200);
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    annualHourlyPay : {
                        value : "Hourly",
                        rate : 200.01                // upper boundary
                    }
                })
                .expect('Content-Type', /html/)
                .expect(400);
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    annualHourlyPay : {
                        value : "Hourly",
                        rate : 2.50                  // lower boundary
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200);
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    annualHourlyPay : {
                        value : "Hourly",
                        rate : 2.49                  // lower boundary
                    }
                })
                .expect('Content-Type', /html/)
                .expect(400);
            
            // upper and lower boundary values for annual rate
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    annualHourlyPay : {
                        value : "Annually",
                        rate : 200000                  // upper boundary
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200);
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    annualHourlyPay : {
                        value : "Annually",
                        rate : 200001                  // upper boundary
                    }
                })
                .expect('Content-Type', /html/)
                .expect(400);
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    annualHourlyPay : {
                        value : "Annually",
                        rate : 500                  // lower boundary
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200);
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    annualHourlyPay : {
                        value : "Annually",
                        rate : 499                  // lower boundary
                    }
                })
                .expect('Content-Type', /html/)
                .expect(400);
            
            // unexpected value and structure
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    annualHourlyPay : {
                        Value : "Annually",         // case sensitive attributes
                        rate : 10000
                    }
                })
                .expect('Content-Type', /html/)
                .expect(400);
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    annualHourlyPay : {
                        value : "Annually",
                        Rate : 10000                // case sensitive attributes
                    }
                })
                .expect('Content-Type', /html/)
                .expect(400);
        });

        it("should update a Worker's Care Certificate", async () => {
            const updatedWorkerResponse = await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    careCertificate : "Yes, in progress or partially completed"
                })
                .expect('Content-Type', /json/)
                .expect(200);
            expect(updatedWorkerResponse.body.careCertificate).toEqual('Yes, in progress or partially completed');

            let fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(fetchedWorkerResponse.body.careCertificate).toEqual('Yes, in progress or partially completed');

            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    careCertificate : "Yes, completed"
                })
                .expect('Content-Type', /json/)
                .expect(200);
            fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(fetchedWorkerResponse.body.careCertificate).toEqual('Yes, completed');

            // now test change history
            let requestEpoch = new Date().getTime();
            let workerChangeHistory =  await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}?history=full`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            let updatedEpoch = new Date(workerChangeHistory.body.updated).getTime();
            expect(Math.abs(requestEpoch-updatedEpoch)).toBeLessThan(MIN_TIME_TOLERANCE);   // allows for slight clock slew

            validatePropertyChangeHistory(
                'careCertificate',
                PropertiesResponses,
                workerChangeHistory.body.careCertificate,
                'Yes, completed',
                'Yes, in progress or partially completed',
                establishment1Username,
                requestEpoch,
                (ref, given) => {
                    return ref == given
                });

            // now update the property but with same value - expect no change
            let lastSavedDate = workerChangeHistory.body.careCertificate.lastSaved;
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    careCertificate : "Yes, completed"
                })
                .expect('Content-Type', /json/)
                .expect(200);
            workerChangeHistory =  await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}?history=property`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(workerChangeHistory.body.careCertificate.currentValue).toEqual('Yes, completed');
            expect(workerChangeHistory.body.careCertificate.lastChanged).toEqual(new Date(lastSavedDate).toISOString());                             // lastChanged is equal to the previous last saved
            expect(new Date(workerChangeHistory.body.careCertificate.lastSaved).getTime()).toBeGreaterThan(new Date(lastSavedDate).getTime());       // most recent last saved greater than the previous last saved            
    
            // zero contract with expected value
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    careCertificate : "No"
                })
                .expect('Content-Type', /json/)
                .expect(200);
            fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
                expect(fetchedWorkerResponse.body.careCertificate).toEqual("No");
            
            // unexpected given value
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    careCertificate : "no"        // case sensitive
                })
                .expect('Content-Type', /html/)
                .expect(400);
        });

        it("should update a Worker's Apprenticeship Training", async () => {
            const updatedWorkerResponse = await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    apprenticeshipTraining : "Don't know"
                })
                .expect('Content-Type', /json/)
                .expect(200);
            expect(updatedWorkerResponse.body.apprenticeshipTraining).toEqual('Don\'t know');
            let fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(fetchedWorkerResponse.body.apprenticeshipTraining).toEqual('Don\'t know');

            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    apprenticeshipTraining : "Yes"
                })
                .expect('Content-Type', /json/)
                .expect(200);
            fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(fetchedWorkerResponse.body.apprenticeshipTraining).toEqual('Yes');

            // now test change history
            let requestEpoch = new Date().getTime();
            let workerChangeHistory =  await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}?history=full`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            let updatedEpoch = new Date(workerChangeHistory.body.updated).getTime();
            expect(Math.abs(requestEpoch-updatedEpoch)).toBeLessThan(MIN_TIME_TOLERANCE);   // allows for slight clock slew

            validatePropertyChangeHistory(
                'apprenticeshipTraining',
                PropertiesResponses,
                workerChangeHistory.body.apprenticeshipTraining,
                'Yes',
                'Don\'t know',
                establishment1Username,
                requestEpoch,
                (ref, given) => {
                    return ref == given
                });

            // now update the property but with same value - expect no change
            let lastSavedDate = workerChangeHistory.body.apprenticeshipTraining.lastSaved;
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    apprenticeshipTraining : "Yes"
                })
                .expect('Content-Type', /json/)
                .expect(200);
            workerChangeHistory =  await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}?history=property`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(workerChangeHistory.body.apprenticeshipTraining.currentValue).toEqual('Yes');
            expect(workerChangeHistory.body.apprenticeshipTraining.lastChanged).toEqual(new Date(lastSavedDate).toISOString());                             // lastChanged is equal to the previous last saved
            expect(new Date(workerChangeHistory.body.apprenticeshipTraining.lastSaved).getTime()).toBeGreaterThan(new Date(lastSavedDate).getTime());       // most recent last saved greater than the previous last saved            
    
            // zero contract with expected value
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    apprenticeshipTraining : "No"
                })
                .expect('Content-Type', /json/)
                .expect(200);
            fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
                expect(fetchedWorkerResponse.body.apprenticeshipTraining).toEqual("No");
            
            // unexpected given value
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    apprenticeshipTraining : "Don't Know"        // case sensitive
                })
                .expect('Content-Type', /html/)
                .expect(400);
        });

        it("should update a Worker's Qualification In Social Care", async () => {
            const updatedWorkerResponse = await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    qualificationInSocialCare : "Don't know"
                })
                .expect('Content-Type', /json/)
                .expect(200);
            expect(updatedWorkerResponse.body.qualificationInSocialCare).toEqual('Don\'t know');
            let fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(fetchedWorkerResponse.body.qualificationInSocialCare).toEqual('Don\'t know');

            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    qualificationInSocialCare : "Yes"
                })
                .expect('Content-Type', /json/)
                .expect(200);
            fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(fetchedWorkerResponse.body.qualificationInSocialCare).toEqual('Yes');

            // now test change history
            let requestEpoch = new Date().getTime();
            let workerChangeHistory =  await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}?history=full`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            let updatedEpoch = new Date(workerChangeHistory.body.updated).getTime();
            expect(Math.abs(requestEpoch-updatedEpoch)).toBeLessThan(MIN_TIME_TOLERANCE);   // allows for slight clock slew

            validatePropertyChangeHistory(
                'qualificationInSocialCare',
                PropertiesResponses,
                workerChangeHistory.body.qualificationInSocialCare,
                'Yes',
                'Don\'t know',
                establishment1Username,
                requestEpoch,
                (ref, given) => {
                    return ref == given
                });

            // now update the property but with same value - expect no change
            let lastSavedDate = workerChangeHistory.body.qualificationInSocialCare.lastSaved;
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    qualificationInSocialCare : "Yes"
                })
                .expect('Content-Type', /json/)
                .expect(200);
            workerChangeHistory =  await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}?history=property`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(workerChangeHistory.body.qualificationInSocialCare.currentValue).toEqual('Yes');
            expect(workerChangeHistory.body.qualificationInSocialCare.lastChanged).toEqual(new Date(lastSavedDate).toISOString());                             // lastChanged is equal to the previous last saved
            expect(new Date(workerChangeHistory.body.qualificationInSocialCare.lastSaved).getTime()).toBeGreaterThan(new Date(lastSavedDate).getTime());       // most recent last saved greater than the previous last saved

            // zero contract with expected value
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    qualificationInSocialCare : "No"
                })
                .expect('Content-Type', /json/)
                .expect(200);
            fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
                expect(fetchedWorkerResponse.body.qualificationInSocialCare).toEqual("No");
            
            // unexpected given value
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    qualificationInSocialCare : "Don't Know"        // case sensitive
                })
                .expect('Content-Type', /html/)
                .expect(400);
        });

        it("should update a Worker's Social Care qualifications", async () => {
            const randomQualification = qualificationUtils.lookupRandomQualification(qualifications);

            const updatedWorkerResponse = await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    socialCareQualification : {
                        qualificationId : randomQualification.id
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200);
            expect(updatedWorkerResponse.body.socialCareQualification.qualificationId).toEqual(randomQualification.id);
            expect(updatedWorkerResponse.body.socialCareQualification.title).toEqual(randomQualification.level);
            let fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(fetchedWorkerResponse.body.socialCareQualification.qualificationId).toEqual(randomQualification.id);
            expect(fetchedWorkerResponse.body.socialCareQualification.title).toEqual(randomQualification.level);

            const secondQualification = randomQualification.id == 2 ? 3 : 2;
            const updateWorkerResponse2 = await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    socialCareQualification : {
                        qualificationId: secondQualification
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200);

            // now test change history
            let requestEpoch = new Date().getTime();
            let workerChangeHistory =  await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}?history=full`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            let updatedEpoch = new Date(workerChangeHistory.body.updated).getTime();
            expect(Math.abs(requestEpoch-updatedEpoch)).toBeLessThan(MIN_TIME_TOLERANCE);   // allows for slight clock slew

            validatePropertyChangeHistory(
                'socialCareQualification',
                PropertiesResponses,
                workerChangeHistory.body.socialCareQualification,
                secondQualification,
                randomQualification.id,
                establishment1Username,
                requestEpoch,
                (ref, given) => {
                    return ref.qualificationId == given
                });

            // now update the property but with same value - expect no change
            let lastSavedDate = workerChangeHistory.body.socialCareQualification.lastSaved;
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    socialCareQualification : {
                        qualificationId: secondQualification
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200);
            workerChangeHistory =  await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}?history=property`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(workerChangeHistory.body.socialCareQualification.currentValue.qualificationId).toEqual(secondQualification);
            expect(workerChangeHistory.body.socialCareQualification.lastChanged).toEqual(new Date(lastSavedDate).toISOString());                             // lastChanged is equal to the previous last saved
            expect(new Date(workerChangeHistory.body.socialCareQualification.lastSaved).getTime()).toBeGreaterThan(new Date(lastSavedDate).getTime());       // most recent last saved greater than the previous last saved

            // update qualification by name
            const secondRandomQualification = qualificationUtils.lookupRandomQualification(qualifications);
            const updateQualificationByNameResponse = await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    socialCareQualification : {
                        title: secondRandomQualification.level
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200);
            fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(fetchedWorkerResponse.body.socialCareQualification.qualificationId).toEqual(secondRandomQualification.id);
            expect(fetchedWorkerResponse.body.socialCareQualification.title).toEqual(secondRandomQualification.level);

            // out of range qualification id
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    socialCareQualification : {
                        qualificationId: 100
                    }
                })
                .expect('Content-Type', /html/)
                .expect(400);
            // unknown qualification (by name)
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    socialCareQualification : {
                        title: "UnKnown"
                    }
                })
                .expect('Content-Type', /html/)
                .expect(400);
        });

        it("should update a Worker's Other Qualification", async () => {
            const updatedWorkerResponse = await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    otherQualification : "Don't know"
                })
                .expect('Content-Type', /json/)
                .expect(200);
            expect(updatedWorkerResponse.body.otherQualification).toEqual('Don\'t know');
            let fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(fetchedWorkerResponse.body.otherQualification).toEqual('Don\'t know');

            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    otherQualification : "Yes"
                })
                .expect('Content-Type', /json/)
                .expect(200);
            fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(fetchedWorkerResponse.body.otherQualification).toEqual('Yes');

            // now test change history
            let requestEpoch = new Date().getTime();
            let workerChangeHistory =  await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}?history=full`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            let updatedEpoch = new Date(workerChangeHistory.body.updated).getTime();
            expect(Math.abs(requestEpoch-updatedEpoch)).toBeLessThan(MIN_TIME_TOLERANCE);   // allows for slight clock slew

            validatePropertyChangeHistory(
                'otherQualification',
                PropertiesResponses,
                workerChangeHistory.body.otherQualification,
                'Yes',
                'Don\'t know',
                establishment1Username,
                requestEpoch,
                (ref, given) => {
                    return ref == given
                });
            
            // now update the property but with same value - expect no change
            let lastSavedDate = workerChangeHistory.body.otherQualification.lastSaved;
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    otherQualification : "Yes"
                })
                .expect('Content-Type', /json/)
                .expect(200);
            workerChangeHistory =  await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}?history=property`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(workerChangeHistory.body.otherQualification.currentValue).toEqual('Yes');
            expect(workerChangeHistory.body.otherQualification.lastChanged).toEqual(new Date(lastSavedDate).toISOString());                             // lastChanged is equal to the previous last saved
            expect(new Date(workerChangeHistory.body.otherQualification.lastSaved).getTime()).toBeGreaterThan(new Date(lastSavedDate).getTime());       // most recent last saved greater than the previous last saved

            // zero contract with expected value
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    otherQualification : "No"
                })
                .expect('Content-Type', /json/)
                .expect(200);
            fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
                expect(fetchedWorkerResponse.body.otherQualification).toEqual("No");
            
            // unexpected given value
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    otherQualification : "Don't Know"        // case sensitive
                })
                .expect('Content-Type', /html/)
                .expect(400);
        });

        it("should update a Worker's Highest (other) qualifications", async () => {
            const randomQualification = qualificationUtils.lookupRandomQualification(qualifications);

            const updatedWorkerResponse = await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    highestQualification : {
                        qualificationId : randomQualification.id
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200);
            expect(updatedWorkerResponse.body.highestQualification.qualificationId).toEqual(randomQualification.id);
            expect(updatedWorkerResponse.body.highestQualification.title).toEqual(randomQualification.level);

            let fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(fetchedWorkerResponse.body.highestQualification.qualificationId).toEqual(randomQualification.id);
            expect(fetchedWorkerResponse.body.highestQualification.title).toEqual(randomQualification.level);

            const secondQualification = randomQualification.id == 2 ? 3 : 2;
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    highestQualification : {
                        qualificationId: secondQualification
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200);

            // now test change history
            let requestEpoch = new Date().getTime();
            let workerChangeHistory =  await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}?history=full`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            let updatedEpoch = new Date(workerChangeHistory.body.updated).getTime();
            expect(Math.abs(requestEpoch-updatedEpoch)).toBeLessThan(MIN_TIME_TOLERANCE);   // allows for slight clock slew

            validatePropertyChangeHistory(
                'highestQualification',
                PropertiesResponses,
                workerChangeHistory.body.highestQualification,
                secondQualification,
                randomQualification.id,
                establishment1Username,
                requestEpoch,
                (ref, given) => {
                    return ref.qualificationId == given
                });
            
            // now update the property but with same value - expect no change
            let lastSavedDate = workerChangeHistory.body.highestQualification.lastSaved;
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    highestQualification : {
                        qualificationId: secondQualification
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200);
            workerChangeHistory =  await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}?history=property`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(workerChangeHistory.body.highestQualification.currentValue.qualificationId).toEqual(secondQualification);
            expect(workerChangeHistory.body.highestQualification.lastChanged).toEqual(new Date(lastSavedDate).toISOString());                             // lastChanged is equal to the previous last saved
            expect(new Date(workerChangeHistory.body.highestQualification.lastSaved).getTime()).toBeGreaterThan(new Date(lastSavedDate).getTime());       // most recent last saved greater than the previous last saved

            // update qualification by name
            const secondRandomQualification = qualificationUtils.lookupRandomQualification(qualifications);
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    highestQualification : {
                        title: secondRandomQualification.level
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200);
            fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(fetchedWorkerResponse.body.highestQualification.qualificationId).toEqual(secondRandomQualification.id);
            expect(fetchedWorkerResponse.body.highestQualification.title).toEqual(secondRandomQualification.level);

            // out of range qualification id
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    highestQualification : {
                        qualificationId: 100
                    }
                })
                .expect('Content-Type', /html/)
                .expect(400);
            // unknown qualification (by name)
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    highestQualification : {
                        title: "UnKnown"
                    }
                })
                .expect('Content-Type', /html/)
                .expect(400);
        });

        it("should update a Worker's Completed status", async () => {
            let updatedWorkerResponse = await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    completed : true
                })
                .expect('Content-Type', /json/)
                .expect(200);
            expect(updatedWorkerResponse.body.completed).toEqual(true);
            let fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(fetchedWorkerResponse.body.completed).toEqual(true);

            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    completed : "false"
                })
                .expect('Content-Type', /json/)
                .expect(200);
            fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(fetchedWorkerResponse.body.completed).toEqual(false);

            // now test change history
            let requestEpoch = new Date().getTime();
            let workerChangeHistory =  await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}?history=full`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            let updatedEpoch = new Date(workerChangeHistory.body.updated).getTime();
            expect(Math.abs(requestEpoch-updatedEpoch)).toBeLessThan(MIN_TIME_TOLERANCE);   // allows for slight clock slew

            validatePropertyChangeHistory(
                'completed',
                PropertiesResponses,
                workerChangeHistory.body.completed,
                false,    // the property value in history is a string
                true,     // the property value in history is a string
                establishment1Username,
                requestEpoch,
                (ref, given) => {
                    return ref == given
                });

            // now update the property but with same value - expect no change
            let lastSavedDate = workerChangeHistory.body.completed.lastSaved;
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    completed : false
                })
                .expect('Content-Type', /json/)
                .expect(200);
            workerChangeHistory =  await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}?history=property`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);
            expect(workerChangeHistory.body.completed.currentValue).toEqual(false);
            expect(workerChangeHistory.body.completed.lastChanged).toEqual(new Date(lastSavedDate).toISOString());                             // lastChanged is equal to the previous last saved
            expect(new Date(workerChangeHistory.body.completed.lastSaved).getTime()).toBeGreaterThan(new Date(lastSavedDate).getTime());       // most recent last saved greater than the previous last saved            
    
            // with expected value
            updatedWorkerResponse = await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    completed : "true"
                })
                .expect('Content-Type', /json/)
                .expect(200);
            expect(updatedWorkerResponse.body.completed).toEqual(true);
            updatedWorkerResponse = await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    completed : false
                })
                .expect('Content-Type', /json/)
                .expect(200);
            expect(updatedWorkerResponse.body.completed).toEqual(false);
            
            // unexpected given value
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    completed : "tRue"      // case sensitive
                })
                .expect('Content-Type', /html/)
                .expect(400);
        });


        let allWorkers = null;
        let secondWorkerInput = null;
        let secondWorker = null;
        it("should return a list of Workers", async () => {
            expect(establishment1).not.toBeNull();
            expect(establishmentUid).not.toBeNull();

            // create another two worker
            secondWorkerInput = workerUtils.newWorker(jobs);
            const secondWorkerResponse = await apiEndpoint.post(`/establishment/${establishmentUid}/worker`)
                .set('Authorization', establishment1Token)
                .send(secondWorkerInput)
                .expect('Content-Type', /json/)
                .expect(201);
            secondWorker = { ...secondWorkerInput, ...secondWorkerResponse.body };
            await apiEndpoint.post(`/establishment/${establishmentUid}/worker`)
                .set('Authorization', establishment1Token)
                .send(workerUtils.newWorker(jobs))
                .expect('Content-Type', /json/)
                .expect(201);

            // should now have three (one from previous test)
            const allWorkersResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);

            expect(allWorkersResponse.body.workers).not.toBeNull();
            expect(Array.isArray(allWorkersResponse.body.workers)).toEqual(true);
            expect(allWorkersResponse.body.workers.length).toEqual(3);

            allWorkers = allWorkersResponse.body.workers;
        });

        it("should fetch a single worker", async () => {
            expect(secondWorker).not.toBeNull();
            expect(establishmentUid).not.toBeNull();

            const uuidRegex = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/;
            expect(uuidRegex.test(secondWorker.uid.toUpperCase())).toEqual(true);

            const fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${secondWorker.uid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);

            expect(fetchedWorkerResponse.body.uid).toEqual(secondWorker.uid);
            expect(fetchedWorkerResponse.body.contract).toEqual(secondWorker.contract);
            expect(fetchedWorkerResponse.body.mainJob.jobId).toEqual(secondWorker.mainJob.jobId);
            expect(fetchedWorkerResponse.body.mainJob.title).toEqual(secondWorker.mainJob.title);
            expect(fetchedWorkerResponse.body.created).not.toBeNull();

            const currentEpoch = new Date().getTime();
            const createdEpoch = new Date(fetchedWorkerResponse.body.created).getTime();
            expect(currentEpoch-createdEpoch).toBeLessThan(MAX_TIME_TOLERANCE);   // within the last 1 second
            expect(fetchedWorkerResponse.body.updated).not.toBeNull();
            const updatedEpoch = new Date(fetchedWorkerResponse.body.updated).getTime();
            expect(currentEpoch-updatedEpoch).toBeLessThan(MAX_TIME_TOLERANCE);   // within the last 1 second

            expect(fetchedWorkerResponse.body.updatedBy).toEqual(establishment1Username.toLowerCase());

            // check for validation errors
            const unknownUuid = uuid.v4();
            const unknownEstablishmentId = uuid.v4();
            // unknown
            await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${unknownUuid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /html/)
                .expect(404);
            // dodgy UUID input
            await apiEndpoint.get(`/establishment/${establishmentUid}/worker/2f8bd309-2a3e`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /html/)
                .expect(400);
            // mismatched establishment id
            await apiEndpoint.get(`/establishment/${unknownEstablishmentId}/worker/${secondWorker.uid}`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /html/)
                .expect(403);
            // missing authentication header
            await apiEndpoint.get(`/establishment/${unknownEstablishmentId}/worker/${secondWorker.uid}`)
                .expect('Content-Type', /html/)
                .expect(401);
        });

        it("should have creation and update change history", async () => {
            expect(establishment1).not.toBeNull();
            expect(establishmentUid).not.toBeNull();

            const newWorker = workerUtils.newWorker(jobs);
            const newWorkerResponse = await apiEndpoint.post(`/establishment/${establishmentUid}/worker`)
                .set('Authorization', establishment1Token)
                .send(newWorker)
                .expect('Content-Type', /json/)
                .expect(201);

            expect(newWorkerResponse.body.uid).not.toBeNull();
            const thisWorkerUid = newWorkerResponse.body.uid;


            // fetch with change history
            let fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${thisWorkerUid}?history=full`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);

            expect(fetchedWorkerResponse.body.uid).toEqual(thisWorkerUid);
            expect(fetchedWorkerResponse.body.created).not.toBeNull();

            const currentEpoch = new Date().getTime();
            const createdEpoch = new Date(fetchedWorkerResponse.body.created).getTime();
            expect(currentEpoch-createdEpoch).toBeLessThan(MAX_TIME_TOLERANCE);   // within the last 1 second
            expect(fetchedWorkerResponse.body.updated).not.toBeNull();
            const updatedEpoch = new Date(fetchedWorkerResponse.body.updated).getTime();
            expect(currentEpoch-updatedEpoch).toBeLessThan(MAX_TIME_TOLERANCE);   // within the last 1 second

            expect(fetchedWorkerResponse.body.updatedBy).toEqual(establishment1Username.toLowerCase());

            expect(Array.isArray(fetchedWorkerResponse.body.history)).toEqual(true);
            expect(fetchedWorkerResponse.body.history.length).toEqual(1);
            expect(fetchedWorkerResponse.body.history[0].event).toEqual('created');

            // now update the Worker
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${thisWorkerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    "nameOrId" : "Updated Worker Name",
                    "contract" : "Pool/Bank",
                    "mainJob" : {
                        "jobId" : 19
                    }
                })
                .expect('Content-Type', /json/)
                .expect(200);
            fetchedWorkerResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${thisWorkerUid}?history=full`)
                .set('Authorization', establishment1Token)
                .expect('Content-Type', /json/)
                .expect(200);

            expect(Array.isArray(fetchedWorkerResponse.body.history)).toEqual(true);
            expect(fetchedWorkerResponse.body.history.length).toEqual(2);
            expect(fetchedWorkerResponse.body.history[0].event).toEqual('updated');
            expect(fetchedWorkerResponse.body.history[1].event).toEqual('created');
        });

        it("should have delete worker", async () => {
            expect(establishment1).not.toBeNull();
            expect(establishmentUid).not.toBeNull();
            expect(establishment1Token).not.toBeNull();
            expect(workerUid).not.toBeNull();
            
            // first get a list of all Workers for the given establishment
            let allWorkersResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker`)
                .set('Authorization', establishment1Token)
                .send()
                .expect('Content-Type', /json/)
                .expect(200);
            expect(Array.isArray(allWorkersResponse.body.workers)).toEqual(true);
            expect(allWorkersResponse.body.workers.length).toEqual(4);

            // now add another worker
            let newWorkerResponse = await apiEndpoint.post(`/establishment/${establishmentUid}/worker`)
                .set('Authorization', establishment1Token)
                .send(workerUtils.newWorker(jobs))
                .expect('Content-Type', /json/)
                .expect(201);
            let newWorkerUuid = newWorkerResponse.body.uid;
            allWorkersResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker`)
                .set('Authorization', establishment1Token)
                .send()
                .expect('Content-Type', /json/)
                .expect(200);
            expect(allWorkersResponse.body.workers.length).toEqual(5);

            // now delete the first worker
            await apiEndpoint.delete(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    reason: {
                        id: 8
                    }
                })
                .expect(204);

            // check there is now only one worker
            allWorkersResponse = await apiEndpoint.get(`/establishment/${establishmentUid}/worker`)
                .set('Authorization', establishment1Token)
                .send()
                .expect('Content-Type', /json/)
                .expect(200);
            expect(allWorkersResponse.body.workers.length).toEqual(4);

            // now try to get, update and delete again the original Worker expecting failure
            await apiEndpoint.put(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send({
                    "completed" : true
                })
                .expect(404);
            await apiEndpoint.get(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send()
                .expect(404);
            await apiEndpoint.delete(`/establishment/${establishmentUid}/worker/${workerUid}`)
                .set('Authorization', establishment1Token)
                .send()
                .expect(404);
            
            // now create another worker and give an "other" reason
            newWorkerResponse = await apiEndpoint.post(`/establishment/${establishmentUid}/worker`)
                .set('Authorization', establishment1Token)
                .send(workerUtils.newWorker(jobs))
                .expect('Content-Type', /json/)
                .expect(201);
            newWorkerUuid = newWorkerResponse.body.uid;
            await apiEndpoint.delete(`/establishment/${establishmentUid}/worker/${newWorkerUuid}`)
                .set('Authorization', establishment1Token)
                .send({
                    reason: {
                        id: 8,
                        other: "Forced test dismissal"
                    }
                })
                .expect(204);

            // "other" reason is optional
            newWorkerResponse = await apiEndpoint.post(`/establishment/${establishmentUid}/worker`)
                .set('Authorization', establishment1Token)
                .send(workerUtils.newWorker(jobs))
                .expect('Content-Type', /json/)
                .expect(201);
            newWorkerUuid = newWorkerResponse.body.uid;
            await apiEndpoint.delete(`/establishment/${establishmentUid}/worker/${newWorkerUuid}`)
                .set('Authorization', establishment1Token)
                .send({
                    reason: {
                        id: 8,
                    }
                })
                .expect(204);

            // and now create another worker and give a text reason
            newWorkerResponse = await apiEndpoint.post(`/establishment/${establishmentUid}/worker`)
                .set('Authorization', establishment1Token)
                .send(workerUtils.newWorker(jobs))
                .expect('Content-Type', /json/)
                .expect(201);
            newWorkerUuid = newWorkerResponse.body.uid;
            await apiEndpoint.delete(`/establishment/${establishmentUid}/worker/${newWorkerUuid}`)
                .set('Authorization', establishment1Token)
                .send({
                    reason: {
                        reason: 'They moved to another role in this organisation'
                    }
                })
                .expect(204);

            // and now create another worker and give a text reason
            newWorkerResponse = await apiEndpoint.post(`/establishment/${establishmentUid}/worker`)
                .set('Authorization', establishment1Token)
                .send(workerUtils.newWorker(jobs))
                .expect('Content-Type', /json/)
                .expect(201);
            newWorkerUuid = newWorkerResponse.body.uid;
            await apiEndpoint.delete(`/establishment/${establishmentUid}/worker/${newWorkerUuid}`)
                .set('Authorization', establishment1Token)
                .send({
                    reason: {
                        reason: 'They moved to another role in this organisation'
                    }
                })
                .expect(204);

            // now forced validation errors - the worker must exist!!!
            newWorkerResponse = await apiEndpoint.post(`/establishment/${establishmentUid}/worker`)
                .set('Authorization', establishment1Token)
                .send(workerUtils.newWorker(jobs))
                .expect('Content-Type', /json/)
                .expect(201);
            newWorkerUuid = newWorkerResponse.body.uid;
            await apiEndpoint.delete(`/establishment/${establishmentUid}/worker/${newWorkerUuid}`)
                .set('Authorization', establishment1Token)
                .send({
                    reason: {
                        id: 32          // out of bounds
                    }
                })
                .expect(400);
            await apiEndpoint.delete(`/establishment/${establishmentUid}/worker/${newWorkerUuid}`)
                .set('Authorization', establishment1Token)
                .send({
                    reason: {
                        id: "6"          // must be an integer
                    }
                })
                .expect(400);
            await apiEndpoint.delete(`/establishment/${establishmentUid}/worker/${newWorkerUuid}`)
                .set('Authorization', establishment1Token)
                .send({
                    reason: {
                        reason: 'Non-existent reason'
                    }
                })
                .expect(400);
            const randomOtherness = randomString(501);
            await apiEndpoint.delete(`/establishment/${establishmentUid}/worker/${newWorkerUuid}`)
            .set('Authorization', establishment1Token)
            .send({
                reason: {
                    reason: 'Other',
                    other: randomOtherness
                }
            })
            .expect(400);
        });

        it("Should report on response times", () => {
            const properties = Object.keys(PropertiesResponses);
            let consoleOutput = '';
            properties.forEach(thisProperty => {
                consoleOutput += `\x1b[0m\x1b[33m${thisProperty.padEnd(35, '.')}\x1b[37m\x1b[2m${PropertiesResponses[thisProperty]} ms\n`;
            });
            console.log(consoleOutput);
        });
    });

    describe.skip("Worker forced failures", () => {
        describe("GET", () => {
            it("should fail (503) when attempting to fetch worker with unexpected server error", async () => {});
            it("should fail (404) when attempting to fetch worker with establishment id no longer exists (but JWT token still valid)", async () => {});
        });
        describe("POST", () => {
            it("should fail (503) when attempting to create worker with unexpected server error", async () => {});
            it("should fail (409) when attempting to create worker with duplicate name/id for the same establishment", async () => {});
            it("should fail (404) when attempting to create worker with establishment id no longer exists (but JWT token still valid)", async () => {});
        });
        describe("PUT", () => {
            it("should fail (503) when attempting to update worker with unexpected server error", async () => {});
            it("should fail (404) when attempting to update worker with establishment id no longer exists (but JWT token still valid)", async () => {});
        });
        describe("DELETE", () => {
            it("should fail (401) when attempting to delete worker without passing Authorization header", async () => {});
            it("should fail (403) when attempting to delete worker passing Authorization header with mismatched establishment id", async () => {});
            it("should fail (403) when attempting to delete worker not belong to given establishment with id", async () => {});
            it("should fail (503) when attempting to delete worker with unexpected server error", async () => {});
            it("should fail (404) when attempting to delete worker with establishment id no longer exists (but JWT token still valid)", async () => {});
        });
    });

});