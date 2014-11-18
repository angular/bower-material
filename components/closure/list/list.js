/*!
 * Angular Material Design
 * https://github.com/angular/material
 * @license MIT
 * v0.5.1-master-8ee6a71
 */
goog.provide('ng.material.components.list');
goog.require('ng.material.core');
!function(){"use strict";function t(){return{restrict:"E",link:function(t,i){i.attr({role:"list"})}}}function i(){return{restrict:"E",link:function(t,i){i.attr({role:"listitem"})}}}angular.module("material.components.list",["material.core"]).directive("mdList",t).directive("mdItem",i)}();