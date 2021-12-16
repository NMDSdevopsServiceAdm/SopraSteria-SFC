import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BenefitsTrainingDiscountsService } from '@core/services/benefits-training-discounts.service';

import { BenefitsTrainingDiscountsResolver } from './benefits-training-discounts.resolver';

describe('BenefitsTrainingDiscountsResolver', () => {
  let resolver: BenefitsTrainingDiscountsResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      providers: [BenefitsTrainingDiscountsResolver],
    });
    resolver = TestBed.inject(BenefitsTrainingDiscountsResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });

  it('should call ', () => {
    const benefitsTrainingDiscountsService = TestBed.inject(BenefitsTrainingDiscountsService);
    spyOn(benefitsTrainingDiscountsService, 'getBenefitsTrainingDiscounts').and.callThrough();

    resolver.resolve();

    expect(benefitsTrainingDiscountsService.getBenefitsTrainingDiscounts).toHaveBeenCalled();
  });
});
