import { HttpClient, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AlertService } from '@core/services/alert.service';
import {
  CareWorkforcePathwayService,
  CWPGetWorkersWhoMeetNewToCareCriteriaResponse,
} from '@core/services/care-workforce-pathway.service';
import { WindowRef } from '@core/services/window.ref';
import { WorkerService } from '@core/services/worker.service';
import {
  careWorkforcePathwayRoleCategories,
  MockCareWorkforcePathwayService,
} from '@core/test-utils/MockCareWorkforcePathwayService';
import { MockWorkerServiceWithOverrides, workerBuilder } from '@core/test-utils/MockWorkerService';
import { DetailsComponent } from '@shared/components/details/details.component';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { WorkersModule } from '../workers.module';
import { CareWorkforcePathwayRoleComponent } from './care-workforce-pathway.component';
import { of } from 'rxjs';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';

describe('CareWorkforcePathwayRoleComponent', () => {
  const categorySelected = careWorkforcePathwayRoleCategories[0].title;

  async function setup(overrides: any = {}) {
    const insideFlow = overrides.insideFlow ?? false;
    const setupTools = await render(CareWorkforcePathwayRoleComponent, {
      imports: [SharedModule, RouterModule, WorkersModule],
      declarations: [DetailsComponent],
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
          useFactory: MockWorkerServiceWithOverrides.factory(overrides.workerService ?? {}),
          deps: [HttpClient],
        },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: CareWorkforcePathwayService,
          useClass: MockCareWorkforcePathwayService,
        },
        AlertService,
        WindowRef,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    const injector = getTestBed();

    const router = injector.inject(Router) as Router;

    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    const alertService = injector.inject(AlertService) as AlertService;
    const alertSpy = spyOn(alertService, 'addAlert').and.stub();

    const workerService = injector.inject(WorkerService) as WorkerService;

    const careWorkforcePathwayService = injector.inject(CareWorkforcePathwayService);

    return {
      ...setupTools,
      component: setupTools.fixture.componentInstance,
      alertSpy,
      routerSpy,
      workerService,
      careWorkforcePathwayService,
    };
  }

  it('should render', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the heading and caption', async () => {
    const { getByText, getByTestId } = await setup();

    const sectionHeading = getByTestId('section-heading');

    expect(sectionHeading).toBeTruthy();
    expect(within(sectionHeading).getByText('Training and qualifications')).toBeTruthy();
    expect(getByText('Where are they currently on the Care Workforce Pathway?')).toBeTruthy();
  });

  describe('reveal', () => {
    it('should show', async () => {
      const { getByTestId } = await setup();

      const reveal = getByTestId('reveal-whatsCareWorkforcePathway');

      expect(reveal).toBeTruthy();
      expect(within(reveal).getByText('Why assign Care Workforce Pathway role categories?')).toBeTruthy();
    });

    it('should show the link for more information', async () => {
      const { getByText, getByTestId } = await setup();

      const reveal = getByTestId('reveal-whatsCareWorkforcePathway');
      expect(reveal).toBeTruthy();

      const link = getByText('Read more about the Care Workforce Pathway');

      expect(link.getAttribute('href')).toBe(
        'https://www.gov.uk/government/publications/care-workforce-pathway-for-adult-social-care/care-workforce-pathway-for-adult-social-care-overview',
      );
      expect(link.getAttribute('target')).toBe('_blank');
    });
  });

  it('should show the instruction for selecting a role category', async () => {
    const { getByText } = await setup();

    expect(getByText('Only select one role category.')).toBeTruthy();
  });

  it('should display the role category group headings', async () => {
    const { getByRole } = await setup();

    expect(getByRole('heading', { name: 'Care providing' })).toBeTruthy();
    expect(getByRole('heading', { name: 'Senior leadership' })).toBeTruthy();
    expect(getByRole('heading', { name: 'Non-care providing' })).toBeTruthy();
  });

  describe('progress bar', () => {
    it('should render the workplace progress bar', async () => {
      const overrides = { insideFlow: true };
      const { getByTestId } = await setup(overrides);

      expect(getByTestId('progress-bar')).toBeTruthy();
    });

    it('should not render the progress bars when accessed from outside the flow', async () => {
      const { queryByTestId } = await setup();

      expect(queryByTestId('progress-bar')).toBeFalsy();
    });
  });

  describe('submit buttons', () => {
    it(`should show 'Save and continue' cta button, skip this question and 'View this staff record' link, if a return url is not provided`, async () => {
      const overrides = { insideFlow: true };
      const { getByText } = await setup(overrides);

      expect(getByText('Save and continue')).toBeTruthy();
      expect(getByText('Skip this question')).toBeTruthy();
      expect(getByText('View this staff record')).toBeTruthy();
    });

    it(`should show 'Save and return' cta button and 'Cancel' link if a return url is provided`, async () => {
      const overrides = { insideFlow: false };
      const { getByText } = await setup(overrides);

      expect(getByText('Save and return')).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
    });
  });

  it('should prefill a previously saved answer', async () => {
    const overrides = { workerService: { worker: { careWorkforcePathwayRoleCategory: { roleCategoryId: 1 } } } };

    const { component, getByLabelText } = await setup(overrides);

    component.ngOnInit();

    const form = component.form;

    const radioButton = getByLabelText(categorySelected) as HTMLInputElement;

    expect(form.value.careWorkforcePathwayRoleCategory).toEqual(1);
    expect(radioButton.checked).toBeTruthy();
    expect(form.valid).toBeTruthy();
  });

  describe('routing', () => {
    ['Save and continue', 'Skip this question', 'View this staff record'].forEach((link) => {
      it(`should navigate to staff-summary page when '${link}' is clicked`, async () => {
        const overrides = {
          insideFlow: true,
        };

        const { component, getByText, routerSpy } = await setup(overrides);

        const workerId = component.worker.uid;
        const workplaceId = component.workplace.uid;

        fireEvent.click(getByText(link));

        expect(routerSpy).toHaveBeenCalledWith([
          '/workplace',
          workplaceId,
          'staff-record',
          workerId,
          'staff-record-summary',
        ]);
      });
    });

    ['Save and return', 'Cancel'].forEach((link) => {
      it(`should navigate to staff-summary page when '${link}' is clicked`, async () => {
        const overrides = {
          insideFlow: false,
        };
        const { component, getByText, routerSpy } = await setup(overrides);
        const workerId = component.worker.uid;
        const workplaceId = component.workplace.uid;

        fireEvent.click(getByText(link));

        expect(routerSpy).toHaveBeenCalledWith([
          '/workplace',
          workplaceId,
          'staff-record',
          workerId,
          'staff-record-summary',
        ]);
      });
    });
  });

  describe('Completing Add details to staff record flow', () => {
    it('should add Staff record added alert when submitting from flow', async () => {
      const overrides = { insideFlow: true };
      const { fixture, getByText, getByLabelText, alertSpy } = await setup(overrides);

      const select = getByLabelText(categorySelected, { exact: false });
      fireEvent.change(select, { target: { value: '1' } });

      const saveButton = getByText('Save and continue');
      fireEvent.click(saveButton);

      await fixture.whenStable();

      expect(alertSpy).toHaveBeenCalledWith({
        type: 'success',
        message: 'Staff record details saved',
      });
    });

    ['Skip this question', 'View this staff record'].forEach((link) => {
      it(`should add Staff record added alert when '${link}' is clicked, if user has answered other question before`, async () => {
        const overrides = { insideFlow: true };
        const { getByText, alertSpy, workerService } = await setup(overrides);

        spyOn(workerService, 'hasAnsweredNonMandatoryQuestion').and.returnValue(true);

        fireEvent.click(getByText(link));

        expect(alertSpy).toHaveBeenCalledWith({
          type: 'success',
          message: 'Staff record details saved',
        });
      });

      it(`should not add Staff record added alert when '${link}' is clicked, if user have not answered other question before`, async () => {
        const overrides = { insideFlow: true };
        const { getByText, alertSpy, workerService } = await setup(overrides);

        spyOn(workerService, 'hasAnsweredNonMandatoryQuestion').and.returnValue(false);

        fireEvent.click(getByText(link));

        expect(alertSpy).not.toHaveBeenCalled();
      });
    });

    it('should not add Staff record added alert when user submits but not in flow', async () => {
      const overrides = { insideFlow: false };
      const { getByText, getByLabelText, alertSpy } = await setup(overrides);

      const select = getByLabelText(categorySelected, { exact: false });
      fireEvent.change(select, { target: { value: '1' } });

      const saveButton = getByText('Save and return');
      fireEvent.click(saveButton);

      expect(alertSpy).not.toHaveBeenCalled();
    });
  });

  describe('When visited from Care Workforce Pathway worker summary page', () => {
    const mockWorker = workerBuilder();
    const overrideReturnTo = {
      workerService: {
        returnTo: {
          url: ['/workplace', 'mocked-uid', 'staff-record', 'care-workforce-pathway-workers-summary'],
        },
        worker: mockWorker,
      },
    };

    it('should show the existing heading and Staff records caption', async () => {
      const { getByRole, getByTestId } = await setup(overrideReturnTo);

      expect(getByRole('heading', { level: 1 }).textContent).toContain(
        'Where are they currently on the Care Workforce Pathway?',
      );
      expect(getByTestId('section-heading').textContent).toContain('Staff records');
    });

    it("should show the worker's nameOrId", async () => {
      const { getByText } = await setup(overrideReturnTo);

      expect(getByText('Name or ID number')).toBeTruthy();
      expect(getByText(mockWorker.nameOrId as string)).toBeTruthy();
    });

    it('should set submit button text as "Save"', async () => {
      const { getByText } = await setup(overrideReturnTo);

      expect(getByText('Save')).toBeTruthy();
    });

    it('should return to the CWP summary page when submitted', async () => {
      const { fixture, getByText, routerSpy } = await setup(overrideReturnTo);

      userEvent.click(getByText('New to care'));
      userEvent.click(getByText('Save'));

      await fixture.whenStable();

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        'mocked-uid',
        'staff-record',
        'care-workforce-pathway-workers-summary',
      ]);
    });

    it('should return to the CWP summary page when clicked the Cancel button', async () => {
      const { fixture, getByText, routerSpy, alertSpy } = await setup(overrideReturnTo);

      userEvent.click(getByText('Cancel'));

      await fixture.whenStable();

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        'mocked-uid',
        'staff-record',
        'care-workforce-pathway-workers-summary',
      ]);
      expect(alertSpy).not.toHaveBeenCalled();
    });
  });

  describe('When visited from Care Workforce Pathway Review New to Care page', () => {
    const mockWorker = workerBuilder();
    const overrideReturnTo = {
      workerService: {
        returnTo: {
          url: ['/workplace', 'mocked-uid', 'staff-record', 'review-new-to-care'],
        },
        worker: mockWorker,
      },
    };

    const mockWorkersFromBackend = [
      { uid: 'mockuid', nameOrId: 'mock worker' },
    ] as CWPGetWorkersWhoMeetNewToCareCriteriaResponse['workers'];

    it('should show the existing heading and Staff records caption', async () => {
      const { getByRole, getByTestId } = await setup(overrideReturnTo);

      expect(getByRole('heading', { level: 1 }).textContent).toContain(
        'Where are they currently on the Care Workforce Pathway?',
      );
      expect(getByTestId('section-heading').textContent).toContain('Staff records');
    });

    it("should show the worker's nameOrId", async () => {
      const { getByText } = await setup(overrideReturnTo);

      expect(getByText('Name or ID number')).toBeTruthy();
      expect(getByText(mockWorker.nameOrId as string)).toBeTruthy();
    });

    it('should set submit button text as "Save"', async () => {
      const { getByText } = await setup(overrideReturnTo);

      expect(getByText('Save')).toBeTruthy();
    });

    it('should return to the Review New to Care page when submitted', async () => {
      const { component, fixture, getByText, routerSpy, careWorkforcePathwayService } = await setup(overrideReturnTo);

      spyOn(careWorkforcePathwayService, 'getWorkersWhoMeetNewToCareCriteria').and.returnValue(
        of(mockWorkersFromBackend),
      );
      const setNewToCareWorkerAsReviewedSpy = spyOn(careWorkforcePathwayService, 'setNewToCareWorkerAsReviewed');

      const workerUid = component.worker.uid!;

      userEvent.click(getByText('New to care'));
      userEvent.click(getByText('Save'));

      await fixture.whenStable();

      expect(routerSpy).toHaveBeenCalledWith(['/workplace', 'mocked-uid', 'staff-record', 'review-new-to-care']);
      expect(setNewToCareWorkerAsReviewedSpy).toHaveBeenCalledWith(workerUid);
    });

    it('should return to the Review New to Care page when clicked the Cancel button', async () => {
      const { fixture, getByText, routerSpy, alertSpy, careWorkforcePathwayService } = await setup(overrideReturnTo);
      const setNewToCareWorkerAsReviewedSpy = spyOn(careWorkforcePathwayService, 'setNewToCareWorkerAsReviewed');

      userEvent.click(getByText('Cancel'));

      await fixture.whenStable();

      expect(routerSpy).toHaveBeenCalledWith(['/workplace', 'mocked-uid', 'staff-record', 'review-new-to-care']);
      expect(alertSpy).not.toHaveBeenCalled();

      expect(setNewToCareWorkerAsReviewedSpy).not.toHaveBeenCalled();
    });
  });
});
