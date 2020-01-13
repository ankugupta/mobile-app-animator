import {
    AlertController, IonicPage, LoadingController, NavController, Platform
} from 'ionic-angular';

import { Component } from '@angular/core';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { ScreenOrientation } from '@ionic-native/screen-orientation';

import { Video } from '../../model/video';
import { DeviceProvider } from '../../providers/device.provider';
import { JugnuVideosProvider } from '../../providers/jugnu-videos.provider';
import * as PageConstants from '../../pages/pages.constants';

@IonicPage()
@Component({
  selector: 'jugnu-videos',
  templateUrl: 'jugnu-videos.html',
})
export class JugnuVideosPage {

  videoList: Video[];
  noVideosMessage: boolean;

  constructor(private platform: Platform,
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private loadingController: LoadingController,
    private deviceProvider: DeviceProvider,
    private jugnuVideoProvider: JugnuVideosProvider,
    private screenOrientation: ScreenOrientation,
    private iab: InAppBrowser) {
  }

  ionViewWillEnter() {
     //init variables
     this.noVideosMessage = false;

    if (this.deviceProvider.checkNetworkDisconnected()) {
      this.presentOfflineAlert();
    }
    else{
      this.loadVideos();
    }
  }

  /**
   * loads list of videos
   */
  public loadVideos() {
    console.log('Loading video list.....');
    let loader = this.loadingController.create();
    loader.present();

    this.jugnuVideoProvider.getAll().subscribe(
      data => {
        this.videoList = [];
        data.resources.forEach(video => {
          this.videoList.push(video);
        });

        if (this.videoList.length == 0) {
          this.noVideosMessage = true;
        }

        loader.dismiss();

        console.log("fetched video list: ", this.videoList);
      },
      error => {
        loader.dismiss();
        console.log("error while fetching list of videos ", error);
        this.presentFailureAlert("Technical Error", "Please try again later");
      }
    )
  }

  //opens media with given url in in-app-browser
  openMedia(mediaUrl: string) {

    console.log("playing media at: ", mediaUrl);
    let iab = this.iab.create(mediaUrl, "_blank", "location=no,hidden=no");
    this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.LANDSCAPE);
   
    iab.on("exit").subscribe(
      () => {
        this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
        console.log("orientation after browser close: " + this.screenOrientation.type);
      }
    )

  }

  goToHome() {
    this.navCtrl.setRoot(PageConstants.HOME_PAGE);
  }

  
  presentOfflineAlert() {
    let alert = this.alertCtrl.create({
      title: "Device Offline",
      subTitle: "A connection to internet is required to use this section. Please connect to a Wi-Fi or cellular network.",
      buttons: [
        {
          text: "OK",
          role: "cancel"
        }
      ]
    });
    alert.present();
  }

  presentFailureAlert(title: string, message: string) {
    if (this.deviceProvider.checkNetworkDisconnected()) {
      this.presentOfflineAlert();
    }
    else {
      let alert = this.alertCtrl.create({
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
}
