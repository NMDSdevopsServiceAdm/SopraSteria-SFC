import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-error-summary',
  templateUrl: './error-summary.component.html',
  styleUrls: ['./error-summary.component.scss'],
})
export class ErrorSummaryComponent implements OnInit {
  @Input() errors;

  constructor() {}

  ngOnInit() {
    console.log(this.errors);
  }
}
