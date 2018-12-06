import { Injectable } from '@angular/core';
import { App, NavController } from 'ionic-angular';
import { Page } from 'ionic-angular/navigation/nav-util';

import { ClientProfileStatus, UserRole } from '~/shared/api/auth.models';
import { StylistModel } from '~/shared/api/stylists.models';
import { StylistInvitationParams } from '~/stylists/stylist/stylist.component';
import { PushNotification } from '~/shared/push/push-notification';
import { getAuthLocalData } from '~/shared/storage/token-utils';
import { PushPrimingScreenParams } from '~/shared/components/push-priming-screen/push-priming-screen.component';

import { PageNames } from './page-names';
import { FirstLastNamePageParams } from '~/profile/first-last-name/first-last-name.component';

export interface PageDescr {
  page: Page;
  params?: any;
}

/**
 * This class contains centralized logic of screen navigation that is used during
 * app startup and login. It uses the current profile status and other externally
 * supplied information (e.g. pending invitation) to decide what screen must be shown
 * to the user.
 *
 * This is the flow for new registrations WITH INVITATION:
 * 1. Auth - Ask Phone and Code
 * 2. First name / Last Name
 * 3. Stylist Invitation
 * 4. HowMadeWorks
 * 5. HowPricingWorks
 * 6. PushPriming
 * 7. Home
 *
 * This is the flow for new registrations WITHOUT INVITATION:
 * 1. Auth - Ask Phone and Code
 * 2. First name / Last Name
 * 3. HowMadeWorks
 * 4. HowPricingWorks
 * 5. SelectStylist from Search screen
 * 6. PushPriming
 * 7. Home
 *
 * Note: PushPriming is shown only once every 14 days (even if you login with brand new user).
 *
 * For app reopens if you stop on any step and reopen the app you will see the same
 * step, except the following cases:
 *
 * 1. If you stoped on HowPricingWorks and reload you will see HowMadeWorks.
 * 2. If you stoped on SelectStylist and reload you will see HowMadeWorks.
 */
@Injectable()
export class ClientStartupNavigation {

  private static showPage(navCtrl: NavController, pageDescr: PageDescr): void {
    if (pageDescr.page === PageNames.MainTabs) {
      // MainTabs is the last screen in onboarding and we make it the root
      // since there is no need to allow having a navigation history and ability to go back
      navCtrl.setRoot(pageDescr.page, pageDescr.params);
    } else {
      // For other screens we use push() to have proper navigation history
      navCtrl.push(pageDescr.page, pageDescr.params);
    }
  }

  constructor(
    private app: App,
    private pushNotification: PushNotification
  ) {
  }

  /**
   * Show the next screen based on the status of the profile and pending invitation (if any).
   * Uses same logic as nextToShowByProfileStatus(), but also shows the selected screen.
   * @param navCtrl we will push() or setRoot() on this NavController to show the screen.
   * @param pendingInvitation if not provided we assume there is no pending invitation
   */
  async showNextByProfileStatus(navCtrl: NavController, pendingInvitation?: StylistModel): Promise<void> {
    const next = await this.nextToShowByProfileStatus(pendingInvitation);
    ClientStartupNavigation.showPage(navCtrl, next);
  }

  /**
   * Show the next screen for a complete profile.
   * Uses same logic as nextToShowForCompleteProfile(), but also shows the selected screen.
   * @param navCtrl we will push() or setRoot() on this NavController to show the screen.
   * @param pendingInvitation if not provided we assume there is no pending invitation
   */
  async showNextForCompleteProfile(navCtrl: NavController): Promise<void> {
    const next = await this.nextToShowForCompleteProfile();
    ClientStartupNavigation.showPage(navCtrl, next);
  }

  /**
   * Determines what page to show based on the completeness of the profile of the user.
   * Uses current profile status stored in local auth data to determine what screen
   * this user must see. If the profile is incomplete shows corresponding onboarding
   * screen. It may also decide to show one of the post-onboarding screens
   * (e.g. PushPrimingScreen). If there is no special screen to show then returns the MainTabs.
   * @param pendingInvitation if it is known that there is a pending invitation
   */
  async nextToShowByProfileStatus(pendingInvitation?: StylistModel): Promise<PageDescr> {

    const authLocalData = await getAuthLocalData();
    const profileStatus: ClientProfileStatus = authLocalData ? authLocalData.profileStatus : undefined;

    if (!profileStatus || !profileStatus.has_name) {
      // No profile at all or name is not set, start from FirstLastName screen.
      const data: FirstLastNamePageParams = { pendingInvitation };
      return { page: PageNames.FirstLastName, params: { data } };
    }

    if (!profileStatus.has_preferred_stylist_set && pendingInvitation) {
      // We don't have a preferred stylist and have an invitation from a stylist, show it.
      const data: StylistInvitationParams = { stylist: pendingInvitation };
      return { page: PageNames.StylistInvitation, params: { data } };
    }

    if (!profileStatus.has_seen_educational_screens) {
      // Didn't see educational screen, show them.
      return { page: PageNames.HowMadeWorks };
    }

    // The profile is complete, show the appropriate screen for complete profiles.
    return this.nextToShowForCompleteProfile();
  }

  private async nextToShowForCompleteProfile(): Promise<PageDescr> {
    // The only remaining optional screen is push priming screen. Check if need to show it.
    if ((await this.pushNotification.needToShowPermissionScreen())) {
      // Yes, we need to show it. Do it.

      const params: PushPrimingScreenParams = {
        appType: UserRole.client,
        // Show next appropriate screen after PushPrimingScreen
        onContinue: () => this.showNextByProfileStatus(this.app.getRootNav())
      };
      return { page: PageNames.PushPrimingScreen, params: { params } };
    }

    // If in the future we have any other pages that we want to show to users with completed
    // profiles during app startup then we need to add them here similarly to PushPrimingScreen.
    // Note: be very conservative in this, we don't want to bother the user a lot by
    // showing other screens when they want to use the app and want to see the Main screen.

    // Everything is complete, go to Home screen.
    return { page: PageNames.MainTabs };
  }
}
