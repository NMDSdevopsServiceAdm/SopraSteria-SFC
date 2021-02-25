import { Component } from '@angular/core';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { MissingReferences } from '@core/model/bulk-upload.model';
import { URLStructure } from '@core/model/url.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-bulk-upload-start-page',
  templateUrl: './bulk-upload-start-page.component.html',
})
export class BulkUploadStartPageComponent {
  public nextPage: URLStructure = { url: ['/bulk-upload', 'missing-workplace-references'] };
  private subscriptions: Subscription = new Subscription();
  public missingRefCount: MissingReferences;

  constructor(
    private bulkUploadService: BulkUploadService,
    private establishmentService: EstablishmentService,
    private breadcrumbService: BreadcrumbService,
  ) {}

  ngOnInit(): void {
    this.breadcrumbService.show(JourneyType.BULK_UPLOAD);
    this.subscriptions.add(
      this.bulkUploadService
        .getMissingRef(this.establishmentService.establishmentId)
        .subscribe((missingRef: MissingReferences) => {
          this.missingRefCount = missingRef;
          this.bulkUploadService.setMissingReferencesNavigation(missingRef.establishmentList);
        }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
