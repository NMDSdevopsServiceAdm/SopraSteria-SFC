import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { MandatoryTrainingService } from '@core/services/training.service';
import { WindowRef } from '@core/services/window.ref';
import { WorkerService } from '@core/services/worker.service';
import { establishmentBuilder } from '@core/test-utils/MockEstablishmentService';
import { trainingCategories } from '@core/test-utils/MockTrainingCategoriesService';
import {
  MockMandatoryTrainingService,
  MockTrainingServiceWithPreselectedStaff,
} from '@core/test-utils/MockTrainingService';
import { MockWorkerService } from '@core/test-utils/MockWorkerService';
import { GroupedRadioButtonAccordionComponent } from '@shared/components/accordions/radio-button-accordion/grouped-radio-button-accordion/grouped-radio-button-accordion.component';
import { RadioButtonAccordionComponent } from '@shared/components/accordions/radio-button-accordion/radio-button-accordion.component';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { AddMandatoryTrainingModule } from '../add-mandatory-training.module';
import { SelectTrainingCategoryMandatoryComponent } from './select-training-category-mandatory.component';

describe('SelectTrainingCategoryMandatoryComponent', () => {
  async function setup(overrides: any = {}) {
    const establishment = establishmentBuilder() as Establishment;

    const setupTools = await render(SelectTrainingCategoryMandatoryComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, AddMandatoryTrainingModule],
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
          provide: MandatoryTrainingService,
          useFactory: overrides.prefill
            ? MockTrainingServiceWithPreselectedStaff.factory()
            : MockMandatoryTrainingService.factory(overrides.trainingService),
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                establishment,
                trainingCategories: overrides.trainingCategories ?? trainingCategories,
                existingMandatoryTraining: overrides.existingMandatoryTraining ?? {},
              },
              queryParamMap: {
                get: () => overrides.selectedTraining ?? null,
              },
            },
          },
        },
      provideHttpClient(), provideHttpClientTesting(),],
    });

    const component = setupTools.fixture.componentInstance;
    const injector = getTestBed();

    const router = injector.inject(Router) as Router;
    const trainingService = injector.inject(MandatoryTrainingService) as MandatoryTrainingService;

    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return {
      ...setupTools,
      component,
      routerSpy,
      trainingService,
      establishment,
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

  it('should display the training category groups and descriptions in the accordion', async () => {
    const { getByText } = await setup();

    const trainingCategoryGroups = [
      { name: 'Care skills and knowledge', description: "Training like 'duty of care', 'safeguarding adults'" },
      { name: 'Health and safety in the workplace', description: "Training like 'fire safety', 'first aid'" },
      {
        name: 'IT, digital and data in the workplace',
        description: "Training like 'online safety and security', 'working with digital technology'",
      },
      {
        name: 'Specific conditions and disabilities',
        description: "Training like 'dementia care', 'Oliver McGowan Mandatory Training'",
      },
      { name: 'Staff development', description: "Training like 'communication', 'leadership and management'" },
    ];

    trainingCategoryGroups.forEach((group) => {
      expect(getByText(group.name)).toBeTruthy();
      expect(getByText(group.description)).toBeTruthy();
    });
  });

  it('should set the selected training category in the training service after selecting category and clicking continue', async () => {
    const { getByText, trainingService } = await setup();

    const setSelectedTrainingCategorySpy = spyOn(trainingService, 'setSelectedTrainingCategory');

    const openAllLinkLink = getByText('Show all categories');
    fireEvent.click(openAllLinkLink);

    const autismCategory = getByText('Autism');
    fireEvent.click(autismCategory);

    const continueButton = getByText('Continue');
    fireEvent.click(continueButton);

    expect(setSelectedTrainingCategorySpy).toHaveBeenCalledWith({
      id: 2,
      seq: 20,
      category: 'Autism',
      trainingCategoryGroup: 'Specific conditions and disabilities',
    });
  });

  it('should navigate to the all-or-selected-job-roles page after selecting category and clicking continue', async () => {
    const { getByText, routerSpy, establishment } = await setup();

    const openAllLinkLink = getByText('Show all categories');
    fireEvent.click(openAllLinkLink);

    const autismCategory = getByText('Autism');
    fireEvent.click(autismCategory);

    const continueButton = getByText('Continue');
    fireEvent.click(continueButton);

    expect(routerSpy).toHaveBeenCalledWith([
      'workplace',
      establishment.uid,
      'add-and-manage-mandatory-training',
      'all-or-selected-job-roles',
    ]);
  });

  it('should navigate back to the add-and-manage-mandatory-training after clicking Cancel', async () => {
    const { getByText, fixture, routerSpy, establishment } = await setup();

    const cancelLink = getByText('Cancel');
    fireEvent.click(cancelLink);
    fixture.detectChanges();

    expect(routerSpy).toHaveBeenCalledWith(['workplace', establishment.uid, 'add-and-manage-mandatory-training']);
  });

  it('should display required error message when no training category selected', async () => {
    const { fixture, getByText } = await setup();

    const continueButton = getByText('Continue');
    fireEvent.click(continueButton);
    fixture.detectChanges();

    const errorMessage = getByText('Select the training category that you want to make mandatory', {
      selector: '.govuk-error-message',
    });

    expect(errorMessage).toBeTruthy();
  });

  it("should not display 'The training is not in any of these categories' checkbox which is option on other 'Select training category' pages", async () => {
    const { fixture, queryByText } = await setup();

    expect(queryByText('The training is not in any of these categories')).toBeFalsy();
    expect(fixture.nativeElement.querySelector('#otherCheckbox')).toBeFalsy();
  });

  it('should prefill the training category radio when already selected category in training service', async () => {
    const { component } = await setup({ prefill: true });

    expect(component.form.value).toEqual({ category: 1 });
  });

  describe('Existing mandatory training', () => {
    const mockTrainingCategories = [
      { id: 1, seq: 10, category: 'Activity provision/Well-being', trainingCategoryGroup: 'Care skills and knowledge' },
      { id: 2, seq: 20, category: 'Autism', trainingCategoryGroup: 'Specific conditions and disabilities' },
      { id: 3, seq: 20, category: 'Continence care', trainingCategoryGroup: 'Care skills and knowledge' },
    ];

    const existingMandatoryTraining = {
      mandatoryTraining: [
        {
          category: mockTrainingCategories[2].category,
          establishmentId: 4090,
          jobs: [{}, {}],
          trainingCategoryId: mockTrainingCategories[2].id,
        },
      ],
    };

    it('should not include training categories which already have mandatory training', async () => {
      const overrides = {
        trainingCategories: mockTrainingCategories,
        existingMandatoryTraining,
      };

      const { queryByText } = await setup(overrides);

      expect(queryByText(mockTrainingCategories[0].category)).toBeTruthy();
      expect(queryByText(mockTrainingCategories[1].category)).toBeTruthy();
      expect(queryByText(mockTrainingCategories[2].category)).toBeFalsy();
    });

    it('should include training category and prefill the radio when existing mandatory training set in service', async () => {
      const overrides = {
        trainingCategories: mockTrainingCategories,
        existingMandatoryTraining,
        trainingService: { mandatoryTrainingBeingEdited: existingMandatoryTraining.mandatoryTraining[0] },
      };

      const { component, queryByText } = await setup(overrides);

      const selectedExistingMandatoryTrainingCategory = queryByText(mockTrainingCategories[2].category);
      expect(selectedExistingMandatoryTrainingCategory).toBeTruthy();
      expect(component.form.value).toEqual({ category: mockTrainingCategories[2].id });
    });

    it('should prefill the category in selectedTraining but still include existing mandatory training category in options when both set in service (user changed category and has gone back to page)', async () => {
      const selectedTraining = {
        trainingCategory: mockTrainingCategories[0],
      };

      const overrides = {
        trainingCategories: mockTrainingCategories,
        existingMandatoryTraining,
        trainingService: {
          mandatoryTrainingBeingEdited: existingMandatoryTraining.mandatoryTraining[0],
          _selectedTraining: selectedTraining,
        },
      };

      const { component, queryByText } = await setup(overrides);

      const selectedExistingMandatoryTrainingCategory = queryByText(mockTrainingCategories[2].category);
      expect(selectedExistingMandatoryTrainingCategory).toBeTruthy();
      expect(component.form.value).toEqual({ category: selectedTraining.trainingCategory.id });
    });
  });
});