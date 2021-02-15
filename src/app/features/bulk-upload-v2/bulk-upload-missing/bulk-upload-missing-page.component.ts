import { Component, OnDestroy, OnInit } from '@angular/core';
import { MissingReferences } from '@core/model/bulk-upload.model';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { Subscription } from 'rxjs';
import { URLStructure } from '@core/model/url.model';

@Component({
  selector: 'app-bulk-upload-missing-page',
  templateUrl: './bulk-upload-missing-page.component.html',
})
export class BulkUploadMissingPageComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  public missingRefCount: MissingReferences;
  public nextPage:URLStructure;

  constructor(private bulkUploadService: BulkUploadService, private establishmentService: EstablishmentService) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.bulkUploadService
        .getMissingRef(this.establishmentService.establishmentId)
        .subscribe((missingRef: MissingReferences) => {
          this.missingRefCount = missingRef;
          this.bulkUploadService.setMissingNavigation(missingRef.establishmentList);
            if(this.missingRefCount.establishment > 0){
              this.nextPage = {url: ['/dev','bulk-upload','missing-workplace-references']};
            }else{
              this.nextPage = {url: this.bulkUploadService.nextMissingNavigation()};
            }
        }),
    );
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
