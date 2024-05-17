import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SubsidiaryTabsService } from '@core/services/tabs/subsidiary-tabs.service';
import { ParentSubsidiaryViewService } from '@shared/services/parent-subsidiary-view.service';

@Component({
  selector: 'app-back-to-parent-link',
  templateUrl: './back-to-parent-link.component.html',
  styleUrls: ['./back-to-parent-link.component.scss'],
})
export class BackToParentComponent implements OnInit {
  @Input() parentWorkplaceName: string;

  constructor(
    private router: Router,
    private parentSubsidiaryViewService: ParentSubsidiaryViewService,
    private tabsService: SubsidiaryTabsService,
  ) {}

  ngOnInit() {}

  public backToParentLinkClick(event: Event) {
    event.preventDefault();

    this.parentSubsidiaryViewService.clearViewingSubAsParent();

    this.router.navigate(['/dashboard', { fragment: 'home' }]).then(() => {
      this.tabsService.selectedTab = 'home';
    });
  }
}
