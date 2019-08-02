import { Component, OnDestroy, OnInit } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { URLStructure } from '@core/model/url.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-confirm-vacancies',
  templateUrl: './confirm-vacancies.component.html',
})
export class ConfirmVacanciesComponent implements OnInit, OnDestroy {
  public establishment: Establishment;
  public return: URLStructure;
  private subscriptions: Subscription = new Subscription();

  constructor(private establishmentService: EstablishmentService) {}

  ngOnInit() {
    this.establishment = this.establishmentService.establishment;

    this.return = this.establishmentService.returnTo
      ? this.establishmentService.returnTo
      : { url: ['/workplace', this.establishment.uid, 'starters'] };
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
