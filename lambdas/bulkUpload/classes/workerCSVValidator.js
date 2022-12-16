const BUDI = require('../classes/BUDI').BUDI;
const moment = require('moment');
const get = require('lodash/get');

const STOP_VALIDATING_ON = ['UNCHECKED', 'DELETE', 'NOCHANGE'];

class WorkerCsvValidator {
  constructor(currentLine, lineNumber, currentWorker, mappings) {
    this._currentLine = currentLine;
    this._lineNumber = lineNumber;
    this._currentWorker = currentWorker;

    this._validationErrors = [];
    this._contractType = null;
    this._contractTypeId = null;

    this._localId = null;
    this._workerLocalID = null;
    this._changeUniqueWorkerId = null;
    this._status = null;
    this._key = null;
    this._establishmentKey = null;

    this._NINumber = null;
    this._postCode = null;
    this._DOB = null;
    this._gender = null;

    this._ethnicity = null;
    this._britishNationality = null;
    this._yearOfEntry = null;

    this._disabled = null;
    this._careCert = null;

    this._recSource = null;
    this._startDate = null;
    this._startInsect = null;

    this._apprentice = null;
    this._zeroHourContract = null;

    this._daysSick = null;

    this._salaryInt = null;
    this._salary = null;
    this._hourlyRate = null;

    this._mainJobRole = null;
    this._mainJobRoleId = null;
    this._mainJobDesc = null;

    this._contHours = null;
    this._avgHours = null;

    this._registeredNurse = null;
    this._nursingSpecialist = null;

    this._nationality = null;
    this._countryOfBirth = null;

    this._socialCareQualification = null;
    this._socialCareQualificationlevel = null;
    this._nonSocialCareQualification = null;
    this._nonSocialCareQualificationlevel = null;

    // array of qualification records for this worker
    this._qualifications = null;
    this._amhp = null;

    this.BUDI = new BUDI(mappings);
  }

  static get LOCAL_ID_ERROR() {
    return 1010;
  }
  static get UNIQUE_WORKER_ID_ERROR() {
    return 1020;
  }
  static get CHANGE_UNIQUE_WORKER_ID_ERROR() {
    return 1030;
  }
  static get STATUS_ERROR() {
    return 1040;
  }
  static get STATUS_WARNING() {
    return 1045;
  }

  static get DISPLAY_ID_ERROR() {
    return 1050;
  }
  static get NINUMBER_ERROR() {
    return 1060;
  }
  static get POSTCODE_ERROR() {
    return 1070;
  }
  static get DOB_ERROR() {
    return 1080;
  }
  static get GENDER_ERROR() {
    return 1090;
  }
  static get ETHNICITY_ERROR() {
    return 1100;
  }
  static get NATIONALITY_ERROR() {
    return 1110;
  }
  static get BRITISH_CITIZENSHIP_ERROR() {
    return 1120;
  }
  static get COUNTRY_OF_BIRTH_ERROR() {
    return 1230;
  }
  static get YEAR_OF_ENTRY_ERROR() {
    return 1140;
  }
  static get DISABLED_ERROR() {
    return 1150;
  }
  static get CARE_CERT_ERROR() {
    return 1160;
  }
  static get RECSOURCE_ERROR() {
    return 1180;
  }
  static get START_DATE_ERROR() {
    return 1190;
  }
  static get START_INSECT_ERROR() {
    return 1200;
  }
  static get APPRENCTICE_ERROR() {
    return 1210;
  }
  static get CONTRACT_TYPE_ERROR() {
    return 1220;
  } // EMPL STATUS
  static get ZERO_HRCONT_ERROR() {
    return 1230;
  }
  static get DAYSICK_ERROR() {
    return 1240;
  }
  static get SALARY_INT_ERROR() {
    return 1250;
  }
  static get SALARY_ERROR() {
    return 1260;
  }
  static get HOURLY_RATE_ERROR() {
    return 1270;
  }
  static get MAIN_JOB_ROLE_ERROR() {
    return 1280;
  }
  static get MAIN_JOB_DESC_ERROR() {
    return 1290;
  }
  static get CONT_HOURS_ERROR() {
    return 1300;
  }
  static get AVG_HOURS_ERROR() {
    return 1310;
  }
  static get OTHER_JOB_ROLE_ERROR() {
    return 1320;
  }
  static get OTHER_JR_DESC_ERROR() {
    return 1330;
  }
  static get NMCREG_ERROR() {
    return 1340;
  }
  static get NURSE_SPEC_ERROR() {
    return 1350;
  }

  static get SOCIALCARE_QUAL_ERROR() {
    return 1360;
  }
  static get NON_SOCIALCARE_QUAL_ERROR() {
    return 1370;
  }

  static get YEAROFENTRY_ERROR() {
    return 1380;
  }

  static get AMHP_ERROR() {
    return 1380;
  }

  static get UNIQUE_WORKER_ID_WARNING() {
    return 3020;
  }
  static get DISPLAY_ID_WARNING() {
    return 3050;
  }

  static get NINUMBER_WARNING() {
    return 3060;
  }
  static get POSTCODE_WARNING() {
    return 3070;
  }
  static get DOB_WARNING() {
    return 3080;
  }
  static get GENDER_WARNING() {
    return 3090;
  }
  static get ETHNICITY_WARNING() {
    return 3100;
  }
  static get NATIONALITY_WARNING() {
    return 3110;
  }
  static get BRITISH_CITIZENSHIP_WARNING() {
    return 3120;
  }
  static get COUNTRY_OF_BIRTH_WARNING() {
    return 3130;
  }
  static get YEAR_OF_ENTRY_WARNING() {
    return 3140;
  }
  static get DISABLED_WARNING() {
    return 3150;
  }
  static get CARE_CERT_WARNING() {
    return 3160;
  }
  static get RECSOURCE_WARNING() {
    return 3180;
  }
  static get START_DATE_WARNING() {
    return 3190;
  }
  static get START_INSECT_WARNING() {
    return 3200;
  }
  static get APPRENCTICE_WARNING() {
    return 3210;
  }
  static get CONTRACT_TYPE_WARNING() {
    return 3220;
  } // EMPL STATUS
  static get ZERO_HRCONT_WARNING() {
    return 3230;
  }
  static get DAYSICK_WARNING() {
    return 3240;
  }
  static get SALARY_INT_WARNING() {
    return 3250;
  }
  static get SALARY_WARNING() {
    return 3260;
  }
  static get HOURLY_RATE_WARNING() {
    return 3270;
  }
  static get MAIN_JOB_ROLE_WARNING() {
    return 3280;
  }
  static get MAIN_JOB_DESC_WARNING() {
    return 3290;
  }
  static get CONT_HOURS_WARNING() {
    return 3300;
  }
  static get AVG_HOURS_WARNING() {
    return 3310;
  }
  static get OTHER_JOB_ROLE_WARNING() {
    return 3320;
  }
  static get OTHER_JR_DESC_WARNING() {
    return 3330;
  }
  static get NMCREG_WARNING() {
    return 3340;
  }
  static get NURSE_SPEC_WARNING() {
    return 3350;
  }

  static get SOCIALCARE_QUAL_WARNING() {
    return 3360;
  }
  static get NON_SOCIALCARE_QUAL_WARNING() {
    return 3370;
  }

  static get AMHP_WARNING() {
    return 3380;
  }

  static get YEAROFENTRY_WARNING() {
    return 3380;
  }

  static get QUAL_ACH01_ERROR() {
    return 5010;
  }
  static get QUAL_ACH01_NOTES_ERROR() {
    return 5020;
  }
  static get QUAL_ACH02_ERROR() {
    return 5030;
  }
  static get QUAL_ACH02_NOTES_ERROR() {
    return 5040;
  }
  static get QUAL_ACH03_ERROR() {
    return 5050;
  }
  static get QUAL_ACH03_NOTES_ERROR() {
    return 5060;
  }

  static get QUAL_ACH_WARNING() {
    return 5500;
  }
  static get QUAL_ACH01_WARNING() {
    return 5510;
  }
  static get QUAL_ACH01_NOTES_WARNING() {
    return 5520;
  }
  static get QUAL_ACH02_WARNING() {
    return 5530;
  }
  static get QUAL_ACH02_NOTES_WARNING() {
    return 5540;
  }
  static get QUAL_ACH03_WARNING() {
    return 5550;
  }
  static get QUAL_ACH03_NOTES_WARNING() {
    return 5560;
  }

  get lineNumber() {
    return this._lineNumber;
  }

  get currentLine() {
    return this._currentLine;
  }

  get local() {
    return this._localId;
  }

  get uniqueWorker() {
    return this._uniqueWorkerId;
  }

  get changeUniqueWorker() {
    return this._changeUniqueWorkerId;
  }

  get contractType() {
    return this._contractType;
  }

  get contractTypeId() {
    return this._contractTypeId;
  }

  get status() {
    return this._status;
  }

  get key() {
    return this._key;
  }

  get establishmentKey() {
    return this._establishmentKey;
  }

  get dislpayID() {
    return this._displayId;
  }

  get niNumber() {
    return this._NINumber;
  }

  get postCode() {
    return this._postCode;
  }

  get DOB() {
    return this._DOB;
  }

  get gender() {
    return this._gender;
  }

  get ethnicity() {
    return this._ethnicity;
  }

  get britishNationality() {
    return this._britishNationality;
  }

  get yearOfEntry() {
    return this._yearOfEntry;
  }

  get disabled() {
    return this._disabled;
  }

  get careCert() {
    return this._careCert;
  }

  get recSource() {
    return this._recSource;
  }

  get startDate() {
    return this._startDate;
  }

  get startInsect() {
    return this._startInsect;
  }

  get apprentice() {
    return this._apprentice;
  }

  get zeroHourContract() {
    return this._zeroHourContract;
  }

  get daysSick() {
    return this._daysSick;
  }

  get salaryInt() {
    return this._salaryInt;
  }

  get salary() {
    return this._salary;
  }

  get hourlyRate() {
    return this._hourlyRate;
  }

  get mainJobRole() {
    return this._mainJobRole;
  }

  get mainJobDesc() {
    return this._mainJobDesc;
  }

  get mainJobRoleId() {
    return this._mainJobRoleId;
  }

  get contHours() {
    return this._contHours;
  }

  get amhp() {
    return this._amhp;
  }

