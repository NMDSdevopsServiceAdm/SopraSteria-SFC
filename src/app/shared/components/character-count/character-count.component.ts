import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-character-count',
  templateUrl: './character-count.component.html',
})
export class CharacterCountComponent implements OnInit, OnDestroy {
  public remaining: number;
  private subscriptions: Subscription = new Subscription();
  @Input() control: FormControl;
  @Input() max: number;
  @Input() words = false;

  ngOnInit() {
    this.remaining = this.max;

    this.subscriptions.add(
      this.control.valueChanges.pipe(debounceTime(200)).subscribe((value: string) => {
        if (value) {
          if (this.words) {
            this.remaining = this.max - value.match(/\S+/g).length;
          } else {
            this.remaining = this.max - value.length;
          }
        } else {
          this.remaining = this.max;
        }
      }),
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
