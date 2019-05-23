const BUDI = require('../BUDI').BUDI;

class Worker {
  constructor(currentLine, lineNumber) {
    this._currentLine = currentLine;
    this._lineNumber = lineNumber;
    this._validationErrors = [];
    this._contractType= null;

    //console.log(`MN DEBUG - current worker (${this._lineNumber}:`, this._currentLine);
    this._localId = null;
    this._workerLocalID = null;
    this._gender = null;
  };

  //49 csv columns
  static get LOCAL_ID_ERROR() { return 1010; }
  static get UNIQUE_WORKER_ID_ERROR() { return 1020; }
  static get CHANGE_UNIQUE_WORKER_ID_ERROR() { return 1030; }
  static get STATUS_ERROR() { return 1040; }
  static get DISPLAY_ID_ERROR() { return 1050; }
  static get NINUMBER_ERROR() { return 1060; }
  static get POSTCODE_ERROR() { return 1070; }
  static get DOB_ERROR() { return 1080; }
  static get GENDER_ERROR() { return 1090; }
  static get ETHNICITY_ERROR() { return 2000; }
  static get NATIONALITY_ERROR() { return 2010; }
  static get BRTITISH_CITIZENSHIP_ERROR() { return 2020; }
  static get COUNTRY_OF_BIRTH_ERROR() { return 2030; }
  static get YEAR_OF_ENTRY_ERROR() { return 2040; }
  static get DISABLED_ERROR() { return 2050; }
  static get INDSTATUS_ERROR() { return 2060; }
  static get INDDATE_ERROR() { return 2070; }
  static get CARE_CERT_ERROR() { return 2080; }
  static get CARE_CERT_DATE_ERROR() { return 2090; }
  static get RESOURCE_ERROR() { return 3000; }
  static get START_DATE_ERROR() { return 3010; }
  static get START_INSECT_ERROR() { return 3020; }
  static get APPRENCTICE_ERROR() { return 3030; }
  static get CONTRACT_TYPE_ERROR() { return 3040; } //EMPL STATUS
  static get FULLTIME_ERROR() { return 3050; }
  static get ZERO_HRCONT_ERROR() { return 3060; }
  static get DAYSICK_ERROR() { return 3070; }
  static get SALARY_INT_ERROR() { return 3080; }
  static get SALARY_ERROR() { return 3090; }
  static get HOURLY_RATE_ERROR() { return 4000; }
  static get MAIN_JOB_ROLE_ERROR() { return 4010; }
  static get MAIN_JOB_DESC_ERROR() { return 4020; }
  static get CONT_HOURS_ERROR() { return 4030; }
  static get ADDL_HOURS_ERROR() { return 4040; }
  static get OTHER_JOB_ROLE_ERROR() { return 4050; }
  static get OTHER_JR_DESC_ERROR() { return 4060; }
  static get NMCREG_ERROR() { return 4070; }
  static get NURSE_SPEC_ERROR() { return 4080; }
  static get SOCIALCARE_QUAL_ERROR() { return 4090; }
  static get NON_SOCIALCARE_QUAL_ERROR() { return 5000; }
  static get NO_QUAL_WT_ERROR() { return 5010; }
  static get QUAL_WT_ERROR() { return 5020; }
  static get QUAL_WT_NOTES_ERROR() { return 5030; }
  static get QUAL_ACH01_ERROR() { return 5040; }
  static get QUAL_ACH01_NOTES_ERROR() { return 5050; }
  static get QUAL_ACH02_ERROR() { return 1060; }
  static get QUAL_ACH02_NOTES_ERROR() { return 5070; }
  static get QUAL_ACH03_ERROR() { return 5080; }
  static get QUAL_ACH03_NOTES_ERROR() { return 5090; }

      
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

