import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-character-count',
    templateUrl: './character-count.component.html',
    standalone: false
})
export class CharacterCountComponent implements OnInit, OnDestroy, OnChanges {
  public remaining: number;
  private subscriptions: Subscription = new Subscription();
  @Input() control: UntypedFormControl;
  @Input() max: number;
  @Input() words = false;
  @Input() textToCount: string;

  ngOnInit() {
    this.remaining = this.max;
    if (this.control) {
      this.subscriptions.add(this.control.valueChanges.subscribe((value) => this.updateRemainingCount(value)));
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('textToCount' in changes) {
      this.updateRemainingCount(changes.textToCount.currentValue);
    }
  }

  private updateRemainingCount(value: string) {
    if (!value) {
      this.remaining = this.max;
      return;
    }

    const countInputSize = this.words ? value.match(/\S+/g).length : value.length;
    this.remaining = this.max - countInputSize;
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
