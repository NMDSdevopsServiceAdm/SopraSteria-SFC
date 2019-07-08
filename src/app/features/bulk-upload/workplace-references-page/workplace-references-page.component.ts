import { I18nPluralPipe } from '@angular/common';
import { AuthService } from '@core/services/auth.service';
import { BulkUploadFileType } from '@core/model/bulk-upload.model';
import { BackService } from '@core/services/back.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { BulkUploadReferences } from '@features/bulk-upload/bulk-upload-references/bulk-upload-references';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { Component } from '@angular/core';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { FormBuilder } from '@angular/forms';
import { GetWorkplacesResponse, Workplace, WorkPlaceReference } from '@core/model/my-workplaces.model';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { UserService } from '@core/services/user.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-workplace-references-page',
  templateUrl: '../bulk-upload-references/bulk-upload-references.html',
  styleUrls: ['../bulk-upload-references/bulk-upload-references.scss'],
  providers: [I18nPluralPipe],
})
export class WorkplaceReferencesPageComponent extends BulkUploadReferences {
  public referenceType = BulkUploadFileType.Establishment;
  public referenceTypeInfo = 'You must create unique references for each workplace.';
  public columnOneLabel = 'Workplace';
  public columnTwoLabel = 'Workplace reference';
  private workPlaceReferences: WorkPlaceReference[] = [];

  constructor(
    private bulkUploadService: BulkUploadService,
    private establishmentService: EstablishmentService,
    private userService: UserService,
    protected authService: AuthService,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected router: Router,
  ) {
    super(authService, router, formBuilder, errorSummaryService);
  }

  protected init(): void {
    this.backService.setBackLink({ url: ['/dashboard']});
    this.getReferences();
  }

  private generateWorkPlaceReferences(references: GetWorkplacesResponse): WorkPlaceReference[] {
    return references.subsidaries.establishments.map(establishment => {
      return {
        name: establishment.name,
        uid: establishment.uid,
      };
    });
  }

  protected getReferences(): void {
    this.subscriptions.add(
      this.userService.getEstablishments().subscribe(
        (references: GetWorkplacesResponse) => {
          if (references.subsidaries) {
            this.references = references.subsidaries.establishments;
          }

          if (references.primary) {
            this.references.unshift(references.primary);
          }

          if (this.references.length) {
            this.setupForm();
            this.workPlaceReferences = this.generateWorkPlaceReferences(references);
            this.bulkUploadService.workPlaceReferences$.next(this.workPlaceReferences);
          }
        },
        (error: HttpErrorResponse) => this.onError(error)
      )
    );
  }

  protected save(saveAndContinue: boolean): void {
    this.subscriptions.add(
      this.establishmentService.updateLocalIdentifiers(this.generateRequest())
        .pipe(take(1))
        .subscribe(
          () => {
            if (saveAndContinue) {
              this.router.navigate(['/bulk-upload/staff-references', this.workPlaceReferences[0].uid]);
            } else {
              this.router.navigate(['/dashboard']);
            }
          },
          (error: HttpErrorResponse) => this.onError(error)
        )
    );
  }
}
