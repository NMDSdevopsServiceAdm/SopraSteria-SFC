import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { UserService } from '@core/services/user.service';
import { BulkUploadReferences } from '@features/bulk-upload/bulk-upload-references/bulk-upload.references';

@Component({
  selector: 'app-workplace-references-page',
  templateUrl: './workplace-references-page.component.html',
})
export class WorkplaceReferencesPageComponent extends BulkUploadReferences {
  // TODO check if needed
  public referencesUpdated = false;

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
