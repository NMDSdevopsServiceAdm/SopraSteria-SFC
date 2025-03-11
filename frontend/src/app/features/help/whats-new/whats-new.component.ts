import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { HelpPage } from '@core/model/help-pages.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';

@Component({
  selector: 'app-whats-new',
  templateUrl: './whats-new.component.html',
})
export class WhatsNewComponent implements OnInit {
  public helpPage: HelpPage;

  constructor(public route: ActivatedRoute, private breadcrumbService: BreadcrumbService) {}

  ngOnInit(): void {
    this.helpPage = this.route.snapshot.data.helpPage?.data[0];
    this.breadcrumbService.show(JourneyType.HELP);
    this.applyClass();
  }

  public applyClass(): void {
    let regex = /<hr>/g;

    let content = this.helpPage?.content.replace(regex, '<hr class="asc__hr_under_heading">');
    this.helpPage.content = content;
  }
}
