import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ServiceGroup } from '@core/model/services.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';

import { Question } from '../question/question.component';

@Component({
  selector: 'app-other-services',
  templateUrl: './other-services.component.html',
})
export class OtherServicesComponent extends Question {
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
      this.establishmentService.getAllServices(this.establishment.id).subscribe(serviceGroups => {
        this.serviceGroups = serviceGroups;
        this.serviceGroups.map(group => {
          group.services.map(service => {
            if (service.isMyService) {
              this.form.get('otherServices').value.push(service.id);
            }
          });
        });
      })
    );

    this.previous = ['/workplace', `${this.establishment.id}`, 'type-of-employer'];
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
        return { id };
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
          this.next = response.capacities.length
            ? ['/workplace', `${this.establishment.id}`, 'capacity-of-services']
            : ['/workplace', `${this.establishment.id}`, 'service-users'];
          this.navigate();
        },
        error => this.onError(error)
      )
    );
  }
}
