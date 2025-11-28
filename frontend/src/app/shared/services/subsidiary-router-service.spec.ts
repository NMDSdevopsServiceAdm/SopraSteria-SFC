import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';

import { ParentSubsidiaryViewService } from './parent-subsidiary-view.service';
import { SubsidiaryRouterService } from './subsidiary-router-service';
import { provideHttpClient } from '@angular/common/http';

describe('SubsidiaryRouterService', () => {
  let service: SubsidiaryRouterService;
  let subViewServiceSpy: jasmine.SpyObj<ParentSubsidiaryViewService>;
  let routerSpy: jasmine.Spy;

  beforeEach(() => {
    const parentSubViewSpy = jasmine.createSpyObj('ParentSubsidiaryViewService', [
      'getViewingSubAsParent',
      'getSubsidiaryUid',
      'clearViewingSubAsParent',
    ]);
    routerSpy = spyOn(Router.prototype, 'navigateByUrl');

    TestBed.configureTestingModule({
      imports: [],
      providers: [
        SubsidiaryRouterService,
        {
          provide: ParentSubsidiaryViewService,
          useValue: parentSubViewSpy,
        },

        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(SubsidiaryRouterService);
    subViewServiceSpy = TestBed.inject(ParentSubsidiaryViewService) as jasmine.SpyObj<ParentSubsidiaryViewService>;
  });

  it('should be created', async () => {
    expect(service).toBeTruthy();
  });

  describe('When not viewing sub as parent', () => {
    beforeEach(() => {
      subViewServiceSpy.getViewingSubAsParent.and.returnValue(false);
    });

    it('should navigate to the provided route', async () => {
      const urlTree = service.createUrlTree(['expected', 'test', 'route']);
      const expectedUrlTree = service.createUrlTree(['expected', 'test', 'route'], undefined);

      service.navigateByUrl(urlTree);

      expect(routerSpy).toHaveBeenCalledWith(expectedUrlTree, undefined);
    });

    it('should clear sub view and navigate if unexpected format of url tree', async () => {
      const urlAsString = 'urlasstring.com/test';
      const unexpectedUrlTree = urlAsString as unknown as UrlTree;
      service.navigateByUrl(unexpectedUrlTree);

      expect(subViewServiceSpy.clearViewingSubAsParent).toHaveBeenCalled();
      expect(routerSpy).toHaveBeenCalledWith(urlAsString, undefined);
    });

    it('should clear sub view and navigate if navigation event to root', async () => {
      const rootUrl = service.createUrlTree(['/']);

      service.navigateByUrl(rootUrl);

      expect(subViewServiceSpy.clearViewingSubAsParent).toHaveBeenCalled();
      expect(routerSpy).toHaveBeenCalledWith(rootUrl, undefined);
    });

    it('should navigate and not clear sub view if navigation event to /subsidiary (skipped navigate for clean rendering from dropdown)', async () => {
      const subsidiaryUrlAsString = '/subsidiary';
      const subsidiaryUrl = subsidiaryUrlAsString as unknown as UrlTree;
      service.navigateByUrl(subsidiaryUrl);

      expect(subViewServiceSpy.clearViewingSubAsParent).not.toHaveBeenCalled();
      expect(routerSpy).toHaveBeenCalledWith(subsidiaryUrl, undefined);
    });
  });

  describe('When hitting exit sub view pages', () => {
    it('should clear the value for the view sub service at login page', async () => {
      const urlTree = service.createUrlTree(['login']);
      const expectedUrlTree = service.createUrlTree(['login'], undefined);

      service.navigateByUrl(urlTree);

      expect(subViewServiceSpy.clearViewingSubAsParent).toHaveBeenCalled();
      expect(routerSpy).toHaveBeenCalledWith(expectedUrlTree, undefined);
    });

    it('should clear the value for the view sub service at notifications page', async () => {
      const urlTree = service.createUrlTree(['notifications']);
      const expectedUrlTree = service.createUrlTree(['notifications'], undefined);

      service.navigateByUrl(urlTree);

      expect(subViewServiceSpy.clearViewingSubAsParent).toHaveBeenCalled();
      expect(routerSpy).toHaveBeenCalledWith(expectedUrlTree, undefined);
    });

    it('should clear the value for the view sub service when navigating to satisfaction survey page', async () => {
      const urlTree = service.createUrlTree(['satisfaction-survey']);
      const expectedUrlTree = service.createUrlTree(['satisfaction-survey'], undefined);

      service.navigateByUrl(urlTree);

      expect(subViewServiceSpy.clearViewingSubAsParent).toHaveBeenCalled();
      expect(routerSpy).toHaveBeenCalledWith(expectedUrlTree, undefined);
    });

    it('should clear the value for the view sub service at account-management page', async () => {
      const urlTree = service.createUrlTree(['account-management']);
      const expectedUrlTree = service.createUrlTree(['account-management'], undefined);

      service.navigateByUrl(urlTree);

      expect(subViewServiceSpy.clearViewingSubAsParent).toHaveBeenCalled();
      expect(routerSpy).toHaveBeenCalledWith(expectedUrlTree, undefined);
    });

    it('should clear the value for the view sub service when navigating to the admin page', async () => {
      const urlTree = service.createUrlTree(['sfcadmin']);
      const expectedUrlTree = service.createUrlTree(['sfcadmin'], undefined);

      service.navigateByUrl(urlTree);

      expect(subViewServiceSpy.clearViewingSubAsParent).toHaveBeenCalled();
      expect(routerSpy).toHaveBeenCalledWith(expectedUrlTree, undefined);
    });

    it('should clear the value for the view sub service at users page', async () => {
      const urlTree = service.createUrlTree(['workplace', '123', 'users']);
      const expectedUrlTree = service.createUrlTree(['workplace', '123', 'users'], undefined);

      service.navigateByUrl(urlTree);

      expect(subViewServiceSpy.clearViewingSubAsParent).toHaveBeenCalled();
      expect(routerSpy).toHaveBeenCalledWith(expectedUrlTree, undefined);
    });
  });

  describe('When viewing sub as a parent', () => {
    beforeEach(() => {
      subViewServiceSpy.getViewingSubAsParent.and.returnValue(true);
      subViewServiceSpy.getSubsidiaryUid.and.returnValue('1234');
    });

    it('should prepend the route with the subsidiary route', async () => {
      const urlTree = service.createUrlTree(['expected', 'test', 'route']);
      const expectedUrlTree = service.createUrlTree(['subsidiary', 'expected', 'test', 'route'], undefined);

      service.navigateByUrl(urlTree);

      expect(routerSpy).toHaveBeenCalledWith(expectedUrlTree, undefined);
    });

    it('should remove forward slashes from the route', async () => {
      const urlTree = service.createUrlTree(['/expected', '/test/route'], undefined);
      const expectedUrlTree = service.createUrlTree(['subsidiary', 'expected', 'test', 'route'], undefined);

      service.navigateByUrl(urlTree);

      expect(routerSpy).toHaveBeenCalledWith(expectedUrlTree, undefined);
    });

    it('should include query params in the route if provided', async () => {
      const urlTree = service.createUrlTree(['expected', 'test', 'route'], {
        queryParams: { test: 'test-queryParams' },
      });
      const expectedUrlTree = service.createUrlTree(['subsidiary', 'expected', 'test', 'route'], {
        queryParams: { test: 'test-queryParams' },
      });

      service.navigateByUrl(urlTree);

      expect(routerSpy).toHaveBeenCalledWith(expectedUrlTree, undefined);
    });

    describe('fragments', () => {
      it('should reroute to the sub equivalent pages on dashboard', async () => {
        const urlTree = service.createUrlTree(['dashboard', 'test', 'route'], { fragment: 'test-fragment' });
        const expectedUrlTree = service.createUrlTree(['subsidiary', '1234', 'test-fragment'], undefined);

        service.navigateByUrl(urlTree);

        expect(routerSpy).toHaveBeenCalledWith(expectedUrlTree, undefined);
      });

      it('should reroute to the home tab equivalent page on dashboard when no fragments provided', async () => {
        const urlTree = service.createUrlTree(['/dashboard'], undefined);
        const expectedUrlTree = service.createUrlTree(['subsidiary', '1234', 'home'], undefined);

        service.navigateByUrl(urlTree);

        expect(routerSpy).toHaveBeenCalledWith(expectedUrlTree, undefined);
      });

      it('should reroute to the sub equivalent pages on dashboard when a leading slash is present', async () => {
        const urlTree = service.createUrlTree(['/dashboard', 'test', 'route'], { fragment: 'test-fragment' });
        const expectedUrlTree = service.createUrlTree(['subsidiary', '1234', 'test-fragment'], undefined);

        service.navigateByUrl(urlTree);

        expect(routerSpy).toHaveBeenCalledWith(expectedUrlTree, undefined);
      });

      it('should use default fragments', async () => {
        const urlTree = service.createUrlTree(['expected', 'test', 'route'], { fragment: 'test-fragment' });
        const expectedUrlTree = service.createUrlTree(['subsidiary', 'expected', 'test', 'route'], {
          fragment: 'test-fragment',
        });

        service.navigateByUrl(urlTree);

        expect(routerSpy).toHaveBeenCalledWith(expectedUrlTree, undefined);
      });
    });
  });
});
