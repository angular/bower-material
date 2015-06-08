/*!
 * Angular Material Design
 * https://github.com/angular/material
 * @license MIT
 * v0.9.8-master-f93e117
 */
(function( window, angular, undefined ){
"use strict";

/**
 * @ngdoc module
 * @name material.components.menu
 */

angular.module('material.components.menu', [
  'material.core',
  'material.components.backdrop'
])
.directive('mdMenu', MenuDirective);

/**
 * @ngdoc directive
 * @name mdMenu
 * @module material.components.menu
 * @restrict E
 * @description
 *
 * Menus are elements that open when clicked. They are useful for displaying
 * additional options within the context of an action.
 *
 * Every `md-menu` must specify exactly two child elements. The first element is what is
 * left in the DOM and is used to open the menu. This element is called the origin element.
 * The origin element's scope has access to `$mdOpenMenu()`
 * which it may call to open the menu.
 *
 * The second element is the `md-menu-content` element which represents the
 * contents of the menu when it is open. Typically this will contain `md-menu-item`s,
 * but you can do custom content as well.
 *
 * <hljs lang="html">
 * <md-menu>
 *  <!-- Origin element is a md-button with an icon -->
 *  <md-button ng-click="$mdOpenMenu()" class="md-icon-button">
 *    <md-icon md-svg-icon="call:phone"></md-icon>
 *  </md-button>
 *  <md-menu-content>
 *    <md-menu-item><md-button ng-click="doSomething()">Do Something</md-button></md-menu-item>
 *  </md-menu-content>
 * </md-menu>
 * </hljs>

 * ## Sizing Menus
 *
 * The width of the menu when it is open may be specified by specifying a `width`
 * attribute on the `md-menu-content` element.
 * See the [Material Design Spec](http://www.google.com/design/spec/components/menus.html#menus-specs)
 * for more information.
 *
 *
 * ## Aligning Menus
 *
 * When a menu opens, it is important that the content aligns with the origin element.
 * Failure to align menus can result in jarring experiences for users as content
 * suddenly shifts. To help with this, `md-menu` provides serveral APIs to help
 * with alignment.
 *
 * ### Target Mode
 *
 * By default, `md-menu` will attempt to align the `md-menu-content` by aligning
 * designated child elements in both the origin and the menu content.
 *
 * To specify the alignment element in the `origin` you can use the `md-menu-origin`
 * attribute on a child element. If no `md-menu-origin` is specified, the `md-menu`
 * will be used as the origin element.
 *
 * Similarly, the `md-menu-content` may specify a `md-menu-align-target` for a
 * `md-menu-item` to specify the node that it should try and allign with.
 *
 * In this example code, we specify an icon to be our origin element, and an
 * icon in our menu content to be our alignment target. This ensures that both
 * icons are aligned when the menu opens.
 *
 * <hljs lang="html">
 * <md-menu>
 *  <md-button ng-click="$mdOpenMenu()" class="md-icon-button">
 *    <md-icon md-menu-origin md-svg-icon="call:phone"></md-icon>
 *  </md-button>
 *  <md-menu-content>
 *    <md-menu-item>
 *      <md-button ng-click="doSomething()">
 *        <md-icon md-menu-align-target md-svg-icon="call:phone"></md-icon>
 *        Do Something
 *      </md-button>
 *    </md-menu-item>
 *  </md-menu-content>
 * </md-menu>
 * </hljs>
 *
 * Sometimes we want to specify alignment on the right side of an element, for example
 * if we have a menu on the right side a toolbar, we want to right align our menu content.
 *
 * We can specify the origin by using the `md-position-mode` attribute on both
 * the `x` and `y` axis. Right now only the `x-axis` has more than one option.
 * You may specify the default mode of `target target` or
 * `target-right target` to specify a right-oriented alignment target. See the
 * position section of the demos for more examples.
 *
 * ### Menu Offsets
 *
 * It is sometimes unavoidable to need to have a deeper level of control for
 * the positioning of a menu to ensure perfect alignment. `md-menu` provides
 * the `md-offset` attribute to allow pixel level specificty of adjusting the
 * exact positioning.
 *
 * This offset is provided in the format of `x y` or `n` where `n` will be used
 * in both the `x` and `y` axis.
 *
 * For example, to move a menu by `2px` from the top, we can use:
 * <hljs lang="html">
 * <md-menu md-offset="2 0">
 *   <!-- menu-content -->
 * </md-menu>
 * </hljs>
 *
 * @usage
 * <hljs lang="html">
 * <md-menu>
 *  <md-button ng-click="$mdOpenMenu()" class="md-icon-button">
 *    <md-icon md-svg-icon="call:phone"></md-icon>
 *  </md-button>
 *  <md-menu-content>
 *    <md-menu-item><md-button ng-click="doSomething()">Do Something</md-button></md-menu-item>
 *  </md-menu-content>
 * </md-menu>
 * </hljs>
 *
 * @param {string} md-position-mode The position mode in the form of
             `x`, `y`. Default value is `target`,`target`. Right now the `x` axis
             also suppports `target-right`.
 * @param {string} md-offset An offset to apply to the dropdown after positioning
             `x`, `y`. Default value is `0`,`0`.
 *
 */

function MenuDirective($mdMenu) {
  return {
    restrict: 'E',
    require: 'mdMenu',
    controller: function() { }, // empty function to be built by link
    scope: true,
    compile: compile
  };

  function compile(tEl) {
    tEl.addClass('md-menu');
    tEl.children().eq(0).attr('aria-haspopup', 'true');
    return link;
  }

  function link(scope, el, attrs, mdMenuCtrl) {
    // Se up mdMenuCtrl to keep our code squeaky clean
    buildCtrl();

    // Expose a open function to the child scope for their html to use
    scope.$mdOpenMenu = function() {
      mdMenuCtrl.open();
    };

    if (el.children().length != 2) {
      throw new Error('Invalid HTML for md-menu. Expected two children elements.');
    }

    // Move everything into a md-menu-container
    var menuContainer = angular.element('<div class="md-open-menu-container md-whiteframe-z2"></div>');
    var menuContents = el.children()[1];
    menuContainer.append(menuContents);

    var enabled;
    mdMenuCtrl.enable();

    function buildCtrl() {
      mdMenuCtrl.enable = function enableMenu() {
        if (!enabled) {
          //el.on('keydown', handleKeypress);
          enabled = true;
        }
      };

      mdMenuCtrl.disable = function disableMenu() {
        if (enabled) {
          //el.off('keydown', handleKeypress);
          enabled = false;
        }
      };

      mdMenuCtrl.open = function openMenu() {
        el.attr('aria-expanded', 'true');
        $mdMenu.show({
          mdMenuCtrl: mdMenuCtrl,
          element: menuContainer,
          target: el[0]
        });
      };

      mdMenuCtrl.close = function closeMenu(skipFocus) {
        el.attr('aria-expanded', 'false');
        $mdMenu.hide();
        if (!skipFocus) el.children()[0].focus();
      };

      mdMenuCtrl.positionMode = function() {
        var attachment = (attrs.mdPositionMode || 'target').split(' ');

        if (attachment.length == 1) { attachment.push(attachment[0]); }

        return {
          left: attachment[0],
          top: attachment[1]
        };

      };

      mdMenuCtrl.offsets = function() {
        var offsets = (attrs.mdOffset || '0 0').split(' ').map(function(x) { return parseFloat(x, 10); });
        if (offsets.length == 2) {
          return {
            left: offsets[0],
            top: offsets[1]
          };
        } else if (offsets.length == 1) {
          return {
            top: offsets[0],
            left: offsets[0]
          };
        } else {
          throw new Error('Invalid offsets specified. Please follow format <x, y> or <n>');
        }
      };
    }
  }
}
MenuDirective.$inject = ["$mdMenu"];

angular.module('material.components.menu')
.provider('$mdMenu', MenuProvider);

/*
 * Interim element provider for the menu.
 * Handles behavior for a menu while it is open, including:
 *    - handling animating the menu opening/closing
 *    - handling key/mouse events on the menu element
 *    - handling enabling/disabling scroll while the menu is open
 *    - handling redrawing during resizes and orientation changes
 *
 */

function MenuProvider($$interimElementProvider) {
  var MENU_EDGE_MARGIN = 8;

  menuDefaultOptions.$inject = ["$$rAF", "$window", "$mdUtil", "$mdTheming", "$timeout", "$mdConstant", "$document"];
  return $$interimElementProvider('$mdMenu')
    .setDefaults({
      methods: ['target'],
      options: menuDefaultOptions
    });

  /* ngInject */
  function menuDefaultOptions($$rAF, $window, $mdUtil, $mdTheming, $timeout, $mdConstant, $document) {
    return {
      parent: 'body',
      onShow: onShow,
      onRemove: onRemove,
      hasBackdrop: true,
      disableParentScroll: true,
      skipCompile: true,
      themable: true
    };

    // Interim element onShow fn, handles inserting it into the DOM, wiring up
    // listeners and calling the positioning fn
    function onShow(scope, element, opts) {
      if (!opts.target) {
        throw new Error('$mdMenu.show() expected a target to animate from in options.target');
      }

      angular.extend(opts, {
        alreadyOpen: false,
        isRemoved: false,
        target: angular.element(opts.target), //make sure it's not a naked dom node
        parent: angular.element(opts.parent),
        menuContentEl: angular.element(element[0].querySelector('md-menu-content')),
        backdrop: opts.hasBackdrop && angular.element('<md-backdrop class="md-menu-backdrop md-click-catcher">')
      });

      $mdTheming.inherit(opts.menuContentEl, opts.target);

      opts.resizeFn = function() {
        positionMenu(scope, element, opts);
      };
      angular.element($window).on('resize', opts.resizeFn);
      angular.element($window).on('orientationchange', opts.resizeFn);

      if (opts.disableParentScroll) {
        opts.restoreScroll = $mdUtil.disableScrollAround(opts.target);
      }

      // Only activate click listeners after a short time to stop accidental double taps/clicks
      // from clicking the wrong item
      $timeout(activateInteraction, 75, false);

      if (opts.backdrop) {
        $mdTheming.inherit(opts.backdrop, opts.parent);
        opts.parent.append(opts.backdrop);
      }
      opts.parent.append(element);

      element.removeClass('md-leave');
      $$rAF(function() {
        $$rAF(function() {
          positionMenu(scope, element, opts);
          $$rAF(function() {
            element.addClass('md-active');
            opts.alreadyOpen = true;
            element[0].style[$mdConstant.CSS.TRANSFORM] = '';
          });
        });
      });

      return $mdUtil.transitionEndPromise(element, {timeout: 350});


      // Activate interaction on the menu popup, allowing it to be closed by
      // clicking on the backdrop, with escape, clicking options, etc.
      function activateInteraction() {
        element.addClass('md-clickable');
        opts.backdrop && opts.backdrop.on('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          opts.mdMenuCtrl.close(true);
        });

        opts.menuContentEl.on('keydown', function(ev) {
          scope.$apply(function() {
            switch (ev.keyCode) {
              case $mdConstant.KEY_CODE.ESCAPE: opts.mdMenuCtrl.close(); break;
              case $mdConstant.KEY_CODE.UP_ARROW: focusPrevMenuItem(ev, opts.menuContentEl, opts); break;
              case $mdConstant.KEY_CODE.DOWN_ARROW: focusNextMenuItem(ev, opts.menuContentEl, opts); break;
            }
          });
        });

        opts.menuContentEl.on('click', function(e) {
          var target = e.target;
          do {
            if (target && target.hasAttribute('ng-click')) {
              if (!target.hasAttribute('disabled')) {
                close();
              }
              break;
            }
          } while ((target = target.parentNode) && target != opts.menuContentEl)

          function close() {
            scope.$apply(function() {
              opts.mdMenuCtrl.close();
            });
          }
        });

        var focusTarget = opts.menuContentEl[0].querySelector('[md-menu-focus-target]');
        if (!focusTarget) focusTarget = opts.menuContentEl[0].firstElementChild.firstElementChild;
        focusTarget.focus();
      }
    }

    function focusPrevMenuItem(e, menuEl, opts) {
      var currentItem = $mdUtil.getClosest(e.target, 'MD-MENU-ITEM');

      var items = nodesToArray(menuEl[0].children);
      var currentIndex = items.indexOf(currentItem);

      for (var i = currentIndex - 1; i >= 0; --i) {
        var focusTarget = items[i].firstElementChild || items[i];
        var didFocus = attemptFocus(focusTarget);
        if (didFocus) {
          break;
        }
      }
    }

    function focusNextMenuItem(e, menuEl, opts) {
      var currentItem = $mdUtil.getClosest(e.target, 'MD-MENU-ITEM');

      var items = nodesToArray(menuEl[0].children);

      var currentIndex = items.indexOf(currentItem);

      for (var i = currentIndex + 1; i < items.length; ++i) {
        var focusTarget = items[i].firstElementChild || items[i];
        var didFocus = attemptFocus(focusTarget);
        if (didFocus) {
          break;
        }
      }
    }

    function attemptFocus(el) {
      if (el && el.getAttribute('tabindex') != -1) {
        el.focus();
        if ($document[0].activeElement == el) {
          return true;
        } else {
          return false;
        }
      }
    }

    // Interim element onRemove fn, handles removing the element from the DOM
    function onRemove(scope, element, opts) {
      opts.isRemoved = true;
      element.addClass('md-leave')
        .removeClass('md-clickable');
      angular.element($window).off('resize', opts.resizeFn);
      angular.element($window).off('orientationchange', opts.resizeFn);
      opts.resizeFn = undefined;

      return $mdUtil.transitionEndPromise(element, { timeout: 350 }).then(function() {
        element.removeClass('md-active');
        opts.backdrop && opts.backdrop.remove();
        if (element[0].parentNode === opts.parent[0]) {
          opts.parent[0].removeChild(element[0]);
        }
        opts.restoreScroll && opts.restoreScroll();
      });
    }

    // Handles computing the pop-ups position relative to the target (origin md-menu)
    function positionMenu(scope, el, opts) {
      if (opts.isRemoved) return;

      var containerNode = el[0],
          openMenuNode = el[0].firstElementChild,
          openMenuNodeRect = openMenuNode.getBoundingClientRect(),
          boundryNode = opts.parent[0],
          boundryNodeRect = boundryNode.getBoundingClientRect();

      var originNode = opts.target[0].querySelector('[md-menu-origin]') || opts.target[0],
          originNodeRect = originNode.getBoundingClientRect();


      var bounds = {
        left: boundryNodeRect.left + MENU_EDGE_MARGIN,
        top: boundryNodeRect.top + MENU_EDGE_MARGIN,
        bottom: boundryNodeRect.bottom - MENU_EDGE_MARGIN,
        right: boundryNodeRect.right - MENU_EDGE_MARGIN
      };


      var alignTarget, alignTargetRect, existingOffsets;
      var positionMode = opts.mdMenuCtrl.positionMode();

      if (positionMode.top == 'target' || positionMode.left == 'target' || positionMode.left == 'target-right') {
        // TODO: Allow centering on an arbitrary node, for now center on first menu-item's child
        alignTarget = openMenuNode.firstElementChild.firstElementChild || openMenuNode.firstElementChild;
        alignTarget = alignTarget.querySelector('[md-menu-align-target]') || alignTarget;
        alignTargetRect = alignTarget.getBoundingClientRect();

        var containerNodeStyle = $window.getComputedStyle(containerNode);
        existingOffsets = {
          top: parseFloat(containerNodeStyle.top, 10),
          left: parseFloat(containerNodeStyle.left, 10)
        };
      }

      var position = { };
      var transformOrigin = 'top ';

      switch (positionMode.top) {
        case 'target':
          position.top = existingOffsets.top + originNodeRect.top - alignTargetRect.top;
          break;
        // Future support for mdMenuBar
        // case 'top':
        //   position.top = originNodeRect.top;
        //   break;
        // case 'bottom':
        //   position.top = originNodeRect.top + originNodeRect.height;
        //   break;
        default:
          throw new Error('Invalid target mode "' + positionMode.top + '" specified for md-menu on Y axis.');
      }

      switch (positionMode.left) {
        case 'target':
          position.left = existingOffsets.left + originNodeRect.left - alignTargetRect.left;
          transformOrigin += 'left';
          break;
        case 'target-right':
          position.left = originNodeRect.right - openMenuNodeRect.width + (openMenuNodeRect.right - alignTargetRect.right);
          transformOrigin += 'right';
          break;
        // Future support for mdMenuBar
        // case 'left':
        //   position.left = originNodeRect.left;
        //   transformOrigin += 'left';
        //   break;
        // case 'right':
        //   position.left = originNodeRect.right - containerNode.offsetWidth;
        //   transformOrigin += 'right';
        //   break;
        default:
          throw new Error('Invalid target mode "' + positionMode.left + '" specified for md-menu on X axis.');
      }

      var offsets = opts.mdMenuCtrl.offsets();
      position.top += offsets.top;
      position.left += offsets.left;

      clamp(position);

      el.css({
        top: position.top + 'px',
        left: position.left + 'px'
      });

      containerNode.style[$mdConstant.CSS.TRANSFORM_ORIGIN] = transformOrigin;

      // Animate a scale out if we aren't just repositioning
      if (!opts.alreadyOpen) {
        containerNode.style[$mdConstant.CSS.TRANSFORM] = 'scale(' +
          Math.min(originNodeRect.width / containerNode.offsetWidth, 1.0) + ',' +
          Math.min(originNodeRect.height / containerNode.offsetHeight, 1.0) +
        ')';
      }

      function clamp(pos) {
        pos.top = Math.max(Math.min(pos.top, bounds.bottom - containerNode.offsetHeight), bounds.top);
        pos.left = Math.max(Math.min(pos.left, bounds.right - containerNode.offsetWidth), bounds.left);
      }
    }
  }
}
MenuProvider.$inject = ["$$interimElementProvider"];

// Annoying method to copy nodes to an array, thanks to IE
function nodesToArray(nodes) {
  var results = [];
  for (var i = 0; i < nodes.length; ++i) {
    results.push(nodes.item(i));
  }
  return results;
}

})(window, window.angular);