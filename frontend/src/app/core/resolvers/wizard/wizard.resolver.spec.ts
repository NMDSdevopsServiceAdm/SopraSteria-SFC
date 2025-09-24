import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { WizardService } from '@core/services/wizard.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';

import { WizardResolver } from './wizard.resolver';
import { provideRouter } from '@angular/router';

describe('WizardResolver', () => {
  let resolver: WizardResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        WizardResolver,
        {
          provide: PermissionsService,
          useClass: MockPermissionsService,
        },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    resolver = TestBed.inject(WizardResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });

  it('should resolve when canViewBenchmarks is false', () => {
    const wizardService = TestBed.inject(WizardService);
    spyOn(wizardService, 'getWizardPage').and.callThrough();

    const permissionsService = TestBed.inject(PermissionsService);
    spyOn(permissionsService, 'can').and.returnValue(false);

    resolver.resolve();

    expect(wizardService.getWizardPage).toHaveBeenCalledWith(false);
  });

  it('should resolve when canViewBenchmarks is true', () => {
    const wizardService = TestBed.inject(WizardService);
    spyOn(wizardService, 'getWizardPage').and.callThrough();

    const permissionsService = TestBed.inject(PermissionsService);
    spyOn(permissionsService, 'can').and.returnValue(true);

    resolver.resolve();

    expect(wizardService.getWizardPage).toHaveBeenCalledWith(true);
  });
});
