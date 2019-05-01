//variables
let app_language = localStorage.getItem("language"); //language user selected
let selected_route = localStorage.getItem("route").split(','); //categories user selected
let route = JSON.parse(JSON.stringify(full_route)); //full route
let game_mode = localStorage.getItem("game_mode"); //game mode selected
let nrOfQuestions = parseInt(localStorage.getItem("route_length"));
let correctAnswers = 0;
let incorrectAnswers = 0;
//when cordova is loaded and device is ready
'cordova' in window ? document.addEventListener('deviceready', init, false) : init()
function init () {
	//read nr of correct and incorrect answers if available
	if(localStorage.getItem("correctAnswers")){correctAnswers = parseInt(localStorage.getItem("correctAnswers"));}
	if(localStorage.getItem("incorrectAnswers")){incorrectAnswers = parseInt(localStorage.getItem("incorrectAnswers"));}
	//end game if it's over
	if(game_mode == "time_trial" && Date.parse(localStorage.getItem('deadline')) - Date.parse(new Date()) <= 0){
		document.getElementById('loading').style.display = "none";
		end_game();
	} else if(correctAnswers+incorrectAnswers == nrOfQuestions){
		document.getElementById('loading').style.display = "none";
		end_game();
	} else {
		//loading screen
		if(app_language == "et"){
			document.getElementById('loading_text').innerHTML = "LAADIMINE";
		}else{
			document.getElementById('loading_text').innerHTML = "LOADING";
		}
		//create map
		var map = new mapboxgl.OfflineMap({
			container: 'map',
			style: 'css/osm-bright/style-offline.json',
			center: [24.741489, 59.4370274],
			zoom: 15,
			attributionControl: false
		}).then(function(map){
			//user tracking
			map.addControl(geolocate, "bottom-right");
			//custom
			map.addControl(myCustomControlInfo, "bottom-left");
			map.addControl(myCustomControlEnd, "top-left");
			if(game_mode == "time_trial"){
				map.addControl(myCustomControlTime, "top-right");
			}
			//add markers
			for(var r=0; r<route.length; r++){
				if(selected_route[0]=="All" || selected_route[0]=="Kõik"){
					var el = document.createElement('div');
					el.className = "marker";
					el.id = "question"+r;
					var marker = new mapboxgl.Marker(el).setLngLat(route[r].latlng).addTo(map);
					document.getElementById("question"+r).addEventListener("click", createPopUp, false);
				} else {
					for(var i=0; i<selected_route.length; i++){
						if(route[r].category_loc.et == selected_route[i] || route[r].category_loc.en == selected_route[i]){
							var el = document.createElement('div');
							el.className = "marker";
							el.id = "question"+r;
							var marker = new mapboxgl.Marker(el).setLngLat(route[r].latlng).addTo(map);
							document.getElementById("question"+r).addEventListener("click", createPopUp, false);
						}
					}
				}
			}
			update();
			//if game is continued update markers
			if(localStorage.getItem("answers") !== null){update_markers();}
			//if map is loaded, activate user tracking
			CheckIfLoaded(map);
		});
	}
}

