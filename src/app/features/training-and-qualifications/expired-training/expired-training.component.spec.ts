import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { PermissionType } from '@core/model/permissions.model';
import { AlertService } from '@core/services/alert.service';
import { BackLinkService } from '@core/services/backLink.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { TrainingService } from '@core/services/training.service';
import { UserService } from '@core/services/user.service';
import { WindowRef } from '@core/services/window.ref';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { of } from 'rxjs';
import sinon from 'sinon';

import { ExpiredTrainingComponent } from './expired-training.component';

const workers = [
  {
    id: 1,
    uid: 'worker-one-uid',
    NameOrIdValue: 'Worker One',
    workerTraining: [
      {
        uid: 'mock-uid-one',
        expires: new Date('2020-01-01'),
        categoryFk: 1,
        category: { id: 1, category: 'Category name 1' },
      },
      {
        uid: 'mock-uid-two',
        expires: new Date('2020-01-01'),
        categoryFk: 2,
        category: { id: 2, category: 'Category name 2' },
      },
      {
        uid: 'mock-uid-three',
        expires: new Date('2020-01-01'),
        categoryFk: 3,
        category: { id: 3, category: 'Category name 3' },
      },
    ],
  },
  {
    id: 2,
    uid: 'worker-two-uid',
    NameOrIdValue: 'Worker Two',
    workerTraining: [
      {
        uid: 'mock-uid-four',
        expires: new Date('2021-05-01'),
        categoryFk: 3,
        category: { id: 3, category: 'Category name 3' },
      },
    ],
  },
];

