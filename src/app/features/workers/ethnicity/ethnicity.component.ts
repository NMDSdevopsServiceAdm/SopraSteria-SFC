import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Ethnicity } from '@core/model/ethnicity.model';
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
  public ethnicitiesByGroup: any = {};
  public ethnicitiy: Ethnicity;
  public section = 'Personal details';
  public doNotKnowValue = `Don't know`;
  public groupOptions = [
    { value: 'White', tag: 'White' },
    { value: 'Mixed / multiple ethnic groups', tag: 'Mixed or Multiple ethnic groups' },
    { value: 'Asian / Asian British', tag: 'Asian or Asian British' },
    { value: 'Black / African / Caribbean / Black British', tag: 'Black, African, Caribbean or Black British' },
    { value: 'Other ethnic group', tag: 'Other ethnic group' },
  ];
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
    this.form = this.formBuilder.group(
      {
        ethnicityGroup: null,
        ethnicity: null,
      },
      {
        validator: this.oneRadioRequiredIfGroupSelected,
      },
    );
  }

  init() {
    this.getAndSetEthnicityData();
    this.insideFlow = this.route.snapshot.parent.url[0].path !== 'staff-record-summary';
    this.setUpPageRouting();
  }

  getAndSetEthnicityData() {
    this.subscriptions.add(
      this.ethnicityService.getEthnicities().subscribe((ethnicityData) => {
        this.ethnicitiesByGroup = ethnicityData.byGroup;
        this.ethnicitiy = ethnicityData.list.find(
          (ethnicityObject) => ethnicityObject.id === this.worker.ethnicity.ethnicityId,
        );
        if (this.worker.ethnicity) {
          this.prefill();
        }
      }),
    );
  }

  setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'ethnicity',
        type: [
          {
            name: 'required',
            message: 'Select which best describes their ethnic background',
          },
        ],
      },
    ];
  }

  generateUpdateProps() {
    const { ethnicity } = this.form.value.ethnicityGroup === this.doNotKnowValue ? { ethnicity: 2 } : this.form.value;
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

  private oneRadioRequiredIfGroupSelected(form: FormGroup) {
    if (
      form?.value?.ethnicityGroup !== null &&
      form?.value?.ethnicityGroup !== `Don't know` &&
      form?.value?.ethnicity === null
    ) {
      form.controls.ethnicity.setErrors({
        required: true,
      });
    } else {
      form.controls.ethnicity.setErrors(null);
    }
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

  public removeSelectedEthnicities() {
    if (this.form.get('ethnicityGroup').value === this.doNotKnowValue) {
      this.form.get('ethnicityGroup').reset();
      this.form.get('ethnicityGroup').setValue(this.doNotKnowValue);
    }
    this.form.get('ethnicity').reset();
  }

  private prefill() {
    this.form.patchValue({
      ethnicityGroup: this.ethnicitiy.group,
      ethnicity: this.worker.ethnicity.ethnicityId,
    });
  }
}