//create new element when user clicks on a marker
function createPopUp(event){
	//get markers coords and users coords and calculate distance between them and if it more than 20m, notify player to get closer, else it shows picture, info, question and answers about that location
	latlng = [geolocate._lastKnownPosition.coords.longitude, geolocate._lastKnownPosition.coords.latitude]
	var distance = calculateDistance(latlng, route[event.target.id.substring(8)].latlng).toFixed(2)*1000;
	if(distance > 20000){
		if(app_language=='et'){
			document.getElementsByClassName('title_div')[0].innerHTML = "<p>Oled punktist liiga kaugel. Oled punktist "+distance+"m kaugusel.</p>"
		} else {
			document.getElementsByClassName('title_div')[0].innerHTML = "<p>You're too far. You're "+distance+"m away.</p>"
		}
		
		var continue_btn = document.createElement('button');
		continue_btn.className = "answer_btn";
		continue_btn.id='close_btn';
		if(app_language=='et'){continue_btn.innerHTML = 'JÄTKA';}else{continue_btn.innerHTML = 'CONTINUE';}
		
		document.getElementsByClassName('answer_div')[0].appendChild(continue_btn);
		document.getElementsByClassName('questionPopup')[0].style.display = "block";
		document.getElementById('close_btn').onclick = function(){
			document.getElementById('answer_info').innerHTML = "";
			document.getElementsByClassName('answer_div')[0].innerHTML = "";
			document.getElementsByClassName('questionPopup')[0].style.display = "none";
			if(correctAnswers+incorrectAnswers == nrOfQuestions){
				if(game_mode == "time_trial"){
					localStorage.setItem("result", (Date.parse(localStorage.getItem('deadline')) - Date.parse(new Date()))/1000);
				}
				end_game();
			}
			return false;
		};
	} else {
		document.getElementsByClassName("question_img")[0].src = route[event.target.id.substring(8)].img;
		var answer1 = document.createElement('button');
		answer1.className = "answer_btn";
		answer1.id = "answer1";
		answer1.setAttribute('onclick', 'submitAnswer('+event.target.id.substring(8)+', "1")');

		var answer2 = document.createElement('button');
		answer2.className = "answer_btn";
		answer2.id = "answer2";
		answer2.setAttribute('onclick', 'submitAnswer('+event.target.id.substring(8)+', "2")');
		
		var answer3 = document.createElement('button');
		answer3.className = "answer_btn";
		answer3.id = "answer3";
		answer3.setAttribute('onclick', 'submitAnswer('+event.target.id.substring(8)+', "3")');
		
		if(app_language == 'et'){
			answer1.innerHTML = route[event.target.id.substring(8)].answers.answer_1.et;
			answer2.innerHTML = route[event.target.id.substring(8)].answers.answer_2.et;
			answer3.innerHTML = route[event.target.id.substring(8)].answers.answer_3.et;
		} else {
			answer1.innerHTML = route[event.target.id.substring(8)].answers.answer_1.en;
			answer2.innerHTML = route[event.target.id.substring(8)].answers.answer_2.en;
			answer3.innerHTML = route[event.target.id.substring(8)].answers.answer_3.en;
		}
		document.getElementsByClassName('answer_div')[0].appendChild(answer1);
		document.getElementsByClassName('answer_div')[0].appendChild(answer2);
		document.getElementsByClassName('answer_div')[0].appendChild(answer3);
		if(app_language=='et'){
			document.getElementsByClassName('title_div')[0].innerHTML = route[event.target.id.substring(8)].name.et;
			document.getElementsByClassName('text_div')[0].innerHTML = route[event.target.id.substring(8)].text.et;
			document.getElementsByClassName('question_div')[0].innerHTML = route[event.target.id.substring(8)].question.et;
		}else{
			document.getElementsByClassName('title_div')[0].innerHTML = route[event.target.id.substring(8)].name.en;
			document.getElementsByClassName('text_div')[0].innerHTML = route[event.target.id.substring(8)].text.en;
			document.getElementsByClassName('question_div')[0].innerHTML = route[event.target.id.substring(8)].question.en;
		}		

		document.getElementsByClassName('questionPopup')[0].style.display = "block";
	}
	//when user click x button in the top right corner close it and return to map and if all questions are answered when it's clicked, end game
	document.getElementById('close').onclick = function(){
		document.getElementById('answer_info').innerHTML = "";
		document.getElementsByClassName('answer_div')[0].innerHTML = "";
		document.getElementsByClassName('questionPopup')[0].style.display = "none";
		if(correctAnswers+incorrectAnswers == nrOfQuestions){
			if(game_mode == "time_trial"){
				localStorage.setItem("result", (Date.parse(localStorage.getItem('deadline')) - Date.parse(new Date()))/1000);
			}
			end_game();
		}
		return false;
	};
}

