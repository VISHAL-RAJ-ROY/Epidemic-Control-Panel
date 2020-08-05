var myInput = document.getElementById("myInput"),
  Total_step_Input = document.getElementById("Total_step"),
  rangeslider = document.getElementById("sliderRange"),
  output = document.getElementById("demo"),
  modelSelector = document.getElementById("Model"),
  SidenavChildren = document.getElementById("sidenav").childNodes,
  citySelector = document.getElementById("City"),
  totalDaySpan = document.getElementById("demo1"),
  slider = document.getElementById("sliderRange"),
  graphCity = document.getElementById("Cities");
(randomRateCheckbox = document.getElementById("randomRateCheckbox")),
  (randomInitialValueCheckbox = document.getElementById(
    "randomInitialValueCheckbox"
  )),
  (SidenavChildrenOffset = 0),
  (initialValueOffset = 0),
  (Total_step = 10),
  (Time_step = 1),
  (Model = "SIRD"),
  (LastModel = "SIRD"),
  (resPro = ""),
  (States = []),
  (s = ""),
  (N = 20),
  (NS = 4);
//---------------------------------------------------------
days = Array.apply(null, new Array(Total_step + 1)).map(
  Number.prototype.valueOf,
  0
);
infected = Array(N + 1)
  .fill(0)
  .map(() => new Array(Total_step + 1).fill(0));
suscepted = Array(N + 1)
  .fill(0)
  .map(() => new Array(Total_step + 1).fill(0));
recovered = Array(N + 1)
  .fill(0)
  .map(() => new Array(Total_step + 1).fill(0));
dead = Array(N + 1)
  .fill(0)
  .map(() => new Array(Total_step + 1).fill(0));
curr_infected = Array.apply(null, new Array(Total_step + 1)).map(
  Number.prototype.valueOf,
  0
);
curr_suscepted = Array.apply(null, new Array(Total_step + 1)).map(
  Number.prototype.valueOf,
  0
);
curr_dead = Array.apply(null, new Array(Total_step + 1)).map(
  Number.prototype.valueOf,
  0
);
curr_recovered = Array.apply(null, new Array(Total_step + 1)).map(
  Number.prototype.valueOf,
  0
);

(randoms = [...Array(7 * N)].map(() => Math.random().toPrecision(4))),
  (localHost = "http://localhost:8888/"), // for local testing use CORS google chrome extension
  (pythonAnywhereHost = "https://cors-anywhere.herokuapp.com/https://vishalraj.pythonanywhere.com/"),
  (currentHost = pythonAnywhereHost);

// randoms = [0.9, 0.9, 0.9, 0.05, 0.05, 0.05, 0, 0, 0, 0, 0, 0];
var randoms = new Array(7 * N);

function resize(arr, size, defval) {
  while (arr.length > size) {
    arr.pop();
  }
  while (arr.length < size) {
    arr.push(defval);
  }
}

myInput.onclick = function() {
  Total_step = document.getElementById("Total_step").value;
  if (Total_step == "") Total_step = 10;
  else Total_step = parseInt(Total_step);
  slider["max"] = Total_step / Time_step;
  totalDaySpan.innerHTML = slider["max"];
  slider.value = Math.min(slider.value, slider["max"]);
  output.innerHTML = slider.value;
  document.getElementById("myChart1").style.display = "none";
  document.getElementById("myChart2").style.display = "none";
  document.getElementById("myChart3").style.display = "none";
  graphCity.value = 0;

  resize(days, Total_step + 1, 0);
  resize(curr_suscepted, Total_step + 1, 0);
  resize(curr_infected, Total_step + 1, 0);
  resize(curr_dead, Total_step + 1, 0);
  resize(curr_recovered, Total_step + 1, 0);
  for (let i = 0; i <= N; i++) {
    resize(infected[i], Total_step + 1, 0);
    resize(suscepted[i], Total_step + 1, 0);
    resize(dead[i], Total_step + 1, 0);
    resize(recovered[i], Total_step + 1, 0);
  }
  GetAndUpdate();
};

