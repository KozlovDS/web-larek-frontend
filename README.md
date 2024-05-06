# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:

- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:

- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск

Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```

## Сборка

```
npm run build
```

или

```
yarn build
```

## Данные и типы данных, используемые в приложении

Карточка товара

```
export interface IProduct {
	id: string;
	description: string;
	image: string;
	title: string;
	category: string;
	price: number;
}
```

Интерфейс модели данных товаров

```
export interface IProductData {
	products: IProduct[];
	preview: string | null;
	getProduct(productId: string): IProduct;
	setProducts(products: IProduct[]): void;
}
```

Интерфейс модели данных корзины

```
export interface IBasketData {
	totalProducts: number;
	totalPrise: number;
	delete(product: IProduct): void;
	getProductsInBasket(): IProduct[];
	setProductsInBasket(product: IProduct): void;
	checkProductInBasket(item: IProduct): boolean;
	clearBasket(): void;
}
```

Данные с форм заказа

```
export interface IOrderContactForm {
	email: string;
	phone: string;
}

export interface IOrderPaymentForm {
	payment: string;
	address: string;
}

export interface IOrderForm extends IOrderContactForm, IOrderPaymentForm {}
```

Итоговые данные заказа

```
export interface IOrderData extends IOrderForm {
	items: string[];
	total: number;
}
```

Интерфейс модели заказа

```
export interface IOrder {
	_order: IOrderData;
	setProducts(items: string[]): void;
	clearOrderData(): void;
	setOrderField(field: keyof IOrderForm, value: string): void;
	validateOrder(): boolean;
}
```

Тип ошибок формы

```
export type FormErrors = Partial<Record<keyof IOrderData, string>>;
```

Интерфейс ответа сервера после заказа

```
export interface IOrderResult {
	id: string;
	total: number;
}
```

## Архитектура приложения

### Об архитектуре

Взаимодействия внутри приложения происходят через события. Модели инициализируют события, слушатели событий в основном коде выполняют передачу данных компонентам отображения, а также вычислениями между этой передачей, и еще они меняют значения в моделях.

Код приложения разделен на слои согласно парадигме MVP:

- слой представления, отвечает за отображение данных на странице,
- слой данных, отвечает за хранение и изменение данных
- презентер, отвечает за связь представления и данных.

### Базовый код

#### Класс Api

Содержит в себе базовую логику отправки запросов. Конструктор
`constructor(baseUrl: string, options: RequestInit = {})`- принимает базовый URL и глобальные опции для всех запросов(опционально).

В полях класса хранятся следующие данные:

- baseUrl: string - базовый URL
- options: RequestInit - опции

Методы:

- `get` - выполняет GET запрос на переданный в параметрах ендпоинт и возвращает промис с объектом, которым ответил сервер
- `post` - принимает объект с данными, которые будут переданы в JSON в теле запроса, и отправляет эти данные на ендпоинт переданный как параметр при вызове метода. По умолчанию выполняется `POST` запрос, но метод запроса может быть переопределен заданием третьего параметра при вызове.

Типы:

- type ApiPostMethods = 'POST' | 'PUT' | 'DELETE' - метод отправки запроса

#### Класс EventEmitter

Брокер событий позволяет отправлять события и подписываться на события, происходящие в системе. Класс используется в презентере для обработки событий и в слоях приложения для генерации событий.  
Конструктор `constructor() {this._events = new Map<EventName, Set<Subscriber>>();}` - принимает коллекцию для хранения данных любого типа в виде пар [ключ, значение].
Основные методы, реализуемые классом описаны интерфейсом `IEvents`:

- `on` - подписка на событие
- `emit` - инициализация события
- `trigger` - возвращает функцию, при вызове которой инициализируется требуемое в параметрах событие
- `onAll` - слушать все события
- `offAll` - сбросить все обработчики
- `trigger` - сделать коллбек триггер, генерирующий событие при вызове

Поля класса:

- \_events: Закрытое свойство, представляющее карту событий, где ключом является имя события, а значением - набор подписчиков.

### Слой данных

#### Класс Model

Класс представляет базовую модель, которую можно использовать для отличия от простых объектов с данными. Конструктор `constructor(data: Partial<T>, protected events: IEvents)` - принимает данные и экземпляр класса `EventEmitter`.

Методы:

- emitChanges(event: string, payload?: object): Метод для сообщения всем подписчикам о изменениях в модели.

#### Класс ProductsData

Класс отвечает за хранение и логику работы с данными товаров.\
В полях класса хранятся следующие данные:

- \_products: IProduct[] - массив объектов товаров
- \_preview: string | null - id товара, выбранной для просмотра в модальном окне

Так же класс предоставляет методы для взаимодействия с этими данными.

- getProduct(productId: string): IProduct - возвращает карточку по ее id
- get products() - получить все продукты
- set preview(productId: string | null) - записывает в поле `\_preview` выбранный товар для показа в модальном окне
- get preview() - получить выбранный товар для показа в модальном окне

#### Класс BasketData

Класс отвечает за хранение и логику работы с данными корзины.\
В полях класса хранятся следующие данные:

- \_totalProducts: number - количество продуктов в корзине
- \_productsInBasket: IProduct[] = [] - массив с продуктами

Так же класс предоставляет набор методов для взаимодействия с этими данными.

- setProductsInBasket(product: IProduct) - добавляет продукт в корзину
- getProductsInBasket(): IProduct[] - получает продукты из корзины
- checkProductInBasket(item: IProduct): boolean - проверяет по id, находится ли продукт в корзине
- get totalProducts(): number - получить количество продуктов в корзине
- get totalPrise(): number - получить общую цену в корзине
- delete(item: IProduct) - удаляет продукт из корзины
- clearBasket() - очищает корзину
- а так-же геттеры для получения общей цены и количества продуктов в корзине

#### Класс OrderData

Класс отвечает за хранение и логику работы с данными заказа.\
В полях класса хранятся следующие данные:

- \_order: IOrderData - все данные заказа
- formErrors: FormErrors = {} - массив с текстом ошибок форм.

Так же класс предоставляет набор методов для взаимодействия с этими данными.

- get order() - получить все данные заказа
- setProducts(items: string[]) - записывает в массив id товаров в заказе.
- setTotalPrice(value: number) - записывает общую цену заказа
- clearOrderData(): void - очищает массив данных после заказа
- setOrderField(field: keyof IOrderForm, value: string) - записывает данные с полей форм в массив данных заказа \_order
- validateOrder() - валидация форм

### Классы представления

Все классы представления отвечают за отображение внутри контейнера (DOM-элемент) передаваемых в них данных.

#### Абстрактный класс Component<T\>

Базовый компонент который реализует вспомогательные методы для работы других классов. В конструкторе `protected constructor(protected readonly container: HTMLElement) {` принимает HTMLElement с которым нужно работать\

Метод класса

- toggleClass(element: HTMLElement, className: string, force?: boolean) - Переключает класс
- setText(element: HTMLElement, value: unknown) - Устанавливает текстовое содержимое
- setDisabled(element: HTMLElement, state: boolean) - Изменяет статус блокировки
- setHidden(element: HTMLElement) - Скрывает элемент
- setVisible(element: HTMLElement) - Показывает элемент
- setImage(element: HTMLImageElement, src: string, alt?: string) - Устанавливает изображение с альтернативным текстом
- render(data?: Partial<T>): HTMLElement - возвращает корневой DOM-элемент

#### Класс Modal

Расширяет класс `Component<T>`. Реализует модальное окно. Так же предоставляет методы `open` и `close` для управления отображением модального окна. Устанавливает слушатели на клик в оверлей и кнопку-крестик для закрытия попапа.

- constructor(container: HTMLElement, protected events: IEvents) Конструктор принимает HTML элемент модального окна и экземпляр класса `EventEmitter` для возможности инициации событий.

Поля класса

- \_closeButton: HTMLButtonElement - кнопка закрытия
- \_content: HTMLElement - контент модального окна

Методы класса:

- set content(value: HTMLElement) - устанавливает разметку модального окна
- open() - открывает модальное окно
- close() - закрывает модальное окно
- render(data: IModalData): HTMLElement - рендерит модальное окно с переданным контентом и вызывает метод `open()` для открытия окна.

#### Класс ProductUI

Расширяет класс `Component<T>`. Отвечает за отображение продукта. Класс используется для отображения товаров на странице сайта. В конструктор класса `constructor(
		element: HTMLElement,
		productInBasket: boolean,
		product: IProduct,
		events: IEvents,
		actions?: ICardActions
	)` передается DOM элемент темплейта, что позволяет при необходимости формировать карточки разных вариантов верстки.
Конструктор, кроме темплейта принимает экземпляр `EventEmitter` для инициации событий. А так же следующие данные:\

- productInBasket: boolean - информация содержится ли товар в корзине
- product: IProduct - данные продукта

Так же в конструкторе реализуется установка обработчиков событий на кнопки, смена текста на кнопке "Купить" или "Удалить" товар ели он уже находится в корзине, вывод надписи "Товар бесценен" и блокировка кнопки если у товара нет цены.

Поля класса содержат элементы разметки элементов товара. А так же объект с категориями для стилизации элемента 'категории'.

- protected productId: string; - id продукта
- protected \_title: HTMLElement; - название
- protected \_image: HTMLImageElement; - изображение
- protected \_description: HTMLElement; - описание
- protected \_price: HTMLElement; - цена
- protected \_category: HTMLElement; - категория
- protected \_productIndex: HTMLElement; - номер продукта в корзине
- protected \_button: HTMLButtonElement; - кнопка добавления в корзину
- protected deleteButton: HTMLButtonElement; - кнопка удаления из корзины
- protected categorySkills{} - обьект с категориями для стилизации элемента категории

Методы: сеттеры и геттеры для сохранения и получения данных из полей класса

#### Класс Basket

Расширяет класс `Component<T>`. Отвечает за отображение корзины. В конструктор класса `constructor(container: HTMLElement, protected events: EventEmitter)` передается DOM элемент темплейта а так же экземпляр класса `EventEmitter`. Вешает обработчик события клика на кнопку оформить\

Поля класса содержат DOM элементы темплейта

- protected \_products: HTMLElement; - контейнер для размещения продуктов
- protected \_total: HTMLElement; - общая сумма товаров
- protected \_button: HTMLElement; - кнопка

Методы:

- toggleButton(state: boolean) - вспомогательный метод который переключает состояние кнопки
- set products(items: HTMLElement[]) - записывает товары в корзину, выводит сообщение 'Корзина пуста' если товаров в корзине нет
- set total(total: number) - записывает общую сумму товаров в корзине

Интерфейс:

```
interface IBasketView {
	products: HTMLElement[];
	total: number;
}
```

#### Класс Form

Расширяет класс `Component<T>`. Отвечает за отображение элементов формы. В конструктор класса `constructor(protected container: HTMLFormElement, protected events: IEvents)` передается DOM элемент темплейта а так же экземпляр класса `EventEmitter`\
В конструкторе вешается обработчик события на поля ввода для валидации и кнопку сабмита.

Поля класса содержат:

- protected \_submit: HTMLButtonElement - DOM элемент кнопки сабмита
- protected \_errors: HTMLElement - DOM элемент ошибок

Методы:

- protected onInputChange(field: keyof T, value: string) - вешает каждому полю ввода свое событие
- set valid(value: boolean) - разблокирует или блокирует кнопку отправки
- set errors(value: string) - записывает ошибки валидации
- render(state: Partial<T\> & IFormState) - рендер формы

Интерфейс:

```
interface IFormState {
	valid: boolean;
	errors: string[];
}
```

#### Класс OrderForm

Расширяет класс `Form`. Отвечает за отображение окон заказа. В конструктор класса `constructor(container: HTMLFormElement, events: IEvents)` передается DOM элемент темплейта а так же экземпляр класса `EventEmitter`. Вешается обработчик события выбора способа оплаты.

Поля класса содержат DOM элементы:

- protected \_payment: HTMLButtonElement[] - выбор способа оплаты
- protected \_phone: HTMLInputElement - поле ввода телефона
- protected \_email: HTMLInputElement - поле ввода email
- protected \_address: HTMLInputElement - поле ввода адреса

Методы:

- set paymentSelected(name: string) - вешается класс на кнопку выбранного способа оплаты и инициализируется событие куда передается выбранный способ оплаты.
- paymentSelectedRemove() - удаляет класс с активной кнопки после заказа\
- set phone(value: string) - записывает телефон в поле `_phone`
- set email(value: string) - записывает email в поле `_email`
- set address(value: string) - записывает адрес в поле `_address`

#### Класс Page

Расширяет класс `Component<T>`. Отвечает за отображение главной страницы. В конструктор класса `constructor(container: HTMLElement, protected events: IEvents)` передается DOM элемент темплейта а так же экземпляр класса `EventEmitter`. Вешается обработчик события на нажатие кнопки корзины.

Поля класса содержат DOM элементы страницы:

- protected \_counter: HTMLElement - число товаров в корзине
- protected \_products: HTMLElement - контейнер для продуктов
- protected \_wrapper: HTMLElement - wrapper
- protected \_basket: HTMLElement - корзину

Методы:

- set counter(value: number) - записывает число товаров в корзине
- set products(items: HTMLElement[]) - записывает продукты
- set locked(value: boolean) - блокирует прокрутку страницы когда открыта модалка

Интерфейс:

```
interface IPage {
	counter: number;
	products: HTMLElement[];
	locked: boolean;
}
```

#### Класс Success

Расширяет класс `Component<T>`. Отвечает за отображение модального окна успешного заказа. В конструктор класса `constructor(container: HTMLElement, events: IEvents)` передается DOM элемент темплейта а так же экземпляр класса `EventEmitter`. Вешается обработчик события на нажатие кнопки закрытия.

Поля класса содержат DOM элементы страницы:

- protected \_total: HTMLElement - общая сумма заказа
- protected button: HTMLElement - кнопка закрытия

Методы:

- set total(value: number) - заполняет общею сумму заказа

Интерфейс:

```
interface ISuccess {
	total: number;
}
```

### Слой коммуникации

#### Класс ProductAPI

Наследует класс `Api` и предоставляет методы реализующие взаимодействие с бэкендом сервиса. Конструктор `constructor(cdn: string, baseUrl: string, options?: RequestInit)` - принимает ссылку на сервер(cdn), базовый URL и глобальные опции для всех запросов(опционально).

Поле класса:

- readonly cdn: string - ссылка на сервер

Методы:

- getProductItem(id: string): Promise<IProduct\> - получить продукт по id
- getProductList(): Promise<IProduct[]> - получить все продукты
- order(order: IOrderData): Promise<IOrderResult> - отправить заказ

Интерфейс:

```
export interface IProductAPI {
	getProductList: () => Promise<IProduct[]>;
	getProductItem: (id: string) => Promise<IProduct>;
	order: (order: IOrderData) => Promise<IOrderResult>;
}
```

## Взаимодействие компонентов

Код, описывающий взаимодействие представления и данных между собой находится в файле `index.ts`, выполняющем роль презентера.\
Взаимодействие осуществляется за счет событий генерируемых с помощью брокера событий и обработчиков этих событий, описанных в `index.ts`\
В `index.ts` сначала создаются экземпляры всех необходимых классов, а затем настраивается обработка событий.

_Список всех событий, которые могут генерироваться в системе:_\
_События изменения данных (генерируются классами моделями данных)_

- `products:changed` - изменение массива карточек
- `preview:changed` - выбрана карточка для показа

_События, возникающие при взаимодействии пользователя с интерфейсом (генерируются классами, отвечающими за представление)_

- `order:open` - открытие модального окна заказа
- `basket:open` - открытие модального окна корзины
- `modal:open` - открытие модального окна
- `modal:close` - закрытие модального окна
- `basket:add` - добавление товара в корзину
- `preview:delete` - удаление товара из корзины в модальном окне товара
- `basket:delete` -удаление товара из корзины
- `basket:changed` -изменения в корзине
- `payment:select` -выбор способа оплаты
- `formErrors:change` - ошибки валидации
- `order.address:change` - ввод в поле адреса
- `order:submit` - нажата кнопка "Далее" в форме заказа
- `contacts.email:change` - ввод в поле Email
- `contacts.phone:change` - ввод в поле Телефон

```

```
