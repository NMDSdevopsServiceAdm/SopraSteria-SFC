// Shorthand for hasOwnProperty that also works with bare objects
const hasProp = (obj, prop) =>
  Object.prototype.hasOwnProperty.bind(obj)(prop);

const BUDI = require('../BUDI').BUDI;
const models = require('../../index');

const STOP_VALIDATING_ON = ['UNCHECKED', 'DELETE', 'NOCHANGE'];

const nonDirectCareJobRoles = [1, 2, 4, 5, 7, 8, 9, 13, 14, 15, 17, 18, 19, 21, 22, 23, 24, 26, 27, 28];
const employedContractStatusIds = [1, 2];
const cqcRegulatedServiceCodes = [24, 25, 20, 22, 21, 23, 19, 27, 28, 26, 29, 30, 32, 31, 33, 34];

const csvQuote = toCsv => {
  if (toCsv && toCsv.replace(/ /g, '').match(/[\s,"]/)) {
    return '"' + toCsv.replace(/"/g, '""') + '"';
  } else {
    return toCsv;
  }
};

function updateWorkerTotals (totals, worker) {
  const allRoles = worker.otherJobIds;
  if (worker.mainJobRoleId !== null) {
    allRoles.unshift(worker.mainJobRoleId);
  }

  // Is the worker involved in direct care? If any job roles are found that aren't non direct care ones then the worker is involved in direct care
  if (allRoles.findIndex(role => !nonDirectCareJobRoles.includes(role)) !== -1) {
    totals.directCareWorkers++;
  } else {
    totals.managerialProfessionalWorkers++;
  }

  // Is the worker on a permanant contract? Any workers that are not permanant are considered temporary for validation purposes
  if (employedContractStatusIds.includes(worker.contractTypeId)) {
    totals.employedWorkers++;
  } else {
    totals.nonEmployedWorkers++;
  }
}

const _headers_v1 = 'LOCALESTID,STATUS,ESTNAME,ADDRESS1,ADDRESS2,ADDRESS3,POSTTOWN,POSTCODE,ESTTYPE,OTHERTYPE,' +
'PERMCQC,PERMLA,SHARELA,REGTYPE,PROVNUM,LOCATIONID,MAINSERVICE,ALLSERVICES,CAPACITY,UTILISATION,SERVICEDESC,' +
'SERVICEUSERS,OTHERUSERDESC,TOTALPERMTEMP,ALLJOBROLES,STARTERS,LEAVERS,VACANCIES,REASONS,REASONNOS';

class Establishment {
  constructor (currentLine, lineNumber, allCurrentEstablishments) {
    this._currentLine = currentLine;
    this._lineNumber = lineNumber;
    this._allCurrentEstablishments = allCurrentEstablishments;

    this._validationErrors = [];

    // CSV properties
    this._localId = null;
    this._status = null;
    this._key = null;
    this._name = null;
    this._address1 = null;
    this._address2 = null;
    this._address3 = null;
    this._town = null;
    this._postcode = null;

    this._establishmentType = null;
    this._establishmentTypeOther = null;

    this._shareWithCqc = null;
    this._shareWithLA = null;
    this._localAuthorities = null;

    this._regType = null;
    this._provID = null;
    this._locationID = null;

    this._mainService = null;
    this._allServices = null;
    this._allServicesOther = null;
    this._allServiceUsers = null;
    this._allServiceUsersOther = null;
    this._capacities = null;
    this._utilisations = null;

    this._totalPermTemp = null;

    this._alljobs = null;
    this._vacancies = null;
    this._starters = null;
    this._leavers = null;
    this._reasonsForLeaving = null;

    this._id = null;
    this._ignore = false;

    // console.log(`WA DEBUG - current establishment (${this._lineNumber}:`, this._currentLine);
  }

  static get EXPECT_JUST_ONE_ERROR () { return 950; }
  static get MISSING_PRIMARY_ERROR () { return 955; }
  static get CANNOT_DELETE_PRIMARY_ERROR () { return 956; }

  static get NOT_OWNER_ERROR () { return 997; }
  static get DUPLICATE_ERROR () { return 998; }
  static get HEADERS_ERROR () { return 999; }
  static get MAIN_SERVICE_ERROR () { return 1000; }
  static get LOCAL_ID_ERROR () { return 1010; }
  static get STATUS_ERROR () { return 1020; }
  static get STATUS_WARNING () { return 1025; }
  static get NAME_ERROR () { return 1030; }
  static get ADDRESS_ERROR () { return 1040; }
  static get ESTABLISHMENT_TYPE_ERROR () { return 1070; }
  static get SHARE_WITH_ERROR () { return 1070; }
  static get LOCAL_AUTHORITIES_ERROR () { return 1090; }
  static get REGTYPE_ERROR () { return 1100; }
  static get PROV_ID_ERROR () { return 1105; }
  static get LOCATION_ID_ERROR () { return 1110; }
  static get ALL_SERVICES_ERROR () { return 1120; }
  static get SERVICE_USERS_ERROR () { return 1130; }
  static get CAPACITY_UTILISATION_ERROR () { return 1140; }

  static get TOTAL_PERM_TEMP_ERROR () { return 1200; }
  static get ALL_JOBS_ERROR () { return 1280; }
  static get VACANCIES_ERROR () { return 1300; }
  static get STARTERS_ERROR () { return 1310; }
  static get LEAVERS_ERROR () { return 1320; }

  static get REASONS_FOR_LEAVING_ERROR () { return 1360; }

  static get MAIN_SERVICE_WARNING () { return 2000; }
  static get NAME_WARNING () { return 2030; }
  static get ADDRESS_WARNING () { return 2040; }
  static get ESTABLISHMENT_TYPE_WARNING () { return 2070; }
  static get SHARE_WITH_WARNING () { return 2070; }
  static get TOTAL_PERM_TEMP_WARNING () { return 2200; }
  static get LOCAL_AUTHORITIES_WARNING () { return 2090; }
  static get REGTYPE_WARNING () { return 2100; }
  static get PROV_ID_WARNING () { return 2105; }
  static get LOCATION_ID_WARNING () { return 2110; }
  static get ALL_SERVICES_WARNING () { return 2120; }
  static get SERVICE_USERS_WARNING () { return 2130; }
  static get CAPACITY_UTILISATION_WARNING () { return 2140; }
  static get ALL_JOBS_WARNING () { return 2180; }

  static get VACANCIES_WARNING () { return 2300; }
  static get STARTERS_WARNING () { return 2310; }
  static get LEAVERS_WARNING () { return 2320; }

  static get REASONS_FOR_LEAVING_WARNING () { return 2360; }

  get id () {
    if (this._id === null) {
      const est = this._allCurrentEstablishments.find(currentEstablishment => currentEstablishment.key === this._key);

      if (typeof est !== 'undefined') {
        this._id = est._id;
      }
    }

    return this._id;
  }

  static headers () {
    return _headers_v1;
  }

  get headers () {
    return _headers_v1;
  }

  get lineNumber () {
    return this._lineNumber;
  }

  get currentLine () {
    return this._currentLine;
  }

  get localId () {
    return this._localId;
  }

  get key () {
    return this._key;
  }

  get status () {
    return this._status;
  }

  get name () {
    return this._name;
  }

  get address () {
    return this._address;
  }

  get postcode () {
    return this._postcode;
  }

  get establishmentType () {
    return BUDI.establishmentType(BUDI.TO_ASC, this._establishmentType) || this._establishmentType;
  }

  get establishmentTypeId () {
    return this._establishmentType;
  }

  get establishmentTypeOther () {
    return this._establishmentTypeOther;
  }

  get mainService () {
    return this._mainService;
  }

  get allServices () {
    // return a clone of the services array to prevent outside modifications
    return Array.isArray(this._allServices) ? this._allServices.map(x => x) : [];
  }

  get allServicesOther () {
    return this._allServicesOther;
  }

  get allServiceUsers () {
    return this._allServiceUsers;
  }

  get allServiceUsersOther () {
    return this._allServiceUsersOther;
  }

  get capacities () {
    return this._capacities;
  }

  get utilisations () {
    return this._utilisations;
  }

  get shareWithCqc () {
    return this._shareWithCqc;
  }

  get shareWithLa () {
    return this._shareWithLA;
  }

  get localAuthorities () {
    return this._localAuthorities;
  }

  get regType () {
    return this._regType;
  }

  get provId () {
    return this._provID;
  }

  get locationId () {
    return this._locationID;
  }

  get totalPermTemp () {
    return this._totalPermTemp;
  }

  get allJobs () {
    return this._alljobs;
  }

  get vacancies () {
    return this._vacancies;
  }

  get starters () {
    return this._starters;
  }

  get leavers () {
    return this._leavers;
  }

  get reasonsForLeaving () {
    return this._reasonsForLeaving;
  }

  _validateLocalisedId () {
    const myLocalId = this._currentLine.LOCALESTID;

    // must be present and n more than 50 characters
    const MAX_LENGTH = 50;
    let status = true;

    if (myLocalId === null || myLocalId.length === 0) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.LOCAL_ID_ERROR,
        errType: 'LOCAL_ID_ERROR',
        error: 'LOCALESTID has not been supplied',
        source: myLocalId
      });
      status = false;
    } else if (myLocalId.length >= MAX_LENGTH) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.LOCAL_ID_ERROR,
        errType: 'LOCAL_ID_ERROR',
        error: `LOCALESTID is longer than ${MAX_LENGTH} characters`,
        source: myLocalId
      });
      status = false;
    }

    // need the LOCALSTID regardless of whether it has failed validation or not
    this._localId = myLocalId === null || myLocalId.length === 0 ? `SFCROW$${this._lineNumber}` : myLocalId;
    this._key = this._localId.replace(/\s/g, '');

    return status;
  }

  _validateStatus () {
    const statusValues = ['DELETE', 'UPDATE', 'UNCHECKED', 'NOCHANGE', 'NEW'];
    const myStatus = this._currentLine.STATUS ? String(this._currentLine.STATUS).toUpperCase() : this._currentLine.STATUS;

    // must be present and must be one of the preset values (case insensitive)
    if (!this._currentLine.STATUS || this._currentLine.STATUS.length === 0) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.STATUS_ERROR,
        errType: 'STATUS_ERROR',
        error: 'STATUS is blank',
        source: this._currentLine.STATUS,
        name: this._currentLine.LOCALESTID
      });
      return false;
    } if (!statusValues.includes(myStatus)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.STATUS_ERROR,
        errType: 'STATUS_ERROR',
        error: 'The code you have entered for STATUS is incorrect',
        source: this._currentLine.STATUS,
        name: this._currentLine.LOCALESTID
      });
      return false;
    } else {
      // helper which returns true if the given LOCALESTID exists
      const thisEstablishmentId = this.id;

      // we have a known status - now validate the status against the known set of all current establishments
      switch (myStatus) {
        case 'NEW':
          if (thisEstablishmentId !== null) {
            this._validationErrors.push({
              name: this._currentLine.LOCALESTID,
              lineNumber: this._lineNumber,
              errCode: Establishment.STATUS_ERROR,
              errType: 'STATUS_ERROR',
              error: 'Workplace has a STATUS of NEW but already exists, please use one of the other statuses',
              source: myStatus
            });
          }
          break;

        case 'DELETE':
          if (thisEstablishmentId === null) {
            this._validationErrors.push({
              name: this._currentLine.LOCALESTID,
              lineNumber: this._lineNumber,
              errCode: Establishment.STATUS_ERROR,
              errType: 'STATUS_ERROR',
              error: 'Workplace has a status of DELETE but does not exist',
              source: myStatus
            });
          }
          break;

        case 'UNCHECKED':
          if (thisEstablishmentId === null) {
            this._validationErrors.push({
              name: this._currentLine.LOCALESTID,
              lineNumber: this._lineNumber,
              errCode: Establishment.STATUS_ERROR,
              errType: 'STATUS_ERROR',
              error: 'Workplace has a STATUS of UNCHECKED but does not exist, please change to NEW to add it',
              source: myStatus
            });
          }
          break;

        case 'NOCHANGE':
          if (thisEstablishmentId === null) {
            this._validationErrors.push({
              name: this._currentLine.LOCALESTID,
              lineNumber: this._lineNumber,
              errCode: Establishment.STATUS_ERROR,
              errType: 'STATUS_ERROR',
              error: 'Workplace has a STATUS of NOCHANGE but does not exist, please change to NEW to add it',
              source: myStatus
            });
          }
          break;

        case 'UPDATE':
          if (thisEstablishmentId === null) {
            this._validationErrors.push({
              name: this._currentLine.LOCALESTID,
              lineNumber: this._lineNumber,
              errCode: Establishment.STATUS_ERROR,
              errType: 'STATUS_ERROR',
              error: 'Workplace has a STATUS of UPDATE but does not exist, please change to NEW to add it',
              source: myStatus
            });
          }
          break;
      }

      this._status = myStatus;
      return true;
    }
  }

  _validateEstablishmentName () {
    const myName = this._currentLine.ESTNAME;

    // must be present and no more than 120 characters
    const MAX_LENGTH = 120;

    if (!myName || myName.length === 0) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.NAME_ERROR,
        errType: 'NAME_ERROR',
        error: 'ESTNAME has not been supplied',
        source: myName,
        name: this._currentLine.LOCALESTID
      });
      return false;
    } else if (myName.length > MAX_LENGTH) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.NAME_ERROR,
        errType: 'NAME_ERROR',
        error: `ESTNAME is longer than ${MAX_LENGTH} characters`,
        source: myName,
        name: this._currentLine.LOCALESTID
      });
      return false;
    } else {
      this._name = myName;
      return true;
    }
  }

  async _validateAddress () {
    const myAddress1 = this._currentLine.ADDRESS1;
    const myAddress2 = this._currentLine.ADDRESS2;
    const myAddress3 = this._currentLine.ADDRESS3;
    const myTown = this._currentLine.POSTTOWN;
    const myPostcode = this._currentLine.POSTCODE;
    let ignorePostcode = false;

    // TODO - if town is empty, match against PAF

    // adddress 1 is mandatory and no more than 40 characters
    const MAX_LENGTH = 40;
    const postcodeExists = await models.pcodedata.findAll({
      where: {
        postcode: myPostcode
      },
      order: [
        ['uprn', 'ASC']
      ]
    });

    const localValidationErrors = [];
    if (!myAddress1 || myAddress1.length === 0) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.ADDRESS_ERROR,
        errType: 'ADDRESS_ERROR',
        error: 'ADDRESS1 is blank',
        name: this._currentLine.LOCALESTID
      });
    } else if (myAddress1.length > MAX_LENGTH) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.ADDRESS_ERROR,
        errType: 'ADDRESS_ERROR',
        error: `ADDRESS1 is longer than ${MAX_LENGTH} characters`,
        source: myAddress1,
        name: this._currentLine.LOCALESTID
      });
    }

    if (myAddress2 && myAddress2.length > MAX_LENGTH) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.ADDRESS_ERROR,
        errType: 'ADDRESS_ERROR',
        error: `ADDRESS2 is longer than ${MAX_LENGTH} characters`,
        source: myAddress2,
        name: this._currentLine.LOCALESTID
      });
    }

    if (myAddress3 && myAddress3.length > MAX_LENGTH) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.ADDRESS_ERROR,
        errType: 'ADDRESS_ERROR',
        error: `ADDRESS3 is longer than ${MAX_LENGTH} characters`,
        source: myAddress3,
        name: this._currentLine.LOCALESTID
      });
    }

    if (myTown && myTown.length > MAX_LENGTH) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.ADDRESS_ERROR,
        errType: 'ADDRESS_ERROR',
        error: `POSTTOWN is longer than ${MAX_LENGTH} characters`,
        source: myTown,
        name: this._currentLine.LOCALESTID
      });
    }
    // TODO - registration/establishment APIs do not validate postcode (relies on the frontend - this must be fixed)
    const postcodeRegex = /^[A-Za-z]{1,2}[0-9]{1,2}\s{1}[0-9][A-Za-z]{2}$/;
    const POSTCODE_MAX_LENGTH = 10;
    if (!myPostcode || myPostcode.length === 0) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.ADDRESS_ERROR,
        errType: 'ADDRESS_ERROR',
        error: 'POSTCODE has not been supplied',
        source: myPostcode,
        name: this._currentLine.LOCALESTID
      });
    } else if (myPostcode.length > POSTCODE_MAX_LENGTH) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.ADDRESS_ERROR,
        errType: 'ADDRESS_ERROR',
        error: `POSTCODE is longer than ${POSTCODE_MAX_LENGTH} characters`,
        source: myPostcode,
        name: this._currentLine.LOCALESTID
      });
    } else if (!postcodeRegex.test(myPostcode)) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.ADDRESS_ERROR,
        errType: 'ADDRESS_ERROR',
        error: 'POSTCODE is incorrectly formatted',
        source: myPostcode,
        name: this._currentLine.LOCALESTID
      });
    } else if (this._status === 'NEW' && !postcodeExists.length) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.ADDRESS_ERROR,
        errType: 'ADDRESS_ERROR',
        error: 'The Postcode for this workplace cannot be found in our database and must be registered manually.',
        source: myPostcode,
        name: this._currentLine.LOCALESTID
      });
      this._ignore = true;
    } else if (this._status === 'UPDATE' && !postcodeExists.length) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        warnCode: Establishment.ADDRESS_ERROR,
        warnType: 'ADDRESS_ERROR',
        warning: 'The POSTCODE cannot be found in our database and will be ignored.',
        source: myPostcode,
        name: this._currentLine.LOCALESTID
      });
      ignorePostcode = true;
    }

    if (localValidationErrors.length > 0) {
      localValidationErrors.forEach(thisValidation => this._validationErrors.push(thisValidation));
      return false;
    }

    // concatenate the address
    this._address1 = myAddress1;
    this._address2 = myAddress2;
    this._address3 = myAddress3;
    this._town = myTown;
    if (!ignorePostcode) {
      this._postcode = myPostcode;
    }

    return true;
  }

  _validateEstablishmentType () {
    const myEstablishmentType = parseInt(this._currentLine.ESTTYPE, 10);
    const myOtherEstablishmentType = this._currentLine.OTHERTYPE;

    const localValidationErrors = [];
    if (!this._currentLine.ESTTYPE || this._currentLine.ESTTYPE.length === 0) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.ESTABLISHMENT_TYPE_ERROR,
        errType: 'ESTABLISHMENT_TYPE_ERROR',
        error: 'ESTTYPE has not been supplied',
        source: this._currentLine.ESTTYPE,
        name: this._currentLine.LOCALESTID
      });
    } else if (Number.isNaN(myEstablishmentType)) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.ESTABLISHMENT_TYPE_ERROR,
        errType: 'ESTABLISHMENT_TYPE_ERROR',
        error: 'The code you have entered for ESTTYPE is incorrect',
        source: this._currentLine.ESTTYPE,
        name: this._currentLine.LOCALESTID
      });
    } else if (myEstablishmentType < 1 || myEstablishmentType > 8) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.ESTABLISHMENT_TYPE_ERROR,
        errType: 'ESTABLISHMENT_TYPE_ERROR',
        error: 'The code you have entered for ESTTYPE is incorrect',
        source: this._currentLine.ESTTYPE,
        name: this._currentLine.LOCALESTID
      });
    }

    // if the establishment type is "other" (8), then OTHERTYPE must be defined
    const MAX_LENGTH = 240;

    if (myEstablishmentType === 8 && (!myOtherEstablishmentType || myOtherEstablishmentType.length === 0)) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        warnCode: Establishment.ESTABLISHMENT_TYPE_WARNING,
        warnType: 'ESTABLISHMENT_TYPE_WARNING',
        warning: 'OTHERTYPE has not been supplied',
        source: myOtherEstablishmentType,
        name: this._currentLine.LOCALESTID
      });
    } else if (myEstablishmentType === 8 && (myOtherEstablishmentType.length > MAX_LENGTH)) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.ESTABLISHMENT_TYPE_ERROR,
        errType: 'ESTABLISHMENT_TYPE_ERROR',
        error: `OTHERTYPE is longer than ${MAX_LENGTH} characters`,
        source: myOtherEstablishmentType,
        name: this._currentLine.LOCALESTID
      });
    } else if (myEstablishmentType === 8) {
      this._establishmentTypeOther = myOtherEstablishmentType;
    } else if (myEstablishmentType !== 8 && myOtherEstablishmentType && myOtherEstablishmentType.length > 0) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        warnCode: Establishment.ESTABLISHMENT_TYPE_WARNING,
        warnType: 'ESTABLISHMENT_TYPE_WARNING',
        warning: 'OTHERTYPE will be ignored as not required',
        source: myOtherEstablishmentType,
        name: this._currentLine.LOCALESTID
      });
    }

    if (localValidationErrors.length > 0) {
      localValidationErrors.forEach(thisValidation => this._validationErrors.push(thisValidation));
      return false;
    }

    this._establishmentType = myEstablishmentType;
    return true;
  }

  _validateShareWithCQC () {
    const ALLOWED_VALUES = [0, 1];
    const myShareWithCqc = parseInt(this._currentLine.PERMCQC, 10);

    if (!this._currentLine.PERMCQC || this._currentLine.PERMCQC.length === 0) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.SHARE_WITH_ERROR,
        errType: 'SHARE_WITH_ERROR',
        error: 'PERMCQC has not been supplied',
        source: this._currentLine.PERMCQC,
        name: this._currentLine.PERMCQC
      });
      return false;
    } else if (Number.isNaN(myShareWithCqc)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.SHARE_WITH_ERROR,
        errType: 'SHARE_WITH_ERROR',
        error: 'The code you have entered for PERMCQC is incorrect',
        source: this._currentLine.PERMCQC,
        name: this._currentLine.PERMCQC
      });
      return false;
    } else if (!ALLOWED_VALUES.includes(myShareWithCqc)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.SHARE_WITH_ERROR,
        errType: 'SHARE_WITH_ERROR',
        error: 'The code you have entered for PERMCQC is incorrect',
        source: myShareWithCqc,
        name: this._currentLine.PERMCQC
      });
      return false;
    } else {
      this._shareWithCqc = myShareWithCqc;
      return true;
    }
  }

  _validateShareWithLA () {
    const ALLOWED_VALUES = [0, 1];
    const myShareWithLa = parseInt(this._currentLine.PERMLA, 10);

    if (!this._currentLine.PERMLA || this._currentLine.PERMLA.length === 0) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.SHARE_WITH_ERROR,
        errType: 'SHARE_WITH_ERROR',
        error: 'PERMLA has not been supplied',
        source: this._currentLine.PERMLA,
        name: this._currentLine.PERMLA
      });
      return false;
    } else if (Number.isNaN(myShareWithLa)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.SHARE_WITH_ERROR,
        errType: 'SHARE_WITH_ERROR',
        error: 'The code you have entered for PERMLA is incorrect',
        source: this._currentLine.PERMLA,
        name: this._currentLine.PERMLA
      });
      return false;
    } else if (!ALLOWED_VALUES.includes(myShareWithLa)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.SHARE_WITH_ERROR,
        errType: 'SHARE_WITH_ERROR',
        error: 'The code you have entered for PERMLA is incorrect',
        source: myShareWithLa,
        name: this._currentLine.PERMLA
      });
      return false;
    } else {
      this._shareWithLA = myShareWithLa;
      return true;
    }
  }

  _validateLocalAuthorities () {
    // local authorities is optional or is a semi colon delimited list of integers
    if (this._currentLine.SHARELA && this._currentLine.SHARELA.length > 0) {
      const listOfLAs = this._currentLine.SHARELA.split(';');
      const isValid = listOfLAs.every(thisLA => !Number.isNaN(parseInt(thisLA, 10)));

      if (!isValid) {
        this._validationErrors.push({
          lineNumber: this._lineNumber,
          errCode: Establishment.LOCAL_AUTHORITIES_ERROR,
          errType: 'LOCAL_AUTHORITIES_ERROR',
          error: 'An entry for code in SHARELA will be ignored as this is invalid',
          source: this._currentLine.SHARELA,
          name: this._currentLine.LOCALESTID
        });
        return false;
      } else if (this._shareWithLA !== null && this._shareWithLA === 0 && listOfLAs && listOfLAs.length > 0) {
        this._validationErrors.push({
          lineNumber: this._lineNumber,
          errCode: Establishment.LOCAL_AUTHORITIES_WARNING,
          errType: 'LOCAL_AUTHORITIES_WARNING',
          error: 'SHARELAS will be ignored',
          source: this._currentLine.SHARELA,
          name: this._currentLine.LOCALESTID
        });
      } else {
        this._localAuthorities = listOfLAs.map(thisLA => parseInt(thisLA, 10));
        return true;
      }
    } else {
      return true;
    }
  }

  _validateRegType () {
    const myRegType = parseInt(this._currentLine.REGTYPE, 10);
    const dbServiceCode = BUDI.services(BUDI.TO_ASC, this._mainService);
    const dbMainServiceCode = 16;

    if (!this._currentLine.REGTYPE || this._currentLine.REGTYPE.length === 0) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.REGTYPE_ERROR,
        errType: 'REGTYPE_ERROR',
        error: 'REGTYPE has not been supplied',
        source: this._currentLine.REGTYPE,
        name: this._currentLine.LOCALESTID
      });
      return false;
    } else if (Number.isNaN(myRegType) || (myRegType !== 0 && myRegType !== 2)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.REGTYPE_ERROR,
        errType: 'REGTYPE_ERROR',
        error: 'The code you have entered for REGTYPE is incorrect',
        source: this._currentLine.REGTYPE,
        name: this._currentLine.LOCALESTID
      });
      return false;
    } else if(myRegType === 2 &&
      !cqcRegulatedServiceCodes.includes(dbServiceCode) && (dbServiceCode !== dbMainServiceCode)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.REGTYPE_ERROR,
        errType: 'REGTYPE_ERROR',
        error: 'REGTYPE is 2 (CQC) but no CQC regulated services have been specified. Please change either REGTYPE or MAINSERVICE',
        source: this._currentLine.REGTYPE,
        name: this._currentLine.LOCALESTID
      });
      return false;
    } else {
      this._regType = myRegType;
      return true;
    }
  }

  _validateProvID () {
    // must be given if "REGTYPE" is 2 - but if given must be in the format "n-nnnnnnnnn"
    const provIDRegex = /^[0-9]{1}-[0-9]{8,10}$/;
    const myprovID = this._currentLine.PROVNUM;

    if (this._regType === 2 && (!myprovID || myprovID.length === 0)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.PROV_ID_ERROR,
        errType: 'PROV_ID_ERROR',
        error: 'PROVNUM has not been supplied',
        source: myprovID,
        name: this._currentLine.LOCALESTID
      });
      return false;
    } else if (this._regType === 2 && !provIDRegex.test(myprovID)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.PROV_ID_ERROR,
        errType: 'PROV_ID_ERROR',
        error: 'PROVNUM is incorrectly formatted',
        source: myprovID,
        name: this._currentLine.LOCALESTID
      });
      return false;
    } else if (this._regType === 2) {
      this._provID = myprovID;
      return true;
    } else if (this._regType === 0 && myprovID && myprovID.length > 0) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        warnCode: Establishment.PROV_ID_WARNING,
        warnType: 'PROV_ID_WARNING',
        warning: 'PROVNUM will be ignored as not required for this REGTYPE',
        source: myprovID,
        name: this._currentLine.LOCALESTID
      });
      return false;
    }
  }

  async _validateLocationID () {
    try {
      // must be given if "share with CQC" - but if given must be in the format "n-nnnnnnnnn"
      const locationIDRegex = /^[0-9]{1}-[0-9]{8,10}$/;
      const myLocationID = this._currentLine.LOCATIONID;

      // do not use
      const mainServiceIsHeadOffice = parseInt(this._currentLine.MAINSERVICE, 10) === 72;
      const locationExists = await models.establishment.findAll({
        where: {
          locationId: myLocationID
        },
        attributes: ['id', 'locationId']
      });
      let existingEstablishment = false;
      await locationExists.map(async (establishment) => {
        if (establishment.id === this._id) existingEstablishment = true;
      });
      if (this._regType === 2) {
        // ignore location i
        if (!mainServiceIsHeadOffice) {
          if (!myLocationID || myLocationID.length === 0) {
            this._validationErrors.push({
              lineNumber: this._lineNumber,
              errCode: Establishment.LOCATION_ID_ERROR,
              errType: 'LOCATION_ID_ERROR',
              error: 'LOCATIONID has not been supplied',
              source: myLocationID,
              name: this._currentLine.LOCALESTID
            });
            return false;
          } else if (!locationIDRegex.test(myLocationID)) {
            this._validationErrors.push({
              lineNumber: this._lineNumber,
              errCode: Establishment.LOCATION_ID_ERROR,
              errType: 'LOCATION_ID_ERROR',
              error: 'LOCATIONID is incorrectly formatted',
              source: myLocationID,
              name: this._currentLine.LOCALESTID
            });
            return false;
          }
        }
        if (locationExists.length > 0 && !existingEstablishment) {
          this._validationErrors.push({
            lineNumber: this._lineNumber,
            errCode: Establishment.LOCATION_ID_ERROR,
            errType: 'LOCATION_ID_ERROR',
            error: 'LOCATIONID already exists in ASC-WDS please contact Support on 0113 241 0969',
            source: myLocationID,
            name: this._currentLine.LOCALESTID
          });
          return false;
        }

        this._locationID = myLocationID;
        return true;
      } else if (this._regType === 0 && myLocationID && myLocationID.length > 0) {
        this._validationErrors.push({
          lineNumber: this._lineNumber,
          warnCode: Establishment.LOCATION_ID_WARNING,
          warnType: 'LOCATION_ID_WARNING',
          warning: 'LOCATIONID will be ignored as not required for this REGTYPE',
          source: myLocationID,
          name: this._currentLine.LOCALESTID
        });
        return false;
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  _validateMainService () {
    const myMainService = parseInt(this._currentLine.MAINSERVICE, 10);

    if (!this._currentLine.MAINSERVICE || this._currentLine.MAINSERVICE.length === 0) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.MAIN_SERVICE_ERROR,
        errType: 'MAIN_SERVICE_ERROR',
        error: 'MAINSERVICE has not been supplied',
        source: this._currentLine.MAINSERVICE,
        name: this._currentLine.LOCALESTID
      });
      return false;
    } else if (Number.isNaN(myMainService)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.MAIN_SERVICE_ERROR,
        errType: 'MAIN_SERVICE_ERROR',
        error: 'MAINSERVICE has not been supplied',
        source: this._currentLine.MAINSERVICE,
        name: this._currentLine.LOCALESTID
      });
      return false;
    } else {
      this._mainService = myMainService;
      return true;
    }
  }

  _validateAllServices () {
    // all services must have at least one value (main service) or a semi colon delimited list of integers; treat consistently as a list of
    const myAllServices = this._currentLine.ALLSERVICES;

    if (!myAllServices || myAllServices.length === 0) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.ALL_SERVICES_ERROR,
        errType: 'ALL_SERVICES_ERROR',
        error: 'MAINSERVICE is not included in ALLSERVICES',
        source: this._currentLine.ALLSERVICES,
        name: this._currentLine.LOCALESTID
      });

      return false; // no point continuing validation because all services is empty
    }

    // all services and their service descriptions are semi-colon delimited

    const listOfServices = this._currentLine.ALLSERVICES.split(';');
    const listOfServiceDescriptions = this._currentLine.SERVICEDESC.split(';');

    const localValidationErrors = [];
    const isValid = listOfServices.every(thisService => !Number.isNaN(parseInt(thisService, 10)));

    if (!isValid) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.ALL_SERVICES_ERROR,
        errType: 'ALL_SERVICES_ERROR',
        error: 'There is an empty element in ALLSERVICES',
        source: this._currentLine.ALLSERVICES,
        name: this._currentLine.LOCALESTID
      });
    } else if (listOfServices.length !== listOfServiceDescriptions.length) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.ALL_SERVICES_ERROR,
        errType: 'ALL_SERVICES_ERROR',
        error: 'ALLSERVICES/CAPACITY/UTILISATION/SERVICEDESC do not have the same number of items (i.e. numbers and/or semi colons)',
        source: this._currentLine.SERVICEDESC,
        name: this._currentLine.LOCALESTID
      });
    } else {
      const myServiceDescriptions = [];
      this._allServices = listOfServices.map((thisService, index) => {
        const thisServiceIndex = parseInt(thisService, 10);

        // if the service is one of the many "other" type of services, then need to validate the "other description"
        const otherServices = [5, 7, 12, 21, 52, 71, 72, 75]; // these are the original budi codes
        const MAX_LENGTH = 120;
        if (otherServices.includes(thisServiceIndex)) {
          const myServiceOther = listOfServiceDescriptions[index];
          if (myServiceOther.length > MAX_LENGTH) {
            localValidationErrors.push({
              lineNumber: this._lineNumber,
              errCode: Establishment.ALL_SERVICES_ERROR,
              errType: 'ALL_SERVICES_ERROR',
              error: `SERVICEDESC(${index + 1}) is longer than ${MAX_LENGTH} characters`,
              source: `${this._currentLine.SERVICEDESC} - ${listOfServiceDescriptions[index]}`,
              name: this._currentLine.LOCALESTID
            });
          } else {
            myServiceDescriptions.push(listOfServiceDescriptions[index]);
          }
        } else {
          myServiceDescriptions.push(null);
        }

        return thisServiceIndex;
      });

      this._allServicesOther = myServiceDescriptions;
    }

    if (localValidationErrors.length > 0) {
      localValidationErrors.forEach(thisValidation => this._validationErrors.push(thisValidation));
      return false;
    }

    return true;
  }

  _validateServiceUsers () {
    // service user (optional) is a semi colon delimited list of integers

    const listOfServiceUsers = this._currentLine.SERVICEUSERS.split(';');
    const listOfServiceUsersDescriptions = this._currentLine.OTHERUSERDESC.split(';');

    const localValidationErrors = [];
    if (this._currentLine.SERVICEUSERS && this._currentLine.SERVICEUSERS.length > 0) {
      // which is not valid
      const isValid = this._currentLine.SERVICEUSERS.length ? listOfServiceUsers.every(thisService => !Number.isNaN(parseInt(thisService, 10))) : true;
      if (!isValid) {
        localValidationErrors.push({
          lineNumber: this._lineNumber,
          warnCode: Establishment.SERVICE_USERS_WARNING,
          warnType: 'SERVICE_USERS_WARNING',
          warning: 'Entry for code in SERVICEUSERS you have supplied will be ignored as this is invalid',
          source: this._currentLine.SERVICEUSERS,
          name: this._currentLine.LOCALESTID
        });
      } else if (listOfServiceUsers.length !== listOfServiceUsersDescriptions.length) {
        localValidationErrors.push({
          lineNumber: this._lineNumber,
          errCode: Establishment.SERVICE_USERS_ERROR,
          errType: 'SERVICE_USERS_ERROR',
          error: 'SERVICEUSERS/OTHERUSERDESC do not have the same number of items (i.e. numbers and/or semi colons)',
          source: `${this._currentLine.SERVICEUSERS} - ${this._currentLine.OTHERUSERDESC}`,
          name: this._currentLine.LOCALESTID
        });
      } else if (isValid) {
        const myServiceUsersDescriptions = [];
        this._allServiceUsers = listOfServiceUsers.map((thisService, index) => {
          const thisServiceIndex = parseInt(thisService, 10);

          // if the service user is one of the many "other" type of services, then need to validate the "other description"
          const otherServiceUsers = [3, 9, 21]; // these are the original budi codes
          if (otherServiceUsers.includes(thisServiceIndex)) {
            const myServiceUserOther = listOfServiceUsersDescriptions[index];
            const MAX_LENGTH = 120;
            if (!myServiceUserOther || myServiceUserOther.length === 0) {
              localValidationErrors.push({
                lineNumber: this._lineNumber,
                warnCode: Establishment.SERVICE_USERS_WARNING,
                warnType: 'SERVICE_USERS_WARNING',
                warning: `OTHERUSERDESC(${index + 1}) has not been supplied`,
                source: `${this._currentLine.SERVICEDESC} - ${listOfServiceUsersDescriptions[index]}`,
                name: this._currentLine.LOCALESTID
              });
              myServiceUsersDescriptions.push(null);
            } else if (myServiceUserOther.length > MAX_LENGTH) {
              localValidationErrors.push({
                lineNumber: this._lineNumber,
                errCode: Establishment.SERVICE_USERS_ERROR,
                errType: 'SERVICE_USERS_ERROR',
                error: `Service Users (SERVICEUSERS:${index + 1}) is an 'other' service and (OTHERUSERDESC:${index + 1}) must not be greater than ${MAX_LENGTH} characters`,
                source: `${this._currentLine.SERVICEDESC} - ${listOfServiceUsersDescriptions[index]}`,
                name: this._currentLine.LOCALESTID
              });
            } else {
              myServiceUsersDescriptions.push(listOfServiceUsersDescriptions[index]);
            }
          } else {
            myServiceUsersDescriptions.push(null);
          }

          return thisServiceIndex;
        });

        this._allServiceUsersOther = myServiceUsersDescriptions;
      }
    }

    if (localValidationErrors.length > 0) {
      localValidationErrors.forEach(thisValidation => this._validationErrors.push(thisValidation));
      return false;
    }

    return true;
  }

  _validateCapacitiesAndUtilisations () {
    // capacities/utilisations are a semi colon delimited list of integers

    const listOfCapacities = this._currentLine.CAPACITY.split(';');
    const listOfUtilisations = this._currentLine.UTILISATION.split(';');

    const localValidationErrors = [];

    // first - the number of capacities/utilisations must be non-zero and must be equal
    if (listOfCapacities.length === 0) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.CAPACITY_UTILISATION_ERROR,
        errType: 'CAPACITY_UTILISATION_ERROR',
        error: 'Capacities (CAPACITY) must be a semi-colon delimited list of whole numbers',
        source: this._currentLine.CAPACITY,
        name: this._currentLine.LOCALESTID
      });
    }

    if (listOfUtilisations.length === 0) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.CAPACITY_UTILISATION_ERROR,
        errType: 'CAPACITY_UTILISATION_ERROR',
        error: 'Utilisations (UTILISATION) must be a semi-colon delimited list of whole numbers',
        source: this._currentLine.UTILISATION,
        name: this._currentLine.LOCALESTID
      });
    }

    if (listOfCapacities.length !== listOfUtilisations.length) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.CAPACITY_UTILISATION_ERROR,
        errType: 'CAPACITY_UTILISATION_ERROR',
        error: 'Number of Capacities (CAPACITY) and Utilisations (UTILISATION) must be equal',
        source: `${this._currentLine.CAPACITY} - ${this._currentLine.UTILISATION}`,
        name: this._currentLine.LOCALESTID
      });
    }

    // and the number of utilisations/capacities must equal the number of all services
    if (listOfCapacities.length !== (this._allServices ? this._allServices.length : 0)) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.CAPACITY_UTILISATION_ERROR,
        errType: 'CAPACITY_UTILISATION_ERROR',
        error: 'Number of Capacities/Utilisations (CAPACITY/UTILISATION) must equal the number of all services (ALLSERVICES)',
        source: `${this._currentLine.CAPACITY} - ${this._currentLine.UTILISATION} - ${this._currentLine.ALLSERVICES}`,
        name: this._currentLine.LOCALESTID
      });
    }

    // all capacities and all utilisations are integers (if given)
    // capacities and utilisations must be less than 999999999
    const MAX_CAP_UTIL = 9999;

    const areCapacitiesValid = listOfCapacities.every(thisCapacity =>
      thisCapacity === null || thisCapacity.length === 0 || (!Number.isNaN(parseInt(thisCapacity, 10)) && parseInt(thisCapacity, 10) < MAX_CAP_UTIL)
    );

    if (!areCapacitiesValid) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.CAPACITY_UTILISATION_ERROR,
        errType: 'CAPACITY_UTILISATION_ERROR',
        error: `All capacities (CAPACITY) must be whole numbers and less than ${MAX_CAP_UTIL}`,
        source: this._currentLine.CAPACITY,
        name: this._currentLine.LOCALESTID
      });
    }

    const areUtilisationsValid = listOfUtilisations.every(thisUtilisation =>
      thisUtilisation === null || thisUtilisation.length === 0 || (!Number.isNaN(parseInt(thisUtilisation, 10)) && parseInt(thisUtilisation, 10) < MAX_CAP_UTIL)
    );

    if (!areUtilisationsValid) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.CAPACITY_UTILISATION_ERROR,
        errType: 'CAPACITY_UTILISATION_ERROR',
        error: `All utilisations (UTILISATION) must be whole numbers and less than ${MAX_CAP_UTIL}`,
        source: this._currentLine.UTILISATION,
        name: this._currentLine.LOCALESTID
      });
    }

    if (localValidationErrors.length > 0) {
      localValidationErrors.forEach(thisValidation => this._validationErrors.push(thisValidation));
      return false;
    }

    this._capacities = listOfCapacities.map(thisCapacity => {
      const intCapacity = parseInt(thisCapacity, 10);
      if (isNaN(intCapacity)) {
        return null;
      } else {
        return intCapacity;
      }
    });

    this._utilisations = listOfUtilisations.map(thisUtilisation => {
      const intUtilisation = parseInt(thisUtilisation, 10);
      if (isNaN(intUtilisation)) {
        return null;
      } else {
        return intUtilisation;
      }
    });

    return true;
  }

  _validateTotalPermTemp () {
    // mandatory
    const MAX_TOTAL = 999;
    const myTotalPermTemp = parseInt(this._currentLine.TOTALPERMTEMP, 10);
    const HEAD_OFFICE_MAIN_SERVICE = 72;

    if (myTotalPermTemp.length === 0) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.TOTAL_PERM_TEMP_ERROR,
        errType: 'TOTAL_PERM_TEMP_ERROR',
        error: 'TOTALPERMTEMP is missing',
        source: this._currentLine.PERMCQC,
        name: this._currentLine.LOCALESTID
      });
      return false;
    } else if (myTotalPermTemp < 0 || myTotalPermTemp > MAX_TOTAL || Number.isNaN(myTotalPermTemp)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.TOTAL_PERM_TEMP_ERROR,
        errType: 'TOTAL_PERM_TEMP_ERROR',
        error: `TOTALPERMTEMP must be a number from 0 to ${MAX_TOTAL} if this is correct call support on 0113 241 0969`,
        source: myTotalPermTemp,
        name: this._currentLine.LOCALESTID
      });
      return false;
    } else if (this._mainService && this.mainService !== HEAD_OFFICE_MAIN_SERVICE && myTotalPermTemp === 0) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.TOTAL_PERM_TEMP_ERROR,
        errType: 'TOTAL_PERM_TEMP_ERROR',
        error: 'Total Permanent and Temporary (TOTALPERMTEMP) cannot be 0 except when MAINSERVICE is head office',
        source: myTotalPermTemp,
        name: this._currentLine.LOCALESTID
      });
      return false;
    } else {
      this._totalPermTemp = myTotalPermTemp;
      return true;
    }
  }

  getDuplicateLocationError() {
    return {
      origin: 'Establishments',
      lineNumber: this._lineNumber,
      errCode: Establishment.DUPLICATE_ERROR,
      errType: 'DUPLICATE_ERROR',
      error: 'LOCATIONID is not unique',
      source: this._currentLine.LOCATIONID,
      name: this._currentLine.LOCALESTID
    };
  }

  _crossValidateTotalPermTemp (
    csvEstablishmentSchemaErrors,
    { employedWorkers = 0, nonEmployedWorkers = 0 }
  ) {
    const template = {
      origin: 'Establishments',
      lineNumber: this._lineNumber,
      warnCode: Establishment.TOTAL_PERM_TEMP_WARNING,
      warnType: 'TOTAL_PERM_TEMP_WARNING',
      source: this._currentLine.TOTALPERMTEMP,
      name: this._currentLine.LOCALESTID,
    };

    const totalStaff = employedWorkers + nonEmployedWorkers;

    if (this._totalPermTemp !== totalStaff) {
      csvEstablishmentSchemaErrors.unshift(
        Object.assign(template, {
          warning: `TOTALPERMTEMP (Total staff and the number of worker records) does not match`,
        })
      );
    }else if(this._totalPermTemp === totalStaff){
      console.log("------------------------------2-------");
      console.log(this._starters);
      if(this._starters.length >= totalStaff){
        csvEstablishmentSchemaErrors.unshift(
          Object.assign(template, {
            warning: `STARTERS data you have entered does not fall within the expected range please ensure this is correct`,
            warnCode: Establishment.VACANCIES_WARNING,
            warnType: 'VACANCIES_WARNING',
        })
      );
      }
    }

  }

  _validateAllJobs () {
    // optional
    const allJobs = (this._currentLine.ALLJOBROLES) ? this._currentLine.ALLJOBROLES.split(';') : [];
    const localValidationErrors = [];
    const vacancies = this._currentLine.VACANCIES.split(';');
    const starters = this._currentLine.STARTERS.split(';');
    const leavers = this._currentLine.LEAVERS.split(';');
    const myRegType = parseInt(this._currentLine.REGTYPE, 10);

    const regManager = 4;
    const isCQCRegulated = myRegType === 2;

    const hasRegisteredManagerVacancy =() => {
      let regManagerVacancies = 0;
      allJobs.map((job, index) => {
        if (parseInt(job, 10) === regManager && parseInt(vacancies[index], 10) > 0) regManagerVacancies++;
      });
      return regManagerVacancies > 0;
    };

    // allJobs can only be empty, if TOTALPERMTEMP is 0
    if (!this._currentLine.ALLJOBROLES || this._currentLine.ALLJOBROLES.length === 0) {
      if(
        [].
        concat(vacancies).
        concat(starters).
        concat(leavers).
        findIndex(item => {
          item = parseInt(item, 10);

          return Number.isInteger(item) && item > 0 && item !== 999
        }) !== -1
      ) {
        localValidationErrors.push({
          lineNumber: this._lineNumber,
          errCode: Establishment.ALL_JOBS_ERROR,
          errType: 'ALL_JOBS_ERROR',
          error: 'ALLJOBROLES cannot be blank as you have STARTERS, LEAVERS, VACANCIES greater than zero',
          source: this._currentLine.ALLJOBROLES,
          name: this._currentLine.LOCALESTID
        });
      }
    } else if (this._currentLine.ALLJOBROLES && this._currentLine.ALLJOBROLES.length > 0) {
      // all jobs are integers
      const isValid = allJobs.every(thisJob => !Number.isNaN(parseInt(thisJob, 10)));
      if (!isValid) {
        localValidationErrors.push({
          lineNumber: this._lineNumber,
          errCode: Establishment.ALL_JOBS_ERROR,
          errType: 'ALL_JOBS_ERROR',
          error: 'All Job Roles (ALLJOBROLES) must be whole numbers',
          source: this._currentLine.ALLJOBROLES,
          name: this._currentLine.LOCALESTID
        });
      }
      if (!isCQCRegulated && hasRegisteredManagerVacancy()) {
        localValidationErrors.push({
          lineNumber: this._lineNumber,
          warnCode: Establishment.ALL_JOBS_WARNING,
          warnType: 'ALL_JOBS_WARNING',
          warning: 'Vacancy for Registered Manager should not be included for this service and will be ignored',
          source: this._currentLine.ALLJOBROLES,
          name: this._currentLine.LOCALESTID
        });
      }
    }

    // Need to add if they currently have a registered manager
    // if (this._currentLine.ALLJOBROLES && this._currentLine.ALLJOBROLES.length > 0 && isCQCRegulated && !hasRegisteredManagerVacancy()) {
    //   localValidationErrors.push({
    //     lineNumber: this._lineNumber,
    //     errCode: Establishment.ALL_JOBS_ERROR,
    //     errType: 'ALL_JOBS_ERROR',
    //     error: 'You do not have a staff record for a Registered Manager therefore must record a vacancy for one',
    //     source: this._currentLine.ALLJOBROLES,
    //     name: this._currentLine.LOCALESTID
    //   });
    // }
    if (localValidationErrors.length > 0) {
      localValidationErrors.forEach(thisValidation => this._validationErrors.push(thisValidation));
      return false;
    }

    this._alljobs = allJobs.map(thisJob => parseInt(thisJob, 10));

    return true;
  }

  _crossValidateAllJobRoles (
    csvEstablishmentSchemaErrors,
    registeredManager
    )
    {
    const template = {
      origin: 'Establishments',
      lineNumber: this._lineNumber,
      errCode: Establishment.ALL_JOBS_ERROR,
      errType: 'ALL_JOBS_ERROR',
      source: this._currentLine.ALLJOBROLES,
      name: this._currentLine.LOCALESTID
    };
    const allJobs = this._currentLine.ALLJOBROLES.split(';');
    const vacancies = this._currentLine.VACANCIES.split(';');
    const myRegType = parseInt(this._currentLine.REGTYPE, 10);

    const regManager = 4;
    const isCQCRegulated = myRegType === 2;

    const hasRegisteredManagerVacancy =() => {
      let regManagerVacancies = 0;
      allJobs.map((job, index) => {
        if (parseInt(job, 10) === regManager && parseInt(vacancies[index], 10) > 0) regManagerVacancies++;
      });
      return regManagerVacancies > 0;
    };

    if(isCQCRegulated && !hasRegisteredManagerVacancy() && registeredManager === 0) {
      csvEstablishmentSchemaErrors.unshift(Object.assign(template, {
        error: 'You do not have a staff record for a Registered Manager therefore must record a vacancy for one'
      }));
    }
  }

  // includes perm, temp, pool, agency, student, voluntary and other counts
  // includes vacancies, starters and leavers, total vacancies, total starters and total leavers
  _validateJobRoleTotals () {
    // mandatory
    const vacancies = this._currentLine.VACANCIES.split(';');
    const starters = this._currentLine.STARTERS.split(';');
    const leavers = this._currentLine.LEAVERS.split(';');

    const localValidationErrors = [];
    const allJobsCount = this._alljobs ? this._alljobs.length : 0;

    if (allJobsCount === 0) {
      // no jobs defined, so ignore starters, leavers and vacancies
      return true;
    }

    // all counts must have the same number of entries as all job roles
    //  - except starters, leavers and vacancies can be a single value of 999
    const DONT_KNOW = '999'; // MUST BE A STRING VALUE!!!!!

    if (!((vacancies.length === 1 && vacancies[0] === DONT_KNOW) || (vacancies.length === allJobsCount))) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.VACANCIES_ERROR,
        errType: 'VACANCIES_ERROR',
        error: 'Vacancies (VACANCIES) does not correlate to All Job Roles (ALLJOBROLES); must have same number of semi colon delimited values',
        source: `${this._currentLine.VACANCIES} - ${this._currentLine.ALLJOBROLES}`,
        name: this._currentLine.LOCALESTID
      });
    }

    if (!((starters.length === 1 && starters[0] === DONT_KNOW) || (starters.length === allJobsCount))) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.STARTERS_ERROR,
        errType: 'STARTERS_ERROR',
        error: 'Starters (STARTERS) does not correlate to All Job Roles (ALLJOBROLES); must have same number of semi colon delimited values',
        source: `${this._currentLine.STARTERS} - ${this._currentLine.ALLJOBROLES}`,
        name: this._currentLine.LOCALESTID
      });
    }

    if (!((leavers.length === 1 && leavers[0] === DONT_KNOW) || (leavers.length === allJobsCount))) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.LEAVERS_ERROR,
        errType: 'LEAVERS_ERROR',
        error: 'Leavers (LEAVERS) does not correlate to All Job Roles (ALLJOBROLES); must have same number of semi colon delimited values',
        source: `${this._currentLine.LEAVERS} - ${this._currentLine.ALLJOBROLES}`,
        name: this._currentLine.LOCALESTID
      });
    }

    // all counts must be integers and greater than/equal to zero
    const MIN_COUNT = 0;
    const MAX_COUNT = 999999999;

    if (!vacancies.every(thisCount => !Number.isNaN(parseInt(thisCount, 10)) && parseInt(thisCount, 10) >= MIN_COUNT && parseInt(thisCount, 10) <= MAX_COUNT)) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.VACANCIES_ERROR,
        errType: 'VACANCIES_ERROR',
        error: `Vacancies (VACANCIES) values must be whole numbers and ${MIN_COUNT} or more but less than ${MAX_COUNT}`,
        source: `${this._currentLine.VACANCIES}`,
        name: this._currentLine.LOCALESTID
      });
    }

    if (!starters.every(thisCount => !Number.isNaN(parseInt(thisCount, 10)) && parseInt(thisCount, 10) >= MIN_COUNT && parseInt(thisCount, 10) <= MAX_COUNT)) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.STARTERS_ERROR,
        errType: 'STARTERS_ERROR',
        error: `Starters (STARTERS) values must be whole numbers and ${MIN_COUNT} or more but less than ${MAX_COUNT}`,
        source: `${this._currentLine.STARTERS}`,
        name: this._currentLine.LOCALESTID
      });
    }

    if (!leavers.every(thisCount => !Number.isNaN(parseInt(thisCount, 10)) && parseInt(thisCount, 10) >= MIN_COUNT && parseInt(thisCount, 10) <= MAX_COUNT)) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.LEAVERS_ERROR,
        errType: 'LEAVERS_ERROR',
        error: `Leavers (LEAVERS) values must be whole numbers and ${MIN_COUNT} or more but less than ${MAX_COUNT}`,
        source: `${this._currentLine.LEAVERS}`,
        name: this._currentLine.LOCALESTID
      });
    }

    if (localValidationErrors.length > 0) {
      localValidationErrors.forEach(thisValidation => this._validationErrors.push(thisValidation));
      return false;
    }

    this._vacancies = vacancies.map(thisCount => parseInt(thisCount, 10));
    this._starters = starters.map(thisCount => parseInt(thisCount, 10));
    this._leavers = leavers.map(thisCount => parseInt(thisCount, 10));

    // remove RM vacancy
    if (this._allJobs && this._allJobs.length) {
      this._allJobs.map((job, index) => {
        if (job === regManager && this._vacancies[index] > 0) this._vacancies[index] = 0;
      });
    }

    if (localValidationErrors.length > 0) {
      localValidationErrors.forEach(thisValidation => this._validationErrors.push(thisValidation));
      return false;
    }

    return true;
  }

  _validateReasonsForLeaving () {
    // only if the sum of "LEAVERS" is greater than 0
    const sumOfLeavers = this._leavers && Array.isArray(this._leavers) && this._leavers[0] !== 999 ? this._leavers.reduce((total, thisCount) => total + thisCount) : 0;

    if (sumOfLeavers > 0 && this._currentLine.REASONS && this._currentLine.REASONS.length > 0) {
      const allReasons = this._currentLine.REASONS.split(';');
      const allReasonsCounts = this._currentLine.REASONNOS.split(';');

      const localValidationErrors = [];

      if (!allReasons.every(thisCount => !Number.isNaN(parseInt(thisCount, 10)))) {
        localValidationErrors.push({
          lineNumber: this._lineNumber,
          errCode: Establishment.REASONS_FOR_LEAVING_ERROR,
          errType: 'REASONS_FOR_LEAVING_ERROR',
          error: 'The REASONS you have supplied has an incorrect code',
          source: `${this._currentLine.REASONS}`,
          name: this._currentLine.LOCALESTID
        });
      }

      if (!allReasonsCounts || allReasonsCounts.length === 0) {
        localValidationErrors.push({
          lineNumber: this._lineNumber,
          errCode: Establishment.REASONS_FOR_LEAVING_ERROR,
          errType: 'REASONS_FOR_LEAVING_ERROR',
          error: 'REASONS/REASONNOS do not have the same number of items (i.e. numbers and/or semi colons)',
          source: this._currentLine.REASONNOS,
          name: this._currentLine.LOCALESTID
        });
      }

      const MIN_COUNT = 0;

      if (!allReasonsCounts.every(thisCount => !Number.isNaN(parseInt(thisCount, 10)) || parseInt(thisCount, 10) < MIN_COUNT)) {
        localValidationErrors.push({
          lineNumber: this._lineNumber,
          errCode: Establishment.REASONS_FOR_LEAVING_ERROR,
          errType: 'REASONS_FOR_LEAVING_ERROR',
          error: `Reasons for Leaving Counts (REASONNOS) values must be whole numbers and ${MIN_COUNT} or more`,
          source: `${this._currentLine.REASONNOS}`,
          name: this._currentLine.LOCALESTID
        });
      }

      // all reasons and all reasons counts must be equal in number
      if (allReasons.length !== allReasonsCounts.length) {
        localValidationErrors.push({
          lineNumber: this._lineNumber,
          errCode: Establishment.REASONS_FOR_LEAVING_ERROR,
          errType: 'REASONS_FOR_LEAVING_ERROR',
          error: 'REASONS/REASONNOS do not have the same number of items (i.e. numbers and/or semi colons)',
          source: `${this._currentLine.REASON} - ${this._currentLine.REASONNOS}`,
          name: this._currentLine.LOCALESTID
        });
      }

      // sum of  all reasons counts must equal the sum of leavers
      const sumOfReasonsCounts = allReasonsCounts.reduce((total, thisCount) => parseInt(total, 10) + parseInt(thisCount, 10));

      if (sumOfReasonsCounts !== sumOfLeavers) {
        localValidationErrors.push({
          lineNumber: this._lineNumber,
          errCode: Establishment.REASONS_FOR_LEAVING_ERROR,
          errType: 'REASONS_FOR_LEAVING_ERROR',
          error: 'The total number of REASONNOS you have entered does not equal the total number of LEAVERS',
          source: `${this._currentLine.REASONNOS} (${sumOfReasonsCounts}) - ${this._currentLine.LEAVERS} (${sumOfLeavers})`,
          name: this._currentLine.LOCALESTID
        });
      }

      if (localValidationErrors.length > 0) {
        localValidationErrors.forEach(thisValidation => this._validationErrors.push(thisValidation));
        return false;
      }

      this._reasonsForLeaving = allReasons.map((thisReason, index) => {
        return {
          id: parseInt(thisReason, 10),
          count: parseInt(allReasonsCounts[index], 10)
        };
      });

      return true;
    } else {
      return true;
    }
  }

  _transformMainService () {
    if (this._mainService) {
      const mappedService = BUDI.services(BUDI.TO_ASC, this._mainService);

      if (mappedService) {
        // main service can have an "other" description. That "other" description is
        //  given by _allServiceUsersOther, based on the position index of this main service
        //  within _allServices
        const positionOfMainService = this._allServices ? this._allServices.indexOf(this._mainService) : -1;

        let mainServiceOther = null;
        if (positionOfMainService > -1) {
          mainServiceOther = this._allServicesOther[positionOfMainService];
        }
        this._mainService = {
          id: mappedService,
          other: mainServiceOther || undefined
        };
      } else {
        this._validationErrors.push({
          lineNumber: this._lineNumber,
          errCode: Establishment.MAIN_SERVICE_ERROR,
          errType: 'MAIN_SERVICE_ERROR',
          error: 'The code you have entered for MAINSERVICE is incorrect',
          source: this._currentLine.MAINSERVICE,
          name: this._currentLine.LOCALESTID
        });
      }
    }
  }

  _transformAllServices () {
    if (this._allServices && Array.isArray(this._allServices)) {
      const mappedServices = [];

      this._allServices.forEach(thisService => {
        const thisMappedService = BUDI.services(BUDI.TO_ASC, thisService);

        if (thisMappedService) {
          mappedServices.push(thisMappedService);
        } else {
          this._validationErrors.push({
            lineNumber: this._lineNumber,
            errCode: Establishment.ALL_SERVICES_ERROR,
            errType: 'ALL_SERVICES_ERROR',
            error: `All Services (ALLSERVICES): ${thisService} is unknown`,
            source: this._currentLine.ALLSERVICES,
            name: this._currentLine.LOCALESTID
          });
        }
      });

      this._allServices = mappedServices;
    }
  }

  _transformServiceUsers () {
    if (this._allServiceUsers && Array.isArray(this._allServiceUsers)) {
      const mappedServices = [];

      this._allServiceUsers.forEach(thisService => {
        const thisMappedService = BUDI.serviceUsers(BUDI.TO_ASC, thisService);

        if (thisMappedService) {
          mappedServices.push(thisMappedService);
        } else {
          this._validationErrors.push({
            lineNumber: this._lineNumber,
            warnCode: Establishment.SERVICE_USERS_ERROR,
            warnType: 'SERVICE_USERS_ERROR',
            warning: `Entry for code ${thisService} in SERVICEUSERS will be ignored as this is invalid`,
            source: this._currentLine.SERVICEUSERS,
            name: this._currentLine.LOCALESTID
          });
        }
      });

      this._allServiceUsers = mappedServices;
    }
  }

  _transformEstablishmentType () {
    // integer in source; enum in target
    if (this._establishmentType) {
      if (BUDI.establishmentType(BUDI.TO_ASC, this._establishmentType) === null) {
        this._validationErrors.push({
          lineNumber: this._lineNumber,
          errCode: Establishment.ESTABLISHMENT_TYPE_ERROR,
          errType: 'ESTABLISHMENT_TYPE_ERROR',
          error: `Establishment Type (ESTTYPE): ${this._establishmentType} is unknown`,
          source: this._currentLine.ESTTYPE,
          name: this._currentLine.LOCALESTID
        });
      }
    }
  }

  _transformLocalAuthorities () {
    // integer in source; object in target comprised of CSSR ID and CSSR Name
    if (this._localAuthorities && Array.isArray(this._localAuthorities)) {
      const mappedAuthorities = [];

      this._localAuthorities.forEach(thisLA => {
        const mappedAuthority = BUDI.localAuthority(BUDI.TO_ASC, thisLA);

        if (mappedAuthority) {
          mappedAuthorities.push(mappedAuthority);
        } else {
          this._validationErrors.push({
            lineNumber: this._lineNumber,
            errCode: Establishment.LOCAL_AUTHORITIES_ERROR,
            errType: 'LOCAL_AUTHORITIES_ERROR',
            error: `The code ${thisLA} in SHARELA will be ignored as this is invalid`,
            source: this._currentLine.SHARELA,
            name: this._currentLine.LOCALESTID
          });
        }
      });

      this._localAuthorities = mappedAuthorities;
    }
  }

  _transformAllCapacities () {
    if (this._capacities && Array.isArray(this._capacities)) {
      const mappedCapacities = [];

      // capacities start out as a positional array including nulls
      //  where the position of the capacity correlates to the service (id) in the same
      //  position in _allServices
      this._capacities.forEach((thisCapacity, index) => {
        // we're only interested in non null capacities to map
        if (thisCapacity !== null) {
          // we need to map from service id to service capacity id
          const thisMappedCapacity = BUDI.capacity(BUDI.TO_ASC, this._allServices[index]);

          if (thisMappedCapacity) {
            mappedCapacities.push({
              questionId: thisMappedCapacity,
              answer: thisCapacity
            });
          } else {
            this._validationErrors.push({
              lineNumber: this._lineNumber,
              errCode: Establishment.CAPACITY_UTILISATION_ERROR,
              errType: 'CAPACITY_UTILISATION_ERROR',
              error: `Capacities (CAPACITY): position ${index + 1} is unexpected capacity (no expected capacity for given service: ${thisMappedCapacity})`,
              source: this._currentLine.CAPACITY,
              name: this._currentLine.LOCALESTID
            });
          }
        }
      });

      this._capacities = mappedCapacities;
    }
  }

  _transformAllUtilisation () {
    if (this._utilisations && Array.isArray(this._utilisations)) {
      const mappedUtilisations = [];

      // utilsiations start out as a positional array including nulls
      //  where the position of the capacity correlates to the service (id) in the same
      //  position in _allServices
      this._utilisations.forEach((thisUtilisation, index) => {
        // we're only interested in non null utilisations to map
        if (thisUtilisation !== null) {
          // we need to map from service id to service capacity id
          const serviceType = this._allServices[index];
          const thisMappedUtilisation = BUDI.utilisation(BUDI.TO_ASC, serviceType);

          if (thisMappedUtilisation) {
            mappedUtilisations.push({
              questionId: thisMappedUtilisation,
              answer: thisUtilisation
            });
          } else {
            this._validationErrors.push({
              lineNumber: this._lineNumber,
              errCode: Establishment.CAPACITY_UTILISATION_ERROR,
              errType: 'CAPACITY_UTILISATION_ERROR',
              error: `UTILISATION for SERVICETYPE ${serviceType} will be ignored as it is not required for this service`,
              source: this._currentLine.UTILISATION,
              name: this._currentLine.LOCALESTID
            });
          }
        }
      });

      this._utilisations = mappedUtilisations;
    }
  }

  _transformAllJobs () {
    if (this._alljobs && Array.isArray(this._alljobs)) {
      const mappedJobs = [];

      this._alljobs.forEach(thisJob => {
        const thisMappedJob = BUDI.jobRoles(BUDI.TO_ASC, thisJob);

        if (thisMappedJob) {
          mappedJobs.push(thisMappedJob);
        } else {
          this._validationErrors.push({
            lineNumber: this._lineNumber,
            errCode: Establishment.ALL_JOBS_ERROR,
            errType: 'ALL_JOBS_ERROR',
            error: 'The code you have entered for ALLJOBROLES is incorrect',
            source: this._currentLine.ALLJOBROLES,
            name: this._currentLine.LOCALESTID
          });
        }
      });

      this._alljobs = mappedJobs;
    }
  }

  // returns true if all given job counts are 0; otherwise returns false
  _jobsAllZeros (jobs) {
    if (jobs && Array.isArray(jobs)) {
      return jobs.every(thisJob => thisJob === 0);
    } else {
      return false;
    }
  }

  _transformAllVacanciesStartersLeavers () {
    // vacancies, starters and leavers is either an array of counts against positional indexes to _allJobs
    //  or a single value of 999

    // if a single value of 999, then map to "Don't know"
    // if a full set of 0 (e.g. 0, or 0;0 or 0;0;0, ...), then map to "None"
    const DONT_KNOW = 999;

    if (this._jobsAllZeros(this._vacancies)) {
      this._vacancies = 'None';
    } else if (this._vacancies && this._vacancies.length === 1 && this._vacancies[0] === DONT_KNOW) {
      this._vacancies = 'Don\'t know';
    } else if (this._vacancies && Array.isArray(this._vacancies)) {
      this._vacancies = this._vacancies
        .map((thisJob, index) => {
          return {
            jobId: this._alljobs[index],
            total: thisJob
          };
        })
        .filter(thisJob => thisJob.total !== 0);
    }

    if (this._jobsAllZeros(this._starters)) {
      this._starters = 'None';
    } else if (this._starters && this._starters.length === 1 && this._starters[0] === DONT_KNOW) {
      this._starters = 'Don\'t know';
    } else if (this._starters && Array.isArray(this._starters)) {
      this._starters = this._starters
        .map((thisJob, index) => {
          return {
            jobId: this._alljobs[index],
            total: thisJob
          };
        })
        .filter(thisJob => thisJob.total !== 0);
    }

    if (this._jobsAllZeros(this._leavers)) {
      this._leavers = 'None';
    } else if (this._leavers && this._leavers.length === 1 && this._leavers[0] === DONT_KNOW) {
      this._leavers = 'Don\'t know';
    } else if (this._leavers && Array.isArray(this._leavers)) {
      this._leavers = this._leavers
        .map((thisJob, index) => {
          return {
            jobId: this._alljobs[index],
            total: thisJob
          };
        })
        .filter(thisJob => thisJob.total !== 0);
    }
  }

  _transformReasonsForLeaving () {
    if (this._reasonsForLeaving && Array.isArray(this._reasonsForLeaving)) {
      const mappedReasons = [];

      this._reasonsForLeaving.forEach(thisReason => {
        const thisMappedReason = {
          id: BUDI.reasonsForLeaving(BUDI.TO_ASC, thisReason.id),
          count: thisReason.count
        };

        if (thisMappedReason.id) {
          mappedReasons.push(thisMappedReason);
        } else {
          this._validationErrors.push({
            lineNumber: this._lineNumber,
            errCode: Establishment.REASONS_FOR_LEAVING_ERROR,
            errType: 'REASONS_FOR_LEAVING_ERROR',
            error: `Reason for Leaving (REASONS): ${thisReason.id} is unknown`,
            source: this._currentLine.REASONS,
            name: this._currentLine.LOCALESTID
          });
        }
      });

      this._reasonsForLeaving = mappedReasons;
    }
  }

  preValidate (headers) {
    return this._validateHeaders(headers);
  }

  static isContent (data) {
    const contentRegex = /LOCALESTID,STATUS,ESTNAME,ADDRESS1,ADDRESS2,ADDRES/;
    return contentRegex.test(data.substring(0, 50));
  }

  _validateHeaders (headers) {
    // only run once for first line, so check _lineNumber
    if (_headers_v1 !== headers) {
      this._validationErrors.push({
        lineNumber: 1,
        errCode: Establishment.HEADERS_ERROR,
        errType: 'HEADERS_ERROR',
        error: `Establishment headers (HEADERS) can contain, ${_headers_v1.split(',')}`,
        source: headers,
        name: this._currentLine.LOCALESTID
      });
      return false;
    }
    return true;
  }

  // add a duplicate validation error to the current set
  addDuplicate (originalLineNumber) {
    return {
      origin: 'Establishments',
      lineNumber: this._lineNumber,
      errCode: Establishment.DUPLICATE_ERROR,
      errType: 'DUPLICATE_ERROR',
      error: 'LOCALESTID is not unique',
      source: this._currentLine.LOCALESTID,
      name: this._currentLine.LOCALESTID
    };
  }

  // add a duplicate validation error to the current set
  addNotOwner () {
    return {
      origin: 'Establishments',
      lineNumber: this._lineNumber,
      errCode: Establishment.NOT_OWNER_ERROR,
      errType: 'NOT_OWNER_ERROR',
      error: 'Not the owner',
      source: this._currentLine.LOCALESTID,
      name: this._currentLine.LOCALESTID
    };
  }

  static justOneEstablishmentError () {
    return {
      origin: 'Establishments',
      lineNumber: 1,
      errCode: Establishment.EXPECT_JUST_ONE_ERROR,
      errType: 'EXPECT_JUST_ONE_ERROR',
      error: 'Expect just one establishment',
      source: ''
    };
  }

  static missingPrimaryEstablishmentError (name) {
    return {
      origin: 'Establishments',
      lineNumber: 1,
      errCode: Establishment.MISSING_PRIMARY_ERROR,
      errType: 'MISSING_PRIMARY_ERROR',
      error: `Missing the primary establishment: ${name}`,
      source: '',
      name
    };
  }

  static cannotDeletePrimaryEstablishmentError (name) {
    return {
      origin: 'Establishments',
      lineNumber: 1,
      errCode: Establishment.CANNOT_DELETE_PRIMARY_ERROR,
      errType: 'CANNOT_DELETE_PRIMARY_ERROR',
      error: `STATUS cannot be DELETE for primary establishment: ${name}`,
      source: '',
      name
    };
  }

  // returns true on success, false is any attribute of Establishment fails
  async validate () {
    this._validateLocalisedId();
    this._validateEstablishmentName();
    this._validateStatus();

    // if the status is unchecked or deleted, then don't continue validation
    if (!STOP_VALIDATING_ON.includes(this._status)) {
      await this._validateAddress();
      this._validateEstablishmentType();

      this._validateShareWithCQC();
      this._validateShareWithLA();
      this._validateLocalAuthorities();

      this._validateMainService();
      this._validateRegType();
      this._validateProvID();
      await this._validateLocationID();

      this._validateAllServices();
      this._validateServiceUsers();
      this._validateCapacitiesAndUtilisations();

      this._validateTotalPermTemp();
      this._validateAllJobs();
      this._validateJobRoleTotals();

      this._validateReasonsForLeaving();
    }

    return this.validationErrors.length === 0;
  }

  // Adds items to csvEstablishmentSchemaErrors if validations that depend on
  // worker totals give errors or warnings
  async crossValidate ({
    csvEstablishmentSchemaErrors,
    myWorkers,
    fetchMyEstablishmentsWorkers
  }) {
    // if establishment isn't being added or updated then exit early
    if (!(['NEW', 'UPDATE', 'NOCHANGE'].includes(this._status))) {
      return;
    }

    const totals = {
      directCareWorkers: 0,
      managerialProfessionalWorkers: 0,
      employedWorkers: 0,
      nonEmployedWorkers: 0
    };

    let registeredManagers = 0;

    // ignoreDBWorkers is used as a hashmap of workers that are being modified
    // as part of this bulk upload process. It allows us to prevent a worker's
    // details
    // being counted twice in the totals if is being modified at the same as
    // the establishment
    // i.e. ignore the worker record that comes back from the database result set.
    const ignoreDBWorkers = Object.create(null);
    myWorkers.forEach(worker => {
      if (this.key === worker.establishmentKey) {
        switch (worker.status) {
          case 'NEW':
          case 'UPDATE': {
            /* update totals */
            updateWorkerTotals(totals, worker);
            if (worker.mainJobRoleId === 4) {
              registeredManagers++;
            } else {
              worker.otherJobIds.map(otherJobId => {
                otherJobId === 4 ? registeredManagers++ : null;
              });
            }
          }
          /* fall through */

          case 'DELETE':
            ignoreDBWorkers[worker.uniqueWorker] = true;
            break;
        }
      }
    });

    // get all the other records that may already exist in the db but aren't being updated or deleted
    // and check how many registered managers there is
    (await fetchMyEstablishmentsWorkers(this.id, this._key))
      .forEach(worker => {
        worker.contractTypeId = BUDI.contractType(BUDI.FROM_ASC, worker.contractTypeId);
        worker.otherJobIds = worker.otherJobIds.length ? worker.otherJobIds.split(';') : [];

        // if a record is updated or deleted it can't count towards the totals twice
        if (!hasProp(ignoreDBWorkers, worker.uniqueWorker)) {
        // update totals
          updateWorkerTotals(totals, worker);
        }
      });

    this._crossValidateTotalPermTemp(csvEstablishmentSchemaErrors, totals);
    this._crossValidateAllJobRoles(csvEstablishmentSchemaErrors, registeredManagers);
  }

  // returns true on success, false is any attribute of Establishment fails
  transform () {
    // if the status is unchecked or deleted, then don't transform
    if (!STOP_VALIDATING_ON.includes(this._status)) {
      let status = true;

      status = !this._transformMainService() ? false : status;
      status = !this._transformEstablishmentType() ? false : status;
      status = !this._transformLocalAuthorities() ? false : status;
      status = !this._transformAllServices() ? false : status;
      status = !this._transformServiceUsers() ? false : status;
      status = !this._transformAllJobs() ? false : status;
      // status = !this._transformReasonsForLeaving() ? false : status;        // interim solution - not transforming reasons for leaving
      status = !this._transformAllCapacities() ? false : status;
      status = !this._transformAllUtilisation() ? false : status;
      status = !this._transformAllVacanciesStartersLeavers() ? false : status;

      return status;
    } else {
      return true;
    }
  }

  toJSON () {
    return {
      status: this._status,
      name: this._name,
      address1: this._address1,
      address2: this._address2,
      address3: this._address3,
      town: this._town,
      postcode: this._postcode,
      employerType: this.establishmentType,
      employerTypeOther: this._establishmentTypeOther ? this._establishmentTypeOther : undefined,
      shareWithCQC: this._shareWithCqc,
      shareWithLA: this._shareWithLA,
      localAuthorities: this._localAuthorities ? this._localAuthorities : undefined,
      regType: this._regType,
      locationId: this._regType ? this._locationID : undefined,
      provId: this._regType ? this._provID : undefined,
      mainService: this._mainService,
      allServices: this._allServices ? this._allServices.map((thisService, index) => {
        const returnThis = {
          id: thisService
        };

        if (this._allServicesOther[index]) {
          returnThis.other = this._allServicesOther[index];
        }

        return returnThis;
      }) : undefined,
      serviceUsers: this._allServiceUsers ? this._allServiceUsers.map((thisService, index) => {
        const returnThis = {
          id: thisService
        };

        if (this._allServiceUsersOther[index]) {
          returnThis.other = this._allServiceUsersOther[index];
        }

        return returnThis;
      }) : undefined,
      capacities: this._capacities,
      utilisations: this._utilisations,
      totalPermTemp: this._totalPermTemp,

      allJobs: this._alljobs,
      counts: {
        vacancies: this._vacancies,
        starters: this._starters,
        leavers: this._leavers,
        reasonsForLeaving: this._reasonsForLeaving ? this._reasonsForLeaving : undefined
      }
    };
  }

  get validationErrors () {
    // include the "origin" of validation error
    return this._validationErrors.map(thisValidation => {
      return {
        origin: 'Establishments',
        ...thisValidation
      };
    });
  }

  // returns an API representation of this Establishment
  toAPI () {
    const fixedProperties = {
      Address1: this._address1 ? this._address1 : '',
      Address2: this._address2 ? this._address2 : '',
      Address3: this._address3 ? this._address3 : '',
      Town: this._town ? this._town : '',
      Postcode: this._postcode ? this._postcode : '',
      LocationId: this._regType ? this._locationID : undefined,
      ProvId: this._regType ? this._provID : undefined,
      IsCQCRegulated: this._regType === 2
    };

    // interim solution for reasons for leaving
    if (this._reasonsForLeaving && Array.isArray(this._reasonsForLeaving)) {
      fixedProperties.reasonsForLeaving = this._reasonsForLeaving.map(thisReason => `${thisReason.id}:${thisReason.count}`).join('|');
    } else {
      fixedProperties.reasonsForLeaving = ''; // reset
    }

    const changeProperties = {
      status: this._status,
      name: this._name,
      localIdentifier: this._localId,
      isRegulated: this._regType === 2,
      employerType: {
        value: this.establishmentType,
        other: this._establishmentTypeOther ? this._establishmentTypeOther : undefined
      },
      localAuthorities: this._localAuthorities ? this._localAuthorities : [],
      mainService: this._mainService,
      services: this._allServices ? this._allServices
        .filter(thisService => this._mainService ? this._mainService.id !== thisService : true) // main service cannot appear in otherServices
        .map((thisService, index) => {
          const returnThis = {
            id: thisService
          };

          // console.log("WA DEBUG - this other service: ", thisService, index, this._allServicesOther, this._allServicesOther[index])

          if (this._allServicesOther[index]) {
            returnThis.other = this._allServicesOther[index];
          }

          return returnThis;
        }) : [],
      serviceUsers: this._allServiceUsers ? this._allServiceUsers
        .map((thisService, index) => {
          const returnThis = {
            id: thisService
          };

          if (this._allServiceUsersOther[index]) {
            returnThis.other = this._allServiceUsersOther[index];
          }

          return returnThis;
        }) : [],
      numberOfStaff: this._totalPermTemp,
      vacancies: this._vacancies ? this._vacancies : 'None',
      starters: this._starters ? this._starters : 'None',
      leavers: this.leavers ? this.leavers : 'None'
    };

    if (this._regType === 2) {
      changeProperties.locationId = this._locationID;
    }

    // share options
    if (this._shareWithCqc || this._shareWithLA) {
      const shareWith = [];

      if (this._shareWithCqc) {
        shareWith.push('CQC');
      }
      if (this._shareWithLA) {
        shareWith.push('Local Authority');
      }

      changeProperties.share = {
        enabled: true,
        with: shareWith
      };
    } else {
      changeProperties.share = {
        enabled: false
      };
    }

    // capacities - we combine both capacities and utilisations
    changeProperties.capacities = [];
    if (Array.isArray(this._capacities)) {
      this._capacities.forEach(thisCapacity => {
        changeProperties.capacities.push(thisCapacity);
      });
    }

    if (Array.isArray(this._utilisations)) {
      this._utilisations.forEach(thisUtilisation => {
        changeProperties.capacities.push(thisUtilisation);
      });
    }

    // clean up empty properties
    if (changeProperties.capacities.length === 0) {
      changeProperties.capacities = [];
    }

    if (changeProperties.services && changeProperties.services.length === 0) {
      changeProperties.services = [];
    }

    return {
      ...fixedProperties,
      ...changeProperties
    };
  }

  // takes the given establishment entity and writes it out to CSV string (one line)
  static toCSV (entity) {
    // ["LOCALESTID","STATUS","ESTNAME","ADDRESS1","ADDRESS2","ADDRESS3","POSTTOWN","POSTCODE","ESTTYPE","OTHERTYPE","PERMCQC","PERMLA","SHARELA","REGTYPE","PROVNUM","LOCATIONID","MAINSERVICE","ALLSERVICES","CAPACITY","UTILISATION","SERVICEDESC","SERVICEUSERS","OTHERUSERDESC","TOTALPERMTEMP","ALLJOBROLES","STARTERS","LEAVERS","VACANCIES","REASONS","REASONNOS"]
    const columns = [];
    columns.push(csvQuote(entity.localIdentifier)); // todo - this will be local identifier
    columns.push('UNCHECKED');
    columns.push(csvQuote(entity.name));
    columns.push(csvQuote(entity.address1));
    columns.push(csvQuote(entity.address2));
    columns.push(csvQuote(entity.address3));
    columns.push(csvQuote(entity.town));
    columns.push(entity.postcode);

    let employerType = '';
    let employerTypeOther = '';
    if (entity.employerType) {
      employerType = BUDI.establishmentType(BUDI.FROM_ASC, entity.employerType.value);

      if (entity.employerType.other) {
        employerTypeOther = csvQuote(entity.employerType.other);
      }
    }
    columns.push(employerType);
    columns.push(employerTypeOther);

    // share with CQC/LA, LAs sharing with
    const shareWith = entity.shareWith;
    const shareWithLA = entity.shareWithLA;
    columns.push(shareWith && shareWith.enabled && shareWith.with.includes('CQC') ? 1 : 0);
    columns.push(shareWith && shareWith.enabled && shareWith.with.includes('Local Authority') ? 1 : 0);
    columns.push(shareWith && shareWith.enabled && shareWith.with.includes('Local Authority') && shareWithLA && Array.isArray(shareWithLA) ? shareWithLA.map(thisLA => thisLA.cssrId).join(';') : '');

    // CQC regulated, Prov IDand Location ID
    columns.push(entity.isRegulated ? 2 : 0);
    columns.push(entity.isRegulated ? entity.provId : '');
    columns.push(entity.isRegulated ? entity.locationId : '');

    // main service - this is mandatory in ASC WDS so no need to check for it being available or not
    const mainService = entity.mainService;
    const budiMappedMainService = BUDI.services(BUDI.FROM_ASC, mainService.id);
    columns.push(budiMappedMainService);

    // all services - this is main service and other services
    const otherServices = entity.otherServices && Array.isArray(entity.otherServices) ? entity.otherServices : [];
    otherServices.unshift(mainService);
    columns.push(otherServices.map(thisService => BUDI.services(BUDI.FROM_ASC, thisService.id)).join(';'));

    // capacities and utilisations - these are semi colon delimited in the order of ALLSERVICES (so main service and other services) - empty if not a capacity or a utilisation
    const entityCapacities = Array.isArray(entity.capacities) ? entity.capacities.map(thisCap => {
      const isCapacity = BUDI.serviceFromCapacityId(thisCap.reference.id);
      const isUtilisation = BUDI.serviceFromUtilisationId(thisCap.reference.id);

      return {
        isUtilisation: isUtilisation !== null,
        isCapacity: isCapacity !== null,
        serviceId: isCapacity !== null ? isCapacity : isUtilisation,
        answer: thisCap.answer
      };
    }) : [];

    // for CSV output, the capacities need to be separated from utilisations

    // the capacities must be written out in the same sequence of semi-colon delimited values as ALLSERVICES
    columns.push(otherServices.map(thisService => {
      // capacities only
      const matchedCapacityForGivenService = entityCapacities.find(thisCap => thisCap.isCapacity && thisCap.serviceId === thisService.id);
      return matchedCapacityForGivenService ? matchedCapacityForGivenService.answer : '';
    }).join(';'));

    columns.push(otherServices.map(thisService => {
      // capacities only
      const matchedUtilisationForGivenService = entityCapacities.find(thisCap => thisCap.isUtilisation && thisCap.serviceId === thisService.id);
      return matchedUtilisationForGivenService ? matchedUtilisationForGivenService.answer : '';
    }).join(';'));

    // all service "other" descriptions
    columns.push(otherServices.map(thisService => thisService.other && thisService.other.length > 0 ? thisService.other : '').join(';'));

    // service users and their 'other' descriptions
    const serviceUsers = Array.isArray(entity.serviceUsers) ? entity.serviceUsers : [];
    columns.push(serviceUsers.map(thisUser => BUDI.serviceUsers(BUDI.FROM_ASC, thisUser.id)).join(';'));
    columns.push(serviceUsers.map(thisUser => thisUser.other && thisUser.other.length > 0 ? thisUser.other : '').join(';'));

    // total perm/temp staff
    columns.push(entity.numberOfStaff ? entity.numberOfStaff : 0);

    // all job roles, starters, leavers and vacancies

    const allJobs = [];

    if (entity.starters && Array.isArray(entity.starters)) {
      entity.starters.forEach(thisStarter => allJobs.push(thisStarter));
    }

    if (entity.leavers && Array.isArray(entity.leavers)) {
      entity.leavers.forEach(thisLeaver => allJobs.push(thisLeaver));
    }

    if (entity.vacancies && Array.isArray(entity.vacancies)) {
      entity.vacancies.forEach(thisVacancy => allJobs.push(thisVacancy));
    }

    // all jobs needs to be a set of unique ids (which across starters, leavers and vacancies may be repeated)
    const uniqueJobs = [];

    allJobs.forEach(thisAllJob => {
      if (!uniqueJobs.includes(thisAllJob.jobId)) {
        uniqueJobs.push(thisAllJob.jobId);
      }
    });

    columns.push(uniqueJobs.map(thisJob => BUDI.jobRoles(BUDI.FROM_ASC, thisJob)).join(';'));

    let starters = '';
    if (entity.starters && !Array.isArray(entity.starters)) {
      if (entity.starters === 'None' && entity.leavers === 'None' && entity.vacancies === 'None') {
        starters = '0';
      } else if (entity.starters === 'None') {
        starters = uniqueJobs.length ? uniqueJobs.map(x => 0).join(';') : '0';
      } else if (entity.starters === 'Don\'t know') {
        starters = 999;
      }
    } else if (entity.starters !== null) {
      starters = uniqueJobs.map(thisJob => {
        const isThisJobAStarterJob = entity.starters ? entity.starters.find(myStarter => myStarter.jobId === thisJob) : false;
        if (isThisJobAStarterJob) {
          return isThisJobAStarterJob.total;
        } else {
          return 0;
        }
      }).join(';');
    }
    columns.push(starters);

    let leavers = '';
    if (entity.leavers && !Array.isArray(entity.leavers)) {
      if (entity.starters === 'None' && entity.leavers === 'None' && entity.vacancies === 'None') {
        leavers = '0';
      } else if (entity.leavers === 'None') {
        leavers = uniqueJobs.length ? uniqueJobs.map(x => 0).join(';') : '0';
      } else if (entity.leavers === 'Don\'t know') {
        leavers = 999;
      }
    } else if (entity.leavers !== null) {
      leavers = uniqueJobs.map(thisJob => {
        const isThisJobALeaverJob = entity.leavers ? entity.leavers.find(myLeaver => myLeaver.jobId === thisJob) : false;
        if (isThisJobALeaverJob) {
          return isThisJobALeaverJob.total;
        } else {
          return 0;
        }
      }).join(';');
    }
    columns.push(leavers);

    let vacancies = '';
    if (entity.vacancies && !Array.isArray(entity.vacancies)) {
      if (entity.starters === 'None' && entity.leavers === 'None' && entity.vacancies === 'None') {
        vacancies = '0';
      } else if (entity.vacancies === 'None') {
        vacancies = uniqueJobs.length ? uniqueJobs.map(x => 0).join(';') : '0';
      } else if (entity.vacancies === 'Don\'t know') {
        vacancies = 999;
      }
    } else {
      vacancies = uniqueJobs.map(thisJob => {
        const isThisJobAVacancyJob = entity.vacancies ? entity.vacancies.find(myVacancy => myVacancy.jobId === thisJob) : false;
        if (isThisJobAVacancyJob) {
          return isThisJobAVacancyJob.total;
        } else {
          return 0;
        }
      }).join(';');
    }
    columns.push(vacancies);

    // reasons for leaving - currently can't be mapped - interim solution is a string of "reasonID:count|reasonId:count" (without BUDI mapping)
    if (entity.reasonsForLeaving && entity.reasonsForLeaving.length > 0) {
      const reasons = [];
      const reasonsCount = [];
      const myReasons = entity.reasonsForLeaving.split('|');

      myReasons.forEach(currentReason => {
        const [reasonId, reasonCount] = currentReason.split(':');
        reasons.push(reasonId);
        reasonsCount.push(reasonCount);
      });

      columns.push(reasons.join(';'));
      columns.push(reasonsCount.join(';'));
    } else {
      columns.push('');
      columns.push('');
    }

    return columns.join(',');
  }

  toCSV (entity) {
    return Establishment.toCSV(entity);
  }
}

module.exports.Establishment = Establishment;
