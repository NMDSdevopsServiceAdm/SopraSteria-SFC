import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { environment } from 'src/environments/environment';

import { HelpPagesService } from './help-pages.service';

describe('HelpPagesService', () => {
  let service: HelpPagesService;
  let http: HttpTestingController;
  let path = 'Help_pages';

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

  it('should call the cms endpoint for help pages', async () => {
    const slug = 'mock-uid';
    const filter = { slug: { _eq: slug }, Status: { _eq: 'published' } };

    service.getHelpPage(slug).subscribe();

    const req = http.expectOne(
      `${environment.cmsUri}/items/${path}?filter=${encodeURI(
        JSON.stringify(filter),
      )}&limit=1&fields=content,title,Status`,
    );
    expect(req.request.method).toBe('GET');
  });
});
