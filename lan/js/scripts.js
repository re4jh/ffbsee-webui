/* New Ones */

function initialShow() {
	show(document.querySelector('section#home'));
	hide(document.querySelector('pre#msg'));
}

function section_toggle(section_selector) {

	allSections = document.querySelectorAll('main section');
	for (var i = 0; i < allSections.length; i++) {
		hide(allSections[i]);
	}

	show(document.querySelector('section#' + section_selector));

	switch (section_selector) {
		/*
				case 'home':
					init_home();
					break;
				case 'network':
					init_network();
					break;
				case 'wifiscan':
					init_wifiscan();
					break;
				case 'settings':
					break;
				case 'upgrade':
					break;
				case 'password':
					break;
		*/
	}
}

/* imported from shared.js */
function $(id) {
	return document.querySelector(id);
}

function show(e) {
	if (e.style === 'undefined' || e.style.display === 'undefined') {
		e.setAttribute("style", "display: block;");
	} else {
		e.style.display = 'block';
	}
}

function hide(e) {
	if (e.style === 'undefined' || e.style.display === 'undefined') {
		e.setAttribute("style", "display: none;");
	} else {
		e.style.display = 'none';
	}
}

function addClass(e, c) {
	e.classList.add(c);
}

function removeClass(e, c) {
	e.classList.remove(c);
}

function setText(id, txt) {
	$(id).innerHTML = txt;
}

function inArray(item, array) {
	return array.indexOf(item) != -1;
}

function split(str)	{
	if (typeof str != 'string') {
		return [];
	}
	var a = str.match(/[^\s]+/g);
	return (a ? a : []);
}

function uniq(arr)	{
	var obj = {};
	for (var i in arr) obj[arr[i]] = 0;
	return Object.keys(obj);
}

//remove an item from a string list
function removeItem(str, item)	{
	var array = split(str);
	for (var i in array) {
		if (array[i] == item) {
			array.splice(i, 1);
		}
	}
	return array.join(' ');
}

function addItem(str, item)	{
	var array = split(str);
	for (var i in array) {
		if (array[i] == item) {
			return str;
		}
	}
	array.push(item);
	return array.sort().join(' ');
}

function replaceItem(str, old_item, new_item)	{
	var array = split(str);
	for (var i in array) {
		if (array[i] == old_item) {
			array[i] = new_item;
		}
	}
	return array.join(' ');
}

function addHelpText(elem, text) {
	var help = $("help");

	if (help) {
		elem.onmouseover = function (e) {
			help.style.top = (e.clientY - 20) + "px";
			help.style.left = (e.clientX + 80) + "px";
			help.innerHTML = text;
			show(help);
		};

		elem.onmouseout = function () {
			help.innerHTML = "";
			hide(help);
		};
	}
}

//to config file syntax
function toUCI(pkg_obj)	{
	var str = "\n";
	for (var sid in pkg_obj)	{
		if (sid == "pchanged") {
			continue;
		}

		var options = pkg_obj[sid];
		var sname = (sid.substring(0, 3) != "cfg") ? (" '" + sid + "'") : "";
		str += "config " + options.stype + sname + "\n";
		for (var oname in options) {
			if (oname == "stype") {
				continue;
			}
			var value = options[oname];
			if (typeof value == 'object') {
				for (var i in value)
					str += "	list " + oname + " '" + value[i] + "'\n";
			}	else
				str += "	option " + oname + " '" + value + "'\n";
		}
		str += "\n";
	}
	return str;
}

// parses output from one or multiple
// calls like "uci -qn export foo"
function fromUCI(pkgs_str)	{
	var pkg_objs = {};
	var pkg;
	var cfg;

	var lines = pkgs_str.split("\n");
	for (var i = 0; i < lines.length; ++i) {
		var line = lines[i];
		var items = split(line);

		if (items.length < 2) {
			continue;
		}

		switch (items[0])	{
			case 'package':
				pkg = {pchanged: false};
				pkg_objs[items[1]] = pkg;
				break;
			case 'config':
				var val = (items.length == 3) ? line.match(/'(.*)'/)[1] : ("cfg" + (++gid));
				cfg = {stype: items[1]};
				pkg[val] = cfg;
				break;
			case 'option':
				var val = line.match(/'(.*)'/)[1];
				cfg[items[1]] = val;
				break;
			case 'list':
				var val = line.match(/'(.*)'/)[1];
				if (!(items[1] in cfg)) cfg[items[1]] = [];
				cfg[items[1]].push(val);
				break;
		}
	}
	return pkg_objs;
}

