import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { fireEvent, render } from '@testing-library/angular';
import { AscWdsCertificateComponent } from './asc-wds-certificate.component';

describe('AscWdsCertificateComponent', () => {

  async function setup() {
    const {fixture, getByTestId, getByText, getByAltText} = await render(AscWdsCertificateComponent, {
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
      ]
    })

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    const component = fixture.componentInstance;

    return {
      component,
      fixture,
      getByAltText,
      getByTestId,
      getByText,
      routerSpy,
    };
  }

  it('should render an AscWdsCertificateComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  })

  describe('Certificate Download Section', () => {
    const sectionTestId = 'certificateDownload';

    it('should render a certificate download section', async () => {
      const { component, getByTestId } = await setup();
      expect(getByTestId(sectionTestId)).toBeTruthy();
    })

    it('should render a sample image', async () => {
      const { component, getByTestId } = await setup();
      const section = getByTestId(sectionTestId);
      expect(section.getElementsByTagName('img').item(0)).toBeTruthy();
    })
  })

  describe('Footer Download Section', () => {
    const sectionTestId = 'certificateDownload';

    it('should render a footer download section', async () => {
      const { component, getByTestId } = await setup();
      expect(getByTestId(sectionTestId)).toBeTruthy();
    })

    it('should render a footer image', async () => {
      const { component, getByTestId } = await setup();
      const section = getByTestId(sectionTestId);
      expect(section.getElementsByTagName('img').item(0)).toBeTruthy();
    })
  })

  describe('Logo Download Section', () => {
    const sectionTestId = 'logoDownload';

    it('should render a logo download section', async () => {
      const { component, getByTestId } = await setup();
      expect(getByTestId(sectionTestId)).toBeTruthy();
    })

    it('should render a logo image', async () => {
      const { component, getByTestId } = await setup();
      const section = getByTestId(sectionTestId);
      expect(section.getElementsByTagName('img').item(0)).toBeTruthy();
    })
  })

  describe('Return Button', () => {
    it('should navigate back to home tab', async () => {
      const {fixture, getByTestId, routerSpy} = await setup();
      const button = getByTestId('returnButton');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(button.getAttribute('href')).toEqual('/dashboard');
    })
  })
})