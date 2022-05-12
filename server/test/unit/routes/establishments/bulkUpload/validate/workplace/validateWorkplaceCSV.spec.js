const expect = require('chai').expect;
const sinon = require('sinon');

const { WorkplaceCSVValidator } = require('../../../../../../../models/BulkImport/csv/workplaceCSVValidator');

describe('WorkplaceCSVValidator', () => {
  describe('validate', () => {
    let currentLine;
    let lineNumber;
    let allCurrentEstablishments;

    beforeEach(() => {
      this.currentLine = {
        LOCALESTID: "Zuhal's workplace",
        STATUS: 'UPDATE',
        ESTNAME: 'Christies Care Ltd',
        ADDRESS1: 'Rose House',
        ADDRESS2: 'Street Farm Road',
        ADDRESS3: '',
        POSTTOWN: 'Saxmundham',
        POSTCODE: 'IP17',
        ESTTYPE: '1',
        OTHERTYPE: '',
        PERMCQC: '',
        PERMLA: '1',
        REGTYPE: '2',
        PROVNUM: '',
        LOCATIONID: '1-1991104526',
        MAINSERVICE: '17',
        ALLSERVICES: '17',
        CAPACITY: '',
        UTILISATION: '7',
        SERVICEDESC: '',
        SERVICEUSERS: '1',
        OTHERUSERDESC: '',
        TOTALPERMTEMP: '3',
        ALLJOBROLES: '34',
        STARTERS: '',
        LEAVERS: '0',
        VACANCIES: '999',
        REASONS: '',
        REASONNOS: '',
      };
      this.lineNumber = 2;
      this.allCurrentEstablishments = [
        (Establishment = {
          _validations: [],
          _username: 'zayob',
          _id: 2341,
          _uid: 'a3f4c928-4a6c-4a33-a5b0-4c8553949bfb',
          _ustatus: null,
          _created: '2021-09-14',
          _updated: '2022-04-27',
          _updatedBy: 'zayob',
          _auditEvents: null,
          _name: "Zuhal's workplace",
          _address1: '2 GRAIN STREET',
          _address2: '',
          _address3: '',
          _town: 'BRADFORD',
          _county: 'BRADFORD',
          _locationId: null,
          _provId: null,
          _postcode: 'BD5 9EZ',
          _isRegulated: false,
          _mainService: 17,
          _nmdsId: 'J1003014',
          _lastWdfEligibility: '2022-02-24',
          _overallWdfEligibility: null,
          _establishmentWdfEligibility: null,
          _staffWdfEligibility: null,
          _isParent: true,
          _parentUid: null,
          _parentId: null,
          _parentName: null,
          _dataOwner: 'Workplace',
          _dataPermissions: null,
          _archived: false,
          _dataOwnershipRequested: null,
          _linkToParentRequested: null,
          _lastBulkUploaded: '2022-05-06',
          _eightWeeksFromFirstLogin: '2021-11-09',
          _showSharingPermissionsBanner: false,
          _expiresSoonAlertDate: null,
          _reasonsForLeaving: null,
          _properties: null,
          _isNew: false,
          _workerEntities: null,
          _readyForDeletionWorkers: null,
          _status: 'COMPLETE',
          _logLevel: 30,
        }),
      ];
    });

    describe('_validateLocalisedId', () => {
      it('it should return false when LOCALESTID is 50', () => {
        const validate = new WorkplaceCSVValidator(this.currentLine, this.lineNumber, this.allCurrentEstablishments);
        this.currentLine.LOCALESTID = '123456789012345678901234567890987654321234567890987654321';
        const status = validate._validateLocalisedId();

        expect(validate._validationErrors).to.deep.equal([
          {
            lineNumber: 2,
            errCode: 1010,
            errType: 'LOCAL_ID_ERROR',
            error: 'LOCALESTID is longer than 50 characters',
            source: '123456789012345678901234567890987654321234567890987654321',
            column: 'LOCALESTID',
          },
        ]);
        expect(validate._localId).to.deep.equal('123456789012345678901234567890987654321234567890987654321');
        expect(validate._key).to.deep.equal('123456789012345678901234567890987654321234567890987654321');
        expect(status).to.deep.equal(false);
      });

      it('it should return false when LOCALESTID is null', () => {
        const validate = new WorkplaceCSVValidator(this.currentLine, this.lineNumber, this.allCurrentEstablishments);
        this.currentLine.LOCALESTID = null;

        const status = validate._validateLocalisedId();

        expect(validate._validationErrors).to.deep.equal([
          {
            lineNumber: 2,
            errCode: 1010,
            errType: 'LOCAL_ID_ERROR',
            error: 'LOCALESTID has not been supplied',
            source: null,
            column: 'LOCALESTID',
          },
        ]);
        expect(validate._localId).to.deep.equal('SFCROW$2');
        expect(validate._key).to.deep.equal('SFCROW$2');
        expect(status).to.deep.equal(false);
      });

      it('it should return true when LOCALESTID is between 1-50 ', () => {
        const validate = new WorkplaceCSVValidator(this.currentLine, this.lineNumber, this.allCurrentEstablishments);
        this.currentLine.LOCALESTID = '123';

        const status = validate._validateLocalisedId();

        expect(validate._validationErrors).to.deep.equal([]);
        expect(validate._localId).to.deep.equal('123');
        expect(validate._key).to.deep.equal('123');
        expect(status).to.deep.equal(true);
      });
    });

    describe('_validateEstablishmentName', () => {
      it('it should return false when ESTNAME is not provided', () => {
        const validate = new WorkplaceCSVValidator(this.currentLine, this.lineNumber, this.allCurrentEstablishments);
        this.currentLine.ESTNAME = null;
        const response = validate._validateEstablishmentName();

        expect(validate._validationErrors).to.deep.equal([
          {
            lineNumber: 2,
            errCode: 1030,
            errType: 'NAME_ERROR',
            error: 'ESTNAME has not been supplied',
            source: null,
            column: 'ESTNAME',
            name: "Zuhal's workplace",
          },
        ]);
        expect(response).to.deep.equal(false);
        expect(validate._name).to.deep.equal(null);
      });

      it('it should return false when ESTNAME length is 120', () => {
        const validate = new WorkplaceCSVValidator(this.currentLine, this.lineNumber, this.allCurrentEstablishments);
        this.currentLine.ESTNAME =
          '123456789012345678901234567890123456789012345678901234567890123456789012345678909876543212345678909876543211123456789ghjklasdfghjklwertyu';
        const response = validate._validateEstablishmentName();

        expect(validate._validationErrors).to.deep.equal([
          {
            lineNumber: 2,
            errCode: 1030,
            errType: 'NAME_ERROR',
            error: 'ESTNAME is longer than 120 characters',
            source:
              '123456789012345678901234567890123456789012345678901234567890123456789012345678909876543212345678909876543211123456789ghjklasdfghjklwertyu',
            column: 'ESTNAME',
            name: "Zuhal's workplace",
          },
        ]);
        expect(response).to.deep.equal(false);
        expect(validate._name).to.deep.equal(null);
      });

      it('it should return true  when ESTNAME length is between 1-120 and not null', () => {
        const validate = new WorkplaceCSVValidator(this.currentLine, this.lineNumber, this.allCurrentEstablishments);
        this.currentLine.ESTNAME;
        const response = validate._validateEstablishmentName();

        expect(validate._validationErrors).to.deep.equal([]);
        expect(response).to.deep.equal(true);
        expect(validate._name).to.deep.equal('Christies Care Ltd');
      });
    });
  });
});
