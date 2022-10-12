import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { QualificationLevel } from '@core/model/qualification.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { QualificationService } from '@core/services/qualification.service';
import { WorkerService } from '@core/services/worker.service';

import { QuestionComponent } from '../question/question.component';

@Component({
  selector: 'app-other-qualifications-level',
  templateUrl: './other-qualifications-level.component.html',
})
export class OtherQualificationsLevelComponent extends QuestionComponent {
  public qualifications: QualificationLevel[];
  public section = 'Training and qualifications';

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected route: ActivatedRoute,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected workerService: WorkerService,
    protected establishmentService: EstablishmentService,
    private qualificationService: QualificationService,
  ) {
    super(formBuilder, router, route, backService, errorSummaryService, workerService, establishmentService);

    this.form = this.formBuilder.group({
      qualification: [null, Validators.required],
    });
  }

  init(): void {
    this.insideFlow = this.route.snapshot.parent.url[0].path !== 'staff-record-summary';
    this.getAndSetQualifications();
    this.setUpPageRouting();

    if (this.worker.highestQualification) {
      this.prefill();
    }
  }

  private prefill(): void {
    this.form.patchValue({
      qualification: this.worker.highestQualification.qualificationId,
    });
  }

  public getAndSetQualifications(): void {
    this.subscriptions.add(
      this.qualificationService.getQualifications().subscribe((qualifications) => {
        this.qualifications = qualifications;
      }),
    );
  }

  private setUpPageRouting(): void {
    this.staffRecordSummaryPath = this.getRoutePath('staff-record-summary');

    if (this.insideFlow) {
      this.previous = this.getRoutePath('other-qualifications');
      this.skipRoute = this.staffRecordSummaryPath;
      this.next = this.staffRecordSummaryPath;
    } else {
      this.return = { url: this.staffRecordSummaryPath };
      this.backService.setBackLink({ url: this.staffRecordSummaryPath });
    }
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

  generateUpdateProps(): unknown {
    const { qualification } = this.form.value;
    return {
      highestQualification: {
        qualificationId: parseInt(qualification, 10),
      },
    };
  }
}
