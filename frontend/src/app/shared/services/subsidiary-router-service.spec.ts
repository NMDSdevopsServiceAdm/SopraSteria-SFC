import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SubsidiaryRouterService } from './subsidiary-router-service';
import { ParentSubsidiaryViewService } from './parent-subsidiary-view.service';
import { of } from 'rxjs';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

fdescribe('SubsidiaryRouterService', () => {
  let service: SubsidiaryRouterService;
  let subViewServiceSpy: jasmine.SpyObj<ParentSubsidiaryViewService>;
  let routerSpy: jasmine.Spy;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('ParentSubsidiaryViewService', ['getViewingSubAsParent']);
    routerSpy = spyOn(Router.prototype, 'navigate');

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        SubsidiaryRouterService,
        {
          provide: ParentSubsidiaryViewService,
          useValue: spy,
        }],
    });

    service = TestBed.inject(SubsidiaryRouterService);
    subViewServiceSpy = TestBed.inject(ParentSubsidiaryViewService) as jasmine.SpyObj<ParentSubsidiaryViewService>;
  });

  it('should be created', async () => {
    expect(service).toBeTruthy();
  });

  describe('When not viewing sub as parent', () => {
    it('should navigate to the provided route', async() => {
      subViewServiceSpy.getViewingSubAsParent.and.returnValue(false);
      service.navigate(['expected', 'test', 'route']);
      expect(routerSpy).toHaveBeenCalledWith(['expected', 'test', 'route'], undefined);
    });
  });

  describe('When viewing sub as a parent', () => {
    it('should prepend the route with the subsidiary route', async() => {
      subViewServiceSpy.getViewingSubAsParent.and.returnValue(true);
      service.navigate(['expected', 'test', 'route']);
      expect(routerSpy).toHaveBeenCalledWith(['subsidiary', 'expected', 'test', 'route'], undefined);
    })
  })

});
