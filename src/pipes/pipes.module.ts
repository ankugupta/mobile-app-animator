import { NgModule } from '@angular/core';
import { NormalizedPipe } from './normalized/normalized';
@NgModule({
	declarations: [NormalizedPipe],
	imports: [],
	exports: [NormalizedPipe]
})
export class PipesModule {}
