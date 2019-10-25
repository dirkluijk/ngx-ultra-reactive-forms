# Ultra-reactive Forms for Angular 📝🤩

> Because Angular Forms are not really reactive

[![NPM version](http://img.shields.io/npm/v/ngx-ultra-reactive-forms.svg?style=flat-square)](https://www.npmjs.com/package/ngx-ultra-reactive-forms)
[![NPM downloads](http://img.shields.io/npm/dm/ngx-ultra-reactive-forms.svg?style=flat-square)](https://www.npmjs.com/package/ngx-ultra-reactive-forms)
[![Build status](https://img.shields.io/travis/dirkluijk/ngx-ultra-reactive-forms.svg?style=flat-square)](https://travis-ci.org/dirkluijk/ngx-ultra-reactive-forms)
[![All Contributors](https://img.shields.io/badge/all_contributors-2-orange.svg?style=flat-square)](#contributors-)

## Overview

### What? 🤔

This is a small library that makes Angular Forms really reactive!

* Reactive (and [type-safe][1]!) versions of `FormControl`, `FormGroup` and `FormArray`
* 100% compatible with `@angular/forms` and existing Angular libraries!
* Additional read-only properties `value$`, `valid$`, `pristine$`, `error$`, `enabled$` and more.
* Writable properties for `value$` and `disabled$`

### Why? 🤷‍♂️

Take the default `FormControl` from Angular.

To change its value, or to enable/disable it,
you need to subscribe to your `Observable` streams:

```typescript
const formControl = new FormControl();
const otherControl = new FormControl();

yourValue$.subscribe((value) => {
  formControl.setValue(value);
});

otherControl.valueChanges.subscribe(() => {
  if (otherControl.valid) {
    formControl.enable();
  } else {
    formControl.disable();
  }
});
```

With this library, this code can simply be written as:

```typescript
const formControl = new FormControl(yourValue$);
const otherControl = new FormControl();

formControl.disabled$ = otherControl.invalid$;
```

## Installation 🌩

##### npm

```
npm install ngx-ultra-reactive-forms
```

##### yarn

```
yarn add ngx-ultra-reactive-forms
```

## Usage 🕹

### Importing the module

First, you need to import the `UltraReactiveFormsModule` from `ngx-ultra-reactive-forms`.
This makes sure that the correct `[formControl]` directive is being used.

### Basic example

Then import your `FormControl`, `FormGroup`, `FormArray` and `ControlValueAccessor`
from `ngx-ultra-reactive-forms` (instead of `@angular/forms`) and you are done!

```typescript
import { FormControl, FormGroup } from 'ngx-ultra-reactive-forms';

@Component({ /* ... */ })
class YourComponent {
  myControl = new FormControl<string>();
  
  myFormGroup = new FormGroup<Person>({
    name: new FormControl(),
    birthDate: new FormControl()
  });
  
  formGroupValid$: Observable<boolean>;
  
  constructor(private myService: MyService) {}
  
  ngOnInit(): void {
    this.myControl.value$ = this.myService.someObservableString();
    this.myFormGroup.value$ = this.myService.someObservablePerson();
    
    this.formGroupValid$ = this.myFormGroup.valid$;
  }
}
```

### Type-safety

This library provides full type-safety, leveraged by [ngx-typesafe-forms][1].

### Additional reactive properties

We also provide additional reactive properties.

* `value$`
* `error$`
* `enabled$`
* `pristine$`
* `valid$`
* `status$`

Check out [the whole list][2].

## FAQ

### How does it work?

The `UltraReactiveFormsModule` exports the `ReactiveFormsModule` from Angular.

It also provides a special `[formControl]` directive that will detect the custom `FormControl`
automatically subscribe/unsubscribe from its reactive properties.

[1]: https://github.com/dirkluijk/ngx-typesafe-forms
[2]: https://github.com/dirkluijk/ngx-typesafe-forms#additional-reactive-properties

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/dirkluijk"><img src="https://avatars2.githubusercontent.com/u/2102973?v=4" width="100px;" alt="Dirk Luijk"/><br /><sub><b>Dirk Luijk</b></sub></a><br /><a href="https://github.com/dirkluijk/ngx-typesafe-forms/commits?author=dirkluijk" title="Code">💻</a> <a href="https://github.com/dirkluijk/ngx-typesafe-forms/commits?author=dirkluijk" title="Documentation">📖</a></td>
    <td align="center"><a href="https://craftsmen.nl/"><img src="https://avatars0.githubusercontent.com/u/16564855?v=4" width="100px;" alt="Daan Scheerens"/><br /><sub><b>Daan Scheerens</b></sub></a><br /><a href="#ideas-dscheerens" title="Ideas, Planning, & Feedback">🤔</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
