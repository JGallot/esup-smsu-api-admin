function debug_msg(msg) {
    $("#debug").html($("#debug").html() + "<br>" + msg);
};

(function () {
"use strict";

var app = angular.module('myApp');

app.service('h', function ($http, $rootScope, routes, globals, $q, $timeout, $window) {

var h = this;

this.objectKeys = function (o) {
    return $.map(o, function (l, k) { return k; });
};
this.objectValues = function (o) {
    return $.map(o, function (l, k) { return l; });
};
this.objectSlice = function (o, fields) {
    var r = {};
    angular.forEach(fields, function (field) {
	if (field in o)
	    r[field] = o[field];
    });
    return r;
};
this.array2hash = function (array, field) {
    var h = {};
    angular.forEach(array, function (e) {
	h[e[field]] = e;
    });
    return h;
};
this.array2hashMulti = function (array, field) {
    var h = {};
    angular.forEach(array, function (e) {
	var k = e[field];
	(h[k] = h[k] || []).push(e);
    });
    return h;
};
this.array_map = function (array, f) {
    var r = [];
    angular.forEach(array, function (e) {
	r.push(f(e)); 
    });
    return r;
};
this.array_concat_map = function (array, f) {
    var r = [];
    angular.forEach(array, function (e) {
	r = r.concat(f(e)); 
    });
    return r;
};
this.simpleFilter = function (array, f) {
    var r = [];
    angular.forEach(array, function (e) {
	if (f(e)) r.push(e);
    });
    return r;
};
this.simpleFind = function (array, f) {
    var r;
    angular.forEach(array, function (e) {
	if (f(e)) r = e; 
    });
    return r;
};
this.uniqWith = function (array, f) {
    var o = {};
    angular.forEach(array, function (e) {
	var k = f(e);
	if (!(k in o)) o[k] = e;
    });
    return h.objectValues(o);
};
this.uniq = function (array) {
    return h.set2array(h.array2set(array));
};
this.array_remove_elt = function (array, searchElement) {
    var i, length = array.length;
    for (i = 0; i < length; i++) {
      if (array[i] === searchElement) {
	  array.splice(i, 1);
          return;
      }
    }
};

this.array2set = function (array) {
    var set = {}
    angular.forEach(array, function (e) { set[e] = true; });
    return set;
};
this.set2array = function (set) {
    var array = [];
    angular.forEach(set, function (bool, e) {
	if (bool) array.push(e);
    });
    return array;
};
this.array_difference = function (array1, array2) {
    var set2 = this.array2set(array2);
    return this.simpleFilter(array1, function (e) { return !(e in set2); });
};
this.array_intersection = function (array1, array2) {
    var set2 = this.array2set(array2);
    return this.simpleFilter(array1, function (e) { return (e in set2); });
};

this.jsonpLogin = function () {
    return $http.jsonp(globals.baseURL + '/rest/login?callback=JSON_CALLBACK').then(function (resp) {
	return resp.data;
    });
};

function windowOpenLoginDivCreate() {
    var elt = angular.element('<div>', {'class': 'windowOpenLoginDiv alert alert-warning'});
    elt.html('Votre session a expiré. Veuillez vous identifier à nouveau. <span class="glyphicon glyphicon-log-in"></span>');
    angular.element('.myAppDiv').prepend(elt);
    return elt;
}
function windowOpenLoginOnMessage(state) {
    var onmessage = function(e) {
	if (typeof e.data !== "string") return;
	var m = e.data.match(/^loggedUser=(.*)$/);
	if (!m) return;

	windowOpenLoginCleanup(state);
	$rootScope.$apply(function () { 
	    state.deferredLogin.resolve(angular.fromJson(m[1]));
	    angular.forEach(state.deferredQueue, function (deferred) { deferred.resolve() });
	});
    };
    $window.addEventListener("message", onmessage);  
    return onmessage;
}
var windowOpenLoginState = {}
function windowOpenLoginCleanup(state) {
    try {
	if (state.div) state.div.remove();
	if (state.listener) $window.removeEventListener("message", state.listener);  
	if (state.window) state.window.close(); 
    } catch (e) {}
    windowOpenLoginState = {};
};
this.windowOpenLogin = function () {
    $rootScope.loggedUser = undefined; // hide app

    windowOpenLoginCleanup(windowOpenLoginState);
    var state = windowOpenLoginState = {};

    state.deferredLogin = $q.defer();
    state.deferredQueue = [];
    state.div = windowOpenLoginDivCreate();
    state.div.bind("click", function () {
	state.listener = windowOpenLoginOnMessage(state); 
	state.window = $window.open(globals.baseURL + '/rest/login');
    });
    return state.deferredLogin.promise;
};

this.loginMayRedirect = function () {
    if (globals.isWebWidget) {
	// we can't redirect
	console.log("jsonpLogin failed, trying windowOpenLogin");
	return h.windowOpenLogin();
    } else {
	console.log("jsonpLogin failed, trying redirect");
	var then = $window.location.hash && $window.location.hash.replace(/^#/, '');
	$window.location.href = globals.baseURL + '/rest/login?then=' + encodeURIComponent(then);
    }
}

function tryRelog() {

    function relogSuccess(loggedUser) {
	console.log('relog success');
	h.setLoggedUser(loggedUser);
	return null;
    }
    function queueXhrRequest() {
	console.log('queuing request');
	var deferred = $q.defer();
	windowOpenLoginState.deferredQueue.push(deferred);
	return deferred.promise;
    }

    if (windowOpenLoginState.deferredQueue) {
	return queueXhrRequest();
    }
    return h.jsonpLogin().then(relogSuccess, function () {
	if (windowOpenLoginState.deferredQueue) {
	    return queueXhrRequest();
	}
	console.log("jsonpLogin failed, going to windowOpenLogin");
	return h.windowOpenLogin().then(relogSuccess, function (resp) {
	    console.log('relog failed');
	    console.log(resp);
	    alert("relog failed");
	    return $q.reject("needIframe");
	});
    });
}

this.setLoggedUser = function (loggedUser) {
    console.log('user logged in: ' + loggedUser.login + " " + loggedUser.role);

    function setIt() {
	$rootScope.loggedUser = h.userWithCapabilities(loggedUser, $rootScope.roles);
    };
    if ($rootScope.roles) {
	setIt();
    } else {
	h.getRolesInScope($rootScope).then(setIt);
    }
};

function fromJsonOrNull(json) {
    try {
	return angular.fromJson(json);
    } catch (e) {
	return null;
    }
}

function setHttpHeader(methods, name, val) {
    var headers = $http.defaults.headers;
    angular.forEach(methods, function (method) {
	if (!headers[method]) headers[method] = {};
	headers[method][name] = val;
    });
}

var xhrRequestInvalidCsrfState = false;
function xhrRequest(args) {
    var onError401 = function (resp) {
	return tryRelog().then(function () { 
	    return xhrRequest(args);;
	});
    };
    var onErrorCsrf = function (resp, err) {
	if (xhrRequestInvalidCsrfState) {
	    alert("Invalid CRSF prevention token failed twice");
	    return $q.reject(resp);
	}
	xhrRequestInvalidCsrfState = true;
	setHttpHeader(['post','put','delete'], "X-CSRF-TOKEN", err.token);
	console.log("retrying with new CSRF token");
	return xhrRequest(args);
    };
    var onErrorFromJson = function(resp, err) {
	if (err.error === "Invalid CRSF prevention token")
	    return onErrorCsrf(resp, err);
	else {
	    alert(err.error);
	    return $q.reject(resp);
	}
    };
    var onError = function(resp) {
	var status = resp.status;
	if (status == 0) {
	    alert("unknown failure (server seems to be down)");
	    return $q.reject(resp);
	} else if (status == 401) {
	    return onError401(resp);
	} else if (resp.data) {
	    var err = fromJsonOrNull(resp.data);
	    if (err && err.error)
		return onErrorFromJson(resp, err);

	}
	alert("unknown error " + status);
	return $q.reject(resp);
    };
    return $http(args).then(function (resp) {
	xhrRequestInvalidCsrfState = false;
	return resp;
    }, onError);
}

this.callRest = function ($function, params) {
    var url = globals.baseURL + '/rest/' + $function;
    params = angular.extend({}, params);
    params.cacheSlayer = new Date().getTime(); // for our beloved IE which caches every AJAX... ( http://stackoverflow.com/questions/16098430/angular-ie-caching-issue-for-http )
    var args = { method: 'get', url: url, params: params };
    return xhrRequest(args).then(function(resp) {
	return resp.data;
    });
};

this.callRestModify = function (method, restPath, o) {
    var args = { method: method, url: globals.baseURL + '/rest/' + restPath };
    if (method !== 'post') {
	var id = o.id;
	if (typeof id === "undefined") return alert("internal error: missing id");
	delete o.id;
	args.url += '/'+id;
    }
    if (method !== 'delete') {
	args.data = o;
    }
    return xhrRequest(args);
};

var computeUserCapabilities = function (user, roles) {
    var role = roles[user.role];
    if (!role) console.log("user " + user.login + " has unknown role " + user.role);
    var can = {};
    angular.forEach(role.fonctions || [], function (c) {
	can[c] = true;
    });
    return can;
};

this.userWithCapabilities = function (user, roles) {
    user.can = computeUserCapabilities(user, roles);
    return user;
};

this.findCurrentTab = function ($scope, templateUrl) {
    var tab = h.simpleFind(routes.routes, function (tab) { return tab.templateUrl == templateUrl; });
    if (!tab) return;
    var mainTab;
    if (tab.parent) {
	mainTab = h.simpleFind(routes.routes, function (mainTab) { return mainTab.route == tab.parent; });
    } else {
	mainTab = tab;
    }
    $scope.currentMainTab = mainTab;
    $scope.currentTab = tab;
};

this.getRolesInScope = function ($scope) {
    return h.callRest('roles').then(function(roles) {
	$scope.roles = h.array2hash(roles, 'role');
    });
};

this.getInstAppAccount = function (e) {
    return { institution: e.institution, app: e.appName, account: e.accountName };
};

this.getUsers = function () {
    return h.callRest('users').then(function(users) {
	return h.array2hash(users, 'id');
    });
};

this.getApplications = function () {
    return h.callRest('applications');
};

this.getAccounts = function () {
    return h.callRest('accounts');
};

function findName(base, existingHash) {
    var name = base;
    var i = 2;
    while (name in existingHash) {
	name = base + ' ' + i++;
    }
    return name;
}

this.createEmptyAccount = function (accountNameSuggestion, accounts) {
    var name = findName(accountNameSuggestion, h.array2hash(accounts, 'name'));
    console.log("found free account name " + name);

    return h.callRestModify('post', 'accounts', { name: name, quota: 0 }).then(function () {
	return h.getAccounts();
    }).then(function (accounts) {
	return h.array2hash(accounts, 'name')[name];
    });
};

this.cleanupUportalCss = function () {
    // get rid of ugly stuff from uportal...
    $('link[href*="/fss-framework-1.1.2.min.css"]').attr('disabled', 'disabled');
    $('link[href*="/portlet.css"]').attr('disabled', 'disabled');
    //$('link[href*="/fss-theme-mist.min.css"]').attr('disabled', 'disabled');
    $('.fl-theme-mist').toggleClass('fl-theme-mist');
};

function toCSV(rows, attrs) {
    return rows.map(function (row) {
	return row.map(function (v) { 
	    return v.replace(/,/g, '');
	}).join(',');
    }).join("\n");
}

this.exportCSV = function (domElt, rows, fileName) {
    var csv = toCSV(rows);
    var uri = "data:text/csv;charset=utf-8," + csv;
    var link = document.createElement("a");
    link.setAttribute("href", encodeURI(uri));
    if (fileName) link.setAttribute("download", fileName);
    domElt.appendChild(link); // needed on Firefox, but not Chromium.
    link.click();
};

});

})();
