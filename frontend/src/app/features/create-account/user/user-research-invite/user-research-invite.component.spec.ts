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

describe('UserResearchInviteComponent', () => {
  async function setup(registrationFlow = true) {
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
  })

  describe('Additional details toggle', ()=> {
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
  })

  describe('Submit button', () => {
    describe('When viewing the page during the create account flow', () => {
      it('should display a Continue button', async () => {
        const { getByRole } = await setup();
        const button = getByRole('button', { name: 'Continue' });
        expect(button).toBeTruthy();
      })
    })

    it('should navigate to the summary page', async () => {
      const { getByRole, routerSpy } = await setup();

      const button = getByRole('button');
      button.click();
      expect(routerSpy).toHaveBeenCalledWith(['registration/confirm-details']);
    })

    describe('When a radio option has been selected', () => {
      it('should call the registration service with the value selected', async () => {
        const { userResearchInviteResponseSpy, getByRole } = await setup();
        const yesRadioButton = getByRole('radio', { name: 'Yes' });
        yesRadioButton.click();

        const continueButton = getByRole('button');
        continueButton.click();

        expect(userResearchInviteResponseSpy).toHaveBeenCalledWith('yes');
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
});

