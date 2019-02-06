import { Directive, ElementRef, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { Content } from 'ionic-angular';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[madeScrollTop]'
})

export class MadeScrollTopDirective implements OnInit, OnDestroy {
  @Input('madeScrollTop') madeScrollTop: Content;

  private contentScrollSub: Subscription;

  @HostListener('click', ['$event.target'])
  onClick(): void {
    this.madeScrollTop.scrollToTop(800);
  }

  constructor(private element: ElementRef) {
    // scroll to top button should be hidden by default
    this.element.nativeElement.style.display = 'none';
  }

  ngOnInit(): void {
    if (this.madeScrollTop && this.madeScrollTop.ionScroll) {
      this.contentScrollSub = this.madeScrollTop.ionScroll.subscribe(data => {
        if (data && data.contentHeight && data.scrollTop) {
          const isVisible = data.contentHeight < data.scrollTop;
          this.element.nativeElement.style.display = isVisible ? 'block' : 'none';
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.contentScrollSub.unsubscribe();
  }
}
