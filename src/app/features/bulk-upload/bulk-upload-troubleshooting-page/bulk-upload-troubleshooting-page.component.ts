import { Component, OnInit } from '@angular/core';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';

@Component({
  selector: 'app-bulk-upload-troubleshooting',
  templateUrl: './bulk-upload-troubleshooting-page.component.html',
})
export class BulkUploadTroubleshootingComponent implements OnInit {
  constructor(private breadcrumbService: BreadcrumbService) {}

  ngOnInit(): void {
    this.breadcrumbService.show(JourneyType.BULK_UPLOAD_HELP);
  }
}
