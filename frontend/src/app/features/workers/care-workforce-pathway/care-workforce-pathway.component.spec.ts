import { fireEvent, render, within } from '@testing-library/angular';
import { CareWorkforcePathwayRoleComponent } from './care-workforce-pathway.component';
import { UntypedFormBuilder } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { WorkersModule } from '../workers.module';
import { WindowRef } from '@core/services/window.ref';
import { AlertService } from '@core/services/alert.service';
import { WorkerService } from '@core/services/worker.service';
import { MockWorkerServiceWithOverrides } from '@core/test-utils/MockWorkerService';
import { DetailsComponent } from '@shared/components/details/details.component';
import { getTestBed } from '@angular/core/testing';
import { CareWorkforcePathwayService } from '@core/services/care-workforce-pathway.service';
import {
  MockCareWorkforcePathwayService,
  careWorkforcePathwayRoleCategories,
} from '@core/test-utils/MockCareWorkforcePathwayService';
import { HttpClient } from '@angular/common/http';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';

describe('CareWorkforcePathwayRoleComponent', () => {
  const categorySelected = careWorkforcePathwayRoleCategories[0].title;
  async function setup(overrides: any = {}) {
    const setupTools = await render(CareWorkforcePathwayRoleComponent, {
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
        },
        {
          provide: CareWorkforcePathwayService,
          useClass: MockCareWorkforcePathwayService,
        },
        { provide: FeatureFlagsService, useClass: MockFeatureFlagsService },
        AlertService,
        WindowRef,
      ],
      componentProperties: {
        cwpQuestionsFlag: overrides.cwpQuestionsFlag,
      },
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
    const overrides = { cwpQuestionsFlag: false };
    const { getByText, getByTestId, component } = await setup(overrides);
    component.cwpQuestionsFlag = false;
    const sectionHeading = getByTestId('section-heading');

    expect(sectionHeading).toBeTruthy();
    expect(within(sectionHeading).getByText('Training and qualifications')).toBeTruthy();
    expect(getByText('Where are they currently on the care workforce pathway?')).toBeTruthy;
  });

  describe('reveal', () => {
    it('should show', async () => {
      const overrides = { cwpQuestionsFlag: false };
      const { getByTestId, component } = await setup(overrides);
      component.cwpQuestionsFlag = false;
      const reveal = getByTestId('reveal-whatsCareWorkforcePathway');

      expect(reveal).toBeTruthy();
      expect(within(reveal).getByText("What's the care workforce pathway?")).toBeTruthy();
    });

    it('should show the link for more information', async () => {
      const overrides = { cwpQuestionsFlag: false };
      const { getByText, getByTestId, component } = await setup(overrides);
      component.cwpQuestionsFlag = false;
      const reveal = getByTestId('reveal-whatsCareWorkforcePathway');

      expect(reveal).toBeTruthy();

      const link = getByText('Read more about the care workforce pathway');

      expect(link.getAttribute('href')).toBe(
        'https://www.gov.uk/government/publications/care-workforce-pathway-for-adult-social-care/care-workforce-pathway-for-adult-social-care-overview',
      );
    });
  });

  it('should show the sub text for radios', async () => {
    const overrides = { cwpQuestionsFlag: false };
    const { getByText, component } = await setup(overrides);
    component.cwpQuestionsFlag = false;
    expect(getByText('Care workforce pathway role categories')).toBeTruthy();
  });

  describe('progress bar', () => {
    it('should render the workplace progress bar', async () => {
      const overrides = { cwpQuestionsFlag: false, insideFlow: true };
      const { getByTestId, component } = await setup(overrides);
      component.cwpQuestionsFlag = false;
      expect(getByTestId('progress-bar')).toBeTruthy();
    });

    it('should not render the progress bars when accessed from outside the flow', async () => {
      const overrides = { cwpQuestionsFlag: false, insideFlow: false };
      const { queryByTestId, component } = await setup(overrides);
      component.cwpQuestionsFlag = false;
      expect(queryByTestId('progress-bar')).toBeFalsy();
    });
  });

  describe('submit buttons', () => {
    it(`should show 'Save and continue' cta button, skip this question and 'View this staff record' link, if a return url is not provided`, async () => {
      const overrides = { cwpQuestionsFlag: false, insideFlow: true };
      const { getByText, component } = await setup(overrides);
      component.cwpQuestionsFlag = false;
      expect(getByText('Save and continue')).toBeTruthy();
      expect(getByText('Skip this question')).toBeTruthy();
      expect(getByText('View this staff record')).toBeTruthy();
    });

    it(`should show 'Save and return' cta button and 'Cancel' link if a return url is provided`, async () => {
      const overrides = { cwpQuestionsFlag: false, insideFlow: false };
      const { getByText, component } = await setup(overrides);
      component.cwpQuestionsFlag = false;

      expect(getByText('Save and return')).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
    });
  });

  it('should prefill a previously saved answer', async () => {
    const overrides = { worker: { careWorkforcePathwayRoleCategory: { roleCategoryId: 1 } }, cwpQuestionsFlag: false };
    const { component, getByLabelText } = await setup(overrides);

    component.cwpQuestionsFlag = false;

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
          cwpQuestionsFlag: false,
          insideFlow: true,
        };

        const { component, getByText, routerSpy } = await setup(overrides);
        component.cwpQuestionsFlag = false;

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
          cwpQuestionsFlag: false,
          insideFlow: false,
        };
        const { component, getByText, routerSpy } = await setup(overrides);
        component.cwpQuestionsFlag = false;
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
      const overrides = { insideFlow: true, cwpQuestionsFlag: false };
      const { getByText, getByLabelText, alertSpy, component } = await setup(overrides);

      component.cwpQuestionsFlag = false;
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
        const overrides = { insideFlow: true, cwpQuestionsFlag: false };
        const { getByText, alertSpy, component } = await setup(overrides);
        component.cwpQuestionsFlag = false;
        fireEvent.click(getByText(link));

        expect(alertSpy).toHaveBeenCalledWith({
          type: 'success',
          message: 'Staff record saved',
        });
      });
    });

    it('should not add Staff record added alert when user submits but not in flow', async () => {
      const overrides = { insideFlow: false, cwpQuestionsFlag: false };
      const { getByText, getByLabelText, alertSpy, component } = await setup(overrides);
      component.cwpQuestionsFlag = false;

      const select = getByLabelText(categorySelected, { exact: false });
      fireEvent.change(select, { target: { value: '1' } });

      const saveButton = getByText('Save and return');
      fireEvent.click(saveButton);

      expect(alertSpy).not.toHaveBeenCalled();
    });
  });
});
