const supertest = require('supertest');
const baseEndpoint = require('../../utils/baseUrl').baseurl;
const apiEndpoint = supertest(baseEndpoint);
const expect = require('chai').expect;
const fs = require('fs');

// mocked real postcode/location data
// http://localhost:3000/api/test/locations/random?limit=5
const postcodes = require('../../mockdata/postcodes').data;
const registrationUtils = require('../../utils/registration');
const admin = require('../../utils/admin').admin;

describe('Bulk upload', () => {
    const files = {
        files: [{
                filename: 'org-test.csv',
            },
            {
                filename: 'staff-test.csv',
            },
        ],
    };
    let awsLinkOrg = null;
    let awsLinkStaff = null;
    let orgCsv = null;
    let staffCsv = null;
    let nonCqcServices = null;
    let nonCQCSite = null;
    let loginAuth = null;
    let establishmentId = null;
    let establishmentUid = null;

    before(async() => {
        fs.readFile('./server/test/mockdata/testCSV/org-test.csv', 'utf8', (error, contents) => {
            orgCsv = contents;
            if (error) {
                console.error(error);
            }
        });
        fs.readFile('./server/test/mockdata/testCSV/staff-test.csv', 'utf8', (error, contents) => {
            staffCsv = contents;
            if (error) {
                console.error(error);
            }
        });
        const nonCqcServicesResults = await apiEndpoint
            .get('/services/byCategory?cqc=false')
            .expect('Content-Type', /json/)
            .expect(200);
        nonCqcServices = nonCqcServicesResults.body;
        nonCQCSite = registrationUtils.newNonCqcSite(postcodes[2], nonCqcServices);
        const registration = await apiEndpoint
            .post('/registration')
            .send([nonCQCSite])
            .expect('Content-Type', /json/)
            .expect(200);
        if (registration) {
            const adminLogin = await apiEndpoint
                .post('/login')
                .send(admin)
                .expect('Content-Type', /json/)
                .expect(200);
            if (adminLogin.headers.authorization) {
                const approval = await apiEndpoint
                    .post('/admin/approval')
                    .set({ Authorization: adminLogin.headers.authorization })
                    .send({
                        username: nonCQCSite.user.username.toLowerCase(),
                        approve: true,
                    })
                    .expect('Content-Type', /json/)
                    .expect(200);
                if (approval) {
                    const login = await apiEndpoint
                        .post('/login')
                        .send({
                            username: nonCQCSite.user.username.toLowerCase(),
                            password: nonCQCSite.user.password,
                        })
                        .expect('Content-Type', /json/)
                        .expect(200);
                    loginAuth = login.headers.authorization;
                    establishmentId = login.body.establishment.id;
                    establishmentUid = login.body.establishment.uid;
                }
            }
        }
    });
    beforeEach(async() => {});

    describe('/establishment/:establishmentuid/localIdentifiers', () => {
        it('should return an array if all workers and establishments have a local identifier', async() => {
            const localidentifiers = await apiEndpoint
                .get(`/establishment/${encodeURIComponent(establishmentUid)}/localIdentifiers`)
                .set('Authorization', loginAuth)
                .expect(200);
            const workplace = localidentifiers.body.establishments[0];
            expect(Array.isArray(localidentifiers.body.establishments)).to.equal(true);
            expect(localidentifiers.body.establishments.length).to.equal(1);
            expect(workplace.uid).to.equal(establishmentUid);
            expect(workplace.name).to.equal(nonCQCSite.locationName);
            expect(workplace.missing).to.equal(true);
            expect(workplace.workers).to.equal(0);
        });
        it('should fail if trying to request local identifiers with no authorization token passed ', async() => {
            await apiEndpoint.get(`/establishment/${encodeURIComponent(establishmentUid)}/localIdentifiers`).expect(401);
        });
        it('should fail if trying to request another users establishment ', async() => {
            await apiEndpoint
                .get(`/establishment/${encodeURIComponent(establishmentUid) + 1}/localIdentifiers`)
                .set('Authorization', loginAuth)
                .expect(403);
        });
    });
    describe('/api/establishment/:establishmentuid/bulkupload/uploaded', () => {
        it('should return an empty list of files for the establishment', async() => {
            const uploaded = await apiEndpoint
                .get(`/establishment/${encodeURIComponent(establishmentUid)}/bulkupload/uploaded`)
                .set('Authorization', loginAuth)
                .expect(200);
            expect(uploaded.body.establishment.uid).to.equal(establishmentId);
            expect(Array.isArray(uploaded.body.files)).to.equal(true);
            expect(uploaded.body.files.length).to.equal(0);
        });
        it('should fail if trying to request uploaded files with no authorization token passed ', async() => {
            await apiEndpoint.get(`/establishment/${encodeURIComponent(establishmentUid)}/bulkupload/uploaded`).expect(401);
        });
        it('should fail if trying to request another users establishment ', async() => {
            await apiEndpoint
                .get(`/establishment/${encodeURIComponent(establishmentUid) + 1}/bulkupload/uploaded`)
                .set('Authorization', loginAuth)
                .expect(403);
        });
    });
    describe('[POST] /api/establishment/:establishmentuid/bulkupload/uploaded', () => {
        it('should return an an array of presigned upload links for the files requested', async() => {
            const uploaded = await apiEndpoint
                .post(`/establishment/${encodeURIComponent(establishmentUid)}/bulkupload/uploaded`)
                .send(files)
                .set('Authorization', loginAuth)
                .expect(200);
            expect(Array.isArray(uploaded.body)).to.equal(true);
            expect(uploaded.body[0].filename).to.equal('org-test.csv');
            expect(uploaded.body[0].signedUrl).to.contain('amazonaws');
            awsLinkOrg = uploaded.body[0].signedUrl;
            expect(uploaded.body[1].filename).to.equal('staff-test.csv');
            expect(uploaded.body[1].signedUrl).to.contain('amazonaws');
            awsLinkStaff = uploaded.body[1].signedUrl;
            expect(uploaded.body.length).to.equal(2);
        });
        it('should fail if request has no files in payload to get upload links', async() => {
            await apiEndpoint
                .post(`/establishment/${encodeURIComponent(establishmentUid)}/bulkupload/uploaded`)
                .set('Authorization', loginAuth)
                .expect(400);
        });
        it('should fail if trying to request upload links with no authorization token passed ', async() => {
            await apiEndpoint
                .post(`/establishment/${encodeURIComponent(establishmentUid)}/bulkupload/uploaded`)
                .send(files)
                .expect(401);
        });
        it('should fail if trying to request another users upload links ', async() => {
            await apiEndpoint
                .post(`/establishment/${encodeURIComponent(establishmentUid) + 1}/bulkupload/uploaded`)
                .send(files)
                .set('Authorization', loginAuth)
                .expect(403);
        });
    });
    describe('[PUT] bulkupload.amazonaws.com/:presigned', () => {
        it('should upload org csv to S3 bucket', async() => {
            await supertest('')
                .put(awsLinkOrg)
                .send(orgCsv)
                .expect(200);
        });
        it('should upload staff csv to S3 bucket', async() => {
            await supertest('')
                .put(awsLinkStaff)
                .send(orgCsv)
                .expect(200);
        });
    });
    describe('[PUT] /api/establishment/:establishmentuid/bulkupload/uploaded', () => {
        it('should return an an array of uploaded file information', async() => {
            const uploaded = await apiEndpoint
                .put(`/establishment/${encodeURIComponent(establishmentUid)}/bulkupload/uploaded`)
                .set('Authorization', loginAuth)
                .expect(200);
            expect(Array.isArray(uploaded.body)).to.equal(true);
            expect(uploaded.body[0].filename).to.equal('org-test.csv');
            expect(uploaded.body[0].uploaded).to.equal(new Date(uploaded.body[0].uploaded).toISOString());
            expect(uploaded.body[0].username).to.equal(nonCQCSite.user.username.toLowerCase());
            expect(uploaded.body[0].records).to.equal(6);
            expect(uploaded.body[0].errors).to.equal(0);
            expect(uploaded.body[0].warnings).to.equal(0);
            expect(uploaded.body[0].fileType).to.equal('Establishment');
            expect(uploaded.body[0].fileType).to.equal(1096);
            expect(uploaded.body[0]).to.have.property('key');
            expect(uploaded.body[1].filename).to.equal('staff-test.csv');
            expect(uploaded.body[1]).to.have.property(new Date(uploaded.body[1].uploaded).toISOString());
            expect(uploaded.body[1].username).to.equal(nonCQCSite.user.username.toLowerCase());
            expect(uploaded.body[1].records).to.equal(11);
            expect(uploaded.body[1].errors).to.equal(0);
            expect(uploaded.body[1].warnings).to.equal(0);
            expect(uploaded.body[1].fileType).to.equal('Worker');
            expect(uploaded.body[1].fileType).to.equal(1781);
            expect(uploaded.body[1]).to.have.property('key');
            expect(uploaded.body.files.length).to.equal(2);
        });
        it('should fail if trying to request upload links with no authorization token passed ', async() => {
            await apiEndpoint.put(`/establishment/${encodeURIComponent(establishmentUid)}/bulkupload/uploaded`).expect(401);
        });
        it('should fail if trying to request another users upload links ', async() => {
            await apiEndpoint
                .put(`/establishment/${encodeURIComponent(establishmentUid) + 1}/bulkupload/uploaded`)
                .set('Authorization', loginAuth)
                .expect(403);
        });
    });
    describe('[PUT] /api/establishment/:establishmentuid/bulkupload/validate', () => {
        it('should return an an object file information including errors, warnings etc.', async() => {
            const uploaded = await apiEndpoint
                .put(`/establishment/${encodeURIComponent(establishmentUid)}/bulkupload/validate`)
                .set('Authorization', loginAuth)
                .expect(200);
            expect(uploaded.body).to.have.property('establishment');
            expect(uploaded.body).to.have.property('workers');
            expect(uploaded.body).to.have.property('training');
            expect(uploaded.body.establishment.username).to.equal(nonCQCSite.user.username.toLowerCase());
            expect(uploaded.body.establishment.filename).to.equal('org-test.csv');
            expect(uploaded.body.establishment.fileType).to.equal('Establishment');
            expect(uploaded.body.establishment.records).to.equal(6);
            expect(uploaded.body.establishment.errors).to.equal(8);
            expect(uploaded.body.establishment.warnings).to.equal(4);
            expect(uploaded.body.establishment.deleted).to.equal(0);
            expect(uploaded.body.workers.username).to.equal(nonCQCSite.user.username.toLowerCase());
            expect(uploaded.body.workers.filename).to.equal('staff-test.csv');
            expect(uploaded.body.workers.fileType).to.equal('Worker');
            expect(uploaded.body.workers.records).to.equal(11);
            expect(uploaded.body.workers.errors).to.equal(11);
            expect(uploaded.body.workers.warnings).to.equal(21);
            expect(uploaded.body.workers.deleted).to.equal(0);
            expect(uploaded.body.training.username).to.equal(null);
            expect(uploaded.body.training.filename).to.equal(null);
            expect(uploaded.body.training.fileType).to.equal(null);
            expect(uploaded.body.training.records).to.equal(0);
            expect(uploaded.body.training.errors).to.equal(0);
            expect(uploaded.body.training.warnings).to.equal(0);
            expect(uploaded.body.training.deleted).to.equal(0);
        });
        it('should fail if trying to validate files with no authorization token passed ', async() => {
            await apiEndpoint.put(`/establishment/${encodeURIComponent(establishmentUid)}/bulkupload/validate`).expect(401);
        });
        it('should fail if trying to validate somone elses ', async() => {
            await apiEndpoint
                .put(`/establishment/${encodeURIComponent(establishmentUid) + 1}/bulkupload/validate`)
                .set('Authorization', loginAuth)
                .expect(403);
        });
    });
    describe('/api/establishment/:establishmentuid/bulkupload/uploaded/:establishmentid/latest/:filename', () => {
        it('should return an an object file information including errors, warnings etc.', async() => {
            const download = await apiEndpoint
                .put(`/establishment/${encodeURIComponent(establishmentUid)}/bulkupload/uploaded/${encodeURIComponent(establishmentId)}/org-test.csv`)
                .set('Authorization', loginAuth)
                .expect(200);
            expect(uploaded.body).to.have.property('establishment');
            expect(uploaded.body).to.have.property('workers');
            expect(uploaded.body).to.have.property('training');
            expect(uploaded.body.establishment.username).to.equal(nonCQCSite.user.username.toLowerCase());
            expect(uploaded.body.establishment.filename).to.equal('org-test.csv');
            expect(uploaded.body.establishment.fileType).to.equal('Establishment');
            expect(uploaded.body.establishment.records).to.equal(6);
            expect(uploaded.body.establishment.errors).to.equal(8);
            expect(uploaded.body.establishment.warnings).to.equal(4);
            expect(uploaded.body.establishment.deleted).to.equal(0);
            expect(uploaded.body.workers.username).to.equal(nonCQCSite.user.username.toLowerCase());
            expect(uploaded.body.workers.filename).to.equal('staff-test.csv');
            expect(uploaded.body.workers.fileType).to.equal('Worker');
            expect(uploaded.body.workers.records).to.equal(11);
            expect(uploaded.body.workers.errors).to.equal(11);
            expect(uploaded.body.workers.warnings).to.equal(21);
            expect(uploaded.body.workers.deleted).to.equal(0);
            expect(uploaded.body.training.username).to.equal(null);
            expect(uploaded.body.training.filename).to.equal(null);
            expect(uploaded.body.training.fileType).to.equal(null);
            expect(uploaded.body.training.records).to.equal(0);
            expect(uploaded.body.training.errors).to.equal(0);
            expect(uploaded.body.training.warnings).to.equal(0);
            expect(uploaded.body.training.deleted).to.equal(0);
        });
        it('should fail if trying to validate files with no authorization token passed ', async() => {
            await apiEndpoint.put(`/establishment/${encodeURIComponent(establishmentUid)}/bulkupload/validate`).expect(401);
        });
        it('should fail if trying to validate somone elses ', async() => {
            await apiEndpoint
                .put(`/establishment/${encodeURIComponent(establishmentUid) + 1}/bulkupload/validate`)
                .set('Authorization', loginAuth)
                .expect(403);
        });
    });
});
