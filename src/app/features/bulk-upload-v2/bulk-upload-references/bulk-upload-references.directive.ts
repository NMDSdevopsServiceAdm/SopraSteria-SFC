import { AfterViewInit, Directive, ElementRef, ViewChild } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { ArrayUtil } from '@core/utils/array-util';

@Directive()
export class BulkUploadReferencesDirective implements AfterViewInit {
  @ViewChild('formEl') formEl: ElementRef;

  constructor(protected errorSummaryService: ErrorSummaryService) {}

  ngAfterViewInit(): void {
    this.errorSummaryService.formEl$.next(this.formEl);
  }

  public checkDuplicates(group: FormGroup): void {
    const controls = Object.values(group.controls);
    const dupes = ArrayUtil.getDuplicates(controls, 'value');
    dupes.forEach((dupe: AbstractControl) => dupe.setErrors({ duplicate: true }));
  }
}
