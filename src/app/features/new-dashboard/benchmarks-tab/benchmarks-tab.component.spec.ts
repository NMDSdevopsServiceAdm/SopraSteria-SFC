import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { PdfService } from '@core/services/pdf.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { establishmentBuilder } from '../../../../../server/test/factories/models';
import { NewBenchmarksTabComponent } from './benchmarks-tab.component';
import { NewComparisonGroupHeaderComponent } from './comparison-group-header/comparison-group-header.component';
import { WindowRef } from '@core/services/window.ref';
import { UserService } from '@core/services/user.service';
import { MockUserService } from '@core/test-utils/MockUserService';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '@core/services/auth.service';
import { MockAuthService } from '@core/test-utils/MockAuthService';
import { EstablishmentService } from '@core/services/establishment.service';
import { WindowToken } from '@core/services/window';
import { Roles } from '@core/model/roles.enum';
const MockWindow = {
  dataLayer: {
    push: () => {
      return;
    },
  },
};

describe('NewBenchmarksTabComponent', () => {
  const setup = async (isAdmin = true, subsidiaries = 0) => {
    const establishment = establishmentBuilder() as Establishment;
    const role = isAdmin ? Roles.Admin : Roles.Edit;
    const { fixture, getByText } = await render(NewBenchmarksTabComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
      providers: [
        {
          provide: FeatureFlagsService,
          useClass: MockFeatureFlagsService,
        },

        {
          provide: BreadcrumbService,
          useClass: MockBreadcrumbService,
        },
        {
          provide: WindowRef,
          useClass: WindowRef,
        },
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory([], isAdmin),
          deps: [HttpClient, Router, UserService],
        },
        {
          provide: UserService,
          useFactory: MockUserService.factory(subsidiaries, role),
          deps: [HttpClient],
        },
        {
          provide: AuthService,
          useFactory: MockAuthService.factory(true, isAdmin),
          deps: [HttpClient, Router, EstablishmentService, UserService, PermissionsService],
        },
        { provide: WindowToken, useValue: MockWindow },
      ],
      declarations: [NewComparisonGroupHeaderComponent],
      schemas: [NO_ERRORS_SCHEMA],
      componentProperties: {
        workplace: establishment,
      },
    });

    const component = fixture.componentInstance;

    const pdfService = TestBed.inject(PdfService);

    return {
      component,
      getByText,
      pdfService,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should download the page as a pdf when the the download as pdf link is clicked', async () => {
    const { component, getByText, pdfService } = await setup();

    const downloadFunctionSpy = spyOn(component, 'downloadAsPDF').and.callThrough();
    const pdfServiceSpy = spyOn(pdfService, 'BuildBenchmarksPdf').and.callThrough();
    fireEvent.click(getByText('Download Benchmarks', { exact: false }));

    expect(downloadFunctionSpy).toHaveBeenCalled();
    expect(pdfServiceSpy).toHaveBeenCalled();
  });
});
