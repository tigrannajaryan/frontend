import { Component, ElementRef, EventEmitter, Input, OnInit, Output, Renderer } from '@angular/core';
import { Content } from 'ionic-angular';

enum ScrollDirection {
  Up = 'up',
  Down = 'down'
}

interface IonicScrollEvent { // not defined in Ionic
  directionY: string;
  scrollTop: number;

  domWrite(handler: () => void): void;
}

@Component({
  selector: '[expandableHeader]',
  templateUrl: 'expandable-header.component.html'
})
export class ExpandableHeaderComponent implements OnInit {
  static SCROLLING_DELAY = 400;

  @Input() scrollArea: Content;
  @Output() minified = new EventEmitter<void>();

  private scrollContent: HTMLElement;

  constructor(
    public element: ElementRef,
    public renderer: Renderer
  ) {
  }

  ngOnInit(): void {
    this.scrollArea.ionScroll
      .throttleTime(ExpandableHeaderComponent.SCROLLING_DELAY)
      .subscribe(event => this.resizeHeader(event));

    // Access native element of the scrollArea with hidden prop because of no alternative:
    this.scrollContent = this.scrollArea._elementRef.nativeElement;
  }

  resizeHeader(event: IonicScrollEvent): void {
    event.domWrite(this.update(event));
  }

  private update = (event: IonicScrollEvent) => () => {

    switch (event.directionY) {
      case ScrollDirection.Down:
        if (event.scrollTop < 0) {
          // Skip iOS smooth innertive scrolling
          return;
        }
        this.element.nativeElement.classList.add('is-Minified');
        this.scrollContent.classList.add('is-Minified');
        this.minified.emit();
        break;

      case ScrollDirection.Up:
        this.element.nativeElement.classList.remove('is-Minified');
        this.scrollContent.classList.remove('is-Minified');
        break;

      default:
        break;
    }
  };
}
