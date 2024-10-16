import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErreurLienExpireComponent } from './erreur-lien-expire.component';

describe('ErreurLienExpireComponent', () => {
  let component: ErreurLienExpireComponent;
  let fixture: ComponentFixture<ErreurLienExpireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ErreurLienExpireComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ErreurLienExpireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
