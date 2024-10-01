import { ComponentFixture, getTestBed, TestBed } from '@angular/core/testing';

import { SelectQualificationTypeComponent } from './select-qualification-type.component';
import { establishmentBuilder } from '@core/test-utils/MockEstablishmentService';
import { workerBuilder } from '@core/test-utils/MockWorkerService';
import { Establishment } from '@core/model/establishment.model';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SharedModule } from '@shared/shared.module';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { render } from '@testing-library/angular';
import { GroupedRadioButtonAccordionComponent } from '@shared/components/accordions/radio-button-accordion/grouped-radio-button-accordion/grouped-radio-button-accordion.component';
import { RadioButtonAccordionComponent } from '@shared/components/accordions/radio-button-accordion/radio-button-accordion.component';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { WindowRef } from '@core/services/window.ref';
import { WorkerService } from '@core/services/worker.service';
import { MockQualificationService } from '@core/test-utils/MockQualificationsService';
import { QualificationService } from '@core/services/qualification.service';
import { BehaviorSubject } from 'rxjs';

fdescribe('SelectQualificationTypeComponent', () => {
  let component: SelectQualificationTypeComponent;
  let fixture: ComponentFixture<SelectQualificationTypeComponent>;

  async function setup() {
    const establishment = establishmentBuilder() as Establishment;
    const worker = workerBuilder();

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
            useValue: { worker },
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
                //       queryParamMap: {
                //         get: qsParamGetMock,
                //       },
              },
            },
          },
        ],
      },
    );

    const component = fixture.componentInstance;
    const injector = getTestBed();

    const router = injector.inject(Router) as Router;
    const qualificationService = injector.inject(QualificationService) as QualificationService;

    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return { component, getByTestId, getByText, getByRole };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

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

  it('should show the continue button', async () => {
    const { getByRole } = await setup();

    const button = getByRole('button', { name: 'Continue' });

    expect(button).toBeTruthy();
  });

  it('should show the cancel link', async () => {
    const { getByText } = await setup();

    const cancelLink = getByText('Cancel');

    expect(cancelLink).toBeTruthy();
  });
});