function initialiseRandoms(v1, v2, v3, v4, v5, v6, v7) {
  for (let i = 0; i < N; i++) randoms[i] = v1;
  for (let i = 0; i < N; i++) randoms[i + N] = v2;
  for (let i = 0; i < N; i++) randoms[i + 2 * N] = v3;
  for (let i = 0; i < N; i++) randoms[i + 3 * N] = v4;
  for (let i = 0; i < N; i++) randoms[i + 4 * N] = v5;
  for (let i = 0; i < N; i++) randoms[i + 5 * N] = v6;
  for (let i = 0; i < N; i++) randoms[i + 6 * N] = v7;
}

initialiseRandoms(0.9, 0.05, 0, 0, 0.6, 0.4, 0);

Names = [
  "Mumbai",
  "Delhi",
  "Bengaluru",
  "Kolkata",
  "Chennai",
  "Ahmedabad",
  "Hyderabad",
  "Pune",
  "Surat",
  "Kanpur",
  "Jaipur",
  "Navi Mumbai",
  "Lucknow",
  "Nagpur",
  "Indore",
  "Patna",
  "Bhopal",
  "Ludhiana",
  "Tirunelveli",
  "Agra"
];

Text = ["S : ", "I : ", "R : ", "D : "];

function updateS() {
  s = "";
  randoms.forEach(function(d, i) {
    s += "_" + d.toString();
  });
}

updateS();

function updateValues(state) {
  Array.from(document.getElementsByClassName("node")).forEach(function(d, i) {
    var numTextDisplay = NS + 1;
    if (Model == "SIR") numTextDisplay = NS;
    else if (Model == "SIS") numTextDisplay = NS - 1;
    else numTextDisplay = NS + 1;
    d.childNodes[1].innerHTML = Names[i] + " : ";
    for (let j = 1; j < numTextDisplay; j++) {
      var Total = Math.abs(state[j - 1][i]) * 100.0;

      if (Model == "SIS" && j == 1) {
        Total += Math.abs(state[j - 1 + 2][i]) * 100.0;
      }

      d.childNodes[j + 1].innerHTML = Total;
      d.childNodes[j + 1].innerHTML = parseFloat(
        d.childNodes[j + 1].innerHTML
      ).toPrecision(4);
      d.childNodes[j + 1].innerHTML =
        Text[j - 1] + d.childNodes[j + 1].innerHTML;
    }
    for (let j = numTextDisplay; j < NS + 1; j++) {
      d.childNodes[j + 1].innerHTML = "";
    }
  });
}

function GetAndUpdate(D = null) {
  var Http = new XMLHttpRequest();
  var url =
    currentHost + s + "_" + Total_step.toString() + "_" + Time_step.toString();
  if (D != null) url += D;
  Http.open("GET", url);
  Http.send();
  var k = 0;
  resPro = "";
  States = new Array(Total_step / Time_step + 1);
  for (var j = 0; j < Total_step / Time_step + 1; j++) {
    States[j] = new Array(NS);
    for (var i = 0; i < NS; i++) {
      States[j][i] = new Array(N);
    }
  }
  Http.onreadystatechange = e => {
    if (k % 3 == 2) {
      resPro = Http.responseText.split("_");
      for (let j = 0; j < Total_step / Time_step + 1; j++) {
        for (let i = 0; i < NS; i++) {
          for (let kk = 0; kk < N; kk++) {
            States[j][i][kk] = parseFloat(resPro[j * N * NS + i * N + kk]);
          }
        }
      }
      updateValues(States[output.innerHTML]);
      new_values(States);
    }
    k++;
    if (graphCity.value - 1 >= 0) {
      infected[graphCity.value - 1].forEach(function(d, i) {
        curr_infected[i] = d;
      });

      suscepted[graphCity.value - 1].forEach(function(d, i) {
        curr_suscepted[i] = d;
      });

      recovered[graphCity.value - 1].forEach(function(d, i) {
        curr_recovered[i] = d;
        if (modelSelector.value == "SIS") {
          curr_suscepted[i] = 100 - curr_infected[i];
        }
      });

      dead[graphCity.value - 1].forEach(function(d, i) {
        curr_dead[i] = d;
      });

      chart1.update();
      chart2.update();
      chart3.update();
    }
  };
}

