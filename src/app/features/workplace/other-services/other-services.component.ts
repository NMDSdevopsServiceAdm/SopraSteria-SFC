import { BackService } from '@core/services/back.service';
import { Component } from '@angular/core';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Question } from '../question/question.component';
import { Router } from '@angular/router';
import { ServiceGroup, Service } from '@core/model/services.model';
import { HttpErrorResponse } from '@angular/common/http';
import { filter } from 'lodash';

@Component({
  selector: 'app-other-services',
  templateUrl: './other-services.component.html',
})
export class OtherServicesComponent extends Question {
  private additionalOtherServiceMaxLength = 120;
  private allServices: Array<Service> = [];
  public renderForm = false;
  public serviceGroups: ServiceGroup[];

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected establishmentService: EstablishmentService
  ) {
    super(formBuilder, router, backService, errorSummaryService, establishmentService);

    this.form = this.formBuilder.group({
      otherServices: [[], null],
    });
  }

  protected init() {
    this.subscriptions.add(
      this.establishmentService.getAllServices(this.establishment.id).subscribe(
        serviceGroups => {
          this.serviceGroups = serviceGroups;
          this.serviceGroups.map(group => {
            group.services.map(service => {
              if (service.isMyService) {
                this.form.get('otherServices').value.push(service.id);
              }
            });
          });
          this.serviceGroups.forEach((data: ServiceGroup) => this.allServices.push(...data.services));
        },
        (error: HttpErrorResponse) => {
          this.serverError = this.errorSummaryService.getServerErrorMessage(error.status, this.serverErrorsMap);
          this.errorSummaryService.scrollToErrorSummary();
        },
        () => this.updateForm()
      )
    );

    this.previous = ['/workplace', `${this.establishment.id}`, 'type-of-employer'];
  }

  private updateForm(): void {
    this.allServices.forEach((service: Service) => {
      if (service.other) {
        this.form.addControl(
          `additionalOtherService${service.id}`,
          new FormControl(service.other, [Validators.maxLength(this.additionalOtherServiceMaxLength)])
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

      this.renderForm = true;
    });
  }

  public toggle(target: HTMLInputElement) {
    const value = parseInt(target.value, 10);
    const selected = this.form.get('otherServices').value;

    if (target.checked) {
      if (!selected.includes(value)) {
        selected.push(value);
      }
    } else {
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
    const { otherServices } = this.form.value;

    return {
      services: otherServices.map(id => {
        const service = { id };
        const otherService: Service = filter(this.allServices, { id: id })[0];

        if (otherService.other) {
          service['other'] = this.form.get(`additionalOtherService${id}`).value;
        }

        return service;
      }),
    };
  }

  protected updateEstablishment(props) {
    this.subscriptions.add(
      this.establishmentService
        .updateOtherServices(this.establishment.id, props)
        .subscribe(data => this._onSuccess(data), error => this.onError(error))
    );
  }

  protected _onSuccess(data) {
    this.establishmentService.setState({ ...this.establishment, ...data });
    this.subscriptions.add(
      this.establishmentService.getCapacity(this.establishment.id, true).subscribe(
        response => {
          this.next =
            response.allServiceCapacities && response.allServiceCapacities.length
              ? ['/workplace', `${this.establishment.id}`, 'capacity-of-services']
              : ['/workplace', `${this.establishment.id}`, 'service-users'];
          this.navigate();
        },
        error => this.onError(error)
      )
    );
  }
}
