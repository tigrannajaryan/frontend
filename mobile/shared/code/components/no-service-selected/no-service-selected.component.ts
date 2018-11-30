import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'no-service-selected',
  templateUrl: 'no-service-selected.component.html'
})
export class NoServiceSelectedComponent {
  @Output() addServiceClick = new EventEmitter();

  onAddService(): void {
    this.addServiceClick.emit();
  }
}
