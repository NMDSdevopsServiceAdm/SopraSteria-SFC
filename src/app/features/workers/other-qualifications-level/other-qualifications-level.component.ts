import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Qualification } from '@core/model/qualification.model';
import { Worker } from '@core/model/worker.model';
import { MessageService } from '@core/services/message.service';
import { QualificationService } from '@core/services/qualification.service';
import { WorkerEditResponse, WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';

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
    private route: ActivatedRoute,
    private router: Router,
    private qualificationService: QualificationService
  ) {
    this.saveHandler = this.saveHandler.bind(this);
  }

  ngOnInit() {
    this.worker = this.route.parent.snapshot.data.worker;

    if (this.worker.otherQualification !== 'Yes') {
      this.router.navigate(['/worker', this.worker.uid, 'other-qualifications'], { replaceUrl: true });
    }

    this.subscriptions.add(
      this.qualificationService.getQualifications().subscribe(qualifications => {
        this.qualifications = qualifications;
      })
    );

    this.form = this.formBuilder.group({
      qualification: [null, Validators.required],
    });

    if (this.worker.highestQualification) {
      this.form.patchValue({
        qualification: this.worker.highestQualification.qualificationId,
      });
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.messageService.clearAll();
  }

  async submitHandler() {
    try {
      await this.saveHandler();

      this.router.navigate(['summary']);
    } catch (err) {
      // keep typescript transpiler silent
    }
  }

  saveHandler(): Promise<WorkerEditResponse> {
    return new Promise((resolve, reject) => {
      const { qualification } = this.form.controls;
      const selectedQualification = this.qualifications.filter(q => q.id === parseInt(qualification.value, 10)).pop();
      this.messageService.clearError();

      if (this.form.valid) {
        const worker = this.worker || ({} as Worker);
        worker.highestQualification = {
          qualificationId: selectedQualification.id,
          title: selectedQualification.level,
        };

        this.subscriptions.add(this.workerService.setWorker(worker).subscribe(resolve, reject));
      } else {
        if (qualification.errors.required) {
          this.messageService.show('error', 'Please fill required fields.');
        }

        reject();
      }
    });
  }
}
