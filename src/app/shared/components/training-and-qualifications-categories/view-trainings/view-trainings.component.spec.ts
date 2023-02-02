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
import { render, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { ViewTrainingComponent } from './view-trainings.component';

fdescribe('ViewTrainingComponent', () => {
  async function setup() {
    const { fixture, getByText, getAllByText, getByTestId } = await render(ViewTrainingComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        WindowRef,
        {
          provide: ActivatedRoute,
          useValue: new MockActivatedRoute({
            snapshot: {
              params: {
                categoryId: '2',
              },
              data: {
                training: {
                  training: [
                    expiredTrainingBuilder(),
                    expiresSoonTrainingBuilder(),
                    missingTrainingBuilder(),
                    trainingBuilder(),
                  ],
                  category: 'trainingCategory',
                  trainingCount: 4,
                  isMandatory: false,
                },
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
    const trainingCategoriesSpy = spyOn(trainingCategories, 'getCategoriesWithTraining').and.callThrough();

    return {
      component,
      fixture,
      getByText,
      getAllByText,
      getByTestId,
      router,
      routerSpy,
      trainingCategoriesSpy,
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

  it('should set the training category and current url in local storage', async () => {
    const { component, router } = await setup();
    spyOnProperty(router, 'url').and.returnValue('/view-training');
    const localStorageSpy = spyOn(localStorage, 'setItem');
    component.ngOnInit();

    expect(localStorageSpy).toHaveBeenCalledTimes(1);
    // expect(localStorageSpy.calls.all()[0].args).toEqual(['trainingCategory', '{"id":2,"category":"Autism"}']);
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
    expect(within(tableRow).getByText('Update').getAttribute('href')).toEqual(
      `/workplace/${workplace.uid}/training-and-qualifications-record/${workerUID}/training/${trainingUid}`,
    );
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
    expect(within(tableRow).getByText('Update').getAttribute('href')).toEqual(
      `/workplace/${workplace.uid}/training-and-qualifications-record/${workerUID}/training/${trainingUid}`,
    );
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
    expect(within(tableRow).getByText('Add').getAttribute('href')).toEqual(
      `/workplace/${workplace.uid}/training-and-qualifications-record/${workerUID}/add-training`,
    );
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
});