//if player answers a question show if the answer is correct or not and save it + change all necessary elements
function submitAnswer(question, answer){
	//add answer to localstorage
	if(localStorage.getItem("answers") === null){
		localStorage.setItem("answers", JSON.stringify([[question, parseInt(answer)]]));
		localStorage.setItem("times", JSON.stringify([[Date.parse(new Date())]]));
	} else {
		var local_helper = JSON.parse(localStorage.getItem("answers"));
		local_helper.push([question, parseInt(answer)]);
		localStorage.setItem("answers", JSON.stringify(local_helper));
		
		var helper = JSON.parse(localStorage.getItem('times'));
		helper.push([Date.parse(new Date())]);
		localStorage.setItem("times", JSON.stringify(helper));
	}
	//when user clicks one of the answers
	document.getElementById("question"+question).removeEventListener("click", createPopUp, false);
	document.getElementById("question"+question).classList.remove('marker');
	
	//if answer is correct or not
	if(route[question].correct_answer == answer){
		if(localStorage.getItem("correctAnswers")){
			localStorage.setItem("correctAnswers", parseInt(localStorage.getItem("correctAnswers"))+1)
		} else {
			localStorage.setItem("correctAnswers", 1)
		}
		document.getElementById("question"+question).classList.add('marker-success');
		document.getElementById("question"+question).id = "answered_correct";
		if(app_language=='et'){document.getElementById('answer_info').innerHTML = "ÕIGE VASTUS";}else{document.getElementById('answer_info').innerHTML = "CORRECT ANSWER";}
		document.getElementById('answer_info').style.color = "green";
		if(game_mode == "time_trial"){
			localStorage.setItem('deadline', new Date(Date.parse(localStorage.getItem('deadline'))+300*1000)); //if gamemode is time_trial and answer is correct, add 5 min to timer
		}
	}else{
		if(localStorage.getItem("incorrectAnswers")){
			localStorage.setItem("incorrectAnswers", parseInt(localStorage.getItem("incorrectAnswers"))+1)
		} else {
			localStorage.setItem("incorrectAnswers", 1)
		}
		document.getElementById("question"+question).classList.add('marker-fail');
		document.getElementById("question"+question).id = "answered_incorrect";
		if(app_language=='et'){document.getElementById('answer_info').innerHTML = "VALE VASTUS";}else{document.getElementById('answer_info').innerHTML = "INCORRECT ANSWER";}
		document.getElementById('answer_info').style.color = "red";
	}
	//change answer colors to red or green depending if its correct or not
	for(var el=0; el<document.getElementsByClassName('answer_btn').length; el++){
		if(route[question].correct_answer == (parseInt(el)+1)){
			document.getElementsByClassName('answer_btn')[el].style.backgroundColor = "green";
		}else{
			document.getElementsByClassName('answer_btn')[el].style.backgroundColor = "red";
		}
		document.getElementsByClassName('answer_btn')[el].setAttribute('onclick', '');
	}
	
	//add continue button
	var continue_btn = document.createElement('button');
	continue_btn.className = "answer_btn";
	continue_btn.id='continue_btn';
	if(app_language=='et'){continue_btn.innerHTML = 'JÄTKA';}else{continue_btn.innerHTML = 'CONTINUE';}
	event.target.parentNode.appendChild(document.createElement('br'));
	event.target.parentNode.appendChild(continue_btn);
	
	//if player clicks the continue button
	document.getElementById('continue_btn').onclick = function(){
		document.getElementById('answer_info').innerHTML = "";
		document.getElementsByClassName('answer_div')[0].innerHTML = "";
		document.getElementsByClassName('questionPopup')[0].style.display = "none";
		if(correctAnswers+incorrectAnswers == nrOfQuestions){
			if(game_mode == "time_trial"){
				localStorage.setItem("result", (Date.parse(localStorage.getItem('deadline')) - Date.parse(new Date()))/1000);
			}
			end_game();
		}
		return false;
	};
	update();
}

