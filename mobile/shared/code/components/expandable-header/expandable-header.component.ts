import { Component, ElementRef, Input, OnInit, Renderer } from '@angular/core';
import { IonScroll } from 'ionic-angular';

enum ScrollDirection {
  Up = 'up',
  Down = 'down'
}

@Component({
  selector: '[expandableHeader]',
  templateUrl: 'expandable-header.component.html'
})
export class ExpandableHeaderComponent implements OnInit {

  @Input() scrollArea: IonScroll;

  private scrollContent: HTMLElement;

  constructor(
    public element: ElementRef,
    public renderer: Renderer
  ) {
  }

  ngOnInit(): void {
    this.scrollArea.ionScroll.subscribe(event => this.resizeHeader(event));

    // Access native element of the scrollArea with hidden prop because of no alternative:
    this.scrollContent = this.scrollArea._elementRef.nativeElement;

  }

  resizeHeader(event): void {
    event.domWrite(() => {

      switch (event.directionY) {
        case ScrollDirection.Down:
          this.element.nativeElement.classList.add('is-Minified');
          this.scrollContent.classList.add('is-Minified');
          break;

        case ScrollDirection.Up:
          this.element.nativeElement.classList.remove('is-Minified');
          this.scrollContent.classList.remove('is-Minified');
          break;

        default:
          break;
      }
    });
  }
}
