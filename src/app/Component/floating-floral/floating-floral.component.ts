import { Component, Input } from '@angular/core';

type Position = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

@Component({
  selector: 'app-floating-floral',
  standalone: true,
  templateUrl: './floating-floral.component.html',
  styleUrls: ['./floating-floral.component.scss'],
})
export class FloatingFloralComponent {

  @Input("position") position:Position = 'top-right';
  @Input("size") size:number = 96;
  @Input("color") color:string = '#D4AF37';

  constructor() { }

}
