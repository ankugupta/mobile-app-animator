import {
  AlertController, IonicPage, Loading, LoadingController, NavController, NavParams, Platform
} from 'ionic-angular';

import { Component } from '@angular/core';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { ScreenOrientation } from '@ionic-native/screen-orientation';

import * as Constants from '../../app/app.constants';
import { Book } from '../../model/book';
import { BookEntity } from '../../model/bookEntity';
import { Page } from '../../model/page';
import { PageEntity } from '../../model/pageEntity';
import { BooksProvider } from '../../providers/books.provider';
import { DeviceProvider } from '../../providers/device.provider';
import { FilesProvider } from '../../providers/files.provider';
import { SqlStorageProvider } from '../../providers/sql-storage.provider';

@IonicPage()
@Component({
  selector: 'page-scan-book',
  templateUrl: 'scan-book.html'
})
export class ScanBookPage {

  public currentBook: Book;
  private vuforiaConfig: { targetList: string[], targetXMLPath: string };
  private bookAlreadyDownloaded: boolean = false;
  private scanningStopped: boolean = false;
  private downloadingBook: boolean = false;
  public downloadProgress: number = 0;

  constructor(private screenOrientation: ScreenOrientation,
    private iab: InAppBrowser,
    private loadingController: LoadingController,
    private deviceProvider: DeviceProvider,
    private alertCtrl: AlertController,
    private navCtrl: NavController,
    private navParams: NavParams,
    private platform: Platform,
    private booksProvider: BooksProvider,
    private filesProvider: FilesProvider,
    private sqlProvider: SqlStorageProvider) {

  }

  ionViewWillEnter() {
    //init variables
    this.bookAlreadyDownloaded = false;
    this.scanningStopped = false;
    this.downloadingBook = false;

    //process nav params
    let currentBookId = this.navParams.get("bookId");

    console.log("current book id: ", currentBookId);
    if (this.deviceProvider.checkNetworkDisconnected()) {
      this.presentOfflineAlert();
    }
    else {
      this.loadBookDetails(currentBookId);
    }
  }

  public loadBookDetails(bookId: string) {
    //show load icon
    let loader = this.loadingController.create();
    loader.present();

    //fetch book details
    this.booksProvider.getBookByBookId(bookId).subscribe(
      bookdetails => {
        this.currentBook = bookdetails;
        console.log("book details loaded: ", this.currentBook);

        this.sqlProvider.getBookMap(false).then(
          (bookMap: Map<string, BookEntity>) => {
            //if book already downloaded
            if (bookMap.has(bookId)) {
              this.configureVuforiaAndEnableScan(bookMap.get(bookId).targetXMLUrl);
            }
            loader.dismiss();
          },
          error => {
            loader.dismiss();
            console.error("ERROR: cannot get book map ", error);
            this.presentFailureAlert("Technical Error", "Please try again later");
          }
        )
      },
      error => {
        loader.dismiss();
        console.log("error while fetching book details ", error);
        this.presentFailureAlert("Technical Error", "Please try again later");
      }
    )
  }

