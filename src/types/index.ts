export interface IProduct {
	id: string;
	description: string;
	image: string;
	title: string;
	category: string;
	price: number;
}

export interface IProductData {
	products: IProduct[];
	preview: string | null;
	getProduct(productId: string): IProduct;
	setProducts(products: IProduct[]): void;
}

export interface IBasketData {
	totalProducts: number;
	totalPrise: number;
	delete(product: IProduct): void;
	getProductsInBasket(): IProduct[];
	setProductsInBasket(product: IProduct): void;
	checkProductInBasket(item: IProduct): boolean;
	clearBasket(): void;
}

export interface IOrderContactForm {
	email: string;
	phone: string;
}

export interface IOrderPaymentForm {
	payment: string;
	address: string;
}

export interface IOrderForm extends IOrderContactForm, IOrderPaymentForm {}

export interface IOrderData extends IOrderForm {
	items: string[];
	total: number;
}

export interface IOrder {
	_order: IOrderData;
	setProducts(items: string[]): void;
	clearOrderData(): void;
	setOrderField(field: keyof IOrderForm, value: string): void;
	validateOrder(): boolean;
}

export type FormErrors = Partial<Record<keyof IOrderData, string>>;

export interface IOrderResult {
	id: string;
	total: number;
}