describe('ExpiredTrainingComponent', () => {
  async function setup(
    addPermissions = true,
    fixTrainingCount = false,
    qsParamGetMock = sinon.fake(),
    addAlert = false,
  ) {
    let workerObj = {
      workers,
      workerCount: 2,
    };
    if (fixTrainingCount) workerObj = { workers: [workers[0]], workerCount: 1 };
    const permissions = addPermissions ? ['canEditWorker'] : [];

    if (addAlert) {
      window.history.pushState({ alertMessage: 'Updated record' }, '');
    }
    const { fixture, getByText, getByTestId, getByLabelText, queryByLabelText, queryByTestId } = await render(
      ExpiredTrainingComponent,
      {
        imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
        providers: [
          WindowRef,
          BackLinkService,
          {
            provide: EstablishmentService,
            useClass: MockEstablishmentService,
          },
          {
            provide: PermissionsService,
            useFactory: MockPermissionsService.factory(permissions as PermissionType[]),
            deps: [HttpClient, Router, UserService],
          },
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: {
                queryParamMap: {
                  get: qsParamGetMock,
                },
                data: {
                  training: workerObj,
                },
                params: { establishmentuid: '1234-5678' },
              },
            },
          },
        ],
      },
    );

    const component = fixture.componentInstance;

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;

    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    const trainingService = injector.inject(TrainingService) as TrainingService;
    const trainingServiceSpy = spyOn(trainingService, 'getAllTrainingByStatus').and.returnValue(
      of({ workers, workerCount: 2 }),
    );

    const alertService = injector.inject(AlertService) as AlertService;
    const alertSpy = spyOn(alertService, 'addAlert').and.callThrough();

    return {
      component,
      fixture,
      getByText,
      getByTestId,
      getByLabelText,
      queryByLabelText,
      queryByTestId,
      routerSpy,
      trainingService,
      trainingServiceSpy,
      alertSpy,
    };
  }

  it('should render a ExpiredTrainingComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render an alert banner if there is an aler message in state', async () => {
    const { component, fixture, alertSpy } = await setup(true, false, sinon.fake(), true);

    component.ngOnInit();
    fixture.detectChanges();
    expect(alertSpy).toHaveBeenCalledWith({
      type: 'success',
      message: 'Updated record',
    });
  });

  it('should render a row for each expired training for a worker, with the worker name shown in top row', async () => {
    const { getByTestId } = await setup();

    const tableRow1 = getByTestId(`table-row-${workers[0].NameOrIdValue}-0`);
    const tableRow2 = getByTestId(`table-row-${workers[0].NameOrIdValue}-1`);
    const tableRow3 = getByTestId(`table-row-${workers[0].NameOrIdValue}-2`);
    const tableRow4 = getByTestId(`table-row-${workers[1].NameOrIdValue}-0`);

    expect(getByTestId('table')).toBeTruthy();

    expect(within(tableRow1).getByText('Worker One')).toBeTruthy();
    expect(within(tableRow1).getByText('Category name 1')).toBeTruthy();
    expect(within(tableRow1).getByText('1 Jan 2020')).toBeTruthy();
    expect(within(tableRow1).getByText('Expired')).toBeTruthy();

    expect(within(tableRow2).queryByText('Worker One')).toBeFalsy();
    expect(within(tableRow2).getByText('Category name 2')).toBeTruthy();
    expect(within(tableRow2).getByText('1 Jan 2020')).toBeTruthy();
    expect(within(tableRow2).getByText('Expired')).toBeTruthy();

    expect(within(tableRow3).queryByText('Worker One')).toBeFalsy();
    expect(within(tableRow3).getByText('Category name 3')).toBeTruthy();
    expect(within(tableRow3).getByText('1 Jan 2020')).toBeTruthy();
    expect(within(tableRow3).getByText('Expired')).toBeTruthy();

    expect(within(tableRow4).getByText('Worker Two')).toBeTruthy();
    expect(within(tableRow4).getByText('Category name 3')).toBeTruthy();
    expect(within(tableRow4).getByText('1 May 2021')).toBeTruthy();
    expect(within(tableRow4).getByText('Expired')).toBeTruthy();
  });

  it('should render the name as a link with href to the worker when the are canEditWorker Permissions', async () => {
    const { component, getByText } = await setup();

    expect(getByText('Worker One').getAttribute('href')).toEqual(
      `/workplace/${component.workplaceUid}/training-and-qualifications-record/worker-one-uid/training`,
    );
    expect(getByText('Worker Two').getAttribute('href')).toEqual(
      `/workplace/${component.workplaceUid}/training-and-qualifications-record/worker-two-uid/training`,
    );
  });

  it('should not render the name as a link if there are not the correct permissions', async () => {
    const { getByTestId } = await setup(false);

    expect(getByTestId(`worker-${workers[0].NameOrIdValue}-noLink`)).toBeTruthy();
    expect(getByTestId(`worker-${workers[1].NameOrIdValue}-noLink`)).toBeTruthy();
  });

  it('should render an update link with href to the training when there are can edit permissions', async () => {
    const { component, getByTestId } = await setup();

    const tableRow1 = getByTestId(`table-row-${workers[0].NameOrIdValue}-0`);
    const tableRow2 = getByTestId(`table-row-${workers[0].NameOrIdValue}-1`);
    const tableRow3 = getByTestId(`table-row-${workers[0].NameOrIdValue}-2`);
    const tableRow4 = getByTestId(`table-row-${workers[1].NameOrIdValue}-0`);

    const table1UpdateLink = within(tableRow1).getByText('Update');
    const table2UpdateLink = within(tableRow2).getByText('Update');
    const table3UpdateLink = within(tableRow3).getByText('Update');
    const table4UpdateLink = within(tableRow4).getByText('Update');

    expect(table1UpdateLink.getAttribute('href')).toEqual(
      `/workplace/${component.workplaceUid}/training-and-qualifications-record/worker-one-uid/training/mock-uid-one`,
    );
    expect(table2UpdateLink.getAttribute('href')).toEqual(
      `/workplace/${component.workplaceUid}/training-and-qualifications-record/worker-one-uid/training/mock-uid-two`,
    );
    expect(table3UpdateLink.getAttribute('href')).toEqual(
      `/workplace/${component.workplaceUid}/training-and-qualifications-record/worker-one-uid/training/mock-uid-three`,
    );
    expect(table4UpdateLink.getAttribute('href')).toEqual(
      `/workplace/${component.workplaceUid}/training-and-qualifications-record/worker-two-uid/training/mock-uid-four`,
    );
  });

  it('should not render the update links if there are not the correct permissions', async () => {
    const { getByTestId } = await setup(false);

    const tableRow1 = getByTestId(`table-row-${workers[0].NameOrIdValue}-0`);
    const tableRow2 = getByTestId(`table-row-${workers[0].NameOrIdValue}-1`);
    const tableRow3 = getByTestId(`table-row-${workers[0].NameOrIdValue}-2`);
    const tableRow4 = getByTestId(`table-row-${workers[1].NameOrIdValue}-0`);

    expect(within(tableRow1).queryByText('Update')).toBeFalsy();
    expect(within(tableRow2).queryByText('Update')).toBeFalsy();
    expect(within(tableRow3).queryByText('Update')).toBeFalsy();
    expect(within(tableRow4).queryByText('Update')).toBeFalsy();
  });

  it('should apply conditionaly classes on rows when there is more than 1 training for a worker', async () => {
    const { getByTestId } = await setup(false);

    const tableRow1CategoryCell = getByTestId(`cell-${workers[0].NameOrIdValue}-0`);
    const tableRow2CategoryCell = getByTestId(`cell-${workers[0].NameOrIdValue}-1`);
    const tableRow3CategoryCell = getByTestId(`cell-${workers[0].NameOrIdValue}-2`);
    const tableRow4CategoryCell = getByTestId(`cell-${workers[1].NameOrIdValue}-0`);

    expect(tableRow1CategoryCell.getAttribute('class')).toContain('asc-table__cell-no-border__top-row');
    expect(tableRow2CategoryCell.getAttribute('class')).toContain('asc-table__cell-no-border__middle-row');
    expect(tableRow3CategoryCell.getAttribute('class')).toContain('asc-table__cell-no-border__bottom-row');
    expect(tableRow4CategoryCell.getAttribute('class')).not.toContain('asc-table__cell-no-border__top-row');
    expect(tableRow4CategoryCell.getAttribute('class')).not.toContain('asc-table__cell-no-border__middle-row');
    expect(tableRow4CategoryCell.getAttribute('class')).not.toContain('asc-table__cell-no-border__bottom-row');
  });

  it('should navigate back to the dashboard when clicking the return to home button in a parent or stand alone account', async () => {
    const { getByText, component, fixture, routerSpy } = await setup();

    component.primaryWorkplaceUid = '1234-5678';
    const button = getByText('Return to home');
    fireEvent.click(button);
    fixture.detectChanges();

    expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'training-and-qualifications' });
  });

  it('should navigate back to the workplace page when clicking the return to home button when accessing a sub account from a parent', async () => {
    const { getByText, fixture, routerSpy } = await setup();

    const button = getByText('Return to home');
    fireEvent.click(button);
    fixture.detectChanges();

    expect(routerSpy).toHaveBeenCalledWith(['/workplace', '1234-5678'], { fragment: 'training-and-qualifications' });
  });

  describe('sort', () => {
    it('should not show the sort by dropdown if there is only 1 staff record', async () => {
      const { queryByTestId } = await setup(true, true);

      expect(queryByTestId('sortBy')).toBeFalsy();
    });

    it('should handle sort by staff name asc', async () => {
      const { component, getByLabelText, trainingServiceSpy } = await setup();

      expect(trainingServiceSpy).not.toHaveBeenCalled();

      const select = getByLabelText('Sort by', { exact: false });
      fireEvent.change(select, { target: { value: '0_asc' } });

      expect(trainingServiceSpy).toHaveBeenCalledWith(component.workplaceUid, 'expired', {
        sortBy: 'staffNameAsc',
        pageIndex: 0,
        itemsPerPage: 15,
      });
    });

    it('should handle sort by staff name desc', async () => {
      const { component, getByLabelText, trainingServiceSpy } = await setup();

      expect(trainingServiceSpy).not.toHaveBeenCalled();

      const select = getByLabelText('Sort by', { exact: false });
      fireEvent.change(select, { target: { value: '1_desc' } });

      expect(trainingServiceSpy).toHaveBeenCalledWith(component.workplaceUid, 'expired', {
        sortBy: 'staffNameDesc',
        pageIndex: 0,
        itemsPerPage: 15,
      });
    });
  });

  describe('call getAllTrainingByStatus on trainingService when using search', () => {
    it('does not render the search bar when there are fewer than 15 training records', async () => {
      const { queryByLabelText } = await setup();

      const searchInput = queryByLabelText('Search', { exact: false });
      expect(searchInput).toBeNull();
    });

    it('shoud call getAllTrainingByStatus with the correct search term passed', async () => {
      const { component, fixture, getByLabelText, trainingServiceSpy } = await setup();

      component.totalWorkerCount = 16;
      fixture.detectChanges();

      const searchInput = getByLabelText('Search', { exact: false });
      expect(searchInput).toBeTruthy();

      userEvent.type(searchInput, 'search term here{enter}');
      const expectedEmit = {
        pageIndex: 0,
        itemsPerPage: 15,
        sortBy: 'staffNameAsc',
        searchTerm: 'search term here',
      };

      expect(trainingServiceSpy).toHaveBeenCalledWith(component.workplaceUid, 'expired', expectedEmit);
    });

    it('should render the no results returned message when 0 workers returned from getAllWorkers after search', async () => {
      const { component, fixture, getByLabelText, getByText, trainingService } = await setup();

      component.totalWorkerCount = 16;
      fixture.detectChanges();

      sinon.stub(trainingService, 'getAllTrainingByStatus').returns(
        of({
          workers: [],
          workerCount: 0,
        }),
      );

      const searchInput = getByLabelText('Search', { exact: false });
      expect(searchInput).toBeTruthy();

      userEvent.type(searchInput, 'search term here{enter}');
      fixture.detectChanges();

      expect(getByText('There are no matching results')).toBeTruthy();
      expect(getByText('Make sure that your spelling is correct.')).toBeTruthy();
    });
  });

  describe('Query search params update correctly', () => {
    it('sets the searchTerm for staff record input if query params are found on render', async () => {
      const qsParamGetMock = sinon.stub();
      qsParamGetMock.onCall(0).returns('mysupersearch');
      qsParamGetMock.onCall(1).returns('training');

      const { component, fixture, getByLabelText } = await setup(true, false, qsParamGetMock);

      component.totalWorkerCount = 16;
      fixture.detectChanges();
      expect((getByLabelText('Search', { exact: false }) as HTMLInputElement).value).toBe('mysupersearch');
    });
  });
});
