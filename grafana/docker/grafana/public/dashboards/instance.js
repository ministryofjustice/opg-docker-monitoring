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
var arg_env = 'metrics';
var arg_i = '*';
var arg_span = 4;
var arg_from = '2h';

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

var metric_filter = arg_env + "." + arg_i;

// helper functions
function get_filter_object(name, query, show_all) {
    show_all = (typeof show_all === "undefined") ? true : show_all;
    var arr = find_filter_values(query);
    var opts = [];
    for (var i in arr) {
        opts.push({
            "text": arr[i],
            "value": arr[i]
        });
    }
    if (show_all === true) {
        opts.unshift({
            "text": "All",
            "value": '{' + arr.join() + '}'
        });
    }
    return {
        type: "filter",
        name: name,
        query: query,
        options: opts,
        current: opts[0],
        includeAll: show_all
    }
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


/* 
  panel templates
*/
function panel_collectd_cpu(title, prefix) {
    var idx = len(prefix);
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
        fill: 1,
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
            "target": "alias(sumSeries(nonNegativeDerivative(" + metric_filter + ".cpu.*.cpu.user,0)),'user')"
        }, {
            "target": "alias(sumSeries(nonNegativeDerivative(" + metric_filter + ".cpu.*.cpu.system,0)),'system')"
        }, {
            "target": "alias(sumSeries(nonNegativeDerivative(" + metric_filter + ".cpu.*.cpu.idle,0)),'idle')"
        }, {
            "target": "alias(sumSeries(nonNegativeDerivative(" + metric_filter + ".cpu.*.cpu.wait,0)),'wait')"
        }, {
            "target": "alias(sumSeries(nonNegativeDerivative(" + metric_filter + ".cpu.*.cpu.steal,0)),'steal')"
        }, {
            "target": "alias(sumSeries(nonNegativeDerivative(" + metric_filter + ".cpu.*.cpu.nice,0)),'nice')"
        }, {
            "target": "alias(sumSeries(nonNegativeDerivative(" + metric_filter + ".cpu.*.cpu.softirq,0)),'irq')"
        }, {
            "target": "alias(sumSeries(nonNegativeDerivative(" + metric_filter + ".cpu.*.cpu.interrupt,0)),'intrpt')"
        } ],
        aliasColors: {
            "user": "#508642",
            "system": "#EAB839",
            "wait": "#890F02",
            "steal": "#E24D42",
            "idle": "#6ED0E0"
        }
    }
}
function panel_collectd_memory(title, prefix) {
    var idx = len(prefix);
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
        fill: 1,
        linewidth: 1,
        stack: true,
        nullPointMode: "null",
        targets: [{
            "target": "alias(movingMedian(" + metric_filter + ".memory.memory.buffered,'15min'),'buffered')"
        },{
            "target": "alias(movingMedian(" + metric_filter + ".memory.memory.cached,'15min'),'cached')"
        },{
            "target": "alias(movingMedian(" + metric_filter + ".memory.memory.free,'15min'),'free')"
        },{
            "target": "alias(movingMedian(" + metric_filter + ".memory.memory.used,'15min'),'used')"
        }],
        aliasColors: {
            "memory-free": "#629E51",
            "memory-used": "#1F78C1",
            "memory-cached": "#EF843C",
            "memory-buffered": "#CCA300"
        }
    }
}
function panel_collectd_loadavg(title, prefix) {
    var idx = len(prefix);
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
        fill: 0,
        linewidth: 2,
        nullPointMode: "null",
        targets: [{
            "target": "alias(movingMedian(" + metric_filter + ".load.load.longterm,'10min'),'longterm')"
        },{
            "target": "alias(movingMedian(" + metric_filter + ".load.load.midterm,'10min'),'midterm')"
        },{
            "target": "alias(movingMedian(" + metric_filter + ".load.load.shortterm,'10min'),'shortterm')"
        } ]
    }
}
function panel_collectd_network_octets(title, prefix, intrf) {
    intrf = (typeof intrf === "undefined") ? 'eth0' : intrf;
    var idx = len(prefix);
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
            "target": "alias(movingMedian(nonNegativeDerivative(keepLastValue(" + metric_filter + ".interface." + intrf + ".if_octets.rx,10),0),'5min'),'rx')"
        }, {
            "target": "alias(movingMedian(scale(nonNegativeDerivative(keepLastValue(" + metric_filter + ".interface." + intrf + ".if_octets.tx,10),0),-1),'5min'),'tx')"
        }]
    }
}
function panel_collectd_network_packets(title, prefix, intrf) {
    intrf = (typeof intrf === "undefined") ? 'eth0' : intrf;
    var idx = len(prefix);
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
            "target": "alias(movingMedian(nonNegativeDerivative(keepLastValue(" + metric_filter + ".interface." + intrf + ".if_packets.rx,10),0),'5min'),'rx')"
        }, {
            "target": "alias(movingMedian(scale(nonNegativeDerivative(keepLastValue(" + metric_filter + ".interface." + intrf + ".if_packets.tx,10),0),-1),'5min'),'tx')"
        }]
    }
}
function panel_collectd_df(title, prefix, vol) {
    vol = (typeof vol === "undefined") ? 'root' : vol;
    var idx = len(prefix);
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
            "target": "alias(" + metric_filter + ".df." + vol + ".df_complex.free,'free')"
            },{
            "target": "alias(" + metric_filter + ".df." + vol + ".df_complex.used,'used')"
            },{
            "target": "alias(" + metric_filter + ".df." + vol + ".df_complex.reserved,'reserved')"
        }],
        aliasColors: {
            "df_complex-used": "#447EBC",
            "df_complex-free": "#508642",
            "df_complex-reserved": "#EAB839"
        }
    }
}
function panel_collectd_disk(title, prefix, vol) {
    vol = (typeof vol === "undefined") ? 'sda' : vol;
    var idx = len(prefix);
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
        fill: 1,
        linewidth: 2,
        nullPointMode: "null",
        targets: [{
            "target": "alias(nonNegativeDerivative(" + metric_filter + ".disk." + vol + ".disk_ops.write,10),'write')"
        }, {
            "target": "alias(scale(nonNegativeDerivative(" + metric_filter + ".disk." + vol + ".disk_ops.read,10),-1),'read')"
        }],
        aliasColors: {
            "df_complex-used": "#447EBC",
            "df_complex-free": "#508642",
            "df_complex-reserved": "#EAB839"
        }
    }
}

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
}
function row_cpu_memory(title, prefix) {
    return {
        title: title,
        height: '250px',
        collapse: false,
        panels: [
            panel_collectd_cpu('CPU, %', prefix),
            panel_collectd_memory('Memory', prefix),
            panel_collectd_loadavg('Load avg, 10min', prefix)
        ]
    }
}
function row_network(title, prefix, filter) {
    var interfaces = find_filter_values(metric_filter+ '.interface.*');
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
}
function row_disk_space(title, prefix, filter) {
    var volumes = find_filter_values(metric_filter + '.df.*');
    panels_disk_space = [];
    for (var i in volumes) {
      if ( ! /root|srv|data/.test(volumes[i]) ) { continue; }
        panels_disk_space.push(panel_collectd_df('disk space', prefix, volumes[i]));
    }
    return {
        title: title,
        height: '250px',
        collapse: true,
        panels: panels_disk_space
    }
}
function row_disk_usage(title, prefix, filter) {
    var volumes = find_filter_values(metric_filter + '.disk.*');
    var panels_disk_usage = [];
    for (var i in volumes) {
       if ( /\d/.test(volumes[i]) ) { continue; } 
        panels_disk_usage.push(panel_collectd_disk('disk ops read/write', prefix, volumes[i]));
    }
    return {
        title: title,
        height: '250px',
        collapse: true,
        panels: panels_disk_usage
    }
}

return function(callback) {

    var dashboard;
    var prefix = arg_env + '.collectd.hosts.';
    var arg_filter = prefix + arg_i;
    var dashboard_filter = {
        time: {
            from: "now-" + arg_from,
            to: "now"
        },
        list: [
            get_filter_object("instance", arg_filter, false)
        ]
    };

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
            dashboard.rows.push(
                row_cpu_memory('cpu, memory', prefix),
                row_network('network', prefix, arg_filter),
                row_disk_space('disk space', prefix, arg_filter),
                row_disk_usage('disk ops', prefix, arg_filter)
            );
            for (var i in optional_rows) {
                dashboard.rows.push(optional_rows[i]);
            };
            callback(dashboard);
        });
}
