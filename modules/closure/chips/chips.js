/*!
 * Angular Material Design
 * https://github.com/angular/material
 * @license MIT
 * v0.8.3-master-f3cd5b9
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
      .directive('mdChipRemove', MdChipRemove);

  /**
   * @ngdoc directive
   * @name mdChipRemove
   * @module material.components.chips
   *
   * @description
   * `<md-chip-remove>`
   * Creates a remove button for the given chip.
   *
   * @usage
   * <hljs lang="html">
   *   <md-chip>{{$chip}}<md-chip-remove></md-chip-remove></md-chip>
   * </hljs>
   */

  var REMOVE_CHIP_TEMPLATE = '\
      <md-button ng-if="!$mdChipsCtrl.readonly" ng-click="$mdChipsCtrl.removeChip($index)">\
        <md-icon md-svg-icon="close"></md-icon>\
         <span class="visually-hidden">Remove</span>\
      </md-button>';

  /**
   *
   * @param $compile
   * @param $timeout
   * @returns {{restrict: string, require: string[], link: Function, scope: boolean}}
   * @constructor
   */
  function MdChipRemove ($compile, $timeout) {
    return {
      restrict: 'E',
      template: REMOVE_CHIP_TEMPLATE,
      require: ['^mdChips'],
      scope: false
    };
  }
  MdChipRemove.$inject = ["$compile", "$timeout"];
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
   * @param $mdUtil
   * @param $mdConstant
   * @param $log
   * @ngInject
   * @constructor
   */
  function MdChipsCtrl ($mdUtil, $mdConstant, $log) {
    /** @type {Object} */
    this.$mdConstant = $mdConstant;

    /** @type {$log} */
    this.$log = $log;

    /** @type {angular.NgModelController} */
    this.ngModelCtrl = null;

    /** @type {Object} */
    this.mdAutocompleteCtrl = null;

    /** @type {Array.<Object>} */
    this.items = [];

    /** @type {number} */
    this.selectedChip = -1;

    /**
     * Model used by the input element.
     * @type {string}
     */
    this.chipBuffer = '';

    /**
     * Whether to use the mdChipAppend expression to transform the chip buffer
     * before appending it to the list.
     * @type {boolean}
     */
    this.useMdChipAppend = false;

    /**
     * Whether the Chip buffer is driven by an input element provided by the
     * caller.
     * @type {boolean}
     */
    this.hasInputElement = false;
  }
  MdChipsCtrl.$inject = ["$mdUtil", "$mdConstant", "$log"];


  /**
   * Handles the keydown event on the input element: <enter> appends the
   * buffer to the chip list, while backspace removes the last chip in the list
   * if the current buffer is empty.
   * @param event
   */
  MdChipsCtrl.prototype.defaultInputKeydown = function(event) {
    switch (event.keyCode) {
      case this.$mdConstant.KEY_CODE.ENTER:
        if ( this.chipBuffer ) {
          event.preventDefault();
          this.appendChipBuffer();
        }
        break;
      case this.$mdConstant.KEY_CODE.BACKSPACE: // backspace
        if (!this.chipBuffer) {
					event.preventDefault();
          // TODO(typotter): Probably want to open the previous one for edit instead.
          this.removeChip(this.items.length - 1);
        }
        break;
      default:
    }
  };


  /**
   * Sets the selected chip index to -1.
   */
  MdChipsCtrl.prototype.resetSelectedChip = function() {
    this.selectedChip = -1;
  };


  /**
   * Append the contents of the buffer to the chip list. This method will first
   * call out to the md-chip-append method, if provided
   */
  MdChipsCtrl.prototype.appendChipBuffer = function() {
    var newChip = this.getChipBuffer();
    if (this.useMdChipAppend && this.mdChipAppend) {
      newChip = this.mdChipAppend({'$chip': newChip});
    }
    this.items.push(newChip);
    this.resetChipBuffer();
  };


  /**
   * Sets whether to use the md-chip-append expression. This expression is
   * bound to scope and controller in {@code MdChipsDirective} as
   * {@code mdChipAppend}. Due to the nature of directive scope bindings, the
   * controller cannot know on its own/from the scope whether an expression was
   * actually provided.
   */
  MdChipsCtrl.prototype.useMdChipAppendExpression = function() {
    this.useMdChipAppend = true;
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
      this.$log.error('md-autocomplete not yet supported');
    } else if (this.hasInputElement) {
      this.$log.error('user-provided inputs not yet supported');
    } else {
      return this.chipBuffer;
    }
  };


  /**
   * Resets the input buffer.
   */
  MdChipsCtrl.prototype.resetChipBuffer = function() {
    if (this.mdAutocompleteCtrl) {
      this.$log.error('md-autocomplete not yet supported');
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
   * Marks the chip at the given index as selected.
   * @param index
   */
  MdChipsCtrl.prototype.selectChip = function(index) {
    if (index >= 0 && index <= this.items.length) {
      this.selectedChip = index;
    } else {
      this.$log.warn('Selected Chip index out of bounds; ignoring.');
    }
  };


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
    // TODO(typotter): create and register a selectedItem watcher with mdAutocompleteCtrl.
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
   * `<md-chips>` is an input component for building lists of strings or objects. The list items are displayed as
   * 'chips'. This component can make use of an `<input>` element or an `<md-autocomplete>` element.
   *
   * <strong>Custom `<md-chip>` template</strong>
   * A custom template may be provided to render the content of each chip. This is achieved by specifying an `<md-chip>`
   * element as a child of `<md-chips>`. Note: Any attributes on the passed `<md-chip>` will be dropped as only the
   * innerHTML is used for the chip template. The variables `$chip` and `$index` are available in the scope of
   * `<md-chip>`, representing the chip object and its index int he list of chips, respectively.
   *
   * <h3> Pending Features </h3>
   * <ul style="padding-left:20px;">
   *   <ul>Expand input controls: Support md-autocomplete
   *     <li>plain `<input>` tag as child</li>
   *     <li>textarea input</li>
   *     <li>md-input?</li>
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
   *       <md-chip-edit>` template, show/hide the edit element on tap/click? double tap/double click?
   *     </li>
   *   </ul>
   *
   *   <ul>Truncation and Disambiguation (?)
   *     <li>Truncate chip text where possible, but do not truncate entries such that two are indistinguishable.</li>
   *   </ul>
   *
   *   <ul>Drag and Drop
   *     <li>Drag and drop chips between related `
   *       <md-chips>` elements.
   *     </li>
   *   </ul>
   * </ul>
   *
   *  <span style="font-size:.8em;text-align:center">
   *    Warning: This component is a WORK IN PROGRESS. If you use it now,
   *    it will probably break on you in the future.
   *  </span>
   *
   *
   * @param {string=|object=} ng-model A model to bind the list of items to
   * @param {string=} placeholder Placeholder text that will be forwarded to the input.
   * @param {string=} secondary-placeholder Placeholder text that will be forwarded to the input, displayed when there
   *    is at least on item in the list
   * @param {boolean=} readonly Disables list manipulation (deleting or adding list items), hiding the input and delete
   *    buttons
   * @param {expression} md-chip-append An expression expected to convert the input string into an object when adding
   *    a chip.
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
      <md-chips-wrap ng-if="!$mdChipsCtrl.readonly || $mdChipsCtrl.items.length > 0" class="md-chips">\
        <div role="presentation">\
          <md-chip ng-repeat="$chip in $mdChipsCtrl.items"\
              ng-class="{selected: $mdChipsCtrl.selectedChip == $index}"\
              ng-click="!$mdChipsCtrl.readonly && $mdChipsCtrl.selectChip($index)"\
              class="md-chip">\
          </md-chip>\
          <div ng-if="!$mdChipsCtrl.readonly" class="md-chip-worker"></div>\
        </div>\
      </md-chips-wrap>';

  var CHIP_INPUT_TEMPLATE = '\
        <input\
            placeholder="{{$mdChipsCtrl.items.length == 0 ? $mdChipsCtrl.placeholder : $mdChipsCtrl.secondaryPlaceholder}}"\
            class="md-chip-input"\
            ng-model="$mdChipsCtrl.chipBuffer"\
            ng-focus="$mdChipsCtrl.resetSelectedChip()"\
            ng-keydown="$mdChipsCtrl.defaultInputKeydown($event)">';

  var CHIP_DEFAULT_TEMPLATE = '\
        <span>{{$chip}}</span>\
        <md-chip-remove ng-if="!$mdChipsCtrl.readonly"></md-chip-remove>';



  /**
   * MDChips Directive Definition
   * @param $mdTheming
   * @param $log
   * @ngInject
   */
  function MdChips ($mdTheming, $log) {
    return {
      template: function(element, attrs) {
        // Clone the element into an attribute. By prepending the attribute
        // name with '$', Angular won't write it into the DOM. The cloned
        // element propagates to the link function via the attrs argument,
        // where various contained-elements can be consumed.
        attrs['$mdUserTemplate'] = element.clone();
        return MD_CHIPS_TEMPLATE;
      },
      require: ['ngModel', 'mdChips'],
      restrict: 'E',
      controller:   'MdChipsCtrl',
      controllerAs: '$mdChipsCtrl',
      bindToController: true,
      compile: compile,
      scope: {
        readonly:             '=readonly',
        placeholder:          '@',
        secondaryPlaceholder: '@',
        mdChipAppend:         '&'
      }
    };
    function compile(element, attr) {
      var userTemplate = attr['$mdUserTemplate'];
      var chipEl = userTemplate.find('md-chip');
      var chipHtml;
      if (chipEl.length === 0) {
        chipHtml = CHIP_DEFAULT_TEMPLATE;
      } else {
        // Warn if no remove button is included in the template.
        if (chipEl.find('md-chip-remove').length == 0) {
          $log.warn('md-chip-remove attribute not found in md-chip template.');
        }
        // Take only the chip's inner HTML as the encasing repeater is an md-chip element.
        chipHtml = chipEl[0].innerHTML;
      }
      var listNode = angular.element(element[0].querySelector('.md-chip'));
      listNode.append(chipHtml);

      // Input Element: Look for an autocomplete or an input.
      var inputEl = userTemplate.find('md-autocomplete');
      var hasAutocomplete = inputEl.length > 0;

      if (!hasAutocomplete) {
        // TODO(typotter): Check for an input or a textarea

        // Default element.
        inputEl = angular.element(CHIP_INPUT_TEMPLATE);
        var workerChip = angular.element(element[0].querySelector('.md-chip-worker'));
        workerChip.append(inputEl);
      }

      return function postLink(scope, element, attrs, controllers) {
        $mdTheming(element);
        var ngModelCtrl = controllers[0];
        var mdChipsCtrl = controllers[1];
        mdChipsCtrl.configureNgModel(ngModelCtrl);

        if (attrs.mdChipAppend) {
          mdChipsCtrl.useMdChipAppendExpression();
        }

        if (hasAutocomplete) {
          // TODO(typotter): Tell the mdChipsCtrl about the mdAutocompleteCtrl and have it
          // watch the selectedItem model.
          $log.error('md-autocomplete not yet supported');
        }
      };
    }
  }
  MdChips.$inject = ["$mdTheming", "$log"];
})();