//show end game screen
function end_game(){
	if(!localStorage.getItem('endtime')){
		localStorage.setItem('endtime', new Date())
	}
	//remove map and show end screen
	document.getElementById("map").style.display = "none";
	document.getElementById("end_screen").style.display = "block";
	document.getElementById("end_questions").innerHTML = "";
	//end screen text for estonian end english
	if(app_language=='et'){
		if(game_mode == "time_trial"){
			if(!localStorage.getItem('result')){
				if(Date.parse(localStorage.getItem('deadline')) - Date.parse(new Date()) <= 0){
					document.getElementById("end_title").innerHTML = "AEG OTSAS";
				} else {
					var time_left = (Date.parse(localStorage.getItem('deadline')) - Date.parse(new Date()))/1000; //in seconds
					if((correctAnswers+incorrectAnswers) == nrOfQuestions){
						document.getElementById("end_title").innerHTML = "TULEMUS<br>ALLES JÄÄNUD AEG ";
					} else {
						document.getElementById("end_title").innerHTML = "ALLES JÄÄNUD AEG ";
					}
					if(time_left>60){
						if(time_left/60<10){
							document.getElementById("end_title").innerHTML += '0'+Math.floor(time_left/60)+':';
						} else {
							document.getElementById("end_title").innerHTML += Math.floor(time_left/60)+':';
						}
						if(time_left%60<10){
							document.getElementById("end_title").innerHTML += '0'+time_left%60;
						} else {
							document.getElementById("end_title").innerHTML += time_left%60;
						}
					}
				}
			} else {
				var time_total = (Date.parse(localStorage.getItem('endtime')) - (Date.parse(localStorage.getItem('starttime'))))/1000;
				var time_spent = "";
				if(time_total>60){
					if(time_total/60<10){
						time_spent += '0'+Math.floor(time_total/60)+':';
					} else {
						time_spent += Math.floor(time_total/60)+':';
					}
					if(time_total%60<10){
						time_spent += '0'+time_total%60;
					} else {
						time_spent += time_total%60;
					}
				} else {
					time_spent += '00:';
					if(time_total%60<10){
						time_spent += '0'+time_total%60;
					} else {
						time_spent += time_total%60;
					}
				}
				document.getElementById("end_title").innerHTML = "TULEMUS<br>AEGA KULUS KOKKU "+time_spent;
			}
		} else {
			document.getElementById("end_title").innerHTML = "TULEMUS";
		}
		if((correctAnswers+incorrectAnswers) !== nrOfQuestions){
			document.getElementById("end_text").innerHTML = "<p>VASTANUD: "+(correctAnswers+incorrectAnswers)+"/"+nrOfQuestions+"</p><p>ÕIGED VASTUSED: "+correctAnswers+"</p><p>VALED VASTUSED: "+incorrectAnswers+"</p>";
			if(game_mode == "time_trial" && Date.parse(localStorage.getItem('deadline')) - Date.parse(new Date()) <= 0){
				document.getElementById('continue').nextElementSibling.style.display = "none";
				document.getElementById("continue").style.display = "none";
			} else {
				document.getElementById("continue").style.display = "inline-block";
				document.getElementById('continue').nextElementSibling.style.display = "inline-block";
			}
		} else {
			document.getElementById("end_text").innerHTML = "<p>ÕIGED VASTUSED: "+correctAnswers+"</p><p>VALED VASTUSED: "+incorrectAnswers+"</p>";
			document.getElementById('continue').nextElementSibling.style.display = "none";
			document.getElementById("continue").style.display = "none";
		}
		if(JSON.parse(localStorage.getItem("answers")) !== null){
			for(var i=0; i<JSON.parse(localStorage.getItem("answers")).length; i++){
				var question = document.createElement('p');
				question.id = JSON.parse(localStorage.getItem("answers"))[i][0];
				question.className = "end_answers";
				question.innerHTML = route[JSON.parse(localStorage.getItem("answers"))[i][0]].name.et+" +";
				if(i == 0){
					question.value = (JSON.parse(localStorage.getItem("times"))[i] - Date.parse(localStorage.getItem("starttime")))/1000;
				} else {
					question.value = (JSON.parse(localStorage.getItem("times"))[i] - JSON.parse(localStorage.getItem("times"))[i-1])/1000;
				}
				if(route[JSON.parse(localStorage.getItem("answers"))[i][0]].correct_answer == JSON.parse(localStorage.getItem("answers"))[i][1]){question.style.color = "green"} else {question.style.color = "red"}
				document.getElementById("end_questions").appendChild(question);
				document.getElementById("end_questions").appendChild(document.createElement('br'));
				document.getElementById(JSON.parse(localStorage.getItem("answers"))[i][0]).addEventListener("click", endPopUp, false);
			}
		}
		document.getElementById("continue").innerHTML = "JÄTKA";
		document.getElementById("start_menu").innerHTML = "AVA MENÜÜ";
	} else {
		if(game_mode == "time_trial"){
			if(!localStorage.getItem('result')){
				if(Date.parse(localStorage.getItem('deadline')) - Date.parse(new Date()) <= 0){
					document.getElementById("end_title").innerHTML = "TIME'S UP";
				} else {
					var time_left = (Date.parse(localStorage.getItem('deadline')) - Date.parse(new Date()))/1000; //in seconds
					if((correctAnswers+incorrectAnswers) == nrOfQuestions){
						document.getElementById("end_title").innerHTML = "RESULT<br>TIME LEFT ";
					} else {
						document.getElementById("end_title").innerHTML = "TIME LEFT ";
					}
					if(time_left>60){
						if(time_left/60<10){
							document.getElementById("end_title").innerHTML += '0'+Math.floor(time_left/60)+':';
						} else {
							document.getElementById("end_title").innerHTML += Math.floor(time_left/60)+':';
						}
						if(time_left%60<10){
							document.getElementById("end_title").innerHTML += '0'+time_left%60;
						} else {
							document.getElementById("end_title").innerHTML += time_left%60;
						}
					}
				}
			} else {
				var time_total = (Date.parse(localStorage.getItem('endtime')) - (Date.parse(localStorage.getItem('starttime'))))/1000;
				var time_spent = "";
				if(time_total>60){
					if(time_total/60<10){
						time_spent += '0'+Math.floor(time_total/60)+':';
					} else {
						time_spent += Math.floor(time_total/60)+':';
					}
					if(time_total%60<10){
						time_spent += '0'+time_total%60;
					} else {
						time_spent += time_total%60;
					}
				} else {
					time_spent += '00:';
					if(time_total%60<10){
						time_spent += '0'+time_total%60;
					} else {
						time_spent += time_total%60;
					}
				}
				document.getElementById("end_title").innerHTML = "RESULT<br>TIME SPENT TOGETHER "+time_spent;
			}
		} else {
			document.getElementById("end_title").innerHTML = "RESULT";
		}
		if((correctAnswers+incorrectAnswers) !== nrOfQuestions){
			document.getElementById("end_text").innerHTML = "<p>ANSWERED: "+(correctAnswers+incorrectAnswers)+"/"+nrOfQuestions+"</p><p>CORRECT ANSWERS: "+correctAnswers+"</p><p>INCORRECT ANSWERS: "+incorrectAnswers+"</p>";
			if(game_mode == "time_trial" && Date.parse(localStorage.getItem('deadline')) - Date.parse(new Date()) <= 0){
				document.getElementById('continue').nextElementSibling.style.display = "none";
				document.getElementById("continue").style.display = "none";
			} else {
				document.getElementById("continue").style.display = "inline-block";
				document.getElementById('continue').nextElementSibling.style.display = "inline-block";
			}
		} else {
			document.getElementById("end_text").innerHTML = "<p>CORRECT ANSWERS: "+correctAnswers+"</p><p>INCORRECT ANSWERS: "+incorrectAnswers+"</p>";
			document.getElementById('continue').nextElementSibling.style.display = "none";
			document.getElementById("continue").style.display = "none";
		}
		if(JSON.parse(localStorage.getItem("answers")) !== null){
			for(var i=0; i<JSON.parse(localStorage.getItem("answers")).length; i++){
				var question = document.createElement('p');
				question.id = JSON.parse(localStorage.getItem("answers"))[i][0];
				question.className = "end_answers";
				question.innerHTML = route[JSON.parse(localStorage.getItem("answers"))[i][0]].name.en+" +";
				if(i == 0){
					question.value = (JSON.parse(localStorage.getItem("times"))[i] - Date.parse(localStorage.getItem("starttime")))/1000;
				} else {
					question.value = (JSON.parse(localStorage.getItem("times"))[i] - JSON.parse(localStorage.getItem("times"))[i-1])/1000;
				}
				if(route[JSON.parse(localStorage.getItem("answers"))[i][0]].correct_answer == JSON.parse(localStorage.getItem("answers"))[i][1]){question.style.color = "green"} else {question.style.color = "red"}
				document.getElementById("end_questions").appendChild(question);
				document.getElementById("end_questions").appendChild(document.createElement('br'));
				document.getElementById(JSON.parse(localStorage.getItem("answers"))[i][0]).addEventListener("click", endPopUp, false);
			}
		}
		document.getElementById("continue").innerHTML = "CONTINUE";
		document.getElementById("start_menu").innerHTML = "MAIN MENU";
	}
}

