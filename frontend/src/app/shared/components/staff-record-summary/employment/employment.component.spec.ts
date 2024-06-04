import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { establishmentBuilder } from '@core/test-utils/MockEstablishmentService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { workerBuilder } from '@core/test-utils/MockWorkerService';
import { SummaryRecordChangeComponent } from '@shared/components/summary-record-change/summary-record-change.component';
import { SharedModule } from '@shared/shared.module';
import { queryByTestId, render, within } from '@testing-library/angular';

import { EmploymentComponent } from './employment.component';

describe('EmploymentComponent', () => {
  async function setup() {
    const { fixture, getByText, getByTestId, queryByTestId } = await render(EmploymentComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      declarations: [SummaryRecordChangeComponent],
      providers: [
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(['canEditWorker']),
          deps: [HttpClient],
        },
      ],
      componentProperties: {
        canEditWorker: true,
        workplace: establishmentBuilder() as Establishment,
        worker: workerBuilder() as Worker,
        wdfView: false,
      },
    });

    const component = fixture.componentInstance;

    return {
      component,
      fixture,
      getByText,
      getByTestId,
      queryByTestId,
    };
  }

  it('should render an EmploymentComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  fdescribe('Health and Social Care visa', () => {
    it('should render Add link with the staff-record-summary/health-and-social-care url when health and care visa question not answered', async () => {
      const { fixture, component, getByTestId } = await setup();

      component.worker.healthAndCareVisa = undefined;
      fixture.detectChanges();

      const healthAndCareVisaSection = within(getByTestId('health-and-care-visa-section'));
      const addLink = healthAndCareVisaSection.getByText('Add');

      expect(addLink.getAttribute('href')).toBe(
        `/workplace/${component.workplace.uid}/staff-record/${component.worker.uid}/staff-record-summary/health-and-care-visa`,
      );
    });

    it('should render Yes and a Change link with the staff-record-summary/health-and-social-care url when health and care visa question answered Yes', async () => {
      const { fixture, component, getByTestId } = await setup();

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

  fdescribe('Employed from outside or inside the UK', () => {
    it('should not display if the health and care visa question is not answered', async () => {
      const { fixture, component, queryByTestId } = await setup();

      component.worker.healthAndCareVisa = undefined;
      fixture.detectChanges();

      const employedInsideTheUKSection = queryByTestId('employed-inside-or-outside-section');

      expect(employedInsideTheUKSection).toBeFalsy();
    });

    it('should not display if the health and care visa question is no', async () => {
      const { fixture, component, queryByTestId } = await setup();

      component.worker.healthAndCareVisa = 'No';
      fixture.detectChanges();

      const employedInsideTheUKSection = queryByTestId('employed-inside-or-outside-section');

      expect(employedInsideTheUKSection).toBeFalsy();
    });

    it("should not display if the health and care visa question is Don't know", async () => {
      const { fixture, component, queryByTestId } = await setup();

      component.worker.healthAndCareVisa = "Don't know";
      fixture.detectChanges();

      const employedInsideTheUKSection = queryByTestId('employed-inside-or-outside-section');

      expect(employedInsideTheUKSection).toBeFalsy();
    });

    xdescribe('health and care visa question is answered Yes', () => {
      it('should display the Add link when the question is not answered', async () => {
        const { component, fixture, getByTestId } = await setup();

        component.worker.healthAndCareVisa = 'Yes';
        //component.worker.employedFromInsideUk = undefined;
        fixture.detectChanges();

        const employedInsideTheUKSection = within(getByTestId('employed-inside-or-outside-section'));
        const notKnownMessage = employedInsideTheUKSection.getByText('Not known');
        const addLink = employedInsideTheUKSection.getByText('Add');

        expect(notKnownMessage).toBeTruthy();
        expect(addLink.getAttribute('href')).toBe(
          `/workplace/${component.workplace.uid}/staff-record/${component.worker.uid}/staff-record-summary/inside-or-outside-of-uk`,
        );
      });

      it('should display From outside the UK when the questioned is answered as Outside the UK', async () => {
        const { component, fixture, getByTestId } = await setup();

        component.worker.healthAndCareVisa = 'Yes';
        //component.worker.employedFromInsideUk = "Outside the UK";
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

        component.worker.healthAndCareVisa = 'Yes';
        //component.worker.employedFromInsideUk = "Inside the UK";
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

        component.worker.healthAndCareVisa = 'Yes';
        //component.worker.employedFromInsideUk = "I do not know";
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

    //h&s yes and employed is outside - From outside the UK & change link
    //h&s yes and employed is inside - From inside the UK & change link
    //h&s yes and employed is unknown - Not known & change link
    //h&s yes and employed is skipped & change link
    //shouldn't show row if h&s is no
    //shouldn't show row if h&s is skipped
    //shouldn't show row if h&s is not known
  });
});
