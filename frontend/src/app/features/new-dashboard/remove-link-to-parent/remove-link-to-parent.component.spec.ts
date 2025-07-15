import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed, TestBed } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AlertService } from '@core/services/alert.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { WindowRef } from '@core/services/window.ref';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import { of } from 'rxjs';

import { Establishment } from '../../../../mockdata/establishment';
import { RemoveLinkToParentComponent } from './remove-link-to-parent.component';

describe('RemoveLinkToParentComponent', () => {
  async function setup() {
    const { getByRole, getByText, getByLabelText, getByTestId, fixture, getAllByText } = await render(
      RemoveLinkToParentComponent,
      {
        imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
        declarations: [],
        providers: [
          AlertService,
          WindowRef,
          { provide: PermissionsService, useClass: MockPermissionsService },
          {
            provide: BreadcrumbService,
            useClass: MockBreadcrumbService,
          },
          {
            provide: EstablishmentService,
            useClass: MockEstablishmentService,
          },
          {
            provide: FeatureFlagsService,
            useClass: MockFeatureFlagsService,
          },
        ],
        componentProperties: {},
      },
    );
    const component = fixture.componentInstance;

    const injector = getTestBed();

    const establishmentService = injector.inject(EstablishmentService) as EstablishmentService;

    const router = injector.inject(Router) as Router;

    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    const alertService = TestBed.inject(AlertService);
    const alertServiceSpy = spyOn(alertService, 'addAlert').and.callThrough();

    return {
      getByRole,
      getByText,
      getByLabelText,
      getByTestId,
      fixture,
      component,
      router,
      establishmentService,
      routerSpy,
      getAllByText,
      alertServiceSpy,
    };
  }

  const mockparentsWithPostCode = [
    {
      parentName: 'Test 1',
      parentNameAndPostalcode: 'Test 1, BD20 9LY',
      postcode: 'BD20 9LY',
      uid: 'test-id-1',
    },
    {
      parentName: 'Test 2',
      parentNameAndPostalcode: 'Test 2, L20 9LY',
      postcode: 'L20 9LY',
      uid: 'test-id-2',
    },
  ];

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the workplace name', async () => {
    const { component, getByText } = await setup();
    const workplaceName = component.workplace.name;

    expect(getByText(workplaceName)).toBeTruthy();
  });

  it('should show the heading', async () => {
    const { getByRole } = await setup();

    const heading = getByRole('heading', {
      name: /remove the link to your parent workplace/i,
    });

    expect(heading).toBeTruthy();
  });

  it('should show the remove the link button', async () => {
    const { getByText } = await setup();

    const removeTheLinkButton = getByText('Remove the link');

    expect(removeTheLinkButton).toBeTruthy();
  });

  it('should call getAllParentWithPostCode', async () => {
    const { establishmentService, component } = await setup();
    const establishmentServiceSpy = spyOn(establishmentService, 'getAllParentWithPostCode').and.callThrough();
    component.ngOnInit();
    expect(establishmentServiceSpy).toHaveBeenCalledWith();
  });

  it('should set the parent postcode', async () => {
    const { fixture, component, establishmentService } = await setup();

    const getAllParentWithPostCodeSpy = spyOn(establishmentService, 'getAllParentWithPostCode').and.returnValue(
      of(mockparentsWithPostCode),
    );

    component.ngOnInit();
    const parentUid = 'test-id-1';

    component.workplace.parentUid = parentUid;
    fixture.detectChanges();
    component.getParentPostcode(mockparentsWithPostCode);

    expect(getAllParentWithPostCodeSpy).toHaveBeenCalled();
    expect(component.parentPostcode).toBe('BD20 9LY');
  });

  it('should call removeParentAssociation', async () => {
    const { getByText, fixture, establishmentService, component } = await setup();
    const getAllParentWithPostCodeSpy = spyOn(establishmentService, 'getAllParentWithPostCode').and.returnValue(
      of(mockparentsWithPostCode),
    );
    const removeParentAssociationSpy = spyOn(establishmentService, 'removeParentAssociation').and.callThrough();
    component.ngOnInit();

    expect(getAllParentWithPostCodeSpy).toHaveBeenCalled();

    const workplaceUid = component.workplace.uid;
    const parentUid = 'test-id-1';

    component.workplace.parentUid = parentUid;

    fixture.detectChanges();

    const removeTheLinkButton = getByText('Remove the link');
    fireEvent.click(removeTheLinkButton);

    fixture.detectChanges();

    expect(removeParentAssociationSpy).toHaveBeenCalledWith(workplaceUid, {
      parentWorkplaceUId: parentUid,
    });
  });

  it('should show the cancel link with the correct href back to the home tab', async () => {
    const { getByText } = await setup();

    const cancelLink = getByText('Cancel');

    expect(cancelLink).toBeTruthy();
    expect(cancelLink.getAttribute('href')).toEqual('/dashboard');
  });

  it('should navigate to the home tab after parent association has been removed', async () => {
    const { getByText, fixture, establishmentService, component, routerSpy, alertServiceSpy } = await setup();

    spyOn(establishmentService, 'getAllParentWithPostCode').and.returnValue(of(mockparentsWithPostCode));
    component.ngOnInit();

    const workplaceUid = component.workplace.uid;
    const parentUid = 'test-id-1';

    component.workplace.parentUid = parentUid;
    component.workplace.parentName = mockparentsWithPostCode[0].parentName;
    component.workplace.postcode = mockparentsWithPostCode[0].postcode;
    fixture.detectChanges();

    component.getParentPostcode(mockparentsWithPostCode);

    const removeParentAssociationSpy = spyOn(establishmentService, 'removeParentAssociation').and.returnValue(
      of(mockparentsWithPostCode) as Establishment,
    );

    const removeTheLinkButton = getByText('Remove the link');
    fireEvent.click(removeTheLinkButton);

    expect(removeParentAssociationSpy).toHaveBeenCalledWith(workplaceUid, {
      parentWorkplaceUId: parentUid,
    });

    expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], {
      state: {
        removeLinkToParentSuccess: true,
      },
    });

    fixture.whenStable().then(() => {
      expect(alertServiceSpy).toHaveBeenCalledWith({
        type: 'success',
        message: `You've removed your link to ${mockparentsWithPostCode[0].parentName}, ${mockparentsWithPostCode[0].postcode}`,
      });
    });
  });
});
