import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { getTestBed, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BackService } from '@core/services/back.service';
import { UserService } from '@core/services/user.service';
import { WindowRef } from '@core/services/window.ref';
import { MockUserService } from '@core/test-utils/MockUserService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import { of, throwError } from 'rxjs';

import { DeleteUserAccountComponent } from './delete-user-account.component';

describe('DeleteUserAccountComponent', () => {
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
                user: { fullname: 'John Doe', uid: 'asdfg12345' },
              },
            },
          },
        },
        {
          provide: WindowRef,
          useClass: WindowRef,
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

  it('should call deleteUser api with the establishment uid and user uid', async () => {
    const { component, componentInstance } = await setup();

    const workplaceUid = componentInstance.establishment.uid;
    const userUid = componentInstance.user.uid;

    const deleteButton = component.getByText('Delete this user');

    fireEvent.click(deleteButton);
    component.fixture.detectChanges();

    const httpTestingController = TestBed.inject(HttpTestingController);
    const req = httpTestingController.expectOne(`/api/user/establishment/${workplaceUid}/${userUid}`);
    expect(req.request.body).toBeNull();
  });

  it('should navigate back to previous page when delete is successful', async () => {
    const { component, componentInstance, spy } = await setup();

    spyOn(componentInstance.userService, 'deleteUser').and.returnValue(of({}));

    const deleteButton = component.getByText('Delete this user');

    fireEvent.click(deleteButton);
    component.fixture.detectChanges();

    expect(spy).toHaveBeenCalledWith(['/workplace', '12345asdfg', 'users']);
  });

  it('should have a success alert when delete is successful', async () => {
    const { component, componentInstance } = await setup();
    spyOn(componentInstance.userService, 'deleteUser').and.returnValue(of({}));
    const alertSpy = spyOn(componentInstance.alertService, 'addAlert').and.callThrough();

    const deleteButton = component.getByText('Delete this user');

    fireEvent.click(deleteButton);
    component.fixture.detectChanges();

    expect(alertSpy).toHaveBeenCalledWith({ type: 'success', message: 'John Doe has been deleted as a user' });
  });

  it('should have an error alert when delete is unsuccessful', async () => {
    const { component, componentInstance } = await setup();
    spyOn(componentInstance.userService, 'deleteUser').and.returnValue(throwError('error'));
    const alertSpy = spyOn(componentInstance.alertService, 'addAlert').and.callThrough();

    const deleteButton = component.getByText('Delete this user');

    fireEvent.click(deleteButton);
    component.fixture.detectChanges();

    expect(alertSpy).toHaveBeenCalledWith({ type: 'warning', message: 'There was an error deleting the user' });
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
