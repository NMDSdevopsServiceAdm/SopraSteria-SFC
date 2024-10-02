import { getTestBed } from '@angular/core/testing';
import userEvent from '@testing-library/user-event';
import { SelectQualificationTypeComponent } from './select-qualification-type.component';
import { establishmentBuilder } from '@core/test-utils/MockEstablishmentService';
import { mockAvailableQualifications, MockWorkerService, workerBuilder } from '@core/test-utils/MockWorkerService';
import { Establishment } from '@core/model/establishment.model';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SharedModule } from '@shared/shared.module';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { render, within } from '@testing-library/angular';
import { GroupedRadioButtonAccordionComponent } from '@shared/components/accordions/radio-button-accordion/grouped-radio-button-accordion/grouped-radio-button-accordion.component';
import { RadioButtonAccordionComponent } from '@shared/components/accordions/radio-button-accordion/radio-button-accordion.component';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { WindowRef } from '@core/services/window.ref';
import { WorkerService } from '@core/services/worker.service';
import { Worker } from '@core/model/worker.model';
import { MockQualificationService } from '@core/test-utils/MockQualificationsService';
import { QualificationService } from '@core/services/qualification.service';
import { BehaviorSubject, of } from 'rxjs';
import sinon from 'sinon';
import { QualificationType } from '@core/model/qualification.model';

fdescribe('SelectQualificationTypeComponent', () => {
  async function setup({ accessedFromSummary = false } = {}) {
    const establishment = establishmentBuilder() as Establishment;
    const worker = workerBuilder();
    const qsParamGetMock = sinon.fake();

    const { fixture, getByText, getAllByText, getByTestId, getByRole } = await render(
      SelectQualificationTypeComponent,
      {
        imports: [HttpClientTestingModule, SharedModule, RouterModule, RouterTestingModule, ReactiveFormsModule],
        declarations: [GroupedRadioButtonAccordionComponent, RadioButtonAccordionComponent],
        providers: [
          BackLinkService,
          ErrorSummaryService,
          WindowRef,
          FormBuilder,
          {
            provide: WorkerService,
            useFactory: MockWorkerService.factory(worker as Worker),
          },
          {
            provide: QualificationService,
            useClass: MockQualificationService,
          },
          {
            provide: ActivatedRoute,
            useValue: {
              params: new BehaviorSubject({ establishmentuid: 'mock-uid', id: 'mock-id' }),
              snapshot: {
                data: {
                  establishment: establishment,
                  //         trainingCategories: trainingCategories,
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
        ],
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
        type: 'Apprenticeship' as QualificationType,
        id: 121,
      });
    });

    it('should navigate to the details page', async () => {
      const { getByRole, getByText, currentRoute, routerSpy } = await setup();

      userEvent.click(getByText('Award'));
      userEvent.click(getByText('Advanced Award in Social Work (AASW, level 7)'));
      userEvent.click(getByRole('button', { name: 'Continue' }));

      expect(routerSpy).toHaveBeenCalledWith(['./qualification-details'], { relativeTo: currentRoute });
    });
  });

  describe('navigation', () => {
    it('should return to training and qualification page when cancel link is clicked', async () => {
      const { getByText, routerSpy } = await setup();

      const cancelLink = getByText('Cancel');

      userEvent.click(cancelLink);

      expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'training-and-qualifications' });
    });
  });
});
