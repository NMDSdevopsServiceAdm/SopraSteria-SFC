import { I18nPluralPipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { BulkUploadService, BulkUploadServiceV2 } from '@core/services/bulk-upload.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';

import { isAdminRole } from '../../../../../server/utils/adminUtils';
import { AdminSkipService } from '../admin-skip.service';

@Component({
  selector: 'app-bulk-upload-page',
  templateUrl: './bulk-upload-page.component.html',
  providers: [I18nPluralPipe, { provide: BulkUploadService, useClass: BulkUploadServiceV2 }],
})
export class BulkUploadPageComponent implements OnInit, OnDestroy {
  public establishment: Establishment;
  public sanitise: boolean;
  public isAdmin: boolean;
  public canViewNinoDob: boolean;

  constructor(
    private establishmentService: EstablishmentService,
    private bulkUploadService: BulkUploadService,
    private breadcrumbService: BreadcrumbService,
    private adminSkipService: AdminSkipService,
    private permissionsService: PermissionsService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.breadcrumbService.show(JourneyType.BULK_UPLOAD);
    this.establishment = this.establishmentService.primaryWorkplace;
    this.bulkUploadService.setReturnTo(null);

    this.canViewNinoDob = this.permissionsService.can(this.establishment.uid, 'canViewNinoDob');
    this.isAdmin = isAdminRole(this.route.snapshot.data.loggedInUser.role);
    this.sanitise = !this.canViewNinoDob;
  }

  public toggleSanitise(sanitiseData: boolean): void {
    this.sanitise = sanitiseData;
  }

  ngOnDestroy(): void {
    this.adminSkipService.clear();
    this.adminSkipService.skipWorkplaceReferences = false;
  }
}
