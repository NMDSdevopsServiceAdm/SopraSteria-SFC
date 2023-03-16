import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
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

describe('NewBenchmarksTabComponent', () => {
  const setup = async () => {
    const establishment = establishmentBuilder() as Establishment;
    const { fixture, getByText } = await render(NewBenchmarksTabComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
      providers: [
        {
          provide: FeatureFlagsService,
          useClass: MockFeatureFlagsService,
        },
        {
          provide: PermissionsService,
          useClass: MockPermissionsService,
        },
        {
          provide: BreadcrumbService,
          useClass: MockBreadcrumbService,
        },
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
