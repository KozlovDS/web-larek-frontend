import { IProduct } from '../../types';
import { formatNumber } from '../../utils/utils';
import { Component } from '../base/Component';
import { IEvents } from '../base/Events';

interface ICardActions {
	onClick: (event: MouseEvent) => void;
}

export class ProductUI extends Component<IProduct> {
	protected productId: string;
	protected _title: HTMLElement;
	protected _image: HTMLImageElement;
	protected _description: HTMLElement;
	protected _price: HTMLElement;
	protected _category: HTMLElement;
	protected _productIndex: HTMLElement;
	protected _button: HTMLButtonElement;
	protected deleteButton: HTMLButtonElement;
	protected categorySkills = <Record<string, string>>{
		'софт-скил': 'soft',
		другое: 'other',
		'хард-скил': 'hard',
		дополнительное: 'additional',
		кнопка: 'button',
	};

	constructor(
		element: HTMLElement,
		productInBasket: boolean,
		product: IProduct,
		events: IEvents,
		actions?: ICardActions
	) {
		super(element);
		this._title = element.querySelector('.card__title');
		this._image = element.querySelector('.card__image');
		this._price = element.querySelector('.card__price');
		this._category = element.querySelector('.card__category');
		this._productIndex = element.querySelector('.basket__item-index');
		this._button = element.querySelector('.button');
		this._description = element.querySelector('.card__text');
		this.deleteButton = element.querySelector('.basket__item-delete');

		if (actions?.onClick) {
			if (this._button) {
				this._button.addEventListener('click', actions.onClick);
			} else {
				element.addEventListener('click', actions.onClick);
			}
		}

		if (this._button) {
			if (productInBasket) {
				this.setText(this._button, 'Убрать');
				this._button.addEventListener('click', () => {
					events.emit('preview:delete', product);
				});
			} else {
				this.setText(this._button, 'Купить');
				this._button.addEventListener('click', () => {
					events.emit('basket:add', product);
				});
			}
		}

		if (this.deleteButton) {
			this.deleteButton.addEventListener('click', () => {
				events.emit('basket:delete', product);
				// this.deleteButton.textContent = null;
			});
		}

		if (product.price === null) {
			this.setDisabled(this._button, true);
			this.setText(this._button, 'Товар бесценен');
		}
	}

	set title(name: string) {
		this.setText(this._title, name);
	}

	set image(value: string) {
		this.setImage(this._image, value, this.title);
	}

	set price(value: number | null) {
		let price = value === null ? 'Бесценно' : `${formatNumber(value)} синапсов`;
		this.setText(this._price, price);
	}

	set description(value: string) {
		this.setText(this._description, value);
	}

	set buttonText(value: string) {
		this.setText(this._button, value);
	}

	set category(value: string) {
		this._category?.classList.add(
			`card__category_${this.categorySkills[value]}`
		);
		this.setText(this._category, value);
	}

	set productIndex(value: string) {
		this.setText(this._productIndex, value);
	}

	get productIndex(): string {
		return this._productIndex.textContent || '';
	}

	set id(id) {
		this.productId = id;
	}

	get id() {
		return this.productId;
	}
}
