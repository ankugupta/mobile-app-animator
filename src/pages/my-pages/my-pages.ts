import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController, Platform, IonicPage } from 'ionic-angular';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { File, RemoveResult } from '@ionic-native/file';

import { DeviceProvider } from '../../providers/device.provider';
import { SqlStorageProvider } from '../../providers/sql-storage.provider';
import { PageEntity } from '../../model/pageEntity';
import { normalizeURL } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-my-pages',
  templateUrl: 'my-pages.html',
})
export class MyPagesPage {

  myPages: PageEntity[] = [];
  currentBookId: string;
  deviceOnline: boolean;
  noPagesMessage: boolean;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private platform: Platform,
    private sqlProvider: SqlStorageProvider,
    public alertCtrl: AlertController,
    private iab: InAppBrowser,
    private screenOrientation: ScreenOrientation,
    private loadingController: LoadingController,
    private deviceProvider: DeviceProvider,
    private file: File) { }

  ionViewWillEnter() {
    this.myPages = [];
    this.noPagesMessage = false;
    this.currentBookId = this.navParams.get("bookId");
    console.log("loading my pages for book: " + this.currentBookId);
    this.loadPages(this.currentBookId);

    this.deviceOnline = !this.deviceProvider.checkNetworkDisconnected();
  }

  public getUrl(imageUrl) {
    let nUrl = normalizeURL(imageUrl);
    console.log("normalize url: " + nUrl);
    return nUrl;
  }

  private loadPages(currentBookId: string) {
    //show load icon
    let loader = this.loadingController.create();
    loader.present();

    this.sqlProvider.getPages(currentBookId).then(
      (pages: PageEntity[]) => {
        loader.dismiss();
        pages.forEach((page) => {
          this.myPages.push(page);
        })
        if (this.myPages.length == 0) {
          this.noPagesMessage = true;
        }
      },
      error => {
        loader.dismiss();
        console.error("ERROR: cannot load pages ", error);
        this.presentFailureAlert("Technical Error", "Please try again later");
      }
    )
  }

  // called from UI
  public getPageNumber(pageId: string) {
    return pageId.substring(pageId.lastIndexOf("P") + 1);
  }

  //called from UI
  //TODO: enhancement - support selecting multiple pages for deletion on UI
  public confirmDeletion(pages: PageEntity[]) {
    let alert = this.alertCtrl.create({
      title: "Delete Page(s)",
      subTitle: pages.length == 1 ? "Are you sure you want to delete this page?" : "Are you sure you want to delete " + pages.length + " pages?",
      buttons: [
        {
          text: "YES",
          role: "cancel",
          handler: () => {
            this.deletePages(pages);
          }
        },
        {
          text: "NO",
          role: "cancel"
        }
      ]
    });
    alert.present();
  }

  public deletePages(pages: PageEntity[]) {

    let deletePromises: Promise<RemoveResult>[] = [];

    let pageIdsForDeletion = new Set<string>();
    //calculate data for helping in deletion 
    for (let j = 0; j < pages.length; j++) {
      pageIdsForDeletion.add(pages[j].pageId);
      //delete image file of page
      deletePromises.push(this.file.removeFile(this.file.dataDirectory, pages[j].imageUrl.substring(pages[j].imageUrl.lastIndexOf("/") + 1)));
    }

    //delete content file of page iff no other page exists that has the same content and is not marked for deletion
    for (let i = 0; i < pages.length; i++) {
      let anotherPageWithSameContentExists = false;
      for (let j = 0; j < this.myPages.length; j++) {
        if (this.myPages[j].contentUrl == pages[i].contentUrl && !pageIdsForDeletion.has(this.myPages[j].pageId)) {
          anotherPageWithSameContentExists = true;
          break;
        }
      }
      if (!anotherPageWithSameContentExists) {
        deletePromises.push(this.file.removeFile(this.file.dataDirectory, pages[i].contentUrl.substring(pages[i].contentUrl.lastIndexOf("/") + 1)));
      }
    }

    Promise.all(deletePromises).then(
      (result: RemoveResult[]) => {
        result.forEach(res => {
          console.log("deleted: " + res.fileRemoved.toURL());
        })
      },
      error => {
        console.error("ERROR during deletion of page files: ", error);
      }
    )

    this.sqlProvider.deletePages(pages).then(
      () => {
        console.log("deleted pages: ", pages);
        //delete pages from view list 
        for (let i = this.myPages.length - 1; i >= 0; i--) {
          if (pageIdsForDeletion.has(this.myPages[i].pageId)) {
            this.myPages.splice(i, 1);
            break;
          }
        }

        if (this.myPages.length == 0) {
          //if no pages left, transition back to previous page
          this.navCtrl.pop();
        }
      },
      error => {
        console.error("ERROR deleting pages from DB: ", error);
      }
    )
  }

  //called from UI
  openMedia(mediaUrl: string) {

    console.log("playing media at: ", mediaUrl);
    let iab = this.iab.create(mediaUrl, "_blank", "location=no,hidden=no");
    this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.LANDSCAPE);
    // iab.on("loadstop").subscribe(
    //   () => {
    //     console.log("loadstop fired!");
    //     this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.LANDSCAPE);
    //     iab.show();
    //   }
    // )
    iab.on("exit").subscribe(
      () => {
        this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
        console.log("orientation after browser close: " + this.screenOrientation.type);
      }
    )

  }



  presentFailureAlert(title: string, message: string) {
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
