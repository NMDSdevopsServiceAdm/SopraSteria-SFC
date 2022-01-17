import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { BulkUploadTroubleshootingPage } from '@core/model/bulk-upload-troubleshooting-page.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';

@Component({
  selector: 'app-bulk-upload-troubleshooting',
  templateUrl: './bulk-upload-troubleshooting-page.component.html',
})
export class BulkUploadTroubleshootingComponent implements OnInit {
  public bulkUploadTroubleShootingPages: BulkUploadTroubleshootingPage[];
  public bulkUploadTroubleshootingPage: BulkUploadTroubleshootingPage;

  constructor(private route: ActivatedRoute, private breadcrumbService: BreadcrumbService) {}

  ngOnInit(): void {
    this.breadcrumbService.show(JourneyType.BULK_UPLOAD_HELP);
    this.bulkUploadTroubleshootingPage = this.route.snapshot.data.bulkUploadTroubleShootingPage.data[0];
    this.bulkUploadTroubleShootingPages = this.route.snapshot.data.bulkUploadTroubleShootingPages.data;
  }
}