//popup on endscreen about users answers for different questions
function endPopUp(event){
	//if it's already open, close it, else create it
	if (event.target.children.length > 0) {
		event.target.removeChild(event.target.childNodes[1]);
		if(app_language == 'et'){event.target.innerHTML = route[event.target.id].name.et+" +";} else {event.target.innerHTML = route[event.target.id].name.en+" +";}
	} else {
		if(app_language == 'et'){event.target.innerHTML = route[event.target.id].name.et+" -";} else {event.target.innerHTML = route[event.target.id].name.en+" -";}
		var el = document.createElement('div');
		el.className = "endPopUp";
		el.style.color="black";
		if(app_language == 'et'){
			var time_spent = "";
			if(event.target.value>60){
				if(event.target.value/60<10){
					time_spent += '0'+Math.floor(event.target.value/60)+':';
				} else {
					time_spent += Math.floor(event.target.value/60)+':';
				}
				if(event.target.value%60<10){
					time_spent += '0'+event.target.value%60;
				} else {
					time_spent += event.target.value%60;
				}
			} else {
				time_spent += '00:';
				if(event.target.value%60<10){
					time_spent += '0'+event.target.value%60;
				} else {
					time_spent += event.target.value%60;
				}
			}
			var question = route[event.target.id].question.et;
			for(var i=0; i<JSON.parse(localStorage.getItem("answers")).length; i++){
				if(JSON.parse(localStorage.getItem("answers"))[i][0] == event.target.id){
					if(JSON.parse(localStorage.getItem("answers"))[i][1] == 1){
						var answer = route[event.target.id].answers.answer_1.et;
					} else if(JSON.parse(localStorage.getItem("answers"))[i][1] == 2){
						var answer = route[event.target.id].answers.answer_2.et;
					} else if(JSON.parse(localStorage.getItem("answers"))[i][1] == 3){
						var answer = route[event.target.id].answers.answer_3.et;
					}
				}
			}
			if(parseInt(route[event.target.id].correct_answer)==1){
				var correctAnswer = route[event.target.id].answers.answer_1.et;
			} else if(parseInt(route[event.target.id].correct_answer)==2){
				var correctAnswer = route[event.target.id].answers.answer_2.et;
			} else if(parseInt(route[event.target.id].correct_answer)==3){
				var correctAnswer = route[event.target.id].answers.answer_3.et;
			}
			if(answer == correctAnswer){
				el.innerHTML = "<p>VASTASID ÕIGESTI</p><p>AEGA KULUS "+time_spent+"</p><p><b>KÜSIMUS:</b> "+question+"</p><p><b>VASTUS:</b> "+answer+"</p>";
			} else {
				el.innerHTML = "<p>VASTASID VALESTI</p><p>AEGA KULUS "+time_spent+"</p><p><b>KÜSIMUS:</b> "+question+"</p><p><b>SINU VASTUS:</b> "+answer+"</p><p><b>ÕIGE VASTUS:</b> "+correctAnswer+"</p>";
			}
		} else {
			var time_spent = "";
			if(event.target.value>60){
				if(event.target.value/60<10){
					time_spent += '0'+Math.floor(event.target.value/60)+':';
				} else {
					time_spent += Math.floor(event.target.value/60)+':';
				}
				if(event.target.value%60<10){
					time_spent += '0'+event.target.value%60;
				} else {
					time_spent += event.target.value%60;
				}
			} else {
				time_spent += '00:';
				if(event.target.value%60<10){
					time_spent += '0'+event.target.value%60;
				} else {
					time_spent += event.target.value%60;
				}
			}
			var question = route[event.target.id].question.en;
			for(var i=0; i<JSON.parse(localStorage.getItem("answers")).length; i++){
				if(JSON.parse(localStorage.getItem("answers"))[i][0] == event.target.id){
					if(JSON.parse(localStorage.getItem("answers"))[i][1] == 1){
						var answer = route[event.target.id].answers.answer_1.en;
					} else if(JSON.parse(localStorage.getItem("answers"))[i][1] == 2){
						var answer = route[event.target.id].answers.answer_2.en;
					} else if(JSON.parse(localStorage.getItem("answers"))[i][1] == 3){
						var answer = route[event.target.id].answers.answer_3.en;
					}
				}
			}
			if(parseInt(route[event.target.id].correct_answer)==1){
				var correctAnswer = route[event.target.id].answers.answer_1.en;
			} else if(parseInt(route[event.target.id].correct_answer)==2){
				var correctAnswer = route[event.target.id].answers.answer_2.en;
			} else if(parseInt(route[event.target.id].correct_answer)==3){
				var correctAnswer = route[event.target.id].answers.answer_3.en;
			}
			if(answer == correctAnswer){
				el.innerHTML = "<p>ANSWERED CORRECTLY</p><p>TIME SPENT "+time_spent+"</p><p>QUESTION: "+question+"</p><p>ANSWER: "+answer+"</p>";
			} else {
				el.innerHTML = "<p>ANSWERED INCORRECTLY</p><p>TIME SPENT "+time_spent+"</p><p>QUESTION: "+question+"</p><p>YOUR ANSWER: "+answer+"</p><p>CORRECT ANSWER: "+correctAnswer+"</p>";
			}
		}
		document.getElementById(event.target.id).appendChild(el);
	}
}

