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

const training = [
  {
    uid: 'mock-uid-one',
    expires: new Date('2020-01-01'),
    categoryFk: 1,
    category: { id: 1, category: 'Category name' },
    worker: { id: 1, uid: 'worker-one-uid', NameOrIdValue: 'Worker One' },
  },
  {
    uid: 'mock-uid-two',
    expires: new Date('2021-05-01'),
    categoryFk: 1,
    category: { id: 3, category: 'Another category name' },
    worker: { id: 3, uid: 'worker-two-uid', NameOrIdValue: 'Worker Two' },
  },
];

describe('ExpiredTrainingComponent', () => {
  async function setup(
    addPermissions = true,
    fixTrainingCount = false,
    qsParamGetMock = sinon.fake(),
    addAlert = false,
  ) {
    let trainingObj = {
      training,
      trainingCount: 2,
    };
    if (fixTrainingCount) trainingObj = { training: [training[0]], trainingCount: 1 };
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
                  training: trainingObj,
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
      of({ training, trainingCount: 2 }),
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

  it('should render the table with a list of the expired training', async () => {
    const { getByTestId } = await setup();

    const tableRow1 = getByTestId('table-row-0');
    const tableRow2 = getByTestId('table-row-1');

    expect(getByTestId('table')).toBeTruthy();
    expect(within(tableRow1).getByText('Worker One')).toBeTruthy();
    expect(within(tableRow1).getByText('Category name')).toBeTruthy();
    expect(within(tableRow1).getByText('1 Jan 2020')).toBeTruthy();
    expect(within(tableRow1).getByText('Expired')).toBeTruthy();
    expect(within(tableRow2).getByText('Worker Two')).toBeTruthy();
    expect(within(tableRow2).getByText('Another category name')).toBeTruthy();
    expect(within(tableRow2).getByText('1 May 2021')).toBeTruthy();
    expect(within(tableRow2).getByText('Expired')).toBeTruthy();
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

    expect(getByTestId('worker-0-noLink')).toBeTruthy();
    expect(getByTestId('worker-1-noLink')).toBeTruthy();
  });

  it('should render an update link with href to the training when there are can edit permissions', async () => {
    const { component, getByTestId } = await setup();

    const tableRow1 = getByTestId('table-row-0');
    const tableRow2 = getByTestId('table-row-1');

    const table1UpdateLink = within(tableRow1).getByText('Update');
    const table2UpdateLink = within(tableRow2).getByText('Update');

    expect(table1UpdateLink.getAttribute('href').slice(0, table1UpdateLink.getAttribute('href').indexOf(';'))).toEqual(
      `/workplace/${component.workplaceUid}/training-and-qualifications-record/worker-one-uid/training/mock-uid-one`,
    );
    expect(table2UpdateLink.getAttribute('href').slice(0, table2UpdateLink.getAttribute('href').indexOf(';'))).toEqual(
      `/workplace/${component.workplaceUid}/training-and-qualifications-record/worker-two-uid/training/mock-uid-two`,
    );
  });

  it('should not render the update links if there are not the correct permissions', async () => {
    const { getByTestId } = await setup(false);

    const tableRow1 = getByTestId('table-row-0');
    const tableRow2 = getByTestId('table-row-1');

    expect(within(tableRow1).queryByText('Update')).toBeFalsy();
    expect(within(tableRow2).queryByText('Update')).toBeFalsy();
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

    it('should handle sort by staff name', async () => {
      const { component, getByLabelText, trainingServiceSpy } = await setup();

      expect(trainingServiceSpy).not.toHaveBeenCalled();

      const select = getByLabelText('Sort by', { exact: false });
      fireEvent.change(select, { target: { value: '0_worker' } });

      expect(trainingServiceSpy).toHaveBeenCalledWith(component.workplaceUid, 'expired', {
        sortBy: 'staffNameAsc',
        pageIndex: 0,
        itemsPerPage: 15,
      });
    });

    it('should handle sort by expired date', async () => {
      const { component, getByLabelText, trainingServiceSpy } = await setup();

      expect(trainingServiceSpy).not.toHaveBeenCalled();

      const select = getByLabelText('Sort by', { exact: false });
      fireEvent.change(select, { target: { value: '1_expired' } });

      expect(trainingServiceSpy).toHaveBeenCalledWith(component.workplaceUid, 'expired', {
        sortBy: 'expiryDateDesc',
        pageIndex: 0,
        itemsPerPage: 15,
      });
    });

    it('should handle sort by expiring soon', async () => {
      const { component, getByLabelText, trainingServiceSpy } = await setup();

      expect(trainingServiceSpy).not.toHaveBeenCalled();

      const select = getByLabelText('Sort by', { exact: false });
      fireEvent.change(select, { target: { value: '2_category' } });

      expect(trainingServiceSpy).toHaveBeenCalledWith(component.workplaceUid, 'expired', {
        sortBy: 'categoryNameAsc',
        pageIndex: 0,
        itemsPerPage: 15,
      });
    });
  });

  describe('call getAllTrainingByStatus on trainingService when using search', () => {
    it('does not render the search bar when there are fewer than 15 training records', async () => {
      const { queryByLabelText } = await setup();

      const searchInput = queryByLabelText('Search staff training records');
      expect(searchInput).toBeNull();
    });

    it('shoud call getAllTrainingByStatus with the correct search term passed', async () => {
      const { component, fixture, getByLabelText, trainingServiceSpy } = await setup();

      component.totalTrainingCount = 16;
      fixture.detectChanges();

      const searchInput = getByLabelText('Search staff training records');
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

      component.totalTrainingCount = 16;
      fixture.detectChanges();

      sinon.stub(trainingService, 'getAllTrainingByStatus').returns(
        of({
          training: [],
          trainingCount: 0,
        }),
      );

      const searchInput = getByLabelText('Search staff training records');
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

      component.totalTrainingCount = 16;
      fixture.detectChanges();
      expect((getByLabelText('Search staff training records') as HTMLInputElement).value).toBe('mysupersearch');
    });
  });
});
