import { provideHttpClient } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PermissionType } from '@core/model/permissions.model';
import { BackLinkService } from '@core/services/backLink.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { TrainingService } from '@core/services/training.service';
import { UserService } from '@core/services/user.service';
import { WindowRef } from '@core/services/window.ref';
import { establishmentBuilder, MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockTrainingService } from '@core/test-utils/MockTrainingService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { of } from 'rxjs';
import sinon from 'sinon';

import { MissingMandatoryTrainingStatusComponent } from './missing-mandatory-training-status.component';

const workers = [
  {
    name: 'Worker One',
    uid: 'mock-uid-1',
    missingTraining: [
      { id: 1, category: 'Category 1' },
      { id: 2, category: 'Category 2' },
      { id: 3, category: 'Category 3' },
    ],
  },
  {
    name: 'Worker Two',
    uid: 'mock-uid-2',
    missingTraining: [{ id: 1, category: 'Category 1' }],
  },
];

fdescribe('MissingMandatoryTrainingStatusComponent', () => {
  async function setup(overrides = {} as any) {
    let workerObj = {
      workers,
      workerCount: 2,
    };

    const addPermissions = overrides?.addPermissions ?? true;
    const fixTrainingCount = overrides?.fixTrainingCount ?? false;
    const qsParamGetMock = overrides?.qsParamGetMock ?? sinon.fake();

    const permissions = addPermissions ? ['canEditWorker'] : [];
    if (fixTrainingCount) workerObj = { workers: [workers[0]], workerCount: 1 };

    const setupTools = await render(MissingMandatoryTrainingStatusComponent, {
      imports: [SharedModule, RouterModule],
      providers: [
        WindowRef,
        BackLinkService,
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: TrainingService,
          useClass: MockTrainingService,
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
                establishment: establishmentBuilder(),
              },
              params: {
                establishmentuid: '1234-5678',
              },
            },
          },
        },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    const component = setupTools.fixture.componentInstance;

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    const trainingService = injector.inject(TrainingService) as TrainingService;
    const trainingServiceSpy = spyOn(trainingService, 'getMissingMandatoryTraining').and.returnValue(
      of({ workers, workerCount: 2 }),
    );

    return {
      ...setupTools,
      component,
      routerSpy,
      trainingService,
      trainingServiceSpy,
    };
  }
  it('should render a MissingMandatoryTrainingStatusComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render the table with a list of workers and their missing training', async () => {
    const { getByTestId } = await setup();

    const tableRow1 = getByTestId(`table-row-${workers[0].name}-0`);
    const tableRow2 = getByTestId(`table-row-${workers[0].name}-1`);
    const tableRow3 = getByTestId(`table-row-${workers[0].name}-2`);
    const tableRow4 = getByTestId(`table-row-${workers[1].name}-0`);

    expect(getByTestId('table')).toBeTruthy();

    expect(within(tableRow1).getByText('Worker One')).toBeTruthy();
    expect(within(tableRow1).getByText('Category 1')).toBeTruthy();
    expect(within(tableRow1).getByText('Missing')).toBeTruthy();

    expect(within(tableRow2).queryByText('Worker One')).toBeFalsy();
    expect(within(tableRow2).getByText('Category 2')).toBeTruthy();
    expect(within(tableRow2).getByText('Missing')).toBeTruthy();

    expect(within(tableRow3).queryByText('Worker One')).toBeFalsy();
    expect(within(tableRow3).getByText('Category 3')).toBeTruthy();
    expect(within(tableRow3).getByText('Missing')).toBeTruthy();

    expect(within(tableRow4).getByText('Worker Two')).toBeTruthy();
    expect(within(tableRow4).getByText('Category 1')).toBeTruthy();
    expect(within(tableRow4).getByText('Missing')).toBeTruthy();
  });

  it('should render the name as a link with href to the worker when the are canEditWorker Permissions', async () => {
    const { component, getByText } = await setup();

    expect(getByText('Worker One').getAttribute('href')).toEqual(
      `/workplace/${component.workplaceUid}/training-and-qualifications-record/mock-uid-1/training`,
    );
    expect(getByText('Worker Two').getAttribute('href')).toEqual(
      `/workplace/${component.workplaceUid}/training-and-qualifications-record/mock-uid-2/training`,
    );
  });

  it('should not render the name as a link if there are not the correct permissions', async () => {
    const { getByTestId } = await setup({ addPermissions: false });

    expect(getByTestId(`worker-${workers[0].name}-noLink`)).toBeTruthy();
    expect(getByTestId(`worker-${workers[1].name}-noLink`)).toBeTruthy();
  });

  it('should render an add link with href for each missing training when there are can edit permissions', async () => {
    const { component, getByTestId } = await setup();

    const tableRow1 = getByTestId(`table-row-${workers[0].name}-0`);
    const tableRow2 = getByTestId(`table-row-${workers[0].name}-1`);
    const tableRow3 = getByTestId(`table-row-${workers[0].name}-2`);
    const tableRow4 = getByTestId(`table-row-${workers[1].name}-0`);

    const table1AddLink = within(tableRow1).getByText('Add');
    const table2AddLink = within(tableRow2).getByText('Add');
    const table3AddLink = within(tableRow3).getByText('Add');
    const table4AddLink = within(tableRow4).getByText('Add');

    const getHrefWithoutQuery = (link: HTMLElement) =>
      link.getAttribute('href').slice(0, table1AddLink.getAttribute('href').indexOf('?'));

    expect(getHrefWithoutQuery(table1AddLink)).toEqual(
      `/workplace/${component.workplaceUid}/training-and-qualifications-record/mock-uid-1/add-a-training-record`,
    );

    expect(getHrefWithoutQuery(table2AddLink)).toEqual(
      `/workplace/${component.workplaceUid}/training-and-qualifications-record/mock-uid-1/add-a-training-record`,
    );
    expect(getHrefWithoutQuery(table3AddLink)).toEqual(
      `/workplace/${component.workplaceUid}/training-and-qualifications-record/mock-uid-1/add-a-training-record`,
    );
    expect(getHrefWithoutQuery(table4AddLink)).toEqual(
      `/workplace/${component.workplaceUid}/training-and-qualifications-record/mock-uid-2/add-a-training-record`,
    );
  });

  it('should not render the add links if there are not the correct permissions', async () => {
    const { getByTestId } = await setup({ addPermissions: false });

    const tableRow1 = getByTestId(`table-row-${workers[0].name}-0`);
    const tableRow2 = getByTestId(`table-row-${workers[0].name}-1`);
    const tableRow3 = getByTestId(`table-row-${workers[0].name}-2`);
    const tableRow4 = getByTestId(`table-row-${workers[1].name}-0`);

    expect(within(tableRow1).queryByText('Add')).toBeFalsy();
    expect(within(tableRow2).queryByText('Add')).toBeFalsy();
    expect(within(tableRow3).queryByText('Add')).toBeFalsy();
    expect(within(tableRow4).queryByText('Add')).toBeFalsy();
  });

  it('should apply conditionaly classes on rows when there is more than 1 training for a worker', async () => {
    const { getByTestId } = await setup(false);

    const tableRow1CategoryCell = getByTestId(`cell-${workers[0].name}-0`);
    const tableRow2CategoryCell = getByTestId(`cell-${workers[0].name}-1`);
    const tableRow3CategoryCell = getByTestId(`cell-${workers[0].name}-2`);
    const tableRow4CategoryCell = getByTestId(`cell-${workers[1].name}-0`);

    expect(tableRow1CategoryCell.getAttribute('class')).toContain('asc-table__cell-no-border__top-row');
    expect(tableRow2CategoryCell.getAttribute('class')).toContain('asc-table__cell-no-border__middle-row');
    expect(tableRow3CategoryCell.getAttribute('class')).toContain('asc-table__cell-no-border__bottom-row');
    expect(tableRow4CategoryCell.getAttribute('class')).not.toContain('asc-table__cell-no-border__top-row');
    expect(tableRow4CategoryCell.getAttribute('class')).not.toContain('asc-table__cell-no-border__middle-row');
    expect(tableRow4CategoryCell.getAttribute('class')).not.toContain('asc-table__cell-no-border__bottom-row');
  });

  it('should navigate back to the dashboard when clicking the return to home button', async () => {
    const { getByText, component, fixture, routerSpy } = await setup();
    component.workplace.uid = '1234-5678';
    const button = getByText('Return to home');
    fireEvent.click(button);
    fixture.detectChanges();
    expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'training-and-qualifications' });
  });

  describe('sort', () => {
    it('should not show the sort by dropdown if there is only 1 staff record', async () => {
      const { queryByTestId } = await setup({ fixTrainingCount: true });

      expect(queryByTestId('sortBy')).toBeFalsy();
    });

    it('should handle sort by staff name a to z', async () => {
      const { component, getByLabelText, trainingServiceSpy } = await setup();

      expect(trainingServiceSpy).not.toHaveBeenCalled();

      const select = getByLabelText('Sort by', { exact: false });
      fireEvent.change(select, { target: { value: '0_asc' } });

      expect(trainingServiceSpy).toHaveBeenCalledWith(component.workplaceUid, {
        sortBy: 'staffNameAsc',
        pageIndex: 0,
        itemsPerPage: 15,
      });
    });

    it('should handle sort by staff name z to a', async () => {
      const { component, getByLabelText, trainingServiceSpy } = await setup();

      expect(trainingServiceSpy).not.toHaveBeenCalled();

      const select = getByLabelText('Sort by', { exact: false });
      fireEvent.change(select, { target: { value: '1_desc' } });

      expect(trainingServiceSpy).toHaveBeenCalledWith(component.workplaceUid, {
        sortBy: 'staffNameDesc',
        pageIndex: 0,
        itemsPerPage: 15,
      });
    });
  });

  describe('call getMissingMandatoryTraining on trainingService when using search', () => {
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

      expect(trainingServiceSpy).toHaveBeenCalledWith(component.workplaceUid, expectedEmit);
    });

    it('should render the no results returned message when 0 workers returned from getAllWorkers after search', async () => {
      const { component, fixture, getByLabelText, getByText, trainingService } = await setup();

      component.totalWorkerCount = 16;
      fixture.detectChanges();

      sinon.stub(trainingService, 'getMissingMandatoryTraining').returns(
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

      const { component, fixture, getByLabelText } = await setup({ qsParamGetMock });

      component.totalWorkerCount = 16;
      fixture.detectChanges();
      expect((getByLabelText('Search', { exact: false }) as HTMLInputElement).value).toBe('mysupersearch');
    });
  });
});
