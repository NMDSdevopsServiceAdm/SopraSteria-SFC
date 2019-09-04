const BUDI = require('../BUDI').BUDI;
const moment = require('moment');

const STOP_VALIDATING_ON = ['UNCHECKED', 'DELETE', 'NOCHANGE'];

class Worker {
  constructor(currentLine, lineNumber, allCurrentEstablishments) {
    this._currentLine = currentLine;
    this._lineNumber = lineNumber;
    this._allCurrentEstablishments = allCurrentEstablishments;

    this._validationErrors = [];
    this._headers_v1 = ["LOCALESTID","UNIQUEWORKERID","CHGUNIQUEWRKID","STATUS","DISPLAYID","NINUMBER","POSTCODE","DOB","GENDER","ETHNICITY","NATIONALITY","BRITISHCITIZENSHIP","COUNTRYOFBIRTH","YEAROFENTRY","DISABLED","CARECERT","RECSOURCE","STARTDATE","STARTINSECT","APPRENTICE","EMPLSTATUS","ZEROHRCONT","DAYSSICK","SALARYINT","SALARY","HOURLYRATE","MAINJOBROLE","MAINJRDESC","CONTHOURS","AVGHOURS","OTHERJOBROLE","OTHERJRDESC","NMCREG","NURSESPEC","AMHP","SCQUAL","NONSCQUAL","QUALACH01","QUALACH01NOTES","QUALACH02","QUALACH02NOTES","QUALACH03","QUALACH03NOTES"];
    this._headers_v1_without_chgUnique = ["LOCALESTID","UNIQUEWORKERID","STATUS","DISPLAYID","NINUMBER","POSTCODE","DOB","GENDER","ETHNICITY","NATIONALITY","BRITISHCITIZENSHIP","COUNTRYOFBIRTH","YEAROFENTRY","DISABLED","CARECERT","RECSOURCE","STARTDATE","STARTINSECT","APPRENTICE","EMPLSTATUS","ZEROHRCONT","DAYSSICK","SALARYINT","SALARY","HOURLYRATE","MAINJOBROLE","MAINJRDESC","CONTHOURS","AVGHOURS","OTHERJOBROLE","OTHERJRDESC","NMCREG","NURSESPEC","AMHP","SCQUAL","NONSCQUAL","QUALACH01","QUALACH01NOTES","QUALACH02","QUALACH02NOTES","QUALACH03","QUALACH03NOTES"];
    this._contractType= null;

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

    this._contractType = null;

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
    this._mainJobDesc = null;

    this._contHours = null;
    this._avgHours = null;

    this._otherJobs = null;
    this._otherJobsOther = null;

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
  };

  static get UNCHECKED_ESTABLISHMENT_ERROR() { return 997; }
  static get DUPLICATE_ERROR() { return 998; }
  static get HEADERS_ERROR() { return 999; }

  static get LOCAL_ID_ERROR() { return 1010; }
  static get UNIQUE_WORKER_ID_ERROR() { return 1020; }
  static get CHANGE_UNIQUE_WORKER_ID_ERROR() { return 1030; }
  static get STATUS_ERROR() { return 1040; }
  static get STATUS_WARNING() { return 1045; }

  static get DISPLAY_ID_ERROR() { return 1050; }
  static get NINUMBER_ERROR() { return 1060; }
  static get POSTCODE_ERROR() { return 1070; }
  static get DOB_ERROR() { return 1080; }
  static get GENDER_ERROR() { return 1090; }
  static get ETHNICITY_ERROR() { return 1100; }
  static get NATIONALITY_ERROR() { return 1110; }
  static get BRITISH_CITIZENSHIP_ERROR() { return 1120; }
  static get COUNTRY_OF_BIRTH_ERROR() { return 1230; }
  static get YEAR_OF_ENTRY_ERROR() { return 1140; }
  static get DISABLED_ERROR() { return 1150; }
  static get CARE_CERT_ERROR() { return 1160; }
  static get RECSOURCE_ERROR() { return 1180; }
  static get START_DATE_ERROR() { return 1190; }
  static get START_INSECT_ERROR() { return 1200; }
  static get APPRENCTICE_ERROR() { return 1210; }
  static get CONTRACT_TYPE_ERROR() { return 1220; } //EMPL STATUS
  static get ZERO_HRCONT_ERROR() { return 1230; }
  static get DAYSICK_ERROR() { return 1240; }
  static get SALARY_INT_ERROR() { return 1250; }
  static get SALARY_ERROR() { return 1260; }
  static get HOURLY_RATE_ERROR() { return 1270; }
  static get MAIN_JOB_ROLE_ERROR() { return 1280; }
  static get MAIN_JOB_DESC_ERROR() { return 1290; }
  static get CONT_HOURS_ERROR() { return 1300; }
  static get AVG_HOURS_ERROR() { return 1310; }
  static get OTHER_JOB_ROLE_ERROR() { return 1320; }
  static get OTHER_JR_DESC_ERROR() { return 1330; }
  static get NMCREG_ERROR() { return 1340; }
  static get NURSE_SPEC_ERROR() { return 1350; }

  static get SOCIALCARE_QUAL_ERROR() { return 1360; }
  static get NON_SOCIALCARE_QUAL_ERROR() { return 1370; }

  static get YEAROFENTRY_ERROR() { return 1380; }

  static get AMHP_ERROR() { return 1380; }


  static get UNIQUE_WORKER_ID_WARNING() { return 3020; }
  static get DISPLAY_ID_WARNING() { return 3050; }
  static get NINUMBER_WARNING() { return 3060; }
  static get POSTCODE_WARNING() { return 3070; }
  static get DOB_WARNING() { return 3080; }
  static get GENDER_WARNING() { return 3090; }
  static get ETHNICITY_WARNING() { return 3100; }
  static get NATIONALITY_WARNING() { return 3110; }
  static get BRITISH_CITIZENSHIP_WARNING() { return 3120; }
  static get COUNTRY_OF_BIRTH_WARNING() { return 3130; }
  static get YEAR_OF_ENTRY_WARNING() { return 3140; }
  static get DISABLED_WARNING() { return 3150; }
  static get CARE_CERT_WARNING() { return 3160; }
  static get RECSOURCE_WARNING() { return 3180; }
  static get START_DATE_WARNING() { return 3190; }
  static get START_INSECT_WARNING() { return 3200; }
  static get APPRENCTICE_WARNING() { return 3210; }
  static get CONTRACT_TYPE_WARNING() { return 3220; } //EMPL STATUS
  static get ZERO_HRCONT_WARNING() { return 3230; }
  static get DAYSICK_WARNING() { return 3240; }
  static get SALARY_INT_WARNING() { return 3250; }
  static get SALARY_WARNING() { return 3260; }
  static get HOURLY_RATE_WARNING() { return 3270; }
  static get MAIN_JOB_ROLE_WARNING() { return 3280; }
  static get MAIN_JOB_DESC_WARNING() { return 3290; }
  static get CONT_HOURS_WARNING() { return 3300; }
  static get AVG_HOURS_WARNING() { return 3310; }
  static get OTHER_JOB_ROLE_WARNING() { return 3320; }
  static get OTHER_JR_DESC_WARNING() { return 3330; }
  static get NMCREG_WARNING() { return 3340; }
  static get NURSE_SPEC_WARNING() { return 3350; }

  static get SOCIALCARE_QUAL_ERROR() { return 3360; }
  static get NON_SOCIALCARE_QUAL_ERROR() { return 3370; }

  static get AMHP_WARNING() { return 3380; }

  static get SOCIALCARE_QUAL_WARNING() { return 3360; }
  static get NON_SOCIALCARE_QUAL_WARNING() { return 3370; }

  static get YEAROFENTRY_WARNING() { return 3380; }

  static get QUAL_ACH01_ERROR() { return 5010; }
  static get QUAL_ACH01_NOTES_ERROR() { return 5020; }
  static get QUAL_ACH02_ERROR() { return 5030; }
  static get QUAL_ACH02_NOTES_ERROR() { return 5040; }
  static get QUAL_ACH03_ERROR() { return 5050; }
  static get QUAL_ACH03_NOTES_ERROR() { return 5060; }

  static get QUAL_ACH_WARNING() { return 5500; }
  static get QUAL_ACH01_WARNING() { return 5510; }
  static get QUAL_ACH01_NOTES_WARNING() { return 5520; }
  static get QUAL_ACH02_WARNING() { return 5530; }
  static get QUAL_ACH02_NOTES_WARNING() { return 5540; }
  static get QUAL_ACH03_WARNING() { return 5550; }
  static get QUAL_ACH03_NOTES_WARNING() { return 5560; }

  static get NI_WORKER_DUPLICATE_ERROR() { return 5570 }

