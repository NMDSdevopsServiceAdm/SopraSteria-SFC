import { Component, OnInit } from '@angular/core';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';

@Component({
  selector: 'app-bulk-upload-help-main-page',
  templateUrl: './bulk-upload-help-main-page.component.html',
  styleUrls: ['./bulk-upload-help-main-page.component.scss'],
})
export class BulkUploadHelpMainPageComponent implements OnInit {
  constructor(private breadcrumbService: BreadcrumbService) {}

  ngOnInit(): void {
    this.breadcrumbService.show(JourneyType.BULK_UPLOAD);
  }
}
