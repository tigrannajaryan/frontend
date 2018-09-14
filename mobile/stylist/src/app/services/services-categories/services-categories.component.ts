import { Component } from '@angular/core';
import { IonicPage, NavParams, ViewController } from 'ionic-angular';
import { ServiceCategory } from '~/core/stylist-service/stylist-models';

export interface ServicesCategoriesListData {
  categories: ServiceCategory[];
}

@IonicPage({ segment: 'services-categories' })
@Component({
  selector: 'pop-services-categories',
  templateUrl: 'services-categories.component.html'
})
export class ServicesCategoriesComponent {
  data: ServicesCategoriesListData;

  constructor(
    public navParams: NavParams,
    public viewCtrl: ViewController
  ) {
  }

  ionViewWillLoad(): void {
    this.data = this.navParams.get('data') as ServicesCategoriesListData;
  }

  selectCategory(category: ServiceCategory): void {
    this.viewCtrl.dismiss(category);
  }
}
