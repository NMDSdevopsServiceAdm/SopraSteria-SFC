import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';

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

  constructor() {}

  ngOnInit() {
    this.remaining = this.max;

    this.subscriptions.add(
      this.control.valueChanges.subscribe(val => {
        this.remaining = this.max - val.length;
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