  get headers() {
    return this._headers_v1_without_chgUnique.join(",");
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
  get contHours() {
    return this._contHours;
  }
  get amhp() {
    return this._amhp;
  }

  _validateContractType() {
    const myContractType = this._currentLine.EMPLSTATUS;

    if (!myContractType) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        errCode: Worker.CONTRACT_TYPE_ERROR,
        errType: 'CONTRACT_TYPE_ERROR',
        error: "EMPLSTATUS has not been supplied",
        source: this._currentLine.EMPLSTATUS,
      });
      return false;
    } else {
      this._contractType = myContractType;
      return true;
    }
  }

  _validateLocalId() {
    const myLocalId = this._currentLine.LOCALESTID;

    // must be present and n more than 50 characters
    const MAX_LENGTH = 50;

    if (!myLocalId || myLocalId.length == 0) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        errCode: Worker.LOCAL_ID_ERROR,
        errType: `LOCAL_ID_ERROR`,
        error: "LOCALESTID has not been supplied",
        source: this._currentLine.LOCALESTID,
      });
      return false;
    } else if (myLocalId.length >= MAX_LENGTH) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        errCode: Worker.LOCAL_ID_ERROR,
        errType: `LOCAL_ID_ERROR`,
        error: `LOCALESTID is longer than ${MAX_LENGTH} characters`,
        source: this._currentLine.LOCALESTID,
      });
      return false;
    } else {
      this._localId = myLocalId;
      this._establishmentKey = myLocalId.replace(/\s/g, "");
      return true;
    }

  }

  _validateUniqueWorkerId() {
    const myUniqueWorkerId = this._currentLine.UNIQUEWORKERID;

    // must be present and n more than 50 characters
    const MAX_LENGTH = 50;

    if (!myUniqueWorkerId || myUniqueWorkerId.length == 0) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        errCode: Worker.UNIQUE_WORKER_ID_ERROR,
        errType: `UNIQUE_WORKER_ID_ERROR`,
        error: "UNIQUEWORKERID has not been supplied",
        source: this._currentLine.UNIQUEWORKERID,
      });
      return false;
    } else if (myUniqueWorkerId.length >= MAX_LENGTH) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        errCode: Worker.UNIQUE_WORKER_ID_ERROR,
        errType: `UNIQUE_WORKER_ID_ERROR`,
        error: `UNIQUEWORKERID is longer than ${MAX_LENGTH} characters`,
        source: this._currentLine.UNIQUEWORKERID,
      });
      return false;
    } else {
      this._uniqueWorkerId = myUniqueWorkerId;
      this._key = myUniqueWorkerId.replace(/\s/g, "");
      return true;
    }
  }

  //Comment: This may not be supported in UI/system so only checked lenght if exists, could be null
  _validateChangeUniqueWorkerId() {
    const myChangeUniqueWorkerId = this._currentLine.CHGUNIQUEWRKID;
    const MAX_LENGTH = 50;

    // CHGUNIQUEWRKID is optional

    if (myChangeUniqueWorkerId && myChangeUniqueWorkerId.length > 0 && myChangeUniqueWorkerId.length >= MAX_LENGTH) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        errCode: Worker.CHANGE_UNIQUE_WORKER_ID_ERROR,
        errType: `CHANGE_UNIQUE_WORKER_ID_ERROR`,
        error: `CHGUNIQUEWORKERID is longer than ${MAX_LENGTH} characters`,
        source: this._currentLine.CHGUNIQUEWRKID,
      });
      return false;
    } else if (myChangeUniqueWorkerId && myChangeUniqueWorkerId.length > 0) {
      this._changeUniqueWorkerId = myChangeUniqueWorkerId;
      return true;
    }
  }

  _validateStatus() {
    const statusValues = ['DELETE', 'UPDATE', 'UNCHECKED', 'NOCHANGE', 'NEW','CHGSUB'];
    const myStatus = this._currentLine.STATUS ? this._currentLine.STATUS.toUpperCase() : this._currentLine.STATUS;

   if (!statusValues.includes(myStatus)) {
      // must be present and must be one of the preset values (case insensitive)
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        errCode: Worker.STATUS_ERROR,
        errType: `STATUS_ERROR`,
        error: `The status you have supplied is incorrect`,
        source: this._currentLine.STATUS,
      });
      return false;
    } else {
      // helper which returns true if the given LOCALESTID
      const thisWorkerExists = (establishmentKey, workerKey) => {
        const foundEstablishment = this._allCurrentEstablishments.find(currentEstablishment => {
          return currentEstablishment.key === establishmentKey;
        });

        // having found the establishment, find the worker within the establishment
        if (foundEstablishment) {
          const foundWorker = foundEstablishment.theWorker(workerKey);
          return foundWorker ? true : false;
        } else {
          return false;
        }
      };

      switch (myStatus) {
        case 'NEW':
          if (thisWorkerExists(this._establishmentKey, this._key)) {
            this._validationErrors.push({
              name: this._currentLine.LOCALESTID,
              worker: this._currentLine.UNIQUEWORKERID,
              lineNumber: this._lineNumber,
              errCode: Worker.STATUS_ERROR,
              errType: `STATUS_ERROR`,
              error: `Staff record has a STATUS of NEW but already exists, please change to one of the other statues available`,
              source: myStatus,
            });
          }
          break;
        case 'DELETE':
          if (!thisWorkerExists(this._establishmentKey, this._key)) {
            this._validationErrors.push({
              name: this._currentLine.LOCALESTID,
              worker: this._currentLine.UNIQUEWORKERID,
              lineNumber: this._lineNumber,
              errCode: Worker.STATUS_ERROR,
              errType: `STATUS_ERROR`,
              error: 'Staff has a status of DELETE but does not exist.',
              source: myStatus,
            });
          }
          break;
        case 'UNCHECKED':
          if (!thisWorkerExists(this._establishmentKey, this._key)) {
            this._validationErrors.push({
              name: this._currentLine.LOCALESTID,
              worker: this._currentLine.UNIQUEWORKERID,
              lineNumber: this._lineNumber,
              errCode: Worker.STATUS_ERROR,
              errType: `STATUS_ERROR`,
              error: `Staff record has a status of UNCHECKED but doens't exist, please change to NEW if you want to add this staff record`,
              source: myStatus,
            });
          }
          break;
        case 'NOCHANGE':
          if (!thisWorkerExists(this._establishmentKey, this._key)) {
            this._validationErrors.push({
              name: this._currentLine.LOCALESTID,
              worker: this._currentLine.UNIQUEWORKERID,
              lineNumber: this._lineNumber,
              errCode: Worker.STATUS_ERROR,
              errType: `STATUS_ERROR`,
              error: `Staff record has a status of NOCHANGE but doens't exist, please change to NEW if you want to add this staff record`,
              source: myStatus,
            });
          }
          break;
        case 'UPDATE':
          if (!thisWorkerExists(this._establishmentKey, this._key)) {
            this._validationErrors.push({
              name: this._currentLine.LOCALESTID,
              worker: this._currentLine.UNIQUEWORKERID,
              lineNumber: this._lineNumber,
              errCode: Worker.STATUS_ERROR,
              errType: `STATUS_ERROR`,
              error: `Staff record has a status of UPDATE but doens't exist, please change to NEW if you want to add this staff record`,
              source: myStatus,
            });
          }
          break;
        case 'CHGSUB':
          // note - the LOCALESTID here is that of the target sub - not the current sub
          if (thisWorkerExists(this._establishmentKey, this._key)) {
            this._validationErrors.push({
              name: this._currentLine.LOCALESTID,
              worker: this._currentLine.UNIQUEWORKERID,
              lineNumber: this._lineNumber,
              errCode: Worker.STATUS_ERROR,
              errType: `STATUS_ERROR`,
              error: `STATUS is CHGSUB but staff already exists in the new workplace`,
              source: myStatus,
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
    const MAX_LENGTH = 50;            // lowering to 50 because this is restricted in ASC WDS

    if (!myDisplayId) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        errCode: Worker.DISPLAY_ID_ERROR,
        errType: `DISPLAY_ID_ERROR`,
        error: `DISPLAYID is blank`,
        erro: this._currentLine.DISPLAYID,
      });
      return false;
    } else if (myDisplayId.length >= MAX_LENGTH) {
        this._validationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          errCode: Worker.DISPLAY_ID_ERROR,
          errType: `WORKER_DISPLAY_ID_ERROR`,
          error: `DISPLAYID is longer than ${MAX_LENGTH} characters`,
          source: this._currentLine.DISPLAYID,
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

    if (myNINumber.length > 0) {
      if (myNINumber.length > 0 && !niRegex.test(myNINumber)) {
        this._validationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          errCode: Worker.NINUMBER_ERROR,
          errType: `WORKER_NINUMBER_ERROR`,
          error: `NINUMBER is incorrectly formatted`,
          source: this._currentLine.NINUMBER,
        });
        return false;
      }
      else {
        this._NINumber = myNINumber;
        return true;
      }
    }
  }

  _validatePostCode() {
    const myPostcode = this._currentLine.POSTCODE;
    const postcodeRegex = /^[A-Za-z]{1,2}[0-9]{1,2}[A-Za-z]?\s{1}[0-9][A-Za-z]{2}$/;

    if (!myPostcode) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        warnCode: Worker.POSTCODE_WARNING,
        warnType: `POSTCODE_WARNING`,
        warning: `POSTCODE is missing`,
        source: myPostcode,
      });
      return false;
    } else if (!postcodeRegex.test(myPostcode)) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        errCode: Worker.POSTCODE_ERROR,
        errType: `POSTCODE ERROR`,
        error: `POSTCODE is incorrectly formatted`,
        source: myPostcode,
      });
      return false;
    } else {
      this._postCode = myPostcode;
      return true;
    }
  }

  _validateDOB() {
    const MINIMUM_AGE=14;
    const MAXIMUM_AGE=100;
    const maxDate = moment().subtract(MINIMUM_AGE, 'y');
    const minDate = moment().subtract(MAXIMUM_AGE, 'y');
    const dobRegex = /^([0-2][0-9]|(3)[0-1])(\/)(((0)[0-9])|((1)[0-2]))(\/)\d{4}$/;
    const myDOB = this._currentLine.DOB;
    const myDobRealDate = moment.utc(myDOB, "DD/MM/YYYY");

    if (!this._currentLine.DOB) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        warnCode: Worker.DOB_WARNING,
        warnType: `DOB_WARNING`,
        warning: `DOB is missing`,
        source: this._currentLine.DOB,
      });
      return false;
    }
    else if (!myDobRealDate.isValid()) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        warnCode: Worker.DOB_WARNING,
        warnType: `DOB_WARNING`,
        warning: `The date of birth you have entered is incorrectly formatted and will be ignored`,
        source: this._currentLine.DOB,
      });
      return false;
    }
    else if (myDobRealDate.isBefore(minDate) || myDobRealDate.isAfter(maxDate)) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        warnCode: Worker.DOB_WARNING,
        warnType: `DOB_WARNING`,
        warning: `The date of birth you have entered is not between a valid range of 14 – 100 years old`,
        source: this._currentLine.DOB,
      });
      return false;
    } else {
      this._DOB = myDobRealDate;
      return true;
    }
  }

  _validateGender() {
    const genderValues = [1,2,3,4]; //[MALE=1, FEMALE=2, UNKNOWN=3, OTHER=4];
    const myGender = parseInt(this._currentLine.GENDER);

    if (this._currentLine.GENDER.length > 0) {
      if (isNaN(myGender) || !genderValues.includes(parseInt(myGender))) {
        this._validationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          errCode: Worker.GENDER_ERROR,
          errType: 'GENDER_ERROR',
          error: "The code you have entered for GENDER is incorrect",
          source: this._currentLine.GENDER,
        });
        return false;
      }
      else {
        switch (myGender) {
          case 1:
            this._gender = 'Male';
            break;
          case 2:
            this._gender = 'Female';
              break;
          case 3:
            this._gender = 'Don\'t know';
            break;
          case 4:
            this._gender = 'Other';
            break;
        }
        return true;
      }
    }
  }

  //Mandatory for local Authority - need to check this conditional check
  _validateEthnicity() {
    const myEthnicity = parseInt(this._currentLine.ETHNICITY);

    // optional
    if (this._currentLine.ETHNICITY && this._currentLine.ETHNICITY.length > 0) {
      if (isNaN(myEthnicity)) {
        this._validationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          errCode: Worker.ETHNICITY_ERROR,
          errType: 'ETHNICITY_ERROR',
          error: "The code you have entered for ETHNICITY is incorrect",
          source: this._currentLine.ETHNICITY,
        });
        return false;
      }
      else {
        this._ethnicity = myEthnicity;
        return true;
      }
    } else {
      return true;
    }
  }

  _validateCitizenShip() {
    const BritishCitizenshipValues = [1,2,999];
    const myBritishCitizenship = parseInt(this._currentLine.BRITISHCITIZENSHIP);
    const myNationality = parseInt(this._currentLine.NATIONALITY, 10);

    if (this._currentLine.BRITISHCITIZENSHIP && this._currentLine.BRITISHCITIZENSHIP.length > 0) {
      if (myNationality === 826) {
        this._validationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          warnCode: Worker.BRITISH_CITIZENSHIP_WARNING,
          warnType: 'BRITISH_CITIZENSHIP_WARNING',
          warning: `BRITISHCITIZENSHIP has been ignored as workers nationality is British`,
          source: this._currentLine.BRITISHCITIZENSHIP,
        });
        return false;
      } else if (isNaN(myBritishCitizenship) || !BritishCitizenshipValues.includes(parseInt(myBritishCitizenship))) {
        this._validationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          errCode: Worker.BRITISH_CITIZENSHIP_ERROR,
          errType: 'BRITISH_CITIZENSHIP_ERROR',
          error: `BRITISHCITIZENSHIP code is not a valid entry`,
          source: this._currentLine.BRITISHCITIZENSHIP,
        });
        return false;
      }
      else {
        switch (myBritishCitizenship) {
          case 1:
            this._britishNationality = 'Yes';
            break;
          case 2:
            this._britishNationality = 'No';
            break;
          case 999:
            this._britishNationality = 'Don\'t know';
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
    const myRealDOBDate = moment.utc(this._currentLine.DOB, "DD/MM/YYYY");
    const myCountry = this._currentLine.COUNTRYOFBIRTH;

    if (this._currentLine.YEAROFENTRY && this._currentLine.YEAROFENTRY.length > 0) {
      if (myYearOfEntry && !yearRegex.test(myYearOfEntry)) {
        this._validationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          errCode: Worker.YEAROFENTRY_ERROR,
          errType: 'YEAROFENTRY_ERROR',
          error: "YEAROFENTRY is incorrectly formatted",
          source: this._currentLine.YEAROFENTRY,
        });
        return false;
      } else if (thisYear < myYearOfEntry) {
        this._validationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          errCode: Worker.YEAROFENTRY_ERROR,
          errType: 'YEAROFENTRY_ERROR',
          error: "YEAROFENTRY is in the future",
          source: this._currentLine.YEAROFENTRY,
        });
        return false;
      } else if (myRealDOBDate && myRealDOBDate.year() > myYearOfEntry) {
        this._validationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          errCode: Worker.YEAROFENTRY_ERROR,
          errType: 'YEAROFENTRY_ERROR',
          error: "YEAROFENTRY must be greater or equal to DOB",
          source: this._currentLine.YEAROFENTRY,
        });
        return false;
      } else if (!myCountry) {
        this._validationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          warnCode: Worker.YEAROFENTRY_WARNING,
          warnType: 'YEAROFENTRY_WARNING',
          warning: "Year of entry has been ignored as Country of Birth is missing",
          source: this._currentLine.YEAROFENTRY,
        });
        return false;
      } else if (myCountry && parseInt(myCountry) === 826) {
        this._validationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          warnCode: Worker.YEAROFENTRY_WARNING,
          warnType: 'YEAROFENTRY_WARNING',
          warning: "Year of entry has been ignored as Country of Birth is British",
          source: this._currentLine.YEAROFENTRY,
        });
        return false;
      } else {
        this._yearOfEntry = parseInt(myYearOfEntry, 10);
        return true;
      }
    }

  }

  _validateDisabled() {
    const disabledValues = [0,1,2,3];
    const myDisabled = parseInt(this._currentLine.DISABLED, 10);

    // optional
    if (this._currentLine.DISABLED && this._currentLine.DISABLED.length > 0) {
      if (isNaN(myDisabled) || !disabledValues.includes(parseInt(myDisabled))) {
        this._validationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          errCode: Worker.DISABLED_ERROR,
          errType: 'DISABLED_ERROR',
          error: "The code you have entered for DISABLED is incorrect",
          source: this._currentLine.DISABLED,
        });
        return false;
      }
      else {
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
            this._disabled = 'Don\'t know';
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
    const myCareCert = parseInt(this._currentLine.CARECERT);

    if (this._currentLine.CARECERT && this._currentLine.CARECERT.length > 0) {
      if (isNaN(myCareCert) || !careCertValues.includes(parseInt(myCareCert))) {
        this._validationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          errCode: Worker.CARE_CERT_ERROR,
          errType: 'CARECERT_ERROR',
          error: "The code you have entered for CARECERT is incorrect",
          source: this._currentLine.CARECERT,
        });
        return false;
      }
      else {
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
    const myRecSource = parseInt(this._currentLine.RECSOURCE);

    // optional
    if (this._currentLine.RECSOURCE && (isNaN(myRecSource))) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        errCode: Worker.RESOURCE_ERROR,
        errType: 'RECSOURCE_ERROR',
        error: "The code you have entered for RECSOURCE is incorrect",
        source: this._currentLine.RECSOURCE,
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
    const myRealStartDate = moment.utc(myStartDate, "DD/MM/YYYY");
    const myRealDOBDate = this._currentLine.DOB && this._currentLine.DOB.length > 1 ? moment.utc(this._currentLine.DOB, "DD/MM/YYYY") : null;
    const myYearOfEntry = this._currentLine.YEAROFENTRY;
    const myRealYearOfEntry = myYearOfEntry ? `${myYearOfEntry}-01-01`: null;   // if year of entry is given, then format it to a proper year that can be used by moment

    if (!myStartDate) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        warnCode: Worker.START_DATE_WARNING,
        warnType: 'START_DATE_WARNING',
        warning: "STARTDATE is missing",
        source: this._currentLine.STARTDATE,
      });
      return false;
    } else if (!dateRegex.test(myStartDate)) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        warnCode: Worker.START_DATE_WARNING,
        warnType: 'START_DATE_WARNING',
        warning: "STARTDATE is incorrectly formatted and will be ignored",
        source: this._currentLine.STARTDATE,
      });
      return false;
    } else if (myRealStartDate.isAfter(today)) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        warnCode: Worker.START_DATE_WARNING,
        warnType: 'START_DATE_WARNING',
        warning: "STARTDATE is in the future and will be ignored",
        source: this._currentLine.STARTDATE,
      });
      return false;
    } else if (myRealDOBDate && myRealStartDate.diff(myRealDOBDate, 'years', false) < AGE) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        warnCode: Worker.START_DATE_WARNING,
        warnType: 'START_DATE_WARNING',
        warning: "STARTDATE is before workers 14th birthday and will be ignored",
        source: this._currentLine.STARTINSECT,
      });
      return false;
    } else if (myYearOfEntry && myRealStartDate.isBefore(myRealYearOfEntry)) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        warnCode: Worker.START_DATE_WARNING,
        warnType: 'START_DATE_WARNING',
        warning: "STARTDATE is before year of entry and will be ignored",
        source: this._currentLine.STARTINSECT,
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
    const yearRegex = /^\d{4}|999$/;
    const myRealDOBDate = moment.utc(this._currentLine.DOB, "DD/MM/YYYY");

    if (!myStartInsect) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        warnCode: Worker.START_INSECT_WARNING,
        warnType: 'START_INSECT_WARNING',
        warning: "STARTINSECT is missing",
        source: this._currentLine.STARTINSECT,
      });
      return false;
    } else if (!yearRegex.test(myStartInsect)) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        warnCode: Worker.START_INSECT_WARNING,
        warnType: 'START_INSECT_WARNING',
        warning: "STARTINSECT is incorrectly formatted and will be ignored",
        source: this._currentLine.STARTINSECT,
      });
      return false;
    } else if (this._startDate && parseInt(myStartInsect) > this._startDate.year()) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        warnCode: Worker.START_INSECT_WARNING,
        warnType: 'START_INSECT_WARNING',
        warning: "STARTINSECT is after STARTDATE and will be ignored",
        source: this._currentLine.STARTINSECT,
      });
      return false;
    }
    else if (myRealDOBDate &&  myRealDOBDate.year() + AGE > parseInt(myStartInsect)) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        warnCode: Worker.START_INSECT_WARNING,
        warnType: 'START_INSECT_WARNING',
        warning: "STARTINSECT is before workers 14th birthday and will be ignored",
        source: this._currentLine.STARTINSECT,
      });
      return false;
    }
    else {
      this._startInsect = parseInt(myStartInsect, 10);
      return true;
    }
  }

  _validateApprentice() {
    const apprenticeValues = [1,2,999];
    const myApprentice = parseInt(this._currentLine.APPRENTICE, 10);

    // optional
    if (this._currentLine.APPRENTICE && this._currentLine.APPRENTICE.length) {
      if (isNaN(myApprentice) || !apprenticeValues.includes(myApprentice)) {
        this._validationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          warnCode: Worker.APPRENCTICE_WARNING,
          warnType: 'APPRENTICE_WARNING',
          warning: "The code for APPRENTICE is incorrect and will be ignored",
          source: this._currentLine.APPRENTICE,
        });
        return false;
      }
      else {
        switch (myApprentice) {
          case 1:
            this._apprentice = 'Yes';
            break;
          case 2:
            this._apprentice = 'No';
            break;
          case 999:
            this._apprentice = 'Don\'t know';
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
    const zeroHoursEmpty = this._currentLine.ZEROHRCONT && this._currentLine.ZEROHRCONT.length > 0 ? false : true;

    if (myContHours > 0 && !this._currentLine.ZEROHRCONT) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        warnCode: Worker.ZERO_HRCONT_WARNING,
        warnType: 'ZERO_HRCONT_WARNING',
        warning: "You have entered contracted hours but have not said this worker is not on a zero hours contract",
        source: this._currentLine.ZEROHRCONT,
      });
      return false;
    }
    else if (!zeroHoursEmpty && (isNaN(myZeroHourContract) || !zeroHourContractValues.includes(myZeroHourContract))) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        errCode: Worker.ZERO_HRCONT_ERROR,
        errType: 'ZEROHRCONT_ERROR',
        error: "The code you have entered for ZEROHRCONT is incorrect",
        source: this._currentLine.ZEROHRCONT,
      });
      return false;
    } else if (myContHours > 0 && (myZeroHourContract === 999 || myZeroHourContract === 1)) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        errCode: Worker.ZERO_HRCONT_ERROR,
        errType: 'ZEROHRCONT_ERROR',
        error: "The value entered for CONTHOURS in conjunction with the value for ZEROHRCONT fails our validation checks",
        source: this._currentLine.ZEROHRCONT,
      });
      return false;
    } else if (myContHours === 0 &&  myZeroHourContract === 2) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        warnCode: Worker.ZERO_HRCONT_WARNING,
        warnType: 'ZERO_HRCONT_WARNING',
        warning: "You have entered “0” in CONTHOURS but not entered “Yes” to the ZEROHRCONT question",
        source: this._currentLine.ZEROHRCONT,
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
          this._zeroHourContract = 'Don\'t know';
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

      const containsHalfDay = this._currentLine.DAYSSICK.indexOf('.') > 0 ? parseInt(this._currentLine.DAYSSICK.split(".")[1], 10) : 5;

      if (myDaysSick != DONT_KNOW_VALUE && (isNaN(myDaysSick) || containsHalfDay !== 5 || myDaysSick < 0 || myDaysSick > MAX_VALUE)) {

        this._validationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          warnCode: Worker.DAYSICK_ERROR,
          warnType: 'DAYSSICK_ERROR',
          warning: "DAYSSICK is out of validation range and will be ignored",
          source: this._currentLine.DAYSSICK,
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
          errCode: Worker.SALARY_ERROR,
          errType: 'SALARYINT_ERROR',
          error: "Salary Int (SALARYINT) must be an integer",
          source: this._currentLine.SALARYINT,
        });
        return false;
      } else if (!salaryIntValues.includes(parseInt(mySalaryInt))) {
        this._validationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          errCode: Worker.SALARY_ERROR,
          errType: 'SALARYINT_ERROR',
          error: "Salary int (SALARYINT) value must 1(Annual Salary) or 3(Hourly Rate)",
          source: this._currentLine.SALARYINT,
        });
        return false;
      }
      else {
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
    const mySalary = parseInt(this._currentLine.SALARY);
    const digitRegex = /^[0-9]{1,9}$/;

    // optional
    if (this._currentLine.SALARY.length > 0) {
      // can only give (annual) salary if salary interval (SALARYINT) is annual
      if (this._salaryInt === null || this._salaryInt !== 'Annually') {
        this._validationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          errCode: Worker.SALARY_ERROR,
          errType: 'SALARY_ERROR',
          error: "Salary (SALARY) only relevant if salary intervakl (SALARYINT) is Annual (1)",
          source: `SALARYINT (${this._currentLine.SALARYINT}) - SALARY (${this._currentLine.SALARY})`,
        });
        return false;
      } else if (isNaN(mySalary) || !digitRegex.test(this._currentLine.SALARY)) {
        this._validationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          errCode: Worker.SALARY_ERROR,
          errType: 'SALARY_ERROR',
          error: "Salary (SALARY) must be an integer an upto 9 digits",
          source: this._currentLine.SALARY,
        });
        return false;
      }
      else {
        this._salary = mySalary;
        return true;
      }
    } else {
      return true;
    }
  }

  _validateHourlyRate() {
    const myHourlyRate = parseFloat(this._currentLine.HOURLYRATE);
    const digitRegex = /^\d+(\.\d{1,2})?$/;  // e.g. 15.53 or 0.53 or 1.53 or 100.53

    // optional
    if (this._currentLine.HOURLYRATE && this._currentLine.HOURLYRATE.length > 0) {
      // can only give (annual) salary if salary interval (SALARYINT) is hourly
      if (this._salaryInt === null || this._salaryInt !== 'Hourly') {
        this._validationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          errCode: Worker.HOURLY_RATE_ERROR,
          errType: 'HOURLY_RATE_ERROR',
          error: "Salary (HOURLYRATE) only relevant if salary intervakl (SALARYINT) is Hourly (3)",
          source: `SALARYINT(${this._currentLine.SALARYINT}) - HOURLYRATE (${this._currentLine.HOURLYRATE})`,
        });
        return false;
      } else if (isNaN(myHourlyRate) || !digitRegex.test(this._currentLine.HOURLYRATE)) {
        this._validationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          errCode: Worker.HOURLY_RATE_ERROR,
          errType: 'HOURLY_RATE_ERROR',
          error: "Hourly Rate (HOURLYRATE) must be decimal with upto two decimal points e.g. 12.0 or 5.31",
          source: this._currentLine.HOURLYRATE,
        });
        return false;
      }
      else {
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
    if (!this._currentLine.MAINJOBROLE || this._currentLine.MAINJOBROLE.length == 0 || isNaN(myMainJobRole)) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        errCode: Worker.MAIN_JOB_ROLE_ERROR,
        errType: 'MAIN_JOB_ROLE_ERROR',
        error: "MAINJOBROLE has not been supplied",
        source: this._currentLine.MAINJOBROLE,
      });
      return false;
    }
    else {
      this._mainJobRole = myMainJobRole;
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
        errCode: Worker.MAIN_JOB_DESC_ERROR,
        errType: 'MAIN_JOB_DESC_ERROR',
        error: `MAINJRDESC has not been supplied`,
        source: this._currentLine.MAINJRDESC,
      });
      return false;
    } else if (myMainJobDesc.length >= MAX_LENGTH) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        errCode: Worker.MAIN_JOB_DESC_ERROR,
        errType: 'MAIN_JOB_DESC_ERROR',
        error: `MAINJRDESC is longer than 120 characters`,
        source: this._currentLine.MAINJRDESC,
      });
      return false;
    }
    else if (!ALLOWED_JOBS.includes(this._mainJobRole) && this._currentLine.MAINJRDESC && this._currentLine.MAINJRDESC.length > 0) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        warnCode: Worker.MAIN_JOB_DESC_WARNING,
        warnType: 'MAIN_JOB_DESC_WARNING',
        warning: `MAINJRDESC will be ignored as not required for MAINJOBROLE`,
        source: this._currentLine.MAINJRDESC,
      });
      return false;
    } else {
      this._mainJobDesc = myMainJobDesc;
      return true;
    }
  }

  _validateContHours() {
    const myContHours = parseFloat(this._currentLine.CONTHOURS);
    const digitRegex = /^\d+(\.[0,5]{1})?$/;  // e.g. 15 or 0.5 or 1.0 or 100.5
    const MAX_VALUE = 75;
    const EMPL_STATUSES = [3,4,7];
    const myEmplStatus = this._currentLine.EMPLSTATUS;

    // optional
    if (this._currentLine.CONTHOURS && this._currentLine.CONTHOURS.length > 0) {
      if (isNaN(myContHours) || !digitRegex.test(this._currentLine.CONTHOURS) && Math.floor(myContHours) !== 999) {
        this._validationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          warnCode: Worker.CONT_HOURS_WARNING,
          warnType: 'CONT_HOURS_WARNING',
          warning: `The code you have entered for CONTHOURS is incorrect and will be ignored`,
          source: this._currentLine.CONTHOURS,
        });
        return false;
      }
      else if (myContHours > MAX_VALUE) {
        this._validationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          warnCode: Worker.CONT_HOURS_WARNING,
          warnType: 'CONT_HOURS_WARNING',
          warning: `CONTHOURS is greater than 75 and will be ignored`,
          source: this._currentLine.CONTHOURS,
        });
        return false;
      }
      else if (myEmplStatus && EMPL_STATUSES.includes(parseFloat(myEmplStatus)) ) {
        let contractType = '';
        switch (myEmplStatus) {
          case '3':
            contractType = 'Pool/Bank'
            break;
          case '4':
            contractType = 'Agency';
            break;
          case '7':
            contractType = 'Other';
            break;
        }
        this._validationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,

          warnCode: Worker.CONT_HOURS_WARNING,
          warnType: 'CONT_HOURS_WARNING',
          warning: `CONTHOURS will be ignored as EMPLSTATUS is ${contractType}`,
          source: this._currentLine.CONTHOURS,
        });
        return false;
      }
      else {
        if (Math.floor(myContHours) === 999) {
          this._contHours = 'No';
        } else {
          this._contHours = myContHours;
        }
        return true;
      }
    } else {
      return true;
    }
  }

  _validateAvgHours() {
    const myAvgHours = parseFloat(this._currentLine.AVGHOURS);
    const digitRegex = /^\d+(\.[0,5]{1})?$/;  // e.g. 15 or 0.5 or 1.0 or 100.5
    const MAX_VALUE = 75;
    const EMPL_STATUSES = [1,2];
    const myEmplStatus = this._currentLine.EMPLSTATUS;

    // optional
    if (this._currentLine.AVGHOURS && this._currentLine.AVGHOURS.length > 0) {
      if (isNaN(myAvgHours) || !digitRegex.test(this._currentLine.AVGHOURS) && (Math.floor(myAvgHours) !== 999)) {
        this._validationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          warnCode: Worker.AVG_HOURS_WARNING,
          warnType: 'AVG_HOURS_ERROR',
          warning: `The code you have entered for AVGHOURS is incorrect and will be ignored`,
          source: this._currentLine.AVGHOURS,
        });
        return false;
      }
      else if (myAvgHours > MAX_VALUE) {
        this._validationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          warnCode: Worker.AVG_HOURS_WARNING,
          warnType: 'AVG_HOURS_ERROR',
          warning: `AVGHOURS is greater than 75 and will be ignored`,
          source: this._currentLine.AVGHOURS,
        });
        return false;
      }
      else if (myEmplStatus && EMPL_STATUSES.includes(parseFloat(myEmplStatus)) ) {
        let contractType = '';
        switch (myEmplStatus) {
          case '1':
            contractType = 'Permanent'
            break;
          case '2':
            contractType = 'Temporary';
            break;
        }

        this._validationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          warnCode: Worker.AVG_HOURS_WARNING,
          warnType: 'AVG_HOURS_ERROR',
          warning: `AVGHOURS will be ignored as staff record is ${contractType}`,
          source: this._currentLine.AVGHOURS,
        });
        return false;
      }
      else {
        if (Math.floor(myAvgHours) === 999) {
          this._avgHours = 'No';
        } else {
          this._avgHours = myAvgHours;
        }
        return true;
      }
    } else {
      return true;
    }
  }

  _validateOtherJobs() {
    const listOfotherJobs = this._currentLine.OTHERJOBROLE.split(';');
    const listOfotherJobsDescriptions = this._currentLine.OTHERJRDESC.split(';');
    const localValidationErrors = [];
    const isValid = listOfotherJobs.every(job => !Number.isNaN(parseInt(job)));

    if (this._currentLine.OTHERJOBROLE && this._currentLine.OTHERJOBROLE.length > 0) {
      if (!isValid) {
        localValidationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          errCode: Worker.OTHER_JOB_ROLE_ERROR,
          errType: `OTHER_JOB_ROLE_ERROR`,
          error: "The code you have entered for OTHERJOBROLE is incorrect",
          source: this._currentLine.OTHERJOBROLE,
        });
      } else if (listOfotherJobs.length !== listOfotherJobsDescriptions.length) {
        localValidationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          errCode: Worker.OTHER_JOB_ROLE_ERROR,
          errType: `OTHER_JOB_ROLE_ERROR`,
          error: "OTHERJOBROLE/OTHERJRDESC, do not have the same number of items (i.e. numbers and/or semi colons)",
          source: `${this._currentLine.OTHERJOBROLE} - ${this._currentLine.OTHERJRDESC}`,
        });
      } else {
        const myJobDescriptions = [];
        this._otherJobs = listOfotherJobs.map((thisJob, index)   => {
          const thisJobIndex = parseInt(thisJob, 10);

          // if the job is one of the many "other" job roles, then need to validate the "other description"
          const otherJobs = [23, 27];   // these are the original budi codes
          if (otherJobs.includes(thisJobIndex)) {
            const myJobOther = listOfotherJobsDescriptions[index];
            const MAX_LENGTH = 120;
            if (!myJobOther || myJobOther.length == 0) {
              localValidationErrors.push({
                worker: this._currentLine.UNIQUEWORKERID,
                name: this._currentLine.LOCALESTID,
                lineNumber: this._lineNumber,
                errCode: Worker.OTHER_JR_DESC_ERROR,
                errType: `OTHER_JR_DESC_ERROR`,
                error: `OTHERJRDESC (${index+1}) has not been supplied`,
                source: `${this._currentLine.OTHERJOBROLE} - ${listOfotherJobsDescriptions[index]}`,
              });
              myJobDescriptions.push(null);
            } else if (myJobOther.length > MAX_LENGTH) {
              localValidationErrors.push({
                worker: this._currentLine.UNIQUEWORKERID,
                name: this._currentLine.LOCALESTID,
                lineNumber: this._lineNumber,
                errCode: Worker.OTHER_JR_DESC_ERROR,
                errType: `OTHER_JR_DESC_ERROR`,
                error: `OTHERJRDESC is longer than 120 characters`,
                source: `${this._currentLine.OTHERJOBROLE} - ${listOfotherJobsDescriptions[index]}`,
              });
            } else {
              myJobDescriptions.push(listOfotherJobsDescriptions[index]);
            }
          } else if(listOfotherJobsDescriptions[index] && listOfotherJobsDescriptions[index].length > 0) {
            localValidationErrors.push({
              worker: this._currentLine.UNIQUEWORKERID,
              name: this._currentLine.LOCALESTID,
              lineNumber: this._lineNumber,
              warnCode: Worker.OTHER_JR_DESC_WARNING,
              warnType: `OTHER_JR_DESC_WARNING`,
              warning: `OTHERJRDESC will be ignored as not required for OTHERJOBROLE`,
              source: `${this._currentLine.OTHERJOBROLE} - ${listOfotherJobsDescriptions[index]}`,
          })
          } else {
            myJobDescriptions.push(null);
          }

          return thisJobIndex;
        });

        this._otherJobsOther = myJobDescriptions;
      }


      if (localValidationErrors.length > 0) {
        localValidationErrors.forEach(thisValidation => this._validationErrors.push(thisValidation));;
        return false;
      }
    }

    return true;
  }

  _validateRegisteredNurse() {
    const myRegisteredNurse = parseInt(this._currentLine.NMCREG, 10);
    const NURSING_ROLE = 16;
    const otherJobRoleIsNurse = this._otherJobs && this._otherJobs.includes(NURSING_ROLE) ? true : false;
    const mainJobRoleIsNurse = this._mainJobRole && this._mainJobRole === NURSING_ROLE ? true : false;
    const notNurseRole = !(otherJobRoleIsNurse || mainJobRoleIsNurse);

    if (((this._mainJobRole && this._mainJobRole === NURSING_ROLE) ||
        (this._otherJobs && this._otherJobs.includes(NURSING_ROLE))) &&
        (myRegisteredNurse !== 0 && isNaN(myRegisteredNurse) )) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        warnCode: Worker.NMCREG_WARNING,
        warnType: 'NMCREG_WARNING',
        warning: "NMCREG has not been supplied",
        source: this._currentLine.NMCREG,
      });
      return false;
    } else if (this._currentLine.NMCREG && this._currentLine.NMCREG.length !== 0 && notNurseRole) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        warnCode: Worker.NMCREG_WARNING,
        warnType: 'NMCREG_WARNING',
        warning: "NMCREG will be ignored as this is not required for the MAINJOBROLE/OTHERJOBROLE",
        source: this._currentLine.NMCREG,
      });
      return false;
    } else {
      this._registeredNurse = myRegisteredNurse;
      return true;
    }
  }

  _validateNursingSpecialist() {
    const myNursingSpecialist = parseFloat(this._currentLine.NURSESPEC);
    const NURSING_ROLE = 16;
    const otherJobRoleIsNurse = this._otherJobs && this._otherJobs.includes(NURSING_ROLE) ? true : false;
    const mainJobRoleIsNurse = this._mainJobRole && this._mainJobRole === NURSING_ROLE ? true : false;
    const notNurseRole = !(otherJobRoleIsNurse || mainJobRoleIsNurse);

    if (((this._mainJobRole && this._mainJobRole === NURSING_ROLE) ||
    (this._otherJobs && this._otherJobs.includes(NURSING_ROLE))) &&
    (myNursingSpecialist !== 0  && isNaN(myNursingSpecialist) )) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        warnCode: Worker.NURSE_SPEC_WARNING,
        warnType: 'NURSE_SPEC_WARNING',
        warning: "NURSESPEC has not been supplied",
        source: this._currentLine.NURSESPEC,
      });
      return false;
    } else if (this._currentLine.NMCREG && this._currentLine.NMCREG.length !== 0 && notNurseRole) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        warnCode: Worker.NURSE_SPEC_WARNING,
        warnType: 'NURSE_SPEC_WARNING',
        warning: "NURSESPEC will be ignored as this is not required for the MAINJOBROLE/OTHERJOBROLE",
        source: this._currentLine.NURSESPEC,
      });
      return false;
    }
    else {
      this._nursingSpecialist = myNursingSpecialist;
      return true;
    }
  }

  _validateAmhp() {
    const amhpValues = [1,2,999];
    const myAmhp = parseInt(this._currentLine.AMHP);
    const SOCIAL_WORKER_ROLE = 6;

    const otherJobRoleIsSocialWorker = this._otherJobs && this._otherJobs.includes(SOCIAL_WORKER_ROLE) ? true : false;
    const mainJobRoleIsSocialWorker = this._mainJobRole && this._mainJobRole === SOCIAL_WORKER_ROLE ? true : false;
    const notSocialWorkerRole = !(otherJobRoleIsSocialWorker || mainJobRoleIsSocialWorker);

    if (((this._mainJobRole && this._mainJobRole === SOCIAL_WORKER_ROLE) ||
      (this._otherJobs && this._otherJobs.includes(SOCIAL_WORKER_ROLE))) &&
      ( isNaN(myAmhp) )) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        warnCode: Worker.AMHP_WARNING,
        warnType: 'AMHP_WARNING',
        warning: "AMHP has not been supplied",
        source: this._currentLine.AMHP,
      });
      return false;
    }
    else if (this._currentLine.AMHP && this._currentLine.AMHP.length > 0 && notSocialWorkerRole) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        warnCode: Worker.AMHP_WARNING,
        warnType: 'AMHP_WARNING',
        warning: "The code you have entered for AMHP will be ignored as not required for this MAINJOBROLE/OTHERJOBROLE",
        source: this._currentLine.AMHP,
      });
      return false;
    }
    else if (!isNaN(myAmhp) && (myAmhp === 0 || !amhpValues.includes(myAmhp))) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        warnCode: Worker.AMHP_WARNING,
        warnType: 'AMHP_WARNING',
        warning: "The code you have entered for AMHP is incorrect and will be ignored",
        source: this._currentLine.AMHP,
      });
      return false;
    }
    else {
      this._amhp = myAmhp;
      switch (myAmhp) {
        case 1:
          this._amhp = 'Yes';
          break;
        case 2:
          this._amhp = 'No';
          break;
        case 999:
          this._amhp = 'Don\'t know';
          break;
      }
      return true;
    }
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
          errCode: Worker.NATIONALITY_ERROR,
          errType: 'NATIONALITY_ERROR',
          error: "Nationality (NATIONALITY) must be an integer",
          source: this._currentLine.NATIONALITY,
        });
        return false;
      }
      else {
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
      if (myCountry === 826) {
        this._validationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          warnCode: Worker.COUNTRY_OF_BIRTH_WARNING,
          warnType: 'COUNTRY_OF_BIRTH_WARNING',
          warning: "Country of birth has been ignored as worker was born in UK",
          source: this._currentLine.COUNTRYOFBIRTH,
        });
        return false;
      }
      else if (isNaN(myCountry)) {
        this._validationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          errCode: Worker.COUNTRY_OF_BIRTH_ERROR,
          errType: 'COUNTRY_OF_BIRTH_ERROR',
          error: "Country of Birth (COUNTRYOFBIRTH) must be an integer",
          source: this._currentLine.COUNTRYOFBIRTH,
        });
        return false;
      }
      else {
        this._countryOfBirth = myCountry;
        return true;
      }
    }
  }

  _validateSocialCareQualification() {
    const mySocialCare = this._currentLine.SCQUAL ? this._currentLine.SCQUAL.split(';') : null;
    const mainJobRoles = [6,16,15];
    const ALLOWED_SOCIAL_CARE_VALUES = [1, 2, 999];
    const mySocialCareIndicator = (this._currentLine.SCQUAL && this._currentLine.SCQUAL.length > 0) ? parseInt(mySocialCare[0]) : null;

    if (mySocialCareIndicator === null) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        warnCode: Worker.SOCIALCARE_QUAL_WARNING,
        warnType: 'SOCIALCARE_QUAL_WARNING',
        warning: "SCQUAL is blank",
        source: this._currentLine.SCQUAL,
      });
    } else if (isNaN(mySocialCareIndicator) || !ALLOWED_SOCIAL_CARE_VALUES.includes(mySocialCareIndicator)) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        errCode: Worker.SOCIALCARE_QUAL_ERROR,
        errType: 'SOCIALCARE_QUAL_ERROR',
        error: "The code you have entered for SCQUAL is incorrect",
        source: this._currentLine.SCQUAL,
      });
    }

    this._socialCareQualification = mySocialCareIndicator;

    if (mySocialCareIndicator === 1) {
      // if the social care indicator is "1" (yes) - then get the next value which must be the level
      const mySocialCareLevel = parseInt(mySocialCare[1]);

      if (!mySocialCareLevel && mySocialCareLevel !== 0) {
        this._validationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          errCode: Worker.SOCIALCARE_QUAL_ERROR,
          errType: 'SOCIALCARE_QUAL_ERROR',
          error: "You must provide a value for SCQUAL level when SCQUAL is set to 1",
          source: this._currentLine.SCQUAL,
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
      //         warnCode: Worker.SOCIALCARE_QUAL_WARNING,
      //         warnType: 'SOCIALCARE_QUAL_WARNING',
      //         warning: `SCQUAL level does not match the QUALACH${q.column}`,
      //         source: this._currentLine.SCQUAL,
      //       });
      //     }
      //   });
      // }

      if ((!mySocialCareLevel && mySocialCareLevel !== 0) && mainJobRoles.includes(this._mainJobRole)) {
        this._validationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          warnCode: Worker.SOCIALCARE_QUAL_WARNING,
          warnType: 'SOCIALCARE_QUAL_WARNING',
          warning: "workers MAINJOBROLE is a regulated profession therefore requires a Social Care qualification",
          source: this._currentLine.SCQUAL,
        });
      }
      this._socialCareQualificationlevel = mySocialCareLevel;
    }


    return true;
  }

  _validateNonSocialCareQualification() {
    const myNonSocialCare = this._currentLine.NONSCQUAL ? this._currentLine.NONSCQUAL.split(';') : null;
    const ALLOWED_SOCIAL_CARE_VALUES = [1, 2, 999];

    const myNonSocialCareIndicator = (this._currentLine.NONSCQUAL && this._currentLine.NONSCQUAL.length > 0) ? parseInt(myNonSocialCare[0]) : null;


    if (this._currentLine.NONSCQUAL && this._currentLine.NONSCQUAL.length > 0) {
      if (isNaN(myNonSocialCareIndicator) || !ALLOWED_SOCIAL_CARE_VALUES.includes(myNonSocialCareIndicator)) {
        this._validationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          errCode: Worker.NON_SOCIALCARE_QUAL_ERROR,
          errType: 'NON_SOCIALCARE_QUAL_ERROR',
          error: "The code you have entered for NONSCQUAL is incorrect",
          source: this._currentLine.NONSCQUAL,
        });
      } else if(myNonSocialCareIndicator == 1) {
        this._nonSocialCareQualification = myNonSocialCareIndicator;

        // if the social care indicator is "1" (yes) - then get the next value which must be the level - optional only for non-social care!
        if (myNonSocialCareIndicator == 1) {
          let myNonSocialCareLevel = parseInt(myNonSocialCare[1]);
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
            //       warnCode: Worker.NON_SOCIALCARE_QUAL_WARNING,
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

  __validateQualification(qualificationIndex, qualificationName, qualificationError, qualificationErrorName, qualification,
                          qualificationDescName, qualificationDescError, qualificationDescErrorName, qualificationDesc) {
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
        });
      }

      // if the social care indicator is "1" (yes) - then get the next value which must be the level
      const qualificationYear = parseInt(myQualification[1], 10);
      const qualificationYearIsValid = myQualification[1] ? parseInt(myQualification[1], 10).toString() === myQualification[1] : true;

      if (myQualification[1] === null || myQualification[1] === undefined || myQualification[1].length === 0) {
        localValidationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          warnCode: qualificationError,
          warnType: qualificationErrorName,
          warning: `Year achieved for ${qualificationName} is blank`,
          source: qualification,
        });
      } else if (myQualification[1] === null) {
        localValidationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          warnCode: qualificationError,
          warnType: qualificationErrorName,
          warning: `Year achieved for(${qualificationName}) is blank`,
          source: qualification,
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
        });
      }

      let myQualificationDesc = null;
      // qualification description is optional
      if (qualificationDesc && qualificationDesc.length > 0) {
        const MAX_LENGTH=120;
        if (qualificationDesc.length > MAX_LENGTH) {
          localValidationErrors.push({
            worker: this._currentLine.UNIQUEWORKERID,
            name: this._currentLine.LOCALESTID,
            lineNumber: this._lineNumber,
            warnCode: qualificationDescError,
            warnType: qualificationDescErrorName,
            warning: `The notes you hqve entered for (${qualificationDescName}) are over 120 characters and will be ignored`,
            source: qualificationDesc,
          });
        } else {
          myQualificationDesc = qualificationDesc;
        }
      }

      if (localValidationErrors.length > 0) {
        localValidationErrors.forEach(thisValidation => this._validationErrors.push(thisValidation));;
        return false;
      }

      return {
        id: qualificationId,
        year: !isNaN(qualificationYear) ? qualificationYear : null,
        desc: myQualificationDesc,
        column: qualificationIndex,
      };

    } else {
      return null;  // not present
    }
  }

  // NOTE - the CSV format expects the user to create additional columns if a worker has more than three qualifications.
  //        This approach (adding columns) differs to the approach of "semi colon" delimited data.
  // https://trello.com/c/ttV4g8mZ.
  _validationQualificationRecords() {
    // Note - ASC WDS does not support qualifications in progress (not yet achieved)

    const NO_QUALIFICATIONS = 20;
    const padNumber = (number) => (number < 10) ? `0${number}` : number;

    // process all attained qualifications, (QUALACH{n}/QUALACH{n}NOTES)
    const myProcessedQualifications = Array(NO_QUALIFICATIONS).fill().map((x, i) => {
      const index = padNumber(i+1);

      return this.__validateQualification(
        index,
        `QUALACH${index}`,
        Worker[`QUAL_ACH${index}_ERROR`],
        `QUAL_ACH${index}_ERROR`,
        this._currentLine[`QUALACH${index}`],
        `QUALACH${index}NOTES`,
        Worker[`QUAL_ACH${index}_NOTES_ERROR`],
        `QUAL_ACH${index}_NOTES_ERROR`,
        this._currentLine[`QUALACH${index}NOTES`]
      );
    });

    // remove from the local set of qualifications any false/null entries
    this._qualifications = myProcessedQualifications.filter(thisQualification => thisQualification !== null && thisQualification !== false);
  }

  //transform related
  _transformContractType() {
    if (this._contractType) {
      const myValidatedContractType = BUDI.contractType(BUDI.TO_ASC, this._contractType);

      if (!myValidatedContractType) {
        this._validationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          errCode: Worker.CONTRACT_TYPE_ERROR,
          errType: `CONTRACT_TYPE_ERROR`,
          error: `The code you have entered for EMPLSTATUS is incorrect`,
          source: this._currentLine.EMPLSTATUS,
        });
      } else {
        this._contractType = myValidatedContractType;
      }
    }
  };

  //transform related
  _transformEthnicity() {
    if (this._ethnicity) {
      const myValidatedEthnicity = BUDI.ethnicity(BUDI.TO_ASC, this._ethnicity);

      if (!myValidatedEthnicity) {
        this._validationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          errCode: Worker.ETHNICITY_ERROR,
          errType: 'ETHNICITY_ERROR',
          error: "The code you have entered for ETHNICITY is incorrect",
          source: this._currentLine.ETHNICITY,
        });
      } else {
        this._ethnicity = myValidatedEthnicity;
      }
    }
  };

  //transform related
  _transformRecruitment() {
    if (this._recSource || this._recSource === 0) {
      if (this._recSource === 16) {
        this._recSource = 'No';
      } else {
        const myValidatedRecruitment = BUDI.recruitment(BUDI.TO_ASC, this._recSource);

        if (!myValidatedRecruitment) {
          this._validationErrors.push({
            worker: this._currentLine.UNIQUEWORKERID,
            name: this._currentLine.LOCALESTID,
            lineNumber: this._lineNumber,
            errCode: Worker.RECSOURCE_ERROR,
            errType: `RECSOURCE_ERROR`,
            error: `The code you have entered for RECSOURCE is incorrect`,
            source: this._currentLine.RECSOURCE,
          });
        } else {
          this._recSource = myValidatedRecruitment;
        }
      }
    }
  };

  _transformMainJobRole() {
    // main job is mandatory
    if (this._mainJobRole === null) {
      this._validationErrors.push({
        worker: this._currentLine.UNIQUEWORKERID,
        name: this._currentLine.LOCALESTID,
        lineNumber: this._lineNumber,
        errCode: Worker.MAIN_JOB_ROLE_ERROR,
        errType: `MAIN_JOB_ROLE_ERROR`,
        error: `The code you have entered for MAINJOBROLE is incorrect`,
        source: this._currentLine.MAINJOBROLE,
      });
    } else if (this._mainJobRole || this._mainJobRole === 0) {
      const myValidatedJobRole = BUDI.jobRoles(BUDI.TO_ASC, this._mainJobRole);

      if (!myValidatedJobRole) {
        this._validationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          errCode: Worker.MAIN_JOB_ROLE_ERROR,
          errType: `MAIN_JOB_ROLE_ERROR`,
          error: `The code you have entered for MAINJOBROLE is incorrect`,
          source: this._currentLine.MAINJOBROLE,
        });
      } else {
        this._mainJobRole = myValidatedJobRole;
      }
    }
  };

  _transformOtherJobRoles() {
    if (this._otherJobs) {
      const mappedJobs = [];

      this._otherJobs.forEach(thisJob => {
        const myValidatedJobRole = BUDI.jobRoles(BUDI.TO_ASC, thisJob);

        if (!myValidatedJobRole) {
          this._validationErrors.push({
            worker: this._currentLine.UNIQUEWORKERID,
            name: this._currentLine.LOCALESTID,
            lineNumber: this._lineNumber,
            errCode: Worker.OTHER_JOB_ROLE_ERROR,
            errType: `OTHER_JOB_ROLE_ERROR`,
            error: `The code you have entered for OTHERJOBROLE is incorrect`,
            source: this._currentLine.OTHERJOBROLE,
          });
        } else {
          mappedJobs.push(myValidatedJobRole);
        }
      });

      this._otherJobs = mappedJobs;
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
          this._registeredNurse = 'Children\'s Nurse';
          break;
        case 5:
          this._registeredNurse = 'Enrolled Nurse';
          break;
        default:
          this._validationErrors.push({
            worker: this._currentLine.UNIQUEWORKERID,
            name: this._currentLine.LOCALESTID,
            lineNumber: this._lineNumber,
            warnCode: Worker.NMCREG_WARNING,
            warnType: `NMCREG_WARNING`,
            warning: `The code you have entered for NMCREG is incorrect and will be ignored`,
            source: this._currentLine.NMCREG,
          });
      }
    }
  }

  _transformNursingSpecialist() {
    if (this._nursingSpecialist || this._nursingSpecialist === 0) {
      const myValidatedSpecialist = BUDI.nursingSpecialist(BUDI.TO_ASC, this._nursingSpecialist);

      if (!myValidatedSpecialist) {
        this._validationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          warnCode: Worker.NURSE_SPEC_WARNING,
          warnType: `NURSE_SPEC_WARNING`,
          warning: `The code you have entered for NURSESPEC is incorrect and will be ignored`,
          source: this._currentLine.NURSESPEC,
        });
      } else {
        this._nursingSpecialist = myValidatedSpecialist;
      }
    }
  };

  _transformNationality() {
    if (this._nationality) {
      // ASC WDS nationality is a split enum/index
      if (this._nationality == 826) {
        this._nationality = 'British';
      } else if (this._nationality == 998) {
        this._nationality = 'Don\'t know';
      } else if (this._nationality == 999) {
        this._nationality = 'Other';
      } else {
        const myValidatedNationality = BUDI.nationality(BUDI.TO_ASC, this._nationality);

        if (!myValidatedNationality) {
          this._validationErrors.push({
            worker: this._currentLine.UNIQUEWORKERID,
            name: this._currentLine.LOCALESTID,
            lineNumber: this._lineNumber,
            errCode: Worker.NATIONALITY_ERROR,
            errType: `NATIONALITY_ERROR`,
            error: `Nationality code (${this._nationality}) is not a valid entry`,
            source: this._currentLine.NURSESPEC,
          });
        } else {
          this._nationality = myValidatedNationality;
        }
      }
    }
  };


  _transformCountryOfBirth() {
    if (this._countryOfBirth) {
      // ASC WDS country of birth is a split enum/index
      if (this._countryOfBirth == 826) {
        this._countryOfBirth = 'United Kingdom';
      } else if (this._countryOfBirth == 998) {
        this._countryOfBirth = 'Don\'t know';
      } else if (this._countryOfBirth == 999) {
        this._countryOfBirth = 'Other';
      } else {
        const myValidatedCountry = BUDI.country(BUDI.TO_ASC, this._countryOfBirth);

        if (!myValidatedCountry) {
          this._validationErrors.push({
            worker: this._currentLine.UNIQUEWORKERID,
            name: this._currentLine.LOCALESTID,
            lineNumber: this._lineNumber,
            errCode: Worker.COUNTRY_OF_BIRTH_ERROR,
            errType: `COUNTRY_OF_BIRTH_ERROR`,
            error: `Country of birth code (${this._countryOfBirth}) is not a valid entry`,
            source: this._currentLine.COUNTRYOFBIRTH,
          });
        } else {
          this._countryOfBirth = myValidatedCountry;
        }
      }
    }
  };


  _transformSocialCareQualificationLevel() {
    if (this._socialCareQualificationlevel || this._socialCareQualificationlevel === 0) {
      const myValidatedQualificationLevel = BUDI.qualificationLevels(BUDI.TO_ASC, this._socialCareQualificationlevel);

      if (!myValidatedQualificationLevel) {
        this._validationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          warnCode: Worker.SOCIALCARE_QUAL_ERROR,
          warnType: `SOCIALCARE_QUAL_ERROR`,
          warning: `The level you have entered for SCQUAL is not valid and will be ignored`,
          source: this._currentLine.SCQUAL,
        });
      } else {
        this._socialCareQualificationlevel = myValidatedQualificationLevel;
      }
    }
  };

  _transformNonSocialCareQualificationLevel() {
      if (this._nonSocialCareQualificationlevel || this._nonSocialCareQualificationlevel === 0) {
      // ASC WDS country of birth is a split enum/index
      const myValidatedQualificationLevel = BUDI.qualificationLevels(BUDI.TO_ASC, this._nonSocialCareQualificationlevel);

      if (!myValidatedQualificationLevel) {
        this._validationErrors.push({
          worker: this._currentLine.UNIQUEWORKERID,
          name: this._currentLine.LOCALESTID,
          lineNumber: this._lineNumber,
          warnCode: Worker.NON_SOCIALCARE_QUAL_ERROR,
          warnType: `NON_SOCIALCARE_QUAL_ERROR`,
          warning: `The level you have entered for NONSCQUAL is not valid and will be ignored`,
          source: this._currentLine.NONSCQUAL,
        })

      } else {
        this._nonSocialCareQualificationlevel = myValidatedQualificationLevel;
      }
    }
  };

  _transformQualificationRecords() {
    if (this._qualifications && Array.isArray(this._qualifications)) {
      const mappedQualifications = [];

      this._qualifications.forEach(thisQualification => {
        const myValidatedQualification = BUDI.qualifications(BUDI.TO_ASC, thisQualification.id);

        if (!myValidatedQualification) {
          this._validationErrors.push({
            worker: this._currentLine.UNIQUEWORKERID,
            name: this._currentLine.LOCALESTID,
            lineNumber: this._lineNumber,
            errCode: Worker[`QUAL_ACH${thisQualification.column}_ERROR`],
            errType: `QUAL_ACH${thisQualification.column}_ERROR`,
            error: `Qualification (QUALACH${thisQualification.column}): ${thisQualification.id} is unknown`,
            source: `${this._currentLine[`QUALACH${thisQualification.column}`]}`,
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

  // add a duplicate validation error to the current set
  addDuplicate(originalLineNumber) {
    return {
      origin: 'Workers',
      lineNumber: this._lineNumber,
      errCode: Worker.DUPLICATE_ERROR,
      errType: `DUPLICATE_ERROR`,
      error: `UNIQUEWORKERID is not unique`,
      source: this._currentLine.UNIQUEWORKERID,
      worker: this._currentLine.UNIQUEWORKERID,
      name: this._currentLine.LOCALESTID,
    };
  }

  // add a duplicate validation error to the current set
  addChgDuplicate(originalLineNumber) {
    return {
      origin: 'Workers',
      lineNumber: this._lineNumber,
      errCode: Worker.DUPLICATE_ERROR,
      errType: `DUPLICATE_ERROR`,
      error: `CHGUNIQUEWORKERID is not unique`,
      source: this._currentLine.UNIQUEWORKERID,
      worker: this._currentLine.UNIQUEWORKERID,
      name: this._currentLine.LOCALESTID,
    };
  }

  // Exceeds national insurance maximum
  exceedsNationalInsuranceMaximum(originalLineNumber) {
    return {
      origin: 'Workers',
      lineNumber: this._lineNumber,
      errCode: Worker.NI_WORKER_DUPLICATE_ERROR,
      errType: `NI_WORKER_DUPLICATE_ERROR`,
      error: `NINUMBER is already associated with another full time worker record`,
      source: this._currentLine.UNIQUEWORKERID,
      worker: this._currentLine.UNIQUEWORKERID,
      name: this._currentLine.NINUMBER,
    };
  }

  // add unchecked establishment reference validation error
  uncheckedEstablishment() {
    return {
      origin: 'Workers',
      lineNumber: this._lineNumber,
      errCode: Worker.UNCHECKED_ESTABLISHMENT_ERROR,
      errType: `UNCHECKED_ESTABLISHMENT_ERROR`,
      error: `LOCALESTID does not exist in Workplace file`,
      source: this._currentLine.LOCALESTID,
      worker: this._currentLine.UNIQUEWORKERID,
      name: this._currentLine.LOCALESTID,
    };
  }

  preValidate(headers) {
    return this._validateHeaders(headers);
  }

  static isContent(data) {
    const contentRegex1 = /LOCALESTID,UNIQUEWORKERID,CHGUNIQUEWRKID,STATUS,DI/;
    const contentRegex2 = /LOCALESTID,UNIQUEWORKERID,STATUS,DISPLAYID,NINUMB/;

    const toReturn = contentRegex1.test(data.substring(0,50)) || contentRegex2.test(data.substring(0,50));
    return contentRegex1.test(data.substring(0,50)) || contentRegex2.test(data.substring(0,50));
  }

  _validateHeaders(headers) {
    // console.log("WA DEBUF - _validateHeaders -  S: ", headers)
    // console.log("WA DEBUF - _validateHeaders - T1: ", this._headers_v1.join(','))
    // console.log("WA DEBUF - _validateHeaders - T2: ", this._headers_v1_without_chgUnique.join(','))

    // only run once for first line, so check _lineNumber
    // Worker can support one of two headers - CHGUNIQUEWRKID column is optional
    if (this._headers_v1.join(',') !== headers &&
        this._headers_v1_without_chgUnique.join(',') !== headers) {
      this._validationErrors.push({
        worker: null,
        name: null,
        lineNumber: 1,
        errCode: Worker.HEADERS_ERROR,
        errType: `HEADERS_ERROR`,
        error: `Worker headers (HEADERS) can contain, ${this._headers_v1}`,
        source: headers
      });
      return false;
    }
    return true;
  }

  // returns true on success, false is any attribute of Worker fails
  validate() {
    let status = true;

    status = !this._validateLocalId() ? false : status;
    status = !this._validateUniqueWorkerId() ? false : status;
    status = !this._validateChangeUniqueWorkerId() ? false : status;
    status = !this._validateDisplayId() ? false : status;
    status = !this._validateStatus() ? false : status;

    // only continue to process validation, if the status is not UNCHECKED or DELETED
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
      status = !this._validateOtherJobs() ? false : status;
      status = !this._validateRegisteredNurse() ? false : status;
      status = !this._validateNursingSpecialist() ? false : status;
      status = !this._validationQualificationRecords() ? false : status;
      status = !this._validateSocialCareQualification() ? false : status;
      status = !this._validateNonSocialCareQualification() ? false : status;
      status = !this._validateAmhp() ? false : status;
    }

    return status;
  };

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
      status = !this._transformOtherJobRoles() ? false : status;
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
  };

  toJSON() {
    // force to undefined if not set, because 'undefined' when JSON stingified is not rendered
    return {
      localId: this._localId,
      status: this._status,
      uniqueWorkerId: this._uniqueWorkerId,
      changeUniqueWorker: this._changeUniqueWorkerId ? this._changeUniqueWorkerId : undefined,
      status: this._status,
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
      careCertificate: this._careCert ? {
        value: this._careCert
      } : undefined,
      recruitmentSource : this._recSource ? this._recSource : undefined,
      startDate: this._startDate ? this._startDate.format('DD/MM/YYYY') : undefined,
      startedInSector : this._startInsect ? this._startInsect : undefined,
      apprenticeship: this._apprentice ? this._apprentice : undefined,
      zeroHoursContract: this._zeroHourContract ? this._zeroHourContract : undefined,
      daysSick: this._daysSick ? this._daysSick : undefined,
      salaryInterval: this._salaryInt ? this._salaryInt : undefined,
      salary: this._salary ? this._salary : undefined,
      hourlyRate: this._hourlyRate ? this._hourlyRate : undefined,
      mainJob: {
        role: this._mainJobRole,
        other: this._mainJobDesc ? this._mainJobDesc : undefined
      },
      hours: {
        contractedHours : this._contHours !== null ? this._contHours : undefined,
        additionalHours : this._avgHours !== null ? this._avgHours : undefined,
      },
      otherJobs: this._otherJobs ? this._otherJobs.map((thisJob, index) => {
        return {
          job: thisJob,
          other: this._otherJobsOther && this._otherJobsOther[index] ? this._otherJobsOther[index] : undefined
        };
      }) : undefined,
      nursing: {
        registered: this._registeredNurse ? this._registeredNurse : undefined,
        specialist: this._nursingSpecialist ? this._nursingSpecialist : undefined
      },
      highestQualifications: {
        social: this._socialCareQualification ? {
          value: this._socialCareQualification,
          level: this._socialCareQualificationlevel ? this._socialCareQualificationlevel : undefined,
        } : undefined,
        nonSocial: this._nonSocialCareQualification ? {
          value: this._nonSocialCareQualification,
          level: this._nonSocialCareQualificationlevel ? this._nonSocialCareQualificationlevel : undefined,
        } : undefined
      },
      qualifications: this._qualifications ? this._qualifications.map(thisQual => {
        if (!thisQual) return undefined;
        return {
          id: thisQual.id,
          year: thisQual.year ? thisQual.year : undefined,
          notes: thisQual.desc ? thisQual.desc : undefined,
        };
      }) : undefined,
      approvedMentalHealthWorker: this._amhp ? this._amhp : undefined,
    };
  };

  toAPI() {
    const changeProperties = {
    // the minimum to create a new worker
      localIdentifier: this._uniqueWorkerId,
      status: this._status,
      nameOrId : this._displayId,
      contract : this._contractType,
      mainJob : {
        jobId: this._mainJobRole,
        other: this._mainJobDesc,
      },
      otherJobs: this._otherJobs ? this._otherJobs.map((thisJob, index) => {
          return {
            jobId: thisJob,
            other: this._otherJobsOther && this._otherJobsOther[index] ? this._otherJobsOther[index] : undefined,
          };
        }) : undefined,
      mainJobStartDate: this._startDate ? this._startDate.format('YYYY-MM-DD') : undefined,
      nationalInsuranceNumber: this._NINumber ? this._NINumber : undefined,
      dateOfBirth: this._DOB ? this._DOB.format('YYYY-MM-DD') : undefined,
      postcode: this._postCode ? this._postCode : undefined,
      gender: this._gender ? this._gender : undefined,
      ethnicity: this._ethnicity ? {
          ethnicityId: this._ethnicity
        } : undefined,
      britishCitizenship : this._britishNationality ? this._britishNationality : undefined,
      yearArrived: this._yearOfEntry ? 	{
          "value" : 'Yes',
          "year" : this._yearOfEntry
        } : undefined,
      disability: this._disabled ? this._disabled : undefined,
      careCertificate: this._careCert ? this._careCert : undefined,
      apprenticeshipTraining: this._apprentice ? this._apprentice : undefined,
      zeroHoursContract: this._zeroHourContract ? this._zeroHourContract : undefined,
      registeredNurse: this._registeredNurse ? this._registeredNurse : undefined,
      nurseSpecialism: this._nursingSpecialist ? {
          id: this._nursingSpecialist
        } : undefined,
      amhp: this._amhp ? this._amhp : undefined,
      completed: true,                                    // on bulk upload, every Worker record is naturally completed!
    };

    if (this._startInsect) {
      if (this._startInsect === 999) {
        changeProperties.socialCareStartDate = {
          value : 'No'
        }
      } else {
        changeProperties.socialCareStartDate = {
          value : 'Yes',
          year : this._startInsect
        }
      }
    }

    if (this._nationality) {
      if (Number.isInteger(this._nationality)) {
        changeProperties.nationality = {
          value: 'Other',
          other: {
            nationalityId: this._nationality
          }
        };
      } else {
        changeProperties.nationality = {
          value: this._nationality
        };
      }
    }

    if (this._countryOfBirth) {
      if (Number.isInteger(this._countryOfBirth)) {
        changeProperties.countryOfBirth = {
          value: 'Other',
          other: {
            countryId: this._countryOfBirth
          }
        };
      } else {
        changeProperties.countryOfBirth = {
          value: this._countryOfBirth
        };
      }
    }

    if (this._recSource) {
      if (Number.isInteger(this._recSource)) {
        changeProperties.recruitedFrom = {
          value: 'Yes',
          from: {
            recruitedFromId: this._recSource
          }
        };
      } else {
        changeProperties.recruitedFrom = {
          value: this._recSource
        };
      }
    }

    if (this._daysSick !== null) {
      // days sick is decimal
      if (this._daysSick !== 'No') {
        changeProperties.daysSick = {
          value : 'Yes',
          days: this._daysSick,
        };
      } else {
        changeProperties.daysSick = {
          value : 'No',
        };
      }
    }

    if (this._salaryInt) {
      changeProperties.annualHourlyPay = {
        value: this._salaryInt
      };

      if (this._salaryInt === 'Annually') {
        changeProperties.annualHourlyPay.rate = this._salary ? this._salary : undefined;
      }
      if (this._salaryInt === 'Hourly') {
        changeProperties.annualHourlyPay.rate = this._hourlyRate ? this._hourlyRate : undefined;
      }
    }

    if (this._contHours) {
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
    if (this._avgHours) {
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
          changeProperties.qualificationInSocialCare = 'Don\'t know';
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
          changeProperties.otherQualification = 'Don\'t know';
          break;
      }
    }

    if(this._changeUniqueWorkerId) {
      changeProperties.changeLocalIdentifer = this._changeUniqueWorkerId;
    }

    return changeProperties;
  };

  // returns an array of Qualification mapped API entities - can be an array array if no qualifications
  toQualificationAPI() {
    const myMappedQuals = [];

    this._qualifications ? this._qualifications.forEach(thisQual => {
      if (!thisQual) return undefined;

      const changeProperties = {
        column: thisQual.column,    // this is necessary to map the qualification to the CSV column
        type: undefined,            // the qualification type does not come from bulk upload
        qualification : {
          id: thisQual.id,
        },
        year: thisQual.year ? thisQual.year : undefined,
        other: undefined,     // "other" qualifier does not come from bulk import
        notes: thisQual.desc ? thisQual.desc : undefined,
      };

      myMappedQuals.push(changeProperties);
    }) : true;

    return myMappedQuals;
  }

  get validationErrors() {
    // include the "origin" of validation error
    return this._validationErrors.map(thisValidation => {
      return {
        origin: 'Workers',
        ...thisValidation,
      };
    });
  };

  // maps Entity (API) validation messages to bulk upload specific messages (using Entity property name)
  addAPIValidations(errors, warnings) {
/*     errors.forEach(thisError => {
      thisError.properties ? thisError.properties.forEach(thisProp => {
        const validationError = {
          lineNumber: this._lineNumber,
          error: thisError.message,
          name: this._currentLine.LOCALESTID,
          worker: this._currentLine.UNIQUEWORKERID,
        };

        switch (thisProp) {
          case 'WorkerNameOrId':
            // validationError.errCode = Worker.UNIQUE_WORKER_ID_ERROR;
            // validationError.errType = 'UNIQUE_WORKER_ID_ERROR';
            // validationError.source  = `${this._currentLine.UNIQUEWORKERID}`;
            break;
          case 'WorkerMainJob':
            // validationError.errCode = Worker.MAIN_JOB_ROLE_ERROR;
            // validationError.errType = 'MAIN_JOB_ROLE_ERROR';
            // validationError.source  = `${this._currentLine.MAINJOBROLE} - ${this._currentLine.MAINJRDESC}`;
            break;
          case 'WorkerContract':
            // validationError.errCode = Worker.CONTRACT_TYPE_ERROR;
            // validationError.errType = 'CONTRACT_TYPE_ERROR';
            // validationError.source  = `${this._currentLine.EMPLSTATUS}`;
            break;
          case 'WorkerAnnualHourlyPay':
            // note - the Worker entity wraps the pay type (interval) and rate, with a single rate for hourly and annually
            validationError.errCode = Worker.SALARY_INT_ERROR;
            validationError.errType = 'SALARY_INT_ERROR';
            validationError.source  = `${this._currentLine.SALARYINT} - ${this._currentLine.SALARY} - ${this._currentLine.HOURLYRATE}`;
            break;
          case 'WorkerApprenticeshipTraining':
            validationError.errCode = Worker.APPRENCTICE_ERROR;
            validationError.errType = 'APPRENCTICE_ERROR';
            validationError.source  = `${this._currentLine.APPRENTICE}`;
            break;
          case 'WorkerApprovedMentalHealthWorker':
            // validationError.errCode = Worker.AMHP_ERROR;
            // validationError.errType = 'AMHP_ERROR';
            // validationError.source  = `${this._currentLine.AMHP}`;
            break;
          case 'WorkerBritishCitizenship':
            validationError.errCode = Worker.BRITISH_CITIZENSHIP_ERROR;
            validationError.errType = 'BRITISH_CITIZENSHIP_ERROR';
            validationError.source  = `${this._currentLine.BRITISHCITIZENSHIP}`;
            break;
          case 'WorkerCareCertificate':
            validationError.errCode = Worker.CARE_CERT_ERROR;
            validationError.errType = 'CARE_CERT_ERROR';
            validationError.source  = `${this._currentLine.CARECERT}`;
            break;
          case 'WorkerCountry':
            // validationError.errCode = Worker.COUNTRY_OF_BIRTH_ERROR;
            // validationError.errType = 'COUNTRY_OF_BIRTH_ERROR';
            // validationError.source  = `${this._currentLine.COUNTRYOFBIRTH}`;
            break;
          case 'WorkerDateOfBirth':
            validationError.errCode = Worker.DOB_ERROR;
            validationError.errType = 'DOB_ERROR';
            validationError.source  = `${this._currentLine.DOB}`;
            break;
          case 'WorkerDaysSick':
            validationError.errCode = Worker.DAYSICK_ERROR;
            validationError.errType = 'DAYSICK_ERROR';
            validationError.source  = `${this._currentLine.DAYSSICK}`;
            break;
          case 'WorkerDisability':
            validationError.errCode = Worker.DISABLED_ERROR;
            validationError.errType = 'DISABLED_ERROR';
            validationError.source  = `${this._currentLine.DISABLED}`;
            break;
          case 'WorkerEthnicity':
            validationError.errCode = Worker.ETHNICITY_ERROR;
            validationError.errType = 'ETHNICITY_ERROR';
            validationError.source  = `${this._currentLine.ETHNICITY}`;
            break;
          case 'WorkerGender':
            validationError.errCode = Worker.GENDER_ERROR;
            validationError.errType = 'GENDER_ERROR';
            validationError.source  = `${this._currentLine.GENDER}`;
            break;
          // in Worker entity, we have separated the non-social care qualification type and level into separate properties
          case 'WorkerOtherQualification':
          case 'WorkerHighestQualification':
            validationError.errCode = Worker.NON_SOCIALCARE_QUAL_ERROR;
            validationError.errType = 'NON_SOCIALCARE_QUAL_ERROR';
            validationError.source  = `${this._currentLine.NONSCQUAL}`;
            break;
          case 'WorkerMainJobStartDate':
            validationError.errCode = Worker.START_DATE_ERROR;
            validationError.errType = 'START_DATE_ERROR';
            validationError.source  = `${this._currentLine.STARTDATE}`;
            break;
          case 'WorkerNationalInsuranceNumber':
            validationError.errCode = Worker.NINUMBER_ERROR;
            validationError.errType = 'NINUMBER_ERROR';
            validationError.source  = `${this._currentLine.NINUMBER}`;
            break;
          case 'WorkerNationality':
            // validationError.errCode = Worker.NATIONALITY_ERROR;
            // validationError.errType = 'NATIONALITY_ERROR';
            // validationError.source  = `${this._currentLine.NATIONALITY}`;
            break;
          case 'WorkerOtherJobs':
            // the Worker entity combines OTHERJOBROLE and OTHERJRDESC
            validationError.errCode = Worker.OTHER_JOB_ROLE_ERROR;
            validationError.errType = 'OTHER_JOB_ROLE_ERROR';
            validationError.source  = `${this._currentLine.OTHERJOBROLE} - ${this._currentLine.OTHERJRDESC}`;
            break;
          case 'WorkerPostcode':
            validationError.errCode = Worker.POSTCODE_ERROR;
            validationError.errType = 'POSTCODE_ERROR';
            validationError.source  = `${this._currentLine.POSTCODE}`;
            break;
          // in Worker entity, we have separated the social care qualification type and level into separate properties
          case 'WorkerQualificationInSocialCare':
          case 'WorkerSocialCareQualification':
            // validationError.errCode = Worker.SOCIALCARE_QUAL_ERROR;
            // validationError.errType = 'SOCIALCARE_QUAL_ERROR';
            // validationError.source  = `${this._currentLine.SCQUAL}`;
            break;
          case 'WorkerRecruitedFrom':
            // validationError.errCode = Worker.RECSOURCE_ERROR;
            // validationError.errType = 'RECSOURCE_ERROR';
            // validationError.source  = `${this._currentLine.RECSOURCE}`;
            break;
          case 'WorkerSocialCareStartDate':
            validationError.errCode = Worker.START_INSECT_ERROR;
            validationError.errType = 'START_INSECT_ERROR';
            validationError.source  = `${this._currentLine.STARTINSECT}`;
            break;
          case `WorkerWeeklyHoursAverage`:
            validationError.errCode = Worker.AVG_HOURS_ERROR;
            validationError.errType = 'AVG_HOURS_ERROR';
            validationError.source  = `${this._currentLine.AVGHOURS}`;
            break;
          case 'WorkerWeeklyHoursContracted':
            validationError.errCode = Worker.CONT_HOURS_ERROR;
            validationError.errType = 'CONT_HOURS_ERROR';
            validationError.source  = `${this._currentLine.CONTHOURS}`;
            break;
          case 'WorkerYearArrived':
            validationError.errCode = Worker.YEAR_OF_ENTRY_ERROR;
            validationError.errType = 'YEAR_OF_ENTRY_ERROR';
            validationError.source  = `${this._currentLine.YEAROFENTRY}`;
            break;
          case 'WorkerZeroContract':
            validationError.errCode = Worker.ZERO_HRCONT_ERROR;
            validationError.errType = 'ZERO_HRCONT_ERROR';
            validationError.source  = `${this._currentLine.ZEROHRCONT}`;
            break;
          default:
            validationError.errCode = thisError.code;
            validationError.errType = 'Undefined';
            validationError.source  = thisProp;
        }
        this._validationErrors.push(validationError);
      }) : true;
    });


    warnings.forEach(thisWarning => {
      thisWarning.properties ? thisWarning.properties.forEach(thisProp => {
        const validationWarning = {
          lineNumber: this._lineNumber,
          warning: thisWarning.message,
          name: this._currentLine.LOCALESTID,
          worker: this._currentLine.UNIQUEWORKERID,
        };

        switch (thisProp) {
          case 'WorkerNameOrId':
            validationWarning.warnCode = Worker.UNIQUE_WORKER_ID_WARNING;
            validationWarning.warnType = 'UNIQUE_WORKER_ID_WARNING';
            validationWarning.source  = `${this._currentLine.UNIQUEWORKERID}`;
            break;
          case 'WorkerMainJob':
            // validationWarning.warnCode = Worker.MAIN_JOB_ROLE_WARNING;
            // validationWarning.warnType = 'MAIN_JOB_ROLE_WARNING';
            // validationWarning.source  = `${this._currentLine.MAINJOBROLE} - ${this._currentLine.MAINJRDESC}`;
            break;
          case 'WorkerContract':
            // validationWarning.warnCode = Worker.CONTRACT_TYPE_WARNING;
            // validationWarning.warnType = 'CONTRACT_TYPE_WARNING';
            // validationWarning.source  = `${this._currentLine.EMPLSTATUS}`;
            break;
          case 'WorkerAnnualHourlyPay':
            // note - the Worker entity wraps the pay type (interval) and rate, with a single rate for hourly and annually
            validationWarning.warnCode = Worker.SALARY_INT_WARNING;
            validationWarning.warnType = 'SALARY_INT_WARNING';
            validationWarning.source  = `${this._currentLine.SALARYINT} - ${this._currentLine.SALARY} - ${this._currentLine.HOURLYRATE}`;
            break;
          case 'WorkerApprenticeshipTraining':
            validationWarning.warnCode = Worker.APPRENCTICE_WARNING;
            validationWarning.warnType = 'APPRENCTICE_WARNING';
            validationWarning.source  = `${this._currentLine.APPRENTICE}`;
            break;
          case 'WorkerApprovedMentalHealthWorker':
            validationWarning.warnCode = Worker.AMHP_WARNING;
            validationWarning.warnType = 'AMHP_WARNING';
            // validationWarning.source  = `${this._currentLine.AMHP}`;
            break;
          case 'WorkerBritishCitizenship':
            validationWarning.warnCode = Worker.BRITISH_CITIZENSHIP_WARNING;
            validationWarning.warnType = 'BRITISH_CITIZENSHIP_ERROR';
            validationWarning.source  = `${this._currentLine.BRITISHCITIZENSHIP}`;
            break;
          case 'WorkerCareCertificate':
            validationWarning.warnCode = Worker.CARE_CERT_WARNING;
            validationWarning.warnType = 'CARE_CERT_WARNING';
            validationWarning.source  = `${this._currentLine.CARECERT}`;
            break;
          case 'WorkerCountry':
            // validationWarning.warnCode = Worker.COUNTRY_OF_BIRTH_WARNING;
            // validationWarning.warnType = 'COUNTRY_OF_BIRTH_ERROR';
            // validationWarning.source  = `${this._currentLine.COUNTRYOFBIRTH}`;
            break;
          case 'WorkerDateOfBirth':
            // validationWarning.warnCode = Worker.DOB_WARNING;
            // validationWarning.warnType = 'DOB_WARNING';
            // validationWarning.source  = `${this._currentLine.DOB}`;
            break;
          case 'WorkerDaysSick':
            validationWarning.warnCode = Worker.DAYSICK_WARNING;
            validationWarning.warnType = 'DAYSICK_WARNING';
            validationWarning.source  = `${this._currentLine.DAYSSICK}`;
            break;
          case 'WorkerDisability':
            validationWarning.warnCode = Worker.DISABLED_WARNING;
            validationWarning.warnType = 'DISABLED_WARNING';
            validationWarning.source  = `${this._currentLine.DISABLED}`;
            break;
          case 'WorkerEthnicity':
            validationWarning.warnCode = Worker.ETHNICITY_WARNING;
            validationWarning.warnType = 'ETHNICITY_WARNING';
            validationWarning.source  = `${this._currentLine.ETHNICITY}`;
            break;
          case 'WorkerGender':
            validationWarning.warnCode = Worker.GENDER_WARNING;
            validationWarning.warnType = 'GENDER_WARNING';
            validationWarning.source  = `${this._currentLine.GENDER}`;
            break;
          case 'WorkerHighestQualification':
            validationWarning.warnCode = Worker.NON_SOCIALCARE_QUAL_WARNING;
            validationWarning.warnType = 'NON_SOCIALCARE_QUAL_WARNING';
            validationWarning.source  = `${this._currentLine.STARTDATE}`;
            break;
          case 'WorkerMainJobStartDate':
            validationWarning.warnCode = Worker.START_DATE_WARNING;
            validationWarning.warnType = 'START_DATE_WARNING';
            validationWarning.source  = `${this._currentLine.STARTDATE}`;
            break;
          case 'WorkerNationalInsuranceNumber':
            validationWarning.warnCode = Worker.NINUMBER_WARNING;
            validationWarning.warnType = 'NINUMBER_WARNING';
            validationWarning.source  = `${this._currentLine.NINUMBER}`;
            break;
          case 'WorkerNationality':
            // validationWarning.warnCode = Worker.NATIONALITY_WARNING;
            // validationWarning.warnType = 'NATIONALITY_WARNING';
            // validationWarning.source  = `${this._currentLine.NATIONALITY}`;
            break;
          case 'WorkerOtherJobs':
            validationWarning.warnCode = Worker.OTHER_JOB_ROLE_WARNING;
            validationWarning.warnType = 'OTHER_JOB_ROLE_WARNING';
            validationWarning.source  = `${this._currentLine.OTHERJOBROLE} - ${this._currentLine.OTHERJRDESC}`;
            break;
          case 'WorkerPostcode':
            validationWarning.warnCode = Worker.POSTCODE_ERROR;
            validationWarning.warnType = 'POSTCODE_ERROR';
            validationWarning.source  = `${this._currentLine.POSTCODE}`;
            break;
          // in Worker entity, we have separated the social care qualification type and level into separate properties
          case 'WorkerQualificationInSocialCare':
          case 'WorkerSocialCareQualification':
            // validationWarning.warnCode = Worker.SOCIALCARE_QUAL_WARNING;
            // validationWarning.warnType = 'SOCIALCARE_QUAL_WARNING';
            // validationWarning.source  = `${this._currentLine.SCQUAL}`;
            break;
          case 'WorkerRecruitedFrom':
            // validationWarning.warnCode = Worker.RECSOURCE_ERROR;
            // validationWarning.warnType = 'RECSOURCE_ERROR';
            // validationWarning.source  = `${this._currentLine.RECSOURCE}`;
            break;
          case 'WorkerSocialCareStartDate':
            validationWarning.warnCode = Worker.START_INSECT_WARNING;
            validationWarning.warnType = 'START_INSECT_WARNING';
            validationWarning.source  = `${this._currentLine.STARTINSECT}`;
            break;
          case 'WorkerWeeklyHoursAverage':
            validationWarning.warnCode = Worker.AVG_HOURS_WARNING;
            validationWarning.warnType = 'AVG_HOURS_WARNING';
            validationWarning.source  = `${this._currentLine.AVGHOURS}`;
            break;
          case 'WorkerWeeklyHoursContracted':
            validationWarning.warnCode = Worker.CONT_HOURS_WARNING;
            validationWarning.warnType = 'CONT_HOURS_WARNING';
            validationWarning.source  = `${this._currentLine.CONTHOURS}`;
            break;
          case 'WorkerYearArrived':
            validationWarning.warnCode = Worker.YEAR_OF_ENTRY_ERROR;
            validationWarning.warnType = 'YEAR_OF_ENTRY_ERROR';
            validationWarning.source  = `${this._currentLine.YEAROFENTRY}`;
            break;
          case 'WorkerZeroContract':
            validationWarning.warnCode = Worker.ZERO_HRCONT_WARNING;
            validationWarning.warnType = 'ZERO_HRCONT_WARNING';
            validationWarning.source  = `${this._currentLine.ZEROHRCONT}`;
            break;
          case 'RegisteredNurse':
            break;
          case 'NurseSpecialism':
            break;
          default:
            validationWarning.warnCode = thisWarning.code;
            validationWarning.warnType = 'Undefined';
            validationWarning.source  = thisProp;
        }

        this._validationErrors.push(validationWarning);
      }) : true;
    }); */
  }


  // maps Entity (API) validation messages to bulk upload specific messages (using Entity property name)
  addQualificationAPIValidation(columnIndex, errors, warnings) {
    errors.forEach(thisError => {
      thisError.properties ? thisError.properties.forEach(thisProp => {
        const validationError = {
          lineNumber: this._lineNumber,
          error: thisError.message,
          name: this._currentLine.LOCALESTID,
        };

        switch (thisProp) {
          case 'Qualification':
            // validationError.errCode = Worker[`QUAL_ACH${columnIndex}_WARNING`];
            // validationError.errType = `QUAL_ACH${columnIndex}_ERROR`;
            // validationError.source  = `${this._currentLine[`QUALACH${columnIndex}`]}`;
            break;
          case 'Year':
            // validationError.errCode = Worker[`QUAL_ACH${columnIndex}_ERROR`];
            // validationError.errType = `QUAL_ACH${columnIndex}_ERROR`;
            // validationError.source  = `${this._currentLine[`QUALACH${columnIndex}`]}`;
            break;
          case 'Notes':
            // validationError.errCode = Worker[`QUAL_ACH${columnIndex}_NOTES_ERROR`];
            // validationError.errType = `QUAL_ACH${columnIndex}_NOTES_ERROR`;
            // validationError.source  = `${this._currentLine[`QUALACH${columnIndex}NOTES`]}`;
            break;
          default:
            // validationError.errCode = thisError.code;
            // validationError.errType = 'Undefined';
            // validationError.source  = thisProp;
        }
        this._validationErrors.push(validationError);
      }) : true;
    });


    warnings.forEach(thisWarning => {
      thisWarning.properties ? thisWarning.properties.forEach(thisProp => {
        const validationWarning = {
          lineNumber: this._lineNumber,
          warning: thisWarning.message,
        };

        switch (thisProp) {
          case 'Qualification':
            // validationWarning.warnCode = Worker[`QUAL_ACH${columnIndex}_ERROR`];
            // validationWarning.warnType  = `QUAL_ACH${columnIndex}_ERROR`;
            // validationWarning.source  = `${this._currentLine[`QUALACH${columnIndex}`]}`;
            break;
          case 'Year':
            // validationWarning.warnCode = Worker[`QUAL_ACH${columnIndex}_ERROR`];
            // validationWarning.warnType  = `QUAL_ACH${columnIndex}_ERROR`;
            // validationWarning.source  = `${this._currentLine[`QUALACH${columnIndex}`]}`;
            break;
          case 'Notes':
            // validationWarning.warnCode = Worker[`QUAL_ACH${columnIndex}_NOTES_ERROR`];
            // validationWarning.warnType = `QUAL_ACH${columnIndex}_NOTES_ERROR`;
            // validationWarning.source  = `${this._currentLine[`QUALACH${columnIndex}NOTES`]}`;
            break;
          default:
            // validationWarning.warnCode = thisWarning.code;
            // validationWarning.warnType = 'Undefined';
            // validationWarning.source  = thisProp;
        }

        this._validationErrors.push(validationWarning);
      }) : true;
    });
  }

  _csvQuote(toCsv) {
    if (toCsv.replace(/ /g, '').match(/[\s,"]/)) {
      return '"' + toCsv.replace(/"/g, '""') + '"';
    } else {
      return toCsv;
    }
  }

  // returns the BUDI mapped nationality
  _maptoCSVnationality(nationality) {
    if (nationality) {
      if (nationality.value === 'British') {
        return 826;
      } else if (nationality.value === 'Don\'t know') {
        return 998;
      } else {
        if (nationality.value === 'Other' && nationality.other && nationality.other.nationalityId) {
          // the other nationality is specific - BUDI lookup
          return BUDI.nationality(BUDI.FROM_ASC, nationality.other.nationalityId);
        } else {
          // other nationality is not specific - fixed BUDI code
          return 999;
        }
      }
    } else {
      return '';  // not specified
    }
  }

  // returns the BUDI mapped country
  _maptoCSVcountry(country) {
    if (country) {
      if (country.value === 'United Kingdom') {
        return 826;
      } else if (country.value === 'Don\'t know') {
        return 998;
      } else {
        // it's other - other
        if (country.value === 'Other' && country.other && country.other.countryId){
          // the other country is specific - BUDI lookup
          return BUDI.country(BUDI.FROM_ASC, country.other.countryId);
        }
        else {
          // other country is not specific - fixed BUDI code
          return 999;
        }
      }
    } else {
      return '';  // not specified
    }
  }

  // returns the BUDI mapped recruitment source
  _maptoCSVrecruitedFrom(source) {
    if (source) {
      if (source.value === 'No') {
        return 16;
      } else {
        // it's other
        return BUDI.recruitment(BUDI.FROM_ASC, source.from.recruitedFromId);
      }
    } else {
      return '';  // not specified
    }
  }

  // returns the BUDI mapped started in sector
  _maptoCSVStartedInSector(started) {
    if (started) {
      if (started.value === 'No') {
        return '';
      } else {
        return started.year;
      }
    } else {
      return '';  // not specified
    }
  }

  // returns the BUDI mapped days sick
  _maptoCSVDaysSick(daysSick) {
    if (daysSick) {
      if (daysSick.value === 'No') {
        return 999;
      } else {
        return daysSick.days;
      }
    } else {
      return '';  // not specified
    }
  }

  // returns the BUDI mapped days sick
  _maptoCSVslary(annualHourlyPay) {
    if (annualHourlyPay) {
      if (annualHourlyPay.value === 'Annually') {
        return [1, annualHourlyPay.rate, ''];
      } else {
        return [3, '', annualHourlyPay.rate];
      }
    } else {
      return ['','',''];  // not specified
    }
  }

  _maptoCSVregsiterNurse(registeredNurse) {
    let mappedValue = '';
    switch (registeredNurse) {
      case 'Adult Nurse':
        mappedValue = '01';
        break;
      case 'Mental Health Nurse':
        mappedValue = '02';
        break;
      case 'Learning Disabilities Nurse':
        mappedValue = '03';
        break;
      case `Children's Nurse`:
        mappedValue = '04';
        break;
      case 'Enrolled Nurse':
        mappedValue = '05';
        break;
    }

    return mappedValue;
  }

  // takes the given Worker entity and writes it out to CSV string (one line)
  toCSV(establishmentId, entity) {
    // ["LOCALESTID","UNIQUEWORKERID","CHGUNIQUEWRKID","STATUS","DISPLAYID","NINUMBER","POSTCODE","DOB","GENDER","ETHNICITY","NATIONALITY","BRITISHCITIZENSHIP","COUNTRYOFBIRTH","YEAROFENTRY","DISABLED",
    //     "CARECERT","RECSOURCE","STARTDATE","STARTINSECT","APPRENTICE","EMPLSTATUS","ZEROHRCONT","DAYSSICK","SALARYINT","SALARY","HOURLYRATE","MAINJOBROLE","MAINJRDESC","CONTHOURS","AVGHOURS",
    //     "OTHERJOBROLE","OTHERJRDESC","NMCREG","NURSESPEC","AMHP","SCQUAL","NONSCQUAL","QUALACH01","QUALACH01NOTES","QUALACH02","QUALACH02NOTES","QUALACH03","QUALACH03NOTES"];
    const columns = [];
    columns.push(establishmentId);
    columns.push(this._csvQuote(entity.localIdentifier));   // todo - this will be local identifier
    //columns.push('');              // not on download
    columns.push('UNCHECKED');
    columns.push(this._csvQuote(entity.nameOrId));

    columns.push(entity.nationalInsuranceNumber ? entity.nationalInsuranceNumber.replace(/\s+/g,'') : '');  // remove whitespace
    columns.push(entity.postcode ? entity.postcode : '',);

    const dobParts = entity.dasteOfBirth ? entity.dasteOfBirth.split('-') : null;
    dobParts ? columns.push(`${dobParts[2]}/${dobParts[1]}/${dobParts[0]}`) : columns.push(''); // in UK date format dd/mm/yyyy (Worker stores as YYYY-MM-DD)

    switch (entity.gender) {
      case null:
          columns.push('');
          break;
      case 'Female':
        columns.push(2);
        break;
      case 'Male':
        columns.push(1);
        break;
      case 'Other':
        columns.push(4);
        break;
      case 'Don\'t know':
        columns.push(3);
        break;
    }

    // "ETHNICITY","NATIONALITY","BRITISHCITIZENSHIP","COUNTRYOFBIRTH","YEAROFENTRY"
    columns.push(entity.ethnicity ? BUDI.ethnicity(BUDI.FROM_ASC, entity.ethnicity.ethnicityId) : '');
    columns.push(entity.nationality ? this._maptoCSVnationality(entity.nationality) : '');
    switch (entity.britishCitizenship) {
      case null:
          columns.push('');
          break;
      case 'Yes':
        columns.push(1);
        break;
      case 'No':
        columns.push(2);
        break;
      case 'Don\'t know':
        columns.push(999);
        break;
    }
    columns.push(entity.countryOfBirth ? this._maptoCSVcountry(entity.countryOfBirth) : '');
    columns.push(entity.yearArrived ? entity.yearArrived.year : '');

    // disabled
    switch (entity.disabiliity) {
      case null:
          columns.push('');
          break;
      case 'Yes':
        columns.push(1);
        break;
      case 'No':
        columns.push(0);
        break;
      case 'Undisclosed':
        columns.push(2);
        break;
      case 'Don\'t know':
        columns.push(3);
        break;
    }
    switch (entity.careCerticate) {
      case null:
          columns.push('');
          break;
      case 'Yes, completed':
        columns.push(1);
        break;
      case 'No':
        columns.push(2);
        break;
      case 'Yes, in progress or partially completed':
        columns.push(3);
        break;
    }

    // "RECSOURCE","STARTDATE","STARTINSECT","APPRENTICE"
    columns.push(entity.recruitmentSource ? this._maptoCSVrecruitedFrom(entity.recruitmentSource) : '');
    const mainJobStartDateParts = entity.mainJobStartDate ? entity.mainJobStartDate.split('-') : null;
    mainJobStartDateParts ? columns.push(`${mainJobStartDateParts[2]}/${mainJobStartDateParts[1]}/${mainJobStartDateParts[0]}`) : columns.push(''); // in UK date format dd/mm/yyyy (Worker stores as YYYY-MM-DD)
    columns.push(this._maptoCSVStartedInSector(entity.socialCareStartDate));
    switch (entity.apprenticeship) {
      case null:
        columns.push('');
        break;
      case 'Yes':
        columns.push(1);
        break;
      case 'No':
        columns.push(2);
        break;
      case 'Don\'t know':
        columns.push(999);
        break;
    }

    // EMPLSTATUS/;contract - mandatory
    switch (entity.contract) {
      case 'Permanent':
        columns.push(1);
        break;
      case 'Temporary':
        columns.push(2);
        break;
      case 'Pool/Bank':
        columns.push(3);
        break;
      case 'Agency':
        columns.push(4);
        break;
      case 'Other':
        columns.push(7);
        break;
    }

    // "ZEROHRCONT","DAYSSICK","SALARYINT","SALARY","HOURLYRATE"
    switch (entity.zeeroContractHours) {
      case null:
        columns.push('');
        break;
      case 'Yes':
        columns.push(1);
        break;
      case 'No':
        columns.push(2);
        break;
      case 'Don\'t know':
        columns.push(999);
        break;
    }
    columns.push(this._maptoCSVDaysSick(entity.daysSick));
    const salaryMap = this._maptoCSVslary(entity.annualHourlyPay);
    columns.push(salaryMap[0]);
    columns.push(salaryMap[1]);
    columns.push(salaryMap[2]);

    // "MAINJOBROLE","MAINJRDESC","CONTHOURS","AVGHOURS"
    const contractedHoursContract = ['Permanent', 'Temporary'];
    const averageHoursContract = ['Pool/Bank', 'Agency', 'Other'];
    columns.push(entity.mainJob ? BUDI.jobRoles(BUDI.FROM_ASC, entity.mainJob.jobId) : '');
    columns.push(entity.mainJob && entity.mainJob.other ? entity.mainJob.other : '');
    columns.push(entity.contract && contractedHoursContract.includes(entity.contract) && entity.contractedHours ? entity.contractedHours.hours : '');
    columns.push(entity.contract && averageHoursContract.includes(entity.contract) &&entity.averageHours ? entity.averageHours.hours : '');

    // "OTHERJOBROLE","OTHERJRDESC"
    columns.push(entity.otherJobs && entity.otherJobs.value === 'Yes'
      ? entity.otherJobs.otherJobs.map(thisJob => {
          return BUDI.jobRoles(BUDI.FROM_ASC, thisJob.jobId);
        }).join(';')
      : '');
    columns.push(entity.otherJobs && entity.otherJobs.value === 'Yes'
      ? entity.otherJobs.otherJobs.map(thisJob => {
          return thisJob.other;
        }).join(';')
      : '');

    // "NMCREG","NURSESPEC"
    const NURSE_JOB_ID = 23;
    columns.push(entity.mainJob && entity.mainJob.jobId === NURSE_JOB_ID && entity.registeredNurse
      ? this._maptoCSVregsiterNurse(entity.registeredNurse)
      : '');
    columns.push(entity.mainJob && entity.mainJob.jobId === NURSE_JOB_ID && entity.nurseSpecialism
      ? BUDI.nursingSpecialist(BUDI.FROM_ASC, entity.nurseSpecialism.id)
      : '');

    // "AMHP"
    switch (entity.approvedMentalHealthWorker) {
      case null:
        columns.push('');
        break;
      case 'yes':
        columns.push(1);
        break;
      case 'No':
        columns.push(2);
        break;
      case 'Don\'t know':
        columns.push(999);
        break;
    }

    // "SCQUAL","NONSCQUAL"
    switch (entity.socialCareQualification) {
      case null:
        columns.push('');
        break;
      case 'Yes':
        columns.push('1;'.concat(entity.socialCareQualificationLevel ? BUDI.qualificationLevels(BUDI.FROM_ASC, entity.socialCareQualificationLevel.qualificationId) : ''));
        break;
      case 'No':
        columns.push(2);
        break;
      case 'Don\'t know':
        columns.push(999);
        break;
    }
    switch (entity.nonSocialCareQualification) {
      case null:
        columns.push('');
        break;
      case 'Yes':
        columns.push('1;'.concat(entity.nonSocialCareQualificationLevel ? BUDI.qualificationLevels(BUDI.FROM_ASC, entity.nonSocialCareQualificationLevel.qualificationId) : ''));
        break;
      case 'No':
        columns.push(2);
        break;
      case 'Don\'t know':
        columns.push(999);
        break;
    }


    // and now for qualifications - up to 3 - https://trello.com/c/ahBZTUMC
    const MAX_QUALIFICATIONS = 3;
    const myQualifications = entity.qualifications.slice(0, MAX_QUALIFICATIONS);

    for(let index = 0; index < MAX_QUALIFICATIONS; index++) {
      if (index < myQualifications.length) {
        const thisQual = myQualifications[index];
        const mappedQualification = BUDI.qualifications(BUDI.FROM_ASC, thisQual.qualification.id);
        if (mappedQualification) {
          columns.push(`${mappedQualification};${thisQual.year ? thisQual.year : ''}`);
          columns.push(thisQual.notes ? thisQual.notes : '');
        }
      }
    };

    return columns.join(',');
  }
};

module.exports.Worker = Worker;
