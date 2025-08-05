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
    const filter = {
      slug: { _eq: slug },
      Status: { _eq: 'published' },
    };

    const params = new HttpParams()
      .set('filter', JSON.stringify(filter))
      .set('limit', '1')
      .set('fields', 'content,title,Status')
      .set('env', environment.environmentName);

    return this.http.get<HelpPages>(`${environment.appRunnerEndpoint}/api/cms/items/${this.path}`, { params });
  }

  public getAllQuestionsAndAnswers(): Observable<QuestionsAndAnswersResponse> {
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
    const params = new HttpParams()
      .set('deep', JSON.stringify(filter))
      .set('fields', 'section_heading,q_and_a_pages.*,sub_sections.*,sub_sections.q_and_a_pages.*')
      .set('env', environment.environmentName);

    return this.http.get<QuestionsAndAnswersResponse>(
      `${environment.appRunnerEndpoint}/api/cms/items/q_and_a_sections`,
      { params },
    );
  }

  public getQuestionAndAnswerPage(slug: string): Observable<QuestionAndAnswerPage[]> {
    const filter = {
      slug: { _eq: slug },
      status: { _eq: 'published' },
    };

    const params = new HttpParams().set('filter', JSON.stringify(filter)).set('env', environment.environmentName);

    return this.http.get<QuestionAndAnswerPage[]>(`${environment.appRunnerEndpoint}/api/cms/items/Q_and_A_pages`, {
      params,
    });
  }
}
