/*!
 * Angular Material Design
 * https://github.com/angular/material
 * @license MIT
 * v0.8.3-master-f3cd5b9
 */
(function () {
  'use strict';
  /**
   * @ngdoc module
   * @name material.components.autocomplete
   */
  /*
   * @see js folder for autocomplete implementation
   */
  angular.module('material.components.autocomplete', [
    'material.core',
    'material.components.icon'
  ]);
})();

(function () {
  'use strict';
  angular
      .module('material.components.autocomplete')
      .controller('MdAutocompleteCtrl', MdAutocompleteCtrl);

  function MdAutocompleteCtrl ($scope, $element, $mdUtil, $mdConstant, $timeout) {

    //-- private variables

    var self      = this,
        itemParts = $scope.itemsExpr.split(/ in /i),
        itemExpr  = itemParts[1],
        elements  = null,
        promise   = null,
        cache     = {},
        noBlur    = false,
        selectedItemWatchers = [];

    //-- public variables

    self.scope    = $scope;
    self.parent   = $scope.$parent;
    self.itemName = itemParts[0];
    self.matches  = [];
    self.loading  = false;
    self.hidden   = true;
    self.index    = null;
    self.messages = [];
    self.id       = $mdUtil.nextUid();

    //-- public methods

    self.keydown  = keydown;
    self.blur     = blur;
    self.focus    = focus;
    self.clear    = clearValue;
    self.select   = select;
    self.fetch    = $mdUtil.debounce(fetchResults);
    self.getCurrentDisplayValue         = getCurrentDisplayValue;
    self.registerSelectedItemWatcher    = registerSelectedItemWatcher;
    self.unregisterSelectedItemWatcher  = unregisterSelectedItemWatcher;

    self.listEnter = function () { noBlur = true; };
    self.listLeave = function () { noBlur = false; };
    self.mouseUp   = function () { elements.input.focus(); };

    return init();

    //-- initialization methods

    function init () {
      configureWatchers();
      $timeout(function () {
        gatherElements();
        focusElement();
      });
    }

    function focusElement () {
      if ($scope.autofocus) elements.input.focus();
    }

    function configureWatchers () {
      var wait = parseInt($scope.delay, 10) || 0;
      $scope.$watch('searchText', wait
          ? $mdUtil.debounce(handleSearchText, wait)
          : handleSearchText);
      registerSelectedItemWatcher(selectedItemChange);
      $scope.$watch('selectedItem', handleSelectedItemChange);
    }

    function gatherElements () {
      elements = {
        main:  $element[0],
        ul:    $element[0].getElementsByTagName('ul')[0],
        input: $element[0].getElementsByTagName('input')[0]
      };
    }

    //-- event/change handlers

    function selectedItemChange (selectedItem, previousSelectedItem) {
      if (selectedItem) {
        $scope.searchText = getDisplayValue(selectedItem);
      }
      if ($scope.itemChange && selectedItem !== previousSelectedItem)
        $scope.itemChange(getItemScope(selectedItem));
    }

    function handleSelectedItemChange(selectedItem, previousSelectedItem) {
      for (var i = 0; i < selectedItemWatchers.length; ++i) {
        selectedItemWatchers[i](selectedItem, previousSelectedItem);
      }
    }

    /**
     * Register a function to be called when the selected item changes.
     * @param cb
     */
    function registerSelectedItemWatcher(cb) {
      if (selectedItemWatchers.indexOf(cb) == -1) {
        selectedItemWatchers.push(cb);
      }
    }

    /**
     * Unregister a function previously registered for selected item changes.
     * @param cb
     */
    function unregisterSelectedItemWatcher(cb) {
      var i = selectedItemWatchers.indexOf(cb);
      if (i != -1) {
        selectedItemWatchers.splice(i, 1);
      }
    }

    function handleSearchText (searchText, previousSearchText) {
      self.index = getDefaultIndex();
      //-- do nothing on init if there is no initial value
      if (!searchText && searchText === previousSearchText) return;
      //-- clear selected item if search text no longer matches it
      if (searchText !== getDisplayValue($scope.selectedItem)) $scope.selectedItem = null;
      else return;
      //-- trigger change event if available
      if ($scope.textChange && searchText !== previousSearchText)
        $scope.textChange(getItemScope($scope.selectedItem));
      //-- cancel results if search text is not long enough
      if (!isMinLengthMet()) {
        self.loading = false;
        self.matches = [];
        self.hidden = shouldHide();
        updateMessages();
      } else {
        handleQuery();
      }
    }

    function blur () {
      if (!noBlur) self.hidden = true;
    }

    function focus () {
      //-- if searchText is null, let's force it to be a string
      if (!angular.isString($scope.searchText)) return $scope.searchText = '';
      self.hidden = shouldHide();
      if (!self.hidden) handleQuery();
    }

    function keydown (event) {
      switch (event.keyCode) {
        case $mdConstant.KEY_CODE.DOWN_ARROW:
          if (self.loading) return;
          event.preventDefault();
          self.index = Math.min(self.index + 1, self.matches.length - 1);
          updateScroll();
          updateSelectionMessage();
          break;
        case $mdConstant.KEY_CODE.UP_ARROW:
          if (self.loading) return;
          event.preventDefault();
          self.index = Math.max(0, self.index - 1);
          updateScroll();
          updateSelectionMessage();
          break;
        case $mdConstant.KEY_CODE.ENTER:
          if (self.loading || self.index < 0) return;
          event.preventDefault();
          select(self.index);
          break;
        case $mdConstant.KEY_CODE.ESCAPE:
          self.matches = [];
          self.hidden = true;
          self.index = getDefaultIndex();
          break;
        case $mdConstant.KEY_CODE.TAB:
          break;
        default:
      }
    }

    //-- getters

    function getMinLength () {
      return angular.isNumber($scope.minLength) ? $scope.minLength : 1;
    }

    function getDisplayValue (item) {
      return (item && $scope.itemText) ? $scope.itemText(getItemScope(item)) : item;
    }

    function getItemScope (item) {
      if (!item) return;
      var locals = {};
      if (self.itemName) locals[self.itemName] = item;
      return locals;
    }

    function getDefaultIndex () {
      return $scope.autoselect ? 0 : -1;
    }

    function shouldHide () {
      if (!isMinLengthMet()) return true;
      return self.matches.length === 1
          && $scope.searchText === getDisplayValue(self.matches[0])
          && $scope.selectedItem === self.matches[0];
    }

    function getCurrentDisplayValue () {
      return getDisplayValue(self.matches[self.index]);
    }

    function isMinLengthMet () {
      return $scope.searchText.length >= getMinLength();
    }

    //-- actions

    function select (index) {
      $scope.selectedItem = self.matches[index];
      $scope.searchText = getDisplayValue($scope.selectedItem) || $scope.searchText;
      self.hidden = true;
      self.index = 0;
      self.matches = [];
    }

    function clearValue () {
      $scope.searchText = '';
      select(-1);
      elements.input.focus();
    }

    function fetchResults (searchText) {
      var items = $scope.$parent.$eval(itemExpr),
          term = searchText.toLowerCase();
      if (angular.isArray(items)) {
        handleResults(items);
      } else {
        self.loading = true;
        if (items.success) items.success(handleResults);
        if (items.then)    items.then(handleResults);
        if (items.error)   items.error(function () { self.loading = false; });
      }
      function handleResults (matches) {
        cache[term] = matches;
        if (searchText !== $scope.searchText) return; //-- just cache the results if old request
        promise = null;
        self.loading = false;
        self.matches = matches;
        self.hidden = shouldHide();
        updateMessages();
      }
    }

    function updateMessages () {
      if (self.hidden) return;
      switch (self.matches.length) {
        case 0:  return self.messages.splice(0);
        case 1:  return self.messages.push({ display: 'There is 1 match available.' });
        default: return self.messages.push({ display: 'There are '
            + self.matches.length
            + ' matches available.' });
      }
    }

    function updateSelectionMessage () {
      self.messages.push({ display: getCurrentDisplayValue() });
    }

    function updateScroll () {
      var top = 41 * self.index,
          bot = top + 41,
          hgt = 41 * 5.5;
      if (top < elements.ul.scrollTop) {
        elements.ul.scrollTop = top;
      } else if (bot > elements.ul.scrollTop + hgt) {
        elements.ul.scrollTop = bot - hgt;
      }
    }

    function handleQuery () {
      var searchText = $scope.searchText,
          term = searchText.toLowerCase();
      //-- cancel promise if a promise is in progress
      if (promise && promise.cancel) {
        promise.cancel();
        promise = null;
      }
      //-- if results are cached, pull in cached results
      if (!$scope.noCache && cache[term]) {
        self.matches = cache[term];
        updateMessages();
      } else {
        fetchResults(searchText);
      }
      self.hidden = shouldHide();
    }

  }
  MdAutocompleteCtrl.$inject = ["$scope", "$element", "$mdUtil", "$mdConstant", "$timeout"];
})();

