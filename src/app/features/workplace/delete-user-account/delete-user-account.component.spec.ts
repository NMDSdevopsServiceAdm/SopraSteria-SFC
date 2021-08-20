import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AlertService } from '@core/services/alert.service';
import { BackService } from '@core/services/back.service';
import { UserService } from '@core/services/user.service';
import { MockUserService } from '@core/test-utils/MockUserService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { DeleteUserAccountComponent } from './delete-user-account.component';

fdescribe('DeleteUserAccountComponent', () => {
  async function setup() {
    const component = await render(DeleteUserAccountComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        BackService,
        {
          provide: UserService,
          useClass: MockUserService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            parent: {
              snapshot: {
                data: {
                  establishment: { uid: '12345asdfg' },
                },
              },
            },
            snapshot: {
              data: {
                user: { uid: 'asdfg12345' },
              },
            },
          },
        },
        {
          provide: AlertService,
          useValue: {
            addAlert: {},
          },
        },
      ],
    });

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const componentInstance = component.fixture.componentInstance;
    componentInstance.flow = '/workplace/asdfg12345/user/12345asdfg';

    const spy = spyOn(router, 'navigate');
    spy.and.returnValue(Promise.resolve(true));

    return {
      component,
      router,
      componentInstance,
      spy,
    };
  }

  it('should render a DeleteUserAccountComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should call deleteUser with the establishment uid and user uid', async () => {
    const { component, componentInstance } = await setup();
    const deleteUserSpy = spyOn(componentInstance.userService, 'deleteUser');

    const deleteButton = component.getByText('Delete this user');
    fireEvent.click(deleteButton);
    component.fixture.detectChanges();

    expect(deleteUserSpy).toHaveBeenCalledWith('12345asdfg', 'asdfg12345');
  });

  it('should have the correct url rendered on the cancel button to return the previous page', async () => {
    const { component } = await setup();

    const cancelButton = component.getByText('Cancel');
    component.fixture.detectChanges();

    expect(cancelButton.getAttribute('href')).toEqual('/workplace/asdfg12345/user/12345asdfg');
  });

  it('should navigate to previous page when back link is clicked', async () => {
    const { component, componentInstance } = await setup();
    const backLinkSpy = spyOn(componentInstance.backService, 'setBackLink');

    componentInstance.setBackLink();
    component.fixture.detectChanges();

    expect(backLinkSpy).toHaveBeenCalledWith({
      url: ['/workplace/asdfg12345/user/12345asdfg'],
    });
  });
});
