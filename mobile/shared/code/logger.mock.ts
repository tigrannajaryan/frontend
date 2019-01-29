export class LoggerMock {
  info = jasmine.createSpy('info');
  warn = jasmine.createSpy('warn');
  error = jasmine.createSpy('error');
}
