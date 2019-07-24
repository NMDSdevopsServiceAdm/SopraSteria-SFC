import { Component, OnDestroy, OnInit } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
})
export class ReportsComponent implements OnInit, OnDestroy {
  public workplace: Establishment;
  private subscriptions: Subscription = new Subscription();

  constructor(private establishmentService: EstablishmentService) {}

  ngOnInit() {
    this.subscriptions.add(
      this.establishmentService.establishment$.subscribe(workplace => (this.workplace = workplace))
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
