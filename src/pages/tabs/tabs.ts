import { Component } from '@angular/core';
import { IonicPage } from 'ionic-angular';
import * as PageConstants from '../pages.constants';

@IonicPage()
@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {
  tab1Root = PageConstants.SEARCH_BOOKS_PAGE;
  tab2Root = PageConstants.MY_BOOKS_PAGE;
  tab3Root = PageConstants.MORE_PAGE;

  constructor() {

  }
}
