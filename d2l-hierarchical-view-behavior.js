import '@polymer/polymer/polymer-legacy.js';
import 'fastdom/fastdom.js';
import { findComposedAncestor, isComposedAncestor } from '@brightspace-ui/core/helpers/dom.js';
import { getNextFocusable, getPreviousFocusable } from '@brightspace-ui/core/helpers/focus.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import { afterNextRender } from '@polymer/polymer/lib/utils/render-status.js';
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<dom-module id="d2l-hierarchical-view-styles">
	<template strip-whitespace="">
		<style>

			:host {
				box-sizing: border-box;
				display: inline-block;
				position: relative;
				left: 0;
				overflow: hidden;
				width: 100%;

				--d2l-hierarchical-view-height-transition: height 300ms linear;

				-webkit-transition: var(--d2l-hierarchical-view-height-transition);
				transition: var(--d2l-hierarchical-view-height-transition);
			}
			:host([child-view]) {
				display: none;
				position: absolute;
				top: 0;
				left: 100%;
			}
			:host([shown]) {
				display: inline-block;
			}
			.d2l-hierarchical-view-content.d2l-child-view-show {
				-webkit-animation: show-child-view-animation forwards 300ms linear;
				animation: show-child-view-animation 300ms forwards linear;
			}
			.d2l-hierarchical-view-content.d2l-child-view-hide {
				-webkit-animation: hide-child-view-animation forwards 300ms linear;
				animation: hide-child-view-animation 300ms forwards linear;
			}

			@keyframes show-child-view-animation {
				0% { transform: translate(0,0); }
				100% { transform: translate(-100%,0); }
			}
			@-webkit-keyframes show-child-view-animation {
				0% { -webkit-transform: translate(0,0); }
				100% { -webkit-transform: translate(-100%,0); }
			}
			@keyframes hide-child-view-animation {
				0% { transform: translate(-100%,0); }
				100% { transform: translate(0,0); }
			}
			@-webkit-keyframes hide-child-view-animation {
				0% { -webkit-transform: translate(-100%,0); }
				100% { -webkit-transform: translate(0,0); }
			}

		</style>
	</template>
