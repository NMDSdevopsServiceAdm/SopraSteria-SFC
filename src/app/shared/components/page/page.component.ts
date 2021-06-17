import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Page } from '@core/model/page.model';

@Component({
  selector: 'app-page',
  templateUrl: './page.component.html',
})
export class PageComponent implements OnInit {
  @Input() public page: Page;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.page = this.route.snapshot.data.pages?.data[0];
  }
}
