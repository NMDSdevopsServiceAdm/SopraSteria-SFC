import { Component, Input } from '@angular/core';

enum Status {
  Todo = 'todo',
}

@Component({
  selector: 'app-inset-text',
  templateUrl: './inset-text.component.html',
  styleUrls: ['./inset-text.component.scss'],
})
export class InsetTextComponent {
  @Input() color: Status;
  constructor() {}
}
