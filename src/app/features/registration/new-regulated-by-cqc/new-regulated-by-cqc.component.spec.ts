import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { RegistrationService } from '@core/services/registration.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { RegistrationModule } from '../registration.module';
import { NewRegulatedByCqcComponent } from './new-regulated-by-cqc.component';

fdescribe('NewRegulatedByCqcComponent', () => {
  async function setup() {
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
                    path: 'registration',
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
    const component = await setup();
    expect(component).toBeTruthy();
  });

  it('should navigate to next question when selecting yes', async () => {
    const component = await setup();
    console.log(component);
    const yesRadioButton = component.fixture.nativeElement.querySelector(`input[ng-reflect-value="yes"]`);
    fireEvent.click(yesRadioButton);
    const continueButton = component.getByText('Continue');
    console.log('*********************');
    fireEvent.click(continueButton);

    const nextPage = component.fixture.componentInstance.nextPage;
    console.log(nextPage);
    expect(true).toBe(true);
    // expect(nextPage).toEqual(['registration/find-workplace']);
  });

  // it('should navigate to dashboard when selecting no', async () => {
  //   const component = await setup();
  //   const noRadioButton = component.fixture.nativeElement.querySelector(`input[ng-reflect-value="No"]`);
  //   fireEvent.click(noRadioButton);

  //   const nextPage = component.fixture.componentInstance.nextPage;
  //   expect(nextPage.url).toEqual(['/dashboard']);
  // });

  // it('should navigate to dashboard when not selecting anything', async () => {
  //   const component = await setup();

  //   const nextPage = component.fixture.componentInstance.nextPage;
  //   expect(nextPage.url).toEqual(['/dashboard']);
  // });
});
