import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NavParams } from 'ionic-angular';

import { TestUtils } from '~/../test';

import { categoryMock, serviceItemsMock } from '~/core/api/stylist.service.mock';
import { AddServicesComponent } from '~/core/popups/add-services/add-services.component';
import { prepareSharedObjectsForTests } from '~/core/test-utils.spec';

import { AppModule } from '~/app.module';

describe('Pages: AddServicesComponent', () => {
  let fixture: ComponentFixture<AddServicesComponent>;
  let component: AddServicesComponent;

  prepareSharedObjectsForTests();

  beforeEach(async(() =>
    TestUtils.beforeEachCompiler([AddServicesComponent])
      .then(() => {
        fixture = TestBed.createComponent(AddServicesComponent);
        component = fixture.componentInstance;

        AppModule.injector = TestBed;
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
    const selectedService = serviceItemsMock[0];

    const navParams = fixture.debugElement.injector.get(NavParams);
    const params = {
      appointmentUuid: categoryMock.uuid,
      selectedServices: [{ service_uuid: selectedService.uuid }],
      onComplete: jasmine.createSpy('onComplete')
    };
    navParams.data = { data: params };

    await component.ionViewWillLoad();
    fixture.detectChanges();

    const servicesNodes: Node[] = Array.from(
      fixture.nativeElement.querySelectorAll('[data-test-id=service]')
    );

    serviceItemsMock.forEach((service, idx) => {
      const textContent = servicesNodes[idx].textContent;

      expect(textContent)
        .toContain(service.name);
      expect(textContent)
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
    expect(summary.textContent)
      .toContain(`$${selectedService.base_price}`);
    expect(summary.textContent)
      .toContain('Update');

    done();
  });
});
