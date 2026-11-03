import { Component, OnInit, signal } from '@angular/core';
import { EmailCampaignService } from '@core/services/admin/email-campaign.service';
import { timer, mergeMap, Subscription } from 'rxjs';

@Component({
  selector: 'app-send-emails-result',
  templateUrl: './send-emails-result.component.html',
  styleUrl: './send-emails-result.component.scss',
  standalone: false,
})
export class SendEmailsResultComponent implements OnInit {
  successfulCount = signal('');
  failedCount = signal('');
  todayTotalCount = signal('');
  timestamp = signal('');
  failed = signal([]);

  private subscriptions: Subscription = new Subscription();

  constructor(private emailCampaignService: EmailCampaignService) {}

  ngOnInit(): void {
    const oneMinute = 60 * 1000;

    this.subscriptions.add(
      timer(0, oneMinute)
        .pipe(
          mergeMap(() => {
            return this.emailCampaignService.getSendEmailsResult();
          }),
        )
        .subscribe((result) => {
          const { successfulCount = 0, failedCount = 0, todayTotalCount = 0, timestamp, failed } = result;
          this.successfulCount.set(successfulCount);
          this.failedCount.set(failedCount);
          this.todayTotalCount.set(todayTotalCount);
          this.timestamp.set(timestamp);
          this.failed.set(failed);
        }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
