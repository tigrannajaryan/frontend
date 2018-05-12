import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';

import { Logger } from './logger';

const ex = [
];

@NgModule({
  imports: [
    IonicModule,
    ...ex
  ],
  exports: [
    ...ex
  ],
  providers: [
    Logger
  ]
})
export class SharedModule {}
