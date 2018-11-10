import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { NavController, Platform, NavParams } from 'ionic-angular';
import { QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner';
import { Subscription } from 'rxjs/Subscription';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { File } from '@ionic-native/file';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { Book } from '../../model/book';

@Component({
  selector: 'page-book-details',
  templateUrl: 'bookDetails.html'
})
export class BookDetailsPage implements OnInit {

  public cameraPermission: boolean = false;
  public scanning: boolean = false;
  public scanSub: Subscription;
  public currentBook: Book;

  constructor(private screenOrientation: ScreenOrientation, private file: File, private iab: InAppBrowser, public navCtrl: NavController, public navParams: NavParams, public platform: Platform, private changeDetector: ChangeDetectorRef, private qrScanner: QRScanner) {

  }

  //prepare QR scanner
  ngOnInit() {
    this.currentBook = this.navParams.get("book");
    console.log("current book: ", this.currentBook);
    if (this.platform.is('cordova')) {
      this.qrScanner.getStatus().then((status: QRScannerStatus) => {
        if (!status.prepared) {
          this.prepareQRScanner();
        }else{
          console.log("qr scanner already prepared: ", status);
          this.cameraPermission = true;
        }
      })

    }

    //TODO
    this.platform.registerBackButtonAction(() => {
      console.log("back pressed in home");
      this.cleanUpScanner();
    });

  }

  private cleanUpScanner() {
    console.log("cleaning up");
    this.scanning = false;
    ((<any>window).document.querySelector('ion-app') as HTMLElement).classList.remove('cameraView');

    if (this.platform.is('cordova')) {
      this.qrScanner.getStatus().then((status: QRScannerStatus) => {
        if (status.showing) {
          console.log("hiding");
          this.qrScanner.hide();
        }
        if (status.scanning) {
          if (!this.scanSub.closed) {
            console.log("unsubing");
            this.scanSub.unsubscribe();
          }
          else {
            //scanner is inconsistent
            console.log("destroying");
            this.qrScanner.destroy();
          }
        }

      })
    }
  }

  private prepareQRScanner(): void {

    this.qrScanner.prepare()
      .then((status: QRScannerStatus) => {
        console.log("after preparation: ", status);
        if (status.authorized) {
          // camera permission was granted
          console.log('Permission granted');
          this.cameraPermission = true;

        } else if (status.denied && status.canOpenSettings) {
          // camera permission was permanently denied
          // you must use QRScanner.openSettings() method to guide the user to the settings page
          // then they can grant the permission from there
          console.log('Permission denied permanently');
          if (confirm("Would you like to enable QR code scanning? You can allow camera access in your settings.")) {
            this.qrScanner.openSettings();
          }

        } else {
          // permission was denied, but not permanently. You can ask for permission again at a later time.
          console.log("permission denied temporarily");
        }
      })
      .catch((e: any) => {
        console.log('Error is', e)
        alert("Unexpected error occured. Please try again later.")
      });
  }

  public scanForQRCode(): void {
    // start scanning
    this.scanSub = this.qrScanner.scan().subscribe(
      (text: string) => {
        console.log('Scanned something', text);


        this.qrScanner.hide(); // hide camera preview
        this.scanning = false;
        ((<any>window).document.querySelector('ion-app') as HTMLElement).classList.remove('cameraView');

        this.scanSub.unsubscribe(); // stop scanning
        this.qrScanner.getStatus().then((status: QRScannerStatus) => {
          console.log("after detection: ", status);
        });
        if (text == "acf44718-2b8c-465c-9c03-1f054a788f48") {
          this.playVideo2();
        }
        else {
          this.changeDetector.detectChanges();
          alert("Please scan a QR code valid for this book: " + this.currentBook.title);
        }

      },
      error => {
        console.log("scan error: ", error);
      });

    ((<any>window).document.querySelector('ion-app') as HTMLElement).classList.add('cameraView');
    this.scanning = true;
    this.qrScanner.show().then((status: QRScannerStatus) => {
      console.log("after show called: ", status);
      console.log("after show called: ", status.showing);
      console.log("after show called: ", status.scanning);
    })
  }

  
  playVideo2() {

    let img_path = this.file.applicationDirectory + "www/assets/videos/SampleVideo5mb.mp4";
    
    console.log("orientation before video: " + this.screenOrientation.type);
    console.log("playing video at: ", img_path);
    let iab = this.iab.create(img_path, "_blank", "location=no,hidden=yes");

    iab.on("loadstop").subscribe(
      next => {
        console.log("loadstop fired!");
        this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.LANDSCAPE);
        iab.show();
      }
    )
    iab.on("exit").subscribe(
      next => {
        this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
        console.log("orientation after browser close: " + this.screenOrientation.type);
      }
    )

  }

  ionViewWillLeave() {
    this.cleanUpScanner();
  }

}
