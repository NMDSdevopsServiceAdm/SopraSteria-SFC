import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { UntypedFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { WorkerService } from '@core/services/worker.service';
import { MockWorkerServiceWithoutReturnUrl } from '@core/test-utils/MockWorkerService';
import { build, fake } from '@jackfranklin/test-data-bot';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { RecruitedFromComponent } from './recruited-from.component';
import { RecruitmentService } from '@core/services/recruitment.service';
import { MockRecruitmentService } from '@core/test-utils/MockRecruitmentService';
import { NO_ERRORS_SCHEMA } from '@angular/core';

const workerBuilder = build('Worker', {
  fields: {
    uid: fake((f) => f.datatype.uuid()),
    countryOfBirth: {
      value: 'United Kingdom',
    },
    mainJob: {
      id: 20,
      jobId: 20,
    },
    recruitedFrom: {},
  },
});

const nonUkWorker = () =>
  workerBuilder({
    overrides: {
      countryOfBirth: {
        value: 'Germany',
      },
    },
  });

const registeredNurse = () =>
  workerBuilder({
    overrides: {
      mainJob: {
        id: 23,
        jobId: 23,
      },
    },
  });

const workerRecruitedFromUnknown = () =>
  workerBuilder({
    overrides: {
      recruitedFrom: {
        value: 'No',
      },
    },
  });

const workerRecruitedFromKnown = () =>
  workerBuilder({
    overrides: {
      recruitedFrom: {
        from: {
          recruitedFromId: 3,
          from: 'Health sector',
        },
        value: 'Yes',
      },
    },
  });

describe('RecruitedFromComponent', () => {
  async function setup(insideFlow = true, workerType = 'ukWorker') {
    let worker;
    if (workerType === 'ukWorker') {
      worker = workerBuilder();
    } else if (workerType === 'nonUkWorker') {
      worker = nonUkWorker();
    } else if (workerType === 'nurse') {
      worker = registeredNurse();
    } else if (workerType === 'workerRecruitedFromUnknown') {
      worker = workerRecruitedFromUnknown();
    } else if (workerType === 'workerRecruitedFromKnown') {
      worker = workerRecruitedFromKnown();
    }

    const { fixture, getByText, getAllByText, getByLabelText, getByTestId, queryByTestId } = await render(
      RecruitedFromComponent,
      {
        imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
        providers: [
          UntypedFormBuilder,
          {
            provide: ActivatedRoute,
            useValue: {
              parent: {
                snapshot: {
                  url: [{ path: insideFlow ? 'staff-uid' : 'staff-record-summary' }],
                  data: {
                    establishment: { uid: 'mocked-uid' },
                    primaryWorkplace: {},
                  },
                },
              },
              snapshot: {
                params: {},
              },
            },
          },
          {
            provide: WorkerService,
            useFactory: MockWorkerServiceWithoutReturnUrl.factory(worker),
            deps: [HttpClient],
          },
          {
            provide: RecruitmentService,
            useClass: MockRecruitmentService,
          },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      },
    );

    const component = fixture.componentInstance;

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;

    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return {
      component,
      fixture,
      router,
      getByText,
      getAllByText,
      getByLabelText,
      routerSpy,
      getByTestId,
      queryByTestId,
    };
  }

  it('should render the RecruitedFromComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the question heading', async () => {
    const { fixture } = await setup();

    const question = 'Select where they were recruited from';
    const heading = fixture.nativeElement.querySelector('h1');

    expect(heading.innerText).toContain(question);
  });

  describe('submit buttons', () => {
    it(`should show 'Save and continue' cta button and 'View this staff record' and 'Skip this question' link, if a return url is not provided`, async () => {
      const { getByText } = await setup();

      expect(getByText('Save and continue')).toBeTruthy();
      expect(getByText('View this staff record')).toBeTruthy();
      expect(getByText('Skip this question')).toBeTruthy();
    });

    it(`should show 'Save and return' cta button and 'Cancel' link if a return url is provided`, async () => {
      const { getByText } = await setup(false);

      expect(getByText('Save and return')).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
    });

    it(`should call submit data and navigate with the correct url when 'Save and continue' is clicked`, async () => {
      const { component, getByText, routerSpy } = await setup();

      const button = getByText('Save and continue');
      fireEvent.click(button);

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        'mocked-uid',
        'staff-record',
        component.worker.uid,
        'adult-social-care-started',
      ]);
    });

    it(`should navigate to  'adult-social-care-started' page when skipping the question in the flow`, async () => {
      const { component, routerSpy, getByText } = await setup();

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      const skipButton = getByText('Skip this question');
      fireEvent.click(skipButton);

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        workplaceId,
        'staff-record',
        workerId,
        'adult-social-care-started',
      ]);
    });

    it(`should navigate to 'staff-summary-page' page when clicking 'View this staff record' link `, async () => {
      const { component, routerSpy, getByText } = await setup();

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      const viewStaffRecord = getByText('View this staff record');
      fireEvent.click(viewStaffRecord);

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        workplaceId,
        'staff-record',
        workerId,
        'staff-record-summary',
      ]);
    });

    it('should navigate to staff-summary-page page when pressing save and return', async () => {
      const { component, routerSpy, getByText } = await setup(false);

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      const link = getByText('Save and return');
      fireEvent.click(link);

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        workplaceId,
        'staff-record',
        workerId,
        'staff-record-summary',
      ]);
    });

    it('should navigate to staff-summary-page page when pressing cancel', async () => {
      const { component, routerSpy, getByText } = await setup(false);

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      const link = getByText('Cancel');
      fireEvent.click(link);

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        workplaceId,
        'staff-record',
        workerId,
        'staff-record-summary',
      ]);
    });

    it('should navigate to funding staff-summary-page page when pressing save and return in funding version of page', async () => {
      const { component, routerSpy, getByText, router, fixture } = await setup(false, 'ukWorker');
      spyOnProperty(router, 'url').and.returnValue('/funding/staff-record');
      component.returnUrl = undefined;
      component.ngOnInit();
      fixture.detectChanges();
      const workerId = component.worker.uid;

      const link = getByText('Save and return');
      fireEvent.click(link);

      expect(routerSpy).toHaveBeenCalledWith(['/funding', 'staff-record', workerId]);
    });

    it('should navigate to funding staff-summary-page page when pressing cancel in funding version of page', async () => {
      const { component, routerSpy, getByText, router, fixture } = await setup(false, 'ukWorker');
      spyOnProperty(router, 'url').and.returnValue('/funding/staff-record');
      component.returnUrl = undefined;
      component.ngOnInit();
      fixture.detectChanges();
      const workerId = component.worker.uid;

      const link = getByText('Cancel');
      fireEvent.click(link);

      expect(routerSpy).toHaveBeenCalledWith(['/funding', 'staff-record', workerId]);
    });
  });

  describe('progress bar', () => {
    it('should render the progress bar when in the flow', async () => {
      const { getByTestId } = await setup();

      expect(getByTestId('progress-bar')).toBeTruthy();
    });

    it('should not render the progress bar when outside the flow', async () => {
      const { queryByTestId } = await setup(false);

      expect(queryByTestId('progress-bar')).toBeFalsy();
    });
  });

  describe('previously saved answers', () => {
    it("should show the correct recruited from value checked  doNotKnowId is 'Yes'", async () => {
      const { fixture } = await setup(false, 'workerRecruitedFromKnown');

      const selectedRadioBtn = fixture.nativeElement.querySelector('input[id="recruitedFromId-2"]');

      expect(selectedRadioBtn.checked).toBeTruthy();
    });

    it("should show the value as 'I do not know' when doNotKnowId is 'No'", async () => {
      const { component, fixture } = await setup(false, 'workerRecruitedFromUnknown');

      const recruitedFromId = `recruitedFromId-${component.availableRecruitments.length - 1}`;

      const selectedRadioBtn = fixture.nativeElement.querySelector(`input[id=${recruitedFromId}]`);

      expect(selectedRadioBtn.checked).toBeTruthy();
    });
  });
});
