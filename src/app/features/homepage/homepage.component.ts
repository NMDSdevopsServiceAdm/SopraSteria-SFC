import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth-service';
import { EstablishmentService } from '../../core/services/establishment.service';
import { Worker } from '../../core/model/worker.model';
import { WorkerService } from '../../core/services/worker.service';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
})
export class HomepageComponent implements OnInit, OnDestroy {

  workers: Worker;

  constructor(
    private _loginService: AuthService,
    private establishmentService: EstablishmentService,
    private _workerService: WorkerService,
    private router: Router
  ) {}

  addWorkerBtnAvailable: boolean;

  private subscriptions = [];

  get fullname(): string {
    return this._loginService.fullname == null ? 'TODO' : this._loginService.fullname;
  }
  get establishmentName(): string {
    return this._loginService.establishment.name == null ? 'TODO' : this._loginService.establishment.name;
  }
  get establishmentNmdsId(): string {
    return this._loginService.establishment.nmdsId == null ? 'TODO' : this._loginService.establishment.nmdsId;
  }

  get isFirstLoggedIn(): boolean {
    return this._loginService.isFirstLogin == null ? false : this._loginService.isFirstLogin;
  }

  welcomeContinue() {
    this._loginService.resetFirstLogin();
    this.router.navigate(['/type-of-employer']);
  }

  tryagin() {
    this.router.navigate(['/type-of-employer']);
  }

  addWorker() {
    this.router.navigate(['/worker/start-screen']);
  }

  ngOnInit() {
    this.subscriptions.push(
      this.establishmentService.getStaff().subscribe(numberOfStaff => {
        this.addWorkerBtnAvailable = !!numberOfStaff;
      })
    );

    this._workerService.workers$.subscribe(workers => this.workers = workers);
    this.getWorkers(this.establishmentService.establishmentId);
  }

  getWorkers(estId) {
    console.log(estId);

    this._workerService.getAllWorkers()
      .subscribe(
        (data: Worker[]) => {
          this._workerService.updateState(data);
        },
        (err: any) => {

        },
        () => {
          console.log(this.workers);
        }
      );
  }

  editThisWorker(workerId) {

    this._workerService.getWorker(workerId).subscribe(
      (data: Worker) => {

        this._workerService.updateState(data);

        // Needs to be completed to check for 'Social worker' in 'otherJobs' also.
        if (this.workers[0].mainJob.title === 'Social worker') {
          this.router.navigate(['/worker/mental-health']);
        }
        else {
          this.router.navigate(['/worker/main-job-start-date']);
        }
      },
      (err: any) => {

      },
      () => {}
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
