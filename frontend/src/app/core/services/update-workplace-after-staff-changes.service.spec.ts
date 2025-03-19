import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import {
  AddStaffWorkplaceUpdatePage,
  UpdateWorkplaceAfterStaffChangesService,
} from './update-workplace-after-staff-changes.service';

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
    [
      [],
      [AddStaffWorkplaceUpdatePage.TOTAL_STAFF],
      [AddStaffWorkplaceUpdatePage.TOTAL_STAFF, AddStaffWorkplaceUpdatePage.UPDATE_VACANCIES],
    ].forEach((visitedPages) => {
      it(`should return false when not all pages in visitedPages (${visitedPages})`, async () => {
        visitedPages.forEach((page) => {
          service.addToVisitedPages(page);
        });

        expect(service.allUpdatePagesVisitedForAdd()).toBeFalse();
      });
    });

    it('should return true when all pages in visitedPages', async () => {
      [
        AddStaffWorkplaceUpdatePage.TOTAL_STAFF,
        AddStaffWorkplaceUpdatePage.UPDATE_VACANCIES,
        AddStaffWorkplaceUpdatePage.UPDATE_STARTERS,
      ].forEach((page) => {
        service.addToVisitedPages(page);
      });

      expect(service.allUpdatePagesVisitedForAdd()).toBeTrue();
    });
  });
});
