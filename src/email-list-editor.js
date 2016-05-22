(function (angular) {
  angular.module("emailsEditor", ['ui.bootstrap'])
    .provider("emailsEditorConfig", function () {
      var getDefaults = function () {
          var c = {
            typeahead : {
              supported : false,
              expression: ''
            },

            inputNamePrefix : 'email_address'
            inputPlaceHolder : 'Type email',
            buttons : {
              add : {
                icon : 'fa fa-plus',
                cssClass : 'email-action-button okay'
              },
              remove : {
                icon : 'fa fa-times',
                cssClass : 'email-action-button remove'
              }
            }
            wrapperClass : 'email-list',
            itemClass : 'email-item'
          };

          c.value = function (path, defaultValue) {
            var paths = path.split('.'), o = c;

            angular.forEach(paths, function (p) {
              if (angular.isObject(o)) {
                  o = o[p];
              }
            });
            if (angular.isDefined(o)) {
              return o;
            }
            return defaultValue;
          };

          c.put = function (path, value) {
            var paths = path.split('.'), o = c;
            var len = paths.length;
            angular.forEach(paths, function (p, index) {
              if (angular.isUndefined(o[p]) || index == len - 1) {
                  if (index == len - 1) {
                    o[p] = value;
                  }else {
                    o = o[p] = {};
                  }
              }
            });
          };

          return c;
      };
      var config = getDefaults();

      config.config = function (key) {
        if (angular.isUndefined(key)) {
          return config;
        }
        if (angular.isUndefined(config[key])) {
          config[key] = getDefaults();
        }
        return config[key];
      };
      return config;
    })
    .directive("focusOnEmpty", function () {
          return function (scope, element, attr) {
              if (!scope.$eval(attr.focusOnEmpty)) {
                  element.focus();
              }
          };
      })
      .directive("emailListEditor", ['emailsEditorConfig', function (emailsEditorConfig) {
            return {
                restrict : 'E',
                require : 'ngModel',
                template : function (element, attr) {
                    var config = emailsEditorConfig.config(attr.config);
                    var template = [
                      '<ul class="', config.wrapperClass,'">',
                          '<li ng-form="item_form" ng-repeat="item in options.collection" class="', config.itemClass, ' clearfix">',
                            '<div class="item-buttons-wrapper">',
                              '<a class="', config.value('buttons.add.cssClass', 'btn btn-xs btn-default'),
                               '" ng-click="add($index)"><i class="',
                                config.value('buttons.add.icon', 'fa fa-plus'), '"></i></a>',
                              '<a class="', config.value('buttons.remove.cssClass', 'btn btn-xs btn-danger'),
                              '" ng-click="remove($index)"><i class="', config.value('buttons.remove.icon', 'fa fa-times'), '></i></a>',
                            '</div>',
                            (config.typeahead.supported ?
                              '<input type="email" name="' + config.inputNamePrefix + '[{{$index}}]" ng-model="item.email" typeahead="' + config.value('typeahead.expression', '') + '" typeahead-on-select="refreshEmails()"  ng-change="refreshEmails()" placeholder="' + config.inputPlaceHolder + '" required />' :
                              '<input type="email" name="' + config.inputNamePrefix + '[{{$index}}]" ng-model="item.email" ng-change="refreshEmails()" placeholder="' + config.inputPlaceHolder + '" required />' ),
                          '</li>',
                      '</ul>'
                    ].join('');



                    return template;
                },
                link : function ($scope, ele, attr, ctrl) {

                    $scope.options = {
                      collection: [{email : ''}]
                    };

                    $scope.refreshEmails = function () {
                        var emails = pluck(filter($scope.options.collection, function (item) {return isValidEmail(item.email);}), 'email').join(",");
                        $scope.emails = emails;
                        ctrl.$setViewValue(emails);
                    };

                    $scope.remove = function (index) {
                        $scope.options.collection.splice(index, 1);
                        $scope.refreshEmails();
                    };



                    var emailReg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                    function isValidEmail(email) {

                        return emailReg.test(email);
                    }

                    var pluck = function (collection, attr) {
                      var list = [];
                      angular.forEach(collection, function (c) {
                        list.push(c[attr]);
                      });
                      return list;
                    };

                    var filter = function (collection, predigate) {
                      var list = [];
                      angular.forEach(collection, function (c, index) {
                        if (predigate(c, index)) {
                          list.push(c);
                        }
                      });
                      return list;
                    };



                    $scope.add = function (index) {
                        $scope.options.collection.splice(index + 1, 0, {
                            email : ''
                        });
                    };

                    var emails = $scope.$eval(attr.ngModel);
                    if (emails) {
                        $scope.options.collection.length = 0;
                        if (!angular.isArray(emails)) {
                            emails = emails.split(/\,|\;/g);
                        }
                        angular.forEach(emails, function (e) {
                            $scope.options.collection.push({
                                email : e
                            });
                        });
                    }
                }
            }


        }]);
}).call(this, angular);
