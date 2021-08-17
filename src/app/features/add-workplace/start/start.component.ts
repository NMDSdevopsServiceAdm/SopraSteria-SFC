import { Component, OnInit } from '@angular/core';
import { BackService } from '@core/services/back.service';
import { WorkplaceService } from '@core/services/workplace.service';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
})
export class StartComponent implements OnInit {
  createAccountNewDesign: boolean;
  constructor(
    public backService: BackService,
    private workplaceService: WorkplaceService,
    private featureFlagsService: FeatureFlagsService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.createAccountNewDesign = await this.featureFlagsService.configCatClient.getValueAsync(
      'createAccountNewDesign',
      false,
    );
    this.workplaceService.resetService();
    this.workplaceService.addWorkplaceInProgress$.next(true);
    this.setStartLink();
    this.setBackLink();
  }

  public setStartLink(): Array<string> {
    return this.createAccountNewDesign
      ? ['/add-workplace', 'new-regulated-by-cqc']
      : ['/add-workplace', 'regulated-by-cqc'];
  }

  public setBackLink(): void {
    this.backService.setBackLink({ url: ['/workplace', 'view-all-workplaces'] });
  }
}
