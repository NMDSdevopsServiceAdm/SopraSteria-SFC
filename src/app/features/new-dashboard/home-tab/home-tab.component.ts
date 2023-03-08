import { Component, OnInit } from '@angular/core';
import { BreadcrumbService } from '@core/services/breadcrumb.service';

@Component({
  selector: 'app-new-home-tab',
  templateUrl: './home-tab.component.html',
})
export class NewHomeTabComponent implements OnInit {
  constructor(private breadcrumbService: BreadcrumbService) {}

  ngOnInit(): void {
    console.log('**** home tab ****');
    // this.breadcrumbService.show(null);
  }
}
