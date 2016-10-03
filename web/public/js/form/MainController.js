(function() {

  'use strict';

  var app = angular.module('Aztec', ['formly', 'formlyBootstrap', 'ui.bootstrap', 'ui.select', 'ngTagsInput', 'ngSanitize', 'ngMessages'], function config(formlyConfigProvider) {
    var unique = 1;
    formlyConfigProvider.setType({
      name: 'repeatSection',
      templateUrl: 'repeatSection.html',
      controller: function($scope) {
        $scope.formOptions = {
          formState: $scope.formState
        };
        $scope.addNew = addNew;

        $scope.copyFields = copyFields;


        function copyFields(fields) {
          fields = angular.copy(fields);
          addRandomIds(fields);
          return fields;
        }

        function addNew() {
          $scope.model[$scope.options.key] = $scope.model[$scope.options.key] || [];
          var repeatsection = $scope.model[$scope.options.key];
          var lastSection = repeatsection[repeatsection.length - 1];
          var newsection = {};

          repeatsection.push(newsection);
        }

        function addRandomIds(fields) {
          unique++;
          angular.forEach(fields, function(field, index) {
            if (field.fieldGroup) {
              addRandomIds(field.fieldGroup);
              return; // fieldGroups don't need an ID
            }

            if (field.templateOptions && field.templateOptions.fields) {
              addRandomIds(field.templateOptions.fields);
            }

            field.id = field.id || (field.key + '_' + index + '_' + unique + getRandomInt(0, 9999));
          });
        }

        function getRandomInt(min, max) {
          return Math.floor(Math.random() * (max - min)) + min;
        }
      }
    });


  });

  app.run(function(formlyConfig, formlyValidationMessages) {
    var attributes = [
      'date-disabled',
      'custom-class',
      'show-weeks',
      'starting-day',
      'init-date',
      'min-mode',
      'max-mode',
      'format-day',
      'format-month',
      'format-year',
      'format-day-header',
      'format-day-title',
      'format-month-title',
      'year-range',
      'shortcut-propagation',
      'uib-datepicker',
      'show-button-bar',
      'current-text',
      'clear-text',
      'close-text',
      'close-on-date-selection',
      'datepicker-append-to-body'
    ];

    var bindings = [
      'datepicker-mode',
      'min-date',
      'max-date'
    ];

    var ngModelAttrs = {};

    angular.forEach(attributes, function(attr) {
      ngModelAttrs[camelize(attr)] = {
        attribute: attr
      };
    });

    angular.forEach(bindings, function(binding) {
      ngModelAttrs[camelize(binding)] = {
        bound: binding
      };
    });

    formlyConfig.setType({
      name: 'datepicker',
      templateUrl: 'datepicker.html',
      wrapper: ['bootstrapLabel', 'bootstrapHasError'],
      defaultOptions: {
        ngModelAttrs: ngModelAttrs,
        templateOptions: {
          datepickerOptions: {
            format: 'MM.dd.yyyy',
            initDate: new Date()
          }
        }
      },
      controller: ['$scope', function($scope) {
        $scope.datepicker = {};

        $scope.datepicker.opened = false;

        $scope.datepicker.open = function($event) {
          $scope.datepicker.opened = true;
        };
      }]
    });



    formlyConfig.extras.removeChromeAutoComplete = true;
    formlyConfig.setType({
      name: 'typeahead-async',
      templateUrl: 'typeahead-async.html',
      controller: ['$scope', '$http', function($scope, $http) {
        $scope.getItems = function(val, url) {
          return $http.get(url, {
            params: {
              q: val
            }
          }).then(function(response) {
            return response.data.map(function(item) {
              return item;
            });
          });
        };
      }]
    });

    formlyConfig.setType({
      name: 'typeahead',
      templateUrl: 'typeahead.html',
      wrapper: ['bootstrapLabel', 'bootstrapHasError'],
    });

    formlyConfig.setType({
      name: 'tag',
      templateUrl: 'tags.html',
      controller: ['$scope', '$http', function($scope, $http) {

        $scope.getItems = function(val, url, attr) {
          return $http.get(url, {
            params: {
              q : val
            }
          }).then(function(response){
            return response.data.map(function(item){
              return item[attr];
            });
          });
        };
      }]
    });
    formlyConfig.setType({
      name: 'ui-select-single-search',
      extends: 'select',
      templateUrl: 'ui-select-single-async-search.html'
    });



    function camelize(string) {
      string = string.replace(/[\-_\s]+(.)?/g, function(match, chr) {
        return chr ? chr.toUpperCase() : '';
      });
      // Ensure 1st char is always lowercase
      return string.replace(/^([A-Z])/, function(match, chr) {
        return chr ? chr.toLowerCase() : '';
      });
    };

    formlyValidationMessages.addStringMessage('required', 'This field is required');
  });

  app.config(function (formlyConfigProvider) {

  formlyConfigProvider.setWrapper({
    name: 'validation',
    types: ['input', 'textarea', 'typeahead','typeahead-async', 'select'],
    templateUrl: 'error-messages.html'
  });

});
  app.controller('MainController', MainController);

  function MainController($scope, $http, $q, $window) {

    var vm = this;
    vm.onNewSubmit = onNewSubmit;
    vm.onEditSubmit = onEditSubmit;
    vm.save = save;
    vm.beforeSaveCheck = beforeSaveCheck;
    vm.suggest = suggest;
    vm.checkForm = checkForm;
    vm.passWarning = passWarning;
    vm.initEdit2 = initEdit2;
    vm.initSaved = initSaved;
    vm.checkLink = checkLink;
    // The model object that we reference
    // on the <formly-form> element in index.html
    vm.savedID = "";
    vm.basic_section = {};
    $scope.basic = vm.basic_section;
    vm.author_section = {};
    vm.pub_section = {};
    vm.link_section = {};
    vm.dev_section = {};
    vm.version_section = {};
    vm.versionOptions = {};
    vm.io = {};
    vm.license_section = {};
    vm.funding_section = {};

    //validators

    var emailValidator = {
        expression: function(viewValue, modelValue) {
          var value = modelValue || viewValue;
          return $window.validator.isEmail(value);
        },
        message: '$viewValue + " is not a valid email address"'
      };



    // An array of our form fields with configuration
    // and options set. We make reference to this in
    // the 'fields' attribute on the <formly-form> element
    vm.basicFields = [{
        key: 'name',
        type: 'input',
        templateOptions: {
          type: 'text',
          label: 'Resource Name',
          placeholder: 'Enter the name of the resource',
          required: true
        }
      }, {
        key: 'logo_url',
        type: 'input',
        templateOptions: {
          type: 'text',
          label: 'Logo URL',
          placeholder: 'Enter the URL for the logo image (optional)',
          required: false
        }
      }, {
        key: 'description',
        type: 'textarea',
        templateOptions: {
          label: 'Description',
          placeholder: 'Enter a description for the resource',
          rows: 8,
          required: true
        }
      }, {
        key: 'resource_types',
        type: 'repeatSection',
        templateOptions: {
          btnText: 'Add Resource Type',
          fields: [{
            key: 'type',
            type: 'select',
            templateOptions: {
              label: 'Resource Type',
              required: true,
              options: [{
                name: 'Database Web UI',
                value: 'Database Web UI'
              }, {
                name: 'Database Web API',
                value: 'Database Web API'
              },
              {
                name: 'Tool Web UI',
                value: 'Tool Web UI'
              }, {
                name: 'Tool Web API',
                value: 'Tool Web API'
              }, {
                name: 'Command Line Tool',
                value: 'Command Line Tool'
              }, {
                name: 'Standalone Desktop Tool',
                value: 'Standalone Desktop Tool'
              }, {
                name: 'Script',
                value: 'Script'
              }, {
                name: 'Not Compiled Tool',
                value: 'Not Compiled Tool'
              }, {
                name: 'Tool Suite',
                value: 'Tool Suite'
              }, {
                name: 'Module',
                value: 'Module'
              }, {
                name: 'Cloud Service ',
                value: 'Cloud Service'
              }, {
                name: 'Other',
                value: 'Other'
              }]
            }
          }, {
            key: 'other',
            type: 'input',
            templateOptions: {
              label: 'Specify Resource Type',
              type: 'text',
              required: true
            },
            hideExpression: "model.type==null || model.type!='Other'"
          }]
        }
      }, {
        key: 'domains',
        type: 'repeatSection',
        templateOptions: {
          btnText: 'Add Biological/Clinical Domain',
          fields: [{
            key: 'domain',
            type: 'select',
            templateOptions: {
              label: 'Biological/Clinical Domain',
              placeholder: 'Select a domain',
              required: true,
              options: [{
                name: 'Biomedical',
                value: 'Biomedical'
              }, {
                name: 'Epigenomics',
                value: 'Epigenomics'
              }, {
                name: 'Genomics',
                value: 'Genomics'
              }, {
                name: 'Metabolomics',
                value: 'Metabolomics'
              }, {
                name: 'Metagenomics',
                value: 'Metagenomics'
              }, {
                name: 'Proteomics',
                value: 'Proteomics'
              }, {
                name: 'Systems Biology',
                value: 'Systems Biology'
              }]
            }
          }]
        }
      }, {
        key: 'tags',
        type: 'tag',
        templateOptions: {
          type: 'text',
          label: 'Tags',
          placeholder: 'Enter the tag, then press \'ENTER\' (optional)',
          link: '/api/tag',
          attr: 'NAME',
          required: false
        }
      }

    ];

    vm.authorFields = [{
      key: 'authors',
      type: 'repeatSection',
      templateOptions: {
        btnText: 'Add new author',
        required: true,
        fields: [{
          type: 'input',
          key: 'first_name',
          templateOptions: {
            label: 'First Name',
            placeholder: 'Enter the first name',
            required: true
          }
        }, {
          type: 'input',
          key: 'last_name',
          templateOptions: {
            label: 'Last Name',
            placeholder: 'Enter the last name',
            required: true
          }
        }, {
          type: 'input',
          key: 'email',
          validators: {
            emailAddr: emailValidator
          },
          templateOptions: {
            label: 'Author\'s Email',
            type: 'email',
            placeholder: 'Enter the author\'s email',
            required: true
          }


        }]
      }
    }, {
      key: 'maintainers',
      type: 'repeatSection',
      templateOptions: {
        btnText: 'Add new maintainer',
        fields: [{
          type: 'input',
          key: 'first_name',
          templateOptions: {
            label: "Maintainer's First Name",
            placeholder: 'Enter first name of the maintainer',
            required: true
          }
        }, {
          type: 'input',
          key: 'last_name',
          templateOptions: {
            label: "Maintainer's Last Name",
            placeholder: 'Enter last name of the maintainer',
            required: true
          }
        }, {
          type: 'input',
          key: 'email',
          templateOptions: {
            label: 'Maintainer\'s Email',
            type: 'email',
            placeholder: 'Enter the maintainer\'s email',
            required: true
          }


        }]
      }
    }, {
      key: 'affiliation',
      type: 'repeatSection',
      templateOptions: {
        btnText: 'Add new institution',
        fields: [{
          key: 'inst_name',
          type: 'ui-select-single-search',
          hideExpression: 'model.missing',
          templateOptions: {
            optionsAttr: 'bs-options',
            ngOptions: 'option[to.valueProp] as option in to.options | filter: $select.search',
            label: 'Institution Name',
            valueProp: 'PRIMARY_NAME',
            labelProp: 'ALIAS',
            otherProp: 'inst_name',
            placeholder: 'Type and select the name of the institution',
            endpoint: '/api/institution',
            options: [],
            refresh: refreshInst,
            refreshDelay: 500
          }
        }, {
          key: 'new_institution',
          type: 'input',
          templateOptions: {
            type: 'text',
            label: "Institution Name",
            placeholder: 'Enter the name of the institution',
            required: false
          },
          hideExpression: '!model.missing',
        }, {
          key: 'missing',
          type: 'input',
          templateOptions: {
            type: 'checkbox',
            label: "Can't find the institution?",
            value: 'false',
            required: false
          }
        }]
      }
    }];
    vm.pubFields = [{
      key: 'resource_doi',
      type: 'input',
      templateOptions: {
        type: 'text',
        label: 'Resource DOI',
        placeholder: 'Enter DOI for the resource (if any)',
        value: '',
        required: false
      }
    }, {
      key: 'primary_pub_doi',
      type: 'input',
      templateOptions: {
        type: 'text',
        label: 'Primary Publication DOI',
        placeholder: 'Enter DOI for the primary publication',
        required: false
      }
    }, {
      key: 'pub_dois',
      type: 'repeatSection',
      templateOptions: {
        btnText: 'Add new DOI',
        fields: [{
          type: 'input',
          key: 'pub_doi',
          templateOptions: {
            label: 'Publication DOI',
            placeholder: 'Enter DOI for the publication',
            required: false
          }
        }]
      }
    }];

    vm.linkFields = [{
      key: 'links',
      type: 'repeatSection',
      templateOptions: {
        btnText: 'Add new link',
        fields: [{
          type: 'typeahead',
          key: 'name',
          templateOptions: {
            label: 'Link Title',
            placeholder: 'Homepage',
            options: ['Home Page', 'Wiki', 'Publication', 'Download', 'About', 'Contact'],
            required: true
          }
        }, {
          type: 'input',
          key: 'url',
          templateOptions: {
            label: 'Link URL',
            placeholder: 'http://www.homepage.com',
            required: true
          }


        }]
      }
    }];

    vm.devFields = [{
      key: 'code_url',
      type: 'input',
      templateOptions: {
        type: 'text',
        label: 'Source Code URL',
        placeholder: 'Enter a url for the source code repository',
        required: false
      }
    }, {
      key: 'language',
      type: 'repeatSection',
      templateOptions: {
        btnText: 'Add Programming Language',
        fields: [{
          key: 'PRIMARY_NAME',
          type: 'ui-select-single-search',
          templateOptions: {
            optionsAttr: 'bs-options',
            ngOptions: 'option[to.valueProp] as option in to.options | filter: $select.search',
            label: 'Language Name',
            valueProp: 'PRIMARY_NAME',
            labelProp: 'ALIAS',
            otherProp: 'PRIMARY_NAME',
            placeholder: 'Enter the language and select a value',
            endpoint: '/api/language',
            options: [],
            refresh: refreshInst,
            refreshDelay: 500
          }
        }]
      }
    }, {
      key: 'platform',
      type: 'repeatSection',
      templateOptions: {
        btnText: 'Add Platform',
        fields: [{
          type: 'select',
          key: 'name',
          templateOptions: {
            label: 'Platform',
            placeholder: 'Enter the platform',
            options: [{
              name: 'Mac',
              value: 'Mac'
            }, {
              name: 'Windows',
              value: 'Windows'
            }, {
              name: 'Linux',
              value: 'Linux'
            }, {
              name: 'Web',
              value: 'Web'
            }],
            required: true
          }
        }]
      }
    }];
    vm.versionFields = [{
      key: 'latest_version',
      type: 'input',
      templateOptions: {
        type: 'text',
        label: 'Latest Version Number',
        placeholder: 'Enter the latest version number',
        required: false
      }
    }, {
      key: 'latest_version_date',
      type: 'datepicker',
      templateOptions: {
        label: 'Latest Version Date',
        type: 'text',
        datepickerPopup: 'dd-MMMM-yyyy'
      }
    }, {
      key: 'latest_version_desc',
      type: 'textarea',
      templateOptions: {
        label: 'Version Description',
        placeholder: 'Enter the description of the version (optional)',
        required: false
      }
    }, {
      key: 'prev_versions',
      type: 'repeatSection',
      templateOptions: {
        btnText: 'Add previous version',
        fields: [{
          type: 'input',
          key: 'version',
          templateOptions: {
            label: 'Version Number',
            placeholder: 'Enter the version number',
            required: true
          }
        }, {
          key: 'version_date',
          type: 'datepicker',
          templateOptions: {
            label: 'Version Date',
            type: 'text',
            datepickerPopup: 'dd-MMMM-yyyy'
          }
        }, {
          type: 'textarea',
          key: 'version_description',
          templateOptions: {
            label: 'Version Description',
            placeholder: 'Enter the description of the version (optional)',
            required: false
          }
        }]
      }
    }];

    vm.ioFields = [{
      key: 'dependencies',
      type: 'tag',
      templateOptions: {
        type: 'text',
        label: 'Dependencies',
        placeholder: 'Enter the dependency, then press \'ENTER\'',
        link: 'https://maps.googleapis.com/maps/api/geocode/json',
        required: false
      }
    }, {
      key: 'input',
      type: 'tag',
      templateOptions: {
        type: 'text',
        label: 'Input File Type',
        placeholder: 'Enter the Input type',
        link: 'https://maps.googleapis.com/maps/api/geocode/json',
        required: false
      }
    }, {
      key: 'output',
      type: 'tag',
      templateOptions: {
        type: 'text',
        label: 'Output File Type',
        placeholder: 'Enter the output type',
        link: 'https://maps.googleapis.com/maps/api/geocode/json',
        required: false
      }
    }, {
      key: 'workflow',
      type: 'repeatSection',
      className: 'repeat_section',
      templateOptions: {
        btnText: 'Add Workflow',
        fields: [{
          type: 'input',
          key: 'upstream',
          templateOptions: {
            label: 'Upstream',
            placeholder: 'Enter the upstream resource',
            required: true
          }
        }, {
          type: 'input',
          key: 'downstream',
          templateOptions: {
            label: 'Downstream',
            placeholder: 'Enter the downstream resource',
            required: true
          }
        }]
      }
    }];

    vm.licenseFields = [{
      key: 'type',
      type: 'select',
      templateOptions: {
        label: 'License',
        options: [{
          name: 'Apache',
          value: 'Apache'
        }, {
          name: 'GNU Affero General Public License v3.0',
          value: 'GNU Affero General Public License v3.0'
        }, {
          name: 'GNU General Public License v2.0',
          value: 'GNU General Public License v2.0'
        }, {
          name: 'GNU General Public License v3.0',
          value: 'GNU General Public License v3.0'
        }, {
          name: 'MIT License',
          value: 'MIT License'
        }, {
          name: 'Artistic License 2.0',
          value: 'Artistic License 2.0'
        }, {
          name: 'Eclipse Public License 1.0',
          value: 'Eclipse Public License 1.0'
        }, {
          name: 'Simplified BSD',
          value: 'Simplified BSD'
        }, {
          name: 'New BSD',
          value: 'New BSD'
        }, {
          name: 'ISC License',
          value: 'ISC License'
        }, {
          name: 'GNU Lesser General Public License v2.1',
          value: 'GNU Lesser General Public License v2.1'
        }, {
          name: 'GNU Lesser General Public License v3.0',
          value: 'GNU Lesser General Public License v3.0'
        }, {
          name: 'Mozilla Public License 2.0',
          value: 'Mozilla Public License 2.0'
        }, {
          name: 'No License',
          value: 'No License'
        }, {
          name: 'Creative Commons Zero v1.0 Universal',
          value: 'Creative Commons Zero v1.0 Universal'
        }, {
          name: 'The Unlicense',
          value: 'The Unlicense'
        }, {
          name: 'Proprietary',
          value: 'Proprietary'
        }, {
          name: 'Other',
          value: 'Other'
        }]
      }
    }, {
      key: 'name',
      type: 'input',
      templateOptions: {
        type: 'text',
        label: 'Name of License',
        placeholder: 'Enter the name of your license',
        required: true
      },
      hideExpression: "(model.type!='Other' && model.type!='Proprietary')"
    }, {
      key: 'link',
      type: 'input',
      templateOptions: {
        type: 'text',
        label: 'Link to License',
        placeholder: 'Enter the link to the license',
        required: false
      },
      hideExpression: "(model.type!='Other' && model.type!='Proprietary')"
    },
    {
      key: 'description',
      type: 'textarea',
      templateOptions: {
        label: 'Description of license',
        placeholder: 'Enter the description of the license (optional)',
        required: false
      },
      hideExpression: "(model.type!='Other' && model.type!='Proprietary')"
    }];


    vm.fundingFields = [{
      key: 'funding',
      type: 'repeatSection',
      templateOptions: {
        btnText: 'Add Funding Info',
        fields: [{
          type: 'ui-select-single-search',
          key: 'agency',
          templateOptions: {
            optionsAttr: 'bs-options',
            ngOptions: 'option[to.valueProp] as option in to.options | filter: $select.search',
            label: 'Funding Agency',
            valueProp: 'PRIMARY_NAME',
            labelProp: 'ALIAS',
            otherProp: 'funding_agency',
            placeholder: 'Enter the name of the agency',
            endpoint: '/api/agency',
            options: [],
            refresh: refreshInst,
            refreshDelay: 500
          },
          hideExpression: 'model.missing'
        }, {
          key: 'missing',
          type: 'input',
          templateOptions: {
            type: 'checkbox',
            label: "Can't find the agency?",
            value: 'false',
            required: false
          }
        }, {
          key: 'new_agency',
          type: 'input',
          templateOptions: {
            type: 'text',
            label: "Agency Name",
            placeholder: 'Enter the name of the agency',
            required: false
          },
          hideExpression: '!model.missing',
        }, {
          type: 'input',
          key: 'grant',
          templateOptions: {
            label: 'Grant Number',
            placeholder: 'Enter the grant number',
            required: true
          }
        }]
      }}, {
          key: 'bd2k',
          type: 'repeatSection',
          templateOptions: {
            btnText: 'Add BD2K Center',
            fields: [{
              type: 'select',
              key: 'center',
              templateOptions: {
                label: 'BD2K Center',
                options: [{
                  name: 'LINCS-DCIC',
                  value: 'LINCS-DCIC'
                },{
                  name: 'BDDS Center',
                  value: 'BDDS'
                },{
                  name: 'Center for Big Data in Translational Genomics',
                  value: 'BDTG'
                },{
                  name: 'CCD',
                  value: 'CCD'
                },{
                  name: 'CEDAR',
                  value: 'CEDAR'
                },{
                  name: 'CPCP',
                  value: 'CPCP'
                },{
                  name: 'MD2K',
                  value: 'MD2K'
                },{
                  name: 'ENIGMA',
                  value: 'ENIGMA'
                },{
                  name: 'KnowEng',
                  value: 'KnowEng'
                },{
                  name: 'Mobilize',
                  value: 'Mobilize'
                },{
                  name: 'PICSURE',
                  value: 'PICSURE'
                },{
                  name: 'HeartBD2K',
                  value: 'HeartBD2K'
                },
                {
                  name: 'Other',
                  value: 'Other'
                }]
              }
            }, {
              type: 'input',
              key: 'title',
              hideExpression: "model.center!='Other'",
              templateOptions: {
                label: 'BD2K Project Title',
                placeholder: 'Enter the name of the BD2K project',
                required: true
              }
            }]
          }
        }];

    function onNewSubmit() {
      $('#submit-recaptcha').hide();
      $('#submitModal').modal('toggle');
      $('#MessageModal').modal('toggle');
      var submit = {
        savedID: vm.savedID,
        basic: vm.basic_section,
        authors: vm.author_section,
        publication: vm.pub_section,
        links: vm.link_section,
        dev: vm.dev_section,
        version: vm.version_section,
        io: vm.io,
        license: vm.license_section,
        funding: vm.funding_section,
        recaptcha: $('#g-recaptcha-response').val()
      };
      $.post("/review/form", submit)
        .done(function(data) {
          $('#messageLabel').text(data.message);
          if(data.status=='success'){
            var count = 0;
            $('#messageBody').text('Redirecting to tool page');
            setInterval(function(){
                count++;
                $('#messageBody').append('.  ');
                if(count > 3){
                  window.location.href = '/review/tool/'+data.id;
                }
              }, 1000);
          }else{
            $('#MessageModal').modal({
              backdrop: 'true',
              keyboard: 'true'
            });
          }
        });
    };

    function form2solr(data){
      /**
       * @type {{}}
         */
      var result = {};
      result['name'] = data.basic.name;
      result['description'] = data.basic.description;
      result['publicationDOI'] = data.publication.primary_pub_doi;
      result['tags'] = [];
      data.basic.tags.forEach(function(tag){
        result['tags'].push(tag['text']);
      });
      result['authors'] = [];
      data.authors.authors.forEach(function(author){
        result['authors'].push(author['first_name'] + " " + author['last_name']);
      });
      result['institutions'] = [];
      data.authors.institutions.forEach(function (institute) {
        result['institutions'].push(institute['inst_name']);
      });
      // result['linkUrls'] = [];
      // data.links.links.forEach(function (link) {
      //   result['linkUrls'].push({url: link['url'], name: link['name']});
      // });
      result['language'] = [];
      data.dev.language.forEach(function (tech) {
        result['language'].push(tech['PRIMARY_NAME']);
      });
      result['funding'] = [];
      data.funding.funding.forEach(function (grant) {
        var pair = [];
        pair.push(grant['agency']['PRIMARY_NAME'], grant['grant']);
        result['funding'].push(pair);
      });
      return result;
    }

    function onEditSubmit() {
      console.log("On edit submit function in MainController.js");
      $('#submit-recaptcha').hide();
      $('#submitModal').modal('toggle');
      $('#MessageModal').modal('toggle');
      var submit = {
        savedID: vm.savedID,
        basic: vm.basic_section,
        authors: vm.author_section,
        publication: vm.pub_section,
        links: vm.link_section,
        dev: vm.dev_section,
        version: vm.version_section,
        io: vm.io,
        license: vm.license_section,
        funding: vm.funding_section
      };
      var data = form2solr(submit);
      $.ajax({
          url: '/review/push',
          type: 'POST',
          data: {data}
      }).done(function(data) {
        $('#messageLabel').text(data.message);
        if(data.status=='success'){
          var count = 0;
          $('#messageBody').text('Redirecting to tool page');
          setInterval(function(){
              count++;
              $('#messageBody').append('.  ');
              if(count > 2){
                window.location.href = '/review/tool/'+data.id;
              }
            }, 1000);
        }else{
          $('#messageBody').text(data.message);
          $('#MessageModal').modal({
            backdrop: 'true',
            keyboard: 'true'
          });
        }
      });
    };

    function refreshAddresses(address, field) {
      var promise;
      if (!address) {
        promise = $q.when({
          data: {
            results: []
          }
        });
      } else {
        var params = {
          address: address,
          sensor: false
        };
        var endpoint = 'https://maps.googleapis.com/maps/api/geocode/json';
        promise = $http.get(endpoint, {
          params: params
        });
      }
      return promise.then(function(response) {
        field.templateOptions.options = response.data.results;
      });
    };

    function refreshInst(inst, field, endpoint) {
      var promise;
      if (!inst) {
        promise = $q.when({
          data: []
        });
      } else {
        var params = {
          q: inst
        };

        promise = $http.get(endpoint, {
          params: params
        });
      }
      return promise.then(function(response) {
        field.templateOptions.options = response.data;
      });
    };

    function checkForm(){
      var error = false;
      var warn = false;

      var ErrMsg = function(err, msg){
        this.error = err;
        this.msg = msg;
      };

      ErrMsg.prototype.setErr = function(err){
        this.error = err;
      };

      var WarnMsg = function(warn, msg){
        this.warn = warn;
        this.msg = msg;
      };

      WarnMsg.prototype.setWarning = function(warn){
        this.warn = warn;
      };

      var errorMessages = [];
      errorMessages.push(new ErrMsg(false, "Please enter the resource name.")); // resource name
      errorMessages.push(new ErrMsg(false, "Please enter the description of the resource.")); // resource description
      errorMessages.push(new ErrMsg(false, "Please enter at least 1 link or a source code URL.")); // links
      errorMessages.push(new ErrMsg(false, "Please enter a name and/or URL for the link.")); // empty link
      errorMessages.push(new ErrMsg(false, "Cannot leave the resource type blank.")); // resource type
      errorMessages.push(new ErrMsg(false, "Cannot leave the biologial domain blank.")); // biological domain

      var warnMessages = [];
      warnMessages.push(new WarnMsg(false, "You did not enter the resource type(s).")); // resource type
      warnMessages.push(new WarnMsg(false, "You did not enter the biological domain(s).")); // biological domain
      warnMessages.push(new WarnMsg(false, "You did not enter any tags.")); // tags
      warnMessages.push(new WarnMsg(false, "You did not enter any author information).")); // authors
      warnMessages.push(new WarnMsg(false, "You did not enter any publication information.")); // publication
      warnMessages.push(new WarnMsg(false, "You did not enter any development information.")); // dev
      warnMessages.push(new WarnMsg(false, "You did not enter any version information.")); // version
      warnMessages.push(new WarnMsg(false, "You did not enter any input/output information.")); // input/output
      warnMessages.push(new WarnMsg(false, "You did not enter any license information.")); // license
      warnMessages.push(new WarnMsg(false, "You did not enter any funding information.")); // funding

      var html = "<div class='modal-body' style='height:75vh;overflow: auto'>";
      var message = "";

      // check for errors and warnings

      // basic section
      if(Object.keys(vm['basic_section']).length==0){
        errorMessages[0].setErr(true);
        errorMessages[1].setErr(true);
      }else{
        if(vm['basic_section']['name']==undefined){
          errorMessages[0].setErr(true);
        }
        if(vm['basic_section']['description']==undefined){
          errorMessages[1].setErr(true);
        }
        if(vm['basic_section']['resource_types']==undefined){
          warnMessages[0].setWarning(true);
        }else{
          vm['basic_section']['resource_types'].forEach(function(type){
            if(type['type']==undefined || type['type']==null){
              errorMessages[4].setErr(true);
            }
          });
        }
        if(vm['basic_section']['domains']==undefined){
          warnMessages[1].setWarning(true);
        }else{
          vm['basic_section']['domains'].forEach(function(domain){
            if(domain['domain']==undefined || domain['domain']==null){
              errorMessages[5].setErr(true);
            }
          });
        }
        if(vm['basic_section']['tags']==undefined){
          warnMessages[2].setWarning(true);
        }else{
          vm['basic_section']['tags'].forEach(function(tag){
            if(tag['text']==undefined){
              warnMessages[2].setWarning(true);
            }
          });
        }
      }

      // link section
      if((vm['link_section']==undefined || Object.keys(vm['link_section']).length==0 || vm['link_section']['links']==undefined) &&
      (vm['dev_section']['code_url']==undefined || vm['dev_section']['code_url']=="")){
        errorMessages[2].setErr(true);
      }else if(vm['link_section']!=undefined && vm['link_section']['links']){
        var atLeast1 = false;
        vm['link_section']['links'].forEach(function(link){
          atLeast1 = true;
          if(link['name']==undefined || link['url']==undefined){
            if(atLeast1){
              errorMessages[3].setErr(true);
            } else {
              errorMessages[2].setErr(true);
            }
          }
        })
      }

      // authors section
      if(vm['author_section']==undefined || Object.keys(vm['author_section']).length==0){
        warnMessages[3].setWarning(true);
      }
      if(vm['pub_section']==undefined || Object.keys(vm['pub_section']).length==0){
        warnMessages[4].setWarning(true);
      }
      if(vm['dev_section']==undefined || Object.keys(vm['dev_section']).length==0){
        warnMessages[5].setWarning(true);
      }
      if(vm['version_section']==undefined || Object.keys(vm['version_section']).length==0){
        warnMessages[6].setWarning(true);
      }
      if(vm['io']==undefined || Object.keys(vm['io']).length==0){
        warnMessages[7].setWarning(true);
      }
      if(vm['license_section']==undefined || Object.keys(vm['license_section']).length==0){
        warnMessages[8].setWarning(true);
      }
      if(vm['funding_section']==undefined || Object.keys(vm['funding_section']).length==0){
        warnMessages[9].setWarning(true);
      }

      errorMessages.forEach(function(e){
        if(e['error']){
          error = true;
          message+="<li>"+e['msg']+"</li>";
        }
      });
      if(!error){
        warnMessages.forEach(function(w){
          if(w['warn']){
            warn = true;
            message+="<li>"+w['msg']+"</li>";
          }
        });
      }

      if(error || warn){
        message = "<ul>"+message+"</ul>";
      }else{
        message = "<pre id='sub_pre1'>Basic Information"+JSON.stringify(vm.basic_section, null, 4)+"</pre>"+
        "<pre id='sub_pre2'>Author Information"+JSON.stringify(vm.author_section, null, 4)+"</pre>"+
        "<pre id='sub_pre3'>Publication Information"+JSON.stringify(vm.pub_section, null, 4)+"</pre>"+
        "<pre id='sub_pre4'>Related Links"+JSON.stringify(vm.link_section, null, 4)+"</pre>"+
        "<pre id='sub_pre5'>Development Information"+JSON.stringify(vm.dev_section, null, 4)+"</pre>"+
        "<pre id='sub_pre6'>Version History"+JSON.stringify(vm.version_section, null, 4)+"</pre>"+
        "<pre id='sub_pre7'>IO Information"+JSON.stringify(vm.io, null, 4)+"</pre>"+
        "<pre id='sub_pre8'>License Information"+JSON.stringify(vm.license_section, null, 4)+"</pre>"+
        "<pre id='sub_pre9'>Funding Information"+JSON.stringify(vm.funding_section, null, 4)+"</pre>";
      }

      html += message+"</div>";

      if(error){
        $('#submitModalLabel').text('Missing Information');
        html+= "<div class='modal-footer'>"+
                  "<button type='button' class='btn btn-default' data-dismiss='modal'>Okay</button>"+
                "</div>";
      }else if(warn){
        $('#submitModalLabel').text('Warning');
        $('#modal-submit').hide();
        $('#modal-warn').show();
      }else{
        $('#submitModalLabel').text('Submit Information');
        $('#modal-warn').hide();
        $('#modal-submit').show();
      }
      $('#pre-submit').html(html);
    };

    function passWarning() {
      $('#pre-submit').html(
        "<div class='modal-body' style='height:75vh;overflow: auto'>"+
        "<pre id='sub_pre1'>Basic Information"+JSON.stringify(vm.basic_section, null, 4)+"</pre>"+
        "<pre id='sub_pre2'>Author Information"+JSON.stringify(vm.author_section, null, 4)+"</pre>"+
        "<pre id='sub_pre3'>Publication Information"+JSON.stringify(vm.pub_section, null, 4)+"</pre>"+
        "<pre id='sub_pre4'>Related Links"+JSON.stringify(vm.link_section, null, 4)+"</pre>"+
        "<pre id='sub_pre5'>Development Information"+JSON.stringify(vm.dev_section, null, 4)+"</pre>"+
        "<pre id='sub_pre6'>Version History"+JSON.stringify(vm.version_section, null, 4)+"</pre>"+
        "<pre id='sub_pre7'>IO Information"+JSON.stringify(vm.io, null, 4)+"</pre>"+
        "<pre id='sub_pre8'>License Information"+JSON.stringify(vm.license_section, null, 4)+"</pre>"+
        "<pre id='sub_pre9'>Funding Information"+JSON.stringify(vm.funding_section, null, 4)+"</pre>"+
        "</div>"
      );
      $('#submitModalLabel').text('Submit Information');
      $('#modal-warn').hide();
      $('#modal-submit').show();
      $('#submit-recaptcha').show();
    };

    function suggest(){
      var fields = {
        basic: vm.basic_section,
        authors: vm.author_section,
        publication: vm.pub_section,
        links: vm.link_section,
        dev: vm.dev_section,
        version: vm.version_section,
        io: vm.io,
        license: vm.license_section,
        funding: vm.funding_section
      };
        $('.suggestions').css("visibility","collapse");
        $('.pub-rect').text('Not Found');
        $('#invalidSuggestion').text('');
      if(fields['basic']==undefined || fields['basic']['name']==undefined){
        $('.suggestions').css("visibility","collapse");
        $('#invalidSuggestion').text('Please enter the name of the resource.');
        return;
      }
      $('#loading').show();
      $.post("/suggest/query?field=pub_primary_doi", fields)
        .done(function(data) {
          $('#loading').hide();
          $('.suggestions').css("visibility","visible");
          var json = JSON.parse(data);
          var text = "";
           if(json['suggestedDescription']!=undefined){
             $('#pubTitle-deet').text(json['suggestedDescription']);
           }
           if(json['suggestedUrl']!=undefined){
            $('#pubURL-deet').text(json['suggestedUrl']);
           }
        });
        $.post("/suggest/query?field=res_code_url", fields)
          .done(function(data) {
            $('#loading').hide();
            $('.suggestions').css("visibility","visible");

            var json = data;
            var text = "";
            if(json['suggestedDescription']!=undefined){
             $('#gitDisc-deet').text(json['suggestedDescription']);
            }
             if(json['suggestedUrl']!=undefined){
             $('#gitURL-deet').text(json['suggestedUrl']);
             }
             if(json['suggestedLang']!=undefined){
              $('#gitLang-deet').text(json['suggestedLang']);
             }
             if(json['suggestedLink']!=undefined && json['suggestedLink']['link_url']!=undefined){
              $('#pubLink-deet').text(json['suggestedLink']['link_url']+' ('+json['suggestedLink']['link_name']+')');
              }
          });
        if(fields['dev']==undefined || fields['dev']['code_url']==undefined){
          return;
        }
        $.post("/suggest/query?field=license", fields)
          .done(function(data) {
            $('#loading').hide();
            $('.suggestions').css("visibility","visible");

            var json = JSON.parse(data);
            if(json['suggestedLicense']!=undefined){
              $('#pubLicense-deet').text(json['suggestedLicense']);
            }

          });
          $.post("/suggest/query?field=versions", fields)
            .done(function(data) {
              $('#loading').hide();
             $('.suggestions').css("visibility","visible");
              var json = JSON.parse(data);
              if(json['suggestedReleases']!=undefined){
                json['suggestedReleases'].forEach(function(rel){
                  $('#pubVersion-deet').append(rel['version_number']+' ('+rel['version_date']+')'
                  );
                });
              }
            });
            $.post("/suggest/query?field=maintainers", fields)
              .done(function(data) {
                $('#loading').hide();

                var json = JSON.parse(data);
                 if(json['suggestedMaintainer']!=undefined){
                  $('#pubMaintainer-deet').append(json['suggestedMaintainer']['maintainer_name']+' ('+json['suggestedMaintainer']['maintainer_email']+')');
                 }

              });
    };

    function beforeSaveCheck(){
      if(Object.keys(vm['basic_section']).length==0 ||
         vm['basic_section']['name']==undefined ||
         vm['basic_section']['description']==undefined){
           $('#saveModalLabel').text('Missing Information');
           $('#pre-save').html("<center><b>Please enter a name and a description for the resource.</b></center>");
           $('#modal-save').hide();
           $('#modal-save-warn').show();
         }else{
           $('#saveModalLabel').text('Save');
           $('#pre-save').html("<center><b>Save resource?</b></center>");
           $('#modal-save').show();
           $('#modal-save-warn').hide();
         }
    }
    function removeHash(json){
      if(json==undefined)
        return {};
      var keys = Object.keys(json);
      keys.forEach(function(key){
        if(json[key] instanceof Array){
          json[key] = json[key].map(function(obj){
            delete obj['$$hashKey'];
            return obj;
          });
        }
      })
      return json;
    };

    function save(){
      $('#saveModal').modal('toggle');
      $('#MessageModal').modal('toggle');
      var submit = {
        savedID: vm.savedID,
        basic: removeHash(vm.basic_section),
        authors: removeHash(vm.author_section),
        publication: removeHash(vm.pub_section),
        links: removeHash(vm.link_section),
        dev: removeHash(vm.dev_section),
        version: removeHash(vm.version_section),
        io: removeHash(vm.io),
        license: removeHash(vm.license_section),
        funding: removeHash(vm.funding_section)
        //recaptcha: $('#g-recaptcha-response').val()
      };
      $.post("/review/save", submit)
        .done(function(data) {
          console.log(data);
          $('#messageLabel').text(data.status);
          $('#messageBody').text(data.message);
          if(data.status=='success'){
            var count = 0;
            setInterval(function(){
                count++;
                $('#messageBody').append('.  ');
                if(count > 2){
                  window.location.href = '/review/saved/'+data.id;
                }
              }, 1000);
            }

        });

    };

    function initEdit(id){
      $.get("/review/api/form/"+id)
        .done(function(data) {
          console.log(data);
            vm.orig = JSON.parse(JSON.stringify(data));
            vm.basic_section = data['basic_section'];
            vm.author_section = data['author_section'];
            vm.pub_section = data['pub_section'];
            vm.link_section = data['link_section'];
            vm.dev_section = data['dev_section'];
            vm.version_section = data['version_section'];
            vm.license_section = data['license_section'];
            vm.funding_section = data['funding_section'];
            $scope.$apply();
        });
    };

    function initEdit2(data){
      console.log(data);
        vm.orig = JSON.parse(JSON.stringify(data));
        vm.basic_section = data['basic_section'];
        vm.author_section = data['author_section'];
        vm.pub_section = data['pub_section'];
        vm.link_section = data['link_section'];
        vm.dev_section = data['dev_section'];
        vm.version_section = data['version_section'];
        vm.license_section = data['license_section'];
        vm.funding_section = data['funding_section'];
    };

    function initSaved(id){
      $.get("/review/api/saved/"+id)
        .done(function(data) {
          console.log(data);
            vm.savedID = data['savedID'];
            vm.orig = JSON.parse(JSON.stringify(data));
            vm.basic_section = data['basic'];
            if(data['authors']!=undefined)
              vm.author_section = data['authors'];
            if(data['publication']!=undefined)
              vm.pub_section = data['publication'];
            if(data['links']!=undefined)
              vm.link_section = data['links'];
            if(data['dev']!=undefined)
              vm.dev_section = data['dev'];
            if(data['version']!=undefined)
              vm.version_section = data['version'];
            if(data['license']!=undefined)
              vm.license_section = data['license'];
            if(data['funding']!=undefined)
              vm.funding_section = data['funding'];
            $scope.$apply();
        });
    };

    function checkLink(link){
      if(link==undefined || link==null)
        return "";
      if (!(link.match(/^http/) || link.match(/^https/))) {
            return "http://"+link;
        }
      return link;

    }



  }

})();
