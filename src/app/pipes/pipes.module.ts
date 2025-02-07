import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomSortPipe } from './custom-sort.pipe';



@NgModule({
  declarations: [CustomSortPipe],
  imports: [
    CommonModule
  ],
  exports: [CustomSortPipe]
})
export class PipesModule { }
