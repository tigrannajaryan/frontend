import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CoreModule } from '~/core/core.module';
import { HomeService } from '~/shared/stylist-api/home.service';
import { ServicesCategoriesComponent } from '~/services/services-categories/services-categories.component';

@NgModule({
  declarations: [
    ServicesCategoriesComponent
  ],
  imports: [
    IonicPageModule.forChild(ServicesCategoriesComponent),
    CoreModule
  ],
  providers: [
    HomeService
  ]
})
export class ServicesCategoriesComponentModule {}
