import { Component, OnInit } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import { BooksProvider } from '../../providers/books.provider';
import * as Constants from '../../app/app.constants';
import { Book } from '../../model/book';
import { BookDetailsPage } from '../bookDetails/bookDetails';
import { ScanBookPage } from '../scan-book/scan-book';
@Component({
  selector: 'page-search-books',
  templateUrl: 'searchBooks.html'
})
export class SearchBooksPage implements OnInit {

  public books: Book[] = [];
  public searchedBooks: Book[] = [];
  
  constructor(private nav: NavController, private booksProvider: BooksProvider) {

  }

  
  ngOnInit() {
    this.booksProvider.getAll().subscribe(
      data => {
        data.forEach(book => {
          this.books.push(book);
          this.searchedBooks.push(book);
        })
      },
      error => {
        //TODO
      }
    )
  }

  public filterBooks(ev: any) {
    let val = ev.target.value;

    if (val && val.trim() !== '') {
      this.searchedBooks = this.books.filter(function(item) {
        return item.title.toLowerCase().includes(val.toLowerCase());
      });
    }
    else{
      this.searchedBooks = this.books.slice(0, this.books.length);
    }
  }

  public goToBookDetail(book: Book){
    // to scan using qr scanner, use book details page
    //this.nav.push(BookDetailsPage, { "book": book});
    this.nav.push(ScanBookPage, { "book": book});
  }
  
}
