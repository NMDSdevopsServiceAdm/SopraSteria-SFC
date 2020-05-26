import { SharedModule } from '@shared/shared.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { render, within } from '@testing-library/angular';
import { getTestBed } from '@angular/core/testing';
import { spy } from 'sinon';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { WindowRef } from '@core/services/window.ref';
import { Observable } from 'rxjs/Observable';
import {
  AdminUnlockConfirmationDialogComponent,
} from '@shared/components/link-to-parent-cancel copy/admin-unlock-confirmation';
import { DialogService } from '@core/services/dialog.service';
import { Overlay } from '@angular/cdk/overlay';

import { SearchComponent } from './search.component';

const testUsername = 'Mary Poppins';
const testOrgname = 'Fawlty Towers';
const testEstablishmentUid = '9efce151-6167-4e99-9cbf-0b9f8ab987fa';
const testWorkplaceId = 'B1234567';
const results = [
  {
    uid: testEstablishmentUid,
    name: testOrgname,
    nmdsId: testWorkplaceId,
    username: testUsername,
    establishment: {
      uid: testEstablishmentUid,
      name: testOrgname
    }
  }
];

fdescribe('SearchComponent', () => {

  async function setupForSwitchWorkplace() {
    const component = await getSearchComponent();
    const authToken = 'This is an auth token';
    const swappedEstablishmentData = {
      headers: {
        get: (header) => { return header === 'authorization' ? authToken : null; }
      },
      body: {
        establishment: {
          uid: testEstablishmentUid
        },
      }
    };
    //const httpPost = spyOn(component.fixture.componentInstance.switchWorkplaceService.http, 'post').and.returnValue(of(swappedEstablishmentData));
    const httpPost = spyOn(component.fixture.componentInstance.http, 'post').and.returnValue(of(swappedEstablishmentData));
    const workplace = { uid: testEstablishmentUid };
    spyOn(Observable.prototype, 'pipe').and.returnValue(of(workplace));
    const notificationData = [{ dummyNotification: 'I am a notification' }, { dummyNotification: 'I am another notification' }];  
    //spyOn(component.fixture.componentInstance.switchWorkplaceService.notificationsService, 'getAllNotifications').and.returnValue(of(notificationData));
    spyOn(component.fixture.componentInstance.notificationsService, 'getAllNotifications').and.returnValue(of(notificationData));
    results[0].username = testUsername;

    return {
      component,
      authToken,
      workplace,
      notificationData,
      httpPost
    };
  }

  async function getSearchComponent() {
    const form = { type: 'establishments' };
    const template = null;
    return render(SearchComponent, {
      template: './search.component.html',
      imports: [
        ReactiveFormsModule,
        HttpClientTestingModule,
        SharedModule,
        RouterTestingModule],
      providers: [
        {
          provide: WindowRef,
          useClass: WindowRef
        },
        DialogService,
        AdminUnlockConfirmationDialogComponent,
        Overlay,
      ],
      componentProperties: {
        results,
        form
      },
    });
  }

  it('should create', async() => {
    // Act
    const component = await getSearchComponent();
    
    // Assert
    expect(component).toBeTruthy();
  });

  it('should load workplace-specific notifications if user name not populated when switching to new workplace.', async () => {
    // Arrange
    const { component } = await setupForSwitchWorkplace();
    results[0].username = null;
    const notificationData = { dummyNotification: 'I am a notification' };
    //const httpGet = spyOn(component.fixture.componentInstance.switchWorkplaceService.http, 'get').and.returnValue(of(notificationData));
    //const notificationsNext = spyOn(component.fixture.componentInstance.switchWorkplaceService.notificationsService.notifications$, 'next').and.callThrough();
    const httpGet = spyOn(component.fixture.componentInstance.http, 'get').and.returnValue(of(notificationData));
    const notificationsNext = spyOn(component.fixture.componentInstance.notificationsService.notifications$, 'next').and.callThrough();

    // Act
    component.getByText(testOrgname).click();
    component.fixture.detectChanges();

    // Assert
    expect(httpGet).toHaveBeenCalledWith(`/api/user/swap/establishment/notification/${results[0].nmdsId}`);
    expect(notificationsNext).toHaveBeenCalledWith(notificationData);
  });

  it('should clear permissions when switching to new workplace', async () => {
    const { component } = await setupForSwitchWorkplace();
    //const clearPermissions = spyOn(component.fixture.componentInstance.switchWorkplaceService.permissionsService, 'clearPermissions').and.callThrough();
    const clearPermissions = spyOn(component.fixture.componentInstance.permissionsService, 'clearPermissions').and.callThrough();
    
    // Act
    component.getByText(testOrgname).click();
    component.fixture.detectChanges();

    // Assert
    expect(clearPermissions).toHaveBeenCalled();
  });

  it('should change auth tokens when switching to new workplace', async () => {
    const { component, authToken } = await setupForSwitchWorkplace();
    //const setPreviousToken = spyOn(component.fixture.componentInstance.switchWorkplaceService.authService, 'setPreviousToken').and.callThrough();
    const setPreviousToken = spyOn(component.fixture.componentInstance.authService, 'setPreviousToken').and.callThrough();
    
    // Act
    component.getByText(testOrgname).click();
    component.fixture.detectChanges();

    // Assert
    expect(setPreviousToken).toHaveBeenCalled();
    //expect(component.fixture.componentInstance.switchWorkplaceService.authService.token).toEqual(authToken);
    expect(component.fixture.componentInstance.authService.token).toEqual(authToken);
  });

  it('should swap establishments when switching to new workplace', async () => {
    const { component, httpPost } = await setupForSwitchWorkplace();
    
    // Act
    component.getByText(testOrgname).click();
    component.fixture.detectChanges();

    // Assert
    expect(httpPost).toHaveBeenCalledWith('/api/user/swap/establishment/' + results[0].uid, {username: results[0].username}, { observe: 'response' });
  });

  it('should load workplace notifications when switching to new workplace', async () => {
    const { component, notificationData } = await setupForSwitchWorkplace();
    //const notificationsNext = spyOn(component.fixture.componentInstance.switchWorkplaceService.notificationsService.notifications$, 'next').and.callThrough();
    const notificationsNext = spyOn(component.fixture.componentInstance.notificationsService.notifications$, 'next').and.callThrough();
    
    // Act
    component.getByText(testOrgname).click();
    component.fixture.detectChanges();

    // Assert
    expect(notificationsNext).toHaveBeenCalledWith(notificationData);
  });

  it('should switch current workplace Id when switching to new workplace', async () => {
    const { component, workplace } = await setupForSwitchWorkplace();
    //const setState = spyOn(component.fixture.componentInstance.switchWorkplaceService.establishmentService, 'setState').and.callThrough();
    //const setPrimaryWorkplace = spyOn(component.fixture.componentInstance.switchWorkplaceService.establishmentService, 'setPrimaryWorkplace').and.callThrough();
    const setState = spyOn(component.fixture.componentInstance.establishmentService, 'setState').and.callThrough();
    const setPrimaryWorkplace = spyOn(component.fixture.componentInstance.establishmentService, 'setPrimaryWorkplace').and.callThrough();
    
    // Act
    component.getByText(testOrgname).click();
    component.fixture.detectChanges();

    // Assert
    expect(setState).toHaveBeenCalledWith(workplace);
    expect(setPrimaryWorkplace).toHaveBeenCalledWith(workplace);
    //expect(component.fixture.componentInstance.switchWorkplaceService.establishmentService.establishmentId).toEqual(testEstablishmentUid);
    expect(component.fixture.componentInstance.establishmentService.establishmentId).toEqual(testEstablishmentUid);
  });

  it('should navigate back to dashboard after switching to new workplace', async () => {
    const { component } = await setupForSwitchWorkplace();
    //const navigate = spyOn(component.fixture.componentInstance.switchWorkplaceService.router, 'navigate').and.callThrough();
    const navigate = spyOn(component.fixture.componentInstance.router, 'navigate').and.callThrough();
    
    // Act
    component.getByText(testOrgname).click();
    component.fixture.detectChanges();

    // Assert
    expect(navigate).toHaveBeenCalledWith(['/dashboard']);
  });
});