GetAndUpdate();

totalDaySpan.innerHTML = slider["max"];

// Utility function
function CreateElement(name, props) {
  var element = document.createElement(name);
  if (props == null) return element;
  for (let [key, value] of Object.entries(props)) {
    element.setAttribute(key, value);
  }
  return element;
}

function hideElementsbyID(IdList) {
  IdList.forEach(function(d) {
    document.getElementById(d).hidden = true;
  });
}

function showElementsbyID(IdList) {
  IdList.forEach(function(d) {
    document.getElementById(d).hidden = false;
  });
}

output.innerHTML = rangeslider.value;

rangeslider.oninput = function() {
  output.innerHTML = this.value * Time_step;
  updateValues(States[this.value]);
};

modelSelector.onchange = function() {
  LastModel = Model;
  Model = this.value;

  document.getElementById("myChart1").style.display = "none";
  document.getElementById("myChart2").style.display = "none";
  document.getElementById("myChart3").style.display = "none";
  graphCity.value = 0;

  if (Model == "SIRD" && LastModel != "SIRD") {
    updateValues(States[output.innerHTML]);
  } else if (Model != "SIRD" && LastModel == "SIRD") {
    for (let i = 2 * N; i < 4 * N; i++) {
      randoms[i] = 0;
    }
    updateS();
    GetAndUpdate();
  } else if (Model != LastModel && Model != "SIRD" && LastModel != "SIRD") {
    updateValues(States[output.innerHTML]);
  }

  if (Model != "SIRD") {
    hideElementsbyID([
      "reinfectionRate",
      "reinfectionSlider",
      "deathRate",
      "deathSlider",
      "reinfectionPara",
      "deathPara"
    ]);
  }
  if (Model == "SIS") {
    hideElementsbyID([
      "percentageRecovered",
      "recoveredSlider",
      "recoveredPara"
    ]);
  }
  if (Model == "SIRD") {
    showElementsbyID([
      "reinfectionRate",
      "reinfectionSlider",
      "deathRate",
      "deathSlider",
      "reinfectionPara",
      "deathPara",
      "percentageRecovered",
      "recoveredSlider",
      "recoveredPara"
    ]);
  }
  if (Model == "SIR") {
    showElementsbyID([
      "percentageRecovered",
      "recoveredSlider",
      "recoveredPara"
    ]);
  }
};

randomRateCheckbox.onchange = function() {
  var IdList = [
    "infectionPara",
    "recoveryPara",
    "infectionSlider",
    "recoverySlider"
  ];
  var IdList2 = [
    "reinfectionSlider",
    "deathSlider",
    "reinfectionPara",
    "deathPara"
  ];
  if (randomRateCheckbox.checked) {
    IdList.push("chooseACityDiv");
    hideElementsbyID(IdList);
    hideElementsbyID(IdList2);
    tempRandoms = [...Array(4 * N)].map(() => Math.random().toPrecision(2));
    for (let i = 0; i < 4 * N; i++) randoms[i] = tempRandoms[i];
  } else {
    if (!randomInitialValueCheckbox.checked) IdList.push("chooseACityDiv");
    showElementsbyID(IdList);
    if (Model == "SIRD") {
      showElementsbyID(IdList2);
    }
    initialiseRandoms(0.9, 0.05, 0, 0, 0.6, 0.4, 0);
    setSameForAll();
  }
  updateS();
  GetAndUpdate();
};

randomInitialValueCheckbox.onchange = function() {
  var IdList = [
    "infectedSlider",
    "infectedPara",
    "susceptibleSlider",
    "susceptiblePara"
  ];
  var IdList2 = ["recoveredSlider", "recoveredPara"];
  if (randomInitialValueCheckbox.checked) {
    IdList.push("chooseACityDiv");
    hideElementsbyID(IdList);
    hideElementsbyID(IdList2);
    tempRandoms = [...Array(3 * N)].map(() => Math.random().toPrecision(1));
    for (let i = 0; i < N; i++) tempRandoms[i + 2 * N] = 0;
    for (let i = 0; i < 3 * N; i++) randoms[i + 4 * N] = tempRandoms[i];
  } else {
    if (!randomRateCheckbox.checked) IdList.push("chooseACityDiv");
    showElementsbyID(IdList);
    if (Model != "SIS") {
      showElementsbyID(IdList2);
    }
    initialiseRandoms(0.9, 0.05, 0, 0, 0.6, 0.4, 0);
    setSameForAll();
  }
  updateS();
  GetAndUpdate();
};

