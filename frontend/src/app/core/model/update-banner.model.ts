import { UrlTree } from '@angular/router';

export interface UpdateBannerProps {
  content: any;
  linkText?: string;
  linkAriaDescription?: string;
  linkTo?: string | string[] | UrlTree;
  onLinkClicked?: () => void;
}
