import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalTarefa } from './modal-tarefa';

describe('ModalTarefa', () => {
  let component: ModalTarefa;
  let fixture: ComponentFixture<ModalTarefa>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalTarefa],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalTarefa);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
