import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EthnicityService } from '@core/services/ethnicity.service';
import { WorkerService } from '@core/services/worker.service';

import { QuestionComponent } from '../question/question.component';

@Component({
  selector: 'app-ethnicity',
  templateUrl: './ethnicity.component.html',
})
export class EthnicityComponent extends QuestionComponent {
  public ethnicities: any = {};

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected route: ActivatedRoute,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected workerService: WorkerService,
    private ethnicityService: EthnicityService
  ) {
    super(formBuilder, router, route, backService, errorSummaryService, workerService);

    this.subscriptions.add(this.ethnicityService.getEthnicities().subscribe(res => (this.ethnicities = res.byGroup)));

    this.form = this.formBuilder.group({
      ethnicity: null,
    });
  }

  init() {
    if (this.worker.ethnicity) {
      this.form.patchValue({
        ethnicity: this.worker.ethnicity.ethnicityId,
      });
    }

    this.next = this.getRoutePath('nationality');
    this.previous = this.getRoutePath('disability');
  }

  generateUpdateProps() {
    const { ethnicity } = this.form.value;

    return ethnicity
      ? {
          ethnicity: {
            ethnicityId: parseInt(ethnicity, 10),
          },
        }
      : null;
  }

  ethnicitiesUngrouped() {
    return this.ethnicities[''];
  }

  ethnicityGroups() {
    return Object.keys(this.ethnicities).filter(e => e.length);
  }
}
