import { IonicPageModule } from 'ionic-angular';

import { NgModule } from '@angular/core';

import { BookFilterPage } from './book-filter';

@NgModule({
  declarations: [
    BookFilterPage,
  ],
  imports: [
    IonicPageModule.forChild(BookFilterPage),
  ],
})
export class BookFilterPageModule { }
