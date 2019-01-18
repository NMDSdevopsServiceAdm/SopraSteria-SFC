import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from "@angular/forms"

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html'
})
export class DatePickerComponent implements OnInit {

  @Input() formControlPrefix: string = ""
  @Input() formGroup: FormGroup
  @Input() values: Array<string | number>
  @Input() label: string = ""

  constructor() { }

  ngOnInit() {
  }

}
