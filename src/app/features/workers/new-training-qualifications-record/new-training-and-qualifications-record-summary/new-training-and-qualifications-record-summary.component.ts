import { Component, Input, OnInit } from '@angular/core';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';

@Component({
  selector: 'app-new-training-and-qualifications-record-summary',
  templateUrl: './new-training-and-qualifications-record-summary.component.html',
  styleUrls: ['./new-training-and-qualifications-record-summary.component.scss'],
})
export class NewTrainingAndQualificationsRecordSummaryComponent implements OnInit {
  @Input() trainingCount: number;
  @Input() qualificationsCount: number;
  @Input() expiresSoonTrainingCount: number;
  @Input() expiredTrainingCount: number;
  public changingExpiryDateLinkFlag: boolean;

  constructor(private featureFlagService: FeatureFlagsService) {}

  async ngOnInit(): Promise<void> {
    this.changingExpiryDateLinkFlag = await this.featureFlagService.configCatClient.getValueAsync(
      'changingExpiryDateLink',
      false,
    );
  }
}
