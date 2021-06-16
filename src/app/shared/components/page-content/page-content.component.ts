import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Page } from '@core/model/page.model';

@Component({
  selector: 'app-page-content',
  templateUrl: './page-content.component.html',
})
export class PageContentComponent implements OnInit {
  @Input() public page: Page;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.page = this.route.snapshot.data.pages?.data[0];
  }
}
