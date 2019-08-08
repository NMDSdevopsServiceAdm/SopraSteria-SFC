import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FeedbackModel } from '@core/model/feedback.model';

@Injectable({
  providedIn: 'root',
})
export class FeedbackService {
  constructor(private http: HttpClient) {}

  post(feedback: FeedbackModel) {
    return this.http.post<any>('/api/feedback', feedback);
  }
}
