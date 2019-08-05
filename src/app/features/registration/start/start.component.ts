import { Component, OnInit } from '@angular/core';
import { BackService } from '@core/services/back.service';

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
})
export class StartComponent implements OnInit {
  constructor(private backService: BackService) {}

  ngOnInit() {
    this.backService.setBackLink({ url: ['/login'] });
  }
}
