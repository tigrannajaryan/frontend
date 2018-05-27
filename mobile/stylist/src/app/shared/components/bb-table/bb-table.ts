import { Component, Input } from '@angular/core';

interface ToStringable {
  toString(): string;
}

export interface TableData {
  header?: Array<ToStringable>;
  body: Array<Array<ToStringable>>
}

@Component({
  selector: 'bb-table',
  templateUrl: 'bb-table.html'
})
export class BbTable {
  @Input() data: TableData;
}
