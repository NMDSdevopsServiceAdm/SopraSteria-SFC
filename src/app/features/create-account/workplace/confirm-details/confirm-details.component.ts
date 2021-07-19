import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-confirm-details',
  templateUrl: './confirm-details.component.html',
})
export class ConfirmDetailsComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {
    console.log('ConfirmDetails component created');
  }
}
