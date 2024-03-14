import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-data-area-useful-link-pay',
  templateUrl: './data-area-useful-link-pay.component.html',
})
export class DataAreaUsefulLinkPayComponent implements OnInit {
  public usefulLinkPay = {
    'title': '',
    'content': '',
  };

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    if(this.route.snapshot.data.usefulLinksPay?.data) {
      this.usefulLinkPay = this.route.snapshot.data.usefulLinksPay?.data;
    }
  }
}
