import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';

@Component({
  selector: 'app-help-area',
  templateUrl: './help-area.component.html',
  styleUrls: ['./help-area.component.scss'],
})
export class HelpAreaComponent implements OnInit {
  public workplaceName: string;
  public tabs = [
    { route: 'get-started', linkText: 'Get started' },
    { route: 'questions-and-answers', linkText: 'Questions and answers' },
    { route: 'whats-new', linkText: "What's new" },
    { route: 'helpful-downloads', linkText: 'Helpful downloads' },
    { route: 'contact-us', linkText: 'Contact us' },
  ];
  public currentTabIndex: number = 0;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private establishmentService: EstablishmentService,
    private breadcrumbService: BreadcrumbService,
  ) {}

  ngOnInit(): void {
    this.workplaceName = this.establishmentService.establishment?.name;
    this.breadcrumbService.show(JourneyType.HELP);
  }

  public onTabClick(event: Event, tabIndex: number): void {
    event.preventDefault();

    this.currentTabIndex = tabIndex;
    this.router.navigate([this.tabs[tabIndex].route], { relativeTo: this.route }).then(() => {
      const link = event.target as HTMLElement;
      link.focus();
    });
  }
}
