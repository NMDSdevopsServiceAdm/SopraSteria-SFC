import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Qualification, QualificationType } from '@core/model/qualification.model';
import { Worker } from '@core/model/worker.model';
import { WorkerService } from '@core/services/worker.service';
import * as moment from 'moment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-qualification-form',
  templateUrl: './qualification-form.component.html',
})
export class QualificationFormComponent implements OnInit, OnDestroy {
  @Input() worker: Worker;
  @Input() group: FormGroup;
  @Input() type: { key: string; value: string };
  @Input() qualification: Qualification;
  @Input() yearValidators: ValidatorFn[];
  public qualifications: Qualification[];
  private subscriptions: Subscription = new Subscription();

  constructor(private workerService: WorkerService) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.workerService
        .getAvailableQualifcations(this.worker.uid, this.type.value as QualificationType)
        .subscribe(qualifications => {
          this.qualifications = qualifications;
        })
    );

    this.group.get('qualification').valueChanges.subscribe(value => {
      const year = this.group.get('year');
      const extraValidators: ValidatorFn[] = [];
      const qualification = this.qualifications.find(qualification => (qualification.id = value));

      year.clearValidators();

      if (qualification.from) {
        const from = moment(qualification.from);
        extraValidators.push(Validators.min(from.year()));
      }

      if (qualification.until) {
        const until = moment(qualification.until);
        extraValidators.push(Validators.max(until.year()));
      }

      year.setValidators(this.yearValidators.concat(extraValidators));
      year.updateValueAndValidity();
    });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
