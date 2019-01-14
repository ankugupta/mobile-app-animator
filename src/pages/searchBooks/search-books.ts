import { Component, ViewChild } from '@angular/core';
import { Searchbar, NavController, Platform, AlertController, LoadingController, IonicPage, NavParams } from 'ionic-angular';
import { BooksProvider } from '../../providers/books.provider';
import { Book } from '../../model/book';
import { DeviceProvider } from '../../providers/device.provider';
import * as PageConstants from '../pages.constants';

@IonicPage()
@Component({
  selector: 'page-search-books',
  templateUrl: 'search-books.html'
})
export class SearchBooksPage {

  books: Book[] = [];
  searchedBooks: Book[] = [];
  classList: string[] = [];
  subjectList:string[] = [];
  filters: { class: string, subject: string, searchbar: string } = {
    class: "all",
    subject: "all",
    searchbar: ""
  }

  @ViewChild('searchBar')
  searchBar: Searchbar;


  constructor(private platform: Platform,
    private alertCtrl: AlertController,
    private loadingController: LoadingController,
    private deviceProvider: DeviceProvider,
    private navCtrl: NavController,
    private navParams: NavParams,
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
        //add default option to filter list
        this.classList.push("all");
        this.subjectList.push("all");

        data.resources.forEach(book => {
          this.books.push(book);
          this.searchedBooks.push(book);
          this.classList.push(book.schoolClass);
          this.subjectList.push(book.subject);
        });
        loader.dismiss();

        if(this.navParams.get("filters")){
          let filterParam = this.navParams.get("filters");
          this.filters.class = filterParam.class || "all";
          this.filters.subject = filterParam.subject || "all";
          this.filterBooks();
        }

        console.log("fetched books: ", this.books);
      },
      error => {
        loader.dismiss();
        console.log("error while fetching books ", error);
        this.presentFailureAlert("Technical Error", "Please try again later");
      }
    )
  }

  public filterBooks() {
    console.log("filter books fired!!!")
    let classFilter = this.filters.class;
    let subjectFilter = this.filters.subject;
    let searchFilter = this.filters.searchbar;

    this.searchedBooks = this.books.filter(function (item) {
      return (classFilter == "all" || item.schoolClass == classFilter) &&
        (subjectFilter == "all" || item.subject == subjectFilter) &&
        (!searchFilter || !searchFilter.trim() || item.title.toLowerCase().includes(searchFilter.toLowerCase()))

    });
  }

  public filterBooksByTitle(ev: any) {
    console.log("filter by title fired!!!!!!!");
    this.filters.searchbar = ev.target.value;
    this.filterBooks();

    // if (val && val.trim() !== '') {
    //   this.searchedBooks = this.books.filter(function (item) {
    //     return item.title.toLowerCase().includes(val.toLowerCase());
    //   });
    // }
    // else {
    //   this.searchedBooks = this.books.slice(0, this.books.length);
    // }
  }

  public goToBookDetail(book: Book) {
    // to scan using qr scanner, use book details page
    //this.nav.push(BookDetailsPage, { "book": book});

    this.navCtrl.push(PageConstants.SCAN_BOOK_PAGE, { bookId: book.bookId });
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
