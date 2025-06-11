import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CareWorkforcePathwayWorkplaceAwarenessAnswersResolver } from './care-workforce-pathway-workplace-awareness';
import { CareWorkforcePathwayService } from '@core/services/care-workforce-pathway.service';
import { of } from 'rxjs';

describe('getCareWorkforcePathwayWorkplaceAwarenessAnswersResolver', () => {
  function setup() {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CareWorkforcePathwayWorkplaceAwarenessAnswersResolver, CareWorkforcePathwayService],
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
