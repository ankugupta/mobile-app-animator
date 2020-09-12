import { Component } from '@angular/core';
import { NavController, AlertController, LoadingController, Platform, IonicPage } from 'ionic-angular';
import { File, RemoveResult } from '@ionic-native/file';
import { DeviceProvider } from '../../providers/device.provider';
import { SqlStorageProvider } from '../../providers/sql-storage.provider';
import { BookEntity } from '../../model/bookEntity';
import { PageEntity } from '../../model/pageEntity';
import * as PageConstants from '../pages.constants';
import { BooksProvider } from '../../providers/books.provider';
import { ScanProvider } from '../../providers/scan.provider';
import { normalizeURL } from 'ionic-angular';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';


@IonicPage()
@Component({
  selector: 'page-my-books',
  templateUrl: 'my-books.html'
})
export class MyBooksPage {

  myBooks: BookEntity[];
  noBooksMessage: boolean;
  deviceOnline: boolean;

  constructor(
    public navCtrl: NavController,
    public alertCtrl: AlertController,
    private sqlProvider: SqlStorageProvider,
    private deviceProvider: DeviceProvider,
    private booksProvider: BooksProvider,
    private scanProvider: ScanProvider,
    private loadingController: LoadingController,
    private platform: Platform,
    private sanitizer: DomSanitizer,
    private file: File
  ) { }


  ionViewWillEnter() {
    //init variables
    this.noBooksMessage = false;
    this.myBooks = [];
    this.loadBooks();
    this.deviceOnline = !this.deviceProvider.checkNetworkDisconnected();
  }
  
  public getUrl(imageUrl): SafeUrl {
    let newUrl = imageUrl;
    if ((<any>window).Ionic.WebView) {
      newUrl = (<any>window).Ionic.WebView.convertFileSrc(imageUrl);
      console.log("using webview *************************")
    }
    else {
      newUrl = normalizeURL(imageUrl);
    }
    console.log("url: " + imageUrl + " new-url: " + newUrl);
    return this.sanitizer.bypassSecurityTrustUrl(newUrl);
  }

  private loadBooks() {

    let loader = this.loadingController.create();
    loader.present();

    console.log("loading list of my books...");
    this.sqlProvider.getBookMap(false).then(
      bookMap => {
        bookMap.forEach((book) => {
          this.myBooks.push(book);
        })

        if (this.myBooks.length == 0) {
          this.noBooksMessage = true;
        }

        loader.dismiss();
      },
      error => {
        loader.dismiss();
        console.error("ERROR: cannot load books ", error);
        this.presentFailureAlert("Technical Error", "Please try again later");
      }
    )


  }

  public goToSearchTab() {
    //navigate to first tab with search page open
    (<NavController>this.navCtrl.parent.getByIndex(0)).popToRoot().then(
      () => {
        this.navCtrl.parent.select(0);
      },
      () => {
        this.navCtrl.parent.select(0);
      }
    )
  }

  //called from UI
  //fetches book details and then starts scan
  public scanBook(book: BookEntity) {

    this.booksProvider.getBookByBookId(book.bookId).subscribe(
      bookdetails => {
        let bookDetails = bookdetails;
        console.log("book details loaded: ", bookDetails);
        this.scanProvider.configureVuforiaAndStartScan(bookDetails, book.targetXMLUrl);
      },
      error => {
        console.log("error while fetching book details ", error);
        this.presentFailureAlert("Technical Error", "Please try again later");
      }
    )
  }


  public showPages(book: BookEntity) {
    this.navCtrl.push(PageConstants.MY_PAGES_PAGE, { bookId: book.bookId });
  }



  //called from UI
  public confirmDeletion(book: BookEntity) {

    let alert = this.alertCtrl.create({
      title: "Delete Book",
      subTitle: "Are you sure you want to delete this book?",
      buttons: [
        {
          text: "YES",
          role: "cancel",
          handler: () => {
            this.deleteBook(book);
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

  public deleteBook(book: BookEntity) {

    //delete all page contents
    this.sqlProvider.getPages(book.bookId).then(
      (pages: PageEntity[]) => {
        this.deletePages(pages);
      },
      error => {
        console.error("ERROR: cannot load pages ", error);
        this.presentFailureAlert("Technical Error", "Please try again later");
      }
    )

    //delete book contents
    let delImagePromise = this.file.removeFile(this.file.dataDirectory, book.imageUrl.substring(book.imageUrl.lastIndexOf("/") + 1));
    let delDATPromise = this.file.removeFile(this.file.dataDirectory, book.targetDATUrl.substring(book.targetDATUrl.lastIndexOf("/") + 1));
    let delXMLPromise = this.file.removeFile(this.file.dataDirectory, book.targetXMLUrl.substring(book.targetXMLUrl.lastIndexOf("/") + 1));

    Promise.all([delImagePromise, delDATPromise, delXMLPromise]).then(
      (result: RemoveResult[]) => {
        result.forEach(res => {
          console.log("deleted: " + res.fileRemoved.toURL());
        })
      },
      error => {
        console.error("ERROR during deletion of book files: ", error);
      }
    )

    //delete book and page entries from DB
    this.sqlProvider.deleteBook(book.bookId).then(
      () => {
        console.log("deleted book: ", book.bookId);
        //delete book from view list 
        for (var i = this.myBooks.length - 1; i >= 0; i--) {
          if (this.myBooks[i].bookId == book.bookId) {
            this.myBooks.splice(i, 1);
            break;
          }
        }
        if (this.myBooks.length == 0) {
          this.noBooksMessage = true;
        }
      },
      error => {
        console.error("ERROR deleting book from DB: ", error);
      }
    )
  }

  private deletePages(pages: PageEntity[]) {

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
