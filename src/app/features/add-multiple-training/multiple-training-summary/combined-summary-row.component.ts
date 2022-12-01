import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-combined-summary-row',
  templateUrl: './combined-summary-row.component.html',
})
export class CombinedSummaryRowComponent implements OnInit {
  @Input() content: any; // Should be a collection of key-value pairs

  ngOnInit(): void {
    console.log('content: ' + this.content);
  }
}
