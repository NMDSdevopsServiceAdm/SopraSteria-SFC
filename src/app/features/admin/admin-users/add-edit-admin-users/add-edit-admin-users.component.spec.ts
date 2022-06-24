import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { AddEditAdminUsersComponent } from './add-edit-admin-users.component';

describe('AdminMenuComponent', () => {
  async function setup() {
    const { fixture, getByText, getByTestId } = await render(AddEditAdminUsersComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
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
        //   {
        //     provide: BreadcrumbService,
        //     useClass: MockBreadcrumbService,
        //   },
      ],
    });

    const component = fixture.componentInstance;

    // const injector = getTestBed();
    // const router = injector.inject(Router) as Router;
    // const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return {
      component,
      fixture,
      getByText,
      getByTestId,
      // routerSpy,
    };
  }

  it('should render a AdminUsersComponent', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });
});
