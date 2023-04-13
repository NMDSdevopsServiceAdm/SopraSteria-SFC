import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import * as slugify from 'slugify';

@Component({
  selector: 'app-new-wdf-tab',
  templateUrl: './new-wdf-tab.component.html',
  styleUrls: ['./new-wdf-tab.component.scss'],
})
export class WDFTabComponent implements OnInit {
  @Input() title;
  @Input() active = false;
  @Input() alert = false;
  @Input() redAlert = false;
  @Input() greenTick = false;
  @Input() redCross = false;
  @Input() viewWDFData: boolean;
  @Output() handleViewToggle: EventEmitter<boolean> = new EventEmitter();

  public slug: string;

  ngOnInit() {
    this.slug = slugify.default(this.title, { lower: true });
    console.log({ viewTrainingByCategory: this.viewWDFData });
  }

  public handleViewChange(event: Event): void {
    event.preventDefault();
    this.handleViewToggle.emit(!this.viewWDFData);
  }
}
