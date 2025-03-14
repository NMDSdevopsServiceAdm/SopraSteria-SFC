import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-number-input',
  templateUrl: './number-input.component.html',
  styleUrls: ['./number-input.component.scss'],
})
export class NumberInputComponent {
  @Input() initialValue: number = null;
  @Input() min: number = 1;
  @Input() max: number = null;
  @Input() labelText: string = '';
  @Input() id: string = 'number-input';
  @Output() change = new EventEmitter<number>();

  public value: number;

  ngOnInit() {
    this.value = this.initialValue;
  }

  increase() {
    if (!this.value) {
      this.value = this.min;
    }
  }

  decrease() {
    if (!this.value) {
      this.value = this.min;
    }
  }
}
