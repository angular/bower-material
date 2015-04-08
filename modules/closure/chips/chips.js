/*!
 * Angular Material Design
 * https://github.com/angular/material
 * @license MIT
 * v0.8.3-master-d0b427d
 */
goog.provide('ng.material.components.chips');
goog.require('ng.material.core');
(function () {
  'use strict';
  /**
   * @ngdoc module
   * @name material.components.chips
   */
  /*
   * @see js folder for chips implementation
   */
  angular.module('material.components.chips', [
    'material.core'
  ]);
})();

(function () {
  'use strict';
  angular
      .module('material.components.chips')
      .directive('mdChip', MdChip);

  /**
   * @ngdoc directive
   * @name mdChip
   * @module material.components.chips
   *
   * @description
   * `<md-chip>` is a component used within `<md-chips>` and is responsible for rendering individual
   * chips.
   *
   *
   * @usage
   * <hljs lang="html">
   *   <md-chip>{{$chip}}</md-chip>
   * </hljs>
   *
   */

  // This hint text is hidden within a chip but used by screen readers to
  // inform the user how they can interact with a chip.
  var DELETE_HINT_TEMPLATE = '\
      <span ng-if="!$mdChipsCtrl.readonly" class="md-visually-hidden">\
        {{$mdChipsCtrl.deleteHint}}\
      </span>';

  /**
   * MDChip Directive Definition
   *
   * @param $mdTheming
   * @param $mdInkRipple
   * @ngInject
   */
  function MdChip($mdTheming) {
    return {
      restrict: 'E',
      requires: '^mdChips',
      compile: compile
    };

    function compile(element, attr) {
      element.append(DELETE_HINT_TEMPLATE);
      return function postLink(scope, element, attr) {
        element.addClass('md-chip');
        $mdTheming(element);
      };
    }
  }
  MdChip.$inject = ["$mdTheming"];

})();

(function () {
  'use strict';
  angular
      .module('material.components.chips')
      .directive('mdChipRemove', MdChipRemove);

  /**
   * @ngdoc directive
   * @name mdChipRemove
   * @module material.components.chips
   *
   * @description
   * `<md-chip-remove>`
   * Designates a button as a trigger to remove the chip.
   *
   * @usage
   * <hljs lang="html">
   *   <md-chip-template>{{$chip}}<button md-chip-remove>DEL</button></md-chip-template>
   * </hljs>
   */


  /**
   *
   * @param $compile
   * @param $timeout
   * @returns {{restrict: string, require: string[], link: Function, scope: boolean}}
   * @constructor
   */
  function MdChipRemove ($timeout) {
    return {
      restrict: 'A',
      require: '^mdChips',
      scope: false,
      link: postLink
    };

    function postLink(scope, element, attr, ctrl) {
      element.on('click', function(event) {
        scope.$apply(function() {
          ctrl.removeChip(scope.$index);
        });
      });

      // Child elements aren't available until after a $timeout tick as they are hidden by an
      // `ng-if`. see http://goo.gl/zIWfuw
      $timeout(function() {
        element.find('button').attr('tabindex', '-1');
      });
    }
  }
  MdChipRemove.$inject = ["$timeout"];
})();

