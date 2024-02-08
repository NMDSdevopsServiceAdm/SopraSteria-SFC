import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FeedbackModel } from '@core/model/feedback.model';
import { URLStructure } from '@core/model/url.model';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FeedbackService {
  private returnTo$ = new BehaviorSubject<URLStructure>(null);

  constructor(private http: HttpClient) {}

  post(feedback: FeedbackModel) {
    return this.http.post<any>(`${environment.appRunnerEndpoint}/api/feedback`, feedback);
  }

  public get returnTo(): URLStructure {
    return this.returnTo$.value;
  }

  public setReturnTo(returnTo: URLStructure): void {
    this.returnTo$.next(returnTo);
  }
}
