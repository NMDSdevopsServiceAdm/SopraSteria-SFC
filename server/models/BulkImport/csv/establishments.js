const BUDI = require('../BUDI').BUDI;

const STOP_VALIDATING_ON = ['UNCHECKED', 'DELETE', 'NOCHANGE'];

class Establishment {
  constructor(currentLine, lineNumber, allCurrentEstablishments) {
    this._currentLine = currentLine;
    this._lineNumber = lineNumber;
    this._allCurrentEstablishments = allCurrentEstablishments;


    this._validationErrors = [];
    this._headers_v1 = ["LOCALESTID","STATUS","ESTNAME","ADDRESS1","ADDRESS2","ADDRESS3","POSTTOWN","POSTCODE","ESTTYPE","OTHERTYPE","PERMCQC","PERMLA","SHARELA","REGTYPE","PROVNUM","LOCATIONID","MAINSERVICE","ALLSERVICES","CAPACITY","UTILISATION","SERVICEDESC","SERVICEUSERS","OTHERUSERDESC","TOTALPERMTEMP","ALLJOBROLES","STARTERS","LEAVERS","VACANCIES","REASONS","REASONNOS"];


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

    //console.log(`WA DEBUG - current establishment (${this._lineNumber}:`, this._currentLine);
  };

  static get EXPECT_JUST_ONE_ERROR() { return 950; }
  static get MISSING_PRIMARY_ERROR() { return 955; }

  static get NOT_OWNER_ERROR() { return 997; }
  static get DUPLICATE_ERROR() { return 998; }
  static get HEADERS_ERROR() { return 999; }
  static get MAIN_SERVICE_ERROR() { return 1000; }
  static get LOCAL_ID_ERROR() { return 1010; }
  static get STATUS_ERROR() { return 1020; }
  static get STATUS_WARNING() { return 1025; }
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
  static get ALL_JOBS_WARNING() { return 2180; }

  static get VACANCIES_WARNING() { return 2300; }
  static get STARTERS_WARNING() { return 2310; }
  static get LEAVERS_WARNING() { return 2320; }

  static get REASONS_FOR_LEAVING_WARNING() { return 2360; }


