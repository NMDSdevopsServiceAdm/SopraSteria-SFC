import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
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

        expect(service.getViewingSubAsParentDashboard(`/subsidiary/home/${subUid}`)).toBeTruthy();
      });
      it('should return true if url is included for workplace page', async () => {
        const subUid = 'some-uid';
        service.setViewingSubAsParent(subUid);

        expect(service.getViewingSubAsParentDashboard(`/subsidiary/workplace/${subUid}`)).toBeTruthy();
      });
      it('should return true if url is included for staff-records page', async () => {
        const subUid = 'some-uid';
        service.setViewingSubAsParent(subUid);

        expect(service.getViewingSubAsParentDashboard(`/subsidiary/staff-records/${subUid}`)).toBeTruthy();
      });
      it('should return true if url is included for training-and-qualifications page', async () => {
        const subUid = 'some-uid';
        service.setViewingSubAsParent(subUid);

        expect(
          service.getViewingSubAsParentDashboard(`/subsidiary/training-and-qualifications/${subUid}`),
        ).toBeTruthy();
      });
      it('should return true if url is included for benchmarks page', async () => {
        const subUid = 'some-uid';
        service.setViewingSubAsParent(subUid);

        expect(service.getViewingSubAsParentDashboard(`/subsidiary/benchmarks/${subUid}`)).toBeTruthy();
      });
      it('should return true if url is included for workplace-users page', async () => {
        const subUid = 'some-uid';
        service.setViewingSubAsParent(subUid);

        expect(service.getViewingSubAsParentDashboard(`/subsidiary/workplace-users/${subUid}`)).toBeTruthy();
      });
    });

    describe('url is not on checked list', () => {
      it('should return false if url has partial match to url in checked list', async () => {
        expect(service.getViewingSubAsParentDashboard('/subsidiary/home')).toBeFalsy();
      });
      it('should return false if url has additional characters after url in checked list', async () => {
        const subUid = 'some-uid';
        service.setViewingSubAsParent(subUid);

        expect(service.getViewingSubAsParentDashboard(`/subsidiary/home/${subUid}/benchmarks`)).toBeFalsy();
      });
    });
  });
});
