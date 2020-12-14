import { Component, OnDestroy, OnInit } from '@angular/core';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';

import { Router } from '@angular/router';

@Component({
  selector: 'app-about-bulk-upload',
  templateUrl: './about-bulk-upload.component.html',
  providers: [],
})
export class AboutBulkUploadComponent implements OnInit {
  constructor(private breadcrumbService: BreadcrumbService, protected router: Router) {}

  ngOnInit() {
    this.breadcrumbService.show(JourneyType.BULK_UPLOAD);
  }

  return() {
    this.router.navigate(['bulk-upload']);
  }
}
