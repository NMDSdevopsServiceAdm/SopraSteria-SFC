import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class RegistrationSurveyService {
  public participationFormData: any;
  public whyCreateAccountFormData: any;
  public howDidYouHearAboutFormData: any;

  constructor(private http: HttpClient) {}

  public updateParticipationState(formValue) {
    console.log(formValue); //Still need to work out how to get the form data passed in
    this.participationFormData = {
      key: 'participation',
      anotherKey: 'value2',
    };

    console.log(this.participationFormData);
  }

  public updatewhyCreateAccountState(formValue) {
    console.log(formValue); //Still need to work out how to get the form data passed in
    this.whyCreateAccountFormData = {
      key: 'whyCreate',
      anotherKey: 'value2',
    };

    console.log(this.participationFormData);
    console.log(this.whyCreateAccountFormData);
  }

  public updateHowDidYouHearAboutState(formValue) {
    console.log(formValue); //Still need to work out how to get the form data passed in
    this.howDidYouHearAboutFormData = {
      key: 'howHear',
      anotherKey: 'value2',
    };

    console.log(this.participationFormData);
    console.log(this.whyCreateAccountFormData);
    console.log(this.howDidYouHearAboutFormData);
  }

  public submitSurvey() {
    const data = this.participationFormData;
    return this.http.post<any>('/api/registration-survey', data);
  }
}
