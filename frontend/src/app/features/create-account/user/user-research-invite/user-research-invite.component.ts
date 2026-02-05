import { Component } from '@angular/core';
import { BackLinkService } from '@core/services/backLink.service';
// import { ActivatedRoute, Router } from '@angular/router';
// import { TrainingService } from '@core/services/training.service';

@Component({
  selector: 'app-user-research-invite',
  templateUrl: './user-research-invite.component.html',
  styleUrl: './user-research-invite.component.scss',
  standalone: false
})
export class UserResearchInviteComponent {
  public detailsTitle: string = 'Why take part in our user research sessions?';
  public detailsTextOne: string =
    'The feedback you give us in online user research sessions allows us ' +
    'to improve the service and provide the sector with more useful tools.';
  public detailsTextTwo: string =
    'Sessions last about an hour and are arranged for a time that suits you.';

  constructor(
    private backLinkService: BackLinkService,
  ) {}

  ngOnInit(): void {
    this.setBackLink();
  }

  private setBackLink(): void {
    this.backLinkService.showBackLink();
  }
}
