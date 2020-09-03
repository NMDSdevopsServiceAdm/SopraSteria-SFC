// encapsulates all properties of a worker, by returning a PropertyManager
const Manager = require('../properties/manager');

// individual properties
const contractProperty = require('./properties/contractProperty').WorkerContractProperty;
const nameOrIdProperty = require('./properties/nameOfIdProperty').WorkerNameOrIdProperty;
const mainJobProperty = require('./properties/mainJobProperty').WorkerMainJobProperty;
const approvedMentalHealthWorkerProperty = require('./properties/approvedMentalHealthWorkerProperty').WorkerApprovedMentalHealthWorkerProperty;
const mainJobStartDateProperty = require('./properties/mainJobStartDateProperty').WorkerMainJobStartDateProperty;
const nationalInsuranceProperty = require('./properties/nationalInsuranceProperty').WorkerNationalInsuranceNumberProperty;
const postcodeProperty = require('./properties/postcodeProperty').WorkerPostcodeProperty;
const dateOfBirthProperty = require('./properties/dateOfBirthProperty').WorkerDateOfBirthProperty;
const genderProperty = require('./properties/genderProperty').WorkerGenderProperty;
const disabilityProperty = require('./properties/disabilityProperty').WorkerDisabilityProperty;
const ethnicityProperty = require('./properties/ethnicityProperty').WorkerEthnicityProperty;
const nationalityProperty = require('./properties/nationalityProperty').WorkerNationalityProperty;
const countryProperty = require('./properties/countryProperty').WorkerCountryProperty;
const recruitedFromProperty = require('./properties/recruitedFromProperty').WorkerRecruitedFromProperty;
const socialCareQualificationProperty = require('./properties/socialCareQualificationProperty').WorkerSocialCareQualificationProperty;
const britishCitizenshipProperty = require('./properties/britishCitizenshipProperty').WorkerBritishCitizenshipProperty;
const yearOfArrivalProperty = require('./properties/yearArrivedProperty').WorkerYearArrivedProperty;
const socialCareStartDateProperty = require('./properties/socialCareStartDateProperty').WorkerSocialCareStartDateProperty;
const otherJobsProperty = require('./properties/otherJobsProperty').WorkerOtherJobsProperty;
const daysSickProperty = require('./properties/daysSickProperty').WorkerDaysSickProperty;
const zeroHoursProperty = require('./properties/zeroContractProperty').WorkerZeroContractProperty;
const weeklyHoursAverageProperty = require('./properties/weeklyHoursAverageProperty').WorkerWeeklyHoursAverageProperty;
const weeklyHoursContractedProperty = require('./properties/weeklyHoursContractedProperty').WorkerWeeklyHoursContractedProperty;
const annualHourlyPayProperty = require('./properties/annualHourlyPayProperty').WorkerAnnualHourlyPayProperty;
const careCertificateProperty = require('./properties/careCertificateProperty').WorkerCareCertificateProperty;
const apprenticeshipProperty = require('./properties/apprenticeshipTrainingProperty').WorkerApprenticeshipTrainingProperty;
const qualificationInSocialCareProperty = require('./properties/qualificationInSocialCareProperty').WorkerQualificationInSocialCareProperty;
const otherQualificationProperty = require('./properties/otherQualificationProperty').WorkerOtherQualificationProperty;
const highestQualificationProperty = require('./properties/highestQualificationProperty').WorkerHighestQualificationProperty;
const completedProperty = require('./properties/completedProperty').WorkerCompletedProperty;
const registeredNurseProperty = require('./properties/registeredNurseProperty').RegisteredNurseProperty;
const nurseSpecialismProperty = require('./properties/nurseSpecialismProperty').NurseSpecialismProperty;
const localIdentifierProperty = require('./properties/localIdentifierProperty').LocalIdentifierProperty;
const establishmentFkProperty = require('./properties/establishmentFkProperty').EstablishmentFkProperty;
const fluJabProperty = require('./properties/fluJabProperty').WorkerFluJabProperty;

class WorkerPropertyManager {
    constructor() {
        this._thisManager = new Manager.PropertyManager();

        this._thisManager.registerProperty(completedProperty);
        this._thisManager.registerProperty(contractProperty);
        this._thisManager.registerProperty(nameOrIdProperty);
        this._thisManager.registerProperty(mainJobProperty);
        this._thisManager.registerProperty(approvedMentalHealthWorkerProperty);
        this._thisManager.registerProperty(mainJobStartDateProperty);
        this._thisManager.registerProperty(otherJobsProperty);
        this._thisManager.registerProperty(nationalInsuranceProperty);
        this._thisManager.registerProperty(postcodeProperty);
        this._thisManager.registerProperty(dateOfBirthProperty);
        this._thisManager.registerProperty(genderProperty);
        this._thisManager.registerProperty(disabilityProperty);
        this._thisManager.registerProperty(ethnicityProperty);
        this._thisManager.registerProperty(nationalityProperty);
        this._thisManager.registerProperty(britishCitizenshipProperty);
        this._thisManager.registerProperty(countryProperty);
        this._thisManager.registerProperty(yearOfArrivalProperty);
        this._thisManager.registerProperty(recruitedFromProperty);
        this._thisManager.registerProperty(socialCareStartDateProperty);
        this._thisManager.registerProperty(daysSickProperty);
        this._thisManager.registerProperty(zeroHoursProperty);
        this._thisManager.registerProperty(weeklyHoursAverageProperty);
        this._thisManager.registerProperty(weeklyHoursContractedProperty);
        this._thisManager.registerProperty(annualHourlyPayProperty);
        this._thisManager.registerProperty(careCertificateProperty);
        this._thisManager.registerProperty(apprenticeshipProperty);
        this._thisManager.registerProperty(qualificationInSocialCareProperty);
        this._thisManager.registerProperty(socialCareQualificationProperty);
        this._thisManager.registerProperty(otherQualificationProperty);
        this._thisManager.registerProperty(highestQualificationProperty);
        this._thisManager.registerProperty(registeredNurseProperty);
        this._thisManager.registerProperty(nurseSpecialismProperty);
        this._thisManager.registerProperty(localIdentifierProperty);
        this._thisManager.registerProperty(establishmentFkProperty);
        this._thisManager.registerProperty(fluJabProperty);
    }

    get manager() {
        return this._thisManager;
    }

}

exports.WorkerPropertyManager = WorkerPropertyManager;
exports.SEQUELIZE_DOCUMENT = Manager.PropertyManager.SEQUELIZE_DOCUMENT;
exports.JSON_DOCUMENT = Manager.PropertyManager.JSON_DOCUMENT;
