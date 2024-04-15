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
    it('should return true if url is included', async () => {
      const subUid = 'some-uid';
      service.setViewingSubAsParent(subUid);

      expect(service.getViewingSubAsParentDashboard(`/subsidiary/home/${subUid}`)).toBeTruthy();
    });
    it('should return false if url is not included', async () => {
      expect(service.getViewingSubAsParentDashboard('/home')).toBeFalsy();
    });
  });
});
