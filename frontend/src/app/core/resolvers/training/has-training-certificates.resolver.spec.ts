import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';

import { HasTrainingCertificatesResolver } from './has-training-certificates.resolver';

describe('HasTrainingCertificatesResolver', () => {
  function setup() {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      providers: [
        HasTrainingCertificatesResolver,
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
      ],
    });

    const resolver = TestBed.inject(HasTrainingCertificatesResolver);

    const establishmentService = TestBed.inject(EstablishmentService);
    const workplaceOrSubHasTrainingCertificatesSpy = spyOn(
      establishmentService,
      'workplaceOrSubHasTrainingCertificates',
    ).and.callThrough();

    return {
      resolver,
      establishmentService,
      workplaceOrSubHasTrainingCertificatesSpy,
    };
  }

  it('should create', () => {
    const { resolver } = setup();

    expect(resolver).toBeTruthy();
  });

  it('should call workplaceOrSubHasTrainingCertificates with primary workplace uid from establishmentService', () => {
    const { resolver, establishmentService, workplaceOrSubHasTrainingCertificatesSpy } = setup();

    resolver.resolve();

    expect(workplaceOrSubHasTrainingCertificatesSpy).toHaveBeenCalledWith(establishmentService.primaryWorkplace.uid);
  });
});
