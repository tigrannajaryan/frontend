import { async, ComponentFixture } from '@angular/core/testing';
import { TestUtils } from 'test';

import { FeedBackComponent, FeedbackComponentParams } from '~/feed-back/feed-back.component';
import { appointmentMock } from '~/core/api/appointments.api.mock';
import { NavController } from 'ionic-angular';


let fixture: ComponentFixture<FeedBackComponent>;
let instance: FeedBackComponent;

describe('Pages: FeedBack', () => {
  beforeEach(
    async(() =>
      TestUtils.beforeEachCompiler([FeedBackComponent])
        .then(compiled => {
          // Common setup:
          fixture = compiled.fixture;
          instance = compiled.instance;

          instance.params = {
            appointment: appointmentMock,
            popAfterSubmit: false
          } as FeedbackComponentParams;
          instance.comment = 'Good stylist';
          instance.thumbsUp = true;

          fixture.detectChanges();
        })
    )
  );

  it('should create the page', () => {
    expect(instance).toBeTruthy();
  });

  it('should have thumbsUp and appropriate titles', () => {
    const feedBack_thumbsUp = fixture.nativeElement.querySelector('[data-test-id=feedBack_thumbsUp]');
    expect(feedBack_thumbsUp).toBeDefined();

    const feedBack_title = fixture.nativeElement.querySelector('[data-test-id=feedBack_title]');
    expect(feedBack_title.innerText).toContain('Good Experience');

    const feedBack_subTitle = fixture.nativeElement.querySelector('[data-test-id=feedBack_subTitle]');
    expect(feedBack_subTitle.innerText).toContain('Thanks for the great feedback!');
  });

  it('should have thumbsDown and appropriate titles', () => {
    instance.thumbsUp = false;
    fixture.detectChanges();

    const feedBack_thumbsUp = fixture.nativeElement.querySelector('[data-test-id=feedBack_thumbsUp]');
    expect(feedBack_thumbsUp).toBeDefined();

    const feedBack_title = fixture.nativeElement.querySelector('[data-test-id=feedBack_title]');
    expect(feedBack_title.innerText).toContain('Bad Experience');

    const feedBack_subTitle = fixture.nativeElement.querySelector('[data-test-id=feedBack_subTitle]');
    expect(feedBack_subTitle.innerText).toContain('Let us know what happened?');
  });

  xit('should be able to add comment', () => {
    spyOn(instance, 'onSubmit').and.callThrough();

    const feedBack_comment = fixture.nativeElement.querySelector('[data-test-id=feedBack_comment] textarea');
    expect(feedBack_comment.innerText).toBe(instance.comment);

    const continueBtn = fixture.nativeElement.querySelector('[data-test-id=continueBtn]');
    expect(continueBtn.innerText).toContain('Submit');
    continueBtn.click();

    expect(instance.onSubmit).toHaveBeenCalled();
  });

  xit('should be able to go back after submit', () => {
    const navCtrl = fixture.debugElement.injector.get(NavController);
    spyOn(instance, 'onSubmit').and.callThrough();
    instance.params.popAfterSubmit = true;
    fixture.detectChanges();

    const continueBtn = fixture.nativeElement.querySelector('[data-test-id=continueBtn]');
    expect(continueBtn.innerText).toContain('Submit');
    continueBtn.click();

    expect(navCtrl.pop).toHaveBeenCalled();
  });

  xit('should be able to go back to root after submit', () => {
    const navCtrl = fixture.debugElement.injector.get(NavController);
    spyOn(instance, 'onSubmit').and.callThrough();

    const continueBtn = fixture.nativeElement.querySelector('[data-test-id=continueBtn]');
    expect(continueBtn.innerText).toContain('Submit');
    continueBtn.click();

    expect(navCtrl.popToRoot).toHaveBeenCalled();
  });
});
