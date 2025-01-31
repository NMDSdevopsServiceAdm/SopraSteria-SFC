import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-questions-and-answers',
  templateUrl: './questions-and-answers.component.html',
})
export class QuestionsAndAnswersComponent {
  public sections: any;
  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.sections = this.route.snapshot.data?.questionsAndAnswers?.data;
  }
}
