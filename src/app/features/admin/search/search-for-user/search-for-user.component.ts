import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UserSearchRequest } from '@core/model/user.model';
import { DialogService } from '@core/services/dialog.service';
import { SwitchWorkplaceService } from '@core/services/switch-workplace.service';
import { UserService } from '@core/services/user.service';
import { AdminUnlockConfirmationDialogComponent } from '@shared/components/link-to-parent-cancel copy/admin-unlock-confirmation';

@Component({
  selector: 'app-search-for-user',
  templateUrl: './search-for-user.component.html',
})
export class SearchForUserComponent implements OnInit {
  public form: FormGroup;
  public submitted = false;
  public results = [];
  public userDetails = [];
  public userDetailsLabel = [];

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private switchWorkplaceService: SwitchWorkplaceService,
    private dialogService: DialogService,
  ) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      name: null,
      username: null,
      emailAddress: null,
    });
  }

  public onSubmit(): void {
    const data = this.getRequestData();
    this.userService.searchUsers(data).subscribe((response) => {
      this.results = response;
      this.submitted = true;
    });
  }

  private getRequestData(): UserSearchRequest {
    return {
      username: this.form.controls.username.value,
      name: this.form.controls.name.value,
      emailAddress: this.form.controls.emailAddress.value,
    };
  }

  public navigateToWorkplace(id: string, username: string, nmdsId: string, event: Event): void {
    event.preventDefault();
    this.switchWorkplaceService.navigateToWorkplace(id, username, nmdsId);
  }

  public toggleDetails(uid: string, event: Event): void {
    event.preventDefault();
    this.userDetails[uid] = !this.userDetails[uid];
    this.userDetailsLabel[uid] = this.userDetailsLabel[uid] === 'Close' ? 'Open' : 'Close';
  }

  public unlockUser(username: string, index: number, event: Event): void {
    event.preventDefault();
    const data = {
      username,
      index,
      removeUnlock: () => {
        this.results[index].isLocked = false;
      },
    };
    this.dialogService.open(AdminUnlockConfirmationDialogComponent, data);
  }
}
