import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { EmailCampaignService } from '@core/services/admin/email-campaign.service';
import { SearchModule } from '@features/search/search.module';
import { EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: SearchModule,
})
export class EmailCampaignHistoryResolver implements Resolve<any> {
  constructor(private router: Router, private emailCampaignService: EmailCampaignService) {}

  resolve(route: ActivatedRouteSnapshot) {
    return this.emailCampaignService.getHistory().pipe(
      catchError(() => {
        this.router.navigate(['/emails']);
        return EMPTY;
      }),
    );
  }
}
