import { I18nPluralPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment, LocalIdentifiersRequest } from '@core/model/establishment.model';
import { Workplace, WorkplaceDataOwner } from '@core/model/my-workplaces.model';
import { URLStructure } from '@core/model/url.model';
import { BackService } from '@core/services/back.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { ArrayUtil } from '@core/utils/array-util';
import { filter, find } from 'lodash';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-bu-workplace-references-page',
  templateUrl: 'workplace-references.component.html',
  styleUrls: ['workplace-references.component.html'],
  providers: [I18nPluralPipe],
})
export class WorkplaceReferencesComponent implements OnInit {
  private maxLength = 50;
  public form: FormGroup;
  public references: Workplace[] = [];
  private primaryWorkplace: Establishment;
  private subscriptions: Subscription = new Subscription();
  public formErrorsMap: ErrorDetails[] = [];
  public serverError: string;
  public serverErrorsMap: ErrorDefinition[] = [];
  public submitted = false;
  public return: URLStructure = { url: ['/dev', 'bulk-upload'] };

  constructor(
    private activatedRoute: ActivatedRoute,
    protected establishmentService: EstablishmentService,
    protected bulkUploadService: BulkUploadService,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: FormBuilder,
    protected router: Router,
    private breadcrumbService: BreadcrumbService,
  ) {}

  ngOnInit(): void {
    this.breadcrumbService.show(JourneyType.BULK_UPLOAD);
    this.primaryWorkplace = this.establishmentService.primaryWorkplace;
    this.references = filter(this.activatedRoute.snapshot.data.workplaceReferences, (reference) => {
      if (reference.ustatus === 'PENDING') return false;
      if (this.primaryWorkplace.isParent) {
        return reference.dataOwner === WorkplaceDataOwner.Parent || reference.uid === this.primaryWorkplace.uid;
      } else {
        return reference.dataOwner === WorkplaceDataOwner.Workplace;
      }
    });
    this.setupForm();
    this.setServerErrors();
  }

  protected setupForm(): void {
    this.submitted = false;
    this.form = this.formBuilder.group({}, { validator: this.checkDuplicates });
    this.references = this.references.filter((item) => item);
    this.references.forEach((reference: Workplace) => {
      this.form.addControl(
        `reference-${reference.uid}`,
        new FormControl(reference.localIdentifier, [Validators.required, Validators.maxLength(this.maxLength)]),
      );

      this.formErrorsMap.push({
        item: `reference-${reference.uid}`,
        type: [
          {
            name: 'required',
            message: `Enter the missing workplace reference.`,
          },
          {
            name: 'maxlength',
            message: `The reference must be ${this.maxLength} characters or less.`,
          },
          {
            name: 'duplicate',
            message: `Enter a different workplace reference.`,
          },
        ],
      });
    });
  }

  public onSubmit(event: Event): void {
    event.preventDefault();
    this.submitted = true;
    this.errorSummaryService.syncFormErrorsEvent.next(true);

    if (this.form.valid) {
      this.save();
    } else {
      this.errorSummaryService.scrollToErrorSummary();
    }
  }

  protected onError(response: HttpErrorResponse): void {
    if (response.status === 400) {
      this.serverErrorsMap[1].message += ` '${response.error.duplicateValue}' has previously been used.`;
    }

    this.serverError = this.errorSummaryService.getServerErrorMessage(response.status, this.serverErrorsMap);
    this.errorSummaryService.scrollToErrorSummary();
  }

  private setServerErrors() {
    this.serverErrorsMap = [
      {
        name: 503,
        message: 'Service unavailable.',
      },
      {
        name: 400,
        message: `Unable to update workplace reference.`,
      },
    ];
  }

  protected save(): void {
    this.subscriptions.add(
      this.establishmentService
        .updateLocalIdentifiers(this.generateRequest())
        .pipe(take(1))
        .subscribe(
          (data) => {
            const updatedReferences = this.references.map((workplace) => {
              const updated = find(data.localIdentifiers, ['uid', workplace.uid]);
              return {
                ...workplace,
                ...{ localIdentifier: updated.value },
              };
            }) as Workplace[];
            this.bulkUploadService.setWorkplaceReferences(updatedReferences);
            this.router.navigate(this.return.url);
          },
          (error: HttpErrorResponse) => this.onError(error),
        ),
    );
  }

  public setReturn(): void {
    this.bulkUploadService.setReturnTo({ url: ['/dev/bulk-upload/workplace-references'] });
  }

  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  protected generateRequest(): LocalIdentifiersRequest {
    return {
      localIdentifiers: Object.keys(this.form.value).map((key) => ({
        uid: key.replace('reference-', ''),
        value: this.form.value[key],
      })),
    };
  }

  private checkDuplicates(group: FormGroup) {
    const controls = Object.values(group.controls);
    const dupes = ArrayUtil.getDuplicates(controls, 'value');
    dupes.forEach((dupe: AbstractControl) => dupe.setErrors({ duplicate: true }));
  }
}
