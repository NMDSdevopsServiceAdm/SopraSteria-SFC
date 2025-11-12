import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TrainingService } from '@core/services/training.service';
import { MockTrainingService, MockTrainingServiceWithPreselectedStaff } from '@core/test-utils/MockTrainingService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import { Observable } from 'rxjs';

import { WorkersModule } from '../workers.module';
import { SelectRecordTypeComponent } from './select-record-type.component';

describe('SelectRecordTypeComponent', () => {
  async function setup(prefill = false) {
    const { fixture, getByText, getAllByText } = await render(SelectRecordTypeComponent, {
      imports: [SharedModule, RouterModule, WorkersModule],
      providers: [
        { provide: TrainingService, useClass: prefill ? MockTrainingServiceWithPreselectedStaff : MockTrainingService },
        {
          provide: ActivatedRoute,
          useValue: {
            params: Observable.from([{ establishmentuid: 'establishmentUid', id: 1 }]),
          },
        },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    const component = fixture.componentInstance;
    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    const trainingService = injector.inject(TrainingService) as TrainingService;
    const clearSelectedTrainingCategorySpy = spyOn(trainingService, 'clearSelectedTrainingCategory').and.callThrough();

    return {
      component,
      fixture,
      routerSpy,
      getByText,
      getAllByText,
      clearSelectedTrainingCategorySpy,
    };
  }

  it('should render a SelectRecordTypeComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('error messages', () => {
    it('should display an error message if no record type is selected and Continue is pressed', async () => {
      const { fixture, getByText, getAllByText } = await setup();

      fireEvent.click(getByText('Continue'));
      fixture.detectChanges();
      expect(getAllByText('Select the type of record').length).toEqual(2);
    });
  });

  describe('prefillForm', () => {
    it('should prefill the radio button for training record if navigating back from add training record page', async () => {
      const { component, fixture } = await setup(true);

      fixture.detectChanges();
      const form = component.form;
      expect(form.valid).toBeTruthy();
      expect(form.value).toEqual({ selectRecordType: 'Training course' });
    });

    it('should not prefill the radio button when navigating from training page', async () => {
      const { component, fixture } = await setup();

      fixture.detectChanges();
      const form = component.form;
      expect(form.invalid).toBeTruthy();
      expect(form.value).toEqual({ selectRecordType: null });
    });
  });

  it('should call trainingService if there is no trainingOrQualificationPreviouslySelected when landing on the page', async () => {
    const { component, clearSelectedTrainingCategorySpy } = await setup();

    component.ngOnInit();

    expect(clearSelectedTrainingCategorySpy).toHaveBeenCalled();
  });
});
