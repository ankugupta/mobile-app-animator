import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { JugnuVideosPage } from './jugnu-videos';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    JugnuVideosPage,
  ],
  imports: [
    IonicPageModule.forChild(JugnuVideosPage),
    PipesModule
  ],
})
export class JugnuVideosPageModule {}
