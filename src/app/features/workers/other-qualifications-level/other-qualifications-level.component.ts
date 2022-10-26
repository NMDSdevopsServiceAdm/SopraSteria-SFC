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
  public insideOtherQualificationsLevelSummaryFlow: boolean;

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
    this.insideOtherQualificationsLevelSummaryFlow =
      this.route.snapshot.parent.url[0].path === 'other-qualifications-level-summary-flow';
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
    if (this.insideFlow && !this.insideOtherQualificationsLevelSummaryFlow) {
      this.previous = this.getRoutePath('other-qualifications');
      this.skipRoute = this.getRoutePath('staff-record-summary-flow');
      this.next = this.getRoutePath('staff-record-summary-flow');
    } else if (this.insideOtherQualificationsLevelSummaryFlow) {
      this.next = this.staffRecordSummaryPath;
      this.previous = [
        '/workplace',
        this.workplace.uid,
        'staff-record',
        this.worker.uid,
        'staff-record-summary',
        'other-qualifications',
      ];
    } else {
      this.previous = this.staffRecordSummaryPath;
      this.next = this.staffRecordSummaryPath;
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
