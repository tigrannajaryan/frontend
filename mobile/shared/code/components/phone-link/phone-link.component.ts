import { Component, Input, OnInit } from '@angular/core';
import { ActionSheetController } from 'ionic-angular';
import { ActionSheetButton } from 'ionic-angular/components/action-sheet/action-sheet-options';

import { ExternalAppService } from '~/shared/utils/external-app-service';
import { getPhoneNumber } from '~/shared/utils/phone-numbers';
import { NumberFormat } from '~/shared/directives/phone-input.directive';

@Component({
  selector: 'phone-link',
  templateUrl: 'phone-link.component.html'
})
export class PhoneLinkComponent implements OnInit {
  @Input() phone: string;
  @Input() readonly = false;
  @Input() shortForm = true;
  @Input() iconForm = false;
  @Input() icon?: string;

  private buttons: ActionSheetButton[];

  constructor(
    private actionSheetCtrl: ActionSheetController,
    private externalAppService: ExternalAppService
  ) {
  }

  ngOnInit(): void {
    this.buttons = [
      {
        text: `Copy ${this.phone}`,
        handler: () => {
          this.externalAppService.copyToTheClipboard(this.phone);
        }
      },
      {
        text: `Dial ${this.phone}`,
        handler: () => {
          this.externalAppService.doPhoneCall(this.phone);
        }
      },
      {
        text: 'Cancel',
        role: 'cancel'
      }
    ];
  }

  async onClick(): Promise<void> {
    if (!this.readonly) {
      const actionSheet = this.actionSheetCtrl.create({ buttons: this.buttons });
      actionSheet.present();
    }
  }

  getFormattedPhone(): string {
    return this.shortForm ? getPhoneNumber(this.phone) : getPhoneNumber(this.phone, NumberFormat.International);
  }
}
