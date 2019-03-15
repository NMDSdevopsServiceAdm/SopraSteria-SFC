import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Qualification } from '@core/model/qualification.model';
import { Worker } from '@core/model/worker.model';
import { MessageService } from '@core/services/message.service';
import { QualificationService } from '@core/services/qualification.service';
import { WorkerEditResponse, WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-other-qualifications-level',
  templateUrl: './other-qualifications-level.component.html',
})
export class OtherQualificationsLevelComponent implements OnInit, OnDestroy {
  public qualifications: Qualification[];
  public form: FormGroup;
  private worker: Worker;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private workerService: WorkerService,
    private messageService: MessageService,
    private formBuilder: FormBuilder,
    private router: Router,
    private qualificationService: QualificationService
  ) {
    this.saveHandler = this.saveHandler.bind(this);
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      qualification: [null, Validators.required],
    });

    this.workerService.worker$.pipe(take(1)).subscribe(worker => {
      this.worker = worker;

      if (this.worker.otherQualification !== 'Yes') {
        this.router.navigate(['/worker', this.worker.uid, 'other-qualifications'], { replaceUrl: true });
      }

      if (this.worker.highestQualification) {
        this.form.patchValue({
          qualification: this.worker.highestQualification.qualificationId,
        });
      }
    });

    this.subscriptions.add(
      this.qualificationService.getQualifications().subscribe(qualifications => {
        this.qualifications = qualifications;
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.messageService.clearAll();
  }

  async submitHandler() {
    try {
      await this.saveHandler();

      this.router.navigate(['/worker', this.worker.uid, 'summary']);
    } catch (err) {
      // keep typescript transpiler silent
    }
  }

  saveHandler(): Promise<WorkerEditResponse> {
    return new Promise((resolve, reject) => {
      const { qualification } = this.form.controls;
      this.messageService.clearError();

      if (this.form.valid) {
        const props = {
          highestQualification: {
            qualificationId: parseInt(qualification.value, 10),
          },
        };

        this.subscriptions.add(
          this.workerService.updateWorker(this.worker.uid, props).subscribe(data => {
            this.workerService.setState({ ...this.worker, ...data });
            resolve();
          }, reject)
        );
      } else {
        if (qualification.errors.required) {
          this.messageService.show('error', 'Please fill required fields.');
        }

        reject();
      }
    });
  }
}