  //called from UI on click of 'get'
  public getBook() {
    console.log("getting book...");
    this.downloadProgress = 0;
    this.downloadingBook = true;

    let loader = this.loadingController.create({
      content: `<div>Downloading...</div>`,
      dismissOnPageChange: true
    });
    loader.present();

    //if user navigates away whil download is in progress - then attempt abort
    loader.onDidDismiss((data) => {
      console.log("download loader dismissed");
      if (!data || !data.operationOver) {
        console.log("dismissal not normal..abort download operation");
        this.filesProvider.tryToAbortOperation();
      }
    })

    //download book target files(2), book thumbnail

    //calc local filenames
    let xmlfilename: string = this.currentBook.targetXMLUrl.substring(this.currentBook.targetXMLUrl.lastIndexOf("/") + 1);
    let datfilename: string = this.currentBook.targetDATUrl.substring(this.currentBook.targetDATUrl.lastIndexOf("/") + 1);
    let imagefilename: string = this.currentBook.imageUrl.substring(this.currentBook.imageUrl.lastIndexOf("/") + 1);

    if (xmlfilename.substring(0, xmlfilename.lastIndexOf(".")) === datfilename.substring(0, datfilename.lastIndexOf("."))) {
      //trigger downloads
      let xmlPromise = this.filesProvider.downloadFile(this.currentBook.targetXMLUrl, xmlfilename);
      let datPromise = this.filesProvider.downloadFile(this.currentBook.targetDATUrl, datfilename);
      let imgPromise = this.filesProvider.downloadFile(this.currentBook.imageUrl, imagefilename);

      this.filesProvider.getProgressAsObservable().throttleTime(1000).subscribe(
        progressPercent => {
          console.log("download progress: " + progressPercent + "%");
          if (progressPercent > this.downloadProgress) {
            console.log("updating progress...")
            this.downloadProgress = progressPercent;
          }
        }
      )

      Promise.all<string>([xmlPromise, datPromise, imgPromise]).then(
        localUrls => {
          loader.dismiss({ operationOver: true });
          //hack to display the progress bar as full 
          this.downloadProgress = 100;
          setTimeout(() => {
            this.downloadingBook = false;
          }, 500)

          //make entry in sql with local paths
          this.saveBookInfo(localUrls[0], localUrls[1], localUrls[2]);

          this.configureVuforiaAndEnableScan(localUrls[0]);
        },
        error => {
          loader.dismiss({ operationOver: true });
          this.downloadingBook = false;
          console.log("Error: while getting book: ", error);
          this.presentInfoAlert("Technical Error", "Cannot process this book at the moment. Please try other books");
        }
      )
    }
    else {
      console.error("ERROR: book's target xml and dat files should have same names: ", this.currentBook);
      loader.dismiss({ operationOver: true });
      this.downloadingBook = false;
      this.presentInfoAlert("Technical Error", "Cannot process this book at the moment. Please try other books");
    }
  }

  private configureVuforiaAndEnableScan(xmlPath: string) {
    console.log("configuring vuforia...")
    if (this.currentBook.pages.length > 0) {
      let targetList: string[] = [];
      this.currentBook.pages.forEach((page) => {
        targetList.push(page.pageId);
      });
      //set targetList and target xml path in vuforiaConfig
      this.vuforiaConfig = {
        targetXMLPath: xmlPath,
        targetList: targetList
      }
      //set flag to display scan button
      this.bookAlreadyDownloaded = true;
      console.log("configured vuforia: ", this.vuforiaConfig);
    }
    else {
      this.presentInfoAlert("Oops!", "No pages found for this book. Please try other books");
    }

  }

  private saveBookInfo(xmlLocalUrl: string, datLocalUrl: string, imgLocalUrl: string) {
    let bookEntity: BookEntity = {
      bookId: this.currentBook.bookId,
      title: this.currentBook.title,
      imageUrl: imgLocalUrl,
      publisherName: this.currentBook.publisherName,
      schoolClass: this.currentBook.schoolClass,
      subject: this.currentBook.subject,
      targetDATUrl: datLocalUrl,
      targetXMLUrl: xmlLocalUrl,
      noOfVideos: this.currentBook.noOfVideos,
      noOfActivities: this.currentBook.noOfActivities
    }

    this.sqlProvider.insertBook(bookEntity).then(
      () => {
        console.log("book saved successfully: ", bookEntity);
        console.log("book saved successfully: imageUrl ", bookEntity.imageUrl);
        console.log("book saved successfully: targetXML: ", bookEntity.targetXMLUrl);
      },
      (error) => {
        console.error("ERROR: book save failed: ", bookEntity, error);
        this.presentFailureAlert("Technical Error", "Please try again later");
      }
    )
  }

  //called from UI on click of 'scan'
  public scanForImage() {
    this.sqlProvider.updateLastUsedTime(this.currentBook.bookId).then(
      () => {
        console.log("updated last access time on book");
      }
    );

    this.sqlProvider.getARWarningMsgPreference().then(showMsg => {
      if (showMsg === 1) {
        let hideMessage: boolean = false;
        let alert = this.alertCtrl.create({
          title: Constants.AR_WARNING_TITLE,
          message: Constants.AR_WARNING_MSG,
          inputs: [
            {
              name: 'hideMessage',
              type: 'checkbox',
              label: 'Do not show this again',
              checked: false,
              value: 'fake',
              handler: (checkBox) => {
                console.log(checkBox);
                // handle checkbox event - use the boolean later to update preference
                if (checkBox.checked) {
                  hideMessage = true;
                }
                else {
                  hideMessage = false;
                }
              }

            }
          ],
          buttons: [
            {
              text: "OK",
              role: "submit",
              handler: () => {
                setTimeout(() => {
                  this.startScanTillTimeout();
                }, 0);
                if (hideMessage) {
                  console.log('user has asked to hide message');
                  this.sqlProvider.updateARWarningMsgPreference().then(() => {
                    console.log('user pref updated');
                  })
                }
                return true;
              }
            }
          ]
        });
        alert.present();
      } else {
        this.startScanTillTimeout();
      }
    });
  }

