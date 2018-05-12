import { NgModule } from '@angular/core';
import { BbNavComponent } from './bb-nav/bb-nav';
import { IonicModule } from 'ionic-angular';

@NgModule({
  declarations: [
    BbNavComponent
  ],
  imports: [
    IonicModule
  ],
  exports: [
    BbNavComponent
  ]
})
export class ComponentsModule {}
