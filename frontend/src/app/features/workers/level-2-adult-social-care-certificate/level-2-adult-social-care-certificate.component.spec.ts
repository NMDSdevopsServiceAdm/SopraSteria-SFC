import { getTestBed } from '@angular/core/testing';
import { fireEvent, render } from '@testing-library/angular';
import { SharedModule } from '@shared/shared.module';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { WorkerService } from '@core/services/worker.service';
import { Worker } from '@core/model/worker.model';
import { MockWorkerServiceWithUpdateWorker, workerBuilder } from '@core/test-utils/MockWorkerService';

import { Level2AdultSocialCareCertificateComponent } from './level-2-adult-social-care-certificate.component';
import { HttpClient } from '@angular/common/http';
import dayjs from 'dayjs';

describe('Level2AdultSocialCareCertificateComponent', () => {
  const workerFieldsNoLevel2CareCertificate = { level2CareCertificate: { value: null, year: null } };
  async function setup(insideFlow = true, workerFields = workerFieldsNoLevel2CareCertificate) {
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
            useFactory: MockWorkerServiceWithUpdateWorker.factory({ ...workerBuilder(), ...workerFields } as Worker),
            deps: [HttpClient],
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
    it('should navigate to apprenticeship-training page when submitting from flow', async () => {
      const { component, fixture, routerSpy, getByText } = await setup();

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;
      const radioBtn = fixture.nativeElement.querySelector('input[id="level2CareCertificate-yesStarted"]');
      const saveButton = getByText('Save and continue');

      fireEvent.click(radioBtn);
      fireEvent.click(saveButton);
      fixture.detectChanges();

      expect(getByText('Save and continue')).toBeTruthy();

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        workplaceId,
        'staff-record',
        workerId,
        'apprenticeship-training',
      ]);
    });

    it('should navigate to apprenticeship-training page when skipping the question in the flow', async () => {
      const { component, routerSpy, getByText } = await setup();

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      const link = getByText('Skip this question');
      fireEvent.click(link);

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        workplaceId,
        'staff-record',
        workerId,
        'apprenticeship-training',
      ]);
    });

    it('should navigate to staff-summary-page page when pressing view this staff record', async () => {
      const { component, routerSpy, getByText } = await setup();

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      const link = getByText('View this staff record');
      fireEvent.click(link);

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        workplaceId,
        'staff-record',
        workerId,
        'staff-record-summary',
      ]);
    });

    it('should navigate to staff-summary-page page when pressing save and return', async () => {
      const { component, fixture, routerSpy, getByText } = await setup(false);

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;
      const radioBtn = fixture.nativeElement.querySelector('input[id="level2CareCertificate-yesStarted"]');
      const saveButton = getByText('Save and return');

      fireEvent.click(radioBtn);
      fireEvent.click(saveButton);
      fixture.detectChanges();

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
      const { component, router, fixture, routerSpy, getByText } = await setup(false);
      spyOnProperty(router, 'url').and.returnValue('/funding/staff-record');
      component.returnUrl = undefined;
      component.ngOnInit();
      fixture.detectChanges();
      const workerId = component.worker.uid;

      const radioBtn = fixture.nativeElement.querySelector('input[id="level2CareCertificate-yesStarted"]');
      const saveButton = getByText('Save and return');

      fireEvent.click(radioBtn);
      fireEvent.click(saveButton);
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith(['/funding', 'staff-record', workerId]);
    });

    it('should navigate to funding staff-summary-page page when pressing cancel in funding version of page', async () => {
      const { component, router, fixture, routerSpy, getByText } = await setup(false);
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

  describe('pre-fill', () => {
    it('should only show radio button checked', async () => {
      const workerFields = { level2CareCertificate: { value: 'No', year: null } };
      const { component, fixture } = await setup(false, workerFields);

      fixture.detectChanges();

      const form = component.form;
      const radioBtn = fixture.nativeElement.querySelector('input[id="level2CareCertificate-no"]');
      const yearAchievedInput = fixture.nativeElement.querySelector('div[id="certification-achieved"]');

      expect(radioBtn.checked).toBeTruthy();
      expect(yearAchievedInput.getAttribute('class')).toContain('hidden');
      expect(form.value).toEqual({ level2CareCertificate: 'No', level2CareCertificateYearAchieved: null });
    });

    it('should show radio and year input', async () => {
      const workerFields = { level2CareCertificate: { value: 'Yes, completed', year: 2023 } };
      const { component, fixture } = await setup(false, workerFields);

      fixture.detectChanges();

      const form = component.form;
      const radioBtn = fixture.nativeElement.querySelector('input[id="level2CareCertificate-yesCompleted"]');
      const yearAchievedInput = fixture.nativeElement.querySelector('div[id="certification-achieved"]');

      expect(radioBtn.checked).toBeTruthy();
      expect(yearAchievedInput.getAttribute('class')).not.toContain('hidden');
      expect(form.value).toEqual({ level2CareCertificate: 'Yes, completed', level2CareCertificateYearAchieved: 2023 });
    });
  });

  describe('errors', () => {
    it('should not show if "Yes, completed" is clicked but no year entered', async () => {
      const { component, fixture, getByText, queryByText } = await setup(false);

      const form = component.form;
      const radioBtn = fixture.nativeElement.querySelector('input[id="level2CareCertificate-yesCompleted"]');
      const saveButton = getByText('Save and return');

      fireEvent.click(radioBtn);
      fireEvent.click(saveButton);
      fixture.detectChanges();

      expect(form.valid).toBeTruthy();
      expect(queryByText('There is a problem')).toBeFalsy();
    });

    it('should show if the entered year is in the future', async () => {
      const { component, fixture, getByText, getAllByText } = await setup(false);

      const form = component.form;
      const radioBtn = fixture.nativeElement.querySelector('input[id="level2CareCertificate-yesCompleted"]');
      const saveButton = getByText('Save and return');
      const expectedErrorMessage = 'Year achieved cannot be in the future';
      const nextYear = dayjs().year() + 1;

      form.get('level2CareCertificateYearAchieved').setValue(nextYear);
      form.markAsDirty();
      fireEvent.click(radioBtn);
      fireEvent.click(saveButton);

      expect(form.invalid).toBeTruthy();
      expect(getAllByText(expectedErrorMessage, { exact: false }).length).toBe(2);
    });

    it('should error if entered year is before the qualification was introduced', async () => {
      const { component, fixture, getByText, getAllByText } = await setup(false);

      const form = component.form;
      const radioBtn = fixture.nativeElement.querySelector('input[id="level2CareCertificate-yesCompleted"]');
      const saveButton = getByText('Save and return');

      form.get('level2CareCertificateYearAchieved').setValue(2023);
      form.markAsDirty();
      fireEvent.click(radioBtn);
      fireEvent.click(saveButton);

      const expectedErrorMessage = 'Year achieved cannot be before 2024';

      expect(form.invalid).toBeTruthy();
      expect(getAllByText(expectedErrorMessage, { exact: false }).length).toBe(2);
    });
  });
});