(function () {
  'use strict';
  angular
      .module('material.components.chips')
      .controller('MdChipsCtrl', MdChipsCtrl);



  /**
   * Controller for the MdChips component. Responsible for adding to and
   * removing from the list of chips, marking chips as selected, and binding to
   * the models of various input components.
   *
   * @param $scope
   * @param $mdUtil
   * @param $mdConstant
   * @param $log
   * @param $element
   * @constructor
   */
  function MdChipsCtrl ($scope, $mdUtil, $mdConstant, $log, $element) {
    /** @type {Object} */
    this.$mdConstant = $mdConstant;

    /** @type {angular.$scope} */
    this.$scope = $scope;

    /** @type {$log} */
    this.$log = $log;

    /** @type {$element} */
    this.$element = $element;

    /** @type {angular.NgModelController} */
    this.ngModelCtrl = null;

    /** @type {Object} */
    this.mdAutocompleteCtrl = null;

    /** @type {angular.NgModelController} */
    this.userInputNgModelCtrl = null;

    /** @type {Element} */
    this.userInputElement = null;

    /** @type {Array.<Object>} */
    this.items = [];

    /** @type {number} */
    this.selectedChip = -1;


    /**
     * Hidden hint text for how to delete a chip. Used to give context to screen readers.
     * @type {string}
     */
    this.deleteHint = 'Press delete to remove this chip.';

    /**
     * Hidden label for the delete button. Used to give context to screen readers.
     * @type {string}
     */
    this.deleteButtonLabel = 'Remove';

    /**
     * Model used by the input element.
     * @type {string}
     */
    this.chipBuffer = '';

    /**
     * Whether to use the mdOnAppend expression to transform the chip buffer
     * before appending it to the list.
     * @type {boolean}
     */
    this.useMdOnAppend = false;
  }
  MdChipsCtrl.$inject = ["$scope", "$mdUtil", "$mdConstant", "$log", "$element"];


  /**
   * Handles the keydown event on the input element: <enter> appends the
   * buffer to the chip list, while backspace removes the last chip in the list
   * if the current buffer is empty.
   * @param event
   */
  MdChipsCtrl.prototype.inputKeydown = function(event) {
    switch (event.keyCode) {
      case this.$mdConstant.KEY_CODE.ENTER:
        var chipBuffer = this.getChipBuffer();
        if (chipBuffer) {
          event.preventDefault();
          this.appendChip(chipBuffer);
          this.resetChipBuffer();
        }
        break;
      case this.$mdConstant.KEY_CODE.BACKSPACE:
        if (!this.chipBuffer) {
          event.preventDefault();
          // TODO(typotter): Probably want to open the previous one for edit instead.
          if (this.items.length > 0) {
            this.removeChip(this.items.length - 1);
          }
          event.target.focus();
        }
        break;
    }
  };


  /**
   * Handles the keydown event on an `<md-chip>` element.
   * @param index
   * @param event
   */
  MdChipsCtrl.prototype.chipKeydown = function(index, event) {
    switch (event.keyCode) {
      case this.$mdConstant.KEY_CODE.BACKSPACE:
      // TODO(typotter): Probably want to open the current (prev?) one for edit instead.
      case this.$mdConstant.KEY_CODE.DELETE:
        if (index >= 0) {
          event.preventDefault();
          this.removeAndSelectAdjacentChip(index);
        }
        break;
      case this.$mdConstant.KEY_CODE.LEFT_ARROW:
        this.selectChipSafe(this.selectedChip - 1);
        break;
      case this.$mdConstant.KEY_CODE.RIGHT_ARROW:
        this.selectChipSafe(this.selectedChip + 1);
        break;
    }
  };


  /**
   * Get the input's placeholder - uses `placeholder` when list is empty and `secondary-placeholder`
   * when the list is non-empty. If `secondary-placeholder` is not provided, `placeholder` is used
   * always.
   */
  MdChipsCtrl.prototype.getPlaceholder = function() {
    // Allow `secondary-placeholder` to be blank.
    var useSecondary = (this.items.length &&
        (this.secondaryPlaceholder == '' || this.secondaryPlaceholder));
    return useSecondary ? this.placeholder : this.secondaryPlaceholder;
  };


  /**
   * Removes chip at {@code index} and selects the adjacent chip.
   * @param index
   */
  MdChipsCtrl.prototype.removeAndSelectAdjacentChip = function(index) {
    var selIndex = this.getAdjacentChipIndex(index);
    this.removeChip(index);
    this.selectAndFocusChip(selIndex);
  };


  /**
   * Sets the selected chip index to -1.
   */
  MdChipsCtrl.prototype.resetSelectedChip = function() {
    this.selectedChip = -1;
  };


  /**
   * Gets the index of an adjacent chip to select after deletion. Adjacency is
   * determined as the next chip in the list, unless the target chip is the
   * last in the list, then it is the chip immediately preceding the target. If
   * there is only one item in the list, -1 is returned (select none).
   * The number returned is the index to select AFTER the target has been
   * removed.
   * If the current chip is not selected, then -1 is returned to select none.
   */
  MdChipsCtrl.prototype.getAdjacentChipIndex = function(index) {
    var len = this.items.length - 1;
    return (len == 0) ? -1 :
        (index == len) ? index -1 : index;
  };


  /**
   * Append the contents of the buffer to the chip list. This method will first
   * call out to the md-on-append method, if provided
   * @param newChip
   */
  MdChipsCtrl.prototype.appendChip = function(newChip) {
    if (this.useMdOnAppend && this.mdOnAppend) {
      newChip = this.mdOnAppend({'$chip': newChip});
    }
    this.items.push(newChip);
  };


  /**
   * Sets whether to use the md-on-append expression. This expression is
   * bound to scope and controller in {@code MdChipsDirective} as
   * {@code mdOnAppend}. Due to the nature of directive scope bindings, the
   * controller cannot know on its own/from the scope whether an expression was
   * actually provided.
   */
  MdChipsCtrl.prototype.useMdOnAppendExpression = function() {
    this.useMdOnAppend = true;
  };


  /**
   * Gets the input buffer. The input buffer can be the model bound to the
   * default input item {@code this.chipBuffer}, the {@code selectedItem}
   * model of an {@code md-autocomplete}, or, through some magic, the model
   * bound to any inpput or text area element found within a
   * {@code md-input-container} element.
   * @return {Object|string}
   */
  MdChipsCtrl.prototype.getChipBuffer = function() {
    if (this.mdAutocompleteCtrl) {
      throw Error('getChipBuffer should not be called if there is an md-autocomplete');
    }
    return !this.userInputElement ? this.chipBuffer :
        this.userInputNgModelCtrl ? this.userInputNgModelCtrl.$viewValue :
            this.userInputElement[0].value;
  };


  /**
   * Resets the input buffer for either the internal input or user provided input element.
   */
  MdChipsCtrl.prototype.resetChipBuffer = function() {
    if (this.userInputElement) {
      if (this.userInputNgModelCtrl) {
        this.userInputNgModelCtrl.$setViewValue('');
        this.userInputNgModelCtrl.$render();
      } else {
        this.userInputElement[0].value = '';
      }
    } else {
      this.chipBuffer = '';
    }
  };


  /**
   * Removes the chip at the given index.
   * @param index
   */
  MdChipsCtrl.prototype.removeChip = function(index) {
    this.items.splice(index, 1);
  };


  /**
   * Selects the chip at `index`,
   * @param index
   */
  MdChipsCtrl.prototype.selectChipSafe = function(index) {
    if (this.items.length == 0) {
      this.selectChip(-1);
      return;
    }

    if (index < 0) {
      index = 0;
    } else if (index > this.items.length - 1) {
      index = this.items.length - 1;
    }
    this.selectChip(index);
    this.focusChip(index);
  };


  /**
   * Marks the chip at the given index as selected.
   * @param index
   */
  MdChipsCtrl.prototype.selectChip = function(index) {
    if (index >= -1 && index <= this.items.length) {
      this.selectedChip = index;
    } else {
      this.$log.warn('Selected Chip index out of bounds; ignoring.');
    }
  };


  /**
   * Selects the chip at `index` and gives it focus.
   * @param index
   */
  MdChipsCtrl.prototype.selectAndFocusChip = function(index) {
    this.selectChip(index);
    if (index != -1) {
      this.focusChip(index);
    }
  };


  /**
   * Call `focus()` on the chip at `index`
   */
  MdChipsCtrl.prototype.focusChip = function(index) {
    this.$element[0].querySelector('md-chip[index="' + index + '"] .md-chip-content').focus();
  }


  /**
   * Configures the required interactions with the ngModel Controller.
   * Specifically, set {@code this.items} to the {@code NgModelCtrl#$viewVale}.
   * @param ngModelCtrl
   */
  MdChipsCtrl.prototype.configureNgModel = function(ngModelCtrl) {
    this.ngModelCtrl = ngModelCtrl;

    var self = this;
    ngModelCtrl.$render = function() {
      // model is updated. do something.
      self.items = self.ngModelCtrl.$viewValue;
    };
  };


  /**
   * Configure bindings with the MdAutocomplete control.
   * @param mdAutocompleteCtrl
   */
  MdChipsCtrl.prototype.configureMdAutocomplete = function(mdAutocompleteCtrl) {
    this.mdAutocompleteCtrl = mdAutocompleteCtrl;
    this.mdAutocompleteCtrl.registerSelectedItemWatcher(
        this.mdAutocompleteSelectedItemWatcher.bind(this));
  };


  MdChipsCtrl.prototype.mdAutocompleteSelectedItemWatcher = function(newItem, oldItem) {
    if (newItem && newItem !== oldItem) {
      this.appendChip(newItem);
      this.mdAutocompleteCtrl.clear();
    }
  };


  /**
   * Configure event bindings on a user-provided input element.
   * @param inputElement
   */
  MdChipsCtrl.prototype.configureUserInput = function(inputElement) {
    this.userInputElement = inputElement;

    // Find the NgModelCtrl for the input element
    this.userInputNgModelCtrl = inputElement.controller('ngModel');

    // Bind to keydown and focus events of input
    var scope = this.$scope;
    var ctrl = this;
    inputElement.on('keydown', function(event) {
      scope.$apply(function() {
        ctrl.inputKeydown(event);
      });
    });
  };
})();