//update custom control innerhtml in the bottom left corner
function update(){
	if(localStorage.getItem("correctAnswers")){correctAnswers = parseInt(localStorage.getItem("correctAnswers"));}
	if(localStorage.getItem("incorrectAnswers")){incorrectAnswers = parseInt(localStorage.getItem("incorrectAnswers"));}
	document.getElementById('custom-control').innerHTML ='<p style="text-align:center;margin:0px;">&nbsp;'+(correctAnswers+incorrectAnswers)+'/'+nrOfQuestions+'&nbsp;</p>&nbsp;<div class="custom-control-correct"></div><div class="custom-control-text">&nbsp;'+correctAnswers+'&nbsp;</div><br>&nbsp;<div class="custom-control-incorrect"></div><div class="custom-control-text">&nbsp;'+incorrectAnswers+'&nbsp;</div>';
}

//change their name depending on the users answer to the questions given to him and if they're correct or not 
function update_markers(){
	for(var i=0; i<JSON.parse(localStorage.getItem("answers")).length; i++){
		document.getElementById("question"+JSON.parse(localStorage.getItem("answers"))[i][0]).removeEventListener("click", createPopUp, false);
		document.getElementById("question"+JSON.parse(localStorage.getItem("answers"))[i][0]).classList.remove('marker');
		if(route[JSON.parse(localStorage.getItem("answers"))[i][0]].correct_answer == JSON.parse(localStorage.getItem("answers"))[i][1]){
			document.getElementById("question"+JSON.parse(localStorage.getItem("answers"))[i][0]).classList.add('marker-success');
			document.getElementById("question"+JSON.parse(localStorage.getItem("answers"))[i][0]).id = "answered_correct";
		} else {
			document.getElementById("question"+JSON.parse(localStorage.getItem("answers"))[i][0]).classList.add('marker-fail');
			document.getElementById("question"+JSON.parse(localStorage.getItem("answers"))[i][0]).id = "answered_incorrect";
		}
	}
	update();
}

