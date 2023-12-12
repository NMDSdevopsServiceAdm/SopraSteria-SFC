// import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { ExternalLinkComponent } from './external-link.component';

describe('ExternalLinkComponent', () => {
  async function setup() {
    const component = await render(ExternalLinkComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule],
    });

    return {
      component,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should take us to the `Direct us test`page', async () => {
    const { component } = await setup();

    const link = component.getByText('Direct us test');

    expect(link.getAttribute('href')).toBe('https://sfccmstest.cloudapps.digital/admin/login');
  });

  it('should take us to the `Direct us live`page', async () => {
    const { component } = await setup();

    const link = component.getByText('Direct us live');

    expect(link.getAttribute('href')).toBe('https://sfccms.cloudapps.digital/admin/login');
  });

  it('should take us to the `CQC`page', async () => {
    const { component } = await setup();

    const link = component.getByText('CQC');

    expect(link.getAttribute('href')).toBe('https://www.cqc.org.uk/');
  });

  it('should take us to the `Gov notify`page', async () => {
    const { component } = await setup();

    const link = component.getByText('Gov notify');

    expect(link.getAttribute('href')).toBe('https://www.notifications.service.gov.uk/sign-in');
  });

  it('should take us to the `Sendinblue`page', async () => {
    const { component } = await setup();

    const link = component.getByText('Sendinblue');

    expect(link.getAttribute('href')).toBe('https://my.sendinblue.com/dashboard');
  });
});
