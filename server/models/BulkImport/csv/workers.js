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
  get indStatus() {
    return this._indStatus;
  }
  get indDate() {
    return this._indDate;
  }
  get careCert() {
    return this._careCert;
  }
  get careCertDate() {
    return this._careCertDate;
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
  get fullTime() {
    return this._fullTime;
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
        error: "YEAR OF ENTRY (YEAROFENTRY) must be 4 number ",
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
    const disabledValues = [0,1]; 
    const myDisabled = this._currentLine.DISABLED;

    if (isNaN(myDisabled)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Worker.DISABLED_ERROR,
        errType: 'DISABLED_ERROR',
        error: "Disabled (DISABLED) must be an integer",
        source: this._currentLine.DISABLED,
      });
      return false;
    } else if (myDisabled && !disabledValues.includes(parseInt(myDisabled))) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Worker.DISABLED_ERROR,
        errType: 'DISABLED_ERROR',
        error: "Disabled (DISABLED) must have value 0(No Disability) or 1(Has Disability)",
        source: this._currentLine.DISABLED,
      });
      return false;
    }
    else {
      this._disabled = myDisabled;
      return true;
    }

  }

  _validateIndStatus() {
    const indStatusValues = [1,3];
    const myIndStatus = this._currentLine.INDSTATUS;

    if (myIndStatus && isNaN(myIndStatus)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Worker.INDSTATUS_ERROR,
        errType: 'INDSTATUS_ERROR',
        error: "IndStatus (INDSTATUS) must be an integer",
        source: this._currentLine.INDSTATUS,
      });
      return false;
    } else if (myIndStatus && !indStatusValues.includes(parseInt(myIndStatus))) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Worker.INDSTATUS_ERROR,
        errType: 'INDSTATUS_ERROR',
        error: "IndStatus (INDSTATUS) must have value 1(induction complete) or 3(not applicable)",
        source: this._currentLine.INDSTATUS,
      });
      return false;
    }
    else {
      this._indStatus = myIndStatus;
      return true;
    }

  }

  //date can not be in future,
  //Question: only answer or if above is provided
  _validateIndDate() {
    const myIndDate = this._currentLine.INDDATE;
    const myIndStatus = this._currentLine.INDSTATUS;

    const dateRegex = /^([0-2][0-9]|(3)[0-1])(\/)(((0)[0-9])|((1)[0-2]))(\/)\d{4}$/;

    var d1 = new Date();
    var d2 = new Date(myIndDate);

    if (myIndDate && !dateRegex.test(myIndDate)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Worker.INDDATE_ERROR,
        errType: 'INDSTATUS_ERROR',
        error: "IndDate (INDDATE) should by in dd/mm/yyyy format",
        source: this._currentLine.INDDATE,
      });
      return false;
    } else if ((d2 > d1)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Worker.INDDATE_ERROR,
        errType: 'INDSTATUS_ERROR',
        error: "Date can not be in future",
        source: this._currentLine.INDDATE,
      });
      return false;
    } else {
      this._indDate = myIndDate;
      return true;
    }
  }

  _validateCareCert() {
    const careCertValues = [1, 2, 3];
    const myCareCert = this._currentLine.CARECERT;

    if (myCareCert && isNaN(myCareCert)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Worker.CARE_CERT_ERROR,
        errType: 'CARECERT_ERROR',
        error: "Care Certificate (CARECERT) must be an integer",
        source: this._currentLine.CARECERT,
      });
      return false;
    } else if (myCareCert && !careCertValues.includes(parseInt(myCareCert))) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Worker.CARE_CERT_ERROR,
        errType: 'CARECERT_ERROR',
        error: "Care Certificate (CARECERT)  must have value 1(YES) or 2(NO) or 3(IN PROGRESS)",
        source: this._currentLine.CARECERT,
      });
      return false;
    }
    else {
      this._careCert = myCareCert;
      return true;
    }

  }

  _validateCareCertDate() {
    const myCareCertDate = this._currentLine.CARECERTDATE;
    const dateRegex = /^([0-2][0-9]|(3)[0-1])(\/)(((0)[0-9])|((1)[0-2]))(\/)\d{4}$/;

    var d1 = new Date();
    var d2 = new Date(myCareCertDate);

    if (myCareCertDate && !dateRegex.test(myCareCertDate)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Worker.CARE_CERT_DATE_ERROR,
        errType: 'CARECERTDATE_ERROR',
        error: "Care Certificate Date (CARECERTDATE) should by in dd/mm/yyyy format",
        source: this._currentLine.CARECERTDATE,
      });
      return false;
    } else if (myCareCertDate && (d2 > d1)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Worker.CARE_CERT_DATE_ERROR,
        errType: 'CARECERTDATE_ERROR',
        error: "Care Certificate (CARECERTDATE) Date can not be in future",
        source: this._currentLine.CARECERTDATE,
      });
      return false;
    } else {
      this._careCertDate = myCareCertDate;
      return true;
    }
  }

  _validateRecSource() {
    const recSourceValues = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16];
    const myRecSource = this._currentLine.RECSOURCE;

    if (isNaN(myRecSource)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Worker.RESOURCE_ERROR,
        errType: 'RECSOURCE_ERROR',
        error: "Recruitement Source (RECSOURCE) must be an integer",
        source: this._currentLine.RECSOURCE,
      });
      return false;
    } else if (myRecSource && !recSourceValues.includes(parseInt(myRecSource))) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Worker.RESOURCE_ERROR,
        errType: 'RECSOURCE_ERROR',
        error: "Recruitement Source (RECSOURCE) value is incorrect",
        source: this._currentLine.RECSOURCE,
      });
      return false;
    }
    else {
      this._recSource = myRecSource;
      return true;
    }
  }

  _validateStartDate() {
    const myStartDate = this._currentLine.STARTDATE;
   
    const dateRegex = /^([0-2][0-9]|(3)[0-1])(\/)(((0)[0-9])|((1)[0-2]))(\/)\d{4}$/;

    var d1 = new Date();
    var d2 = new Date(myStartDate);

    if (myStartDate && !dateRegex.test(myStartDate)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Worker.START_DATE_ERROR,
        errType: 'STARTDATE_ERROR',
        error: "Start Date (STARTDATE) should by in dd/mm/yyyy format",
        source: this._currentLine.STARTDATE,
      });
      return false;
    } else if ((d2 > d1)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Worker.START_DATE_ERROR,
        errType: 'STARTDATE_ERROR',
        error: "Start Date (STARTDATE) can not be in future",
        source: this._currentLine.STARTDATE,
      });
      return false;
    } else {
      this._startDate = myStartDate;
      return true;
    }
  }

  //TODO This date will be ignored if less than year from DOB plus 16 years. It will also be ignored if later that INDDATE or STARTDATE years and must not be in future
 // Currenly only validating 4 digit year
  _validateStartInsect() {

    const myStartInsect = this._currentLine.STARTINSECT;
    const yearRegex = /^\d{4}$/;

    if (myStartInsect && !yearRegex.test(myStartInsect)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Worker.START_INSECT_ERROR,
        errType: 'START_INSECT_ERROR',
        error: "Start Insect (STARTINSECT) must be 4 number ",
        source: this._currentLine.STARTINSECT,
      });
      return false;
    }
    else {
      this._startInsect = myStartInsect;
      return true;
    }
  }

  _validateApprentice() {
    const apprenticeValues = [1,2,999];
    const myApprentice = this._currentLine.APPRENTICE;

    if (isNaN(myApprentice)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Worker.APPRENCTICE_ERROR,
        errType: 'APPRENTICE_ERROR',
        error: "Apprentice (APPRENTICE) must be an integer",
        source: this._currentLine.APPRENTICE,
      });
      return false;
    } else if (myApprentice && !apprenticeValues.includes(parseInt(myApprentice))) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Worker.APPRENCTICE_ERROR,
        errType: 'APPRENTICE_ERROR',
        error: "Apprentice (APPRENTICE) value must 1(Yes), 2(No) or 999(Unknown)",
        source: this._currentLine.APPRENTICE,
      });
      return false;
    }
    else {
      this._apprentice = myApprentice;
      return true;
    }
  }

  _validateFullTime() {
    const fullTimeValues = [1, 2, 3];
    const myfullTime = this._currentLine.FULLTIME;

    if (isNaN(myfullTime)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Worker.FULLTIME_ERROR,
        errType: 'FULLTIME_ERROR',
        error: "Full Time (FULLTIME) must be an integer",
        source: this._currentLine.FULLTIME,
      });
      return false;
    } else if (myfullTime && !fullTimeValues.includes(parseInt(myfullTime))) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Worker.FULLTIME_ERROR,
        errType: 'FULLTIME_ERROR',
        error: "Apprentice (FULLTIME) value must 1(FullTime), 2(PartTime) or 3(Neither)",
        source: this._currentLine.FULLTIME,
      });
      return false;
    }
    else {
      this._fullTime = myfullTime;
      return true;
    }
  }

  _validateZeroHourContract() {
    const zeroHourContractValues = [1, 2, 999];
    const myZeroHourContract = this._currentLine.ZEROHRCONT;

    if (isNaN(myZeroHourContract)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Worker.ZERO_HRCONT_ERROR,
        errType: 'ZEROHRCONT_ERROR',
        error: "Zero Hour Contract (ZEROHRCONT) must be an integer",
        source: this._currentLine.ZEROHRCONT,
      });
      return false;
    } else if (myZeroHourContract && !zeroHourContractValues.includes(parseInt(myZeroHourContract))) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Worker.ZERO_HRCONT_ERROR,
        errType: 'ZEROHRCONT_ERROR',
        error: "Zero Hour Contract (ZEROHRCONT) value must 1(Yes), 2(No) or 999(Unknown)",
        source: this._currentLine.ZEROHRCONT,
      });
      return false;
    }
    else {
      this._fullTime = myZeroHourContract;
      return true;
    }
  }

  _validateDaysSick() {
    const myDaysSick = this._currentLine.DAYSSICK;

    if (isNaN(myDaysSick)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Worker.DAYSICK_ERROR,
        errType: 'DAYSSICK_ERROR',
        error: "Day Sick (DAYSSICK) must be an integer or decimal",
        source: this._currentLine.DAYSSICK,
      });
      return false;
    } else if (myDaysSick && myDaysSick > 365 && myDaysSick != 999) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Worker.DAYSICK_ERROR,
        errType: 'DAYSSICK_ERROR',
        error: "Day Sick (DAYSSICK) value must less than 365 otherwise 999",
        source: this._currentLine.DAYSSICK,
      });
      return false;
    }
    else {
      this._daysSick = myDaysSick;
      return true;
    }
  }

  _validateSalaryInt() {
    const salaryIntValues = [1, 3, 4];
    const mySalaryInt = this._currentLine.SALARYINT;

    if (isNaN(mySalaryInt)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Worker.SALARY_ERROR,
        errType: 'SALARYINT_ERROR',
        error: "Salary Int (SALARYINT) must be an integer",
        source: this._currentLine.SALARYINT,
      });
      return false;
    } else if (mySalaryInt && !salaryIntValues.includes(parseInt(mySalaryInt))) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Worker.SALARY_ERROR,
        errType: 'SALARYINT_ERROR',
        error: "Salary int (SALARYINT) value must 1(Annual Salary), 3(Hourly Rate) or 4(Unpaid)",
        source: this._currentLine.SALARYINT,
      });
      return false;
    }
    else {
      this._salaryInt = mySalaryInt;
      return true;
    }
  }

  _validateSalary() {
    const mySalary = this._currentLine.SALARY;
    const digitRegex = /^[0-9]{1,10}$/;

    if (mySalary && !digitRegex.test(mySalary)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Worker.SALARY_ERROR,
        errType: 'Salary_ERROR',
        error: "Salary (SALARY) are upto 12 digit ",
        source: this._currentLine.SALARY,
      });
      return false;
    }
    else {
      this._salary = mySalary;
      return true;
    }
  }

  _validateHourlyRate() {
    const myHourlyRate = this._currentLine.HOURLYRATE;

    if (myHourlyRate && !(myHourlyRate - Math.floor(myHourlyRate)) ) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Worker.HOURLY_RATE_ERROR,
        errType: 'Hourly_Rate_ERROR',
        error: "Hourly Rate (HOURLYRATE) must be Decimal number like 12.0 or 5.3",
        source: this._currentLine.HOURLYRATE,
      });
      return false;
    }
    else {
      this._hourlyRate = myHourlyRate;
      return true;
    }
  }

  _validateMainJobRole() {
    const mainJobRoleValues = [1, 2, 3, 4, 5, 6, 7,8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41];
    const myMainJobRole = this._currentLine.MAINJOBROLE;

    if (myMainJobRole && !mainJobRoleValues.includes(parseInt(myMainJobRole))) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Worker.MAIN_JOB_ROLE_ERROR,
        errType: 'Main_JobRole_ERROR',
        error: "Main Job Role (MAINJOBROLE) must be between 1- 41",
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

    if (myMainJobDesc.length >= MAX_LENGTH) {
        this._validationErrors.push({
          lineNumber: this._lineNumber,
          errCode: Worker.MAIN_JOB_DESC_ERROR,
          errType: `MAINJRDESC_ERROR`,
          error: `Main Job Description (MAINJRDESC) must be no more than ${MAX_LENGTH} characters`,
          source: this._currentLine.MAINJRDESC,
        });
        return false;
      } 
      else {
        this._mainJobDesc = myMainJobDesc;
        return true;
      }
  }

  _validateContHours() {
    const myContHours = this._currentLine.CONTHOURS;

    if (myContHours && !(myContHours - Math.floor(myContHours))  {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Worker.CONT_HOURS_ERROR,
        errType: 'CONTHOURS_ERROR',
        error: "Contract Hours (CONTHOURS) Number with decimal point to nearest half hour i.e. 6.0, 27.5 and less than 65",
        source: this._currentLine.CONTHOURS,
      });
      return false;
    }
    else {
      this._contHours = myContHours;
      return true;
    }
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
    status = !this._validateDisabled() ? false : status;
    status = !this._validateIndStatus() ? false : status;
    status = !this._validateIndDate() ? false : status;
    status = !this._validateCareCert() ? false : status;
    status = !this._validateCareCertDate() ? false : status;
    status = !this._validateRecSource() ? false : status;
    status = !this._validateStartDate() ? false : status;
    status = !this._validateStartInsect() ? false : status;
    status = !this._validateApprentice() ? false : status;
    status = !this._validateFullTime() ? false : status;
    status = !this._validateZeroHourContract() ? false : status;
    status = !this._validateDaysSick() ? false : status;
    status = !this._validateSalaryInt() ? false : status;
    status = !this._validateSalary() ? false : status;
    status = !this._validateHourlyRate() ? false : status;
    status = !this._validateMainJobRole() ? false : status;
    status = !this._validateMainJobDesc() ? false : status;
    status = !this._validateContHours() ? false : status;

    


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
