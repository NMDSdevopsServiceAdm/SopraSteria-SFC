import { AuthService } from '@core/services/auth.service';
import { BulkUploadFileType } from '@core/model/bulk-upload.model';
import { BulkUploadReferences } from '@features/bulk-upload/bulk-upload-references/bulk-upload-references';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { Component } from '@angular/core';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { FormBuilder } from '@angular/forms';
import { GetWorkplacesResponse, Workplace, WorkPlaceReference } from '@core/model/my-workplaces.model';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { UserService } from '@core/services/user.service';

@Component({
  selector: 'app-workplace-references-page',
  templateUrl: '../bulk-upload-references/bulk-upload-references.html',
  styleUrls: ['../bulk-upload-references/bulk-upload-references.scss'],
})
export class WorkplaceReferencesPageComponent extends BulkUploadReferences {
  // TODO check if needed
  public referencesUpdated = false;
  public referenceType = BulkUploadFileType.Establishment;
  public referenceTypeInfo = 'You must create unique references for each workplace.';
  public columnOneLabel = 'Workplace';
  public columnTwoLabel = 'Workplace reference';

  constructor(
    protected authService: AuthService,
    protected router: Router,
    protected formBuilder: FormBuilder,
    protected errorSummaryService: ErrorSummaryService,
    protected bulkUploadService: BulkUploadService,
    private userService: UserService
  ) {
    super(authService, router, formBuilder, errorSummaryService, bulkUploadService);
  }

  /** TODO check if needed
   public updateReferences() {
    this.referencesUpdated = true;
    this.authService.isFirstBulkUpload = false;
  }
   **/

  protected init(): void {
    this.getReferences();
  }

  private generateWorkPlaceReferences(references: GetWorkplacesResponse): WorkPlaceReference[] {
    return references.subsidaries.establishments.map((establishment => {
      return {
        name: establishment.name,
        uid: establishment.uid
      };
    }));
  }

  protected getReferences(): void {
    this.subscriptions.add(
      this.userService.getEstablishments().subscribe(
        (references: GetWorkplacesResponse) => {
          if (references) {
            this.references = references.subsidaries ? references.subsidaries.establishments : [];
            if (this.references.length) {
              this.updateForm();
              this.bulkUploadService.workPlaceReferences$.next(this.generateWorkPlaceReferences(references));
            }
          }
        },
        (error: HttpErrorResponse) => this.onError(error)
      )
    );
  }

  protected saveAndContinue(): void {
    console.log('saveAndContinue fired');
  }
}
