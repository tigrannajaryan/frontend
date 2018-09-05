import { NgModule } from '@angular/core';

import { InputNumberDirective } from '~/core/directives/input-number.directive';
import { ClickOutsideDirective } from '~/core/directives/click-outside.directive';

import { MadeLinkDirective } from '~/shared/directives/made-link.directive';

const directives = [
  MadeLinkDirective,
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
