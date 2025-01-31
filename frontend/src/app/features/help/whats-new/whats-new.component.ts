import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HelpPage } from '@core/model/help-pages.model';

@Component({
  selector: 'app-whats-new',
  templateUrl: './whats-new.component.html',
})
export class WhatsNewComponent implements OnInit {
  public helpPage: HelpPage;

  constructor(public route: ActivatedRoute) {}

  ngOnInit(): void {
    this.helpPage = this.route.snapshot.data.helpPage?.data[0];
  }
}
