import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { BulkUploadFileType } from '@core/model/bulk-upload.model';
import { GetWorkplacesResponse } from '@core/model/my-workplaces.model';
import { AuthService } from '@core/services/auth.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { UserService } from '@core/services/user.service';
import { BulkUploadReferences } from '@features/bulk-upload/bulk-upload-references/bulk-upload-references';

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
    protected userService: UserService
  ) {
    super(authService, router, formBuilder, errorSummaryService, userService);
  }

  /** TODO check if needed
   public updateReferences() {
    this.referencesUpdated = true;
    this.authService.isFirstBulkUpload = false;
  }
   **/

  protected getReferences(): void {
    this.subscriptions.add(
      this.userService.getEstablishments().subscribe((workplaces: GetWorkplacesResponse) => {
        if (workplaces) {
          this.references = workplaces.subsidaries ? workplaces.subsidaries.establishments : [];
          if (this.references.length) {
            this.updateForm();
          }
        }
      })
    );
  }
}
