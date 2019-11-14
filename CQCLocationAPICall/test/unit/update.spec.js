const AWS = require('aws-sdk-mock');
const expect = require('chai').expect;
const fs = require('fs');
const sinon = require('sinon');
const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');

const appConfig = require('../../config/config');
const update = require('../../update');
const models = require('../../models/index');

describe('update.js', () => {
  before(async () => {
    const mock = new MockAdapter(axios);
    sinon.stub(models.location, 'upsert');

    mock.onAny().reply(200, {
      "locationId": "1-125856395",
      "providerId": "1-102642955",
      "organisationType": "Location",
      "type": "Social Care Org",
      "name": "Lucerne House",
      "brandId": "BD198",
      "brandName": "BRAND Barchester Healthcare",
      "onspdCcgCode": "E38000230",
      "onspdCcgName": "NHS Devon CCG",
      "odsCode": "VLLWV",
      "uprn": "10013042022",
      "registrationStatus": "Registered",
      "registrationDate": "2011-02-15",
      "numberOfBeds": 75,
      "website": "www.barchester.com",
      "postalAddressLine1": "Chudleigh Road",
      "postalAddressLine2": "Alphington",
      "postalAddressTownCity": "Exeter",
      "postalAddressCounty": "Devon",
      "region": "South West",
      "postalCode": "EX2 8TU",
      "onspdLatitude": 50.699089,
      "onspdLongitude": -3.533912,
      "careHome": "Y",
      "inspectionDirectorate": "Adult social care",
      "mainPhoneNumber": "01392422905",
      "constituency": "Exeter",
      "localAuthority": "Devon",
      "lastInspection": {
        "date": "2019-09-18"
      },
      "lastReport": {
        "publicationDate": "2019-10-31"
      },
      "relationships": [

      ],
      "locationTypes": [

      ],
      "regulatedActivities": [
        {
          "name": "Accommodation for persons who require nursing or personal care",
          "code": "RA2",
          "contacts": [
            {
              "personTitle": "Mr",
              "personGivenName": "John Surel",
              "personFamilyName": "Bayliss",
              "personRoles": [
                "Registered Manager"
              ]
            }
          ]
        },
        {
          "name": "Treatment of disease, disorder or injury",
          "code": "RA5",
          "contacts": [
            {
              "personTitle": "Mr",
              "personGivenName": "John Surel",
              "personFamilyName": "Bayliss",
              "personRoles": [
                "Registered Manager"
              ]
            }
          ]
        }
      ],
      "gacServiceTypes": [
        {
          "name": "Nursing homes",
          "description": "Care home service with nursing"
        }
      ],
      "inspectionCategories": [
        {
          "code": "S1",
          "primary": "true",
          "name": "Residential social care"
        }
      ],
      "specialisms": [
        {
          "name": "Caring for adults over 65 yrs"
        },
        {
          "name": "Caring for adults under 65 yrs"
        },
        {
          "name": "Dementia"
        },
        {
          "name": "Mental health conditions"
        },
        {
          "name": "Physical disabilities"
        }
      ],
      "inspectionAreas": [

      ],
      "currentRatings": {
        "overall": {
          "rating": "Outstanding",
          "reportDate": "2019-10-31",
          "reportLinkId": "a361ecb8-4b08-49b8-934c-dc578d6bff8d",
          "useOfResources": {

          },
          "keyQuestionRatings": [
            {
              "name": "Safe",
              "rating": "Good",
              "reportDate": "2019-10-31",
              "reportLinkId": "a361ecb8-4b08-49b8-934c-dc578d6bff8d"
            },
            {
              "name": "Well-led",
              "rating": "Outstanding",
              "reportDate": "2019-10-31",
              "reportLinkId": "a361ecb8-4b08-49b8-934c-dc578d6bff8d"
            },
            {
              "name": "Caring",
              "rating": "Outstanding",
              "reportDate": "2019-10-31",
              "reportLinkId": "a361ecb8-4b08-49b8-934c-dc578d6bff8d"
            },
            {
              "name": "Responsive",
              "rating": "Outstanding",
              "reportDate": "2019-10-31",
              "reportLinkId": "a361ecb8-4b08-49b8-934c-dc578d6bff8d"
            },
            {
              "name": "Effective",
              "rating": "Outstanding",
              "reportDate": "2019-10-31",
              "reportLinkId": "a361ecb8-4b08-49b8-934c-dc578d6bff8d"
            }
          ]
        },
        "reportDate": "2019-10-31"
      },
      "historicRatings": [
        {
          "reportLinkId": "e2afac75-fdf8-469b-b1dc-4de1ae8a5ec1",
          "reportDate": "2017-02-08",
          "overall": {
            "rating": "Outstanding",
            "keyQuestionRatings": [
              {
                "name": "Safe",
                "rating": "Good"
              },
              {
                "name": "Well-led",
                "rating": "Outstanding"
              },
              {
                "name": "Caring",
                "rating": "Outstanding"
              },
              {
                "name": "Responsive",
                "rating": "Outstanding"
              },
              {
                "name": "Effective",
                "rating": "Outstanding"
              }
            ]
          }
        },
        {
          "reportLinkId": "c2bfc2ef-995e-4b02-bcd6-02a4d6b0db39",
          "reportDate": "2015-01-23",
          "overall": {
            "rating": "Good",
            "keyQuestionRatings": [
              {
                "name": "Safe",
                "rating": "Good"
              },
              {
                "name": "Well-led",
                "rating": "Good"
              },
              {
                "name": "Caring",
                "rating": "Good"
              },
              {
                "name": "Responsive",
                "rating": "Requires improvement"
              },
              {
                "name": "Effective",
                "rating": "Good"
              }
            ]
          }
        }
      ],
      "reports": [
        {
          "linkId": "a361ecb8-4b08-49b8-934c-dc578d6bff8d",
          "reportDate": "2019-10-31",
          "reportUri": "/reports/a361ecb8-4b08-49b8-934c-dc578d6bff8d",
          "firstVisitDate": "2019-09-17",
          "reportType": "Location"
        },
        {
          "linkId": "e2afac75-fdf8-469b-b1dc-4de1ae8a5ec1",
          "reportDate": "2017-02-08",
          "reportUri": "/reports/e2afac75-fdf8-469b-b1dc-4de1ae8a5ec1",
          "firstVisitDate": "2016-11-21",
          "reportType": "Location"
        },
        {
          "linkId": "c2bfc2ef-995e-4b02-bcd6-02a4d6b0db39",
          "reportDate": "2015-01-23",
          "reportUri": "/reports/c2bfc2ef-995e-4b02-bcd6-02a4d6b0db39",
          "firstVisitDate": "2014-10-28",
          "reportType": "Location"
        },
        {
          "linkId": "987e58b3-d216-4645-b744-f746c1e595c9",
          "reportDate": "2014-06-27",
          "reportUri": "/reports/987e58b3-d216-4645-b744-f746c1e595c9",
          "firstVisitDate": "2014-05-21"
        },
        {
          "linkId": "e61ffba6-a7e0-4b9d-b85d-898e4ccb3b21",
          "reportDate": "2014-05-20",
          "reportUri": "/reports/e61ffba6-a7e0-4b9d-b85d-898e4ccb3b21",
          "firstVisitDate": "2014-02-24"
        },
        {
          "linkId": "c0812822-bb19-4169-9372-ef4d69c0b6d6",
          "reportDate": "2013-10-15",
          "reportUri": "/reports/c0812822-bb19-4169-9372-ef4d69c0b6d6",
          "firstVisitDate": "2013-08-23"
        },
        {
          "linkId": "a3304b3b-bd48-4457-990e-5bfaea55727f",
          "reportDate": "2012-06-21",
          "reportUri": "/reports/a3304b3b-bd48-4457-990e-5bfaea55727f",
          "firstVisitDate": "2012-05-22"
        },
        {
          "linkId": "8a3ae9dc-d9ad-4dac-890d-6c213744a3eb",
          "reportDate": "2011-10-14",
          "reportUri": "/reports/8a3ae9dc-d9ad-4dac-890d-6c213744a3eb",
          "firstVisitDate": "2011-09-23"
        },
        {
          "linkId": "3dd66d83-4cd7-4d0b-8fc8-bc7888d46e1a",
          "reportDate": "2011-09-28",
          "reportUri": "/reports/3dd66d83-4cd7-4d0b-8fc8-bc7888d46e1a",
          "firstVisitDate": "2012-07-25"
        }
      ]
    });


    AWS.mock('S3', 'getObject', {Body: Buffer.from(fs.readFileSync('test/mockdata/s3.json'))});
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
  after(async () => {
    fs.writeFileSync('test/mockdata/s3.json', JSON.stringify({}), 'utf8');
  });
  it('should return a status of 200',async () => {
    const updateTest = await update.handler(JSON.parse(fs.readFileSync('./event.json')), null);
    expect(updateTest.status).to.equal(200);
    expect(updateTest.body).to.equal('Call Successful');
  });
});
