/* jshint esversion:6, asi:true */
/* global $, console */

var DataTable = DataTable || {};

DataTable = function () {
  'use strict';

  /**
   * Creates a standard stats table.
   * @param container The jQuery container to receive the table. Existing contents will be removed.
   * @param rows An array of objects from which to populate the table.
   * @param options An object with any of the following fields:
   *   columns: An array of names by which the columns are referenced. If not provided, the keys
   *       of  rows[0] will be used.
   *   classes: A string of classes to be applied to the table. NOTE: 'table-striped' will be *removed*
   *       if the rows object is empty.
   *   headings: An object whose keys are column names, and their values are column titles. If no title
   *       is provided, the column name is used.
   *   tooltips: An object whose keys are column names, and their values are column tooltips. If a tooltip
   *       is provided, it will be attached to a question mark withing a circle.
   *   formatters: An object whose keys are column names. Any values are functions that provide the HTML
   *       content for the column. The function is passed the entire row, and can return whatever it wishes.
   */
  function createTable(container, rows, options) {
    // Remove old content; create a new table.
    function initializeTable() {
      $(container).empty();
      var classes = options.classes || 'table table-condensed table-bordered table-striped';
      if (rows.length === 0) {
        classes = classes.replace('table-striped', ' ');
      }
      $(container).html('<table class="' + classes + '">');
    }

    // Builds headings according to the options.
    function buildHeadings() {
      // One row for the headings.
      $('table', container).append('<thead><tr></tr></thead>');
      var $tr = $('thead tr', container);
      columns.forEach((column) => {
        // Heading text and optional tooltip
        var text = options.headings[column] || column;
        var tip = options.tooltips && options.tooltips[column];
        $tr.append('<th><div></div></th>');
        var $div = $('th div', $tr).last();
        $div.append('<span>' + text + '</span>');
        // If there's a tooltip, attach it to a image of a question mark.
        if (tip) {
          $div.append('<img class="question" src="images/question16.png" title="' + tip + '"/>');
          var $q = $('img', $div);
          $q.tooltip();
          // So clicking doesn't do anything...
          $q.on('click', () => {
            return false;
          });
        }
      });
    }

    // Populates the data rows of the table, calls 'datatable' at the end.
    function populateRows() {
      $('table', container).append('<tbody></tbody>');
      var $tbody = $('table tbody', container);
      // One row for each array element
      rows.forEach((row) => {
        $($tbody).append('<tr></tr>');
        var $tr = $(':last', $tbody);
        columns.forEach((column) => {
          var cell = '';
          // If there's a format function, call it. Otherwise just use the data.
          if (formatters[column]) {
            cell = formatters[column](row);
          } else {
            cell = row[column];
          }
          $tr.append('<td>' + cell + '</td>');
        });
      });
    }

    options = options || {};
    var columns = options.columns || Object.keys(rows[0]);
    var formatters = options.formatters || {};
    var tableOptions = {paging: false, searching: false, colReorder: false};
    if (options.datatable && (typeof options.datatable) === 'object') {
      Object.keys(options.datatable).forEach((k) => {
        tableOptions[k] = options.datatable[k]
      });
    }
    initializeTable();
    if (options.headings) {
      buildHeadings();
    }
    populateRows();
    if (options.datatable) {
      var table = $('table', container).DataTable(tableOptions);
    }
  }

  function createFromCsv(container, path, options) {
    $.get(path).done((csvData)=>{
      var data = $.csv.toObjects(csvData, {separator: ',', delimiter: '"'});
      createTable(container, data, options);
    });
  }

  return {
    create: createTable,
    fromCsv: createFromCsv
  }

}();
