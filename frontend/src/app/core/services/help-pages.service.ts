import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HelpPages, QuestionAndAnswerPage, QuestionsAndAnswersResponse } from '@core/model/help-pages.model';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class HelpPagesService {
  private path: string = 'Help_pages';

  constructor(private http: HttpClient) {}

  public getHelpPage(slug: string): Observable<HelpPages> {
    let params = new HttpParams();

    const filter = {
      slug: { _eq: slug },
      Status: { _eq: 'published' },
    };

    params = params.set('filter', JSON.stringify(filter));
    params = params.set('limit', '1');
    params = params.set('fields', 'content,title,Status');

    return this.http.get<HelpPages>(`${environment.cmsUri}/items/${this.path}`, { params });
  }

  public getAllQuestionsAndAnswers(): Observable<QuestionsAndAnswersResponse> {
    let params = new HttpParams();
    const filter = {
      q_and_a_pages: {
        _sort: ['sort'],
        _filter: {
          status: { _eq: 'published' },
        },
      },
      sub_sections: {
        _sort: ['sort'],
        q_and_a_pages: {
          _filter: {
            status: { _eq: 'published' },
          },
          _sort: ['sort'],
        },
      },
    };
    params = params.set('deep', JSON.stringify(filter));
    params = params.set('fields', 'section_heading,q_and_a_pages.*,sub_sections.*,sub_sections.q_and_a_pages.*');

    return this.http.get<QuestionsAndAnswersResponse>(`${environment.cmsUri}/items/q_and_a_sections`, { params });
  }

  public getQuestionAndAnswerPage(slug: string): Observable<QuestionAndAnswerPage[]> {
    let params = new HttpParams();

    const filter = {
      slug: { _eq: slug },
      status: { _eq: 'published' },
    };

    params = params.set('filter', JSON.stringify(filter));

    return this.http.get<QuestionAndAnswerPage[]>(`${environment.cmsUri}/items/Q_and_A_pages`, { params });
  }
}
