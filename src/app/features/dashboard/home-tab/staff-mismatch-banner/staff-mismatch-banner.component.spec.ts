import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { WindowRef } from '@core/services/window.ref';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { StaffMismatchBannerComponent } from './staff-mismatch-banner.component';

describe('StaffMismatchBannerComponent', () => {
  async function setup() {
    const component = await render(StaffMismatchBannerComponent, {
      imports: [SharedModule, RouterModule, HttpClientTestingModule],
      declarations: [StaffMismatchBannerComponent],
      providers: [
        {
          provide: WindowRef,
          useClass: WindowRef,
        },
      ],
    });

    return {
      component,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the more staff banner if there are more staff than staff records', async () => {
    // Arrange
    const { component } = await setup();
    // Act
    component.fixture.detectChanges();
    component.fixture.componentInstance.workerCount = 10;
    component.fixture.componentInstance.numberOfStaff = 11;
    component.fixture.componentInstance.recalculate();
    component.fixture.detectChanges();
    // Assert
    expect(component.getAllByText("You've more staff than staff records", { exact: false })).toBeTruthy();
  });
  it('should show the more staff records banner', async () => {
    // Arrange
    const { component } = await setup();
    // Act
    component.fixture.componentInstance.workerCount = 10;
    component.fixture.componentInstance.numberOfStaff = 9;
    component.fixture.componentInstance.recalculate();
    component.fixture.detectChanges();

    // Assert
    expect(component.getAllByText("You've more staff records than staff", { exact: false })).toBeTruthy();
  });
  it('should show the more staff records banner even is staff records is zero', async () => {
    // Arrange
    const { component } = await setup();
    // Act
    component.fixture.componentInstance.workerCount = 0;
    component.fixture.componentInstance.numberOfStaff = 9;
    component.fixture.componentInstance.recalculate();
    component.fixture.detectChanges();

    // Assert
    expect(component.getAllByText("You've more staff than staff records", { exact: false })).toBeTruthy();
  });
  it('should show the more staff records banner even if staff is zero', async () => {
    // Arrange
    const { component } = await setup();
    // Act
    component.fixture.componentInstance.workerCount = 10;
    component.fixture.componentInstance.numberOfStaff = 0;
    component.fixture.componentInstance.recalculate();
    component.fixture.detectChanges();

    // Assert
    expect(component.getAllByText("You've more staff records than staff", { exact: false })).toBeTruthy();
  });
  it('should show the total staff missing banner', async () => {
    // Arrange
    const { component } = await setup();
    // Act
    component.fixture.componentInstance.workerCount = 10;
    component.fixture.componentInstance.numberOfStaff = null;
    component.fixture.componentInstance.recalculate();
    component.fixture.detectChanges();

    // Assert
    expect(component.getAllByText('The total number of staff is missing', { exact: false })).toBeTruthy();
  });

  it('should contain the workplace and worker numbers', async () => {
    // Arrange
    const { component } = await setup();
    // Act
    component.fixture.componentInstance.workerCount = 14;
    component.fixture.componentInstance.numberOfStaff = 11;
    component.fixture.componentInstance.recalculate();

    component.fixture.detectChanges();

    // Assert
    expect(
      component.getAllByText(String(component.fixture.componentInstance.workerCount), { exact: false }),
    ).toBeTruthy();
    expect(
      component.getAllByText(String(component.fixture.componentInstance.numberOfStaff), { exact: false }),
    ).toBeTruthy();
    expect(
      component.getAllByText(
        String(component.fixture.componentInstance.workerCount - component.fixture.componentInstance.numberOfStaff),
        { exact: false },
      ),
    ).toBeTruthy();
  });
});