function firstSectionID(obj, stype)	{
	for (var id in obj) {
		if (obj[id].stype == stype) {
			return id;
		}
	}
}

function config_foreach(objs, stype, func)	{
	for (var key in objs) {
		var obj = objs[key];
		if ((obj["stype"] == stype || stype == "*") && func(key, obj)) {
			return true;
		}
	}
	return false;
}

function config_find(objs, mobj)	{
	for (var key in objs) {
		var obj = objs[key];
		var found = true;
		for (mkey in mobj) {
			if (obj[mkey] != mobj[mkey]) {
				found = false;
				break;
			}
		}
		if (found)
			return obj;
	}
	return null;
}

function params(obj)	{
	var str = "";
	for (var key in obj) {
		if (str.length) str += "&";
		else str += "?";
		str += encodeURIComponent(key) + "=" + encodeURIComponent(obj[key]);
	}
	return str.replace(/%20/g, "+");
}

function send(url, obj, func)	{
	url += params(obj);
	jx.load(url, func, 'text');
}

function onDesc(e, tag, func)	{
	for (var i = 0; i < e.childNodes.length; ++i) {
		var c = e.childNodes[i];
		if (c.tagName == tag && func(c) == false) return;
		onDesc(c, tag, func);
	}
}

function onChilds(e, tag, func)	{
	for (var i = 0; i < e.childNodes.length; ++i) {
		var c = e.childNodes[i];
		if (c.tagName == tag && func(c) == false) return;
	}
}

function onParents(e, tag, func)	{
	while (e != document) {
		e = e.parentNode;
		if (e.tagName == tag && func(e) == false) return;
	}
}

function removeChilds(p)	{
	while (p.hasChildNodes())
		p.removeChild(p.firstChild);
}

function show_error(data)	{
	var is_error = (data.includes("Fehler") || data.includes("Error"));
	if (is_error)
		setText('msg', data);
	return is_error;
}

function checkName(name)	{
	if (/[\w_]{2,12}/.test(name))
		return true;
	alert("Name '" + name + "' ist ung\xfcltig.");
	return false;
}

//prepend input check
function addInputCheck(input, regex, msg)	{
	var prev_value = input.value;
	var prev_onchange = input.onchange;
	input.onchange = function (e) {
		if (regex.test(input.value)) {
			if (prev_onchange)
				prev_onchange(e);
			return;
		}
		alert(msg);
		input.value = prev_value;
		e.stopPropagation();
	};
}

function collect_inputs(p, obj)	{
	if (p.tagName == "SELECT")
		obj[p.name] = p.value;
	if (p.tagName == "INPUT")
		if (p.type == "text" || p.type == "password" || (p.type == "radio" && p.checked))
			obj[p.name] = p.value
		else if (p.type == "checkbox" && p.checked)	{
			var v = obj[p.name];
			v = (typeof v == "undefined") ? (p.data || p.value) : (v + " " + (p.data || p.value));
			obj[p.name] = v;
		}

	for (var i = 0; i < p.childNodes.length; ++i)
		collect_inputs(p.childNodes[i], obj);
}

function append(parent, tag, id)	{
	var e = document.createElement(tag);
	if (id) e.id = id;
	parent.appendChild(e);
	return e;
}

function append_section(parent, title, id)	{
	var fs = append(parent, "fieldset");
	var lg = append(fs, "legend");
	lg.innerHTML = title;
	if (id) fs.id = id;
	return fs;
}

