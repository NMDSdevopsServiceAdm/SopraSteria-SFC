import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FeedbackService } from '@core/services/feedback.service';

@Component({
    selector: 'app-phase-banner',
    templateUrl: './phase-banner.component.html',
    standalone: false
})
export class PhaseBannerComponent {
  constructor(private feedbackService: FeedbackService, private router: Router, private route: ActivatedRoute) {}

  public setReturn(): void {
    const parsed = this.router.parseUrl(this.router.url);
    const url = {
      url: ['/' + parsed.root.children.primary.segments.map((seg) => seg.path).join('/')],
      fragment: parsed.fragment,
      queryParams: parsed.queryParams,
    };

    this.feedbackService.setReturnTo(url);
  }
}
