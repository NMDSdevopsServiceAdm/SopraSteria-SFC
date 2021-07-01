import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { RegistrationService } from '@core/services/registration.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { RegistrationModule } from '../../../registration/registration.module';
import { NewRegulatedByCqcComponent } from './new-regulated-by-cqc.component';

describe('NewRegulatedByCqcComponent', () => {
  async function setup(flow) {
    return render(NewRegulatedByCqcComponent, {
      imports: [SharedModule, RegistrationModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        {
          provide: RegistrationService,
          useClass: RegistrationService,
          deps: [HttpClient],
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
  }

  it('should create', async () => {
    const component = await setup('registration');
    expect(component).toBeTruthy();
  });

  describe('Registration journey', () => {
    it('should navigate to the find workplace page when selecting yes', async () => {
      const component = await setup('registration');
      const yesRadioButton = component.fixture.nativeElement.querySelector(`input[ng-reflect-value="yes"]`);
      fireEvent.click(yesRadioButton);

      const continueButton = component.getByText('Continue');
      fireEvent.click(continueButton);

      const nextPage = component.fixture.componentInstance.nextPage;
      console.log(nextPage);
      expect(nextPage.url).toEqual(['/registration', 'find-workplace']);
    });

    it('should navigate to the workplace name page when selecting no', async () => {
      const component = await setup('registration');
      const noRadioButton = component.fixture.nativeElement.querySelector(`input[ng-reflect-value="no"]`);
      fireEvent.click(noRadioButton);

      const continueButton = component.getByText('Continue');
      fireEvent.click(continueButton);

      const nextPage = component.fixture.componentInstance.nextPage;
      expect(nextPage.url).toEqual(['/registration', 'workplace-name']);
    });

    it('should display an error message when not selecting anything', async () => {
      const component = await setup('registration');

      const continueButton = component.getByText('Continue');
      fireEvent.click(continueButton);

      const errorMessage = component.getByTestId('errorMessage');
      expect(errorMessage.innerText).toContain(
        'Select yes if the main service you provide is regulated by the Care Quality Commission',
      );
    });
  });

  describe('Parent journey', () => {
    it('should navigate to the find workplace page when selecting yes', async () => {
      const component = await setup('add-workplace');
      const yesRadioButton = component.fixture.nativeElement.querySelector(`input[ng-reflect-value="yes"]`);
      fireEvent.click(yesRadioButton);

      const continueButton = component.getByText('Continue');
      fireEvent.click(continueButton);

      const nextPage = component.fixture.componentInstance.nextPage;
      expect(nextPage.url).toEqual(['/add-workplace', 'find-workplace']);
    });

    it('should navigate to the workplace name page when selecting no', async () => {
      const component = await setup('add-workplace');
      const noRadioButton = component.fixture.nativeElement.querySelector(`input[ng-reflect-value="no"]`);
      fireEvent.click(noRadioButton);

      const continueButton = component.getByText('Continue');
      fireEvent.click(continueButton);

      const nextPage = component.fixture.componentInstance.nextPage;
      expect(nextPage.url).toEqual(['/add-workplace', 'workplace-name']);
    });

    it('should display an error message when not selecting anything', async () => {
      const component = await setup('add-workplace');

      const continueButton = component.getByText('Continue');
      fireEvent.click(continueButton);

      const errorMessage = component.getByTestId('errorMessage');
      expect(errorMessage.innerText).toContain(
        'Select yes if the main service you provide is regulated by the Care Quality Commission',
      );
    });
  });

  describe('setBackLinks()', () => {
    it('should set the correct back link when in the registration flow', async () => {
      const component = await setup('registration');
      const backLinkSpy = spyOn(component.fixture.componentInstance.backService, 'setBackLink');

      component.fixture.componentInstance.setBackLinks();
      component.fixture.detectChanges();

      expect(backLinkSpy).toHaveBeenCalledWith({
        url: ['/registration', 'create-account'],
      });
    });

    it('should set the correct back link when in the parent flow', async () => {
      const component = await setup('add-workplace');
      const backLinkSpy = spyOn(component.fixture.componentInstance.backService, 'setBackLink');

      component.fixture.componentInstance.setBackLinks();
      component.fixture.detectChanges();

      expect(backLinkSpy).toHaveBeenCalledWith({
        url: ['/add-workplace', 'start'],
      });
    });
  });
});
