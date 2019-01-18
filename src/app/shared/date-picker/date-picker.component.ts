import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from "@angular/forms"

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html'
})
export class DatePickerComponent implements OnInit {

  @Input() formControlPrefix: string = ""
  @Input() form: FormGroup
  @Input() values: Array<string | number>

  constructor() { }

  ngOnInit() {
  }

}
