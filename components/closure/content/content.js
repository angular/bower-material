/*!
 * Angular Material Design
 * https://github.com/angular/material
 * @license MIT
 * v0.5.1-master-6d456da
 */
goog.provide('ng.material.components.content');
goog.require('ng.material.core');
!function(){"use strict";function t(t){function e(t,e){this.$scope=t,this.$element=e}return{restrict:"E",controller:["$scope","$element",e],link:function(e,n){t(n),e.$broadcast("$mdContentLoaded",n)}}}angular.module("material.components.content",["material.core"]).directive("mdContent",t),t.$inject=["$mdTheming"]}();