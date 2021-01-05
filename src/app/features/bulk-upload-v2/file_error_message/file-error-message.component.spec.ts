import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserModule } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { BulkUploadService, BulkUploadServiceV2 } from '@core/services/bulk-upload.service';
import { render } from '@testing-library/angular';
import { BulkUploadV2Module } from '../bulk-upload.module';

import { FileErrorMessageComponent } from './file-error-message.component';

describe('FileErrorMessage', () => {
  const setup = async () => {
    const component = await render(FileErrorMessageComponent, {
      imports: [],
      providers: [],
      declarations: [FileErrorMessageComponent],
    });
    return component;
  };

  it('should render FileErrorMessage', async () => {
    const component = await setup();

    expect(component).toBeTruthy();
  });

  it('should render an error message', async () => {
    const component = await setup();
    component.fixture.componentInstance.warning = 1;
    component.fixture.componentInstance.error = 1;
    component.fixture.detectChanges(true);
    const p: HTMLElement = component.fixture.nativeElement.querySelector('p');
    expect(p.innerText).toContain('There is 1 error and 1 warning in this file.');
  });
  it('should puralise the error message', async () => {
    const component = await setup();
    component.fixture.componentInstance.warning = 3;
    component.fixture.componentInstance.error = 5;
    component.fixture.detectChanges(true);
    const p: HTMLElement = component.fixture.nativeElement.querySelector('p');
    expect(p.innerText).toContain('There are 5 errors and 3 warnings in this file.');
  });
});
