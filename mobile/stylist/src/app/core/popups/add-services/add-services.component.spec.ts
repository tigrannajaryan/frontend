import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NavParams } from 'ionic-angular';

import { TestUtils } from '~/../test';

import { categoryMock, serviceItemsMock } from '~/core/api/stylist.service.mock';
import { prepareSharedObjectsForTests } from '~/core/test-utils.spec';

import { AppModule } from '~/app.module';

import { AddServicesComponent } from './add-services.component';

describe('Pages: AddServicesComponent', () => {
  let fixture: ComponentFixture<AddServicesComponent>;
  let component: AddServicesComponent;

  const selectedService = serviceItemsMock[0];
  const params = {
    appointmentUuid: categoryMock.uuid,
    selectedServices: [{ service_uuid: selectedService.uuid }],
    onComplete: jasmine.createSpy('onComplete')
  };

  prepareSharedObjectsForTests();

  beforeEach(async(() =>
    TestUtils.beforeEachCompiler([AddServicesComponent])
      .then(() => {
        fixture = TestBed.createComponent(AddServicesComponent);
        component = fixture.componentInstance;

        AppModule.injector = TestBed;

        const navParams = fixture.debugElement.injector.get(NavParams);
        navParams.data = { params };
      })
  ));

  it('should create the component', () => {
    expect(component)
      .toBeTruthy();
  });

  it('should show correct title', () => {
    expect(fixture.nativeElement.textContent)
      .toContain('Select Service');
  });

  it('should show services with selected one and summary', async done => {
    await component.ionViewWillLoad();
    fixture.detectChanges();

    const servicesNodes: Node[] = Array.from(
      fixture.nativeElement.querySelectorAll('[data-test-id=service]')
    );

    serviceItemsMock.forEach((service, idx) => {
      const textContent = servicesNodes[idx].textContent;

      expect(textContent)
        .toContain(service.name);
      expect(textContent.replace(',', ''))
        .toContain(`$${service.base_price}`);

      if (idx === serviceItemsMock.indexOf(selectedService)) {
        expect(textContent)
          .toContain('Selected');
      } else {
        expect(textContent)
          .toContain('Select');
      }
    });

    const summary = fixture.nativeElement.querySelector('[data-test-id=summary]');

    expect(summary.textContent)
      .toContain('1 Service');
    expect(summary.textContent.replace(',', ''))
      .toContain(`$${selectedService.base_price}`);
    expect(summary.textContent)
      .toContain('Update');

    done();
  });

  it('should call onComplete', async done => {
    await component.ionViewWillLoad();
    fixture.detectChanges();

    fixture.nativeElement.querySelector('[data-test-id=submit]').click();

    expect(params.onComplete)
      .toHaveBeenCalledWith([{
        service_uuid: selectedService.uuid,
        service_name: selectedService.name,
        client_price: 0,
        regular_price: selectedService.base_price,
        is_original: true
      }]);

    done();
  });
});