  get headers() {
    return this._headers_v1.join(",");
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
    let status = true;

    if (myLocalId === null || myLocalId.length === 0) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.LOCAL_ID_ERROR,
        errType: `LOCAL_ID_ERROR`,
        error: "LOCALESTID has not been supplied",
        source: myLocalId,
      });
      status = false;
    } else if (myLocalId.length >= MAX_LENGTH) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.LOCAL_ID_ERROR,
        errType: `LOCAL_ID_ERROR`,
        error: `LOCALESTID is longer than ${MAX_LENGTH} characters`,
        source: myLocalId,
      });
      status = false;
    }

    // need the LOCALSTID regardless of whether it has failed validation or not
    this._localId = myLocalId === null || myLocalId.length === 0 ? `SFCROW$${this._lineNumber}` : myLocalId;
    this._key = this._localId.replace(/\s/g, "");

    return status;
  }

  _validateStatus() {
    const statusValues = ['DELETE', 'UPDATE', 'UNCHECKED', 'NOCHANGE', 'NEW'];
    const myStatus = this._currentLine.STATUS ? this._currentLine.STATUS.toUpperCase() : this._currentLine.STATUS;

    // must be present and must be one of the preset values (case insensitive)
    if (!this._currentLine.STATUS || this._currentLine.STATUS.length == 0) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.STATUS_ERROR,
        errType: `STATUS_ERROR`,
        error: `STATUS is blank`,
        source: this._currentLine.STATUS,
        name: this._currentLine.LOCALESTID,
      });
      return false;

    } if (!statusValues.includes(myStatus)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.STATUS_ERROR,
        errType: `STATUS_ERROR`,
        error: `The code you have entered for STATUS is incorrect`,
        source: this._currentLine.STATUS,
        name: this._currentLine.LOCALESTID,
      });
      return false;
    } else {
      // helper which returns true if the given LOCALESTID
      const thisEstablishmentExists = (key) => {
        const foundEstablishment = this._allCurrentEstablishments.find(currentEstablishment => {
          return currentEstablishment.key === key;
        });
        return foundEstablishment ? true : false;
      };

      // we have a known status - now validate the status against the known set of all current establishments
      switch (myStatus) {
        case 'NEW':
          if (thisEstablishmentExists(this._key)) {
            this._validationErrors.push({
              name: this._currentLine.LOCALESTID,
              lineNumber: this._lineNumber,
              errCode: Establishment.STATUS_ERROR,
              errType: `STATUS_ERROR`,
              error: `Workplace has a STATUS of NEW but already exists, please use one of the other statuses`,
              source: myStatus,
            });
          }
          break;
        case 'DELETE':
          if (!thisEstablishmentExists(this._key)) {
            this._validationErrors.push({
              name: this._currentLine.LOCALESTID,
              lineNumber: this._lineNumber,
              errCode: Establishment.STATUS_ERROR,
              errType: `STATUS_ERROR`,
              error: 'Workplace has a status of DELETE but does not exist',
              source: myStatus,
            });
          }
          break;
        case 'UNCHECKED':
          if (!thisEstablishmentExists(this._key)) {
            this._validationErrors.push({
              name: this._currentLine.LOCALESTID,
              lineNumber: this._lineNumber,
              errCode: Establishment.STATUS_ERROR,
              errType: `STATUS_ERROR`,
              error: `Workplace has a STATUS of UNCHECKED but does not exist, please change to NEW to add it`,
              source: myStatus,
            });
          }
          break;
        case 'NOCHANGE':
          if (!thisEstablishmentExists(this._key)) {
            this._validationErrors.push({
              name: this._currentLine.LOCALESTID,
              lineNumber: this._lineNumber,
              errCode: Establishment.STATUS_ERROR,
              errType: `STATUS_ERROR`,
              error: `Workplace has a STATUS of NOCHANGE but does not exist, please change to NEW to add it`,
              source: myStatus,
            });
          }
          break;
        case 'UPDATE':
          if (!thisEstablishmentExists(this._key)) {
            this._validationErrors.push({
              name: this._currentLine.LOCALESTID,
              lineNumber: this._lineNumber,
              errCode: Establishment.STATUS_ERROR,
              errType: `STATUS_ERROR`,
              error: `Workplace has a STATUS of UPDATE but does not exist, please change to NEW to add it`,
              source: myStatus,
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

    if (!myName || myName.length == 0) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.NAME_ERROR,
        errType: `NAME_ERROR`,
        error: 'ESTNAME is blank',
        source: myName,
        name: this._currentLine.LOCALESTID,
      });
      return false;
    } else if (myName.length > MAX_LENGTH) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.NAME_ERROR,
        errType: `NAME_ERROR`,
        error: `ESTNAME is longer than ${MAX_LENGTH} characters`,
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
        error: 'ADDRESS1 is blank',
        name: this._currentLine.LOCALESTID,
      });
    } else if (myAddress1.length > MAX_LENGTH) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.ADDRESS_ERROR,
        errType: `ADDRESS_ERROR`,
        error: `ADDRESS1 is longer than ${MAX_LENGTH} characters`,
        source: myAddress1,
        name: this._currentLine.LOCALESTID,
      });
    }

    if (myAddress2 && myAddress2.length > MAX_LENGTH) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.ADDRESS_ERROR,
        errType: `ADDRESS_ERROR`,
        error: `ADDRESS2 is longer than ${MAX_LENGTH} characters`,
        source: myAddress2,
        name: this._currentLine.LOCALESTID,
      });
    }

    if (myAddress3 && myAddress3.length > MAX_LENGTH) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.ADDRESS_ERROR,
        errType: `ADDRESS_ERROR`,
        error: `ADDRESS3 is longer than ${MAX_LENGTH} characters`,
        source: myAddress3,
        name: this._currentLine.LOCALESTID,
      });
    }

    if (myTown && myTown.length > MAX_LENGTH) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.ADDRESS_ERROR,
        errType: `ADDRESS_ERROR`,
        error: `POSTTOWN is longer than ${MAX_LENGTH} characters`,
        source: myTown,
        name: this._currentLine.LOCALESTID,
      });
    }

    // TODO - registration/establishment APIs do not validate postcode (relies on the frontend - this must be fixed)
    const postcodeRegex = /^[A-Za-z]{1,2}[0-9]{1,2}\s{1}[0-9][A-Za-z]{2}$/;
    const POSTCODE_MAX_LENGTH = 10;
    if (!myPostcode || myPostcode.length == 0) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.ADDRESS_ERROR,
        errType: `ADDRESS_ERROR`,
        error: 'POSTCODE has not been supplied',
        source: myPostcode,
        name: this._currentLine.LOCALESTID,
      });
    } else if (myPostcode.length > POSTCODE_MAX_LENGTH) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.ADDRESS_ERROR,
        errType: `ADDRESS_ERROR`,
        error: `POSTCODE is longer than ${POSTCODE_MAX_LENGTH} characters`,
        source: myPostcode,
        name: this._currentLine.LOCALESTID,
      });
    } else if (!postcodeRegex.test(myPostcode)) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.ADDRESS_ERROR,
        errType: `ADDRESS_ERROR`,
        error: `POSTCODE is incorrectly formatted`,
        source: myPostcode,
        name: this._currentLine.LOCALESTID,
      });
    }

    if (localValidationErrors.length > 0) {
      localValidationErrors.forEach(thisValidation => this._validationErrors.push(thisValidation));;
      return false;
    }

    // concatenate the address
    this._address1 = myAddress1;
    this._address2 = myAddress2;
    this._address3 = myAddress3;
    this._town = myTown;
    this._postcode = myPostcode;

    return true;
  }

  _validateEstablishmentType() {
    const myEstablishmentType = parseInt(this._currentLine.ESTTYPE);
    const myOtherEstablishmentType = this._currentLine.OTHERTYPE;

    const localValidationErrors = [];
    if (!this._currentLine.ESTTYPE || this._currentLine.ESTTYPE.length === 0) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.ESTABLISHMENT_TYPE_ERROR,
        errType: `ESTABLISHMENT_TYPE_ERROR`,
        error: "ESTTYPE has not been supplied",
        source: this._currentLine.ESTTYPE,
        name: this._currentLine.LOCALESTID,
      });

    } else if (Number.isNaN(myEstablishmentType)) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.ESTABLISHMENT_TYPE_ERROR,
        errType: `ESTABLISHMENT_TYPE_ERROR`,
        error: "The code you have entered for ESTTYPE is incorrect",
        source: this._currentLine.ESTTYPE,
        name: this._currentLine.LOCALESTID,
      });
    } else if (myEstablishmentType < 1 || myEstablishmentType > 8) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.ESTABLISHMENT_TYPE_ERROR,
        errType: `ESTABLISHMENT_TYPE_ERROR`,
        error: "The code you have entered for ESTTYPE is incorrect",
        source: this._currentLine.ESTTYPE,
        name: this._currentLine.LOCALESTID,
      });
    }

    // if the establishment type is "other" (8), then OTHERTYPE must be defined
    const MAX_LENGTH = 240;
    if (myEstablishmentType === 8 && (!myOtherEstablishmentType || myOtherEstablishmentType.length == 0)) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        warnCode: Establishment.ESTABLISHMENT_TYPE_WARNING,
        warnType: `ESTABLISHMENT_TYPE_WARNING`,
        warning: `OTHERTYPE has not been supplied`,
        source: myOtherEstablishmentType,
        name: this._currentLine.LOCALESTID,
      });
    } else if (myEstablishmentType == 8 && (myOtherEstablishmentType.length > MAX_LENGTH)) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.ESTABLISHMENT_TYPE_ERROR,
        errType: `ESTABLISHMENT_TYPE_ERROR`,
        error: `OTHERTYPE is longer than ${MAX_LENGTH} characters`,
        source: myOtherEstablishmentType,
        name: this._currentLine.LOCALESTID,
      });
    } else if (myEstablishmentType === 8) {
      this._establishmentTypeOther = myOtherEstablishmentType;
    } else if (myEstablishmentType !== 8 && myOtherEstablishmentType && myOtherEstablishmentType.length > 0) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        warnCode: Establishment.ESTABLISHMENT_TYPE_WARNING,
        warnType: `ESTABLISHMENT_TYPE_WARNING`,
        warning: `OTHERTYPE will be ignored`,
        source: myOtherEstablishmentType,
        name: this._currentLine.LOCALESTID,
      });
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
    if (!this._currentLine.PERMCQC || this._currentLine.PERMCQC.length === 0) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.SHARE_WITH_ERROR,
        errType: `SHARE_WITH_ERROR`,
        error: "PERMCQC has not been supplied",
        source: this._currentLine.PERMCQC,
        name: this._currentLine.PERMCQC,
      });
      return false;
    } else if (Number.isNaN(myShareWithCqc)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.SHARE_WITH_ERROR,
        errType: `SHARE_WITH_ERROR`,
        error: "The code you have entered for PERMCQC is incorrect",
        source: this._currentLine.PERMCQC,
        name: this._currentLine.PERMCQC,
      });
      return false;
    } else if (!ALLOWED_VALUES.includes(myShareWithCqc)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.SHARE_WITH_ERROR,
        errType: `SHARE_WITH_ERROR`,
        error: "The code you have entered for PERMCQC is incorrect",
        source: myShareWithCqc,
        name: this._currentLine.PERMCQC,
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
    if (!this._currentLine.PERMLA || this._currentLine.PERMLA.length === 0) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.SHARE_WITH_ERROR,
        errType: `SHARE_WITH_ERROR`,
        error: "PERMLA has not been supplied",
        source: this._currentLine.PERMLA,
        name: this._currentLine.PERMLA,
      });
      return false;
    } else if (Number.isNaN(myShareWithLa)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.SHARE_WITH_ERROR,
        errType: `SHARE_WITH_ERROR`,
        error: "The code you have entered for PERMLA is incorrect",
        source: this._currentLine.PERMLA,
        name: this._currentLine.PERMLA,
      });
      return false;
    } else if (!ALLOWED_VALUES.includes(myShareWithLa)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.SHARE_WITH_ERROR,
        errType: `SHARE_WITH_ERROR`,
        error: "The code you have entered for PERMLA is incorrect",
        source: myShareWithLa,
        name: this._currentLine.PERMLA,
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

      console.log("WA DEBUG - SHARELA validation - this._shareWithLA", this._shareWithLA, listOfLAs, listOfLAs.length)

      if (!isValid) {
        this._validationErrors.push({
          lineNumber: this._lineNumber,
          errCode: Establishment.LOCAL_AUTHORITIES_ERROR,
          errType: `LOCAL_AUTHORITIES_ERROR`,
          error: "An entry for code in SHARELA will be ignored as this is invalid",
          source: this._currentLine.SHARELA,
          name: this._currentLine.LOCALESTID,
        });
        return false;
      } else if (this._shareWithLA !== null && this._shareWithLA === 0 && listOfLAs && listOfLAs.length > 0) {
        this._validationErrors.push({
          lineNumber: this._lineNumber,
          errCode: Establishment.LOCAL_AUTHORITIES_WARNING,
          errType: `LOCAL_AUTHORITIES_WARNING`,
          error: "SHARELAS will be ignored",
          source: this._currentLine.SHARELA,
          name: this._currentLine.LOCALESTID,
        });
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

    if (!this._currentLine.REGTYPE || this._currentLine.REGTYPE.length === 0) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.REGTYPE_ERROR,
        errType: `REGTYPE_ERROR`,
        error: "REGTYPE has not been supplied",
        source: this._currentLine.REGTYPE,
        name: this._currentLine.LOCALESTID,
      });
      return false;
    } else if (Number.isNaN(myRegType) || (myRegType !== 0 && myRegType !== 2)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.REGTYPE_ERROR,
        errType: `REGTYPE_ERROR`,
        error: "The code you have entered for REGTYPE is incorrect",
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
        error: "PROVNUM has not been supplied",
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
        error: "PROVNUM is incorrectly formatted",
        source: myprovID,
        name: this._currentLine.LOCALESTID,
      });
      return false;
    } else if (this._regType !== null && this._regType == 2) {
      this._provID = myprovID;
      return true;
    } else if (this._regType !== null && this._regType == 0 && myprovID && myprovID.length > 0) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        warnCode: Establishment.PROV_ID_WARNING,
        warnType: `PROV_ID_WARNING`,
        warning: "PROVNUM will be ignored as not required for this REGTYPE",
        source: myprovID,
        name: this._currentLine.LOCALESTID,
      });
      return false;
    }
  }

  _validateLocationID() {
    // must be given if "share with CQC" - but if given must be in the format "n-nnnnnnnnn"
    const locationIDRegex = /^[0-9]{1}-[0-9]{8,10}$/;
    const myLocationID = this._currentLine.LOCATIONID;

    // do not use
    const mainServiceIsHeadOffice = this._currentLine.MAINSERVICE && parseInt(this._currentLine.MAINSERVICE, 10) === 72 ? true : false;

    if (this._regType !== null  && this._regType == 2) {
      // ignore location i
      if (!mainServiceIsHeadOffice) {
        if (!myLocationID || myLocationID.length==0) {
          this._validationErrors.push({
            lineNumber: this._lineNumber,
            errCode: Establishment.LOCATION_ID_ERROR,
            errType: `LOCATION_ID_ERROR`,
            error: "LOCATIONID has not been supplied",
            source: myLocationID,
            name: this._currentLine.LOCALESTID,
          });
          return false;
        } else if (!locationIDRegex.test(myLocationID)) {
          this._validationErrors.push({
            lineNumber: this._lineNumber,
            errCode: Establishment.LOCATION_ID_ERROR,
            errType: `LOCATION_ID_ERROR`,
            error: "LOCATIONID is incorrectly formatted",
            source: myLocationID,
            name: this._currentLine.LOCALESTID,
          });
          return false;
        }
      }

      this._locationID = myLocationID;
      return true;
    } else if (this._regType !== null && this._regType == 0 && myLocationID && myLocationID.length > 0) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        warnCode: Establishment.LOCATION_ID_WARNING,
        warnType: `LOCATION_ID_WARNING`,
        warning: "LOCATIONID will be ignored as not required for this REGTYPE",
        source: myLocationID,
        name: this._currentLine.LOCALESTID,
      });
      return false;
    }
  }

  _validateMainService() {
    const myMainService = parseInt(this._currentLine.MAINSERVICE);

    if (!this._currentLine.MAINSERVICE || this._currentLine.MAINSERVICE.length === 0) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.MAIN_SERVICE_ERROR,
        errType: `MAIN_SERVICE_ERROR`,
        error: "MAINSERVICE has not been supplied",
        source: this._currentLine.MAINSERVICE,
        name: this._currentLine.LOCALESTID,
      });
      return false;
    } else if (Number.isNaN(myMainService)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.MAIN_SERVICE_ERROR,
        errType: `MAIN_SERVICE_ERROR`,
        error: "MAINSERVICE has not been supplied",
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
        error: "MAINSERVICE is not included in ALLSERVICES",
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
        error: "There is an empty element in ALLSERVICES",
        source: this._currentLine.ALLSERVICES,
        name: this._currentLine.LOCALESTID,
      });
    } else if (listOfServices.length != listOfServiceDescriptions.length) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.ALL_SERVICES_ERROR,
        errType: `ALL_SERVICES_ERROR`,
        error: "ALLSERVICES/CAPACITY/UTILISATION/SERVICEDESC do not have the same number of items (i.e. numbers and/or semi colons",
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
          if (myServiceOther.length > MAX_LENGTH) {
            localValidationErrors.push({
              lineNumber: this._lineNumber,
              errCode: Establishment.ALL_SERVICES_ERROR,
              errType: `ALL_SERVICES_ERROR`,
              error: `SERVICEDESC(${index+1}) is longer than ${MAX_LENGTH} characters`,
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
    if (this._currentLine.SERVICEUSERS && this._currentLine.SERVICEUSERS.length > 0) {
      const isValid = this._currentLine.SERVICEUSERS.length ? listOfServiceUsers.every(thisService => !Number.isNaN(parseInt(thisService))) : true;
      if (!isValid) {
        localValidationErrors.push({
          lineNumber: this._lineNumber,
          warnCode: Establishment.SERVICE_USERS_WARNING,
          warnType: `SERVICE_USERS_WARNING`,
          warning: "Entry for code in SERVICEUSERS you have supplied will be ignored as this is invalid",
          source: this._currentLine.SERVICEUSERS,
          name: this._currentLine.LOCALESTID,
        });
      } else if (listOfServiceUsers.length != listOfServiceUsersDescriptions.length) {
        localValidationErrors.push({
          lineNumber: this._lineNumber,
          errCode: Establishment.SERVICE_USERS_ERROR,
          errType: `SERVICE_USERS_ERROR`,
          error: "SERVICEUSERS/OTHERUSERDESC do not have the same number of items (i.e. numbers and/or semi colons)",
          source: `${this._currentLine.SERVICEUSERS} - ${this._currentLine.OTHERUSERDESC}`,
          name: this._currentLine.LOCALESTID,
        });
      } else if (isValid) {
        const myServiceUsersDescriptions = [];
        this._allServiceUsers = listOfServiceUsers.map((thisService, index) => {
          const thisServiceIndex = parseInt(thisService, 10);

          // if the service user is one of the many "other" type of services, then need to validate the "other description"
          const otherServiceUsers = [3, 9, 21];   // these are the original budi codes
          if (otherServiceUsers.includes(thisServiceIndex)) {
            const myServiceUserOther = listOfServiceUsersDescriptions[index];
            const MAX_LENGTH = 120;
            if (!myServiceUserOther || myServiceUserOther.length == 0) {
              localValidationErrors.push({
                lineNumber: this._lineNumber,
                warnCode: Establishment.SERVICE_USERS_WARNING,
                warnType: `SERVICE_USERS_WARNING`,
                warning: `OTHERUSERDESC(${index+1}) has not been supplied`,
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
    // optional
    const allJobs = this._currentLine.ALLJOBROLES.split(';');
    const localValidationErrors = [];

    // allJobs can only be empty, if TOTALPERMTEMP is 0
    if (!this._currentLine.ALLJOBROLES || this._currentLine.ALLJOBROLES.length === 0) {
      localValidationErrors.push({
        lineNumber: this._lineNumber,
        warnCode: Establishment.ALL_JOBS_WARNING,
        warnType: `ALL_JOBS_WARNING`,
        warning: "All Job Roles (ALLJOBROLES) missing",
        source: this._currentLine.ALLJOBROLES,
        name: this._currentLine.LOCALESTID,
      });
    } else if (this._currentLine.ALLJOBROLES && this._currentLine.ALLJOBROLES.length > 0) {
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

    if (sumOfLeavers > 0 && this._currentLine.REASONS && this._currentLine.REASONS.length > 0) {
      const allReasons = this._currentLine.REASONS.split(';');
      const allReasonsCounts = this._currentLine.REASONNOS.split(';');

      const localValidationErrors = [];

      if (!allReasons.every(thisCount => !Number.isNaN(parseInt(thisCount)))) {
        localValidationErrors.push({
          lineNumber: this._lineNumber,
          errCode: Establishment.REASONS_FOR_LEAVING_ERROR,
          errType: `REASONS_FOR_LEAVING_ERROR`,
          error: `The REASONS you have supplied has an incorrect code`,
          source: `${this._currentLine.REASONS}`,
          name: this._currentLine.LOCALESTID,
        });
      }

      if (!allReasonsCounts || allReasonsCounts.length==0) {
        localValidationErrors.push({
          lineNumber: this._lineNumber,
          errCode: Establishment.REASONS_FOR_LEAVING_ERROR,
          errType: `REASONS_FOR_LEAVING_ERROR`,
          error: "REASONS/REASONNOS do not have the same number of items (i.e. numbers and/or semi colons)",
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
          error: `REASONS/REASONNOS do not have the same number of items (i.e. numbers and/or semi colons)`,
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
          error: `The total number of REASONNOS you have entered does not equal the total number of LEAVERS`,
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

  preValidate(headers) {
    return this._validateHeaders(headers);
  }

  static isContent(data) {
    const contentRegex = /LOCALESTID,STATUS,ESTNAME,ADDRESS1,ADDRESS2,ADDRES/;
    return contentRegex.test(data.substring(0,50));
  }

  _validateHeaders(headers) {
    // only run once for first line, so check _lineNumber
    if (this._headers_v1.join(',') !== headers) {
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
      error: `LOCALESTID is not unique`,
      source: this._currentLine.LOCALESTID,
      name: this._currentLine.LOCALESTID,
    };
  }

  // add a duplicate validation error to the current set
  addNotOwner() {
    return {
      origin: 'Establishments',
      lineNumber: this._lineNumber,
      errCode: Establishment.NOT_OWNER_ERROR,
      errType: `NOT_OWNER_ERROR`,
      error: `Not the owner`,
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
    };
  }

  // returns true on success, false is any attribute of Establishment fails
  validate() {
    let status = true;

    status = !this._validateLocalisedId() ? false : status;
    status = !this._validateEstablishmentName() ? false : status;
    status = !this._validateStatus() ? false : status;

    // if the status is unchecked or deleted, then don't continue validation
    if (!STOP_VALIDATING_ON.includes(this._status)) {
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
    }

    return status;
  }

  // returns true on success, false is any attribute of Establishment fails
  transform() {
    // if the status is unchecked or deleted, then don't transform
    if (!STOP_VALIDATING_ON.includes(this._status)) {
      let status = true;

      status = !this._transformMainService() ? false : status;
      status = !this._transformEstablishmentType() ? false : status;
      status = !this._transformLocalAuthorities() ? false : status;
      status = !this._transformAllServices() ? false : status;
      status = !this._transformServiceUsers() ? false : status;
      status = !this._transformAllJobs() ? false : status;
      //status = !this._transformReasonsForLeaving() ? false : status;        // interim solution - not transforming reasons for leaving
      status = !this._transformAllCapacities() ? false : status;
      status = !this._transformAllUtilisation() ? false : status;
      status = !this._transformAllVacanciesStartersLeavers() ? false : status;

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
      Address1: this._address1 ? this._address1 : '',
      Address2: this._address2 ? this._address2 : '',
      Address3: this._address3 ? this._address3 : '',
      Town: this._town ? this._town : '',
      Postcode: this._postcode ? this._postcode : '',
      LocationId: this._regType ? this._locationID : undefined,
      ProvId: this._regType ? this._provID : undefined,
      IsCQCRegulated: this._regType !== null & this._regType === 2 ? true : false,
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
      isRegulated: this._regType === 2 ? true : false,
      employerType: {
        value: this._establishmentType,
        other: this._establishmentTypeOther ? this._establishmentTypeOther : undefined,
      },
      localAuthorities: this._localAuthorities ? this._localAuthorities : [],
      mainService: this._mainService,
      services: this._allServices ? this._allServices
        .filter(thisService => this._mainService ? this._mainService.id !== thisService : true )   // main service cannot appear in otherServices
        .map((thisService, index) => {
          const returnThis = {
            id: thisService,
          };

          //console.log("WA DEBUG - this other service: ", thisService, index, this._allServicesOther, this._allServicesOther[index])

          if (this._allServicesOther[index]) {
            returnThis.other = this._allServicesOther[index];
          }

          return returnThis;
        }) : [],
      serviceUsers: this._allServiceUsers ? this._allServiceUsers
        .map((thisService, index) => {
          const returnThis = {
            id: thisService,
          };

          if (this._allServiceUsersOther[index]) {
            returnThis.other = this._allServiceUsersOther[index];
          }

          return returnThis;
        }) : [],
      numberOfStaff: this._totalPermTemp,
      vacancies: this._vacancies ? this._vacancies : 'None',
      starters: this._starters ? this._starters : 'None',
      leavers: this.leavers ? this.leavers : 'None',
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
    this._capacities &&Array.isArray(this._capacities) ? this._capacities.forEach(thisCapacity => changeProperties.capacities.push(thisCapacity)) : true;
    this._utilisations && Array.isArray(this._utilisations) ? this._utilisations.forEach(thisUtilisation => changeProperties.capacities.push(thisUtilisation)) : true;

    // clean up empty properties
    if (changeProperties.capacities.length == 0) {
      changeProperties.capacities = [];
    }
    if (changeProperties.services && changeProperties.services.length == 0) {
      changeProperties.services = [];
    }

    return {
      ...fixedProperties,
      ...changeProperties,
    };
  }

  // maps Entity (API) validation messages to bulk upload specific messages (using Entity property name)
  addAPIValidations(errors, warnings) {
    // disable the integration of any API errors - they can't be propertly matched to bulk upload validations
/*     errors.forEach(thisError => {
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
            // validationError.errCode = Establishment.ADDRESS_ERROR;
            // validationError.errType = 'ADDRESS_ERROR';
            // validationError.source  = `${this._currentLine.ADDRESS1},${this._currentLine.ADDRESS2},${this._currentLine.ADDRESS3},${this._currentLine.POSTTOWN},${this._currentLine.POSTCODE}`;
            validationError.errCode = null; // ignore
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

        validationError.errCode ? this._validationErrors.push(validationError) : true;
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

        validationWarning.warnCode ? this._validationErrors.push(validationWarning) : true;
      }) : true;
    }); */

  };

  _csvQuote(toCsv) {
    if (toCsv && toCsv.replace(/ /g, '').match(/[\s,"]/)) {
      return '"' + toCsv.replace(/"/g, '""') + '"';
    } else {
      return toCsv;
    }
  }

  // takes the given establishment entity and writes it out to CSV string (one line)
  toCSV(entity) {
    // ["LOCALESTID","STATUS","ESTNAME","ADDRESS1","ADDRESS2","ADDRESS3","POSTTOWN","POSTCODE","ESTTYPE","OTHERTYPE","PERMCQC","PERMLA","SHARELA","REGTYPE","PROVNUM","LOCATIONID","MAINSERVICE","ALLSERVICES","CAPACITY","UTILISATION","SERVICEDESC","SERVICEUSERS","OTHERUSERDESC","TOTALPERMTEMP","ALLJOBROLES","STARTERS","LEAVERS","VACANCIES","REASONS","REASONNOS"]
    const columns = [];
    columns.push(this._csvQuote(entity.localIdentifier));   // todo - this will be local identifier
    columns.push('UNCHECKED');
    columns.push(this._csvQuote(entity.name));
    columns.push(this._csvQuote(entity.address1));
    columns.push(this._csvQuote(entity.address2));
    columns.push(this._csvQuote(entity.address3));
    columns.push(this._csvQuote(entity.town));
    columns.push(entity.postcode);

    if (entity.employerType) {
      switch (entity.employerType.value) {
        case 'Private Sector':
          columns.push(6);
          break;
        case 'Voluntary / Charity':
          columns.push(7);
          break;
        case 'Other':
          columns.push(8);
          break;
        case 'Local Authority (generic/other)':
          columns.push(3);
          break;
        case 'Local Authority (adult services)':
          columns.push(1);
          break;
      }
      if (entity.employerType.other) {
        columns.push(this._csvQuote(entity.employerType.other))
      } else {
        columns.push('');
      }
    } else {
      columns.push('');
      columns.push('');
    }

    // share with CQC/LA, LAs sharing with
    const shareWith = entity.shareWith;
    const shareWithLA = entity.shareWithLA;
    columns.push(shareWith && shareWith.enabled && shareWith.with.includes('CQC') ? 1 : 0);
    columns.push(shareWith && shareWith.enabled && shareWith.with.includes('Local Authority') ? 1 : 0);
    columns.push(shareWith && shareWith.enabled && shareWith.with.includes('Local Authority') && shareWithLA && Array.isArray(shareWithLA) ? shareWithLA.map(thisLA => thisLA.cssrId).join(';') : '')

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
    otherServices.unshift(mainService)
    columns.push(otherServices.map(thisService => BUDI.services(BUDI.FROM_ASC, thisService.id)).join(';'));

    // capacities and utilisations - these are semi colon delimited in the order of ALLSERVICES (so main service and other services) - empty if not a capacity or a utilisation
    const entityCapacities = entity.capacities ? entity.capacities.map(thisCap => {
        const isCapacity = BUDI.serviceFromCapacityId(thisCap.reference.id);
        const isUtilisation = BUDI.serviceFromUtilisationId(thisCap.reference.id);

        return {
          isUtilisation: isUtilisation !== null ? true : false,
          isCapacity: isCapacity !== null ? true : false,
          serviceId: isCapacity !== null ? isCapacity : isUtilisation,
          answer: thisCap.answer,
        };
      }) : [];

    // for CSV output, the capacities need to be separated from utilisations

    // the capacities must be written out in the same sequence of semi-colon delimited values as ALLSERVICES
    columns.push(otherServices.map(thisService => {
      // capacities only
      const matchedCapacityForGivenService = entityCapacities.find(thisCap => thisCap.isCapacity && thisCap.serviceId == thisService.id);
      return matchedCapacityForGivenService ? matchedCapacityForGivenService.answer : ''
    }).join(';'));
    columns.push(otherServices.map(thisService => {
      // capacities only
      const matchedUtilisationForGivenService = entityCapacities.find(thisCap => thisCap.isUtilisation && thisCap.serviceId == thisService.id);
      return matchedUtilisationForGivenService ? matchedUtilisationForGivenService.answer : ''
    }).join(';'));

    // all service "other" descriptions
    columns.push(otherServices.map(thisService => thisService.other && thisService.other.length > 0 ? thisService.other : '').join(';'));

    // service users and their 'other' descriptions
    const serviceUsers = entity.serviceUsers ? entity.serviceUsers : [];
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
    if (entity.starters && !Array.isArray(entity.starters)) {
      if (entity.starters === 'None' && entity.leavers === 'None' && entity.vacancies === 'None') {
        columns.push('0');
      } else if (entity.starters === 'None') {
        columns.push(uniqueJobs.map(x => 0).join(';'));
      } else if (entity.starters === 'Don\'t know') {
        columns.push(999);
      } else {
        columns.push('');
      }
    } else {
      columns.push(uniqueJobs.map(thisJob => {
        const isThisJobAStarterJob = entity.starters.find(myStarter => myStarter.jobId === thisJob);
        if (isThisJobAStarterJob) {
          return isThisJobAStarterJob.total;
        } else {
          return 0;
        }
      }).join(';'));
    }
    if (entity.leavers && !Array.isArray(entity.leavers)) {
      if (entity.starters === 'None' && entity.leavers === 'None' && entity.vacancies === 'None') {
        columns.push('0');
      } else if (entity.leavers === 'None') {
        columns.push(uniqueJobs.map(x => 0).join(';'));
      } else if (entity.leavers === 'Don\'t know') {
        columns.push(999);
      } else  {
        columns.push('');
      }
    } else {
      columns.push(uniqueJobs.map(thisJob => {
        const isThisJobALeaverJob = entity.leavers.find(myLeaver => myLeaver.jobId === thisJob);
        if (isThisJobALeaverJob) {
          return isThisJobALeaverJob.total;
        } else {
          return 0;
        }
      }).join(';'));
    }
    if (entity.vacancies && !Array.isArray(entity.vacancies)) {
      if (entity.starters === 'None' && entity.leavers === 'None' && entity.vacancies === 'None') {
        columns.push('0');
      } else if (entity.vacancies === 'None') {
        columns.push(uniqueJobs.map(x => 0).join(';'));
      } else if (entity.vacancies === 'Don\'t know') {
        columns.push(999);
      } else {
        columns.push('');
      }
    } else {
      columns.push(uniqueJobs.map(thisJob => {
        const isThisJobAVacancyJob = entity.vacancies.find(myVacancy => myVacancy.jobId === thisJob);
        if (isThisJobAVacancyJob) {
          return isThisJobAVacancyJob.total;
        } else {
          return 0;
        }
      }).join(';'));
    }

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
  };

};

module.exports.Establishment = Establishment;
