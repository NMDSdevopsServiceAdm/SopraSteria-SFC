import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { QualificationLevel } from '@core/model/qualification.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { QualificationService } from '@core/services/qualification.service';
import { WorkerService } from '@core/services/worker.service';

import { QuestionComponent } from '../question/question.component';

@Component({
  selector: 'app-other-qualifications-level',
  templateUrl: './other-qualifications-level.component.html',
})
export class OtherQualificationsLevelComponent extends QuestionComponent {
  public qualifications: QualificationLevel[];

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected workerService: WorkerService,
    private qualificationService: QualificationService
  ) {
    super(formBuilder, router, backService, errorSummaryService, workerService);

    this.form = this.formBuilder.group({
      qualification: [null, Validators.required],
    });
  }

  init() {
    if (this.worker.otherQualification !== 'Yes') {
      this.router.navigate(['/worker', this.worker.uid, 'other-qualifications'], { replaceUrl: true });
    }

    this.subscriptions.add(
      this.qualificationService.getQualifications().subscribe(qualifications => {
        this.qualifications = qualifications;
      })
    );

    if (this.worker.highestQualification) {
      this.form.patchValue({
        qualification: this.worker.highestQualification.qualificationId,
      });
    }

    this.next = ['/worker', this.worker.uid, 'check-answers'];
    this.previous = ['/worker', this.worker.uid, 'other-qualifications'];
  }

  setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'qualification',
        type: [
          {
            name: 'required',
            message: 'Please fill required fields.',
          },
        ],
      },
    ];
  }

  generateUpdateProps() {
    const { qualification } = this.form.value;

    return {
      highestQualification: {
        qualificationId: parseInt(qualification, 10),
      },
    };
  }
}
