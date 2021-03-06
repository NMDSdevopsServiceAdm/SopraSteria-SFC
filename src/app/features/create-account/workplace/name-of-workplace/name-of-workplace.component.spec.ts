import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BackService } from '@core/services/back.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { RegistrationModule } from '@features/registration/registration.module';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { NameOfWorkplaceComponent } from './name-of-workplace.component';

describe('NameOfWorkplaceComponent', () => {
  async function setup(flow) {
    let primaryWorkplace = {};
    if (flow === 'add-workplace') {
      primaryWorkplace = { isParent: true };
    }
    const component = await render(NameOfWorkplaceComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, RegistrationModule],
      providers: [
        BackService,
        {
          provide: EstablishmentService,
          useValue: { primaryWorkplace },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              parent: {
                url: [
                  {
                    path: flow,
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
    const { component } = await setup('registration');
    expect(component).toBeTruthy();
  });

  describe('Registration journey', () => {
    it('should render the correct heading when in the registration journey', async () => {
      const { component } = await setup('registration');

      const registrationHeading = component.queryByText(`What's the name of your workplace?`);

      expect(registrationHeading).toBeTruthy();
    });

    it('should display an error when continue is clicked without adding a workplace name', async () => {
      const { component } = await setup('registration');

      const form = component.fixture.componentInstance.form;
      const continueButton = component.getByText('Continue');
      fireEvent.click(continueButton);
      const errorMessage = 'Enter the name of your workplace';

      expect(form.invalid).toBeTruthy();
      expect(component.getAllByText(errorMessage).length).toBe(2);
    });

    it('should navigate to find-workplace-address url when continue button is clicked and a workplace name is given', async () => {
      const { component, spy } = await setup('registration');
      const form = component.fixture.componentInstance.form;
      const continueButton = component.getByText('Continue');

      form.controls['workplaceName'].setValue('Place Name');
      fireEvent.click(continueButton);

      expect(form.valid).toBeTruthy();
      expect(spy).toHaveBeenCalledWith(['registration', 'find-workplace-address']);
    });
  });

  describe('Parent journey', () => {
    it('should render the correct heading when in the parent journey', async () => {
      const { component } = await setup('add-workplace');

      const parentHeading = component.queryByText(`What's the name of the workplace?`);

      expect(parentHeading).toBeTruthy();
    });

    it('should display an error when continue is clicked without adding a workplace name', async () => {
      const { component } = await setup('add-workplace');

      const form = component.fixture.componentInstance.form;
      const continueButton = component.getByText('Continue');
      fireEvent.click(continueButton);
      const errorMessage = 'Enter the name of the workplace';

      expect(form.invalid).toBeTruthy();
      expect(component.getAllByText(errorMessage).length).toBe(2);
    });

    it('should navigate to find-workplace-address url when continue button is clicked and a workplace name is given', async () => {
      const { component, spy } = await setup('add-workplace');
      const form = component.fixture.componentInstance.form;
      const continueButton = component.getByText('Continue');

      form.controls['workplaceName'].setValue('Place Name');
      fireEvent.click(continueButton);

      expect(form.valid).toBeTruthy();
      expect(spy).toHaveBeenCalledWith(['add-workplace', 'find-workplace-address']);
    });
  });

  describe('setBackLink()', () => {
    it('should set the correct back link when in the registration flow', async () => {
      const { component } = await setup('registration');
      const backLinkSpy = spyOn(component.fixture.componentInstance.backService, 'setBackLink');

      component.fixture.componentInstance.setBackLink();
      component.fixture.detectChanges();

      expect(backLinkSpy).toHaveBeenCalledWith({
        url: ['/registration', 'new-regulated-by-cqc'],
      });
    });

    it('should set the correct back link when in the parent flow', async () => {
      const { component } = await setup('add-workplace');
      const backLinkSpy = spyOn(component.fixture.componentInstance.backService, 'setBackLink');

      component.fixture.componentInstance.setBackLink();
      component.fixture.detectChanges();

      expect(backLinkSpy).toHaveBeenCalledWith({
        url: ['/add-workplace', 'new-regulated-by-cqc'],
      });
    });
  });
});
