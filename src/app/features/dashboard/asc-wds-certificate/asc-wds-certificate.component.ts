import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EstablishmentService } from '@core/services/establishment.service';

@Component({
  selector: 'app-asc-wds-certificate',
  templateUrl: './asc-wds-certificate.component.html',
})
export class AscWdsCertificateComponent implements OnInit {
  constructor(protected establishmentService: EstablishmentService, router: Router) {}

  private defaultFileName = `ASC-WDS+certificate`;
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
    this.establishmentService.getCertificate(this.establishmentService.establishmentId, this.years).subscribe((x) => {
      console.log({ frontendx: x });
      console.log({ frontend: x.data });

      window.open(x.data);
    });
  }
}