(function () {
  'use strict';
  angular
      .module('material.components.autocomplete')
      .directive('mdAutocomplete', MdAutocomplete);

  /**
   * @ngdoc directive
   * @name mdAutocomplete
   * @module material.components.autocomplete
   *
   * @description
   * `<md-autocomplete>` is a special input component with a drop-down of all possible matches to a custom query.
   * This component allows you to provide real-time suggestions as the user types in the input area.
   *
   * @param {expression} md-items An expression in the format of `item in items` to iterate over matches for your search.
   * @param {expression} md-selected-item-change An expression to be run each time a new item is selected
   * @param {expression} md-search-text-change An expression to be run each time the search text updates
   * @param {string=} md-search-text A model to bind the search query text to
   * @param {object=} md-selected-item A model to bind the selected item to
   * @param {string=} md-item-text An expression that will convert your object to a single string.
   * @param {string=} placeholder Placeholder text that will be forwarded to the input.
   * @param {boolean=} md-no-cache Disables the internal caching that happens in autocomplete
   * @param {boolean=} ng-disabled Determines whether or not to disable the input field
   * @param {number=} md-min-length Specifies the minimum length of text before autocomplete will make suggestions
   * @param {number=} md-delay Specifies the amount of time (in milliseconds) to wait before looking for results
   * @param {boolean=} md-autofocus If true, will immediately focus the input element
   * @param {boolean=} md-autoselect If true, the first item will be selected by default
   *
   * @usage
   * <hljs lang="html">
   *   <md-autocomplete
   *       md-selected-item="selectedItem"
   *       md-search-text="searchText"
   *       md-items="item in getMatches(searchText)"
   *       md-item-text="item.display">
   *     <span md-highlight-text="searchText">{{item.display}}</span>
   *   </md-autocomplete>
   * </hljs>
   */

  function MdAutocomplete () {
    return {
      controller:   'MdAutocompleteCtrl',
      controllerAs: '$mdAutocompleteCtrl',
      link:         link,
      scope:        {
        name:          '@',
        searchText:    '=?mdSearchText',
        selectedItem:  '=?mdSelectedItem',
        itemsExpr:     '@mdItems',
        itemText:      '&mdItemText',
        placeholder:   '@placeholder',
        noCache:       '=?mdNoCache',
        itemChange:    '&?mdSelectedItemChange',
        textChange:    '&?mdSearchTextChange',
        isDisabled:    '=?ngDisabled',
        minLength:     '=?mdMinLength',
        delay:         '=?mdDelay',
        autofocus:     '=?mdAutofocus',
        floatingLabel: '@?mdFloatingLabel',
        autoselect:    '=?mdAutoselect'
      },
      template: function (element, attr) {
        attr.$mdAutocompleteTemplate = element.html();
        return '\
          <md-autocomplete-wrap role="listbox">\
            <md-input-container ng-if="floatingLabel">\
              <label>{{floatingLabel}}</label>\
              <input type="text"\
                  id="fl-input-{{$mdAutocompleteCtrl.id}}"\
                  name="{{name}}"\
                  autocomplete="off"\
                  ng-disabled="isDisabled"\
                  ng-model="$mdAutocompleteCtrl.scope.searchText"\
                  ng-keydown="$mdAutocompleteCtrl.keydown($event)"\
                  ng-blur="$mdAutocompleteCtrl.blur()"\
                  ng-focus="$mdAutocompleteCtrl.focus()"\
                  aria-owns="ul-{{$mdAutocompleteCtrl.id}}"\
                  aria-label="{{floatingLabel}}"\
                  aria-autocomplete="list"\
                  aria-haspopup="true"\
                  aria-activedescendant=""\
                  aria-expanded="{{!$mdAutocompleteCtrl.hidden}}"/>\
                \
            </md-input-container>\
            <input type="text"\
                id="input-{{$mdAutocompleteCtrl.id}}"\
                name="{{name}}"\
                ng-if="!floatingLabel"\
                autocomplete="off"\
                ng-disabled="isDisabled"\
                ng-model="$mdAutocompleteCtrl.scope.searchText"\
                ng-keydown="$mdAutocompleteCtrl.keydown($event)"\
                ng-blur="$mdAutocompleteCtrl.blur()"\
                ng-focus="$mdAutocompleteCtrl.focus()"\
                placeholder="{{placeholder}}"\
                aria-owns="ul-{{$mdAutocompleteCtrl.id}}"\
                aria-label="{{placeholder}}"\
                aria-autocomplete="list"\
                aria-haspopup="true"\
                aria-activedescendant=""\
                aria-expanded="{{!$mdAutocompleteCtrl.hidden}}"/>\
            <button\
                type="button"\
                ng-if="$mdAutocompleteCtrl.scope.searchText && !isDisabled"\
                ng-click="$mdAutocompleteCtrl.clear()">\
              <md-icon md-svg-icon="cancel"></md-icon>\
              <span class="visually-hidden">Clear</span>\
            </button>\
            <md-progress-linear\
                ng-if="$mdAutocompleteCtrl.loading"\
                md-mode="indeterminate"></md-progress-linear>\
            <ul role="presentation"\
                id="ul-{{$mdAutocompleteCtrl.id}}"\
                ng-mouseenter="$mdAutocompleteCtrl.listEnter()"\
                ng-mouseleave="$mdAutocompleteCtrl.listLeave()"\
                ng-mouseup="$mdAutocompleteCtrl.mouseUp()">\
              <li ng-repeat="(index, item) in $mdAutocompleteCtrl.matches"\
                  ng-class="{ selected: index === $mdAutocompleteCtrl.index }"\
                  ng-hide="$mdAutocompleteCtrl.hidden"\
                  ng-click="$mdAutocompleteCtrl.select(index)"\
                  md-autocomplete-list-item-template="contents"\
                  md-autocomplete-list-item="$mdAutocompleteCtrl.itemName">\
              </li>\
            </ul>\
          </md-autocomplete-wrap>\
          <aria-status\
              class="visually-hidden"\
              role="status"\
              aria-live="assertive">\
            <p ng-repeat="message in $mdAutocompleteCtrl.messages">{{message.display}}</p>\
          </aria-status>';
      }
    };

    function link (scope, element, attr) {
      scope.contents = attr.$mdAutocompleteTemplate;
      angular.forEach(scope.$$isolateBindings, function (binding, key) {
        if (binding.optional && angular.isUndefined(scope[key])) {
          scope[key] = attr.hasOwnProperty(attr.$normalize(binding.attrName));
        }
      });
    }
  }
})();

