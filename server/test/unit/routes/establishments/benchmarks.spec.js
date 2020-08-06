const models = require('../../../../models');
const sinon = require('sinon');
const expect = require('chai').expect;
const benchmarks = require('../../../../routes/establishments/benchmarks');
const httpMocks = require('node-mocks-http');

describe('benchmarks', () => {

  afterEach(() => {
    sinon.restore();
  });

  describe("pay",() =>{
    it('should return the correct calculation', async () => {
      const establishmentId = 123;
      sinon.stub(models.establishment, 'workers').returns(
        {"id":2298,
          "workers":[
            { "id":"",
              "uid":"",
              "AnnualHourlyPayRate":"10.00"
            }, { "id":"",
              "uid":"",
              "AnnualHourlyPayRate":"50.00"
            }, { "id":"",
              "uid":"",
              "AnnualHourlyPayRate":"15.00"
            }
          ]}
      );

      const req = httpMocks.createRequest({
        method: 'GET',
        url: `/api/establishment/${establishmentId}/benchmarks`,
        params: {
          establishmentId,
        },
      });

      req.establishment = {
        id: establishmentId,
      };

      const res = httpMocks.createResponse();

     const json =  await benchmarks.pay(req, res, establishmentId);
     const expectedJSON = {
       workplaceValue: {
         value: "25.00",
         hasValue: true
      },
      comparisonGroup: {
        value: 0,
        hasValue: false
      }};
      expect(json).to.deep.equal(expectedJSON);
      });

  it('should return the correct state message when there is no workplace value', async () => {
    const establishmentId = 123;
    sinon.stub(models.establishment, 'workers').returns(
      null
    );

    const req = httpMocks.createRequest({
      method: 'GET',
      url: `/api/establishment/${establishmentId}/benchmarks`,
      params: {
        establishmentId,
      },
    });

    req.establishment = {
      id: establishmentId,
    };

    const res = httpMocks.createResponse();

    const json =  await benchmarks.pay(req, res, establishmentId);
    const expectedJson = {
      workplaceValue: {
        value: 0,
        hasValue: false,
        stateMessage: "no-workers"
      },
      comparisonGroup: {
        value: 0,
        hasValue: false
      }};
    expect(json).to.deep.equal(expectedJson);
  });
  });
  describe("comparisonGroupData",() =>{
    it('should return the correct comparison Data', async () => {
     const benchmarkComparisonGroup = {
      "CssrID":0,
       "MainServiceFK":0,
       "pay":10,
       "sickness":10,
       "turnover":"9.99",
       "qualifications":"9.99",
       "workplaces":5,
       "staff":1000
     };

     const reply = {
        tiles: {
          pay: {
            workplaceValue: {
              value: 0,
              hasValue: false,
              stateMessage: "no-workers"
            },
            comparisonGroup: {
              value: 0,
              hasValue: false
            }
          }
        },
        meta: {

        }
      };
     const json = await benchmarks.comparisonGroupData(null,null,reply,benchmarkComparisonGroup);

     let expectedJson = reply;
     expectedJson.tiles.pay.comparisonGroup.value = benchmarkComparisonGroup.pay;
     expectedJson.tiles.pay.comparisonGroup.hasValue = true;

     expect(json).to.deep.equal(expectedJson);
    });
    it('should return the correct state message when there is no comparison group value', async () => {
      const benchmarkComparisonGroup = null;

      const reply = {
        tiles: {
          pay: {
            workplaceValue: {
              value: 0,
              hasValue: false,
              stateMessage: "no-workers"
            },
            comparisonGroup: {
              value: 0,
              hasValue: false
            }
          }
        },
        meta: {

        }
      };
      const json = await benchmarks.comparisonGroupData(null,null,reply,benchmarkComparisonGroup);

      let expectedJson = reply;
      expectedJson.tiles.pay.comparisonGroup.value =0;
      expectedJson.tiles.pay.comparisonGroup.hasValue = false;
      expectedJson.tiles.pay.comparisonGroup.stateMessage = "no-data";

      expect(json).to.deep.equal(expectedJson);
    });
  });

});
