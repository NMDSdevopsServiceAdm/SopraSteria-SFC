import lodash from 'lodash';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideRouter, RouterModule } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { InternationalRecruitmentService } from '@core/services/international-recruitment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { establishmentBuilder } from '@core/test-utils/MockEstablishmentService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { workerBuilder } from '@core/test-utils/MockWorkerService';
import { SummaryRecordChangeComponent } from '@shared/components/summary-record-change/summary-record-change.component';
import { SharedModule } from '@shared/shared.module';
import { render, within } from '@testing-library/angular';

import { EmploymentComponent } from './employment.component';

describe('EmploymentComponent', () => {
  async function setup(overrides: any = {}) {
    const workerOverrides = overrides.worker ?? {};
    const workplaceOverrides = overrides.workplace ?? {};

    const setupTools = await render(EmploymentComponent, {
      imports: [SharedModule, RouterModule, HttpClientTestingModule],
      declarations: [SummaryRecordChangeComponent],
      providers: [
        InternationalRecruitmentService,
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(['canEditWorker']),
          deps: [HttpClient],
        },
        provideRouter([]),
      ],
      componentProperties: {
        canEditWorker: true,
        workplace: establishmentBuilder({ overrides: workplaceOverrides }) as Establishment,
        worker: workerBuilder({ overrides: workerOverrides }) as Worker,
        wdfView: false,
      },
    });

    const component = setupTools.fixture.componentInstance;

    return {
      ...setupTools,
      component,
    };
  }

  it('should render an EmploymentComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('Health and Social Care visa', () => {
    it('should not show the health and care visa section nationality is not answered', async () => {
      const { fixture, component, queryByTestId } = await setup();

      component.worker.nationality.value = null;
      fixture.detectChanges();

      const healthAndCareVisaSection = queryByTestId('health-and-care-visa-section');

      expect(healthAndCareVisaSection).toBeFalsy();
    });

    it('should not show the health and care visa section if the nationality is British', async () => {
      const { fixture, component, queryByTestId } = await setup();

      component.worker.nationality.value = 'British';
      fixture.detectChanges();

      const healthAndCareVisaSection = queryByTestId('health-and-care-visa-section');

      expect(healthAndCareVisaSection).toBeFalsy();
    });

    describe('nationality is other', () => {
      it('should not show the health and care visa section if the british citizenship is Yes', async () => {
        const { fixture, component, queryByTestId } = await setup();

        component.worker.nationality.value = 'Other';
        component.worker.britishCitizenship = 'Yes';

        fixture.detectChanges();

        const healthAndCareVisaSection = queryByTestId('health-and-care-visa-section');

        expect(healthAndCareVisaSection).toBeFalsy();
      });

      it('should show the health and care visa section if the british citizenship is No', async () => {
        const { fixture, component, getByTestId } = await setup();

        component.worker.nationality.value = 'Other';
        component.worker.britishCitizenship = 'No';
        fixture.detectChanges();

        const healthAndCareVisaSection = getByTestId('health-and-care-visa-section');

        expect(healthAndCareVisaSection).toBeTruthy();
      });

      it("should show the health and care visa section if the british citizenship is Don't know", async () => {
        const { fixture, component, getByTestId } = await setup();

        component.worker.nationality.value = 'Other';
        component.worker.britishCitizenship = "Don't know";
        fixture.detectChanges();

        const healthAndCareVisaSection = getByTestId('health-and-care-visa-section');

        expect(healthAndCareVisaSection).toBeTruthy();
      });

      it('should show the health and care visa section if the british citizenship is not answered', async () => {
        const { fixture, component, getByTestId } = await setup();

        component.worker.nationality.value = 'Other';
        component.worker.britishCitizenship = null;
        fixture.detectChanges();

        const healthAndCareVisaSection = getByTestId('health-and-care-visa-section');

        expect(healthAndCareVisaSection).toBeTruthy();
      });
    });

    describe('nationality is not known', () => {
      it('should not show if britishCitizenship is Yes', async () => {
        const { fixture, component, queryByTestId } = await setup();

        component.worker.nationality.value = "Don't know";
        component.worker.britishCitizenship = 'Yes';

        fixture.detectChanges();

        const healthAndCareVisaSection = queryByTestId('health-and-care-visa-section');

        expect(healthAndCareVisaSection).toBeFalsy();
      });

      it('should not show if britishCitizenship is not known', async () => {
        const { fixture, component, queryByTestId } = await setup();

        component.worker.nationality.value = "Don't know";
        component.worker.britishCitizenship = "Don't know";

        fixture.detectChanges();

        const healthAndCareVisaSection = queryByTestId('health-and-care-visa-section');

        expect(healthAndCareVisaSection).toBeFalsy();
      });

      it('should not show if britishCitizenship is not answered', async () => {
        const { fixture, component, queryByTestId } = await setup();

        component.worker.nationality.value = "Don't know";
        component.worker.britishCitizenship = null;

        fixture.detectChanges();

        const healthAndCareVisaSection = queryByTestId('health-and-care-visa-section');

        expect(healthAndCareVisaSection).toBeFalsy();
      });

      it('should show if britishCitizenship is No', async () => {
        const { fixture, component, getByTestId } = await setup();

        component.worker.nationality.value = "Don't know";
        component.worker.britishCitizenship = 'No';

        fixture.detectChanges();

        const healthAndCareVisaSection = getByTestId('health-and-care-visa-section');

        expect(healthAndCareVisaSection).toBeTruthy();
      });
    });

    it('should render Add link with the staff-record-summary/health-and-social-care url when health and care visa question not answered', async () => {
      const { fixture, component, getByTestId } = await setup();

      component.worker.nationality.value = 'Other';
      component.worker.britishCitizenship = 'No';
      component.worker.healthAndCareVisa = null;
      fixture.detectChanges();

      const healthAndCareVisaSection = within(getByTestId('health-and-care-visa-section'));
      const addLink = healthAndCareVisaSection.getByText('Add');

      expect(addLink.getAttribute('href')).toBe(
        `/workplace/${component.workplace.uid}/staff-record/${component.worker.uid}/staff-record-summary/health-and-care-visa`,
      );
    });

    it('should render Yes and a Change link with the staff-record-summary/health-and-social-care url when health and care visa question answered Yes', async () => {
      const { fixture, component, getByTestId } = await setup();

      component.worker.nationality.value = 'Other';
      component.worker.britishCitizenship = 'No';
      component.worker.healthAndCareVisa = 'Yes';
      fixture.detectChanges();

      const healthAndCareVisaSection = within(getByTestId('health-and-care-visa-section'));
      const yesMessage = healthAndCareVisaSection.getByText('Yes');
      const changeLink = healthAndCareVisaSection.getByText('Change');

      expect(yesMessage).toBeTruthy();
      expect(changeLink.getAttribute('href')).toBe(
        `/workplace/${component.workplace.uid}/staff-record/${component.worker.uid}/staff-record-summary/health-and-care-visa`,
      );
    });

    it("should display Not known when health and care visa question answered as Don't know", async () => {
      const { fixture, component, getByTestId } = await setup();

      component.worker.nationality.value = 'Other';
      component.worker.britishCitizenship = 'No';
      component.worker.healthAndCareVisa = "Don't know";
      fixture.detectChanges();

      const healthAndCareVisaSection = within(getByTestId('health-and-care-visa-section'));
      const notKnownMessage = healthAndCareVisaSection.getByText('Not known');
      const changeLink = healthAndCareVisaSection.getByText('Change');

      expect(notKnownMessage).toBeTruthy();
      expect(changeLink.getAttribute('href')).toBe(
        `/workplace/${component.workplace.uid}/staff-record/${component.worker.uid}/staff-record-summary/health-and-care-visa`,
      );
    });
  });

  describe('Employed from outside or inside the UK', () => {
    it('should not display if the health and care visa question is not answered', async () => {
      const { fixture, component, queryByTestId } = await setup();

      component.worker.nationality.value = 'Other';
      component.worker.britishCitizenship = 'No';
      component.worker.healthAndCareVisa = null;
      fixture.detectChanges();

      const employedInsideTheUKSection = queryByTestId('employed-inside-or-outside-section');

      expect(employedInsideTheUKSection).toBeFalsy();
    });

    it('should not display if the health and care visa question is no', async () => {
      const { fixture, component, queryByTestId } = await setup();

      component.worker.nationality.value = 'Other';
      component.worker.britishCitizenship = 'No';
      component.worker.healthAndCareVisa = 'No';
      fixture.detectChanges();

      const employedInsideTheUKSection = queryByTestId('employed-inside-or-outside-section');

      expect(employedInsideTheUKSection).toBeFalsy();
    });

    it("should not display if the health and care visa question is Don't know", async () => {
      const { fixture, component, queryByTestId } = await setup();

      component.worker.nationality.value = 'Other';
      component.worker.britishCitizenship = 'No';
      component.worker.healthAndCareVisa = "Don't know";
      fixture.detectChanges();

      const employedInsideTheUKSection = queryByTestId('employed-inside-or-outside-section');

      expect(employedInsideTheUKSection).toBeFalsy();
    });

    describe('health and care visa question is answered Yes', () => {
      it('should display the Add link when the question is not answered', async () => {
        const { component, fixture, getByTestId } = await setup();

        component.worker.nationality.value = 'Other';
        component.worker.britishCitizenship = 'No';
        component.worker.healthAndCareVisa = 'Yes';
        component.worker.employedFromOutsideUk = null;
        fixture.detectChanges();

        const employedInsideTheUKSection = within(getByTestId('employed-inside-or-outside-section'));
        const addLink = employedInsideTheUKSection.getByText('Add');

        expect(addLink.getAttribute('href')).toBe(
          `/workplace/${component.workplace.uid}/staff-record/${component.worker.uid}/staff-record-summary/inside-or-outside-of-uk`,
        );
      });

      it('should display From outside the UK when the questioned is answered as Outside the UK', async () => {
        const { component, fixture, getByTestId } = await setup();

        component.worker.nationality.value = 'Other';
        component.worker.britishCitizenship = 'No';
        component.worker.healthAndCareVisa = 'Yes';
        component.worker.employedFromOutsideUk = 'Yes';
        fixture.detectChanges();

        const employedInsideTheUKSection = within(getByTestId('employed-inside-or-outside-section'));
        const outsideTheUKMessage = employedInsideTheUKSection.getByText('From outside the UK');
        const changeLink = employedInsideTheUKSection.getByText('Change');

        expect(outsideTheUKMessage).toBeTruthy();
        expect(changeLink.getAttribute('href')).toBe(
          `/workplace/${component.workplace.uid}/staff-record/${component.worker.uid}/staff-record-summary/inside-or-outside-of-uk`,
        );
      });

      it('should display From inside the UK when the questioned is answered as inside the UK', async () => {
        const { component, fixture, getByTestId } = await setup();

        component.worker.nationality.value = 'Other';
        component.worker.britishCitizenship = 'No';
        component.worker.healthAndCareVisa = 'Yes';
        component.worker.employedFromOutsideUk = 'No';
        fixture.detectChanges();

        const employedInsideTheUKSection = within(getByTestId('employed-inside-or-outside-section'));
        const insideTheUKMessage = employedInsideTheUKSection.getByText('From inside the UK');
        const changeLink = employedInsideTheUKSection.getByText('Change');

        expect(insideTheUKMessage).toBeTruthy();
        expect(changeLink.getAttribute('href')).toBe(
          `/workplace/${component.workplace.uid}/staff-record/${component.worker.uid}/staff-record-summary/inside-or-outside-of-uk`,
        );
      });

      it('should display Not known when the questioned is answered as I do not know', async () => {
        const { component, fixture, getByTestId } = await setup();

        component.worker.nationality.value = 'Other';
        component.worker.britishCitizenship = 'No';
        component.worker.healthAndCareVisa = 'Yes';
        component.worker.employedFromOutsideUk = "Don't know";
        fixture.detectChanges();

        const employedInsideTheUKSection = within(getByTestId('employed-inside-or-outside-section'));
        const notKnownMessage = employedInsideTheUKSection.getByText('Not known');
        const changeLink = employedInsideTheUKSection.getByText('Change');

        expect(notKnownMessage).toBeTruthy();
        expect(changeLink.getAttribute('href')).toBe(
          `/workplace/${component.workplace.uid}/staff-record/${component.worker.uid}/staff-record-summary/inside-or-outside-of-uk`,
        );
      });
    });
  });

  describe('Carries out delegated healthcare activities', () => {
    const mainServiceWithDHA = {
      canDoDelegatedHealthcareActivities: true,
      id: 9,
      name: 'Day care and day services',
      reportingID: 6,
      isCQC: false,
    };
    const mainServiceWithoutDHA = {
      canDoDelegatedHealthcareActivities: null,
      id: 11,
      name: 'Domestic services and home help',
      reportingID: 10,
      isCQC: false,
    };
    const mainJobThatCanDoDHA = {
      jobId: 10,
      title: 'Care worker',
      canDoDelegatedHealthcareActivities: true,
    };
    const mainJobThatCannotDoDHA = {
      jobId: 36,
      title: 'IT manager',
      canDoDelegatedHealthcareActivities: false,
    };

    const overridesForDHA = {
      worker: { mainJob: mainJobThatCanDoDHA },
      workplace: { mainService: mainServiceWithDHA, staffDoDelegatedHealthcareActivities: 'Yes' },
    };

    it('should display a row for "Carries out delegated healthcare activities"', async () => {
      const { getByTestId } = await setup(overridesForDHA);

      const carryOutDHASection = within(getByTestId('carry-out-delegated-healthcare-activities-section'));

      expect(carryOutDHASection.getByText('Carries out delegated healthcare activities')).toBeTruthy();
    });

    const values = ['Yes', 'No', "Don't know"];
    const expectedTexts = ['Yes', 'No', 'Not known'];

    lodash.zip(values, expectedTexts).forEach(([value, expectedText]) => {
      it(`should display ${expectedText} and a Change link when the answer is ${value}`, async () => {
        const { component, fixture, getByTestId } = await setup(overridesForDHA);

        component.worker.carryOutDelegatedHealthcareActivities = value;
        fixture.detectChanges();

        const carryOutDHASection = within(getByTestId('carry-out-delegated-healthcare-activities-section'));
        expect(carryOutDHASection.getByText(expectedText)).toBeTruthy();

        const changeLink = carryOutDHASection.getByText('Change');

        expect(changeLink.getAttribute('href')).toBe(
          `/workplace/${component.workplace.uid}/staff-record/${component.worker.uid}/staff-record-summary/carry-out-delegated-healthcare-activities`,
        );
      });
    });

    it('should display a dash "-" and an "Add" link when the answer is null', async () => {
      const { component, getByTestId } = await setup(overridesForDHA);

      const carryOutDHASection = within(getByTestId('carry-out-delegated-healthcare-activities-section'));
      expect(carryOutDHASection.getByText('-')).toBeTruthy();

      const changeLink = carryOutDHASection.getByText('Add');

      expect(changeLink.getAttribute('href')).toBe(
        `/workplace/${component.workplace.uid}/staff-record/${component.worker.uid}/staff-record-summary/carry-out-delegated-healthcare-activities`,
      );
    });

    it('should not show the row when workplace staffDoDelegatedHealthcareActivities is "No"', async () => {
      const { component, fixture, queryByText } = await setup(overridesForDHA);

      component.workplace.staffDoDelegatedHealthcareActivities = 'No';
      fixture.detectChanges();

      expect(queryByText('Carries out delegated healthcare activities')).toBeFalsy();
    });

    it("should not show the row when the workplace's main service does not do DHA", async () => {
      const { component, fixture, queryByText } = await setup(overridesForDHA);

      component.workplace.mainService = mainServiceWithoutDHA;
      fixture.detectChanges();

      expect(queryByText('Carries out delegated healthcare activities')).toBeFalsy();
    });

    it("should not show the row when the worker's main job role cannot do DHA", async () => {
      const { component, fixture, queryByText } = await setup(overridesForDHA);

      component.worker.mainJob = mainJobThatCannotDoDHA;
      fixture.detectChanges();

      expect(queryByText('Carries out delegated healthcare activities')).toBeFalsy();
    });
  });
});
