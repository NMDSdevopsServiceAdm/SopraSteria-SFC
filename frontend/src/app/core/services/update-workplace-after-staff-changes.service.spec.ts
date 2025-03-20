import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import {
  AddStaffWorkplaceUpdatePage,
  DeleteStaffWorkplaceUpdatePage,
  UpdateWorkplaceAfterStaffChangesService,
  WorkplaceUpdateFlowType,
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

  describe('allUpdatePagesVisited', () => {
    [
      [],
      [AddStaffWorkplaceUpdatePage.TOTAL_STAFF],
      [AddStaffWorkplaceUpdatePage.TOTAL_STAFF, AddStaffWorkplaceUpdatePage.UPDATE_VACANCIES],
    ].forEach((visitedPages) => {
      it(`should return false when not all add pages in visitedPages when ADD passed in (${visitedPages})`, async () => {
        visitedPages.forEach((page) => {
          service.addToVisitedPages(page);
        });

        expect(service.allUpdatePagesVisited(WorkplaceUpdateFlowType.ADD)).toBeFalse();
      });

      it(`should return false when not all delete pages in visitedPage when DELETE passed in (${visitedPages})`, async () => {
        visitedPages.forEach((page) => {
          service.addToVisitedPages(page);
        });

        expect(service.allUpdatePagesVisited(WorkplaceUpdateFlowType.DELETE)).toBeFalse();
      });
    });

    it('should return true when all pages in visitedPages for add flow', async () => {
      [
        AddStaffWorkplaceUpdatePage.TOTAL_STAFF,
        AddStaffWorkplaceUpdatePage.UPDATE_VACANCIES,
        AddStaffWorkplaceUpdatePage.UPDATE_STARTERS,
      ].forEach((page) => {
        service.addToVisitedPages(page);
      });

      expect(service.allUpdatePagesVisited(WorkplaceUpdateFlowType.ADD)).toBeTrue();
    });

    it('should return true when all pages in visitedPages for delete flow', async () => {
      [
        DeleteStaffWorkplaceUpdatePage.TOTAL_STAFF,
        DeleteStaffWorkplaceUpdatePage.UPDATE_VACANCIES,
        DeleteStaffWorkplaceUpdatePage.UPDATE_LEAVERS,
      ].forEach((page) => {
        service.addToVisitedPages(page);
      });

      expect(service.allUpdatePagesVisited(WorkplaceUpdateFlowType.DELETE)).toBeTrue();
    });
  });
});
