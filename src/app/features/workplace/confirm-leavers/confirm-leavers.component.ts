import { Component, OnDestroy, OnInit } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { URLStructure } from '@core/model/url.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-confirm-leavers',
  templateUrl: './confirm-leavers.component.html',
})
export class ConfirmLeaversComponent implements OnInit, OnDestroy {
  public establishment: Establishment;
  public next: URLStructure;
  public return: URLStructure;
  private subscriptions: Subscription = new Subscription();

  constructor(private establishmentService: EstablishmentService) {}

  ngOnInit() {
    this.establishment = this.establishmentService.establishment;

    this.return = this.establishmentService.returnTo;

    this.next = this.return ? this.return : { url: ['/workplace', this.establishment.uid, 'check-answers'] };
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
