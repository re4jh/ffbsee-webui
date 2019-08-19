/* bof: shared-stuff */
function $(id) {
	return document.getElementById(id);
}

function show(e) {
	e.style.display = 'block';
}

function hide(e) {
	e.style.display = 'none';
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

function reboot() {
	if (!confirm("Neustart durchf\xFChren?")) return;
	send("/cgi-bin/misc", {
		func: "reboot"
	}, function(data) {
		setText('msg', data);
	});
}

function setTitle() {
	send("/cgi-bin/misc", {
		func: "name"
	}, function(name) {
		if (name.length) {
			$("title").textContent += " - " + name;
		}
	});
}

function logout() {
	window.location = "https://none@" + window.location.host;
}

/* eof: shared-stuff */
/* bof: home-stuff */
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

function init_home() {
	send("/cgi-bin/home", {}, function(data) {
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
			if (typeof(value) == 'object') {
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
/* eof: home-stuff */

/* bof: general-stuff*/
function section_toggle(section_selector) {
	$('main section').hide();
	$('section#' + section_selector).show();

	switch (section_selector) {
		case 'home':
			init_home();
			break;
		case 'settings':
			break;
		case 'network':
			break;
		case 'wifiscan':
			break;
		case 'upgrade':
			break;
		case 'password':
			break;
	}

}

/* eof: general-stuff*/
