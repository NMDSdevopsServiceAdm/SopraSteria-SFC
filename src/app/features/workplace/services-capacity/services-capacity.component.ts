import { Component } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';

import { Question } from '../question/question.component';

@Component({
  selector: 'app-services-capacity',
  templateUrl: './services-capacity.component.html',
  styleUrls: ['./services-capacity.component.scss'],
})
export class ServicesCapacityComponent extends Question {
  capacities: object;

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

  protected init(): void {
    this.subscriptions.add(
      this.establishmentService.getCapacity(this.establishment.id, true).subscribe(capacities => {
        this.capacities = capacities;

        console.log(capacities);

        capacities.allServiceCapacities.forEach(service => {
          service.questions.forEach(question => {
            this.form.addControl(question.questionId.toString(), new FormControl(false));
          });
        });

        // data.allServiceCapacities.forEach(service => {
        //   service.questions.forEach(question => {
        //     let answer = data.capacities ? data.capacities.find(cc => question.questionId === cc.questionId) : null;
        //     answer = answer ? parseInt(answer.answer, 10) : null;
        //     this.form.addControl(question.questionId.toString(), new FormControl(answer));
        //   });
        // });
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
    // const props = Object.entries(this.form.value).reduce((res, [key, value]) => {
    //   if (value) {
    //     res.push({ questionId: parseFloat(key), answer: value });
    //   }
    //   return res;
    // }, []);

    return null;
  }

  protected updateEstablishment(props): void {
    this.subscriptions.add(
      this.establishmentService
        .updateCapacity(this.establishment.id, props)
        .subscribe(data => this._onSuccess(data), error => this.onError(error))
    );
  }
}
