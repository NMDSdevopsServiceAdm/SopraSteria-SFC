import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BackService } from '@core/services/back.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { RegistrationService } from '@core/services/registration.service';
import { MockRegistrationService } from '@core/test-utils/MockRegistrationService';
import { RegistrationModule } from '@features/registration/registration.module';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import { BehaviorSubject } from 'rxjs';

import { AddTotalStaffComponent } from './add-total-staff.component';

describe('AddTotalStaffComponent', () => {
  async function setup() {
    const component = await render(AddTotalStaffComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, RegistrationModule],
      providers: [
        BackService,
        {
          provide: EstablishmentService,
          useValue: {},
        },
        {
          provide: RegistrationService,
          useClass: MockRegistrationService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              parent: {
                url: [
                  {
                    path: 'registration',
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

  it('should render a AddTotalStaffComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render the correct heading when in the registration journey', async () => {
    const { component } = await setup();

    const registrationHeading = component.queryByText(`How many members of staff does your workplace have?`);

    expect(registrationHeading).toBeTruthy();
  });

  it(`should display the paragraph`, async () => {
    const { component } = await setup();

    const paragraph = component.getByTestId('info');
    expect(paragraph).toBeTruthy();
  });

  it(`should display the reveal and its contents`, async () => {
    const { component } = await setup();

    const reveal = component.getByText('Not sure how many members of staff your workplace has?');
    const revealContent = component.getByText(
      'You can enter an estimate to save time, but remember to update this number in ASC-WDS once your account has been validated by Skills for Care.',
      { exact: false },
    );

    expect(reveal).toBeTruthy();
    expect(revealContent).toBeTruthy();
  });

  it('should prefill the form if totalStaff is already set in the service', async () => {
    const { component } = await setup();

    component.fixture.componentInstance.registrationService.totalStaff$ = new BehaviorSubject('12');
    component.fixture.componentInstance.ngOnInit();

    const form = component.fixture.componentInstance.form;
    expect(form.value.totalStaff).toEqual('12');
    expect(form.valid).toBeTruthy();
  });

  it('should display an error when continue is clicked without adding total staff number', async () => {
    const { component } = await setup();

    component.fixture.componentInstance.registrationService.totalStaff$ = new BehaviorSubject(null);
    component.fixture.componentInstance.ngOnInit();

    const form = component.fixture.componentInstance.form;
    const errorMessage = 'Enter the total number of staff at your workplace';

    const continueButton = component.getByText('Continue');
    fireEvent.click(continueButton);

    expect(form.invalid).toBeTruthy();
    expect(component.getAllByText(errorMessage).length).toBe(2);
  });

  it('should navigate to add-user-details url when continue button is clicked and total staff is given', async () => {
    const { component, spy } = await setup();
    const form = component.fixture.componentInstance.form;
    const continueButton = component.getByText('Continue');

    form.controls['totalStaff'].setValue('12');
    fireEvent.click(continueButton);

    expect(form.valid).toBeTruthy();
    expect(spy).toHaveBeenCalledWith(['registration', 'add-user-details']);
  });

  it('should set totalStaff in registration service when continue button is clicked and total staff ßis given', async () => {
    const { component } = await setup();
    const form = component.fixture.componentInstance.form;
    const continueButton = component.getByText('Continue');
    const registrationService = component.fixture.componentInstance.registrationService.totalStaff$;

    form.controls['totalStaff'].setValue('12');
    fireEvent.click(continueButton);

    expect(form.valid).toBeTruthy();
    expect(registrationService).toEqual(new BehaviorSubject('12'));
  });

  describe('setBackLink()', () => {
    it('should set the correct back link', async () => {
      const { component } = await setup();
      const backLinkSpy = spyOn(component.fixture.componentInstance.backService, 'setBackLink');

      (component.fixture.componentInstance as any).setBackLink();
      component.fixture.detectChanges();

      expect(backLinkSpy).toHaveBeenCalledWith({
        url: ['registration', 'select-main-service'],
      });
    });
  });
});
