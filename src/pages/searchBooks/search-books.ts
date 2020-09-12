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
    class: "All",
    subject: "All",
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

  ionViewWillEnter() {
    this.filters.class = this.booksProvider.getClassFilter();
    if (this.deviceProvider.checkNetworkDisconnected()) {
      this.presentOfflineAlert();
    }
    else if (this.books.length == 0) {
      //if books have not already been loaded
      this.loadBooks();
    }

    //this.subscribeToClassFilterSubject();

  }

  //we subscribe to the subject tracking the filter's value
  // subscribeToClassFilterSubject() {
  //   this.booksProvider.getClassFilterAsObservable().subscribe(classFilterVal => {
  //     this.filters.class = classFilterVal;
  //     console.log("new value of class filter: " + this.filters.class);
  //     //this.filterBooks("class");
  //   })
  // }

  /**
   * loads all books of publisher
   */
  public loadBooks() {
    let loader = this.loadingController.create();
    loader.present();

    this.booksProvider.getAll().subscribe(
      data => {
        //add default option to filter list
        this.subjectList.push("All");

        data.resources.forEach(book => {
          this.books.push(book);
          if (book.schoolClass == this.filters.class && this.subjectList.indexOf(book.subject) < 0) {
            this.subjectList.push(book.subject);
          }
        });

        this.filterBooks("class");
        this.sortSubjectList();
        loader.dismiss();

        console.log("fetched books: ", this.books);
      },
      error => {
        loader.dismiss();
        console.log("error while fetching books ", error);
        this.presentFailureAlert("Technical Error", "Please try again later");
      }
    )

    //setup class filter
    this.booksProvider.getSchoolClassList().forEach(schoolClass => this.classList.push(schoolClass));
  }


  public filterBooks(filterBy: string) {

    //reInitSubjectFilter - part 1
    if (filterBy == "class") {
      console.log("subject filter reset");
      this.filters.subject = "All";
      this.subjectList = ["All"];
      this.booksProvider.setClassFilterNextVal(this.filters.class);
    }
    let classFilter = this.filters.class;
    let subjectFilter = this.filters.subject;
    let searchFilter = this.filters.searchbar;

    console.log(`filter books fired with {class: ${classFilter}, subject: ${subjectFilter}, search: ${searchFilter}}`);

    this.searchedBooks = this.books.filter(function (item) {
      return (classFilter == "All" || item.schoolClass.toLowerCase() == classFilter.toLowerCase()) &&
        (subjectFilter == "All" || item.subject == subjectFilter) &&
        (!searchFilter || !searchFilter.trim() || item.title.toLowerCase().includes(searchFilter.toLowerCase()))

    });

    //reInitSubjectFilter - part 2
    if (filterBy == "class") {
      this.searchedBooks.forEach(book => {
        if (this.subjectList.indexOf(book.subject) < 0) {
          this.subjectList.push(book.subject);
        }
      })
      this.sortSubjectList();

    }
  }

  private sortSubjectList(): void {
    this.subjectList = this.subjectList.sort((a, b) => {
      if (a == "All") return -1;
      if (b == "All") return 1;
      let textA = a.toUpperCase();
      let textB = b.toUpperCase();
      return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
    })
  }

  public filterBooksByTitle(ev: any) {
    this.filters.searchbar = ev.target.value;
    this.filterBooks("title");
  }

  // public goToBookFilterPage() {

  //   this.navCtrl.parent.parent.setRoot(PageConstants.BOOK_FILTER_PAGE, { "openedAsRoot": true });

  // }

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
