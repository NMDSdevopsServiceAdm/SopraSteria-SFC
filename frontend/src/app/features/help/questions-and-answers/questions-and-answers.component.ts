import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';

@Component({
  selector: 'app-questions-and-answers',
  templateUrl: './questions-and-answers.component.html',
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
  public isSuggestedTrayShowing: boolean = true;
  public searchValueOnSubmit: string = '';

  constructor(
    public route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
    private formBuilder: UntypedFormBuilder,
    private router: Router,
  ) {
    this.qAndATitleFilter = this.qAndATitleFilter.bind(this);
    this.setupForm();
  }

  ngOnInit(): void {
    this.sections = this.route.snapshot.data?.questionsAndAnswers?.data;
    this.breadcrumbService.show(JourneyType.HELP);

    this.getQandAPages();
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      qAndASearch: null,
    });
  }

  public getQandAPages(): void {
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

    return this.qAndASlugContentAndTitles.filter(
      (qAndASlugContentAndTitle) =>
        qAndASlugContentAndTitle.title.toLowerCase().startsWith(searchTermLowerCase) ||
        qAndASlugContentAndTitle.title.includes(searchTermLowerCase) ||
        qAndASlugContentAndTitle.content.toLowerCase().startsWith(searchTermLowerCase) ||
        qAndASlugContentAndTitle.content.includes(searchTermLowerCase),
    );
  }

  /**
   * Function is used to filter
   * @param {void}
   * @return {array}  array of string
   */

  public qAndATitleFilter(): string[] {
    const { qAndASearch } = this.form.value;

    if (qAndASearch?.length > 1 && this.qAndASlugContentAndTitles?.length > 0) {
      if (this.searchValueOnSubmit !== qAndASearch) {
        this.isSuggestedTrayShowing = true;
      }

      if (!this.isSuggestedTrayShowing) {
        return [];
      }

      let filteredQAndASlugContentAndTitles = this.filterTitleAndContent(qAndASearch);

      return filteredQAndASlugContentAndTitles.map((qAndASlugContentAndTitle) => qAndASlugContentAndTitle.title);
    }

    return [];
  }

  public qAndATitleAndContentFilter(): void {
    const { qAndASearch } = this.form.value;

    if (!qAndASearch) {
      this.hasMatchingResults = false;
      this.searchResults = [];
      this.noResultsMessage = 'You need to search with at least 2 letters or numbers, or both';
    } else if (qAndASearch?.length < 2) {
      this.hasMatchingResults = false;
      this.searchResults = [];
      this.noResultsMessage = 'You need to search with more than 1 letter or number';
    } else {
      this.searchResults = this.filterTitleAndContent(qAndASearch);

      this.hasMatchingResults = this.searchResults.length > 0;
      if (this.searchResults.length === 0) {
        this.noResultsMessage = 'Make sure that your spelling is correct';
      }
    }
  }

  public showAllQuestionsAndAnswers(event: Event): void {
    event.preventDefault();
    this.isSearchIconClicked = false;
    this.form.patchValue({
      qAndASearch: null,
    });
  }

  public onSubmit(): void {
    this.isSearchIconClicked = true;
    this.searchValueOnSubmit = this.form.value.qAndASearch;
    this.isSuggestedTrayShowing = false;
    this.qAndATitleAndContentFilter();
    // this.form.patchValue({
    //   qAndASearch: null,
    // });
  }

  public navigateToClickedSuggestedPage(event: Event): void {
    const clickedItem = this.qAndASlugContentAndTitles.find(
      (qAndASlugContentAndTitle) => qAndASlugContentAndTitle.title === event,
    );

    this.router.navigate([`./${clickedItem.slug}`], { relativeTo: this.route });
  }
}
