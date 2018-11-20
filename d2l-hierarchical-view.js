/**
`d2l-hierarchical-view`
Polymer-based web component for nested views

@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import '../@polymer/polymer/polymer-legacy.js';

import './d2l-hierarchical-view-behavior.js';
import { Polymer } from '../@polymer/polymer/lib/legacy/polymer-fn.js';
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<dom-module id="d2l-hierarchical-view">
	<template strip-whitespace="">
		<style include="d2l-hierarchical-view-styles">
			/*
			 * https://github.com/Polymer/tools/issues/408
			 * Empty style blocks break linter.
			 */
			:host {}
		</style>
		<div class="d2l-hierarchical-view-content">
			<slot></slot>
		</div>
	</template>

	

</dom-module>`;

document.head.appendChild($_documentContainer.content);
Polymer({
	is: 'd2l-hierarchical-view',

	behaviors: [
		D2L.PolymerBehaviors.HierarchicalViewBehavior
	]

});