function append_button(parent, text, onclick)	{
	var button = append(parent, 'button');
	button.type = 'button';
	button.innerHTML = text;
	button.onclick = onclick;
	return button;
}

function append_label(parent, title, value)	{
	var div = append(parent, 'div');
	append(div, 'label').innerHTML = title + ":";
	append(div, 'span').innerHTML = value;
	return div;
}

/*
 <select><option></option>... </select>
*/
function append_options(parent, name, selected, choices)	{
	var select = append(parent, 'select');
	select.style.minWidth = "5em";
	select.name = name;
	for (var i in choices)	{
		var s = (typeof choices[i] != 'object');
		var choice_text = " " + (s ? choices[i] : choices[i][0]);
		var choice_value = "" + (s ? choices[i] : choices[i][1]);

		var option = append(select, 'option');
		option.value = choice_value;
		option.selected = (choice_value == selected) ? "selected" : "";
		option.innerHTML = choice_text;
	}
	return select;
}

function append_selection(parent, title, name, selected, choices)	{
	var p = append(parent, 'div');
	var label = append(p, 'label');

	p.className = "select_option";
	label.innerHTML = title + ":";

	append_options(p, name, selected, choices);
	return p;
}

// Append an input field.
// E.g. append_input(parent, "Name", "name_string", "MyName")
function append_input(parent, title, name, value)	{
	var div = append(parent, 'div');
	var label = append(div, 'label');
	var input = append(div, 'input');

	label.innerHTML = title + ":";
	input.value = (typeof value == "undefined") ? "" : value;
	input.name = name;
	input.type = "text";

	return div;
}

// Append a radio field.
// E.g. append_radio(parent, "Enabled", "enabled", 0, [["Yes", 1], ["No", 0])
function append_radio(parent, title, name, selected, choices) {
	return _selection("radio", parent, title, name, [selected], choices);
}

// Append a checkbox field.
// E.g. append_check(parent, "Enabled", "enabled", ["grass"], [["Grass", "grass"], ["Butter", "butter"]])
function append_check(parent, title, name, selected, choices) {
	return _selection("checkbox", parent, title, name, selected, choices);
}

function _selection(type, parent, title, name, selected, choices)	{
	var p = append(parent, 'div');
	var label = append(p, 'label');
	var span = append(p, 'span');

	p.className = "radio_option";
	label.innerHTML = title + ":";

	for (var i in choices) {
		var s = (typeof choices[i] == 'string');
		var choice_text = "" + (s ? choices[i] : choices[i][0]);
		var choice_value = "" + (s ? choices[i] : choices[i][1]);
		var choice_help = s ? undefined : choices[i][2];

		var div = append(span, 'div');
		var input = append(div, 'input');
		var label = append(div, 'label');

		input.name = name;
		input.value = choice_value;
		input.data = choice_value; //for IE :-(
		input.type = type;

		if (inArray(choice_value, selected)) {
			input.checked = "checked"
		}

		label.innerHTML = " " + choice_text;

		if (choice_text == "_") {
			hide(div);
		}

		if (choice_help) {
			addHelpText(label, choice_help);
		}
	}
	return p;
}

//from jx_compressed.js
jx = {
	getHTTPObject: function () {
		var A = false;
		if (typeof ActiveXObject != "undefined") {
			try {
				A = new ActiveXObject("Msxml2.XMLHTTP")
			} catch (C) {
				try {
					A = new ActiveXObject("Microsoft.XMLHTTP")
				} catch (B) {
					A = false
				}
			}
		} else {
			if (window.XMLHttpRequest) {
				try {
					A = new XMLHttpRequest()
				} catch (C) {
					A = false
				}
			}
		}
		return A
	}, load: function (url, callback, format) {
		var http = this.init();
		if (!http || !url) {
			return
		}
		if (http.overrideMimeType) {
			http.overrideMimeType("text/xml")
		}
		if (!format) {
			var format = "text"
		}
		format = format.toLowerCase();
		var now = "uid=" + new Date().getTime();
		url += (url.indexOf("?") + 1) ? "&" : "?";
		url += now;
		http.open("GET", url, true);
		http.onreadystatechange = function () {
			if (http.readyState == 4) {
				if (http.status == 200) {
					var result = "";
					if (http.responseText) {
						result = http.responseText
					}
					if (format.charAt(0) == "j") {
						result = result.replace(/[\n\r]/g, "");
						result = eval("(" + result + ")")
					}
					if (callback) {
						callback(result)
					}
				} else {
					if (error) {
						error(http.status)
					}
				}
			}
		};
		http.send(null)
	}, init: function () {
		return this.getHTTPObject()
	}
}

