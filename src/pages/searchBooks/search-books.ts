import {
  AlertController, IonicPage, LoadingController, NavController, Platform, Searchbar
} from 'ionic-angular';

import { Component, ViewChild } from '@angular/core';

import { Book } from '../../model/book';
import { BooksProvider } from '../../providers/books.provider';
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
  subjectList: string[] = [];
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
    private booksProvider: BooksProvider) {

  }
public getPageTitle(currentClass: string){
  if(currentClass.toLowerCase() == 'nursery') return 'Soft Berry';
  if(currentClass.toLowerCase() == 'lkg') return 'Sweet Berry';
  if(currentClass.toLowerCase() == 'ukg') return 'Smart Berry';
}
  ionViewWillEnter() {
    if (this.deviceProvider.checkNetworkDisconnected()) {
      this.presentOfflineAlert();
    }
    else if (this.books.length == 0) {
      //if books have not already been loaded
      this.loadBooks();
    }

    this.subscribeToClassFilterSubject();

  }

  //we subscribe to the subject tracking the filter's value
  subscribeToClassFilterSubject() {
    this.booksProvider.getClassFilterAsObservable().subscribe(classFilterVal => {
      this.filters.class = classFilterVal;
      this.filterBooks();
    })
  }

  /**
   * loads all books of publisher
   */
  public loadBooks() {
    let loader = this.loadingController.create();
    loader.present();

    this.booksProvider.getAll().subscribe(
      data => {
        //add default option to filter list

        data.resources.forEach(book => {
          this.books.push(book);
        });
        this.filterBooks();
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

  public filterBooks() {

    let classFilter = this.filters.class;
    let subjectFilter = this.filters.subject;
    let searchFilter = this.filters.searchbar;

    console.log(`filter books fired with {class: ${classFilter}, subject: ${subjectFilter}, search: ${searchFilter}`);

    this.searchedBooks = this.books.filter(function (item) {
      return (classFilter == "all" || item.schoolClass.toLowerCase() == classFilter.toLowerCase()) &&
        (subjectFilter == "all" || item.subject == subjectFilter) &&
        (!searchFilter || !searchFilter.trim() || item.title.toLowerCase().includes(searchFilter.toLowerCase()))

    });
  }

  public filterBooksByTitle(ev: any) {
    this.filters.searchbar = ev.target.value;
    this.filterBooks();
  }

  public goToBookFilterPage() {

    this.navCtrl.parent.parent.setRoot(PageConstants.BOOK_FILTER_PAGE, { "openedAsRoot": true });

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
