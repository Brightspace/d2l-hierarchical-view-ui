# d2l-hierarchical-view
[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/BrightspaceUI/hierarchical-view)
[![Bower version][bower-image]][bower-url]
[![Build status][ci-image]][ci-url]

A [Polymer](https://www.polymer-project.org/1.0/)-based web component and behavior for hierarchical views.

## Installation

`d2l-hierarchical-view` can be installed from [Bower][bower-url]:
```shell
bower install d2l-hierarchical-view
```

## Usage

Include the [webcomponents.js](http://webcomponents.org/polyfills/) "lite" polyfill (for browsers who don't natively support web components), then import the component or behavior.

### Component

#### HTML

```html
<head>
  <script src="../webcomponentsjs/webcomponents-lite.js"></script>
  <link rel="import" href="../d2l-hierarchical-view/d2l-hierarchical-view.html">
</head>
```

Nest the `d2l-hierarchical-view` elements on your page.

```html
<d2l-hierarchical-view id="view1">
  <div style="min-height: 200px;">
    <div class="buttons">
      <button onclick="showSubView('view2a');">view 2a</button>
      <button onclick="showSubView('view2b');">view 2b</button>
    </div>
    view 1
    <div class="info">min-height: 200</div>
    <div>
      <d2l-hierarchical-view id="view2a">
        <div style="min-height: 400px;">
          <div class="buttons">
            <button onclick="showParentView('view2a');">view 1 (parent)</button>
            <button onclick="showSubView('view3');">view 3</button>
          </div>
          view 2a
          <div class="info">min-height: 400</div>
          <d2l-hierarchical-view id="view3">
            <div style="min-height: 300px;">
              <div class="buttons">
                <button onclick="showParentView('view3');">view 2a (parent)</button>
              </div>
              view 3
              <div class="info">min-height: 300</div>
            </div>
          </d2l-hierarchical-view>
        </div>
      </d2l-hierarchical-view>
      <d2l-hierarchical-view id="view2b">
        <div style="min-height: 200px;">
          <div class="buttons">
            <button onclick="showParentView('view2b');">view 1 (parent)</button>
          </div>
          view 2b
          <div class="info">min-height: 200</div>
        </div>
      </d2l-hierarchical-view>
    </div>
  </div>
</d2l-hierarchical-view>
```

#### Methods

Use the `show` and `hide` methods on child views to control visibility:

```javascript
// to show child (hiding parent)
child.show();

// to hide child (show parent)
child.hide();
```

Other helpful methods:

```javascript
// get the currently active hierarchical view
view.getActiveView();

// get the root hierarchical view
view.getRootView();

// whether the specified hierarchical view is the active view
view.isActive();

// force resize of the hierarchical view (useful if initially not displayed when attached)
view.resize();
```

#### Events

The hierarchical views raise show/hide events when showing or hiding child views.

```javascript
// triggered when child view will be shown (before animation begins)
view.addEventListener('d2l-hierarchical-view-show-start', () => { ... });

// triggered when child view is shown (when animation ends)
view.addEventListener('d2l-hierarchical-view-show-complete', () => { ... });

// triggered when child view will be hidden (before animation begins)
view.addEventListener('d2l-hierarchical-view-hide-start', () => { ... });

// triggered when child view is hidden (when animation ends)
view.addEventListener('d2l-hierarchical-view-hide-complete', () => { ... });
```

### Behavior

To implement a custom hierarchical view component, import the `d2l-hierarchical-view-behavior.html` behavior, include the `d2l-hierarchical-view-styles` styles, and define a template containing the `d2l-hierarchical-view-content` class.  For example, see  [d2l-hierarchical-view](https://github.com/Brightspace/d2l-hierarchical-view-ui/blob/master/d2l-hierarchical-view.html).

## Developing, Testing and Contributing

After cloning the repo, run `npm install` to install dependencies.

If you don't have it already, install the [Polymer CLI](https://www.polymer-project.org/2.0/docs/tools/polymer-cli) globally:

```shell
npm install -g polymer-cli
```

To start a [local web server](https://www.polymer-project.org/2.0/docs/tools/polymer-cli-commands#serve) that hosts the demo page and tests:

```shell
polymer serve
```

To lint ([eslint](http://eslint.org/) and [Polymer lint](https://www.polymer-project.org/2.0/docs/tools/polymer-cli-commands#lint)):

```shell
npm run lint
```

To run unit tests locally using [Polymer test](https://www.polymer-project.org/2.0/docs/tools/polymer-cli-commands#tests):

```shell
polymer test --skip-plugin sauce
```

To lint AND run local unit tests:

```shell
npm test
```

[bower-url]: http://bower.io/search/?q=d2l-hierarchical-view
[bower-image]: https://badge.fury.io/bo/d2l-hierarchical-view.svg
[ci-url]: https://travis-ci.org/BrightspaceUI/hierarchical-view
[ci-image]: https://travis-ci.org/BrightspaceUI/hierarchical-view.svg?branch=master

## Versioning & Releasing

All version changes should obey [semantic versioning](https://semver.org/) rules.

Include either `[increment major]`, `[increment minor]` or `[increment patch]` in your merge commit message to automatically increment the `package.json` version and create a tag during the next build.
