import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';

import { QuestionComponent } from '../question/question.component';

@Component({
  selector: 'app-other-qualifications',
  templateUrl: './other-qualifications.component.html',
})
export class OtherQualificationsComponent extends QuestionComponent {
  public answersAvailable = [
    { value: 'Yes', tag: 'Yes' },
    { value: 'No', tag: 'No' },
    { value: `Don't know`, tag: 'I do not know' },
  ];

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected route: ActivatedRoute,
    protected backService: BackService,
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected workerService: WorkerService,
    protected establishmentService: EstablishmentService,
  ) {
    super(
      formBuilder,
      router,
      route,
      backService,
      backLinkService,
      errorSummaryService,
      workerService,
      establishmentService,
    );

    this.form = this.formBuilder.group({
      otherQualification: null,
    });
  }

  init(): void {
    if (this.worker.otherQualification) {
      this.prefill();
    }

    this.next = this.getRoutePath('confirm-staff-record');
  }

  private prefill(): void {
    this.form.patchValue({
      otherQualification: this.worker.otherQualification,
    });
  }

  generateUpdateProps(): unknown {
    const { otherQualification } = this.form.value;
    if (!otherQualification) {
      return null;
    }
    return {
      otherQualification,
    };
  }

  onSuccess(): void {
    const { otherQualification } = this.form.value;

    const summaryRecordUrl = this.getRoutePath('');
    if (otherQualification === 'Yes') {
      if (this.insideFlow) {
        this.next = this.getRoutePath('other-qualifications-level');
      } else {
        this.next = summaryRecordUrl;
        this.next.push('other-qualifications-level');
      }
    } else {
      !this.insideFlow && (this.next = summaryRecordUrl);
    }
  }
}
