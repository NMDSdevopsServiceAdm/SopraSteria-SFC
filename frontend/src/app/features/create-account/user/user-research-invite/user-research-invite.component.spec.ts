import { getTestBed } from '@angular/core/testing';
import { UserResearchInviteComponent } from './user-research-invite.component';
import { render } from '@testing-library/angular';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RegistrationService} from '@core/services/registration.service';
import { BackLinkService } from '@core/services/backLink.service';
import { SharedModule } from '@shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BackService } from '@core/services/back.service';
import { provideHttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

describe('UserResearchInviteComponent', () => {
  async function setup(registrationFlow = true, mockResponse = null) {
    const mockSubject = new BehaviorSubject<boolean>(mockResponse);

    const setupTools = await render(UserResearchInviteComponent,
      {
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
        ],
      },
    );

    const component = setupTools.fixture.componentInstance;
    const injector = getTestBed();

    const router = injector.inject(Router) as Router;

    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    const registrationService = injector.inject(RegistrationService) as RegistrationService;
    const backLinkService = injector.inject(BackLinkService) as BackLinkService;
    const showBackLinkSpy = spyOn(backLinkService, 'showBackLink');
    const userResearchInviteResponseSpy = spyOn(registrationService.userResearchInviteResponse$, 'next')

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
    const { component, showBackLinkSpy } = await setup();
    component.ngOnInit();
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
    const text = getByTestId('text')
    const textContent =
      'We’d like your help and it doesn’t matter if you’re new to ASC-WDS.' +
      'If you want to take part, select Yes so that a user researcher from our digital partner can contact you.'
    expect(text.textContent.trim()).toEqual(textContent);
  });

  describe('Additional details toggle', () => {
    it('should display the additional details toggle', async () => {
      const { getByTestId } = await setup();
      const toggle = getByTestId('details-toggle');
      expect(toggle.textContent.trim()).toEqual(
        'Why take part in our user research sessions?',
      );
    });

    it('should display the hidden text', async () => {
      const { component, fixture, getByTestId } = await setup();
      getByTestId('details-toggle').click();
      fixture.detectChanges();
      const firstDetailsParagraph = getByTestId("details-text-one")
      const secondDetailsParagraph = getByTestId("details-text-two")

      expect(firstDetailsParagraph.textContent.trim()).toEqual(component.detailsTextOne);
      expect(secondDetailsParagraph.textContent.trim()).toEqual(component.detailsTextTwo);
    });
  })

  describe('Radios', () => {
    it('should not preselect an option if accessing within the flow', async () => {
      const { component } = await setup();

      const form = component.form;
      expect(form.value.inviteResponse).toEqual(null);
    });

    it('should preselect the yes option if accessing from the summary page and this option was chosen previously', async () => {
      const { component } = await setup(false, true);

      const form = component.form;
      expect(form.value.inviteResponse).toEqual('yes');
    });

    it('should preselect the no option if accessing from the summary page and this option was chosen previously', async () => {
      const { component } = await setup(false, false);

      const form = component.form;
      expect(form.value.inviteResponse).toEqual('no');
    });

    it('should not preselect an option if the question was not previously answered', async () => {
      const { component } = await setup(false, null);

      const form = component.form;
      expect(form.value.inviteResponse).toEqual(null);
    });
  })

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
    })

    it('should navigate to the summary page', async () => {
      const { getByRole, routerSpy } = await setup();

      const button = getByRole('button');
      button.click();
      expect(routerSpy).toHaveBeenCalledWith(['registration/confirm-details']);
    })

    describe('When the yes radio option has been selected', () => {
      it('should call the registration service with true', async () => {
        const { userResearchInviteResponseSpy, getByRole } = await setup();
        const yesRadioButton = getByRole('radio', { name: 'Yes' });
        yesRadioButton.click();

        const continueButton = getByRole('button');
        continueButton.click();

        expect(userResearchInviteResponseSpy).toHaveBeenCalledWith(true);
      })

    })

    describe('When the no radio option has been selected', () => {
      it('should call the registration service with false', async () => {
        const { userResearchInviteResponseSpy, getByRole } = await setup();
        const yesRadioButton = getByRole('radio', { name: 'No' });
        yesRadioButton.click();

        const continueButton = getByRole('button');
        continueButton.click();

        expect(userResearchInviteResponseSpy).toHaveBeenCalledWith(false);
      })
    })

    describe('When a radio option has not been selected', () => {
      it('should not call the registration service', async () => {
        const { userResearchInviteResponseSpy, getByRole } = await setup();

        const continueButton = getByRole('button');
        continueButton.click();

        expect(userResearchInviteResponseSpy).not.toHaveBeenCalled();
      })
    })
  })

  describe('When viewing the page from the summary page', () => {
    it('should preselect the correct option', async () => {
      const { component } = await setup(false);

      const form = component.form;
      expect(form.value.inviteResponse).toEqual(null);
    });

    describe('Save and return button', () => {
      it('should display', async () => {
        const { getByRole } = await setup(false);
        const button = getByRole('button', { name: 'Save and return' });
        expect(button).toBeTruthy();
      });
    })

    describe('Cancel link', () => {
      it('should display', async () => {
        const { getByText } = await setup(false);
        const link = getByText('Cancel');
        expect(link).toBeTruthy();
      });

      it('should navigate to the summary page', async () => {
        const { getByText } = await setup(false);
        const link = getByText('Cancel');
        expect(link.getAttribute('href')).toEqual('/registration/confirm-details');
      });
    })
  });
})
