import { fireEvent, render } from '@testing-library/angular';
import { SelectTrainingCategoryMultipleComponent } from './select-training-category-multiple.component';
import { getTestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TrainingService } from '@core/services/training.service';
import { MockTrainingService, MockTrainingServiceWithPreselectedStaff } from '@core/test-utils/MockTrainingService';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { GroupedRadioButtonAccordionComponent } from '@shared/components/accordions/radio-button-accordion/grouped-radio-button-accordion/grouped-radio-button-accordion.component';
import { RadioButtonAccordionComponent } from '@shared/components/accordions/radio-button-accordion/radio-button-accordion.component';
import { SharedModule } from '@shared/shared.module';
import { RouterTestingModule } from '@angular/router/testing';
import { WindowRef } from '@core/services/window.ref';
import { FormBuilder } from '@angular/forms';
import { WorkerService } from '@core/services/worker.service';
import { MockWorkerService } from '@core/test-utils/MockWorkerService';
import { AddMultipleTrainingModule } from '../add-multiple-training.module';
import { establishmentBuilder } from '@core/test-utils/MockEstablishmentService';
import { Establishment } from '@core/model/establishment.model';
import { trainingCategories } from '@core/test-utils/MockTrainingCategoriesService';

describe('SelectTrainingCategoryMultipleComponent', () => {
  async function setup(prefill = false, accessedFromSummary = false) {
    const establishment = establishmentBuilder() as Establishment;
    const { fixture, getByText, getAllByText, getByTestId } = await render(SelectTrainingCategoryMultipleComponent, {
      imports: [HttpClientTestingModule, SharedModule, RouterModule, RouterTestingModule, AddMultipleTrainingModule],
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
          useClass: prefill ? MockTrainingServiceWithPreselectedStaff : MockTrainingService,
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
                url: [{ path: accessedFromSummary ? 'confirm-training' : 'select-staff' }],
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
    const { component } = await setup(true);
    expect(component).toBeTruthy();
  });

  it('should show the page caption', async () => {
    const { getByText } = await setup(true);

    const caption = getByText('Add multiple records');

    expect(caption).toBeTruthy();
  });

  it('should show the page heading', async () => {
    const { getByText } = await setup(true);

    const heading = getByText('Select the category that best matches the training taken');

    expect(heading).toBeTruthy();
  });

  it('should show the continue button when it is not accessed from the confirm training page', async () => {
    const { getByText } = await setup(true);

    const button = getByText('Continue');

    expect(button).toBeTruthy();
  });

  it('should show the save and return button when it is accessed from the confirm training page', async () => {
    const { getByText } = await setup(true, true);

    const button = getByText('Save and return');

    expect(button).toBeTruthy();
  });

  it('should show the cancel link', async () => {
    const { getByText } = await setup(true);

    const cancelLink = getByText('Cancel');

    expect(cancelLink).toBeTruthy();
  });

  it('should reset selected staff in training service and navigate to dashboard after clicking Cancel', async () => {
    const { getByText, fixture, routerSpy, trainingServiceSpy } = await setup(true);

    const cancelLink = getByText('Cancel');
    fireEvent.click(cancelLink);
    fixture.detectChanges();

    expect(trainingServiceSpy).toHaveBeenCalled();
    expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'training-and-qualifications' });
  });

  it('should show an accordian with the correct categories in', async () => {
    const { component, getByTestId } = await setup(true);
    expect(component.categories).toEqual([
      { id: 1, seq: 10, category: 'Activity provision/Well-being', trainingCategoryGroup: 'Care skills and knowledge' },
      { id: 2, seq: 20, category: 'Autism', trainingCategoryGroup: 'Specific conditions and disabilities' },
      { id: 37, seq: 1, category: 'Other', trainingCategoryGroup: null },
    ]);
    expect(getByTestId('accordian')).toBeTruthy();
  });

  it('should return to the select staff page if there is no selected staff', async () => {
    const { component, fixture, routerSpy } = await setup();

    fixture.detectChanges();
    component.ngOnInit();

    expect(routerSpy).toHaveBeenCalledOnceWith([
      'workplace',
      component.establishmentUid,
      'add-multiple-training',
      'select-staff',
    ]);
  });

  it('should call the training service and navigate to the details page when it is not accessed from the confirm training page', async () => {
    const { component, getByText, routerSpy, trainingService } = await setup(true);

    const trainingServiceSpy = spyOn(trainingService, 'setTrainingCategorySelectedForTrainingRecord').and.callThrough();

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
      'add-multiple-training',
      'training-details',
    ]);
  });

  it('should navigate back to the confirm training page when it is accessed from the confirm training page', async () => {
    const { component, getByText, routerSpy, trainingService } = await setup(true, true);

    const trainingServiceSpy = spyOn(trainingService, 'setTrainingCategorySelectedForTrainingRecord').and.callThrough();

    const openAllLinkLink = getByText('Show all categories');
    fireEvent.click(openAllLinkLink);

    const wellbeingCategory = getByText('Activity provision/Well-being');
    fireEvent.click(wellbeingCategory);

    const saveAndReturnButton = getByText('Save and return');
    fireEvent.click(saveAndReturnButton);

    expect(trainingServiceSpy).toHaveBeenCalledWith({
      id: 1,
      seq: 10,
      category: 'Activity provision/Well-being',
      trainingCategoryGroup: 'Care skills and knowledge',
    });
    expect(routerSpy).toHaveBeenCalledWith([
      'workplace',
      component.establishmentUid,
      'add-multiple-training',
      'confirm-training',
    ]);
  });

  it('should show an error when no training category selected', async () => {
    const { component, getByText, fixture, getAllByText } = await setup(true);
    component.form.markAsDirty();
    component.form.get('category').setValue(null);
    component.form.get('category').markAsDirty();

    const continueButton = getByText('Continue');
    fireEvent.click(continueButton);
    fixture.detectChanges();

    expect(component.form.invalid).toBeTruthy();
    expect(getAllByText('Select the training category').length).toEqual(1);
  });
});
