function generateUUID() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }

    // Restore UID or create a new one if missing
    function getOrCreateUID() {
      let uid = localStorage.getItem('deviceUID');
      if (!uid) {
        uid = generateUUID();
        localStorage.setItem('deviceUID', uid);
      }
      return uid;
    }

// Example usage
const uid = getOrCreateUID();

const Icons = {
  face: ({fill="#4CAF50", eye="#fff", mouth="#fff", mood="neutral"}) => {
	// Mood options: "frown","slight-frown","neutral","slight-smile","smile"
	const mouthPaths = {
	  "frown":        'M12 26 Q18 20 24 26',
	  "slight-frown": 'M12 24 Q18 22 24 24',
	  "neutral":      'M12 23 L24 23',
	  "slight-smile": 'M12 22 Q18 25 24 22',
	  "smile":        'M12 21 Q18 27 24 21'
	};
	const d = mouthPaths[mood] || mouthPaths["neutral"];
	return `
	  <svg class="svg" viewBox="0 0 36 36" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
		<circle cx="18" cy="18" r="16" fill="${fill}"/>
		<circle cx="13" cy="14" r="1.5" fill="${eye}" opacity="0.95"/>
		<circle cx="23" cy="14" r="1.5" fill="${eye}" opacity="0.95"/>
		<path d="${d}" stroke="${mouth}" stroke-width="1.5" fill="none" stroke-linecap="round"/>
	  </svg>
	`;
  },

  circle: ({fill="#4CAF50"}) => `
	<svg class="svg" viewBox="0 0 36 36" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
	  <circle cx="18" cy="18" r="16" fill="${fill}"/>
	</svg>
  `,

  square: ({fill="#4CAF50"}) => `
	<svg class="svg" viewBox="0 0 36 36" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
	  <rect x="6" y="6" width="24" height="24" rx="4" fill="${fill}"/>
	</svg>
  `,

  triangle: ({fill="#4CAF50"}) => `
	<svg class="svg" viewBox="0 0 36 36" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
	  <polygon points="18,6 30,28 6,28" fill="${fill}"/>
	</svg>
  `,

  breeze: ({fill="#2E7D32", stroke="#fff"}) => `
	<svg class="svg" viewBox="0 0 36 36" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
	  <circle cx="18" cy="18" r="16" fill="${fill}"/>
	  <path d="M10 16h16" stroke="${stroke}" stroke-width="2.4" stroke-linecap="round"/>
	  <path d="M10 20h12" stroke="${stroke}" stroke-width="2.4" stroke-linecap="round" opacity="0.9"/>
	  <path d="M10 24h8"  stroke="${stroke}" stroke-width="2.4" stroke-linecap="round" opacity="0.8"/>
	</svg>
  `,

  swirl: ({fill="#FB8C00", stroke="#fff"}) => `
	<svg class="svg" viewBox="0 0 36 36" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
	  <circle cx="18" cy="18" r="16" fill="${fill}"/>
	  <path d="M9 20c4-5 10-3 10 0 0 3-3 4-5 4" stroke="${stroke}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
	  <path d="M20 12c3 0 6 2 6 5 0 4-4 6-8 6" stroke="${stroke}" stroke-width="2.4" fill="none" stroke-linecap="round" opacity="0.9"/>
	</svg>
  `
};

const colors={"dark blue": "#0D47A1",
			  "light blue": "#a6dced",
			  "green": "#4CAF50",
			  "orange": "#FB8C00",
			  "red": "#B71C1C"}


/***********************
 * CONFIGURATION
 * Adjust colors, icons, labels, size, etc.
 ***********************/
const CONFIG = {
  iconSizePx: 56, // updates CSS var --icon-size at runtime
  questions: [
	{
	  id: "temperature",
	  legend: "temperature_question",
	  roleLabel: "Temperature sensation",
	  // Pick any icon factory name from Icons
	  iconFactory: "face",
	  // Per-option params (color + mood)
	  options: [
		{ value: "-2",       label: "Too cold",       iconParams: { fill:colors["dark blue"], mood:"frown" } },
		{ value: "-1",  label: "Slightly cold",  iconParams: { fill:colors["light blue"], mood:"neutral" } },
		{ value: "0",           label: "Fine",           iconParams: { fill:colors["green"], mood:"smile" } },
		{ value: "1",      label: "A bit hot",      iconParams: { fill:colors["orange"], mood:"neutral" } },
		{ value: "2",       label: "Very hot",       iconParams: { fill:colors["red"], mood:"frown" } }
	  ],
	  required: true
	},
	{
	  id: "air",
	  legend: "iaq_question",
	  roleLabel: "Air perception",
	  // Show how you can mix a different icon type for this question
	  // Choose "breeze" (green) for fresh & clean, "swirl" (orange) for stuffy
	  options: [
		{ value: "-1", label: "Odors, stuffy", iconParams: { fill:colors["orange"], mood:"frown" } },
		{ value: "1", label: "Fresh & clean", iconParams: { fill:colors["green"], mood:"smile" } }
	  ],
	  required: true
	}
  ]
};

