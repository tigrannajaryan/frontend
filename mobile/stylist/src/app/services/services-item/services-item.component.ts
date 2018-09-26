import { Component } from '@angular/core';
import { IonicPage, ModalController, NavController, NavParams, ViewController } from 'ionic-angular';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import {
  ServiceCategory,
  ServiceTemplateItem
} from '~/shared/stylist-api/stylist-models';

import { loading } from '~/core/utils/loading';
import { StylistServiceProvider } from '~/shared/stylist-api/stylist-service';
import { PageNames } from '~/core/page-names';
import { ServicesCategoriesListData } from '~/services/services-categories/services-categories.component';

/**
 * Represents the data that is passed in and out of
 * the item editing form.
 */
export interface ServiceItemComponentData {
  categories?: ServiceCategory[];
  category?: ServiceCategory;
  service?: ServiceTemplateItem;
}

/**
 * The modal form that is used for editing of service details.
 */
@IonicPage({ segment: 'service-item' })
@Component({
  selector: 'page-service-item',
  templateUrl: 'services-item.component.html'
})
export class ServiceItemComponent {
  protected PageNames = PageNames;
  data: ServiceItemComponentData;
  form: FormGroup;

  constructor(
    public navCtrl: NavController,
    public formBuilder: FormBuilder,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public modalCtrl: ModalController,
    private stylistService: StylistServiceProvider
  ) {
  }

  ionViewWillLoad(): void {
    // Unfortunately navaParams.get() is untyped 'any' data.
    this.data = this.navParams.get('data') as ServiceItemComponentData;
    this.createForm();
    this.setFormData(this.data);
  }

  openCategoryModal(): void {
    const data: ServicesCategoriesListData = {
      categories: this.data.categories
    };
    const profileModal = this.modalCtrl.create(PageNames.ServicesCategories, { data });
    profileModal.onDidDismiss((category: ServiceCategory) => {
      if (category) {
        this.setFormControl('category', category);
      }
    });
    profileModal.present();
  }

  async onServiceDelete(): Promise<void> {
    const {service} = this.data;

    if (service && service.uuid !== undefined) {
      await this.deleteService(service);
    }

    // Empty data indicates deleted item.
    const newData: ServiceItemComponentData = {};

    this.viewCtrl.dismiss(newData);
  }

  @loading
  async deleteService(service: ServiceTemplateItem): Promise<void> {
    await this.stylistService.deleteStylistService(service.uuid).toPromise();
  }

  /**
   * Submit the data and close the modal.
   */
  save(): void {
    const { vars, category, uuid, ...service } = this.form.value;

    // uuid should be added only if present
    if (uuid !== null) {
      service.uuid = uuid;
    }

    const newData: ServiceItemComponentData = {
      service: {
        ...service,
        base_price: Number(service.base_price)
      },
      category
    };

    this.viewCtrl.dismiss(newData);
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      vars: this.formBuilder.group({
        categories: ''
      }),

      category: ['', Validators.required],

      uuid: undefined,
      base_price: ['', Validators.required],
      name: ['', Validators.required]
    });
  }

  /**
   * If we have some data we can set it via this function
   * its should be initialized after form creation
   */
  private setFormData(data: ServiceItemComponentData): void {
    if (data) {
      if (data.categories) {
        this.setFormControl('vars.categories', data.categories);
      }

      if (data.category) {
        this.setFormControl('category', data.category);
      }

      if (data.service) {
        this.setFormControl('uuid', data.service.uuid);
        this.setFormControl('base_price', data.service.base_price);
        this.setFormControl('name', data.service.name);
      }
    }
  }

  private setFormControl(control: string, value: any): void {
    const formControl = this.form.get(control) as FormControl;
    formControl.setValue(value);
  }
}
