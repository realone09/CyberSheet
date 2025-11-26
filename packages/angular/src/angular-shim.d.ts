declare module '@angular/core' {
  export function Component(config: any): any;
  export function Injectable(config: any): any;
  export function NgModule(config: any): any;
  export function Input(): any;
  export function Output(): any;
  export function ViewChild(selector: string, config: any): any;
  export class ElementRef<T = any> {
    nativeElement: T;
  }
  export class EventEmitter<T = any> {
    emit(value: T): void;
  }
  export interface OnInit {
    ngOnInit(): void | Promise<void>;
  }
  export interface OnDestroy {
    ngOnDestroy(): void;
  }
}

declare module '@angular/common' {
  export const CommonModule: any;
}
