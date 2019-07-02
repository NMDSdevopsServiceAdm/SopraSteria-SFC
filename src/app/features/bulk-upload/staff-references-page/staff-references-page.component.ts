import { ActivatedRoute, Router } from '@angular/router';
import { WorkPlaceReference } from '@core/model/my-workplaces.model';
import { AuthService } from '@core/services/auth.service';
import { BulkUploadFileType } from '@core/model/bulk-upload.model';
import { BulkUploadReferences } from '@features/bulk-upload/bulk-upload-references/bulk-upload-references';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { Component } from '@angular/core';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { FormBuilder } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { take } from 'rxjs/operators';
import { Worker } from '@core/model/worker.model';
import { WorkerService } from '@core/services/worker.service';
import { filter, findIndex } from 'lodash';

@Component({
  selector: 'app-workplace-references-page',
  templateUrl: '../bulk-upload-references/bulk-upload-references.html',
  styleUrls: ['../bulk-upload-references/bulk-upload-references.scss'],
})
export class StaffReferencesPageComponent extends BulkUploadReferences {
  // TODO check if needed
  public referencesUpdated = false;
  public referenceType = BulkUploadFileType.Worker;
  public referenceTypeInfo = 'You must create unique references for each member of staff.';
  public columnOneLabel = 'Name';
  public columnTwoLabel = 'Staff reference';
  private establishmentUid: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private bulkUploadService: BulkUploadService,
    protected authService: AuthService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected workerService: WorkerService,
  ) {
    super(authService, router, formBuilder, errorSummaryService);
  }

  /** TODO check if needed
   public updateReferences() {
    this.referencesUpdated = true;
    this.authService.isFirstBulkUpload = false;
  }
   **/

  protected init(): void {
    this.subscriptions.add(
      this.activatedRoute.params.pipe(take(1)).subscribe(params => {
        this.establishmentUid = params.uid;
        this.getReferences(this.establishmentUid);
      })
    );

    this.subscriptions.add(
      this.bulkUploadService.workPlaceReferences$
        .pipe(take(1))
        .subscribe((workPlaceReferences: WorkPlaceReference[]) => {
          this.establishmentName = filter(workPlaceReferences, ['uid', this.establishmentUid])[0].name;
          this.remainingEstablishments =
            (workPlaceReferences.length - findIndex(workPlaceReferences, ['uid', this.establishmentUid])) - 1;
        })
    );
  }

  protected getReferences(establishmentUid: string): void {
    this.subscriptions.add(
      this.workerService.getAllWorkersByUid(establishmentUid).subscribe(
        (references: Worker[]) => {
          if (references) {
            this.references = references;
            if (this.references.length) {
              this.updateForm();
            }
          }
        },
        (error: HttpErrorResponse) => this.onError(error)
      )
    );
  }
}
