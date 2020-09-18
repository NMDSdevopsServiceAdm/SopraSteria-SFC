import { Component } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ServiceUser } from '@core/model/establishment.model';
import { ServiceForUser, ServiceUserGroup } from '@core/model/services.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { ServiceUsersService } from '@core/services/service-users.service';
import { Question } from '@features/workplace/question/question.component';
import { filter, find } from 'lodash';

@Component({
  selector: 'app-service-users',
  templateUrl: './service-users.component.html',
})
export class ServiceUsersComponent extends Question {
  public serviceUserGroups: ServiceUserGroup[];
  public allUserServices: ServiceForUser[] = [];
  public renderForm = false;
  private otherMaxLength = 120;

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected establishmentService: EstablishmentService,
    private serviceUsersService: ServiceUsersService,
  ) {
    super(formBuilder, router, backService, errorSummaryService, establishmentService);

    this.form = this.formBuilder.group({
      serviceUsers: [[], null],
    });
  }

  protected init(): void {
    this.subscriptions.add(
      this.serviceUsersService.getServiceUsers().subscribe((serviceUserGroups: ServiceUserGroup[]) => {
        this.serviceUserGroups = serviceUserGroups;
        this.serviceUserGroups.forEach((group: ServiceUserGroup) => this.allUserServices.push(...group.services));
        this.addFormControls();
      }),
    );

    this.nextRoute = ['/workplace', `${this.establishment.uid}`, 'sharing-data'];
    this.subscriptions.add(
      this.establishmentService.getCapacity(this.establishment.uid, true).subscribe(
        (response) => {
          this.previousRoute =
            response.allServiceCapacities && response.allServiceCapacities.length
              ? ['/workplace', `${this.establishment.uid}`, 'capacity-of-services']
              : ['/workplace', `${this.establishment.uid}`, 'other-services'];
          this.setBackLink();
        },
        (error) => this.onError(error),
      ),
    );
  }

  private addFormControls(): void {
    filter(this.allUserServices, { other: true }).forEach((service: ServiceForUser) => {
      this.form.addControl(
        `serviceUsers-${service.id}-otherService`,
        new FormControl(null, [Validators.maxLength(this.otherMaxLength)]),
      );

      this.formErrorsMap.push({
        item: `serviceUsers-${service.id}-otherService`,
        type: [
          {
            name: 'maxlength',
            message: `Other service users must be ${this.otherMaxLength} characters or less`,
          },
        ],
      });
    });

    if (this.establishment.serviceUsers) {
      this.establishment.serviceUsers.forEach((service: ServiceUser) => {
        this.form.get('serviceUsers').value.push(service.id);
        if (service.other) {
          this.form.get(`serviceUsers-${service.id}-otherService`).setValue(service.other);
        }
      });
    }

    this.renderForm = true;
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
        message: 'Service Users could not be updated.',
      },
    ];
  }

  protected generateUpdateProps() {
    const { serviceUsers } = this.form.value;

    return {
      serviceUsers: serviceUsers.map((id) => {
        const otherAllowed = !!find(this.allUserServices, { id, other: true });
        return {
          id,
          ...(otherAllowed && {
            other: this.form.get(`serviceUsers-${id}-otherService`).value,
          }),
        };
      }),
    };
  }

  protected updateEstablishment(props) {
    this.subscriptions.add(
      this.establishmentService.updateServiceUsers(this.establishment.uid, props).subscribe(
        (data) => this._onSuccess(data),
        (error) => this.onError(error),
      ),
    );
  }
}
