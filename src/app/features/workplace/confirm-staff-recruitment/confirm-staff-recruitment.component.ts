// import { Component } from '@angular/core';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { AlertService } from '@core/services/alert.service';
import { BackService } from '@core/services/back.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkplaceService } from '@core/services/workplace.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-confirm-staff-recuritment',
  templateUrl: './confirm-staff-recruitment.component.html',
})
export class ConfirmStaffRecruitmentComponent implements OnInit, OnDestroy {
  @Input() public topBorder?: boolean;
  @Input() public wrapBorder?: boolean;

  @Output() public setReturn = new EventEmitter();

  protected subscriptions: Subscription = new Subscription();
  public flow = 'workplace';
  public establishment: Establishment;
  public primaryWorkplace: Establishment;
  public moneySpentOnAdvertisingInTheLastFourWeek: string;
  public peopleInterviewedInTheLastFourWeek: string;
  public doNewStartersRepeatTraining: string;
  public wouldYouAcceptPreviousCertificates: string;
  public workplaceName: string;

  constructor(
    public establishmentService: EstablishmentService,
    public router: Router,
    public workplaceService: WorkplaceService,
    public backService: BackService,
    protected alertService: AlertService,
  ) {}

  ngOnInit() {
    this.subscriptions.add(
      this.establishmentService.establishment$.subscribe((establishment) => {
        this.establishment = establishment;
        console.log(this.establishment);

        this.primaryWorkplace = this.establishmentService.primaryWorkplace;
        this.setBackLink();
      }),
    );
    this.moneySpentOnAdvertisingInTheLastFourWeek = this.establishment.moneySpentOnAdvertisingInTheLastFourWeeks;
    this.peopleInterviewedInTheLastFourWeek = this.establishment.peopleInterviewedInTheLastFourWeeks;
    this.doNewStartersRepeatTraining = this.establishment.doNewStartersRepeatMandatoryTrainingFromPreviousEmployment;
    this.wouldYouAcceptPreviousCertificates = this.establishment.wouldYouAcceptCareCertificatesFromPreviousEmployment;
    this.workplaceName = this.establishment.name;
  }

  public emitSetReturn(): void {
    this.setReturn.emit();
  }

  public setBackLink(): void {
    const backLinkUrl = 'accept-previous-care-certificate';
    this.backService.setBackLink({ url: [this.flow, this.establishment.uid, backLinkUrl] });
  }

  public async onSuccess(): Promise<void> {
    await this.router.navigate(['/dashboard']);

    this.alertService.addAlert({
      type: 'success',
      message: `Your answers have been saved with your '${this.workplaceName}' information`,
    });
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
