import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from 'src/environments/environment';

import { PagesService } from './pages.service';
import { provideHttpClient } from '@angular/common/http';

describe('PagesService', () => {
  let service: PagesService;
  let http: HttpTestingController;
  const path = 'pages';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [PagesService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PagesService);
    http = TestBed.inject(HttpTestingController);
  });

  it('should create the service', async () => {
    expect(service).toBeTruthy();
  });

  it('should call the cms endpoint for pages with slug passed in', async () => {
    const slug = 'mock-uid';
    const filter = { slug: { _eq: slug }, status: { _eq: 'published' } };

    service.getPage(slug).subscribe();

    const req = http.expectOne(
      `${environment.appRunnerEndpoint}/api/cms/items/${path}?filter=${encodeURI(
        JSON.stringify(filter),
      )}&limit=1&fields=content,title,status&env=${environment.environmentName}`,
    );
    expect(req.request.method).toBe('GET');
  });
});
