import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BackService } from '@core/services/back.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkplaceService } from '@core/services/workplace.service';
import { MockWorkplaceService } from '@core/test-utils/MockWorkplaceService';
import { RegistrationModule } from '@features/registration/registration.module';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { NameOfWorkplaceComponent } from './name-of-workplace.component';

describe('NameOfWorkplaceComponent', () => {
  async function setup(addWorkplaceFlow = true) {
    const primaryWorkplace = { isParent: true };
    const component = await render(NameOfWorkplaceComponent, {
      imports: [
        SharedModule,
        RouterModule,
        RouterTestingModule,
        HttpClientTestingModule,
        RegistrationModule,
        ReactiveFormsModule,
      ],
      providers: [
        BackService,
        {
          provide: EstablishmentService,
          useValue: { primaryWorkplace },
        },
        {
          provide: WorkplaceService,
          useClass: MockWorkplaceService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              parent: {
                url: [
                  {
                    path: addWorkplaceFlow ? 'add-workplace' : 'confirm-workplace-details',
                  },
                ],
              },
            },
          },
        },
      ],
    });

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;

    const spy = spyOn(router, 'navigate');
    spy.and.returnValue(Promise.resolve(true));

    return {
      component,
      spy,
    };
  }

  it('should render a NameOfWorkplaceComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render the workplace progress bar but not the user progress bar', async () => {
    const { component } = await setup();

    expect(component.getByTestId('progress-bar-1')).toBeTruthy();
    expect(component.queryByTestId('progress-bar-2')).toBeFalsy();
  });

  it('should not render the progress bar when accessed from outside the flow', async () => {
    const { component } = await setup(false);

    expect(component.queryByTestId('progress-bar-1')).toBeFalsy();
    expect(component.queryByTestId('progress-bar-2')).toBeFalsy();
  });

  it('should render the correct heading when in the parent journey', async () => {
    const { component } = await setup();

    const parentHeading = component.getByText(`What's the name of the workplace?`);

    expect(parentHeading).toBeTruthy();
  });

  it('should prefill the workplace name if it exists', async () => {
    const { component } = await setup();
    const form = component.fixture.componentInstance.form;

    component.fixture.componentInstance.workplaceService.selectedLocationAddress$.value.locationName = 'Workplace Name';
    component.fixture.componentInstance.ngOnInit();

    expect(form.value.workplaceName).toEqual('Workplace Name');
  });

  it('should display an error when continue is clicked without adding a workplace name', async () => {
    const { component } = await setup();

    component.fixture.componentInstance.workplaceService.selectedLocationAddress$.value.locationName = null;
    component.fixture.componentInstance.ngOnInit();

    const form = component.fixture.componentInstance.form;
    const errorMessage = 'Enter the name of the workplace';

    const continueButton = component.getByText('Continue');
    fireEvent.click(continueButton);

    expect(form.invalid).toBeTruthy();
    expect(component.getAllByText(errorMessage).length).toBe(2);
  });

  it('should navigate to type-of-employer url when continue button is clicked and a workplace name is given', async () => {
    const { component, spy } = await setup();
    const form = component.fixture.componentInstance.form;
    const continueButton = component.getByText('Continue');

    form.controls['workplaceName'].setValue('Place Name');
    fireEvent.click(continueButton);

    expect(form.valid).toBeTruthy();
    expect(spy).toHaveBeenCalledWith(['add-workplace', 'type-of-employer']);
  });

  it('should set locationName in workplace service when continue button is clicked and a workplace name is given', async () => {
    const { component } = await setup();
    const form = component.fixture.componentInstance.form;
    const continueButton = component.getByText('Continue');
    const workplaceService = component.fixture.componentInstance.workplaceService;

    form.controls['workplaceName'].setValue('Place Name');
    fireEvent.click(continueButton);

    expect(form.valid).toBeTruthy();
    expect(workplaceService.selectedLocationAddress$.value.locationName).toBe('Place Name');
  });

  describe('setBackLink()', () => {
    it('should set the correct back link when in the parent flow', async () => {
      const { component } = await setup();
      const backLinkSpy = spyOn(component.fixture.componentInstance.backService, 'setBackLink');

      component.fixture.componentInstance.setBackLink();
      component.fixture.detectChanges();

      expect(backLinkSpy).toHaveBeenCalledWith({
        url: ['/add-workplace', 'select-workplace-address'],
      });
    });
  });
});
