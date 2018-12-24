import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import * as Constants from '../app/app.constants';
import { DataProvider } from './data.provider';
import { Result } from '../model/response';
import { Book } from '../model/book';

@Injectable()
export class BooksProvider {

  bookIdToDetailsMap: Map<string, Book> = new Map();

  constructor(public data: DataProvider) {
  }

  public getAll(): Observable<Result<Book>> {

    console.log("fetching books from url: " + Constants.BOOKS_URI);
    return this.data.getAll<Result<Book>>(Constants.BOOKS_URI);
  }

  /**
   * Uses cache
   * @param bookId 
   */
  public getBookByBookId(bookId: string): Observable<Book> {
    if (this.bookIdToDetailsMap.has(bookId)) {
      return Observable.of(this.bookIdToDetailsMap.get(bookId));
    }

    let requestUrl: string = Constants.BOOKS_URI + "/" + bookId;
    console.log("fetching book by id from url: " + requestUrl);
    return this.data.getAll<Book>(requestUrl).map((book) => {
      this.bookIdToDetailsMap.set(bookId, book);
      return book;
    })
  }

  public post(requestBody: any): Observable<Book> {
    return this.data.post<Book>(Constants.BOOKS_URI, requestBody);
  }

  public update(id: string, requestBody: any): Observable<Book> {
    let url: string = Constants.BOOKS_URI + "/" + id;
    return this.data.update<Book>(url, requestBody);
  }

  public delete(id: string): Observable<Book> {
    let url: string = Constants.BOOKS_URI + "/" + id;
    return this.data.delete<Book>(url);
  }
}
