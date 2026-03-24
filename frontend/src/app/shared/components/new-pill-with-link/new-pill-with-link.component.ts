import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-new-pill-with-link',
  templateUrl: './new-pill-with-link.component.html',
  styleUrls: ['./new-pill-with-link.component.scss'],
  standalone: false,
})
export class NewPillWithLinkComponent implements OnInit {
  @Input() showNewPill: boolean = false;
  @Input() linkText: string = '';
  @Output() clicked = new EventEmitter<boolean>();

  constructor() {}

  ngOnInit(): void {}

  onLinkClick(event: Event): void {
    event.preventDefault();
    this.clicked.emit(true);
  }
}
