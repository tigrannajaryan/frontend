import { NgModule } from '@angular/core';
import { MadeLinkDirective } from '~/core/directives/made-link.directive';
import { InputNumberDirective } from '~/core/directives/input-number.directive';
import { ClickOutsideDirective } from '~/core/directives/click-outside.directive';

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
