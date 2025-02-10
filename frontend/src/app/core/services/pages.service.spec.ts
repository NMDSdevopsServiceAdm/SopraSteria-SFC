import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { environment } from 'src/environments/environment';

import { PagesService } from './pages.service';

describe('PagesService', () => {
  let service: PagesService;
  let http: HttpTestingController;
  let path = 'pages';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      providers: [PagesService],
    });
    service = TestBed.inject(PagesService);
    http = TestBed.inject(HttpTestingController);
  });

  it('should create the service', async () => {
    expect(service).toBeTruthy();
  });

  it('should call the cms endpoint for pages', async () => {
    const slug = 'mock-uid';
    const filter = { slug: { _eq: slug }, status: { _eq: 'published' } };

    service.getPage(slug).subscribe();

    const req = http.expectOne(
      `${environment.cmsUri}/items/${path}?filter=${encodeURI(
        JSON.stringify(filter),
      )}&limit=1&fields=content,title,status`,
    );
    expect(req.request.method).toBe('GET');
  });
});