(function () {
  'use strict';
  angular
      .module('material.components.autocomplete')
      .controller('MdHighlightCtrl', MdHighlightCtrl);

  function MdHighlightCtrl ($scope, $element, $interpolate) {
    var term = $element.attr('md-highlight-text'),
        text = $interpolate($element.text())($scope),
        flags = $element.attr('md-highlight-flags') || '',
        watcher = $scope.$watch(term, function (term) {
          var regex = getRegExp(term, flags),
              html = text.replace(regex, '<span class="highlight">$&</span>');
          $element.html(html);
        });
    $element.on('$destroy', function () { watcher(); });

    function sanitize (term) {
      if (!term) return term;
      return term.replace(/[\*\[\]\(\)\{\}\\\^\$]/g, '\\$&');
    }

    function getRegExp (text, flags) {
      var str = '';
      if (flags.indexOf('^') >= 1) str += '^';
      str += text;
      if (flags.indexOf('$') >= 1) str += '$';
      return new RegExp(sanitize(str), flags.replace(/[\$\^]/g, ''));
    }
  }
  MdHighlightCtrl.$inject = ["$scope", "$element", "$interpolate"];

})();

(function () {
  'use strict';
  angular
      .module('material.components.autocomplete')
      .directive('mdHighlightText', MdHighlight);

  /**
   * @ngdoc directive
   * @name mdHighlightText
   * @module material.components.autocomplete
   *
   * @description
   * The `md-highlight-text` directive allows you to specify text that should be highlighted within
   * an element.  Highlighted text will be wrapped in `<span class="highlight"></span>` which can
   * be styled through CSS.  Please note that child elements may not be used with this directive.
   *
   * @param {string} md-highlight-text A model to be searched for
   * @param {string=} md-highlight-flags A list of flags (loosely based on JavaScript RexExp flags).
   *    #### **Supported flags**:
   *    - `g`: Find all matches within the provided text
   *    - `i`: Ignore case when searching for matches
   *    - `$`: Only match if the text ends with the search term
   *    - `^`: Only match if the text begins with the search term
   *
   * @usage
   * <hljs lang="html">
   * <input placeholder="Enter a search term..." ng-model="searchTerm" type="text" />
   * <ul>
   *   <li ng-repeat="result in results" md-highlight-text="searchTerm">
   *     {{result.text}}
   *   </li>
   * </ul>
   * </hljs>
   */

  function MdHighlight () {
    return {
      terminal: true,
      scope: false,
      controller: 'MdHighlightCtrl'
    };
  }
})();

(function () {
  'use strict';
  angular
      .module('material.components.autocomplete')
      .directive('mdAutocompleteListItem', MdAutocompleteListItem);

  function MdAutocompleteListItem ($compile, $mdUtil) {
    return {
      require: '^?mdAutocomplete',
      terminal: true,
      link: link,
      scope: false
    };
    function link (scope, element, attr, ctrl) {
      var newScope = ctrl.parent.$new(false, ctrl.parent),
          itemName = ctrl.scope.$eval(attr.mdAutocompleteListItem);
      newScope[itemName] = scope.item;
      element.html(ctrl.scope.$eval(attr.mdAutocompleteListItemTemplate));
      $compile(element.contents())(newScope);
      element.attr({ 'role': 'option', 'id': 'item_' + $mdUtil.nextUid() });
    }
  }
  MdAutocompleteListItem.$inject = ["$compile", "$mdUtil"];
})();
