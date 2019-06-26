const BUDI = require('../BUDI').BUDI;

class Establishment {
  constructor(currentLine, lineNumber) {
    this._currentLine = currentLine;
    this._lineNumber = lineNumber;
    this._validationErrors = [];
    this._headers_v1 = ["LOCALESTID","STATUS","ESTNAME","ADDRESS1","ADDRESS2","ADDRESS3","POSTTOWN","POSTCODE","ESTTYPE","OTHERTYPE","PERMCQC","PERMLA","SHARELA","REGTYPE","PROVNUM","LOCATIONID","MAINSERVICE","ALLSERVICES","CAPACITY","UTILISATION","SERVICEDESC","SERVICEUSERS","OTHERUSERDESC","TOTALPERMTEMP","ALLJOBROLES","STARTERS","LEAVERS","VACANCIES","REASONS","REASONNOS"];


    // CSV properties
    this._localId = null;
    this._status = null;
    this._name = null;
    this._address = null;
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

    //console.log(`WA DEBUG - current establishment (${this._lineNumber}:`, this._currentLine);
  };

  static get EXPECT_JUST_ONE_ERROR() { return 950; }
  static get MISSING_PRIMARY_ERROR() { return 955; }

  static get DUPLICATE_ERROR() { return 998; }
  static get HEADERS_ERROR() { return 999; }
  static get MAIN_SERVICE_ERROR() { return 1000; }
  static get LOCAL_ID_ERROR() { return 1010; }
  static get STATUS_ERROR() { return 1020; }
  static get NAME_ERROR() { return 1030; }
  static get ADDRESS_ERROR() { return 1040; }
  static get ESTABLISHMENT_TYPE_ERROR() { return 1070; }
  static get SHARE_WITH_ERROR() { return 1070; }
  static get LOCAL_AUTHORITIES_ERROR() { return 1090; }
  static get REGTYPE_ERROR() { return 1100; }
  static get PROV_ID_ERROR() { return 1105; }
  static get LOCATION_ID_ERROR() { return 1110; }
  static get ALL_SERVICES_ERROR() { return 1120; }
  static get SERVICE_USERS_ERROR() { return 1130; }
  static get CAPACITY_UTILISATION_ERROR() { return 1140; }

  static get TOTAL_PERM_TEMP_ERROR() { return 1200; }
  static get ALL_JOBS_ERROR() { return 1280; }
  static get VACANCIES_ERROR() { return 1300; }
  static get STARTERS_ERROR() { return 1310; }
  static get LEAVERS_ERROR() { return 1320; }

  static get REASONS_FOR_LEAVING_ERROR() { return 1360; }


  static get MAIN_SERVICE_WARNING() { return 2000; }
  static get NAME_WARNING() { return 2030; }
  static get ADDRESS_WARNING() { return 2040; }
  static get ESTABLISHMENT_TYPE_WARNING() { return 2070; }
  static get SHARE_WITH_WARNING() { return 2070; }
  static get TOTAL_PERM_TEMP_WARNING() { return 2200; }
  static get LOCAL_AUTHORITIES_WARNING() { return 2090; }
  static get REGTYPE_WARNING() { return 2100; }
  static get PROV_ID_WARNING() { return 2105; }
  static get LOCATION_ID_WARNING() { return 2110; }
  static get ALL_SERVICES_WARNING() { return 2120; }
  static get SERVICE_USERS_WARNING() { return 2130; }
  static get CAPACITY_UTILISATION_WARNING() { return 2140; }
  static get VACANCIES_WARNING() { return 2300; }
  static get STARTERS_WARNING() { return 2310; }
  static get LEAVERS_WARNING() { return 2320; }

  static get REASONS_FOR_LEAVING_WARNING() { return 2360; }

  get lineNumber() {
    return this._lineNumber;
  }

