
var html_cache = {};
var js_cache = {};
var adv_mode = false;

function adv_apply()
{
	var inputs = document.getElementsByClassName('adv_disable');
	var elems = document.getElementsByClassName('adv_hide');

	for(var i=0;  i < inputs.length; i++)
		inputs[i].disabled = adv_mode ? "": "disabled";
	for(var i=0;  i < elems.length; i++)
		elems[i].style.display = adv_mode ? "block" : "none";
}

function adv_toggle(e)
{
	adv_mode = !adv_mode;
	e.innerHTML = adv_mode ? "Erweitert: An" : "Erweitert: Aus";
	adv_apply();
}

function nav_onclick() 
{
	setText('msg', "");
	var url = this.getAttribute("href");
	if(url == '#') return false;

	var id = url.substring(0, url.lastIndexOf('.'));

	var process_html = function(data) {
		var b = $("body");
		removeChilds(b);
		var pattern = /<body[^>]*>((.|[\n\r])*)<\/body>/im;
		b.innerHTML = pattern.exec(data)[1];
		html_cache[id] = data;
	};

	var process_js = function(data) {
		(window.execScript || function(data) {
			window["eval"].call(window, data);
			window["eval"].call(window, "init();");
		})(data);
		js_cache[id] = data;
	};

	//load html file
	if(id in html_cache) {
		process_html(html_cache[id]);
	} else {
		jx.load(url, process_html, 'text');
	}

	//load javascript file
	if(id in js_cache) {
		process_js(js_cache[id]);
	} else {
		jx.load(url.replace(".html", ".js"), process_js, 'text');
	}

	onDesc($("globalnav"), 'UL', function(n) { hide(n); });
	onParents(this, 'UL', function(n) { show(n); });
	onChilds(this.parentNode, 'UL', function(n) { show(n); });

	onDesc($("globalnav"), 'A', function(n) { removeClass(n, "here"); });
	onParents(this, 'LI', function(n) { addClass(n.firstChild, "here"); });

	return false;
}

function preselect() {
	onDesc($("globalnav"), 'UL', function(n) { hide(n); });
	onDesc($("globalnav"), 'A', function(n) {
		if(n.getAttribute("href") != '#')
			n.onclick = nav_onclick;
	});
	// Select the first tab.
	$("first").onclick();
}

function reboot() {
	if(!confirm("Neustart durchf\xFChren?")) return;
	send("/cgi-bin/misc", { func : "reboot" }, function(data) {
		setText('msg', data);
	});
}

function setTitle() {
	send("/cgi-bin/misc", { func : "name" }, function(name) {
		if(name.length) {
			$("title").textContent += " - " + name;
		}
	});
}

function logout() {
	window.location="https://none@" + window.location.host;
}

