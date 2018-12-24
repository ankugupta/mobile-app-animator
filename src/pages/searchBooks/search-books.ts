import { Component } from '@angular/core';
import { NavController, Platform, AlertController, LoadingController, IonicPage } from 'ionic-angular';
import { BooksProvider } from '../../providers/books.provider';
import { Book } from '../../model/book';
import { DeviceProvider } from '../../providers/device.provider';

@IonicPage()
@Component({
  selector: 'page-search-books',
  templateUrl: 'search-books.html'
})
export class SearchBooksPage {

  public books: Book[] = [];
  public searchedBooks: Book[] = [];

  constructor(private platform: Platform,
    private alertCtrl: AlertController,
    private loadingController: LoadingController,
    private deviceProvider: DeviceProvider,
    private navCtrl: NavController,
    private booksProvider: BooksProvider) {

  }

  ionViewWillEnter() {
    if (this.deviceProvider.checkNetworkDisconnected()) {
      this.presentOfflineAlert();
    }
    else if (this.books.length == 0) {
      //if books have not already been loaded
      this.loadBooks();
    }
  }

  /**
   * loads all books of publisher
   * TODO: use infinite scroll for better performance
   */
  public loadBooks() {
    let loader = this.loadingController.create();
    loader.present();

    this.booksProvider.getAll().subscribe(
      data => {
        data.resources.forEach(book => {
          this.books.push(book);
          this.searchedBooks.push(book);
        });
        loader.dismiss();
        console.log("fetched books: ", this.books);
      },
      error => {
        loader.dismiss();
        console.log("error while fetching books ", error);
        this.presentFailureAlert("Technical Error", "Please try again later");
      }
    )
  }

  public filterBooks(ev: any) {
    let val = ev.target.value;

    if (val && val.trim() !== '') {
      this.searchedBooks = this.books.filter(function (item) {
        return item.title.toLowerCase().includes(val.toLowerCase());
      });
    }
    else {
      this.searchedBooks = this.books.slice(0, this.books.length);
    }
  }

  public goToBookDetail(book: Book) {
    // to scan using qr scanner, use book details page
    //this.nav.push(BookDetailsPage, { "book": book});

    this.navCtrl.push("ScanBookPage", { bookId: book.bookId });
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