  _validateContractType() {
    const myContractType = parseInt(this._currentLine.EMPLSTATUS, 10);

    if (!myContractType) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        errCode: WorkerCsvValidator.CONTRACT_TYPE_ERROR,
        errType: 'CONTRACT_TYPE_ERROR',
        error: 'EMPLSTATUS has not been supplied',
        source: this._currentLine.EMPLSTATUS,
        column: 'EMPLSTATUS',
      });
      return false;
    } else {
      this._contractType = myContractType;
      this._contractTypeId = myContractType; //work around for the inadequacies of the transform() function's existance
      return true;
    }
  }

  _validateLocalId() {
    const myLocalId = this._currentLine.LOCALESTID;

    // must be present and n more than 50 characters
    const MAX_LENGTH = 50;
    let status = true;

    if (myLocalId === null || myLocalId.length === 0) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: WorkerCsvValidator.LOCAL_ID_ERROR,
        errType: 'LOCAL_ID_ERROR',
        error: 'LOCALESTID has not been supplied',
        source: myLocalId,
        column: 'LOCALESTID',
      });
      status = false;
    } else if (myLocalId.length >= MAX_LENGTH) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: WorkerCsvValidator.LOCAL_ID_ERROR,
        errType: 'LOCAL_ID_ERROR',
        error: `LOCALESTID is longer than ${MAX_LENGTH} characters`,
        source: myLocalId,
        column: 'LOCALESTID',
      });
      status = false;
    }

    // need the LOCALSTID regardless of whether it has failed validation or not
    this._localId = myLocalId === null || myLocalId.length === 0 ? `SFCROW$${this._lineNumber}` : myLocalId;
    this._establishmentKey = this._localId.replace(/\s/g, '');

    return status;
  }

  _validateUniqueWorkerId() {
    const myUniqueWorkerId = this._currentLine.UNIQUEWORKERID;

    // must be present and n more than 50 characters
    const MAX_LENGTH = 50;
    let status = true;

    if (myUniqueWorkerId === null || myUniqueWorkerId.length === 0) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        errCode: WorkerCsvValidator.UNIQUE_WORKER_ID_ERROR,
        errType: 'UNIQUE_WORKER_ID_ERROR',
        error: 'UNIQUEWORKERID has not been supplied',
        source: this._currentLine.UNIQUEWORKERID,
        column: 'UNIQUEWORKERID',
      });
      status = false;
    } else if (myUniqueWorkerId.length >= MAX_LENGTH) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        errCode: WorkerCsvValidator.UNIQUE_WORKER_ID_ERROR,
        errType: 'UNIQUE_WORKER_ID_ERROR',
        error: `UNIQUEWORKERID is longer than ${MAX_LENGTH} characters`,
        source: this._currentLine.UNIQUEWORKERID,
        column: 'UNIQUEWORKERID',
      });
      status = false;
    }

    // need the UNIQUEWORKERID regardless of whether it has failed validation or not
    this._uniqueWorkerId =
      myUniqueWorkerId === null || myUniqueWorkerId.length === 0 ? `SFCUNIROW$${this._lineNumber}` : myUniqueWorkerId;
    this._key = myUniqueWorkerId.replace(/\s/g, '');
    return status;
  }

  // Comment: This may not be supported in UI/system so only checked lenght if exists, could be null
  _validateChangeUniqueWorkerId() {
    const myChangeUniqueWorkerId = this._currentLine.CHGUNIQUEWRKID;
    const MAX_LENGTH = 50;

    // CHGUNIQUEWRKID is optional

    if (myChangeUniqueWorkerId && myChangeUniqueWorkerId.length > 0 && myChangeUniqueWorkerId.length >= MAX_LENGTH) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        errCode: WorkerCsvValidator.CHANGE_UNIQUE_WORKER_ID_ERROR,
        errType: 'CHANGE_UNIQUE_WORKER_ID_ERROR',
        error: `CHGUNIQUEWORKERID is longer than ${MAX_LENGTH} characters`,
        source: this._currentLine.CHGUNIQUEWRKID,
        column: 'CHGUNIQUEWRKID',
      });
      return false;
    } else if (myChangeUniqueWorkerId && myChangeUniqueWorkerId.length > 0) {
      this._changeUniqueWorkerId = myChangeUniqueWorkerId;
      return true;
    }
  }

  _validateStatus() {
    const statusValues = ['DELETE', 'UPDATE', 'UNCHECKED', 'NOCHANGE', 'NEW', 'CHGSUB'];
    const myStatus = this._currentLine.STATUS ? this._currentLine.STATUS.toUpperCase() : this._currentLine.STATUS;

    if (!statusValues.includes(myStatus)) {
      // must be present and must be one of the preset values (case insensitive)
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        errCode: WorkerCsvValidator.STATUS_ERROR,
        errType: 'STATUS_ERROR',
        error: 'The STATUS you have supplied is incorrect',
        source: this._currentLine.STATUS,
        column: 'STATUS',
      });
      return false;
    } else {
      // helper which returns true if the given LOCALESTID
      const thisWorkerExists = () => {
        return !!this._currentWorker;
      };

      switch (myStatus) {
        case 'NEW':
          if (thisWorkerExists()) {
            this._validationErrors.push({
              name: this._currentLine.LOCALESTID,
              worker: this._currentLine.UNIQUEWORKERID,
              lineNumber: this._lineNumber,
              errCode: WorkerCsvValidator.STATUS_ERROR,
              errType: 'STATUS_ERROR',
              error:
                'Staff record has a STATUS of NEW but already exists, please change to one of the other statues available',
              source: myStatus,
              column: 'STATUS',
            });
          }
          break;
        case 'DELETE':
          if (!thisWorkerExists()) {
            this._validationErrors.push({
              name: this._currentLine.LOCALESTID,
              worker: this._currentLine.UNIQUEWORKERID,
              lineNumber: this._lineNumber,
              errCode: WorkerCsvValidator.STATUS_ERROR,
              errType: 'STATUS_ERROR',
              error: 'Staff has a STATUS of DELETE but does not exist.',
              source: myStatus,
              column: 'STATUS',
            });
          }
          break;
        case 'UNCHECKED':
        case 'NOCHANGE':
        case 'UPDATE':
          if (!thisWorkerExists()) {
            this._validationErrors.push({
              name: this._currentLine.LOCALESTID,
              worker: this._currentLine.UNIQUEWORKERID,
              lineNumber: this._lineNumber,
              errCode: WorkerCsvValidator.STATUS_ERROR,
              errType: 'STATUS_ERROR',
              error: `Staff record has a STATUS of ${myStatus} but doesn't exist, please change to NEW if you want to add this staff record`,
              source: myStatus,
              column: 'STATUS',
            });
          }
          break;
        case 'CHGSUB':
          // note - the LOCALESTID here is that of the target sub - not the current sub
          if (thisWorkerExists()) {
            this._validationErrors.push({
              name: this._currentLine.LOCALESTID,
              worker: this._currentLine.UNIQUEWORKERID,
              lineNumber: this._lineNumber,
              errCode: WorkerCsvValidator.STATUS_ERROR,
              errType: 'STATUS_ERROR',
              error: 'STATUS is CHGSUB but staff already exists in the new workplace',
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

  _validateDisplayId() {
    const myDisplayId = this._currentLine.DISPLAYID;
    const MAX_LENGTH = 50; // lowering to 50 because this is restricted in ASC WDS

    if (!myDisplayId) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        errCode: WorkerCsvValidator.DISPLAY_ID_ERROR,
        errType: 'DISPLAY_ID_ERROR',
        error: 'DISPLAYID is blank',
        source: this._currentLine.DISPLAYID,
        column: 'DISPLAYID',
      });
      return false;
    } else if (myDisplayId.length >= MAX_LENGTH) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        errCode: WorkerCsvValidator.DISPLAY_ID_ERROR,
        errType: 'WORKER_DISPLAY_ID_ERROR',
        error: `DISPLAYID is longer than ${MAX_LENGTH} characters`,
        source: this._currentLine.DISPLAYID,
        column: 'DISPLAYID',
      });
      return false;
    } else {
      this._displayId = myDisplayId;
      return true;
    }
  }

  _validateNINumber() {
    const myNINumber = this._currentLine.NINUMBER;
    const niRegex = /^\s*[a-zA-Z]{2}(?:\s*\d\s*){6}[a-zA-Z]?\s*$/;

    if (myNINumber) {
      if (myNINumber.length > 0 && !niRegex.test(myNINumber)) {
        this._validationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          errCode: WorkerCsvValidator.NINUMBER_ERROR,
          errType: 'WORKER_NINUMBER_ERROR',
          error: 'NINUMBER is incorrectly formatted',
          source: this._currentLine.NINUMBER,
          column: 'NINUMBER',
        });
        return false;
      } else {
        this._NINumber = myNINumber;
        return true;
      }
    }
    return true;
  }

  _validatePostCode() {
    const myPostcode = this._currentLine.POSTCODE;
    const postcodeRegex = /^[A-Za-z]{1,2}[0-9]{1,2}[A-Za-z]?\s{1}[0-9][A-Za-z]{2}$/;

    if (!myPostcode) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        warnCode: WorkerCsvValidator.POSTCODE_WARNING,
        warnType: 'POSTCODE_WARNING',
        warning: 'POSTCODE is blank',
        source: myPostcode,
        column: 'POSTCODE',
      });
      return false;
    } else if (!postcodeRegex.test(myPostcode)) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        errCode: WorkerCsvValidator.POSTCODE_ERROR,
        errType: 'POSTCODE ERROR',
        error: 'POSTCODE is incorrectly formatted',
        source: myPostcode,
        column: 'POSTCODE',
      });
      return false;
    } else {
      this._postCode = myPostcode;
      return true;
    }
  }

  _validateDOB() {
    const MINIMUM_AGE = 14;
    const MAXIMUM_AGE = 100;
    const maxDate = moment().subtract(MINIMUM_AGE, 'y');
    const minDate = moment().subtract(MAXIMUM_AGE, 'y');
    const myDOB = this._currentLine.DOB;
    const myDobRealDate = moment.utc(myDOB, 'DD/MM/YYYY');

    if (!this._currentLine.DOB) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        warnCode: WorkerCsvValidator.DOB_WARNING,
        warnType: 'DOB_WARNING',
        warning: 'DOB is missing',
        source: this._currentLine.DOB,
        column: 'DOB',
      });
      return false;
    } else if (!myDobRealDate.isValid()) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        warnCode: WorkerCsvValidator.DOB_WARNING,
        warnType: 'DOB_WARNING',
        warning: 'The date of birth you have entered is incorrectly formatted and will be ignored',
        source: this._currentLine.DOB,
        column: 'DOB',
      });
      return false;
    } else if (myDobRealDate.isBefore(minDate) || myDobRealDate.isAfter(maxDate)) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        warnCode: WorkerCsvValidator.DOB_WARNING,
        warnType: 'DOB_WARNING',
        warning: 'The date of birth you have entered is not between a valid range of 14 – 100 years old',
        source: this._currentLine.DOB,
        column: 'DOB',
      });
      return false;
    } else {
      this._DOB = myDobRealDate;
      return true;
    }
  }

  _validateGender() {
    const genderValues = [1, 2, 3, 4]; // [MALE=1, FEMALE=2, UNKNOWN=3, OTHER=4];
    const myGender = parseInt(this._currentLine.GENDER, 10);

    if (this._currentLine.GENDER.length > 0) {
      if (isNaN(myGender) || !genderValues.includes(parseInt(myGender, 10))) {
        this._validationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          errCode: WorkerCsvValidator.GENDER_ERROR,
          errType: 'GENDER_ERROR',
          error: 'The code you have entered for GENDER is incorrect',
          source: this._currentLine.GENDER,
          column: 'GENDER',
        });
        return false;
      } else {
        switch (myGender) {
          case 1:
            this._gender = 'Male';
            break;
          case 2:
            this._gender = 'Female';
            break;
          case 3:
            this._gender = "Don't know";
            break;
          case 4:
            this._gender = 'Other';
            break;
        }
        return true;
      }
    }
  }

  // Mandatory for local Authority - need to check this conditional check
  _validateEthnicity() {
    const myEthnicity = parseInt(this._currentLine.ETHNICITY, 10);

    // optional
    if (this._currentLine.ETHNICITY && this._currentLine.ETHNICITY.length > 0) {
      if (isNaN(myEthnicity)) {
        this._validationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          errCode: WorkerCsvValidator.ETHNICITY_ERROR,
          errType: 'ETHNICITY_ERROR',
          error: 'The code you have entered for ETHNICITY is incorrect',
          source: this._currentLine.ETHNICITY,
          column: 'ETHNICITY',
        });
        return false;
      } else {
        this._ethnicity = myEthnicity;
        return true;
      }
    } else {
      return true;
    }
  }

  _validateCitizenShip() {
    const BritishCitizenshipValues = [1, 2, 999];
    const myBritishCitizenship = parseInt(this._currentLine.BRITISHCITIZENSHIP, 10);
    const myNationality = parseInt(this._currentLine.NATIONALITY, 10);

    if (this._currentLine.BRITISHCITIZENSHIP && this._currentLine.BRITISHCITIZENSHIP.length > 0) {
      if (myNationality === 826) {
        this._validationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          warnCode: WorkerCsvValidator.BRITISH_CITIZENSHIP_WARNING,
          warnType: 'BRITISH_CITIZENSHIP_WARNING',
          warning: 'BRITISHCITIZENSHIP has been ignored as workers nationality is British',
          source: this._currentLine.BRITISHCITIZENSHIP,
          column: 'BRITISHCITIZENSHIP',
        });
        return false;
      } else if (
        isNaN(myBritishCitizenship) ||
        !BritishCitizenshipValues.includes(parseInt(myBritishCitizenship, 10))
      ) {
        this._validationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          errCode: WorkerCsvValidator.BRITISH_CITIZENSHIP_ERROR,
          errType: 'BRITISH_CITIZENSHIP_ERROR',
          error: 'BRITISHCITIZENSHIP code is not a valid entry',
          source: this._currentLine.BRITISHCITIZENSHIP,
          column: 'BRITISHCITIZENSHIP',
        });
        return false;
      } else {
        switch (myBritishCitizenship) {
          case 1:
            this._britishNationality = 'Yes';
            break;
          case 2:
            this._britishNationality = 'No';
            break;
          case 999:
            this._britishNationality = "Don't know";
            break;
        }
        return true;
      }
    }
  }

  // this should 4 digit and less than date of birth;
  // ignore countr of birth check
  _validateYearOfEntry() {
    const myYearOfEntry = this._currentLine.YEAROFENTRY;
    const yearRegex = /^\d{4}$/;
    const thisYear = new Date().getFullYear();
    const myRealDOBDate = moment.utc(this._currentLine.DOB, 'DD/MM/YYYY');
    const myCountry = this._currentLine.COUNTRYOFBIRTH;

    if (this._currentLine.YEAROFENTRY && this._currentLine.YEAROFENTRY.length > 0) {
      if (myYearOfEntry && !yearRegex.test(myYearOfEntry)) {
        this._validationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          errCode: WorkerCsvValidator.YEAROFENTRY_ERROR,
          errType: 'YEAROFENTRY_ERROR',
          error: 'YEAROFENTRY is incorrectly formatted',
          source: this._currentLine.YEAROFENTRY,
          column: 'YEAROFENTRY',
        });
        return false;
      } else if (thisYear < myYearOfEntry) {
        this._validationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          errCode: WorkerCsvValidator.YEAROFENTRY_ERROR,
          errType: 'YEAROFENTRY_ERROR',
          error: 'YEAROFENTRY is in the future',
          source: this._currentLine.YEAROFENTRY,
          column: 'YEAROFENTRY',
        });
        return false;
      } else if (myRealDOBDate && myRealDOBDate.year() > myYearOfEntry) {
        this._validationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          errCode: WorkerCsvValidator.YEAROFENTRY_ERROR,
          errType: 'YEAROFENTRY_ERROR',
          error: 'YEAROFENTRY must be greater or equal to DOB',
          source: this._currentLine.YEAROFENTRY,
          column: 'YEAROFENTRY/DOB',
        });
        return false;
      } else if (!myCountry) {
        this._validationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          warnCode: WorkerCsvValidator.YEAROFENTRY_WARNING,
          warnType: 'YEAROFENTRY_WARNING',
          warning: 'Year of entry has been ignored as Country of Birth is missing',
          source: this._currentLine.YEAROFENTRY,
          column: 'YEAROFENTRY/COUNTRYOFBIRTH',
        });
        return false;
      } else if (myCountry && parseInt(myCountry, 10) === 826) {
        this._validationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          warnCode: WorkerCsvValidator.YEAROFENTRY_WARNING,
          warnType: 'YEAROFENTRY_WARNING',
          warning: 'Year of entry has been ignored as Country of Birth is British',
          source: this._currentLine.YEAROFENTRY,
          column: 'YEAROFENTRY/COUNTRYOFBIRTH',
        });
        return false;
      } else {
        this._yearOfEntry = parseInt(myYearOfEntry, 10);
        return true;
      }
    }
  }

  _validateDisabled() {
    const disabledValues = [0, 1, 2, 3];
    const myDisabled = parseInt(this._currentLine.DISABLED, 10);

    // optional
    if (this._currentLine.DISABLED && this._currentLine.DISABLED.length > 0) {
      if (isNaN(myDisabled) || !disabledValues.includes(parseInt(myDisabled, 10))) {
        this._validationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          errCode: WorkerCsvValidator.DISABLED_ERROR,
          errType: 'DISABLED_ERROR',
          error: 'The code you have entered for DISABLED is incorrect',
          source: this._currentLine.DISABLED,
          column: 'DISABLED',
        });
        return false;
      } else {
        switch (myDisabled) {
          case 1:
            this._disabled = 'Yes';
            break;
          case 0:
            this._disabled = 'No';
            break;
          case 2:
            this._disabled = 'Undisclosed';
            break;
          case 3:
            this._disabled = "Don't know";
            break;
        }
        return true;
      }
    } else {
      return true;
    }
  }

  _validateCareCert() {
    const careCertValues = [1, 2, 3];
    const myCareCert = parseInt(this._currentLine.CARECERT, 10);

    if (this._currentLine.CARECERT && this._currentLine.CARECERT.length > 0) {
      if (isNaN(myCareCert) || !careCertValues.includes(parseInt(myCareCert, 10))) {
        this._validationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          errCode: WorkerCsvValidator.CARE_CERT_ERROR,
          errType: 'CARECERT_ERROR',
          error: 'The code you have entered for CARECERT is incorrect',
          source: this._currentLine.CARECERT,
          column: 'CARECERT',
        });
        return false;
      } else {
        switch (myCareCert) {
          case 1:
            this._careCert = 'Yes, completed';
            break;
          case 2:
            this._careCert = 'No';
            break;
          case 3:
            this._careCert = 'Yes, in progress or partially completed';
            break;
        }
        return true;
      }
    } else {
      return true;
    }
  }

  _validateRecSource() {
    const myRecSource = parseInt(this._currentLine.RECSOURCE, 10);

    // optional
    if (this._currentLine.RECSOURCE && isNaN(myRecSource)) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        errCode: WorkerCsvValidator.RECSOURCE_ERROR,
        errType: 'RECSOURCE_ERROR',
        error: 'The code you have entered for RECSOURCE is incorrect',
        source: this._currentLine.RECSOURCE,
        column: 'RECSOURCE',
      });
      return false;
    } else {
      this._recSource = myRecSource || myRecSource === 0 ? myRecSource : null;
      return true;
    }
  }

  _validateStartDate() {
    const AGE = 14;
    const myStartDate = this._currentLine.STARTDATE;
    const dateRegex = /^([0-2][0-9]|(3)[0-1])(\/)(((0)[0-9])|((1)[0-2]))(\/)\d{4}$/;
    const today = moment(new Date());
    const myRealStartDate = moment.utc(myStartDate, 'DD/MM/YYYY');
    const myRealDOBDate =
      this._currentLine.DOB && this._currentLine.DOB.length > 1
        ? moment.utc(this._currentLine.DOB, 'DD/MM/YYYY')
        : null;
    const myYearOfEntry = this._currentLine.YEAROFENTRY;
    const myRealYearOfEntry = myYearOfEntry ? `${myYearOfEntry}-01-01` : null; // if year of entry is given, then format it to a proper year that can be used by moment

    if (!myStartDate) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        warnCode: WorkerCsvValidator.START_DATE_WARNING,
        warnType: 'START_DATE_WARNING',
        warning: 'STARTDATE is missing',
        source: this._currentLine.STARTDATE,
        column: 'STARTDATE',
      });
      return false;
    } else if (!dateRegex.test(myStartDate)) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        warnCode: WorkerCsvValidator.START_DATE_WARNING,
        warnType: 'START_DATE_WARNING',
        warning: 'STARTDATE is incorrectly formatted and will be ignored',
        source: this._currentLine.STARTDATE,
        column: 'STARTDATE',
      });
      return false;
    } else if (myRealStartDate.isAfter(today)) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        warnCode: WorkerCsvValidator.START_DATE_WARNING,
        warnType: 'START_DATE_WARNING',
        warning: 'STARTDATE is in the future and will be ignored',
        source: this._currentLine.STARTDATE,
        column: 'STARTDATE',
      });
      return false;
    } else if (myRealDOBDate && myRealStartDate.diff(myRealDOBDate, 'years', false) < AGE) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        warnCode: WorkerCsvValidator.START_DATE_WARNING,
        warnType: 'START_DATE_WARNING',
        warning: 'STARTDATE is before workers 14th birthday and will be ignored',
        source: this._currentLine.STARTINSECT,
        column: 'STARTDATE',
      });
      return false;
    } else if (myYearOfEntry && myRealStartDate.isBefore(myRealYearOfEntry)) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        warnCode: WorkerCsvValidator.START_DATE_WARNING,
        warnType: 'START_DATE_WARNING',
        warning: 'STARTDATE is before year of entry and will be ignored',
        source: this._currentLine.STARTINSECT,
        column: 'STARTDATE',
      });
      return false;
    } else {
      this._startDate = myRealStartDate;
      return true;
    }
  }

  _validateStartInsect() {
    const AGE = 14;
    const myStartInsect = this._currentLine.STARTINSECT;
    const myStartInsectNumber = parseInt(myStartInsect, 10);
    const yearRegex = /^\d{4}|999$/;
    const myRealDOBDate = moment.utc(this._currentLine.DOB, 'DD/MM/YYYY');

    if (!myStartInsect) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        warnCode: WorkerCsvValidator.START_INSECT_WARNING,
        warnType: 'START_INSECT_WARNING',
        warning: 'STARTINSECT is missing',
        source: this._currentLine.STARTINSECT,
        column: 'STARTINSECT',
      });
      return false;
    } else if (!yearRegex.test(myStartInsect)) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        warnCode: WorkerCsvValidator.START_INSECT_WARNING,
        warnType: 'START_INSECT_WARNING',
        warning: 'STARTINSECT is incorrectly formatted and will be ignored',
        source: this._currentLine.STARTINSECT,
        column: 'STARTINSECT',
      });
      return false;
    } else if (myStartInsectNumber !== 999 && this._startDate && myStartInsectNumber > this._startDate.year()) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        warnCode: WorkerCsvValidator.START_INSECT_WARNING,
        warnType: 'START_INSECT_WARNING',
        warning: 'STARTINSECT is after STARTDATE and will be ignored',
        source: this._currentLine.STARTINSECT,
        column: 'STARTINSECT',
      });
      return false;
    } else if (myStartInsectNumber !== 999 && myRealDOBDate && myRealDOBDate.year() + AGE > myStartInsectNumber) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        warnCode: WorkerCsvValidator.START_INSECT_WARNING,
        warnType: 'START_INSECT_WARNING',
        warning: 'STARTINSECT is before workers 14th birthday and will be ignored',
        source: this._currentLine.STARTINSECT,
        column: 'STARTINSECT',
      });
      return false;
    } else {
      this._startInsect = myStartInsectNumber;
      return true;
    }
  }

  _validateApprentice() {
    const apprenticeValues = [1, 2, 999];
    const myApprentice = parseInt(this._currentLine.APPRENTICE, 10);

    // optional
    if (this._currentLine.APPRENTICE && this._currentLine.APPRENTICE.length) {
      if (isNaN(myApprentice) || !apprenticeValues.includes(myApprentice)) {
        this._validationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          warnCode: WorkerCsvValidator.APPRENCTICE_WARNING,
          warnType: 'APPRENTICE_WARNING',
          warning: 'The code for APPRENTICE is incorrect and will be ignored',
          source: this._currentLine.APPRENTICE,
          column: 'APPRENTICE',
        });
        return false;
      } else {
        switch (myApprentice) {
          case 1:
            this._apprentice = 'Yes';
            break;
          case 2:
            this._apprentice = 'No';
            break;
          case 999:
            this._apprentice = "Don't know";
            break;
        }
        return true;
      }
    } else {
      return true;
    }
  }

  _validateZeroHourContract() {
    const zeroHourContractValues = [1, 2, 999];
    const myZeroHourContract = parseInt(this._currentLine.ZEROHRCONT, 10);
    const myContHours = parseFloat(this._currentLine.CONTHOURS);
    const zeroHoursEmpty = !(this._currentLine.ZEROHRCONT && this._currentLine.ZEROHRCONT.length > 0);

    if (myContHours > 0 && !this._currentLine.ZEROHRCONT) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        warnCode: WorkerCsvValidator.ZERO_HRCONT_WARNING,
        warnType: 'ZERO_HRCONT_WARNING',
        warning: 'You have entered contracted hours but have not said this worker is not on a zero hours contract',
        source: this._currentLine.ZEROHRCONT,
        column: 'ZEROHRCONT',
      });
      return false;
    } else if (!zeroHoursEmpty && (isNaN(myZeroHourContract) || !zeroHourContractValues.includes(myZeroHourContract))) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        errCode: WorkerCsvValidator.ZERO_HRCONT_ERROR,
        errType: 'ZEROHRCONT_ERROR',
        error: 'The code you have entered for ZEROHRCONT is incorrect',
        source: this._currentLine.ZEROHRCONT,
        column: 'ZEROHRCONT',
      });
      return false;
    } else if (myContHours > 0 && (myZeroHourContract === 999 || myZeroHourContract === 1)) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        errCode: WorkerCsvValidator.ZERO_HRCONT_ERROR,
        errType: 'ZEROHRCONT_ERROR',
        error:
          'The value entered for CONTHOURS in conjunction with the value for ZEROHRCONT fails our validation checks',
        source: this._currentLine.ZEROHRCONT,
        column: 'CONTHOURS/ZEROHRCONT',
      });
      return false;
    } else if (myContHours === 0 && myZeroHourContract === 2) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        warnCode: WorkerCsvValidator.ZERO_HRCONT_WARNING,
        warnType: 'ZERO_HRCONT_WARNING',
        warning: 'You have entered “0” in CONTHOURS but not entered “Yes” to the ZEROHRCONT question',
        source: this._currentLine.ZEROHRCONT,
        column: 'CONTHOURS/ZEROHRCONT',
      });
      return false;
    } else {
      switch (myZeroHourContract) {
        case 1:
          this._zeroHourContract = 'Yes';
          break;
        case 2:
          this._zeroHourContract = 'No';
          break;
        case 999:
          this._zeroHourContract = "Don't know";
          break;
      }
      return true;
    }
  }

  _validateDaysSick() {
    const myDaysSick = parseFloat(this._currentLine.DAYSSICK);

    if (this._currentLine.DAYSSICK && this._currentLine.DAYSSICK.length > 0) {
      const MAX_VALUE = 366.0;
      const DONT_KNOW_VALUE = 999;

      const containsHalfDay =
        this._currentLine.DAYSSICK.indexOf('.') > 0
          ? [0, 5].includes(parseInt(this._currentLine.DAYSSICK.split('.')[1], 10))
          : true;
      if (
        myDaysSick !== DONT_KNOW_VALUE &&
        (isNaN(myDaysSick) || !containsHalfDay || myDaysSick < 0 || myDaysSick > MAX_VALUE)
      ) {
        this._validationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          warnCode: WorkerCsvValidator.DAYSICK_ERROR,
          warnType: 'DAYSSICK_ERROR',
          warning: 'DAYSSICK is out of validation range and will be ignored',
          source: this._currentLine.DAYSSICK,
          column: 'DAYSSICK',
        });
        return false;
      } else {
        switch (myDaysSick) {
          case 999:
            this._daysSick = 'No';
            break;
          default:
            this._daysSick = myDaysSick;
        }
        return true;
      }
    } else {
      return true;
    }
  }

  _validateDaysSickChanged() {
    if (this._currentLine.STATUS !== 'UPDATE' && this._currentLine.STATUS !== 'NOCHANGE') {
      return;
    }

    if (
      this._currentWorker &&
      moment(get(this._currentWorker, 'daysSick.lastSaved')).isBefore(Date.now(), 'day') &&
      get(this._currentWorker, 'daysSick.currentValue.days') === parseInt(this._currentLine.DAYSSICK)
    ) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        warnCode: WorkerCsvValidator.DAYSICK_WARNING,
        warnType: 'DAYSICK_WARNING',
        warning: 'DAYSSICK in the last 12 months has not changed please check this is correct',
        source: this._currentLine.DAYSSICK,
        column: 'DAYSSICK',
      });
    }
  }

  _validateSalaryInt() {
    const salaryIntValues = [1, 3];
    const mySalaryInt = parseInt(this._currentLine.SALARYINT, 10);

    // optional
    if (this._currentLine.SALARYINT && this._currentLine.SALARYINT.length > 0) {
      if (isNaN(mySalaryInt)) {
        this._validationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          errCode: WorkerCsvValidator.SALARY_ERROR,
          errType: 'SALARYINT_ERROR',
          error: 'Salary Int (SALARYINT) must be an integer',
          source: this._currentLine.SALARYINT,
          column: 'SALARYINT',
        });
        return false;
      } else if (!salaryIntValues.includes(parseInt(mySalaryInt, 10))) {
        this._validationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          errCode: WorkerCsvValidator.SALARY_ERROR,
          errType: 'SALARYINT_ERROR',
          error: 'The code you have entered for SALARYINT is incorrect',
          source: this._currentLine.SALARYINT,
          column: 'SALARYINT',
        });
        return false;
      } else {
        switch (mySalaryInt) {
          case 1:
            this._salaryInt = 'Annually';
            break;
          case 3:
            this._salaryInt = 'Hourly';
            break;
          default:
            // not doing anything with unpaid
            this._salaryInt = null;
        }

        return true;
      }
    } else {
      return true;
    }
  }

  _validateSalary() {
    const mySalary = parseInt(this._currentLine.SALARY, 10);
    const mainJobRole = parseInt(this._currentLine.MAINJOBROLE, 10);
    const MAX_VALUE = mainJobRole === 1 ? 250000 : 200000;

    // optional
    if (this._currentLine.SALARY.length > 0) {
      // can only give (annual) salary if salary interval (SALARYINT) is annual
      if (this._salaryInt === null || this._salaryInt !== 'Annually') {
        this._validationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          errCode: WorkerCsvValidator.SALARY_ERROR,
          errType: 'SALARY_ERROR',
          error: 'The code you have entered for SALARYINT does not match SALARY',
          source: `SALARYINT (${this._currentLine.SALARYINT}) - SALARY (${this._currentLine.SALARY})`,
          column: 'SALARYINT',
        });
        return false;
      } else if (isNaN(mySalary) || mySalary <= 500 || mySalary >= MAX_VALUE) {
        this._validationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          errCode: WorkerCsvValidator.SALARY_ERROR,
          errType: 'SALARY_ERROR',
          error: `Salary (SALARY) must be an integer between £500 and £${MAX_VALUE}`,
          source: this._currentLine.SALARY,
          column: 'SALARY',
        });
        return false;
      } else {
        this._salary = mySalary;
        return true;
      }
    } else {
      return true;
    }
  }

  _validateHourlyRate() {
    const myHourlyRate = parseFloat(this._currentLine.HOURLYRATE);
    const digitRegex = /^\d+(\.\d{1,2})?$/; // e.g. 15.53 or 0.53 or 1.53 or 100.53

    // optional
    if (this._currentLine.HOURLYRATE && this._currentLine.HOURLYRATE.length > 0) {
      // can only give (annual) salary if salary interval (SALARYINT) is hourly
      if (this._salaryInt === null || this._salaryInt !== 'Hourly') {
        this._validationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          errCode: WorkerCsvValidator.HOURLY_RATE_ERROR,
          errType: 'HOURLY_RATE_ERROR',
          error: 'The code you have entered for SALARYINT does not match HOURLYRATE',
          source: `SALARYINT(${this._currentLine.SALARYINT}) - HOURLYRATE (${this._currentLine.HOURLYRATE})`,
          column: 'SALARYINT/HOURLYRATE',
        });
        return false;
      } else if (isNaN(myHourlyRate) || !digitRegex.test(this._currentLine.HOURLYRATE)) {
        this._validationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          errCode: WorkerCsvValidator.HOURLY_RATE_ERROR,
          errType: 'HOURLY_RATE_ERROR',
          error: 'The code you have entered for HOURLYRATE is incorrect and will be ignored',
          source: this._currentLine.HOURLYRATE,
          column: 'HOURLYRATE',
        });
        return false;
      } else {
        this._hourlyRate = myHourlyRate;
        return true;
      }
    } else {
      return true;
    }
  }

  _validateMainJobRole() {
    const myMainJobRole = parseInt(this._currentLine.MAINJOBROLE, 10);

    // note - optional in bulk import spec, but mandatory in ASC WDS frontend and backend
    if (!this._currentLine.MAINJOBROLE || this._currentLine.MAINJOBROLE.length === 0 || isNaN(myMainJobRole)) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        errCode: WorkerCsvValidator.MAIN_JOB_ROLE_ERROR,
        errType: 'MAIN_JOB_ROLE_ERROR',
        error: 'MAINJOBROLE has not been supplied',
        source: this._currentLine.MAINJOBROLE,
        column: 'MAINJOBROLE',
      });
      return false;
    } else {
      this._mainJobRole = myMainJobRole;
      this._mainJobRoleId = myMainJobRole;
      return true;
    }
  }

  _validateMainJobDesc() {
    const myMainJobDesc = this._currentLine.MAINJRDESC;
    const MAX_LENGTH = 120;

    // main job description is optional, but even then, only relevant if main job is 23 or 27
    const ALLOWED_JOBS = [23, 27];

    if (ALLOWED_JOBS.includes(this._mainJobRole) && this._currentLine.MAINJRDESC.length === 0) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        errCode: WorkerCsvValidator.MAIN_JOB_DESC_ERROR,
        errType: 'MAIN_JOB_DESC_ERROR',
        error: 'MAINJRDESC has not been supplied',
        source: this._currentLine.MAINJRDESC,
        column: 'MAINJRDESC',
      });
      return false;
    } else if (myMainJobDesc.length >= MAX_LENGTH) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        errCode: WorkerCsvValidator.MAIN_JOB_DESC_ERROR,
        errType: 'MAIN_JOB_DESC_ERROR',
        error: 'MAINJRDESC is longer than 120 characters',
        source: this._currentLine.MAINJRDESC,
        column: 'MAINJRDESC',
      });
      return false;
    } else if (
      !ALLOWED_JOBS.includes(this._mainJobRole) &&
      this._currentLine.MAINJRDESC &&
      this._currentLine.MAINJRDESC.length > 0
    ) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        warnCode: WorkerCsvValidator.MAIN_JOB_DESC_WARNING,
        warnType: 'MAIN_JOB_DESC_WARNING',
        warning: 'MAINJRDESC will be ignored as not required for MAINJOBROLE',
        source: this._currentLine.MAINJRDESC,
        column: 'MAINJRDESC',
      });
      return false;
    } else {
      this._mainJobDesc = myMainJobDesc;
      return true;
    }
  }

  _validateContHours() {
    const digitRegex = /^-?\d+(\.[05])?$/; // e.g. 15 or 0.5 or 1.0 or 100.5
    const MIN_VALUE = 0;
    const MAX_VALUE = 75;
    const EMPL_STATUSES = [3, 4, 7];

    const strContHours = String(this._currentLine.CONTHOURS);
    const fltContHours = parseFloat(this._currentLine.CONTHOURS);
    const intEmplStatus = parseInt(this._currentLine.EMPLSTATUS, 10);
    const intZeroHoursType = parseInt(this._currentLine.ZEROHRCONT, 10);

    // if zero hours contract is 'Yes' then any non blank
    // contract hours value is invalid
    if (intZeroHoursType === 1 && strContHours !== '') {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        warnCode: WorkerCsvValidator.CONT_HOURS_WARNING,
        warnType: 'CONT_HOURS_WARNING',
        warning: `CONTHOURS will be ignored as ZEROHRCONT is ${intZeroHoursType}`,
        source: strContHours,
        column: 'CONTHOURS',
      });
      return false;
    }

    // If it's one of the employment statuses that shouldn't have a
    // contract hours and it does then that's a validation failure
    if (EMPL_STATUSES.includes(intEmplStatus) && strContHours !== '') {
      let contractType;
      switch (intEmplStatus) {
        case 3:
          contractType = 'Pool/Bank';
          break;
        case 4:
          contractType = 'Agency';
          break;
        case 7:
          contractType = 'Other';
          break;
      }
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        warnCode: WorkerCsvValidator.CONT_HOURS_WARNING,
        warnType: 'CONT_HOURS_WARNING',
        warning: `CONTHOURS will be ignored as EMPLSTATUS is ${contractType}`,
        source: strContHours,
        column: 'CONTHOURS',
      });
      return false;
    }

    // optional
    if (strContHours === '') {
      this._contHours = null;
      return true;
    }

    if (!digitRegex.test(strContHours) || fltContHours < MIN_VALUE) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        warnCode: WorkerCsvValidator.CONT_HOURS_WARNING,
        warnType: 'CONT_HOURS_WARNING',
        warning: 'The code you have entered for CONTHOURS is incorrect and will be ignored',
        source: strContHours,
        column: 'CONTHOURS',
      });
      return false;
    }
    if ((fltContHours | 0) /* cast to int asm.js style */ === 999) {
      this._contHours = 'No';
      return true;
    }

    if (fltContHours > MAX_VALUE) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,

        warnCode: WorkerCsvValidator.CONT_HOURS_WARNING,
        warnType: 'CONT_HOURS_WARNING',
        warning: 'CONTHOURS is greater than 75 and will be ignored',
        source: strContHours,
        column: 'CONTHOURS',
      });
      return false;
    }
    this._contHours = fltContHours;
    return true;
  }

  _validateAvgHours() {
    const digitRegex = /^-?\d+(\.[05])?$/; // e.g. 15 or 0.5 or 1.0 or 100.5
    const MIN_VALUE = 0;
    const MAX_VALUE = 75;
    const EMPL_STATUSES = [1, 2];

    const strAvgHours = String(this._currentLine.AVGHOURS);
    const fltAvgHours = parseFloat(this._currentLine.AVGHOURS);
    const intEmplStatus = parseInt(this._currentLine.EMPLSTATUS, 10);
    const intZeroHoursType = parseInt(this._currentLine.ZEROHRCONT, 10);

    // If it's one of the employment statuses that shouldn't have an
    // average hours and it does then that's a validation failure.
    // If zero Hours is set to 'yes' then this rule doesn't apply
    if (intZeroHoursType !== 1 && EMPL_STATUSES.includes(intEmplStatus) && strAvgHours !== '') {
      let contractType;
      switch (intEmplStatus) {
        case 1:
          contractType = 'Permanent';
          break;
        case 2:
          contractType = 'Temporary';
          break;
      }
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        warnCode: WorkerCsvValidator.AVG_HOURS_WARNING,
        warnType: 'AVG_HOURS_ERROR',
        warning: `AVGHOURS will be ignored as staff record is ${contractType}`,
        source: strAvgHours,
        column: 'AVGHOURS',
      });
      return false;
    }

    // optional
    if (strAvgHours === '') {
      this._avgHours = null;
      return true;
    }

    if (!digitRegex.test(strAvgHours) || fltAvgHours < MIN_VALUE) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        warnCode: WorkerCsvValidator.AVG_HOURS_WARNING,
        warnType: 'AVG_HOURS_ERROR',
        warning: 'The code you have entered for AVGHOURS is incorrect and will be ignored',
        source: strAvgHours,
        column: 'AVGHOURS',
      });
      return false;
    }

    if ((fltAvgHours | 0) /* cast to int asm.js style */ === 999) {
      this._avgHours = 'No';
      return true;
    }

    if (fltAvgHours > MAX_VALUE) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        warnCode: WorkerCsvValidator.AVG_HOURS_WARNING,
        warnType: 'AVG_HOURS_ERROR',
        warning: 'AVGHOURS is greater than 75 and will be ignored',
        source: strAvgHours,
        column: 'AVGHOURS',
      });
      return false;
    }
    this._avgHours = fltAvgHours;
    return true;
  }

  _validateRegisteredNurse() {
    const myRegisteredNurse = parseInt(this._currentLine.NMCREG, 10);
    const NURSING_ROLE = 16;
    const mainJobRoleIsNurse = this._mainJobRole === NURSING_ROLE;
    const notNurseRole = !mainJobRoleIsNurse;

    if (this._mainJobRole === NURSING_ROLE && myRegisteredNurse !== 0 && isNaN(myRegisteredNurse)) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        warnCode: WorkerCsvValidator.NMCREG_WARNING,
        warnType: 'NMCREG_WARNING',
        warning: 'NMCREG has not been supplied',
        source: this._currentLine.NMCREG,
        column: 'NMCREG',
      });
      return false;
    } else if (this._currentLine.NMCREG && this._currentLine.NMCREG.length !== 0 && notNurseRole) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        warnCode: WorkerCsvValidator.NMCREG_WARNING,
        warnType: 'NMCREG_WARNING',
        warning: 'NMCREG will be ignored as this is not required for the MAINJOBROLE',
        source: this._currentLine.NMCREG,
        column: 'NMCREG',
      });
      return false;
    } else {
      this._registeredNurse = myRegisteredNurse;
      return true;
    }
  }

  _validateNursingSpecialist() {
    const listOfNurseSpecialisms = this._currentLine.NURSESPEC.length
      ? this._currentLine.NURSESPEC.split(';').map((s) => parseFloat(s))
      : [];
    const specialisms = [1, 2, 3, 4, 5, 6];
    const notSpecialisms = [7, 8];

    const NURSING_ROLE = 16;
    const mainJobRoleIsNurse = this._mainJobRole === NURSING_ROLE;
    const notNurseRole = !mainJobRoleIsNurse;

    if (mainJobRoleIsNurse) {
      if (listOfNurseSpecialisms.length === 0) {
        this._validationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          warnCode: WorkerCsvValidator.NURSE_SPEC_WARNING,
          warnType: 'NURSE_SPEC_WARNING',
          warning: 'NURSESPEC has not been supplied',
          source: this._currentLine.NURSESPEC,
          column: 'NURSESPEC',
        });
      }

      if (
        specialisms.some((s) => listOfNurseSpecialisms.includes(s)) &&
        notSpecialisms.some((s) => listOfNurseSpecialisms.includes(s))
      ) {
        this._validationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          warnCode: WorkerCsvValidator.NURSE_SPEC_WARNING,
          warnType: 'NURSE_SPEC_WARNING',
          warning:
            'NURSESPEC it is not possible to use code 7 (not applicable) and code 8 (not known) with codes 1 to 6. Code 7 and 8 will be ignored',
          source: this._currentLine.NURSESPEC,
          column: 'NURSESPEC',
        });
      }

      if (notSpecialisms.every((s) => listOfNurseSpecialisms.includes(s))) {
        this._validationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          warnCode: WorkerCsvValidator.NURSE_SPEC_WARNING,
          warnType: 'NURSE_SPEC_WARNING',
          warning:
            'NURSESPEC it is not possible to use codes 7 (not applicable) with code 8 (not know). These will be ignored',
          source: this._currentLine.NURSESPEC,
          column: 'NURSESPEC',
        });
      }
    } else if (this._currentLine.NMCREG && this._currentLine.NMCREG.length !== 0 && notNurseRole) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        warnCode: WorkerCsvValidator.NURSE_SPEC_WARNING,
        warnType: 'NURSE_SPEC_WARNING',
        warning: 'NURSESPEC will be ignored as this is not required for the MAINJOBROLE',
        source: this._currentLine.NURSESPEC,
        column: 'NURSESPEC',
      });
      return false;
    }

    this._nursingSpecialist = listOfNurseSpecialisms;
    return true;
  }

  _validateAmhp() {
    const SOCIAL_WORKER_ROLE = 6;
    const amhpValues = [1, 2, 999];

    const strAmhp = String(this._currentLine.AMHP);
    const intAmhp = parseInt(this._currentLine.AMHP, 10);

    const isSocialWorkerRole = this._mainJobRole === SOCIAL_WORKER_ROLE;

    if (isSocialWorkerRole) {
      if (strAmhp === '') {
        this._validationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          warnCode: WorkerCsvValidator.AMHP_WARNING,
          warnType: 'AMHP_WARNING',
          warning: 'AMHP has not been supplied',
          source: this._currentLine.AMHP,
          column: 'AMHP',
        });
        return false;
      }

      if (!amhpValues.includes(intAmhp)) {
        this._validationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          warnCode: WorkerCsvValidator.AMHP_WARNING,
          warnType: 'AMHP_WARNING',
          warning: 'The code you have entered for AMHP is incorrect and will be ignored',
          source: this._currentLine.AMHP,
          column: 'AMHP',
        });
        return false;
      }
    } else if (strAmhp !== '') {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        warnCode: WorkerCsvValidator.AMHP_WARNING,
        warnType: 'AMHP_WARNING',
        warning: 'The code you have entered for AMHP will be ignored as not required for this MAINJOBROLE',
        source: this._currentLine.AMHP,
        column: 'AMHP',
      });
      return false;
    }

    this._amhp = strAmhp;
    switch (intAmhp) {
      case 1:
        this._amhp = 'Yes';
        break;

      case 2:
        this._amhp = 'No';
        break;

      case 999:
        this._amhp = "Don't know";
        break;
    }

    return true;
  }

  _validateNationality() {
    const myNationality = parseInt(this._currentLine.NATIONALITY, 10);

    // optional
    if (this._currentLine.NATIONALITY && this._currentLine.NATIONALITY.length > 0) {
      if (isNaN(myNationality)) {
        this._validationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          errCode: WorkerCsvValidator.NATIONALITY_ERROR,
          errType: 'NATIONALITY_ERROR',
          error: 'Nationality (NATIONALITY) must be an integer',
          source: this._currentLine.NATIONALITY,
          column: 'NATIONALITY',
        });
        return false;
      } else {
        this._nationality = myNationality;
        return true;
      }
    } else {
      return true;
    }
  }

  _validateCountryOfBirth() {
    const myCountry = parseInt(this._currentLine.COUNTRYOFBIRTH, 10);

    if (this._currentLine.COUNTRYOFBIRTH && this._currentLine.COUNTRYOFBIRTH.length > 0) {
      if (isNaN(myCountry)) {
        this._validationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          errCode: WorkerCsvValidator.COUNTRY_OF_BIRTH_ERROR,
          errType: 'COUNTRY_OF_BIRTH_ERROR',
          error: 'Country of Birth (COUNTRYOFBIRTH) must be an integer',
          source: this._currentLine.COUNTRYOFBIRTH,
          column: 'COUNTRYOFBIRTH',
        });
        return false;
      } else {
        this._countryOfBirth = myCountry;
        return true;
      }
    }
  }

  _validateSocialCareQualification() {
    const mySocialCare = this._currentLine.SCQUAL ? this._currentLine.SCQUAL.split(';') : null;
    const mainJobRoles = [6, 16, 15];
    const ALLOWED_SOCIAL_CARE_VALUES = [1, 2, 999];
    const mySocialCareIndicator =
      this._currentLine.SCQUAL && this._currentLine.SCQUAL.length > 0 ? parseInt(mySocialCare[0], 10) : null;

    if (mySocialCareIndicator === null) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        warnCode: WorkerCsvValidator.SOCIALCARE_QUAL_WARNING,
        warnType: 'SOCIALCARE_QUAL_WARNING',
        warning: 'SCQUAL is blank',
        source: this._currentLine.SCQUAL,
        column: 'SCQUAL',
      });
    } else if (isNaN(mySocialCareIndicator) || !ALLOWED_SOCIAL_CARE_VALUES.includes(mySocialCareIndicator)) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        errCode: WorkerCsvValidator.SOCIALCARE_QUAL_ERROR,
        errType: 'SOCIALCARE_QUAL_ERROR',
        error: 'The code you have entered for SCQUAL is incorrect',
        source: this._currentLine.SCQUAL,
        column: 'SCQUAL',
      });
    }

    this._socialCareQualification = mySocialCareIndicator;

    if (mySocialCareIndicator === 1) {
      // if the social care indicator is "1" (yes) - then get the next value which must be the level
      const mySocialCareLevel = parseInt(mySocialCare[1], 10);

      if (!mySocialCareLevel && mySocialCareLevel !== 0) {
        this._validationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          errCode: WorkerCsvValidator.SOCIALCARE_QUAL_ERROR,
          errType: 'SOCIALCARE_QUAL_ERROR',
          error: 'You must provide a value for SCQUAL level when SCQUAL is set to 1',
          source: this._currentLine.SCQUAL,
          column: 'SCQUAL',
        });
      }

      // https://trello.com/c/Pae7NyN8 - disabled until a solution can be found - and move this to transform
      // if (ALLOWED_SOCIAL_CARE_VALUES.includes(mySocialCareIndicator)) {
      //   this._qualifications.forEach(q => {
      //     if (q.id > mySocialCareLevel) {
      //       this._validationErrors.push({
      //         worker: this._currentLine.UNIQUEWORKERID,
      //         name: this._currentLine.LOCALESTID,
      //         lineNumber: this._lineNumber,
      //         warnCode: WorkerCsvValidator.SOCIALCARE_QUAL_WARNING,
      //         warnType: 'SOCIALCARE_QUAL_WARNING',
      //         warning: `SCQUAL level does not match the QUALACH${q.column}`,
      //         source: this._currentLine.SCQUAL,
      //       });
      //     }
      //   });
      // }

      if (!mySocialCareLevel && mySocialCareLevel !== 0 && mainJobRoles.includes(this._mainJobRole)) {
        this._validationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          warnCode: WorkerCsvValidator.SOCIALCARE_QUAL_WARNING,
          warnType: 'SOCIALCARE_QUAL_WARNING',
          warning: 'workers MAINJOBROLE is a regulated profession therefore requires a Social Care qualification',
          source: this._currentLine.SCQUAL,
          column: 'SCQUAL',
        });
      }
      this._socialCareQualificationlevel = mySocialCareLevel;
    }

    return true;
  }

  _validateNonSocialCareQualification() {
    const myNonSocialCare = this._currentLine.NONSCQUAL ? this._currentLine.NONSCQUAL.split(';') : null;
    const ALLOWED_SOCIAL_CARE_VALUES = [1, 2, 999];

    const myNonSocialCareIndicator =
      this._currentLine.NONSCQUAL && this._currentLine.NONSCQUAL.length > 0 ? parseInt(myNonSocialCare[0], 10) : null;

    if (this._currentLine.NONSCQUAL && this._currentLine.NONSCQUAL.length > 0) {
      if (isNaN(myNonSocialCareIndicator) || !ALLOWED_SOCIAL_CARE_VALUES.includes(myNonSocialCareIndicator)) {
        this._validationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          errCode: WorkerCsvValidator.NON_SOCIALCARE_QUAL_ERROR,
          errType: 'NON_SOCIALCARE_QUAL_ERROR',
          error: 'The code you have entered for NONSCQUAL is incorrect',
          source: this._currentLine.NONSCQUAL,
          column: 'NONSCQUAL',
        });
      } else if (myNonSocialCareIndicator === 1) {
        this._nonSocialCareQualification = myNonSocialCareIndicator;

        // if the social care indicator is "1" (yes) - then get the next value which must be the level - optional only for non-social care!
        if (myNonSocialCareIndicator === 1) {
          let myNonSocialCareLevel = parseInt(myNonSocialCare[1], 10);
          if (isNaN(myNonSocialCareLevel)) {
            myNonSocialCareLevel = 999; // "Don't know"
          } else if (myNonSocialCareLevel) {
            // https://trello.com/c/Pae7NyN8 - disabled until a solution can be found - and move this to transform
            // this._qualifications.forEach(q => {
            //   if (q.id > myNonSocialCareLevel) {
            //     this._validationErrors.push({
            //       worker: this._currentLine.UNIQUEWORKERID,
            //       name: this._currentLine.LOCALESTID,
            //       lineNumber: this._lineNumber,
            //       warnCode: WorkerCsvValidator.NON_SOCIALCARE_QUAL_WARNING,
            //       warnType: 'NON_SOCIALCARE_QUAL_WARNING',
            //       warning: `NONSCQUAL level does not match the QUALACH${q.column}`,
            //       source: this._currentLine.SCQUAL,
            //     });
            //   }
            // });
          }

          this._nonSocialCareQualificationlevel = myNonSocialCareLevel;
        }

        return false;
      } else {
        this._nonSocialCareQualification = myNonSocialCareIndicator;
        return true;
      }
    }
  }

  __validateQualification(
    qualificationIndex,
    qualificationName,
    qualificationError,
    qualificationErrorName,
    qualification,
    qualificationDescName,
    qualificationDescError,
    qualificationDescErrorName,
    qualificationDesc,
  ) {
    const myQualification = qualification ? qualification.split(';') : null;

    // optional
    if (qualification && qualification.length > 0) {
      const localValidationErrors = [];

      const qualificationId = parseInt(myQualification[0], 10);

      if (isNaN(qualificationId)) {
        localValidationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          errCode: qualificationError,
          errType: qualificationErrorName,
          error: `The code you have entered for (${qualificationName}) is incorrect`,
          source: qualification,
          column: qualificationName,
        });
      }

      // if the social care indicator is "1" (yes) - then get the next value which must be the level
      const qualificationYear = parseInt(myQualification[1], 10);
      const qualificationYearIsValid = myQualification[1]
        ? parseInt(myQualification[1], 10).toString() === myQualification[1]
        : true;

      const MAX_YEAR_AGE = 100;
      const CURRENT_YEAR = new Date().getFullYear();

      if (myQualification[1] === null || myQualification[1] === undefined || myQualification[1].length === 0) {
        localValidationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          warnCode: qualificationError,
          warnType: qualificationErrorName,
          warning: `Year achieved for ${qualificationName} is blank`,
          source: qualification,
          column: qualificationName,
        });
      } else if (myQualification[1] !== null && (isNaN(qualificationYear) || !qualificationYearIsValid)) {
        localValidationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          errCode: qualificationError,
          errType: qualificationErrorName,
          error: `The year in (${qualificationName}) is invalid`,
          source: qualification,
          column: qualificationName,
        });
      } else if (qualificationYear < CURRENT_YEAR - MAX_YEAR_AGE || qualificationYear > CURRENT_YEAR) {
        localValidationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          errCode: qualificationError,
          errType: qualificationErrorName,
          error: `The year in (${qualificationName}) is invalid`,
          source: qualification,
          column: qualificationName,
        });
      }

      let myQualificationDesc = null;
      // qualification description is optional
      if (qualificationDesc && qualificationDesc.length > 0) {
        const MAX_LENGTH = 120;
        if (qualificationDesc.length > MAX_LENGTH) {
          localValidationErrors.push({
            worker: this._currentLine.UNIQUEWORKERID,
            name: this._currentLine.LOCALESTID,
            lineNumber: this._lineNumber,
            warnCode: qualificationDescError,
            warnType: qualificationDescErrorName,
            warning: `The notes you have entered for (${qualificationDescName}) are over 120 characters and will be ignored`,
            source: qualificationDesc,
            column: qualificationDescName,
          });
        } else {
          myQualificationDesc = qualificationDesc;
        }
      }

      if (localValidationErrors.length > 0) {
        localValidationErrors.forEach((thisValidation) => this._validationErrors.push(thisValidation));
      }

      return {
        id: qualificationId,
        year: !isNaN(qualificationYear) ? qualificationYear : null,
        desc: myQualificationDesc,
        column: qualificationIndex,
      };
    } else {
      return null; // not present
    }
  }

  // NOTE - the CSV format expects the user to create additional columns if a worker has more than three qualifications.
  //        This approach (adding columns) differs to the approach of "semi colon" delimited data.
  // https://trello.com/c/ttV4g8mZ.
  _validationQualificationRecords() {
    // Note - ASC WDS does not support qualifications in progress (not yet achieved)

    const NO_QUALIFICATIONS = 99;
    const padNumber = (number) => (number < 10 ? `0${number}` : number);

    // process all attained qualifications, (QUALACH{n}/QUALACH{n}NOTES)
    const myProcessedQualifications = Array(NO_QUALIFICATIONS)
      .fill()
      .map((x, i) => {
        const index = padNumber(i + 1);

        return this.__validateQualification(
          index,
          `QUALACH${index}`,
          WorkerCsvValidator[`QUAL_ACH${index}_ERROR`],
          `QUAL_ACH${index}_ERROR`,
          this._currentLine[`QUALACH${index}`],
          `QUALACH${index}NOTES`,
          WorkerCsvValidator[`QUAL_ACH${index}_NOTES_ERROR`],
          `QUAL_ACH${index}_NOTES_ERROR`,
          this._currentLine[`QUALACH${index}NOTES`],
        );
      });

    // remove from the local set of qualifications any false/null entries
    this._qualifications = myProcessedQualifications.filter(
      (thisQualification) => thisQualification !== null && thisQualification !== false,
    );
  }

  // transform related
  _transformContractType() {
    if (this._contractType) {
      const mappedType = this.BUDI.contractType(this.BUDI.TO_ASC, this._contractType);
      if (mappedType === null) {
        this._validationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          errCode: WorkerCsvValidator.CONTRACT_TYPE_ERROR,
          errType: 'CONTRACT_TYPE_ERROR',
          error: 'The code you have entered for EMPLSTATUS is incorrect',
          source: this._currentLine.EMPLSTATUS,
          column: 'EMPLSTATUS',
        });
      } else {
        this._contractType = mappedType;
      }
    }
  }

  // transform related
  _transformEthnicity() {
    if (this._ethnicity) {
      const myValidatedEthnicity = this.BUDI.ethnicity(this.BUDI.TO_ASC, this._ethnicity);

      if (!myValidatedEthnicity) {
        this._validationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          errCode: WorkerCsvValidator.ETHNICITY_ERROR,
          errType: 'ETHNICITY_ERROR',
          error: 'The code you have entered for ETHNICITY is incorrect',
          source: this._currentLine.ETHNICITY,
          column: 'ETHNICITY',
        });
      } else {
        this._ethnicity = myValidatedEthnicity;
      }
    }
  }

  // transform related
  _transformRecruitment() {
    if (this._recSource || this._recSource === 0) {
      if (this._recSource === 16) {
        this._recSource = 'No';
      } else {
        const myValidatedRecruitment = this.BUDI.recruitment(this.BUDI.TO_ASC, this._recSource);

        if (!myValidatedRecruitment) {
          this._validationErrors.push({
            worker: this._currentLine.UNIQUEWORKERID,
            name: this._currentLine.LOCALESTID,
            lineNumber: this._lineNumber,
            errCode: WorkerCsvValidator.RECSOURCE_ERROR,
            errType: 'RECSOURCE_ERROR',
            error: 'The code you have entered for RECSOURCE is incorrect',
            source: this._currentLine.RECSOURCE,
            column: 'RECSOURCE',
          });
        } else {
          this._recSource = myValidatedRecruitment;
        }
      }
    }
  }

  _transformMainJobRole() {
    // main job is mandatory
    if (this._mainJobRole === null) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        errCode: WorkerCsvValidator.MAIN_JOB_ROLE_ERROR,
        errType: 'MAIN_JOB_ROLE_ERROR',
        error: 'The code you have entered for MAINJOBROLE is incorrect',
        source: this._currentLine.MAINJOBROLE,
        column: 'MAINJOBROLE',
      });
    } else if (this._mainJobRole || this._mainJobRole === 0) {
      const mappedRole = this.BUDI.jobRoles(this.BUDI.TO_ASC, this._mainJobRole);

      if (mappedRole === null) {
        this._validationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          errCode: WorkerCsvValidator.MAIN_JOB_ROLE_ERROR,
          errType: 'MAIN_JOB_ROLE_ERROR',
          error: 'The code you have entered for MAINJOBROLE is incorrect',
          source: this._currentLine.MAINJOBROLE,
          column: 'MAINJOBROLE',
        });
      } else {
        this._mainJobRole = mappedRole;
      }
    }
  }

  // ['Adult Nurse', 'Mental Health Nurse', 'Learning Disabilities Nurse', `Children's Nurse`, 'Enrolled Nurse'
  _transformRegisteredNurse() {
    if (this._registeredNurse || this._registeredNurse === 0) {
      switch (this._registeredNurse) {
        case 1:
          this._registeredNurse = 'Adult Nurse';
          break;
        case 2:
          this._registeredNurse = 'Mental Health Nurse';
          break;
        case 3:
          this._registeredNurse = 'Learning Disabilities Nurse';
          break;
        case 4:
          this._registeredNurse = "Children's Nurse";
          break;
        case 5:
          this._registeredNurse = 'Enrolled Nurse';
          break;
        default:
          this._validationErrors.push({
            worker: this._currentLine.UNIQUEWORKERID,
            name: this._currentLine.LOCALESTID,
            lineNumber: this._lineNumber,
            warnCode: WorkerCsvValidator.NMCREG_WARNING,
            warnType: 'NMCREG_WARNING',
            warning: 'The code you have entered for NMCREG is incorrect and will be ignored',
            source: this._currentLine.NMCREG,
            column: 'NMCREG',
          });
      }
    }
  }

  _transformNursingSpecialist() {
    if (this._nursingSpecialist && Array.isArray(this._nursingSpecialist)) {
      const validatedSpecialisms = [];
      for (let specialism of this._nursingSpecialist) {
        const validatedSpecialism = this.BUDI.nursingSpecialist(this.BUDI.TO_ASC, specialism);
        if (!validatedSpecialism) {
          this._validationErrors.push({
            worker: this._currentLine.UNIQUEWORKERID,
            name: this._currentLine.LOCALESTID,
            lineNumber: this._lineNumber,
            warnCode: WorkerCsvValidator.NURSE_SPEC_WARNING,
            warnType: 'NURSE_SPEC_WARNING',
            warning: `NURSESPEC the code ${specialism} you have entered has not been recognised and will be ignored`,
            source: this._currentLine.NURSESPEC,
            column: 'NURSESPEC',
          });
        } else {
          validatedSpecialisms.push(validatedSpecialism);
        }
      }
      this._nursingSpecialist = validatedSpecialisms;
    }
  }

  _transformNationality() {
    if (this._nationality) {
      // ASC WDS nationality is a split enum/index
      if (this._nationality === 826) {
        this._nationality = 'British';
      } else if (this._nationality === 998) {
        this._nationality = "Don't know";
      } else if (this._nationality === 999) {
        this._nationality = 'Other';
      } else {
        const myValidatedNationality = this.BUDI.nationality(this.BUDI.TO_ASC, this._nationality);

        if (!myValidatedNationality) {
          this._validationErrors.push({
            worker: this._currentLine.UNIQUEWORKERID,
            name: this._currentLine.LOCALESTID,
            lineNumber: this._lineNumber,
            errCode: WorkerCsvValidator.NATIONALITY_ERROR,
            errType: 'NATIONALITY_ERROR',
            error: `Nationality code (${this._nationality}) is not a valid entry`,
            source: this._currentLine.NURSESPEC,
            column: 'NATIONALITY',
          });
        } else {
          this._nationality = myValidatedNationality;
        }
      }
    }
  }

  _transformCountryOfBirth() {
    if (this._countryOfBirth) {
      // ASC WDS country of birth is a split enum/index
      if (this._countryOfBirth === 826) {
        this._countryOfBirth = 'United Kingdom';
      } else if (this._countryOfBirth === 998) {
        this._countryOfBirth = "Don't know";
      } else if (this._countryOfBirth === 999) {
        this._countryOfBirth = 'Other';
      } else {
        const myValidatedCountry = this.BUDI.country(this.BUDI.TO_ASC, this._countryOfBirth);

        if (!myValidatedCountry) {
          this._validationErrors.push({
            worker: this._currentLine.UNIQUEWORKERID,
            name: this._currentLine.LOCALESTID,
            lineNumber: this._lineNumber,
            errCode: WorkerCsvValidator.COUNTRY_OF_BIRTH_ERROR,
            errType: 'COUNTRY_OF_BIRTH_ERROR',
            error: `Country of birth code (${this._countryOfBirth}) is not a valid entry`,
            source: this._currentLine.COUNTRYOFBIRTH,
            column: 'COUNTRYOFBIRTH',
          });
        } else {
          this._countryOfBirth = myValidatedCountry;
        }
      }
    }
  }

  _transformSocialCareQualificationLevel() {
    if (this._socialCareQualificationlevel || this._socialCareQualificationlevel === 0) {
      const myValidatedQualificationLevel = this.BUDI.qualificationLevels(
        this.BUDI.TO_ASC,
        this._socialCareQualificationlevel,
      );

      if (!myValidatedQualificationLevel) {
        this._validationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          warnCode: WorkerCsvValidator.SOCIALCARE_QUAL_ERROR,
          warnType: 'SOCIALCARE_QUAL_ERROR',
          warning: 'The level you have entered for SCQUAL is not valid and will be ignored',
          source: this._currentLine.SCQUAL,
          column: 'SCQUAL',
        });
      } else {
        this._socialCareQualificationlevel = myValidatedQualificationLevel;
      }
    }
  }

  _transformNonSocialCareQualificationLevel() {
    if (this._nonSocialCareQualificationlevel || this._nonSocialCareQualificationlevel === 0) {
      // ASC WDS country of birth is a split enum/index
      const myValidatedQualificationLevel = this.BUDI.qualificationLevels(
        this.BUDI.TO_ASC,
        this._nonSocialCareQualificationlevel,
      );

      if (!myValidatedQualificationLevel) {
        this._validationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          warnCode: WorkerCsvValidator.NON_SOCIALCARE_QUAL_ERROR,
          warnType: 'NON_SOCIALCARE_QUAL_ERROR',
          warning: 'The level you have entered for NONSCQUAL is not valid and will be ignored',
          source: this._currentLine.NONSCQUAL,
          column: 'NONSCQUAL',
        });
      } else {
        this._nonSocialCareQualificationlevel = myValidatedQualificationLevel;
      }
    }
  }

  _transformQualificationRecords() {
    if (this._qualifications && Array.isArray(this._qualifications)) {
      const mappedQualifications = [];

      this._qualifications.forEach((thisQualification) => {
        const myValidatedQualification = this.BUDI.qualifications(this.BUDI.TO_ASC, thisQualification.id);

        if (!myValidatedQualification) {
          this._validationErrors.push({
            worker: this._currentLine.UNIQUEWORKERID,
            name: this._currentLine.LOCALESTID,
            lineNumber: this._lineNumber,
            errCode: WorkerCsvValidator[`QUAL_ACH${thisQualification.column}_ERROR`],
            errType: `QUAL_ACH${thisQualification.column}_ERROR`,
            error: `Qualification (QUALACH${thisQualification.column}): ${thisQualification.id} is unknown`,
            source: `${this._currentLine[`QUALACH${thisQualification.column}`]}`,
            column: `QUALACH${thisQualification.column}`,
          });
        } else {
          const newQual = thisQualification;
          newQual.id = myValidatedQualification;
          mappedQualifications.push(newQual);
        }
      });

      this._qualifications = mappedQualifications;
    }
  }

  // returns true on success, false is any attribute of Worker fails
  validate() {
    let status = true;

    status = !this._validateLocalId() ? false : status;
    status = !this._validateUniqueWorkerId() ? false : status;
    status = !this._validateChangeUniqueWorkerId() ? false : status;
    status = !this._validateDisplayId() ? false : status;
    status = !this._validateStatus() ? false : status;
    status = !this._validateDaysSickChanged() ? false : status;

    // only continue to process validation, if the status is not UNCHECKED, DELETED OR UNCHANGED
    if (!STOP_VALIDATING_ON.includes(this._status)) {
      status = !this._validateContractType() ? false : status;
      status = !this._validateNINumber() ? false : status;
      status = !this._validatePostCode() ? false : status;
      status = !this._validateDOB() ? false : status;
      status = !this._validateGender() ? false : status;
      status = !this._validateEthnicity() ? false : status;
      status = !this._validateNationality() ? false : status;
      status = !this._validateCitizenShip() ? false : status;
      status = !this._validateCountryOfBirth() ? false : status;
      status = !this._validateYearOfEntry() ? false : status;
      status = !this._validateDisabled() ? false : status;
      status = !this._validateCareCert() ? false : status;
      status = !this._validateRecSource() ? false : status;
      status = !this._validateStartDate() ? false : status;
      status = !this._validateStartInsect() ? false : status;
      status = !this._validateApprentice() ? false : status;
      status = !this._validateZeroHourContract() ? false : status;
      status = !this._validateDaysSick() ? false : status;
      status = !this._validateSalaryInt() ? false : status;
      status = !this._validateSalary() ? false : status;
      status = !this._validateHourlyRate() ? false : status;
      status = !this._validateMainJobRole() ? false : status;
      status = !this._validateMainJobDesc() ? false : status;
      status = !this._validateContHours() ? false : status;
      status = !this._validateAvgHours() ? false : status;
      status = !this._validateRegisteredNurse() ? false : status;
      status = !this._validateNursingSpecialist() ? false : status;
      status = !this._validationQualificationRecords() ? false : status;
      status = !this._validateSocialCareQualification() ? false : status;
      status = !this._validateNonSocialCareQualification() ? false : status;
      status = !this._validateAmhp() ? false : status;
    }

    return status;
  }

  // returns true on success, false is any attribute of Worker fails
  transform() {
    // if this Worker is unchecked/deleted, skip all transformations
    if (!STOP_VALIDATING_ON.includes(this._status)) {
      let status = true;

      // status = !this._transformMainService() ? false : status;
      status = !this._transformContractType() ? false : status;
      status = !this._transformEthnicity() ? false : status;
      status = !this._transformRecruitment() ? false : status;
      status = !this._transformMainJobRole() ? false : status;
      status = !this._transformRegisteredNurse() ? false : status;
      status = !this._transformNursingSpecialist() ? false : status;
      status = !this._transformNationality() ? false : status;
      status = !this._transformCountryOfBirth() ? false : status;
      status = !this._transformSocialCareQualificationLevel() ? false : status;
      status = !this._transformNonSocialCareQualificationLevel() ? false : status;
      status = !this._transformQualificationRecords() ? false : status;

      return status;
    } else {
      return true;
    }
  }

  toJSON(isValidation = false) {
    const extraFields = {};
    if (isValidation) {
      extraFields.establishmentKey = this.establishmentKey;
      extraFields.contractTypeId = this.contractTypeId;
      extraFields.mainJobRoleId = this.mainJobRoleId;
      extraFields.lineNumber = this._lineNumber;
      extraFields._currentLine = this._currentLine;
    }

    return {
      localId: this._localId,
      status: this._status,
      uniqueWorkerId: this._uniqueWorkerId,
      changeUniqueWorker: this._changeUniqueWorkerId ? this._changeUniqueWorkerId : undefined,
      displayId: this._displayId,
      niNumber: this._NINumber ? this._NINumber : undefined,
      postcode: this._postCode ? this._postCode : undefined,
      dateOfBirth: this._DOB ? this._DOB.format('DD/MM/YYYY') : undefined,
      gender: this._gender ? this._gender : undefined,
      contractType: this._contractType,
      ethnicity: this._ethnicity ? this._ethnicity : undefined,
      nationality: this._nationality ? this._nationality : undefined,
      britishCitizenship: this._britishNationality ? this._britishNationality : undefined,
      countryofBirth: this._countryOfBirth ? this._countryOfBirth : undefined,
      yearOfEntry: this._yearOfEntry ? this._yearOfEntry : undefined,
      disabled: this._disabled !== null ? this._disabled : undefined,
      careCertificate: this._careCert
        ? {
            value: this._careCert,
          }
        : undefined,
      recruitmentSource: this._recSource ? this._recSource : undefined,
      startDate: this._startDate ? this._startDate.format('DD/MM/YYYY') : undefined,
      startedInSector: this._startInsect ? this._startInsect : undefined,
      apprenticeship: this._apprentice ? this._apprentice : undefined,
      zeroHoursContract: this._zeroHourContract ? this._zeroHourContract : undefined,
      daysSick: this._daysSick ? this._daysSick : undefined,
      salaryInterval: this._salaryInt ? this._salaryInt : undefined,
      salary: this._salary ? this._salary : undefined,
      hourlyRate: this._hourlyRate ? this._hourlyRate : undefined,
      mainJob: {
        role: this.mainJobRole,
        other: this._mainJobDesc ? this._mainJobDesc : undefined,
      },
      hours: {
        contractedHours: this._contHours !== null ? this._contHours : undefined,
        additionalHours: this._avgHours !== null ? this._avgHours : undefined,
      },
      nursing: {
        registered: this._registeredNurse ? this._registeredNurse : undefined,
        specialist: this._nursingSpecialist ? this._nursingSpecialist : undefined,
      },
      highestQualifications: {
        social: this._socialCareQualification
          ? {
              value: this._socialCareQualification,
              level: this._socialCareQualificationlevel ? this._socialCareQualificationlevel : undefined,
            }
          : undefined,
        nonSocial: this._nonSocialCareQualification
          ? {
              value: this._nonSocialCareQualification,
              level: this._nonSocialCareQualificationlevel ? this._nonSocialCareQualificationlevel : undefined,
            }
          : undefined,
      },
      qualifications: this._qualifications
        ? this._qualifications.map((thisQual) => {
            if (!thisQual) return undefined;
            return {
              id: thisQual.id,
              year: thisQual.year ? thisQual.year : undefined,
              notes: thisQual.desc ? thisQual.desc : undefined,
            };
          })
        : undefined,
      approvedMentalHealthWorker: this._amhp ? this._amhp : undefined,
      ...extraFields,
    };
  }

  toAPI() {
    const changeProperties = {
      // the minimum to create a new worker
      localIdentifier: this._uniqueWorkerId,
      status: this._status,
      nameOrId: this._displayId,
      contract: this._contractType,
      mainJob: {
        jobId: this._mainJobRole,
        other: this._mainJobDesc,
      },
      mainJobStartDate: this._startDate ? this._startDate.format('YYYY-MM-DD') : undefined,
      nationalInsuranceNumber: this._NINumber ? this._NINumber : undefined,
      dateOfBirth: this._DOB ? this._DOB.format('YYYY-MM-DD') : undefined,
      postcode: this._postCode ? this._postCode : undefined,
      gender: this._gender ? this._gender : undefined,
      ethnicity: this._ethnicity
        ? {
            ethnicityId: this._ethnicity,
          }
        : undefined,
      britishCitizenship: this._britishNationality ? this._britishNationality : undefined,
      yearArrived: this._yearOfEntry
        ? {
            value: 'Yes',
            year: this._yearOfEntry,
          }
        : undefined,
      disability: this._disabled ? this._disabled : undefined,
      careCertificate: this._careCert ? this._careCert : undefined,
      apprenticeshipTraining: this._apprentice ? this._apprentice : undefined,
      zeroHoursContract: this._zeroHourContract ? this._zeroHourContract : undefined,
      registeredNurse: this._registeredNurse ? this._registeredNurse : undefined,
      nurseSpecialism: this._nursingSpecialist
        ? {
            id: this._nursingSpecialist,
          }
        : undefined,
      approvedMentalHealthWorker: this._amhp ? this._amhp : undefined,
      completed: true, // on bulk upload, every Worker record is naturally completed!
    };

    if (this._nursingSpecialist) {
      changeProperties.nurseSpecialisms = this.BUDI.mapNurseSpecialismsToDb(this._nursingSpecialist);
    }

    if (this._startInsect) {
      if (this._startInsect === 999) {
        changeProperties.socialCareStartDate = {
          value: 'No',
        };
      } else {
        changeProperties.socialCareStartDate = {
          value: 'Yes',
          year: this._startInsect,
        };
      }
    }

    if (this._nationality) {
      if (Number.isInteger(this._nationality)) {
        changeProperties.nationality = {
          value: 'Other',
          other: {
            nationalityId: this._nationality,
          },
        };
      } else {
        changeProperties.nationality = {
          value: this._nationality,
        };
      }
    }

    if (this._countryOfBirth) {
      if (Number.isInteger(this._countryOfBirth)) {
        changeProperties.countryOfBirth = {
          value: 'Other',
          other: {
            countryId: this._countryOfBirth,
          },
        };
      } else {
        changeProperties.countryOfBirth = {
          value: this._countryOfBirth,
        };
      }
    }

    if (this._recSource) {
      if (Number.isInteger(this._recSource)) {
        changeProperties.recruitedFrom = {
          value: 'Yes',
          from: {
            recruitedFromId: this._recSource,
          },
        };
      } else {
        changeProperties.recruitedFrom = {
          value: this._recSource,
        };
      }
    }

    if (this._daysSick !== null) {
      // days sick is decimal
      if (this._daysSick !== 'No') {
        changeProperties.daysSick = {
          value: 'Yes',
          days: this._daysSick,
        };
      } else {
        changeProperties.daysSick = {
          value: 'No',
        };
      }
    }

    if (this._salaryInt) {
      changeProperties.annualHourlyPay = {
        value: this._salaryInt,
      };

      if (this._salaryInt === 'Annually') {
        changeProperties.annualHourlyPay.rate = this._salary ? this._salary : undefined;
      }
      if (this._salaryInt === 'Hourly') {
        changeProperties.annualHourlyPay.rate = this._hourlyRate ? this._hourlyRate : undefined;
      }
    }

    if (this._contHours !== null) {
      if (this._contHours !== 'No') {
        changeProperties.weeklyHoursContracted = {
          value: 'Yes',
          hours: this._contHours,
        };
      } else {
        changeProperties.weeklyHoursContracted = {
          value: 'No',
        };
      }
    }
    if (this._avgHours !== null) {
      if (this._avgHours !== 'No') {
        changeProperties.weeklyHoursAverage = {
          value: 'Yes',
          hours: this._avgHours,
        };
      } else {
        changeProperties.weeklyHoursAverage = {
          value: 'No',
        };
      }
    }

    if (this._socialCareQualification) {
      switch (this._socialCareQualification) {
        case 1:
          changeProperties.qualificationInSocialCare = 'Yes';
          if (this._socialCareQualificationlevel) {
            changeProperties.socialCareQualification = {
              qualificationId: this._socialCareQualificationlevel,
            };
          }
          break;
        case 2:
          changeProperties.qualificationInSocialCare = 'No';
          break;
        case 999:
          changeProperties.qualificationInSocialCare = "Don't know";
          break;
      }
    }

    if (this._nonSocialCareQualification) {
      switch (this._nonSocialCareQualification) {
        case 1:
          changeProperties.otherQualification = 'Yes';
          if (this._nonSocialCareQualificationlevel) {
            changeProperties.highestQualification = {
              qualificationId: this._nonSocialCareQualificationlevel,
            };
          }
          break;
        case 2:
          changeProperties.otherQualification = 'No';
          break;
        case 999:
          changeProperties.otherQualification = "Don't know";
          break;
      }
    }

    if (this._changeUniqueWorkerId) {
      changeProperties.changeLocalIdentifer = this._changeUniqueWorkerId;
    }

    return changeProperties;
  }

  // returns an array of Qualification mapped API entities - can be an array array if no qualifications
  toQualificationAPI() {
    const myMappedQuals = [];

    if (this._qualifications) {
      this._qualifications.forEach((thisQual) => {
        if (!thisQual) {
          return undefined;
        }

        const changeProperties = {
          column: thisQual.column, // this is necessary to map the qualification to the CSV column
          type: undefined, // the qualification type does not come from bulk upload
          qualification: {
            id: thisQual.id,
          },
          year: thisQual.year ? thisQual.year : undefined,
          other: undefined, // "other" qualifier does not come from bulk import
          notes: thisQual.desc ? thisQual.desc : undefined,
        };

        myMappedQuals.push(changeProperties);
      });
    }

    return myMappedQuals;
  }

  get validationErrors() {
    // include the "origin" of validation error
    return this._validationErrors.map((thisValidation) => {
      return {
        origin: 'Workers',
        ...thisValidation,
      };
    });
  }
}

module.exports.WorkerCsvValidator = WorkerCsvValidator;
