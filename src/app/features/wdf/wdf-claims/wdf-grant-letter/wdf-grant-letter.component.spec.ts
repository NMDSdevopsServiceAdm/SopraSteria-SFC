import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { WdfGrantLetterComponent } from './wdf-grant-letter.component';

describe('WdfGrantLetterComponent', () => {
  const setup = async () => {
    const {
      fixture,
      getByText,
      getAllByText,
      getByTestId,
      queryByText,
      queryAllByText,
      queryByTestId,
      getByLabelText,
    } = await render(WdfGrantLetterComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule, BrowserModule, SharedModule, ReactiveFormsModule],
      providers: [
        {
          provide: BreadcrumbService,
          useClass: MockBreadcrumbService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                loggedInUser: {
                  fullname: 'Somebody',
                  email: 'somebody@email.com',
                },
                primaryWorkplace: {
                  name: 'Care Home 1',
                  nmdsId: 'JS123456',
                },
              },
            },
          },
        },
        FormBuilder,
        ErrorSummaryService,
      ],
    });
    const component = fixture.componentInstance;
    const injector = getTestBed();
    const router = injector.inject(Router) as Router;

    const spy = spyOn(router, 'navigate');
    spy.and.returnValue(Promise.resolve(true));

    return {
      component,
      fixture,
      getByText,
      getAllByText,
      getByTestId,
      queryByText,
      queryAllByText,
      getByLabelText,
      queryByTestId,
      spy,
    };
  };

  it('should render a WdfGrantLetterComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('Top of page paragraph and reveals', async () => {
    it('should display the workplace name and nmdsId', async () => {
      const { queryByText } = await setup();
      expect(queryByText('Care Home 1 (Workplace ID: JS123456)')).toBeTruthy();
    });

    it('should display header for grant letter ', async () => {
      const { queryByText } = await setup();
      expect(queryByText('Make and manage WDF claims')).toBeTruthy();
    });

    it('should display paragraph for grant letter page', async () => {
      const { getByTestId } = await setup();
      const paragraph = getByTestId('info');
      expect(paragraph).toBeTruthy();
    });

    it(`should display the reveal and its contents`, async () => {
      const { getByTestId } = await setup();

      const revealContent = getByTestId('reveal');

      expect(revealContent).toBeTruthy();
    });
  });

  describe('Grant Letter questions', async () => {
    it('should display grant letter question', async () => {
      const { getByText } = await setup();

      expect(getByText('Who do you want to send the grant letter to?')).toBeTruthy();
    });

    it('should display Myself for radio button', async () => {
      const { getByText } = await setup();

      expect(getByText('Myself')).toBeTruthy();
    });

    it('should display Somebody else for radio button', async () => {
      const { queryByText } = await setup();

      expect(queryByText('Somebody else in the organisation')).toBeTruthy();
    });
  });

  describe('radio buttons', () => {
    it('should not display any textboxes when neither radio button is selected', async () => {
      const { queryByTestId } = await setup();

      expect(queryByTestId('grantLetterRadio-conditional-0')).toBeFalsy();
      expect(queryByTestId('grantLetterRadio-conditional-1')).toBeFalsy();
    });

    it('should display prepopulated text boxes below myself, when selected', async () => {
      const { component, fixture, getByLabelText, getByTestId, queryByTestId } = await setup();
      const myselfRadio = getByLabelText('Myself');
      fireEvent.click(myselfRadio);
      fixture.detectChanges();

      expect(getByTestId('grantLetterRadio-conditional-0')).toBeTruthy();
      expect(queryByTestId('grantLetterRadio-conditional-1')).toBeFalsy();
      expect(component.form.value.fullName).toEqual('Somebody');
      expect(component.form.value.emailAddress).toEqual('somebody@email.com');
    });

    it('should display empty text boxes below Somebody else in the organisation, when selected', async () => {
      const { component, fixture, getByLabelText, getByTestId, queryByTestId } = await setup();

      const somebodyRadio = getByLabelText('Somebody else in the organisation');
      fireEvent.click(somebodyRadio);
      fixture.detectChanges();

      expect(getByTestId('grantLetterRadio-conditional-1')).toBeTruthy();
      expect(queryByTestId('grantLetterRadio-conditional-0')).toBeFalsy();
      expect(component.form.value.fullName).toBeNull();
      expect(component.form.value.emailAddress).toBeNull();
    });
  });

  describe('submitting form', () => {
    it('should show error message when user click submit with out selecting radio buttons', async () => {
      const { component, fixture, getAllByText, getByText } = await setup();

      const errorMessage = 'Select who you want to email the grant letter to';

      const button = getByText('Send email');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(component.form.invalid).toBeTruthy();
      expect(getAllByText(errorMessage).length).toBe(2);
    });

    it('should show 2 error messages when user click submit when the myself radio button is selected, but both inputs are empty', async () => {
      const { component, fixture, getAllByText, getByLabelText, getByText } = await setup();

      const emailErrorMessage = 'Enter an email address';
      const fullnameErrorMessage = 'Enter a full name';

      const myselfRadio = getByLabelText('Myself');
      fireEvent.click(myselfRadio);
      fixture.detectChanges();

      component.form.controls['fullName'].setValue('');
      component.form.controls['emailAddress'].setValue('');
      fixture.detectChanges();

      const button = getByText('Send email');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(component.form.invalid).toBeTruthy();
      expect(getAllByText(emailErrorMessage).length).toBe(2);
      expect(getAllByText(fullnameErrorMessage).length).toBe(2);
    });

    it('should show an email error message when user click submit when the myself radio button is selected, but email input is empty', async () => {
      const { component, fixture, getAllByText, queryAllByText, getByLabelText, getByText } = await setup();

      const emailErrorMessage = 'Enter an email address';
      const fullnameErrorMessage = 'Enter a full name';

      const myselfRadio = getByLabelText('Myself');
      fireEvent.click(myselfRadio);
      fixture.detectChanges();

      component.form.controls['emailAddress'].setValue('');
      fixture.detectChanges();

      const button = getByText('Send email');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(component.form.invalid).toBeTruthy();
      expect(getAllByText(emailErrorMessage).length).toBe(2);
      expect(queryAllByText(fullnameErrorMessage).length).toBeFalsy();
    });

    it('should show an email error message when user click submit when the myself radio button is selected, but email input is invalid', async () => {
      const { component, fixture, getAllByText, getByLabelText, getByText } = await setup();

      const emailErrorMessage = 'Enter the email address in the correct format, like name@example.com';

      const myselfRadio = getByLabelText('Myself');
      fireEvent.click(myselfRadio);
      fixture.detectChanges();

      component.form.controls['fullName'].setValue('Somebody');
      component.form.controls['emailAddress'].setValue('somebody');
      fixture.detectChanges();

      const button = getByText('Send email');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(component.form.invalid).toBeTruthy();
      expect(getAllByText(emailErrorMessage).length).toBe(2);
    });

    it('should show a name error message when user click submit when the myself radio button is selected, but name input is empty', async () => {
      const { component, fixture, getAllByText, queryAllByText, getByLabelText, getByText } = await setup();

      const emailErrorMessage = 'Enter an email address';
      const fullnameErrorMessage = 'Enter a full name';

      const myselfRadio = getByLabelText('Myself');
      fireEvent.click(myselfRadio);
      fixture.detectChanges();

      component.form.controls['fullName'].setValue('');
      fixture.detectChanges();

      const button = getByText('Send email');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(component.form.invalid).toBeTruthy();
      expect(getAllByText(fullnameErrorMessage).length).toBe(2);
      expect(queryAllByText(emailErrorMessage).length).toBeFalsy();
    });

    it('should show 2 error messages when user click submit when the somebody else radio button is selected, but both inputs are empty', async () => {
      const { component, fixture, getAllByText, getByLabelText, getByText } = await setup();

      const emailErrorMessage = 'Enter an email address';
      const fullnameErrorMessage = 'Enter a full name';

      const somebodyRadio = getByLabelText('Somebody else in the organisation');
      fireEvent.click(somebodyRadio);
      fixture.detectChanges();

      const button = getByText('Send email');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(component.form.invalid).toBeTruthy();
      expect(getAllByText(emailErrorMessage).length).toBe(2);
      expect(getAllByText(fullnameErrorMessage).length).toBe(2);
    });

    it('should show an email error message when user click submit when the somebody else radio button is selected, but email input is empty', async () => {
      const { component, fixture, getAllByText, queryAllByText, getByLabelText, getByText } = await setup();

      const emailErrorMessage = 'Enter an email address';
      const fullnameErrorMessage = 'Enter a full name';

      const somebodyRadio = getByLabelText('Somebody else in the organisation');
      fireEvent.click(somebodyRadio);
      fixture.detectChanges();

      component.form.controls['fullName'].setValue('Somebody');
      fixture.detectChanges();

      const button = getByText('Send email');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(component.form.invalid).toBeTruthy();
      expect(getAllByText(emailErrorMessage).length).toBe(2);
      expect(queryAllByText(fullnameErrorMessage).length).toBeFalsy();
    });

    it('should show an email error message when user click submit when the somebody radio button is selected, but email input is invalid', async () => {
      const { component, fixture, getAllByText, getByLabelText, getByText } = await setup();

      const emailErrorMessage = 'Enter the email address in the correct format, like name@example.com';

      const somebodyRadio = getByLabelText('Somebody else in the organisation');
      fireEvent.click(somebodyRadio);
      fixture.detectChanges();

      component.form.controls['fullName'].setValue('Somebody');
      component.form.controls['emailAddress'].setValue('somebody');
      fixture.detectChanges();

      const button = getByText('Send email');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(component.form.invalid).toBeTruthy();
      expect(getAllByText(emailErrorMessage).length).toBe(2);
    });

    it('should show a name error message when user click submit when the somebody else radio button is selected, but name input is empty', async () => {
      const { component, fixture, getAllByText, queryAllByText, getByLabelText, getByText } = await setup();

      const emailErrorMessage = 'Enter an email address';
      const fullnameErrorMessage = 'Enter a full name';

      const somebodyRadio = getByLabelText('Somebody else in the organisation');
      fireEvent.click(somebodyRadio);
      fixture.detectChanges();

      component.form.controls['emailAddress'].setValue('somebody@email.com');
      fixture.detectChanges();

      const button = getByText('Send email');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(component.form.invalid).toBeTruthy();
      expect(getAllByText(fullnameErrorMessage).length).toBe(2);
      expect(queryAllByText(emailErrorMessage).length).toBeFalsy();
    });

    it('should navigate to grant-letter-sent url when myself radio is clicked and then send email button is clicked', async () => {
      const { fixture, getByText, getByLabelText, spy } = await setup();

      const myselfRadio = getByLabelText('Myself');
      fireEvent.click(myselfRadio);
      fixture.detectChanges();

      const button = getByText('Send email');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(spy).toHaveBeenCalledWith(['wdf-claims', 'grant-letter', 'grant-letter-sent'], {
        state: { name: 'Somebody', email: 'somebody@email.com', myself: 'Myself' },
      });
    });

    it('should navigate to grant-letter-sent url when somebody else radio is clicked, the form is filled out and then send email button is clicked', async () => {
      const { component, fixture, getByText, getByLabelText, spy } = await setup();

      const somebodyRadio = getByLabelText('Somebody else in the organisation');
      fireEvent.click(somebodyRadio);
      fixture.detectChanges();

      component.form.controls['fullName'].setValue('Different Somebody');
      component.form.controls['emailAddress'].setValue('ds@email.com');
      fixture.detectChanges();

      const button = getByText('Send email');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(spy).toHaveBeenCalledWith(['wdf-claims', 'grant-letter', 'grant-letter-sent'], {
        state: { name: 'Different Somebody', email: 'ds@email.com', myself: 'Somebody else in the organisation' },
      });
    });
  });
});
