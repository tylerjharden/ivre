/*
 * This file is part of IVRE.
 * Copyright 2011 - 2015 Pierre LALET <pierre.lalet@cea.fr>
 *
 * IVRE is free software: you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * IVRE is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public
 * License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with IVRE. If not, see <http://www.gnu.org/licenses/>.
 */

/************ AngularJS related controllers ************/

// Our AngularJS App

var ivreWebUi = angular.module('ivreWebUi', []);

function get_scope(controller) {
    return angular.element(
	document.querySelector(
	    '[ng-controller=' + controller + ']'
	)).scope();
}

// Popover directive

ivreWebUi.directive('popover', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){
            $(element).hover(function(){
                // on mouseenter
                $(element).popover('show').on("mouseleave", function () {
                var _this = this;
                todo = function () {
                    if (!$(".popover:hover").length) {
                        $(_this).popover("hide");
                    } else {
                        setTimeout(todo, 100);
                    }
                };
                setTimeout(todo, 10);
            });
            }, function(){});
        }
    };
});

// The Web UI display controller

ivreWebUi
    .controller('IvreMainCtrl', function ($scope) {
	$scope.setparam = setparam;
	$scope.totalnbrres = undefined;
	// notes: here because the buttons are located in the menu and
	// the results
	$scope.notes_page = undefined;
	$scope.notes_display = "none";
	$scope.togglenotes = function (page) {
	    if($scope.notes_display === "none") {
		hideall();
		$scope.notes_display = "inline";
		$scope.notes_page = config.notesbase.replace(/#IP#/g, page);
	    }
	    else if($scope.notes_page.indexOf(
		config.notesbase.replace(/#IP#/g, page)) !== -1)
		$scope.notes_display = "none";
	    else
		$scope.notes_page = config.notesbase.replace(/#IP#/g, page);
	};
	// graphs:here beacause the buttons are located w/ the filters
	$scope.build_ip_plane = function() {
	    var totalnbrres = $scope.totalnbrres;
	    if(totalnbrres === undefined)
		return;
	    if(totalnbrres < config.warn_dots_count || confirm("You are about to ask your browser to display " + totalnbrres + " dots, which is a lot and might slow down, freeze or crash your browser. Do you want to continue?")) {
		hideall();
		var c1 = document.getElementById('chart1');
		c1.innerHTML = "";
		var s = document.getElementById('chart1script');
		if(s) c1.parentNode.removeChild(s);
		document.getElementById('charts').style.display = 'inline';
		s = document.createElement('script');
		s.id = 'chart1script';
		s.src = config.cgibase + '?callback=' + encodeURIComponent("(function(ips){build_chart_plane('chart1', ips);})")+ '&countopenports=1&ipsasnumbers=1&q=' + encodeURIComponent(query);
		c1.parentNode.appendChild(s);
	    }
	    else {
		hidecharts();
	    }
	};
	$scope.build_ip_map = build_ip_map;
	$scope.build_ip_timeline = function(modulo) {
	    var totalnbrres = $scope.totalnbrres;
	    if(totalnbrres === undefined)
		return;
	    if(totalnbrres < config.warn_dots_count || modulo !== undefined || confirm("You are about to ask your browser to display " + totalnbrres + " dots, which is a lot and might slow down, freeze or crash your browser. Do you want to continue?")) {
		hideall();
		var c1 = document.getElementById('chart1');
		c1.innerHTML = "";
		var s = document.getElementById('chart1script');
		if(s) c1.parentNode.removeChild(s);
		document.getElementById('charts').style.display = 'inline';
		s = document.createElement('script');
		s.id = 'chart1script';
		s.src = config.cgibase + '?callback=' + encodeURIComponent("(function(ips){build_chart_timeline('chart1', ips);})")+ '&timeline=1&ipsasnumbers=1&q=' + encodeURIComponent(query);
		if(modulo !== undefined)
		    s.src += '&modulo=' + modulo;
		c1.parentNode.appendChild(s);
	    }
	    else {
		hidecharts();
	    }
	};
	$scope.build_ip_ports = function() {
	    var totalnbrres = $scope.totalnbrres;
	    if(totalnbrres === undefined)
		return;
	    if(totalnbrres < config.warn_dots_count || confirm("You are about to ask your browser to display " + totalnbrres + " dots, which is a lot and might slow down, freeze or crash your browser. Do you want to continue?")) {
		hideall();
		var c1 = document.getElementById('chart1');
		c1.innerHTML = "";
		var s = document.getElementById('chart1script');
		if(s) c1.parentNode.removeChild(s);
		document.getElementById('charts').style.display = 'inline';
		s = document.createElement('script');
		s.id = 'chart1script';
		s.src = config.cgibase + '?callback=' + encodeURIComponent("(function(ips){build_chart_ports('chart1', ips);})")+ '&ipsports=1&ipsasnumbers=1&q=' + encodeURIComponent(query);
		c1.parentNode.appendChild(s);
	    }
	    else {
		hidecharts();
	    }
	};
    });

function build_ip_map(fullworld) {
    hideall();
    var c1 = document.getElementById('chart1');
    c1.innerHTML = "";
    var s = document.getElementById('chart1script');
    if(s) c1.parentNode.removeChild(s);
    document.getElementById('charts').style.display = 'inline';
    s = document.createElement('script');
    s.id = 'chart1script';
    s.src = config.cgibase + '?callback=' + encodeURIComponent("(function(ips){build_chart_map('chart1', ips, " + fullworld + ");})")+ '&coordinates=1&ipsasnumbers=1&q=' + encodeURIComponent(query);
    c1.parentNode.appendChild(s);
}


// The menu controller

ivreWebUi
    .controller('IvreMenuCtrl', function ($scope) {
	$scope.get_href = function() {return document.location.href;};
	$scope.get_title = function() {return document.title;};
	$scope.add_bookmark = function() {
	    // https://stackoverflow.com/questions/3024745
	    // https://stackoverflow.com/questions/19289739
	    if (window.sidebar) // Mozilla Firefox Bookmark
		return true;
	    else if(window.external) // IE Favorite
		window.external.AddFavorite(location.href, document.title);
	    else if(window.opera && window.print) // Opera Hotlist
		return true;
	    return false;
	};
	$scope.get_mail_href = function() {
	    return 'mailto:?subject=' +
		encodeURIComponent(document.title) +
		'&body=' +
		encodeURIComponent(document.location.href);
	};
    })
    .directive('ivreMenu', function() {
	return {
	    templateUrl: 'templates/menu.html'
	};
    });

// The progress bar controller

ivreWebUi
    .controller('IvreProgressCtrl', function ($scope) {
	$scope.firstdisplayed = undefined;
	$scope.lastdisplayed = undefined;
	$scope.at_start = function() {
	    return $scope.firstdisplayed === 1;
	};
	$scope.at_end = function() {
	    return $scope.lastdisplayed === $scope.totalnbrres;
	};
	$scope.goto_start = function() {
	    if(!$scope.at_start())
		setparam('skip', '0', true);
	};
	$scope.goto_end = function() {
	    if(!$scope.at_end())
		setparam(
		    'skip',
		    $scope.totalnbrres - $scope.lastdisplayed +
			$scope.firstdisplayed - 1 + "",
		    true);
	};
	$scope.go_back = function(count) {
	    if(!$scope.at_start())
		setparam('skip', $scope.firstdisplayed - count - 1 + '', true);
	};
	$scope.go_forward = function(count) {
	    if(!$scope.at_end())
		setparam('skip', $scope.firstdisplayed + count - 1 + '', true);
	};
    })
    .directive('ivreProgressBar', function() {
	return {
	    templateUrl: 'templates/progressbar.html'
	};
    });


function set_nbrres(nbr) {
    var scope = get_scope('IvreMainCtrl');
    scope.$apply(function() {
	scope.totalnbrres = nbr;
    });
}

function set_display_bounds(first, last) {
    var scope = get_scope('IvreProgressCtrl');
    scope.$apply(function() {
	scope.firstdisplayed = first;
	scope.lastdisplayed = last;
    });
}

// The filter list controller

ivreWebUi
    .controller('IvreFilterListCtrl', function ($scope) {
	$scope.lastfiltervalue = "";
	var topvalues = [
	    "category", "source",
	    "domains", "domains:", "hop", "hop:",
	    // infos
	    "country", "city", "as",
	    // ports
	    "port", "port:open", "port:closed", "port:filtered",
	    // countports / portlist
	    "countports:open", "countports:filtered", "countports:closed",
	    "portlist:open", "portlist:closed", "portlist:filtered",
	    // service, products, etc. [:port]
	    "service", "service:",
	    "probedservice", "probedservice:",
	    "product", "product:",
	    "version", "version:",
	    "devicetype", "devicetype:",
	    // cpes
	    "cpe", "cpe:", "cpe.type", "cpe.type:", "cpe.vendor", "cpe.vendor:",
	    "cpe.product", "cpe.product:", "cpe.version", "cpe.version:",
	    // scripts
	    "script", "portscript", "hostscript",
	    "script:", "portscript:", "hostscript:",
	    // smb (hostscript smb-os-discovery)
	    "smb.os", "smb.lanmanager",
	    "smb.domain", "smb.dnsdomain",
	    "smb.forest", "smb.workgroup",
	    // cert (portscript ssl-cert)
	    "cert.issuer", "cert.subject",
	    // modbus (portscript modbus-discover)
	    "modbus.deviceid",
	    // s7 (portscript s7-info)
	    "s7.Module", "s7.Version", "s7.Module Type",
	    // enip (portscript enip-info)
	    "enip.vendor", "enip.product", "enip.serial", "enip.devtype",
	    "enip.prodcode", "enip.rev", "enip.ip",
	    // screenwords (words from screenshots)
	    "screenwords",
	];
	$scope.topvalues = topvalues;
	for(var i in topvalues) {
	    $scope.topvalues.push("-" + topvalues[i]);
	}
    })
    .directive('ivreFilters', function() {
	return {
	    templateUrl: 'templates/filters.html'
	};
    });

function add_filter(filter) {
    var scope = get_scope('IvreFilterListCtrl');
    scope.$apply(function() {
	scope.filters.push(filter);
    });
}

function clear_filters() {
    var scope = get_scope('IvreFilterListCtrl');
    scope.$apply(function() {
	scope.filters = [];
	scope.lastfiltervalue = "";
    });
}


ivreWebUi
    .controller('IvreResultListCtrl', function ($scope) {
	$scope.results = [];
	$scope.display_mode = "host";
	$scope.display_mode_args = [];
	$scope.script_display_mode_needed_scripts_group = function(scripts) {
	    if(scripts === undefined || scripts.length === 0)
		return false;
	    if($scope.display_mode_args.length === 0)
		return true;
	    return scripts
		.some(function(x) {
		    return $scope.display_mode_args.indexOf(x.id) !== -1;
		});
	};
	$scope.script_display_mode_needed_script = function(scriptid) {
	    if($scope.display_mode_args.length === 0)
		return true;
	    return $scope.display_mode_args.indexOf(scriptid) !== -1;
	};
	$scope.set_timer_toggle_preview = function(event, host) {
	    event = event || window.event;
	    if((event.keyCode || event.which) === 1)
		clicktimeout = setTimeout(
		    function() {
			$scope.$apply(function() {
			    host.fulldisplay = !host.fulldisplay;
			});
		    },
		    200);
	    event.stopPropagation();
	};
	$scope.clear_timer_toggle_preview = function(event) {
	    if(clicktimeout !== null) {
		event = event || window.event;
		clearTimeout(clicktimeout);
		event.stopPropagation();
	    }
	};
	$scope.wanted_param = function(param, value) {
	    var wanted = getparamvalues(param)
		.filter(function(x) {return x[0];})
		.map(function(x) {return x[1];});
	    return wanted.indexOf(value) != -1;
	};
	$scope.wanted_trace = function(trace) {
	    var hops = trace.hops.map(function(hop) {return hop.ipaddr;});
	    for(var i in wanted_hops) {
		if(hops.indexOf(wanted_hops[i]) != -1)
		    return true;
	    }
	    return false;
	};
	$scope.wanted_hop = function(hop) {
	    return wanted_hops.indexOf(hop) != -1;
	};
	$scope.wanted_script = function(type, value) {
	    return value in {
		"port": wanted_portscripts,
		"host": wanted_hostscripts
	    }[type];
	};
	$scope.class_from_port_status = function(status) {
	    switch(status) {
	    case "open": return "label-success";
	    case "closed": return "label-important";
	    case "filtered": return "label-warning";
	    }
	};
	$scope.short_port_status = function(status) {
	    if(status === "filtered")
		return "fltred";
	    return status;
	};
	$scope.url_from_port = function(port, addr) {
	    var result;
	    var schemes = {
		// service_name: [url_scheme, default_port,
		//		  url_scheme_ssl, default_port_ssl]
		'http': ['http', 80, 'https', 443],
		'ldap': ['ldap', 389, 'ldaps', 636],
		'ftp': ['ftp', 21, 'ftps', 990],
	    };
	    if ('service_name' in port && port.service_name in schemes) {
		if('service_tunnel' in port &&
		   port.service_tunnel === 'ssl') {
		    result = schemes[port.service_name][2] + '://' + addr;
		    if(port.port !== schemes[port.service_name][3])
			result += ':' + port.port;
		    result += '/';
		}
		else {
		    result = schemes[port.service_name][0] + '://' + addr;
		    if(port.port !== schemes[port.service_name][1])
			result += ':' + port.port;
		    result += '/';
		}
	    }
	    else {
		result = addr + ':' + port.port;
	    }
	    return result;
	};
    $scope.get_reshaped_cpes = function(host) {
        if(host.n_cpes)
            return host.n_cpes;
        cpes = host.cpes;
        n_cpes = {};
        type2str = {
            'h': 'Hw',
            'o': 'OS',
            'a': 'App',
        };
        my_setdefault = function(d, key) {
            if(!("data" in d)) {
                d.data = {};
            }
            if(key in d.data) {
                return d.data[key];
            } else {
                d.data[key] = {"name": key, "data": {}};
                return d.data[key];
            }
        }
        for(var i in cpes) {
            cpe = cpes[i];
            type = type2str[cpe.type] || "Unknown";
            type_d = my_setdefault(n_cpes, cpe.type);
            type_d.pretty_name = type;
            vend_d = my_setdefault(type_d, cpe.vendor);
            prod_d = my_setdefault(vend_d, cpe.product);
            comp_d = my_setdefault(prod_d, cpe.version);
            comp_d.origins || (comp_d.origins = []);
            comp_d.origins = comp_d.origins.concat(cpe.origins);
            comp_d.tooltitle = "cpe:/" +
                               [cpe.type, cpe.vendor, cpe.product, cpe.version]
                               .join(":").replace(/:+$/, "");
            comp_d.toolcontent = cpe.origins.join('<br/>');
        }
        host.n_cpes = n_cpes;
        return host.n_cpes;
    };
    $scope.set_cpe_param = function(type, vendor, product, version) {
        query = [];
        parts = [type, vendor, product, version];
        for(var i in parts) {
            if(parts[i] && !!parts[i].name) {
                query.push(parts[i].name);
            } else {
                break;
            }
        }
        $scope.setparam("cpe", query.join(':'));
    }
    })
    .directive('displayHost', function() {
	return {
	    templateUrl: 'templates/view-hosts.html'
	};
    })
    .directive('displayScript', function() {
	return {
	    templateUrl: 'templates/view-scripts-only.html'
	};
    })
    .directive('displayScreenshot', function() {
	return {
	    templateUrl: 'templates/view-screenshots-only.html'
	};
    })
    .directive('displayCpe', function() {
	return {
	    templateUrl: 'templates/view-cpes-only.html'
	};
    })
    .directive('hostSummary', function() {
	return {
	    templateUrl: 'templates/subview-host-summary.html'
	};
    })
    .directive('portSummary', function() {
	return {
	    templateUrl: 'templates/subview-port-summary.html'
	};
    })
    .directive('portsSummary', function() {
	return {
	    templateUrl: 'templates/subview-ports-summary.html'
	};
    })
    .directive('serviceSummary', function() {
	return {
	    templateUrl: 'templates/subview-service-summary.html'
	};
    })
    .directive('scriptOutput', function() {
	return {"link": function(scope, element, attr) {
	    var wanted = {
		'port': wanted_portscripts,
		'host': wanted_hostscripts
	    }[attr.scriptOutput][scope.script.id];
	    var output = scope.script.output
		.split('\n')
		.map(function(x) {return x.trim();})
		.filter(function(x) {return x;})
		.join('\n')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
	    if(scope.wanted_script(attr.scriptOutput, scope.script.id)) {
		for(var i in wanted) {
		    var expr = str2regexp(wanted[i]);
		    output = output.replace(
			expr, '<span class="highlight-more">$&</span>'
		    );
		}
	    }
	    element.html(output);
	}};
    });

function prepare_host(host) {
    // This function adds the properties needed for the presentation
    // of an host object
    host.addr_links = addr_links(host);
    host.hostnames_links = hostnames_links(host);
    host.fulldisplay = false;
    host.port_summary = port_summary(host);
    host.starttime = 1000 * host.starttime;
    host.endtime = 1000 * host.endtime;
    return host;
}

function add_host(host) {
    var scope = get_scope('IvreResultListCtrl');
    scope.$apply(function() {
	scope.results.push(prepare_host(host));
    });
}

function clear_hosts() {
    var scope = get_scope('IvreResultListCtrl');
    scope.$apply(function() {
	scope.results = [];
    });
}

function toggle_full_display(hostindex) {
    var scope = get_scope('IvreResultListCtrl');
    scope.$apply(function() {
	scope.results[hostindex].fulldisplay = true;
    });
}

function count_displayed_hosts() {
    var scope = get_scope('IvreResultListCtrl');
    return scope.results.length;
}

function set_display_mode(mode) {
    var scope = get_scope('IvreResultListCtrl');
    if(mode === undefined)
	mode = "host"; // default
    scope.$apply(function() { 
	if(mode.substr(0, 7) === "script:") {
	    scope.display_mode_args = mode.substr(7).split(",");
	    mode = "script";
	}
	scope.display_mode = mode;
    });
}

ivreWebUi
    .controller('IvreAnalysisCtrl', function ($scope) {
    });
