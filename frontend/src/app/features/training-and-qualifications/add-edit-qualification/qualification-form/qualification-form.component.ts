import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { INT_PATTERN } from '@core/constants/constants';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { Qualification } from '@core/model/qualification.model';
import { Worker } from '@core/model/worker.model';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-qualification-form',
  templateUrl: './qualification-form.component.html',
})
export class QualificationFormComponent implements OnInit, OnDestroy {
  @Input() worker: Worker;
  @Input() workplace: Establishment;
  @Input() form: UntypedFormGroup;
  @Input() preselectedQualification: Qualification;
  @Input() notesMaxLength: number;
  @Input() submitted: boolean;
  @Input() formErrorsMap: Array<ErrorDetails>;

  public qualifications: Qualification[];
  public intPattern = INT_PATTERN.toString();
  private subscriptions: Subscription = new Subscription();
  public notesValue = '';
  public remainingCharacterCount: number;

  constructor(private errorSummaryService: ErrorSummaryService) {
    this.intPattern = this.intPattern.substring(1, this.intPattern.length - 1);
  }

  ngOnInit(): void {
    this.remainingCharacterCount = this.notesMaxLength;
  }

  public handleOnInput(event: Event): void {
    this.notesValue = (<HTMLInputElement>event.target).value;
    this.remainingCharacterCount = this.notesMaxLength - this.notesValue.length;
  }

  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(item).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(item, errorType, this.formErrorsMap);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
