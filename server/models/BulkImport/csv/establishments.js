const BUDI = require('../BUDI').BUDI;

class Establishment {
  constructor(currentLine, lineNumber) {
    this._currentLine = currentLine;
    this._lineNumber = lineNumber;
    this._validationErrors = [];


    // CSV properties
    this._localId = null;
    this._status = null;
    this._name = null;
    this._address = null;
    this._postcode = null;
    this._email = null;
    this._phone = null;


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
    this._permCount = null;
    this._tempCount = null;
    this._poolCount = null;
    this._agencyCount = null;
    this._studentCount = null;
    this._voluntaryCount = null;
    this._otherCount = null;
    this._otherDescriptions = null;
    this._alljobs = null;
    this._vacancies = null;
    this._starters = null;
    this._leavers = null;
    this._totalVacancies = null;
    this._totalStarters = null;
    this._totalLeavers = null;
    this._reasonsForLeaving = null;
    this._destinationOnLeaving = null;

    //console.log(`WA DEBUG - current establishment (${this._lineNumber}:`, this._currentLine);
  };

  static get MAIN_SERVICE_ERROR() { return 1000; }
  static get LOCAL_ID_ERROR() { return 1010; }
  static get STATUS_ERROR() { return 1020; }
  static get NAME_ERROR() { return 1030; }
  static get ADDRESS_ERROR() { return 1040; }
  static get EMAIL_ERROR() { return 1050; }
  static get PHONE_ERROR() { return 1060; }
  static get ESTABLISHMENT_TYPE_ERROR() { return 1070; }
  static get SHARE_WITH_CQC_ERROR() { return 1070; }
  static get SHARE_WITH_LA_ERROR() { return 1080; }
  static get LOCAL_AUTHORITIES_ERROR() { return 1090; }
  static get REGTYPE_ERROR() { return 1100; }
  static get PROV_ID_ERROR() { return 1105; }
  static get LOCATION_ID_ERROR() { return 1110; }
  static get ALL_SERVICES_ERROR() { return 1120; }
  static get SERVICE_USERS_ERROR() { return 1130; }
  static get CAPACITY_UTILISATION_USERS_ERROR() { return 1140; }

  static get TOTAL_PERM_TEMP_ERROR() { return 1200; }
  static get PERM_COUNT_ERROR() { return 1210; }
  static get TEMP_COUNT_ERROR() { return 1220; }
  static get POOL_COUNT_ERROR() { return 1230; }
  static get AGENCY_COUNT_ERROR() { return 1240; }
  static get STUDENT_COUNT_ERROR() { return 1250; }
  static get VOLUNATRY_COUNT_ERROR() { return 1260; }
  static get OTHER_COUNT_ERROR() { return 1270; }
  static get ALL_JOBS_ERROR() { return 1280; }
  static get VACANCIES_ERROR() { return 1300; }
  static get STARTERS_ERROR() { return 1310; }
  static get LEAVERS_ERROR() { return 1320; }
  static get TOTAL_VACANCIES_ERROR() { return 1330; }
  static get TOTAL_STARTERS_ERROR() { return 1340; }
  static get TOTAL_LEAVERS_ERROR() { return 1350; }

  static get REASONS_FOR_LEAVING_ERROR() { return 1360; }
  static get DESTINATIONS_ON_LEAVING_ERROR() { return 1370; }

