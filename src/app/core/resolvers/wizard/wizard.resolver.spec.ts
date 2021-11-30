// import { HttpClientTestingModule } from '@angular/common/http/testing';
// import { TestBed } from '@angular/core/testing';
// import { ActivatedRouteSnapshot } from '@angular/router';
// import { RouterTestingModule } from '@angular/router/testing';
// import { EmailCampaignService } from '@core/services/admin/email-campaign.service';

// import { WizardResolver } from './wizard.resolver';

// describe('WizardResolver', () => {
//   let resolver: WizardResolver;

//   beforeEach(() => {
//     TestBed.configureTestingModule({
//       imports: [ApplicationModule, HttpClientTestingModule, RouterTestingModule.withRoutes([])],
//       providers: [WizardResolver],
//     });
//     resolver = TestBed.inject(WizardResolver);
//   });

//   it('should be created', () => {
//     expect(resolver).toBeTruthy();
//   });

//   it('should resolve', () => {
//     const emailCampaignService = TestBed.inject(EmailCampaignService);
//     spyOn(emailCampaignService, 'getTargetedTemplates').and.callThrough();

//     resolver.resolve({} as ActivatedRouteSnapshot);

//     expect(emailCampaignService.getTargetedTemplates).toHaveBeenCalled();
//   });
// });
