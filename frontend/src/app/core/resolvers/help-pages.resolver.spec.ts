import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HelpPagesService } from '@core/services/help-pages.service';
import { HelpPageResolver } from './help-pages.resolver';
import { ActivatedRouteSnapshot } from '@angular/router';

describe('HelpPageResolver', () => {
  function setup(overrides: any = {}) {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      providers: [
        HelpPageResolver,
        {
          provide: ActivatedRouteSnapshot,
          useValue: {
            url: [{ path: overrides.path ?? null }],
          },
        },
      ],
    });

    const resolver = TestBed.inject(HelpPageResolver);
    const route = TestBed.inject(ActivatedRouteSnapshot);
    const helpPagesService = TestBed.inject(HelpPagesService);

    return {
      resolver,
      route,
      helpPagesService,
    };
  }

  it('should be created', () => {
    const { resolver } = setup();
    expect(resolver).toBeTruthy();
  });

  it('should resolve', () => {
    const override = { path: 'path-name' };
    const { resolver, helpPagesService, route } = setup(override);

    spyOn(helpPagesService, 'getHelpPage').and.callThrough();

    resolver.resolve(route);

    expect(helpPagesService.getHelpPage).toHaveBeenCalled();
  });
});
