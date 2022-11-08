import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { EstablishmentService } from '@core/services/establishment.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-asc-wds-certificate',
  templateUrl: './asc-wds-certificate.component.html',
})
export class AscWdsCertificateComponent implements OnInit {
  constructor(protected establishmentService: EstablishmentService, router: Router) {}

  private defaultFileName = `ASC-WDS+certificate`;
  isDev = environment.dev ?? false;
  public certificateName: string;
  public years: string;
  public downloadLink;

  ngOnInit(): void {
    this.getCertificateName();
  }

  private getCertificateName = () => {
    this.years = this.getYears();

    const establishmentId = this.establishmentService.establishmentId;

    this.certificateName = `${establishmentId}+${this.defaultFileName}+${this.years}.pdf`;
  };

  private getYears = () => {
    const date = new Date();
    const currentMonth = date.getMonth();
    const currentYear = date.getFullYear() - 2000;

    if (currentMonth >= 4) {
      return `${currentYear}-${currentYear + 1}`;
    } else {
      return `${currentYear - 1}-${currentYear}`;
    }
  };

  async downloadCertificate(): Promise<any> {
    console.log(this.establishmentService.establishmentId);
    this.establishmentService
      .getCertificate(this.establishmentService.establishmentId, this.years)
      .subscribe((x) => window.open(x.data));
  }
}
