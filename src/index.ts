import { BasketData } from './components/model/BasketData';
import { Modal } from './components/view/Modal';
import { Page } from './components/view/Page';
import { ProductAPI } from './components/base/ProductAPI';
import { ProductData } from './components/model/ProductData';
import { ProductUI } from './components/view/ProductUI';
import { EventEmitter } from './components/base/events';
import './scss/styles.scss';
import {
	IOrderContactForm,
	IOrderForm,
	IOrderPaymentForm,
	IProduct,
} from './types';
import { API_URL, CDN_URL } from './utils/constants';
import { cloneTemplate, ensureElement } from './utils/utils';
import { Basket } from './components/view/Basket';
import { Order } from './components/view/Order';
import { OrderData } from './components/model/OrderData';
import { Success } from './components/view/Success';

const events = new EventEmitter();
const api = new ProductAPI(CDN_URL, API_URL);

// Все шаблоны
const successTemplate = ensureElement<HTMLTemplateElement>('#success');
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');

// Глобальные контейнеры
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

const productData = new ProductData({}, events);
const basketData = new BasketData({}, events);
const orderData = new OrderData({}, events);
const basket = new Basket(cloneTemplate(basketTemplate), events);
const order = new Order(cloneTemplate(orderTemplate), events);
const orderContacts = new Order(cloneTemplate(contactsTemplate), events);

events.onAll((event) => {
	console.log(event.eventName, event.data);
});

// Получаем продукты с сервера
api
	.getProductList()
	.then((res) => {
		productData.products = res;
	})
	.catch((err) => {
		console.error(err);
	});

//Выводим продукты на экран
events.on('products:changed', () => {
	page.products = productData.products.map((item) => {
		const product = new ProductUI(
			cloneTemplate(cardCatalogTemplate),
			basketData.checkProductInBasket(item),
			item,
			events,
			{
				onClick: () => events.emit('product:select', item),
			}
		);
		return product.render(item);
	});
});

// Открыть продукт
events.on('product:select', (item: IProduct) => {
	productData.preview = item.id;
});

events.on('preview:changed', (item: IProduct) => {
	if (item) {
		const product = new ProductUI(
			cloneTemplate(cardPreviewTemplate),
			basketData.checkProductInBasket(item),
			item,
			events
		);
		modal.render({
			content: product.render(item),
		});
	} else {
		modal.close();
	}
});

// Блокируем прокрутку страницы если открыта модалка
events.on('modal:open', () => {
	page.locked = true;
});

// ... и разблокируем
events.on('modal:close', () => {
	page.locked = false;
});

// Открыть корзину
events.on('basket:open', () => {
	modal.render({
		content: basket.render(),
	});
});

basket.products = []; // для вывода сообщения "Корзина пуста"

// Изменения в корзине
events.on('basket:changed', () => {
	page.counter = basketData.totalProducts;
	basket.total = basketData.totalPrise;

	basket.products = Array.from(basketData.getProductsInBasket()).map(
		(basketItem, index) => {
			const item = Array.from(basketData.getProductsInBasket()).find(
				(productItem) => productItem.id === basketItem.id
			);
			const product = new ProductUI(
				cloneTemplate(cardBasketTemplate),
				true,
				item,
				events,
				{
					onClick: () => events.emit('basket:changed'),
				}
			);
			product.productIndex = String(index + 1);
			return product.render(item);
		}
	);
});

//добавление товара в корзину
events.on('basket:add', (item: IProduct) => {
	basketData.setProductsInBasket(item);
	events.emit('basket:changed');

	const cardBasket = new ProductUI(
		cloneTemplate(cardPreviewTemplate),
		basketData.checkProductInBasket(item),
		item,
		events
	);
	modal.render({ content: cardBasket.render(item) });
});

//Удаление товара в корзине из модального окна товара
events.on('preview:delete', (item: IProduct) => {
	basketData.delete(item);
	const cardBasket = new ProductUI(
		cloneTemplate(cardPreviewTemplate),
		basketData.checkProductInBasket(item),
		item,
		events
	);
	modal.render({ content: cardBasket.render(item) });
});

// Удаление товара из корзины
events.on('basket:delete', (item: IProduct) => {
	basketData.delete(item);
});

//Оформление заказа
events.on('order:open', () => {
	modal.render({
		content: order.render({
			address: '',
			payment: '',
			valid: false,
			errors: [],
		}),
	});
});

events.on('order:submit', () => {
	modal.render({
		content: orderContacts.render({
			phone: '',
			email: '',
			valid: false,
			errors: [],
		}),
	});
});

// Изменилось состояние валидации формы
events.on('formErrors:change', (errors: Partial<IOrderForm>) => {
	const { address, payment } = errors;
	order.valid = !address && !payment;
	order.errors = Object.values({ address, payment })
		.filter((i) => !!i)
		.join('; ');
});

events.on('formErrors:change', (errors: Partial<IOrderForm>) => {
	const { email, phone } = errors;
	orderContacts.valid = !email && !phone;
	orderContacts.errors = Object.values({ email, phone })
		.filter((i) => !!i)
		.join('; ');
});

//Выбрали способ оплаты
events.on('payment:select', (name: IOrderPaymentForm) => {
	orderData.setOrderField('payment', name.payment);
});

// Изменилось одно из полей
events.on(
	/^order\..*:change/,
	(data: { field: keyof IOrderPaymentForm; value: string }) => {
		orderData.setOrderField(data.field, data.value);
	}
);

events.on(
	/^contacts\..*:change/,
	(data: { field: keyof IOrderContactForm; value: string }) => {
		orderData.setOrderField(data.field, data.value);
	}
);

// Сделали заказ
events.on('contacts:submit', () => {
	orderData.setProducts(
		basketData.getProductsInBasket().map((item) => item.id)
	);
	orderData.setTotalPrice(basketData.totalPrise);

	api
		.order(orderData.order)
		.then(() => {
			const success = new Success(cloneTemplate(successTemplate), events);
			success.total = basketData.totalPrise;
			modal.render({
				content: success.render({}),
			});
			basketData.clearBasket();
			order.paymentSelectedRemove();
			orderData.clearOrderData();
			events.emit('basket:changed');
		})
		.catch((err) => {
			console.error(err);
		});
});

events.on('success:close', () => {
	modal.close();
});
