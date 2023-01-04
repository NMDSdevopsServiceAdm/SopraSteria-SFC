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
import { MockTrainingCategoryService } from '@core/test-utils/MockTrainingCategoriesService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { ViewTrainingComponent } from './view-trainings.component';

describe('ViewTrainingComponent', () => {
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
    const routerSpy = spyOn(router, 'navigate');
    routerSpy.and.returnValue(Promise.resolve(true));

    const trainingCategories = injector.inject(TrainingCategoryService) as TrainingCategoryService;
    const trainingCategoriesSpy = spyOn(trainingCategories, 'getCategoriesWithTraining');
    trainingCategoriesSpy.and.callThrough();

    const workerUID = component.trainings[0].worker.uid;

    return {
      component,
      fixture,
      getByText,
      getAllByText,
      getByTestId,
      routerSpy,
      trainingCategoriesSpy,
      workerUID,
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
    const trainingCategoryId = component.category.id;
    trainingCategoryId == component.trainingCategoryId;
    expect(getByText(component.category.category)).toBeTruthy();
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
    expect(getByText(component.trainings[0].worker.NameOrIdValue)).toBeTruthy();
  });

  it('should display a link for each user name to navigate to training and qualification page', async () => {
    const { getByText, component, fixture, workerUID } = await setup();

    component.canEditWorker = true;
    fixture.detectChanges();

    const nameAndValue = getByText(component.trainings[0].worker.NameOrIdValue);

    expect(nameAndValue.getAttribute('href')).toEqual(
      `/workplace/${component.workplace.uid}/training-and-qualifications-record/${workerUID}/training`,
    );
  });

  it('should display the job role of users for specific category', async () => {
    const { getByText, component } = await setup();

    expect(getByText(component.trainings[0].worker.mainJob.title)).toBeTruthy();
  });

  it(`should `, async () => {
    const { component, routerSpy, getByText, fixture, workerUID } = await setup();
    const trainingUid = component.trainings[0].uid;

    component.canEditWorker = true;
    component.trainings[0].expires;
    fixture.detectChanges();

    const updateTrainingRecord = getByText('Update');

    userEvent.click(updateTrainingRecord);

    expect(routerSpy).toHaveBeenCalledWith([
      '/workplace',
      `${component.workplace.uid}`,
      'training-and-qualifications-record',
      `${workerUID}`,
      'training',
      `${trainingUid}`,
    ]);
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
