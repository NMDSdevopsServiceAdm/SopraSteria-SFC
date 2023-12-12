import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
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

  constructor(private http: HttpClient, private router: Router) {}

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
        (data) => {
          this.subscriptions.unsubscribe();
        },
        (error: HttpErrorResponse) => this.router.navigate(['/dashboard']),
      ),
    );
  }
}
