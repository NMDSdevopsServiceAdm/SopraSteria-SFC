import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FeedbackModel } from '@core/model/feedback.model';
import { URLStructure } from '@core/model/url.model';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FeedbackService {
  private returnTo$ = new BehaviorSubject<URLStructure>(null);

  constructor(private http: HttpClient) {}

  post(feedback: FeedbackModel) {
    return this.http.post<any>('/api/feedback', feedback);
  }

  public get returnTo(): URLStructure {
    return this.returnTo$.value;
  }

  public setReturnTo(returnTo: URLStructure): void {
    this.returnTo$.next(returnTo);
  }
}
