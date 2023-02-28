import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-new-home-tab',
  templateUrl: './home-tab.component.html',
})
export class NewHomeTabComponent implements OnInit {
  ngOnInit(): void {
    console.log('******** new home page ************');
  }
}
