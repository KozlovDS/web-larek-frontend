import { Form } from './Form';
import { IOrderForm } from '../../types';
import { IEvents } from '../base/Events';
import { ensureAllElements } from '../../utils/utils';

export class OrderForm extends Form<IOrderForm> {
	protected _payment: HTMLButtonElement[];
	protected _phone: HTMLInputElement;
	protected _email: HTMLInputElement;
	protected _address: HTMLInputElement;

	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);
		this._payment = ensureAllElements<HTMLButtonElement>(
			'.button_alt',
			container
		);
		this._phone = this.container.elements.namedItem(
			'phone'
		) as HTMLInputElement;
		this._email = this.container.elements.namedItem(
			'email'
		) as HTMLInputElement;
		this._address = this.container.elements.namedItem(
			'address'
		) as HTMLInputElement;

		if (this._payment) {
			this._payment.forEach((button) => {
				button.addEventListener('click', () => {
					this.paymentSelected = button.name;
				});
			});
		}
	}

	set paymentSelected(name: string) {
		this._payment.forEach((button) => {
			this.toggleClass(button, 'button_alt-active', button.name === name);
			this.events.emit(`payment:select`, { payment: name });
		});
	}

	paymentSelectedRemove() {
		this._payment.forEach((button) => {
			if (button.classList.contains('button_alt-active')) {
				this.toggleClass(button, 'button_alt-active', false);
			}
		});
	}

	set phone(value: string) {
		this._phone.value = value;
	}

	set email(value: string) {
		this._email.value = value;
	}

	set address(value: string) {
		this._address.value = value;
	}
}
