import { OnDestroy, OnInit } from '@angular/core';
import { LocationAddress } from '@core/model/location.model';
import { Service } from '@core/model/services.model';
import { BackService } from '@core/services/back.service';
import { Subscription } from 'rxjs';

export class ConfirmWorkplaceDetails implements OnInit, OnDestroy {
  protected flow: string;
  protected subscriptions: Subscription = new Subscription();
  public locationAddress: LocationAddress;
  public workplace: Service;

  constructor(protected backService: BackService) {}

  ngOnInit() {
    this.init();
    this.setBackLink();
  }

  protected init(): void {}

  protected getWorkplaceData(): void {}

  protected setBackLink(): void {
    this.backService.setBackLink({ url: [`${this.flow}/select-main-service`] });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
