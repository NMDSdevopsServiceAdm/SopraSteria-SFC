import { Component, Input } from '@angular/core';

import { StaffRecordSummaryComponent } from '../staff-record-summary.component';

@Component({
  selector: 'app-qualifications-and-training',
  templateUrl: './qualifications-and-training.component.html',
})
export class QualificationsAndTrainingComponent extends StaffRecordSummaryComponent {
  public cwpQuestionsFlag: boolean;

  @Input() wdfView = false;
  @Input() overallWdfEligibility: boolean;
  @Input() public canEditWorker: boolean;

  protected init(): void {
    const snapshotData = this.route.snapshot.data;
    this.cwpQuestionsFlag = snapshotData?.featureFlags?.cwpQuestions ?? false;
  }

  get displaySocialCareQualifications() {
    return this.worker.qualificationInSocialCare === 'Yes';
  }

  get displayOtherQualifications() {
    return this.worker.otherQualification === 'Yes';
  }

  public showWdfConfirmations: any = {
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
