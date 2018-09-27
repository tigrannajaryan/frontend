import { NgModule } from '@angular/core';

import { MadeLinkDirective } from '~/shared/directives/made-link.directive';
import { PhoneInputDirective } from '~/shared/directives/phone-input.directive';

import { InputNumberDirective } from '~/core/directives/input-number.directive';
import { ClickOutsideDirective } from '~/core/directives/click-outside.directive';

const directives = [
  MadeLinkDirective,
  PhoneInputDirective,
  InputNumberDirective,
  ClickOutsideDirective
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
