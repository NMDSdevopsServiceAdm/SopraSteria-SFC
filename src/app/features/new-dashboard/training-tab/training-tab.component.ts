import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-new-training-tab',
  templateUrl: './training-tab.component.html',
})
export class NewTrainingTabComponent implements OnInit {
  ngOnInit(): void {
    console.log('**** new training tab *****');
  }
}
