import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-back-to-parent-link',
  templateUrl: './back-to-parent-link.component.html',
  styleUrls: ['./back-to-parent-link.component.scss'],
})
export class BackToParentComponent implements OnInit {
  @Input() primaryWorkplaceName: string;
  @Output() backToParentLinkClicked = new EventEmitter();

  constructor() {}

  ngOnInit() {}

  public backToParentLinkClick(event: Event) {
    event.preventDefault();
    this.backToParentLinkClicked.emit(event);
  }
}
