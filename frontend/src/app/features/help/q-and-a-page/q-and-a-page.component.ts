import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { HelpPage } from '@core/model/help-pages.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';

@Component({
  selector: 'app-q-and-a-page',
  templateUrl: './q-and-a-page.component.html',
})
export class QAndAPageComponent implements OnInit {
  public helpPage: HelpPage;

  constructor(public route: ActivatedRoute, private breadcrumbService: BreadcrumbService, private router: Router) {}

  ngOnInit(): void {
    this.helpPage = this.route.snapshot.data.questionAndAnswerPage?.data[0];
    this.breadcrumbService.show(JourneyType.HELP);
  }

  public goBackToQandAsPage(event: Event): void {
    event.preventDefault();
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
