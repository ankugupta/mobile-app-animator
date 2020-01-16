import { Component, ViewChild } from '@angular/core';
import { Platform, Nav, AlertController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { SqlStorageProvider } from '../providers/sql-storage.provider';
import { DeviceProvider } from '../providers/device.provider';
import * as PageConstants from '../pages/pages.constants';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;
  rootPage: any;

  constructor(
    private platform: Platform,
    private altController: AlertController,
    screenOrientation: ScreenOrientation,
    statusBar: StatusBar,
    splashScreen: SplashScreen,
    sqldb: SqlStorageProvider
  ) {

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      statusBar.hide();

      //wait for DB setup
      sqldb.getDatabaseState().subscribe(rdy => {
        console.log('sql db ready: ', rdy);
        if (rdy) {

          if (platform.is('cordova')) {
            screenOrientation.lock(screenOrientation.ORIENTATIONS.PORTRAIT);
          }
          splashScreen.hide();

          //navigate to home page
          this.nav.setRoot(PageConstants.BOOK_FILTER_PAGE, { "openedAsRoot": true });

        }

      });
    })

  }

  presentFailureAlert(title: string, message: string) {
    let alert = this.altController.create({
      title: title,
      message: message,
      buttons: [
        {
          text: "OK",
          role: "cancel",
          handler: () => {
            if (this.platform.is('android')) {
              this.platform.exitApp();
            }
          }
        }
      ]
    });
    alert.present();
  }
}
