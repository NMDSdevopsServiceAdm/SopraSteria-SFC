import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@shared/shared.module';
import { render, screen, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { FindUsernameService } from '../../../core/services/find-username.service';
import { FindAccountComponent } from './find-account/find-account.component';
import { ForgotYourUsernameComponent } from './forgot-your-username.component';
import { MockFindUsernameService } from '@core/test-utils/MockFindUsernameService';

fdescribe('ForgotYourUsernameComponent', () => {
  const setup = async () => {
    const setupTools = await render(ForgotYourUsernameComponent, {
      imports: [HttpClientTestingModule, FormsModule, ReactiveFormsModule, RouterTestingModule, SharedModule],
      declarations: [FindAccountComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {},
          },
        },
        {
          provide: FindUsernameService,
          useClass: MockFindUsernameService,
        },
      ],
    });

    const component = setupTools.fixture.componentInstance;

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    const findUsernameService = injector.inject(FindUsernameService) as FindUsernameService;

    return { ...setupTools, component, routerSpy, findUsernameService };
  };

  const fillInAndSubmitForm = async (name: string, workplaceIdOrPostcode: string, email: string) => {
    userEvent.type(screen.getByRole('textbox', { name: 'Name' }), name);
    userEvent.type(screen.getByRole('textbox', { name: 'Workplace ID or postcode' }), workplaceIdOrPostcode);
    userEvent.type(screen.getByRole('textbox', { name: 'Email address' }), email);

    userEvent.click(screen.getByRole('button', { name: 'Find account' }));
  };

  it('should create', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });

  it('should show a page heading', async () => {
    const { getByRole } = await setup();

    expect(getByRole('heading', { name: 'Forgot username' })).toBeTruthy();
  });

  describe('Find account', () => {
    it('should show text inputs for "Name", "Workplace ID or postcode" and "Email address"', async () => {
      const { getByRole } = await setup();

      expect(getByRole('textbox', { name: 'Name' })).toBeTruthy();
      expect(getByRole('textbox', { name: 'Workplace ID or postcode' })).toBeTruthy();
      expect(getByRole('textbox', { name: 'Email address' })).toBeTruthy();
    });

    it('should show a "Find account" CTA button and a "Back to sign in" link', async () => {
      const { getByRole, getByText } = await setup();

      expect(getByRole('button', { name: 'Find account' })).toBeTruthy();

      const backToSignIn = getByText('Back to sign in');
      expect(backToSignIn).toBeTruthy();
      expect(backToSignIn.getAttribute('href')).toEqual('/login');
    });

    describe('submit form and validation', () => {
      it('should show an error message if any of the text input is blank', async () => {
        const { fixture, getByRole, getByText, getAllByText, findUsernameService } = await setup();

        spyOn(findUsernameService, 'findUserAccount').and.callThrough();

        userEvent.click(getByRole('button', { name: 'Find account' }));
        fixture.detectChanges();

        expect(getByText('There is a problem')).toBeTruthy();

        expect(getAllByText('Enter your name')).toHaveSize(2);
        expect(getAllByText('Enter your workplace ID or postcode')).toHaveSize(2);
        expect(getAllByText('Enter your email address')).toHaveSize(2);

        expect(findUsernameService.findUserAccount).not.toHaveBeenCalled();
      });

      it('should call forgetUsernameService findUserAccount() on submit', async () => {
        const { fixture, findUsernameService } = await setup();

        spyOn(findUsernameService, 'findUserAccount').and.callThrough();

        await fillInAndSubmitForm('Test User', 'A1234567', 'test@example.com');
        fixture.detectChanges();

        expect(findUsernameService.findUserAccount).toHaveBeenCalledWith({
          name: 'Test User',
          workplaceIdOrPostcode: 'A1234567',
          email: 'test@example.com',
        });
      });

      it('should show "Account found" and stop showing "Find account" button when an account is found', async () => {
        const { fixture, getByText, queryByRole } = await setup();

        await fillInAndSubmitForm('Test User', 'A1234567', 'test@example.com');
        fixture.detectChanges();

        expect(getByText('Account found')).toBeTruthy();
        expect(queryByRole('button', { name: 'Find account' })).toBeFalsy();
      });

      it('should show a "Account not found" message and still showing "Find account" button when an account is not found', async () => {
        const { fixture, getByText, getByRole } = await setup();
        fixture.autoDetectChanges();

        await fillInAndSubmitForm('non-exist user', 'A1234567', 'test@example.com');

        const expectedText = [
          'Some or all of the information you entered does not match that which we have for your account.',
          "You've 4 more chances to enter the same information that we have.",
          'Make sure the details you entered are correct or call the ASC-WDS Support Team on 0113 241 0969 for help.',
        ];

        expect(getByText('Account not found')).toBeTruthy();
        expect(getByRole('button', { name: 'Find account' })).toBeTruthy();

        const accountNotFoundMessage = getByText('Account not found').parentElement;

        expectedText.forEach((text) => expect(accountNotFoundMessage.innerText).toContain(text));
      });
    });
  });
});
