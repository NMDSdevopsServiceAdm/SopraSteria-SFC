import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { AlertService } from '@core/services/alert.service';
import { BackService } from '@core/services/back.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { WorkplaceService } from '@core/services/workplace.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-confirm-staff-recuritment',
  templateUrl: './confirm-staff-recruitment-and-benefits.component.html',
})
export class ConfirmStaffRecruitmentAndBenefitsComponent implements OnInit, OnDestroy {
  protected subscriptions: Subscription = new Subscription();
  public flow = 'workplace';
  public canEditEstablishment: boolean;
  public establishment: Establishment;
  public primaryWorkplace: Establishment;
  public moneySpentOnAdvertisingInTheLastFourWeek: string;
  public peopleInterviewedInTheLastFourWeek: string;
  public doNewStartersRepeatTraining: string;
  public wouldYouAcceptPreviousCertificates: string;

  @Input() public topBorder?: boolean;
  @Input() public wrapBorder?: boolean;

  constructor(
    public establishmentService: EstablishmentService,
    private permissionsService: PermissionsService,
    public router: Router,
    public workplaceService: WorkplaceService,
    public backService: BackService,
    protected alertService: AlertService,
  ) {}

  public ngOnInit(): void {
    this.getEstablishmentData();
    this.canEditEstablishment = this.permissionsService.can(this.establishment.uid, 'canEditEstablishment');
  }

  public getEstablishmentData(): void {
    this.establishmentService.establishment$.subscribe((establishment) => {
      this.primaryWorkplace = this.establishmentService.primaryWorkplace;
      this.establishment = establishment;
      this.setBackLink();
    });
  }

  public setReturn(): void {
    const staffRecruitmentReturnUrl = {
      url: ['/workplace', this.establishment.uid, 'confirm-staff-recruitment-and-benefits'],
    };
    this.establishmentService.setReturnTo(staffRecruitmentReturnUrl);
  }

  public setBackLink(): void {
    const backLinkUrl = 'accept-previous-care-certificate';
    this.backService.setBackLink({ url: [this.flow, this.establishment.uid, backLinkUrl] });
  }

  public async onSuccess(): Promise<void> {
    await this.router.navigate(['/dashboard']);

    this.alertService.addAlert({
      type: 'success',
      message: `Your answers have been saved with your 'Workplace' information`,
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
