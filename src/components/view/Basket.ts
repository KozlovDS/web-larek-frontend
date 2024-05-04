import { Component } from '../base/Component';
import { createElement, ensureElement, formatNumber } from '../../utils/utils';
import { EventEmitter } from '../base/events';

interface IBasketView {
	products: HTMLElement[];
	total: number;
}

export class Basket extends Component<IBasketView> {
	protected _products: HTMLElement;
	protected _total: HTMLElement;
	protected _button: HTMLElement;

	constructor(container: HTMLElement, protected events: EventEmitter) {
		super(container);

		this._products = ensureElement<HTMLElement>(
			'.basket__list',
			this.container
		);
		this._total = this.container.querySelector('.basket__price');
		this._button = this.container.querySelector('.basket__button');

		if (this._button) {
			this._button.addEventListener('click', () => {
				events.emit('order:open');
			});
		}
	}

	set products(items: HTMLElement[]) {
		if (items.length) {
			this._products.replaceChildren(...items);
			this.setDisabled(this._button, false);
		} else {
			this._products.replaceChildren(
				createElement<HTMLParagraphElement>('p', {
					textContent: 'Корзина пуста',
				})
			);
			this.setDisabled(this._button, true);
		}
	}

	set total(total: number) {
		this.setText(this._total, formatNumber(total));
	}
}