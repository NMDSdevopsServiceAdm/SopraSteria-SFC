import { BackService } from '@core/services/back.service';
import { OnDestroy, OnInit, Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';

@Component({
	selector: 'app-search',
	templateUrl: './search.component.html',
})


export class SearchComponent implements OnInit {
	public results = <any>[];
	public form = {
		type: '',
		title: '',
		subTitle: '',
		buttonText: '',
		valid: true,
		submitted: false,
		username: '',
		usernameLabel: '',
		name: '',
		nameLabel: '',
		errors: []
	};

	constructor(
		private router: Router,
		protected backService: BackService,
		private http: HttpClient
	) {
	}

	ngOnInit() {
		this.setBackLink();

		if (this.router.url === '/search-users') {
			this.form.type = 'users';
			this.form.usernameLabel = 'Username';
			this.form.nameLabel = 'Name';
			this.form.subTitle = 'User Search';
			this.form.title = 'Define your search criteria';
			this.form.buttonText = 'Search Users';
		} else {
			this.form.type = 'establishments';
			this.form.usernameLabel = 'Postcode';
			this.form.nameLabel = 'NDMS ID';
			this.form.subTitle = 'Establishment Search';
			this.form.title = 'Define your search criteria';
			this.form.buttonText = 'Search Establishments';
		}
	}


	public searchType(data, type) {
		return this.http.post<any>('/api/admin/search/' + type, data);
	}


	public onSubmit(): void {
		this.form.errors = [];
		this.form.submitted = true;
		// this.errorSummaryService.syncFormErrorsEvent.next(true);

		if (this.form.username.length === 0 && this.form.name.length === 0) {

			this.form.errors.push({
				error: 'Please enter at least 1 search value',
				id: 'username'
			});
			this.form.submitted = false;
		} else {

			var data = {};

			if (this.form.type === 'users') {

				data = {
					username: this.form.username,
					name: this.form.name
				};
			} else {
				data = {
					postcode: this.form.username,
					nmdsId: this.form.name
				};
			}

			this.searchType(data, this.form.type).subscribe((data) => this.onSuccess(data), error => this.onError(error))



		}
	}

	private onSuccess(data) {
		this.results = data;
	}

	private onError(error) { }


	protected setBackLink(): void {
		this.backService.setBackLink({ url: ['/dashboard'] });
	}
}
