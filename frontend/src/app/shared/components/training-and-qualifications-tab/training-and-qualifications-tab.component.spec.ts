import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { TrainingCounts } from '@core/model/trainingAndQualifications.model';
import { Worker } from '@core/model/worker.model';
import { AlertService } from '@core/services/alert.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { TrainingCategoryService } from '@core/services/training-category.service';
import { WindowRef } from '@core/services/window.ref';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { workerBuilder } from '@core/test-utils/MockWorkerService';
import { build, fake, sequence } from '@jackfranklin/test-data-bot';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { TrainingLinkPanelComponent } from '../training-link-panel/training-link-panel.component';
import { TrainingAndQualificationsTabComponent } from './training-and-qualifications-tab.component';

const establishmentBuilder = build('Establishment', {
  fields: {
    id: sequence(),
    uid: fake((f) => f.datatype.uuid()),
    name: fake((f) => f.lorem.sentence()),
  },
});

describe('TrainingAndQualificationsTabComponent', () => {
  async function setup(withWorkers = true, totalRecords = 4, addAlert = false) {
    if (addAlert) {
      window.history.pushState({ alertMessage: 'Updated record' }, '');
    }

    const workers = withWorkers && ([workerBuilder(), workerBuilder()] as Worker[]);
    const { fixture, getByText, queryByText, getByTestId, queryByTestId } = await render(
      TrainingAndQualificationsTabComponent,
      {
        imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
        declarations: [TrainingLinkPanelComponent],
        providers: [
          WindowRef,
          TrainingCategoryService,
          {
            provide: EstablishmentService,
            useClass: MockEstablishmentService,
          },
          {
            provide: PermissionsService,
            useClass: MockPermissionsService,
          },
        ],
        componentProperties: {
          workplace: establishmentBuilder() as Establishment,
          trainingCounts: {
            totalRecords,
          } as TrainingCounts,
          workers: workers,
          workerCount: workers.length,
        },
      },
    );

    const component = fixture.componentInstance;
    const alertService = TestBed.inject(AlertService) as AlertService;
    const alertSpy = spyOn(alertService, 'addAlert').and.callThrough();

    return {
      component,
      fixture,
      getByText,
      queryByText,
      getByTestId,
      queryByTestId,
      alertSpy,
    };
  }

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

  it('should display a correct message when there are no staff', async () => {
    const { getByTestId } = await setup(false);

    expect(getByTestId('noStaffRecordsWarningBanner')).toBeTruthy();
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
