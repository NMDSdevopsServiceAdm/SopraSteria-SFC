import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Directive, ElementRef, ViewChild } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorDefinition, ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment, LocalIdentifiersRequest } from '@core/model/establishment.model';
import { Workplace, WorkplaceDataOwner } from '@core/model/my-workplaces.model';
import { Worker } from '@core/model/worker.model';
import { AlertService } from '@core/services/alert.service';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { ArrayUtil } from '@core/utils/array-util';
import filter from 'lodash/filter';
import orderBy from 'lodash/orderBy';

@Directive()
export class BulkUploadReferencesDirective implements AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;
  public form: UntypedFormGroup;
  public submitted = false;
  public references: Array<Workplace | Worker> = [];
  public maxLength = 50;
  public formErrorsMap: ErrorDetails[] = [];
  public serverError: string;
  public serverErrorsMap: ErrorDefinition[] = [];
  public showToggles = false;

  constructor(
    protected errorSummaryService: ErrorSummaryService,
    protected formBuilder: UntypedFormBuilder,
    protected alertService: AlertService,
    protected backService: BackService,
    protected router: Router,
  ) {}

  ngAfterViewInit(): void {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  protected filterWorkplaceReferences(
    references: [Workplace],
    primaryWorkplace: Establishment,
    withLocalIdNull: boolean,
  ) {
    const filteredRef = filter(references, (reference: Workplace) => {
      if (reference.ustatus === 'PENDING') return false;
      if (primaryWorkplace.isParent)
        return reference.dataOwner === WorkplaceDataOwner.Parent || reference.uid === primaryWorkplace.uid;
      return reference.dataOwner === WorkplaceDataOwner.Workplace;
    });
    if (withLocalIdNull) {
      this.references = orderBy(
        filteredRef,
        [
          (workplace: Workplace) => workplace.localIdentifier !== null,
          (workplace: Workplace) => workplace.name.toLowerCase(),
        ],
        ['asc'],
      );
      return;
    }
    this.references = orderBy(filteredRef, [(workplace: Workplace) => workplace.name.toLowerCase()], ['asc']);
  }
  protected setWorkerServerErrors() {
    this.serverErrorsMap = [
      {
        name: 500,
        message: 'Service unavailable.',
      },
      {
        name: 400,
        message: `Unable to update staff reference.`,
      },
    ];
  }
  protected setWorkplaceServerErrors() {
    this.serverErrorsMap = [
      {
        name: 500,
        message: 'Service unavailable.',
      },
      {
        name: 400,
        message: `Unable to update workplace reference.`,
      },
    ];
  }
  protected setupForm(): void {
    this.submitted = false;
    this.form = this.formBuilder.group(
      {},
      {
        validator: this.checkDuplicates,
      },
    );
    this.references.forEach((reference: Workplace | Worker) => {
      this.form.addControl(
        `reference-${reference.uid}`,
        new UntypedFormControl(reference.localIdentifier, {
          validators: [Validators.required, Validators.maxLength(this.maxLength)],
          updateOn: 'submit',
        }),
      );

      this.formErrorsMap.push({
        item: `reference-${reference.uid}`,
        type: [
          {
            name: 'required',
            message: `Enter a unique reference for ${reference['name'] ? reference['name'] : reference['nameOrId']}`,
          },
          {
            name: 'maxlength',
            message: `Reference must be ${this.maxLength} characters or fewer`,
          },
          {
            name: 'duplicate',
            message: `This reference matches another, it needs to be unique`,
          },
        ],
      });
    });
  }

  public checkDuplicates(group: UntypedFormGroup): void {
    const controls = Object.values(group.controls);
    controls.map((control) => {
      if (control?.errors?.duplicate) {
        if (Object.keys(control.errors).length > 1) {
          delete control.errors.duplicate;
        } else {
          control.setErrors(null);
        }
      }
    });
    const dupes = ArrayUtil.getDuplicates(controls, 'value').filter((dupe) => dupe.dirty);
    dupes.map((dupe: AbstractControl) => dupe.setErrors({ ...dupe.errors, duplicate: true }));
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

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected save(): void {}

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
      this.serverErrorsMap[1].message += `This reference matches another, it needs to be unique`;
    }

    this.serverError = this.errorSummaryService.getServerErrorMessage(response.status, this.serverErrorsMap);
    this.errorSummaryService.scrollToErrorSummary();
  }

  protected anyFilledReferences(): boolean {
    return this.references.some((reference) => reference.localIdentifier !== null);
  }

  protected setBackLink(returnTo): void {
    this.backService.setBackLink(returnTo);
  }

  protected nextMissingPage(url, missingReferencesLeft: boolean = false): void {
    this.router.navigate(url).then(() => {
      if (url[url.length - 1] === '/bulk-upload' && !missingReferencesLeft) {
        this.alertService.addAlert({
          type: 'success',
          message: 'All workplace and staff references have been added.',
        });
      }
    });
  }
}
