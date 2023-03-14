import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { TrainingCounts } from '@core/model/trainingAndQualifications.model';
import { Worker } from '@core/model/worker.model';
import { AlertService } from '@core/services/alert.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { TabsService } from '@core/services/tabs.service';
import { WindowRef } from '@core/services/window.ref';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { workerBuilder } from '@core/test-utils/MockWorkerService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { establishmentBuilder } from '../../../../../server/test/factories/models';
import { NewTrainingTabComponent } from './training-tab.component';

describe('NewTrainingTabComponent', () => {
  const setup = async (withWorkers = true, totalRecords = 4, addAlert = false) => {
    if (addAlert) window.history.pushState({ alertMessage: 'Updated record' }, '');

    const workers = withWorkers && ([workerBuilder(), workerBuilder()] as Worker[]);
    const establishment = establishmentBuilder() as Establishment;

    const { fixture, getByText, queryByText, getByTestId, queryByTestId } = await render(NewTrainingTabComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
      providers: [
        WindowRef,
        {
          provide: FeatureFlagsService,
          useClass: MockFeatureFlagsService,
        },
        {
          provide: PermissionsService,
          useClass: MockPermissionsService,
        },
        {
          provide: BreadcrumbService,
          useClass: MockBreadcrumbService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      componentProperties: {
        workplace: establishment,
        trainingCounts: {
          totalRecords,
        } as TrainingCounts,
        workers: workers,
        workerCount: workers.length,
      },
    });

    const component = fixture.componentInstance;

    const injector = getTestBed();
    const alertService = injector.inject(AlertService);
    const alertSpy = spyOn(alertService, 'addAlert').and.callThrough();
    const tabsService = injector.inject(TabsService);

    return {
      component,
      fixture,
      getByText,
      queryByText,
      getByTestId,
      queryByTestId,
      alertSpy,
      tabsService,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render an alert banner if there is an alert message in state', async () => {
    const { component, fixture, alertSpy } = await setup(true, 4, true);
    component.ngOnInit();
    fixture.detectChanges();
    expect(alertSpy).toHaveBeenCalledWith({
      type: 'success',
      message: 'Updated record',
    });
  });

  it('renders the training link panel', async () => {
    const { getByTestId } = await setup();

    expect(getByTestId('trainingLinkPanel')).toBeTruthy();
  });

  it('should render the training info panel if there are workers', async () => {
    const { getByTestId } = await setup();

    expect(getByTestId('trainingInfoPanel')).toBeTruthy();
  });

  it('should show the inset text if there are no records', async () => {
    const { getByTestId } = await setup(true, 0);

    expect(getByTestId('noTandQRecords')).toBeTruthy();
  });

  it('should not render the training info panel if there are no workers', async () => {
    const { queryByTestId } = await setup(false);

    expect(queryByTestId('trainingInfoPanel')).toBeFalsy();
  });

  it('should display the noStaffRecords content if there are no staff records', async () => {
    const { getByTestId } = await setup(false);

    expect(getByTestId('no-staff-records')).toBeTruthy();
  });

  it('should navigate back to staff record tab when clicking add staff records link if there are no staff records', async () => {
    const { component, getByText, tabsService } = await setup(false);

    const navigateSpy = spyOn(component, 'navigateToStaffRecords').and.callThrough();
    const setSelectedTabSpy = spyOnProperty(tabsService, 'selectedTab', 'set');

    fireEvent.click(getByText('add staff records'));

    expect(navigateSpy).toHaveBeenCalled();
    expect(setSelectedTabSpy).toHaveBeenCalledWith('staff-records');
  });

  describe('updateSortByValue', () => {
    it('should update the staff sort by value when called with staff-summary section', async () => {
      const { component } = await setup();

      const properties = { section: 'staff-summary', sortByValue: 'trainingExpiresSoon' };
      component.updateSortByValue(properties);

      expect(component.staffSortByValue).toEqual('trainingExpiresSoon');
      expect(component.trainingSortByValue).toEqual('0_expired');
    });

    it('should update the training sort by value when called with training-summary section', async () => {
      const { component } = await setup();

      const properties = { section: 'training-summary', sortByValue: '1_expires_soon' };
      component.updateSortByValue(properties);

      expect(component.trainingSortByValue).toEqual('1_expires_soon');
      expect(component.staffSortByValue).toEqual('trainingExpired');
    });
  });

  describe('staff and training views when there are workers', () => {
    it('should render the tab bar to show different views', async () => {
      const { getByText } = await setup();

      expect(getByText('Staff')).toBeTruthy();
      expect(getByText('Training')).toBeTruthy();
    });

    it('shoud render a tab bar with the default table showing t and qs by staff name', async () => {
      const { getByTestId, queryByTestId } = await setup();

      expect(getByTestId('trainingAndQualsSummary')).toBeTruthy();
      expect(queryByTestId('trainingAndQualsCategories')).toBeFalsy();
    });

    it('shoud render the t and qs by training when the training link is clicked', async () => {
      const { component, fixture, getByText, getByTestId, queryByTestId } = await setup();

      component.trainingCategories = [
        {
          category: 'training',
          id: 1,
          isMandatory: false,
          seq: 10,
          training: [],
        },
      ];

      const trainingLink = getByText('Training');
      fireEvent.click(trainingLink);
      fixture.detectChanges();

      expect(getByTestId('trainingAndQualsCategories')).toBeTruthy();
      expect(queryByTestId('trainingAndQualsSummary')).toBeFalsy();
    });

    it('should render the t and qs by staff when clicking on the staff link', async () => {
      const { component, fixture, getByText, getByTestId, queryByTestId } = await setup();

      component.trainingCategories = [
        {
          category: 'training',
          id: 1,
          isMandatory: false,
          seq: 10,
          training: [],
        },
      ];

      const trainingLink = getByText('Training');
      const staffLink = getByText('Staff');
      fireEvent.click(trainingLink);
      fixture.detectChanges();
      fireEvent.click(staffLink);
      fixture.detectChanges();

      expect(getByTestId('trainingAndQualsSummary')).toBeTruthy();
      expect(queryByTestId('trainingAndQualsCategories')).toBeFalsy();
    });
  });
});
