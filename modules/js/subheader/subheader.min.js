/*!
 * Angular Material Design
 * https://github.com/angular/material
 * @license MIT
 * v0.9.4
 */
!function(e,n,t){"use strict";function r(e,t,r){return{restrict:"E",replace:!0,transclude:!0,template:'<h2 class="md-subheader"><div class="md-subheader-inner"><span class="md-subheader-content"></span></div></h2>',compile:function(a,c,i){var s=a[0].outerHTML;return function(a,c,d){function o(e){return n.element(e[0].querySelector(".md-subheader-content"))}r(c),i(a,function(e){o(c).append(e)}),c.hasClass("md-no-sticky")||i(a,function(i){var d=t(n.element(s))(a);r(d),o(d).append(i),e(a,c,d)})}}}}n.module("material.components.subheader",["material.core","material.components.sticky"]).directive("mdSubheader",r),r.$inject=["$mdSticky","$compile","$mdTheming"]}(window,window.angular);