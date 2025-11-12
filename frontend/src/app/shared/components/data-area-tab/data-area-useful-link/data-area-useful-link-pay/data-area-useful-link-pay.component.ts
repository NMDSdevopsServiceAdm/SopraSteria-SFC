import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-data-area-useful-link-pay',
    templateUrl: './data-area-useful-link-pay.component.html',
    standalone: false
})
export class DataAreaUsefulLinkPayComponent implements OnInit {
  public usefulLinkPay;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.usefulLinkPay = this.route.snapshot.data.usefulLinksPay?.data;
  }
}