function attach(sliderElement, outputElement, index, ifPercentageElement) {
  sliderElement.oninput = function() {
    var self = this;
    index.forEach(function(d) {
      randoms[d] = (parseInt(self.value) * 1.0) / 100.0;
    });
    outputElement.innerHTML = (parseInt(this.value) * 1.0) / 100.0;
    if (ifPercentageElement == 1) {
      outputElement.innerHTML = parseInt(sliderElement.value) * 1.0;
      outputElement.innerHTML += "%";
    }
    updateS();
    GetAndUpdate();
  };
  sliderElement.value = parseInt(100 * randoms[index[0]]);
  outputElement.innerHTML = (parseInt(sliderElement.value) * 1.0) / 100.0;
  if (ifPercentageElement == 1) {
    outputElement.innerHTML = parseInt(sliderElement.value) * 1.0;
    outputElement.innerHTML += "%";
  }
}

while (SidenavChildren[SidenavChildrenOffset]["id"] != "infectionSlider") {
  SidenavChildrenOffset++;
}

while (SidenavChildren[initialValueOffset]["id"] != "susceptibleSlider") {
  initialValueOffset++;
}

function attachToSideNav(value) {
  for (let i = 0; i < 4; i++) {
    attach(
      SidenavChildren[SidenavChildrenOffset + 4 * i],
      SidenavChildren[SidenavChildrenOffset + 4 * i - 2].childNodes[1],
      value.map(function(val) {
        return val - 1 + N * i;
      })
    );
  }
  for (let i = 4; i < 7; i++) {
    attach(
      SidenavChildren[initialValueOffset + 4 * (i - 4)],
      SidenavChildren[initialValueOffset + 4 * (i - 4) - 2].childNodes[1],
      value.map(function(val) {
        return val - 1 + N * i;
      }),
      1
    );
  }
}

var perSSlider = SidenavChildren[initialValueOffset];
var perSSpan = SidenavChildren[initialValueOffset - 2].childNodes[1];

function setSameForAll() {
  temp = [];
  for (let i = 1; i < 21; i++) temp.push(i);
  attachToSideNav(temp);
}

setSameForAll();

citySelector.onchange = function() {
  if (citySelector.value == 0) {
    showElementsbyID(["randomInitialValueDiv", "randomRateDiv"]);
    initialiseRandoms(0.9, 0.05, 0, 0, 0.6, 0.4, 0);
    setSameForAll();
    updateS();
    GetAndUpdate();
  } else {
    hideElementsbyID(["randomInitialValueDiv", "randomRateDiv"]);
    attachToSideNav([citySelector.value]);
  }
};

graphCity.onchange = function() {
  if (graphCity.value == 0) {
    document.getElementById("myChart1").style.display = "none";
    document.getElementById("myChart2").style.display = "none";
    document.getElementById("myChart3").style.display = "none";
  } else {
    if (Model == "SIRD") {
      document.getElementById("myChart1").style.display = "block";
      document.getElementById("myChart2").style.display = "none";
      document.getElementById("myChart3").style.display = "none";
    }
    if (Model == "SIR") {
      document.getElementById("myChart2").style.display = "block";
      document.getElementById("myChart1").style.display = "none";
      document.getElementById("myChart3").style.display = "none";
    }
    if (Model == "SIS") {
      document.getElementById("myChart3").style.display = "block";
      document.getElementById("myChart2").style.display = "none";
      document.getElementById("myChart1").style.display = "none";
    }

    infected[graphCity.value - 1].forEach(function(d, i) {
      curr_infected[i] = d;
    });

    suscepted[graphCity.value - 1].forEach(function(d, i) {
      curr_suscepted[i] = d;
    });

    recovered[graphCity.value - 1].forEach(function(d, i) {
      curr_recovered[i] = d;
      if (modelSelector.value == "SIS") {
        console.log(modelSelector.value);
        curr_suscepted[i] = 100 - curr_infected[i];
      }
    });

    dead[graphCity.value - 1].forEach(function(d, i) {
      curr_dead[i] = d;
    });

    chart1.update();
    chart2.update();
    chart3.update();
  }
};

