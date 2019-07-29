import { Component, OnInit } from '@angular/core';
import { WorkplaceService } from '@core/services/workplace.service';

@Component({
  selector: 'app-add-workplace-complete',
  templateUrl: './add-workplace-complete.component.html',
})
export class AddWorkplaceCompleteComponent implements OnInit {
  constructor(private workplaceService: WorkplaceService) {}

  ngOnInit(): void {
    this.workplaceService.addWorkplaceComplete$.next(true);
  }
}
