import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { UntypedFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EthnicityService } from '@core/services/ethnicity.service';
import { WorkerService } from '@core/services/worker.service';
import { MockEthnicityService } from '@core/test-utils/MockEthnicityService';
import { MockWorkerServiceWithUpdateWorker } from '@core/test-utils/MockWorkerService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { EthnicityComponent } from './ethnicity.component';

describe('EthnicityComponent', () => {
  async function setup(insideFlow = true) {
    const { fixture, getByText, getAllByText, getByLabelText, queryByTestId, queryByText } = await render(
      EthnicityComponent,
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
          {
            provide: EthnicityService,
            useClass: MockEthnicityService,
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
      router,
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

  it('should render the reveal', async () => {
    const { getByText } = await setup();

    const reveal = getByText('Why we ask for this information');
    const revealText = getByText(
      'To see how the ethnicity of the workforce compares to that of the local population and to that of the people you support. The data is also used to look at employment trends across different groups and to inform recruitment plans.',
    );

    expect(reveal).toBeTruthy();
    expect(revealText).toBeTruthy();
  });

  describe('progress bar', () => {
    it('should render the progress bar', async () => {
      const { queryByTestId } = await setup();

      expect(queryByTestId('progress-bar')).toBeTruthy();
    });

    it('should not render the progress bar if not inside the flow', async () => {
      const { queryByTestId } = await setup(false);

      expect(queryByTestId('progress-bar')).toBeFalsy();
    });
  });

  describe('submit buttons', () => {
    it(`should show 'Save and continue' cta button and 'View this staff record' link, and skip skip this question link, if a return url is not provided`, async () => {
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
  });

  describe('navigation', () => {
    it('should navigate to nationality page when submitting from flow', async () => {
      const { component, routerSpy, getByText } = await setup();

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      const saveButton = getByText('Save and continue');
      fireEvent.click(saveButton);

      expect(routerSpy).toHaveBeenCalledWith(['/workplace', workplaceId, 'staff-record', workerId, 'nationality']);
    });

    it('should navigate to nationality page when skipping the question in the flow', async () => {
      const { component, routerSpy, getByText } = await setup();

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      const link = getByText('Skip this question');
      fireEvent.click(link);

      expect(routerSpy).toHaveBeenCalledWith(['/workplace', workplaceId, 'staff-record', workerId, 'nationality']);
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
      const { component, routerSpy, getByText } = await setup(false);

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      const saveButton = getByText('Save and return');
      fireEvent.click(saveButton);

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

    it('should navigate to wdf staff-summary-page page when pressing save and return in wdf version of page', async () => {
      const { component, routerSpy, getByText, router, fixture } = await setup(false);
      spyOnProperty(router, 'url').and.returnValue('/wdf/staff-record');
      component.returnUrl = undefined;
      component.ngOnInit();
      fixture.detectChanges();
      const workerId = component.worker.uid;

      const saveButton = getByText('Save and return');
      fireEvent.click(saveButton);

      expect(routerSpy).toHaveBeenCalledWith(['/wdf', 'staff-record', workerId]);
    });

    it('should navigate to wdf staff-summary-page page when pressing cancel in wdf version of page', async () => {
      const { component, routerSpy, getByText, router, fixture } = await setup(false);
      spyOnProperty(router, 'url').and.returnValue('/wdf/staff-record');
      component.returnUrl = undefined;
      component.ngOnInit();
      fixture.detectChanges();
      const workerId = component.worker.uid;

      const link = getByText('Cancel');
      fireEvent.click(link);

      expect(routerSpy).toHaveBeenCalledWith(['/wdf', 'staff-record', workerId]);
    });
  });

  describe('Radio Buttons', () => {
    it('Should render the ethnicity group radios when page renders', async () => {
      const { getByLabelText, getByText } = await setup();

      expect(getByLabelText('White')).toBeTruthy();
      expect(getByLabelText('Mixed or Multiple ethnic groups')).toBeTruthy();
      expect(getByLabelText('Asian or Asian British')).toBeTruthy();
      expect(getByLabelText('Black, African, Caribbean or Black British')).toBeTruthy();
      expect(getByLabelText('Other ethnic group')).toBeTruthy();
      expect(getByText(`I do not know`)).toBeTruthy();
    });

    it('Should render the white ethnicity radios when category white is clicked', async () => {
      const { fixture, getByText, queryByText } = await setup();

      const whiteButton = getByText('White');
      fireEvent.click(whiteButton);
      fixture.detectChanges();

      expect(getByText('English, Welsh, Scottish, Northen Irish or British')).toBeTruthy();
      expect(getByText('white ethnicity 2')).toBeTruthy();
      expect(queryByText('Mixed / multiple ethnic groups 3')).toBeFalsy();
      expect(queryByText('Mixed / multiple ethnic groups 4')).toBeFalsy();
      expect(queryByText('Mixed / multiple ethnic groups 5')).toBeFalsy();
      expect(queryByText('Any other Mixed or Multiple ethnic background')).toBeFalsy();
      expect(queryByText('Asian / Asian British 7')).toBeFalsy();
      expect(queryByText('Asian / Asian British 8')).toBeFalsy();
      expect(queryByText('Black / African / Caribbean / Black British 9')).toBeFalsy();
      expect(queryByText('Black / African / Caribbean / Black British 10')).toBeFalsy();
      expect(queryByText('Any other Black, African or Caribbean background')).toBeFalsy();
      expect(queryByText('Other ethnic group 12')).toBeFalsy();
      expect(queryByText('Other ethnic group 13')).toBeFalsy();
    });

    it('Should render the mixed ethnicity radios when category mixed is clicked', async () => {
      const { fixture, getByText, queryByText } = await setup();

      const mixedButton = getByText('Mixed or Multiple ethnic groups');
      fireEvent.click(mixedButton);
      fixture.detectChanges();

      expect(queryByText('English, Welsh, Scottish, Northen Irish or British')).toBeFalsy();
      expect(queryByText('white ethnicity 2')).toBeFalsy();
      expect(getByText('Mixed / multiple ethnic groups 3')).toBeTruthy();
      expect(getByText('Mixed / multiple ethnic groups 4')).toBeTruthy();
      expect(getByText('Mixed / multiple ethnic groups 5')).toBeTruthy();
      expect(getByText('Any other Mixed or Multiple ethnic background')).toBeTruthy();
      expect(queryByText('Asian / Asian British 7')).toBeFalsy();
      expect(queryByText('Asian / Asian British 8')).toBeFalsy();
      expect(queryByText('Black / African / Caribbean / Black British 9')).toBeFalsy();
      expect(queryByText('Black / African / Caribbean / Black British 10')).toBeFalsy();
      expect(queryByText('Any other Black, African or Caribbean background')).toBeFalsy();
      expect(queryByText('Other ethnic group 12')).toBeFalsy();
      expect(queryByText('Other ethnic group 13')).toBeFalsy();
    });

    it('Should render the asian ethnicity radios when category asian is clicked', async () => {
      const { fixture, getByText, queryByText } = await setup();

      const asianButton = getByText('Asian or Asian British');
      fireEvent.click(asianButton);
      fixture.detectChanges();

      expect(queryByText('English, Welsh, Scottish, Northen Irish or British')).toBeFalsy();
      expect(queryByText('white ethnicity 2')).toBeFalsy();
      expect(queryByText('Mixed / multiple ethnic groups 3')).toBeFalsy();
      expect(queryByText('Mixed / multiple ethnic groups 4')).toBeFalsy();
      expect(queryByText('Mixed / multiple ethnic groups 5')).toBeFalsy();
      expect(queryByText('Any other Mixed or Multiple ethnic background')).toBeFalsy();
      expect(getByText('Asian / Asian British 7')).toBeTruthy();
      expect(getByText('Asian / Asian British 8')).toBeTruthy();
      expect(queryByText('Black / African / Caribbean / Black British 9')).toBeFalsy();
      expect(queryByText('Black / African / Caribbean / Black British 10')).toBeFalsy();
      expect(queryByText('Any other Black, African or Caribbean background')).toBeFalsy();
      expect(queryByText('Other ethnic group 12')).toBeFalsy();
      expect(queryByText('Other ethnic group 13')).toBeFalsy();
    });

    it('Should render the black ethnicity radios when category black is clicked', async () => {
      const { fixture, getByText, queryByText } = await setup();

      const blackButton = getByText('Black, African, Caribbean or Black British');
      fireEvent.click(blackButton);
      fixture.detectChanges();

      expect(queryByText('English, Welsh, Scottish, Northen Irish or British')).toBeFalsy();
      expect(queryByText('white ethnicity 2')).toBeFalsy();
      expect(queryByText('Mixed / multiple ethnic groups 3')).toBeFalsy();
      expect(queryByText('Mixed / multiple ethnic groups 4')).toBeFalsy();
      expect(queryByText('Mixed / multiple ethnic groups 5')).toBeFalsy();
      expect(queryByText('Any other Mixed or Multiple ethnic background')).toBeFalsy();
      expect(queryByText('Asian / Asian British 7')).toBeFalsy();
      expect(queryByText('Asian / Asian British 8')).toBeFalsy();
      expect(getByText('Black / African / Caribbean / Black British 9')).toBeTruthy();
      expect(getByText('Black / African / Caribbean / Black British 10')).toBeTruthy();
      expect(getByText('Any other Black, African or Caribbean background')).toBeTruthy();
      expect(queryByText('Other ethnic group 12')).toBeFalsy();
      expect(queryByText('Other ethnic group 13')).toBeFalsy();
    });

    it('Should render the other ethnicity radios when category other is clicked', async () => {
      const { fixture, getByText, queryByText } = await setup();

      const otherButton = getByText('Other ethnic group');
      fireEvent.click(otherButton);
      fixture.detectChanges();

      expect(queryByText('English, Welsh, Scottish, Northen Irish or British')).toBeFalsy();
      expect(queryByText('white ethnicity 2')).toBeFalsy();
      expect(queryByText('Mixed / multiple ethnic groups 3')).toBeFalsy();
      expect(queryByText('Mixed / multiple ethnic groups 4')).toBeFalsy();
      expect(queryByText('Mixed / multiple ethnic groups 5')).toBeFalsy();
      expect(queryByText('Any other Mixed or Multiple ethnic background')).toBeFalsy();
      expect(queryByText('Asian / Asian British 7')).toBeFalsy();
      expect(queryByText('Asian / Asian British 8')).toBeFalsy();
      expect(queryByText('Black / African / Caribbean / Black British 9')).toBeFalsy();
      expect(queryByText('Black / African / Caribbean / Black British 10')).toBeFalsy();
      expect(queryByText('Any other Black, African or Caribbean background')).toBeFalsy();
      expect(getByText('Other ethnic group 12')).toBeTruthy();
      expect(getByText('Other ethnic group 13')).toBeTruthy();
    });
  });

  describe('error message', () => {
    it('should display an error message when a group is selected but a specfic ethnicity is not selected', async () => {
      const { component, fixture, getByText, getAllByText } = await setup();

      const form = component.form;
      fixture.detectChanges();

      const otherButton = getByText('Other ethnic group');
      fireEvent.click(otherButton);

      const submitButton = getByText('Save and continue');
      fireEvent.click(submitButton);
      fixture.detectChanges();

      const errorMessages = getAllByText('Select which best describes their ethnic background');

      expect(form.valid).toBeFalsy();
      expect(errorMessages.length).toEqual(2);
    });
  });
});
