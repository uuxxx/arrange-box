import { InputItem } from './types';

export class ArrangeBoxElement {
  private _focused = false;
  get focused() {
    return this._focused;
  }

  private _id!: string;
  get id() {
    return this._id;
  }

  private _name!: string;
  get name() {
    return this._name;
  }

  private _$el!: HTMLElement;
  get node() {
    return this._$el;
  }

  constructor(el: InputItem) {
    this._id = el.id;
    this._name = el.name;
    this.initialize(el.node);
  }

  append(parentContainer: HTMLElement) {
    parentContainer.appendChild(this._$el);
  }

  prepend(parentContainer: HTMLElement) {
    parentContainer.prepend(this._$el);
  }
  remove(parentContainer: HTMLElement) {
    parentContainer.removeChild(this._$el);
  }

  focus() {
    this._$el.classList.add('focused');
    this._focused = true;
  }

  unfocus() {
    this._$el.classList.remove('focused');
    this._focused = false;
  }

  hide() {
    this._$el.style.display = 'none';
  }

  show() {
    this._$el.style.display = 'block';
  }

  private initialize($el: HTMLElement | string) {
    const $li = document.createElement('li');
    $li.classList.add('pick-list__item');
    $li.setAttribute('data-id', this._id);
    if (typeof $el === 'string') {
      $li.textContent = $el;
    } else {
      $li.appendChild($el);
    }
    this._$el = $li;
  }
}
