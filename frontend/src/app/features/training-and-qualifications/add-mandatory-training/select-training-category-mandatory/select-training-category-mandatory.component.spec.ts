import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { TrainingService } from '@core/services/training.service';
import { WindowRef } from '@core/services/window.ref';
import { WorkerService } from '@core/services/worker.service';
import { establishmentBuilder } from '@core/test-utils/MockEstablishmentService';
import { trainingCategories } from '@core/test-utils/MockTrainingCategoriesService';
import { MockTrainingService } from '@core/test-utils/MockTrainingService';
import { MockWorkerService } from '@core/test-utils/MockWorkerService';
import { GroupedRadioButtonAccordionComponent } from '@shared/components/accordions/radio-button-accordion/grouped-radio-button-accordion/grouped-radio-button-accordion.component';
import { RadioButtonAccordionComponent } from '@shared/components/accordions/radio-button-accordion/radio-button-accordion.component';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import sinon from 'sinon';

import { AddMandatoryTrainingModule } from '../add-mandatory-training.module';
import { SelectTrainingCategoryMandatoryComponent } from './select-training-category-mandatory.component';

describe('SelectTrainingCategoryMandatoryComponent', () => {
  async function setup() {
    const establishment = establishmentBuilder() as Establishment;
    const { fixture, getByText, getAllByText, getByTestId } = await render(SelectTrainingCategoryMandatoryComponent, {
      imports: [HttpClientTestingModule, SharedModule, RouterModule, RouterTestingModule, AddMandatoryTrainingModule],
      declarations: [GroupedRadioButtonAccordionComponent, RadioButtonAccordionComponent],
      providers: [
        BackLinkService,
        ErrorSummaryService,
        WindowRef,
        FormBuilder,
        {
          provide: WorkerService,
          useClass: MockWorkerService,
        },
        {
          provide: TrainingService,
          useClass: MockTrainingService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                establishment: establishment,
                trainingCategories: trainingCategories,
              },
              parent: {
                url: [{ path: 'select-staff' }],
              },
              queryParamMap: {
                get: sinon.stub(),
              },
            },
          },
        },
      ],
    });
    const component = fixture.componentInstance;
    const injector = getTestBed();

    const router = injector.inject(Router) as Router;
    const trainingService = injector.inject(TrainingService) as TrainingService;

    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    const trainingServiceSpy = spyOn(trainingService, 'resetSelectedStaff').and.callThrough();

    return {
      component,
      fixture,
      getByText,
      getAllByText,
      getByTestId,
      routerSpy,
      trainingService,
      trainingServiceSpy,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the page caption', async () => {
    const { getByText } = await setup();

    const caption = getByText('Add a mandatory training category');

    expect(caption).toBeTruthy();
  });

  it('should show the page heading', async () => {
    const { getByText } = await setup();

    const heading = getByText('Select the training category that you want to make mandatory');

    expect(heading).toBeTruthy();
  });

  it('should show the cancel link', async () => {
    const { getByText } = await setup();

    const cancelLink = getByText('Cancel');

    expect(cancelLink).toBeTruthy();
  });

  it('should reset selected staff in training service and navigate back to the add-and-manage-mandatory-training after clicking Cancel', async () => {
    const { component, getByText, fixture, routerSpy, trainingServiceSpy } = await setup();

    const cancelLink = getByText('Cancel');
    fireEvent.click(cancelLink);
    fixture.detectChanges();

    expect(trainingServiceSpy).toHaveBeenCalled();
    expect(routerSpy).toHaveBeenCalledWith([
      'workplace',
      component.establishmentUid,
      'add-and-manage-mandatory-training',
    ]);
  });

  it('should show an accordion with the correct categories in', async () => {
    const { component, getByTestId } = await setup();
    expect(component.categories).toEqual([
      { id: 1, seq: 10, category: 'Activity provision/Well-being', trainingCategoryGroup: 'Care skills and knowledge' },
      { id: 2, seq: 20, category: 'Autism', trainingCategoryGroup: 'Specific conditions and disabilities' },
      { id: 37, seq: 1, category: 'Other', trainingCategoryGroup: null },
    ]);
    expect(getByTestId('groupedAccordion')).toBeTruthy();
  });

  it('should call the training service and navigate to the select-job-roles page after selecting category and clicking continue', async () => {
    const { component, getByText, routerSpy, trainingService } = await setup();

    const trainingServiceSpy = spyOn(trainingService, 'setSelectedTrainingCategory');

    const openAllLinkLink = getByText('Show all categories');
    fireEvent.click(openAllLinkLink);

    const autismCategory = getByText('Autism');
    fireEvent.click(autismCategory);

    const continueButton = getByText('Continue');
    fireEvent.click(continueButton);

    expect(trainingServiceSpy).toHaveBeenCalledWith({
      id: 2,
      seq: 20,
      category: 'Autism',
      trainingCategoryGroup: 'Specific conditions and disabilities',
    });
    expect(routerSpy).toHaveBeenCalledWith([
      'workplace',
      component.establishmentUid,
      'add-and-manage-mandatory-training',
      'select-job-roles',
    ]);
  });

  it('should display required error message when no training category selected', async () => {
    const { component, getByText, fixture, getAllByText } = await setup();

    const continueButton = getByText('Continue');
    fireEvent.click(continueButton);
    fixture.detectChanges();

    expect(component.form.invalid).toBeTruthy();
    expect(getAllByText('Select the training category that you want to make mandatory').length).toEqual(3);
  });
});
