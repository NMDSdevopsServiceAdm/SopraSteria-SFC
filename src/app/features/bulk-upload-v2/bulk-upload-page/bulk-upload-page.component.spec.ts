import { render } from '@testing-library/angular';
import { SharedModule } from '@shared/shared.module';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HomeTabComponent } from '@features/dashboard/home-tab/home-tab.component';
import { WindowRef } from '@core/services/window.ref';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { HttpClient } from '@angular/common/http';
import { UserService } from '@core/services/user.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { getTestBed } from '@angular/core/testing';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { BulkUploadPageV2Component } from '@features/bulk-upload-v2/bulk-upload-page/bulk-upload-page.component';

describe('BulkUploadPageV2Component', () => {
  async function setup() {
    const component = await render(BulkUploadPageV2Component, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      declarations: [HomeTabComponent],
      providers: [
        {
          provide: WindowRef,
          useClass: WindowRef,
        },
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(),
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
      ],
    });

    const injector = getTestBed();
    const establishmentService = injector.inject(EstablishmentService) as EstablishmentService;
    const router = injector.inject(Router) as Router;

    return {
      component,
      establishmentService,
      router,
    };
  }
  it('should render a BulkUploadPageV2Component', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
  it('should show last bulk upload date in first P', async () => {
    const { component } = await setup();
    component.fixture.componentInstance.establishment.lastBulkUploaded = '2021-01-04T14:42:03.540Z';
    component.fixture.detectChanges(true);
    const p: HTMLElement = component.fixture.nativeElement.querySelector('p');
    expect(p.innerText).toEqual('Last bulk upload 4 January 2021');
  });
  it('should NOT show last bulk upload date in first P when no bulk upload date', async () => {
    const { component } = await setup();
    component.fixture.componentInstance.establishment.lastBulkUploaded = null;
    component.fixture.detectChanges(true);
    const p: HTMLElement = component.fixture.nativeElement.querySelector('p');
    expect(p.innerText).not.toContain('Last bulk upload');
  });
});
