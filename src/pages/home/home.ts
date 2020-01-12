import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { DeviceProvider } from '../../providers/device.provider';
import * as PageConstants from '../../pages/pages.constants';

/**
 * Root landing page of the app - user can either choose to use berry garden or jugnu feature
 */
@IonicPage()
@Component({
  selector: 'home',
  templateUrl: 'home.html',
})
export class HomePage {

  constructor(public navCtrl: NavController, 
    public navParams: NavParams, 
    public deviceProvider: DeviceProvider) {
  }

  goToBerryGardenFeature() {
    //no internet -> show only offline content page
    if (this.deviceProvider.checkNetworkDisconnected()) {
      this.navCtrl.setRoot(PageConstants.MY_BOOKS_PAGE)
    }
    else{
      this.navCtrl.setRoot(PageConstants.TABS_PAGE);
    }
  }

  goToJugnuVideosFeature() {
    this.navCtrl.setRoot(PageConstants.JUGNU_VIDEOS_PAGE);
  }
}
