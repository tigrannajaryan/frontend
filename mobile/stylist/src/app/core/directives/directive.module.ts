import { NgModule } from '@angular/core';

import { MadeLinkDirective } from '~/shared/directives/made-link.directive';
import { PhoneInputDirective } from '~/shared/directives/phone-input.directive';

import { InputNumberDirective } from '~/core/directives/input-number.directive';
import { ClickOutsideDirective } from '~/core/directives/click-outside.directive';
import { PhonePipe } from '~/shared/directives/phone-format';

const directives = [
  MadeLinkDirective,
  PhoneInputDirective,
  InputNumberDirective,
  ClickOutsideDirective,
  PhonePipe
];

@NgModule({
  declarations: [
    ...directives
  ],
  exports: [
    ...directives
  ]
})
export class DirectivesModule { }
