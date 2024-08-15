import { build, fake, sequence } from '@jackfranklin/test-data-bot';
import { render } from '@testing-library/angular';
import { MainJobRoleComponent } from './main-job-role.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { SubmitButtonComponent } from '@shared/components/submit-button/submit-button.component';
import { ErrorSummaryComponent } from '@shared/components/error-summary/error-summary.component';
import { ProgressBarComponent } from '@shared/components/progress-bar/progress-bar.component';
import { QuestionComponent } from '../question/question.component';
import { WorkerService } from '@core/services/worker.service';
import { MockWorkerServiceWithUpdateWorker, workerBuilder } from '@core/test-utils/MockWorkerService';
import { WindowRef } from '@core/services/window.ref';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { getTestBed } from '@angular/core/testing';

fdescribe('MainJobRoleComponent', () => {
  const setup = async (insideFlow = true, returnToMandatoryDetails = false, prefill = false) => {
    let path;
    if (returnToMandatoryDetails) {
      path = 'mandatory-details';
    } else if (insideFlow) {
      path = 'staff-record';
    } else {
      path = 'staff-record-summary';
    }
    const { fixture, getByText, getByTestId } = await render(MainJobRoleComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
      declarations: [ProgressBarComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        UntypedFormBuilder,
        WindowRef,
        {
          provide: WorkerService,
          uuseClass: MockWorkerServiceWithUpdateWorker,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            parent: {
              snapshot: {
                url: [{ path }],
                data: {
                  establishment: { uid: 'mocked-uid' },
                  primaryWorkplace: {},
                },
              },
            },
            snapshot: {
              params: {},
              data: {
                jobs: [],
              },
            },
          },
        },
      ],
    });

    const component = fixture.componentInstance;
    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const workerService = injector.inject(WorkerService) as WorkerService;

    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    const updateWorkerSpy = spyOn(workerService, 'updateWorker').and.callThrough();
    const submitSpy = spyOn(component, 'setSubmitAction').and.callThrough();

    return {
      component,
      fixture,
      getByTestId,
      getByText,
      routerSpy,
      updateWorkerSpy,
      submitSpy,
    };
  };

  it('should render MainJobRole', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it(`should render the 'Mandatory information' caption when accessed from mandatory details page`, async () => {
    const { getByText } = await setup(false, true);

    expect(getByText('Mandatory information')).toBeTruthy();
  });

  it(`should render the 'Update their main job role' heading when accessed from mandatory details page`, async () => {
    const { getByText } = await setup(false, true);

    expect(getByText('Update their main job role')).toBeTruthy();
  });

  it('should show the accordion', async () => {
    const { getByTestId } = await setup(false, true);

    expect(getByTestId('accordian')).toBeTruthy();
  });

  describe('submit buttons', () => {
    describe('editing from staff record', () => {
      it(`should show 'Save' and 'Cancel' buttons when not in mandatory details flow or in the staff record flow`, async () => {
        const { getByText } = await setup(false, false);

        expect(getByText('Save')).toBeTruthy();
        expect(getByText('Cancel')).toBeTruthy();
      });
    });
  });

  // it('should prefill the form when editing the job role', async () => {
  //   const { component, getByText } = await setup(false, true);

  //   const createWorker = () =>
  //     workerBuilder({
  //       overrides: {
  //         mainJob: {
  //           jobId: 15,
  //           title: 'Middle management',
  //         },
  //       },
  //     });

  //component.worker = createWorker()
  //});
});
