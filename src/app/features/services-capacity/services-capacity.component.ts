import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { EstablishmentService } from '../../core/services/establishment.service';
import { MessageService } from '../../core/services/message.service';

@Component({
  selector: 'app-services-capacity',
  templateUrl: './services-capacity.component.html',
  styleUrls: ['./services-capacity.component.scss'],
})
export class ServicesCapacityComponent implements OnInit, OnDestroy {
  form: FormGroup;
  capacitiesAvailable: object;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private establishmentService: EstablishmentService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.form = this.fb.group({});

    this.subscriptions.add(
      this.establishmentService.getCapacity(true).subscribe(data => {
        this.capacitiesAvailable = data.allServiceCapacities;

        data.allServiceCapacities.forEach(service => {
          service.questions.forEach(question => {
            let answer = data.capacities ? data.capacities.find(cc => question.questionId === cc.questionId) : null;
            answer = answer ? answer.answer : '';
            this.form.registerControl(
              question.questionId.toString(),
              this.fb.control(parseFloat(answer), [Validators.required])
            );
          });
        });
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.messageService.clearAll();
  }

  submitHandler(): void {
    if (this.form.valid) {
      this.subscriptions.add(
        this.establishmentService
          .postCapacity(this.formToApi())
          .subscribe(() => this.router.navigate(['/share-options']))
      );
    } else {
      this.messageService.clearError();
      this.messageService.show('error', 'Please fill the required fields.');
    }
  }

  private formToApi() {
    return Object.entries(this.form.value).map(([key, value]) => ({ questionId: parseFloat(key), answer: value }));
  }
}
