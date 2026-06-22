import { getTestBed } from '@angular/core/testing';
import { UserResearchInviteComponent } from './user-research-invite.component';
import { render } from '@testing-library/angular';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RegistrationService } from '@core/services/registration.service';
import { BackLinkService } from '@core/services/backLink.service';
import { SharedModule } from '@shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BackService } from '@core/services/back.service';
import { provideHttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { InviteResponse } from '@core/model/userDetails.model';
import userEvent from '@testing-library/user-event';

fdescribe('UserResearchInviteComponent', () => {
  async function setup(overrides: any = {}) {
    const showBackLinkSpy = jasmine.createSpy('setBacklink').and.returnValue(Promise.resolve(true));
    const registrationFlow = overrides?.registrationFlow ?? true;
    const mockUserResearchInviteResponse = overrides?.mockUserResearchInviteResponse ?? null;

    const mockSubject = new BehaviorSubject<InviteResponse>(mockUserResearchInviteResponse);

    const setupTools = await render(UserResearchInviteComponent, {
      imports: [SharedModule, ReactiveFormsModule, FormsModule, RouterModule],
      providers: [
        BackService,
        provideHttpClient(),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              parent: {
                url: [
                  {
                    path: registrationFlow ? 'registration' : 'confirm-details',
                  },
                ],
              },
            },
          },
        },
        {
          provide: RegistrationService,
          useValue: {
            userResearchInviteResponse$: mockSubject,
          },
        },
        {
          provide: BackLinkService,
          useValue: {
            showBackLink: showBackLinkSpy,
          },
        },
      ],
    });

    const component = setupTools.fixture.componentInstance;
    const injector = getTestBed();

    const router = injector.inject(Router) as Router;

    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    const registrationService = injector.inject(RegistrationService) as RegistrationService;
    const userResearchInviteResponseSpy = spyOn(registrationService.userResearchInviteResponse$, 'next');

    return {
      ...setupTools,
      component,
      routerSpy,
      userResearchInviteResponseSpy,
      showBackLinkSpy,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it(`displays a Back link`, async () => {
    const { showBackLinkSpy } = await setup();
    expect(showBackLinkSpy).toHaveBeenCalled();
  });

  it('should display the User accounts caption', async () => {
    const { getByTestId } = await setup();
    const caption = getByTestId('caption');
    expect(caption.textContent).toEqual('User accounts');
  });

  it('should display the heading', async () => {
    const { getByTestId } = await setup();
    const caption = getByTestId('heading');
    expect(caption.textContent).toEqual('Would you like to take part in our user research sessions?');
  });

  it('should display the text', async () => {
    const { getByTestId } = await setup();
    const textDiv = getByTestId('text');
    const textContent = [
      'We’d like your help and it doesn’t matter if you’re new to ASC-WDS.',
      'If you want to take part, select Yes so that a user researcher from our digital partner can contact you.',
    ];
    textContent.forEach((sentence) => {
      expect(textDiv.textContent).toContain(sentence);
    });
  });

  describe('Additional details toggle', () => {
    it('should display the additional details toggle', async () => {
      const { getByTestId } = await setup();
      const toggle = getByTestId('details-toggle');
      expect(toggle.textContent.trim()).toEqual('Why take part in our user research sessions?');
    });

    it('should display the hidden text', async () => {
      const detailsTextOne =
        'The feedback you give us in online user research sessions allows us ' +
        'to improve the service and provide the sector with more useful tools.';
      const detailsTextTwo = 'Sessions last about an hour and are arranged for a time that suits you.';

      const { fixture, getByTestId } = await setup();
      userEvent.click(getByTestId('details-toggle'));
      fixture.detectChanges();

      const firstDetailsParagraph = getByTestId('details-text-one');
      const secondDetailsParagraph = getByTestId('details-text-two');

      expect(firstDetailsParagraph.textContent).toContain(detailsTextOne);
      expect(secondDetailsParagraph.textContent).toContain(detailsTextTwo);
    });
  });

  describe('Radios', () => {
    it('should not preselect an option if accessing within the flow', async () => {
      const { component } = await setup();

      const form = component.form;
      expect(form.value.inviteResponse).toEqual(null);
    });

    it('should preselect the yes option if accessing from the summary page and this option was chosen previously', async () => {
      const { component } = await setup({
        registrationFlow: false,
        mockUserResearchInviteResponse: InviteResponse.Yes,
      });

      const form = component.form;
      expect(form.value.inviteResponse).toEqual(InviteResponse.Yes);
    });

    it('should preselect the no option if accessing from the summary page and this option was chosen previously', async () => {
      const { component } = await setup({
        registrationFlow: false,
        mockUserResearchInviteResponse: InviteResponse.No,
      });

      const form = component.form;
      expect(form.value.inviteResponse).toEqual(InviteResponse.No);
    });

    it('should not preselect an option if the question was not previously answered', async () => {
      const { component } = await setup({
        registrationFlow: false,
      });

      const form = component.form;
      expect(form.value.inviteResponse).toEqual(null);
    });
  });

  describe('Submit button', () => {
    describe('When viewing the page during the create account flow', () => {
      it('should display a Continue button', async () => {
        const { getByRole } = await setup();
        const button = getByRole('button', { name: 'Continue' });
        expect(button).toBeTruthy();
      });

      it('should not display a Cancel link', async () => {
        const { queryByText } = await setup();
        const button = queryByText('Cancel');
        expect(button).toBeFalsy();
      });
    });

    it('should navigate to the summary page', async () => {
      const { getByRole, routerSpy } = await setup();

      const button = getByRole('button');
      button.click();
      expect(routerSpy).toHaveBeenCalledWith(['registration/confirm-details']);
    });

    describe('When the yes radio option has been selected', () => {
      it('should call the registration service with Yes', async () => {
        const { userResearchInviteResponseSpy, getByRole } = await setup();
        const yesRadioButton = getByRole('radio', { name: 'Yes' });
        yesRadioButton.click();

        const continueButton = getByRole('button');
        continueButton.click();

        expect(userResearchInviteResponseSpy).toHaveBeenCalledWith(InviteResponse.Yes);
      });
    });

    describe('When the no radio option has been selected', () => {
      it('should call the registration service with No', async () => {
        const { userResearchInviteResponseSpy, getByRole } = await setup();
        const radioButton = getByRole('radio', { name: 'No' });
        radioButton.click();

        const continueButton = getByRole('button');
        continueButton.click();

        expect(userResearchInviteResponseSpy).toHaveBeenCalledWith(InviteResponse.No);
      });
    });

    describe('When a radio option has not been selected', () => {
      it('should not call the registration service', async () => {
        const { userResearchInviteResponseSpy, getByRole } = await setup();

        const continueButton = getByRole('button');
        continueButton.click();

        expect(userResearchInviteResponseSpy).not.toHaveBeenCalled();
      });
    });
  });

  describe('Progress bar', () => {
    it('should render the workplace and user account progress bars', async () => {
      const { getByTestId } = await setup();

      expect(getByTestId('progress-bar-1')).toBeTruthy();
      expect(getByTestId('progress-bar-2')).toBeTruthy();
    });

    it('should not render the progress bars when accessed from outside the flow', async () => {
      const { queryByTestId } = await setup({
        registrationFlow: false,
      });

      expect(queryByTestId('progress-bar-1')).toBeFalsy();
      expect(queryByTestId('progress-bar-2')).toBeFalsy();
    });
  });

  describe('When viewing the page from the summary page', () => {
    const overrides = {
      registrationFlow: false,
    };
    it('should preselect the correct option', async () => {
      const { component } = await setup(overrides);

      const form = component.form;
      expect(form.value.inviteResponse).toEqual(null);
    });

    describe('Save and return button', () => {
      it('should display', async () => {
        const { getByRole } = await setup(overrides);
        const button = getByRole('button', { name: 'Save and return' });
        expect(button).toBeTruthy();
      });
    });

    describe('Cancel link', () => {
      it('should display', async () => {
        const { getByText } = await setup(overrides);
        const link = getByText('Cancel');
        expect(link).toBeTruthy();
      });

      it('should navigate to the summary page', async () => {
        const { getByText } = await setup(overrides);
        const link = getByText('Cancel');
        expect(link.getAttribute('href')).toEqual('/registration/confirm-details');
      });
    });
  });
});
