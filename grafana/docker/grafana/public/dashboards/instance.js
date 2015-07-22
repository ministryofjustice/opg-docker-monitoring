/* global _ */
/*
 * Complex scripted dashboard
 * This script generates a dashboard object that Grafana can load. It also takes a number of user
 * supplied URL parameters (int ARGS variable)
 *
 * Global accessable variables
 * window, document, $, jQuery, ARGS, moment
 *
 * Return a dashboard object, or a function
 *
 * For async scripts, return a function, this function must take a single callback function,
 * call this function with the dasboard object
 *
 * Author: Anatoliy Dobrosynets, Recorded Future, Inc.
 */
// accessable variables in this scope
var window, document, ARGS, $, jQuery, moment, kbn;

// use defaults for URL arguments
var arg_env = 'ns';
var arg_i = '*';
var arg_span = 4;
var arg_from = '2h';
var arg_host = 'http://localhost:8003';

if (!_.isUndefined(ARGS.span)) {
    arg_span = ARGS.span;
}

if (!_.isUndefined(ARGS.from)) {
    arg_from = ARGS.from;
}

if (!_.isUndefined(ARGS.env)) {
    arg_env = ARGS.env;
}

if (!_.isUndefined(ARGS.i)) {
    arg_i = ARGS.i;
}

if (!_.isUndefined(ARGS.host)) {
    arg_host = ARGS.host;
}

var metric_filter = arg_env + "." + arg_i;

// return dashboard filter_list
// optionally include 'All'
function get_filter_object(name, query, show_all) {
    show_all = (typeof show_all === "undefined") ? true : show_all;
    var arr = find_filter_values(query);
    var opts = [];
    for (var i in arr) {
        opts.push({
            "text": arr[i],
            "value": arr[i]
        });
    };
    if (show_all == true) {
        opts.unshift({
            "text": "All",
            "value": '{' + arr.join() + '}'
        });
    };
    return {
        type: "filter",
        name: name,
        query: query,
        options: opts,
        current: opts[0],
        includeAll: show_all
    }
};

// execute graphite-api /metrics/find query
// return array of metric last names ( func('test.cpu-*') returns ['cpu-0','cpu-1',..] )
function find_filter_values(query) {
    var search_url = arg_host + '/metrics/find/?query=' + query;
    var res = [];
    var req = new XMLHttpRequest();
    req.open('GET', search_url, false);
    req.send(null);
    var obj = JSON.parse(req.responseText);
    for (var key in obj) {
        if (obj[key].hasOwnProperty("text")) {
            res.push(obj[key]["text"]);
        }
    }
    return res;
};

// execute graphite-api /metrics/expand query
// return array of metric full names (func('*.cpu-*') returns ['test.cpu-0','test.cpu-1',..] )
function expand_filter_values(query) {
    var search_url = arg_host + '/metrics/expand/?query=' + query;
    var req = new XMLHttpRequest();
    req.open('GET', search_url, false);
    req.send(null);
    var obj = JSON.parse(req.responseText);
    if (obj.hasOwnProperty('results')) {
        return obj['results'];
    } else {
        return [];
    };
};

//---------------------------------------------------------------------------------------

