import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-check-answers',
  templateUrl: './check-answers.component.html',
})
export class CheckAnswersComponent implements OnInit, OnDestroy {
  public establishment: Establishment;
  private subscriptions: Subscription = new Subscription();

  constructor(private location: Location, private establishmentService: EstablishmentService) {}

  ngOnInit() {
    this.subscriptions.add(
      this.establishmentService.establishment$.pipe(take(1)).subscribe(establishment => {
        this.establishment = establishment;
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  goBack(event) {
    event.preventDefault();
    this.location.back();
  }
}