  _validateContractType() {
    const myContractType = parseInt(this._currentLine.EMPLSTATUS);

    //console.log("NM DEBUG: contract type (employment status): ", myContractType)
    if (Number.isNaN(myContractType)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Worker.CONTRACT_TYPE_ERROR,
        errType: 'CONTRACT_TYPE_ERROR',
        error: "Employment Status (EMPLSTATUS) must be an integer",
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
        lineNumber: this._lineNumber,
        errCode: Worker.LOCAL_ID_ERROR,
        errType: `LOCAL_ID_ERROR`,
        error: "Local Identifier must be defined",
        source: this._currentLine.LOCALESTID,
      });
      return false;
    } else if (myLocalId.length >= MAX_LENGTH) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Worker.LOCAL_ID_ERROR,
        errType: `LOCAL_ID_ERROR`,
        error: `Local Identifier (LOCALESTID) must be no more than ${MAX_LENGTH} characters`,
        source: this._currentLine.LOCALESTID,
      });
      return false;
    } else {
      this._localId = myLocalId;
      return true;
    }

  }

  _validateUniqueWorkerId() {
    const myUniqueWorkerId = this._currentLine.UNIQUEWORKERID;

    // must be present and n more than 50 characters
    const MAX_LENGTH = 50;

    if (!myUniqueWorkerId || myUniqueWorkerId.length == 0) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Worker.UNIQUE_WORKER_ID_ERROR,
        errType: `UNIQUE_WORKER_ID_ERROR`,
        error: "Unique Worker Local Identifier must be defined",
        source: this._currentLine.UNIQUEWORKERID,
      });
      return false;
    } else if (myUniqueWorkerId.length >= MAX_LENGTH) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Worker.UNIQUE_WORKER_ID_ERROR,
        errType: `UNIQUE_WORKER_ID_ERROR`,
        error: `Unique Worker Identifier (UNIQUEWORKERID) must be no more than ${MAX_LENGTH} characters`,
        source: this._currentLine.UNIQUEWORKERID,
      });
      return false;
    } else {
      this._uniqueWorkerId = myUniqueWorkerId;
      return true;
    }
  }

  //Comment: This may not be supported in UI/system so only checked lenght if exists, could be null
  _validateChangeUniqueWorkerId() {
    const myChangeUniqueWorkerId = this._currentLine.CHGUNIQUEWRKID;
    const MAX_LENGTH = 50;
    if (myChangeUniqueWorkerId.length >= MAX_LENGTH) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Worker.CHANGE_UNIQUE_WORKER_ID_ERROR,
        errType: `CHANGE_UNIQUE_WORKER_ID_ERROR`,
        error: `Change Unique Local Worker Identifier (CHGUNIQUEWRKID) must be no more than ${MAX_LENGTH} characters`,
        source: this._currentLine.CHGUNIQUEWRKID,
      });
      return false;
    } else {
      this._changeUniqueWorkerId = myChangeUniqueWorkerId;
      return true;
    }
  }
    
  _validateStatus() {
    const statusValues = ['DELETE', 'UPDATE', 'UNCHECKED', 'NOCHANGE', 'NEW','CHGSUB'];
    const myStatus = this._currentLine.STATUS ? this._currentLine.STATUS.toUpperCase() : this._currentLine.STATUS;

    // must be present and must be one of the preset values (case insensitive)
    if (!statusValues.includes(myStatus)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Worker.STATUS_ERROR,
        errType: `STATUS_ERROR`,
        error: `Status (STATUS) must be one of: ${statusValues}`,
        source: this._currentLine.STATUS,
      });
      return false;
    } else {
      this._status = myStatus;
      return true;
    }
  }

  _validateDisplayId() {
    const myDisplayId = this._currentLine.DISPLAYID;
    const MAX_LENGTH = 120;

    if (myDisplayId.length >= MAX_LENGTH) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Worker.DISPLAY_ID_ERROR,
        errType: `WORKER_DISPLAY_ID_ERROR`,
        error: `Display ID (DISPLAYID) must be no more than ${MAX_LENGTH} characters`,
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
    const LENGTH = 9;
    const niRegex = /^\s*[a-zA-Z]{2}(?:\s*\d\s*){6}[a-zA-Z]?\s*$/;

    if (myNINumber.length > 0 && myNINumber.length != LENGTH  ) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Worker.NINUMBER_ERROR,
        errType: `WORKER_NINUMBER_ERROR`,
        error: `National Insurance number (NINUMBER) must be ${LENGTH} characters`,
        source: this._currentLine.NINUMBER,
      });
      return false;
    } else if (myNINumber.length > 0 && myNINumber.length == LENGTH && !niRegex.test(myNINumber)) {

      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Worker.NINUMBER_ERROR,
        errType: `WORKER_NINUMBER_ERROR`,
        error: `Incorret NI format; must be in AB123456C format`,
        source: this._currentLine.NINUMBER,
      });
      return false;
    }
    else {
      this._NINumber = myNINumber;
      return true;
    }
  }

  _validatePostCode() {
    const myPostcode = this._currentLine.POSTCODE;
    const MAX_LENGTH = 10;
    const postcodeRegex = /^[A-Za-z]{1,2}[0-9]{1,2}\s{1}[0-9][A-Za-z]{2}$/;

    if (myPostcode.length >= MAX_LENGTH) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Worker.LOCAL_ID_ERROR,
        errType: `POSTCODE_ERROR`,
        error: `POSTCODE (POSTCODE) must be no more than ${MAX_LENGTH} characters`,
        source: this._currentLine.POSTCODE,
      });
      return false;
    } else if (myPostcode.length >= MAX_LENGTH && !postcodeRegex.test(myPostcode)) {
       this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Worker.POSTCODE_ERROR,
        errType: `POSTCODE ERROR`,
        error: `Postcode (POSTCODE) unexpected format`,
        source: myPostcode,
      });
      return false;
    }
      else {
        this._postCode = myPostcode;
        return true;
      }
  }
  
  _validateDOB() {
    const myDOB = this._currentLine.DOB;
    const postcodeRegex = /^([0-2][0-9]|(3)[0-1])(\/)(((0)[0-9])|((1)[0-2]))(\/)\d{4}$/;

    if (myDOB.length > 0 && !postcodeRegex.test(myDOB)) {

      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Worker.DOB_ERROR,
        errType: `DOB_ERROR`,
        error: `Date of birth (DOB) Incorrect`,
        source: this._currentLine.DOB,
      });
      return false;
    } else if (myDOB.length > 0 && postcodeRegex.test(myDOB)) {

      var dateParts = myDOB.split("/");
      var birthDate = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]); 
      var today = new Date();
      var age = today.getFullYear() - birthDate.getFullYear();
      var m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      if (age <= 14 || age >= 100) {

        this._validationErrors.push({
          lineNumber: this._lineNumber,
          errCode: Worker.DOB_ERROR,
          errType: `DOB_ERROR`,
          error: `Date of birth (DOB) Must be between 14 to 100 years`,
          source: this._currentLine.DOB,
        });
        return false;
      }
      this._DOB = myDOB;
      return false;
    } else {
      this._DOB = myDOB;
      return true;
    }
  }

  _validateGender() {
    const genderValues = [1,2,3]; //[MALE=1, FEMALE=2, UNKNOWN=3];
    const myGender = this._currentLine.GENDER;

    if (isNaN(myGender)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Worker.GENDER_ERROR,
        errType: 'GENDER_ERROR',
        error: "GENDER (GENDER) must be an integer",
        source: this._currentLine.GENDER,
      });
      return false;
    } else if (!genderValues.includes(parseInt(myGender))) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Worker.GENDER_ERROR,
        errType: 'GENDER_ERROR',
        error: "GENDER (GENDER) must have value 1 (MALE) or 2(FEMALE) or 3(UNKNOWN)",
        source: this._currentLine.GENDER,
      });
      return false;
    }
    else {
      this._gender = myGender;
      return true;
    }
  }

  //Mandatory for local Authority - need to check this conditional check
  _validateEthnicity() {
    const ethnicityValues = [31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 98, 99];
    const myEthnicity = this._currentLine.ETHNICITY;

    if (isNaN(myEthnicity)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Worker.ETHNICITY_ERROR,
        errType: 'Ethnicity_ERROR',
        error: "Ethnicity (Ethnicity) must be an integer",
        source: this._currentLine.ETHNICITY,
      });
      return false;
    } else if (myEthnicity && !ethnicityValues.includes(parseInt(myEthnicity))) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Worker.ETHNICITY_ERROR,
        errType: 'Ethnicity_ERROR',
        error: "Ethnicity (Ethnicity) must have value between 31 to 47,  98 or 99",
        source: this._currentLine.ETHNICITY,
      });
      return false;
    }
    else {
      this._ethnicity = myEthnicity;
      return true;
    }
  }


  _validateCitizenShip() {
    const BritishCitizenshipValues = [1,2,999];
    const myBritishCitizenship = this._currentLine.BRITISHCITIZENSHIP;

    if (isNaN(myBritishCitizenship)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Worker.ETHNICITY_ERROR,
        errType: 'Ethnicity_ERROR',
        error: "CitizenShip (BRITISHCITIZENSHIP) must be an integer",
        source: this._currentLine.BRITISHCITIZENSHIP,
      });
      return false;
    } else if (myBritishCitizenship && !BritishCitizenshipValues.includes(parseInt(myBritishCitizenship))) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Worker.BRITISHCITIZENSHIP_ERROR,
        errType: 'Ethnicity_ERROR',
        error: "British Citizenship (BRITISHCITIZENSHIP) must have value 1(Yes) to 2(No),  999(Unknown) ",
        source: this._currentLine.BRITISHCITIZENSHIP,
      });
      return false;
    }
    else {
      this._britishNationality = myBritishCitizenship;
      return true;
    }
  }

  // this should 4 digit and less than date of birth;
  // ignore countr of birth check
  _validateYearOfEntry() {
    const myBritishCitizenship = this._currentLine.BRITISHCITIZENSHIP;
    
    const myYearOfEntry = this._currentLine.YEAROFENTRY;
    const myDOB = this._currentLine.DOB;
    const yearRegex = /^\d{4}$/;

    var dateParts = myDOB.split("/");
    var birthDate = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);
  
    if (myYearOfEntry && !yearRegex.test(myYearOfEntry)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Worker.YEAROFENTRY_ERROR,
        errType: 'Ethnicity_ERROR',
        error: "YEAROFENTRY (YEAROFENTRY) must be 4 number ",
        source: this._currentLine.YEAROFENTRY,
      });
      return false;
    }
    else if (myYearOfEntry && !(myYearOfEntry > birthDate.getFullYear())) {

      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Worker.YEAROFENTRY_ERROR,
        errType: 'Ethnicity_ERROR',
        error: "Year of Entry (YEAROFENTRY) must not be before date of birth",
        source: this._currentLine.YEAROFENTRY,
      });
      return false;
    }
    else {
      this._validateYearOfEntry = myYearOfEntry;
      return true;
    }

  }


  _validateDisabled() {

  }







  //transform related
  _transformContractType() {
    if (this._contractType) {
      this._contractType = BUDI.contractType(BUDI.TO_ASC, this._contractType);
    }
  };


  // returns true on success, false is any attribute of Worker fails
  validate() {
    let status = true;

    status = !this._validateContractType() ? false : status;
    status = !this._validateLocalId() ? false : status;
    status = !this._validateUniqueWorkerId() ? false : status;
    status = !this._validateChangeUniqueWorkerId() ? false : status;
    status = !this._validateStatus() ? false : status;
    status = !this._validateDisplayId() ? false : status;
    status = !this._validateNINumber() ? false : status;
    status = !this._validatePostCode() ? false : status;
    status = !this._validateDOB() ? false : status;
    status = !this._validateGender() ? false : status;
    status = !this._validateEthnicity() ? false : status;
    status = !this._validateCitizenShip() ? false : status;
    status = !this._validateYearOfEntry() ? false : status;

   
    return status;
  };

  // returns true on success, false is any attribute of Worker fails
  transform() {
    let status = true;

   // status = !this._transformMainService() ? false : status;


    return status;
  };

  toJSON() {
    return {
      contractType: {
        id: this._contractType
      }
    };
  };

  get validationErrors() {
    return this._validationErrors;
  };
};

module.exports.Worker = Worker;
