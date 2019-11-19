import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { INT_PATTERN } from '@core/constants/constants';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { Establishment } from '@core/model/establishment.model';
import { Qualification, QualificationType } from '@core/model/qualification.model';
import { Worker } from '@core/model/worker.model';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { WorkerService } from '@core/services/worker.service';
import * as moment from 'moment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-qualification-form',
  templateUrl: './qualification-form.component.html',
})
export class QualificationFormComponent implements OnInit, OnDestroy {
  @Input() worker: Worker;
  @Input() workplace: Establishment;
  @Input() form: FormGroup;
  @Input() type: { key: string; value: string };
  @Input() preselectedQualification: Qualification;
  @Input() yearValidators: ValidatorFn[];
  @Input() notesMaxLength: number;
  @Input() submitted: boolean;
  @Input() formErrorsMap: Array<ErrorDetails>;

  public qualifications: Qualification[];
  public intPattern = INT_PATTERN.toString();
  private subscriptions: Subscription = new Subscription();

  get group() {
    return this.form.get(this.type.key);
  }

  constructor(private workerService: WorkerService, private errorSummaryService: ErrorSummaryService) {
    this.intPattern = this.intPattern.substring(1, this.intPattern.length - 1);
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.workerService
        .getAvailableQualifcations(this.workplace.uid, this.worker.uid, this.type.value as QualificationType)
        .subscribe(
          qualifications => {
            if (qualifications) {
              this.qualifications = qualifications;
            }
          },
          error => {
            console.error(error.error);
          }
        )
    );

    this.group.get('qualification').valueChanges.subscribe(value => {
      const year = this.group.get('year');
      const validators: ValidatorFn[] = [];
      year.clearValidators();

      if (value) {
        const selectedQualification = this.qualifications.find(
          qualification => qualification.id === parseInt(value, 10)
        );

        if (selectedQualification && selectedQualification.from) {
          const from = moment(selectedQualification.from);
          validators.push(Validators.min(from.year()));
        }

        if (selectedQualification && selectedQualification.until) {
          const until = moment(selectedQualification.until);
          validators.push(Validators.max(until.year()));
        }
      }

      year.setValidators(this.yearValidators.concat(validators));
      year.updateValueAndValidity();
    });
  }

  public getFirstErrorMessage(item: string): string {
    const errorType = Object.keys(this.form.get(`${this.type.key}.${item}`).errors)[0];
    return this.errorSummaryService.getFormErrorMessage(`${this.type.key}.${item}`, errorType, this.formErrorsMap);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
