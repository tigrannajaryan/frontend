import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { BaseServiceProvider } from './base-service';
import { ComponentsModule } from './components/components.module';
import { Logger } from './logger';

const ex = [
ComponentsModule
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
    BaseServiceProvider,
    Logger
  ]
})
export class SharedModule {}
