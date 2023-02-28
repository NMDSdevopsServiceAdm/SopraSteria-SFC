import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-new-workplace-tab',
  templateUrl: './workplace-tab.component.html',
})
export class NewWorkplaceTabComponent implements OnInit {
  ngOnInit(): void {
    console.log('***** new workplace tab *****');
  }
}
