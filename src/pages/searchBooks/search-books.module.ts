import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SearchBooksPage } from './search-books';

@NgModule({
  declarations: [
    SearchBooksPage,
  ],
  imports: [
    IonicPageModule.forChild(SearchBooksPage),
  ],
})
export class SearchBooksPageModule { }
