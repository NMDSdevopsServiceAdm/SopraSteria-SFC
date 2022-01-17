import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { lastBulkUploadFile } from '@core/model/bulk-upload.model';
import { AlertService } from '@core/services/alert.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { EstablishmentService } from '@core/services/establishment.service';

@Component({
  selector: 'app-last-bulk-upload',
  templateUrl: './last-bulk-upload.component.html',
  providers: [],
})
export class LastBulkUploadComponent implements OnInit {
  constructor(
    private bulkUploadService: BulkUploadService,
    private route: ActivatedRoute,
    protected router: Router,
    private establishmentService: EstablishmentService,
    private breadcrumbService: BreadcrumbService,
    private alertService: AlertService,
  ) {}

  public files: [lastBulkUploadFile] = this.route.snapshot.data.lastBulkUpload;
  public locked: boolean = this.route.snapshot.data.bulkUploadLocked.bulkUploadLockHeld;

  ngOnInit(): void {
    this.breadcrumbService.show(JourneyType.BULK_UPLOAD);
  }

  public returnToStart(): void {
    this.router.navigate(['bulk-upload/']);
  }

  public encodeUrl(url: string): string {
    return encodeURI(url);
  }

  public downloadFile(event: Event, key: string): void {
    event.preventDefault();

    this.bulkUploadService
      .getUploadedFileSignedURL(this.establishmentService.primaryWorkplace.uid, key)
      .subscribe((signedURL) => {
        window.open(signedURL);
      });
  }

  public unlockBulkUpload(): void {
    this.bulkUploadService.unlockBulkUpload(this.establishmentService.primaryWorkplace.uid).subscribe(
      () => {
        this.locked = false;
        this.showBulkUploadUnlockAlert('success');
      },
      () => {
        this.showBulkUploadUnlockAlert('warning');
      },
    );
  }

  private showBulkUploadUnlockAlert(type): void {
    const message = type === 'success' ? 'has been successfully unlocked' : 'failed to be unlocked';
    this.alertService.addAlert({
      type,
      message: `Bulk upload for ${this.establishmentService.primaryWorkplace.name} ${message}`,
    });
  }
}