/* impoted from index.js */
var html_cache = {};
var js_cache = {};
var adv_mode = false;

function adv_apply()	{
	var inputs = document.getElementsByClassName('adv_disable');
	var elems = document.getElementsByClassName('adv_hide');

	for (var i = 0; i < inputs.length; i++)
		inputs[i].disabled = adv_mode ? "" : "disabled";
	for (var i = 0; i < elems.length; i++)
		elems[i].style.display = adv_mode ? "block" : "none";
}

function adv_toggle(e)	{
	adv_mode = !adv_mode;
	e.innerHTML = adv_mode ? "Erweitert: An" : "Erweitert: Aus";
	adv_apply();
}

function nav_onclick()	{
	setText('msg', "");
	var url = this.getAttribute("href");
	if (url == '#') return false;

	var id = url.substring(0, url.lastIndexOf('.'));

	var process_html = function (data) {
		var b = $("body");
		removeChilds(b);
		var pattern = /<body[^>]*>((.|[\n\r])*)<\/body>/im;
		b.innerHTML = pattern.exec(data)[1];
		html_cache[id] = data;
	};

	var process_js = function (data) {
		(window.execScript || function (data) {
			window["eval"].call(window, data);
			window["eval"].call(window, "init();");
		})(data);
		js_cache[id] = data;
	};

	//load html file
	if (id in html_cache) {
		process_html(html_cache[id]);
	} else {
		jx.load(url, process_html, 'text');
	}

	//load javascript file
	if (id in js_cache) {
		process_js(js_cache[id]);
	} else {
		jx.load(url.replace(".html", ".js"), process_js, 'text');
	}

	onDesc($("globalnav"), 'UL', function (n) {
		hide(n);
	});
	onParents(this, 'UL', function (n) {
		show(n);
	});
	onChilds(this.parentNode, 'UL', function (n) {
		show(n);
	});

	onDesc($("globalnav"), 'A', function (n) {
		removeClass(n, "here");
	});
	onParents(this, 'LI', function (n) {
		addClass(n.firstChild, "here");
	});

	return false;
}

function preselect() {
	onDesc($("globalnav"), 'UL', function (n) {
		hide(n);
	});
	onDesc($("globalnav"), 'A', function (n) {
		if (n.getAttribute("href") != '#')
			n.onclick = nav_onclick;
	});
	// Select the first tab.
	$("first").onclick();
}

function reboot() {
	if (!confirm("Neustart durchf\xFChren?")) return;
	send("/cgi-bin/misc", {func: "reboot"}, function (data) {
		setText('msg', data);
	});
}

function setTitle() {
	send("/cgi-bin/misc", {func: "name"}, function (name) {
		if (name.length) {
			$("title").textContent += " - " + name;
		}
	});
}

function logout() {
	window.location = "https://none@" + window.location.host;
}

/* imported from home.js */

function formatSize(bytes) {
	if (typeof bytes === "undefined" || bytes == "") {
		return "-";
	} else if (bytes < 1000) {
		return bytes + "  B";
	} else if (bytes < 1000 * 1000) {
		return (bytes / 1000.0).toFixed(0) + " K";
	} else if (bytes < 1000 * 1000 * 1000) {
		return (bytes / 1000.0 / 1000.0).toFixed(1) + " M";
	} else {
		return (bytes / 1000.0 / 1000.0 / 1000.0).toFixed(2) + " G";
	}
}

