import { I18nPluralPipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { BulkUploadService, BulkUploadServiceV2 } from '@core/services/bulk-upload.service';
import { EstablishmentService } from '@core/services/establishment.service';

import { AdminSkipService } from '../admin-skip.service';

@Component({
  selector: 'app-bulk-upload-page',
  templateUrl: './bulk-upload-page.component.html',
  providers: [I18nPluralPipe, { provide: BulkUploadService, useClass: BulkUploadServiceV2 }],
})
export class BulkUploadPageV2Component implements OnInit, OnDestroy {
  public establishment: Establishment;

  constructor(
    private establishmentService: EstablishmentService,
    private bulkUploadService: BulkUploadService,
    private breadcrumbService: BreadcrumbService,
    private adminSkipService: AdminSkipService,
  ) {}

  ngOnInit() {
    this.breadcrumbService.show(JourneyType.BULK_UPLOAD);
    this.establishment = this.establishmentService.primaryWorkplace;
    this.bulkUploadService.setReturnTo(null);
  }

  ngOnDestroy() {
    this.adminSkipService.clear();
  }
}
