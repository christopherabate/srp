# SRP
- [An interactive screen reader puzzle game](https://christopherabate.github.io/srp/)
- [Role/Name/Value demonstrator](https://christopherabate.github.io/srp/rnv.html)


# ScreenReader

The `ScreenReader` class allows for navigating and interacting with web elements in a screen-reader-like manner.
It collects elements from the DOM and generates descriptions for these elements.

## Example

```js
// Initialize the ScreenReader instance
const screen = window; // The target screen object (usually the window object or an iframe)
const elements = { 'subset': { 'button': 'Button Element' } };
const reader = new ScreenReader(screen, elements);

// Move to the next element
reader.move();

// Activate the current element
reader.activate();

// Get additionnal description
reader.speak().role;
reader.speak().name;
reader.speak().value;
```

## Usage

### Constructor

```js
const screen = window;
const elements = { 'forms': { 'input': 'Input Field' } };
const reader = new ScreenReader(screen, elements);
```

| Parameter | Type   | Description                                       |
| --------- | ------ | ------------------------------------------------- |
| `screen`  | object | The target screen object (usually the `window`).   |
| `elements`| object | Defines elements to monitor and their descriptions.|

---

### Methods

#### `setCurrent(index)`

Set the current index of the accessible elements.

```js
reader.setCurrent(1);
```

| Parameter | Type   | Description                             |
| --------- | ------ | --------------------------------------- |
| `index`   | number | The new index to set as the current one. |

**Returns**: The current `ScreenReader` instance (for chaining).

---

#### `collect(subset = '')`

Collect all visible and accessible elements from the DOM. Hidden or `aria-hidden` elements are filtered out.

```js
const readableElements = reader.collect();
```

| Parameter | Type   | Description                                             |
| --------- | ------ | ------------------------------------------------------- |
| `subset`  | string | Optional. A subset of elements to collect (default: ''). |

**Returns**: An array of accessible `HTMLElement` objects.

---

#### `move({ list = '', reverse = false } = {})`

Move to the next or previous matching element and update the current index.

```js
reader.move({ reverse: true });
```

| Option      | Type    | Description                                                |
| ----------- | ------- | ---------------------------------------------------------- |
| `list`      | string  | Optional. Subset of elements to consider (default: '').     |
| `reverse`   | boolean | Optional. If `true`, move backward (default: `false`).      |

**Returns**: The current `ScreenReader` instance (for chaining).

---

#### `activate()`

Activate the current element by triggering a click event. The readable list is updated, and the current index is set to the clicked element.

```js
reader.activate();
```

**Returns**: The current `ScreenReader` instance (for chaining).

---

#### `speak({ wrapper, element = this.readable[this.current] } = {})`

Generates an object containing the description of the element, including its role, name, and value.

```js
reader.speak();
```

| Option        | Type       | Description                                                                   |
| ------------- | ---------- | ----------------------------------------------------------------------------- |
| `wrapper`     | function   | Optional. A function to format the element's text.                             |
| `element`     | HTMLElement| Optional. The element to describe (default: the current element).              |

**Returns**: An `object` containing the description of the element, including its role, name, and value.

---

## Events

As `ScreenReader` extends `EventTarget`, you can listen for and dispatch custom events using the standard `addEventListener` and `dispatchEvent` methods.

### Event: `change`

Triggered when the current element changes.

```js
reader.addEventListener('change', (event) => {
  console.log('Current element changed:', event.detail);
});
```

---

## Accessibility Considerations

- The `ScreenReader` class filters out elements that are not visible (`display: none`, `visibility: hidden`, or elements with `aria-hidden="true"`).
- Descriptions are based on the tag name, attributes (e.g., `aria-label`, `alt`, `placeholder`), and the state of the element (e.g., `required`, `checked`).

---

## Browser Support

This class relies on modern DOM APIs such as `EventTarget`, `CustomEvent`, and `getComputedStyle`. It is compatible with most modern browsers, but may require polyfills for older environments.
