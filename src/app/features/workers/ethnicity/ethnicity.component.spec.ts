import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { WorkerService } from '@core/services/worker.service';
import { MockWorkerService, MockWorkerServiceWithoutReturnUrl } from '@core/test-utils/MockWorkerService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, getByLabelText, render } from '@testing-library/angular';

import { EthnicityComponent } from './ethnicity.component';

describe('EthnicityComponent', () => {
  const ethnicityData = {
    White: [
      { id: 1, ethnicity: 'white ethnicity 1', group: 'White' },
      { id: 2, ethnicity: 'white ethnicity 2', group: 'White' },
    ],
    Mixed: [
      { id: 3, ethnicity: 'Mixed / multiple ethnic groups 3', group: 'Mixed / multiple ethnic groups' },
      { id: 4, ethnicity: 'Mixed / multiple ethnic groups 4', group: 'Mixed / multiple ethnic groups' },
    ],
    Asian: [
      { id: 5, ethnicity: 'Asian / Asian British 5', group: 'Asian / Asian British' },
      { id: 6, ethnicity: 'Asian / Asian British 6', group: 'Asian / Asian British' },
    ],
    Black: [
      {
        id: 7,
        ethnicity: 'Black / African / Caribbean / Black British 7',
        group: 'Black / African / Caribbean / Black British',
      },
      {
        id: 8,
        ethnicity: 'Black / African / Caribbean / Black British 8',
        group: 'Black / African / Caribbean / Black British',
      },
    ],
    Other: [
      { id: 9, ethnicity: 'Other ethnic group 9', group: 'Other ethnic group' },
      { id: 10, ethnicity: 'Other ethnic group 10', group: 'Other ethnic group' },
    ],
  };

  async function setup(returnUrl = true) {
    const { fixture, getByText, getAllByText, getByLabelText, queryByTestId, queryByText } = await render(
      EthnicityComponent,
      {
        imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
        providers: [
          FormBuilder,
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: {
                parent: {
                  url: [{ path: returnUrl ? 'staff-record-summary' : 'mocked-uid' }],
                },
              },
              parent: {
                snapshot: {
                  data: {
                    establishment: { uid: 'mocked-uid' },
                  },
                  url: [{ path: '' }],
                },
              },
            },
          },
          {
            provide: WorkerService,
            useClass: returnUrl ? MockWorkerService : MockWorkerServiceWithoutReturnUrl,
          },
        ],
      },
    );

    const injector = getTestBed();

    const component = fixture.componentInstance;
    const router = injector.inject(Router) as Router;

    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return {
      component,
      fixture,
      routerSpy,
      getByText,
      getAllByText,
      getByLabelText,
      queryByTestId,
      queryByText,
    };
  }

  it('should render the EthnicityComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('progress bar', () => {
    it('should render the progress bar', async () => {
      const { queryByTestId } = await setup(false);

      expect(queryByTestId('progress-bar-1')).toBeTruthy();
    });

    it('should not render the progress bar if not inside the flow', async () => {
      const { queryByTestId } = await setup();

      expect(queryByTestId('progress-bar-1')).toBeFalsy();
    });
  });

  describe('submit buttons', () => {
    it(`should show 'Save and continue' cta button and 'View this staff record' link, and skip skip this question link, if a return url is not provided`, async () => {
      const { getByText } = await setup(false);

      expect(getByText('Save and continue')).toBeTruthy();
      expect(getByText('View this staff record')).toBeTruthy();
      expect(getByText('Skip this question')).toBeTruthy();
    });

    it(`should show 'Save and return' cta button and 'Cancel' link if a return url is provided`, async () => {
      const { getByText } = await setup(true);

      expect(getByText('Save and return')).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
    });
  });

  describe('navigation', () => {
    it('should navigate to nationality page when submitting from flow', async () => {
      const { component, routerSpy, getByText } = await setup(false);

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      const saveButton = getByText('Save and continue');
      fireEvent.click(saveButton);

      expect(routerSpy).toHaveBeenCalledWith(['/workplace', workplaceId, 'staff-record', workerId, 'nationality']);
    });

    it('should navigate to nationality page when skipping the question in the flow', async () => {
      const { component, routerSpy, getByText } = await setup(false);

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      const skipButton = getByText('Skip this question');
      fireEvent.click(skipButton);

      expect(routerSpy).toHaveBeenCalledWith(['/workplace', workplaceId, 'staff-record', workerId, 'nationality']);
    });

    xit('should navigate to staff-summary-page page when pressing save and return', async () => {
      const { component, routerSpy, getByText } = await setup();

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      const skipButton = getByText('Save and return');
      fireEvent.click(skipButton);

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        workplaceId,
        'staff-record',
        workerId,
        'staff-record-summary',
      ]);
    });

    it('should navigate to staff-summary-page page when pressing cancel', async () => {
      const { component, routerSpy, getByText } = await setup();

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      const skipButton = getByText('Cancel');
      fireEvent.click(skipButton);

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        workplaceId,
        'staff-record',
        workerId,
        'staff-record-summary',
      ]);
    });

    it('should set backlink to staff-summary-page page when not in staff record flow', async () => {
      const { component } = await setup();

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      expect(component.return).toEqual({
        url: ['/workplace', workplaceId, 'staff-record', workerId, 'staff-record-summary'],
      });
    });
  });

  describe('Radio Buttons', () => {
    it('Should render the ethnicity group radios when page renders', async () => {
      const { component, fixture, getByLabelText } = await setup(false);

      component.ethnicitiesByGroup = ethnicityData;
      fixture.detectChanges();

      expect(getByLabelText('White')).toBeTruthy();
      expect(getByLabelText('Mixed')).toBeTruthy();
      expect(getByLabelText('Asian')).toBeTruthy();
      expect(getByLabelText('Black')).toBeTruthy();
      expect(getByLabelText('Other')).toBeTruthy();
    });

    it('Should render the white ethnicitiy radios when category white is clicked', async () => {
      const { component, fixture, getByText } = await setup(false);

      component.ethnicitiesByGroup = ethnicityData;
      fixture.detectChanges();

      const whiteButton = getByText('White');
      fireEvent.click(whiteButton);
      fixture.detectChanges();

      expect(getByText('white ethnicity 1')).toBeTruthy();
      expect(getByText('white ethnicity 2')).toBeTruthy();
    });

    it('Should render the mixed ethnicitiy radios when category mixed is clicked', async () => {
      const { component, fixture, getByText } = await setup(false);

      component.ethnicitiesByGroup = ethnicityData;
      fixture.detectChanges();

      const mixedButton = getByText('Mixed');
      fireEvent.click(mixedButton);
      fixture.detectChanges();

      expect(getByText('Mixed / multiple ethnic groups 3')).toBeTruthy();
      expect(getByText('Mixed / multiple ethnic groups 4')).toBeTruthy();
    });

    it('Should render the asian ethnicitiy radios when category asian is clicked', async () => {
      const { component, fixture, getByText } = await setup(false);

      component.ethnicitiesByGroup = ethnicityData;
      fixture.detectChanges();

      const asianButton = getByText('Asian');
      fireEvent.click(asianButton);
      fixture.detectChanges();

      expect(getByText('Asian / Asian British 5')).toBeTruthy();
      expect(getByText('Asian / Asian British 6')).toBeTruthy();
    });

    it('Should render the black ethnicity radios when category black is clicked', async () => {
      const { component, fixture, getByText } = await setup(false);

      component.ethnicitiesByGroup = ethnicityData;
      fixture.detectChanges();

      const blackButton = getByText('Black');
      fireEvent.click(blackButton);
      fixture.detectChanges();

      expect(getByText('Black / African / Caribbean / Black British 7')).toBeTruthy();
      expect(getByText('Black / African / Caribbean / Black British 8')).toBeTruthy();
    });

    it('Should render the other ethnicity radios when category other is clicked', async () => {
      const { component, fixture, getByText } = await setup(false);

      component.ethnicitiesByGroup = ethnicityData;
      fixture.detectChanges();

      const otherButton = getByText('Other');
      fireEvent.click(otherButton);
      fixture.detectChanges();

      expect(getByText('Other ethnic group 9')).toBeTruthy();
      expect(getByText('Other ethnic group 10')).toBeTruthy();
    });
  });

  describe('error message', () => {
    it('should display an error message when a group is selected but a specfic ethnicity is not selected', async () => {
      const { component, fixture, getByText, getAllByText } = await setup(false);

      component.ethnicitiesByGroup = ethnicityData;
      const form = component.form;
      fixture.detectChanges();

      const otherButton = getByText('Other');
      fireEvent.click(otherButton);

      const submitButton = getByText('Save and continue');
      fireEvent.click(submitButton);
      fixture.detectChanges();

      const errorMessages = getAllByText('Select which best describes their ethnic background');

      expect(form.valid).toBeFalsy();
      expect(errorMessages.length).toEqual(6);
    });
  });
});
