import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { EmailCampaignService } from '@core/services/admin/email-campaign.service';
import { EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class EmailCampaignHistoryResolver implements Resolve<any> {
  constructor(private router: Router, private emailCampaignService: EmailCampaignService) {}

  resolve(route: ActivatedRouteSnapshot) {
    return this.emailCampaignService.getInactiveWorkplacesHistory().pipe(
      catchError(() => {
        this.router.navigate(['/problem-with-the-service']);
        return EMPTY;
      }),
    );
  }
}
