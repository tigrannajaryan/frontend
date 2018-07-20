import { Component } from '@angular/core';
import { PageNames } from '~/core/page-names';
import { ENV } from '../../../../environments/environment.default';

@Component({
  selector: '[madeUserFooter]',
  templateUrl: 'user-footer.component.html'
})
export class UserFooterComponent {
  protected PageNames = PageNames;
  protected ffEnableIncomplete = ENV.ffEnableIncomplete;
}
