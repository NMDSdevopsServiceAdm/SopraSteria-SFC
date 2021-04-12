import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';

@Component({
  selector: 'app-about-bulk-upload',
  templateUrl: './about-bulk-upload.component.html',
})
export class AboutBulkUploadComponent implements OnInit {
  constructor(private breadcrumbService: BreadcrumbService, protected router: Router) {}

  ngOnInit() {
    this.breadcrumbService.show(JourneyType.BULK_UPLOAD);
  }
}
