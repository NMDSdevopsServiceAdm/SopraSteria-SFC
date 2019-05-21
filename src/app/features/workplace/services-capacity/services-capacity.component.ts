import { BackService } from '@core/services/back.service';
import { Component } from '@angular/core';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Question } from '../question/question.component';
import { Router } from '@angular/router';
import { sortBy } from 'lodash';

@Component({
  selector: 'app-services-capacity',
  templateUrl: './services-capacity.component.html',
})
export class ServicesCapacityComponent extends Question {
  public capacities: [];
  public ready = false;

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected backService: BackService,
    protected errorSummaryService: ErrorSummaryService,
    protected establishmentService: EstablishmentService
  ) {
    super(formBuilder, router, backService, errorSummaryService, establishmentService);

    this.form = this.formBuilder.group({});
  }

  public generateId(str: string): string {
    return str.replace(/^[^a-z]+|[^\w:.-]+/gi, '');
  }

  protected init(): void {
    this.subscriptions.add(
      this.establishmentService.getCapacity(this.establishment.id, true).subscribe(capacities => {
        this.capacities = capacities.allServiceCapacities;

        capacities.allServiceCapacities.forEach((service, i) => {
          const group = this.formBuilder.group({});
          const questions = sortBy(service.questions, question => question.seq);

          const id = this.generateId(service.service);

          questions.forEach(question => {
            group.addControl(question.questionId.toString(), new FormControl(question.answer, [Validators.min(0)]));
            this.formErrorsMap.push({
              item: `${id}.${question.questionId}`,
              type: [
                {
                  name: 'min',
                  message: 'Answer must be 0 or more',
                },
              ],
            });
          });

          if (Object.keys(group.controls).length > 1) {
            group.setValidators(this.capacityUtilisationValidator);
            this.formErrorsMap.push({
              item: id,
              type: [
                {
                  name: 'overcapacity',
                  message: 'Utilisation must be lower than Capacity provided',
                },
              ],
            });
          }

          this.form.addControl(id, group);
        });

        this.ready = true;
      })
    );

    this.next = ['/workplace', `${this.establishment.id}`, 'service-users'];
    this.previous = ['/workplace', `${this.establishment.id}`, 'other-services'];
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
    Object.keys(this.form.controls).map(groupKey => {
      Object.entries(this.form.get(groupKey).value).reduce((res, [key, value]) => {
        if (value) {
          const parsedValue = typeof value === 'string' ? parseInt(value, 10) : value;
          capacities.push({ questionId: parseInt(key, 10), answer: parsedValue });
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
      this.establishmentService
        .updateCapacity(this.establishment.id, props)
        .subscribe(data => this._onSuccess(data), error => this.onError(error))
    );
  }

  protected capacityUtilisationValidator(group: FormGroup): ValidationErrors {
    const controls = [];
    Object.keys(group.controls).forEach(key => {
      controls.push(group.get(key));
    });

    if (controls[1] && controls[1].value > controls[0].value) {
      return { overcapacity: { max: controls[0].value, actual: controls[1].value } };
    }

    return null;
  }
}
