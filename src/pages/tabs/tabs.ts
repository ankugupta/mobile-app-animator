import { Component } from '@angular/core';

import { AboutPage } from '../about/about';
import { MyBooksPage } from '../myBooks/myBooks';
import { SearchBooksPage } from '../searchBooks/searchBooks';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = SearchBooksPage;
  tab2Root = MyBooksPage;
  tab3Root = AboutPage;

  constructor() {

  }
}
