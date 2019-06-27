import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { BulkUploadFileType } from '@core/model/bulk-upload.model';
import { AuthService } from '@core/services/auth.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { UserService } from '@core/services/user.service';
import { BulkUploadReferences } from '@features/bulk-upload/bulk-upload-references/bulk-upload-references';

@Component({
  selector: 'app-workplace-references-page',
  templateUrl: '../bulk-upload-references/bulk-upload-references.html',
})
export class StaffReferencesPageComponent extends BulkUploadReferences {
  // TODO check if needed
  public referencesUpdated = false;
  public referenceType = BulkUploadFileType.Worker;
  public referenceTypeInfo = 'You must create unique references for each member of staff.';

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
}
