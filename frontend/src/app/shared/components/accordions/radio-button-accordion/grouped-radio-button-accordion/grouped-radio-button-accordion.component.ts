import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface AccordionGroup {
  title: string;
  descriptionText: string;
  open: boolean;
  index: number;
  items: {
    id: number;
    label: string;
  }[];
}

@Component({
    selector: 'app-grouped-radio-button-accordion',
    templateUrl: './grouped-radio-button-accordion.component.html',
    styleUrls: ['../radio-button-accordion.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => GroupedRadioButtonAccordionComponent),
            multi: true,
        },
    ],
    standalone: false
})
export class GroupedRadioButtonAccordionComponent implements ControlValueAccessor, OnInit {
  @Input() preFilledId: number;
  @Input() formControlName: string;
  @Input() textShowHideAll?: string;
  @Input() hasError: boolean = false;
  @Input() errorMessage: string;
  private _showAll: boolean;
  @Input() set accordions(value: AccordionGroup[]) {
    this._accordions = value.map((x, index) => {
      return {
        ...x,
        open: false,
        index: index,
      };
    });
  }

  toggleText: string;

  get accordions() {
    return this._accordions;
  }

  private _accordions: {
    open: boolean;
    title: string;
    descriptionText: string;
    index: number;
    items: {
      id: number;
      label: string;
    }[];
  }[];

  ngOnInit(): void {
    this.showAll = false;
    this.toggleAccordionOfPrefilledRadioButton();
  }

  ngOnChanges(): void {
    if (this.hasError) {
      this.openAll();
    }
  }

  public openAll(): void {
    this.accordions.forEach((x) => (x.open = true));
    this.showAll = true;
  }

  public hideAll() {
    this.accordions.forEach((x) => (x.open = false));
    this.showAll = false;
  }

  public toggleAll(): void {
    if (this.accordions?.some((x) => x.open !== true)) {
      this.openAll();
    } else {
      this.hideAll();
    }
  }

  private set showAll(showAll: boolean) {
    this._showAll = showAll;
    this.updateToggleAlltext();
  }

  public get showAll(): boolean {
    return this._showAll;
  }

  private updateToggleAlltext() {
    if (this.accordions?.every((x) => x.open === true)) {
      this.toggleText = `Hide all ${this.textShowHideAll}`;
    } else {
      this.toggleText = `Show all ${this.textShowHideAll}`;
    }
  }

  public toggleAccordion(index) {
    this.accordions[index].open = !this._accordions[index].open;
    this.showAll = this._accordions.every((accordion) => accordion.open);
  }

  @Input('value') _value = null;
  onChange: any = () => {};
  onTouched: any = () => {};

  get value() {
    return this._value;
  }

  set value(val) {
    this._value = val;
    this.onChange(val);
    this.onTouched();
  }

  writeValue(value): void {
    if (value) {
      this.value = value;
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onClick(val: number) {
    this.value = val;
  }

  public toggleAccordionOfPrefilledRadioButton() {
    if (this.preFilledId) {
      for (let i = 0; i < this.accordions.length; i++) {
        for (let j = 0; j < this.accordions[i].items.length; j++) {
          if (this.accordions[i].items[j].id === this.preFilledId) {
            this.accordions[i].open = true;
            return;
          }
        }
      }
    }
  }
}
