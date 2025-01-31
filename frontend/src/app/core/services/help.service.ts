import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class HelpService {
  constructor(private http: HttpClient) {}

  public getAllQuestionsAndAnswers() {
    let params = new HttpParams();

    params = params.set('fields', 'section_heading,sub_sections.*,q_and_a_pages.*');

    return this.http.get(`${environment.cmsUri}/items/q_and_a_sections`, { params });
  }
}
