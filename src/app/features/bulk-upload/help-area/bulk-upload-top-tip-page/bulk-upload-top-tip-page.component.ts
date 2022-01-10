import { Component, OnInit } from '@angular/core';
import { BreadcrumbService } from '@core/services/breadcrumb.service';

@Component({
  selector: 'app-bulk-upload-top-tip-page',
  templateUrl: './bulk-upload-top-tip-page.component.html',
})
export class BulkUploadTopTipPageComponent implements OnInit {
  constructor(private breadCrumbService: BreadcrumbService) {}

  ngOnInit(): void {
    console.log('Here');
  }
}
