'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');
const { build, fake } = require('@jackfranklin/test-data-bot');

const slack = require('../../../../utils/slack/slack-logger');

const dbmodels = require('../../../../models');
sinon.stub(dbmodels.status, 'ready').value(false);

const bulkUpload = require('../../../../routes/establishments/bulkUpload');
const EstablishmentCsvValidator = require('../../../../models/BulkImport/csv/establishments');
const WorkerCsvValidator = require('../../../../models/BulkImport/csv/workers');
const BUDI = require('../../../../models/BulkImport/BUDI').BUDI;
const { Establishment } = require('../../../../models/classes/establishment');
const buildEstablishmentCSV = require('../../../../test/factories/establishment/csv');
const buildWorkerCSV = require('../../../../test/factories/worker/csv');

const errorsBuilder = build('Error', {
  fields: {
    name: fake(f => f.company.companyName()),
    lineNumber: fake(f => f.random.number()),
    worker: fake(f => f.name.lastName())
  }
});

describe('/server/routes/establishment/bulkUpload.js', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('printLine', () => {
    it('prints the correct error message for training csv', async () => {
      const readable = [];
      const errors = {
        "error1": [
          errorsBuilder()
        ]
      };
      const sep = ";";
      const reportType = 'training';
      bulkUpload.printLine(readable, reportType, errors, sep);
      expect(readable.length).equals(2);
      expect(readable[0]).to.eql(`${sep}${Object.keys(errors)[0]}${sep}`);
      expect(readable[1]).to.eql(`For worker with ${errors.error1[0].name} and UNIQUEWORKERID ${errors.error1[0].worker} on line ${errors.error1[0].lineNumber}${sep}`);
    });
    it('prints the correct error message for establishment csv', async () => {
      const readable = [];
      const errors = {
        "error1": [
          errorsBuilder()
        ]
      };
      const sep = ";";
      const reportType = 'establishments';
      bulkUpload.printLine(readable, reportType, errors, sep);
      expect(readable.length).equals(2);
      expect(readable[0]).to.eql(`${sep}${Object.keys(errors)[0]}${sep}`);
      expect(readable[1]).to.eql(`For establishment called ${errors.error1[0].name} on line ${errors.error1[0].lineNumber}${sep}`);
    });
    it('prints the correct error message for workers csv', async () => {
      const readable = [];
      const errors = {
        "error1": [
          errorsBuilder()
        ]
      };
      const sep = ";";
      const reportType = 'workers';
      bulkUpload.printLine(readable, reportType, errors, sep);
      expect(readable.length).equals(2);
      expect(readable[0]).to.eql(`${sep}${Object.keys(errors)[0]}${sep}`);
      expect(readable[1]).to.eql(`For worker with LOCALESTID ${errors.error1[0].name} and UNIQUEWORKERID ${errors.error1[0].worker} on line ${errors.error1[0].lineNumber}${sep}`);
    });
  });

  describe('checkDuplicateLocations', () => {
    it('can check for duplicate location IDs', async () => {
      const csvEstablishmentSchemaErrors = [];
      const myEstablishments = [
        buildEstablishmentCSV({
          overrides: {
            LOCALESTID: 'Workplace 1',
            LOCATIONID: '1-12345678',
          },
        }),
        buildEstablishmentCSV({
          overrides: {
            LOCALESTID: 'Workplace 2',
            LOCATIONID: '1-12345678',
          },
        }),
      ].map((currentLine, currentLineNumber) => {
        return new EstablishmentCsvValidator.Establishment(
          currentLine,
          currentLineNumber,
        );
      });

      await bulkUpload.checkDuplicateLocations(
        myEstablishments,
        csvEstablishmentSchemaErrors,
      );

      expect(csvEstablishmentSchemaErrors.length).equals(1);
      expect(csvEstablishmentSchemaErrors[0]).to.eql({
        origin: 'Establishments',
        lineNumber: 1,
        errCode: 998,
        errType: 'DUPLICATE_ERROR',
        error: 'LOCATIONID is not unique',
        source: '1-12345678',
        name: 'Workplace 2',
      });
    });
  });

  describe('checkDuplicateWorkerID()', () => {
    it('errors when CHGUNIQUEWRKID is not unique', async () => {
      const csvWorkerSchemaErrors = [];
      const allWorkersByKey = {};
      const myAPIWorkers = [];
      const myWorkers = [
        buildWorkerCSV({
          overrides: {
            LOCALESTID: 'foo',
            UNIQUEWORKERID: 'Worker 1'
          },
        }),
        buildWorkerCSV({
          overrides: {
            LOCALESTID: 'foo',
            UNIQUEWORKERID: 'Worker 2',
            CHGUNIQUEWRKID: 'Worker 1'
          },
        }),
      ].map((currentLine, currentLineNumber) => {
        const worker = new WorkerCsvValidator.Worker(
          currentLine,
          currentLineNumber,
          []
        );

        worker.validate();

        return worker;
      });

      const allKeys = myWorkers.map(worker => (worker.local + worker.uniqueWorker).replace(/\s/g, ''));


      myWorkers.forEach(thisWorker => {
        // uniquness for a worker is across both the establishment and the worker
        const keyNoWhitespace = (thisWorker.local + thisWorker.uniqueWorker).replace(/\s/g, '');
        const changeKeyNoWhitespace = thisWorker.changeUniqueWorker ? (thisWorker.local + thisWorker.changeUniqueWorker).replace(/\s/g, '') : null;

        if (bulkUpload.checkDuplicateWorkerID(
          myWorkers[1], allKeys, changeKeyNoWhitespace, keyNoWhitespace, allWorkersByKey, myAPIWorkers, csvWorkerSchemaErrors
        )) {
          allWorkersByKey[keyNoWhitespace] = thisWorker.lineNumber;

          // to prevent subsequent Worker duplicates, add also the change worker id if CHGUNIQUEWORKERID is given
          if (changeKeyNoWhitespace) {
            allWorkersByKey[changeKeyNoWhitespace] = thisWorker.lineNumber;
          }
        }
      });

      expect(csvWorkerSchemaErrors.length).equals(1);
      expect(csvWorkerSchemaErrors[0]).to.eql({
        origin: 'Workers',
        lineNumber: 1,
        errCode: 998,
        errType: 'DUPLICATE_ERROR',
        error: 'CHGUNIQUEWRKID Worker 1 is not unique',
        name: 'foo',
        source: 'Worker 2',
        worker: 'Worker 2'
      });
    });
  });
  describe('checkPartTimeSalary()', () => {
      // FTE / PTE : Full / Part Time Employee . FTE > 36 hours a week, PTE < 37
      it('errors when one worker has the same salary as a FTE but works PTE', async () => {
        const csvWorkerSchemaErrors = [];
        const myWorkers = [
          buildWorkerCSV({
            overrides: {
              LOCALESTID: 'foo',
              UNIQUEWORKERID: 'FTE',
              CONTHOURS:'50',
              SALARY: '50',
              SALARYINT: '1',//Annually
              HOURLYRATE: '',
              MAINJOBROLE : '5',

            },
          }),
          buildWorkerCSV({
            overrides: {
              LOCALESTID: 'foo',
              UNIQUEWORKERID: 'PTE',
              CONTHOURS: '10',
              SALARY:'50',
              SALARYINT: '1', //Annually
              HOURLYRATE: '',
              MAINJOBROLE: '5',
            },
          }),
        ].map((currentLine, currentLineNumber) => {
          const worker = new WorkerCsvValidator.Worker(
            currentLine,
            currentLineNumber,
            []
          );

          worker.validate();

          return worker;
        });

         myWorkers.forEach(thisWorker => {
           bulkUpload.checkPartTimeSalary(thisWorker,myWorkers,{},csvWorkerSchemaErrors);
         });
        expect(csvWorkerSchemaErrors.length).equals(1);
        expect(csvWorkerSchemaErrors[0]).to.eql({
          origin: 'Workers',
          lineNumber: 1,
          warnCode: 1260,
          warnType: 'SALARY_ERROR',
          warning: `SALARY is the same as other staff on different hours. Please check you have not entered full time equivalent (FTE) pay`,
          source: 'foo',
          worker: 'PTE',
          name: 'foo'
        });
      });
      it('shouldnt error when two worker has the same salary, different job and one is FTE and one is PTE ', async () => {
        const csvWorkerSchemaErrors = [];
        const myWorkers = [
          buildWorkerCSV({
            overrides: {
              LOCALESTID: 'foo',
              UNIQUEWORKERID: 'FTE',
              CONTHOURS:'50',
              SALARY: '50',
              SALARYINT: '1',//Annually
              HOURLYRATE: '',
              MAINJOBROLE : '3',

            },
          }),
          buildWorkerCSV({
            overrides: {
              LOCALESTID: 'foo',
              UNIQUEWORKERID: 'PTE',
              CONTHOURS: '10',
              SALARY:'50',
              SALARYINT: '1', //Annually
              HOURLYRATE: '',
              MAINJOBROLE: '5',
            },
          }),
        ].map((currentLine, currentLineNumber) => {
          const worker = new WorkerCsvValidator.Worker(
            currentLine,
            currentLineNumber,
            []
          );

          worker.validate();

          return worker;
        });

        myWorkers.forEach(thisWorker => {
          bulkUpload.checkPartTimeSalary(thisWorker,myWorkers,{}, csvWorkerSchemaErrors);
        });
        console.log(csvWorkerSchemaErrors);
        expect(csvWorkerSchemaErrors.length).equals(0);

      });
      it('shouldnt error when two worker has the same salary, same job and both are FTE ', async () => {
        const csvWorkerSchemaErrors = [];
        const myWorkers = [
          buildWorkerCSV({
            overrides: {
              LOCALESTID: 'foo',
              UNIQUEWORKERID: 'FTE',
              CONTHOURS:'50',
              SALARY: '50',
              SALARYINT: '1',//Annually
              HOURLYRATE: '',
              MAINJOBROLE : '5',

            },
          }),
          buildWorkerCSV({
            overrides: {
              LOCALESTID: 'foo',
              UNIQUEWORKERID: 'FTE',
              CONTHOURS: '50',
              SALARY:'50',
              SALARYINT: '1', //Annually
              HOURLYRATE: '',
              MAINJOBROLE: '5',
            },
          }),
        ].map((currentLine, currentLineNumber) => {
          const worker = new WorkerCsvValidator.Worker(
            currentLine,
            currentLineNumber,
            []
          );

          worker.validate();

          return worker;
        });

        myWorkers.forEach(thisWorker => {
          bulkUpload.checkPartTimeSalary(thisWorker,myWorkers,{},csvWorkerSchemaErrors);
        });
        expect(csvWorkerSchemaErrors.length).equals(0);

      });
      it('shouldnt error when the worker status is DELETE ', async () => {
        const csvWorkerSchemaErrors = [];
        const myWorkers = [
          buildWorkerCSV({
            overrides: {
              LOCALESTID: 'foo',
              UNIQUEWORKERID: 'FTE',
              CONTHOURS:'50',
              SALARY: '50',
              SALARYINT: '1',//Annually
              HOURLYRATE: '',
              MAINJOBROLE : '5',

            },
          }),
          buildWorkerCSV({
            overrides: {
              LOCALESTID: 'foo',
              UNIQUEWORKERID: 'PTE',
              CONTHOURS: '10',
              SALARY:'50',
              SALARYINT: '1', //Annually
              HOURLYRATE: '',
              MAINJOBROLE: '5',
              STATUS: 'DELETE'
            },
          }),
        ].map((currentLine, currentLineNumber) => {
          const worker = new WorkerCsvValidator.Worker(
            currentLine,
            currentLineNumber,
            []
          );

          worker.validate();

          return worker;
        });

        myWorkers.forEach(thisWorker => {
          bulkUpload.checkPartTimeSalary(thisWorker,myWorkers,{},csvWorkerSchemaErrors);
        });
        expect(csvWorkerSchemaErrors.length).equals(0);

      });
      it('shouldnt error when the compared worker status is DELETE ', async () => {
        const csvWorkerSchemaErrors = [];
        const myWorkers = [
          buildWorkerCSV({
            overrides: {
              LOCALESTID: 'foo',
              UNIQUEWORKERID: 'FTE',
              CONTHOURS:'50',
              SALARY: '50',
              SALARYINT: '1',//Annually
              HOURLYRATE: '',
              MAINJOBROLE : '5',
              STATUS: 'DELETE'
            },
          }),
          buildWorkerCSV({
            overrides: {
              LOCALESTID: 'foo',
              UNIQUEWORKERID: 'PTE',
              CONTHOURS: '10',
              SALARY:'50',
              SALARYINT: '1', //Annually
              HOURLYRATE: '',
              MAINJOBROLE: '5',

            },
          }),
        ].map((currentLine, currentLineNumber) => {
          const worker = new WorkerCsvValidator.Worker(
            currentLine,
            currentLineNumber,
            []
          );

          worker.validate();

          return worker;
        });

        myWorkers.forEach(thisWorker => {
          bulkUpload.checkPartTimeSalary(thisWorker,myWorkers,{},csvWorkerSchemaErrors);
        });
        expect(csvWorkerSchemaErrors.length).equals(0);

      });
      it('should only show errors on PTEs', async () => {
        const csvWorkerSchemaErrors = [];
        const myWorkers = [
          buildWorkerCSV({
            overrides: {
              LOCALESTID: 'foo',
              UNIQUEWORKERID: 'FTE',
              CONTHOURS:'50',
              SALARY: '50',
              SALARYINT: '1',//Annually
              HOURLYRATE: '',
              MAINJOBROLE : '5',

            },
          }),
          buildWorkerCSV({
            overrides: {
              LOCALESTID: 'foo',
              UNIQUEWORKERID: 'PTE',
              CONTHOURS: '10',
              SALARY:'50',
              SALARYINT: '1', //Annually
              HOURLYRATE: '',
              MAINJOBROLE: '5',
            },
          }),
          buildWorkerCSV({
            overrides: {
              LOCALESTID: 'foo',
              UNIQUEWORKERID: 'PTE 2',
              CONTHOURS: '10',
              SALARY:'50',
              SALARYINT: '1', //Annually
              HOURLYRATE: '',
              MAINJOBROLE: '5',
            },
          }),
        ].map((currentLine, currentLineNumber) => {
          const worker = new WorkerCsvValidator.Worker(
            currentLine,
            currentLineNumber,
            []
          );

          worker.validate();

          return worker;
        });

        myWorkers.forEach(thisWorker => {
          bulkUpload.checkPartTimeSalary(thisWorker,myWorkers,{},csvWorkerSchemaErrors);
        });
        expect(csvWorkerSchemaErrors.length).equals(2);
        expect(csvWorkerSchemaErrors[0]).to.eql({
          origin: 'Workers',
          lineNumber: 1,
          warnCode: 1260,
          warnType: 'SALARY_ERROR',
          warning: `SALARY is the same as other staff on different hours. Please check you have not entered full time equivalent (FTE) pay`,
          source: 'foo',
          worker: 'PTE',
          name: 'foo'
        });
        expect(csvWorkerSchemaErrors[1]).to.eql({
          origin: 'Workers',
          lineNumber: 2,
          warnCode: 1260,
          warnType: 'SALARY_ERROR',
          warning: `SALARY is the same as other staff on different hours. Please check you have not entered full time equivalent (FTE) pay`,
          source: 'foo',
          worker: 'PTE 2',
          name: 'foo'
        });

      });

    });
  describe('validateEstablishmentCsv()', () => {
    it('should validate each line of the establishments CSV', async () => {
      const workplace = { Address1: 'First Line',
        Address2: 'Second Line',
        Address3: '',
        Town: 'My Town',
        Postcode: 'LN11 9JG',
        LocationId: '1-12345678',
        ProvId: '1-12345678',
        IsCQCRegulated: true,
        reasonsForLeaving: '',
        status: null,
        name: 'WOZiTech, with even more care',
        localIdentifier: 'omar3',
        isRegulated: false,
        employerType: { value: null, other: undefined },
        localAuthorities: [],
        mainService: null,
        services: [],
        serviceUsers: [],
        numberOfStaff: null,
        vacancies: 'None',
        starters: 'None',
        leavers: 'None',
        share: { enabled: false },
        capacities: []
      };
      sinon.stub(EstablishmentCsvValidator.Establishment.prototype, 'validate').resolves();
      sinon.stub(EstablishmentCsvValidator.Establishment.prototype, 'transform').resolves({});
      sinon.stub(Establishment.prototype, 'initialise').callsFake((Address1, Address2, Address3, Town, test, LocationId, ProvId, Postcode, IsCQCRegulated)  => {
        expect(Address1).to.deep.equal(workplace.Address1);
        expect(Address2).to.deep.equal(workplace.Address2);
        expect(Address3).to.deep.equal(workplace.Address3);
        expect(Town).to.deep.equal(workplace.Town);
        expect(test).to.deep.equal(null);
        expect(LocationId).to.deep.equal(workplace.LocationId);
        expect(ProvId).to.deep.equal(workplace.ProvId);
        expect(Postcode).to.deep.equal(workplace.Postcode);
        expect(IsCQCRegulated).to.deep.equal(workplace.IsCQCRegulated);
      });
      sinon.stub(EstablishmentCsvValidator.Establishment.prototype, 'toAPI').callsFake(() => {
        return workplace;
      });
      sinon.stub(Establishment.prototype, 'load').callsFake(args => {
        expect(args).to.deep.equal(workplace);
      });
      sinon.stub(Establishment.prototype, 'validate').resolves({});
      sinon.stub(Establishment.prototype, 'key').get(() =>{
        return 'omar3';
      });

      await bulkUpload.validateEstablishmentCsv({
        LOCALESTID: 'omar3',
        STATUS: 'NEW',
        ESTNAME: 'WOZiTech, with even more care',
        ADDRESS1: 'First Line',
        ADDRESS2: 'Second Line',
        ADDRESS3: '',
        POSTTOWN: 'My Town',
        POSTCODE: 'LN11 9JG',
        ESTTYPE: '6',
        OTHERTYPE: '',
        PERMCQC: '1',
        PERMLA: '1',
        SHARELA: '708;721;720',
        REGTYPE: '2',
        PROVNUM: '1-12345678',
        LOCATIONID: '1-12345678',
        MAINSERVICE: '8',
      ALLSERVICES: '12;13',
        CAPACITY: '0;0',
        UTILISATION: '0;0',
        SERVICEDESC: '1;1',
        SERVICEUSERS: '',
        OTHERUSERDESC: '',
        TOTALPERMTEMP: '1',
        ALLJOBROLES: '34;8;4',
        STARTERS: '0;0;0',
        LEAVERS: '999;0;0',
        VACANCIES: '999;333;1',
        REASONS: '',
        REASONNOS: ''
      },
      2,
      [],
      [],
      [
        {
          _validations: [],
          _username: 'aylingw',
          _id: 479,
          _uid: '98a83eef-e1e1-49f3-89c5-b1287a3cc8dd',
          _ustatus: null,
          _created: '2019-03-15T09:54:10.562Z',
          _updated: '2019-10-04T15:46:16.158Z',
          _updatedBy: 'aylingw',
          _auditEvents: null,
          _name: 'WOZiTech, with even more care',
          _address1: 'First Line',
          _address2: 'Second Line',
          _address3: '',
          _town: 'My Town',
          _county: '',
          _locationId: null,
          _provId: null,
          _postcode: 'LN11 9JG',
          _isRegulated: false,
          _mainService: { id: 16, name: 'Head office services' },
          _nmdsId: 'G1001114',
          _lastWdfEligibility: '2019-08-16T07:17:38.014Z',
          _overallWdfEligibility: '2019-08-16T07:17:38.340Z',
          _establishmentWdfEligibility: null,
          _staffWdfEligibility: '2019-08-13T12:41:24.836Z',
          _isParent: true,
          _parentUid: null,
          _parentId: null,
          _parentName: null,
          _dataOwner: 'Workplace',
          _dataPermissions: 'None',
          _archived: false,
          _dataOwnershipRequested: null,
          _reasonsForLeaving: '',
          _properties: {
            _properties: [Object],
            _propertyTypes: [Array],
            _auditEvents: null,
            _modifiedProperties: [],
            _additionalModels: null
          },
          _isNew: false,
          _workerEntities: {
          },
          _readyForDeletionWorkers: null,
          _status: 'NEW',
          _logLevel: 300
        },
        {
          _validations: [],
          _username: 'aylingw',
          _id: 1446,
          _uid: 'a415435f-40f2-4de5-abf7-bff611e85591',
          _ustatus: null,
          _created: '2019-07-31T15:09:57.405Z',
          _updated: '2019-10-04T15:46:16.797Z',
          _updatedBy: 'aylingw',
          _auditEvents: null,
          _name: 'WOZiTech Cares Sub 100',
          _address1: 'Number 1',
          _address2: 'My street',
          _address3: '',
          _town: 'My Town',
          _county: '',
          _locationId: '1-888777666',
          _provId: '1-999888777',
          _postcode: 'LN11 9JG',
          _isRegulated: true,
          _mainService: { id: 1, name: 'Carers support' },
          _nmdsId: 'G1002110',
          _lastWdfEligibility: '2019-10-04T15:46:16.797Z',
          _overallWdfEligibility: null,
          _establishmentWdfEligibility: '2019-10-04T14:46:16.797Z',
          _staffWdfEligibility: null,
          _isParent: false,
          _parentUid: '98a83eef-e1e1-49f3-89c5-b1287a3cc8dd',
          _parentId: 479,
          _parentName: null,
          _dataOwner: 'Parent',
          _dataPermissions: 'None',
          _archived: false,
          _dataOwnershipRequested: null,
          _reasonsForLeaving: '',
          _properties: {
            _properties: [Object],
            _propertyTypes: [Array],
            _auditEvents: null,
            _modifiedProperties: [],
            _additionalModels: null
          },
          _isNew: false,
          _workerEntities: {},
          _readyForDeletionWorkers: null,
          _status: 'COMPLETE',
          _logLevel: 300
        }
      ]);
    });
  });

  describe('exportToCsv()', () => {
    it('should have a blank UNIQUEWORKERID if worker does not have a LocalIdentifier', async () => {
      sinon.stub(dbmodels.workerTrainingCategories, 'findAll').returns([
        {
          id: 1
        }
      ]);

      const trainingCategory = 1;

      const lines = [];

      const responseSend = (line, stepName = '') => {
        lines.push(line);
      };

      const establishment = new Establishment('foo');
      await establishment.load({
        name: 'foo',
        workers: [
          {
            nameOrId: 'foobar',
            training: [
              {
                trainingCategory: {
                  id: trainingCategory
                }
              }
            ]
          }
        ]
      }, true);

      await bulkUpload.exportToCsv('', [establishment], 'foo', 'training', [
        {
          maxqualifications: "10"
        }
      ], responseSend);

      expect(lines[1]).to.equal(`${establishment.name},,${BUDI.trainingCategory(BUDI.FROM_ASC, trainingCategory)},,,,,`);
    });

    it('should have a UNIQUEWORKERID if worker has a LocalIdentifier', async () => {
      sinon.stub(dbmodels.workerTrainingCategories, 'findAll').returns([
        {
          id: 1
        }
      ]);

      const trainingCategory = 1;
      const workerName = 'TesterMcTesterson';

      const lines = [];

      const responseSend = (line, stepName = '') => {
        lines.push(line);
      };

      const establishment = new Establishment('foo');
      await establishment.load({
        name: 'foo',
        workers: [
          {
            nameOrId: 'foobar',
            localIdentifier: workerName,
            training: [
              {
                trainingCategory: {
                  id: trainingCategory
                }
              }
            ]
          }
        ]
      }, true);

      await bulkUpload.exportToCsv('', [establishment], 'foo', 'training', [
        {
          maxqualifications: "10"
        }
      ], responseSend);

      expect(lines[1]).to.equal(`${establishment.name},${workerName},${BUDI.trainingCategory(BUDI.FROM_ASC, trainingCategory)},,,,,`);
    });

  });
  describe('sendCountToSlack()', () => {
    it('should send notification to slack with over 500 workers', async () => {
      const differenceReport = {
        new: [
          {
            workers: {
              new: [],
              updated: [
                {
                  name: 0
                }
              ]
            }
          }
        ],
        updated: [
          {
            workers: {
              new: [
                {
                  name: 0
                }
              ],
              updated: [
                {
                  name: 0
                }
              ]
            }
          }
        ]
      }
      for (let i = 0; i < 502; i++) {
        differenceReport.new[0].workers.new.push({name: i});
      }
      const username = 'foo';
      const primaryId = 123;

      sinon.stub(Establishment.prototype, 'restore');

      const spy = sinon.spy(slack, 'info');
      await bulkUpload.sendCountToSlack(username, primaryId, differenceReport);

      expect(spy.called).to.deep.equal(true);
    });
    it('should not send notification to slack with under 500 workers', async () => {
      const differenceReport = {
        new: [
          {
            workers: {
              new: []
            }
          }
        ]
      }
      const username = 'foo';
      const primaryId = 123;

      sinon.stub(Establishment.prototype, 'restore');

      const spy = sinon.spy(slack, 'info');
      await bulkUpload.sendCountToSlack(username, primaryId, differenceReport);

      expect(spy.called).to.deep.equal(false);
    });
  });
});
