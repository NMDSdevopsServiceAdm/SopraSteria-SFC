import { Component } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Service, ServiceGroup } from '@core/model/services.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { ServiceUsersService } from '@core/services/service-users.service';
import { Question } from '@features/workplace/question/question.component';
import { Object } from 'aws-sdk/clients/s3';

@Component({
  selector: 'app-service-users',
  templateUrl: './service-users.component.html',
})

export class ServiceUsersComponent extends Question {
  public serviceUsersGroups: ServiceGroup[];
  private otherMaxLength = 120;

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected establishmentService: EstablishmentService,
    private serviceUsersService: ServiceUsersService
  ) {
    super(formBuilder, router, backService, errorSummaryService, establishmentService);

    this.form = this.formBuilder.group({
      serviceUsers: [[], null],
    });
  }

  protected init() {
    this.subscriptions.add(
      this.serviceUsersService.getServiceUsers(this.establishment.id).subscribe((serviceUsersGroups: ServiceGroup[]) => {
        this.serviceUsersGroups = serviceUsersGroups;
        this.serviceUsersGroups.map((group: ServiceGroup) => {
          group.services.map((service: Service) => {
            if (service.other === true) {
              const itemId = `serviceUsers-other-${service.id}`;
              this.setFormErrorsMap(itemId);
              this.form.addControl(itemId, new FormControl('', Validators.maxLength(this.otherMaxLength)));
            }
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
            response.allServiceCapacities && response.allServiceCapacities.length
              ? ['/workplace', `${this.establishment.id}`, 'capacity-of-services']
              : ['/workplace', `${this.establishment.id}`, 'other-services'];
          this.setBackLink();
        },
        error => this.onError(error)
      )
    );
    this.establishmentService.getServiceUsersChecked(this.establishment.id).subscribe( (data) => {
        console.log('establishmentService.data =>>',data);
      }
    );
  }

  private setFormErrorsMap(itemId: string): number {
    return this.formErrorsMap.push({
      item: itemId,
      type: [
        {
          name: 'maxlength',
          message: `max length is ${this.otherMaxLength}`,
        },
      ],
    });
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

  createDataForRequest() {
    const data = Object.entries(this.form.value);
    const serviceUsers = [];
    for (const { otherId, index } of this.form.value.serviceUsers.map(( otherId, index ) => ({ otherId, index }))) {
      serviceUsers.push({
        id: otherId
      });
      for (const controls of data) {
        if (serviceUsers[index].id === Number(controls[0].substr(19))) {
          serviceUsers[index] = ({
            id: otherId,
            other: controls[1]
          });
        }
      }
    }
    return serviceUsers;
  }

  protected updateEstablishment(props) {
    this.subscriptions.add(
      this.establishmentService
        .updateServiceUsers(this.establishment.id, this.createDataForRequest())
        .subscribe(data => this._onSuccess(data), error => this.onError(error))
    );
  }
}
