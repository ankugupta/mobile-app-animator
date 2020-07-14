import { BehaviorSubject, Subject } from 'rxjs';
import { Observable } from 'rxjs/Observable';

import { Injectable } from '@angular/core';

import * as Constants from '../app/app.constants';
import { Book } from '../model/book';
import { Result } from '../model/response';
import { DataProvider } from './data.provider';
import { MasterDataProvider } from './master-data.provider';

@Injectable()
export class BooksProvider {

  booksCache: Book[] = [];
  schoolClassSet: Set<string> = new Set();
  classFilterSubject: Subject<string> = new BehaviorSubject("All");
  bookIdToDetailsMap: Map<string, Book> = new Map();

  //flag - false indicates that books section is already initialized
  bookSectionFirstInit = true;


  constructor(public data: DataProvider, public masterDataProvider: MasterDataProvider) {
  }

  /**
   * uses cache
   */
  public getAll(): Observable<Result<Book>> {
    console.log("returning book list from cache..");
    if (this.booksCache.length > 0) {
      return Observable.of({ resources: this.booksCache, count: this.booksCache.length });
    }

    console.log("fetching books from url: " + Constants.BOOKS_URI);
    return this.data.getAll<Result<Book>>(Constants.BOOKS_URI).map((result) => {
      //cache result
      this.booksCache = [];
      result.resources.forEach(book => {
        this.booksCache.push(book);
        this.schoolClassSet.add(book.schoolClass);
      });

      //sort books cache by class and title
      let classOrderMap: Map<string, number> = this.masterDataProvider.getMasterRecord(Constants.MD_TYPE_CLASS_ORDERING);
      this.booksCache = this.booksCache.sort((a, b) => {
        if (classOrderMap && classOrderMap.get(a.schoolClass) - classOrderMap.get(b.schoolClass) != 0) {
          return classOrderMap.get(a.schoolClass) - classOrderMap.get(b.schoolClass);
        }
        let textA = a.title.toUpperCase();
        let textB = b.title.toUpperCase();
        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
      });

      return result;
    });
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

  public isBookSectionFirstInit(): boolean {
    return this.bookSectionFirstInit;
  }

  public setBookSectionFirstInit(isFirstInit: boolean) {
    this.bookSectionFirstInit = isFirstInit;
  }

  public setClassFilterNextVal(nextVal: string) {
    this.classFilterSubject.next(nextVal);
  }

  public getClassFilterAsObservable(): Observable<string> {
    return this.classFilterSubject.asObservable();
  }

  public getSchoolClassList(): string[] {
    let classList: string[] = [];
    this.schoolClassSet.forEach(schoolClass => classList.push(schoolClass));

    //sort the list of classes and return
    let classOrderMap: Map<string, number> = this.masterDataProvider.getMasterRecord(Constants.MD_TYPE_CLASS_ORDERING);
    if (classOrderMap) {
      return classList.sort((a, b) => {
        return classOrderMap.get(a) - classOrderMap.get(b);
      });
    }
    return classList;

  }
}
