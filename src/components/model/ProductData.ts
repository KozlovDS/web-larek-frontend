import { IProduct, IProductData } from '../../types';
import { Model } from '../base/Model';

export class ProductData extends Model<IProductData> {
	protected _products: IProduct[];
	protected _preview: string | null;

	set products(products: IProduct[]) {
		this._products = products;
		this.emitChanges('products:changed', { catalog: this._products });
	}

	get products() {
		return this._products;
	}

	getProduct(productId: string): IProduct {
		return this._products.find((item) => item.id === productId);
	}

	set preview(productId: string | null) {
		if (!productId) {
			this._preview = null;
			return;
		}
		const selectedProduct = this.getProduct(productId);
		if (selectedProduct) {
			this._preview = productId;
			this.emitChanges('preview:changed', selectedProduct);
		}
	}

	get preview() {
		return this._preview;
	}
}
