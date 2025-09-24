import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';

import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MockFindUsernameService, mockTestUser } from '@core/test-utils/MockFindUsernameService';
import { SharedModule } from '@shared/shared.module';
import { render, screen, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { FindUsernameService } from '../../../core/services/find-username.service';
import { FindAccountComponent } from './find-account/find-account.component';
import { FindUsernameComponent } from './find-username/find-username.component';
import { ForgotYourUsernameComponent } from './forgot-your-username.component';

describe('ForgotYourUsernameComponent', () => {
  const setup = async () => {
    const setupTools = await render(ForgotYourUsernameComponent, {
      imports: [FormsModule, ReactiveFormsModule, RouterModule, SharedModule],
      declarations: [FindAccountComponent, FindUsernameComponent],
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
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    const component = setupTools.fixture.componentInstance;

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    const findUsernameService = injector.inject(FindUsernameService) as FindUsernameService;

    return { ...setupTools, component, routerSpy, findUsernameService };
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
    const fillInAndSubmitForm = async (name: string, workplaceIdOrPostcode: string, email: string) => {
      userEvent.type(screen.getByRole('textbox', { name: 'Name' }), name);
      userEvent.type(screen.getByRole('textbox', { name: 'Workplace ID or postcode' }), workplaceIdOrPostcode);
      userEvent.type(screen.getByRole('textbox', { name: 'Email address' }), email);

      userEvent.click(screen.getByRole('button', { name: 'Find account' }));
    };

    describe('rendering', () => {
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
    });

    describe('submit form and validation', () => {
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

      it('should show a "Account not found" message and keep showing "Find account" button when an account is not found', async () => {
        const { fixture, getByRole, getByTestId } = await setup();
        fixture.autoDetectChanges();

        await fillInAndSubmitForm('non-exist user', 'A1234567', 'test@example.com');

        const expectedText = [
          'Some or all of the information you entered does not match the information we have for your account.',
          "You've 4 more chances to enter the same information that we have.",
          'Make sure the details you entered are correct or call the ASC-WDS Support Team on 0113 241 0969 for help.',
        ];

        const messageDiv = getByTestId('account-not-found');
        expect(within(messageDiv).getByText('Account not found')).toBeTruthy();
        expectedText.forEach((text) => expect(messageDiv.innerText).toContain(text));

        expect(getByRole('button', { name: 'Find account' })).toBeTruthy();
      });

      it('should show a different error message when only 1 chance remain', async () => {
        const { fixture, getByText, findUsernameService } = await setup();
        spyOn(findUsernameService, 'findUserAccount').and.returnValue(
          of({ status: 'AccountNotFound', remainingAttempts: 1 }),
        );

        await fillInAndSubmitForm('non-exist user', 'A1234567', 'test@example.com');

        fixture.detectChanges();

        const expectedText =
          "You've 1 more chance to enter the same information that we have, otherwise you'll need to call the Support Team.";

        expect(getByText(expectedText)).toBeTruthy();
      });

      it('should navigate to "user-account-not-found" page when remaining attempts = 0', async () => {
        const { findUsernameService, routerSpy } = await setup();
        spyOn(findUsernameService, 'findUserAccount').and.returnValue(
          of({ status: 'AccountNotFound', remainingAttempts: 0 }),
        );

        await fillInAndSubmitForm('non-exist user', 'A1234567', 'test@example.com');

        expect(routerSpy).toHaveBeenCalledWith(['/user-account-not-found']);
      });

      it('should show a "Multiple accounts found" message when more than 1 account was found', async () => {
        const { fixture, getByRole, getByText, findUsernameService } = await setup();
        fixture.autoDetectChanges();

        spyOn(findUsernameService, 'findUserAccount').and.returnValue(of({ status: 'MultipleAccountsFound' }));

        await fillInAndSubmitForm('Test User', 'A1234567', 'test@example.com');

        expect(getByText('Multple accounts found')).toBeTruthy();
        expect(getByText('We found more than 1 account with the information you entered.')).toBeTruthy();

        const textMessage = getByText('Call the ASC-WDS Support Team on', { exact: false });
        expect(textMessage.textContent).toEqual('Call the ASC-WDS Support Team on 0113 241 0969 for help.');

        expect(getByRole('button', { name: 'Find account' })).toBeTruthy();
      });

      describe('errors', () => {
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

        it('should show an error message if the email address not in a right format', async () => {
          const { fixture, getByText, getAllByText, findUsernameService } = await setup();

          spyOn(findUsernameService, 'findUserAccount').and.callThrough();

          await fillInAndSubmitForm('Test User', 'A1234567', 'not-a-email-address');
          fixture.detectChanges();

          expect(getByText('There is a problem')).toBeTruthy();

          expect(getAllByText('Enter the email address in the correct format, like name@example.com')).toHaveSize(2);

          expect(findUsernameService.findUserAccount).not.toHaveBeenCalled();
        });

        it('should show an error message if the said account is being locked', async () => {
          const { fixture, getByText, findUsernameService } = await setup();

          spyOn(findUsernameService, 'findUserAccount').and.returnValue(of({ status: 'AccountLocked' }));

          await fillInAndSubmitForm('Test User', 'A1234567', 'test@example.com');
          fixture.detectChanges();

          expect(getByText('There is a problem')).toBeTruthy();

          expect(
            getByText('There is a problem with your account, please contact the Support Team on 0113 241 0969'),
          ).toBeTruthy();
        });
      });
    });
  });

  describe('Find username', () => {
    const setupAndProceedToFindUsername = async () => {
      const setuptools = await setup();

      const { fixture, getByRole } = setuptools;

      userEvent.type(getByRole('textbox', { name: 'Name' }), 'Test User');
      userEvent.type(getByRole('textbox', { name: 'Workplace ID or postcode' }), 'A1234567');
      userEvent.type(getByRole('textbox', { name: 'Email address' }), 'test@example.com');

      userEvent.click(getByRole('button', { name: 'Find account' }));
      fixture.detectChanges();
      await fixture.whenStable();

      return setuptools;
    };

    describe('rendering', () => {
      it('should show the security question of the user', async () => {
        const { getByText } = await setupAndProceedToFindUsername();

        expect(getByText('Your security question')).toBeTruthy();
        expect(getByText('You entered this question when you created your account.')).toBeTruthy();
        expect(getByText('Question')).toBeTruthy();
        expect(getByText(mockTestUser.securityQuestion)).toBeTruthy();
      });

      it('should show a text input for answer', async () => {
        const { getByText, getByRole } = await setupAndProceedToFindUsername();

        expect(getByText("What's the answer to your security question?")).toBeTruthy();
        expect(getByText('Answer')).toBeTruthy();
        expect(getByRole('textbox', { name: "What's the answer to your security question?" })).toBeTruthy();
      });

      it('should show a reveal text of "Cannot remember the answer?"', async () => {
        const { getByTestId } = await setupAndProceedToFindUsername();

        const revealTextElement = getByTestId('reveal-text');
        const hiddenText = 'Call the ASC-WDS Support Team on 0113 241 0969 for help.';

        expect(revealTextElement).toBeTruthy();
        expect(within(revealTextElement).getByText('Cannot remember the answer?')).toBeTruthy();
        expect(revealTextElement.textContent).toContain(hiddenText);
      });

      it('should render a "Find username" CTA button and a "Back to sign in" link', async () => {
        const { getByRole, getByText } = await setupAndProceedToFindUsername();

        expect(getByRole('button', { name: 'Find username' })).toBeTruthy();

        const backToSignIn = getByText('Back to sign in');
        expect(backToSignIn).toBeTruthy();
        expect(backToSignIn.getAttribute('href')).toEqual('/login');
      });
    });

    describe('submit form and validation', () => {
      it('should call findUsernameService () on submit', async () => {
        const { fixture, findUsernameService, getByRole } = await setupAndProceedToFindUsername();

        spyOn(findUsernameService, 'findUsername').and.callThrough();

        userEvent.type(getByRole('textbox', { name: "What's the answer to your security question?" }), 'Blue');
        userEvent.click(getByRole('button', { name: 'Find username' }));

        fixture.detectChanges();

        expect(findUsernameService.findUsername).toHaveBeenCalledWith({
          uid: mockTestUser.accountUid,
          securityQuestionAnswer: 'Blue',
        });
      });

      it('should set the retrieved username to service and navigate to username-found page if answer is correct', async () => {
        const { fixture, getByRole, routerSpy, findUsernameService } = await setupAndProceedToFindUsername();

        userEvent.type(
          getByRole('textbox', { name: "What's the answer to your security question?" }),
          mockTestUser.securityQuestionAnswer,
        );
        userEvent.click(getByRole('button', { name: 'Find username' }));

        fixture.detectChanges();

        expect(routerSpy).toHaveBeenCalledWith(['/username-found']);
        expect(findUsernameService.usernameFound).toEqual(mockTestUser.username);
      });

      it('should show an error message if answer is incorrect', async () => {
        const { fixture, getByRole, getByText, routerSpy, findUsernameService } = await setupAndProceedToFindUsername();

        userEvent.type(
          getByRole('textbox', { name: "What's the answer to your security question?" }),
          'some wrong answer',
        );
        userEvent.click(getByRole('button', { name: 'Find username' }));

        fixture.detectChanges();

        expect(getByText('Your answer does not match the one we have for your account.')).toBeTruthy();
        expect(getByText("You've 4 more chances to get your security question right.")).toBeTruthy();

        expect(routerSpy).not.toHaveBeenCalled();
        expect(findUsernameService.usernameFound).toEqual(null);
      });

      it('should show a different error message when only 1 chance remain', async () => {
        const { fixture, getByRole, getByText, findUsernameService } = await setupAndProceedToFindUsername();
        spyOn(findUsernameService, 'findUsername').and.returnValue(of({ answerCorrect: false, remainingAttempts: 1 }));

        userEvent.type(
          getByRole('textbox', { name: "What's the answer to your security question?" }),
          'some wrong answer',
        );
        userEvent.click(getByRole('button', { name: 'Find username' }));

        fixture.detectChanges();

        expect(getByText('Your answer does not match the one we have for your account.')).toBeTruthy();
        expect(getByText("You've 1 more chance to get your security question right.")).toBeTruthy();
        expect(getByText("You'll need to call the Support Team if you get it wrong again.")).toBeTruthy();
      });

      it('should navigate to "security-question-answer-not-match" page when remaining attempts = 0', async () => {
        const { fixture, getByRole, findUsernameService, routerSpy } = await setupAndProceedToFindUsername();
        spyOn(findUsernameService, 'findUsername').and.returnValue(of({ answerCorrect: false, remainingAttempts: 0 }));

        userEvent.type(
          getByRole('textbox', { name: "What's the answer to your security question?" }),
          'some wrong answer',
        );
        userEvent.click(getByRole('button', { name: 'Find username' }));

        fixture.detectChanges();

        expect(routerSpy).toHaveBeenCalledWith(['/security-question-answer-not-match']);
      });

      describe('error', () => {
        it('should show an error message if answer is blank', async () => {
          const { fixture, getByRole, getByText, getAllByText } = await setupAndProceedToFindUsername();
          userEvent.click(getByRole('button', { name: 'Find username' }));

          fixture.detectChanges();

          expect(getByText('There is a problem')).toBeTruthy();
          expect(getAllByText('Enter the answer to your security question')).toHaveSize(2);
        });
      });
    });
  });
});