</dom-module>`;

document.head.appendChild($_documentContainer.content);

window.D2L = window.D2L || {};
window.D2L.PolymerBehaviors = window.D2L.PolymerBehaviors || {};

/** @polymerBehavior */
D2L.PolymerBehaviors.HierarchicalViewBehavior = {

	/**
	 * Triggered when child view will be shown (before animation begins).
	 * @event d2l-hierarchical-view-show-start
	 * @param {HTMLElement} sourceView The source view that triggered the show.
	 */

	/**
	 * Triggered when child view is shown (when animation ends).
	 * @event d2l-hierarchical-view-show-complete
	 * @param {HTMLElement} sourceView The source view that triggered the show.
	 */

	/**
	 * Triggered when child view will be hidden (before animation begins).
	 * @event d2l-hierarchical-view-hide-start
	 * @param {HTMLElement} sourceView The source view that triggered the hide.
	 */

	/**
	 * Triggered when child view is hidden (when animation ends).
	 * @event d2l-hierarchical-view-hide-complete
	 * @param {HTMLElement} sourceView The source view that triggered the hide.
	 */

	properties: {

		/**
		 * Whether the view in the hierarchy is currently displayed. Only one view
		 * in the hierarchy will have shown=true.
		 */
		shown: {
			type: Boolean,
			reflectToAttribute: true
		},

		/**
		 * Indicates whether the view is a child view. This value is determined at runtime when
		 * the view is attached to the DOM.  All views are child views except the root view.
		 */
		childView: {
			type: Boolean,
			reflectToAttribute: true
		},

		/**
		 * Indicates the view is currently attached.
		 */
		isAttached: {
			type: Boolean
		},

		/**
		 * Indicates the element is a hierarchical view.
		 */
		isHierarchicalView: {
			type: Boolean,
			readOnly: true,
			value: true
		}
	},

	__keyCodes: {
		ESCAPE: 27
	},

	__nativeFocus: null,

	listeners: {
		'keydown': '__onKeyDown',
		'd2l-hierarchical-view-hide-start': '__onHideStart',
		'd2l-hierarchical-view-show-start': '__onShowStart',
		'd2l-hierarchical-view-resize': '__onViewResize'
	},

	ready: function() {
		this.__nativeFocus = document.createElement('div').focus;
		this.__focusCapture = this.__focusCapture.bind(this);
		this.__focusOutCapture = this.__focusOutCapture.bind(this);
		this.__onWindowResize = this.__onWindowResize.bind(this);
	},

	attached: function() {

		this.isAttached = true;

		var parentView = findComposedAncestor(
			dom(this).parentNode,
			function(node) { return node.isHierarchicalView; }
		);

		if (parentView) {
			this.childView = true;
		}

		this.async(function() {
			this.__autoSize(this);
		}.bind(this));

		afterNextRender(this, function() {
			dom(this).observeNodes(this.__observeNodes);

			if (!this.childView) {
				this.addEventListener('focus', this.__focusCapture, true);
				this.addEventListener('focusout', this.__focusOutCapture, true);
				window.addEventListener('resize', this.__onWindowResize);
			}
		}.bind(this));

	},

	detached: function() {

		this.isAttached = false;

		if (!this.childView) {
			this.removeEventListener('focus', this.__focusCapture, true);
			this.removeEventListener('focusout', this.__focusOutCapture, true);
			window.removeEventListener('resize', this.__onWindowResize);
		}
	},

	/**
	 * Gets the hierarchical view that is currently shown.
	 * @return {HTMLElement}
	 */
	getActiveView: function() {
		var rootView = this.getRootView();
		var childViews = dom(rootView).querySelectorAll('[child-view][shown]');
		if (!childViews || childViews.length === 0) {
			return rootView;
		}
		for (var i = 0; i < childViews.length; i++) {
			var childView = childViews[i];
			if (childView.isActive()) {
				return childView;
			}
		}
	},

	/**
	 * Gets the hierarchical view that is at the root.
	 * @return {HTMLElement}
	 */
	getRootView: function() {
		if (!this.childView) {
			return this;
		}
		var rootView = findComposedAncestor(
			dom(this).parentNode,
			function(node) {
				return node.isHierarchicalView && !node.childView;
			}
		);
		return rootView;
	},

	/**
	 * Hides the view (showing its parent view). To hide, simply call hide(); on the view.
	 */
	hide: function(data, sourceView) {
		if (!sourceView) {
			sourceView = this;
		}
		this.fire('d2l-hierarchical-view-hide-start', {
			data: data,
			isSource: sourceView === this,
			sourceView: sourceView
		});
	},

	/**
	 * Determines whether the view is active.
	 * @return {Boolean}
	 */
	isActive: function() {
		var content = this.$$('.d2l-hierarchical-view-content');
		if (this.childView && !this.shown) {
			return false;
		} else {
			return !content.classList.contains('d2l-child-view-show');
		}
	},

	/**
	 * Forces resize/layout of the view.
	 * @return {Boolean}
	 */
	resize: function() {
		this.__fireViewResize();
	},

	/**
	 * Shows the view (hiding its parent view). To show, simply call show(); on the view.
	 */
	show: function(data, sourceView) {

		var _show = function(data, view) {
			view.shown = true;
			view.fire('d2l-hierarchical-view-show-start', {
				isSource: sourceView === this,
				data: data,
				sourceView: sourceView
			});
		}.bind(this);

		var _hideChildViews = function(data, view) {
			var childViews = dom(view).querySelectorAll('[child-view][shown]');
			for (var i = 0; i < childViews.length; i++) {
				childViews[i].hide(data);
			}
			this.resize();
		}.bind(this);

		if (sourceView) {
			_show(data, this);
			return;
		}

		sourceView = this;
		var activeView = this.getActiveView();

		if (isComposedAncestor(activeView, this)) {
			_show(data, this);
			return;
		}

		if (isComposedAncestor(this, activeView)) {
			_hideChildViews(data, this);
			return;
		}

		_hideChildViews(data, this.getRootView());
		_show(data, this);

	},

	__autoSize: function(view) {

		if (this.childView) {
			return;
		}

		fastdom.measure(function() {
			if (view.offsetParent === null) {
				return;
			}
			var rect;
			if (view === this) {
				rect = this.$$('.d2l-hierarchical-view-content').getBoundingClientRect();
			} else {
				rect = view.getBoundingClientRect();
			}
			fastdom.mutate(function() {
				this.style.height = rect.height + 'px';
			}.bind(this));
		}.bind(this));

	},

	__fireShowComplete: function(data) {
		this.fire('d2l-hierarchical-view-show-complete', { activeView: this.getActiveView(), data: data });
	},

	__fireHideComplete: function(data) {
		this.fire('d2l-hierarchical-view-hide-complete', { activeView: this.getActiveView(), data: data });
	},

	__fireViewResize: function() {
		if (!this.isActive()) {
			var view = this.getActiveView();
			view.resize();
			return;
		}
		var content = this.$$('.d2l-hierarchical-view-content');
		fastdom.measure(function() {
			var contentRect = content.getBoundingClientRect();
			// don't resize the root view if it's not displayed
			if (contentRect.height < 1) return;
			this.fire('d2l-hierarchical-view-resize', contentRect);
		}.bind(this));
	},

	__focusCapture: function(e) {

		var parentView = this.__getParentViewFromEvent(e);

		if (parentView.isActive()) {
			return;
		}

		var relatedTarget = e.relatedTarget;
		var focusableElement;

		var getNextFocusableLocal = function() {
			var activeView = this.getActiveView();
			if (this.__nativeFocus === activeView.focus) {
				return getNextFocusable(activeView);
			} else {
				return activeView;
			}
		}.bind(this);

		if (relatedTarget) {
			if (!isComposedAncestor(this, relatedTarget)) {
				focusableElement = getNextFocusableLocal();
			} else {
				focusableElement = getPreviousFocusable(this);
			}
		} else {

			// handle focus for ie
			if (this.__focusPrevious) {
				this.__focusPrevious = false;
				focusableElement = getPreviousFocusable(this);
			} else {
				focusableElement = getNextFocusableLocal();
			}

		}

		if (focusableElement) {
			focusableElement.focus();
		}

	},

	__focusPrevious: false,

	__focusOutCapture: function(e) {

		// focus tracking required since ie only supports relatedTarget on focusin/focusout
		var relatedTarget = e.relatedTarget;
		var activeView = this.getActiveView();
		this.__focusPrevious = false;
		if (isComposedAncestor(activeView, e.target)) {
			if (isComposedAncestor(this, relatedTarget)) {
				this.__focusPrevious = true;
			}
		}

	},

	__getParentViewFromEvent: function(e) {
		var path = dom(e).path;
		for (var i = 1; i < path.length; i++) {
			if (path[i].isHierarchicalView) {
				return path[i];
			}
		}
	},

	__observeNodes: function() {
		if (this.isAttached && this.getActiveView() === this) {
			this.__fireViewResize();
		}
	},

	__onHideStart: function(e) {

		var rootTarget = dom(e).rootTarget;
		if (rootTarget === this || !rootTarget.isHierarchicalView) {
			return;
		}

		var parentView = this.__getParentViewFromEvent(e);
		if (parentView === this) {
			var content = this.$$('.d2l-hierarchical-view-content');

			var data = e.detail.data;
			var animationEnd = function(e) {
				content.removeEventListener('animationend', animationEnd);
				dom(e).rootTarget.classList.remove('d2l-child-view-hide');
				rootTarget.shown = false;
				rootTarget.__fireHideComplete(data);
			}.bind(this);
			content.addEventListener('animationend', animationEnd);

			content.classList.add('d2l-child-view-hide');
			content.classList.remove('d2l-child-view-show');

			this.fire('d2l-hierarchical-view-resize', content.getBoundingClientRect());
		}

	},

	__onKeyDown: function(e) {
		if (this.childView && e.keyCode === this.__keyCodes.ESCAPE) {
			e.stopPropagation();
			this.hide();
			return;
		}
	},

	__onViewResize: function(e) {
		this.style.height = e.detail.height + 'px';
	},

	__onShowStart: function(e) {

		var rootTarget = dom(e).rootTarget;
		if (rootTarget === this || !rootTarget.isHierarchicalView) {
			return;
		}

		if (this.childView && !this.shown) {
			/* deep link scenario */
			this.show(e.detail.data, e.detail.sourceView);
		}
		var content = this.$$('.d2l-hierarchical-view-content');

		if (e.detail.isSource && this.__getParentViewFromEvent(e) === this) {
			var animationEnd = function() {
				content.removeEventListener('animationend', animationEnd);
				e.detail.sourceView.__fireShowComplete(e.detail.data, e.detail);
			}.bind(this);
			content.addEventListener('animationend', animationEnd);
		}

		content.classList.add('d2l-child-view-show');

		if (e.detail.isSource && this.__getParentViewFromEvent(e) === this) {
			e.detail.sourceView.__fireViewResize();
		}

	},

	__onWindowResize: function() {
		var view = this.getActiveView();
		if (view) {
			view.__fireViewResize();
		}
	}

};
