import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class RegistrationSurveyService {
  public participationFormData: any;
  public whyCreateAccountFormData: any;
  public howDidYouHearAboutFormData: any;
  private result: any;

  constructor(private http: HttpClient) {}

  public updateParticipationState(formValue) {
    console.log(formValue); //Still need to work out how to get the form data passed in
    this.participationFormData = 'Yes';
  }

  public updatewhyCreateAccountState(formValue) {
    console.log(formValue); //Still need to work out how to get the form data passed in
    this.whyCreateAccountFormData = ['To get access to the Workforce Development Fund'];
  }

  public updateHowDidYouHearAboutState(formValue) {
    console.log(formValue); //Still need to work out how to get the form data passed in
    this.howDidYouHearAboutFormData = ['From an event we attended', 'Other'];
  }

  private buildSurveyResultObject() {
    return (this.result = {
      participation: this.participationFormData,
      whyDidYouCreateAccount: this.whyCreateAccountFormData,
      howDidYouHearAboutASCWDS: this.howDidYouHearAboutFormData,
    });
  }

  private doSomething() {
    console.log('did something');
  }

  public submitSurvey() {
    const data = this.buildSurveyResultObject();

    return this.http.post<any>('/api/registration-survey', data).subscribe(
      () => this.doSomething(),
      (err) => this.doSomething(),
    );
  }
}
