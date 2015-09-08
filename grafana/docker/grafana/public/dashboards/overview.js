/* global _ */
/*
 * Grafana Scripted Dashboard to:
 *  * Give overview of all nodes in a cluster: CPU, Load, Memory
 *  * Provide links to other - more complex - dashboard for each node.
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

// use defaults for URL arguments
var arg_env  = 'metrics';
var arg_span = 2;
var arg_from = '2h';
var arg_nodes = '';
var arg_node_domain_selector = '*.*';

var arg_title = "Overview";
var arg_refresh = "1m";
var arg_no_help = false;
var arg_omit_columns = '';

var arg_statsd_base = "bucky.counters.logstash";

if(!_.isUndefined(ARGS.no_help)) {
  arg_no_help = ARGS.no_help;
}

if(!_.isUndefined(ARGS.omit_columns)) {
  arg_omit_columns = ARGS.omit_columns;
}

if(!_.isUndefined(ARGS.env)) {
  arg_env = ARGS.env;
}

if(!_.isUndefined(ARGS.from)) {
  arg_from = ARGS.from;
}

if(!_.isUndefined(ARGS.title)) {
  arg_title = ARGS.title;
}

if(!_.isUndefined(ARGS.refresh)) {
  arg_refresh = ARGS.refresh;
}

if(!_.isUndefined(ARGS.nodes)) {
  arg_nodes = ARGS.nodes;
}

if(!_.isUndefined(ARGS.statsd_base)) {
  arg_statsd_base = ARGS.statsd_base;
}

if(!_.isUndefined(ARGS.node_domain_selector)) {
  arg_node_domain_selector = ARGS.node_domain_selector;
}

// execute graphite-api /metrics/find query
// return array of metric last names ( func('test.cpu-*') returns ['cpu-0','cpu-1',..] )
function find_filter_values(query){
  var search_url = window.location.protocol + '//' + window.location.hostname.replace(/^grafana/,"graphite") + (window.location.port ? ":" + window.location.port : "") + '/metrics/find/?query=' + query;
  var res = [];
  var req = new XMLHttpRequest();
  req.open('GET', search_url, false);
  req.send(null);
  var obj = JSON.parse(req.responseText);
  for(var key in obj) {
    if (obj[key].hasOwnProperty("text")) {
      res.push(obj[key]["text"]);
    }
  }
  return res;
};

// used to calculate aliasByNode index in panel template
function len(prefix){
  return prefix.split('.').length - 1;
};

//---------------------------------------------------------------------------------------

function panel_node_links_markdown(node) {
  return {
    title: node,
    type: 'text',
    mode: 'markdown',
    span: 2,
    error: false,
    content: "[base graphs](/#/dashboard/script/instance.js?env=" + arg_env + "&i=" + node + ")",
    style: {}
  }
};

function panel_help_text() {
  var help_md = "### How to use this dashboard\n" +
      "\n" +
      "This dashboard expects:\n" +
      "\n" +
      "* collectd reporting to `{env}.{node}` - defaulting to `metrics.monitoring-01`\n" +
      "* logstash reporting to statsd (for the events graph)\n" +
      "\n" +
      "Arguments:\n" +
      "\n" +
      "* `no_help` -- omit this panel\n" +
      "* `env={metric_path}` set to the metric prefix of the graphite names for " +
      "collectd graphs, eg 'metrics.pvb.prod'\n" +
      "* `statsd_base={path}` override default statsd path for logstash events. " +
      "Default is 'bucky.counters.logstash'\n" +
      "* `node_domain_selector={selector}` -- find event type graphs under " +
      "`{statsd_base}.per-host.{node_name}.{selector}.events.type`. Default '*.*'\n" +
      "* `refresh={interval}` override default refresh interval of `1min`\n" +
      "* `omit_columns={csv_list_of_titles}` omit 'graph title list' from the results (eg CPU,Memory)\n" +
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


function panel_collectd_delta_cpu(title,prefix,node){
  return {
    title: title,
    type: 'graphite',
    span: 2,
    renderer: "flot",
    "y-axis": false,
    y_formats: ["none"],
    grid: {max: null, min: 0},
    lines: true,
    fill: 2,
    linewidth: 1,
    stack: true,
    legend: {show: false},
    percentage: true,
    nullPointMode: "null",
    tooltip: {
      value_type: "individual",
      query_as_alias: true
    },
    targets: [
      { "target": "alias(movingMedian(sumSeries(" + prefix + "." + node + ".cpu.*.cpu.interrupt),'1min'),'intrpt')" },
      { "target": "alias(movingMedian(sumSeries(" + prefix + "." + node + ".cpu.*.cpu.softirq),'1min'),'irq')" },
      { "target": "alias(movingMedian(sumSeries(" + prefix + "." + node + ".cpu.*.cpu.steal),'1min'),'steal')" },
      { "target": "alias(movingMedian(sumSeries(" + prefix + "." + node + ".cpu.*.cpu.wait),'1min'),'wait')" },
      { "target": "alias(movingMedian(sumSeries(" + prefix + "." + node + ".cpu.*.cpu.system),'1min'),'system')" },
      { "target": "alias(movingMedian(sumSeries(" + prefix + "." + node + ".cpu.*.cpu.user),'1min'),'user')" },
      { "target": "alias(movingMedian(sumSeries(" + prefix + "." + node + ".cpu.*.cpu.nice),'1min'),'nice')" },
      { "target": "alias(movingMedian(sumSeries(" + prefix + "." + node + ".cpu.*.cpu.idle),'1min'),'idle')" },
    ],
    aliasColors: {
      "user": "#508642",
      "nice": "#609652",
      "system": "#EAB839",
      "wait": "#890F02",
      "steal": "#E24D42",
      "idle": "#6ED0E0"
    }
  }
};

function panel_collectd_loadavg(title, prefix, node) {
  var idx = len(prefix);
  return {
    title: title,
    type: 'graphite',
    span: 2,
    "y-axis": false,
    y_formats: ["none"],
    grid: {max: null, min: 0},
    lines: true,
    legend: {show: false},
    fill: 2,
    linewidth: 1,
    nullPointMode: "null",
    targets: [
      { "target": "alias(countSeries(" + prefix + "." + node + ".cpu.*.*.idle),'cpuCount')" },
      { "target": "aliasByNode(" + prefix + "." + node + ".load.load.midterm," +(idx+4)+ ")" },
    ],
    aliasColors: {
      "cpuCount": "green",
      "midterm": "red"
    }
  }
};

function panel_collectd_memory(title, prefix, node) {
  var idx = len(prefix);
  return {
    title: title,
    type: 'graphite',
    span: 2,
    'y-axis': true,
    y_formats: ["bytes"],
    grid: {max: null, min: 0},
    lines: true,
    legend: {show: false},
    fill: 2,
    linewidth: 1,
    stack: true,
    nullPointMode: "null",
    targets: [
      { "target": "aliasByNode(" + prefix + "." + node + ".memory.memory.{used,cached,buffered,free}, " +(idx+4)+ ")" },
    ],
    aliasColors: {
      "free": "#629E51",
      "used": "#1F78C1",
      "cached": "#EF843C",
      "buffered": "#CCA300"
    }
  }
};

function panel_collectd_disk_io(title, prefix, node) {
  return {
    title: title,
    type: 'graphite',
    span: 2,
    'y-axis': true,
    y_formats: ["bytes"],
    grid: {max: null, min: 0},
    lines: true,
    legend: {show: false},
    fill: 2,
    linewidth: 1,
    stack: false,
    nullPointMode: "null",
    targets: [
      { "target": "alias(" + prefix + "." + node + ".disk.*.disk_ops.write, 'write')" },
      { "target": "alias(scale(" + prefix + "." + node + ".disk.*.disk_ops.read, -1), 'read')" },
    ],
    aliasColors: {
      "write": "#7EB26D",
      "read": "#EAB839",
    }
  }
};

function panel_collectd_network_io(title, prefix, node) {
  return {
    title: title,
    type: 'graphite',
    span: 2,
    'y-axis': true,
    y_formats: ["none"],
    grid: {max: null, min: 0},
    lines: true,
    legend: {show: false},
    fill: 2,
    linewidth: 1,
    stack: false,
    nullPointMode: "null",
    targets: [
      { "target": "alias(movingMedian(keepLastValue(" + prefix + "." + node + ".interface.eth0.if_packets.rx,10),'5min'),'rx')" },
      { "target": "alias(movingMedian(scale(keepLastValue(" + prefix + "." + node + ".interface.eth0.if_packets.tx,10),-1),'5min'),'tx')" },
    ],
    aliasColors: {
      "rx": "#7EB26D",
      "tx": "#EAB839",
    }
  }
};

function row_help_text() {
  return {
    title: "Help",
    height: '250px',
    collapse: false,
    panels: [
      panel_help_text(),
    ]
  }
};

function row_of_node_panels(node,prefix) {

  var omit_columns = []
  var valid_panels = []
  if ( arg_omit_columns == '' ) {
    valid_panels = [
      panel_node_links_markdown(node),
      panel_collectd_delta_cpu("CPU",prefix,node),
      panel_collectd_loadavg("Load",prefix,node),
      panel_collectd_memory("Memory",prefix,node),
      panel_collectd_disk_io("Disk IO",prefix,node),
      panel_collectd_network_io("Network IO",prefix,node)
    ]
  } else {
    omit_columns = arg_omit_columns.split(',')
    if ( omit_columns.indexOf("CPU") === -1 ) {
      valid_panels.push( panel_collectd_delta_cpu("CPU",prefix,node) )
    }
    if ( omit_columns.indexOf("Load") === -1 ) {
      valid_panels.push( panel_collectd_loadavg("Load",prefix,node) )
    }
    if ( omit_columns.indexOf("Memory") === -1 ) {
      valid_panels.push( panel_collectd_memory("Memory",prefix,node) )
    }
    if ( omit_columns.indexOf("Disk IO") === -1 ) {
      valid_panels.push( panel_collectd_disk_io("Disk IO",prefix,node) )
    }
    if ( omit_columns.indexOf("Network IO") === -1 ) {
      valid_panels.push( panel_collectd_network_io("Network IO",prefix,node) )
    }
  }

  return {
    title: node,
    height: '150px',
    collapse: false,
    panels: valid_panels
  }
}

//---------------------------------------------------------------------------------------


return function(callback) {

  // Setup some variables
  var dashboard;
  var prefix = arg_env

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

  // custom dashboard rows (appended to the default dashboard rows)
  var optional_rows = [];

  $.ajax({
    method: 'GET',
    url: '/'
  })
      .done(function(result) {

        if ( ! arg_no_help ) {
          dashboard.rows.push(row_help_text())
        }

        if ( arg_nodes == '' ) {
          display_nodes = find_filter_values(prefix + ".*")
        } else {
          display_nodes = arg_nodes.split(',')
        }

        for (var i in display_nodes) {
          dashboard.rows.push(row_of_node_panels(display_nodes[i], prefix));
        }

        // when dashboard is composed call the callback
        // function and pass the dashboard
        callback(dashboard);
      });
}
