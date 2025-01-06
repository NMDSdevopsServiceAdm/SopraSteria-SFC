import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-character-count',
  templateUrl: './character-count.component.html',
})
export class CharacterCountComponent implements OnInit, OnDestroy {
  public remaining: number;
  private subscriptions: Subscription = new Subscription();
  @Input() control: UntypedFormControl;
  @Input() max: number;
  @Input() words = false;

  ngOnInit() {
    this.remaining = this.max;
    this.subscriptions.add(this.control.valueChanges.subscribe((value) => this.updateRemainingCount(value)));
  }

  private updateRemainingCount(value: string) {
    if (!value) {
      this.remaining = this.max;
    }

    const inputTextCount = this.words ? value.match(/\S+/g).length : value.length;
    this.remaining = this.max - inputTextCount;
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
