const expect = require('chai').expect;
const {
  checkAndUpdateWorkerValuesForReport,
  updateProps,
} = require('../../../../../routes/reports/wdf/checkAndUpdateWorkerValuesForReport');
const WdfCalculator = require('../../../../../models/classes/wdfCalculator').WdfCalculator;

describe('checkAndUpdateWorkerValuesForReport', () => {
  let workersArray = [
    {
      NameOrIdValue: 'Team Leader',
      NameValue: 'Sab Child WDF Meet',
      EstablishmentID: 4087,
      DataOwner: 'Parent',
      DataPermissions: 'Workplace and Staff',
      GenderValue: "Don't know",
      DateOfBirthValue: '11/11/1995',
      HoursValue: null,
      WdfEligible: true,
      LastWdfEligibility: '2024-10-14T14:37:34.172Z',
    },
  ];

  const resetProperties = () => {
    workersArray[0].WeeklyHoursContractedHours = null;
    workersArray[0].WeeklyHoursContractedValue = null;
    workersArray[0].ContractValue = null;
  };

  beforeEach(() => {
    resetProperties();
  });

  describe('QualificationInSocialCare', () => {
    ['No', "Don't know"].forEach((value) => {
      it(`updates if QualificationInSocialCareValue is ${value}`, async () => {
        workersArray[0].QualificationInSocialCareValue = value;

        let updatedWorkersArray = checkAndUpdateWorkerValuesForReport(workersArray);

        expect(updatedWorkersArray[0].QualificationInSocialCare).to.equal('N/A');
      });

      it(`should not update if QualificationInSocialCareValue is Yes`, async () => {
        workersArray[0].QualificationInSocialCareValue = 'Yes';
        workersArray[0].QualificationInSocialCare = "Don't know";

        let updatedWorkersArray = checkAndUpdateWorkerValuesForReport(workersArray);

        expect(updatedWorkersArray[0].QualificationInSocialCare).to.equal("Don't know");
      });
    });
  });

  describe('AnnualHourlyPayRate', () => {
    it(`updates if AnnualHourlyPayRate is "Don't know"`, async () => {
      workersArray[0].AnnualHourlyPayRate = "Don't know";

      let updatedWorkersArray = checkAndUpdateWorkerValuesForReport(workersArray);

      expect(updatedWorkersArray[0].AnnualHourlyPayRate).to.equal('N/A');
    });

    it(`updates if AnnualHourlyPayValue is "Don't know"`, async () => {
      workersArray[0].AnnualHourlyPayValue = "Don't know";

      let updatedWorkersArray = checkAndUpdateWorkerValuesForReport(workersArray);

      expect(updatedWorkersArray[0].AnnualHourlyPayRate).to.equal('N/A');
    });

    ['Annually', 'Hourly'].forEach((value, index) => {
      const pay = ['30000', '10.40'];
      it(`does not update if AnnualHourlyPayValue ${value}`, async () => {
        workersArray[0].AnnualHourlyPayRate = value;
        workersArray[0].AnnualHourlyPayValue = pay[index];

        let updatedWorkersArray = checkAndUpdateWorkerValuesForReport(workersArray);

        expect(updatedWorkersArray[0].AnnualHourlyPayRate).to.equal(value);
        expect(updatedWorkersArray[0].AnnualHourlyPayValue).to.equal(pay[index]);
      });
    });
  });

  describe('DaysSickValue', () => {
    it(`updates DaysSickValue to "Don't know" if the value is 'No'`, async () => {
      workersArray[0].DaysSickValue = 'No';

      let updatedWorkersArray = checkAndUpdateWorkerValuesForReport(workersArray);

      expect(updatedWorkersArray[0].DaysSickValue).to.equal("Don't know");
    });

    it(`updates DaysSickValue to DaysSickDays if the value is 'Yes'`, async () => {
      workersArray[0].DaysSickValue = 'Yes';
      workersArray[0].DaysSickDays = 4;

      let updatedWorkersArray = checkAndUpdateWorkerValuesForReport(workersArray);

      expect(updatedWorkersArray[0].DaysSickValue).to.equal(4);
    });

    ['Agency', 'Pool/Bank'].forEach((value) => {
      it(`updates to 'N/A when ContractValue is ${value}`, async () => {
        workersArray[0].ContractValue = value;

        let updatedWorkersArray = checkAndUpdateWorkerValuesForReport(workersArray);

        expect(updatedWorkersArray[0].DaysSickValue).to.equal('N/A');
      });
    });
  });

  describe('RecruitedFromValue', () => {
    it(`updates RecruitedFromValue to "Don't know" if the value is 'No'`, async () => {
      workersArray[0].RecruitedFromValue = 'No';

      let updatedWorkersArray = checkAndUpdateWorkerValuesForReport(workersArray);

      expect(updatedWorkersArray[0].RecruitedFromValue).to.equal("Don't know");
    });

    it(`updates RecruitedFromValue to From if the value is 'Yes'`, async () => {
      workersArray[0].RecruitedFromValue = 'Yes';
      workersArray[0].From = 'Adult care sector: local authority';

      let updatedWorkersArray = checkAndUpdateWorkerValuesForReport(workersArray);

      expect(updatedWorkersArray[0].RecruitedFromValue).to.equal('Adult care sector: local authority');
    });
  });

  describe('NationalityValue', () => {
    it(`updates NationalityValue to Nationality if NationalityValue is 'Other'`, async () => {
      workersArray[0].NationalityValue = 'Other';
      workersArray[0].Nationality = 'Portuguese';

      let updatedWorkersArray = checkAndUpdateWorkerValuesForReport(workersArray);

      expect(updatedWorkersArray[0].NationalityValue).to.equal('Portuguese');
    });

    it(`does not update NationalityValue if NationalityValue is 'Other' and Nationality is null`, async () => {
      workersArray[0].NationalityValue = 'Other';
      workersArray[0].Nationality = null;

      let updatedWorkersArray = checkAndUpdateWorkerValuesForReport(workersArray);

      expect(updatedWorkersArray[0].NationalityValue).to.equal('Other');
    });

    it(`does not update NationalityValue if NationalityValue is not 'Other'`, async () => {
      workersArray[0].NationalityValue = 'British';
      workersArray[0].Nationality = null;

      let updatedWorkersArray = checkAndUpdateWorkerValuesForReport(workersArray);

      expect(updatedWorkersArray[0].NationalityValue).to.equal('British');
    });
  });

  describe('HoursValue', () => {
    ['Permanent', 'Temporary'].forEach((value) => {
      describe('when ZeroHoursContractValue is No', () => {
        it(`updates the HoursValue to WeeklyHoursContractedHours if ContractValue is ${value} and WeeklyHoursContractedValue is "Yes"`, async () => {
          workersArray[0].ZeroHoursContractValue = 'No';
          workersArray[0].ContractValue = value;
          workersArray[0].WeeklyHoursContractedHours = '35.0';
          workersArray[0].WeeklyHoursContractedValue = 'Yes';

          let updatedWorkersArray = checkAndUpdateWorkerValuesForReport(workersArray);

          expect(updatedWorkersArray[0].HoursValue).to.equal('35.0');
        });

        it(`updates the HoursValue to "Don't know" if ContractValue is ${value} and WeeklyHoursContractedValue is "No"`, async () => {
          workersArray[0].ZeroHoursContractValue = 'No';
          workersArray[0].ContractValue = value;
          workersArray[0].WeeklyHoursContractedHours = null;
          workersArray[0].WeeklyHoursContractedValue = 'No';

          let updatedWorkersArray = checkAndUpdateWorkerValuesForReport(workersArray);

          expect(updatedWorkersArray[0].HoursValue).to.equal("Don't know");
        });

        it(`updates the HoursValue to "Missing" if ContractValue is ${value} and WeeklyHoursContractedValue is null`, async () => {
          workersArray[0].ZeroHoursContractValue = 'No';
          workersArray[0].ContractValue = value;
          workersArray[0].WeeklyHoursContractedHours = null;
          workersArray[0].WeeklyHoursContractedValue = null;

          let updatedWorkersArray = checkAndUpdateWorkerValuesForReport(workersArray);

          expect(updatedWorkersArray[0].HoursValue).to.equal('Missing');
        });
      });
    });

    ['Permanent', 'Temporary', 'Pool/Bank', 'Agency', 'Other'].forEach((value) => {
      describe('when ZeroHoursContractValue is Yes', () => {
        it(`updates the HoursValue to WeeklyHoursAverageHours if ContractValue is ${value} and WeeklyHoursAverageValue is "Yes"`, async () => {
          workersArray[0].ZeroHoursContractValue = 'Yes';
          workersArray[0].ContractValue = value;
          workersArray[0].WeeklyHoursAverageHours = '35.0';
          workersArray[0].WeeklyHoursAverageValue = 'Yes';

          let updatedWorkersArray = checkAndUpdateWorkerValuesForReport(workersArray);

          expect(updatedWorkersArray[0].HoursValue).to.equal('35.0');
        });

        it(`updates the HoursValue to "Don't know" if ContractValue is ${value} and WeeklyHoursAverageValue is "No"`, async () => {
          workersArray[0].ZeroHoursContractValue = 'Yes';
          workersArray[0].ContractValue = value;
          workersArray[0].WeeklyHoursAverageHours = null;
          workersArray[0].WeeklyHoursAverageValue = 'No';

          let updatedWorkersArray = checkAndUpdateWorkerValuesForReport(workersArray);

          expect(updatedWorkersArray[0].HoursValue).to.equal("Don't know");
        });

        it(`updates the HoursValue to "Missing" if ContractValue is ${value} and WeeklyHoursAverageValue is null`, async () => {
          workersArray[0].ZeroHoursContractValue = 'Yes';
          workersArray[0].ContractValue = value;
          workersArray[0].WeeklyHoursAverageHours = null;
          workersArray[0].WeeklyHoursAverageValue = null;

          let updatedWorkersArray = checkAndUpdateWorkerValuesForReport(workersArray);

          expect(updatedWorkersArray[0].HoursValue).to.equal('Missing');
        });
      });

      describe("when ZeroHoursContractValue is Don't know", () => {
        it(`updates the HoursValue to WeeklyHoursAverageHours if ContractValue is ${value} and WeeklyHoursAverageValue is "Yes"`, async () => {
          workersArray[0].ZeroHoursContractValue = "Don't know";
          workersArray[0].ContractValue = value;
          workersArray[0].WeeklyHoursAverageHours = '35.0';
          workersArray[0].WeeklyHoursAverageValue = 'Yes';

          let updatedWorkersArray = checkAndUpdateWorkerValuesForReport(workersArray);

          expect(updatedWorkersArray[0].HoursValue).to.equal('35.0');
        });

        it(`updates the HoursValue to "Don't know" if ContractValue is ${value} and WeeklyHoursAverageValue is "No"`, async () => {
          workersArray[0].ZeroHoursContractValue = "Don't know";
          workersArray[0].ContractValue = value;
          workersArray[0].WeeklyHoursAverageHours = null;
          workersArray[0].WeeklyHoursAverageValue = 'No';

          let updatedWorkersArray = checkAndUpdateWorkerValuesForReport(workersArray);

          expect(updatedWorkersArray[0].HoursValue).to.equal("Don't know");
        });

        it(`updates the HoursValue to "Missing" if ContractValue is ${value} and WeeklyHoursAverageValue is null`, async () => {
          workersArray[0].ZeroHoursContractValue = "Don't know";
          workersArray[0].ContractValue = value;
          workersArray[0].WeeklyHoursAverageHours = null;
          workersArray[0].WeeklyHoursAverageValue = null;

          let updatedWorkersArray = checkAndUpdateWorkerValuesForReport(workersArray);

          expect(updatedWorkersArray[0].HoursValue).to.equal('Missing');
        });
      });
    });

    ['Pool/Bank', 'Agency', 'Other'].forEach((value) => {
      describe('when ZeroHoursContractValue is No', () => {
        it(`updates the HoursValue to WeeklyHoursAverageHours if ContractValue is ${value} and WeeklyHoursAverageValue is "Yes"`, async () => {
          workersArray[0].ZeroHoursContractValue = 'No';
          workersArray[0].ContractValue = value;
          workersArray[0].WeeklyHoursAverageHours = '35.0';
          workersArray[0].WeeklyHoursAverageValue = 'Yes';

          let updatedWorkersArray = checkAndUpdateWorkerValuesForReport(workersArray);

          expect(updatedWorkersArray[0].HoursValue).to.equal('35.0');
        });

        it(`updates the HoursValue to "Don't know" if ContractValue is ${value} and WeeklyHoursAverageValue is "No"`, async () => {
          workersArray[0].ZeroHoursContractValue = 'No';
          workersArray[0].ContractValue = value;
          workersArray[0].WeeklyHoursAverageHours = null;
          workersArray[0].WeeklyHoursAverageValue = 'No';

          let updatedWorkersArray = checkAndUpdateWorkerValuesForReport(workersArray);

          expect(updatedWorkersArray[0].HoursValue).to.equal("Don't know");
        });

        it(`updates the HoursValue to "Missing" if ContractValue is ${value} and WeeklyHoursAverageValue is null`, async () => {
          workersArray[0].ZeroHoursContractValue = 'No';
          workersArray[0].ContractValue = value;
          workersArray[0].WeeklyHoursAverageHours = null;
          workersArray[0].WeeklyHoursAverageValue = null;

          let updatedWorkersArray = checkAndUpdateWorkerValuesForReport(workersArray);

          expect(updatedWorkersArray[0].HoursValue).to.equal('Missing');
        });
      });
    });
  });

  it('should update the WdfEligible property', async () => {
    WdfCalculator.effectiveDate = new Date('2022-05-13T09:27:34.471Z');

    let updatedWorkersArray = checkAndUpdateWorkerValuesForReport(workersArray);

    expect(updatedWorkersArray[0].WdfEligible).to.equal(true);
  });

  describe('properties in updateProps array', () => {
    updateProps.forEach((prop) => {
      it(`should update ${prop} property to "Missing" if it has a null value`, async () => {
        workersArray[0][prop] = null;

        let updatedWorkersArray = checkAndUpdateWorkerValuesForReport(workersArray);

        expect(updatedWorkersArray[0][prop]).to.equal('Missing');
      });
    });
  });
});
