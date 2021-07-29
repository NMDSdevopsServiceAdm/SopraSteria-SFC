import { Directive, OnDestroy, OnInit } from '@angular/core';
import { LocationAddress } from '@core/model/location.model';
import { Service } from '@core/model/services.model';
import { BackService } from '@core/services/back.service';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { Subscription } from 'rxjs';

@Directive()
export class ConfirmWorkplaceDetails implements OnInit, OnDestroy {
  public flow: string;
  public locationAddress: LocationAddress;
  public workplace: Service;
  public createAccountNewDesign: boolean;
  protected subscriptions: Subscription = new Subscription();

  constructor(protected backService: BackService, protected featureFlagsService: FeatureFlagsService) {}

  async ngOnInit(): Promise<void> {
    this.createAccountNewDesign = await this.featureFlagsService.configCatClient.getValueAsync(
      'createAccountNewDesign',
      false,
    );
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
