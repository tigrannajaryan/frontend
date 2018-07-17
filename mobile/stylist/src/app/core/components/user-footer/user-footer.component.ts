import { Component } from '@angular/core';
import { PageNames } from '~/core/page-names';

@Component({
  selector: '[madeUserFooter]',
  templateUrl: 'user-footer.component.html'
})
export class UserFooterComponent {
  protected PageNames = PageNames;
}
