import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BackService } from '@core/services/back.service';
import { GrantLetterService } from '@core/services/wdf-claims/wdf-grant-letter.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { GrantLetterCheckDetailsComponent } from './grant-letter-check-details.component';

describe('GrantLetterCheckDetailsComponent', () => {
  const setup = async () => {
    history.pushState(
      {
        name: 'Somebody',
        email: 'somebody@email.com',
        radioSelection: 'myself',
      },
      '',
    );
    const { fixture, getByTestId, getByText } = await render(GrantLetterCheckDetailsComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule, BrowserModule, SharedModule, ReactiveFormsModule],
      providers: [
        BackService,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                primaryWorkplace: { uid: 'asdfasdf' },
              },
            },
          },
        },
      ],
    });
    const component = fixture.componentInstance;

    return {
      component,
      fixture,
      getByTestId,
      getByText,
    };
  };

  it('should render a GrantLetterCheckDetailsComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the name and email', async () => {
    const { getByTestId } = await setup();

    expect(getByTestId('name').innerHTML).toEqual('Somebody');
    expect(getByTestId('email').innerHTML).toEqual('somebody@email.com');
  });

  describe('Change link', () => {
    it('should render the change link', async () => {
      const { getByText } = await setup();

      expect(getByText('Change')).toBeTruthy();
    });

    it('should render the change link with the correct href', async () => {
      const { getByText } = await setup();

      const changeLink = getByText('Change');
      expect(changeLink.getAttribute('href')).toEqual('/wdf-claims/grant-letter');
    });
  });

  describe('Confirm and send button', () => {
    it('should call sendEmailGrantLetter when clicking the button', async () => {
      const { getByText } = await setup();

      const grantLetterService = TestBed.inject(GrantLetterService) as GrantLetterService;
      const grantLetterSpy = spyOn(grantLetterService, 'sendEmailGrantLetter').and.callThrough();

      const button = getByText('Confirm and send');
      fireEvent.click(button);

      expect(grantLetterSpy).toHaveBeenCalledWith('asdfasdf', 'Somebody', 'somebody@email.com');
    });

    it('should navigate to next page when clicking the button', async () => {
      const { getByText } = await setup();

      const router = TestBed.inject(Router) as Router;
      const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

      const button = getByText('Confirm and send');
      fireEvent.click(button);

      expect(routerSpy).toHaveBeenCalledWith(['wdf-claims', 'grant-letter', 'grant-letter-sent']);
    });
  });

  describe('setBackLink', () => {
    it('should set the back link', async () => {
      const { fixture, component } = await setup();
      const backLinkSpy = spyOn(component.backService, 'setBackLink');

      component.setBackLink();
      fixture.detectChanges();

      expect(backLinkSpy).toHaveBeenCalledWith({ url: ['wdf-claims', 'grant-letter'] });
    });
  });
});
