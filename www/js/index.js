let app_language;
let loc_categories = [];
let loc_counter = [];
let selected_category_count = 0;
let selected_categories = [];
let route = JSON.parse(JSON.stringify(full_route));
let game_mode;

var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },
    onDeviceReady: function() {
		if(device.platform == 'Android'){
			StatusBar.hide();
		}
		//get global language
		if(localStorage.getItem("language") === null){
			navigator.globalization.getPreferredLanguage(
				function (language) {app_language = language.value;language_change();},
				function () {console.log('Error getting language\n');}
			);
		}else{
			app_language = localStorage.getItem("language");
			language_change();
		}
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

//make game mode selector
function make_mode_selector(){
	document.getElementById("game-mode-menu-selector").innerHTML = "";
	var drop_select = document.createElement('select');
	var opt = document.createElement('option');
	var opt2 = document.createElement('option');
	var opt3 = document.createElement('option');
	opt2.id = 'normal_selected';
	opt3.id = 'time_trial_selected';
	opt2.value = 'normal';
	opt3.value = 'time_trial';
	if(app_language == 'et'){
		opt.innerHTML = 'Vali mängurežiim:';
		opt2.innerHTML = 'Avastamine';
		opt3.innerHTML = 'Võistlus';
	} else {
		opt.innerHTML = 'Select game mode:';
		opt2.innerHTML = 'Explorer';
		opt3.innerHTML = 'Race';
	}
	drop_select.appendChild(opt);
	drop_select.appendChild(opt2);
	drop_select.appendChild(opt3);
	var div = document.createElement('div');
	div.className = "game-mode-selector";
	div.appendChild(drop_select);
	document.getElementById('game-mode-menu-selector').appendChild(div);
	build_dropdown("game-mode-selector");
}

function updateGameMode(){
	if(document.getElementsByClassName('select-items')[0].childNodes[0].className == "same-as-selected"){
		game_mode = "normal";
		if(app_language == 'et'){
			document.getElementsByClassName('game-mode-description')[0].innerHTML = "Selles režiimis saad ise valida kui kiiresti soovid raja läbida.";
		} else {
			document.getElementsByClassName('game-mode-description')[0].innerHTML = "In this game mode you can choose how fast you want to go through the course.";
		}
	} else {
		game_mode = "time_trial";
		if(app_language == 'et'){
			document.getElementsByClassName('game-mode-description')[0].innerHTML = "Selles režiimis pead raja läbima nii kiiresti kui võimalik ja kui sa ei ole piisavalt kiire, siis kaotad.";
		} else {
			document.getElementsByClassName('game-mode-description')[0].innerHTML = "In this game mode you have to complete the course as fast as possible and you'll lose if you're not fast enough.";
		}
	}
	if(game_mode){
		document.getElementsByClassName('game-mode-description')[0].style.display = 'inline-block';
		document.getElementsByClassName('mode_start')[0].style.display = "inline-block";
		document.getElementsByClassName('game-mode-description')[0].nextElementSibling.style.display = "block";
		document.getElementsByClassName('mode_start')[0].nextElementSibling.style.display = "block";
	}
}

//creates category selector
function make_cat_selector(){
	document.getElementById("category-selector").innerHTML = "";
	if(selected_category_count>0){
		document.getElementsByClassName('start_btn')[0].style.display = "inline-block";
		document.getElementsByClassName('start_btn')[0].nextElementSibling.style.display = "block";
	}else{
		document.getElementsByClassName('start_btn')[0].style.display = "none";
		document.getElementsByClassName('start_btn')[0].nextElementSibling.style.display = "none";
	}
	if(selected_categories.length>0){
		//create list of categories
		create_cat()
	} else {
		//create dropdown
		create_dropdown();
	}
	//updates values
	language_change();
}


//creates dropdown menu
function create_dropdown(){
	//creates separad array from loc_categories that is displayed in html so I can remove already selected categories
	var helper = loc_categories.slice(0);
	for(var i=0; i<selected_categories.length; i++){
		helper.splice(helper.indexOf(selected_categories[i]),1);
	}
	//creates elements for dropdown menu
	var drop_select = document.createElement('select');
	if(app_language == 'et'){
		var opt = document.createElement('option');
		opt.value = 'Vali kategooria:';
		opt.innerHTML = 'Vali kategooria:';
		drop_select.appendChild(opt);
		var start = document.createElement('option');
		start.value = 'Kõik';
		start.innerHTML = 'Kõik';
		drop_select.appendChild(start);
	} else {
		var opt = document.createElement('option');
		opt.value = 'Select category:';
		opt.innerHTML = 'Select category:';
		drop_select.appendChild(opt);
		var start = document.createElement('option');
		start.value = 'All';
		start.innerHTML = 'All';
		drop_select.appendChild(start);
	}
	for(var i=0; i<helper.length; i++){
		var opt = document.createElement('option');
		opt.value = helper[i];
		opt.innerHTML = helper[i];
		drop_select.appendChild(opt);
	}
	var div = document.createElement('div');
	div.className = "category-select";
	div.appendChild(drop_select);
	document.getElementById('category-selector').appendChild(div);
	build_dropdown("category-select");
	var add_btn = document.createElement('button')
	if(app_language == 'et'){add_btn.innerHTML = 'vali';} else {add_btn.innerHTML = 'add';}
	add_btn.setAttribute("onclick", "create_cat(true)");
	add_btn.className = 'add_btn';
	document.getElementById('category-selector').appendChild(add_btn);
}

//creates list of chosen categories
function create_cat(clicked){
	//has user clicked on vali/add button or not, if he has clicked it and it has selected a category, push it to selected categories
	if(clicked){
		if(document.getElementsByClassName('same-as-selected')[1]){
			var selected = document.getElementsByClassName('same-as-selected')[1].innerHTML;
			selected_categories.push(selected);
		} else {
			return;
		}
	}
	document.getElementById("category-selector").innerHTML = "";
	//if all categories are selected
	if(selected == 'Kõik' || selected == 'All' || selected_category_count == 41){
		var div = document.createElement('div');
		div.className = ('cat_list_wrap');
		var text_a = document.createElement('a');
		text_a.className = 'selected_text';
		var remove_a = document.createElement('a');
		remove_a.className = 'cat_selector_remove';
		if(app_language == 'et'){remove_a.innerHTML = "eemalda";text_a.innerHTML = "Kõik";} else {remove_a.innerHTML = "remove";text_a.innerHTML = "All";}
		selected_category_count = route.length;
		remove_a.setAttribute('onclick', 'selected_categories = [];selected_category_count=0;document.getElementById("category-selector").innerHTML = "";make_cat_selector();');
		div.appendChild(text_a);
		div.appendChild(remove_a);
		document.getElementById('category-selector').appendChild(div);
	} else {
		selected_category_count=0;
		for(var i=0; i<selected_categories.length; i++){
			var div = document.createElement('div');
			div.className = ('cat_list_wrap');
			var text_a = document.createElement('a');
			text_a.innerHTML = selected_categories[i];
			text_a.className = 'selected_text';
			var remove_a = document.createElement('a');
			remove_a.className = 'cat_selector_remove';
			if(app_language == 'et'){remove_a.innerHTML = "eemalda";} else {remove_a.innerHTML = "remove";}
			selected_category_count += loc_counter[loc_categories.indexOf(selected_categories[i])]
			remove_a.setAttribute('onclick', 'selected_categories.splice(selected_categories.indexOf(event.target.previousElementSibling.innerHTML),1);selected_category_count-=loc_counter[loc_categories.indexOf(event.target.previousElementSibling.innerHTML)];make_cat_selector();');
			div.appendChild(text_a);
			div.appendChild(remove_a);
			document.getElementById('category-selector').appendChild(div);
			document.getElementById('category-selector').appendChild(document.createElement('br'));
		}
		create_dropdown();
		if(selected_category_count == 41){selected_categories = ["all"];make_cat_selector();}
	}
	language_change();
	//if user has selected any categories, show start button
	if(selected_category_count>0){
		document.getElementsByClassName('start_btn')[0].style.display = "inline-block";
		document.getElementsByClassName('start_btn')[0].nextElementSibling.style.display = "block";
	}else{
		document.getElementsByClassName('start_btn')[0].style.display = "none";
		document.getElementsByClassName('start_btn')[0].nextElementSibling.style.display = "none";
	}
}


//get all location categories from routes
function get_loc_category(){
	loc_categories = [];
	loc_counter = [];
	for(var r=0; r<route.length; r++){
		if(app_language == 'et'){
			if(loc_categories.indexOf(route[r].category_loc.et) === -1){
				loc_categories.push(route[r].category_loc.et);
				loc_counter.push(1);
			} else {
				loc_counter[loc_categories.indexOf(route[r].category_loc.et)] += 1;
			}
		} else {
			if(loc_categories.indexOf(route[r].category_loc.en) === -1){
				loc_categories.push(route[r].category_loc.en);
				loc_counter.push(1);
			} else {
				loc_counter[loc_categories.indexOf(route[r].category_loc.en)] += 1;
			}
		}
	}
}

//activate if langauge changes to change innerHTML for langauge chosen
function language_change(){
	if(app_language == 'et'){
		localStorage.setItem("language","et");
		document.getElementsByClassName('title')[0].innerHTML="TALLINNA TORNID";
		document.getElementsByClassName('play_btn')[0].innerHTML="MÄNGI";
		document.getElementsByClassName('settings_btn')[0].innerHTML="SEADED";
		document.getElementsByClassName('language_btn')[0].innerHTML="KEEL";
		document.getElementsByClassName('new_game')[0].innerHTML="UUS MÄNG";
		document.getElementsByClassName('continue')[0].innerHTML="JÄTKA";
		for(el in document.getElementsByClassName('back_btn')){
			document.getElementsByClassName('back_btn')[el].innerHTML="TAGASI";
		}
		document.getElementsByClassName('selected-count')[0].innerHTML = "Valitud punktide arv: "+selected_category_count;
		document.getElementsByClassName('start_btn')[0].innerHTML = "ALUSTA";
		document.getElementsByClassName('mode_start')[0].innerHTML = "VALI";
	} else {
		localStorage.setItem("language","en");
		document.getElementsByClassName('title')[0].innerHTML="TALLINN TOWERS";
		document.getElementsByClassName('play_btn')[0].innerHTML="PLAY";
		document.getElementsByClassName('settings_btn')[0].innerHTML="SETTINGS";
		document.getElementsByClassName('language_btn')[0].innerHTML="LANGUAGE";
		document.getElementsByClassName('new_game')[0].innerHTML="NEW GAME";
		document.getElementsByClassName('continue')[0].innerHTML="CONTINUE";
		for(el in document.getElementsByClassName('back_btn')){
			document.getElementsByClassName('back_btn')[el].innerHTML="BACK";
		}
		document.getElementsByClassName('selected-count')[0].innerHTML = "Nr of locations selected: "+selected_category_count;
		document.getElementsByClassName('start_btn')[0].innerHTML = "START";
		document.getElementsByClassName('mode_start')[0].innerHTML = "CHOOSE";
	}
	//get all location categories
	get_loc_category();
}
//start game, checks if gps is enabled and if not, doesen't start game
function start_game(route){
	console.log(game_mode);
	console.log(selected_categories);
	cordova.plugins.diagnostic.isLocationEnabled(function(enabled){
		if(enabled){
			if(route !== undefined){
				localStorage.removeItem("answers");
				localStorage.removeItem("deadline");
				localStorage.removeItem("incorrectAnswers");
				localStorage.removeItem("correctAnswers");
				localStorage.setItem("route",selected_categories);
				localStorage.setItem("route_length",selected_category_count);
			}
			if(game_mode !== undefined){
				localStorage.setItem("game_mode",game_mode);
			}
			if(device.platform === 'Android') {
				location.href='file:///android_asset/www/game.html';
			} else {
				window.open("game.html", '_self');
			}
		} else {
			navigator.notification.alert("Please turn on your GPS", null, "Alert", "OK");
		}
	}, function(error){
		console.log(error);
	});
}


//menu selector, hide and show correct elements

function mode_menu(){
	document.getElementById('game-mode-menu-selector').addEventListener("click", function(){updateGameMode();});
	make_mode_selector();
	document.getElementById("game-mode-menu").style.display='block';
	document.getElementById("game-menu").style.display='none';
}
function new_game(){
	make_cat_selector();
	document.getElementById("select-game").style.display='block';
	document.getElementById("game-mode-menu").style.display='none';
}
function game(){
	document.getElementById("main-menu").style.display='none';
	document.getElementById("game-menu").style.display='block';
	if(!localStorage.getItem("answers") && !localStorage.getItem("deadline")){
		document.getElementsByClassName('continue')[0].nextElementSibling.style.display = "none";
		document.getElementsByClassName('continue')[0].style.display = "none";
	}
}
function back_game(){
	document.getElementById("main-menu").style.display='block';
	document.getElementById("game-menu").style.display='none';
}
function settings(){
	document.getElementById("main-menu").style.display='none';
	document.getElementById("main-settings").style.display='block';
}
function back_settings(){
	document.getElementById("main-menu").style.display='block';
	document.getElementById("main-settings").style.display='none';
}
function language(){
	document.getElementById("main-settings").style.display='none';
	document.getElementById("language-setting").style.display='block';
}
function language_select(language){
	app_language = language;
	language_change();
	document.getElementById("main-settings").style.display='block';
	document.getElementById("language-setting").style.display='none';
}
function back_language(){
	document.getElementById("main-settings").style.display='block';
	document.getElementById("language-setting").style.display='none';
}
function back_select(){
	game_mode = undefined;
	make_mode_selector();
	document.getElementsByClassName('game-mode-description')[0].nextElementSibling.style.display = "none";
	document.getElementsByClassName('game-mode-description')[0].style.display='none';
	document.getElementsByClassName('mode_start')[0].nextElementSibling.style.display = "none";
	document.getElementsByClassName('mode_start')[0].style.display='none';
	document.getElementById("select-game").style.display='none';
	document.getElementById("game-mode-menu").style.display='block';
}
function back_mode(){
	document.getElementsByClassName('game-mode-description')[0].nextElementSibling.style.display = "none";
	document.getElementsByClassName('game-mode-description')[0].style.display='none';
	document.getElementsByClassName('mode_start')[0].nextElementSibling.style.display = "none";
	document.getElementsByClassName('mode_start')[0].style.display='none';
	document.getElementById("select-game").style.display='none';
	document.getElementById("game-menu").style.display='block';
	document.getElementById("game-mode-menu").style.display='none';
}

//build dropdown, from w3schools https://www.w3schools.com/howto/howto_custom_select.asp
function build_dropdown(className){
	var x, i, j, selElmnt, a, b, c;
/* Look for any elements with the class: */
x = document.getElementsByClassName(className);
for (i = 0; i < x.length; i++) {
  selElmnt = x[i].getElementsByTagName("select")[0];
  /* For each element, create a new DIV that will act as the selected item: */
  a = document.createElement("DIV");
  a.setAttribute("class", "select-selected");
  a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
  x[i].appendChild(a);
  /* For each element, create a new DIV that will contain the option list: */
  b = document.createElement("DIV");
  b.setAttribute("class", "select-items select-hide");
  for (j = 1; j < selElmnt.length; j++) {
    /* For each option in the original select element,
    create a new DIV that will act as an option item: */
    c = document.createElement("DIV");
    c.innerHTML = selElmnt.options[j].innerHTML;
    c.addEventListener("click", function(e) {
        /* When an item is clicked, update the original select box,
        and the selected item: */
        var y, i, k, s, h;
        s = this.parentNode.parentNode.getElementsByTagName("select")[0];
        h = this.parentNode.previousSibling;
        for (i = 0; i < s.length; i++) {
          if (s.options[i].innerHTML == this.innerHTML) {
            s.selectedIndex = i;
            h.innerHTML = this.innerHTML;
            y = this.parentNode.getElementsByClassName("same-as-selected");
            for (k = 0; k < y.length; k++) {
              y[k].removeAttribute("class");
            }
            this.setAttribute("class", "same-as-selected");
            break;
          }
        }
        h.click();
    });
    b.appendChild(c);
  }
  x[i].appendChild(b);
  a.addEventListener("click", function(e) {
    /* When the select box is clicked, close any other select boxes,
    and open/close the current select box: */
    e.stopPropagation();
    closeAllSelect(this);
    this.nextSibling.classList.toggle("select-hide");
    this.classList.toggle("select-arrow-active");
  });
}

function closeAllSelect(elmnt) {
  /* A function that will close all select boxes in the document,
  except the current select box: */
  var x, y, i, arrNo = [];
  x = document.getElementsByClassName("select-items");
  y = document.getElementsByClassName("select-selected");
  for (i = 0; i < y.length; i++) {
    if (elmnt == y[i]) {
      arrNo.push(i)
    } else {
      y[i].classList.remove("select-arrow-active");
    }
  }
  for (i = 0; i < x.length; i++) {
    if (arrNo.indexOf(i)) {
      x[i].classList.add("select-hide");
    }
  }
}

/* If the user clicks anywhere outside the select box,
then close all select boxes: */
document.addEventListener("click", closeAllSelect);
}

//start app
app.initialize();