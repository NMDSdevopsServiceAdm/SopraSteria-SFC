import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-character-count',
  templateUrl: './character-count.component.html',
  styleUrls: ['./character-count.component.scss'],
})
export class CharacterCountComponent implements OnInit, OnDestroy {
  public remaining: number;
  private subscriptions: Subscription = new Subscription();
  @Input() control: FormControl;
  @Input() max: number;
  @Input() words: boolean = false;

  ngOnInit() {
    this.remaining = this.max;

    this.subscriptions.add(
      this.control.valueChanges.pipe(debounceTime(200)).subscribe((value: string) => {
        if (this.words) {
          this.remaining = this.max - value.split(' ').filter((v: string) => !!v).length;
        } else {
          this.remaining = this.max - value.length;
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
