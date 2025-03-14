import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-number-input',
  templateUrl: './number-input.component.html',
  styleUrls: ['./number-input.component.scss'],
})
export class NumberInputComponent {
  @Input() initialValue: number = null;
  @Input() min: number = 1;
  @Input() max: number = Infinity;
  @Input() labelText: string = '';
  @Input() id: string = 'number-input';
  @Output() onChange = new EventEmitter<number>();

  private _state: number;

  ngOnInit() {
    this.state = this.initialValue === null ? null : Number(this.initialValue);
    this.min = Number(this.min);
    this.max = Number(this.max);
  }

  get state(): number {
    return this._state;
  }

  set state(newValue: number) {
    this._state = newValue;
    this.onChange.emit(this._state);
  }

  onInput(event: Event) {
    event.preventDefault();
    const parsedValue = parseInt((event.target as HTMLInputElement).value);

    this.state = isNaN(parsedValue) ? null : parsedValue;
  }

  increase() {
    if (!Number(this.state)) {
      this.state = Number(this.min);
      return;
    }

    this.state = Math.min(this.max, this.state + 1);
  }

  decrease() {
    if (!Number(this.state)) {
      this.state = Number(this.min);
      return;
    }

    this.state = Math.max(this.min, this.state - 1);
  }
}
