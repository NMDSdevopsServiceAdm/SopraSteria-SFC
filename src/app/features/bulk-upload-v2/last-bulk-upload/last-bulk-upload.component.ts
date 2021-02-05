import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { lastBulkUploadFile } from '@core/model/bulk-upload.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';

@Component({
  selector: 'app-last-bulk-upload',
  templateUrl: './last-bulk-upload.component.html',
  providers: [],
})
export class LastBulkUploadComponent {
  constructor(
    private bulkUploadService: BulkUploadService,
    private route: ActivatedRoute,
    protected router: Router,
    private establishmentService: EstablishmentService,
    private breadcrumbService: BreadcrumbService
  ) {}

  public files: [lastBulkUploadFile] = this.route.snapshot.data.lastBulkUpload;

  ngOnInit() {
  console.log(this.files);
    this.breadcrumbService.show(JourneyType.BULK_UPLOAD);
  }
  public returnToStart(){
    this.router.navigate(['bulk-upload/']);
  }
  public encodeUrl(url: string): string {
    return encodeURI(url);
  }

  public downloadFile(event: Event, key: string) {
    event.preventDefault();

    this.bulkUploadService
      .getUploadedFileSignedURL(this.establishmentService.primaryWorkplace.uid, key)
      .subscribe((signedURL) => {
        window.open(signedURL);
      });
  }


}
