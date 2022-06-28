import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Roles } from '@core/model/roles.enum';
import { AdminUsersService } from '@core/services/admin/admin-users/admin-users.service';
import { AlertService } from '@core/services/alert.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { WindowRef } from '@core/services/window.ref';
import { MockAdminUsersService } from '@core/test-utils/admin/MockAdminUsersService';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { AddEditAdminUsersComponent } from './add-edit-admin-users.component';

describe('AdminMenuComponent', () => {
  async function setup() {
    const { fixture, getByText, getAllByText, getByTestId, getByLabelText, queryByText } = await render(
      AddEditAdminUsersComponent,
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

  it('should render a AdminUsersComponent', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });

  it('should render the page heading, correct inputs and radios', async () => {
    const { getByText, getByLabelText } = await setup();

    expect(getByText('Add admin user details')).toBeTruthy();
    expect(getByLabelText('Full name')).toBeTruthy();
    expect(getByLabelText('Job title')).toBeTruthy();
    expect(getByLabelText('Email address')).toBeTruthy();
    expect(getByLabelText('Phone number')).toBeTruthy();
    expect(getByLabelText('Admin manager')).toBeTruthy();
    expect(getByLabelText('Admin')).toBeTruthy();
  });

  it('should render a call to action button and cancel link', async () => {
    const { getByText } = await setup();

    expect(getByText('Save admin user')).toBeTruthy();
    expect(getByText('Cancel')).toBeTruthy();
  });

  it('should render the cancel link with correct url', async () => {
    const { getByText } = await setup();

    const link = getByText('Cancel');
    expect(link.getAttribute('href')).toEqual('/sfcadmin/users');
  });

  it('should call the createAdminUser function when submitting the form', async () => {
    const { fixture, getByText, getByLabelText, adminUsersService } = await setup();
    const createAdminUserSpy = spyOn(adminUsersService, 'createAdminUser').and.callThrough();

    userEvent.type(getByLabelText('Full name'), 'Admin user');
    userEvent.type(getByLabelText('Job title'), 'Administrator');
    userEvent.type(getByLabelText('Email address'), 'admin@email.com');
    userEvent.type(getByLabelText('Phone number'), '01234567890');
    fireEvent.click(getByLabelText('Admin'));

    fireEvent.click(getByText('Save admin user'));
    fixture.detectChanges();

    expect(createAdminUserSpy).toHaveBeenCalledWith({
      fullname: 'Admin user',
      jobTitle: 'Administrator',
      email: 'admin@email.com',
      phone: '01234567890',
      role: Roles.Admin,
    });
  });

  it('should navigate back to users table after successfully submitting form', async () => {
    const { component, fixture, getByText, routerSpy, adminUsersService } = await setup();
    spyOn(adminUsersService, 'createAdminUser').and.callThrough();
    const { form } = component;

    form.markAsDirty();
    form.get('fullname').setValue('Admin user');
    form.get('jobTitle').setValue('administrator');
    form.get('email').setValue('admin@email.com');
    form.get('phone').setValue('01234567890');
    form.get('permissionsType').setValue('Admin');

    fixture.detectChanges();

    const button = getByText('Save admin user');
    fireEvent.click(button);

    expect(routerSpy).toHaveBeenCalledWith(['/sfcadmin', 'users']);
  });

  it('should show banner when an admin user is successfully added', async () => {
    const { fixture, getByText, getByLabelText, alertSpy } = await setup();

    userEvent.type(getByLabelText('Full name'), 'Admin user');
    userEvent.type(getByLabelText('Job title'), 'Administrator');
    userEvent.type(getByLabelText('Email address'), 'admin@email.com');
    userEvent.type(getByLabelText('Phone number'), '01234567890');
    fireEvent.click(getByLabelText('Admin'));

    fireEvent.click(getByText('Save admin user'));
    fixture.detectChanges();

    expect(alertSpy).toHaveBeenCalledWith({
      type: 'success',
      message: 'Admin user has been added',
    });
  });

  describe('error messages', () => {
    it('should show all the required error messages if nothing is input into the form', async () => {
      const { fixture, getByText, getAllByText } = await setup();

      const button = getByText('Save admin user');
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

      const { form } = component;
      form.markAsDirty();
      form.get('jobTitle').setValue('administrator');
      form.get('email').setValue('admin@email.com');
      form.get('phone').setValue('01234567890');
      form.get('permissionsType').setValue('Admin');

      const button = getByText('Save admin user');
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
      const { form } = component;
      form.markAsDirty();
      form.get('fullname').setValue(longString);
      form.get('jobTitle').setValue('administrator');
      form.get('email').setValue('admin@email.com');
      form.get('phone').setValue('01234567890');
      form.get('permissionsType').setValue('Admin');

      const button = getByText('Save admin user');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(getAllByText('Full name must be 120 characters or fewer').length).toEqual(2);
    });

    it('should just show the required error message for jobTitle when all other fields are filled out and the form is submitted', async () => {
      const { component, fixture, getByText, getAllByText, queryByText } = await setup();

      const { form } = component;
      form.markAsDirty();
      form.get('fullname').setValue('Admin User');
      form.get('email').setValue('admin@email.com');
      form.get('phone').setValue('01234567890');
      form.get('permissionsType').setValue('Admin');

      const button = getByText('Save admin user');
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
      const { form } = component;
      form.markAsDirty();
      form.get('fullname').setValue('Admin User');
      form.get('jobTitle').setValue(longString);
      form.get('email').setValue('admin@email.com');
      form.get('phone').setValue('01234567890');
      form.get('permissionsType').setValue('Admin');

      const button = getByText('Save admin user');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(getAllByText('Job title must be 120 characters or fewer').length).toEqual(2);
    });

    it('should just show the required error message for email when all other fields are filled out and the form is submitted', async () => {
      const { component, fixture, getByText, getAllByText, queryByText } = await setup();

      const { form } = component;
      form.markAsDirty();
      form.get('fullname').setValue('Admin User');
      form.get('jobTitle').setValue('administrator');
      form.get('phone').setValue('01234567890');
      form.get('permissionsType').setValue('Admin');

      const button = getByText('Save admin user');
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
      const { form } = component;
      form.markAsDirty();
      form.get('fullname').setValue('Admin User');
      form.get('jobTitle').setValue('administrator');
      form.get('email').setValue(longString);
      form.get('phone').setValue('01234567890');
      form.get('permissionsType').setValue('Admin');

      const button = getByText('Save admin user');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(getAllByText('Email address must be 120 characters or fewer').length).toEqual(2);
    });

    it('should just show an error message when the email is not in a valid format and the form is submitted', async () => {
      const { component, fixture, getByText, getAllByText } = await setup();

      const invalidEmail = 'invalidEmailAddress';

      const { form } = component;
      form.markAsDirty();
      form.get('fullname').setValue('Admin User');
      form.get('jobTitle').setValue('administrator');
      form.get('email').setValue(invalidEmail);
      form.get('phone').setValue('01234567890');
      form.get('permissionsType').setValue('Admin');

      const button = getByText('Save admin user');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(getAllByText('Enter the email address in the correct format, like name@example.com').length).toEqual(2);
    });

    it('should just show the required error message for phone when all other fields are filled out and the form is submitted', async () => {
      const { component, fixture, getByText, getAllByText, queryByText } = await setup();

      const { form } = component;
      form.markAsDirty();
      form.get('fullname').setValue('Admin User');
      form.get('jobTitle').setValue('administrator');
      form.get('email').setValue('admin@email.com');
      form.get('permissionsType').setValue('Admin');

      const button = getByText('Save admin user');
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

      const { form } = component;
      form.markAsDirty();
      form.get('fullname').setValue('Admin User');
      form.get('jobTitle').setValue('administrator');
      form.get('email').setValue('admin@email.com');
      form.get('phone').setValue(invalidPhoneNumber);
      form.get('permissionsType').setValue('Admin');

      const button = getByText('Save admin user');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(
        getAllByText('Enter the phone number like 01632 960 001, 07700 900 982 or +44 0808 157 0192').length,
      ).toEqual(2);
    });

    it('should just show the required error message for permissionsType when all other fields are filled out and the form is submitted', async () => {
      const { component, fixture, getByText, getAllByText, queryByText } = await setup();

      const { form } = component;
      form.markAsDirty();
      form.get('fullname').setValue('Admin User');
      form.get('jobTitle').setValue('administrator');
      form.get('email').setValue('admin@email.com');
      form.get('phone').setValue('01234567890');

      const button = getByText('Save admin user');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(getAllByText('Select a permission').length).toEqual(2);
      expect(queryByText('Enter their full name')).toBeFalsy();
      expect(queryByText('Enter their job title')).toBeFalsy();
      expect(queryByText('Enter an email addres')).toBeFalsy();
      expect(queryByText('Enter a phone number')).toBeFalsy();
    });
  });
});
