import { Component } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Ethnicity, EthnicityResponse } from '@core/model/ethnicity.model';
import { BackLinkService } from '@core/services/backLink.service';
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
  public ethnicity: Ethnicity;
  public section = 'Personal details';
  public doNotKnowValue = `Don't know`;
  public groupOptions = [
    { value: 'White', tag: 'White' },
    { value: 'Mixed / multiple ethnic groups', tag: 'Mixed or Multiple ethnic groups' },
    { value: 'Asian / Asian British', tag: 'Asian or Asian British' },
    { value: 'Black / African / Caribbean / Black British', tag: 'Black, African, Caribbean or Black British' },
    { value: 'Other ethnic group', tag: 'Other ethnic group' },
  ];
  public savedStateEthnicity = null;
  public savedStateEthnicityGroup = null;

  constructor(
    protected formBuilder: UntypedFormBuilder,
    protected router: Router,
    protected route: ActivatedRoute,
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected workerService: WorkerService,
    protected establishmentService: EstablishmentService,
    private ethnicityService: EthnicityService,
  ) {
    super(formBuilder, router, route, backLinkService, errorSummaryService, workerService, establishmentService);
    this.form = this.formBuilder.group({
      ethnicityGroup: null,
      ethnicity: null,
    });
  }

  init() {
    this.getAndSetEthnicityData();
    this.next = this.getRoutePath('nationality');
    this.subscriptions.add(
      this.form.get('ethnicity').valueChanges.subscribe((value) => {
        if (value !== null) {
          this.savedStateEthnicity = value;
          this.savedStateEthnicityGroup = this.form.get('ethnicityGroup').value;
        }
      }),
    );
    this.subscriptions.add(
      this.form.get('ethnicityGroup').valueChanges.subscribe((value) => {
        this.submitted = false;
        this.form.get('ethnicity').clearValidators();
        if (value !== `Don't know`) {
          this.form.get('ethnicity').setValidators(Validators.required);
        } else {
          this.form.get('ethnicityGroup').setValue(this.doNotKnowValue, { emitEvent: false });
        }
        if (value === this.savedStateEthnicityGroup) {
          this.form.patchValue({
            ethnicity: this.savedStateEthnicity,
          });
        } else {
          this.form.get('ethnicity').setValue(null, { emitEvent: false });
          this.form.get('ethnicity').updateValueAndValidity();
        }
      }),
    );
  }

  getAndSetEthnicityData() {
    this.subscriptions.add(
      this.ethnicityService.getEthnicities().subscribe((ethnicityData) => {
        const transformedEthnicityData = this.transformEthnicityData(ethnicityData);
        this.ethnicitiesByGroup = transformedEthnicityData.byGroup;
        this.ethnicity = transformedEthnicityData.list.find(
          (ethnicityObject) => ethnicityObject.id === this.worker.ethnicity?.ethnicityId,
        );
        if (this.worker.ethnicity) {
          this.prefill();
        }
      }),
    );
  }

  //text ethnicity pulled from DB can't currently be changed due to LA but needs changing on frontend hence temporary transform function AP 06/10/22
  transformEthnicityData(ethnicityData): EthnicityResponse {
    const ethnicityDataByGroup = ethnicityData.byGroup;
    ethnicityDataByGroup['White'][0].ethnicity = 'English, Welsh, Scottish, Northen Irish or British';
    ethnicityDataByGroup['Mixed / multiple ethnic groups'][3].ethnicity =
      'Any other Mixed or Multiple ethnic background';
    ethnicityDataByGroup['Black / African / Caribbean / Black British'][2].ethnicity =
      'Any other Black, African or Caribbean background';
    ethnicityData['byGroup'] = ethnicityDataByGroup;
    return ethnicityData;
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

  private prefill() {
    this.form.patchValue({
      ethnicityGroup: this.ethnicity.group,
      ethnicity: this.worker.ethnicity.ethnicityId,
    });
  }

  protected addErrorLinkFunctionality(): void {
    if (!this.errorSummaryService.formEl$.value) {
      this.errorSummaryService.formEl$.next(this.formEl);
    }
  }
}