  //TODO: use code from scan provider and delete from here
  //triggers scanning - camera opens up
  public startScanTillTimeout() {
    this.startVuforia();

    console.log('Starting scan timer...');

    // Wait for a timeout, then automatically stop Vuforia
    setTimeout(() => {
      if (!this.scanningStopped) {
        console.log("user has not scanned successfully in " + Constants.OBJECT_SCAN_TIMEOUT_SECONDS + " seconds.. closing");
        this.stopVuforia();
      }
    }, Constants.OBJECT_SCAN_TIMEOUT_SECONDS * 1000);
  }


  // ---- Vuforia code starts ----

  // Start the Vuforia plugin
  public startVuforia() {

    if (!this.vuforiaConfig || !this.vuforiaConfig.targetXMLPath || !this.vuforiaConfig.targetList || this.vuforiaConfig.targetList.length < 1) {
      this.presentInfoAlert("Technical Error", "Cannot process this book at the moment. Please try other books");
    }

    else {
      let overlayMessage: string = 'Point your camera at a page...';

      let options = {
        databaseXmlFile: this.vuforiaConfig.targetXMLPath,
        targetList: this.vuforiaConfig.targetList,
        overlayMessage: overlayMessage,
        vuforiaLicense: Constants.VUFORIA_LICENSE,
        showDevicesIcon: true,
        showAndroidCloseButton: true
      };

      // Start Vuforia with our options
      (<any>navigator).VuforiaPlugin.startVuforia(
        options,
        (data) => this.vuforiaMatch(data),
        (error) => {
          if (error == "CAMERA_PERMISSION_ERROR") {
            this.presentInfoAlert("Permission Required", "Please 'allow' access to camera to use this feature");
          }
          else {
            this.presentFailureAlert("Technical Error", "Please try again later");
          }
          console.log("Error: could not start vuforia: ", error);
        }
      );
    }
  }

  //vuforia event handler - triggered when scanning stops
  vuforiaMatch(data) {
    console.log("Scan over: ", data);
    this.scanningStopped = true;
    //vuforia triggers this handler even when we stop it via code with imageName as ERROR - we don't want to process that
    if (data.status.imageFound && data.result.imageName != "ERROR") {
      console.log("Found Image : " + data.result.imageName);
      this.saveAndPlayMedia(data.result.imageName);
    }
    // Are we manually closing?
    else if (data.status.manuallyClosed) {
      // Let the user know they've manually closed Vuforia
      console.log("User manually closed Vuforia!");
    }
  }
  // Stop the Vuforia plugin
  public stopVuforia() {
    (<any>navigator).VuforiaPlugin.stopVuforia((data) => {
      console.log("vuforia stopped: ", data);

      if (data.success == 'true') {
        this.presentInfoAlert("Too Slow!", "You took too long to scan a page.");
      } else {
        console.log('Couldn\'t stop Vuforia properly\n' + data.message);
      }
    }, (error) => {
      console.log("Error stopping Vuforia:\n", error);
    });
  }

  // ---- Vuforia code ends ----

  private saveAndPlayMedia(detectedPageId: string) {

    let loader = this.loadingController.create({
      content: "Loading page media...",
      dismissOnPageChange: true
    });
    loader.present();

    this.sqlProvider.getPages(this.currentBook.bookId).then(
      (savedPages: PageEntity[]) => {

        let mediaUrl: string = null;

        //if page is already saved
        for (let page of savedPages) {
          if (page.pageId == detectedPageId) {
            mediaUrl = page.contentUrl;
            break;
          }
        }

        //load media from local store
        if (mediaUrl) {
          console.log("page media already downloaded. Playing from: " + mediaUrl);
          loader.dismiss({ operationOver: true });
          this.openMedia(mediaUrl);
        }
        else {
          //download media, save entry in db and then load media
          console.log("page not downloaded yet. downloading and saving content");

          //get page
          let currentPage: Page;
          for (let pageOfBook of this.currentBook.pages) {
            if (detectedPageId == pageOfBook.pageId) {
              currentPage = pageOfBook;
              break;
            }
          }
          if (currentPage) {
            this.getPage(currentPage, loader);

          }
          else {
            //should not happen
            console.error(`ERROR: cannot find page detected in pages of book. PageId: {} \nBook: {}`, detectedPageId, this.currentBook);
          }

        }
      },
      error => {
        loader.dismiss({ operationOver: true });
        this.presentFailureAlert("Technical Error", "Please try again later");
      }
    )
  }

