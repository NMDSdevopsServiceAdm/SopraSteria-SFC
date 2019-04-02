import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { EstablishmentService } from '@core/services/establishment.service';
import { MessageService } from '@core/services/message.service';
import { Subscription } from 'rxjs';

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
            answer = answer ? parseInt(answer.answer, 10) : null;
            this.form.addControl(question.questionId.toString(), new FormControl(answer));
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
      const props = Object.entries(this.form.value).reduce((res, [key, value]) => {
        if (value) {
          res.push({ questionId: parseFloat(key), answer: value });
        }
        return res;
      }, []);
      this.subscriptions.add(
        //this.establishmentService.postCapacity(props).subscribe(() => this.router.navigate(['/share-options']))
        this.establishmentService.postCapacity(props).subscribe(() => this.router.navigate(['/service-users']))
      );
    }
  }
}
