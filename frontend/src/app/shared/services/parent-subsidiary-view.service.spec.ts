import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ParentSubsidiaryViewService } from './parent-subsidiary-view.service';

describe('ParentSubsidiaryViewService', () => {
  let service: ParentSubsidiaryViewService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ParentSubsidiaryViewService],
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
      it('should return true if url is included for home page', async () => {
        const subUid = 'some-uid';
        service.setViewingSubAsParent(subUid);

        expect(service.getViewingSubAsParentDashboard(`/subsidiary/${subUid}/home`)).toBeTruthy();
      });
      it('should return true if url is included for workplace page', async () => {
        const subUid = 'some-uid';
        service.setViewingSubAsParent(subUid);

        expect(service.getViewingSubAsParentDashboard(`/subsidiary/${subUid}/workplace`)).toBeTruthy();
      });
      it('should return true if url is included for staff-records page', async () => {
        const subUid = 'some-uid';
        service.setViewingSubAsParent(subUid);

        expect(service.getViewingSubAsParentDashboard(`/subsidiary/${subUid}/staff-records`)).toBeTruthy();
      });
      it('should return true if url is included for training-and-qualifications page', async () => {
        const subUid = 'some-uid';
        service.setViewingSubAsParent(subUid);

        expect(
          service.getViewingSubAsParentDashboard(`/subsidiary/${subUid}/training-and-qualifications`),
        ).toBeTruthy();
      });
      it('should return true if url is included for benchmarks page', async () => {
        const subUid = 'some-uid';
        service.setViewingSubAsParent(subUid);

        expect(service.getViewingSubAsParentDashboard(`/subsidiary/${subUid}/benchmarks`)).toBeTruthy();
      });
      it('should return true if url is included for workplace-users page', async () => {
        const subUid = 'some-uid';
        service.setViewingSubAsParent(subUid);

        expect(service.getViewingSubAsParentDashboard(`/subsidiary/${subUid}/workplace-users`)).toBeTruthy();
      });
    });

    describe('url is not on checked list', () => {
      it('should return false if url has partial match to url in checked list', async () => {
        expect(service.getViewingSubAsParentDashboard('/subsidiary/home')).toBeFalsy();
      });

      it('should return false if url has additional characters after url in checked list', async () => {
        const subUid = 'some-uid';
        service.setViewingSubAsParent(subUid);

        expect(service.getViewingSubAsParentDashboard(`/subsidiary/workplace/${subUid}/benchmarks`)).toBeFalsy();
      });
    });
  });
});
