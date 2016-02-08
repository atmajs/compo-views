## Views Component
[![Build Status](https://travis-ci.org/atmajs/compo-views.png?branch=master)](https://travis-ci.org/atmajs/compo-views)

[![npm version](https://badge.fury.io/js/compo-views.svg)](https://badge.fury.io/js/compo-views)
[![Bower version](https://badge.fury.io/bo/compo-views.svg)](http://badge.fury.io/bo/compo-views)



```mask
ViewManager {
	View route='a' default { /* template */ }
	View route='b' path='./foo.mask';
}
```

### Routing

Using [Ruta](https://github.com/atmajs/ruta).

#### Resolve routes. The `ViewMap`.

First of all, `ViewManager` gets the list of all available routes from different sources:

- Route attributes of children `View`s.
- By an expression from current `model`, `scope`, `ctx` or ancestors.

#### Parameters

Current route parameter values are passed to the rendered view.

```mask
ViewManager {
	View route='/users' { /* list template */ }
	View route='/user/:id/edit' { /* edit template */ }
	View route='/user/create' { /* create template */ }
}
```

### `ViewManager`

- [Attributes](#viewmanager-attributes)
- [Signals](#viewmanager-signals)
- [Slots](#viewmanager-slots)
- [Components](#viewmanager-components)

	#### Input Elements
	- [View](#view)
	- [Progress](#progress)
	- [Notification](#notification)

#### `ViewManager` Attributes

| Name | Type | Default | Description |
|------|------|---------|-------------|
|`base`   |`string`  |`current location`| Base location, from which remote templates are loaded |
|`viewmap`|`string`  |`empty`           | Expression to get the viewmap |
|`routing`|`boolean` |`true`            | Should update the window location with HistoryAPI when navigating to the view |
|`nested` |`boolean` |`true`            | Depends on parent `ViewManager` |

#### Api

- `navigate(path: string):Promise<Route>` Open `View` for the path, and hides current if any.

## Signals

`ViewManager` Component emits signals to current `View` on various states.

- `viewActivity(type)`

	Types:

	- `start`
	- `end`

- `viewActivation`
- `viewDeactivation`

## Slots

- `viewNavigate(path:string)` Signal alias for `navigate` method.


## Components

`ViewManager` defines some nested components. So you can override or extend each.

### `View`

View template is placed inside the `View` component

#### Attributes

| Name | Type | Default | Description |
|------|------|---------|-------------|
|`default`|`boolean`  |`false`| If no route is matched, this view will be shown to user |
|`detach` |`boolean`  |`true` | After the view was hidden, detach the view from DOM.  |

##### Methods

- `hide:Promise`

	_Hides the view with `display:none` style._
	> Note that it will be also detached from DOM

- `show:Promise`

	_Attaches, if detached, and shows the view_.

> Both methods can be overridden to perform some animations or other behavior.

***

#### Progress

`Progress` component is always rendered. Current implementation shows the `progress` element when current `View` is loading.

#### Notification

`Notification` component is always rendered. Current implementation shows the notification messages, on errors etc.



## Examples

- [/examples](/examples)

```bash
# install atma toolkit
npm install atma -g
# run examples static server
npm run examples

# navigate `http://localhost:5777/examples/index.html?input`
```

### Test
```bash
npm test
```

:copyright: MIT - Atma.js Project