import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CareWorkforcePathwayWorkplaceAwarenessAnswersResolver } from './care-workforce-pathway-workplace-awareness';
import { CareWorkforcePathwayService } from '@core/services/care-workforce-pathway.service';
import { of } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';

describe('getCareWorkforcePathwayWorkplaceAwarenessAnswersResolver', () => {
  function setup() {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        CareWorkforcePathwayWorkplaceAwarenessAnswersResolver,
        CareWorkforcePathwayService,

        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    const resolver = TestBed.inject(CareWorkforcePathwayWorkplaceAwarenessAnswersResolver);
    const careWorkforcePathwayService = TestBed.inject(CareWorkforcePathwayService);

    const getCareWorkforcePathwayWorkplaceAwarenessAnswersSpy = spyOn(
      careWorkforcePathwayService,
      'getCareWorkforcePathwayWorkplaceAwarenessAnswers',
    ).and.returnValue(of(null));

    return {
      resolver,
      careWorkforcePathwayService,
      getCareWorkforcePathwayWorkplaceAwarenessAnswersSpy,
    };
  }

  it('should create', () => {
    const { resolver } = setup();
    expect(resolver).toBeTruthy();
  });

  it('should call getCareWorkforcePathwayWorkplaceAwarenessAnswers', () => {
    const { resolver, getCareWorkforcePathwayWorkplaceAwarenessAnswersSpy } = setup();

    resolver.resolve();

    expect(getCareWorkforcePathwayWorkplaceAwarenessAnswersSpy).toHaveBeenCalled();
  });
});