function new_values(States) {
  for (let city = 0; city < N; city++) {
    for (let k = 0; k <= Total_step; k++) {
      // console.log(States[k][1][city]);
      suscepted[city][k] = parseFloat(
        Math.abs(States[k][0][city]) * 100.0
      ).toPrecision(4);
      infected[city][k] = parseFloat(
        Math.abs(States[k][1][city]) * 100.0
      ).toPrecision(4);
      dead[city][k] = parseFloat(
        Math.abs(States[k][3][city]) * 100.0
      ).toPrecision(4);
      recovered[city][k] = parseFloat(
        Math.abs(States[k][2][city]) * 100.0
      ).toPrecision(4);
      days[k] = "Day " + k;
      // console.log(suscepted[city][k]);
    }
  }
}

var ctx1 = document.getElementById("myChart1").getContext("2d");
var chart1 = new Chart(ctx1, {
  // The type of chart we want to create
  type: "line",

  // The data for our dataset
  data: {
    labels: days,
    datasets: [
      {
        label: "Infected",
        borderColor: "rgb(255, 99, 132)",
        data: curr_infected
      },

      {
        label: "Susceptible",
        borderColor: "orange",
        data: curr_suscepted
      },
      {
        label: "Recovered",
        borderColor: "black",
        data: curr_recovered
      },

      {
        label: "Dead",
        borderColor: "blue",
        data: curr_dead
      }
    ]
  },

  // Configuration options go here
  options: {
    responsive: true,
    layout: {
      padding: {
        left: 300,
        right: 200,
        top: 100,
        bottom: 200
      }
    },
    scales: {
      yAxes: [
        {
          display: true,
          ticks: {
            beginAtZero: true,
            steps: 10,
            stepValue: 5,
            max: 100
          }
        }
      ]
    }
  }
});

var ctx2 = document.getElementById("myChart2").getContext("2d");
var chart2 = new Chart(ctx2, {
  // The type of chart we want to create
  type: "line",

  // The data for our dataset
  data: {
    labels: days,
    datasets: [
      {
        label: "Infected",
        borderColor: "rgb(255, 99, 132)",
        data: curr_infected
      },

      {
        label: "Susceptible",
        borderColor: "orange",
        data: curr_suscepted
      },
      {
        label: "Recovered",
        borderColor: "black",
        data: curr_recovered
      }
    ]
  },

  // Configuration options go here
  options: {
    responsive: true,
    layout: {
      padding: {
        left: 300,
        right: 200,
        top: 100,
        bottom: 200
      }
    },
    scales: {
      yAxes: [
        {
          display: true,
          ticks: {
            beginAtZero: true,
            steps: 10,
            stepValue: 5,
            max: 100
          }
        }
      ]
    }
  }
});

var ctx3 = document.getElementById("myChart3").getContext("2d");
var chart3 = new Chart(ctx3, {
  // The type of chart we want to create
  type: "line",

  // The data for our dataset
  data: {
    labels: days,
    datasets: [
      {
        label: "Infected",
        borderColor: "rgb(255, 99, 132)",
        data: curr_infected
      },

      {
        label: "Susceptible",
        borderColor: "orange",
        data: curr_suscepted
      }
    ]
  },

  // Configuration options go here
  options: {
    responsive: true,
    layout: {
      padding: {
        left: 300,
        right: 200,
        top: 100,
        bottom: 200
      }
    },
    scales: {
      yAxes: [
        {
          display: true,
          ticks: {
            beginAtZero: true,
            steps: 10,
            stepValue: 5,
            max: 100
          }
        }
      ]
    }
  }
});