//go to main menu screen and if player has answered all the questions, remove all answers from memory (and time if game is time trial) so player cant continue already finished game
function gotostart(){
	if((correctAnswers+incorrectAnswers) == nrOfQuestions || (game_mode == "time_trial" && Date.parse(localStorage.getItem('deadline')) - Date.parse(new Date()) < 0)){
		localStorage.removeItem("incorrectAnswers");
		localStorage.removeItem("correctAnswers");
		localStorage.removeItem("answers");
		localStorage.removeItem("deadline");
		localStorage.removeItem("result");
		localStorage.removeItem("starttime");
		localStorage.removeItem("endtime");
		localStorage.removeItem("times");
	}
	if(device.platform === 'Android') {
		location.href='file:///android_asset/www/index.html';
    } else {
        window.open("index.html", '_self');
    }
}
//if player click continue_game button on end game screen
function continue_game(){
	document.getElementById("map").style.display = "block";
	document.getElementById("end_screen").style.display = "none";
}

//mapbox custom control for bottom left
class MyCustomControlInfo {
	//creating custom controller
	onAdd(map){
		this.map = map;
		this.container = document.createElement('div');
		this.container.id = "custom-control";
		this.container.className = "mapboxgl-ctrl mapboxgl-ctrl-group";
		return this.container;
	}
	onRemove(){
		this.container.parentNode.removeChild(this.container);
		this.map = undefined;
	}
}

