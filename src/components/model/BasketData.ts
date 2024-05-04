import { IBasketData, IProduct } from '../../types';
import { ProductData } from './ProductData';

export class BasketData extends ProductData implements IBasketData {
	protected _productsInBasket: IProduct[] = [];
	protected _totalProducts: number;

	setProductsInBasket(product: IProduct) {
		if (!this._productsInBasket.some((item) => item.id === product.id)) {
			this._productsInBasket.push(product);
		}
	}

	getProductsInBasket(): IProduct[] {
		return this._productsInBasket;
	}

	get totalProducts(): number {
		return this._productsInBasket.length;
	}

	get totalPrise(): number {
		return this._productsInBasket.reduce((total, product) => {
			return total + (product.price || 0);
		}, 0);
	}

	checkProductInBasket(item: IProduct): boolean {
		return this._productsInBasket.some((product) => product.id === item.id);
	}

	delete(item: IProduct) {
		this._productsInBasket = this._productsInBasket.filter(
			(product) => product.id !== item.id
		);
	}

	clearBasket() {
		this._productsInBasket.length = 0;
		this._totalProducts = 0;
	}
}
