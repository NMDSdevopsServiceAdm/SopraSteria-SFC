import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Page } from '@core/model/page.model';
import { Wizard } from '@core/model/wizard.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-helpful-downloads',
  templateUrl: './helpful-downloads.component.html',
})
export class HelpfulDownloadsComponent {
  public helpfulDownloadsPage: Page;

  constructor(public route: ActivatedRoute, private breadcrumbService: BreadcrumbService) {}

  ngOnInit(): void {
    this.breadcrumbService.show(JourneyType.HELP);
    this.helpfulDownloadsPage = this.route.snapshot.data.page?.data[0];
    this.applyClass();
  }

  public applyClass(): void {
    let regex = /<a/g;

    console.log('content before: ', this.helpfulDownloadsPage.content)

    let content = this.helpfulDownloadsPage?.content.replace(regex, '<a style="display: flex;"');
    console.log('content after: ', content)
    this.helpfulDownloadsPage.content = content;
  }
}
