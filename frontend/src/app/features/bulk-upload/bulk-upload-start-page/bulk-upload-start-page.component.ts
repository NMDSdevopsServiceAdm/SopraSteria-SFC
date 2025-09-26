import { Component } from '@angular/core';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { URLStructure } from '@core/model/url.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';

@Component({
    selector: 'app-bulk-upload-start-page',
    templateUrl: './bulk-upload-start-page.component.html',
    standalone: false
})
export class BulkUploadStartPageComponent {
  public nextPage: URLStructure = { url: ['/bulk-upload', 'missing-workplace-references'] };

  constructor(private breadcrumbService: BreadcrumbService) {}

  ngOnInit(): void {
    this.breadcrumbService.show(JourneyType.BULK_UPLOAD);
  }
}
