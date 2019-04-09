import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Qualification } from '@core/model/qualification.model';
import { Worker } from '@core/model/worker.model';
import { WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-qualification-form',
  templateUrl: './qualification-form.component.html',
})
export class QualificationFormComponent implements OnInit, OnDestroy {
  @Input() worker: Worker;
  @Input() parentForm: FormGroup;
  @Input() qualificationId: string;
  public qualifications: Qualification[];
  private subscriptions: Subscription = new Subscription();

  constructor(private workerService: WorkerService) {}

  ngOnInit(): void {
    this.parentForm.patchValue({
      qualification: null,
      year: null,
      notes: null,
      submitted: false,
    });
    this.parentForm.get('qualification').markAsUntouched();

    this.subscriptions.add(
      this.workerService
        .getAvailableQualifcations(this.worker.uid, this.parentForm.get('type').value)
        .subscribe(qualifications => {
          this.qualifications = qualifications;
        })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