function formatSpeed(bytes) {
	var fmt = formatSize(bytes);
	return (fmt == "-") ? "-" : (fmt + "/s");
}

function init() {
	send("/cgi-bin/home", {}, function (data) {
		var obj = fromUCI(data).misc.data;
		for (var key in obj) {
			var value = obj[key];

			if (key == 'stype') {
				continue;
			}

			// for data volume
			if (key.endsWith("_data")) {
				value = formatSize(value);
			}

			// for transfer speed
			if (key.endsWith("_speed")) {
				value = formatSpeed(value);
			}

			//for addresses
			if (typeof (value) == 'object') {
				value = "<ul><li>" + value.join("</li><li>") + "</li></ul>"
			}

			setText(key, value);
		}
	});

	addHelpText($("system"), "Eine \xdcbersicht \xfcber den Router.");
	addHelpText($("freifunk"), "Das \xf6ffentliche Freifunknetz..");
	addHelpText($("lan"), "Das private Netz bzw. LAN.");
	addHelpText($("wan"), "Das Netz \xfcber dass das Internet erreicht wird.");
	addHelpText($("software"), "Einige installierte Softwareversionen.");
	addHelpText($("freifunk_user_count"), "Die Anzahl der Nutzer an diesem Router in den letzten zwei Stunden.");
	addHelpText($("lan_user_count"), "Die Anzahl der Nutzer an diesem Router in den letzten zwei Stunden.");
	addHelpText($("vpn_server"), "Der VPN-Server im Internet, mit dem der Knoten verbunden ist.");
}

/* imported from settings.js */
/*
All required uci packages are stored variable uci.
The GUI code displayes and manipulated this variable.
*/
var uci = {};
var gid = 0;


function init() {
	send("/cgi-bin/settings", {
		func: "get_settings"
	}, function (data) {
		uci = fromUCI(data);
		rebuild_general();
		adv_apply();
	});
}

function updateFrom(src) {
	var obj = {};
	collect_inputs(src, obj);
	for (var name in obj) {
		var value = obj[name];
		var path = name.split('#');

		var pkg = path[0];
		var sec = path[1];
		var opt = path[2];

		uci[pkg].pchanged = true;
		uci[pkg][sec][opt] = value
	}
}

function getChangeModeAction(ifname) {
	return function (e) {
		var src = (e.target || e.srcElement);
		var mode = (src.data || src.value);
		delNetSection(ifname);
		addNetSection(ifname, mode);
	};
}