//mapbox custom control for top left
class MyCustomControlEnd {
	//creating custom controller
	onAdd(map){
		this.map = map;
		this.div = document.createElement('div');
		this.div.className = "mapboxgl-ctrl";
		
		this.container = document.createElement('button');
		this.container.id = "custom-control-end-button";
		this.container.type = "button";
		if(app_language == 'et'){
			this.container.innerHTML = "LÕPETA";
		} else {
			this.container.innerHTML = "END";
		}
		this.container.setAttribute('onclick', "end_game();");
		
		this.div.appendChild(this.container);
		return this.div;
	}
	onRemove(){
		this.container.parentNode.removeChild(this.container);
		this.map = undefined;
	}
}


//mapbox custom control for top right
class MyCustomControlTime {
	//creating custom controller
	onAdd(map){
		this.map = map;
		this.container = document.createElement('div');
		this.container.id = "custom-control-time";
		this.container.className = "mapboxgl-ctrl mapboxgl-ctrl-group";
		return this.container;
	}
	onRemove(){
		this.container.parentNode.removeChild(this.container);
		this.map = undefined;
	}
}

const myCustomControlTime = new MyCustomControlTime();
const myCustomControlInfo = new MyCustomControlInfo();
const myCustomControlEnd = new MyCustomControlEnd();

//create user trackig constant
const geolocate = new mapboxgl.GeolocateControl({
	positionOptions: {
		enableHighAccuracy: true
	},
	trackUserLocation: true
});

//calculating time remaining and updating innerhtml of the clock. Initial code from: https://codepen.io/yaphi1/pen/KpbRZL
function time_remaining(endtime){
	var t = Date.parse(endtime) - Date.parse(new Date());
	var seconds = Math.floor( (t/1000) % 60 );
	var minutes = Math.floor( (t/1000/60) % 60 );
	var hours = Math.floor( (t/(1000*60*60)) % 24 );
	var days = Math.floor( t/(1000*60*60*24) );
	return {'total':t, 'days':days, 'hours':hours, 'minutes':minutes, 'seconds':seconds};
}
function run_clock(){
	var clock = document.getElementById("custom-control-time");
	function update_clock(){
		var endtime = localStorage.getItem('deadline');
		var t = time_remaining(endtime);
		clock.innerHTML = "";
		if(t.hours>0){
			clock.innerHTML += t.hours+':';
		}
		if(t.minutes<10){
			clock.innerHTML += '0'+t.minutes+':';
		} else {
			clock.innerHTML += t.minutes+':';
		}
		if(t.seconds<10){
			clock.innerHTML += '0'+t.seconds;
		} else {
			clock.innerHTML += t.seconds;
		}
		if(t.total<=0){ clearInterval(timeinterval); end_game();}
	}
	update_clock(); // run function once at first to avoid delay
	var timeinterval = setInterval(update_clock,1000);
}

//if style is loaded, start endloading function if not, wait 3sec and check again if it's loaded
function CheckIfLoaded(map){
	if(map.isStyleLoaded()){
		geolocate.trigger();
		endLoading(map);
	} else {
		setTimeout(function(){CheckIfLoaded(map);}, 3000);
	}
}
//if user is located, end loading
function endLoading(map){
	if(geolocate._watchState == "ACTIVE_LOCK"){
		document.getElementById("loading").parentElement.removeChild(document.getElementById("loading"));
		if(game_mode == "time_trial"){
			//timer
			if(!localStorage.getItem("deadline")){
				var current_time = Date.parse(new Date());
				var deadline = new Date(current_time+300000);
				localStorage.setItem('starttime', new Date());
				localStorage.setItem('deadline', deadline);
			}
			run_clock();
		}
	} else {
		setTimeout(function(){endLoading(map);}, 3000);
	}
}

//distance calculation with haversine formula example from: https://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula
function toRad(value) {
      var constant = 0.0174532925199433;
      return (value * constant);
    }

function calculateDistance(starting, ending) {
	var KM_RATIO = 6371;
	try {
		var Lat = toRad(ending[1] - starting[1]);
		var Lon = toRad(ending[0] - starting[0]);
		var lat1Rad = toRad(starting[1]);
		var lat2Rad = toRad(ending[1]);

		var a = Math.sin(Lat / 2) * Math.sin(Lat / 2) +
				Math.sin(Lon / 2) * Math.sin(Lon / 2) * Math.cos(lat1Rad) * Math.cos(lat2Rad);
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		var d = KM_RATIO * c;
		return d;
	} catch(e) {
		return -1;
	}
}