import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';

import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { BehaviorSubject } from 'rxjs/Rx';
import { BookEntity } from "../model/bookEntity";
import { DBQuery } from '../model/dbquery';
import { PageEntity } from '../model/pageEntity';

/**
 * Wrapper class for SQLLite plugin. Provides methods for
 * creation of db and subsequent querying.
 * Handles both device and browser platforms. 
 * 
 */

@Injectable()
export class SqlStorageProvider {

  private databaseReady: BehaviorSubject<boolean>;

  storage: any;
  dbQueries: Map<number, DBQuery[]> = new Map();
  DB_NAME: string = 'bookAnimator';
  DB_VERSION: number = 1;

  public bookMap: Map<string, BookEntity>;

  constructor(public platform: Platform, public sqlite: SQLite) {
    this.databaseReady = new BehaviorSubject(false);
    this.populateDBQueries();


    this.platform.ready().then(() => {
      if (this.platform.is('cordova')) {
        this.sqlite.create({ name: this.DB_NAME, location: 'default' })
          .then((db: SQLiteObject) => {
            this.storage = db;
            this.tryInit();
          });
      } else {
        this.storage = (<any>window).openDatabase(this.DB_NAME, "1.0", "database", 200000);
        this.tryInit();
      }
    });

  }

  tryInit() {

    this.query('CREATE TABLE IF NOT EXISTS dbversion (version integer)')
      .then(() => {

        this.getDBVersion().then(currentVersion => {
          if (!currentVersion) {
            //first installation
            console.log("db not found, required version " + this.DB_VERSION);
            this.createDBFromVersion(1)
              .then(() => {
                console.log('db structure ready!!!')
                this.query('INSERT INTO dbversion(version) values (?)', [this.DB_VERSION])
                  .then(() => {
                    console.log("db created successfully!");
                    this.databaseReady.next(true);

                  },
                    (error) => {
                      console.error('Error while updating dbversion', error);
                    })
                  .catch(err => {
                    console.error('Error while updating dbversion', err.tx, err.err);
                  })
              })
              .catch(err => {
                console.error('Error while creating db', err.tx, err.err);
              })
          }
          else if (currentVersion < this.DB_VERSION) {
            //old version - update required
            console.log("current db version " + currentVersion + " is older than required version " + this.DB_VERSION);
            this.createDBFromVersion(currentVersion + 1)
              .then(() => {
                console.log('db structure ready!!!')
                this.query('UPDATE dbversion set version = ?', [this.DB_VERSION])
                  .then(() => {
                    console.log("db updated successfully!");
                    this.databaseReady.next(true);
                  })
                  .catch(err => {
                    console.error('Error while updating dbversion', err.tx, err.err);
                  })
              })
              .catch(err => {
                console.error('Error while creating db', err.tx, err.err);
              })
          }
          else {
            //db already up-to-date
            console.log('DB strucure already up-to-date. version: ' + this.DB_VERSION);
            this.databaseReady.next(true);
          }
        })

      })
      .catch(err => {
        console.error('Error while creating dbversion', err.tx, err.err);
      })

  }

  getDBVersion(): Promise<any> {
    return this.query('select version from dbversion').then(
      data => {
        if (data.res.rows.length > 0) {
          return data.res.rows.item(0).version;
        }
      },
      error => {
        console.error("ERROR in getDBVersion" + error);
      });
  }

