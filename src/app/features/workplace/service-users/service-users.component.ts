import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { EstablishmentService } from '@core/services/establishment.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { Service, ServiceGroup } from '@core/model/services.model';
import { BackService } from '@core/services/back.service';
import { Question } from '@features/workplace/question/question.component';

@Component({
  selector: 'app-service-users',
  templateUrl: './service-users.component.html',
})

export class ServiceUsersComponent extends Question {
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
      serviceUsers: [[], null],
    });
  }

  protected init() {
    this.subscriptions.add(
      this.establishmentService.getAllServiceUsers().subscribe( (serviceGroups: ServiceGroup[]) => {
        this.serviceGroups = serviceGroups;
        this.serviceGroups.map((group: ServiceGroup) => {
          group.services.map((service: Service) => {
            if (service.isMyService) {
              this.form.get('serviceUsers').value.push(service.id);
            }
          });
        });
      })
    );

    this.next = ['/workplace', `${this.establishment.id}`, 'sharing-data'];
    this.subscriptions.add(
      this.establishmentService.getCapacity(this.establishment.id, true).subscribe(
        response => {
          this.previous =
            response.capacities && response.capacities.length
              ? ['/workplace', `${this.establishment.id}`, 'capacity-of-services']
              : ['/workplace', `${this.establishment.id}`, 'other-services'];
          this.navigate();
        },
        error => this.onError(error)
      )
    );
  }

  public toggle(target: HTMLInputElement) {
    const value = parseInt(target.value, 10);
    const selected = this.form.get('serviceUsers').value;

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

    this.form.get('serviceUsers').setValue(selected);
  }

  protected setupServerErrorsMap(): void {
    this.serverErrorsMap = [
      {
        name: 400,
        message: 'Services Users could not be updated.',
      },
    ];
  }

  protected generateUpdateProps() {
    const { serviceUsers } = this.form.value;

    return {
      services: serviceUsers.map(id => {
        return { id };
      }),
    };
  }

  protected updateEstablishment(props) {
    this.subscriptions.add(
      this.establishmentService
        .postServiceUsers(this.establishment.id, this.form.get('serviceUsers').value)
        .subscribe(data => this._onSuccess(data), error => this.onError(error))
    );
  }

}
