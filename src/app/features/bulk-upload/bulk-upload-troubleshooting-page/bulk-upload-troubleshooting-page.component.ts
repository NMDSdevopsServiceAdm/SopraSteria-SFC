import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { BulkUploadTroubleshootingPage } from '@core/model/bulk-upload-troubleshooting-page.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';

@Component({
  selector: 'app-bulk-upload-troubleshooting',
  templateUrl: './bulk-upload-troubleshooting-page.component.html',
})
export class BulkUploadTroubleshootingComponent implements OnInit {
  @Input() public bulkUploadTroubleShootingLink: BulkUploadTroubleshootingPage;

  constructor(private route: ActivatedRoute, private breadcrumbService: BreadcrumbService) {}

  ngOnInit(): void {
    this.breadcrumbService.show(JourneyType.BULK_UPLOAD_HELP);
    this.bulkUploadTroubleShootingLink = this.route.snapshot.data.bulkUploadTroubleShootingLink?.data[0];
  }
}
