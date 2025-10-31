import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ParentSubsidiaryViewService } from './parent-subsidiary-view.service';
import { provideHttpClient } from '@angular/common/http';

describe('ParentSubsidiaryViewService', () => {
  let service: ParentSubsidiaryViewService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [ParentSubsidiaryViewService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ParentSubsidiaryViewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('returns the uid set', async () => {
    const subUid = 'some-uid';
    service.setViewingSubAsParent(subUid);

    expect(service.getSubsidiaryUid()).toEqual(subUid);
  });

  describe('getViewingSubAsParentDashboard', () => {
    describe('url is on checked list', () => {
      ['home', 'workplace', 'staff-records', 'training-and-qualifications', 'benchmarks', 'workplace-users'].forEach(
        (tab) => {
          it(`should return true if url for ${tab} page is passed in`, async () => {
            const subUid = 'some-uid';
            service.setViewingSubAsParent(subUid);

            expect(service.getViewingSubAsParentDashboard(`/subsidiary/${subUid}/${tab}`)).toBeTruthy();
          });
        },
      );

      it(`should return true if url for page with query params is passed in`, async () => {
        const subUid = 'some-uid';
        service.setViewingSubAsParent(subUid);

        expect(service.getViewingSubAsParentDashboard(`/subsidiary/${subUid}/workplace?search=bob`)).toBeTruthy();
      });
    });

    describe('url is not on checked list', () => {
      it('should return false if url has partial match to url in checked list', async () => {
        expect(service.getViewingSubAsParentDashboard('/subsidiary/home')).toBeFalsy();
      });

      it('should return false if url has additional path section after url in checked list', async () => {
        const subUid = 'some-uid';
        service.setViewingSubAsParent(subUid);

        expect(service.getViewingSubAsParentDashboard(`/subsidiary/workplace/${subUid}/benchmarks`)).toBeFalsy();
      });
    });
  });
});
