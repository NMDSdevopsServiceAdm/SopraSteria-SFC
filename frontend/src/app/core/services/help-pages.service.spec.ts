import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { environment } from 'src/environments/environment';

import { HelpPagesService } from './help-pages.service';

describe('HelpPagesService', () => {
  let service: HelpPagesService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      providers: [HelpPagesService],
    });
    service = TestBed.inject(HelpPagesService);
    http = TestBed.inject(HttpTestingController);
  });

  it('should create the service', async () => {
    expect(service).toBeTruthy();
  });

  describe('getHelpPage', () => {
    it('should call the cms endpoint for help pages', async () => {
      const slug = 'mock-uid';
      const filter = { slug: { _eq: slug }, Status: { _eq: 'published' } };

      service.getHelpPage(slug).subscribe();

      const req = http.expectOne(
        `${environment.cmsUri}/items/Help_pages?filter=${encodeURI(
          JSON.stringify(filter),
        )}&limit=1&fields=content,title,Status`,
      );
      expect(req.request.method).toBe('GET');
    });
  });

  describe('getAllQuestionsAndAnswers', () => {
    it('should call the cms endpoint for all Q and A sections with all nested fields', async () => {
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

      service.getAllQuestionsAndAnswers().subscribe();

      const req = http.expectOne(
        `${environment.cmsUri}/items/q_and_a_sections?deep=${encodeURI(
          JSON.stringify(filter),
        )}&fields=section_heading,q_and_a_pages.*,sub_sections.*,sub_sections.q_and_a_pages.*`,
      );
      expect(req.request.method).toBe('GET');
    });
  });

  describe('getQuestionAndAnswerPage', () => {
    it('should call the cms endpoint for single Q and A page', async () => {
      const slug = 'test-question-and-answer-page';
      const filter = {
        slug: { _eq: slug },
        status: { _eq: 'published' },
      };

      service.getQuestionAndAnswerPage(slug).subscribe();

      const req = http.expectOne(
        `${environment.cmsUri}/items/Q_and_A_pages?filter=${encodeURI(JSON.stringify(filter))}`,
      );
      expect(req.request.method).toBe('GET');
    });
  });
});
