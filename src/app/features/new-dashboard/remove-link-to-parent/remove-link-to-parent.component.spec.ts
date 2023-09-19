import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BenchmarksService } from '@core/services/benchmarks.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { MockBenchmarksService } from '@core/test-utils/MockBenchmarkService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { fireEvent, render } from '@testing-library/angular';
import { RemoveLinkToParentComponent } from './remove-link-to-parent.component';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { getTestBed } from '@angular/core/testing';
import { AlertService } from '@core/services/alert.service';
import { WindowRef } from '@core/services/window.ref';
import { of } from 'rxjs';

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
          { provide: BenchmarksService, useClass: MockBenchmarksService },
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
});
