import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Roles } from '@core/model/roles.enum';
import { AdminUsersService } from '@core/services/admin/admin-users/admin-users.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { MockAdminUsersService } from '@core/test-utils/admin/MockAdminUsersService';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { AddEditAdminUsersComponent } from './add-edit-admin-users.component';

fdescribe('AdminMenuComponent', () => {
  async function setup() {
    const { fixture, getByText, getByTestId, getByLabelText } = await render(AddEditAdminUsersComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
      providers: [
        //   {
        //     provide: ActivatedRoute,
        //     useValue: {
        //       snapshot: {
        //         url: ['/sfcadmin', 'users'],
        //         data: {
        //           adminUsers: { adminUsers: [AdminUser(), PendingAdminUser(), AdminManagerUser()] as UserDetails[] },
        //         },
        //       },
        //     },
        //   },
        {
          provide: BreadcrumbService,
          useClass: MockBreadcrumbService,
        },
        {
          provide: AdminUsersService,
          useClass: MockAdminUsersService,
        },
      ],
    });

    const component = fixture.componentInstance;

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    const adminUsersService = injector.inject(AdminUsersService) as AdminUsersService;

    return {
      component,
      fixture,
      getByText,
      getByTestId,
      getByLabelText,
      routerSpy,
      adminUsersService,
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
});
