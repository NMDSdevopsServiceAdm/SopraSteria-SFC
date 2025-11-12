import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
    selector: 'app-accordion-section',
    templateUrl: './accordion-section.component.html',
    standalone: false
})
export class AccordionSectionComponent implements OnInit {
  @Input() title: string;
  @Input() description?: string;
  @Input() expandedAtStart: boolean = false;
  @Output() clickEmitter: EventEmitter<Event> = new EventEmitter();

  private _expanded: boolean;

  ngOnInit(): void {
    this._expanded = this.expandedAtStart;
  }

  handleClick() {
    this.clickEmitter.emit();
  }

  get expanded() {
    return this._expanded;
  }

  public open() {
    this._expanded = true;
  }

  public close() {
    this._expanded = false;
  }

  public toggle() {
    this._expanded = !this._expanded;
  }
}
