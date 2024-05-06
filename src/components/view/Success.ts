import { formatNumber } from '../../utils/utils';
import { Component } from '../base/Component';
import { IEvents } from '../base/Events';

interface ISuccess {
	total: number;
}

export class Success extends Component<ISuccess> {
	protected _total: HTMLElement;
	protected button: HTMLElement;

	constructor(container: HTMLElement, events: IEvents) {
		super(container);
		this._total = container.querySelector('.order-success__description');
		this.button = container.querySelector('.order-success__close');

		this.button.addEventListener('click', () => {
			events.emit('success:close');
		});
	}

	set total(value: number) {
		this.setText(this._total, `Списано ${formatNumber(value)} синапсов`);
	}
}
