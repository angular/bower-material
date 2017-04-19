/*!
 * AngularJS Material Design
 * https://github.com/angular/material
 * @license MIT
 * v1.1.3-master-471c225
 */
function getDirective(e){function i(e){function i(i,o,r){o.css("touch-action",r.mdSwipeTouchAction||"none");var c=e(r[t]);o.on(n,function(e){i.$applyAsync(function(){c(i,{$event:e})})})}return{restrict:"A",link:i}}i.$inject=["$parse"];var t="md"+e,n="$md."+e.toLowerCase();return i}goog.provide("ngmaterial.components.swipe"),goog.require("ngmaterial.core"),angular.module("material.components.swipe",["material.core"]).directive("mdSwipeLeft",getDirective("SwipeLeft")).directive("mdSwipeRight",getDirective("SwipeRight")).directive("mdSwipeUp",getDirective("SwipeUp")).directive("mdSwipeDown",getDirective("SwipeDown")),ngmaterial.components.swipe=angular.module("material.components.swipe");