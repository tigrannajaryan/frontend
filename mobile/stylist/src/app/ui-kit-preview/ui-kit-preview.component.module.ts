import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UiKitPreviewComponent } from './ui-kit-preview.component';
import { CoreModule } from '~/core/core.module';

@NgModule({
  declarations: [
    UiKitPreviewComponent
  ],
  imports: [
    IonicPageModule.forChild(UiKitPreviewComponent),
    CoreModule
  ]
})
export class UiKitPreviewComponentModule {}
