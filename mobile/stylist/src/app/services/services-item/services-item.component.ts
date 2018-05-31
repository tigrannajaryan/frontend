import { Component } from '@angular/core';
import { AlertController, IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import {
  ServiceCategory,
  ServiceTemplateItem
} from '~/core/stylist-service/stylist-models';

import { loading } from '~/core/utils/loading';
import { StylistServiceProvider } from '~/core/stylist-service/stylist-service';
import { PageNames } from '~/core/page-names';

/**
 * Represents the data that is passed in and out of
 * the item editing form.
 */
export interface ServiceItemComponentData {
  categories?: ServiceCategory[];
  categoryUuid?: string;
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
    private stylistService: StylistServiceProvider,
    private alertCtrl: AlertController
  ) {
  }

  ionViewWillLoad(): void {
    // Unfortunately navaParams.get() is untyped 'any' data.
    this.data = this.navParams.get('data') as ServiceItemComponentData;
    this.createForm();
    this.setFormData(this.data);
  }

  async onServiceDelete(): Promise<void> {
    const {service} = this.data;

    if (service && service.id !== undefined) {
      await this.deleteService(service);
    }

    // Empty data indicates deleted item.
    const newData: ServiceItemComponentData = {};

    this.viewCtrl.dismiss(newData);
  }

  @loading
  async deleteService(service: ServiceTemplateItem): Promise<void> {
    try {
      await this.stylistService.deleteStylistService(service.id);
    } catch (e) {
      const alert = this.alertCtrl.create({
        title: 'Error',
        subTitle: e,
        buttons: ['Dismiss']
      });
      alert.present();
    }
  }

  /**
   * Submit the data and close the modal.
   */
  submit(): void {
    const { vars, categoryUuid, id, ...service } = this.form.value;

    // id should be added only if present
    if (id !== null) {
      service.id = id;
    }

    const newData: ServiceItemComponentData = {
      service: {
        ...service,
        base_price: Number(service.base_price),
        duration_minutes: Number(service.duration_minutes)
      },
      categoryUuid
    };

    this.viewCtrl.dismiss(newData);
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      vars: this.formBuilder.group({
        categories: ''
      }),

      categoryUuid: ['', Validators.required],

      id: undefined,
      base_price: ['', Validators.required],
      description: [''],
      duration_minutes: ['', Validators.required],
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
        const categoriesNameUuidArr = [];

        for (const curCategory of data.categories) {
          categoriesNameUuidArr.push({
            name: curCategory.name,
            uuid: curCategory.uuid
          });
        }

        this.setFormControl('vars.categories', categoriesNameUuidArr);
      }

      if (data.categoryUuid) {
        this.setFormControl('categoryUuid', data.categoryUuid);
      }

      if (data.service) {
        this.setFormControl('id', data.service.id);
        this.setFormControl('base_price', data.service.base_price);
        this.setFormControl('description', data.service.description);
        this.setFormControl('duration_minutes', data.service.duration_minutes);
        this.setFormControl('name', data.service.name);
      }
    }
  }

  private setFormControl(control: string, value: any): void {
    const formControl = this.form.get(control) as FormControl;
    formControl.setValue(value);
  }
}
