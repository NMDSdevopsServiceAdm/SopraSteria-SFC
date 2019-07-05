import { ActivatedRoute, Router } from '@angular/router';
import { WorkPlaceReference } from '@core/model/my-workplaces.model';
import { AuthService } from '@core/services/auth.service';
import { BulkUploadFileType } from '@core/model/bulk-upload.model';
import { BackService } from '@core/services/back.service';
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
  private establishmentUid: string;
  private workPlaceReferences: WorkPlaceReference[];
  public columnOneLabel = 'Name';
  public columnTwoLabel = 'Staff reference';
  public referenceType = BulkUploadFileType.Worker;
  public referenceTypeInfo = 'You must create unique references for each member of staff.';

  constructor(
    private activatedRoute: ActivatedRoute,
    private bulkUploadService: BulkUploadService,
    protected authService: AuthService,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected workerService: WorkerService
  ) {
    super(authService, router, formBuilder, errorSummaryService);
  }

  protected init(): void {
    // force route reload whenever params change;
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.backService.setBackLink({ url: ['/bulk-upload/workplace-references'] });
    this.getEstablishmentUid();
    this.getEstablishmentInfo();
  }

  private getEstablishmentUid(): void {
    this.subscriptions.add(
      this.activatedRoute.params.pipe(take(1)).subscribe(params => {
        this.establishmentUid = params.uid;
        console.log('%c init fired, establishmentUid ', 'background:orange; color:white', this.establishmentUid);
        this.getReferences(this.establishmentUid);
      })
    );
  }

  private getEstablishmentInfo(): void {
    this.subscriptions.add(
      this.bulkUploadService.workPlaceReferences$
        .pipe(take(1))
        .subscribe((workPlaceReferences: WorkPlaceReference[]) => {
          this.establishmentName = filter(workPlaceReferences, ['uid', this.establishmentUid])[0].name;
          this.workPlaceReferences = workPlaceReferences;
          this.remainingEstablishments = workPlaceReferences.length - this.getWorkplacePosition();
        })
    );
  }

  /**
   * Calculate position of current workplace
   * from list of workplace references
   * NOTE: add 1 as array's are 0 index based
   */
  private getWorkplacePosition(): number {
    return findIndex(this.workPlaceReferences, ['uid', this.establishmentUid]) + 1;
  }

  protected getReferences(establishmentUid: string): void {
    this.subscriptions.add(
      this.workerService.getAllWorkersByUid(establishmentUid).subscribe(
        (references: Worker[]) => {
          if (references && references.length) {
            this.references = references;
            this.updateForm();
          }
        },
        (error: HttpErrorResponse) => this.onError(error)
      )
    );
  }

  protected navigateToNextRoute(): void {
    console.log('currentWorkplaceIndex()', this.getWorkplacePosition());
    console.log('workPlaceReferences.length', this.workPlaceReferences.length);
    console.log('%c establishmentUid ', 'background:orange; color:white', this.establishmentUid);

    if (this.workPlaceReferences.length === this.getWorkplacePosition()) {
      console.warn('NOTHING MORE TO UPDATE, ROUTE TO SUCCESS PAGE');
      this.router.navigate([ '/bulk-upload/workplace-and-staff-references/created' ]);
    } else {
      console.warn('route to next index');
      this.router.navigate([
        '/bulk-upload/staff-references',
        this.workPlaceReferences[this.getWorkplacePosition() + 1].uid,
      ]);
    }
  }

  protected save(saveAndContinue: boolean): void {
    this.subscriptions.add(
      this.workerService
        .updateLocalIdentifiers(this.establishmentUid, this.generateRequest())
        .pipe(take(1))
        .subscribe(
          () => {
            if (saveAndContinue) {
              this.navigateToNextRoute();
            } else {
              this.router.navigate(['/bulk-upload/workplace-references']);
            }
          },
          (error: HttpErrorResponse) => this.onError(error)
        )
    );
  }
}
