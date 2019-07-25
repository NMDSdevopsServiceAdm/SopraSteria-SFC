import { Component, OnInit } from '@angular/core';
import { BackService } from '@core/services/back.service';

@Component({
  selector: 'app-add-workplace',
  templateUrl: './add-workplace.component.html',
})
export class AddWorkplaceComponent implements OnInit {
  constructor(private backService: BackService) {}

  ngOnInit() {
    this.setBackLink();
  }

  private setBackLink(): void {
    this.backService.setBackLink({ url: ['/workplace/view-my-workplaces'] });
  }
}
