import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RegistrationSurveyService {
  public participationFormData: any;
  public whyCreateAccountFormData: any;
  public howDidYouHearAboutFormData: any;
  private result: any;
  protected subscriptions: Subscription = new Subscription();

  constructor(private http: HttpClient) {}

  public updateParticipationState(formValue) {
    this.participationFormData = formValue;
  }

  public updatewhyCreateAccountState(formValue) {
    this.whyCreateAccountFormData = formValue;
  }

  public updateHowDidYouHearAboutState(formValue) {
    this.howDidYouHearAboutFormData = formValue;
  }

  private buildSurveyResultObject() {
    return (this.result = {
      participation: this.participationFormData,
      whyDidYouCreateAccount: this.whyCreateAccountFormData,
      howDidYouHearAboutASCWDS: this.howDidYouHearAboutFormData,
    });
  }

  public submit(data): Observable<any> {
    return this.http.post<any>('/api/registrationSurvey', data);
  }

  public submitSurvey() {
    const data = this.buildSurveyResultObject();

    this.subscriptions.add(
      this.submit(data).subscribe(
        (res) => {
          {
            console.log(res);
          }
        },
        (error) => {
          console.log(error);
        },
      ),
    );

    // return this.http.post<any>('/api/registration-survey', data).subscribe(
    //   () => this.doSomething(),
    //   (err) => this.doSomething(),
    // );
  }
}
