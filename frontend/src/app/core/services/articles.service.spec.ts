import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from 'src/environments/environment';

import { ArticlesService } from './articles.service';
import { provideHttpClient } from '@angular/common/http';

describe('ArticlesService', () => {
  let service: ArticlesService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [ArticlesService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ArticlesService);
    http = TestBed.inject(HttpTestingController);
  });

  it('should create the service', async () => {
    expect(service).toBeTruthy();
  });

  describe('getArticle', () => {
    it('should call the cms endpoint for articles with limit 1 and expected fields', async () => {
      const slug = 'mock-uid';
      const filter = { slug: { _eq: slug } };

      service.getArticle(slug).subscribe();

      const req = http.expectOne(
        `${environment.appRunnerEndpoint}/api/cms/items/articles?filter=${encodeURI(
          JSON.stringify(filter),
        )}&limit=1&fields=content,title,slug&env=${environment.environmentName}`,
      );
      expect(req.request.method).toBe('GET');
    });
  });

  describe('getThreeLatestArticles', () => {
    it('should call the cms endpoint for articles with limit 3', async () => {
      const filter = {
        status: { _eq: 'published' },
      };

      service.getThreeLatestArticles().subscribe();

      const req = http.expectOne(
        `${
          environment.appRunnerEndpoint
        }/api/cms/items/articles?sort=-publish_date&limit=3&fields=title,slug&filter=${encodeURI(
          JSON.stringify(filter),
        )}&env=${environment.environmentName}`,
      );
      expect(req.request.method).toBe('GET');
    });
  });
});