function panel_collectd_delta_cpu(title, prefix) {
    return {
        title: title,
        type: 'graphite',
        span: arg_span,
        renderer: "flot",
        y_formats: ["none"],
        grid: {
            max: null,
            min: 0
        },
        lines: true,
        fill: 2,
        linewidth: 1,
        stack: true,
        legend: {
            show: true
        },
        percentage: true,
        nullPointMode: "null",
        tooltip: {
            value_type: "individual",
            query_as_alias: true
        },
        targets: [{
            "target": "alias(sumSeries(" + metric_filter + ".cpu.*.cpu.interrupt),'intrpt')"
        }, {
            "target": "alias(sumSeries(" + metric_filter + ".cpu.*.cpu.softirq),'irq')"
        }, {
            "target": "alias(sumSeries(" + metric_filter + ".cpu.*.cpu.steal),'steal')"
        }, {
            "target": "alias(sumSeries(" + metric_filter + ".cpu.*.cpu.wait),'wait')"
        }, {
            "target": "alias(sumSeries(" + metric_filter + ".cpu.*.cpu.system),'system')"
        }, {
            "target": "alias(sumSeries(" + metric_filter + ".cpu.*.cpu.user),'user')"
        }, {
            "target": "alias(sumSeries(" + metric_filter + ".cpu.*.cpu.nice),'nice')"
        }, {
            "target": "alias(sumSeries(" + metric_filter + ".cpu.*.cpu.idle),'idle')"
        }, ],
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

function panel_collectd_memory(title, prefix) {
    return {
        title: title,
        type: 'graphite',
        span: arg_span,
        y_formats: ["bytes"],
        grid: {
            max: null,
            min: 0
        },
        lines: true,
        fill: 2,
        linewidth: 1,
        stack: true,
        nullPointMode: "null",
        targets: [{
            "target": "aliasByNode(" + metric_filter + ".memory.memory.{used,cached,buffered,free},-1)"
        }, ],
        aliasColors: {
            "free": "#629E51",
            "used": "#1F78C1",
            "cached": "#EF843C",
            "buffered": "#CCA300"
        }
    }
};

function panel_collectd_loadavg(title, prefix) {
    return {
        title: title,
        type: 'graphite',
        span: arg_span,
        y_formats: ["none"],
        grid: {
            max: null,
            min: 0
        },
        lines: true,
        fill: 2,
        linewidth: 1,
        nullPointMode: "null",
        targets: [{
            "target": "aliasByNode(movingMedian(" + metric_filter + ".load.load.longterm,'10min'),-1)"
        },{
            "target": "aliasByNode(movingMedian(" + metric_filter + ".load.load.midterm,'10min'),-1)"
        },{
            "target": "aliasByNode(movingMedian(" + metric_filter + ".load.load.shortterm,'10min'),-1)"
        }],
        aliasColors: {
            "cpuCount": "green",
            "midterm": "red"
        }
    }
};

function panel_collectd_network_octets(title, prefix, intrf) {
    intrf = (typeof intrf === "undefined") ? 'eth0' : intrf;
    return {
        title: title + ', ' + intrf,
        type: 'graphite',
        span: arg_span,
        y_formats: ["bytes"],
        grid: {
            max: null,
            min: null
        },
        lines: true,
        fill: 1,
        linewidth: 2,
        nullPointMode: "null",
        targets: [{
            "target": "aliasByNode(movingMedian(keepLastValue(" + metric_filter + ".interface." + intrf + ".if_octets.rx,10),'5min'),-3,-1)"
        }, {
            "target": "aliasByNode(movingMedian(scale(keepLastValue(" + metric_filter + ".interface." + intrf + ".if_octets.tx,10),-1),'5min'),-3,-1)"
        }]
    }
};

function panel_collectd_network_packets(title, prefix, intrf) {
    intrf = (typeof intrf === "undefined") ? 'eth0' : intrf;
    return {
        title: title + ', ' + intrf,
        type: 'graphite',
        span: arg_span,
        y_formats: ["bytes"],
        grid: {
            max: null,
            min: null
        },
        lines: true,
        fill: 1,
        linewidth: 2,
        nullPointMode: "null",
        targets: [{
            "target": "aliasByNode(movingMedian(keepLastValue(" + metric_filter + ".interface." + intrf + ".if_packets.rx,10),'5min'),-3,-1)"
        }, {
            "target": "aliasByNode(movingMedian(scale(keepLastValue(" + metric_filter + ".interface." + intrf + ".if_packets.tx,10),-1),'5min'),-3,-1)"
        }]
    }
};

function panel_collectd_df(title, prefix, vol) {
    vol = (typeof vol === "undefined") ? 'root' : vol;
    return {
        title: title + ', ' + vol,
        type: 'graphite',
        span: arg_span,
        y_formats: ["bytes"],
        grid: {
            max: null,
            min: 0,
            leftMin: 0
        },
        lines: true,
        fill: 1,
        linewidth: 2,
        stack: true,
        nullPointMode: "null",
        targets: [{
            "target": "aliasByNode(" + metric_filter + ".df." + vol + ".df_complex.{free,used,reserved},-3,-1)"
        }, ],
        aliasColors: {
            "used": "#447EBC",
            "free": "#508642",
            "reserved": "#EAB839"
        }
    }
};

function panel_collectd_disk(title, prefix, vol) {
    vol = (typeof vol === "undefined") ? 'sda' : vol;
    return {
        title: title + ', ' + vol,
        type: 'graphite',
        span: arg_span,
        y_formats: ["none"],
        grid: {
            max: null,
            min: null
        },
        lines: true,
        fill: 2,
        linewidth: 1,
        nullPointMode: "null",
        targets: [{
            "target": "aliasByNode(" + metric_filter + ".disk." + vol + ".disk_ops.write,-3,-1)"
        }, {
            "target": "aliasByNode(scale(" + metric_filter + ".disk." + vol + ".disk_ops.read,-1),-3,-1)"
        }],
        aliasColors: {
            "write": "#447EBC",
            "read": "#508642",
        }
    }
};

/*
  row templates
*/

function row_delimiter(title) {
    return {
        title: "_____ " + title,
        height: "20px",
        collapse: false,
        editable: false,
        collapsable: false,
        panels: [{
            title: title,
            editable: false,
            span: 12,
            type: "text",
            mode: "text"
        }]
    }
};

function row_cpu_memory(title, prefix) {
    return {
        title: title,
        height: '250px',
        collapse: false,
        panels: [
            panel_collectd_delta_cpu('CPU, %', prefix),
            panel_collectd_memory('Memory', prefix),
            panel_collectd_loadavg('Load avg, 10min', prefix)
        ]
    }
};

function row_network(title, prefix, filter) {
    var interfaces = find_filter_values(filter + '.interface.*');
    var panels_network = [];
    for (var i in interfaces) {
        if ( ! /^eth\d/.test(interfaces[i]) ) { continue; }
        panels_network.push(
            panel_collectd_network_octets('network octets', prefix, interfaces[i]),
            panel_collectd_network_packets('network packets', prefix, interfaces[i])
        );
    };
    return {
        title: title,
        height: '250px',
        collapse: true,
        panels: panels_network
    }
};

function row_disk_space(title, prefix, filter) {
    var volumes = find_filter_values(filter + '.df.*');
    panels_disk_space = [];
    for (var i in volumes) {
        if ( ! /root|srv|data/.test(volumes[i]) ) { continue; }
        panels_disk_space.push(panel_collectd_df('disk space', prefix, volumes[i]));
    };
    return {
        title: title,
        height: '250px',
        collapse: true,
        panels: panels_disk_space
    }
};

function row_disk_usage(title, prefix, filter) {
    var volumes = find_filter_values(filter + '.disk.*');
    var panels_disk_usage = [];
    for (var i in volumes) {
        if ( /\d/.test(volumes[i]) ) { continue; }
        panels_disk_usage.push(panel_collectd_disk('disk ops read/write', prefix, volumes[i]));
    };
    return {
        title: title,
        height: '250px',
        collapse: true,
        panels: panels_disk_usage
    }
};

//---------------------------------------------------------------------------------------


return function(callback) {

    // Setup some variables
    var dashboard;

    /* prefix - depends on actual Graphite tree.
                In my case it depends on environment which can be passed as argument too.
        .collectd.hosts.
        .statsd.hosts.
        .jmxtrans.hosts.
    */

    //var prefix = arg_env + '.collectd.hosts.';
    var prefix = arg_env + '.';

    var arg_filter = prefix + arg_i;

    // set filter
    var dashboard_filter = {
        time: {
            from: "now-" + arg_from,
            to: "now"
        },
        list: [
            get_filter_object("instance", arg_filter, false)
        ]
    };

    // define pulldowns
    pulldowns = [{
        type: "filtering",
        collapse: false,
        notice: false,
        enable: true
    }, {
        type: "annotations",
        enable: false
    }];

    // Intialize a skeleton with nothing but a rows array and service object

    dashboard = {
        rows: [],
        services: {}
    };
    dashboard.title = arg_i + ' (' + arg_env + ')';
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

            // costruct dashboard rows

            dashboard.rows.push(
                row_cpu_memory('cpu, memory', prefix),
                row_network('network', prefix, arg_filter),
                row_disk_space('disk space', prefix, arg_filter),
                row_disk_usage('disk ops', prefix, arg_filter)
            );

            // custom rows
            for (var i in optional_rows) {
                dashboard.rows.push(optional_rows[i]);
            };

            // when dashboard is composed call the callback
            // function and pass the dashboard
            callback(dashboard);
        });
}