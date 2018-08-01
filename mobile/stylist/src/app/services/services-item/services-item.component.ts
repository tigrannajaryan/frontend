import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import {
  ServiceCategory,
  ServiceTemplateItem
} from '~/core/api/stylist-service/stylist.models';

import { loading } from '~/core/utils/loading';
import { StylistServiceProvider } from '~/core/api/stylist-service/stylist.api';
import { PageNames } from '~/core/page-names';
import { showAlert } from '~/core/utils/alert';

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
    private stylistService: StylistServiceProvider
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

    if (service && service.uuid !== undefined) {
      await this.deleteService(service);
    }

    // Empty data indicates deleted item.
    const newData: ServiceItemComponentData = {};

    this.viewCtrl.dismiss(newData);
  }

  @loading
  async deleteService(service: ServiceTemplateItem): Promise<void> {
    try {
      await this.stylistService.deleteStylistService(service.uuid);
    } catch (e) {
      showAlert('Error', e);
    }
  }

  /**
   * Submit the data and close the modal.
   */
  submit(): void {
    const { vars, categoryUuid, uuid, ...service } = this.form.value;

    // uuid should be added only if present
    if (uuid !== null) {
      service.uuid = uuid;
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

      uuid: undefined,
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
        this.setFormControl('uuid', data.service.uuid);
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
