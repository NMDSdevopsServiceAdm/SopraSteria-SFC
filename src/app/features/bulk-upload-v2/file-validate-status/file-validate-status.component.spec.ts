import { render } from '@testing-library/angular';

import { FileValidateStatusComponent } from './file-validate-status.component';

describe('FileValidateStatusComponent', () => {
  const setup = async () => {
    const component = await render(FileValidateStatusComponent, {
      imports: [],
      providers: [],
      declarations: [FileValidateStatusComponent],
    });
    return component;
  };

  it('should render an error message', async () => {
    const component = await setup();
    component.fixture.componentInstance.warnings = 1;
    component.fixture.componentInstance.errors = 1;
    component.fixture.detectChanges(true);
    const p: HTMLElement = component.fixture.nativeElement.querySelector('p');
    expect(p.innerText).toContain('There is 1 error and 1 warning in this file.');
  });
  it('should pluralize the error message', async () => {
    const component = await setup();
    component.fixture.componentInstance.warnings = 3;
    component.fixture.componentInstance.errors = 5;
    component.fixture.detectChanges(true);
    const p: HTMLElement = component.fixture.nativeElement.querySelector('p');
    expect(p.innerText).toContain('There are 5 errors and 3 warnings in this file.');
  });
  it('should only show the error part when there are no warnings', async () => {
    const component = await setup();
    component.fixture.componentInstance.warnings = 0;
    component.fixture.componentInstance.errors = 5;
    component.fixture.detectChanges(true);
    const p: HTMLElement = component.fixture.nativeElement.querySelector('p');
    expect(p.innerText).toContain('There are 5 errors in this file.');
  });
});
