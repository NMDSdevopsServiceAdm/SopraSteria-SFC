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

    this._provID = null;
    this._locationID = null;

    this._mainService = null;
    this._allServices = null;
    this._allServicesOther = null;

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
  static get PROV_ID_ERROR() { return 1100; }
  static get LOCATION_ID_ERROR() { return 1110; }
  static get ALL_SERVICES_ERROR() { return 1120; }

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


  get mainService() {
    return this._mainService;
  }
  get alLServices() {
    return this._allServices;
  }
  get alLServicesOther() {
    return this._allServicesOther;
  }
  get establishmentType() {
    return this._establishmentType;
  }
  get establishmentTypeOther() {
    return this._establishmentTypeOther;
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

  get provId() {
    return this._provID;
  }
  get locationId() {
    return this._locationID;
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
      this._validationErrors.push(localValidationErrors);
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
      this._validationErrors.push(localValidationErrors);
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

  _validateProvID() {
    // must be given if "share with CQC" - but if given must be in the format "n-nnnnnnnnn"
    const provIDRegex = /^[0-9]{1}\-[0-9]{8}$/;
    const myprovID = this._currentLine.PROVNUM;
    if (this._shareWithCqc && (!myprovID || myprovID.length==0)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.PROV_ID_ERROR,
        errType: `PROV_ID_ERROR`,
        error: "Prov ID (PROVNUM) must be given as this workplace is CQC regulated",
        source: myprovID,
      });
      return false;
    }
    else if (this._shareWithCqc && !provIDRegex.test(myprovID)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.PROV_ID_ERROR,
        errType: `PROV_ID_ERROR`,
        error: "Prov ID (PROVNUM) must be in the format 'n-nnnnnnnnn'",
        source: myprovID,
      });
      return false;
    } else if (this._shareWithCqc) {
      this._provID = myprovID;
      return true;
    }
  }

  _validateLocationID() {
    // must be given if "share with CQC" - but if given must be in the format "n-nnnnnnnnn"
    const locationIDRegex = /^[0-9]{1}-[0-9]{8}$/;
    const myLocationID = this._currentLine.PROVNUM;

    if (this._shareWithCqc && (!myLocationID || myLocationID.length==0)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.LOCATION_ID_ERROR,
        errType: `LOCATION_ID_ERROR`,
        error: "Location ID (PROVNUM) must be given as this workplace is CQC regulated",
        source: myLocationID,
      });
      return false;
    }
    else if (this._shareWithCqc && !locationIDRegex.test(myLocationID)) {
      this._validationErrors.push({
        lineNumber: this._lineNumber,
        errCode: Establishment.LOCATION_ID_ERROR,
        errType: `LOCATION_ID_ERROR`,
        error: "Location ID (PROVNUM) must be in the format 'n-nnnnnnnnn'",
        source: myLocationID,
      });
      return false;
    } else if (this._shareWithCqc) {
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

        // if the main service is one of the many "other" type of services, then need to validate the "other description"
        const otherServices = [5, 7, 12, 21, 52, 71, 72, 75];   // these are the original budi codes
        if (otherServices.includes(thisServiceIndex)) {
          console.log("WA DEBUG - matched on an other service")
          const myMainServiceOther = listOfServiceDescriptions[index];
          if (!myMainServiceOther || myMainServiceOther.length == 0) {
            localValidationErrors.push({
              lineNumber: this._lineNumber,
              errCode: Establishment.ALL_SERVICES_ERROR,
              errType: `ALL_SERVICES_ERROR`,
              error: `All Services (ALLSERVICES:${index+1}) is an other and consequently (SERVICEDESC:${index+1}) must be defined`,
              source: `${this._currentLine.SERVICEDESC} - ${listOfServiceDescriptions[index]}`,
            });
            myServiceDescriptions.push(null);
          } else {
            myServiceDescriptions.push(listOfServiceDescriptions[index]);
          }
        } else {
          myServiceDescriptions.push(null);
        }

        return thisServiceIndex;
      });
    }

    if (localValidationErrors.length > 0) {
      this._validationErrors.push(localValidationErrors);
      return false;
    }

    return true;
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


  _transformEstablishmentType() {
    // integer in source; enum in target
    if (this._establishmentType) {
      const mappedType = BUDI.establishmentType(BUDI.TO_ASC, this._establishmentType);
      this._establishmentType = mappedType.type;

      if (this._establishmentTypeOther === null && mappedType.type === 'Other' && mappedType.other) {
        this._establishmentTypeOther = mappedType.other;
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

    // ignoring REGTYPE

    status = !this._validateProvID() ? false : status;
    status = !this._validateLocationID() ? false : status;


    status = !this._validateMainService() ? false : status;
    status = !this._validateAllServices() ? false : status;

    return status;
  }

  // returns true on success, false is any attribute of Establishment fails
  transform() {
    let status = true;

    status = !this._transformMainService() ? false : status;
    status = !this._transformEstablishmentType() ? false : status;
    status = !this._transformLocalAuthorities() ? false : status;
    status = !this._transformAllServices() ? false : status;

    return status;
  }

  toJSON() {
    return JSON.stringify({
      name: this._name,
      address: this._address,
      postcode: this._postcode,
      employerType: this._establishmentType,
      employerTypeOther: this._establishmentTypeOther ? this._establishmentTypeOther : undefined,
      shareWithCQC: this._shareWithCqc,
      shareWithLA: this._shareWithLA,
      localAuthorities: this._localAuthorities ? this._localAuthorities : undefined,
      locationId: this._shareWithCqc ? this._locationID : undefined,
      provId: this._shareWithCqc ? this._provID : undefined,
      mainService: {
        id: this._mainService
      },
      allServices: this._allServices.map((thisService, index) => {
        const returnThis = {
          id: thisService,
        };

        // if (this._allServicesOther[index]) {
        //   returnThis.other = this._allServicesOther[index];
        // }

        return returnThis;
      }),

    }, null, 4);
  };

  get validationErrors() {
    return this._validationErrors;
  };
};

module.exports.Establishment = Establishment;
