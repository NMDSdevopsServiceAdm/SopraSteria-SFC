import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { BulkUploadFileType } from '@core/model/bulk-upload.model';
import { WorkPlaceReference } from '@core/model/my-workplaces.model';
import { Worker } from '@core/model/worker.model';
import { AuthService } from '@core/services/auth.service';
import { BackService } from '@core/services/back.service';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { WorkerService } from '@core/services/worker.service';
import { BulkUploadReferences } from '@features/bulk-upload/bulk-upload-references/bulk-upload-references';
import { filter, findIndex } from 'lodash';
import { take } from 'rxjs/operators';

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
  public nextRoute: String[] = [];
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
    this.subscribeToRouteChange();
    this.getEstablishmentUid();
    this.setNextRoute();
  }

  private subscribeToRouteChange(): void {
    this.subscriptions.add(
      this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.setNextRoute();
          this.setBackLink();
        }
      })
    );
  }

  private setBackLink(): void {
    this.backService.setBackLink({ url: ['/bulk-upload/workplace-references'] });
  }

  private getEstablishmentUid(): void {
    this.subscriptions.add(
      this.activatedRoute.params.subscribe(params => {
        this.establishmentUid = params.uid;
        this.getReferences(this.establishmentUid);
        this.getEstablishmentInfo();
      })
    );
  }

  private getEstablishmentInfo(): void {
    this.subscriptions.add(
      this.bulkUploadService.workPlaceReferences$
        .pipe(take(1))
        .subscribe((workPlaceReferences: WorkPlaceReference[]) => {
          this.setBackLink();
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
          if (references) {
            this.references = references;
            this.setupForm();
          }
        },
        (error: HttpErrorResponse) => this.onError(error)
      )
    );
  }

  protected setNextRoute(): void {
    this.nextRoute =
      this.workPlaceReferences.length === this.getWorkplacePosition()
        ? ['/bulk-upload/workplace-and-staff-references/success']
        : ['/bulk-upload/staff-references', this.workPlaceReferences[this.getWorkplacePosition()].uid];
  }

  protected save(saveAndContinue: boolean): void {
    this.subscriptions.add(
      this.workerService
        .updateLocalIdentifiers(this.establishmentUid, this.generateRequest())
        .pipe(take(1))
        .subscribe(
          () => {
            if (saveAndContinue) {
              this.router.navigate(this.nextRoute);
            } else {
              this.router.navigate(['/bulk-upload/workplace-references']);
            }
          },
          (error: HttpErrorResponse) => this.onError(error)
        )
    );
  }
}
