import { TestBed } from '@angular/core/testing';

import { CareWorkforcePathwayUseReasonsResolver } from './care-workforce-pathway-use-reasons.resolver';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CareWorkforcePathwayService } from '@core/services/care-workforce-pathway.service';
import { of } from 'rxjs';

describe('CareWorkforcePathwayUseReasonsResolver', () => {
  function setup() {
    TestBed.configureTestingModule({
      imports: [],
      providers: [CareWorkforcePathwayUseReasonsResolver, provideHttpClient(), provideHttpClientTesting()],
    });

    const resolver = TestBed.inject(CareWorkforcePathwayUseReasonsResolver);

    const careWorkforcePathwayService = TestBed.inject(CareWorkforcePathwayService);
    const careWorkforcePathwayServiceSpy = spyOn(
      careWorkforcePathwayService,
      'getAllCareWorkforcePathwayUseReasons',
    ).and.returnValue(of(null));

    return {
      resolver,
      careWorkforcePathwayService,
      careWorkforcePathwayServiceSpy,
    };
  }

  it('should create', () => {
    const { resolver } = setup();

    expect(resolver).toBeTruthy();
  });

  it('should call the getAllCareWorkforcePathwayUseReasons method of CWP service', () => {
    const { resolver, careWorkforcePathwayServiceSpy } = setup();

    resolver.resolve();

    expect(careWorkforcePathwayServiceSpy).toHaveBeenCalled();
  });
});
