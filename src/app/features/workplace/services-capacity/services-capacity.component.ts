import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { INT_PATTERN } from '@core/constants/constants';
import { ErrorDetails } from '@core/model/errorSummary.model';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import groupBy from 'lodash/groupBy';

import { Question } from '../question/question.component';

@Component({
  selector: 'app-services-capacity',
  templateUrl: './services-capacity.component.html',
})
export class ServicesCapacityComponent extends Question {
  public capacities = [];
  public capacityErrorMsg = 'Number must be between 1 and 999';
  public intPattern = INT_PATTERN.toString();
  public section = 'Services';
  public errorsSummaryErrorsMap: Array<ErrorDetails> = [];

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected establishmentService: EstablishmentService,
  ) {
    super(formBuilder, router, backService, errorSummaryService, establishmentService);
    this.intPattern = this.intPattern.substring(1, this.intPattern.length - 1);
    this.form = this.formBuilder.group({});
  }

  public generateFormGroupName(str: string): string {
    return str.replace(/^[^a-z]+|[^\w.-]+/gi, '');
  }

  public generateFormControlName(question): string {
    return question.seq + '_' + question.questionId.toString();
  }

  protected init(): void {
    this.subscriptions.add(
      this.establishmentService.getCapacity(this.establishment.uid, true).subscribe((capacities) => {
        this.capacities = capacities.allServiceCapacities;
        if (this.capacities.length === 0) {
          this.router.navigate(['/workplace', this.establishment.uid, 'other-services'], { replaceUrl: true });
        }

        this.sortServices();

        capacities.allServiceCapacities.forEach((service) => {
          const group = this.formBuilder.group({});
          const questions = service.questions;
          const id = this.generateFormGroupName(service.service);

          questions.forEach((question) => {
            const formControlName = this.generateFormControlName(question);
            group.addControl(
              formControlName,
              new FormControl(question.answer, {
                validators: [Validators.min(1), Validators.max(999), Validators.pattern(this.intPattern)],
                updateOn: 'submit',
              }),
            );

            let patternErrorMsg;

            if (question.question.includes('beds')) {
              patternErrorMsg = question.seq === 1 ? 'beds you have' : 'beds being used';
            } else if (question.question.includes('places')) {
              patternErrorMsg = question.seq === 1 ? 'places you have' : 'places being used';
            } else if (question.question.includes('people receiving care')) {
              patternErrorMsg = 'people receiving care';
            } else {
              patternErrorMsg = 'people using the service';
            }

            const errorObj = {
              item: `${id}.${formControlName}`,
              type: [
                {
                  name: 'min',
                  message: this.capacityErrorMsg,
                },
                {
                  name: 'max',
                  message: this.capacityErrorMsg,
                },
                {
                  name: 'pattern',
                  message: `Number of ${patternErrorMsg} must be a whole number`,
                },
              ],
            };

            this.formErrorsMap.push(errorObj);
            this.setupErrorSummaryErrorsMap(errorObj, service.service);
          });

          if (Object.keys(group.controls).length > 1) {
            group.setValidators([this.capacityUtilisationValidator, this.requiredValidator]);
            const overCapacityErrorMsg = questions.some((question) => question.question.includes('beds'))
              ? 'beds'
              : 'places';
            const requiredErrorMsg = questions.some((question) => question.question.includes('bed'))
              ? 'beds you have'
              : 'places you have at the moment';
            const errorObj = {
              item: id,
              type: [
                {
                  name: 'overcapacity',
                  message: `Number cannot be more than the ${overCapacityErrorMsg} you have`,
                },
                {
                  name: 'required',
                  message: `Enter how many ${requiredErrorMsg}`,
                },
              ],
            };

            this.formErrorsMap.push(errorObj);
            this.setupErrorSummaryErrorsMap(errorObj, service.service);
          }

          this.form.addControl(id, group);
        });
        console.log('formErrorsMap:', this.formErrorsMap);
        console.log('errorSummaryErrorsMap:', this.errorsSummaryErrorsMap);
      }),
    );
    this.nextRoute = ['/workplace', `${this.establishment.uid}`, 'service-users'];
    this.previousRoute = ['/workplace', `${this.establishment.uid}`, 'other-services'];
    this.skipRoute = ['/workplace', `${this.establishment.uid}`, 'service-users'];
  }

  private setupErrorSummaryErrorsMap(errorObj, service): void {
    const serviceName = service.split(': ')[1];
    const updatedErrorObj = JSON.parse(JSON.stringify(errorObj));
    updatedErrorObj.type.forEach((error) => (error.message = `${error.message} (${serviceName})`));

    this.errorsSummaryErrorsMap.push(updatedErrorObj);
  }

  protected setupServerErrorsMap(): void {
    this.serverErrorsMap = [
      {
        name: 400,
        message: 'Services Capacities could not be updated.',
      },
    ];
  }

  protected generateUpdateProps() {
    const capacities = [];
    Object.keys(this.form.controls).map((groupKey) => {
      Object.entries(this.form.get(groupKey).value).reduce((res, [key, value]) => {
        if (value) {
          const parsedValue = typeof value === 'string' ? parseInt(value, 10) : value;
          capacities.push({ questionId: parseInt(key.split('_')[1], 10), answer: parsedValue });
        }
        return res;
      }, []);
    });

    return {
      capacities,
    };
  }

  protected updateEstablishment(props): void {
    this.subscriptions.add(
      this.establishmentService.updateCapacity(this.establishment.uid, props).subscribe(
        (data) => this._onSuccess(data),
        (error) => this.onError(error),
      ),
    );
  }

  protected requiredValidator(group: FormGroup): ValidationErrors {
    const controls = [];
    Object.keys(group.controls).forEach((key) => {
      controls.push(group.get(key));
    });

    if (controls[1] && !controls[0].value && controls[1].value) {
      return controls[0].value === 0 ? null : { required: true };
    }

    return null;
  }

  protected capacityUtilisationValidator(group: FormGroup): ValidationErrors {
    const controls = [];

    Object.keys(group.controls).forEach((key) => {
      controls.push(group.get(key));
    });

    if (controls[1] && controls[0].value && controls[1].value && controls[1].value > controls[0].value) {
      return { overcapacity: { max: controls[0].value, actual: controls[1].value } };
    }

    return null;
  }

  protected sortServices() {
    const mainService = this.capacities.filter((m: any) => m.service.toLowerCase().startsWith('main service'));
    const otherServices = this.capacities.filter((m: any) => m.service.toLowerCase().startsWith('other'));

    const toSortServices = this.capacities
      .sort((a: any, b: any) => a.service.localeCompare(b.service))
      .filter((m: any) => !m.service.toLowerCase().startsWith('main service'))
      .filter((m: any) => !m.service.toLowerCase().startsWith('other'));

    const groupItemsByServiceName = groupBy(toSortServices, (m) => {
      const indexOf = m.service.indexOf(':');
      const serviceName = m.service.substring(0, indexOf);
      return serviceName;
    });

    const middleItems = [];
    for (const [key, value] of Object.entries(groupItemsByServiceName)) {
      const groupFiltered = value
        .sort((a: any, b: any) => a.service.localeCompare(b.service))
        .filter((m: any) => !m.service.toLowerCase().startsWith(`${key.toLocaleLowerCase()}: other`));

      const otherGroupFiltered = value.filter((m: any) =>
        m.service.toLowerCase().startsWith(`${key.toLocaleLowerCase()}: other`),
      );

      const groupFilterResult = [...groupFiltered, ...otherGroupFiltered];
      groupFilterResult.forEach((s) => {
        middleItems.push(s);
      });
    }

    const sortedServices = mainService.concat(middleItems).concat(otherServices);
    this.capacities = sortedServices;
  }
}
