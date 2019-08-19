import { I18nPluralPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BulkUploadFileType } from '@core/model/bulk-upload.model';
import { Workplace, WorkplaceDataOwner } from '@core/model/my-workplaces.model';
import { BackService } from '@core/services/back.service';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { BulkUploadReferences } from '@features/bulk-upload/bulk-upload-references/bulk-upload-references';
import { filter, find } from 'lodash';
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
  private exit: string[] = ['/bulk-upload'];

  constructor(
    private activatedRoute: ActivatedRoute,
    protected establishmentService: EstablishmentService,
    protected bulkUploadService: BulkUploadService,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected router: Router
  ) {
    super(establishmentService, bulkUploadService, router, formBuilder, errorSummaryService);
  }

  protected init(): void {
    if (this.bulkUploadService.returnTo) {
      this.exit = this.bulkUploadService.returnTo.url;
      this.bulkUploadService.setReturnTo(null);
    }

    this.backService.setBackLink({ url: this.exit });
    this.references = filter(
      this.activatedRoute.snapshot.data.workplaceReferences,
      reference => reference.dataOwner === WorkplaceDataOwner.Parent
    );
    console.log(this.references);
    this.setupForm();
  }

  protected save(saveAndContinue: boolean): void {
    this.subscriptions.add(
      this.establishmentService
        .updateLocalIdentifiers(this.generateRequest())
        .pipe(take(1))
        .subscribe(
          data => {
            const updatedReferences = this.references.map(workplace => {
              const updated = find(data.localIdentifiers, ['uid', workplace.uid]);
              return {
                ...workplace,
                ...{ localIdentifier: updated.value },
              };
            }) as Workplace[];
            this.bulkUploadService.setWorkplaceReferences(updatedReferences);
            if (saveAndContinue) {
              this.router.navigate(['/bulk-upload/staff-references', this.references[0].uid]);
            } else {
              this.router.navigate(this.exit);
            }
          },
          (error: HttpErrorResponse) => this.onError(error)
        )
    );
  }

  public setReturn(): void {
    this.bulkUploadService.setReturnTo({ url: ['/bulk-upload/workplace-references'] });
  }
}
