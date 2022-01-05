import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Service, ServiceGroup } from '@core/model/services.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import filter from 'lodash/filter';

import { Question } from '../question/question.component';

@Component({
  selector: 'app-other-services',
  templateUrl: './other-services.component.html',
})
export class OtherServicesComponent extends Question {
  private additionalOtherServiceMaxLength = 120;
  private allServices: Array<Service> = [];
  private allOtherServices: Array<Service> = [];
  public serviceGroups: Array<ServiceGroup>;

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected establishmentService: EstablishmentService,
  ) {
    super(formBuilder, router, backService, errorSummaryService, establishmentService);

    this.form = this.formBuilder.group(
      {
        otherServices: [[], null],
        otherServicesValue: [null, null],
      },
      {
        validator: this.oneCheckboxRequiredIfYes,
      },
    );
  }

  protected init() {
    this.subscriptions.add(
      this.establishmentService.getAllServices(this.establishment.uid).subscribe(
        (serviceGroups: Array<ServiceGroup>) => {
          this.serviceGroups = serviceGroups;
          this.serviceGroups.forEach((data: ServiceGroup) => this.allServices.push(...data.services));
          this.updateForm();
        },
        (error: HttpErrorResponse) => {
          this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
          this.errorSummaryService.scrollToErrorSummary();
        },
        () => this.preFillForm(),
      ),
    );

    this.previousRoute = ['/workplace', `${this.establishment.uid}`, 'type-of-employer'];
  }

  private oneCheckboxRequiredIfYes(form: FormGroup) {
    if (form?.value?.otherServicesValue === 'Yes' && form?.value?.otherServices?.length === 0) {
      form.controls.otherServices.setErrors({
        oneCheckboxRequiredIfYes: true,
      });
    } else {
      form.controls.otherServices.setErrors(null);
    }
  }

  private updateForm(): void {
    this.formErrorsMap.push({
      item: `otherServices`,
      type: [
        {
          name: 'oneCheckboxRequiredIfYes',
          message: `Select the other services you provide`,
        },
      ],
    });

    this.allServices.forEach((service: Service) => {
      if (service.other) {
        this.form.addControl(
          `additionalOtherService${service.id}`,
          new FormControl(null, [Validators.maxLength(this.additionalOtherServiceMaxLength)]),
        );

        this.formErrorsMap.push({
          item: `additionalOtherService${service.id}`,
          type: [
            {
              name: 'maxlength',
              message: `Other service must be ${this.additionalOtherServiceMaxLength} characters or less`,
            },
          ],
        });
      }
    });
  }

  private preFillForm(): void {
    this.form.get('otherServicesValue').setValue(this.establishmentService.establishment.otherServices.value);
    const allOtherServices = this.establishmentService.establishment.otherServices;
    if (allOtherServices.value === 'Yes') {
      allOtherServices.services.forEach((data: ServiceGroup) => this.allOtherServices.push(...data.services));

      this.allOtherServices.forEach((service: Service) => {
        this.form.get('otherServices').value.push(service.id);

        if (service.other && this.form.get(`additionalOtherService${service.id}`)) {
          this.form.get(`additionalOtherService${service.id}`).setValue(service.other);
        }
      });
    }
  }

  public toggle(target: HTMLInputElement, additionalOtherServiceTextInput: string) {
    const value = parseInt(target.value, 10);
    const selected = this.form.get('otherServices').value;

    if (target.checked) {
      if (!selected.includes(value)) {
        selected.push(value);
      }
    } else {
      const otherService = this.form.get(additionalOtherServiceTextInput);
      if (otherService) {
        otherService.setValue(null);
      }
      const index = selected.indexOf(value);
      if (index >= 0) {
        selected.splice(index, 1);
      }
    }

    this.form.get('otherServices').setValue(selected);
  }

  protected setupServerErrorsMap(): void {
    this.serverErrorsMap = [
      {
        name: 400,
        message: 'Other Services could not be updated.',
      },
    ];
  }

  protected generateUpdateProps() {
    const { otherServices, otherServicesValue } = this.form.value;
    const allServicesKeys = this.allServices.map((service) => service.id);

    return {
      services: {
        value: otherServicesValue,
        services:
          otherServicesValue === 'No'
            ? []
            : otherServices
                .filter((id) => allServicesKeys.includes(id))
                .map((id) => {
                  const service = { id };
                  const otherService: Service = filter(this.allServices, { id })[0];

                  if (otherService.other) {
                    service[`other`] = this.form.get(`additionalOtherService${id}`).value;
                  }
                  return service;
                }),
      },
    };
  }

  protected updateEstablishment(props) {
    this.subscriptions.add(
      this.establishmentService.updateOtherServices(this.establishment.uid, props).subscribe(
        (data) => this._onSuccess(data),
        (error) => this.onError(error),
      ),
    );
  }

  protected _onSuccess(data) {
    this.establishmentService.setState({ ...this.establishment, ...data });
    this.subscriptions.add(
      this.establishmentService.getCapacity(this.establishment.uid, true).subscribe(
        (response) => {
          this.nextRoute =
            response.allServiceCapacities && response.allServiceCapacities.length
              ? ['/workplace', `${this.establishment.uid}`, 'capacity-of-services']
              : ['/workplace', `${this.establishment.uid}`, 'service-users'];
          this.navigate();
        },
        (error) => this.onError(error),
      ),
    );
  }
}
