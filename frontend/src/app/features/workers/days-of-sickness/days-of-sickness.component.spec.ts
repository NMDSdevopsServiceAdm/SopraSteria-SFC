import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { UntypedFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { WorkerService } from '@core/services/worker.service';
import { MockWorkerServiceWithoutReturnUrl } from '@core/test-utils/MockWorkerService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { DaysOfSicknessComponent } from './days-of-sickness.component';

describe('DaysOfSicknessComponent', () => {
  async function setup(insideFlow = true) {
    const { fixture, getByText, getAllByText, getByLabelText, getByTestId, queryByTestId } = await render(
      DaysOfSicknessComponent,
      {
        imports: [
          SharedModule,
          RouterModule,
          HttpClientTestingModule,
          ReactiveFormsModule,
          RouterTestingModule.withRoutes([]),
        ],
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
            useClass: MockWorkerServiceWithoutReturnUrl,
          },
        ],
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

  it('should render the DaysOfSicknessComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render the reveal', async () => {
    const { getByText } = await setup();

    const reveal = getByText('Why we ask for this information');
    const revealText = getByText(
      `This data is used to help highlight staff wellbeing issues. It is also used to build an understanding of the financial cost to the sector due to days lost because of sickness or injury.`,
    );

    expect(reveal).toBeTruthy();
    expect(revealText).toBeTruthy();
  });

  describe('submit buttons', () => {
    it(`should show 'Save and continue' cta button and 'View this staff record' link, if a return url is not provided`, async () => {
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

    it(`should call submit data and navigate with the  'contract-with-zero-hours' url when 'Save and continue' is clicked and in the flow`, async () => {
      const { component, getByText, routerSpy } = await setup();

      const button = getByText('Save and continue');
      fireEvent.click(button);

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        'mocked-uid',
        'staff-record',
        component.worker.uid,
        'contract-with-zero-hours',
      ]);
    });

    it(`should call submit data and navigate with the 'contract-with-zero-hours' url when 'Skip this question' is clicked and in the flow`, async () => {
      const { component, getByText, routerSpy } = await setup();

      const button = getByText('Skip this question');
      fireEvent.click(button);

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        'mocked-uid',
        'staff-record',
        component.worker.uid,
        'contract-with-zero-hours',
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
      const { component, routerSpy, getByText, fixture, router } = await setup(false);
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
      const { component, routerSpy, getByText, fixture, router } = await setup(false);
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
});
