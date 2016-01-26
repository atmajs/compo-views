## Views Component
[![Build Status](https://travis-ci.org/atmajs/compo-views.png?branch=master)](https://travis-ci.org/atmajs/compo-views)
[![Bower version](https://badge.fury.io/bo/compo-views.svg)](http://badge.fury.io/bo/compo-views)


```mask
Views {
	View route='/a' {
		// Nodes
	}
	View route='/b' {
		// Nodes
	}
}
```

# ViewManager: `Views`

- [Attributes](#attributes)
- [Signals](#signals)
- [Slots](#slots)
- [Components](#components)
	
	#### Input Elements
	- [View](#view)
	- [Progress](#progress)
	- [Notification](#notification)
	
### Attributes

- `base:string` 
- `viewmap:string`
- `routing:boolean`

### Api

- `validate():string` Validate the model, and also all inner custom components (_if any_)

	To validate the custom components they must implement IValidation interface:
	```javascript
	IValidation {
		// return error description or Error instance when validation fails
		validate():string|Error
	}
	```
	
- `submit()` Collects form data from the model and inner custom components

	To get custom components data, implement IFormBuilder interface:
	```javascript
	IFormBuilder {
		// return json object, which is then merged with other data
		toJson():object
	}
	```
	
	Per default `a:form` sends json data. But if `multipart/form-data` is set for the content-type, then Json is tranformed to `FormData` instance. So you can upload also images and other binaries.

- `setEntity(obj)` Set the new model and refresh the component

- `getEntity()` Get current components model

- `loadEntity(url)` Loads the model from remote and apply it to the form. This function is automaticaly called on render start, when `get` attribute is defined.
- `uploadEntity` Perform `POST/PATCH/PUT` action according to `form` attributes. This function is called on `submit` signal.
- `notify(type, message)` Notifies about any status changes

## Signals

`a:form` componenent emits signals to **children** on various states

- `formActivity(type, ...args)`

	Types:
	
	- `start`
	- `progress`: plus arguments `'load|upload', percent`
	- `end`: variations `('end', 'upload', json)`, `('end', 'load', json)`
	- `complete`: plus arguments `json`. When not in-memory flag is used then is equivalent to `('end', 'upload', json)`
	- `error`: plus arguments `Error`
	- `formGet`: plus arguments `Object` (_server response_)
	- `formPost`: plus arguments `Object` (_server response_)
	- `formPut`: plus arguments `Object` (_server response_)
	- `formPatch`: plus arguments `Object` (_server response_)
	- `formDelete`: plus arguments `Object` (_server response_)
	
- `formNotification(notification: Object<type, message>`

## Slots

- `submit` Submit entity 
- `delete` Remove entity


## Components

`a:form` defines some nested components. Each component is placed in a template: [ItemLayout](src/compo/ItemLayout.mask)

### Input Elements

All editors have `dualbind` component, sothat they are bound to the model with a two-way data model binding type.

***

#### Input

**_Attributes_**:

- `property` (_required_): Value in a model to edit
- `type` (_optional_): HtmlInput type value: 'string/number/email/etc'
- `placeholder` (_optional_): HtmlInput placeholder
- `class` (_optional_): Css class names

```mask
a:form {
	Input property='some.foo';
}
```

**_Placeholders_**:
- `@label` (_optional_) Defines nodes for the `label` in a `.form-group`

	```mask
	a:form {
		Input property='some.foo' {
			@label > b > 'I am label'
		}
	}
	```

***

#### Text

`textarea`

**_Attributes_**:

- `property` (_required_): Value in a model to edit
- `placeholder` (_optional_): HtmlInput placeholder
- `rows` (_optional_): HtmlTextArea `rows` attribute
- `class` (_optional_): Css class names

```mask
a:form {
	Text property='description';
}
```

**_Placeholders_**:
- `@label` (_optional_)

***

#### Checkbox
**_Attributes_**:

- `property` (_required_): Value in a model to edit
- `text` (_required_): Input's label text
- `class` (_optional_): Css class names

```mask
a:form {
	Checkbox property='baz' text='Should handle baz';
}
```


**_Placeholders_**:
- `@label` (_optional_) Defines nodes for the `label` in a `.form-group`

	```mask
	a:form {
		Checkbox property='baz' text='Should handle baz' {
			@label > 'Lorem ipsum'
		}
	}
	```

***

#### Radio
**_Attributes_**:

- `property` (_required_): Value in a model to edit
- `class` (_optional_): Css class names

**_Placeholders_**:
- `@Option` (_required_) Defines each `Option` for the radio group

	```mask
	a:form {
		Radio property='letter' {
			@Option value='a' {
				// nodes
				'Letter A'
			}
			@Option value='b' > 'Letter B'
			@Option value='c' > 'Letter C'
		}
	}
	```
- `@label` (_optional_)

***

#### `Select`
**_Attributes_**:

- `property` (_required_): Value in a model to edit
- `class` (_optional_): Css class names

**_Placeholders_**:
- `@Option` (_required_) Defines each `Option` for the radio group

	```mask
	a:form {
		Select property='letter' {
			@Option value='a' {
				// nodes
				'Letter A'
			}
			@Option value='b' > 'Letter B'
			@Option value='c' > 'Letter C'
		}
	}
	```
- `@label` (_optional_)

***

#### `Image`

**_Attributes_**:

- `property` (_required_): Value in a model to edit

```mask
a:form {
	Image property='avatar';
}
```

**_Placeholders_**:

- `@label` (_optional_)

***

#### Array

Edit the arrays: edit items, add items, remove items.

- [Example](examples/array.mask)

Slots:
- `arrayItemAdd`
- `arrayItemRemove`

Attributes:
- `property`: Property of an array in a model to edit

Placeholders:
- `@template` is a template for each item
- `@header` is a template to be rendered **before** the list
- `@footer` is a template to be rendered **after** the list

***

#### Template

Wraps nested nodes in the [ItemLayout](src/compo/ItemLayout.mask). 

> Otherwise you can place any mask nodes inside the `a:form` component

**_Placeholders_**:
- `@template` (_required_)

	```mask
	a:form {
		Template > @template {
			MyPicker > dualbind value='myvalue';
		}
	}
	```
	
***

### Ui

`a:form` has some default components to provide error/success/progress notifications.

##### Notification

See the implementation at [Notification.mask](/src/compo/Notification.mask)

_**How to override**_

```javascript
mask.define('Views', `
	let Notification {
		.my-status {
			h4 > '~[bind: $scope.notificationMsg ]'
		}
	}
`)
```

##### Progress

See the implementation at [Progress.mask](/src/compo/Progress.mask)


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