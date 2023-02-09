import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { TrainingCategoryService } from '@core/services/training-category.service';
import { WindowRef } from '@core/services/window.ref';
import { MockActivatedRoute } from '@core/test-utils/MockActivatedRoute';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import {
  expiredTrainingBuilder,
  expiresSoonTrainingBuilder,
  missingTrainingBuilder,
  MockTrainingCategoryService,
  trainingBuilder,
} from '@core/test-utils/MockTrainingCategoriesService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { of } from 'rxjs';
import sinon from 'sinon';

import { ViewTrainingComponent } from './view-trainings.component';

const training = [expiredTrainingBuilder(), expiresSoonTrainingBuilder(), missingTrainingBuilder(), trainingBuilder()];

describe('ViewTrainingComponent', () => {
  async function setup(qsParamGetMock = sinon.fake(), isMandatory = false, fixTrainingCount = false) {
    let trainingObj = {
      training,
      category: 'trainingCategory',
      trainingCount: 4,
      isMandatory,
    };
    if (fixTrainingCount) trainingObj = { ...trainingObj, training: [trainingBuilder()], trainingCount: 1 };

    const { fixture, getByText, getAllByText, getByTestId, queryByTestId, getByLabelText, queryByLabelText } =
      await render(ViewTrainingComponent, {
        imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
        providers: [
          WindowRef,
          {
            provide: ActivatedRoute,
            useValue: new MockActivatedRoute({
              snapshot: {
                queryParamMap: {
                  get: qsParamGetMock,
                },
                params: {
                  categoryId: '2',
                },
                data: {
                  training: trainingObj,
                },
              },
            }),
          },
          {
            provide: TrainingCategoryService,
            useClass: MockTrainingCategoryService,
          },
          {
            provide: EstablishmentService,
            useClass: MockEstablishmentService,
          },
          {
            provide: PermissionsService,
            useClass: MockPermissionsService,
          },
        ],
      });

    const component = fixture.componentInstance;
    const injector = getTestBed();

    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    const trainingCategories = injector.inject(TrainingCategoryService) as TrainingCategoryService;
    const trainingCategoriesSpy = spyOn(trainingCategories, 'getTrainingCategory').and.returnValue(
      of({ training, category: 'trainingCategory', trainingCount: 4, isMandatory: false }),
    );

    return {
      component,
      fixture,
      getByText,
      getAllByText,
      getByTestId,
      queryByTestId,
      getByLabelText,
      queryByLabelText,
      router,
      routerSpy,
      trainingCategoriesSpy,
      trainingCategories,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display the category', async () => {
    const { getByText } = await setup();
    expect(getByText('Training category')).toBeTruthy();
  });

  it('should display the category', async () => {
    const { getByText, component } = await setup();
    expect(getByText(component.category)).toBeTruthy();
  });

  it('should display the table of users for specific training category', async () => {
    const { getByTestId } = await setup();
    const viewTrainingTable = getByTestId('userTable');
    expect(viewTrainingTable).toBeTruthy();
  });

  it('should display the table heading ', async () => {
    const { getByTestId } = await setup();
    const viewTrainingTableHeading = getByTestId('userTable-Heading');

    expect(viewTrainingTableHeading.textContent).toContain('Name or ID number');
    expect(viewTrainingTableHeading.textContent).toContain('Job role');
    expect(viewTrainingTableHeading.textContent).toContain('Expiry date');
    expect(viewTrainingTableHeading.textContent).toContain('Status');
  });

  it('should display the name of staff for specific category', async () => {
    const { getByText, component } = await setup();

    component.trainings.forEach((training) => {
      expect(getByText(training.worker.NameOrIdValue)).toBeTruthy();
    });
  });

  it('should display a link for each user name to navigate to training and qualification page', async () => {
    const { getByText, component, fixture } = await setup();

    const workerUID = component.trainings[0].worker.uid;
    component.canEditWorker = true;
    fixture.detectChanges();

    const nameAndValue = getByText(component.trainings[0].worker.NameOrIdValue);

    expect(nameAndValue.getAttribute('href')).toEqual(
      `/workplace/${component.workplace.uid}/training-and-qualifications-record/${workerUID}/training`,
    );
  });

  it('should display the job role of users for specific category', async () => {
    const { getByText, component } = await setup();

    component.trainings.forEach((training) => {
      expect(getByText(training.worker.mainJob.title)).toBeTruthy();
    });
  });

  it('should set the current url in local storage', async () => {
    const { component, router } = await setup();
    spyOnProperty(router, 'url').and.returnValue('/view-training');
    const localStorageSpy = spyOn(localStorage, 'setItem');
    component.ngOnInit();

    expect(localStorageSpy).toHaveBeenCalledTimes(1);
    expect(localStorageSpy.calls.all()[0].args).toEqual(['previousUrl', '/view-training']);
  });

  it(`should render the expired status update link with the correct url for an expired training`, async () => {
    const { component, fixture, getByTestId } = await setup();

    const workerUID = component.trainings[0].worker.uid;
    const trainingUid = component.trainings[0].uid;
    const workplace = component.workplace;

    component.canEditWorker = true;
    fixture.detectChanges();

    const tableRow = getByTestId('training-0');

    expect(within(tableRow).getByTestId('expired-flag')).toBeTruthy();
    expect(within(tableRow).getByText('1 expired')).toBeTruthy();
    expect(
      within(tableRow)
        .getByText('Update')
        .getAttribute('href')
        .slice(0, within(tableRow).getByText('Update').getAttribute('href').indexOf(';')),
    ).toEqual(`/workplace/${workplace.uid}/training-and-qualifications-record/${workerUID}/training/${trainingUid}`);
  });

  it(`should render a flag with the expires soon status and update link with the correct url for an expires soon training`, async () => {
    const { component, fixture, getByTestId } = await setup();

    const workerUID = component.trainings[1].worker.uid;
    const trainingUid = component.trainings[1].uid;
    const workplace = component.workplace;

    component.canEditWorker = true;
    fixture.detectChanges();

    const tableRow = getByTestId('training-1');

    expect(within(tableRow).getByTestId('expiring-flag')).toBeTruthy();
    expect(within(tableRow).getByText('1 expires soon')).toBeTruthy();
    expect(
      within(tableRow)
        .getByText('Update')
        .getAttribute('href')
        .slice(0, within(tableRow).getByText('Update').getAttribute('href').indexOf(';')),
    ).toEqual(`/workplace/${workplace.uid}/training-and-qualifications-record/${workerUID}/training/${trainingUid}`);
  });

  it(`should render a flag with the missing status and an add link with the correct url for missing training`, async () => {
    const { component, fixture, getByTestId } = await setup();
    const workerUID = component.trainings[2].worker.uid;
    const workplace = component.workplace;

    component.canEditWorker = true;
    fixture.detectChanges();

    const tableRow = getByTestId('training-2');

    expect(within(tableRow).getByTestId('missing-flag')).toBeTruthy();
    expect(within(tableRow).getByText('1 missing')).toBeTruthy();
    expect(
      within(tableRow)
        .getByText('Add')
        .getAttribute('href')
        .slice(0, within(tableRow).getByText('Add').getAttribute('href').indexOf(';')),
    ).toEqual(`/workplace/${workplace.uid}/training-and-qualifications-record/${workerUID}/add-training`);
  });

  it(`should render the OK status when the training is not expired and does not expire soon`, async () => {
    const { component, fixture, getByTestId } = await setup();

    component.canEditWorker = true;
    fixture.detectChanges();

    const tableRow = getByTestId('training-3');

    expect(within(tableRow).getByText('OK')).toBeTruthy();
    expect(within(tableRow).queryByTestId('expired-flag')).toBeFalsy();
    expect(within(tableRow).queryByTestId('expiring-flag')).toBeFalsy();
    expect(within(tableRow).queryByTestId('missing-flag')).toBeFalsy();
  });

  it(`should navigate back to training-and-qualification page`, async () => {
    const { component, fixture, routerSpy, getByText } = await setup();

    component.primaryWorkplaceUid = 'mocked-uid';
    const returnToHome = getByText('Return to home');
    userEvent.click(returnToHome);
    fixture.detectChanges();

    expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'training-and-qualifications' });
  });

  it(`should navigate back to sub workplace page when clicking the return home button when accessing a sub account from a parent`, async () => {
    const { routerSpy, getByText } = await setup();

    const returnToHome = getByText('Return to home');
    userEvent.click(returnToHome);

    expect(routerSpy).toHaveBeenCalledWith(['/workplace', 'mocked-uid'], { fragment: 'training-and-qualifications' });
  });

  describe('sort', () => {
    it('should not show the sort by dropdown if there is only 1 staff record', async () => {
      const { queryByTestId } = await setup(sinon.fake(), false, true);

      expect(queryByTestId('sortBy')).toBeFalsy();
    });

    it('should have a sort by values of expired, expires soon, missing and staff name for mandatory training', async () => {
      const { component } = await setup(sinon.fake(), true);

      const mandatorySortByParamMap = {
        '0_expired': 'trainingExpired',
        '1_expires_soon': 'trainingExpiringSoon',
        '2_missing': 'trainingMissing',
        '3_worker': 'staffNameAsc',
      };
      expect(component.sortByParamMap).toEqual(mandatorySortByParamMap);
    });

    it('should have a sort by values of expired, expires soon, and staff name for non mandatory training', async () => {
      const { component } = await setup();

      const mandatorySortByParamMap = {
        '0_expired': 'trainingExpired',
        '1_expires_soon': 'trainingExpiringSoon',
        '2_worker': 'staffNameAsc',
      };
      expect(component.sortByParamMap).toEqual(mandatorySortByParamMap);
    });

    it('should handle sort by expired', async () => {
      const { component, getByLabelText, trainingCategoriesSpy } = await setup();

      expect(trainingCategoriesSpy).not.toHaveBeenCalled();

      const select = getByLabelText('Sort by', { exact: false });
      fireEvent.change(select, { target: { value: '0_expired' } });

      expect(trainingCategoriesSpy).toHaveBeenCalledWith(component.workplace.id, component.trainingCategoryId, {
        sortBy: 'trainingExpired',
        pageIndex: 0,
        itemsPerPage: 15,
      });
    });

    it('should handle sort by expiring soon', async () => {
      const { component, getByLabelText, trainingCategoriesSpy } = await setup();

      expect(trainingCategoriesSpy).not.toHaveBeenCalled();

      const select = getByLabelText('Sort by', { exact: false });
      fireEvent.change(select, { target: { value: '1_expires_soon' } });

      expect(trainingCategoriesSpy).toHaveBeenCalledWith(component.workplace.id, component.trainingCategoryId, {
        sortBy: 'trainingExpiringSoon',
        pageIndex: 0,
        itemsPerPage: 15,
      });
    });

    it('should handle sort by staff name', async () => {
      const { component, getByLabelText, trainingCategoriesSpy } = await setup();

      expect(trainingCategoriesSpy).not.toHaveBeenCalled();

      const select = getByLabelText('Sort by', { exact: false });
      fireEvent.change(select, { target: { value: '2_worker' } });

      expect(trainingCategoriesSpy).toHaveBeenCalledWith(component.workplace.id, component.trainingCategoryId, {
        sortBy: 'staffNameAsc',
        pageIndex: 0,
        itemsPerPage: 15,
      });
    });

    it('should handle sort by missing training for mandatory training', async () => {
      const { component, getByLabelText, trainingCategoriesSpy } = await setup(sinon.fake(), true);

      expect(trainingCategoriesSpy).not.toHaveBeenCalled();

      const select = getByLabelText('Sort by', { exact: false });
      fireEvent.change(select, { target: { value: '2_missing' } });

      expect(trainingCategoriesSpy).toHaveBeenCalledWith(component.workplace.id, component.trainingCategoryId, {
        sortBy: 'trainingMissing',
        pageIndex: 0,
        itemsPerPage: 15,
      });
    });
  });

  describe('call getTrainingCategory on trainingCategoriesService when using search', () => {
    it('does not render the search bar when there are fewer than 15 training records', async () => {
      const { queryByLabelText } = await setup();

      const searchInput = queryByLabelText('Search staff training records');
      expect(searchInput).toBeNull();
    });

    it('shoud call getTrainingCategory with the correct search term passed', async () => {
      const { component, fixture, getByLabelText, trainingCategoriesSpy } = await setup();

      component.totalTrainingCount = 16;
      fixture.detectChanges();

      const searchInput = getByLabelText('Search staff training records');
      expect(searchInput).toBeTruthy();

      userEvent.type(searchInput, 'search term here{enter}');
      const expectedEmit = {
        pageIndex: 0,
        itemsPerPage: 15,
        sortBy: 'trainingExpired',
        searchTerm: 'search term here',
      };

      expect(trainingCategoriesSpy).toHaveBeenCalledWith(
        component.workplace.id,
        component.trainingCategoryId,
        expectedEmit,
      );
    });

    it('should render the no results returned message when 0 workers returned from getAllWorkers after search', async () => {
      const { component, fixture, getByLabelText, getByText, trainingCategories } = await setup();

      component.totalTrainingCount = 16;
      fixture.detectChanges();

      sinon.stub(trainingCategories, 'getTrainingCategory').returns(
        of({
          training: [],
          isMandatory: false,
          category: 'trainingCategory',
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

      const { component, fixture, getByLabelText } = await setup(qsParamGetMock);

      component.totalTrainingCount = 16;
      fixture.detectChanges();
      expect((getByLabelText('Search staff training records') as HTMLInputElement).value).toBe('mysupersearch');
    });
  });
});
