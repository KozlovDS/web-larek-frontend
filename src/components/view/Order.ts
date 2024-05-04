import { Form } from './Form';
import { IOrderForm } from '../../types';
import { IEvents } from '../base/events';
import { ensureAllElements } from '../../utils/utils';

export class Order extends Form<IOrderForm> {
	protected _payment: HTMLButtonElement[];

	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);
		this._payment = ensureAllElements<HTMLButtonElement>(
			'.button_alt',
			container
		);

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
				button.classList.remove('button_alt-active');
			}
		});
	}

	set phone(value: string) {
		(this.container.elements.namedItem('phone') as HTMLInputElement).value =
			value;
	}

	set email(value: string) {
		(this.container.elements.namedItem('email') as HTMLInputElement).value =
			value;
	}

	set address(value: string) {
		(this.container.elements.namedItem('address') as HTMLInputElement).value =
			value;
	}
}
