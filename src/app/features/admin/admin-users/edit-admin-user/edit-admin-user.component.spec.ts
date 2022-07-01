import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AdminUsersService } from '@core/services/admin/admin-users/admin-users.service';
import { AlertService } from '@core/services/alert.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { WindowRef } from '@core/services/window.ref';
import { MockAdminUsersService } from '@core/test-utils/admin/MockAdminUsersService';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { EditAdminUserComponent } from './edit-admin-user.component';

describe('EditAdminUserMenuComponent', () => {
  async function setup() {
    const { fixture, getByText, getAllByText, getByTestId, getByLabelText, queryByText } = await render(
      EditAdminUserComponent,
      {
        imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
        providers: [
          AlertService,
          WindowRef,
          {
            provide: BreadcrumbService,
            useClass: MockBreadcrumbService,
          },
          {
            provide: AdminUsersService,
            useClass: MockAdminUsersService,
          },
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: {
                data: {
                  adminUser: {
                    fullname: 'Admin User',
                    jobTitle: 'Administrator',
                    email: 'admin@email.com',
                    phone: '01234567890',
                    role: 'Admin',
                  },
                },
              },
            },
          },
        ],
      },
    );

    const component = fixture.componentInstance;

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    const adminUsersService = injector.inject(AdminUsersService) as AdminUsersService;
    const alertService = injector.inject(AlertService) as AlertService;
    const alertSpy = spyOn(alertService, 'addAlert').and.callThrough();

    return {
      component,
      fixture,
      getByText,
      getAllByText,
      getByTestId,
      getByLabelText,
      queryByText,
      routerSpy,
      adminUsersService,
      alertSpy,
    };
  }

  it('should render a EditAdminUserComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render the title, and prefill the form', async () => {
    const { component, fixture, getByText } = await setup();

    const fullnameInput = fixture.nativeElement.querySelector('input[id="fullname"]');
    const jobTitleInput = fixture.nativeElement.querySelector('input[id="jobTitle"]');
    const emailInput = fixture.nativeElement.querySelector('input[id="email"]');
    const phoneInput = fixture.nativeElement.querySelector('input[id="phone"]');
    const permissionsInput = fixture.nativeElement.querySelector('input[id="permissionsType-1"]');

    expect(getByText('Change admin user details')).toBeTruthy();
    expect(fullnameInput.value).toEqual('Admin User');
    expect(jobTitleInput.value).toEqual('Administrator');
    expect(emailInput.value).toEqual('admin@email.com');
    expect(phoneInput.value).toEqual('01234567890');
    expect(permissionsInput.checked).toBeTruthy();
    expect(component.form.value).toEqual({
      fullname: 'Admin User',
      jobTitle: 'Administrator',
      email: 'admin@email.com',
      phone: '01234567890',
      permissionsType: 'Admin',
    });
  });

  it('should render a call to action button and cancel link', async () => {
    const { getByText } = await setup();

    expect(getByText('Save and return')).toBeTruthy();
    expect(getByText('Cancel')).toBeTruthy();
  });

  xit('should render the cancel link with correct url', async () => {
    const { getByText } = await setup();

    const link = getByText('Cancel');
    expect(link.getAttribute('href')).toEqual('/sfcadmin/users');
  });

  describe('error messages', () => {
    it('should show all the required error messages if nothing is input into the form', async () => {
      const { component, fixture, getByText, getAllByText } = await setup();

      const { form } = component;
      form.get('fullname').setValue(null);
      form.get('jobTitle').setValue(null);
      form.get('email').setValue(null);
      form.get('phone').setValue(null);
      form.get('permissionsType').setValue(null);

      const button = getByText('Save and return');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(getAllByText('Enter their full name').length).toEqual(2);
      expect(getAllByText('Enter their job title').length).toEqual(2);
      expect(getAllByText('Enter an email address').length).toEqual(2);
      expect(getAllByText('Enter a phone number').length).toEqual(2);
      expect(getAllByText('Select a permission').length).toEqual(2);
    });

    it('should just show the required error message for full name when all other fields are filled out and the form is submitted', async () => {
      const { component, fixture, getByText, getAllByText, queryByText } = await setup();

      component.form.get('fullname').setValue(null);

      const button = getByText('Save and return');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(getAllByText('Enter their full name').length).toEqual(2);
      expect(queryByText('Enter their job title')).toBeFalsy();
      expect(queryByText('Enter an email addres')).toBeFalsy();
      expect(queryByText('Enter a phone number')).toBeFalsy();
      expect(queryByText('Select a permission')).toBeFalsy();
    });

    it('should just show an error message when the full name is greater than 120 characters and the form is submitted', async () => {
      const { component, fixture, getByText, getAllByText } = await setup();
      const longString =
        'ThisIsTooLongThisIsTooLongThisIsTooLongThisIsTooLongThisIsTooLongThisIsTooLongThisIsTooLongThisIsTooLongThisIsTooLongThisIsTooLong';

      component.form.get('fullname').setValue(longString);

      const button = getByText('Save and return');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(getAllByText('Full name must be 120 characters or fewer').length).toEqual(2);
    });

    it('should just show the required error message for jobTitle when all other fields are filled out and the form is submitted', async () => {
      const { component, fixture, getByText, getAllByText, queryByText } = await setup();

      component.form.get('jobTitle').setValue(null);

      const button = getByText('Save and return');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(getAllByText('Enter their job title').length).toEqual(2);
      expect(queryByText('Enter their full name')).toBeFalsy();
      expect(queryByText('Enter an email addres')).toBeFalsy();
      expect(queryByText('Enter a phone number')).toBeFalsy();
      expect(queryByText('Select a permission')).toBeFalsy();
    });

    it('should just show an error message when the job title is greater than 120 characters and the form is submitted', async () => {
      const { component, fixture, getByText, getAllByText } = await setup();
      const longString =
        'ThisIsTooLongThisIsTooLongThisIsTooLongThisIsTooLongThisIsTooLongThisIsTooLongThisIsTooLongThisIsTooLongThisIsTooLongThisIsTooLong';

      component.form.get('jobTitle').setValue(longString);

      const button = getByText('Save and return');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(getAllByText('Job title must be 120 characters or fewer').length).toEqual(2);
    });

    it('should just show the required error message for email when all other fields are filled out and the form is submitted', async () => {
      const { component, fixture, getByText, getAllByText, queryByText } = await setup();

      component.form.get('email').setValue(null);

      const button = getByText('Save and return');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(getAllByText('Enter an email address').length).toEqual(2);
      expect(queryByText('Enter their full name')).toBeFalsy();
      expect(queryByText('Enter their job title')).toBeFalsy();
      expect(queryByText('Enter a phone number')).toBeFalsy();
      expect(queryByText('Select a permission')).toBeFalsy();
    });

    it('should just show an error message when the email is greater than 120 characters and the form is submitted', async () => {
      const { component, fixture, getByText, getAllByText } = await setup();
      const longString =
        'ThisIsTooLong@ThisIsTooLongThisIsTooLongThisIsTooLongThisIsTooLongThisIsTooLongThisIsTooLongThisIsTooLongThisIsTooLongThisIsTooLong.com';

      component.form.get('email').setValue(longString);

      const button = getByText('Save and return');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(getAllByText('Email address must be 120 characters or fewer').length).toEqual(2);
    });

    it('should just show an error message when the email is not in a valid format and the form is submitted', async () => {
      const { component, fixture, getByText, getAllByText } = await setup();
      const invalidEmail = 'invalidEmailAddress';

      component.form.get('email').setValue(invalidEmail);

      const button = getByText('Save and return');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(getAllByText('Enter the email address in the correct format, like name@example.com').length).toEqual(2);
    });

    it('should just show the required error message for phone when all other fields are filled out and the form is submitted', async () => {
      const { component, fixture, getByText, getAllByText, queryByText } = await setup();

      component.form.get('phone').setValue(null);

      const button = getByText('Save and return');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(getAllByText('Enter a phone number').length).toEqual(2);
      expect(queryByText('Enter their full name')).toBeFalsy();
      expect(queryByText('Enter their job title')).toBeFalsy();
      expect(queryByText('Enter an email addres')).toBeFalsy();
      expect(queryByText('Select a permission')).toBeFalsy();
    });

    it('should just show an error message when the phone number is not in a valid format and the form is submitted', async () => {
      const { component, fixture, getByText, getAllByText } = await setup();

      const invalidPhoneNumber = 'invalidPhoneNumber';

      component.form.get('phone').setValue(invalidPhoneNumber);

      const button = getByText('Save and return');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(
        getAllByText('Enter the phone number like 01632 960 001, 07700 900 982 or +44 0808 157 0192').length,
      ).toEqual(2);
    });
  });
});
