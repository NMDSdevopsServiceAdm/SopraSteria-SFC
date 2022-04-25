import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BackService } from '@core/services/back.service';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { CannotCreateAccountComponent } from './cannot-create-account.component';

describe('CannotCreateAccountComponent', () => {
  async function setup(returnTo = '', flow = 'registration') {
    returnTo ? history.pushState({ returnTo }, '') : history.replaceState({}, '');

    const { fixture, getByTestId } = await render(CannotCreateAccountComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        BackService,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: { flow },
            },
          },
        },
      ],
    });

    const component = fixture.componentInstance;

    return { component, getByTestId };
  }

  it('should render the CannotCreateAccountComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('create account', () => {
    it('should render the correct heading', async () => {
      const { getByTestId } = await setup('registration');
      const expectedHeading = 'We cannot create an account for you at the moment';

      expect(getByTestId('heading').textContent).toEqual(expectedHeading);
    });

    it('should render the correct first paragraph', async () => {
      const { getByTestId } = await setup('registration');
      const createAccountParagraphText = 'create an account';

      expect(getByTestId('firstParagraph').textContent).toContain(createAccountParagraphText);
    });

    describe('setBackLink()', () => {
      it('should set the back link to the create-account url when no returnTo state is passed, while in the registration flow', async () => {
        const { component } = await setup();
        const backLinkSpy = spyOn(component.backService, 'setBackLink');

        component.setBackLink();

        expect(backLinkSpy).toHaveBeenCalledWith({ url: ['registration/create-account'] });
      });

      it('should set the back link to the your-workplace url when returnTo state is set to registration/your-workplace, while in the registration flow', async () => {
        const { component } = await setup('registration/your-workplace');
        const backLinkSpy = spyOn(component.backService, 'setBackLink');

        component.setBackLink();

        expect(backLinkSpy).toHaveBeenCalledWith({ url: ['registration/your-workplace'] });
      });

      it('should set the back link to the select-workplace url when returnTo state is set to registration/your-workplace, while in the registration flow', async () => {
        const { component } = await setup('registration/select-workplace');
        const backLinkSpy = spyOn(component.backService, 'setBackLink');

        component.setBackLink();

        expect(backLinkSpy).toHaveBeenCalledWith({ url: ['registration/select-workplace'] });
      });
    });
  });

  describe('add workplace', () => {
    it('should render the correct heading', async () => {
      const { getByTestId } = await setup('', 'add-workplace');
      const expectedHeading = 'You cannot add this workplace at the moment';

      expect(getByTestId('heading').textContent).toEqual(expectedHeading);
    });

    it('should render the correct first paragraph', async () => {
      const { getByTestId } = await setup('', 'add-workplace');
      const addWorkplaceParagraphText = 'add a new workplace';

      expect(getByTestId('firstParagraph').textContent).toContain(addWorkplaceParagraphText);
    });

    describe('setBackLink()', () => {
      it('should set the back link to the workplace/view-all-workplaces url when no returnTo state is passed, while in the add-workplace flow', async () => {
        const { component } = await setup('', 'add-workplace');
        const backLinkSpy = spyOn(component.backService, 'setBackLink');

        component.setBackLink();

        expect(backLinkSpy).toHaveBeenCalledWith({ url: ['workplace/view-all-workplaces'] });
      });

      it('should set the back link to the your-workplace url when returnTo state is set to add-workplace/your-workplace, while in the registration flow', async () => {
        const { component } = await setup('add-workplace/your-workplace', 'add-workplace');
        const backLinkSpy = spyOn(component.backService, 'setBackLink');

        component.setBackLink();

        expect(backLinkSpy).toHaveBeenCalledWith({ url: ['add-workplace/your-workplace'] });
      });

      it('should set the back link to the select-workplace url when returnTo state is set to add-workplace/your-workplace, while in the registration flow', async () => {
        const { component } = await setup('add-workplace/select-workplace', 'add-workplace');
        const backLinkSpy = spyOn(component.backService, 'setBackLink');

        component.setBackLink();

        expect(backLinkSpy).toHaveBeenCalledWith({ url: ['add-workplace/select-workplace'] });
      });
    });
  });
});
