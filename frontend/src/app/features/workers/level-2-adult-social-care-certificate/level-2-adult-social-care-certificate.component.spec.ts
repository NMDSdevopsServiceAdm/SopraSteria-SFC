import { getTestBed } from '@angular/core/testing';
import { fireEvent, render } from '@testing-library/angular';
import { SharedModule } from '@shared/shared.module';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { WorkerService } from '@core/services/worker.service';
import { MockWorkerServiceWithUpdateWorker } from '@core/test-utils/MockWorkerService';

import { Level2AdultSocialCareCertificateComponent } from './level-2-adult-social-care-certificate.component';

describe('Level2AdultSocialCareCertificateComponent', () => {
  async function setup(insideFlow = true) {
    const { fixture, getByText, getAllByText, getByLabelText, getByTestId, queryByTestId, queryByText } = await render(
      Level2AdultSocialCareCertificateComponent,
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
            useClass: MockWorkerServiceWithUpdateWorker,
          },
        ],
        declarations: [],
      },
    );
    const injector = getTestBed();

    const component = fixture.componentInstance;

    const router = injector.inject(Router) as Router;

    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return {
      component,
      fixture,
      getByText,
      getAllByText,
      getByLabelText,
      getByTestId,
      queryByTestId,
      queryByText,
      router,
      routerSpy,
    };
  }

  it('should render the Level2AdultSocialCareCertificateComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the caption', async () => {
    const { getByTestId } = await setup();

    const sectionHeading = getByTestId('section-heading');
    const captionText = 'Training and qualifications';

    expect(sectionHeading.textContent).toEqual(captionText);
  });

  it('should show the heading', async () => {
    const { getByText } = await setup();

    const headingText = getByText('Have they completed or started their Level 2 Adult Social Care Certificate?');

    expect(headingText).toBeTruthy();
  });

  it('should show the reveal', async () => {
    const { getByTestId } = await setup();

    const reveal = getByTestId('reveal-whatIsLevel2CC');

    expect(reveal).toBeTruthy();
  });

  it('should show the radio buttons', async () => {
    const { getByLabelText } = await setup();

    expect(getByLabelText('Yes, completed')).toBeTruthy();
    expect(getByLabelText('Yes, started')).toBeTruthy();
    expect(getByLabelText('No')).toBeTruthy();
  });

  describe('submit buttons', () => {
    it(`should show 'Save and continue' cta button, skip this question and 'View this staff record' link, if a return url is not provided`, async () => {
      const { getByText } = await setup();

      expect(getByText('Save and continue')).toBeTruthy();
      expect(getByText('Skip this question')).toBeTruthy();
      expect(getByText('View this staff record')).toBeTruthy();
    });

    it(`should show 'Save and return' cta button and 'Cancel' link if a return url is provided`, async () => {
      const { getByText } = await setup(false);

      expect(getByText('Save and return')).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
    });
  });

  describe('progress bar', () => {
    it('should render the workplace progress bar', async () => {
      const { getByTestId } = await setup();

      expect(getByTestId('progress-bar')).toBeTruthy();
    });

    it('should not render the progress bars when accessed from outside the flow', async () => {
      const { queryByTestId } = await setup(false);

      expect(queryByTestId('progress-bar')).toBeFalsy();
    });
  });

  describe('year achieved input', () => {
    describe('should not show', () => {
      it('when the page is loaded', async () => {
        const { fixture } = await setup();

        const yearAchievedInput = fixture.nativeElement.querySelector('div[id="certification-achieved"]');

        expect(yearAchievedInput.getAttribute('class')).toContain('hidden');
      });

      it('when "Yes, started" is clicked', async () => {
        const { fixture, getByLabelText } = await setup();

        const yesStartedRadioButton = getByLabelText('Yes, started');

        fireEvent.click(yesStartedRadioButton);
        fixture.detectChanges();

        const yearAchievedInput = fixture.nativeElement.querySelector('div[id="certification-achieved"]');

        expect(yearAchievedInput.getAttribute('class')).toContain('hidden');
      });

      it('when "no" is clicked', async () => {
        const { fixture, getByLabelText } = await setup();

        const noRadioButton = getByLabelText('No');

        fireEvent.click(noRadioButton);
        fixture.detectChanges();

        const yearAchievedInput = fixture.nativeElement.querySelector('div[id="certification-achieved"]');

        expect(yearAchievedInput.getAttribute('class')).toContain('hidden');
      });
    });

    it('should show when "yes, completed" is clicked', async () => {
      const { fixture, getByLabelText } = await setup();

      const yesCompletedRadioButton = getByLabelText('Yes, completed');

      fireEvent.click(yesCompletedRadioButton);
      fixture.detectChanges();

      const yearAchievedInput = fixture.nativeElement.querySelector('div[id="certification-achieved"]');

      expect(yearAchievedInput.getAttribute('class')).not.toContain('hidden');
    });
  });

  describe('navigation', () => {
    // it('should navigate to apprenticeship-training page when submitting from flow', async () => {
    //   const { component, routerSpy, getByText } = await setup();

    //   const workerId = component.worker.uid;
    //   const workplaceId = component.workplace.uid;

    //   const saveButton = getByText('Save and continue');
    //   fireEvent.click(saveButton);

    //   expect(getByText('Save and continue')).toBeTruthy();

    //   expect(routerSpy).toHaveBeenCalledWith([
    //     '/workplace',
    //     workplaceId,
    //     'staff-record',
    //     workerId,
    //     'apprenticeship-training',
    //   ]);
    // });

    // it('should navigate to apprenticeship-training page when skipping the question in the flow', async () => {
    //   const { component, routerSpy, getByText } = await setup();

    //   const workerId = component.worker.uid;
    //   const workplaceId = component.workplace.uid;

    //   const link = getByText('Skip this question');
    //   fireEvent.click(link);

    //   expect(routerSpy).toHaveBeenCalledWith([
    //     '/workplace',
    //     workplaceId,
    //     'staff-record',
    //     workerId,
    //     'apprenticeship-training',
    //   ]);
    // });

    // it('should navigate to staff-summary-page page when pressing view this staff record', async () => {
    //   const { component, routerSpy, getByText } = await setup();

    //   const workerId = component.worker.uid;
    //   const workplaceId = component.workplace.uid;

    //   const link = getByText('View this staff record');
    //   fireEvent.click(link);

    //   expect(routerSpy).toHaveBeenCalledWith([
    //     '/workplace',
    //     workplaceId,
    //     'staff-record',
    //     workerId,
    //     'staff-record-summary',
    //   ]);
    // });

    // it('should navigate to staff-summary-page page when pressing save and return', async () => {
    //   const { component, routerSpy, getByText } = await setup(false);

    //   const workerId = component.worker.uid;
    //   const workplaceId = component.workplace.uid;

    //   const saveButton = getByText('Save and return');
    //   fireEvent.click(saveButton);

    //   expect(routerSpy).toHaveBeenCalledWith([
    //     '/workplace',
    //     workplaceId,
    //     'staff-record',
    //     workerId,
    //     'staff-record-summary',
    //   ]);
    // });

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

    // it('should navigate to wdf staff-summary-page page when pressing save and return in wdf version of page', async () => {
    //   const { component, router, fixture, routerSpy, getByText } = await setup(false);
    //   spyOnProperty(router, 'url').and.returnValue('/wdf/staff-record');
    //   component.returnUrl = undefined;
    //   component.ngOnInit();
    //   fixture.detectChanges();
    //   const workerId = component.worker.uid;

    //   const saveButton = getByText('Save and return');
    //   fireEvent.click(saveButton);

    //   expect(routerSpy).toHaveBeenCalledWith(['/wdf', 'staff-record', workerId]);
    // });

    // it('should navigate to wdf staff-summary-page page when pressing cancel in wdf version of page', async () => {
    //   const { component, router, fixture, routerSpy, getByText } = await setup(false);
    //   spyOnProperty(router, 'url').and.returnValue('/wdf/staff-record');
    //   component.returnUrl = undefined;
    //   component.ngOnInit();
    //   fixture.detectChanges();
    //   const workerId = component.worker.uid;

    //   const link = getByText('Cancel');
    //   fireEvent.click(link);

    //   expect(routerSpy).toHaveBeenCalledWith(['/wdf', 'staff-record', workerId]);
    // });
  });
});