  get currentLine() {
    return this._currentLine;
  }

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
        name: this._currentLine.LOCALESTID,
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
        name: this._currentLine.LOCALESTID,
      });
      return false;
    } else if (myName.length > MAX_LENGTH) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.NAME_ERROR,
        errType: `NAME_ERROR`,
        error: `Establishment Name (ESTNAME) must be no more than ${MAX_LENGTH} characters`,
        source: myName,
        name: this._currentLine.LOCALESTID,
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
        name: this._currentLine.LOCALESTID,
      });
    } else if (myAddress1.length > MAX_LENGTH) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.ADDRESS_ERROR,
        errType: `ADDRESS_ERROR`,
        error: `First line of address (ADDRESS1) must be no more than ${MAX_LENGTH} characters`,
        source: myAddress1,
        name: this._currentLine.LOCALESTID,
      });
    }

    if (myAddress2 && myAddress2.length > MAX_LENGTH) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.ADDRESS_ERROR,
        errType: `ADDRESS_ERROR`,
        error: `Second line of address (ADDRESS2) must be no more than ${MAX_LENGTH} characters`,
        source: myAddress2,
        name: this._currentLine.LOCALESTID,
      });
    }

    if (myAddress3 && myAddress3.length > MAX_LENGTH) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.ADDRESS_ERROR,
        errType: `ADDRESS_ERROR`,
        error: `Third line of address (ADDRESS3) must be no more than ${MAX_LENGTH} characters`,
        source: myAddress3,
        name: this._currentLine.LOCALESTID,
      });
    }

    if (myTown && myTown.length > MAX_LENGTH) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.ADDRESS_ERROR,
        errType: `ADDRESS_ERROR`,
        error: `{Post town} (POSTTOWN) must be no more than ${MAX_LENGTH} characters`,
        source: myTown,
        name: this._currentLine.LOCALESTID,
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
        name: this._currentLine.LOCALESTID,
      });
    } else if (myPostcode.length > POSTCODE_MAX_LENGTH) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.ADDRESS_ERROR,
        errType: `ADDRESS_ERROR`,
        error: `Postcode (POSTCODE) must be no more than ${POSTCODE_MAX_LENGTH} characters`,
        source: myPostcode,
        name: this._currentLine.LOCALESTID,
      });
    } else if (!postcodeRegex.test(myPostcode)) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.ADDRESS_ERROR,
        errType: `ADDRESS_ERROR`,
        error: `Postcode (POSTCODE) unexpected format`,
        source: myPostcode,
        name: this._currentLine.LOCALESTID,
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
        name: this._currentLine.LOCALESTID,
      });
    } else if (myEstablishmentType < 1 || myEstablishmentType > 8) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.ESTABLISHMENT_TYPE_ERROR,
        errType: `ESTABLISHMENT_TYPE_ERROR`,
        error: "Establishment Type (ESTTYPE) between 1 and 8 only",
        source: this._currentLine.ESTTYPE,
        name: this._currentLine.LOCALESTID,
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
        name: this._currentLine.LOCALESTID,
      });
    } else if (myEstablishmentType == 8 && (myOtherEstablishmentType.length > MAX_LENGTH)) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.ESTABLISHMENT_TYPE_ERROR,
        errType: `ESTABLISHMENT_TYPE_ERROR`,
        error: `Establishment Type (ESTTYPE) is 'Other (8)', but OTHERTYPE must be no more than ${MAX_LENGTH} characters`,
        source: myOtherEstablishmentType,
        name: this._currentLine.LOCALESTID,
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
        errCode: Establishment.SHARE_WITH_ERROR,
        errType: `SHARE_WITH_ERROR`,
        error: "Share with CQC (PERMCQC) must be an integer",
        source: this._currentLine.PERMCQC,
        name: this._currentLine.LOCALESTID,
      });
      return false;
    } else if (!ALLOWED_VALUES.includes(myShareWithCqc)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.SHARE_WITH_ERROR,
        errType: `SHARE_WITH_ERROR`,
        error: "Share with CQC (PERMCQC) must be 0 or 1",
        source: myShareWithCqc,
        name: this._currentLine.LOCALESTID,
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
        errCode: Establishment.SHARE_WITH_ERROR,
        errType: `SHARE_WITH_ERROR`,
        error: "Share with LA (PERMLA) must be an integer",
        source: this._currentLine.PERMLA,
        name: this._currentLine.LOCALESTID,
      });
      return false;
    } else if (!ALLOWED_VALUES.includes(myShareWithLa)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.SHARE_WITH_ERROR,
        errType: `SHARE_WITH_ERROR`,
        error: "Share with LA (PERMLA) must be 0 or 1",
        source: myShareWithLa,
        name: this._currentLine.LOCALESTID,
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
          name: this._currentLine.LOCALESTID,
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

    if (Number.isNaN(myRegType) || (myRegType !== 0 && myRegType !== 2)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.REGTYPE_ERROR,
        errType: `REGTYPE_ERROR`,
        error: "Registration Type (REGTYPE) must be given and must be either 0 or 2",
        source: this._currentLine.REGTYPE,
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
    const provIDRegex = /^[0-9]{1}\-[0-9]{8,10}$/;
    const myprovID = this._currentLine.PROVNUM;
    if (this._regType && this._regType == 2 && (!myprovID || myprovID.length==0)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.PROV_ID_ERROR,
        errType: `PROV_ID_ERROR`,
        error: "Prov ID (PROVNUM) must be given as this workplace is CQC regulated",
        source: myprovID,
        name: this._currentLine.LOCALESTID,
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
        name: this._currentLine.LOCALESTID,
      });
      return false;
    } else if (this._regType) {
      this._provID = myprovID;
      return true;
    }
  }

  _validateLocationID() {
    // must be given if "share with CQC" - but if given must be in the format "n-nnnnnnnnn"
    const locationIDRegex = /^[0-9]{1}-[0-9]{8,10}$/;
    const myLocationID = this._currentLine.LOCATIONID;

    if (this._regType  && this._regType == 2 && (!myLocationID || myLocationID.length==0)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.LOCATION_ID_ERROR,
        errType: `LOCATION_ID_ERROR`,
        error: "Location ID (LOCATIONID) must be given as this workplace is CQC regulated",
        source: myLocationID,
        name: this._currentLine.LOCALESTID,
      });
      return false;
    }
    else if (this._regType && this._regType == 2 && !locationIDRegex.test(myLocationID)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.LOCATION_ID_ERROR,
        errType: `LOCATION_ID_ERROR`,
        error: "Location ID (LOCATIONID) must be in the format 'n-nnnnnnnnn'",
        source: myLocationID,
        name: this._currentLine.LOCALESTID,
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
        name: this._currentLine.LOCALESTID,
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
        name: this._currentLine.LOCALESTID,
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
        name: this._currentLine.LOCALESTID,
      });
    } else if (listOfServices.length != listOfServiceDescriptions.length) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.ALL_SERVICES_ERROR,
        errType: `ALL_SERVICES_ERROR`,
        error: "All Services (ALLSERVICES) count and Service Description (SERVICEDESC) count must equal",
        source: this._currentLine.SERVICEDESC,
        name: this._currentLine.LOCALESTID,
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
              name: this._currentLine.LOCALESTID,
            });
            myServiceDescriptions.push(null);
          } else if (myServiceOther.length > MAX_LENGTH) {
            localValidationErrors.push({
              lineNumber: this._lineNumber,
              errCode: Establishment.ALL_SERVICES_ERROR,
              errType: `ALL_SERVICES_ERROR`,
              error: `All Services (ALLSERVICES:${index+1}) is an 'other' service and (SERVICEDESC:${index+1}) must not be greater than ${MAX_LENGTH} characters`,
              source: `${this._currentLine.SERVICEDESC} - ${listOfServiceDescriptions[index]}`,
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
        name: this._currentLine.LOCALESTID,
      });
    } else if (listOfServiceUsers.length != listOfServiceUsersDescriptions.length) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.SERVICE_USERS_ERROR,
        errType: `SERVICE_USERS_ERROR`,
        error: "Service Users (SERVICEUSERS) count and Service Users Description (OTHERUSERDESC) count must equal",
        source: `${this._currentLine.SERVICEUSERS} - ${this._currentLine.OTHERUSERDESC}`,
        name: this._currentLine.LOCALESTID,
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
              name: this._currentLine.LOCALESTID,
            });
            myServiceUsersDescriptions.push(null);
          } else if (myServiceUserOther.length > MAX_LENGTH) {
            localValidationErrors.push({
              lineNumber: this._lineNumber,
              errCode: Establishment.SERVICE_USERS_ERROR,
              errType: `SERVICE_USERS_ERROR`,
              error: `Service Users (SERVICEUSERS:${index+1}) is an 'other' service and (OTHERUSERDESC:${index+1}) must not be greater than ${MAX_LENGTH} characters`,
              source: `${this._currentLine.SERVICEDESC} - ${listOfServiceUsersDescriptions[index]}`,
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
        errCode: Establishment.CAPACITY_UTILISATION_ERROR,
        errType: `CAPACITY_UTILISATION_ERROR`,
        error: "Capacities (CAPACITY) must be a semi-colon delimited list of integers",
        source: this._currentLine.CAPACITY,
        name: this._currentLine.LOCALESTID,
      });
    }
    if (listOfUtilisations.length === 0) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.CAPACITY_UTILISATION_ERROR,
        errType: `CAPACITY_UTILISATION_ERROR`,
        error: "Utilisations (UTILISATION) must be a semi-colon delimited list of integers",
        source: this._currentLine.UTILISATION,
        name: this._currentLine.LOCALESTID,
      });
    }
    if (listOfCapacities.length != listOfUtilisations.length) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.CAPACITY_UTILISATION_ERROR,
        errType: `CAPACITY_UTILISATION_ERROR`,
        error: "Number of Capacities (CAPACITY) and Utilisations (UTILISATION) must be equal",
        source: `${this._currentLine.CAPACITY} - ${this._currentLine.UTILISATION}`,
        name: this._currentLine.LOCALESTID,
      });
    }

    // and the number of utilisations/capacities must equal the number of all services
    if (listOfCapacities.length !== (this._allServices ? this._allServices.length : 0)) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.CAPACITY_UTILISATION_ERROR,
        errType: `CAPACITY_UTILISATION_ERROR`,
        error: "Number of Capacities/Utilisations (CAPACITY/UTILISATION) must equal the number of all services (ALLSERVICES)",
        source: `${this._currentLine.CAPACITY} - ${this._currentLine.UTILISATION} - ${this._currentLine.ALLSERVICES}`,
        name: this._currentLine.LOCALESTID,
      });
    }

    // all capacities and all utilisations are integers (if given)
    // capacities and utilisations must be less than 999999999
    const MAX_CAP_UTIL=999999999;
    const areCapacitiesValid = listOfCapacities.every(thisCapacity => {
      return thisCapacity === null ||
             thisCapacity.length==0 ? true : !Number.isNaN(parseInt(thisCapacity)) &&  parseInt(thisCapacity) < MAX_CAP_UTIL;
    });
    if (!areCapacitiesValid) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.CAPACITY_UTILISATION_ERROR,
        errType: `CAPACITY_UTILISATION_ERROR`,
        error: `All capacities (CAPACITY) must be integers and less than ${MAX_CAP_UTIL}`,
        source: this._currentLine.CAPACITY,
        name: this._currentLine.LOCALESTID,
      });
    }
    const areUtilisationsValid = listOfUtilisations.every(thisUtilisation => {
      return thisUtilisation === null ||
            thisUtilisation.length==0 ? true : !Number.isNaN(parseInt(thisUtilisation)) && parseInt(thisUtilisation) < MAX_CAP_UTIL;
    });
    if (!areUtilisationsValid) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.CAPACITY_UTILISATION_ERROR,
        errType: `CAPACITY_UTILISATION_ERROR`,
        error: `All utilisations (UTILISATION) must be integers and less than ${MAX_CAP_UTIL}`,
        source: this._currentLine.UTILISATION,
        name: this._currentLine.LOCALESTID,
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
    const MAX_TOTAL = 999;
    const myTotalPermTemp = parseInt(this._currentLine.TOTALPERMTEMP);

    if (Number.isNaN(myTotalPermTemp)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.TOTAL_PERM_TEMP_ERROR,
        errType: `TOTAL_PERM_TEMP_ERROR`,
        error: "Total Permanent and Temporary (TOTALPERMTEMP) must be an integer",
        source: this._currentLine.PERMCQC,
        name: this._currentLine.LOCALESTID,
      });
      return false;
    } else if (myTotalPermTemp < 0 || myTotalPermTemp > MAX_TOTAL) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.TOTAL_PERM_TEMP_ERROR,
        errType: `TOTAL_PERM_TEMP_ERROR`,
        error: `Total Permanent and Temporary (TOTALPERMTEMP) must be 0 or more, but less than ${MAX_TOTAL}`,
        source: myTotalPermTemp,
        name: this._currentLine.LOCALESTID,
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
        name: this._currentLine.LOCALESTID,
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
          name: this._currentLine.LOCALESTID,
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
          name: this._currentLine.LOCALESTID,
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
    const DONT_KNOW='999';    // NUST BE A STRING VALUE!!!!!
    if (!((vacancies.length === 1 && vacancies[0] === DONT_KNOW) || (vacancies.length === allJobsCount))) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.VACANCIES_ERROR,
        errType: `VACANCIES_ERROR`,
        error: "Vacancies (VACANCIES) does not correlate to All Job Roles (ALLJOBROLES); must have same number of semi colon delimited values",
        source: `${this._currentLine.VACANCIES} - ${this._currentLine.ALLJOBROLES}`,
        name: this._currentLine.LOCALESTID,
      });
    }
    if (!((starters.length === 1 && starters[0] === DONT_KNOW) || (starters.length === allJobsCount))) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.STARTERS_ERROR,
        errType: `STARTERS_ERROR`,
        error: "Starters (STARTERS) does not correlate to All Job Roles (ALLJOBROLES); must have same number of semi colon delimited values",
        source: `${this._currentLine.STARTERS} - ${this._currentLine.ALLJOBROLES}`,
        name: this._currentLine.LOCALESTID,
      });
    }
    if (!((leavers.length === 1 && leavers[0] === DONT_KNOW) || (leavers.length === allJobsCount))) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.LEAVERS_ERROR,
        errType: `LEAVERS_ERROR`,
        error: "Leavers (LEAVERS) does not correlate to All Job Roles (ALLJOBROLES); must have same number of semi colon delimited values",
        source: `${this._currentLine.LEAVERS} - ${this._currentLine.ALLJOBROLES}`,
        name: this._currentLine.LOCALESTID,
      });
    }

    // all counts must be integers and greater than/equal to zero
    const MIN_COUNT = 0;
    const MAX_COUNT = 999999999;
    if (!vacancies.every(thisCount => !Number.isNaN(parseInt(thisCount)) && parseInt(thisCount) >= MIN_COUNT && parseInt(thisCount) <= MAX_COUNT)) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.VACANCIES_ERROR,
        errType: `VACANCIES_ERROR`,
        error: `Vacancies (VACANCIES) values must be integers and ${MIN_COUNT} or more but less than ${MAX_COUNT}`,
        source: `${this._currentLine.VACANCIES}`,
        name: this._currentLine.LOCALESTID,
      });
    }
    if (!starters.every(thisCount => !Number.isNaN(parseInt(thisCount)) && parseInt(thisCount) >= MIN_COUNT && parseInt(thisCount) <= MAX_COUNT)) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.STARTERS_ERROR,
        errType: `STARTERS_ERROR`,
        error: `Starters (STARTERS) values must be integers and ${MIN_COUNT} or more but less than ${MAX_COUNT}`,
        source: `${this._currentLine.STARTERS}`,
        name: this._currentLine.LOCALESTID,
      });
    }
    if (!leavers.every(thisCount => !Number.isNaN(parseInt(thisCount)) && parseInt(thisCount) >= MIN_COUNT && parseInt(thisCount) <= MAX_COUNT)) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.LEAVERS_ERROR,
        errType: `LEAVERS_ERROR`,
        error: `Leavers (LEAVERS) values must be integers and ${MIN_COUNT} or more but less than ${MAX_COUNT}`,
        source: `${this._currentLine.LEAVERS}`,
        name: this._currentLine.LOCALESTID,
      });
    }

    if (localValidationErrors.length > 0) {
      localValidationErrors.forEach(thisValidation => this._validationErrors.push(thisValidation));;
      return false;
    }

    this._vacancies = vacancies.map(thisCount => parseInt(thisCount, 10));
    this._starters = starters.map(thisCount => parseInt(thisCount, 10));
    this._leavers = leavers.map(thisCount => parseInt(thisCount, 10));

    if (localValidationErrors.length > 0) {
      localValidationErrors.forEach(thisValidation => this._validationErrors.push(thisValidation));
      return false;
    }

    return true;
  }

  _validateReasonsForLeaving() {
    // only if the sum of "LEAVERS" is greater than 0
    const sumOfLeavers = this._leavers && Array.isArray(this._leavers) && this._leavers[0] !== 999 ? this._leavers.reduce((total, thisCount) => total+thisCount) : 0;

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
          name: this._currentLine.LOCALESTID,
        });
      }
      if (!allReasons.every(thisCount => !Number.isNaN(parseInt(thisCount)))) {
        localValidationErrors.push({
          lineNumber: this._lineNumber,
          errCode: Establishment.REASONS_FOR_LEAVING_ERROR,
          errType: `REASONS_FOR_LEAVING_ERROR`,
          error: `Reasons for Leaving (REASONS) values must be integers`,
          source: `${this._currentLine.REASONS}`,
          name: this._currentLine.LOCALESTID,
        });
      }

      if (!allReasonsCounts || allReasonsCounts.length==0) {
        localValidationErrors.push({
          lineNumber: this._lineNumber,
          errCode: Establishment.REASONS_FOR_LEAVING_ERROR,
          errType: `REASONS_FOR_LEAVING_ERROR`,
          error: "Reasons for Leaving Counts (REASONNOS) must be defined as a semi-colon delimited set of reasons",
          source: this._currentLine.REASONNOS,
          name: this._currentLine.LOCALESTID,
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
          name: this._currentLine.LOCALESTID,
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
          name: this._currentLine.LOCALESTID,
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
          name: this._currentLine.LOCALESTID,
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

  _transformMainService() {
    if (this._mainService) {
      const mappedService = BUDI.services(BUDI.TO_ASC, this._mainService);
      if (mappedService) {
        // main service can have an "other" description. That "other" description is
        //  given by _allServiceUsersOther, based on the position index of this main service
        //  within _allServices
        const positionOfMainService = this._allServices ? this._allServices.indexOf(this._mainService): -1;

        let mainServiceOther = null;
        if (positionOfMainService > -1) {
          mainServiceOther = this._allServicesOther[positionOfMainService];
        }
        this._mainService = {
          id: mappedService,
          other: mainServiceOther ? mainServiceOther : undefined,
        };

      } else {
        this._validationErrors.push({
          lineNumber: this._lineNumber,
          errCode: Establishment.MAIN_SERVICE_ERROR,
          errType: `MAIN_SERVICE_ERROR`,
          error: `Main Service (MAINSERVICE): ${this._mainService} is unknown`,
          source: this._currentLine.MAINSERVICE,
          name: this._currentLine.LOCALESTID,
        });
      }
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
      const mappedType = BUDI.establishmentType(BUDI.TO_ASC, this._establishmentType);

      if (mappedType === null) {
        this._validationErrors.push({
          lineNumber: this._lineNumber,
          errCode: Establishment.ESTABLISHMENT_TYPE_ERROR,
          errType: `ESTABLISHMENT_TYPE_ERROR`,
          error: `Establishment Type (ESTTYPE): ${this._establishmentType} is unknown`,
          source: this._currentLine.ESTTYPE,
          name: this._currentLine.LOCALESTID,
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
            name: this._currentLine.LOCALESTID,
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
              errCode: Establishment.CAPACITY_UTILISATION_ERROR,
              errType: `CAPACITY_UTILISATION_ERROR`,
              error: `Capacities (CAPACITY): position ${index+1} is unexpected capacity (no expected capacity for given service: ${this._allServices[index]})`,
              source: this._currentLine.CAPACITY,
              name: this._currentLine.LOCALESTID,
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
              errCode: Establishment.CAPACITY_UTILISATION_ERROR,
              errType: `CAPACITY_UTILISATION_ERROR`,
              error: `Utilisations (UTILISATION): position ${index+1} is unknown utilisation`,
              source: this._currentLine.UTILISATION,
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
      return jobs.every(thisJob => thisJob === 0);
    } else {
      return false;
    }
  }

  _transformAllVacanciesStartersLeavers() {
    // vacancies, starters and leavers is either an array of counts against positional indexes to _allJobs
    //  or a single value of 999

    // if a single value of 999, then map to "Don't know"
    // if a full set of 0 (e.g. 0, or 0;0 or 0;0;0, ...), then map to "None"
    const DONT_KNOW=999;

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
            name: this._currentLine.LOCALESTID,
          });
        }
      });

      this._reasonsForLeaving = mappedReasons;
    }
  }

  preValidate() {
    return this._validateHeaders();
  }

  static isContent(data) {
    const contentRegex = /LOCALESTID,STATUS,ESTNAME,ADDRESS1,ADDRESS2,ADDRES/;
    return contentRegex.test(data.substring(0,50));
  }

  _validateHeaders() {
    const headers = Object.keys(this._currentLine);
    // only run once for first line, so check _lineNumber
    if (JSON.stringify(this._headers_v1) !== JSON.stringify(headers)) {
      this._validationErrors.push({
        lineNumber: 1,
        errCode: Establishment.HEADERS_ERROR,
        errType: `HEADERS_ERROR`,
        error: `Establishment headers (HEADERS) can contain, ${this._headers_v1}`,
        source: headers,
        name: this._currentLine.LOCALESTID,
      });
      return false;
    }
    return true;
  }

  // add a duplicate validation error to the current set
  addDuplicate(originalLineNumber) {
    return {
      origin: 'Establishments',
      lineNumber: this._lineNumber,
      errCode: Establishment.DUPLICATE_ERROR,
      errType: `DUPLICATE_ERROR`,
      error: `Duplicate of line ${originalLineNumber}`,
      source: this._currentLine.LOCALESTID,
      name: this._currentLine.LOCALESTID,
    };
  }

  static justOneEstablishmentError() {
    return {
      origin: 'Establishments',
      lineNumber: 1,
      errCode: Establishment.EXPECT_JUST_ONE_ERROR,
      errType: `EXPECT_JUST_ONE_ERROR`,
      error: 'Expect just one establishment',
      source: '',
      name: this._currentLine.LOCALESTID,
    };
  }

  static missingPrimaryEstablishmentError(name) {
    return {
      origin: 'Establishments',
      lineNumber: 1,
      errCode: Establishment.MISSING_PRIMARY_ERROR,
      errType: `MISSING_PRIMARY_ERROR`,
      error: `Missing the primary establishment: ${name}`,
      source: '',
      name: this._currentLine.LOCALESTID,
    };
  }

  // returns true on success, false is any attribute of Establishment fails
  validate() {
    let status = true;

    status = !this._validateLocalisedId() ? false : status;
    status = !this._validateStatus() ? false : status;
    status = !this._validateEstablishmentName() ? false : status;
    status = !this._validateAddress() ? false : status;
    status = !this._validateEstablishmentType() ? false : status;

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
      mainService: this._mainService,
      allServices: this._allServices ? this._allServices.map((thisService, index) => {
        const returnThis = {
          id: thisService,
        };

        if (this._allServicesOther[index]) {
          returnThis.other = this._allServicesOther[index];
        }

        return returnThis;
      }) : undefined,
      serviceUsers: this._allServiceUsers ? this._allServiceUsers.map((thisService, index) => {
        const returnThis = {
          id: thisService,
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
        reasonsForLeaving: this._reasonsForLeaving ? this._reasonsForLeaving : undefined,
      },
    };
  };

  get validationErrors() {
        // include the "origin" of validation error
        return this._validationErrors.map(thisValidation => {
          return {
            origin: 'Establishments',
            ...thisValidation,
          };
        });

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
      employerType: {
        value: this._establishmentType,
        other: this._establishmentTypeOther ? this._establishmentTypeOther : undefined,
      },
      localAuthorities: this._localAuthorities ? this._localAuthorities : undefined,
      mainService: this._mainService,
      services: this._allServices ? this._allServices
        .filter(thisService => thisService !== this._mainService)   // main service cannot appear in otherServices
        .map((thisService, index) => {
          const returnThis = {
            id: thisService,
          };

          //console.log("WA DEBUG - this other service: ", thisService, index, this._allServicesOther, this._allServicesOther[index])

          if (this._allServicesOther[index]) {
            returnThis.other = this._allServicesOther[index];
          }

          return returnThis;
        }) : undefined,
      serviceUsers: this._allServiceUsers ? this._allServiceUsers
        .map((thisService, index) => {
          const returnThis = {
            id: thisService,
          };

          if (this._allServiceUsersOther[index]) {
            returnThis.other = this._allServiceUsersOther[index];
          }

          return returnThis;
        }) : undefined,
      numberOfStaff: this._totalPermTemp,
      vacancies: this._vacancies ? this._vacancies : undefined,
      starters: this._starters ? this._starters : undefined,
      leavers: this.leavers ? this.leavers : undefined,
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
    this._capacities &&Array.isArray(this._capacities) ? this._capacities.forEach(thisCapacity => changeProperties.capacities.push(thisCapacity)) : true;
    this._utilisations && Array.isArray(this._utilisations) ? this._utilisations.forEach(thisUtilisation => changeProperties.capacities.push(thisUtilisation)) : true;

    // clean up empty properties
    if (changeProperties.capacities.length == 0) {
      changeProperties.capacities = undefined;
    }
    if (changeProperties.services && changeProperties.services.length == 0) {
      changeProperties.services = undefined;
    }

    return {
      ...fixedProperties,
      ...changeProperties,
    };
  }

  // maps Entity (API) validation messages to bulk upload specific messages (using Entity property name)
  addAPIValidations(errors, warnings) {
    errors.forEach(thisError => {
      thisError.properties ? thisError.properties.forEach(thisProp => {
        const validationError = {
          lineNumber: this._lineNumber,
          error: thisError.message,
          name: this._currentLine.LOCALESTID,
        };

        switch (thisProp) {
          case 'Capacity':
            validationError.errCode = Establishment.CAPACITY_UTILISATION_ERROR;
            validationError.errType = 'CAPACITY_UTILISATION_ERROR';
            validationError.source  = `${this._currentLine.CAPACITY} - ${this._currentLine.UTILISATION}`;
            break;
          case 'EmployerType':
            validationError.errCode = Establishment.ESTABLISHMENT_TYPE_ERROR;
            validationError.errType = 'ESTABLISHMENT_TYPE_ERROR';
            validationError.source  = `${this._currentLine.ESTTYPE}`;
            break;
          case 'Leavers':
            validationError.errCode = Establishment.LEAVERS_ERROR;
            validationError.errType = 'LEAVERS_ERROR';
            validationError.source  = `${this._currentLine.LEAVERS}`;
            break;
          case 'Starters':
            validationError.errCode = Establishment.STARTERS_ERROR;
            validationError.errType = 'STARTERS_ERROR';
            validationError.source  = `${this._currentLine.STARTERS}`;
            break;
          case 'Vacancies':
            validationError.errCode = Establishment.VACANCIES_ERROR;
            validationError.errType = 'VACANCIES_ERROR';
            validationError.source  = `${this._currentLine.VACANCIES}`;
            break;
          case 'MainService':
            validationError.errCode = Establishment.MAIN_SERVICE_ERROR;
            validationError.errType = 'MAIN_SERVICE_ERROR';
            validationError.source  = `${this._currentLine.MAINSERVICE}`;
            break;
          case 'Name':
            validationError.errCode = Establishment.NAME_ERROR;
            validationError.errType = 'NAME_ERROR';
            validationError.source  = `${this._currentLine.ESTNAME}`;
            break;
          case 'Services':
            validationError.errCode = Establishment.ALL_SERVICES_ERROR;
            validationError.errType = 'ALL_SERVICES_ERROR';
            validationError.source  = `${this._currentLine.ALLSERVICES} - ${this._currentLine.SERVICEDESC}`;
            break;
          case 'ServiceUsers':
            validationError.errCode = Establishment.SERVICE_USERS_ERROR;
            validationError.errType = 'SERVICE_USERS_ERROR';
            validationError.source  = `${this._currentLine.SERVICEUSERS} - ${this._currentLine.OTHERUSERDESC}`;
            break;
          case 'ShareWithLA':
            validationError.errCode = Establishment.LOCAL_AUTHORITIES_ERROR;
            validationError.errType = 'LOCAL_AUTHORITIES_ERROR';
            validationError.source  = `${this._currentLine.SHARELA}`;
            break;
          case 'ShareWith':
            validationError.errCode = Establishment.SHARE_WITH;
            validationError.errType = 'SHARE_WITH_ERROR';
            validationError.source  = `${this._currentLine.PERMCQC} - ${this._currentLine.PERMLA}`;
            break;
          case 'Staff':
            validationError.errCode = Establishment.TOTAL_PERM_TEMP_ERROR;
            validationError.errType = 'TOTAL_PERM_TEMP_ERROR';
            validationError.source  = `${this._currentLine.TOTALPERMTEMP}`;
            break;
          case 'Address':
          case 'Postcode':
            validationError.errCode = Establishment.ADDRESS_ERROR;
            validationError.errType = 'ADDRESS_ERROR';
            validationError.source  = `${this._currentLine.ADDRESS1},${this._currentLine.ADDRESS2},${this._currentLine.ADDRESS3},${this._currentLine.POSTTOWN},${this._currentLine.POSTCODE}`;
            break;
          case 'CQCRegistered':
            validationError.errCode = Establishment.REGTYPE_ERROR;
            validationError.errType = 'REGTYPE_ERROR';
            validationError.source  = `${this._currentLine.REGTYPE}`;
            break;
          case 'LocationID':
            validationError.errCode = Establishment.LOCATION_ID_ERROR;
            validationError.errType = 'LOCATION_ID_ERROR';
            validationError.source  = `${this._currentLine.LOCATIONID}`;
            break;
          case 'NMDSID':
              // where to map NMDSID error?????
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
        };

        switch (thisProp) {
          case 'Capacity':
            validationWarning.warnCode = Establishment.CAPACITY_UTILISATION_WARNING;
            validationWarning.warnType = 'CAPACITY_UTILISATION_WARNING';
            validationWarning.source  = `${this._currentLine.CAPACITY} - ${this._currentLine.UTILISATION}`;
            break;
          case 'EmployerType':
            validationWarning.warnCode = Establishment.ESTABLISHMENT_TYPE_WARNING;
            validationWarning.warnType = 'ESTABLISHMENT_TYPE_WARNING';
            validationWarning.source  = `${this._currentLine.ESTTYPE}`;
            break;
          case 'Leavers':
            validationWarning.warnCode = Establishment.LEAVERS_WARNING;
            validationWarning.warnType = 'LEAVERS_WARNING';
            validationWarning.source  = `${this._currentLine.LEAVERS}`;
            break;
          case 'Starters':
            validationWarning.warnCode = Establishment.STARTERS_WARNING;
            validationWarning.warnType = 'STARTERS_WARNING';
            validationWarning.source  = `${this._currentLine.STARTERS}`;
            break;
          case 'Vacancies':
            validationWarning.warnCode = Establishment.VACANCIES_WARNING;
            validationWarning.warnType = 'VACANCIES_WARNING';
            validationWarning.source  = `${this._currentLine.VACANCIES}`;
            break;
          case 'MainService':
            validationWarning.warnCode = Establishment.MAIN_SERVICE_WARNING;
            validationWarning.warnType = 'MAIN_SERVICE_WARNING';
            validationWarning.source  = `${this._currentLine.MAINSERVICE}`;
            break;
          case 'Name':
            validationWarning.warnCode = Establishment.NAME_WARNING;
            validationWarning.warnType = 'NAME_WARNING';
            validationWarning.source  = `${this._currentLine.ESTNAME}`;
            break;
          case 'Services':
            validationWarning.warnCode = Establishment.ALL_SERVICES_WARNING;
            validationWarning.warnType = 'ALL_SERVICES_WARNING';
            validationWarning.source  = `${this._currentLine.ALLSERVICES} - ${this._currentLine.SERVICEDESC}`;
            break;
          case 'ServiceUsers':
            validationWarning.warnCode = Establishment.SERVICE_USERS_WARNING;
            validationWarning.warnType = 'SERVICE_USERS_WARNING';
            validationWarning.source  = `${this._currentLine.SERVICEUSERS} - ${this._currentLine.OTHERUSERDESC}`;
            break;
          case 'ShareWithLA':
            validationWarning.warnCode = Establishment.LOCAL_AUTHORITIES_WARNING;
            validationWarning.warnType = 'LOCAL_AUTHORITIES_WARNING';
            validationWarning.source  = `${this._currentLine.SHARELA}`;
            break;
          case 'ShareWith':
            validationWarning.warnCode = Establishment.SHARE_WITH;
            validationWarning.warnType = 'SHARE_WITH';
            validationWarning.source  = `${this._currentLine.PERMCQC} - ${this._currentLine.PERMLA}`;
            break;
          case 'Staff':
            validationWarning.warnCode = Establishment.TOTAL_PERM_TEMP_WARNING;
            validationWarning.warnType = 'TOTAL_PERM_TEMP_WARNING';
            validationWarning.source  = `${this._currentLine.TOTALPERMTEMP}`;
            break;
          case 'Address':
          case 'Postcode':
            validationWarning.warnCode = Establishment.ADDRESS_WARNING;
            validationWarning.warnType = 'ADDRESS_WARNING';
            validationWarning.source  = `${this._currentLine.ADDRESS1},${this._currentLine.ADDRESS2},${this._currentLine.ADDRESS3},${this._currentLine.POSTTOWN},${this._currentLine.POSTCODE}`;
            break;
          case 'CQCRegistered':
            validationWarning.warnCode = Establishment.REGTYPE_WARNING;
            validationWarning.warnType = 'REGTYPE_WARNING';
            validationWarning.source  = `${this._currentLine.REGTYPE}`;
            break;
          case 'LocationID':
            validationWarning.warnCode = Establishment.LOCATION_ID_WARNING;
            validationWarning.warnType = 'LOCATION_ID_WARNING';
            validationWarning.source  = `${this._currentLine.LOCATIONID}`;
            break;
          case 'NMDSID':
              // where to map NMDSID error?????
          default:
            validationWarning.warnCode = thisWarning.code;
            validationWarning.warnType = 'Undefined';
            validationWarning.source  = thisProp;
        }

        this._validationErrors.push(validationWarning);
      }) : true;
    });

  }
};

module.exports.Establishment = Establishment;
