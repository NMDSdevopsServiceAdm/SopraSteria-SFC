import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BackLinkService } from '@core/services/backLink.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';

@Component({
  selector: 'app-expired-training',
  templateUrl: './expired-training.component.html',
})
export class ExpiredTrainingComponent implements OnInit {
  public title = 'Expired training records';
  public expiredTraining: any[];
  public workplaceUid: string;
  public canEditWorker: boolean;

  constructor(
    public backLinkService: BackLinkService,
    private router: Router,
    private route: ActivatedRoute,
    private establishmentService: EstablishmentService,
    private permissionsService: PermissionsService,
  ) {}

  ngOnInit(): void {
    console.log('Expired Training compoennt');
    this.expiredTraining = this.route.snapshot.data.expiredTraining.training;
    this.workplaceUid = this.establishmentService.establishmentId;
    this.canEditWorker = this.permissionsService.can(this.workplaceUid, 'canEditWorker');
    console.log(this.expiredTraining);
    this.backLinkService.showBackLink();
  }

  public returnToHome(): void {
    this.router.navigate(['/dashboard'], { fragment: 'training-and-qualifications' });
  }
}
