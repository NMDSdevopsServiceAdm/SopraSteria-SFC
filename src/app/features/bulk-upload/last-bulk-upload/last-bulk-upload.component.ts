import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { BulkUploadFileType, lastBulkUploadFile } from '@core/model/bulk-upload.model';
import { AlertService } from '@core/services/alert.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { FileUtil } from '@core/utils/file-util';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-last-bulk-upload',
  templateUrl: './last-bulk-upload.component.html',
  providers: [],
})
export class LastBulkUploadComponent implements OnInit {
  public sanitise = true;

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

    let type: BulkUploadFileType = null;

    if (key.includes('staff')) {
      type = this.sanitise ? BulkUploadFileType.WorkerSanitise : BulkUploadFileType.Worker;
    } else if (key.includes('workplace')) {
      type = BulkUploadFileType.Establishment;
    } else if (key.includes('training')) {
      type = BulkUploadFileType.Training;
    }

    this.bulkUploadService
      .getUploadedFileFromS3(this.establishmentService.primaryWorkplace.uid, key, type)
      .pipe(take(1))
      .subscribe((response) => {
        console.log(response);
        const filename = FileUtil.getFileName(response);
        const blob = new Blob([response.body], { type: 'text/plain;charset=utf-8' });
        saveAs(blob, filename);
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

  public toggleSanitise(sanitiseData: boolean): void {
    this.sanitise = sanitiseData;
  }

  private showBulkUploadUnlockAlert(type): void {
    const message = type === 'success' ? 'has been successfully unlocked' : 'failed to unlock';
    this.alertService.addAlert({
      type,
      message: `Bulk upload for ${this.establishmentService.primaryWorkplace.name} ${message}`,
    });
  }
}
