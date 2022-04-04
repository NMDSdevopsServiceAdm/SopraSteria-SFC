import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { BackService } from '@core/services/back.service';
import { GrantLetterService } from '@core/services/wdf-claims/wdf-grant-letter.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-grant-letter-check-details',
  templateUrl: './grant-letter-check-details.component.html',
})
export class GrantLetterCheckDetailsComponent implements OnInit, OnDestroy {
  public name: string;
  public email: string;
  public radioSelected: string;
  private workplace: Establishment;
  private subscriptions: Subscription = new Subscription();

  constructor(
    public backService: BackService,
    private grantLetterService: GrantLetterService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.setBackLink();

    this.name = history.state?.name;
    this.email = history.state?.email;
    this.radioSelected = history.state?.radioSelection;
    this.workplace = this.route.snapshot.data.primaryWorkplace;
  }

  public setBackLink(): void {
    this.backService.setBackLink({ url: ['wdf-claims', 'grant-letter'] });
  }

  onSubmit(): void {
    this.subscriptions.add(
      this.grantLetterService.sendEmailGrantLetter(this.workplace.uid, this.name, this.email).subscribe(),
    );
    this.router.navigate(['wdf-claims', 'grant-letter', 'grant-letter-sent']);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