  createDBFromVersion(startVersion: number): Promise<any> {

    if (this.platform.is('cordova')) {
      //execute all statements in a single transaction and resolve promise after successful transaction
      //NOTE: websql api's transaction function accepts error and success callbacks as arguments
      // However, ionic native's transaction function does not require them since the function itself returns
      // a promise which resolves/rejects basis success/failure of transaction
      return this.storage.transaction(
        (tx: any) => {
          for (let i = startVersion; i <= this.DB_VERSION; i++) {
            let queries: DBQuery[] = this.dbQueries.get(i);
            for (let j = 0; j < queries.length; j++) {
              console.log("executing query: " + queries[j].query);
              tx.executeSql(queries[j].query, queries[j].params,
                (tx: any, res: any) => console.log('query success'),
                (tx: any, err: any) => console.log('query failed: ', err)
              );
            }
          }
        }
      );
    }
    else {
      //execute all statements in a single transaction and resolve promise after successful transaction
      //NOTE: WebSQL db's transaction function's success callback is used to resolve the promise returned
      return new Promise<any>((resolve, reject) => {
        this.storage.transaction(
          (tx: any) => {
            for (let i = startVersion; i <= this.DB_VERSION; i++) {
              let queries: DBQuery[] = this.dbQueries.get(i);
              for (let j = 0; j < queries.length; j++) {
                console.log("executing query: " + queries[j].query);
                tx.executeSql(queries[j].query, queries[j].params,
                  (tx: any, res: any) => console.log('query success'),
                  (tx: any, err: any) => console.log('query failed: ', err)
                );
              }
            }
          },
          (err) => {
            console.error("ERROR: while creating db: ", err);
            reject(err);
          },
          () => resolve()
        );

      })
    }
  }


