import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, within } from '@testing-library/angular';

import { Establishment } from '../../../../mockdata/establishment';
import { WorkplaceTabComponent } from './workplace-tab.component';

describe('WorkplaceTabComponent', () => {
  const setup = async () => {
    const { fixture, getByText, queryByTestId } = await render(WorkplaceTabComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(),
          deps: [HttpClient, Router, UserService],
        },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
      ],
      componentProperties: {
        workplace: Establishment,
      },
    });
    const component = fixture.componentInstance;

    return { component, fixture, getByText, queryByTestId };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display the Check CQC Details banner', async () => {
    const { component, fixture } = await setup();
    component.showCQCDetailsBanner = true;
    fixture.detectChanges();

    const checkCQCDetailsBanner = within(document.body).queryByTestId('check-cqc-details');

    expect(checkCQCDetailsBanner.innerHTML).toContain('You need to check your CQC details');
  });

  it('should not display the Check CQC Details banner', async () => {
    const { component, fixture, queryByTestId } = await setup();
    component.showCQCDetailsBanner = false;
    fixture.detectChanges();

    const checkCQCDetailsBanner = queryByTestId('check-cqc-details');

    expect(checkCQCDetailsBanner).toBeNull();
  });

  it('should display the Sharing Permissions banner', async () => {
    const { component, fixture, queryByTestId } = await setup();
    component.showSharingPermissionsBanner = true;
    fixture.detectChanges();

    const checkShowSharingPermissions = queryByTestId('check-sharing-permissions');

    expect(checkShowSharingPermissions.innerHTML).toContain('You need to review your data sharing permissions');
  });

  it('should not display the Sharing Permissions banner', async () => {
    const { component, fixture, queryByTestId } = await setup();
    component.showSharingPermissionsBanner = false;
    fixture.detectChanges();

    const checkShowSharingPermissions = queryByTestId('check-sharing-permissions');

    expect(checkShowSharingPermissions).toBeNull();
  });

  it('should navigate to the sharing data page whent the link in the permissions banner is clicked', async () => {
    const { component, fixture, getByText } = await setup();
    const routerSpy = spyOn(component.router, 'navigate');
    component.showSharingPermissionsBanner = true;
    fixture.detectChanges();

    const link = getByText('Please review your data sharing permissions');
    fireEvent.click(link);

    expect(routerSpy).toHaveBeenCalledWith(['/workplace', component.workplace.uid, 'sharing-data']);
  });

  it('should set the return url in the establishment service to the dashboard if the permission page is accessed from dashboard', async () => {
    const { component, fixture, getByText } = await setup();
    const setReturnRouteSpy = spyOn(component.establishmentService, 'setReturnTo');
    component.showSharingPermissionsBanner = true;
    fixture.detectChanges();

    const link = getByText('Please review your data sharing permissions');
    fireEvent.click(link);

    expect(setReturnRouteSpy).toHaveBeenCalledWith({ url: ['/dashboard'], fragment: 'workplace' });
  });

  it('should set the return url in the establishment service to the workplace dashboard if the permissions page is accessed from sub establishment', async () => {
    const { component, fixture, getByText } = await setup();
    const setReturnRouteSpy = spyOn(component.establishmentService, 'setReturnTo');
    component.showSharingPermissionsBanner = true;
    component.route.snapshot.params = { establishmentuid: component.workplace.uid };
    fixture.detectChanges();

    const link = getByText('Please review your data sharing permissions');
    fireEvent.click(link);

    expect(setReturnRouteSpy).toHaveBeenCalledWith({
      url: ['/workplace', component.workplace.uid],
      fragment: 'workplace',
    });
  });
});