  private getPage(currentPage: Page, loader: Loading) {
    //if user navigates away whil download is in progress - then attempt abort
    loader.onDidDismiss((data) => {
      console.log("download loader dismissed");
      if (!data || !data.operationOver) {
        console.log("dismissal not normal..abort download operation");
        this.filesProvider.tryToAbortOperation();
      }
    })
    //download page content file, page thumbnail

    //calc local filenames
    let contentfilename: string = currentPage.contentUrl.substring(currentPage.contentUrl.lastIndexOf("/") + 1);
    let imagefilename: string = currentPage.imageUrl.substring(currentPage.imageUrl.lastIndexOf("/") + 1);

    //if content file already downloaded (a content file may be associated with multiple pages) - then,
    //do not download again
    let contentFileAlreadyExists = false;
    this.filesProvider.checkIfExists(contentfilename)
      .then(exists => {
        if (exists) {
          contentFileAlreadyExists = true;
        }
        //if content file already downloaded  
        let contentPromise = Promise.resolve(this.filesProvider.getFilePath(contentfilename));

        //trigger downloads
        if (!contentFileAlreadyExists) {
          contentPromise = this.filesProvider.downloadFile(currentPage.contentUrl, contentfilename);
        }
        let imgPromise = this.filesProvider.downloadFile(currentPage.imageUrl, imagefilename);

        Promise.all<string>([contentPromise, imgPromise]).then(
          localUrls => {
            loader.dismiss({ operationOver: true });
            //make entry in sql with local paths
            this.savePageInfo(currentPage, localUrls[0], localUrls[1]);

            this.openMedia(localUrls[0]);
          },
          error => {
            loader.dismiss({ operationOver: true });
            console.log("Error: while getting page: ", error);
            this.presentInfoAlert("Technical Error", "Cannot process this page at the moment. Please try other pages");
          }
        )
      })
      .catch(() => {
        // do nothing
      });
  }

  //opens media with given url in in-app-browser
  openMedia(mediaUrl: string) {

    console.log("playing media at: ", mediaUrl);
    let optionString = "location=no,hidden=no";
    if (this.platform.is("ios")) {
      optionString = "location=no,hidden=no,usewkwebview=yes";
      console.log("using options ", optionString);
    }
    let iab = this.iab.create(mediaUrl, "_blank", optionString);
    //let iab = this.iab.create(mediaUrl, "_blank", "usewkwebview=yes");
    this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.LANDSCAPE);

    iab.on("exit").subscribe(
      () => {
        this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
        console.log("orientation after browser close: " + this.screenOrientation.type);
      }
    )
  }

  private savePageInfo(page: Page, contentLocalUrl: string, imgLocalUrl: string) {
    let pageEntity: PageEntity = {
      bookId: page.bookId,
      pageId: page.pageId,
      imageUrl: imgLocalUrl,
      contentUrl: contentLocalUrl,
      contentType: page.contentType
    }

    this.sqlProvider.insertPage(pageEntity).then(
      () => {
        console.log(`new page saved successfully: ${pageEntity}`);
      },
      (error) => {
        console.error("ERROR: page save failed: ", pageEntity);
        this.presentFailureAlert("Technical Error", "Please try again later");
      }
    )
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

  presentInfoAlert(title: string, message: string) {
    if (this.deviceProvider.checkNetworkDisconnected()) {
      this.presentOfflineAlert();
    } else {
      let alert = this.alertCtrl.create({
        title: title,
        message: message,
        buttons: [
          {
            text: "OK",
            role: "cancel"
          }
        ]
      });
      alert.present();
    }
  }

  presentOfflineAlert() {
    let alert = this.alertCtrl.create({
      title: "Device Offline",
      subTitle: "A connection to internet is required to use this section. Please connect to a Wi-Fi or cellular network.",
      buttons: [
        {
          text: "OK",
          role: "cancel",
          handler: () => {
            //select 'my-books' tab (tab have 0 based indexes)
            this.navCtrl.parent.select(1);
          }
        }
      ]
    });
    alert.present();
  }

  public isBookDownloaded(): boolean {
    return this.bookAlreadyDownloaded;
  }

  public bookLoadInProgress(): boolean {
    return this.downloadingBook;
  }
}
