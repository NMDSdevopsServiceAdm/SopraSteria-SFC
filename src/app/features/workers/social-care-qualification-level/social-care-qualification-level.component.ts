import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Worker } from 'src/app/core/model/worker.model';
import { MessageService } from 'src/app/core/services/message.service';
import { WorkerEditResponse, WorkerService } from 'src/app/core/services/worker.service';
import { QualificationService } from 'src/app/core/services/qualification.service';
import { Qualification } from 'src/app/core/model/qualification.model';

@Component({
  selector: 'app-social-care-qualification-level',
  templateUrl: './social-care-qualification-level.component.html',
})
export class SocialCareQualificationLevelComponent implements OnInit, OnDestroy {
  public qualifications: Qualification[];
  public form: FormGroup;
  private worker: Worker;
  private workerId: string;
  private subscriptions = [];

  constructor(
    private workerService: WorkerService,
    private messageService: MessageService,
    private formBuilder: FormBuilder,
    private router: Router,
    private qualificationService: QualificationService,
  ) {}

  ngOnInit() {
    this.form = this.formBuilder.group({
      qualification: null,
    });

    this.workerId = this.workerService.workerId;

    this.subscriptions.push(
      this.qualificationService.getQualifications().subscribe(qualifications => {
        this.qualifications = qualifications;
      })
    );

    this.subscriptions.push(
      this.workerService.getWorker(this.workerId).subscribe(worker => {
        this.worker = worker;

        if (worker.socialCareQualification) {
          this.form.patchValue({
            qualification: worker.socialCareQualification.qualificationId,
          });
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.messageService.clearAll();
  }

  async submitHandler() {
    try {
      await this.saveHandler();

      this.router.navigate(['/worker/other-qualifications']);
    } catch (err) {
      // keep typescript transpiler silent
    }
  }

  saveHandler(): Promise<WorkerEditResponse> {
    return new Promise((resolve, reject) => {
      const { qualification } = this.form.controls;
      this.messageService.clearError();

      if (this.form.valid) {
        const worker = this.worker || ({} as Worker);
        worker.socialCareQualification = {
          qualificationId: parseInt(qualification.value, 10),
        };

        this.subscriptions.push(this.workerService.setWorker(worker).subscribe(resolve, reject));
      } else {
        reject();
      }
    });
  }
}
