/**
 * CyberSheetModule.ts
 * 
 * Angular module for Cyber Sheet
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CyberSheetComponent } from './internal';

@NgModule({
  declarations: [CyberSheetComponent],
  imports: [CommonModule],
  providers: [],
  exports: [CyberSheetComponent]
})
export class CyberSheetModule {}
