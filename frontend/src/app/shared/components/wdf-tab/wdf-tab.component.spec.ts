import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserModule } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { ReportService } from '@core/services/report.service';
import { establishmentBuilder } from '@core/test-utils/MockEstablishmentService';
import { MockReportService } from '@core/test-utils/MockReportService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';
import dayjs from 'dayjs';

import { WdfTabComponent } from './wdf-tab.component';

describe('WdfTabComponent', () => {
  const setup = async () => {
    const { fixture, getByText, getAllByText, getByTestId, queryByText } = await render(WdfTabComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule, BrowserModule, SharedModule],
      providers: [{ provide: ReportService, useClass: MockReportService }],
      componentProperties: {
        workplace: establishmentBuilder() as Establishment,
      },
    });

    const component = fixture.componentInstance;

    return { component, fixture, getByText, getAllByText, getByTestId, queryByText };
  };

  describe('Happy path', async () => {
    it('should render a WdfTabComponent', async () => {
      const { component } = await setup();
      expect(component).toBeTruthy();
    });

    it('should display the correct timeframe for meeting WDF requirements', async () => {
      const { getByText } = await setup();
      const year = new Date().getFullYear();
      const timeFrameSentence = `Your data has met the WDF ${year} to ${year + 1} requirements`;

      expect(getByText(timeFrameSentence, { exact: false })).toBeTruthy();
    });

    it('should display the correct date for when the user became eligible', async () => {
      const { getByText } = await setup();
      const year = new Date().getFullYear();
      const timeFrameSentence = `Your data met the requirements on 21 July ${year}`;

      expect(getByText(timeFrameSentence, { exact: false })).toBeTruthy();
    });

    it('should display the correct date for when WDF eligibility is valid until', async () => {
      const { getByText } = await setup();
      const year = new Date().getFullYear();
      const timeFrameSentence = `and will continue to meet them until 31 March ${year + 1}.`;

      expect(getByText(timeFrameSentence, { exact: false })).toBeTruthy();
    });
  });

  describe('Unhappy path', async () => {
    it('should not display the meeting requirements message when the user is not eligible', async () => {
      const { component, fixture, queryByText } = await setup();
      const year = new Date().getFullYear();
      const timeFrameSentence = `Your data has met the WDF ${year} to ${year + 1} requirements`;
      const requirementsMetMessage = `Your data met the requirements on 21 July ${year}`;

      component.overallWdfEligibility = false;
      fixture.detectChanges();

      expect(queryByText(timeFrameSentence, { exact: false })).toBeFalsy();
      expect(queryByText(requirementsMetMessage, { exact: false })).toBeFalsy();
    });

    it('should display the not meeting requirements message when the user is not eligible', async () => {
      const { component, fixture, getByText } = await setup();
      const year = new Date().getFullYear();
      const timeFrameSentence = `Your data does not meet the WDF ${year} to ${year + 1} requirements`;
      const viewWdfLink = 'View your WDF data';
      const viewWdfSentence = 'to see where it does not meet the requirements';

      component.overallWdfEligibility = false;
      fixture.detectChanges();

      expect(getByText(timeFrameSentence, { exact: false })).toBeTruthy();
      expect(getByText(viewWdfLink, { exact: false })).toBeTruthy();
      expect(getByText(viewWdfSentence, { exact: false })).toBeTruthy();
    });
  });

  describe('Parent workplaces happy path', () => {
    it('should display the correct timeframe for parents for meeting WDF requirements', async () => {
      const { component, fixture, getByText } = await setup();
      const year = new Date().getFullYear();
      const timeFrameSentence = `All of your workplaces have met the WDF ${year} to ${year + 1} data requirements`;

      component.isParent = true;
      component.parentOverallWdfEligibility = true;
      fixture.detectChanges();

      expect(getByText(timeFrameSentence, { exact: false })).toBeTruthy();
    });

    it('should display the correct date for when parent and all subs became eligible', async () => {
      const { component, fixture, getByText } = await setup();
      const year = new Date().getFullYear();
      const timeFrameSentence = `Your workplaces' data met the requirements on 31 July ${year}`;

      component.isParent = true;
      component.parentOverallWdfEligibility = true;
      component.parentOverallEligibilityDate = dayjs(`${year}-07-31`).format('D MMMM YYYY');
      fixture.detectChanges();

      expect(getByText(timeFrameSentence, { exact: false })).toBeTruthy();
    });

    it('should display the correct date for parents for when WDF eligibility is valid until', async () => {
      const { component, fixture, getByText } = await setup();
      const year = new Date().getFullYear();
      const timeFrameSentence = `and will continue to meet them until 31 March ${year + 1}`;

      component.isParent = true;
      component.parentOverallWdfEligibility = true;
      fixture.detectChanges();

      expect(getByText(timeFrameSentence, { exact: false })).toBeTruthy();
    });

    it('should display the "View your workplaces" message when parent and all subs are eligible', async () => {
      const { component, fixture, getByText } = await setup();
      const viewWorkplacesLink = 'View your workplaces';
      const viewWorkplacesSentence = 'and keep your data up to date to save time next year';

      component.isParent = true;
      component.parentOverallWdfEligibility = true;
      fixture.detectChanges();

      expect(getByText(viewWorkplacesLink, { exact: false })).toBeTruthy();
      expect(getByText(viewWorkplacesSentence, { exact: false })).toBeTruthy();
    });
  });

  describe('Parent workplaces unhappy path', () => {
    it('should not display the meeting requirements message when the parent is not eligible', async () => {
      const { component, fixture, queryByText } = await setup();
      const year = new Date().getFullYear();
      const timeFrameSentence = `All of your workplaces have met the WDF ${year} to ${year + 1} data requirements`;

      component.isParent = true;
      component.parentOverallWdfEligibility = false;
      fixture.detectChanges();

      expect(queryByText(timeFrameSentence, { exact: false })).toBeFalsy();
    });

    it('should display the not meeting requirements message when the user is not eligible', async () => {
      const { component, fixture, getByText } = await setup();
      const year = new Date().getFullYear();
      const requirementsNotMetSentence = `Some of your workplaces' data does not meet the WDF ${year} to ${
        year + 1
      } requirements`;
      const viewWorkplacesLink = 'View your workplaces';
      const viewWorkplacesSentence = 'to see which have data that does not meet the requirements.';

      component.isParent = true;
      component.parentOverallWdfEligibility = false;
      fixture.detectChanges();

      expect(getByText(requirementsNotMetSentence, { exact: false })).toBeTruthy();
      expect(getByText(viewWorkplacesLink, { exact: false })).toBeTruthy();
      expect(getByText(viewWorkplacesSentence, { exact: false })).toBeTruthy();
    });
  });

  describe('getParentAndSubs', async () => {
    it('should calculate parentOverallWdfEligibility to be true if all workplaces are eligible', async () => {
      const { component, fixture } = await setup();
      const year = new Date().getFullYear();

      component.isParent = true;
      component.workplaces = [
        { wdf: { overall: true, overallWdfEligibility: `${year}-07-31` } },
        { wdf: { overall: true, overallWdfEligibility: `${year}-05-01` } },
      ];

      component.getParentOverallWdfEligibility();
      fixture.detectChanges();

      expect(component.parentOverallWdfEligibility).toBeTrue();
    });

    it('should calculate parentOverallWdfEligibility to be false if a workplace is ineligible', async () => {
      const { component, fixture } = await setup();
      const year = new Date().getFullYear();

      component.isParent = true;
      component.workplaces = [
        { wdf: { overall: true, overallWdfEligibility: `${year}-07-31` } },
        { wdf: { overall: false, overallWdfEligibility: '' } },
      ];

      component.getParentOverallWdfEligibility();
      fixture.detectChanges();

      expect(component.parentOverallWdfEligibility).toBeFalse();
    });

    it('should correctly calculate parentOverallEligibilityDate if all workplaces are eligible', async () => {
      const { component, fixture } = await setup();
      const year = new Date().getFullYear();

      component.isParent = true;
      component.parentOverallWdfEligibility = true;
      component.workplaces = [
        { wdf: { overall: true, overallWdfEligibility: `${year}-07-31` } },
        { wdf: { overall: true, overallWdfEligibility: `${year}-05-01` } },
      ];

      component.getLastOverallEligibilityDate();
      fixture.detectChanges();

      expect(component.parentOverallEligibilityDate).toEqual(`31 July ${year}`);
    });
  });
});