(function () {
  'use strict';
  angular
      .module('material.components.chips')
      .directive('mdChips', MdChips);

  /**
   * @ngdoc directive
   * @name mdChips
   * @module material.components.chips
   *
   * @description
   * `<md-chips>` is an input component for building lists of strings or objects. The list items are
   * displayed as 'chips'. This component can make use of an `<input>` element or an
   * `<md-autocomplete>` element.
   *
   * <strong>Custom `<md-chip-template>` template</strong>
   * A custom template may be provided to render the content of each chip. This is achieved by
   * specifying an `<md-chip-template>` element as a child of `<md-chips>`. Note: Any attributes on
   * `<md-chip-template>` will be dropped as only the innerHTML is used for the chip template. The
   * variables `$chip` and `$index` are available in the scope of `<md-chip-template>`, representing
   * the chip object and its index in the list of chips, respectively.
   * To override the chip delete control, include an element (ideally a button) with the attribute
   * `md-chip-remove`. A click listener to remove the chip will be added automatically. The element
   * is also placed as a sibling to the chip content (on which there are also click listeners) to
   * avoid a nested ng-click situation.
   *
   * <h3> Pending Features </h3>
   * <ul style="padding-left:20px;">
   *
   *   <ul>Style
   *     <li>Colours for hover, press states (ripple?).</li>
   *   </ul>
   *
   *   <ul>List Manipulation
   *     <li>delete item via DEL or backspace keys when selected</li>
   *   </ul>
   *
   *   <ul>Validation
   *     <li>de-dupe values (or support duplicates, but fix the ng-repeat duplicate key issue)</li>
   *     <li>allow a validation callback</li>
   *     <li>hilighting style for invalid chips</li>
   *   </ul>
   *
   *   <ul>Item mutation
   *     <li>Support `
   *       <md-chip-edit>` template, show/hide the edit element on tap/click? double tap/double
   *       click?
   *     </li>
   *   </ul>
   *
   *   <ul>Truncation and Disambiguation (?)
   *     <li>Truncate chip text where possible, but do not truncate entries such that two are
   *     indistinguishable.</li>
   *   </ul>
   *
   *   <ul>Drag and Drop
   *     <li>Drag and drop chips between related `<md-chips>` elements.
   *     </li>
   *   </ul>
   * </ul>
   *
   *  <span style="font-size:.8em;text-align:center">
   *    Warning: This component is a WORK IN PROGRESS. If you use it now,
   *    it will probably break on you in the future.
   *  </span>
   *
   * @param {string=|object=} ng-model A model to bind the list of items to
   * @param {string=} placeholder Placeholder text that will be forwarded to the input.
   * @param {string=} secondary-placeholder Placeholder text that will be forwarded to the input,
   *    displayed when there is at least on item in the list
   * @param {boolean=} readonly Disables list manipulation (deleting or adding list items), hiding
   *    the input and delete buttons
   * @param {expression} md-on-append An expression expected to convert the input string into an
   *    object when adding a chip.
   * @param {string=} delete-hint A string read by screen readers instructing users that pressing
   *    the delete key will remove the chip.
   * @param {string=} delete-button-label A label for the delete button. Also hidden and read by
   *    screen readers.
   *
   * @usage
   * <hljs lang="html">
   *   <md-chips
   *       ng-model="myItems"
   *       placeholder="Add an item"
   *       readonly="isReadOnly">
   *   </md-chips>
   * </hljs>
   *
   */


  var MD_CHIPS_TEMPLATE = '\
      <md-chips-wrap\
          ng-if="!$mdChipsCtrl.readonly || $mdChipsCtrl.items.length > 0" class="md-chips">\
        <md-chip ng-repeat="$chip in $mdChipsCtrl.items"\
            index="{{$index}}"\
            ng-class="{selected: $mdChipsCtrl.selectedChip == $index}">\
          <div class="md-chip-content"\
              ng-click="!$mdChipsCtrl.readonly && $mdChipsCtrl.selectChip($index)"\
              ng-keydown="$mdChipsCtrl.chipKeydown($index, $event)"></div>\
        </md-chip>\
        <div\
            ng-if="!$mdChipsCtrl.readonly && $mdChipsCtrl.ngModelCtrl" \
            class="md-chip-input-container"></div>\
      </md-chips-wrap>';

  var CHIP_INPUT_TEMPLATE = '\
        <input\
            placeholder="{{$mdChipsCtrl.getPlaceholder()}}"\
            aria-label="{{$mdChipsCtrl.getPlaceholder()}}"\
            ng-model="$mdChipsCtrl.chipBuffer"\
            ng-focus="$mdChipsCtrl.resetSelectedChip()"\
            ng-keydown="$mdChipsCtrl.inputKeydown($event)">';

  var CHIP_DEFAULT_TEMPLATE = '\
      <span>{{$chip}}</span>';

  var CHIP_REMOVE_TEMPLATE = '\
      <md-button \
          class="md-chip-remove"\
          ng-if="!$mdChipsCtrl.readonly"\
          ng-click="$mdChipsCtrl.removeChip($index)"\
          tabindex="-1">\
        <md-icon md-svg-icon="close"></md-icon>\
        <span class="md-visually-hidden">\
          {{$mdChipsCtrl.deleteButtonLabel}}\
        </span>\
      </md-button>';

  //ng-blur="$mdChipsCtrl.resetSelectedChip()"\

  /**
   * MDChips Directive Definition
   *
   * @param $mdTheming
   * @param $log
   * @param $compile
   * @param $timeout
   * @returns {*}
   * @ngInject
   */
  function MdChips ($mdTheming, $log, $compile, $timeout) {
    return {
      template: function(element, attrs) {
        // Clone the element into an attribute. By prepending the attribute
        // name with '$', Angular won't write it into the DOM. The cloned
        // element propagates to the link function via the attrs argument,
        // where various contained-elements can be consumed.
        attrs['$mdUserTemplate'] = element.clone();
        attrs['tabindex'] = '-1';


        return MD_CHIPS_TEMPLATE;
      },
      require: ['mdChips'],
      restrict: 'E',
      controller: 'MdChipsCtrl',
      controllerAs: '$mdChipsCtrl',
      bindToController: true,
      compile: compile,
      scope: {
        readonly: '=readonly',
        placeholder: '@',
        secondaryPlaceholder: '@',
        mdOnAppend: '&',
        deleteHint: '@',
        deleteButtonLabel: '@'
      }
    };

    /**
     * Builds the final template for `md-chips` and returns the postLink function.
     *
     * Building the template involves 3 key components:
     * static chips
     * chip template
     * input control
     *
     * If no `ng-model` is provided, only the static chip work needs to be done.
     *
     * If no user-passed `md-chip-template` exists, the default template is used. This resulting
     * template is appended to the chip content element.
     *
     * If an `input` or `md-autocomplete` element is provided by the caller, it is set aside for
     * transclusion later. The transclusion happens in `postLink` as the parent scope is required.
     * If no user input is provided, a default one is appended to the input container node in the
     * template.
     *
     * Static Chips (i.e. `md-chip` elements passed from the caller) are gathered and set aside for
     * transclusion in the `postLink` function.
     *
     *
     * @param element
     * @param attr
     * @returns {Function}
     */
    function compile(element, attr) {
      // Grab the user template from attr and reset the attribute to null.
      var userTemplate = attr['$mdUserTemplate'];
      attr['$mdUserTemplate'] = null;


      // Variables needed in `post-link`'s closure:
      var hasNgModel = !!attr['ngModel'],
          transcludeInputElement = null,
          hasAutocomplete = false,
          staticChips = userTemplate.find('md-chip');

      if (hasNgModel) {
        // Extract a chip template or use the default.
        var chipHtml,
            chipTemplate = userTemplate.find('md-chip-template'),
            chipRemoveHtml = CHIP_REMOVE_TEMPLATE;

        if (chipTemplate.length === 0) {
          chipHtml = CHIP_DEFAULT_TEMPLATE;
        } else {
          // If there is a user-provided md-chip-remove, pluck it out and us it instead of the
          // default.
          var chipRemoveEl = angular.element(chipTemplate[0].querySelector('[md-chip-remove]'));
          if (chipRemoveEl.length > 0) {
            chipRemoveHtml = chipRemoveEl[0].outerHTML;
            chipHtml = chipTemplate[0].innerHTML.replace(chipRemoveHtml, '');
          } else {
            chipHtml = chipTemplate[0].innerHTML;
          }
        }

        var chipContentNode = angular.element(element[0].querySelector('.md-chip-content'));
        chipContentNode.append(chipHtml);

        var chipNode = element.find('md-chip');
        chipNode.append(chipRemoveHtml);


        // Input Element: Look for an autocomplete or an input.
        var userInput = userTemplate.find('md-autocomplete');
        if (userInput.length > 0) {
          hasAutocomplete = true;
          transcludeInputElement = userInput[0];
        } else {
          // Look for a plain input.
          userInput = userTemplate.find('input');

          if (userInput.length > 0) {
            transcludeInputElement = userInput[0];
          } else {
            // No user provided input.
            // Default element can be appended now as it is compiled with mdChips' scope.
            getInputContainer(element).append(angular.element(CHIP_INPUT_TEMPLATE));
          }
        }
      }


      /**
       * Configures controller and transcludes elements if necessary.
       */
      return function postLink(scope, element, attrs, controllers) {
        $mdTheming(element);
        element.attr('tabindex', '-1');

        if (hasNgModel) {
          var mdChipsCtrl = controllers[0];
          var ngModelCtrl = element.controller('ngModel');

          mdChipsCtrl.configureNgModel(ngModelCtrl);

          // If an `md-on-append` attribute was set, tell the controller to use the expression
          // when appending chips.
          if (attrs['mdOnAppend']) {
            mdChipsCtrl.useMdOnAppendExpression();
          }

          // Transclude the input element with the parent scope if it exists into the input
          // container.
          if (transcludeInputElement) {
            var transcludedElement = $compile(transcludeInputElement)(scope.$parent);

            if (hasAutocomplete) {
              var mdAutocompleteCtrl = transcludedElement.controller('mdAutocomplete');
              mdChipsCtrl.configureMdAutocomplete(mdAutocompleteCtrl);
            } else {
              mdChipsCtrl.configureUserInput(angular.element(transcludeInputElement));
            }

            // The `ng-if` directive removes the children from the DOM for the rest of this tick, so
            // do the append the element via a timeout. see http://goo.gl/zIWfuw
            $timeout(function() {
              var inputContainer = getInputContainer(element);
              inputContainer.append(transcludedElement);
            });

          }
        }

        // Compile with the parent's scope and prepend any static chips to the wrapper.
        if (staticChips.length > 0) {
          var compiledStaticChips = $compile(staticChips)(scope.$parent);
          $timeout(function() {
            element.find('md-chips-wrap').prepend(compiledStaticChips);
          });
        }
      };
    }
    function getInputContainer(el) {
      return angular.element(el[0].querySelector('.md-chip-input-container'));
    }
  }
  MdChips.$inject = ["$mdTheming", "$log", "$compile", "$timeout"];
})();
