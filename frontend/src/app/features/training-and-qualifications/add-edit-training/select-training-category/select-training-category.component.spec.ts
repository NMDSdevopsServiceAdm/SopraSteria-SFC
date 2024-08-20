import { fireEvent, render } from '@testing-library/angular';
import { BehaviorSubject } from 'rxjs';
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
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { WorkerService } from '@core/services/worker.service';
import { workerBuilder } from '@core/test-utils/MockWorkerService';
import { establishmentBuilder } from '@core/test-utils/MockEstablishmentService';
import { Establishment } from '@core/model/establishment.model';
import { SelectTrainingCategoryComponent } from './select-training-category.component';
import { trainingCategories } from '@core/test-utils/MockTrainingCategoriesService';
import sinon from 'sinon';

describe('SelectTrainingCategoryComponent', () => {
  async function setup(prefill = false, qsParamGetMock = sinon.stub()) {
    const establishment = establishmentBuilder() as Establishment;
    const worker = workerBuilder();

    const { fixture, getByText, getAllByText, getByTestId } = await render(SelectTrainingCategoryComponent, {
      imports: [HttpClientTestingModule, SharedModule, RouterModule, RouterTestingModule, ReactiveFormsModule],
      declarations: [
        SelectTrainingCategoryComponent,
        GroupedRadioButtonAccordionComponent,
        RadioButtonAccordionComponent,
      ],
      providers: [
        BackLinkService,
        ErrorSummaryService,
        WindowRef,
        FormBuilder,
        {
          provide: WorkerService,
          useValue: { worker },
        },
        {
          provide: TrainingService,
          useClass: prefill ? MockTrainingServiceWithPreselectedStaff : MockTrainingService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            params: new BehaviorSubject({ establishmentuid: 'mock-uid', id: 'mock-id' }),
            snapshot: {
              data: {
                establishment: establishment,
                trainingCategories: trainingCategories,
              },
              queryParamMap: {
                get: qsParamGetMock,
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

  it('should show the worker name as the section heading', async () => {
    const { component, getByTestId } = await setup(true);
    const sectionHeading = getByTestId('section-heading');

    expect(sectionHeading.textContent).toContain(component.worker.nameOrId);
  });

  it('should show the page heading', async () => {
    const { getByText } = await setup(true);

    const heading = getByText('Select the category that best matches the training taken');

    expect(heading).toBeTruthy();
  });

  it('should show the continue button', async () => {
    const { getByText } = await setup(true);

    const button = getByText('Continue');

    expect(button).toBeTruthy();
  });

  it('should show the cancel link', async () => {
    const { getByText } = await setup(true);

    const cancelLink = getByText('Cancel');

    expect(cancelLink).toBeTruthy();
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

  it('should call the training service and navigate to the details page', async () => {
    const { component, getByText, routerSpy, trainingService } = await setup(true);

    const trainingServiceSpy = spyOn(trainingService, 'setSelectedTrainingCategory').and.callThrough();

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
      `workplace/${component.establishmentUid}/training-and-qualifications-record/${component.workerId}/add-training/details`,
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

  it('should pre-fill when adding a record to a mandatory training category', async () => {
    const qsParamGetMock = sinon.stub().returns(JSON.stringify({ id: 2, category: 'Autism' }));

    const { component, fixture } = await setup(false, qsParamGetMock);

    fixture.detectChanges();

    expect(component.form.value).toEqual({ category: 2 });
  });

  it('should pre-fill if there is a selected category', async () => {
    const { component } = await setup(true);

    expect(component.form.value).toEqual({ category: 1 });
  });
});
