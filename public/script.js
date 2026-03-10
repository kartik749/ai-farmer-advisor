async function generateAdvice(){

const name = document.getElementById("name").value;
const crop = document.getElementById("crop").value;
const soil = document.getElementById("soil").value;
const weather = document.getElementById("weather").value;
const language = document.getElementById("language").value;

const button = document.querySelector("button");
button.disabled = true;
button.textContent = "Generating Advice...";

try{

const response = await fetch("/advice",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body: JSON.stringify({crop,soil,weather,language})
});

const data = await response.json();

localStorage.setItem("farmerName",name);
localStorage.setItem("advice",data.advice);

window.location.href = "result.html";

}catch(error){

alert("Error connecting to AI service");

}

button.disabled = false;
button.textContent = "Get AI Advice";

}



window.onload = function(){

const name = localStorage.getItem("farmerName");
const advice = localStorage.getItem("advice");

if(document.getElementById("farmerName")){
document.getElementById("farmerName").textContent = "Farmer: " + name;
}

if(document.getElementById("advice")){
document.getElementById("advice").textContent = advice;
}

};



function goBack(){

window.location.href = "index.html";

}