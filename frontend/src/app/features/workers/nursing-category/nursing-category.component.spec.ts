import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RegisteredNurseJobRoleId } from '@core/model/nurse-field-of-practice.model';
import { AlertService } from '@core/services/alert.service';
import { WorkerService } from '@core/services/worker.service';
import { MockWorkerServiceWithOverrides } from '@core/test-utils/MockWorkerService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { NursingCategoryComponent } from './nursing-category.component';

const mockFieldsOfPractice = [
  { id: 1, label: 'Adult nursing' },
  { id: 2, label: 'Mental health nursing' },
  { id: 3, label: 'Learning disabilities nursing' },
  { id: 4, label: "Children's nursing" },
];

fdescribe('NursingCategoryComponent', () => {
  async function setup(overrides: any = {}) {
    const insideFlow = overrides?.insideFlow ?? true;
    const previousAnswer = overrides?.previousAnswer;
    const fromBlueBanner = overrides?.fromBlueBanner ?? false;

    const mockWorker = {
      uid: 'mock-worker-uid',
      mainJob: {
        jobId: RegisteredNurseJobRoleId,
        title: 'Registered nurse',
      },
      nameOrId: 'Nurse',
      nurseFieldOfPractice: previousAnswer ?? [],
    };

    const setupTools = await render(NursingCategoryComponent, {
      imports: [SharedModule, RouterModule, ReactiveFormsModule],
      providers: [
        UntypedFormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            parent: {
              snapshot: {
                url: [{ path: insideFlow ? 'staff-uid' : 'staff-record-summary' }],
                data: {
                  establishment: { uid: 'mock-establishment-uid' },
                  primaryWorkplace: {},
                },
              },
            },
            snapshot: {
              data: { allNurseFieldsOfPractice: mockFieldsOfPractice, fromBlueBanner },
              params: {},
            },
          },
        },
        {
          provide: AlertService,
          useValue: {
            addAlert: jasmine.createSpy('addAlert'),
          },
        },
        {
          provide: WorkerService,
          useFactory: MockWorkerServiceWithOverrides.factory({
            worker: mockWorker,
          }),
        },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    const component = setupTools.fixture.componentInstance;

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;

    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    const alertService = injector.inject(AlertService) as AlertService;
    const workerService = injector.inject(WorkerService) as WorkerService;
    const updateWorkerSpy = spyOn(workerService, 'updateWorker').and.callThrough();

    return {
      ...setupTools,
      component,
      router,
      routerSpy,
      updateWorkerSpy,
      alertService,
    };
  }

  it('should render the NursingCategoryComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show a heading', async () => {
    const { getByRole } = await setup();

    expect(getByRole('heading', { level: 1 }).textContent).toContain(
      'What is their Nursing and Midwifery Council field of practice?',
    );
  });

  it('should show a link to nursing and midwifery council register', async () => {
    const { getByRole } = await setup();

    const expectedLinkText = /Search the Nursing and Midwifery Council register/;

    expect(getByRole('link', { name: expectedLinkText })).toBeTruthy();
  });

  it('should set fromBlueBanner when accessed from the blue banner', async () => {
    const { component } = await setup({ fromBlueBanner: true });

    expect(component.fromBlueBanner).toBeTrue();
  });

  describe('caption (section heading)', () => {
    it('should show the section heading as "Employment details" when visited inside flow', async () => {
      const { getByTestId } = await setup({ insideFlow: true });

      const sectionHeading = getByTestId('section-heading');
      expect(sectionHeading.textContent).toEqual('Employment details');
    });

    it('should show the section heading as "Employment details" when visited from worker summary', async () => {
      const { getByTestId } = await setup({ insideFlow: false });

      const sectionHeading = getByTestId('section-heading');
      expect(sectionHeading.textContent).toEqual('Employment details');
    });
  });

  it('should show a checkbox for each nurse field of practice', async () => {
    const { getByRole } = await setup();

    mockFieldsOfPractice.forEach(({ label }) => {
      expect(getByRole('checkbox', { name: label })).toBeTruthy();
    });
  });

  it('should prefill the previous answer', async () => {
    const previousAnswer = [
      { id: 1, label: 'Adult nursing' },
      { id: 4, label: "Children's nursing" },
    ];
    const { getByRole } = await setup({ previousAnswer });

    mockFieldsOfPractice.forEach(({ label }) => {
      const shouldBeTicked = ['Adult nursing', "Children's nursing"].includes(label);
      const checkbox = getByRole('checkbox', { name: label }) as HTMLInputElement;
      expect(checkbox.checked).toEqual(shouldBeTicked);
    });
  });

  describe('submit buttons', () => {
    it(`should show 'Save and continue' cta button and 'View this staff record'  and 'Skip this question' link, if inside flow`, async () => {
      const { getByText } = await setup();

      expect(getByText('Save and continue')).toBeTruthy();
      expect(getByText('View this staff record')).toBeTruthy();
      expect(getByText('Skip this question')).toBeTruthy();
    });

    it(`should show 'Save and return' cta button and 'Cancel' link if not in the flow`, async () => {
      const { getByText } = await setup({ insideFlow: false });

      expect(getByText('Save and return')).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
    });
  });

  it('should call updateWorker with expected props on submit', async () => {
    const answersToChoose = [
      { id: 1, label: 'Adult nursing' },
      { id: 4, label: "Children's nursing" },
    ];
    const { updateWorkerSpy, getByRole, getByText } = await setup();

    answersToChoose.forEach(({ label }) => {
      userEvent.click(getByRole('checkbox', { name: label }));
    });
    const button = getByText('Save and continue');
    userEvent.click(button);

    expect(updateWorkerSpy).toHaveBeenCalledWith('mock-establishment-uid', 'mock-worker-uid', {
      nurseFieldOfPractice: answersToChoose,
    });
  });

  it('should not call updateWorker if nothing as been chosen', async () => {
    const { updateWorkerSpy, getByText } = await setup();

    const button = getByText('Save and continue');
    userEvent.click(button);

    expect(updateWorkerSpy).not.toHaveBeenCalled();
  });

  it('should call updateWorker with an empty array [] if user unticked all choices', async () => {
    const previousAnswer = [
      { id: 1, label: 'Adult nursing' },
      { id: 4, label: "Children's nursing" },
    ];
    const { getByRole, getByText, updateWorkerSpy } = await setup({ previousAnswer });

    previousAnswer.forEach(({ label }) => {
      const checkbox = getByRole('checkbox', { name: label }) as HTMLInputElement;
      userEvent.click(checkbox);
      expect(checkbox.checked).toBeFalse();
    });

    const button = getByText('Save and continue');
    userEvent.click(button);

    expect(updateWorkerSpy).toHaveBeenCalledWith('mock-establishment-uid', 'mock-worker-uid', {
      nurseFieldOfPractice: [],
    });
  });

  it(`should call submit data and navigate with the correct url when 'Save and continue' is clicked`, async () => {
    const { getByText, routerSpy } = await setup();

    const button = getByText('Save and continue');
    fireEvent.click(button);

    expect(routerSpy).toHaveBeenCalledWith([
      '/workplace',
      'mock-establishment-uid',
      'staff-record',
      'mock-worker-uid',
      'recruited-from',
    ]);
  });

  it('should show a success alert when saving and returning from the blue banner', async () => {
    const { getByRole, getByText, fixture, alertService } = await setup({
      fromBlueBanner: true,
      insideFlow: false,
    });

    fireEvent.click(getByRole('checkbox', { name: 'Adult nursing' }));

    fireEvent.click(getByText('Save and return'));

    fixture.detectChanges();
    await fixture.whenStable();

    expect(alertService.addAlert).toHaveBeenCalledWith({
      type: 'success',
      message: 'NMC fields of practice confirmed ',
    });
  });

  it(`should navigate to 'recruited-from' page when skipping the question in the flow`, async () => {
    const { component, routerSpy, getByText } = await setup();

    const workerId = component.worker.uid;
    const workplaceId = component.workplace.uid;

    const skipButton = getByText('Skip this question');
    fireEvent.click(skipButton);

    expect(routerSpy).toHaveBeenCalledWith(['/workplace', workplaceId, 'staff-record', workerId, 'recruited-from']);
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

  it('should navigate to summary page when pressing Save button outside of the flow', async () => {
    const { component, routerSpy, getByText } = await setup({ insideFlow: false });

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
    const { component, routerSpy, getByText } = await setup({ insideFlow: false });

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

  it('should navigate to funding staff-summary-page page when pressing cancel inside funding version of page', async () => {
    const { component, router, fixture, routerSpy, getByText } = await setup({ insideFlow: false });
    spyOnProperty(router, 'url').and.returnValue('/funding/staff-record');
    component.returnUrl = undefined;
    component.ngOnInit();
    fixture.detectChanges();
    const workerId = component.worker.uid;

    const link = getByText('Cancel');
    fireEvent.click(link);

    expect(routerSpy).toHaveBeenCalledWith(['/funding', 'staff-record', workerId]);
  });

  describe('progress bar', () => {
    it('should render the progress bar when in the flow', async () => {
      const { getByTestId } = await setup();

      expect(getByTestId('progress-bar')).toBeTruthy();
    });

    it('should not render the progress bar when outside the flow', async () => {
      const { queryByTestId } = await setup({ insideFlow: false });

      expect(queryByTestId('progress-bar')).toBeFalsy();
    });
  });
});
