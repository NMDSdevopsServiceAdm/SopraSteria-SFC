import { Injectable } from '@angular/core';
import { RegistrationSurveyService } from '@core/services/registration-survey.service';

@Injectable()
export class MockRegistrationSurveyService extends RegistrationSurveyService {
  public participationFormData: any;
  public whyCreateAccountFormData: any;
  public howDidYouHearAboutFormData: any;

  public updateParticipationState(formValue) {
    this.participationFormData = formValue;
  }

  public updatewhyCreateAccountState(formValue) {
    this.whyCreateAccountFormData = formValue;
  }

  public updateHowDidYouHearAboutState(formValue) {
    this.howDidYouHearAboutFormData = formValue;
  }
}
