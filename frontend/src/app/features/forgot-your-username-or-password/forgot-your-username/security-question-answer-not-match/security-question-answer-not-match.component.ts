import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-security-question-answer-not-match',
  templateUrl: './security-question-answer-not-match.component.html',
  styleUrls: ['./security-question-answer-not-match.component.scss'],
})
export class SecurityQuestionAnswerNotMatchComponent {
  constructor(private router: Router) {}
}
