import { fireEvent, render, within } from '@testing-library/angular';
import { CareWorkforcePathwayComponent } from './care-workforce-pathway.component';
import { UntypedFormBuilder } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { WorkersModule } from '../workers.module';
import { WindowRef } from '@core/services/window.ref';
import { AlertService } from '@core/services/alert.service';
import { WorkerService } from '@core/services/worker.service';
import {
  MockWorkerServiceWithOverrides,
  MockWorkerServiceWithUpdateWorker,
  MockWorkerServiceWithoutReturnUrl,
} from '@core/test-utils/MockWorkerService';
import { DetailsComponent } from '@shared/components/details/details.component';
import { getTestBed } from '@angular/core/testing';
import { CareWorkforcePathwayService } from '@core/services/care-workforce-pathway.service';
import { MockCareWorkforcePathwayService } from '@core/test-utils/MockCareWorkforcePathwayService';
import { HttpClient } from '@angular/common/http';

fdescribe('CareWorkforcePathwayComponent', () => {
  const categorySelected = 'New to Care';
  async function setup(overrides: any = {}) {
    const setupTools = await render(CareWorkforcePathwayComponent, {
      imports: [SharedModule, RouterModule, HttpClientTestingModule, WorkersModule],
      declarations: [DetailsComponent],
      providers: [
        UntypedFormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            parent: {
              snapshot: {
                url: [{ path: overrides.insideFlow ? 'staff-uid' : 'staff-record-summary' }],
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
          useFactory: MockWorkerServiceWithOverrides.factory(overrides),
          deps: [HttpClient],
          // useClass: overrides.returnUrl ? MockWorkerServiceWithUpdateWorker : MockWorkerServiceWithoutReturnUrl,
        },
        {
          provide: CareWorkforcePathwayService,
          useClass: MockCareWorkforcePathwayService,
        },
        AlertService,
        WindowRef,
      ],
    });
    const injector = getTestBed();

    const router = injector.inject(Router) as Router;

    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    const alertService = injector.inject(AlertService) as AlertService;
    const alertSpy = spyOn(alertService, 'addAlert').and.stub();

    return {
      ...setupTools,
      component: setupTools.fixture.componentInstance,
      alertSpy,
      routerSpy,
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
    expect(getByText('Where are they currently on the care workforce pathway?')).toBeTruthy;
  });

  describe('reveal', () => {
    it('should show', async () => {
      const { getByText, getByTestId } = await setup();

      const reveal = getByTestId('reveal-whatsCareWorkforcePathway');

      expect(reveal).toBeTruthy();
      expect(within(reveal).getByText('What`s the care workforce pathway?')).toBeTruthy();
    });

    it('should show the link for more information', async () => {
      const { getByText, getByTestId } = await setup();

      const reveal = getByTestId('reveal-whatsCareWorkforcePathway');

      expect(reveal).toBeTruthy();

      const link = getByText('Read more about the care workforce pathway');

      expect(link.getAttribute('href')).toBe(
        'https://www.gov.uk/government/publications/care-workforce-pathway-for-adult-social-care/care-workforce-pathway-for-adult-social-care-overview',
      );
    });
  });

  it('should show the sub text for radios', async () => {
    const { getByText } = await setup();

    expect(getByText('Care workforce pathway role categories')).toBeTruthy();
  });

  describe('progress bar', () => {
    it('should render the workplace progress bar', async () => {
      const { getByTestId } = await setup({ insideFlow: true });

      expect(getByTestId('progress-bar')).toBeTruthy();
    });

    it('should not render the progress bars when accessed from outside the flow', async () => {
      const { queryByTestId } = await setup({ insideFlow: false });

      expect(queryByTestId('progress-bar')).toBeFalsy();
    });
  });

  describe('submit buttons', () => {
    it(`should show 'Save and continue' cta button, skip this question and 'View this staff record' link, if a return url is not provided`, async () => {
      const { getByText } = await setup({ insideFlow: true });

      expect(getByText('Save and continue')).toBeTruthy();
      expect(getByText('Skip this question')).toBeTruthy();
      expect(getByText('View this staff record')).toBeTruthy();
    });

    it(`should show 'Save and return' cta button and 'Cancel' link if a return url is provided`, async () => {
      const { getByText } = await setup({ insideFlow: false });

      expect(getByText('Save and return')).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
    });
  });

  it('should prefill a previously saved answer', async () => {
    const overrides = { worker: { careWorkforcePathwayRoleCategory: 1 } };
    const { component, getByLabelText } = await setup(overrides);

    component.ngOnInit();

    const form = component.form;
    const radioButton = getByLabelText(categorySelected) as HTMLInputElement;

    expect(form.value.careWorkforcePathway).toEqual(1);
    expect(radioButton.checked).toBeTruthy();
    expect(form.valid).toBeTruthy();
  });

  describe('routing', () => {
    ['Save and continue', 'Skip this question', 'View this staff record'].forEach((link) => {
      it(`should navigate to staff-summary page when '${link}' is clicked`, async () => {
        const { component, getByText, routerSpy } = await setup({ insideFlow: true });

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
        const { component, getByText, routerSpy } = await setup({ insideFlow: false });

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
      const { getByText, getByLabelText, alertSpy } = await setup({ insideFlow: true });

      const select = getByLabelText(categorySelected, { exact: false });
      fireEvent.change(select, { target: { value: '1' } });

      const saveButton = getByText('Save and continue');
      fireEvent.click(saveButton);

      expect(alertSpy).toHaveBeenCalledWith({
        type: 'success',
        message: 'Staff record saved',
      });
    });

    ['Skip this question', 'View this staff record'].forEach((link) => {
      it(`should add Staff record added alert when '${link}' is clicked`, async () => {
        const { getByText, alertSpy } = await setup({ insideFlow: true });

        fireEvent.click(getByText(link));

        expect(alertSpy).toHaveBeenCalledWith({
          type: 'success',
          message: 'Staff record saved',
        });
      });
    });

    it('should not add Staff record added alert when user submits but not in flow', async () => {
      const { getByText, getByLabelText, alertSpy } = await setup({ insideFlow: false });

      const select = getByLabelText(categorySelected, { exact: false });
      fireEvent.change(select, { target: { value: '1' } });

      const saveButton = getByText('Save and return');
      fireEvent.click(saveButton);

      expect(alertSpy).not.toHaveBeenCalled();
    });
  });
});
