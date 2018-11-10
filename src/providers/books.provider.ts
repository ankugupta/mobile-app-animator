import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DataProvider } from './data.provider';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Book } from '../model/book';
import * as Constants from '../app/app.constants';
@Injectable()
export class BooksProvider {

  constructor(public data: DataProvider, private http: HttpClient) {
  }

  public getAll(): Observable<Book[]> {
    
    return this.http.get<Book[]>("assets/json/books.json");
    //return this.data.getAll<Book[]>(Constants.BOOKS_URI);
  }

  public post(requestBody: any): Observable<Book> {
    return this.data.post<Book>(Constants.BOOKS_URI, requestBody);
  }

  public update(id: string, requestBody: any): Observable<Book> {
    let url:string = Constants.BOOKS_URI + "/" + id;
    return this.data.update<Book>(url, requestBody);
  }

  public delete(id: string): Observable<Book> {
    let url:string = Constants.BOOKS_URI + "/" + id;
    return this.data.delete<Book>(url);
  }
}
