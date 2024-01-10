import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { WindowRef } from '@core/services/window.ref';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockBulkUploadService } from '@core/test-utils/MockBulkUploadService';
import { MockDataChangeService } from '@core/test-utils/MockDataChangesService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { HomeTabComponent } from '@features/dashboard/home-tab/home-tab.component';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { AdminSkipService } from '../admin-skip.service';
import { BulkUploadDownloadCurrentDataComponent } from '../bulk-upload-sidebar/bulk-upload-download-current-data/bulk-upload-download-current-data.component';
import { BulkUploadSanitiseDataCheckboxComponent } from '../bulk-upload-sidebar/bulk-upload-sanitise-data-checkbox/bulk-upload-sanitise-data-checkbox.component';
import { CodesAndGuidanceComponent } from '../codes-and-guidance/codes-and-guidance.component';
import { DragAndDropFilesListComponent } from '../drag-and-drop-files-list/drag-and-drop-files-list.component';
import { DragAndDropFilesUploadComponent } from '../drag-and-drop-files-upload/drag-and-drop-files-upload.component';
import { BulkUploadPageComponent } from './bulk-upload-page.component';

describe('BulkUploadPageComponent', () => {
  const dataChange = MockDataChangeService.dataChangeFactory();
  const dataChangeLastUpdated = MockDataChangeService.dataChangeLastUpdatedFactory();

  async function setup(role = 'AdminManager') {
    const { fixture, getByTestId, queryByTestId } = await render(BulkUploadPageComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        {
          provide: WindowRef,
          useClass: WindowRef,
        },
        { provide: FeatureFlagsService, useClass: MockFeatureFlagsService },
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory([], true),
          deps: [HttpClient, Router, UserService],
        },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: BreadcrumbService,
          useClass: MockBreadcrumbService,
        },
        {
          provider: BulkUploadService,
          useClass: MockBulkUploadService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                loggedInUser: { role },
                dataChange,
                dataChangeLastUpdated,
              },
            },
          },
        },
        AdminSkipService,
      ],
      declarations: [
        HomeTabComponent,
        DragAndDropFilesUploadComponent,
        BulkUploadDownloadCurrentDataComponent,
        CodesAndGuidanceComponent,
        DragAndDropFilesListComponent,
        BulkUploadSanitiseDataCheckboxComponent,
      ],
    });

    const injector = getTestBed();
    const establishmentService = injector.inject(EstablishmentService) as EstablishmentService;
    const permissionsService = injector.inject(PermissionsService) as PermissionsService;

    const component = fixture.componentInstance;
    return {
      component,
      fixture,
      getByTestId,
      queryByTestId,
      establishmentService,
      permissionsService,
    };
  }
  it('should render a BulkUploadPageComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show last bulk upload date in first P', async () => {
    const { component, fixture } = await setup();
    component.establishment.lastBulkUploaded = '2021-01-04T14:42:03.540Z';
    fixture.detectChanges(true);
    const p: HTMLElement = fixture.nativeElement.querySelector('p');
    expect(p.innerText).toEqual('Last bulk upload 4 January 2021');
  });

  it('should NOT show last bulk upload date in first P when no bulk upload date', async () => {
    const { component, fixture } = await setup();
    component.establishment.lastBulkUploaded = null;
    fixture.detectChanges(true);
    const p: HTMLElement = fixture.nativeElement.querySelector('p');
    expect(p.innerText).not.toContain('Last bulk upload');
  });

  describe('Sanitise data checkbox', () => {
    it('should show the sanitise data checkbox if the logged in user has an admin role and has canViewNinoDob permission', async () => {
      const { component, fixture, queryByTestId, permissionsService } = await setup();

      spyOn(permissionsService, 'can').and.returnValue(true);

      component.ngOnInit();
      fixture.detectChanges();

      expect(queryByTestId('showDataCheckbox')).toBeTruthy();
    });

    it('should not show the sanitise data checkbox if the logged in user is an admin and does not have canViewNinoDob permission', async () => {
      const { component, fixture, queryByTestId, permissionsService } = await setup('Admin');

      spyOn(permissionsService, 'can').and.returnValue(false);

      component.ngOnInit();
      fixture.detectChanges();

      expect(queryByTestId('showDataCheckbox')).toBeFalsy();
    });

    it('should not show the sanitise data checkbox if the logged in user is not an admin', async () => {
      const { queryByTestId } = await setup('Edit');

      expect(queryByTestId('showDataCheckbox')).toBeFalsy();
    });

    it('should set sanitise variable to true, when someone without canViewNinoDob permissions loads the page', async () => {
      const { component, fixture, permissionsService } = await setup();
      spyOn(permissionsService, 'can').and.returnValue(false);

      component.ngOnInit();
      fixture.detectChanges();

      expect(component.sanitise).toBeTruthy();
    });

    it('should set sanitise variable to false, when someone with canViewNinoDob permissions loads the page', async () => {
      const { component, fixture, permissionsService } = await setup('Edit');
      spyOn(permissionsService, 'can').and.returnValue(true);

      component.ngOnInit();
      fixture.detectChanges();

      expect(component.sanitise).toBeFalsy();
    });

    it('should change the value of sanitise to false when checkbox is checked', async () => {
      const { component, fixture, getByTestId, permissionsService } = await setup();

      spyOn(permissionsService, 'can').and.returnValue(true);

      component.ngOnInit();
      fixture.detectChanges();

      const checkbox = getByTestId('showDataCheckbox');

      fireEvent.click(checkbox);
      fixture.detectChanges();

      expect(component.sanitise).toBeFalsy();
    });

    it('should change the value of sanitise to true when checkbox is unchecked', async () => {
      const { component, fixture, getByTestId, permissionsService } = await setup();

      spyOn(permissionsService, 'can').and.returnValue(true);

      component.ngOnInit();
      fixture.detectChanges();

      const checkbox = getByTestId('showDataCheckbox');

      fireEvent.click(checkbox);
      fixture.detectChanges();

      fireEvent.click(checkbox);
      fixture.detectChanges();

      expect(component.sanitise).toBeTruthy();
    });
  });
});
