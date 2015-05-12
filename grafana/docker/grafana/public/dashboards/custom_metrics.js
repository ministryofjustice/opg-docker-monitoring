/* global _ */
/*
 * Grafana Scripted Dashboard to:
 *
 * Global accessable variables
 * window, document, $, jQuery, ARGS, moment
 *
 * Return a dashboard object, or a function
 *
 * For async scripts, return a function, this function must take a single callback function,
 * call this function with the dasboard object
 *
 * Author: Mike Pountney, Infracode Ltd
 *
 * Heavily inspired by work of: Anatoliy Dobrosynets, Recorded Future, Inc.
 *
 */

// accessable variables in this scope
var window, document, ARGS, $, jQuery, moment, kbn;

var arg_from = '2h';

var arg_title = "Custom Metrics";
var arg_refresh = "1m";
var arg_no_help = false;
var arg_targets = "";

if(!_.isUndefined(ARGS.no_help)) {
  arg_no_help = ARGS.no_help;
}

if(!_.isUndefined(ARGS.title)) {
  arg_title = ARGS.title;
}

if(!_.isUndefined(ARGS.refresh)) {
  arg_refresh = ARGS.refresh;
}

if(!_.isUndefined(ARGS.targets)) {
  arg_targets = ARGS.targets;
}

function get_all_metrics() {
  var metrics_url = window.location.protocol + '//' + window.location.hostname.replace(/^grafana/,"graphite") + (window.location.port ? ":" + window.location.port : "") + '/metrics/index.json';
  var res = [];
  var req = new XMLHttpRequest();
  req.open('GET', metrics_url, false);
  req.send(null);
  var obj = JSON.parse(req.responseText);
  return obj;
};

//---------------------------------------------------------------------------------------

function panel_help_text() {
  var help_md = "### How to use this dashboard\n" +
                "\n" +
                "This dashboard expects a pipe-separated list of graphite target paths.\n" +
                "\n" +
                "These will typically need to be URI encoded.\n" +
                "\n" +
                "The graphs will then be displayed in order, as individual graphs.\n" +
                "\n" +
                "Arguments:\n" +
                "\n" +
                "* `no_help` -- omit this panel\n" +
                "* `targets={target1}|{target2}|...`\n" +
                "* `refresh={interval}` override default refresh interval of `1min`\n" +
                ""

  return {
    title: 'Help',
    type: 'text',
    mode: 'markdown',
    span: 8,
    error: false,
    content: help_md,
    style: {}
  }
};

function panel_all_metrics() {
  var text_md = "### Available raw targets:\n" +
                "\n" +
                ""

  all_targets = get_all_metrics();

  for (var i = 0, len = all_targets.length; i < len; i++) {
     text_md += "* [" + all_targets[i] + "](/#/dashboard/script/custom_metrics.js?targets=" + all_targets[i] + ")\n"
  }

  return {
    title: 'Help',
    type: 'text',
    mode: 'markdown',
    span: 8,
    error: false,
    content: text_md,
    style: {}
  }
};

function panel_custom_metric(title, targets){
  return {
    title: title,
    type: 'graphite',
    span: 8,
    renderer: "flot",
    y_formats: ["none", "none"],
    grid: {max: null, min: 0},
    lines: true,
    fill: 0,
    linewidth: 2,
    stack: false,
    legend: {show: true},
    percentage: false,
    nullPointMode: "null",
    tooltip: {
      value_type: "individual",
      query_as_alias: true
    },
    targets: targets,
  }
};


//---------------------------------------------------------------------------------------

function row_help_text() {
  return {
    title: "Help",
    height: '250px',
    collapse: false,
    panels: [
      panel_help_text()
    ]
  }
};

function row_custom_metric(title, targets) {
  return {
    title: title,
    height: '250px',
    collapse: false,
    panels: [
      panel_custom_metric(title, targets)
    ]
  }
};

function row_all_metrics() {
  return {
    title: "All Available Metrics",
    height: '250px',
    collapse: false,
    panels: [
      panel_all_metrics()
    ]
  }
};

//---------------------------------------------------------------------------------------


return function(callback) {

  // Setup some variables
  var dashboard;

  // Intialize a skeleton with nothing but a rows array and service object
  dashboard = {
    rows : [],
    services : {}
  };

  // set filter
  var dashboard_filter = {
    time: {
      from: "now-" + arg_from,
      to: "now"
    },
  };

  // define pulldowns
  pulldowns = [
    {
      type: "filtering",
      collapse: false,
      notice: false,
      enable: true
    },
    {
      type: "annotations",
      enable: false
    }
  ];

  dashboard.title = arg_title;
  dashboard.refresh = arg_refresh;
  dashboard.editable = true;
  dashboard.pulldowns = pulldowns;
  dashboard.services.filter = dashboard_filter;

  $.ajax({
    method: 'GET',
    url: '/'
  })
  .done(function(result) {

    if ( ! arg_no_help ) {
      dashboard.rows.push(row_help_text())
    }

    if ( arg_targets == "" ) {
      dashboard.rows.push(row_all_metrics())
    } else {
      var targets = arg_targets.split('|').map(function(target) { return { "target": target } })
      dashboard.rows.push(row_custom_metric("Title", targets))
    }

    // when dashboard is composed call the callback
    // function and pass the dashboard
    callback(dashboard);
  });
}
