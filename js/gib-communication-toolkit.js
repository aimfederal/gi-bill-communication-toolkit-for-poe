---
---
/*
 * gib-communication-toolkit.js - The GI Bill Communication Toolkit Module
 */


// Define `console` in IE9 and below
(function () {
  var f = function () {};
  if (!window.console) {
    window.console = { log:f, info:f, warn:f, debug:f, error:f };
  }
})();


var GIBCommunicationToolkit = (function () {

  // All institutions (facility codes)
  var institutions = [];

  // User form data
  var formData = {
    facility_code:    ''
  };

  // The current institution
  var institution = {};

  /*
   * Get user data from the form
   */
  var getFormData = function () {
    formData.facility_code = $('#facility-code').val();
  };


  /*
   * Get path for selected institution
   */
  var getInstitution = function (facility_code, callback) {
    if (institutions.indexOf(facility_code) > -1) {
      var url = '{{ site.baseurl }}/api/' + facility_code.substr(0, 3) + '/' + facility_code + '.json';

      $.getJSON(url, function(data) {
        institution = data
        callback();
      });
    }
  };


  /*
   * Update benefit information
   */
  var update = function () {
    // Get user data from the form
    getFormData();

    // An institution must be selected to proceed
    if (!formData.facility_code) { return; }

    // Make sure we have a full code before proceeding.
    if (formData.facility_code.length < 8) { return; }

    if (formData.facility_code == institution.facility_code) {
      // Just do an update with existing institution, no $.getJSON call
      updatePage();
    } else {
      // Lookup the new institution
      getInstitution(formData.facility_code, function () {
        console.log("====== " + institution.institution + " ======");
        console.log("=== Institution ===");
        console.log(institution);

        updatePage();
      });
    }
  };


  /*
   * Update the entire page
   */
  var updatePage = function () {
    if (institution.poe) {
      $('.right-content').hide();

      data = {
        factsheet_pdf:      '{{ site.fileserver }}/factsheet/' + institution.facility_code + '/pdf',
        factsheet_indesign: '{{ site.fileserver }}/factsheet/' + institution.facility_code + '/indesign',
        factsheet_zip:      '{{ site.fileserver }}/factsheet/' + institution.facility_code + '/zip',
        factsheet_email:    '{{ site.fileserver }}/factsheet/' + institution.facility_code + '/email',

        faculty_pdf:      '{{ site.fileserver }}/faculty/' + institution.facility_code + '/pdf',
        faculty_indesign: '{{ site.fileserver }}/faculty/' + institution.facility_code + '/indesign',
        faculty_email:    '{{ site.fileserver }}/faculty/' + institution.facility_code + '/email',

        students_pdf:      '{{ site.fileserver }}/students/' + institution.facility_code + '/pdf',
        students_indesign: '{{ site.fileserver }}/students/' + institution.facility_code + '/indesign',
        students_zip:      '{{ site.fileserver }}/students/' + institution.facility_code + '/zip',
        students_email:    '{{ site.fileserver }}/students/' + institution.facility_code + '/email',
        students_badge:    '{{ site.fileserver }}/students/' + institution.facility_code + '/badge',

        marketing_indesign: '{{ site.fileserver }}/marketing/' + institution.facility_code + '/indesign',
        marketing_zip:      '{{ site.fileserver }}/marketing/' + institution.facility_code + '/zip',
        marketing_link_url: {{ site.marketing_link_url }},

        verification_href:  {{ site.verification_href }},
        verification_src:   {{ site.verification_src}}
      };

      $('.right-content').parent().loadTemplate('{{ site.baseurl }}/va_files/2014/institution.html', data, {
        afterInsert: function (elem) {
          var $sidebar   = $('.side-container'),
            $window  = $(window),
            offset   = $sidebar.offset(),
            topPadding = 15;

          $window.scroll(function() {
            if ($window.scrollTop() > offset.top) {
              $sidebar.stop().animate({
                marginTop: $window.scrollTop() - offset.top + topPadding
              });
            } else {
              $sidebar.stop().animate({
                marginTop: 0
              });
            }
          });

          $('.side-container .nav li').click(function() {
            $('.side-container .nav li').removeClass('active');
            $(this).addClass('active');
          });

          $('li.factsheet-link').click(function() {
            $('.side-container .nav li').removeClass('active');
            $('li.factsheet').addClass('active');
          });
        }
      });
    }
  };


  /*
   * Parses out the hash query string.
   */

  var parseParams = function (query) {
    var re = /([^&=]+)=?([^&]*)/g;
    var decode = function (str) {
      return decodeURIComponent(str.replace(/\+/g, ' '));
    };

    // recursive function to construct the result object
    var createElement = function (params, key, value) {
      key = key + '';
      // if the key is a property
      if (key.indexOf('.') !== -1) {
        // extract the first part with the name of the object
        var list = key.split('.');
        // the rest of the key
        var new_key = key.split(/\.(.+)?/)[1];
        // create the object if it doesnt exist
        if (!params[list[0]]) { params[list[0]] = {}; }
        // if the key is not empty, create it in the object
        if (new_key !== '') {
          createElement(params[list[0]], new_key, value);
        } else {
          console.warn('parseParams :: empty property in key "' + key + '"');
        }
      } else if (key.indexOf('[') !== -1) {
        // if the key is an array
        // extract the array name
        var list = key.split('[');
        key = list[0];
        // extract the index of the array
        var list = list[1].split(']');
        var index = list[0]
        // if index is empty, just push the value at the end of the array
        if (index == '') {
          if (!params) { params = {}; }
          if (!params[key] || !$.isArray(params[key])) { params[key] = []; }
          params[key].push(value);
        } else {
          // add the value at the index (must be an integer)
          if (!params) { params = {}; }
          if (!params[key] || !$.isArray(params[key])) { params[key] = []; }
          params[key][parseInt(index)] = value;
        }
      } else {
        // just normal key
        if (!params) { params = {}; }
        params[key] = value;
      }
    }
    // be sure the query is a string
    query = query + '';
    if (query === '') query = window.location + '';

    var params = {}, e;

    if (query) {
      // remove # from end of query
      if (query.indexOf('#') !== -1) {
        query = query.substr(0, query.indexOf('#'));
      }

      // remove ? at the begining of the query
      if (query.indexOf('?') !== -1) {
        query = query.substr(query.indexOf('?') + 1, query.length);
      } else return {};
      // empty parameters
      if (query == '') return {};
      // execute a createElement on every key and value
      while (e = re.exec(query)) {
        var key = decode(e[1]);
        var value = decode(e[2]);
        createElement(params, key, value);
      }
    }
    return params;
  };


  // Initialize page
  $(document).ready(function () {
    // Bind event handlers to form elements
    $('#facility-code').on('keypress', function (event) {
      if (event.which == 13) {
        // Hash changes trigger page updates.
        window.location.hash = 'facility_code=' + $('#facility-code').val();
      }
    });

    $(window).on('hashchange', function () {
      var params = parseParams('?' + document.URL.split('#')[1]);

      if (params.facility_code) {
        $('#facility-code').val(params.facility_code);
        GIBCommunicationToolkit.update();
      }
    });

    // Load institution data
    $.getJSON('api/institutions.json', function (data) {
      institutions = data;

      // Trigger a hash change event so that if the URL contains the # we will skip the need to input it.
      $(window).trigger('hashchange');
    });
  });


  return {
    update: update
  };

})();
