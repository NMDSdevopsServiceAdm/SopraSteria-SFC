import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { PreviousRouteService } from '@core/services/previous-route.service';

@Component({
    selector: 'app-questions-and-answers',
    templateUrl: './questions-and-answers.component.html',
    standalone: false
})
export class QuestionsAndAnswersComponent implements OnInit {
  @ViewChild('formEl') formEl: ElementRef;

  public sections: any;
  public qAndASlugContentAndTitles: any = [];
  public searchResults: any = [];
  public form: UntypedFormGroup;
  public isSearchIconClicked: boolean = false;
  public hasMatchingResults: boolean = false;
  public noResultsMessage: string;
  public showSuggestedTray: boolean = true;
  public searchValueOnSubmit: string = '';
  public previousUrl: string;

  constructor(
    public route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private previousRouteService: PreviousRouteService,
  ) {
    this.getSuggestedList = this.getSuggestedList.bind(this);
    this.setupForm();
  }

  ngOnInit(): void {
    this.sections = this.route.snapshot.data?.questionsAndAnswers?.data;
    this.breadcrumbService.show(JourneyType.HELP);

    this.getQandAsForSearch();

    this.previousUrl = this.previousRouteService.getPreviousUrl();

    this.getPreviousSearchQuery();
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      qAndASearch: '',
    });
  }

  public getPreviousSearchQuery(): void {
    let qAndASearchValue = localStorage.getItem('qAndASearchValue');
    if (qAndASearchValue && qAndASearchValue !== 'null' && this.previousUrl?.includes('/questions-and-answers/')) {
      this.form.patchValue({
        qAndASearch: qAndASearchValue,
      });
      this.onSubmit();
    } else {
      this.clearSearch();
    }
  }

  public getQandAsForSearch(): void {
    for (let section of this.sections) {
      if (section.q_and_a_pages?.length > 0) {
        for (let q_and_a_page of section.q_and_a_pages) {
          this.qAndASlugContentAndTitles.push({
            title: q_and_a_page.title,
            slug: q_and_a_page.slug,
            content: q_and_a_page.content,
          });
        }
      }

      for (let sub_section of section.sub_sections) {
        for (let q_and_a_page of sub_section.q_and_a_pages) {
          this.qAndASlugContentAndTitles.push({
            title: q_and_a_page.title,
            slug: q_and_a_page.slug,
            content: q_and_a_page.content,
          });
        }
      }
    }
  }

  public filterTitleAndContent(searchTerm): any[] {
    const searchTermLowerCase = searchTerm.toLowerCase();

    const filteredTitles = this.qAndASlugContentAndTitles.filter((qAndASlugContentAndTitle) =>
      qAndASlugContentAndTitle.title.toLowerCase().includes(searchTermLowerCase),
    );

    const filteredContent = this.qAndASlugContentAndTitles.filter(
      (qAndASlugContentAndTitle) =>
        qAndASlugContentAndTitle.content.toLowerCase().includes(searchTermLowerCase) &&
        !qAndASlugContentAndTitle.title.toLowerCase().includes(searchTermLowerCase),
    );

    return filteredTitles.concat(filteredContent);
  }

  /**
   * Function is used to filter
   * @param {void}
   * @return {array}  array of string
   */

  public getSuggestedList(): string[] {
    const { qAndASearch } = this.form.value;

    if (qAndASearch?.length > 1 && this.qAndASlugContentAndTitles?.length > 0) {
      if (this.searchValueOnSubmit !== qAndASearch) {
        this.showSuggestedTray = true;
      }

      if (!this.showSuggestedTray) {
        return [];
      }

      let filteredQAndASlugContentAndTitles = this.filterTitleAndContent(qAndASearch);

      return filteredQAndASlugContentAndTitles.map((qAndASlugContentAndTitle) => qAndASlugContentAndTitle.title);
    }
    return [];
  }

  public getSearchResults(): void {
    const { qAndASearch } = this.form.value;
    this.searchResults = []

    if (!qAndASearch) {
      this.noResultsMessage = 'You need to search with at least 2 letters or numbers, or both';
    } else if (qAndASearch?.length < 2) {
      this.noResultsMessage = 'You need to search with more than 1 letter or number';
    } else {
      this.searchResults = this.filterTitleAndContent(qAndASearch);

      if (this.searchResults.length === 0) {
        this.noResultsMessage = 'Make sure that your spelling is correct';
      }
    }
    this.hasMatchingResults = this.searchResults?.length > 0;
  }

  private clearSearch(): void {
    this.form.patchValue({
      qAndASearch: '',
    });
  }

  public showAllQuestionsAndAnswers(event: Event): void {
    event.preventDefault();
    this.isSearchIconClicked = false;
    localStorage.removeItem('qAndASearchValue');
    this.clearSearch();
  }

  private saveSearchValue(): void {
    this.searchValueOnSubmit = this.form.value.qAndASearch !== 'null' ? this.form.value.qAndASearch : null;
    localStorage.setItem('qAndASearchValue', this.searchValueOnSubmit);
  }

  public onSubmit(): void {
    this.isSearchIconClicked = true;
    this.saveSearchValue();
    this.showSuggestedTray = false;
    this.getSearchResults();
  }

  public navigateToClickedSuggestedPage(event: Event): void {
    this.saveSearchValue();
    const clickedItem = this.qAndASlugContentAndTitles.find(
      (qAndASlugContentAndTitle) => qAndASlugContentAndTitle.title === event,
    );
    this.router.navigate([`./${clickedItem.slug}`], { relativeTo: this.route });
  }
}
