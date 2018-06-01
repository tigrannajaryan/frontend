import { Component, Input } from '@angular/core';

interface ToStringable {
  toString(): string;
}

export interface TableData {
  header?: ToStringable[];
  body: ToStringable[][];
}

@Component({
  selector: 'made-table',
  templateUrl: 'made-table.html'
})
export class MadeTableComponent {
  @Input() data: TableData;
}
