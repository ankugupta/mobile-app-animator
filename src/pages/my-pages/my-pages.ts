import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController, Platform, IonicPage } from 'ionic-angular';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { File, RemoveResult } from '@ionic-native/file';

import { DeviceProvider } from '../../providers/device.provider';
import { SqlStorageProvider } from '../../providers/sql-storage.provider';
import { PageEntity } from '../../model/pageEntity';

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
    for (let page of pages) {
      deletePromises.push(this.file.removeFile(this.file.dataDirectory, page.imageUrl.substring(page.imageUrl.lastIndexOf("/") + 1)));
      deletePromises.push(this.file.removeFile(this.file.dataDirectory, page.contentUrl.substring(page.contentUrl.lastIndexOf("/") + 1)));
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
        //delete page from view list 
        for (var j = 0; j < pages.length; j++) {
          for (var i = this.myPages.length - 1; i >= 0; i--) {
            if (this.myPages[i].pageId == pages[j].pageId) {
              this.myPages.splice(i, 1);
              break;
            }
          }
        }

        if (this.myPages.length == 0) {
          this.noPagesMessage = true;
        }
      },
      error => {
        console.error("ERROR deleting pages from DB: ", error);
      }
    )
  }

  //called from UI
  //opens media with given url in in-app-browser
  public openMedia(page: PageEntity) {

    console.log("orientation before opening media: " + this.screenOrientation.type);
    console.log("playing media at: ", page.contentUrl);
    let iab = this.iab.create(page.contentUrl, "_blank", "location=no,hidden=yes");

    iab.on("loadstop").subscribe(
      () => {
        console.log("loadstop fired!");
        this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.LANDSCAPE);
        iab.show();
      }
    )
    iab.on("exit").subscribe(
      () => {
        this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
        console.log("orientation after browser close: " + this.screenOrientation.type);
      }
    )
  }

  public scanBook() {
    this.navCtrl.push("ScanBookPage", { bookId: this.currentBookId });
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
