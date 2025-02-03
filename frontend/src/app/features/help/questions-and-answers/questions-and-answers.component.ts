import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';

@Component({
  selector: 'app-questions-and-answers',
  templateUrl: './questions-and-answers.component.html',
})
export class QuestionsAndAnswersComponent {
  public sections: any;
  constructor(private route: ActivatedRoute, private breadcrumbService: BreadcrumbService) {}

  ngOnInit(): void {
    this.sections = this.route.snapshot.data?.questionsAndAnswers?.data;
    this.breadcrumbService.show(JourneyType.HELP);
  }
}
