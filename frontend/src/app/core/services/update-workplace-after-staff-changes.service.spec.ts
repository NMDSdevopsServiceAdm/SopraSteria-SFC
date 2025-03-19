import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { UpdateWorkplaceAfterStaffChangesService } from './update-workplace-after-staff-changes.service';

describe('UpdateWorkplaceAfterStaffChangesService', () => {
  let service: UpdateWorkplaceAfterStaffChangesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UpdateWorkplaceAfterStaffChangesService],
    });
    service = TestBed.inject(UpdateWorkplaceAfterStaffChangesService);
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  describe('allUpdatePagesVisitedForAdd', () => {
    [[], ['update-total-staff'], ['update-total-staff', 'update-vacancies']].forEach((visitedPages) => {
      it(`should return false when not all pages in visitedPages (${visitedPages})`, async () => {
        visitedPages.forEach((page) => {
          service.addToVisitedPages(page);
        });

        expect(service.allUpdatePagesVisitedForAdd()).toBeFalse();
      });
    });

    it('should return true when all pages in visitedPages', async () => {
      ['update-total-staff', 'update-vacancies', 'update-starters'].forEach((page) => {
        service.addToVisitedPages(page);
      });

      expect(service.allUpdatePagesVisitedForAdd()).toBeTrue();
    });
  });
});
