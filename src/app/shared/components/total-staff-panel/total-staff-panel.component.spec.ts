import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { within } from '@testing-library/angular';

import { Establishment } from '../../../../mockdata/establishment';
import { PermissionsList } from '../../../../mockdata/permissions';
import { TotalStaffPanelComponent } from './total-staff-panel.component';

describe('TotalStaffPanelComponent', () => {
  let component: TotalStaffPanelComponent;
  let fixture: ComponentFixture<TotalStaffPanelComponent>;
  let permissionsService: PermissionsService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      declarations: [TotalStaffPanelComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TotalStaffPanelComponent);
    permissionsService = TestBed.inject(PermissionsService);
    permissionsService.setPermissions(Establishment.uid, PermissionsList);
    component = fixture.componentInstance;
    component.workplace = Establishment;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show total staff', () => {
    component.totalStaff = 23;
    fixture.detectChanges();

    const totalStaffNumber = within(document.body).queryByTestId('totalStaffNumber');
    const totalStaffText = within(document.body).queryByTestId('totalStaffText');

    expect(totalStaffNumber.innerHTML).toContain('23');
    expect(totalStaffText.innerHTML).toContain('Total number of staff');
  });

  it('should show staff added', () => {
    component.totalWorkers = 24;
    fixture.detectChanges();

    const staffAddedNumber = within(document.body).queryByTestId('staffAddedNumber');
    const staffAddedText = within(document.body).queryByTestId('staffAddedText');

    expect(staffAddedNumber.innerHTML).toContain('24');
    expect(staffAddedText.textContent).toContain('Staff records added');
  });

  it('should change to single record if only 1 staff record added', () => {
    component.totalWorkers = 1;
    fixture.detectChanges();

    const staffAddedNumber = within(document.body).queryByTestId('staffAddedNumber');
    const staffAddedText = within(document.body).queryByTestId('staffAddedText');

    expect(staffAddedNumber.innerHTML).toContain('1');
    expect(staffAddedText.textContent).toContain('Staff record added');
  });

  it('should show total staff and staff added but not changes if number are equal', () => {
    component.totalStaff = 24;
    component.totalWorkers = 24;
    fixture.detectChanges();

    const totalStaffNumber = within(document.body).queryByTestId('totalStaffNumber');
    const totalStaffText = within(document.body).queryByTestId('totalStaffText');
    const staffAddedNumber = within(document.body).queryByTestId('staffAddedNumber');
    const staffAddedText = within(document.body).queryByTestId('staffAddedText');
    const changeNumber = within(document.body).queryAllByTestId('changeNumber');
    const changeText = within(document.body).queryAllByTestId('changeText');

    expect(totalStaffNumber.innerHTML).toContain('24');
    expect(totalStaffText.innerHTML).toContain('Total number of staff');
    expect(staffAddedNumber.innerHTML).toContain('24');
    expect(staffAddedText.textContent).toContain('Staff records added');
    expect(changeNumber.length).toEqual(0);
    expect(changeText.length).toEqual(0);
  });

  it('should show total staff, staff added and changes if number are not equal but only have 1 more worker', () => {
    component.totalStaff = 24;
    component.totalWorkers = 25;
    fixture.detectChanges();

    const totalStaffNumber = within(document.body).queryByTestId('totalStaffNumber');
    const totalStaffText = within(document.body).queryByTestId('totalStaffText');
    const staffAddedNumber = within(document.body).queryByTestId('staffAddedNumber');
    const staffAddedText = within(document.body).queryByTestId('staffAddedText');
    const changeNumber = within(document.body).queryByTestId('changeNumber');
    const changeText = within(document.body).queryByTestId('changeText');

    expect(totalStaffNumber.innerHTML).toContain('24');
    expect(totalStaffText.innerHTML).toContain('Total number of staff');
    expect(staffAddedNumber.innerHTML).toContain('25');
    expect(staffAddedText.textContent).toContain('Staff records added');
    expect(changeNumber.innerHTML).toContain('1');
    expect(changeText.textContent).toContain('Staff record to delete');
  });

  it('should show total staff, staff added and changes if number are not equal but have more workers', () => {
    component.totalStaff = 24;
    component.totalWorkers = 300;
    fixture.detectChanges();

    const totalStaffNumber = within(document.body).queryByTestId('totalStaffNumber');
    const totalStaffText = within(document.body).queryByTestId('totalStaffText');
    const staffAddedNumber = within(document.body).queryByTestId('staffAddedNumber');
    const staffAddedText = within(document.body).queryByTestId('staffAddedText');
    const changeNumber = within(document.body).queryByTestId('changeNumber');
    const changeText = within(document.body).queryByTestId('changeText');

    expect(totalStaffNumber.innerHTML).toContain('24');
    expect(totalStaffText.innerHTML).toContain('Total number of staff');
    expect(staffAddedNumber.innerHTML).toContain('300');
    expect(staffAddedText.textContent).toContain('Staff records added');
    expect(changeNumber.innerHTML).toContain('276');
    expect(changeText.textContent).toContain('Staff records to delete');
  });

  it('should show total staff, staff added and changes if number are not equal but only have 1 more total staff', () => {
    component.totalStaff = 25;
    component.totalWorkers = 24;
    fixture.detectChanges();

    const totalStaffNumber = within(document.body).queryByTestId('totalStaffNumber');
    const totalStaffText = within(document.body).queryByTestId('totalStaffText');
    const staffAddedNumber = within(document.body).queryByTestId('staffAddedNumber');
    const staffAddedText = within(document.body).queryByTestId('staffAddedText');
    const changeNumber = within(document.body).queryByTestId('changeNumber');
    const changeText = within(document.body).queryByTestId('changeText');

    expect(totalStaffNumber.innerHTML).toContain('25');
    expect(totalStaffText.innerHTML).toContain('Total number of staff');
    expect(staffAddedNumber.innerHTML).toContain('24');
    expect(staffAddedText.textContent).toContain('Staff records added');
    expect(changeNumber.innerHTML).toContain('1');
    expect(changeText.textContent).toContain('Staff record to add');
  });

  it('should show total staff, staff added and changes if number are not equal but have more total staff', () => {
    component.totalStaff = 200;
    component.totalWorkers = 25;
    fixture.detectChanges();

    const totalStaffNumber = within(document.body).queryByTestId('totalStaffNumber');
    const totalStaffText = within(document.body).queryByTestId('totalStaffText');
    const staffAddedNumber = within(document.body).queryByTestId('staffAddedNumber');
    const staffAddedText = within(document.body).queryByTestId('staffAddedText');
    const changeNumber = within(document.body).queryByTestId('changeNumber');
    const changeText = within(document.body).queryByTestId('changeText');

    expect(totalStaffNumber.innerHTML).toContain('200');
    expect(totalStaffText.innerHTML).toContain('Total number of staff');
    expect(staffAddedNumber.innerHTML).toContain('25');
    expect(staffAddedText.textContent).toContain('Staff records added');
    expect(changeNumber.innerHTML).toContain('175');
    expect(changeText.textContent).toContain('Staff records to add');
  });
});
