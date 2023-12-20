import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { BackLinkService } from './backLink.service';

describe('BackLinkService', () => {
  let service: BackLinkService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [BackLinkService],
    });
    service = TestBed.inject(BackLinkService);
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });
});
