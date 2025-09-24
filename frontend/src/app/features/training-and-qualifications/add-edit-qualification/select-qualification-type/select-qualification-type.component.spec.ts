import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { QualificationType } from '@core/model/qualification.model';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { QualificationService } from '@core/services/qualification.service';
import { WindowRef } from '@core/services/window.ref';
import { WorkerService } from '@core/services/worker.service';
import { establishmentBuilder } from '@core/test-utils/MockEstablishmentService';
import { MockQualificationService } from '@core/test-utils/MockQualificationsService';
import { mockAvailableQualifications, workerBuilder } from '@core/test-utils/MockWorkerService';
import { GroupedRadioButtonAccordionComponent } from '@shared/components/accordions/radio-button-accordion/grouped-radio-button-accordion/grouped-radio-button-accordion.component';
import { RadioButtonAccordionComponent } from '@shared/components/accordions/radio-button-accordion/radio-button-accordion.component';
import { SharedModule } from '@shared/shared.module';
import { render, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { BehaviorSubject } from 'rxjs';
import sinon from 'sinon';

import { SelectQualificationTypeComponent } from './select-qualification-type.component';

describe('SelectQualificationTypeComponent', () => {
  async function setup({ accessedFromSummary = false, prefillQualification = null } = {}) {
    const establishment = establishmentBuilder() as Establishment;
    const worker = workerBuilder();
    const qsParamGetMock = sinon.fake();

    const injectedQualificationService = {
      provide: QualificationService,
    };
    if (prefillQualification) {
      injectedQualificationService['useFactory'] = MockQualificationService.factory(prefillQualification);
    } else {
      injectedQualificationService['useClass'] = MockQualificationService;
    }

    const { fixture, getByText, getAllByText, getByTestId, getByRole } = await render(
      SelectQualificationTypeComponent,
      {
        imports: [SharedModule, RouterModule, RouterTestingModule, ReactiveFormsModule, FormsModule],
        declarations: [GroupedRadioButtonAccordionComponent, RadioButtonAccordionComponent],
        providers: [
          BackLinkService,
          ErrorSummaryService,
          WindowRef,
          FormBuilder,
          {
            provide: WorkerService,
            useValue: { worker },
          },
          injectedQualificationService,
          {
            provide: ActivatedRoute,
            useValue: {
              params: new BehaviorSubject({ establishmentuid: 'mock-uid', id: 'mock-id' }),
              snapshot: {
                data: {
                  establishment: establishment,
                  availableQualifications: mockAvailableQualifications,
                },
                parent: {
                  url: [{ path: accessedFromSummary ? 'qualification' : 'add-new-qualification' }],
                },
                queryParamMap: {
                  get: qsParamGetMock,
                },
              },
            },
          },
        provideHttpClient(), provideHttpClientTesting(),],
      },
    );

    const component = fixture.componentInstance;
    const injector = getTestBed();

    const router = injector.inject(Router) as Router;
    const workerService = injector.inject(WorkerService) as WorkerService;
    const currentRoute = injector.inject(ActivatedRoute) as ActivatedRoute;

    const qualificationService = injector.inject(QualificationService) as QualificationService;

    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return {
      component,
      fixture,
      getAllByText,
      getByTestId,
      getByText,
      getByRole,
      routerSpy,
      currentRoute,
      workerService,
      qualificationService,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('appearance', () => {
    it('should show the worker name as the section heading', async () => {
      const { component, getByTestId } = await setup();
      const sectionHeading = getByTestId('section-heading');

      expect(sectionHeading.textContent).toContain(component.worker.nameOrId);
    });

    it('should show the page heading', async () => {
      const { getByText } = await setup();

      const heading = getByText('Select the type of qualification you want to add');

      expect(heading).toBeTruthy();
    });

    it('should show the Continue button when adding new qualification', async () => {
      const { getByRole } = await setup();

      const button = getByRole('button', { name: 'Continue' });

      expect(button).toBeTruthy();
    });

    it('should show the cancel link', async () => {
      const { getByText } = await setup();

      const cancelLink = getByText('Cancel');

      expect(cancelLink).toBeTruthy();
    });

    it('should show an accordion with the correct qualification groups', async () => {
      const { getByTestId } = await setup();

      const groupedAccordion = getByTestId('groupedAccordion');
      expect(groupedAccordion).toBeTruthy();

      const allQualificationTypes = Object.values(QualificationType);
      allQualificationTypes.forEach((typeName) => {
        expect(within(groupedAccordion).getByText(typeName)).toBeTruthy();
      });
    });
  });

  describe('submit form', () => {
    it('should store the selected qualification in qualificationService', async () => {
      const { getByRole, getByText, qualificationService } = await setup();

      userEvent.click(getByText('Apprenticeship'));
      userEvent.click(getByText('Adult care worker (standard, level 2)'));
      userEvent.click(getByRole('button', { name: 'Continue' }));

      expect(qualificationService.selectedQualification).toEqual({
        id: 121,
        group: QualificationType.Apprenticeship,
        title: 'Adult care worker (standard, level 2)',
      });
    });

    it('should navigate to the details page', async () => {
      const { getByRole, getByText, currentRoute, routerSpy } = await setup();

      userEvent.click(getByText('Award'));
      userEvent.click(getByText('Advanced Award in Social Work (AASW, level 7)'));
      userEvent.click(getByRole('button', { name: 'Continue' }));

      expect(routerSpy).toHaveBeenCalledWith(['./qualification-details'], { relativeTo: currentRoute });
    });

    it('should show an error when no qualification type selected', async () => {
      const { component, fixture, getByRole, getAllByText } = await setup();

      userEvent.click(getByRole('button', { name: 'Continue' }));
      fixture.detectChanges();

      expect(component.form.invalid).toBeTruthy();
      expect(getAllByText('Select the qualification type').length).toEqual(2);
    });

    describe('prefill form', () => {
      it('should pre-fill if there is a selected qualification type', async () => {
        const prefillQualification = {
          id: 1,
          title: 'Advanced Award in Social Work (AASW, level 7)',
          group: QualificationType.Award,
        };
        const { component, getByRole } = await setup({ prefillQualification });

        expect(component.form.get('selectedQualification').value).toEqual(1);

        const radioButtonOfSelectedQual = getByRole('radio', {
          name: 'Advanced Award in Social Work (AASW, level 7)',
        }) as HTMLInputElement;

        expect(radioButtonOfSelectedQual).toBeTruthy();
        expect(radioButtonOfSelectedQual.checked).toBe(true);
      });
    });

    describe('cancel', () => {
      it('should return to training and qualification page when cancel link is clicked', async () => {
        const { component, getByText, routerSpy } = await setup();

        const cancelLink = getByText('Cancel');

        userEvent.click(cancelLink);

        expect(routerSpy).toHaveBeenCalledWith([
          '/workplace',
          component.establishmentUid,
          'training-and-qualifications-record',
          component.workerUid,
          'training',
        ]);
      });

      it('should clear any selected qualification on cancel', async () => {
        const { getByText, qualificationService } = await setup();
        const qualificationServiceSpy = spyOn(qualificationService, 'clearSelectedQualification');

        const cancelLink = getByText('Cancel');

        userEvent.click(cancelLink);

        expect(qualificationServiceSpy).toHaveBeenCalled();
      });
    });
  });
});