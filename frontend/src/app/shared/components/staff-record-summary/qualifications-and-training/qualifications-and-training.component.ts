import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';

import { StaffRecordSummaryComponent } from '../staff-record-summary.component';

@Component({
    selector: 'app-qualifications-and-training',
    templateUrl: './qualifications-and-training.component.html',
    standalone: false
})
export class QualificationsAndTrainingComponent
  extends StaffRecordSummaryComponent
  implements OnInit, OnDestroy, OnChanges
{
  @Input() wdfView = false;
  @Input() overallWdfEligibility: boolean;
  @Input() public canEditWorker: boolean;

  get displaySocialCareQualifications() {
    return this.worker.qualificationInSocialCare === 'Yes';
  }

  get displayOtherQualifications() {
    return this.worker.otherQualification === 'Yes';
  }

  public showWdfConfirmations: Record<string, boolean> = {
    careCertificate: null,
    qualificationInSocialCare: null,
    socialCareQualification: null,
    otherQualification: null,
    highestQualification: null,
  };

  protected setShowWdfConfirmations(): void {
    this.showWdfConfirmations = {
      careCertificate: this.showWdfConfirmationForCareCertificate(),
      qualificationInSocialCare: this.showWdfConfirmationForQualInSocialCare(),
      socialCareQualification: this.showWdfConfirmation('socialCareQualification'),
      otherQualification: this.showWdfConfirmationForOtherQualification(),
      highestQualification: this.showWdfConfirmation('highestQualification'),
    };
  }

  ngOnChanges(): void {
    this.setShowWdfConfirmations();
  }

  public showWdfConfirmationForCareCertificate(): boolean {
    return this.showWdfConfirmation('careCertificate') && this.worker.careCertificate !== 'Yes, completed';
  }

  public showWdfConfirmationForQualInSocialCare(): boolean {
    return this.showWdfConfirmation('qualificationInSocialCare') && this.worker.qualificationInSocialCare !== 'Yes';
  }

  public showWdfConfirmationForOtherQualification(): boolean {
    return this.showWdfConfirmation('otherQualification') && this.worker.otherQualification !== 'Yes';
  }
}
