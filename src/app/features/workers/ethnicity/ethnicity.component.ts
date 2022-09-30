import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { EthnicityService } from '@core/services/ethnicity.service';
import { WorkerService } from '@core/services/worker.service';

import { QuestionComponent } from '../question/question.component';

@Component({
  selector: 'app-ethnicity',
  templateUrl: './ethnicity.component.html',
})
export class EthnicityComponent extends QuestionComponent {
  public ethnicities: any = {};
  public section = 'Personal details';
  private nationalityPath: string[];

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected route: ActivatedRoute,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected workerService: WorkerService,
    protected establishmentService: EstablishmentService,
    private ethnicityService: EthnicityService,
  ) {
    super(formBuilder, router, route, backService, errorSummaryService, workerService, establishmentService);

    this.subscriptions.add(this.ethnicityService.getEthnicities().subscribe((res) => (this.ethnicities = res.byGroup)));

    this.form = this.formBuilder.group({
      ethnicityGroup: null,
      ethnicity: null,
    });
  }

  init() {
    this.insideFlow = this.route.snapshot.parent.url[0].path !== 'staff-record-summary';
    this.setUpPageRouting();
    if (this.worker.ethnicity) {
      this.prefill();
    }
  }

  generateUpdateProps() {
    const { ethnicity } = this.form.value;
    return ethnicity
      ? {
          ethnicity: {
            ethnicityId: parseInt(ethnicity, 10),
          },
        }
      : {
          ethnicity: {
            ethnicityId: null,
            ethnicity: null,
          },
        };
  }

  ethnicitiesUngrouped() {
    return this.ethnicities[''];
  }

  ethnicityGroups() {
    return Object.keys(this.ethnicities).filter((e) => e.length);
  }

  private setUpPageRouting() {
    this.staffRecordSummaryPath = this.getRoutePath('staff-record-summary');
    this.nationalityPath = this.getRoutePath('nationality');

    if (this.insideFlow) {
      this.backService.setBackLink({ url: this.getRoutePath('disability') });
      this.skipRoute = this.nationalityPath;
      this.next = this.nationalityPath;
    } else {
      this.return = { url: this.staffRecordSummaryPath };
      this.backService.setBackLink({ url: this.staffRecordSummaryPath });
    }
  }

  private prefill() {
    this.form.patchValue({
      ethnicity: this.worker.ethnicity.ethnicityId,
    });
  }
}