/***********************
 * RENDERING
 ***********************/
const form = document.getElementById("surveyForm");
const message = document.getElementById("message");
const questionsRoot = document.getElementById("questions");

// apply icon size
document.documentElement.style.setProperty("--icon-size", CONFIG.iconSizePx + "px");

function makeId(questionId, index){
  return `${questionId}__${index}`;
}

function renderQuestion(q){
  // fieldset
  const fs = document.createElement("fieldset");
  const legend = document.createElement("legend");
  legend.textContent = q.legend;
  legend.setAttribute("lang-key",q.legend)
  fs.appendChild(legend);

  const optionsWrap = document.createElement("div");
  optionsWrap.className = "options";
  optionsWrap.setAttribute("role", "radiogroup");
  optionsWrap.setAttribute("aria-label", q.roleLabel || q.legend);

  const baseFactoryName = q.iconFactory || "face";

  q.options.forEach((opt, i) => {
	const input = document.createElement("input");
	input.type = "radio";
	input.name = q.id;
	input.id = makeId(q.id, i);
	input.value = opt.value;
	if(q.required && i === 0){
	  // "required" on a radio group is enough on any one input
	  input.required = true;
	}

	const label = document.createElement("label");
	label.className = "option";
	label.setAttribute("for", input.id);

	// decide icon factory for this option
	const factoryName = opt.iconFactory || baseFactoryName;
	const factory = Icons[factoryName];
	if(!factory){
	  console.warn(`Unknown icon factory "${factoryName}". Falling back to 'circle'.`);
	}
	const iconMarkup = (factory || Icons.circle)(opt.iconParams || {});

	// inject SVG and text
	const iconHolder = document.createElement("div");
	iconHolder.innerHTML = iconMarkup.trim();
	label.appendChild(iconHolder.firstElementChild);

	const text = document.createElement("span");
	text.textContent = opt.label;
	text.setAttribute("lang-key",opt.label)

	label.appendChild(text);

	optionsWrap.appendChild(input);
	optionsWrap.appendChild(label);
  });

  fs.appendChild(optionsWrap);
  return fs;
}


// render all configured questions
CONFIG.questions.forEach(q => questionsRoot.appendChild(renderQuestion(q)));

/***********************
 * SUBMIT HANDLER
 ***********************/
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const data = new FormData(form);
  const answers = {};

  var complete = true

  answers["time_ms"]=Date.now()
  answers["time_str"]=new Date()
  answers["ui"]=uid

  CONFIG.questions.forEach(q => {
	  
	if (data.get(q.id)==null){
		warning.style.display = "block";
		// hide message after 3s
		setTimeout(() => { warning.style.display = "none"; }, 3000);
		complete=false
	}
	  
	answers[q.id] = data.get(q.id);
  });

  if (!complete){
	return
  }

  console.log("Survey submitted:", answers);

  // confirmation
  message.style.display = "block";


  // reset for next entry
  form.reset();

  // hide message after 3s
  setTimeout(() => { message.style.display = "none"; }, 3000);

  // Placeholder for your future fetch():
  // fetch("/your-endpoint", {
  //   method: "POST",
  //   headers: {"Content-Type":"application/json"},
  //   body: JSON.stringify(answers)
  // }).then(r => r.json()).then(console.log).catch(console.error);
});


document.getElementById("fr-button").addEventListener("click",(e) => {changelang(e)})
document.getElementById("nl-button").addEventListener("click",(e) => {changelang(e)})



function changelang(e){

	var buttons = [document.getElementById("fr-button"), document.getElementById("nl-button")]

	buttons.forEach(btn => {
		console.log("btn")
		btn.classList.remove("button-primary")
		btn.classList.add("button-secondary")
	
	}
	)


	var btn = e.target
	btn.classList.add("button-primary");
	btn.classList.remove("button-secondary");

	currentLang = btn.getAttribute('lang')

	translateAll()
	
}



function translateAll(){
	
	var lang = currentLang
	var elems = document.querySelectorAll("[lang-key]")
	
	elems.forEach( (e) =>{ e.innerText= translations[lang][e.getAttribute('lang-key')] })
	
}

function translate(key){
	return translations[currentLang][key]
}

translateAll()
