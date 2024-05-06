import { FormErrors, IOrder, IOrderData, IOrderForm } from '../../types';
import { Model } from '../base/Model';

export class OrderData extends Model<IOrder> implements IOrder {
	_order: IOrderData = {
		items: [],
		address: '',
		email: '',
		phone: '',
		payment: '',
		total: 0,
	};
	formErrors: FormErrors = {};

	get order(): IOrderData {
		return this._order;
	}

	setProducts(items: string[]) {
		this._order.items = items;
	}

	setTotalPrice(value: number) {
		this._order.total = value;
	}

	clearOrderData(): void {
		this._order = {
			items: [],
			address: '',
			email: '',
			phone: '',
			payment: '',
			total: 0,
		};
	}

	setOrderField(field: keyof IOrderForm, value: string) {
		this._order[field] = value;

		if (this.validateOrder()) {
			this.events.emit('order:ready', this.order);
		}
	}

	validateOrder() {
		const errors: typeof this.formErrors = {};
		const regexEmail = /^[^@]+@\w+(\.\w+)+\w$/;
		const regexPhone = /^((8|\+7)[\- ]?)?(\(?\d{3}\)?[\- ]?)?[\d\- ]{7,10}$/;

		if (!this._order.payment) {
			errors.payment = 'Необходимо выбрать способ оплаты';
		}

		if (!this._order.address) {
			errors.address = 'Необходимо указать адрес';
		}

		if (!this._order.email) {
			errors.email = 'Необходимо указать Email';
		} else if (!regexEmail.test(this._order.email)) {
			errors.email = 'Необходимо указать валидный Email';
		}

		if (!this._order.phone) {
			errors.phone = 'Необходимо указать телефон';
		} else if (!regexPhone.test(this._order.phone)) {
			errors.email = 'Необходимо указать валидный телефон';
		}

		this.formErrors = errors;
		this.events.emit('formErrors:change', this.formErrors);
		return Object.keys(errors).length === 0;
	}
}
