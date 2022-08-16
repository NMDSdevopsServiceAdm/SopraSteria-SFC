const BUDI = require('../BUDI').BUDI;
const models = require('../../index');
const clonedeep = require('lodash.clonedeep');
const moment = require('moment');
const { sanitisePostcode } = require('../../../utils/postcodeSanitizer');
const STOP_VALIDATING_ON = ['UNCHECKED', 'DELETE', 'NOCHANGE'];
const Establishment = require('../../classes/establishment').Establishment;

const employedContractStatusIds = [1, 2];
const cqcRegulatedServiceCodes = [24, 25, 20, 22, 21, 23, 19, 27, 28, 26, 29, 30, 32, 31, 33, 34];
const registeredManagerJobID = 4;
const regManager = 4;

const csvQuote = (toCsv) => {
  if (toCsv && toCsv.replace(/ /g, '').match(/[\s,"]/)) {
    return '"' + toCsv.replace(/"/g, '""') + '"';
  } else {
    return toCsv;
  }
};

function isRegManager(worker) {
  if (worker.mainJobRoleId === registeredManagerJobID) {
    // 4 is reg manager in csv
    return true;
  } else {
    worker.otherJobIds.map((otherJobId) => {
      if (otherJobId === registeredManagerJobID) {
        return true;
      }
    });
  }
}
function isPerm(worker) {
  return employedContractStatusIds.includes(worker.contractTypeId);
}

const _headers_v1 =
  'LOCALESTID,STATUS,ESTNAME,ADDRESS1,ADDRESS2,ADDRESS3,POSTTOWN,POSTCODE,ESTTYPE,OTHERTYPE,' +
  'PERMCQC,PERMLA,REGTYPE,PROVNUM,LOCATIONID,MAINSERVICE,ALLSERVICES,CAPACITY,UTILISATION,SERVICEDESC,' +
  'SERVICEUSERS,OTHERUSERDESC,TOTALPERMTEMP,ALLJOBROLES,STARTERS,LEAVERS,VACANCIES,REASONS,REASONNOS,' +
  'ADVERTISING,INTERVIEWS,REPEATTRAINING,ACCEPTCARECERT,BENEFITS,SICKPAY,PENSION,HOLIDAY';

class WorkplaceCSVValidator {
  constructor(currentLine, lineNumber, allCurrentEstablishments) {
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
    this._doNewStartersRepeatMandatoryTrainingFromPreviousEmployment = null;
    this._wouldYouAcceptCareCertificatesFromPreviousEmployment = null;
    this._moneySpentOnAdvertisingInTheLastFourWeeks = null;
    this._peopleInterviewedInTheLastFourWeeks = null;
    this._careWorkersCashLoyaltyForFirstTwoYears = null;
    this._sickPay = null;
    this._pensionContribution = null;
    this._careWorkersLeaveDaysPerYear = null;

    this._id = null;
    this._ignore = false;
  }

  static get EXPECT_JUST_ONE_ERROR() {
    return 950;
  }
  static get MISSING_PRIMARY_ERROR() {
    return 955;
  }
  static get CANNOT_DELETE_PRIMARY_ERROR() {
    return 956;
  }

  static get NOT_OWNER_ERROR() {
    return 997;
  }
  static get DUPLICATE_ERROR() {
    return 998;
  }
  static get HEADERS_ERROR() {
    return 999;
  }
  static get MAIN_SERVICE_ERROR() {
    return 1000;
  }
  static get LOCAL_ID_ERROR() {
    return 1010;
  }
  static get STATUS_ERROR() {
    return 1020;
  }
  static get STATUS_WARNING() {
    return 1025;
  }
  static get NAME_ERROR() {
    return 1030;
  }
  static get ADDRESS_ERROR() {
    return 1040;
  }
  static get ESTABLISHMENT_TYPE_ERROR() {
    return 1070;
  }
  static get SHARE_WITH_CQC_ERROR() {
    return 1080;
  }
  static get SHARE_WITH_LA_ERROR() {
    return 1090;
  }
  static get REGTYPE_ERROR() {
    return 1100;
  }
  static get PROV_ID_ERROR() {
    return 1105;
  }
  static get LOCATION_ID_ERROR() {
    return 1110;
  }
  static get ALL_SERVICES_ERROR() {
    return 1120;
  }
  static get ALL_SERVICES_ERROR_NONE() {
    return 1121;
  }
  static get SERVICE_USERS_ERROR() {
    return 1130;
  }
  static get CAPACITY_UTILISATION_ERROR() {
    return 1140;
  }

  static get TOTAL_PERM_TEMP_ERROR() {
    return 1200;
  }
  static get ALL_JOBS_ERROR() {
    return 1280;
  }
  static get VACANCIES_ERROR() {
    return 1300;
  }
  static get STARTERS_ERROR() {
    return 1310;
  }
  static get LEAVERS_ERROR() {
    return 1320;
  }

  static get REASONS_FOR_LEAVING_ERROR() {
    return 1360;
  }

  static get MAIN_SERVICE_WARNING() {
    return 2000;
  }
  static get NAME_WARNING() {
    return 2030;
  }
  static get ADDRESS_WARNING() {
    return 2040;
  }
  static get ESTABLISHMENT_TYPE_WARNING() {
    return 2070;
  }
  static get TOTAL_PERM_TEMP_WARNING() {
    return 2200;
  }
  static get REGTYPE_WARNING() {
    return 2100;
  }
  static get PROV_ID_WARNING() {
    return 2105;
  }
  static get LOCATION_ID_WARNING() {
    return 2110;
  }
  static get ALL_SERVICES_WARNING() {
    return 2120;
  }
  static get SERVICE_USERS_WARNING() {
    return 2130;
  }
  static get CAPACITY_UTILISATION_WARNING() {
    return 2140;
  }
  static get ALL_JOBS_WARNING() {
    return 2180;
  }

  static get VACANCIES_WARNING() {
    return 2300;
  }
  static get STARTERS_WARNING() {
    return 2310;
  }
  static get LEAVERS_WARNING() {
    return 2320;
  }
  static get REASONS_FOR_LEAVING_WARNING() {
    return 2360;
  }
  static get ADVERTISING_ERROR() {
    return 2400;
  }
  static get INTERVIEWS_ERROR() {
    return 2410;
  }
  static get REPEAT_TRAINING_ERROR() {
    return 2420;
  }
  static get ACCEPT_CARE_CERT_ERROR() {
    return 2430;
  }
  static get BENEFITS_WARNING() {
    return 2440;
  }
  static get SICKPAY_WARNING() {
    return 2450;
  }
  static get PENSION_WARNING() {
    return 2460;
  }
  static get HOLIDAY_WARNING() {
    return 2470;
  }

  get id() {
    if (this._id === null) {
      const est = this._allCurrentEstablishments.find((currentEstablishment) => currentEstablishment.key === this._key);

      if (typeof est !== 'undefined') {
        this._id = est._id;
      }
    }

    return this._id;
  }

  static headers() {
    return _headers_v1;
  }

  get headers() {
    return _headers_v1;
  }

  get lineNumber() {
    return this._lineNumber;
  }

  get currentLine() {
    return this._currentLine;
  }

  get localId() {
    return this._localId;
  }

  get key() {
    return this._key;
  }

  get status() {
    return this._status;
  }

  get name() {
    return this._name;
  }

  get address() {
    return this._address;
  }

  get postcode() {
    return this._postcode;
  }

  get establishmentType() {
    return BUDI.establishmentType(BUDI.TO_ASC, this._establishmentType) || this._establishmentType;
  }

  get establishmentTypeId() {
    return this._establishmentType;
  }

  get establishmentTypeOther() {
    return this._establishmentTypeOther;
  }

  get mainService() {
    return this._mainService;
  }

  get allServices() {
    // return a clone of the services array to prevent outside modifications
    return Array.isArray(this._allServices) ? this._allServices.map((x) => x) : [];
  }

  get allServicesOther() {
    return this._allServicesOther;
  }

  get allServiceUsers() {
    return this._allServiceUsers;
  }

  get allServiceUsersOther() {
    return this._allServiceUsersOther;
  }

  get capacities() {
    return this._capacities;
  }

  get utilisations() {
    return this._utilisations;
  }

  get shareWithCqc() {
    return this._shareWithCqc;
  }

  get shareWithLa() {
    return this._shareWithLA;
  }

  get regType() {
    return this._regType;
  }

  get provId() {
    return this._provID;
  }

  get locationId() {
    return this._locationID;
  }

  get totalPermTemp() {
    return this._totalPermTemp;
  }

  get allJobs() {
    return this._alljobs;
  }

  get vacancies() {
    return this._vacancies;
  }

  get starters() {
    return this._starters;
  }

  get leavers() {
    return this._leavers;
  }

  get reasonsForLeaving() {
    return this._reasonsForLeaving;
  }

  get doNewStartersRepeatMandatoryTrainingFromPreviousEmployment() {
    return this._doNewStartersRepeatMandatoryTrainingFromPreviousEmployment;
  }

  get moneySpentOnAdvertisingInTheLastFourWeeks() {
    return this._moneySpentOnAdvertisingInTheLastFourWeeks;
  }

  get peopleInterviewedInTheLastFourWeeks() {
    return this._peopleInterviewedInTheLastFourWeeks;
  }

  get wouldYouAcceptCareCertificatesFromPreviousEmployment() {
    return this._wouldYouAcceptCareCertificatesFromPreviousEmployment;
  }

  get careWorkersLeaveDaysPerYear() {
    return this._careWorkersLeaveDaysPerYear;
  }

  get careWorkersCashLoyaltyForFirstTwoYears() {
    return this._careWorkersCashLoyaltyForFirstTwoYears;
  }

  get pensionContribution() {
    return this._pensionContribution;
  }

  get sickPay() {
    return this._sickPay;
  }

  _validateLocalisedId() {
    const myLocalId = this._currentLine.LOCALESTID;

    // must be present and n more than 50 characters
    const MAX_LENGTH = 50;
    let status = true;

    if (myLocalId === null || myLocalId.length === 0) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: WorkplaceCSVValidator.LOCAL_ID_ERROR,
        errType: 'LOCAL_ID_ERROR',
        error: 'LOCALESTID has not been supplied',
        source: myLocalId,
        column: 'LOCALESTID',
      });
      status = false;
    } else if (myLocalId.length >= MAX_LENGTH) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: WorkplaceCSVValidator.LOCAL_ID_ERROR,
        errType: 'LOCAL_ID_ERROR',
        error: `LOCALESTID is longer than ${MAX_LENGTH} characters`,
        source: myLocalId,
        column: 'LOCALESTID',
      });
      status = false;
    }

    // need the LOCALSTID regardless of whether it has failed validation or not
    this._localId = myLocalId === null || myLocalId.length === 0 ? `SFCROW$${this._lineNumber}` : myLocalId;
    this._key = this._localId.replace(/\s/g, '');

    return status;
  }

  _validateStatus() {
    const statusValues = ['DELETE', 'UPDATE', 'UNCHECKED', 'NOCHANGE', 'NEW'];
    const myStatus = this._currentLine.STATUS
      ? String(this._currentLine.STATUS).toUpperCase()
      : this._currentLine.STATUS;

    // must be present and must be one of the preset values (case insensitive)
    if (!this._currentLine.STATUS || this._currentLine.STATUS.length === 0) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: WorkplaceCSVValidator.STATUS_ERROR,
        errType: 'STATUS_ERROR',
        error: 'STATUS is blank',
        source: this._currentLine.STATUS,
        column: 'STATUS',
        name: this._currentLine.LOCALESTID,
      });
      return false;
    }
    if (!statusValues.includes(myStatus)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: WorkplaceCSVValidator.STATUS_ERROR,
        errType: 'STATUS_ERROR',
        error: 'The code you have entered for STATUS is incorrect',
        source: this._currentLine.STATUS,
        column: 'STATUS',
        name: this._currentLine.LOCALESTID,
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
              errCode: WorkplaceCSVValidator.STATUS_ERROR,
              errType: 'STATUS_ERROR',
              error: 'Workplace has a STATUS of NEW but already exists, please use one of the other statuses',
              source: myStatus,
              column: 'STATUS',
            });
          }
          break;

        case 'DELETE':
          if (thisEstablishmentId === null) {
            this._validationErrors.push({
              name: this._currentLine.LOCALESTID,
              lineNumber: this._lineNumber,
              errCode: WorkplaceCSVValidator.STATUS_ERROR,
              errType: 'STATUS_ERROR',
              error: 'Workplace has a STATUS of DELETE but does not exist',
              source: myStatus,
              column: 'STATUS',
            });
          }
          break;

        case 'UNCHECKED':
          if (thisEstablishmentId === null) {
            this._validationErrors.push({
              name: this._currentLine.LOCALESTID,
              lineNumber: this._lineNumber,
              errCode: WorkplaceCSVValidator.STATUS_ERROR,
              errType: 'STATUS_ERROR',
              error: 'Workplace has a STATUS of UNCHECKED but does not exist, please change to NEW to add it',
              source: myStatus,
              column: 'STATUS',
            });
          }
          break;

        case 'NOCHANGE':
          if (thisEstablishmentId === null) {
            this._validationErrors.push({
              name: this._currentLine.LOCALESTID,
              lineNumber: this._lineNumber,
              errCode: WorkplaceCSVValidator.STATUS_ERROR,
              errType: 'STATUS_ERROR',
              error: 'Workplace has a STATUS of NOCHANGE but does not exist, please change to NEW to add it',
              source: myStatus,
              column: 'STATUS',
            });
          }
          break;

        case 'UPDATE':
          if (thisEstablishmentId === null) {
            this._validationErrors.push({
              name: this._currentLine.LOCALESTID,
              lineNumber: this._lineNumber,
              errCode: WorkplaceCSVValidator.STATUS_ERROR,
              errType: 'STATUS_ERROR',
              error: 'Workplace has a STATUS of UPDATE but does not exist, please change to NEW to add it',
              source: myStatus,
              column: 'STATUS',
            });
          }
          break;
      }

      this._status = myStatus;
      return true;
    }
  }

  _validateEstablishmentName() {
    const myName = this._currentLine.ESTNAME;

    // must be present and no more than 120 characters
    const MAX_LENGTH = 120;

    if (!myName || myName.length === 0) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: WorkplaceCSVValidator.NAME_ERROR,
        errType: 'NAME_ERROR',
        error: 'ESTNAME has not been supplied',
        source: myName,
        column: 'ESTNAME',
        name: this._currentLine.LOCALESTID,
      });
      return false;
    } else if (myName.length > MAX_LENGTH) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: WorkplaceCSVValidator.NAME_ERROR,
        errType: 'NAME_ERROR',
        error: `ESTNAME is longer than ${MAX_LENGTH} characters`,
        source: myName,
        column: 'ESTNAME',
        name: this._currentLine.LOCALESTID,
      });
      return false;
    } else {
      this._name = myName;
      return true;
    }
  }

  async _validateAddress() {
    const myAddress1 = this._currentLine.ADDRESS1;
    const myAddress2 = this._currentLine.ADDRESS2;
    const myAddress3 = this._currentLine.ADDRESS3;
    const myTown = this._currentLine.POSTTOWN;
    const myPostcode = this._currentLine.POSTCODE;
    let ignorePostcode = false;

    // TODO - if town is empty, match against PAF

    // adddress 1 is mandatory and no more than 40 characters
    const MAX_LENGTH = 40;
    let postcodeExists = [];

    if (myPostcode && myPostcode.length) {
      postcodeExists = await models.pcodedata.findAll({
        where: {
          postcode: myPostcode,
        },
        order: [['uprn', 'ASC']],
      });
    }

    const localValidationErrors = [];
    if (!myAddress1 || myAddress1.length === 0) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: WorkplaceCSVValidator.ADDRESS_ERROR,
        errType: 'ADDRESS_ERROR',
        error: 'ADDRESS1 is blank',
        column: 'ADDRESS1',
        name: this._currentLine.LOCALESTID,
      });
    } else if (myAddress1.length > MAX_LENGTH) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: WorkplaceCSVValidator.ADDRESS_ERROR,
        errType: 'ADDRESS_ERROR',
        error: `ADDRESS1 is longer than ${MAX_LENGTH} characters`,
        source: myAddress1,
        column: 'ADDRESS1',
        name: this._currentLine.LOCALESTID,
      });
    }

    if (myAddress2 && myAddress2.length > MAX_LENGTH) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: WorkplaceCSVValidator.ADDRESS_ERROR,
        errType: 'ADDRESS_ERROR',
        error: `ADDRESS2 is longer than ${MAX_LENGTH} characters`,
        source: myAddress2,
        column: 'ADDRESS2',
        name: this._currentLine.LOCALESTID,
      });
    }

    if (myAddress3 && myAddress3.length > MAX_LENGTH) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: WorkplaceCSVValidator.ADDRESS_ERROR,
        errType: 'ADDRESS_ERROR',
        error: `ADDRESS3 is longer than ${MAX_LENGTH} characters`,
        source: myAddress3,
        column: 'ADDRESS3',
        name: this._currentLine.LOCALESTID,
      });
    }

    if (myTown && myTown.length > MAX_LENGTH) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: WorkplaceCSVValidator.ADDRESS_ERROR,
        errType: 'ADDRESS_ERROR',
        error: `POSTTOWN is longer than ${MAX_LENGTH} characters`,
        source: myTown,
        column: 'POSTTOWN',
        name: this._currentLine.LOCALESTID,
      });
    }
    // TODO - registration/establishment APIs do not validate postcode (relies on the frontend - this must be fixed)
    const POSTCODE_MAX_LENGTH = 10;
    if (!myPostcode || myPostcode.length === 0) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: WorkplaceCSVValidator.ADDRESS_ERROR,
        errType: 'ADDRESS_ERROR',
        error: 'POSTCODE has not been supplied',
        source: myPostcode,
        column: 'POSTCODE',
        name: this._currentLine.LOCALESTID,
      });
    } else if (myPostcode.length > POSTCODE_MAX_LENGTH) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: WorkplaceCSVValidator.ADDRESS_ERROR,
        errType: 'ADDRESS_ERROR',
        error: `POSTCODE is longer than ${POSTCODE_MAX_LENGTH} characters`,
        source: myPostcode,
        column: 'POSTCODE',
        name: this._currentLine.LOCALESTID,
      });
    } else if (sanitisePostcode(myPostcode) === null) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: WorkplaceCSVValidator.ADDRESS_ERROR,
        errType: 'ADDRESS_ERROR',
        error: 'POSTCODE is incorrectly formatted',
        source: myPostcode,
        column: 'POSTCODE',
        name: this._currentLine.LOCALESTID,
      });
    } else if (this._status === 'NEW' && !postcodeExists.length) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: WorkplaceCSVValidator.ADDRESS_ERROR,
        errType: 'ADDRESS_ERROR',
        error: 'The POSTCODE for this workplace cannot be found in our database and must be registered manually.',
        source: myPostcode,
        column: 'POSTCODE',
        name: this._currentLine.LOCALESTID,
      });
      this._ignore = true;
    } else if (this._status === 'UPDATE' && !postcodeExists.length) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        warnCode: WorkplaceCSVValidator.ADDRESS_ERROR,
        warnType: 'ADDRESS_ERROR',
        warning: 'The POSTCODE cannot be found in our database and will be ignored.',
        source: myPostcode,
        column: 'POSTCODE',
        name: this._currentLine.LOCALESTID,
      });
      ignorePostcode = true;
    }

    if (localValidationErrors.length > 0) {
      localValidationErrors.forEach((thisValidation) => this._validationErrors.push(thisValidation));
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

  _validateEstablishmentType() {
    const myEstablishmentType = parseInt(this._currentLine.ESTTYPE, 10);
    const myOtherEstablishmentType = this._currentLine.OTHERTYPE;

    const localValidationErrors = [];
    if (!this._currentLine.ESTTYPE || this._currentLine.ESTTYPE.length === 0) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: WorkplaceCSVValidator.ESTABLISHMENT_TYPE_ERROR,
        errType: 'ESTABLISHMENT_TYPE_ERROR',
        error: 'ESTTYPE has not been supplied',
        source: this._currentLine.ESTTYPE,
        column: 'ESTTYPE',
        name: this._currentLine.LOCALESTID,
      });
    } else if (Number.isNaN(myEstablishmentType)) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: WorkplaceCSVValidator.ESTABLISHMENT_TYPE_ERROR,
        errType: 'ESTABLISHMENT_TYPE_ERROR',
        error: 'The code you have entered for ESTTYPE is incorrect',
        source: this._currentLine.ESTTYPE,
        column: 'ESTTYPE',
        name: this._currentLine.LOCALESTID,
      });
    } else if (myEstablishmentType < 1 || myEstablishmentType > 8) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: WorkplaceCSVValidator.ESTABLISHMENT_TYPE_ERROR,
        errType: 'ESTABLISHMENT_TYPE_ERROR',
        error: 'The code you have entered for ESTTYPE is incorrect',
        source: this._currentLine.ESTTYPE,
        column: 'ESTTYPE',
        name: this._currentLine.LOCALESTID,
      });
    }

    // if the establishment type is "other" (8), then OTHERTYPE must be defined
    const MAX_LENGTH = 240;

    if (myEstablishmentType === 8 && (!myOtherEstablishmentType || myOtherEstablishmentType.length === 0)) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        warnCode: WorkplaceCSVValidator.ESTABLISHMENT_TYPE_WARNING,
        warnType: 'ESTABLISHMENT_TYPE_WARNING',
        warning: 'OTHERTYPE has not been supplied',
        source: myOtherEstablishmentType,
        column: 'OTHERTYPE',
        name: this._currentLine.LOCALESTID,
      });
    } else if (myEstablishmentType === 8 && myOtherEstablishmentType.length > MAX_LENGTH) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: WorkplaceCSVValidator.ESTABLISHMENT_TYPE_ERROR,
        errType: 'ESTABLISHMENT_TYPE_ERROR',
        error: `OTHERTYPE is longer than ${MAX_LENGTH} characters`,
        source: myOtherEstablishmentType,
        column: 'OTHERTYPE',
        name: this._currentLine.LOCALESTID,
      });
    } else if (myEstablishmentType === 8) {
      this._establishmentTypeOther = myOtherEstablishmentType;
    } else if (myEstablishmentType !== 8 && myOtherEstablishmentType && myOtherEstablishmentType.length > 0) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        warnCode: WorkplaceCSVValidator.ESTABLISHMENT_TYPE_WARNING,
        warnType: 'ESTABLISHMENT_TYPE_WARNING',
        warning: 'OTHERTYPE will be ignored as not required',
        source: myOtherEstablishmentType,
        column: 'OTHERTYPE',
        name: this._currentLine.LOCALESTID,
      });
    }

    if (localValidationErrors.length > 0) {
      localValidationErrors.forEach((thisValidation) => this._validationErrors.push(thisValidation));
      return false;
    }

    this._establishmentType = myEstablishmentType;
    return true;
  }

  _validateShareWithCQC() {
    const ALLOWED_VALUES = ['0', '1', ''];

    if (!ALLOWED_VALUES.includes(this._currentLine.PERMCQC)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: WorkplaceCSVValidator.SHARE_WITH_CQC_ERROR,
        errType: 'SHARE_WITH_CQC_ERROR',
        error: 'The code you have entered for PERMCQC is incorrect',
        source: this._currentLine.PERMCQC,
        column: 'PERMCQC',
        name: this._currentLine.LOCALESTID,
      });
      return false;
    } else {
      const shareWithCqcAsInt = parseInt(this._currentLine.PERMCQC, 10);
      this._shareWithCqc = Number.isNaN(shareWithCqcAsInt) ? this._currentLine.PERMCQC : shareWithCqcAsInt;
      return true;
    }
  }

  _validateShareWithLA() {
    const ALLOWED_VALUES = ['0', '1', ''];

    if (!ALLOWED_VALUES.includes(this._currentLine.PERMLA)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: WorkplaceCSVValidator.SHARE_WITH_LA_ERROR,
        errType: 'SHARE_WITH_LA_ERROR',
        error: 'The code you have entered for PERMLA is incorrect',
        source: this._currentLine.PERMLA,
        column: 'PERMLA',
        name: this._currentLine.LOCALESTID,
      });
      return false;
    } else {
      const shareWithLaAsInt = parseInt(this._currentLine.PERMLA, 10);
      this._shareWithLA = Number.isNaN(shareWithLaAsInt) ? this._currentLine.PERMLA : shareWithLaAsInt;
      return true;
    }
  }

  _validateRegType() {
    const myRegType = parseInt(this._currentLine.REGTYPE, 10);
    const dbServiceCode = BUDI.services(BUDI.TO_ASC, this._mainService);
    const dbMainServiceCode = 16;

    if (!this._currentLine.REGTYPE || this._currentLine.REGTYPE.length === 0) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: WorkplaceCSVValidator.REGTYPE_ERROR,
        errType: 'REGTYPE_ERROR',
        error: 'REGTYPE has not been supplied',
        source: this._currentLine.REGTYPE,
        column: 'REGTYPE',
        name: this._currentLine.LOCALESTID,
      });
      return false;
    } else if (Number.isNaN(myRegType) || (myRegType !== 0 && myRegType !== 2)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: WorkplaceCSVValidator.REGTYPE_ERROR,
        errType: 'REGTYPE_ERROR',
        error: 'The code you have entered for REGTYPE is incorrect',
        source: this._currentLine.REGTYPE,
        column: 'REGTYPE',
        name: this._currentLine.LOCALESTID,
      });
      return false;
    } else if (
      myRegType === 2 &&
      !cqcRegulatedServiceCodes.includes(dbServiceCode) &&
      dbServiceCode !== dbMainServiceCode
    ) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: WorkplaceCSVValidator.REGTYPE_ERROR,
        errType: 'REGTYPE_ERROR',
        error:
          'REGTYPE is 2 (CQC) but no CQC regulated services have been specified. Please change either REGTYPE or MAINSERVICE',
        source: this._currentLine.REGTYPE,
        column: 'REGTYPE/MAINSERVICE',
        name: this._currentLine.LOCALESTID,
      });
      return false;
    } else if (
      myRegType === 0 &&
      cqcRegulatedServiceCodes.includes(dbServiceCode) &&
      dbServiceCode !== dbMainServiceCode
    ) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: WorkplaceCSVValidator.REGTYPE_ERROR,
        errType: 'REGTYPE_ERROR',
        error:
          'REGTYPE is 0 (Non-CQC) but CQC regulated services have been specified. Please change either REGTYPE or MAINSERVICE',
        source: this._currentLine.REGTYPE,
        column: 'REGTYPE/MAINSERVICE',
        name: this._currentLine.LOCALESTID,
      });
      return false;
    } else {
      this._regType = myRegType;
      return true;
    }
  }

  _validateProvID() {
    // must be given if "REGTYPE" is 2 - but if given must be in the format "n-nnnnnnnnn"
    const provIDRegex = /^[0-9]{1}-[0-9]{8,12}$/;
    const myprovID = this._currentLine.PROVNUM;

    if (this._regType === 2 && (!myprovID || myprovID.length === 0)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: WorkplaceCSVValidator.PROV_ID_ERROR,
        errType: 'PROV_ID_ERROR',
        error: 'PROVNUM has not been supplied',
        source: myprovID,
        column: 'PROVNUM',
        name: this._currentLine.LOCALESTID,
      });
      return false;
    } else if (this._regType === 2 && !provIDRegex.test(myprovID)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: WorkplaceCSVValidator.PROV_ID_ERROR,
        errType: 'PROV_ID_ERROR',
        error: 'PROVNUM is incorrectly formatted',
        source: myprovID,
        column: 'PROVNUM',
        name: this._currentLine.LOCALESTID,
      });
      return false;
    } else if (this._regType === 2) {
      this._provID = myprovID;
      return true;
    } else if (this._regType === 0 && myprovID && myprovID.length > 0) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        warnCode: WorkplaceCSVValidator.PROV_ID_WARNING,
        warnType: 'PROV_ID_WARNING',
        warning: 'PROVNUM will be ignored as not required for this REGTYPE',
        source: myprovID,
        column: 'PROVNUM',
        name: this._currentLine.LOCALESTID,
      });
      return false;
    }
  }

  async _validateLocationID() {
    try {
      // must be given if "share with CQC" - but if given must be in the format "n-nnnnnnnnn"
      const locationIDRegex = /^[0-9]{1}-[0-9]{8,12}$/;
      const myLocationID = this._currentLine.LOCATIONID;

      // do not use
      const mainServiceIsHeadOffice = parseInt(this._currentLine.MAINSERVICE, 10) === 72;
      const locationExists = await models.establishment.findAll({
        where: {
          locationId: myLocationID,
        },
        attributes: ['id', 'locationId'],
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
              errCode: WorkplaceCSVValidator.LOCATION_ID_ERROR,
              errType: 'LOCATION_ID_ERROR',
              error: 'LOCATIONID has not been supplied',
              source: myLocationID,
              column: 'LOCATIONID',
              name: this._currentLine.LOCALESTID,
            });
            return false;
          } else if (!locationIDRegex.test(myLocationID)) {
            this._validationErrors.push({
              lineNumber: this._lineNumber,
              errCode: WorkplaceCSVValidator.LOCATION_ID_ERROR,
              errType: 'LOCATION_ID_ERROR',
              error: 'LOCATIONID is incorrectly formatted',
              source: myLocationID,
              column: 'LOCATIONID',
              name: this._currentLine.LOCALESTID,
            });
            return false;
          }
        }
        if (locationExists.length > 0 && !existingEstablishment) {
          this._validationErrors.push({
            lineNumber: this._lineNumber,
            errCode: WorkplaceCSVValidator.LOCATION_ID_ERROR,
            errType: 'LOCATION_ID_ERROR',
            error: 'LOCATIONID already exists in ASC-WDS please contact Support on 0113 241 0969',
            source: myLocationID,
            column: 'LOCATIONID',
            name: this._currentLine.LOCALESTID,
          });
          return false;
        }

        this._locationID = myLocationID;
        return true;
      } else if (this._regType === 0 && myLocationID && myLocationID.length > 0) {
        this._validationErrors.push({
          lineNumber: this._lineNumber,
          warnCode: WorkplaceCSVValidator.LOCATION_ID_WARNING,
          warnType: 'LOCATION_ID_WARNING',
          warning: 'LOCATIONID will be ignored as not required for this REGTYPE',
          source: myLocationID,
          column: 'LOCATIONID',
          name: this._currentLine.LOCALESTID,
        });
        return false;
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  _validateMainService() {
    const myMainService = parseInt(this._currentLine.MAINSERVICE, 10);

    if (!this._currentLine.MAINSERVICE || this._currentLine.MAINSERVICE.length === 0) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: WorkplaceCSVValidator.MAIN_SERVICE_ERROR,
        errType: 'MAIN_SERVICE_ERROR',
        error: 'MAINSERVICE has not been supplied',
        source: this._currentLine.MAINSERVICE,
        column: 'MAINSERVICE',
        name: this._currentLine.LOCALESTID,
      });
      return false;
    } else if (Number.isNaN(myMainService)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: WorkplaceCSVValidator.MAIN_SERVICE_ERROR,
        errType: 'MAIN_SERVICE_ERROR',
        error: 'MAINSERVICE has not been supplied',
        source: this._currentLine.MAINSERVICE,
        column: 'MAINSERVICE',
        name: this._currentLine.LOCALESTID,
      });
      return false;
    } else {
      this._mainService = myMainService;
      return true;
    }
  }

  _validateAllServices() {
    // all services must have main service in it

    const listOfServices = this._currentLine.ALLSERVICES.split(';');
    const listOfServicesWithoutNo = listOfServices.filter((item) => item !== '0');
    if (!listOfServices || !listOfServices.includes(this._currentLine.MAINSERVICE)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: WorkplaceCSVValidator.ALL_SERVICES_ERROR,
        errType: 'ALL_SERVICES_ERROR',
        error: 'MAINSERVICE is not included in ALLSERVICES',
        source: this._currentLine.ALLSERVICES,
        column: 'ALLSERVICES',
        name: this._currentLine.LOCALESTID,
      });
    }
    if (listOfServices.includes('0') && listOfServicesWithoutNo.length !== 1) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: WorkplaceCSVValidator.ALL_SERVICES_ERROR_NONE,
        errType: 'ALL_SERVICES_ERROR_NONE',
        error: 'ALLSERVICES is 0 (none) but contains services other than the MAINSERVICE',
        source: this._currentLine.ALLSERVICES,
        column: 'ALLSERVICES',
        name: this._currentLine.LOCALESTID,
      });
    }
    const localValidationErrors = [];

    // all services and their service descriptions are semi-colon delimited
    //remove 0 aka NO other services
    const listOfServiceDescriptions = this._currentLine.SERVICEDESC.split(';');
    const listOfServiceDescriptionsWithoutNo = this._prepArray(listOfServiceDescriptions);
    const isValid = listOfServicesWithoutNo.every((thisService) => !Number.isNaN(parseInt(thisService, 10)));
    if (!isValid) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: WorkplaceCSVValidator.ALL_SERVICES_ERROR,
        errType: 'ALL_SERVICES_ERROR',
        error: 'There is an empty element in ALLSERVICES',
        source: this._currentLine.ALLSERVICES,
        column: 'ALLSERVICES',
        name: this._currentLine.LOCALESTID,
      });
    } else if (listOfServicesWithoutNo.length !== listOfServiceDescriptionsWithoutNo.length) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: WorkplaceCSVValidator.ALL_SERVICES_ERROR,
        errType: 'ALL_SERVICES_ERROR',
        error:
          'ALLSERVICES/CAPACITY/UTILISATION/SERVICEDESC do not have the same number of items (i.e. numbers and/or semi colons)',
        source: this._currentLine.SERVICEDESC,
        column: 'ALLSERVICES/CAPACITY/UTILISATION/SERVICEDESC',
        name: this._currentLine.LOCALESTID,
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
              errCode: WorkplaceCSVValidator.ALL_SERVICES_ERROR,
              errType: 'ALL_SERVICES_ERROR',
              error: `SERVICEDESC(${index + 1}) is longer than ${MAX_LENGTH} characters`,
              source: `${this._currentLine.SERVICEDESC} - ${listOfServiceDescriptions[index]}`,
              column: 'SERVICEDESC',
              name: this._currentLine.LOCALESTID,
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
      localValidationErrors.forEach((thisValidation) => this._validationErrors.push(thisValidation));
      return false;
    }

    return true;
  }

  _validateServiceUsers() {
    // service user (optional) is a semi colon delimited list of integers

    const listOfServiceUsers = this._currentLine.SERVICEUSERS.split(';');
    const listOfServiceUsersDescriptions = this._currentLine.OTHERUSERDESC.split(';');

    const localValidationErrors = [];
    if (this._currentLine.SERVICEUSERS && this._currentLine.SERVICEUSERS.length > 0) {
      // which is not valid
      const isValid = this._currentLine.SERVICEUSERS.length
        ? listOfServiceUsers.every((thisService) => !Number.isNaN(parseInt(thisService, 10)))
        : true;
      if (!isValid) {
        localValidationErrors.push({
          lineNumber: this._lineNumber,
          warnCode: WorkplaceCSVValidator.SERVICE_USERS_WARNING,
          warnType: 'SERVICE_USERS_WARNING',
          warning: 'Entry for code in SERVICEUSERS you have supplied will be ignored as this is invalid',
          source: this._currentLine.SERVICEUSERS,
          column: 'SERVICEUSERS',
          name: this._currentLine.LOCALESTID,
        });
      } else if (listOfServiceUsers.length !== listOfServiceUsersDescriptions.length) {
        localValidationErrors.push({
          lineNumber: this._lineNumber,
          errCode: WorkplaceCSVValidator.SERVICE_USERS_ERROR,
          errType: 'SERVICE_USERS_ERROR',
          error: 'SERVICEUSERS/OTHERUSERDESC do not have the same number of items (i.e. numbers and/or semi colons)',
          source: `${this._currentLine.SERVICEUSERS} - ${this._currentLine.OTHERUSERDESC}`,
          column: 'SERVICEUSERS/OTHERUSERDESC',
          name: this._currentLine.LOCALESTID,
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
                warnCode: WorkplaceCSVValidator.SERVICE_USERS_WARNING,
                warnType: 'SERVICE_USERS_WARNING',
                warning: `OTHERUSERDESC(${index + 1}) has not been supplied`,
                source: `${this._currentLine.SERVICEDESC} - ${listOfServiceUsersDescriptions[index]}`,
                column: 'OTHERUSERDESC',
                name: this._currentLine.LOCALESTID,
              });
              myServiceUsersDescriptions.push(null);
            } else if (myServiceUserOther.length > MAX_LENGTH) {
              localValidationErrors.push({
                lineNumber: this._lineNumber,
                errCode: WorkplaceCSVValidator.SERVICE_USERS_ERROR,
                errType: 'SERVICE_USERS_ERROR',
                error: `Service Users (SERVICEUSERS:${index + 1}) is an 'other' service and (OTHERUSERDESC:${
                  index + 1
                }) must not be greater than ${MAX_LENGTH} characters`,
                source: `${this._currentLine.SERVICEDESC} - ${listOfServiceUsersDescriptions[index]}`,
                column: 'OTHERUSERDESC',
                name: this._currentLine.LOCALESTID,
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
      localValidationErrors.forEach((thisValidation) => this._validationErrors.push(thisValidation));
      return false;
    }

    return true;
  }
  _ignoreZerosIfNo(listOfEntities, zeroInService, allServices) {
    if (zeroInService.length > 0 && listOfEntities.length === 2 && allServices.length === 2) {
      const indexOfZero = allServices.indexOf('0');
      if (indexOfZero > -1) {
        listOfEntities[indexOfZero] = listOfEntities[indexOfZero] === '0' ? '' : listOfEntities[indexOfZero];
      }
    }
    return listOfEntities;
  }
  _prepArray(listOfEntities) {
    const allServices = this._currentLine.ALLSERVICES.split(';');
    const zeroInService = allServices.filter((service) => {
      return service === '0';
    });
    listOfEntities = this._ignoreZerosIfNo(listOfEntities, zeroInService, allServices);
    listOfEntities = this._checkForTrailingSemiColon(listOfEntities, zeroInService);
    return listOfEntities;
  }

  _checkForTrailingSemiColon(listOfEntities, zeroInService) {
    if (
      (zeroInService.length !== 0 && listOfEntities.length === 2) ||
      this._currentLine.ALLSERVICES.split(';').length === 1
    ) {
      listOfEntities = listOfEntities.filter((thisItem) => !Number.isNaN(parseInt(thisItem, 10)));
      //make sure listOfEntities always has at least one null for MainService
      return listOfEntities.length === 0 ? [''] : listOfEntities;
    }
    return listOfEntities;
  }
  _validateCapacitiesAndUtilisations() {
    // capacities/utilisations are a semi colon delimited list of integers
    let listOfCapacities = this._currentLine.CAPACITY.split(';');
    let listOfUtilisations = this._currentLine.UTILISATION.split(';');

    //remove excess semicolon when no other services = 0
    listOfCapacities = this._prepArray(listOfCapacities);
    listOfUtilisations = this._prepArray(listOfUtilisations);

    const localValidationErrors = [];

    // first - the number of capacities/utilisations must be non-zero and must be equal
    if (listOfCapacities.length === 0) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: WorkplaceCSVValidator.CAPACITY_UTILISATION_ERROR,
        errType: 'CAPACITY_UTILISATION_ERROR',
        error: 'Capacities (CAPACITY) must be a semi-colon delimited list of whole numbers',
        source: this._currentLine.CAPACITY,
        column: 'CAPACITY',
        name: this._currentLine.LOCALESTID,
      });
    }

    if (listOfUtilisations.length === 0) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: WorkplaceCSVValidator.CAPACITY_UTILISATION_ERROR,
        errType: 'CAPACITY_UTILISATION_ERROR',
        error: 'Utilisations (UTILISATION) must be a semi-colon delimited list of whole numbers',
        source: this._currentLine.UTILISATION,
        column: 'UTILISATION',
        name: this._currentLine.LOCALESTID,
      });
    }

    if (listOfCapacities.length !== listOfUtilisations.length) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: WorkplaceCSVValidator.CAPACITY_UTILISATION_ERROR,
        errType: 'CAPACITY_UTILISATION_ERROR',
        error: 'Number of Capacities (CAPACITY) and Utilisations (UTILISATION) must be equal',
        source: `${this._currentLine.CAPACITY} - ${this._currentLine.UTILISATION}`,
        column: 'CAPACITY/UTILISATION',
        name: this._currentLine.LOCALESTID,
      });
    }

    // and the number of utilisations/capacities must equal the number of all services
    const lengthOfServicesWithoutNo = this._allServices ? this._allServices.filter((item) => item !== 0).length : 0;

    if (this._allServices && listOfCapacities.length !== lengthOfServicesWithoutNo) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: WorkplaceCSVValidator.CAPACITY_UTILISATION_ERROR,
        errType: 'CAPACITY_UTILISATION_ERROR',
        error:
          'Number of Capacities/Utilisations (CAPACITY/UTILISATION) must equal the number of all services (ALLSERVICES)',
        source: `${this._currentLine.CAPACITY} - ${this._currentLine.UTILISATION} - ${this._currentLine.ALLSERVICES}`,
        column: 'CAPACITY/UTILISATION',
        name: this._currentLine.LOCALESTID,
      });
    }

    // all capacities and all utilisations are integers (if given)
    // capacities and utilisations must be less than 999999999
    const MAX_CAP_UTIL = 9999;

    const areCapacitiesValid = listOfCapacities.every(
      (thisCapacity) =>
        thisCapacity === null ||
        thisCapacity.length === 0 ||
        (!Number.isNaN(parseInt(thisCapacity, 10)) && parseInt(thisCapacity, 10) < MAX_CAP_UTIL),
    );
    if (!areCapacitiesValid) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: WorkplaceCSVValidator.CAPACITY_UTILISATION_ERROR,
        errType: 'CAPACITY_UTILISATION_ERROR',
        error: `All capacities (CAPACITY) must be whole numbers and less than ${MAX_CAP_UTIL}`,
        source: this._currentLine.CAPACITY,
        column: 'CAPACITY',
        name: this._currentLine.LOCALESTID,
      });
    }

    const areUtilisationsValid = listOfUtilisations.every(
      (thisUtilisation) =>
        thisUtilisation === null ||
        thisUtilisation.length === 0 ||
        (!Number.isNaN(parseInt(thisUtilisation, 10)) && parseInt(thisUtilisation, 10) < MAX_CAP_UTIL),
    );

    if (!areUtilisationsValid) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: WorkplaceCSVValidator.CAPACITY_UTILISATION_ERROR,
        errType: 'CAPACITY_UTILISATION_ERROR',
        error: `All utilisations (UTILISATION) must be whole numbers and less than ${MAX_CAP_UTIL}`,
        source: this._currentLine.UTILISATION,
        column: 'UTILISATION',
        name: this._currentLine.LOCALESTID,
      });
    }

    if (localValidationErrors.length > 0) {
      localValidationErrors.forEach((thisValidation) => this._validationErrors.push(thisValidation));
      return false;
    }
    this._capacities = listOfCapacities.map((thisCapacity) => {
      const intCapacity = parseInt(thisCapacity, 10);
      if (isNaN(intCapacity)) {
        return null;
      } else {
        return intCapacity;
      }
    });
    this._utilisations = listOfUtilisations.map((thisUtilisation) => {
      const intUtilisation = parseInt(thisUtilisation, 10);
      if (isNaN(intUtilisation)) {
        return null;
      } else {
        return intUtilisation;
      }
    });

    return true;
  }

  _validateTotalPermTemp() {
    // mandatory
    const MAX_TOTAL = 999;
    const myTotalPermTemp = parseInt(this._currentLine.TOTALPERMTEMP, 10);
    const HEAD_OFFICE_MAIN_SERVICE = 72;

    if (myTotalPermTemp.length === 0) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: WorkplaceCSVValidator.TOTAL_PERM_TEMP_ERROR,
        errType: 'TOTAL_PERM_TEMP_ERROR',
        error: 'TOTALPERMTEMP is missing',
        source: this._currentLine.PERMCQC,
        column: 'TOTALPERMTEMP',
        name: this._currentLine.LOCALESTID,
      });
      return false;
    } else if (myTotalPermTemp < 0 || myTotalPermTemp > MAX_TOTAL || Number.isNaN(myTotalPermTemp)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: WorkplaceCSVValidator.TOTAL_PERM_TEMP_ERROR,
        errType: 'TOTAL_PERM_TEMP_ERROR',
        error: `TOTALPERMTEMP must be a number from 0 to ${MAX_TOTAL} if this is correct call support on 0113 241 0969`,
        source: myTotalPermTemp,
        column: 'TOTALPERMTEMP',
        name: this._currentLine.LOCALESTID,
      });
      return false;
    } else if (this._mainService && this.mainService !== HEAD_OFFICE_MAIN_SERVICE && myTotalPermTemp === 0) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: WorkplaceCSVValidator.TOTAL_PERM_TEMP_ERROR,
        errType: 'TOTAL_PERM_TEMP_ERROR',
        error: 'Total Permanent and Temporary (TOTALPERMTEMP) cannot be 0 except when MAINSERVICE is head office',
        source: myTotalPermTemp,
        column: 'TOTALPERMTEMP',
        name: this._currentLine.LOCALESTID,
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
      errCode: WorkplaceCSVValidator.DUPLICATE_ERROR,
      errType: 'DUPLICATE_ERROR',
      error: 'LOCATIONID is not unique',
      source: this._currentLine.LOCATIONID,
      column: 'LOCATIONID',
      name: this._currentLine.LOCALESTID,
    };
  }

  getTotal(allWorkers) {
    let total = 0;
    for (let totalInRole of allWorkers.split(';')) {
      if (totalInRole !== '999') {
        total += parseInt(totalInRole);
      }
    }
    return total;
  }

  _crossValidateTotalPermTemp(csvEstablishmentSchemaErrors, { employedWorkers = 0, nonEmployedWorkers = 0 }) {
    const vacancies = this.getTotal(this._currentLine.VACANCIES);
    const starters = this.getTotal(this._currentLine.STARTERS);
    const leavers = this.getTotal(this._currentLine.LEAVERS);

    const template = {
      origin: 'Establishments',
      lineNumber: this._lineNumber,
      source: this._currentLine.TOTALPERMTEMP,
      name: this._currentLine.LOCALESTID,
    };

    const totalStaff = employedWorkers + nonEmployedWorkers;

    if (this._totalPermTemp !== totalStaff) {
      csvEstablishmentSchemaErrors.unshift(
        Object.assign(clonedeep(template), {
          warnCode: WorkplaceCSVValidator.TOTAL_PERM_TEMP_WARNING,
          warnType: 'TOTAL_PERM_TEMP_WARNING',
          warning: 'TOTALPERMTEMP (Total staff and the number of worker records) does not match',
          column: 'TOTALPERMTEMP',
        }),
      );
    } else if (this._totalPermTemp === totalStaff) {
      if (starters > totalStaff) {
        csvEstablishmentSchemaErrors.unshift(
          Object.assign(clonedeep(template), {
            warnCode: WorkplaceCSVValidator.STARTERS_WARNING,
            warnType: 'STARTERS_WARNING',
            warning:
              'STARTERS data you have entered does not fall within the expected range please ensure this is correct',
            column: 'STARTERS',
          }),
        );
      }
      if (leavers >= totalStaff) {
        csvEstablishmentSchemaErrors.unshift(
          Object.assign(clonedeep(template), {
            warnCode: WorkplaceCSVValidator.LEAVERS_WARNING,
            warnType: 'LEAVERS_WARNING',
            warning:
              'LEAVERS data you have entered does not fall within the expected range please ensure this is correct',
            column: 'LEAVERS',
          }),
        );
      }
      if (vacancies >= totalStaff) {
        csvEstablishmentSchemaErrors.unshift(
          Object.assign(clonedeep(template), {
            warnCode: WorkplaceCSVValidator.VACANCIES_WARNING,
            warnType: 'VACANCIES_WARNING',
            warning:
              'VACANCIES data you have entered does not fall within the expected range please ensure this is correct',
            column: 'VACANCIES',
          }),
        );
      }
    }
  }

  _validateAllJobs() {
    // optional
    const allJobs = this._currentLine.ALLJOBROLES ? this._currentLine.ALLJOBROLES.split(';') : [];
    const localValidationErrors = [];
    const vacancies = this._currentLine.VACANCIES.split(';');
    const starters = this._currentLine.STARTERS.split(';');
    const leavers = this._currentLine.LEAVERS.split(';');
    const myRegType = parseInt(this._currentLine.REGTYPE, 10);

    const isCQCRegulated = myRegType === 2;

    const hasRegisteredManagerVacancy = () => {
      let regManagerVacancies = 0;
      allJobs.map((job, index) => {
        if (parseInt(job, 10) === regManager && parseInt(vacancies[index], 10) > 0) regManagerVacancies++;
      });
      return regManagerVacancies > 0;
    };

    // allJobs can only be empty, if TOTALPERMTEMP is 0
    if (!this._currentLine.ALLJOBROLES || this._currentLine.ALLJOBROLES.length === 0) {
      if (
        []
          .concat(vacancies)
          .concat(starters)
          .concat(leavers)
          .findIndex((item) => {
            item = parseInt(item, 10);

            return Number.isInteger(item) && item > 0 && item !== 999;
          }) !== -1
      ) {
        localValidationErrors.push({
          lineNumber: this._lineNumber,
          errCode: WorkplaceCSVValidator.ALL_JOBS_ERROR,
          errType: 'ALL_JOBS_ERROR',
          error: 'ALLJOBROLES cannot be blank as you have STARTERS, LEAVERS, VACANCIES greater than zero',
          source: this._currentLine.ALLJOBROLES,
          column: 'ALLJOBROLES',
          name: this._currentLine.LOCALESTID,
        });
      }
    } else if (this._currentLine.ALLJOBROLES && this._currentLine.ALLJOBROLES.length > 0) {
      // all jobs are integers
      const isValid = allJobs.every((thisJob) => !Number.isNaN(parseInt(thisJob, 10)));
      if (!isValid) {
        localValidationErrors.push({
          lineNumber: this._lineNumber,
          errCode: WorkplaceCSVValidator.ALL_JOBS_ERROR,
          errType: 'ALL_JOBS_ERROR',
          error: 'All Job Roles (ALLJOBROLES) must be whole numbers',
          source: this._currentLine.ALLJOBROLES,
          column: 'ALLJOBROLES',
          name: this._currentLine.LOCALESTID,
        });
      }
      if (!isCQCRegulated && hasRegisteredManagerVacancy()) {
        localValidationErrors.push({
          lineNumber: this._lineNumber,
          warnCode: WorkplaceCSVValidator.ALL_JOBS_WARNING,
          warnType: 'ALL_JOBS_WARNING',
          warning: 'Vacancy for Registered Manager should not be included for this service and will be ignored',
          source: this._currentLine.ALLJOBROLES,
          column: 'VACANCY',
          name: this._currentLine.LOCALESTID,
        });
      }
    }

    // Need to add if they currently have a registered manager
    // if (this._currentLine.ALLJOBROLES && this._currentLine.ALLJOBROLES.length > 0 && isCQCRegulated && !hasRegisteredManagerVacancy()) {
    //   localValidationErrors.push({
    //     lineNumber: this._lineNumber,
    //     errCode: WorkplaceCSVValidator.ALL_JOBS_ERROR,
    //     errType: 'ALL_JOBS_ERROR',
    //     error: 'You do not have a staff record for a Registered Manager therefore must record a vacancy for one',
    //     source: this._currentLine.ALLJOBROLES,
    //     name: this._currentLine.LOCALESTID
    //   });
    // }
    if (localValidationErrors.length > 0) {
      localValidationErrors.forEach((thisValidation) => this._validationErrors.push(thisValidation));
      return false;
    }

    this._alljobs = allJobs.map((thisJob) => parseInt(thisJob, 10));

    return true;
  }

  _crossValidateAllJobRoles(csvEstablishmentSchemaErrors, registeredManager) {
    const template = {
      origin: 'Establishments',
      lineNumber: this._lineNumber,
      errCode: WorkplaceCSVValidator.ALL_JOBS_ERROR,
      errType: 'ALL_JOBS_ERROR',
      source: this._currentLine.ALLJOBROLES,
      name: this._currentLine.LOCALESTID,
    };
    const allJobs = this._currentLine.ALLJOBROLES.split(';');
    const vacancies = this._currentLine.VACANCIES.split(';');
    const myRegType = parseInt(this._currentLine.REGTYPE, 10);

    const isCQCRegulated = myRegType === 2;
    const notHeadOffice = this._currentLine.MAINSERVICE !== '72'; // Head Office ID

    const hasRegisteredManagerVacancy = () => {
      let regManagerVacancies = 0;
      allJobs.map((job, index) => {
        if (parseInt(job, 10) === regManager && parseInt(vacancies[index], 10) > 0) regManagerVacancies++;
      });
      return regManagerVacancies > 0;
    };

    if (isCQCRegulated && !hasRegisteredManagerVacancy() && registeredManager === 0 && notHeadOffice) {
      csvEstablishmentSchemaErrors.unshift(
        Object.assign(template, {
          error: 'You do not have a staff record for a Registered Manager therefore must record a vacancy for one',
          column: 'VACANCY',
        }),
      );
    }
  }

  // includes perm, temp, pool, agency, student, voluntary and other counts
  // includes vacancies, starters and leavers, total vacancies, total starters and total leavers
  _validateJobRoleTotals() {
    // mandatory
    const vacancies = this._currentLine.VACANCIES.split(';');
    const starters = this._currentLine.STARTERS.split(';');
    const leavers = this._currentLine.LEAVERS.split(';');
    const localValidationErrors = [];
    const allJobsCount = this._alljobs ? this._alljobs.length : 0;
    const DONT_KNOW = '999'; // MUST BE A STRING VALUE!!!!!
    const NONE = '0';

    if (allJobsCount === 0) {
      // no jobs defined, so ignore starters, leavers and vacancies
      if (vacancies[0] === DONT_KNOW) {
        this._vacancies = [parseInt(DONT_KNOW)];
      } else if (vacancies[0] === NONE) {
        this._vacancies = [parseInt(NONE)];
      }
      if (starters[0] === DONT_KNOW) {
        this._starters = [parseInt(DONT_KNOW)];
      } else if (starters[0] === NONE) {
        this._starters = [parseInt(NONE)];
      }
      if (leavers[0] === DONT_KNOW) {
        this._leavers = [parseInt(DONT_KNOW)];
      } else if (leavers[0] === NONE) {
        this._leavers = [parseInt(NONE)];
      }
      return true;
    }

    // all counts must have the same number of entries as all job roles
    //  - except starters, leavers and vacancies can be a single value of 999

    if (!((vacancies.length === 1 && vacancies[0] === DONT_KNOW) || vacancies.length === allJobsCount)) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: WorkplaceCSVValidator.VACANCIES_ERROR,
        errType: 'VACANCIES_ERROR',
        error: 'ALLJOBROLES and VACANCIES do not have the same number of items (i.e. numbers and/or semi colons).',
        source: `${this._currentLine.VACANCIES} - ${this._currentLine.ALLJOBROLES}`,
        column: 'ALLJOBROLES/VACANCIES',
        name: this._currentLine.LOCALESTID,
      });
    }

    if (!((starters.length === 1 && starters[0] === DONT_KNOW) || starters.length === allJobsCount)) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: WorkplaceCSVValidator.STARTERS_ERROR,
        errType: 'STARTERS_ERROR',
        error: 'ALLJOBROLES and STARTERS do not have the same number of items (i.e. numbers and/or semi colons).',
        source: `${this._currentLine.STARTERS} - ${this._currentLine.ALLJOBROLES}`,
        column: 'ALLJOBROLES/STARTERS',
        name: this._currentLine.LOCALESTID,
      });
    }

    if (!((leavers.length === 1 && leavers[0] === DONT_KNOW) || leavers.length === allJobsCount)) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: WorkplaceCSVValidator.LEAVERS_ERROR,
        errType: 'LEAVERS_ERROR',
        error: 'ALLJOBROLES and LEAVERS do not have the same number of items (i.e. numbers and/or semi colons).',
        source: `${this._currentLine.LEAVERS} - ${this._currentLine.ALLJOBROLES}`,
        column: 'ALLJOBROLES/LEAVERS',
        name: this._currentLine.LOCALESTID,
      });
    }

    // all counts must be integers and greater than/equal to zero
    const MIN_COUNT = 0;
    const MAX_COUNT = 999999999;

    if (
      !vacancies.every(
        (thisCount) =>
          !Number.isNaN(parseInt(thisCount, 10)) &&
          parseInt(thisCount, 10) >= MIN_COUNT &&
          parseInt(thisCount, 10) <= MAX_COUNT,
      )
    ) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: WorkplaceCSVValidator.VACANCIES_ERROR,
        errType: 'VACANCIES_ERROR',
        error: `Vacancies (VACANCIES) values must be whole numbers and ${MIN_COUNT} or more but less than ${MAX_COUNT}`,
        source: `${this._currentLine.VACANCIES}`,
        column: 'VACANCIES',
        name: this._currentLine.LOCALESTID,
      });
    }

    if (
      !starters.every(
        (thisCount) =>
          !Number.isNaN(parseInt(thisCount, 10)) &&
          parseInt(thisCount, 10) >= MIN_COUNT &&
          parseInt(thisCount, 10) <= MAX_COUNT,
      )
    ) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: WorkplaceCSVValidator.STARTERS_ERROR,
        errType: 'STARTERS_ERROR',
        error: `Starters (STARTERS) values must be whole numbers and ${MIN_COUNT} or more but less than ${MAX_COUNT}`,
        source: `${this._currentLine.STARTERS}`,
        column: 'STARTERS',
        name: this._currentLine.LOCALESTID,
      });
    }

    if (
      !leavers.every(
        (thisCount) =>
          !Number.isNaN(parseInt(thisCount, 10)) &&
          parseInt(thisCount, 10) >= MIN_COUNT &&
          parseInt(thisCount, 10) <= MAX_COUNT,
      )
    ) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: WorkplaceCSVValidator.LEAVERS_ERROR,
        errType: 'LEAVERS_ERROR',
        error: `Leavers (LEAVERS) values must be whole numbers and ${MIN_COUNT} or more but less than ${MAX_COUNT}`,
        source: `${this._currentLine.LEAVERS}`,
        column: 'LEAVERS',
        name: this._currentLine.LOCALESTID,
      });
    }

    if (localValidationErrors.length > 0) {
      localValidationErrors.forEach((thisValidation) => this._validationErrors.push(thisValidation));
      return false;
    }

    this._vacancies = vacancies.map((thisCount) => parseInt(thisCount, 10));
    this._starters = starters.map((thisCount) => parseInt(thisCount, 10));
    this._leavers = leavers.map((thisCount) => parseInt(thisCount, 10));

    // remove RM vacancy
    if (this._allJobs && this._allJobs.length) {
      this._allJobs.map((job, index) => {
        if (job === regManager && this._vacancies[index] > 0) this._vacancies[index] = 0;
      });
    }

    if (localValidationErrors.length > 0) {
      localValidationErrors.forEach((thisValidation) => this._validationErrors.push(thisValidation));
      return false;
    }

    return true;
  }

  _validateRepeatTraining() {
    const ALLOWED_VALUES = ['1', '2', '3', '4', ''];

    if (!ALLOWED_VALUES.includes(this._currentLine.REPEATTRAINING)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: WorkplaceCSVValidator.REPEAT_TRAINING_ERROR,
        errType: 'REPEAT_TRAINING_ERROR',
        error: 'The code you have entered for REPEATTRAINING is incorrect',
        source: this._currentLine.REPEATTRAINING,
        column: 'REPEATTRAINING',
        name: this._currentLine.LOCALESTID,
      });
      return false;
    } else {
      const repeatTrainingAsInt = parseInt(this._currentLine.REPEATTRAINING, 10);

      this._doNewStartersRepeatMandatoryTrainingFromPreviousEmployment = Number.isNaN(repeatTrainingAsInt)
        ? this._currentLine.REPEATTRAINING
        : repeatTrainingAsInt;
      return true;
    }
  }

  _validateAcceptCareCertificate() {
    const ALLOWED_VALUES = ['1', '2', '3', '4', ''];

    if (!ALLOWED_VALUES.includes(this._currentLine.ACCEPTCARECERT)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: WorkplaceCSVValidator.ACCEPT_CARE_CERT_ERROR,
        errType: 'ACCEPT_CARE_CERT_ERROR',
        error: 'The code you have entered for ACCEPTCARECERT is incorrect',
        source: this._currentLine.ACCEPTCARECERT,
        column: 'ACCEPTCARECERT',
        name: this._currentLine.LOCALESTID,
      });
      return false;
    } else {
      const acceptCareCertAsInt = parseInt(this._currentLine.ACCEPTCARECERT, 10);

      this._wouldYouAcceptCareCertificatesFromPreviousEmployment = Number.isNaN(acceptCareCertAsInt)
        ? this._currentLine.ACCEPTCARECERT
        : acceptCareCertAsInt;
      return true;
    }
  }

  _validateInterviews() {
    const interviewsRegex = /^[0-9]*$/;
    const interviews = this._currentLine.INTERVIEWS;

    if (!interviewsRegex.test(interviews) && interviews.toLowerCase() !== 'unknown') {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: WorkplaceCSVValidator.INTERVIEWS_ERROR,
        errType: 'INTERVIEWS_ERROR',
        error: "The code you entered for INTERVIEWS should be a whole number or the value 'unknown'",
        source: interviews,
        column: 'INTERVIEWS',
        name: this.currentLine.LOCALESTID,
      });
      return false;
    } else {
      this._peopleInterviewedInTheLastFourWeeks = interviews;
      return true;
    }
  }

  _validateAdvertising() {
    const advertisingRegex = /^\d*(\.\d{1,2})?$/;
    const advertising = this._currentLine.ADVERTISING;

    if (!advertisingRegex.test(advertising) && advertising.toLowerCase() !== 'unknown') {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: WorkplaceCSVValidator.ADVERTISING_ERROR,
        errType: 'ADVERTISING_ERROR',
        error: "The code you entered for ADVERTISING should be a number in pounds and pence or the value 'unknown'",
        source: advertising,
        column: 'ADVERTISING',
        name: this.currentLine.LOCALESTID,
      });
      return false;
    } else {
      this._moneySpentOnAdvertisingInTheLastFourWeeks = advertising;
      return true;
    }
  }

  _validateBenefits() {
    const benefitsRegex = /^\d*(\.\d{1,2})?$/;
    const benefits = this._currentLine.BENEFITS.split(';').join('');

    const localValidationErrors = [];
    if (!benefitsRegex.test(benefits) && benefits.toLowerCase() !== 'unknown') {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        warnCode: WorkplaceCSVValidator.BENEFITS_WARNING,
        warnType: 'BENEFITS_WARNING',
        warning: 'The code you have entered for BENEFITS is incorrect and will be ignored',
        source: benefits,
        column: 'BENEFITS',
        name: this.currentLine.LOCALESTID,
      });
    } else {
      this._careWorkersCashLoyaltyForFirstTwoYears = this._currentLine.BENEFITS;

      return true;
    }

    if (localValidationErrors.length > 0) {
      localValidationErrors.forEach((thisValidation) => this._validationErrors.push(thisValidation));
      return false;
    }
    return true;
  }

  _validateSickPay() {
    const ALLOWED_VALUES = ['0', '1', ''];
    const sickpay = this._currentLine.SICKPAY;

    const localValidationErrors = [];
    if (!ALLOWED_VALUES.includes(this._currentLine.SICKPAY) && sickpay.toLowerCase() !== 'unknown') {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        warnCode: WorkplaceCSVValidator.SICKPAY_WARNING,
        warnType: 'SICKPAY_WARNING',
        warning: 'The code you have entered for SICKPAY is incorrect and will be ignored',
        source: this._currentLine.SICKPAY,
        column: 'SICKPAY',
        name: this._currentLine.LOCALESTID,
      });
    } else {
      const sickPayAsInt = parseInt(this._currentLine.SICKPAY, 10);

      this._sickPay = Number.isNaN(sickPayAsInt) ? this._currentLine.SICKPAY : sickPayAsInt;
      return true;
    }
    if (localValidationErrors.length > 0) {
      localValidationErrors.forEach((thisValidation) => this._validationErrors.push(thisValidation));
      return false;
    }
    return true;
  }

  _validateHoliday() {
    const holidayRegex = /^[0-9]*$/;
    const holiday = this._currentLine.HOLIDAY;

    const localValidationErrors = [];
    if (!holidayRegex.test(holiday)) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        warnCode: WorkplaceCSVValidator.HOLIDAY_WARNING,
        warnType: 'HOLIDAY_WARNING',
        warning: 'The code you have entered for HOLIDAY is incorrect and will be ignored',
        source: this._currentLine.HOLIDAY,
        column: 'HOLIDAY',
        name: this._currentLine.LOCALESTID,
      });
    } else {
      this._careWorkersLeaveDaysPerYear = holiday;
      return true;
    }
    if (localValidationErrors.length > 0) {
      localValidationErrors.forEach((thisValidation) => this._validationErrors.push(thisValidation));
      return false;
    }
    return true;
  }

  _validatePensionContribution() {
    const ALLOWED_VALUES = ['0', '1', ''];
    const pension = this._currentLine.PENSION;

    const localValidationErrors = [];
    if (!ALLOWED_VALUES.includes(this._currentLine.PENSION) && pension.toLowerCase() !== 'unknown') {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        warnCode: WorkplaceCSVValidator.PENSION_WARNING,
        warnType: 'PENSION_WARNING',
        warning: 'The code you have entered for PENSION is incorrect and will be ignored',
        source: this._currentLine.PENSION,
        column: 'PENSION',
        name: this._currentLine.LOCALESTID,
      });
    } else {
      const pensionAsInt = parseInt(this._currentLine.PENSION, 10);

      this._pensionContribution = Number.isNaN(pensionAsInt) ? this._currentLine.PENSION : pensionAsInt;
      return true;
    }
    if (localValidationErrors.length > 0) {
      localValidationErrors.forEach((thisValidation) => this._validationErrors.push(thisValidation));
      return false;
    }
    return true;
  }

  _validateNoChange() {
    let localValidationErrors = [];
    var thisEstablishment = this._allCurrentEstablishments.find(
      (establishment) =>
        establishment.localIdentifier.replace(/\s/g, '') === this._currentLine.LOCALESTID.replace(/\s/g, ''),
    );
    const startersSavedAt = moment(thisEstablishment._properties.get('Starters').savedAt);

    const starterWarning = this._getStartersNoChangeWarning();
    localValidationErrors = this._startersLeaverVacanciesWarnings(
      thisEstablishment.starters,
      this.starters,
      startersSavedAt,
      localValidationErrors,
      starterWarning,
    );

    const leaversSavedAt = moment(thisEstablishment._properties.get('Leavers').savedAt);
    const leaverWarning = this._getLeaversNoChangeWarning();
    localValidationErrors = this._startersLeaverVacanciesWarnings(
      thisEstablishment.leavers,
      this.leavers,
      leaversSavedAt,
      localValidationErrors,
      leaverWarning,
    );

    const vacanciesSavedAt = moment(thisEstablishment._properties.get('Vacancies').savedAt);
    const vacanciesWarning = this._getVacanciesNoChangeWarning();
    localValidationErrors = this._startersLeaverVacanciesWarnings(
      thisEstablishment.vacancies,
      this.vacancies,
      vacanciesSavedAt,
      localValidationErrors,
      vacanciesWarning,
    );

    if (localValidationErrors.length > 0) {
      localValidationErrors.forEach((thisValidation) => this._validationErrors.push(thisValidation));
      return false;
    }
    return true;
  }

  _startersLeaverVacanciesWarnings(dbValues, buValues, savedAt, localValidationErrors, warning) {
    if (!savedAt.isSame(Date.now(), 'day')) {
      if (!Array.isArray(this.allJobs)) return localValidationErrors;
      let isSame = true;
      for (var i = 0; i < this.allJobs.length; i++) {
        const mappedRole = BUDI.jobRoles(BUDI.TO_ASC, parseInt(this.allJobs[i]));
        const buValue = buValues && buValues[i] ? buValues[i] : null;
        if (dbValues && Array.isArray(dbValues) && dbValues.length > 0) {
          const starterJob = dbValues.find((job) => job.jobId === mappedRole);

          if ((starterJob && starterJob.total !== buValue) || (!starterJob && buValue > 0)) {
            isSame = false;
            break;
          }
        } else {
          if (buValue > 0) {
            isSame = false;
            break;
          }
        }
      }
      if (this.allJobs && this.allJobs.length === 0 && dbValues && Array.isArray(dbValues) && dbValues.length > 0)
        isSame = false;
      if (isSame) {
        localValidationErrors.push(warning);
      }
    }
    return localValidationErrors;
  }

  _getStartersNoChangeWarning() {
    return {
      lineNumber: this._lineNumber,
      warnCode: WorkplaceCSVValidator.STARTERS_WARNING,
      warnType: 'STARTERS_WARNING',
      warning: 'STARTERS in the last 12 months has not changed please check this is correct',
      source: this.starters,
      column: 'STARTERS',
      name: this._currentLine.LOCALESTID,
    };
  }
  _getVacanciesNoChangeWarning() {
    return {
      lineNumber: this._lineNumber,
      warnCode: WorkplaceCSVValidator.VACANCIES_WARNING,
      warnType: 'VACANCIES_WARNING',
      warning: 'VACANCIES value has not changed please check this is correct',
      source: this.vacancies,
      column: 'VACANCIES',
      name: this._currentLine.LOCALESTID,
    };
  }
  _getLeaversNoChangeWarning() {
    return {
      lineNumber: this._lineNumber,
      warnCode: WorkplaceCSVValidator.LEAVERS_WARNING,
      warnType: 'LEAVERS_WARNING',
      warning: 'LEAVERS in the last 12 months has not changed please check this is correct',
      source: this.leavers,
      column: 'LEAVERS',
      name: this._currentLine.LOCALESTID,
    };
  }

  _validateReasonsForLeaving() {
    // only if the sum of "LEAVERS" is greater than 0
    const sumOfLeavers =
      this._leavers && Array.isArray(this._leavers) && this._leavers[0] !== 999
        ? this._leavers.reduce((total, thisCount) => total + thisCount)
        : 0;

    if (sumOfLeavers > 0 && this._currentLine.REASONS && this._currentLine.REASONS.length > 0) {
      const allReasons = this._currentLine.REASONS.split(';');
      const allReasonsCounts = this._currentLine.REASONNOS.split(';');

      const localValidationErrors = [];

      if (!allReasons.every((thisCount) => !Number.isNaN(parseInt(thisCount, 10)))) {
        localValidationErrors.push({
          lineNumber: this._lineNumber,
          errCode: WorkplaceCSVValidator.REASONS_FOR_LEAVING_ERROR,
          errType: 'REASONS_FOR_LEAVING_ERROR',
          error: 'The REASONS you have supplied has an incorrect code',
          source: `${this._currentLine.REASONS}`,
          column: 'REASONS',
          name: this._currentLine.LOCALESTID,
        });
      }

      if (!allReasonsCounts || allReasonsCounts.length === 0) {
        localValidationErrors.push({
          lineNumber: this._lineNumber,
          errCode: WorkplaceCSVValidator.REASONS_FOR_LEAVING_ERROR,
          errType: 'REASONS_FOR_LEAVING_ERROR',
          error: 'REASONS/REASONNOS do not have the same number of items (i.e. numbers and/or semi colons)',
          source: this._currentLine.REASONNOS,
          column: 'REASONS/REASONNOS',
          name: this._currentLine.LOCALESTID,
        });
      }

      const MIN_COUNT = 0;

      if (
        !allReasonsCounts.every(
          (thisCount) => !Number.isNaN(parseInt(thisCount, 10)) || parseInt(thisCount, 10) < MIN_COUNT,
        )
      ) {
        localValidationErrors.push({
          lineNumber: this._lineNumber,
          errCode: WorkplaceCSVValidator.REASONS_FOR_LEAVING_ERROR,
          errType: 'REASONS_FOR_LEAVING_ERROR',
          error: `Reasons for Leaving Counts (REASONNOS) values must be whole numbers and ${MIN_COUNT} or more`,
          source: `${this._currentLine.REASONNOS}`,
          column: 'REASONNOS',
          name: this._currentLine.LOCALESTID,
        });
      }

      // all reasons and all reasons counts must be equal in number
      if (allReasons.length !== allReasonsCounts.length) {
        localValidationErrors.push({
          lineNumber: this._lineNumber,
          errCode: WorkplaceCSVValidator.REASONS_FOR_LEAVING_ERROR,
          errType: 'REASONS_FOR_LEAVING_ERROR',
          error: 'REASONS/REASONNOS do not have the same number of items (i.e. numbers and/or semi colons)',
          source: `${this._currentLine.REASON} - ${this._currentLine.REASONNOS}`,
          column: 'REASONS/REASONNOS',
          name: this._currentLine.LOCALESTID,
        });
      }

      // sum of  all reasons counts must equal the sum of leavers
      const sumOfReasonsCounts = allReasonsCounts.reduce(
        (total, thisCount) => parseInt(total, 10) + parseInt(thisCount, 10),
      );

      if (parseInt(sumOfReasonsCounts) !== parseInt(sumOfLeavers)) {
        localValidationErrors.push({
          lineNumber: this._lineNumber,
          errCode: WorkplaceCSVValidator.REASONS_FOR_LEAVING_ERROR,
          errType: 'REASONS_FOR_LEAVING_ERROR',
          error: 'The total number of REASONNOS you have entered does not equal the total number of LEAVERS',
          source: `${this._currentLine.REASONNOS} (${sumOfReasonsCounts}) - ${this._currentLine.LEAVERS} (${sumOfLeavers})`,
          column: 'REASONNOS/LEAVERS',
          name: this._currentLine.LOCALESTID,
        });
      }

      if (localValidationErrors.length > 0) {
        localValidationErrors.forEach((thisValidation) => this._validationErrors.push(thisValidation));
        return false;
      }

      this._reasonsForLeaving = allReasons.map((thisReason, index) => {
        return {
          id: parseInt(thisReason, 10),
          count: parseInt(allReasonsCounts[index], 10),
        };
      });

      return true;
    } else {
      return true;
    }
  }

  _transformMainService() {
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
          other: mainServiceOther || undefined,
        };
      } else {
        this._validationErrors.push({
          lineNumber: this._lineNumber,
          errCode: WorkplaceCSVValidator.MAIN_SERVICE_ERROR,
          errType: 'MAIN_SERVICE_ERROR',
          error: 'The code you have entered for MAINSERVICE is incorrect',
          source: this._currentLine.MAINSERVICE,
          column: 'MAINSERVICE',
          name: this._currentLine.LOCALESTID,
        });
      }
    }
  }

  _transformAllServices() {
    if (this._allServices && Array.isArray(this._allServices)) {
      const mappedServices = [];

      this._allServices.forEach((thisService) => {
        let thisMappedService = null;
        if (thisService !== 0) {
          thisMappedService = BUDI.services(BUDI.TO_ASC, thisService);
        }
        if (thisMappedService) {
          mappedServices.push(thisMappedService);
        } else if (thisService == 0) {
          mappedServices.push(0);
        } else {
          this._validationErrors.push({
            lineNumber: this._lineNumber,
            errCode: WorkplaceCSVValidator.ALL_SERVICES_ERROR,
            errType: 'ALL_SERVICES_ERROR',
            error: `All Services (ALLSERVICES): ${thisService} is unknown`,
            source: this._currentLine.ALLSERVICES,
            column: 'ALLSERVICES',
            name: this._currentLine.LOCALESTID,
          });
        }
      });

      this._allServices = mappedServices;
    }
  }

  _transformServiceUsers() {
    if (this._allServiceUsers && Array.isArray(this._allServiceUsers)) {
      const mappedServices = [];

      this._allServiceUsers.forEach((thisService) => {
        const thisMappedService = BUDI.serviceUsers(BUDI.TO_ASC, thisService);

        if (thisMappedService) {
          mappedServices.push(thisMappedService);
        } else {
          this._validationErrors.push({
            lineNumber: this._lineNumber,
            warnCode: WorkplaceCSVValidator.SERVICE_USERS_ERROR,
            warnType: 'SERVICE_USERS_ERROR',
            warning: `Entry for code ${thisService} in SERVICEUSERS will be ignored as this is invalid`,
            source: this._currentLine.SERVICEUSERS,
            column: 'SERVICEUSERS',
            name: this._currentLine.LOCALESTID,
          });
        }
      });

      this._allServiceUsers = mappedServices;
    }
  }

  _transformEstablishmentType() {
    // integer in source; enum in target
    if (this._establishmentType) {
      if (BUDI.establishmentType(BUDI.TO_ASC, this._establishmentType) === null) {
        this._validationErrors.push({
          lineNumber: this._lineNumber,
          errCode: WorkplaceCSVValidator.ESTABLISHMENT_TYPE_ERROR,
          errType: 'ESTABLISHMENT_TYPE_ERROR',
          error: `WorkplaceCSVValidator Type (ESTTYPE): ${this._establishmentType} is unknown`,
          source: this._currentLine.ESTTYPE,
          column: 'ESTTYPE',
          name: this._currentLine.LOCALESTID,
        });
      }
    }
  }

  _transformAllCapacities() {
    if (this._capacities && Array.isArray(this._capacities) && this._allServices) {
      const mappedCapacities = [];

      // capacities start out as a positional array including nulls
      //  where the position of the capacity correlates to the service (id) in the same
      //  position in _allServices
      this._capacities.forEach((thisCapacity, index) => {
        // we're only interested in non null capacities to map
        if (thisCapacity !== null) {
          //if the allservices is 0 then there can only be 2 allservices
          const allServiceIndex = this._allServices[index] === 0 ? 1 : index;

          // we need to map from service id to service capacity id
          const thisMappedCapacity = BUDI.capacity(BUDI.TO_ASC, this._allServices[allServiceIndex]);

          if (thisMappedCapacity) {
            mappedCapacities.push({
              questionId: thisMappedCapacity,
              answer: thisCapacity,
            });
          } else {
            this._validationErrors.push({
              lineNumber: this._lineNumber,
              errCode: WorkplaceCSVValidator.CAPACITY_UTILISATION_ERROR,
              errType: 'CAPACITY_UTILISATION_ERROR',
              error: `Capacities (CAPACITY): position ${
                index + 1
              } is unexpected capacity (no expected capacity for given service: ${thisMappedCapacity})`,
              source: this._currentLine.CAPACITY,
              column: 'CAPACITY',
              name: this._currentLine.LOCALESTID,
            });
          }
        }
      });

      this._capacities = mappedCapacities;
    }
  }

  _transformAllUtilisation() {
    if (this._utilisations && Array.isArray(this._utilisations) && this._allServices) {
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
              answer: thisUtilisation,
            });
          } else {
            this._validationErrors.push({
              lineNumber: this._lineNumber,
              errCode: WorkplaceCSVValidator.CAPACITY_UTILISATION_ERROR,
              errType: 'CAPACITY_UTILISATION_ERROR',
              error: `UTILISATION for SERVICETYPE ${serviceType} will be ignored as it is not required for this service`,
              source: this._currentLine.UTILISATION,
              column: 'UTILISATION',
              name: this._currentLine.LOCALESTID,
            });
          }
        }
      });

      this._utilisations = mappedUtilisations;
    }
  }

  _transformAllJobs() {
    if (this._alljobs && Array.isArray(this._alljobs)) {
      const mappedJobs = [];

      this._alljobs.forEach((thisJob) => {
        const thisMappedJob = BUDI.jobRoles(BUDI.TO_ASC, thisJob);

        if (thisMappedJob) {
          mappedJobs.push(thisMappedJob);
        } else {
          this._validationErrors.push({
            lineNumber: this._lineNumber,
            errCode: WorkplaceCSVValidator.ALL_JOBS_ERROR,
            errType: 'ALL_JOBS_ERROR',
            error: 'The code you have entered for ALLJOBROLES is incorrect',
            source: this._currentLine.ALLJOBROLES,
            column: 'ALLJOBROLES',
            name: this._currentLine.LOCALESTID,
          });
        }
      });

      this._alljobs = mappedJobs;
    }
  }

  // returns true if all given job counts are 0; otherwise returns false
  _jobsAllZeros(jobs) {
    if (jobs && Array.isArray(jobs)) {
      return jobs.every((thisJob) => thisJob === 0);
    } else {
      return false;
    }
  }

  _transformAllVacanciesStartersLeavers() {
    // vacancies, starters and leavers is either an array of counts against positional indexes to _allJobs
    //  or a single value of 999

    // if a single value of 999, then map to "Don't know"
    // if a full set of 0 (e.g. 0, or 0;0 or 0;0;0, ...), then map to "None"
    const DONT_KNOW = 999;

    if (this._jobsAllZeros(this._vacancies)) {
      this._vacancies = 'None';
    } else if (this._vacancies && this._vacancies.length === 1 && this._vacancies[0] === DONT_KNOW) {
      this._vacancies = "Don't know";
    } else if (this._vacancies && Array.isArray(this._vacancies)) {
      this._vacancies = this._vacancies
        .map((thisJob, index) => {
          return {
            jobId: this._alljobs[index],
            total: thisJob,
          };
        })
        .filter((thisJob) => thisJob.total !== 0);
    }

    if (this._jobsAllZeros(this._starters)) {
      this._starters = 'None';
    } else if (this._starters && this._starters.length === 1 && this._starters[0] === DONT_KNOW) {
      this._starters = "Don't know";
    } else if (this._starters && Array.isArray(this._starters)) {
      this._starters = this._starters
        .map((thisJob, index) => {
          return {
            jobId: this._alljobs[index],
            total: thisJob,
          };
        })
        .filter((thisJob) => thisJob.total !== 0);
    }

    if (this._jobsAllZeros(this._leavers)) {
      this._leavers = 'None';
    } else if (this._leavers && this._leavers.length === 1 && this._leavers[0] === DONT_KNOW) {
      this._leavers = "Don't know";
    } else if (this._leavers && Array.isArray(this._leavers)) {
      this._leavers = this._leavers
        .map((thisJob, index) => {
          return {
            jobId: this._alljobs[index],
            total: thisJob,
          };
        })
        .filter((thisJob) => thisJob.total !== 0);
    }
  }

  _transformReasonsForLeaving() {
    if (this._reasonsForLeaving && Array.isArray(this._reasonsForLeaving)) {
      const mappedReasons = [];

      this._reasonsForLeaving.forEach((thisReason) => {
        const thisMappedReason = {
          id: BUDI.reasonsForLeaving(BUDI.TO_ASC, thisReason.id),
          count: thisReason.count,
        };

        if (thisMappedReason.id) {
          mappedReasons.push(thisMappedReason);
        } else {
          this._validationErrors.push({
            lineNumber: this._lineNumber,
            errCode: WorkplaceCSVValidator.REASONS_FOR_LEAVING_ERROR,
            errType: 'REASONS_FOR_LEAVING_ERROR',
            error: `Reason for Leaving (REASONS): ${thisReason.id} is unknown`,
            source: this._currentLine.REASONS,
            column: 'REASONS',
            name: this._currentLine.LOCALESTID,
          });
        }
      });

      this._reasonsForLeaving = mappedReasons;
    }
  }

  _transformRepeatTrainingAndAcceptCareCert() {
    const mapping = {
      1: 'Yes, always',
      2: 'Yes, very often',
      3: 'Yes, but not very often',
      4: 'No, never',
      '': null,
    };
    const repeatTraining = this._doNewStartersRepeatMandatoryTrainingFromPreviousEmployment;
    this._doNewStartersRepeatMandatoryTrainingFromPreviousEmployment = mapping[repeatTraining];
    const acceptCareCert = this._wouldYouAcceptCareCertificatesFromPreviousEmployment;
    this._wouldYouAcceptCareCertificatesFromPreviousEmployment = mapping[acceptCareCert];
  }

  _transformAdvertisingAndInterviews() {
    const DONT_KNOW = 'unknown';
    const NONE = '0';

    const interview = this._peopleInterviewedInTheLastFourWeeks;
    const advertising = this._moneySpentOnAdvertisingInTheLastFourWeeks;
    const interviewAndAdvertisingArr = [
      { name: '_peopleInterviewedInTheLastFourWeeks', value: interview },
      { name: '_moneySpentOnAdvertisingInTheLastFourWeeks', value: advertising },
    ];

    interviewAndAdvertisingArr.forEach((property) => {
      if (!property.value) {
        this[property.name] = null;
      } else if (property.value.toLowerCase() === DONT_KNOW) {
        this[property.name] = "Don't know";
      } else if (property.value === NONE) {
        this[property.name] = 'None';
      }
    });
  }

  _transformCashLoyaltyForFirstTwoYears() {
    const YES = '1';
    const YES_COMMA = '1;';
    const NO = '0';
    const DONT_KNOW = 'unknown';

    const benefit = this._careWorkersCashLoyaltyForFirstTwoYears;

    if (benefit === YES) {
      this._careWorkersCashLoyaltyForFirstTwoYears = 'Yes';
    } else if (benefit === YES_COMMA) {
      this._careWorkersCashLoyaltyForFirstTwoYears = 'Yes';
    } else if (benefit === NO) {
      this._careWorkersCashLoyaltyForFirstTwoYears = 'No';
    } else if (benefit === DONT_KNOW) {
      this._careWorkersCashLoyaltyForFirstTwoYears = "Don't know";
    } else if (benefit.includes(';')) {
      this._careWorkersCashLoyaltyForFirstTwoYears = benefit.split(';')[1];
    }
  }

  _transformPensionAndSickPay() {
    const mapping = {
      0: 'No',
      1: 'Yes',
      unknown: "Don't know",
      '': null,
    };
    const sickPay = this._sickPay;
    this._sickPay = mapping[sickPay];
    const pension = this._pensionContribution;
    this._pensionContribution = mapping[pension];
  }

  preValidate(headers) {
    return this._validateHeaders(headers);
  }

  static isContent(data) {
    const contentRegex = /LOCALESTID,STATUS,ESTNAME,ADDRESS1,ADDRESS2,ADDRES/;
    return contentRegex.test(data.substring(0, 50));
  }

  _validateHeaders(headers) {
    // only run once for first line, so check _lineNumber
    if (_headers_v1 !== headers) {
      this._validationErrors.push({
        lineNumber: 1,
        errCode: WorkplaceCSVValidator.HEADERS_ERROR,
        errType: 'HEADERS_ERROR',
        error: `WorkplaceCSVValidator headers (HEADERS) can contain, ${_headers_v1.split(',')}`,
        source: headers,
        column: '',
        name: this._currentLine.LOCALESTID,
      });
      return false;
    }
    return true;
  }

  // add a duplicate validation error to the current set
  addDuplicate() {
    return {
      origin: 'Establishments',
      lineNumber: this._lineNumber,
      errCode: WorkplaceCSVValidator.DUPLICATE_ERROR,
      errType: 'DUPLICATE_ERROR',
      error: 'LOCALESTID is not unique',
      source: this._currentLine.LOCALESTID,
      column: 'LOCALESTID',
      name: this._currentLine.LOCALESTID,
    };
  }

  // add a duplicate validation error to the current set
  addNotOwner() {
    return {
      origin: 'Establishments',
      lineNumber: this._lineNumber,
      errCode: WorkplaceCSVValidator.NOT_OWNER_ERROR,
      errType: 'NOT_OWNER_ERROR',
      error: 'Not the owner',
      source: this._currentLine.LOCALESTID,
      column: '',
      name: this._currentLine.LOCALESTID,
    };
  }

  static justOneEstablishmentError() {
    return {
      origin: 'Establishments',
      lineNumber: 1,
      errCode: WorkplaceCSVValidator.EXPECT_JUST_ONE_ERROR,
      errType: 'EXPECT_JUST_ONE_ERROR',
      error: 'Expect just one establishment',
      source: '',
      column: 'LOCALESTID',
    };
  }

  static missingPrimaryEstablishmentError(name) {
    return {
      origin: 'Establishments',
      lineNumber: 1,
      errCode: WorkplaceCSVValidator.MISSING_PRIMARY_ERROR,
      errType: 'MISSING_PRIMARY_ERROR',
      error: `Missing the primary establishment: ${name}`,
      source: '',
      column: 'LOCALESTID',
      name,
    };
  }

  static cannotDeletePrimaryEstablishmentError(name) {
    return {
      origin: 'Establishments',
      lineNumber: 1,
      errCode: WorkplaceCSVValidator.CANNOT_DELETE_PRIMARY_ERROR,
      errType: 'CANNOT_DELETE_PRIMARY_ERROR',
      error: `STATUS cannot be DELETE for primary establishment: ${name}`,
      source: '',
      column: 'STATUS',
      name,
    };
  }

  // returns true on success, false is any attribute of WorkplaceCSVValidator fails
  async validate() {
    this._validateLocalisedId();
    this._validateEstablishmentName();
    this._validateStatus();

    // if the status is unchecked or deleted, then don't continue validation
    if (!STOP_VALIDATING_ON.includes(this._status)) {
      await this._validateAddress();
      this._validateEstablishmentType();

      this._validateShareWithCQC();
      this._validateShareWithLA();

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
      this._validateAdvertising();
      this._validateInterviews();
      this._validateRepeatTraining();
      this._validateAcceptCareCertificate();
      this._validateSickPay();
      this._validateHoliday();
      this._validatePensionContribution();
      this._validateBenefits();

      // this._validateNoChange(); // Not working, disabled for LA Window
    }
    return this.validationErrors.length === 0;
  }

  // Adds items to csvEstablishmentSchemaErrors if validations that depend on
  // worker totals give errors or warnings
  async crossValidate(csvEstablishmentSchemaErrors, myJSONWorkers) {
    // if establishment isn't being added or updated then exit early
    if (!['NEW', 'UPDATE', 'NOCHANGE'].includes(this._status)) {
      return;
    }

    const totals = {
      directCareWorkers: 0,
      managerialProfessionalWorkers: 0,
      employedWorkers: 0,
      nonEmployedWorkers: 0,
    };

    let registeredManagers = 0;

    const dataInCSV = ['NEW', 'UPDATE', 'CHGSUB']; //For theses statuses trust the data in the CSV
    myJSONWorkers.forEach((worker) => {
      if (this.key === worker.establishmentKey && dataInCSV.includes(worker.status)) {
        /* update totals */
        if (isPerm(worker)) {
          totals.employedWorkers++;
        } else {
          totals.nonEmployedWorkers++;
        }
        /* update registeredManagers */
        registeredManagers += isRegManager(worker) ? 1 : 0;
      }
    });

    // get all the other records that may already exist in the db but aren't being updated or deleted
    // and check how many registered managers there is
    const dataInDB = ['UNCHECKED', 'NOCHANGE']; // for theses statuses trust the data in the DB
    (await Establishment.fetchMyEstablishmentsWorkers(this.id, this._key)).forEach((worker) => {
      const workerFromCSV = myJSONWorkers.find((w) => {
        return w.uniqueWorkerId === worker.uniqueWorker;
      });
      if (workerFromCSV && dataInDB.includes(workerFromCSV._status)) {
        worker.contractTypeId = BUDI.contractType(BUDI.FROM_ASC, worker.contractTypeId);
        worker.otherJobIds = worker.otherJobIds.length ? worker.otherJobIds.split(';') : [];
        worker.otherJobIds.map((otherJobId) => BUDI.jobRoles(BUDI.FROM_ASC, otherJobId));
        worker.mainJobRoleId = BUDI.jobRoles(BUDI.FROM_ASC, worker.mainJobRoleId);
        if (isPerm(worker)) {
          totals.employedWorkers++;
        } else {
          totals.nonEmployedWorkers++;
        }
        registeredManagers += isRegManager(worker) ? 1 : 0;
      }
    });
    this._crossValidateTotalPermTemp(csvEstablishmentSchemaErrors, totals);
    this._crossValidateAllJobRoles(csvEstablishmentSchemaErrors, registeredManagers);
  }

  // returns true on success, false is any attribute of WorkplaceCSVValidator fails
  transform() {
    // if the status is unchecked or deleted, then don't transform
    if (!STOP_VALIDATING_ON.includes(this._status)) {
      let status = true;

      status = !this._transformMainService() ? false : status;
      status = !this._transformEstablishmentType() ? false : status;
      status = !this._transformAllServices() ? false : status;
      status = !this._transformServiceUsers() ? false : status;
      status = !this._transformAllJobs() ? false : status;
      // status = !this._transformReasonsForLeaving() ? false : status;        // interim solution - not transforming reasons for leaving
      status = !this._transformAllCapacities() ? false : status;
      status = !this._transformAllUtilisation() ? false : status;
      status = !this._transformAllVacanciesStartersLeavers() ? false : status;
      status = !this._transformAdvertisingAndInterviews() ? false : status;
      status = !this._transformRepeatTrainingAndAcceptCareCert() ? false : status;
      status = !this._transformCashLoyaltyForFirstTwoYears() ? false : status;
      status = !this._transformPensionAndSickPay() ? false : status;
      return status;
    } else {
      return true;
    }
  }

  toJSON() {
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
      regType: this._regType,
      locationId: this._regType ? this._locationID : undefined,
      provId: this._regType ? this._provID : undefined,
      mainService: this._mainService,
      allServices: this._allServices
        ? this._allServices.map((thisService, index) => {
            const returnThis = {
              id: thisService,
            };

            if (this._allServicesOther[index]) {
              returnThis.other = this._allServicesOther[index];
            }

            return returnThis;
          })
        : undefined,
      serviceUsers: this._allServiceUsers
        ? this._allServiceUsers.map((thisService, index) => {
            const returnThis = {
              id: thisService,
            };

            if (this._allServiceUsersOther[index]) {
              returnThis.other = this._allServiceUsersOther[index];
            }

            return returnThis;
          })
        : undefined,
      capacities: this._capacities,
      utilisations: this._utilisations,
      totalPermTemp: this._totalPermTemp,

      allJobs: this._alljobs,
      counts: {
        vacancies: this._vacancies,
        starters: this._starters,
        leavers: this._leavers,
        reasonsForLeaving: this._reasonsForLeaving ? this._reasonsForLeaving : undefined,
      },
    };
  }

  get validationErrors() {
    // include the "origin" of validation error
    return this._validationErrors.map((thisValidation) => {
      return {
        origin: 'Establishments',
        ...thisValidation,
      };
    });
  }

  // returns an API representation of this WorkplaceCSVValidator
  toAPI() {
    const fixedProperties = {
      address1: this._address1 ? this._address1 : '',
      address2: this._address2 ? this._address2 : '',
      address3: this._address3 ? this._address3 : '',
      town: this._town ? this._town : '',
      postcode: this._postcode ? this._postcode : '',
      locationId: this._regType ? this._locationID : undefined,
      provId: this._regType ? this._provID : undefined,
      isCQCRegulated: this._regType === 2,
    };

    // interim solution for reasons for leaving
    if (this._reasonsForLeaving && Array.isArray(this._reasonsForLeaving)) {
      fixedProperties.reasonsForLeaving = this._reasonsForLeaving
        .map((thisReason) => `${thisReason.id}:${thisReason.count}`)
        .join('|');
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
        other: this._establishmentTypeOther ? this._establishmentTypeOther : undefined,
      },
      mainService: this._mainService,
      services: {
        value: null,
      },
      serviceUsers: this._allServiceUsers
        ? this._allServiceUsers.map((thisService, index) => {
            const returnThis = {
              id: thisService,
            };

            if (this._allServiceUsersOther[index]) {
              returnThis.other = this._allServiceUsersOther[index];
            }

            return returnThis;
          })
        : [],
      numberOfStaff: this._totalPermTemp,
      vacancies: this._vacancies,
      starters: this._starters,
      leavers: this._leavers,
      doNewStartersRepeatMandatoryTrainingFromPreviousEmployment:
        this._doNewStartersRepeatMandatoryTrainingFromPreviousEmployment,
      moneySpentOnAdvertisingInTheLastFourWeeks: this._moneySpentOnAdvertisingInTheLastFourWeeks,
      peopleInterviewedInTheLastFourWeeks: this._peopleInterviewedInTheLastFourWeeks,
      wouldYouAcceptCareCertificatesFromPreviousEmployment: this._wouldYouAcceptCareCertificatesFromPreviousEmployment,
      careWorkersCashLoyaltyForFirstTwoYears: this._careWorkersCashLoyaltyForFirstTwoYears,
      sickPay: this._sickPay,
      pensionContribution: this._pensionContribution,
      careWorkersLeaveDaysPerYear: this._careWorkersLeaveDaysPerYear,
    };
    if (this._allServices) {
      if (this._allServices.length === 1) {
        changeProperties.services.value = null;
      } else if (this._allServices.includes(0)) {
        changeProperties.services.value = 'No';
      } else if (this._allServices.length > 1) {
        changeProperties.services = {
          value: 'Yes',
          services: this._allServices
            .filter((thisService) => (this._mainService ? this._mainService.id !== thisService : true)) // main service cannot appear in otherServices
            .map((thisService, index) => {
              const returnThis = {
                id: thisService,
              };
              if (this._allServicesOther[index]) {
                returnThis.other = this._allServicesOther[index];
              }
              return returnThis;
            }),
        };
      }
    }

    if (this._regType === 2) {
      changeProperties.locationId = this._locationID;
    }

    // shareWith options
    const shareWithMapping = {
      0: false,
      1: true,
      '': null,
    };

    changeProperties.shareWith = {
      cqc: shareWithMapping[this._shareWithCqc],
      localAuthorities: shareWithMapping[this._shareWithLA],
    };

    // capacities - we combine both capacities and utilisations
    changeProperties.capacities = [];
    if (Array.isArray(this._capacities)) {
      this._capacities.forEach((thisCapacity) => {
        changeProperties.capacities.push(thisCapacity);
      });
    }

    if (Array.isArray(this._utilisations)) {
      this._utilisations.forEach((thisUtilisation) => {
        changeProperties.capacities.push(thisUtilisation);
      });
    }

    // clean up empty properties
    if (changeProperties.capacities.length === 0) {
      changeProperties.capacities = [];
    }

    return {
      ...fixedProperties,
      ...changeProperties,
    };
  }

  // takes the given establishment entity and writes it out to CSV string (one line)
  static toCSV(entity) {
    // ["LOCALESTID","STATUS","ESTNAME","ADDRESS1","ADDRESS2","ADDRESS3","POSTTOWN","POSTCODE","ESTTYPE","OTHERTYPE","PERMCQC","PERMLA","REGTYPE","PROVNUM","LOCATIONID","MAINSERVICE","ALLSERVICES","CAPACITY","UTILISATION","SERVICEDESC","SERVICEUSERS","OTHERUSERDESC","TOTALPERMTEMP","ALLJOBROLES","STARTERS","LEAVERS","VACANCIES","REASONS","REASONNOS"]
    const columns = [];
    columns.push(csvQuote(entity.LocalIdentifierValue));
    columns.push('UNCHECKED');
    columns.push(csvQuote(entity.NameValue));
    columns.push(csvQuote(entity.address1));
    columns.push(csvQuote(entity.address2));
    columns.push(csvQuote(entity.address3));
    columns.push(csvQuote(entity.town));
    columns.push(csvQuote(entity.postcode));
    columns.push(entity.EmployerTypeValue ? BUDI.establishmentType(BUDI.FROM_ASC, entity.EmployerTypeValue) : '');
    columns.push(csvQuote(entity.EmployerTypeOther ? entity.EmployerTypeOther : ''));

    const shareWithMapping = {
      true: '1',
      false: '0',
      null: '',
    };

    columns.push(shareWithMapping[entity.shareWithCQC]);
    columns.push(shareWithMapping[entity.shareWithLA]);

    // CQC regulated, Prov IDand Location ID
    columns.push(entity.isRegulated ? 2 : 0);
    columns.push(entity.isRegulated ? entity.provId : '');
    columns.push(entity.isRegulated ? entity.locationId : '');

    const services = entity.otherServices;
    services.unshift(entity.mainService);
    // main service - this is mandatory in ASC WDS so no need to check for it being available or not
    columns.push(entity.mainService.reportingID);

    if (entity.otherServices.value === 'No') {
      columns.push('0');
    } else {
      columns.push(services.map((service) => service.reportingID).join(';'));
    }

    const capacities = [];
    const utilisations = [];

    const findUtilCap = (type, service, capacities) =>
      capacities.find((capacity) => capacity.reference.service.id === service.id && capacity.reference.type === type);

    services.map((service) => {
      const capacity = findUtilCap('Capacity', service, entity.capacity);
      const utilisation = findUtilCap('Utilisation', service, entity.capacity);
      capacities.push(capacity && capacity.answer ? capacity.answer : '');
      utilisations.push(utilisation && utilisation.answer ? utilisation.answer : '');
    });

    columns.push(capacities.join(';'));
    columns.push(utilisations.join(';'));

    // all service "other" descriptions

    columns.push(
      services
        .map((thisService) =>
          thisService.establishmentServices && thisService.establishmentServices.other
            ? thisService.establishmentServices.other
            : '',
        )
        .join(';'),
    );

    // service users and their 'other' descriptions
    const serviceUsers = Array.isArray(entity.serviceUsers) ? entity.serviceUsers : [];
    columns.push(serviceUsers.map((thisUser) => BUDI.serviceUsers(BUDI.FROM_ASC, thisUser.id)).join(';'));
    columns.push(
      serviceUsers
        .map((thisServiceUser) =>
          thisServiceUser.establishmentServiceUsers && thisServiceUser.establishmentServiceUsers.other
            ? thisServiceUser.establishmentServiceUsers.other
            : '',
        )
        .join(';'),
    );

    // total perm/temp staff
    columns.push(entity.NumberOfStaffValue ? entity.NumberOfStaffValue : 0);

    // all job roles, starters, leavers and vacancies
    // all jobs needs to be a set of unique ids (which across starters, leavers and vacancies may be repeated)
    const uniqueJobs = entity.jobs
      .map((job) => job.jobId)
      .filter((value, index, self) => self.indexOf(value) === index);

    columns.push(uniqueJobs.map((thisJob) => BUDI.jobRoles(BUDI.FROM_ASC, thisJob)).join(';'));

    const starters = entity.jobs.filter((value) => value.type === 'Starters');
    const leavers = entity.jobs.filter((value) => value.type === 'Leavers');
    const vacancies = entity.jobs.filter((value) => value.type === 'Vacancies');

    const starterCounts = [];
    const leaverCounts = [];
    const vacancyCounts = [];

    uniqueJobs.map((job) => {
      const starterCount = starters.find((starter) => starter.jobId === job);
      const leaverCount = leavers.find((leaver) => leaver.jobId === job);
      const vacancyCount = vacancies.find((vacancy) => vacancy.jobId === job);
      starterCounts.push(starterCount && starterCount.total ? starterCount.total : 0);
      leaverCounts.push(leaverCount && leaverCount.total ? leaverCount.total : 0);
      vacancyCounts.push(vacancyCount && vacancyCount.total ? vacancyCount.total : 0);
    });

    const slv = (value, counts) => {
      if (value === "Don't know") {
        return 999;
      } else if (value === null) {
        return '';
      } else if (value === 'None') {
        return uniqueJobs.map(() => 0).join(';');
      } else {
        return counts.join(';');
      }
    };

    columns.push(slv(entity.StartersValue, starterCounts));
    columns.push(slv(entity.LeaversValue, leaverCounts));
    columns.push(slv(entity.VacanciesValue, vacancyCounts));

    // reasons for leaving - currently can't be mapped - interim solution is a string of "reasonID:count|reasonId:count" (without BUDI mapping)
    if (entity.reasonsForLeaving && entity.reasonsForLeaving.length > 0) {
      const reasons = [];
      const reasonsCount = [];
      const myReasons = entity.reasonsForLeaving.split('|');

      myReasons.forEach((currentReason) => {
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

    // Advertising, interviews,
    const advertisingAndInterviewsMapping = (value) => {
      if (value === "Don't know") {
        return 'unknown';
      } else if (value === 'None') {
        return 0;
      } else if (!value) {
        return '';
      } else {
        return value;
      }
    };

    columns.push(advertisingAndInterviewsMapping(entity.moneySpentOnAdvertisingInTheLastFourWeeks));
    columns.push(advertisingAndInterviewsMapping(entity.peopleInterviewedInTheLastFourWeeks));

    // RepeatTraining and AcceptCareCertifiicate
    const repeatTrainingAndCareCertMapping = (value) => {
      if (value === 'Yes, always') {
        return 1;
      } else if (value === 'Yes, very often') {
        return 2;
      } else if (value === 'Yes, but not very often') {
        return 3;
      } else if (value === 'No, never') {
        return 4;
      } else if (!value) {
        return '';
      }
    };

    columns.push(repeatTrainingAndCareCertMapping(entity.doNewStartersRepeatMandatoryTrainingFromPreviousEmployment));
    columns.push(repeatTrainingAndCareCertMapping(entity.wouldYouAcceptCareCertificatesFromPreviousEmployment));

    // cash Loyalty
    const cashLoyaltyMapping = (value) => {
      if (value === "Don't know") {
        return 'unknown';
      } else if (value === 'No') {
        return 0;
      } else if (value === 'Yes') {
        return '1;';
      } else if (!value) {
        return '';
      } else {
        return value;
      }
    };
    const whenValue = '1;';
    columns.push(
      cashLoyaltyMapping(
        Number(entity.careWorkersCashLoyaltyForFirstTwoYears)
          ? whenValue.concat(entity.careWorkersCashLoyaltyForFirstTwoYears)
          : entity.careWorkersCashLoyaltyForFirstTwoYears,
      ),
    );

    // Sick Pay, Pension Contribution,Holiday
    const sickPayHolidayAndPensionMapping = (value) => {
      if (value === "Don't know") {
        return 'unknown';
      } else if (value === 'No') {
        return 0;
      } else if (value === 'Yes') {
        return 1;
      } else if (!value) {
        return '';
      } else {
        return value;
      }
    };

    columns.push(sickPayHolidayAndPensionMapping(entity.sickPay));
    columns.push(sickPayHolidayAndPensionMapping(entity.pensionContribution));
    columns.push(sickPayHolidayAndPensionMapping(entity.careWorkersLeaveDaysPerYear));

    return columns.join(',');
  }

  toCSV(entity) {
    return WorkplaceCSVValidator.toCSV(entity);
  }
}

module.exports.WorkplaceCSVValidator = WorkplaceCSVValidator;
module.exports.EstablishmentFileHeaders = _headers_v1;