  insertBook(book: BookEntity): Promise<any> {

    let now: number = new Date().getTime();
    return this.query(
      'insert into mybooks(bookId,title,imageUrl,publisherName,schoolClass,subject,targetDATUrl,targetXMLUrl,noOfVideos, noOfActivities, pageCount, lastUsedTime) values' +
      ' (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [book.bookId, book.title, book.imageUrl, book.publisherName, book.schoolClass, book.subject, book.targetDATUrl, book.targetXMLUrl, book.noOfVideos, book.noOfActivities, 0, now])
      .then(
        () => {
          console.log("inserted book in db!");
          //add to cache
          if (this.bookMap) {
            book.pageCount = 0;
            book.lastUsedTime = now;
            console.log("adding book to cache");
            this.bookMap.set(book.bookId, book);
          }
        }
      )
  }

  insertPage(page: PageEntity): Promise<any> {

    return new Promise<any>((resolve, reject) => {
      this.query(
        'insert into mypages(pageId,bookId,imageUrl,contentType,contentUrl) values' +
        ' (?, ?, ?, ?, ?)', [page.pageId, page.bookId, page.imageUrl, page.contentType, page.contentUrl])
        .then(
          () => {
            console.log("inserted page to db");
            this.query('update mybooks set pageCount = pageCount + 1 where bookId = ?', [page.bookId])
              .then(
                () => {
                  console.log("updated page count for book " + page.bookId);
                  //update value in cache
                  let book = this.bookMap.get(page.bookId);
                  if (book) {
                    book.pageCount = book.pageCount + 1;
                    console.log("updated page count in book cache");
                  }
                  resolve()
                },
                error => {
                  console.error("ERROR updating page count in book: ", error);
                  reject(error);
                }
              )
          },
          error => {
            console.error("ERROR in inserting page: ", error);
            reject(error);
          }
        )
    })
  }

  getBookMap(refresh: boolean): Promise<Map<string, BookEntity>> {
    return new Promise((resolve, reject) => {
      //if cache map is loaded
      if (this.bookMap && !refresh) {
        console.log("book cache already loaded: ", this.bookMap);
        resolve(this.bookMap);
      }
      else {
        this.query('select bookId,title,imageUrl,publisherName,schoolClass,subject,targetDATUrl,' +
          'targetXMLUrl, noOfVideos, noOfActivities, pageCount, lastUsedTime from mybooks', [])
          .then(
            data => {
              let result = data.res.rows;
              console.log("get books result count: " + result.length);
              this.bookMap = new Map();
              for (var x = 0; x < result.length; x++) {
                let book: BookEntity = {
                  bookId: result.item(x).bookId,
                  title: result.item(x).title,
                  imageUrl: result.item(x).imageUrl,
                  publisherName: result.item(x).publisherName,
                  schoolClass: result.item(x).schoolClass,
                  subject: result.item(x).subject,
                  targetDATUrl: result.item(x).targetDATUrl,
                  targetXMLUrl: result.item(x).targetXMLUrl,
                  noOfVideos: result.item(x).noOfVideos,
                  noOfActivities: result.item(x).noOfActivities,
                  pageCount: result.item(x).pageCount,
                  lastUsedTime: result.item(x).lastUsedTime
                }
                this.bookMap.set(book.bookId, book);
              }
              resolve(this.bookMap);
            },
            error => {
              console.error('ERROR in getting book map', error);
              reject(error);
            }
          )
      }
    })
  }

  getPages(bookId: string): Promise<any> {

    return this.query('select pageId, bookId, imageUrl, contentType, contentUrl from mypages where bookId = ?', [bookId]).then(
      data => {
        let result = data.res.rows;
        console.log("get pages result count: " + result.length);
        let pages: PageEntity[] = [];
        for (var x = 0; x < result.length; x++) {
          pages.push({
            pageId: result.item(x).pageId,
            bookId: result.item(x).bookId,
            imageUrl: result.item(x).imageUrl,
            contentType: result.item(x).contentType,
            contentUrl: result.item(x).contentUrl
          })
        }
        return pages;
      },
      error => {
        console.error('ERROR in getting pages', error);
      }
    )
  }

  getDatabaseState() {
    return this.databaseReady.asObservable();
  }

  query(query: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        this.storage.transaction((tx: any) => {
          tx.executeSql(query, params,
            (tx: any, res: any) => resolve({ tx: tx, res: res }),
            (tx: any, err: any) => reject({ tx: tx, err: err }));
        },
          (err: any) => {
            console.log('error executing query' + query + " : ", err)
            reject({ err: err })
          }
        );
      } catch (err) {
        reject({ err: err });
      }
    });
  }

  public updateLastUsedTime(bookId: string): Promise<any> {
    let now: number = new Date().getTime();
    console.log("updating last used time for " + bookId);
    return this.query("UPDATE mybooks SET lastUsedTime = ? WHERE bookId = ?", [now, bookId]).then(
      () => {
        //update value in cache
        let book = this.bookMap.get(bookId);
        if (book) {
          book.lastUsedTime = now;
          console.log("updated last used time in cache for " + bookId);
        }
      })
  }

  public deleteBook(bookId: string): Promise<any> {
    console.log("deleting all pages of the book " + bookId);
    return this.query("DELETE FROM mypages WHERE bookId = ?", [bookId]).then(
      () => {
        console.log("OK.. deleting book now");
        return this.query("DELETE FROM mybooks WHERE bookId = ?", [bookId]).then(
          () => {
            //delete from cache
            if (this.bookMap.has(bookId)) {
              this.bookMap.delete(bookId);
              console.log("deleted from cache: " + bookId);
            }
          }
        )
      }
    )
  }

  public deletePages(pages: PageEntity[]): Promise<any> {
    let paramString: string = "";
    let pageIds: string[] = [];
    pages.forEach((page) => {
      pageIds.push(page.pageId);
      paramString = paramString.concat("?,");
    });
    //remove trailing comma
    paramString = paramString.substring(0, paramString.length - 1);

    let deleteQuery: string = "DELETE FROM mypages WHERE pageId IN (" + paramString + ")";
    console.log(`Deleting page(s) ${pages} with query ${deleteQuery}`);

    return this.query(deleteQuery, pageIds).then(
      () => {
        console.log("update page count for book " + pages[0].bookId);
        return this.query("UPDATE mybooks SET pageCount = pageCount - " + pages.length + " where bookId = ?", [pages[0].bookId]).then(
          () => {
            //update in cache
            console.log("updating page count in cache");
            let book = this.bookMap.get(pages[0].bookId);
            if (book) {
              book.pageCount = book.pageCount - pages.length;
            }
          }
        )
      }
    )
  }

  populateDBQueries() {
    this.dbQueries.set(1, [
      {
        query: 'CREATE TABLE IF NOT EXISTS mybooks (' +
          'bookId text primary key, title text, imageUrl text, publisherName text, schoolClass text, ' +
          'subject text, targetDATUrl text, targetXMLUrl text, noOfVideos integer, noOfActivities integer, pageCount integer, lastUsedTime integer)',
        params: []
      },
      {
        query: 'CREATE TABLE IF NOT EXISTS mypages (' +
          'pageId text, bookId text, imageUrl text, contentType text, contentUrl text)',
        params: []
      }
    ]);
  }
}
