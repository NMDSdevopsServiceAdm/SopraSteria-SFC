const models = require('../../../../models');
const sinon = require('sinon');
const expect = require('chai').expect;
const benchmarks = require('../../../../routes/establishments/benchmarks');
const httpMocks = require('node-mocks-http');

describe('benchmarks', () => {

  afterEach(() => {
    sinon.restore();
  });

  describe('pay', () => {
    it('should return the correct calculation', async () => {
      const establishmentId = 123;
      sinon.stub(models.establishment, 'workers').returns(
        {
          'id': 2298,
          'workers': [
            {
              'id': '',
              'uid': '',
              'AnnualHourlyPayRate': '10.00'
            }, {
              'id': '',
              'uid': '',
              'AnnualHourlyPayRate': '50.00'
            }, {
              'id': '',
              'uid': '',
              'AnnualHourlyPayRate': '15.00'
            }
          ]
        }
      );

      const json = await benchmarks.pay(establishmentId);
      const expectedJSON = {
        workplaceValue: {
          value: '25.00',
          hasValue: true
        },
        comparisonGroup: {
          value: 0,
          hasValue: false
        }
      };
      expect(json).to.deep.equal(expectedJSON);
    });

    it('should return the correct state message when there is no workplace value', async () => {
      const establishmentId = 123;
      sinon.stub(models.establishment, 'workers').returns(
        null
      );

      const json = await benchmarks.pay(establishmentId);
      const expectedJson = {
        workplaceValue: {
          value: 0,
          hasValue: false,
          stateMessage: 'no-workers'
        },
        comparisonGroup: {
          value: 0,
          hasValue: false
        }
      };
      expect(json).to.deep.equal(expectedJson);
    });
  });
  describe('sickness', () => {
    it('should return the correct calculation', async () => {
      const establishmentId = 123;
      sinon.stub(models.establishment, 'workers').returns(
        {
          'id': 2298,
          'workers': [
            {
              'id': '',
              'uid': '',
              'DaysSickDays': '10'
            }, {
              'id': '',
              'uid': '',
              'DaysSickDays': '50'
            }, {
              'id': '',
              'uid': '',
              'DaysSickDays': '10'
            }
          ]
        }
      );

      const json = await benchmarks.sickness(establishmentId);
      const expectedJSON = {
        workplaceValue: {
          value: 23,
          hasValue: true
        },
        comparisonGroup: {
          value: 0,
          hasValue: false
        }
      };
      expect(json).to.deep.equal(expectedJSON);
    });

    it('should return the correct state message when there is no workplace value', async () => {
      const establishmentId = 123;
      sinon.stub(models.establishment, 'workers').returns(
        null
      );

      const json = await benchmarks.sickness(establishmentId);
      const expectedJson = {
        workplaceValue: {
          value: 0,
          hasValue: false,
          stateMessage: 'no-workers'
        },
        comparisonGroup: {
          value: 0,
          hasValue: false
        }
      };
      expect(json).to.deep.equal(expectedJson);
    });
  });
  describe('qualifications', () => {
    it('should return the correct calculation', async () => {
      const establishmentId = 123;
      sinon.stub(models.worker, 'specificJobs').returns(
          [ {
              'id': '',
              'uid': '',
              'SocialCareQualificationFkValue': '1'
            }, {
              'id': '',
              'uid': '',
              'SocialCareQualificationFkValue': '2'
            }, {
              'id': '',
              'uid': '',
              'SocialCareQualificationFkValue': '5'
            }, {
          'id': '',
          'uid': '',
          'SocialCareQualificationFkValue': '4'
        }, {
          'id': '',
          'uid': '',
          'SocialCareQualificationFkValue': '1'
        }, {
          'id': '',
          'uid': '',
          'SocialCareQualificationFkValue': '3'
        }]
      ); // quals(3)/total(6) = 0.5

      const json = await benchmarks.qualifications(establishmentId);
      const expectedJSON = {
        workplaceValue: {
          value: 0.5,
          hasValue: true
        },
        comparisonGroup: {
          value: 0,
          hasValue: false
        }
      };
      expect(json).to.deep.equal(expectedJSON);
    });

    it('should return the correct state message when there is no workplace value', async () => {
      const establishmentId = 123;
      sinon.stub(models.worker, 'specificJobs').returns(
        []
      );

      const json = await benchmarks.qualifications(establishmentId);
      const expectedJson = {
        workplaceValue: {
          value: 0,
          hasValue: false,
          stateMessage: 'no-workers'
        },
        comparisonGroup: {
          value: 0,
          hasValue: false
        }
      };
      expect(json).to.deep.equal(expectedJson);
    });
  });
  describe('comparisonGroupData', () => {
    it('should return the correct pay comparison Data', async () => {
      const benchmarkComparisonGroup = {
        'CssrID': 0,
        'MainServiceFK': 0,
        'pay': 10,
        'sickness': 10,
        'turnover': '9.99',
        'qualifications': '9.99',
        'workplaces': 5,
        'staff': 1000
      };

      const reply = {
        tiles: {
          pay: {
            workplaceValue: {
              value: 10,
              hasValue: true
            },
            comparisonGroup: {
              value: 0,
              hasValue: false
            }
          }
        },
        meta: {}
      };
      const expectedJson = {
        tiles: {
          pay: {
            workplaceValue: {
              value: 10,
              hasValue: true
            },
            comparisonGroup: {
              value: 10,
              hasValue: true
            }
          }
        },
        meta: {}
      };
      const json = await benchmarks.comparisonGroupData(reply, benchmarkComparisonGroup);

      expect(json.tiles).to.deep.equal(expectedJson.tiles);
    });
    it('should return the correct comparison Data when passed both pay and sickness', async () => {
      const benchmarkComparisonGroup = {
        'CssrID': 0,
        'MainServiceFK': 0,
        'pay': 10,
        'sickness': 10,
        'turnover': '9.99',
        'qualifications': '9.99',
        'workplaces': 5,
        'staff': 1000
      };

      const reply = {
        tiles: {
          pay: {
            workplaceValue: {
              value: 10,
              hasValue: true
            },
            comparisonGroup: {
              value: 0,
              hasValue: false
            }
          },
          sickness: {
            workplaceValue: {
              value: 50,
              hasValue: true
            },
            comparisonGroup: {
              value: 0,
              hasValue: false
            }
          }
        },
        meta: {}
      };
      const expectedJson = {
        tiles: {
          pay: {
            workplaceValue: {
              value: 10,
              hasValue: true
            },
            comparisonGroup: {
              value: 10,
              hasValue: true
            }
          },
          sickness: {
            workplaceValue: {
              value: 50,
              hasValue: true
            },
            comparisonGroup: {
              value: 10,
              hasValue: true
            }
          }
        },
        meta: {}
      };
      const json = await benchmarks.comparisonGroupData(reply, benchmarkComparisonGroup);

      expect(json.tiles).to.deep.equal(expectedJson.tiles);
    });
    it('should return the correct state message when there is no comparison group value', async () => {
      const benchmarkComparisonGroup = null;

      const reply = {
        tiles: {
          pay: {
            workplaceValue: {
              value: 0,
              hasValue: false,
              stateMessage: 'no-workers'
            },
            comparisonGroup: {
              value: 0,
              hasValue: false
            }
          }
        },
        meta: {}
      };
      const json = await benchmarks.comparisonGroupData(reply, benchmarkComparisonGroup);

      let expectedJson = reply;
      expectedJson.tiles.pay.comparisonGroup.value = 0;
      expectedJson.tiles.pay.comparisonGroup.hasValue = false;
      expectedJson.tiles.pay.comparisonGroup.stateMessage = 'no-data';

      expect(json).to.deep.equal(expectedJson);
    });
  });

})
;
