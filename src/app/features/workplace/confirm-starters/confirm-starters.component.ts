import { Component, OnDestroy, OnInit } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-confirm-starters',
  templateUrl: './confirm-starters.component.html',
})
export class ConfirmStartersComponent implements OnInit, OnDestroy {
  public establishment: Establishment;
  private subscriptions: Subscription = new Subscription();

  constructor(private establishmentService: EstablishmentService) {}

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
}
