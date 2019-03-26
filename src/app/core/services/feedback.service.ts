import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { FeedbackModel } from '../model/feedback.model';

@Injectable({
  providedIn: 'root',
})
export class FeedbackService {
  constructor(private http: HttpClient) {}

  // TODO: Move this to a Shared WindowRef Service
  get _window(): any {
    return window;
  }

  get window(): any {
    return this._window;
  }

  post(feedback: FeedbackModel) {
    return this.http.post<any>('/api/feedback', feedback);
  }
}