  get localId() {
    return this._localId;
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
  get poostcode() {
    return this._postcode;
  }
  get email() {
    return this._email;
  }
  get phone() {
    return this._phone;
  }

  get establishmentType() {
    return this._establishmentType;
  }
  get establishmentTypeOther() {
    return this._establishmentTypeOther;
  }

  get mainService() {
    return this._mainService;
  }
  get alLServices() {
    return this._allServices;
  }
  get alLServicesOther() {
    return this._allServicesOther;
  }
  get alLServiceUsers() {
    return this._allServiceUsers;
  }
  get alLServiceUsersOther() {
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
  get localAuthorities() {
    return this._localAuthorities;
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
  get permCount() {
    return this._permCount;
  }
  get tempCount() {
    return this._tempCount;
  }
  get poolCount() {
    return this._poolCount;
  }
  get agencyCount() {
    return this._agencyCount;
  }
  get studentCount() {
    return this._studentCount;
  }
  get voluntaryCount() {
    return this._voluntaryCount;
  }
  get otherCount() {
    return this._otherCount;
  }
  get otherDescriptions() {
    return this._otherDescriptions;
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
  get totalVacancies() {
    return this._totalVacancies;
  }
  get totalStarters() {
    return this._totalStarters;
  }
  get totalLeavers() {
    return this._totalLeavers;
  }
  get reasonsForLeaving() {
    return this._reasonsForLeaving;
  }
  get destinationOnLeaving() {
    return this._destinationOnLeaving;
  }

  _validateLocalisedId() {
    const myLocalId = this._currentLine.LOCALESTID;

    // must be present and n more than 50 characters
    const MAX_LENGTH = 50;

    if (!myLocalId || myLocalId.length == 0) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.LOCAL_ID_ERROR,
        errType: `LOCAL_ID_ERROR`,
        error: "Local Identifier must be defined",
        source: this._currentLine.LOCALESTID,
      });
      return false;
    } else if (myLocalId.length >= MAX_LENGTH) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.LOCAL_ID_ERROR,
        errType: `LOCAL_ID_ERROR`,
        error: `Local Identifier (LOCALESTID) must be no more than ${MAX_LENGTH} characters`,
        source: myLocalId,
      });
      return false;      
    } else {
      this._localId = myLocalId;
      return true;
    }
  }

  _validateStatus() {
    const statusValues = ['DELETE', 'UPDATE', 'UNCHECKED', 'NOCHANGE', 'NEW'];
    const myStatus = this._currentLine.STATUS ? this._currentLine.STATUS.toUpperCase() : this._currentLine.STATUS;

    // must be present and must be one of the preset values (case insensitive)
    if (!statusValues.includes(myStatus)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.STATUS_ERROR,
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

  _validateEstablishmentName() {
    const myName = this._currentLine.ESTNAME;

    // must be present and no more than 120 characters
    const MAX_LENGTH = 120;

    if (!myName || myName.length == 0) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.NAME_ERROR,
        errType: `NAME_ERROR`,
        error: 'Establishment Name (ESTNAME) must be defined',
        source: myName,
      });
      return false;
    } else if (myName.length > MAX_LENGTH) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.NAME_ERROR,
        errType: `NAME_ERROR`,
        error: `Establishment Name (ESTNAME) must be no more than ${MAX_LENGTH} characters`,
        source: myName,
      });
      return false;
    } else {
      this._name = myName;
      return true;
    }
  }

  _validateAddress() {
    const myAddress1 = this._currentLine.ADDRESS1;
    const myAddress2 = this._currentLine.ADDRESS2;
    const myAddress3 = this._currentLine.ADDRESS3;
    const myTown = this._currentLine.POSTTOWN;
    const myPostcode = this._currentLine.POSTCODE;

    // TODO - if town is empty, match against PAF
    // TODO - validate postcode against PAF

    // adddress 1 is mandatory and no more than 40 characters
    const MAX_LENGTH = 40;

    const localValidationErrors = [];
    if (!myAddress1 || myAddress1.length == 0) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.ADDRESS_ERROR,
        errType: `ADDRESS_ERROR`,
        error: 'First line of address (ADDRESS1) must be defined',
        source: myAddress1,
      });
    } else if (myAddress1.length > MAX_LENGTH) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.ADDRESS_ERROR,
        errType: `ADDRESS_ERROR`,
        error: `First line of address (ADDRESS1) must be no more than ${MAX_LENGTH} characters`,
        source: myAddress1,
      });
    }

    if (myAddress2 && myAddress2.length > MAX_LENGTH) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.ADDRESS_ERROR,
        errType: `ADDRESS_ERROR`,
        error: `Second line of address (ADDRESS2) must be no more than ${MAX_LENGTH} characters`,
        source: myAddress2,
      });
    }

    if (myAddress3 && myAddress3.length > MAX_LENGTH) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.ADDRESS_ERROR,
        errType: `ADDRESS_ERROR`,
        error: `Third line of address (ADDRESS3) must be no more than ${MAX_LENGTH} characters`,
        source: myAddress3,
      });
    }

    if (myTown && myTown.length > MAX_LENGTH) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.ADDRESS_ERROR,
        errType: `ADDRESS_ERROR`,
        error: `{Post town} (POSTTOWN) must be no more than ${MAX_LENGTH} characters`,
        source: myTown,
      });
    }

    // TODO - registration/establishment APIs do not validate postcode (relies on the frontend - this must be fixed)
    const postcodeRegex = /^[A-Za-z]{1,2}[0-9]{1,2}\s{1}[0-9][A-Za-z]{2}$/;
    const POSTCODE_MAX_LENGTH = 40;
    if (!myPostcode || myPostcode.length == 0) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.ADDRESS_ERROR,
        errType: `ADDRESS_ERROR`,
        error: 'Postcode (POSTCODE) must be defined',
        source: myPostcode,
      });
    } else if (myPostcode.length > POSTCODE_MAX_LENGTH) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.ADDRESS_ERROR,
        errType: `ADDRESS_ERROR`,
        error: `Postcode (POSTCODE) must be no more than ${POSTCODE_MAX_LENGTH} characters`,
        source: myPostcode,
      });
    } else if (!postcodeRegex.test(myPostcode)) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.ADDRESS_ERROR,
        errType: `ADDRESS_ERROR`,
        error: `Postcode (POSTCODE) unexpected format`,
        source: myPostcode,
      });
    }

    if (localValidationErrors.length > 0) {
      localValidationErrors.forEach(thisValidation => this._validationErrors.push(thisValidation));;
      return false;
    }

    // concatenate the address
    this._address = myAddress1;
    this._address = myAddress2 ? `${this._address}, ${myAddress2}` : this._address;
    this._address = myAddress3 ? `${this._address}, ${myAddress3}` : this._address;
    this._address = myTown ? `${this._address}, ${myTown}` : this._address;
    this._postcode = myPostcode;

    return true;
  }


  // NOTE - establishment does not have email address (a user has email address)
  _validateEmail() {
    const myEmail = this._currentLine.EMAIL;

    // optional, but if present  no more than 240 characters
    const MAX_LENGTH = 240;

    // could validate the email address using a regux - but we're not using it anyway!!!

    if (myEmail && myEmail.length > MAX_LENGTH) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.EMAIL_ERROR,
        errType: `EMAIL_ERROR`,
        error: `Email (EMAIL) must be no more than ${MAX_LENGTH} characters`,
        source: myEmail,
      });
      return false;
    } else {
      this._email = myEmail;
      return true;
    }
  }
  _validatePhone() {
    const myPhone = this._currentLine.PHONE;

    // optional, but if present no more than 50 characters
    const MAX_LENGTH = 50;

    if (myPhone && myPhone.length > MAX_LENGTH) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.PHONE_ERROR,
        errType: `PHONE_ERROR`,
        error: `Phone (PHONE) must be no more than ${MAX_LENGTH} characters`,
        source: myPhone,
      });
      return false;
    } else {
      this._phone = myPhone;
      return true;
    }
  }
  
  _validateEstablishmentType() {
    const myEstablishmentType = parseInt(this._currentLine.ESTTYPE);
    const myOtherEstablishmentType = this._currentLine.OTHERTYPE;

    const localValidationErrors = [];
    if (Number.isNaN(myEstablishmentType)) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.ESTABLISHMENT_TYPE_ERROR,
        errType: `ESTABLISHMENT_TYPE_ERROR`,
        error: "Establishment Type (ESTTYPE) must be an integer",
        source: this._currentLine.ESTTYPE,
      });
    } else if (myEstablishmentType < 1 || myEstablishmentType > 8) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.ESTABLISHMENT_TYPE_ERROR,
        errType: `ESTABLISHMENT_TYPE_ERROR`,
        error: "Establishment Type (ESTTYPE) between 1 and 8 only",
        source: this._currentLine.ESTTYPE,
      });
    }

    // if the establishment type is "other" (8), then OTHERTYPE must be defined
    const MAX_LENGTH = 240;
    if (myEstablishmentType == 8 && (!myOtherEstablishmentType || myOtherEstablishmentType.length == 0)) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.ESTABLISHMENT_TYPE_ERROR,
        errType: `ESTABLISHMENT_TYPE_ERROR`,
        error: `Establishment Type (ESTTYPE) is 'Other (8)'; must define the Other (OTHERTYPE)`,
        source: myOtherEstablishmentType,
      });
    } else if (myEstablishmentType == 8 && (myOtherEstablishmentType.length > MAX_LENGTH)) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.ESTABLISHMENT_TYPE_ERROR,
        errType: `ESTABLISHMENT_TYPE_ERROR`,
        error: `Establishment Type (ESTTYPE) is 'Other (8)', but OTHERTYPE must be no more than ${MAX_LENGTH} characters`,
        source: myOtherEstablishmentType,
      });
    } else if (myEstablishmentType == 8) {
      this._establishmentTypeOther = myOtherEstablishmentType;
    }

    if (localValidationErrors.length > 0) {
      localValidationErrors.forEach(thisValidation => this._validationErrors.push(thisValidation));;
      return false;
    }

    this._establishmentType = myEstablishmentType;
    return true;
  }

  _validateShareWithCQC() {
    const ALLOWED_VALUES = [0,1];
    const myShareWithCqc = parseInt(this._currentLine.PERMCQC);
    if (Number.isNaN(myShareWithCqc)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.SHARE_WITH_CQC_ERROR,
        errType: `SHARE_WITH_CQC_ERROR`,
        error: "Share with CQC (PERMCQC) must be an integer",
        source: this._currentLine.PERMCQC,
      });
      return false;
    } else if (!ALLOWED_VALUES.includes(myShareWithCqc)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.SHARE_WITH_CQC_ERROR,
        errType: `SHARE_WITH_CQC_ERROR`,
        error: "Share with CQC (PERMCQC) must be 0 or 1",
        source: myShareWithCqc,
      });
      return false;
    } else {
      this._shareWithCqc = myShareWithCqc;
      return true;
    }
  }

  _validateShareWithLA() {
    const ALLOWED_VALUES = [0,1];
    const myShareWithLa = parseInt(this._currentLine.PERMLA);
    if (Number.isNaN(myShareWithLa)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.SHARE_WITH_LA_ERROR,
        errType: `SHARE_WITH_LA_ERROR`,
        error: "Share with LA (PERMLA) must be an integer",
        source: this._currentLine.PERMLA,
      });
      return false;
    } else if (!ALLOWED_VALUES.includes(myShareWithLa)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.SHARE_WITH_LA_ERROR,
        errType: `SHARE_WITH_LA_ERROR`,
        error: "Share with LA (PERMLA) must be 0 or 1",
        source: myShareWithLa,
      });
      return false;
    } else {
      this._shareWithLA = myShareWithLa;
      return true;
    }
  }

  _validateLocalAuthorities() {
    // local authorities is optional or is a semi colon delimited list of integers
    if (this._currentLine.SHARELA && this._currentLine.SHARELA.length > 0) {
      const listOfLAs = this._currentLine.SHARELA.split(';');
      const isValid = listOfLAs.every(thisLA => !Number.isNaN(parseInt(thisLA)));

      if (!isValid) {
        this._validationErrors.push({
          lineNumber: this._lineNumber,
          errCode: Establishment.LOCAL_AUTHORITIES_ERROR,
          errType: `LOCAL_AUTHORITIES_ERROR`,
          error: "Local Authorities (SHARELA) must be a semi-colon delimited list of integers",
          source: this._currentLine.SHARELA,
        });
        return false;
      } else {
        this._localAuthorities = listOfLAs.map(thisLA => parseInt(thisLA, 10));
        return true;
      }
  
    } else {
      return true;
    }
  }

  _validateRegType() {
    const myRegType = parseInt(this._currentLine.REGTYPE, 10);
    if (Number.isNaN(myRegType) || myRegType < 0 || myRegType > 2) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.REGTYPE_ERROR,
        errType: `REGTYPE_ERROR`,
        error: "Registration Type (REGTYPE) must be given and must be either 0, 1 or 2",
        source: myprovID,
      });
      return false;
    } else {
      this._regType = myRegType;
      return true;
    }
  }

  _validateProvID() {
    // must be given if "REGTYPE" is 2 - but if given must be in the format "n-nnnnnnnnn"
    const provIDRegex = /^[0-9]{1}\-[0-9]{8}$/;
    const myprovID = this._currentLine.PROVNUM;
    if (this._regType && this._regType == 2 && (!myprovID || myprovID.length==0)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.PROV_ID_ERROR,
        errType: `PROV_ID_ERROR`,
        error: "Prov ID (PROVNUM) must be given as this workplace is CQC regulated",
        source: myprovID,
      });
      return false;
    }
    else if (this._regType  && this._regType == 2 && !provIDRegex.test(myprovID)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.PROV_ID_ERROR,
        errType: `PROV_ID_ERROR`,
        error: "Prov ID (PROVNUM) must be in the format 'n-nnnnnnnnn'",
        source: myprovID,
      });
      return false;
    } else if (this._regType) {
      this._provID = myprovID;
      return true;
    }
  }

  _validateLocationID() {
    // must be given if "share with CQC" - but if given must be in the format "n-nnnnnnnnn"
    const locationIDRegex = /^[0-9]{1}-[0-9]{8}$/;
    const myLocationID = this._currentLine.PROVNUM;

    if (this._regType  && this._regType == 2 && (!myLocationID || myLocationID.length==0)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.LOCATION_ID_ERROR,
        errType: `LOCATION_ID_ERROR`,
        error: "Location ID (PROVNUM) must be given as this workplace is CQC regulated",
        source: myLocationID,
      });
      return false;
    }
    else if (this._regType && this._regType == 2 && !locationIDRegex.test(myLocationID)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.LOCATION_ID_ERROR,
        errType: `LOCATION_ID_ERROR`,
        error: "Location ID (PROVNUM) must be in the format 'n-nnnnnnnnn'",
        source: myLocationID,
      });
      return false;
    } else if (this._regType) {
      this._locationID = myLocationID;
      return true;
    }
  }

  _validateMainService() {
    const myMainService = parseInt(this._currentLine.MAINSERVICE);
    if (Number.isNaN(myMainService)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.MAIN_SERVICE_ERROR,
        errType: `MAIN_SERVICE_ERROR`,
        error: "Main Service (MAINSERVICE) must be an integer",
        source: this._currentLine.MAINSERVICE,
      });
      return false;
    } else {
      this._mainService = myMainService;
      return true;
    }
  }

  
  _validateAllServices() {
    // all services must have at least one value (main service) or a semi colon delimited list of integers; treat consistently as a list of
    const myAllServices = this._currentLine.ALLSERVICES;
    if (!myAllServices || myAllServices.length == 0) {    
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.ALL_SERVICES_ERROR,
        errType: `ALL_SERVICES_ERROR`,
        error: "All Services (ALLSERVICES) must be defined and must include at least the main service (MAINSERVICE)",
        source: this._currentLine.ALLSERVICES,
      });

      return false; // no point continuing validation because all services is empty
    }

    // all services and their service descriptions are semi-colon delimited

    const listOfServices = this._currentLine.ALLSERVICES.split(';');
    const listOfServiceDescriptions = this._currentLine.SERVICEDESC.split(';');

    const localValidationErrors = [];
    const isValid = listOfServices.every(thisService => !Number.isNaN(parseInt(thisService)));
    if (!isValid) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.ALL_SERVICES_ERROR,
        errType: `ALL_SERVICES_ERROR`,
        error: "All Services (ALLSERVICES) must be a semi-colon delimited list of integers",
        source: this._currentLine.ALLSERVICES,
      });
    } else if (listOfServices.length != listOfServiceDescriptions.length) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.ALL_SERVICES_ERROR,
        errType: `ALL_SERVICES_ERROR`,
        error: "All Services (ALLSERVICES) count and Service Description (SERVICEDESC) count must equal",
        source: this._currentLine.SERVICEDESC,
      });
    } else {
      const myServiceDescriptions = [];
      this._allServices = listOfServices.map((thisService, index) => {
        const thisServiceIndex = parseInt(thisService, 10);

        // if the service is one of the many "other" type of services, then need to validate the "other description"
        const otherServices = [5, 7, 12, 21, 52, 71, 72, 75];   // these are the original budi codes
        const MAX_LENGTH = 120;
        if (otherServices.includes(thisServiceIndex)) {
          const myServiceOther = listOfServiceDescriptions[index];
          if (!myServiceOther || myServiceOther.length == 0) {
            localValidationErrors.push({
              lineNumber: this._lineNumber,
              errCode: Establishment.ALL_SERVICES_ERROR,
              errType: `ALL_SERVICES_ERROR`,
              error: `All Services (ALLSERVICES:${index+1}) is an 'other' service and consequently (SERVICEDESC:${index+1}) must be defined`,
              source: `${this._currentLine.SERVICEDESC} - ${listOfServiceDescriptions[index]}`,
            });
            myServiceDescriptions.push(null);
          } else if (myServiceOther.length > MAX_LENGTH) {
            localValidationErrors.push({
              lineNumber: this._lineNumber,
              errCode: Establishment.ALL_SERVICES_ERROR,
              errType: `ALL_SERVICES_ERROR`,
              error: `All Services (ALLSERVICES:${index+1}) is an 'other' service and (SERVICEDESC:${index+1}) must not be greater than ${MAX_LENGTH} characters`,
              source: `${this._currentLine.SERVICEDESC} - ${listOfServiceDescriptions[index]}`,
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
      localValidationErrors.forEach(thisValidation => this._validationErrors.push(thisValidation));;
      return false;
    }

    return true;
  }

  _validateServiceUsers() {
    // service user (optional) is a semi colon delimited list of integers

    const listOfServiceUsers = this._currentLine.SERVICEUSERS.split(';');
    const listOfServiceUsersDescriptions = this._currentLine.OTHERUSERDESC.split(';');

    const localValidationErrors = [];
    const isValid = listOfServiceUsers.every(thisService => !Number.isNaN(parseInt(thisService)));
    if (!isValid) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.SERVICE_USERS_ERROR,
        errType: `SERVICE_USERS_ERROR`,
        error: "Service Users (SERVICEUSERS) must be a semi-colon delimited list of integers",
        source: this._currentLine.SERVICEUSERS,
      });
    } else if (listOfServiceUsers.length != listOfServiceUsersDescriptions.length) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.SERVICE_USERS_ERROR,
        errType: `SERVICE_USERS_ERROR`,
        error: "Service Users (SERVICEUSERS) count and Service Users Description (OTHERUSERDESC) count must equal",
        source: `${this._currentLine.SERVICEUSERS} - ${this._currentLine.OTHERUSERDESC}`,
      });
    } else {
      const myServiceUsersDescriptions = [];
      this._allServiceUsers = listOfServiceUsers.map((thisService, index) => {
        const thisServiceIndex = parseInt(thisService, 10);

        // if the service user is one of the many "other" type of services, then need to validate the "other description"
        const otherServiceUsers = [9, 21, 45];   // these are the original budi codes
        if (otherServiceUsers.includes(thisServiceIndex)) {
          const myServiceUserOther = listOfServiceUsersDescriptions[index];
          const MAX_LENGTH = 120;
          if (!myServiceUserOther || myServiceUserOther.length == 0) {
            localValidationErrors.push({
              lineNumber: this._lineNumber,
              errCode: Establishment.SERVICE_USERS_ERROR,
              errType: `SERVICE_USERS_ERROR`,
              error: `Service Users (SERVICEUSERS:${index+1}) is an 'other' service and consequently (OTHERUSERDESC:${index+1}) must be defined`,
              source: `${this._currentLine.SERVICEDESC} - ${listOfServiceUsersDescriptions[index]}`,
            });
            myServiceUsersDescriptions.push(null);
          } else if (myServiceUserOther.length > MAX_LENGTH) {
            localValidationErrors.push({
              lineNumber: this._lineNumber,
              errCode: Establishment.SERVICE_USERS_ERROR,
              errType: `SERVICE_USERS_ERROR`,
              error: `Service Users (SERVICEUSERS:${index+1}) is an 'other' service and (OTHERUSERDESC:${index+1}) must not be greater than ${MAX_LENGTH} characters`,
              source: `${this._currentLine.SERVICEDESC} - ${listOfServiceUsersDescriptions[index]}`,
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

    if (localValidationErrors.length > 0) {
      localValidationErrors.forEach(thisValidation => this._validationErrors.push(thisValidation));;
      return false;
    }

    return true;
  }

  _validateCapacitiesAndUtilisations() {
    // capacities/utilisations are a semi colon delimited list of integers

    const listOfCapacities = this._currentLine.CAPACITY.split(';');
    const listOfUtilisations = this._currentLine.UTILISATION.split(';');

    const localValidationErrors = [];

    // first - the number of capacities/utilisations must be non-zero and must be equal
    if (listOfCapacities.length === 0) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.CAPACITY_UTILISATION_USERS_ERROR,
        errType: `CAPACITY_UTILISATION_USERS_ERROR`,
        error: "Capacities (CAPACITY) must be a semi-colon delimited list of integers",
        source: this._currentLine.CAPACITY,
      });
    }
    if (listOfUtilisations.length === 0) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.CAPACITY_UTILISATION_USERS_ERROR,
        errType: `CAPACITY_UTILISATION_USERS_ERROR`,
        error: "Utilisations (UTILISATION) must be a semi-colon delimited list of integers",
        source: this._currentLine.UTILISATION,
      });
    }
    if (listOfCapacities.length != listOfUtilisations.length) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.CAPACITY_UTILISATION_USERS_ERROR,
        errType: `CAPACITY_UTILISATION_USERS_ERROR`,
        error: "Number of Capacities (CAPACITY) and Utilisations (UTILISATION) must be equal",
        source: `${this._currentLine.CAPACITY} - ${this._currentLine.UTILISATION}`,
      });
    }

    // and the number of utilisations/capacities must equal the number of all services
    if (listOfCapacities.length !== this._allServices.length) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.CAPACITY_UTILISATION_USERS_ERROR,
        errType: `CAPACITY_UTILISATION_USERS_ERROR`,
        error: "Number of Capacities/Utilisations (CAPACITY/UTILISATION) must equal the number of all services (ALLSERVICES)",
        source: `${this._currentLine.CAPACITY} - ${this._currentLine.UTILISATION} - ${this._currentLine.ALLSERVICES}`,
      });
    }

    // all capacities and all utilisations are integers (if given)
    const areCapacitiesValid = listOfCapacities.every(thisCapacity => thisCapacity === null || thisCapacity.length==0 ? true : !Number.isNaN(parseInt(thisCapacity)));
    if (!areCapacitiesValid) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.CAPACITY_UTILISATION_USERS_ERROR,
        errType: `CAPACITY_UTILISATION_USERS_ERROR`,
        error: "All capacities (CAPACITY) must be integers",
        source: this._currentLine.CAPACITY,
      });
    }
    const areUtilisationsValid = listOfUtilisations.every(thisUtilisation => thisUtilisation === null || thisUtilisation.length==0 ? true : !Number.isNaN(parseInt(thisUtilisation)));
    if (!areUtilisationsValid) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.CAPACITY_UTILISATION_USERS_ERROR,
        errType: `CAPACITY_UTILISATION_USERS_ERROR`,
        error: "All utilisations (UTILISATION) must be integers",
        source: this._currentLine.UTILISATION,
      });
    }
    
    if (localValidationErrors.length > 0) {
      localValidationErrors.forEach(thisValidation => this._validationErrors.push(thisValidation));;
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

  _validateTotalPermTemp() {
    // mandatory
    const myTotalPermTemp = parseInt(this._currentLine.TOTALPERMTEMP);

    if (Number.isNaN(myTotalPermTemp)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.TOTAL_PERM_TEMP_ERROR,
        errType: `TOTAL_PERM_TEMP_ERROR`,
        error: "Total Permanent and Temporary (TOTALPERMTEMP) must be an integer",
        source: this._currentLine.PERMCQC,
      });
      return false;
    } else if (myTotalPermTemp < 0) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.TOTAL_PERM_TEMP_ERROR,
        errType: `TOTAL_PERM_TEMP_ERROR`,
        error: "Total Permanent and Temporary (TOTALPERMTEMP) must be 0 or more",
        source: myShareWithCqc,
      });
      return false;
    } else {
      this._totalPermTemp = myTotalPermTemp;
      return true;
    }
  }

  _validateAllJobs() {
    // mandatory
    const allJobs = this._currentLine.ALLJOBROLES.split(';');

    const localValidationErrors = [];

    // allJobs can only be empty, if TOTALPERMTEMP is 0
    if (this._totalPermTemp > 0 && this._currentLine.ALLJOBROLES.length === 0) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.ALL_JOBS_ERROR,
        errType: `ALL_JOBS_ERROR`,
        error: "All Job Roles (ALLJOBROLES) must be defined",
        source: this._currentLine.ALLJOBROLES,
      });
    } else if (this._totalPermTemp > 0) {
      // must have at least one job role
      if (allJobs.length < 1) {
        localValidationErrors.push({
          lineNumber: this._lineNumber,
          errCode: Establishment.ALL_JOBS_ERROR,
          errType: `ALL_JOBS_ERROR`,
          error: "All Job Roles (ALLJOBROLES) must be defined",
          source: this._currentLine.ALLJOBROLES,
        });
      }
      // all jobs are integers
      const isValid = allJobs.every(thisJob => !Number.isNaN(parseInt(thisJob)));
      if (!isValid) {
        localValidationErrors.push({
          lineNumber: this._lineNumber,
          errCode: Establishment.ALL_JOBS_ERROR,
          errType: `ALL_JOBS_ERROR`,
          error: "All Job Roles (ALLJOBROLES)  must be integers",
          source: this._currentLine.ALLJOBROLES,
        });
      }
    }

    if (localValidationErrors.length > 0) {
      localValidationErrors.forEach(thisValidation => this._validationErrors.push(thisValidation));;
      return false;
    }

    this._alljobs = allJobs.map(thisJob => parseInt(thisJob, 10));

    return true;
  }

  // includes perm, temp, pool, agency, student, voluntary and other counts
  // includes vacancies, starters and leavers, total vacancies, total starters and total leavers
  _validateJobRoleTotals() {
    // mandatory
    const permCount = this._currentLine.PERMCOUNT.split(';');
    const tempCount = this._currentLine.TEMPCOUNT.split(';');
    const poolCount = this._currentLine.POOLCOUNT.split(';');
    const agencyCount = this._currentLine.AGENCYCOUNT.split(';');
    const studentCount = this._currentLine.STUDENTCOUNT.split(';');
    const voluntaryCount = this._currentLine.VOLUNTARYCOUNT.split(';');
    const otherCount = this._currentLine.OTHERCOUNT.split(';');
    const otherDescriptions = this._currentLine.OTHERDESC.split(';');

    const vacancies = this._currentLine.VACANCIES.split(';');
    const starters = this._currentLine.STARTERS.split(';');
    const leavers = this._currentLine.LEAVERS.split(';');

    const totalVacancies = this._currentLine.TOTALVACANCIES === 'NK' ? -1 : parseInt(this._currentLine.TOTALVACANCIES);
    const totalStarters = this._currentLine.TOTALSTARTERS === 'NK' ? -1 : parseInt(this._currentLine.TOTALSTARTERS);
    const totalLeavers = this._currentLine.TOTALLEAVERS === 'NK' ? -1 : parseInt(this._currentLine.TOTALLEAVERS);

    const localValidationErrors = [];
    const allJobsCount = this._alljobs.length;

    // all counts must have the same number of entries as all job roles
    if (permCount.length !== allJobsCount) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.PERM_COUNT_ERROR,
        errType: `PERM_COUNT_ERROR`,
        error: "Permanent Count (PERMCOUNT) does not correlate to All Job Roles (ALLJOBROLES); must have same number of semi colon delimited values",
        source: `${this._currentLine.PERMCOUNT} - ${this._currentLine.ALLJOBROLES}`,
      });
    }
    if (tempCount.length !== allJobsCount) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.TEMP_COUNT_ERROR,
        errType: `TEMP_COUNT_ERROR`,
        error: "Temporary Count (TEMPCOUNT) does not correlate to All Job Roles (ALLJOBROLES); must have same number of semi colon delimited values",
        source: `${this._currentLine.TEMPCOUNT} - ${this._currentLine.ALLJOBROLES}`,
      });
    }
    if (poolCount.length !== allJobsCount) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.POOL_COUNT_ERROR,
        errType: `POOL_COUNT_ERROR`,
        error: "Pool Count (POOLCOUNT) does not correlate to All Job Roles (ALLJOBROLES); must have same number of semi colon delimited values",
        source: `${this._currentLine.POOLCOUNT} - ${this._currentLine.ALLJOBROLES}`,
      });
    }
    if (agencyCount.length !== allJobsCount) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.AGENCY_COUNT_ERROR,
        errType: `AGENCY_COUNT_ERROR`,
        error: "Agency Count (AGENCYCOUNT) does not correlate to All Job Roles (ALLJOBROLES); must have same number of semi colon delimited values",
        source: `${this._currentLine.AGENCYCOUNT} - ${this._currentLine.ALLJOBROLES}`,
      });
    }
    if (studentCount.length !== allJobsCount) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.STUDENT_COUNT_ERROR,
        errType: `STUDENT_COUNT_ERROR`,
        error: "Student Count (STUDENTCOUNT) does not correlate to All Job Roles (ALLJOBROLES); must have same number of semi colon delimited values",
        source: `${this._currentLine.STUDENTCOUNT} - ${this._currentLine.ALLJOBROLES}`,
      });
    }
    if (voluntaryCount.length !== allJobsCount) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.VOLUNATRY_COUNT_ERROR,
        errType: `VOLUNATRY_COUNT_ERROR`,
        error: "Voluntary Count (VOLUNTARYCOUNT) does not correlate to All Job Roles (ALLJOBROLES); must have same number of semi colon delimited values",
        source: `${this._currentLine.VOLUNTARYCOUNT} - ${this._currentLine.ALLJOBROLES}`,
      });
    }
    if (otherCount.length !== allJobsCount) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.OTHER_COUNT_ERROR,
        errType: `OTHER_COUNT_ERROR`,
        error: "Other Count (OTHERCOUNT) does not correlate to All Job Roles (ALLJOBROLES); must have same number of semi colon delimited values",
        source: `${this._currentLine.OTHERCOUNT} - ${this._currentLine.ALLJOBROLES}`,
      });
    }
    if (otherDescriptions.length !== allJobsCount) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.OTHER_COUNT_ERROR,
        errType: `OTHER_COUNT_ERROR`,
        error: "Other Descriptions (OTHERDESC) does not correlate to All Job Roles (ALLJOBROLES); must have same number of semi colon delimited values",
        source: `${this._currentLine.OTHERDESC} - ${this._currentLine.ALLJOBROLES}`,
      });
    }

    if (vacancies.length !== allJobsCount) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.VACANCIES_ERROR,
        errType: `VACANCIES_ERROR`,
        error: "Vacancies (VACANCIES) does not correlate to All Job Roles (ALLJOBROLES); must have same number of semi colon delimited values",
        source: `${this._currentLine.VACANCIES} - ${this._currentLine.ALLJOBROLES}`,
      });
    }
    if (starters.length !== allJobsCount) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.STARTERS_ERROR,
        errType: `STARTERS_ERROR`,
        error: "Starters (STARTERS) does not correlate to All Job Roles (ALLJOBROLES); must have same number of semi colon delimited values",
        source: `${this._currentLine.STARTERS} - ${this._currentLine.ALLJOBROLES}`,
      });
    }
    if (leavers.length !== allJobsCount) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.LEAVERS_ERROR,
        errType: `LEAVERS_ERROR`,
        error: "Leavers (LEAVERS) does not correlate to All Job Roles (ALLJOBROLES); must have same number of semi colon delimited values",
        source: `${this._currentLine.LEAVERS} - ${this._currentLine.ALLJOBROLES}`,
      });
    }

    // all counts must be integers and greater than/equal to zero
    const MIN_COUNT = 0;
    if (!permCount.every(thisCount => !Number.isNaN(parseInt(thisCount)) || parseInt(thisCount) < MIN_COUNT)) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.PERM_COUNT_ERROR,
        errType: `PERM_COUNT_ERROR`,
        error: `Permanent Count (PERMCOUNT) values must be integers and ${MIN_COUNT} or more`,
        source: `${this._currentLine.PERMCOUNT}`,
      });
    }
    if (!tempCount.every(thisCount => !Number.isNaN(parseInt(thisCount)) || parseInt(thisCount) < MIN_COUNT)) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.TEMP_COUNT_ERROR,
        errType: `TEMP_COUNT_ERROR`,
        error: `Temporary Count (TEMPCOUNT) values must be integers and ${MIN_COUNT} or more`,
        source: `${this._currentLine.TEMPCOUNT}`,
      });
    }
    if (!poolCount.every(thisCount => !Number.isNaN(parseInt(thisCount)) || parseInt(thisCount) < MIN_COUNT)) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.POOL_COUNT_ERROR,
        errType: `POOL_COUNT_ERROR`,
        error: `Pool Count (POOLCOUNT) values must be integers and ${MIN_COUNT} or more`,
        source: `${this._currentLine.POOLCOUNT}`,
      });
    }
    if (!agencyCount.every(thisCount => !Number.isNaN(parseInt(thisCount)) || parseInt(thisCount) < MIN_COUNT)) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.AGENCY_COUNT_ERROR,
        errType: `AGENCY_COUNT_ERROR`,
        error: `Perm Count (AGENCYCOUNT) values must be integers and ${MIN_COUNT} or more`,
        source: `${this._currentLine.AGENCYCOUNT}`,
      });
    }
    if (!studentCount.every(thisCount => !Number.isNaN(parseInt(thisCount)) || parseInt(thisCount) < MIN_COUNT)) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.STUDENT_COUNT_ERROR,
        errType: `STUDENT_COUNT_ERROR`,
        error: `Student Count (STUDENTCOUNT) values must be integers and ${MIN_COUNT} or more`,
        source: `${this._currentLine.STUDENTCOUNT}`,
      });
    }
    if (!voluntaryCount.every(thisCount => !Number.isNaN(parseInt(thisCount)) || parseInt(thisCount) < MIN_COUNT)) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.VOLUNATRY_COUNT_ERROR,
        errType: `VOLUNATRY_COUNT_ERROR`,
        error: `Voluntary Count (VOLUNTARYCOUNT) values must be integers and ${MIN_COUNT} or more`,
        source: `${this._currentLine.VOLUNTARYCOUNT}`,
      });
    }
    if (!otherCount.every(thisCount => !Number.isNaN(parseInt(thisCount)) || parseInt(thisCount) < MIN_COUNT)) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.OTHER_COUNT_ERROR,
        errType: `OTHER_COUNT_ERROR`,
        error: `Other Count (OTHERCOUNT) values must be integers and ${MIN_COUNT} or more`,
        source: `${this._currentLine.OTHERCOUNT}`,
      });
    }
    if (!vacancies.every(thisCount => !Number.isNaN(parseInt(thisCount)) || parseInt(thisCount) < MIN_COUNT)) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.VACANCIES_ERROR,
        errType: `VACANCIES_ERROR`,
        error: `Vacancies (VACANCIES) values must be integers and ${MIN_COUNT} or more`,
        source: `${this._currentLine.VACANCIES}`,
      });
    }
    if (!starters.every(thisCount => !Number.isNaN(parseInt(thisCount)) || parseInt(thisCount) < MIN_COUNT)) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.STARTERS_ERROR,
        errType: `STARTERS_ERROR`,
        error: `Starters (STARTERS) values must be integers and ${MIN_COUNT} or more`,
        source: `${this._currentLine.STARTERS}`,
      });
    }
    if (!leavers.every(thisCount => !Number.isNaN(parseInt(thisCount)) || parseInt(thisCount) < MIN_COUNT)) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.LEAVERS_ERROR,
        errType: `LEAVERS_ERROR`,
        error: `Leavers (LEAVERS) values must be integers and ${MIN_COUNT} or more`,
        source: `${this._currentLine.LEAVERS}`,
      });
    }

    // totals - must be defined and must be an integer greater than/equal to -1 (-1 is don't know)
    const TOTAL_MIN = -1;
    if (Number.isNaN(totalVacancies) || totalVacancies < TOTAL_MIN) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.TOTAL_VACANCIES_ERROR,
        errType: `TOTAL_VACANCIES_ERROR`,
        error: `Total Vacancies (TOTALVACANCIES) must be an integer and ${TOTAL_MIN} or more`,
        source: this._currentLine.TOTALVACANCIES,
      });
    }
    if (Number.isNaN(totalStarters) || totalStarters < TOTAL_MIN) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.TOTAL_STARTERS_ERROR,
        errType: `TOTAL_STARTERS_ERROR`,
        error: `Total Starters (TOTALSTARTERS) must be an integer and ${TOTAL_MIN} or more`,
        source: this._currentLine.TOTALSTARTERS,
      });
    }
    if (Number.isNaN(totalLeavers) || totalLeavers < TOTAL_MIN) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.TOTAL_LEAVERS_ERROR,
        errType: `TOTAL_LEAVERS_ERROR`,
        error: `Total Leavers (TOTALLEAVERS) must be an integer and ${TOTAL_MIN} or more`,
        source: this._currentLine.TOTALLEAVERS,
      });
    }

    if (localValidationErrors.length > 0) {
      localValidationErrors.forEach(thisValidation => this._validationErrors.push(thisValidation));;
      return false;
    }

    this._permCount = permCount.map(thisCount => parseInt(thisCount, 10));
    this._tempCount = tempCount.map(thisCount => parseInt(thisCount, 10));
    this._poolCount = poolCount.map(thisCount => parseInt(thisCount, 10));
    this._agencyCount = agencyCount.map(thisCount => parseInt(thisCount, 10));
    this._studentCount = studentCount.map(thisCount => parseInt(thisCount, 10));
    this._voluntaryCount = voluntaryCount.map(thisCount => parseInt(thisCount, 10));
    this._otherCount = otherCount.map(thisCount => parseInt(thisCount, 10));
    this._otherDescriptions = otherDescriptions;

    this._vacancies = vacancies.map(thisCount => parseInt(thisCount, 10));
    this._starters = starters.map(thisCount => parseInt(thisCount, 10));
    this._leavers = leavers.map(thisCount => parseInt(thisCount, 10));

    // totals - must equal the sum on the per job role
    const sumOfVacancies = this._vacancies.reduce((total, thisCount) => total+thisCount);
    const sumOfStarters = this._starters.reduce((total, thisCount) => total+thisCount);
    const sumOfLeavers = this._leavers.reduce((total, thisCount) => total+thisCount);
    if (totalVacancies !== sumOfVacancies) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.TOTAL_VACANCIES_ERROR,
        errType: `TOTAL_VACANCIES_ERROR`,
        error: 'Total Vacancies (TOTALVACANCIES) is not equal to the sum of Vacancies by job role (VACANCIES)',
        source: `${this._currentLine.VACANCIES} - ${this._currentLine.TOTALVACANCIES}`,
      });
    }
    if (totalStarters !== sumOfStarters) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.TOTAL_STARTERS_ERROR,
        errType: `TOTAL_STARTERS_ERROR`,
        error: 'Total Starters (TOTALVACANCIES) is not equal to the sum of Starters by job role (STARTERS)',
        source: `${this._currentLine.STARTERS} - ${this._currentLine.TOTALSTARTERS}`,
      });
    }
    if (totalLeavers !== sumOfLeavers) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.TOTAL_LEAVERS_ERROR,
        errType: `TOTAL_LEAVERS_ERROR`,
        error: 'Total Leavers (TOTALVACANCIES) is not equal to the sum of Leavers by job role (LEAVERS)',
        source: `${this._currentLine.LEAVERS} - ${this._currentLine.TOTALLEAVERS}`,
      });
    }

    if (localValidationErrors.length > 0) {
      localValidationErrors.forEach(thisValidation => this._validationErrors.push(thisValidation));
      return false;
    }    

    this._totalVacancies = totalVacancies;
    this._totalStarters = totalStarters;
    this._totalLeavers = totalLeavers;

    return true;
  }

  _validateReasonsForLeaving() {
    // only if the sum of "LEAVERS" is greater than 0
    const sumOfLeavers = this._leavers ? this._leavers.reduce((total, thisCount) => total+thisCount) : 0;

    if (sumOfLeavers > 0) {
      const allReasons = this._currentLine.REASONS.split(';');
      const allReasonsCounts = this._currentLine.REASONNOS.split(';');

      const localValidationErrors = [];
  
      if (!allReasons || allReasons.length==0) {
        localValidationErrors.push({
          lineNumber: this._lineNumber,
          errCode: Establishment.REASONS_FOR_LEAVING_ERROR,
          errType: `REASONS_FOR_LEAVING_ERROR`,
          error: "Reasons for Leaving (REASONS) must be defined as a semi-colon delimited set of reasons",
          source: this._currentLine.REASONS,
        });
      }
      if (!allReasons.every(thisCount => !Number.isNaN(parseInt(thisCount)) || parseInt(thisCount) < MIN_COUNT)) {
        localValidationErrors.push({
          lineNumber: this._lineNumber,
          errCode: Establishment.REASONS_FOR_LEAVING_ERROR,
          errType: `REASONS_FOR_LEAVING_ERROR`,
          error: `Reasons for Leaving (REASONS) values must be integers`,
          source: `${this._currentLine.REASONS}`,
        });
      }

      if (!allReasonsCounts || allReasonsCounts.length==0) {
        localValidationErrors.push({
          lineNumber: this._lineNumber,
          errCode: Establishment.REASONS_FOR_LEAVING_ERROR,
          errType: `REASONS_FOR_LEAVING_ERROR`,
          error: "Reasons for Leaving Counts (REASONNOS) must be defined as a semi-colon delimited set of reasons",
          source: this._currentLine.REASONNOS,
        });
      }
      const MIN_COUNT = 0;
      if (!allReasonsCounts.every(thisCount => !Number.isNaN(parseInt(thisCount)) || parseInt(thisCount) < MIN_COUNT)) {
        localValidationErrors.push({
          lineNumber: this._lineNumber,
          errCode: Establishment.REASONS_FOR_LEAVING_ERROR,
          errType: `REASONS_FOR_LEAVING_ERROR`,
          error: `Reasons for Leaving Counts (REASONNOS) values must be integers and ${MIN_COUNT} or more`,
          source: `${this._currentLine.REASONNOS}`,
        });
      }

      // all reasons and all reasons counts must be equal in number
      if (allReasons.length != allReasonsCounts.length) {
        localValidationErrors.push({
          lineNumber: this._lineNumber,
          errCode: Establishment.REASONS_FOR_LEAVING_ERROR,
          errType: `REASONS_FOR_LEAVING_ERROR`,
          error: `Reasons for Leaving (REASON) and Reasons for Leaving Counts (REASONNOS) must have the same number of semi-colon delimited values`,
          source: `${this._currentLine.REASON} - ${this._currentLine.REASONNOS}`,
        });
      }

      // sum of  all reasons counts must equal the sum of leavers
      const sumOfReasonsCounts = allReasonsCounts.reduce((total, thisCount) => parseInt(total,10) + parseInt(thisCount,10));
      if (sumOfReasonsCounts != sumOfLeavers) {
        localValidationErrors.push({
          lineNumber: this._lineNumber,
          errCode: Establishment.REASONS_FOR_LEAVING_ERROR,
          errType: `REASONS_FOR_LEAVING_ERROR`,
          error: `Sum of Reasons for Leaving Counts (REASONNOS) must equal the sum of leavers (LEAVERS)`,
          source: `${this._currentLine.REASONNOS} (${sumOfReasonsCounts}) - ${this._currentLine.LEAVERS} (${sumOfLeavers})`,
        });
      }
  
      if (localValidationErrors.length > 0) {
        localValidationErrors.forEach(thisValidation => this._validationErrors.push(thisValidation));;
        return false;
      }
  
      this._reasonsForLeaving = allReasons.map((thisReason, index) => {
        return {
          id: parseInt(thisReason, 10),
          count: parseInt(allReasonsCounts[index])
        };
      });

      return true;
  
    } else {
      return true;
    }
  }

  _validateDestinationsOnLeaving() {
    // only if the sum of "LEAVERS" is greater than 0
    const sumOfLeavers = this._leavers ? this._leavers.reduce((total, thisCount) => total+thisCount) : 0;

    if (sumOfLeavers > 0) {
      const allDestinations = this._currentLine.DESTINATIONS.split(';');
      const allDestinationsCounts = this._currentLine.DESTNOS.split(';');

      const localValidationErrors = [];
  
      if (!allDestinations || allDestinations.length==0) {
        localValidationErrors.push({
          lineNumber: this._lineNumber,
          errCode: Establishment.DESTINATIONS_ON_LEAVING_ERROR,
          errType: `DESTINATIONS_ON_LEAVING_ERROR`,
          error: "Destinations On Leaving (REASONS) must be defined as a semi-colon delimited set of reasons",
          source: this._currentLine.REASONS,
        });
      }
      if (!allDestinations.every(thisCount => !Number.isNaN(parseInt(thisCount)) || parseInt(thisCount) < MIN_COUNT)) {
        localValidationErrors.push({
          lineNumber: this._lineNumber,
          errCode: Establishment.DESTINATIONS_ON_LEAVING_ERROR,
          errType: `DESTINATIONS_ON_LEAVING_ERROR`,
          error: `Destinations On Leaving (REASONS) values must be integers`,
          source: `${this._currentLine.REASONS}`,
        });
      }

      if (!allDestinationsCounts || allDestinationsCounts.length==0) {
        localValidationErrors.push({
          lineNumber: this._lineNumber,
          errCode: Establishment.DESTINATIONS_ON_LEAVING_ERROR,
          errType: `DESTINATIONS_ON_LEAVING_ERROR`,
          error: "Destinations On Leaving Counts (REASONNOS) must be defined as a semi-colon delimited set of reasons",
          source: this._currentLine.REASONNOS,
        });
      }
      const MIN_COUNT = 0;
      if (!allDestinationsCounts.every(thisCount => !Number.isNaN(parseInt(thisCount)) || parseInt(thisCount) < MIN_COUNT)) {
        localValidationErrors.push({
          lineNumber: this._lineNumber,
          errCode: Establishment.DESTINATIONS_ON_LEAVING_ERROR,
          errType: `DESTINATIONS_ON_LEAVING_ERROR`,
          error: `Destinations On Leaving Counts (REASONNOS) values must be integers and ${MIN_COUNT} or more`,
          source: `${this._currentLine.REASONNOS}`,
        });
      }

      // all reasons and all reasons counts must be equal in number
      if (allDestinations.length != allDestinationsCounts.length) {
        localValidationErrors.push({
          lineNumber: this._lineNumber,
          errCode: Establishment.DESTINATIONS_ON_LEAVING_ERROR,
          errType: `DESTINATIONS_ON_LEAVING_ERROR`,
          error: `Destinations On Leaving (REASON) and Destinations On Leaving Counts (REASONNOS) must have the same number of semi-colon delimited values`,
          source: `${this._currentLine.REASON} - ${this._currentLine.REASONNOS}`,
        });
      }

      // sum of  all reasons counts must equal the sum of leavers
      const sumOfReasonsCounts = allDestinationsCounts.reduce((total, thisCount) => parseInt(total,10) + parseInt(thisCount,10));
      if (sumOfReasonsCounts != sumOfLeavers) {
        localValidationErrors.push({
          lineNumber: this._lineNumber,
          errCode: Establishment.DESTINATIONS_ON_LEAVING_ERROR,
          errType: `DESTINATIONS_ON_LEAVING_ERROR`,
          error: `Sum of Destinations On Leaving Counts (REASONNOS) must equal the sum of leavers (LEAVERS)`,
          source: `${this._currentLine.REASONNOS} (${sumOfReasonsCounts}) - ${this._currentLine.LEAVERS} (${sumOfLeavers})`,
        });
      }
  
      if (localValidationErrors.length > 0) {
        localValidationErrors.forEach(thisValidation => this._validationErrors.push(thisValidation));;
        return false;
      }
  
      this._destinationOnLeaving = allDestinations.map((thisDestination, index) => {
        return {
          id: parseInt(thisDestination, 10),
          count: parseInt(allDestinationsCounts[index])
        };
      });

      return true;
  
    } else {
      return true;
    }
  }

  _transformMainService() {
    if (this._mainService) {
      this._mainService = BUDI.services(BUDI.TO_ASC, this._mainService);
    }
  }

  _transformAllServices() {
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
            errType: `ALL_SERVICES_ERROR`,
            error: `All Services (ALLSERVICES): ${thisService} is unknown`,
            source: this._currentLine.ALLSERVICES,
          });
        }
      });

      this._allServices = mappedServices;
    }
  }

  _transformServiceUsers() {
    if (this._allServiceUsers && Array.isArray(this._allServiceUsers)) {
      const mappedServices = [];

      this._allServiceUsers.forEach(thisService => {
        const thisMappedService = BUDI.serviceUsers(BUDI.TO_ASC, thisService);

        if (thisMappedService) {
          mappedServices.push(thisMappedService);
        } else {
          this._validationErrors.push({
            lineNumber: this._lineNumber,
            errCode: Establishment.SERVICE_USERS_ERROR,
            errType: `SERVICE_USERS_ERROR`,
            error: `Service Users (SERVICEUSERS): ${thisService} is unknown`,
            source: this._currentLine.SERVICEUSERS,
          });
        }
      });

      this._allServiceUsers = mappedServices;
    }
  }


  _transformEstablishmentType() {
    // integer in source; enum in target
    if (this._establishmentType) {
      const mappedType = BUDI.establishmentType(BUDI.TO_ASC, this._establishmentType);

      if (mappedType === null) {
        this._validationErrors.push({
          lineNumber: this._lineNumber,
          errCode: Establishment.ESTABLISHMENT_TYPE_ERROR,
          errType: `ESTABLISHMENT_TYPE_ERROR`,
          error: `Establishment Type (ESTTYPE): ${this._establishmentType} is unknown`,
          source: this._currentLine.ESTTYPE,
        });
      } else {
        this._establishmentType = mappedType.type;
      }
    }
  }

  _transformLocalAuthorities() {
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
            errType: `LOCAL_AUTHORITIES_ERROR`,
            error: `Local Authorities (SHARELA): ${thisLA} is unknown`,
            source: this._currentLine.SHARELA,
          }); 
        }
      });

      this._localAuthorities = mappedAuthorities;
    }
  }

  _transformAllCapacities() {
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
              errCode: Establishment.CAPACITY_UTILISATION_USERS_ERROR,
              errType: `CAPACITY_UTILISATION_USERS_ERROR`,
              error: `Capacities (CAPACITY): position ${index+1} is unknown capacity`,
              source: this._currentLine.CAPACITY,
            });
          }
            
        }
      });

      this._capacities = mappedCapacities;
    }
  }

  _transformAllUtilisation() {
    if (this._utilisations && Array.isArray(this._utilisations)) {
      const mappedUtilisations = [];

      // utilsiations start out as a positional array including nulls
      //  where the position of the capacity correlates to the service (id) in the same
      //  position in _allServices
      this._utilisations.forEach((thisUtilisation, index) => {

        // we're only interested in non null utilisations to map
        if (thisUtilisation !== null) {
          // we need to map from service id to service capacity id
          const thisMappedUtilisation = BUDI.utilisation(BUDI.TO_ASC, this._allServices[index]);

          if (thisMappedUtilisation) {
            mappedUtilisations.push({
              questionId: thisMappedUtilisation,
              answer: thisUtilisation
            });
          } else {
            this._validationErrors.push({
              lineNumber: this._lineNumber,
              errCode: Establishment.CAPACITY_UTILISATION_USERS_ERROR,
              errType: `CAPACITY_UTILISATION_USERS_ERROR`,
              error: `Utilisations (UTILISATION): position ${index+1} is unknown utilisation`,
              source: this._currentLine.UTILISATION,
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

      this._alljobs.forEach(thisJob => {
        const thisMappedJob = BUDI.jobRoles(BUDI.TO_ASC, thisJob);

        if (thisMappedJob) {
          mappedJobs.push(thisMappedJob);
        } else {
          this._validationErrors.push({
            lineNumber: this._lineNumber,
            errCode: Establishment.ALL_JOBS_ERROR,
            errType: `ALL_JOBS_ERROR`,
            error: `All Job Roles (ALLJOBROLES): ${thisJob} is unknown`,
            source: this._currentLine.ALLJOBROLES,
          });
        }
      });

      this._alljobs = mappedJobs;
    }
  }

  _transformAllVacanciesStartersLeavers() {
    console.log("WA DEBUG - vacancies: ", this._vacancies)
    if (this._vacancies && Array.isArray(this._vacancies)) {
      console.log("WA DEBUG - transforming vacancies: ", this._vacancies)

      this._vacancies = this._vacancies.map((thisJob, index) => {
        return {
          jobId: this._alljobs[index],
          total: thisJob  
        };
      });
    }

    console.log("WA DEBUG - starters: ", this._starters)
    if (this._starters && Array.isArray(this._starters)) {
      console.log("WA DEBUG - transforming starters: ", this._starters)

      this._starters = this._starters.map((thisJob, index) => {
        return {
          jobId: this._alljobs[index],
          total: thisJob  
        };
      });
    }

    console.log("WA DEBUG - leavers: ", this._leavers)
    if (this._leavers && Array.isArray(this._leavers)) {
      console.log("WA DEBUG - transforming leavers: ", this._leavers)

      this._leavers = this._leavers.map((thisJob, index) => {
        return {
          jobId: this._alljobs[index],
          total: thisJob  
        };
      });
    }

  }

  _transformReasonsForLeaving() {
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
            errType: `REASONS_FOR_LEAVING_ERROR`,
            error: `Reason for Leaving (REASONS): ${thisReason.id} is unknown`,
            source: this._currentLine.REASONS,
          });
        }
      });

      this._reasonsForLeaving = mappedReasons;
    }
  }

  _transformDestinationsOnLeaving() {
    if (this._destinationOnLeaving && Array.isArray(this._destinationOnLeaving)) {
      const mappedDestinations = [];

      this._destinationOnLeaving.forEach(thisDestination => {
        const thisMappedDestination = {
          id: BUDI.destinationOnLeaving(BUDI.TO_ASC, thisDestination.id),
          count: thisDestination.count
        };

        if (thisMappedDestination.id) {
          mappedDestinations.push(thisMappedDestination);
        } else {
          this._validationErrors.push({
            lineNumber: this._lineNumber,
            errCode: Establishment.DESTINATIONS_ON_LEAVING_ERROR,
            errType: `DESTINATIONS_ON_LEAVING_ERROR`,
            error: `Destination on Leaving (DESTINATIONS): ${thisDestination.id} is unknown`,
            source: this._currentLine.REASONS,
          });
        }
      });

      this._destinationOnLeaving = mappedDestinations;
    }
  }

  // returns true on success, false is any attribute of Establishment fails
  validate() {
    let status = true;

    status = !this._validateLocalisedId() ? false : status;

    status = !this._validateStatus() ? false : status;
    status = !this._validateEstablishmentName() ? false : status;

    status = !this._validateAddress() ? false : status;

    // validating email and phone even though these are no longer mapped to an establishment
    status = !this._validateEmail() ? false : status;
    status = !this._validatePhone() ? false : status;

    status = !this._validateEstablishmentType() ? false : status;


    // ignoring IIPSTATUS and PERMNHSC
    status = !this._validateShareWithCQC() ? false : status;
    status = !this._validateShareWithLA() ? false : status;
    status = !this._validateLocalAuthorities() ? false : status;

    status = !this._validateRegType() ? false : status;
    status = !this._validateProvID() ? false : status;
    status = !this._validateLocationID() ? false : status;

    status = !this._validateMainService() ? false : status;
    status = !this._validateAllServices() ? false : status;
    status = !this._validateServiceUsers() ? false : status;
    status = !this._validateCapacitiesAndUtilisations() ? false : status;

    status = !this._validateTotalPermTemp() ? false : status;
    status = !this._validateAllJobs() ? false : status;
    status = !this._validateJobRoleTotals() ? false : status;

    status = !this._validateReasonsForLeaving() ? false : status;
    status = !this._validateDestinationsOnLeaving() ? false : status;
    
    return status;
  }

  // returns true on success, false is any attribute of Establishment fails
  transform() {
    let status = true;

    status = !this._transformMainService() ? false : status;
    status = !this._transformEstablishmentType() ? false : status;
    status = !this._transformLocalAuthorities() ? false : status;
    status = !this._transformAllServices() ? false : status;
    status = !this._transformServiceUsers() ? false : status;
    status = !this._transformAllJobs() ? false : status;

    status = !this._transformReasonsForLeaving() ? false : status;
    status = !this._transformDestinationsOnLeaving() ? false : status;

    status = !this._transformAllCapacities() ? false : status;
    status = !this._transformAllUtilisation() ? false : status;

    status = !this._transformAllVacanciesStartersLeavers() ? false : status;

    return status;
  }

  toJSON() {
    return {
      name: this._name,
      address: this._address,
      postcode: this._postcode,
      employerType: this._establishmentType,
      employerTypeOther: this._establishmentTypeOther ? this._establishmentTypeOther : undefined,
      shareWithCQC: this._shareWithCqc,
      shareWithLA: this._shareWithLA,
      localAuthorities: this._localAuthorities ? this._localAuthorities : undefined,
      regType: this._regType,
      locationId: this._regType ? this._locationID : undefined,
      provId: this._regType ? this._provID : undefined,
      mainService: {
        id: this._mainService
      },
      allServices: this._allServices.map((thisService, index) => {
        const returnThis = {
          id: thisService,
        };

        if (this._allServicesOther[index]) {
          returnThis.other = this._allServicesOther[index];
        }

        return returnThis;
      }),
      serviceUsers: this._allServiceUsers.map((thisService, index) => {
        const returnThis = {
          id: thisService,
        };

        if (this._allServiceUsersOther[index]) {
          returnThis.other = this._allServiceUsersOther[index];
        }

        return returnThis;
      }),
      capacities: this._capacities,
      utilisations: this._utilisations,
      totalPermTemp: this._totalPermTemp,
      allJobs: this._alljobs,
      counts: {
        perm: this._permCount,
        temp: this._tempCount,
        pool: this._poolCount,
        agency: this._agencyCount,
        student: this._studentCount,
        voluntary: this._voluntaryCount,
        other: this._otherCount,
        otherDescriptions: this._otherDescriptions,
        vacancies: this._vacancies,
        starters: this._starters,
        leavers: this._leavers,
        totalVacancies: this._totalVacancies,
        totalStarters: this._totalStarters,
        totalLeavers: this._totalLeavers,
        reasonsForLeaving: this._reasonsForLeaving ? this._reasonsForLeaving : undefined,
        destinationsOnLeaving: this._destinationOnLeaving ? this._destinationOnLeaving : undefined,
      },
    };
  };

  get validationErrors() {
    return this._validationErrors;
  };

  // returns an API representation of this Establishment
  toAPI() {
    const fixedProperties = {
      Address: this._address,
      Postcode: this._postcode,
      LocationId: this._shareWithCqc ? this._locationID : undefined,
      ProvId: this._shareWithCqc ? this._provID : undefined,        // this will be ignored by Establishment entity
      IsCQCRegulated: this._regType !== null & this._regType === 2 ? true : false,
    };

    const changeProperties = {
      name: this._name,
      employerType: this._establishmentType,
      employerTypeOther: this._establishmentTypeOther ? this._establishmentTypeOther : undefined,
      localAuthorities: this._localAuthorities ? this._localAuthorities : undefined,
      mainService: {
        id: this._mainService     // during BUDI lookup, it returns the main service as an id
      },
      services: this._allServices
        .filter(thisService => thisService !== this._mainService)   // main service cannot appear in otherServices
        .map((thisService, index) => {
          const returnThis = {
            id: thisService,
          };

          if (this._allServicesOther[index]) {
            returnThis.other = this._allServicesOther[index];
          }

          return returnThis;
        }),
      serviceUsers: this._allServiceUsers
        .map((thisService, index) => {
          const returnThis = {
            id: thisService,
          };

          if (this._allServiceUsersOther[index]) {
            returnThis.other = this._allServiceUsersOther[index];
          }

          return returnThis;
        }),
      numberOfStaff: this._totalPermTemp,
      jobs: {
        vacancies: this._vacancies ? this._vacancies : undefined,
        starters: this._starters ? this._starters : undefined,
        leavers: this.leavers ? this.leavers : undefined,
      }
    };

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
    this._capacities.forEach(thisCapacity => changeProperties.capacities.push(thisCapacity));
    this._utilisations.forEach(thisUtilisation => changeProperties.capacities.push(thisUtilisation));

    // clean up empty properties
    if (changeProperties.capacities.length == 0) {
      changeProperties.capacities = undefined;
    }
    if (changeProperties.services.length == 0) {
      changeProperties.services = undefined;
    }

    return {
      ...fixedProperties,
      ...changeProperties,
    };
  }
};

module.exports.Establishment = Establishment;