function appendSetting(p, path, value, mode) {
	var id = path.join('#');
	var b;
	var cfg = path[0]
	var name = path[path.length - 1];
	switch (name) {
		case "latitude":
			b = append_input(p, "Breitengrad", id, value);
			b.lastChild.placeholder = "52.xxx";
			addInputCheck(b.lastChild, /^$|^[1-9]\d{0,2}\.\d{1,8}$/, "Ung\xfcltige Eingabe. Bitte nur maximal 8 Nachkommastellen, keine Kommas und f\xfchrende Nullen verwenden.");
			addHelpText(b, "Der Breitengrad (als Dezimalzahl) dieses Knotens auf der Freifunk-Karte.");
			break;
		case "longitude":
			b = append_input(p, "L\xe4ngengrad", id, value);
			b.lastChild.placeholder = "8.xxx";
			addInputCheck(b.lastChild, /^$|^[1-9]\d{0,2}\.\d{1,8}$/, "Ung\xfcltige Eingabe. Bitte nur maximal 8 Nachkommastellen, keine Kommas und f\xfchrende Nullen verwenden.");
			addHelpText(b, "Der L\xe4ngengrad (als Dezimalzahl) dieses Knotens auf der Freifunk-Karte.");
			break;
		case "name":
			b = append_input(p, "Knotenname", id, value);
			b.lastChild.placeholder = "MeinFreifunkRouter";
			addInputCheck(b.lastChild, /^$|^[\-\^'\w\.\:\[\]\(\)\/ &@\+\u0080-\u00FF]{0,32}$/, "Ung\xfcltige Eingabe.");
			addHelpText(b, "Der Name dieses Knotens auf der Freifunk-Karte.");
			break;
		case "contact":
			b = append_input(p, "Kontaktdaten", id, value);
			b.lastChild.placeholder = "kontakt@example.com";
			addInputCheck(b.lastChild, /^$|^[\-\^'\w\.\:\[\]\(\)\/ &@\+\u0080-\u00FF]{0,50}$/, "Ung\xfcltige Eingabe.");
			addHelpText(b, "Kontaktdaten f\xfcr die \xf6ffentliche Freifunk-Karte und Statusseite. Falls ihr euch von anderen Leuten kontaktieren lassen wollt (z.B. \"info@example.com\").");
			break;
		case "community_url":
			b = append_input(p, "Community-Webseite", id, value);
			b.lastChild.placeholder = "http://muster.de";
			addClass(b, "adv_hide");
			addInputCheck(b.lastChild, /^$|^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/, "Ung\xfcltige URL.");
			addHelpText(b, "Webseite der Community, zu der dieser Knoten geh\xf6rt.");
			break;
		case "enabled":
			if (cfg == "autoupdater") {
				b = append_radio(p, "Autoupdater", id, value, [
					["An", "1"],
					["Aus", "0"]
				]);
				addHelpText(b, "Der Auto-Updater aktualisiert die Firmware automatisch auf die neuste Version. Dabei bleibt die Konfiguration, die \xfcber die Weboberfl\xe4che gemacht wurde, erhalten. Spezifische Anpassungen \xfcber SSH k\xf9nnten eventuell \xfcberschrieben werden!");
			}
			if (cfg == "simple-tc") {
				b = append_radio(p, "Bandbreitenkontrolle", id, value, [
					["An", "1"],
					["Aus", "0"]
				]);
				addHelpText(b, "Bandbreitenkontrolle f\xfcr den Upload-/Download \xfcber das Freifunknetz \xfcber den eigenen Internetanschluss.");
			}
			if (cfg == "fastd") {
				b = append_radio(p, "Fastd VPN", id, value, [
					["An", "1"],
					["Aus", "0"]
				]);
				addHelpText(b, "Eine VPN-Verbindung zum Server \xfcber deinen Internetanschluss (WAN-Anschluss im Freifunk Router) aufbauen (per FastD).");
				addClass(b, "adv_hide");
			}
			break;
		case "ipv6_only":
			b = append_radio(p, "IP Protokoll VPN", id, value, [
				["Dual Stack", "both"],
				["IPv6", "ipv6"],
				["IPv4 (legacy)", "legacy"]
			]);
			addHelpText(b, "Welche Version des IP-Protokolls soll f\xfcr den Verbindungsaufbau zum Gateway verwendet werden? (Dual Stack (empfohlen): Alle verfügbaren, IPv6: Nur IPv6 verwenden, IPv4: Nur IPv4 verwenden!)");
			addClass(b, "adv_hide");
			break;
		case "publish_map":
			b = append_radio(p, "Zur Karte beitragen", id, value, [
				["Nichts", "none"],
				["Wenig", "basic"],
				["Mehr", "more"],
				["Alles", "all"]
			]);
			addHelpText(b, "Mit wievielen Daten soll dieser Knoten zur Knotenkarte beitragen? (Wenig: Name/Version/Modell/Position/Kontakt, Mehr: +Uptime/+CPU-Auslastung, Alles: +Speicherauslastung/+IP-Adressen des Routers im Freifunk-Netz)");
			break;
		case "limit_egress":
			b = append_input(p, "Freifunk Upload", id, value);
			addInputCheck(b.lastChild, /^\d+$/, "Upload ist ung\xfcltig.");
			addHelpText(b, "Maximaler Upload in KBit/s f\xfcr die Bandbreitenkontrolle.");
			break;
		case "limit_ingress":
			b = append_input(p, "Freifunk Download", id, value);
			addInputCheck(b.lastChild, /^\d+$/, "Download ist ung\xfcltig.");
			addHelpText(b, "Maximaler Download in KBit/s f\xfcr die Bandbreitenkontrolle.");
			break;
		case "allow_access_from":
			b = append_check(p, "SSH/HTTPS Zugriff", id, split(value), [
				["WAN", "wan"],
				["LAN", "lan"],
				["Freifunk", "freifunk"]
			]);
			addHelpText(b, "Zugang zur Konfiguration \xfcber verschiedene Anschl\xfcsse/Netzwerke erm\xf6glichen.")
			break;
		case "service_link":
			var ula_prefix = uci['network']['globals']['ula_prefix'];
			var addr_prefix = ula_prefix.replace(/:\/[0-9]+$/, ""); //cut off ':/64'
			var regexp = new RegExp("^$|((?=.*" + addr_prefix + "|.*\.ff[a-z]{0,3})(?=^.{0,128}$))");

			b = append_input(p, "Service Link", id, value);
			b.lastChild.placeholder = "http://[" + addr_prefix + ":1]/index.html";
			addInputCheck(b.lastChild, regexp, "Ung\xfcltige Eingabe.");
			addHelpText(b, "Ein Verweis auf eine _interne_ Netzwerkresource. Z.B. \"http://[" + addr_prefix + ":1]/index.html\".");
			break;
		case "service_label":
			b = append_input(p, "Service Name", id, value);
			b.lastChild.placeholder = "MeineWebseite";
			addInputCheck(b.lastChild, /^$|^[\[\]\(\) \w&\/.:\u0080-\u00FF]{0,32}$/, "Ung\xfcltige Eingabe.");
			addHelpText(b, "Ein Name der angegebenen Netzwerkresource. Z.B. \"Meine Webseite\".");
			break;
		case "service_display_max":
			b = append_input(p, "Max.-Eintr\xe4ge", id, value);
			addInputCheck(b.lastChild, /^\d+$/, "Ung\xfcltige Zahl.");
			addHelpText(b, "Maximale Anzahl der auf der eigenen Statusseite angezeigten Eintr\xe4ge.");
			break;
		case "community":
			b = append_input(p, "Community", id, value);
			addClass(b, "adv_hide");
			addInputCheck(b.lastChild, /^[a-z0-9_\-]{3,30}$/, "Ung\xfcltiger Bezeichner.");
			addHelpText(b, "Der Bezeichner der Community, zu der dieser Knoten geh\xf6rt.");
			break;
		default:
			return;
	}

	b.id = id; //needed for updateFrom
	b.onchange = function () {
		updateFrom(b);
	};

	return b;
}

function rebuild_general() {
	var gfs = $("general");
	var rfs = $("resource");
	var tfs = $("traffic");

	removeChilds(gfs);
	removeChilds(rfs);
	removeChilds(tfs);

	if ('freifunk' in uci) {
		var f = uci.freifunk;
		var i = firstSectionID(f, "settings");
		appendSetting(gfs, ['freifunk', i, "name"], f[i]["name"]);
		appendSetting(gfs, ['freifunk', i, "latitude"], f[i]["latitude"]);
		appendSetting(gfs, ['freifunk', i, "longitude"], f[i]["longitude"]);
		appendSetting(gfs, ['freifunk', i, "contact"], f[i]["contact"]);
		appendSetting(rfs, ['freifunk', i, "community_url"], f[i]["community_url"]);
		appendSetting(rfs, ['freifunk', i, "community"], f[i]["community"]);
		appendSetting(gfs, ['freifunk', i, "ipv6_only"], f[i]["ipv6_only"]);
		appendSetting(gfs, ['freifunk', i, "publish_map"], f[i]["publish_map"]);
		appendSetting(gfs, ['freifunk', i, "allow_access_from"], f[i]["allow_access_from"]);
		appendSetting(rfs, ['freifunk', i, "service_label"], f[i]["service_label"]);
		appendSetting(rfs, ['freifunk', i, "service_link"], f[i]["service_link"]);
		appendSetting(rfs, ['freifunk', i, "service_display_max"], f[i]["service_display_max"]);
	}

	if ('autoupdater' in uci) {
		var a = uci.autoupdater;
		var i = firstSectionID(a, "autoupdater");
		appendSetting(gfs, ['autoupdater', i, "enabled"], a[i]["enabled"]);
	}

	if ('simple-tc' in uci) {
		var t = uci['simple-tc'];
		var i = firstSectionID(t, "interface");
		appendSetting(tfs, ['simple-tc', i, "enabled"], t[i]["enabled"]);
		appendSetting(tfs, ['simple-tc', i, "limit_ingress"], t[i]["limit_ingress"]);
		appendSetting(tfs, ['simple-tc', i, "limit_egress"], t[i]["limit_egress"]);
	}

	if ('fastd' in uci) {
		var a = uci.fastd;
		var i = firstSectionID(a, "fastd");
		appendSetting(gfs, ['fastd', i, "enabled"], a[i]["enabled"]);
	}
}

function save_data() {
	for (var name in uci) {
		var obj = uci[name];
		if (!obj.pchanged)
			continue;
		var data = toUCI(obj);
		send("/cgi-bin/misc", {
				func: "set_config_file",
				name: name,
				data: data
			},
			function (data) {
				$('msg').innerHTML = data;
				$('msg').focus();
				init();
			}
		);
	}
}

/* imported from wifiscan.js */

function fetch(regex, data) {
	var result = data.match(regex);
	return result ? result[1] : "";
}

function append_td(tr, value) {
	append(tr, 'td').innerHTML = value ? value : "?";
}

function signalToQuality(signal) {
	var dBm = parseFloat(signal);
	if (dBm <= -100) {
		return 0;
	} else if (dBm >= -50) {
		return 100;
	} else {
		return (2 * (dBm + 100));
	}
}

function wifi_scan() {
	var s = $('wifiscan_selection');
	var device = s.options[s.selectedIndex].value;

	send("/cgi-bin/misc", {
		func: 'wifiscan',
		device: device
	}, function (data) {
		var tbody = $("wifiscan_tbody");
		removeChilds(tbody);

		data = data.replace(/BSS /g, "|BSS ");
		var items = data.split("|").filter(Boolean);
		for (var i = 0; i < items.length; ++i) {
			var item = items[i];
			var ssid = fetch(/SSID: (.*)\n/, item);
			var bss = fetch(/BSS (..:..:..:..:..:..).*\n/, item);
			var channel = fetch(/channel: (.*)\n/, item);
			var signal = fetch(/signal: (.*)\n/, item);
			var capability = fetch(/capability: (.*)\n/, item);
			var mesh_id = fetch(/MESH ID: (.*)\n/, item);

			var tr = append(tbody, 'tr');
			append_td(tr, mesh_id ? mesh_id : ssid);
			append_td(tr, bss);
			append_td(tr, channel);
			append_td(tr, signal + " (" + signalToQuality(signal) + "%)");

			//determine the wifi mode
			if (mesh_id) {
				append_td(tr, "  802.11s");
			} else if (/IBSS/.test(capability)) {
				append_td(tr, "  AdHoc");
			} else if (/ESS/.test(capability)) {
				append_td(tr, "  AccessPoint");
			} else {
				append_td(tr, "  ???");
			}
		}

		var table = $('wifiscan_table');
		show(table);
	});
}

function add_list_entry(device, ifname) {
	var list = $('wifiscan_selection');
	var o = append(list, 'option');
	o.style.paddingRight = "1em";
	o.innerHTML = device;
	o.value = ifname;
}

/*
 * Create a selection of wireless devices
 */
function init() {
	send("/cgi-bin/misc", {
		func: 'wifi_status'
	}, function (data) {
		var data = JSON.parse(data);
		for (var device in data) {
			var interfaces = data[device].interfaces;
			if (interfaces.length == 0) {
				continue;
			}
			for (var interface in interfaces) {
				var ifname = interfaces[interface].ifname;
				if (typeof (ifname) == 'string') {
					add_list_entry(device, ifname);
				}
			}
		}
	});
}
