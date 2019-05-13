// custom axis adapted from:  https://bl.ocks.org/mbostock/3371592
// tooltip adapted from https://bl.ocks.org/mbostock/1087001

// average salery for country based on experience 
let allData;
// dictionaries for line values
var countryData = {};
var genderData = {};
var jobData = {};
var eduData = {};
// input values: 
const experienceArray = [0, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30]


d3.csv("salarydata.csv").then(function (data) {
  allData = data;

  var country_select = document.getElementById("qCountry");
  var edu_select = document.getElementById("qEdu");
  var countries_array = [];
  var edu_array = [];

  data.forEach(element => {
    countries_array.push(element["Country"])
    edu_array.push(element["FormalEducation"])
  });

  let unique_country = new Set(countries_array);
  let unique_edu = new Set(edu_array);

  unique_country.forEach(country => {
    var sel = document.createElement("option");
    sel.textContent = country;
    sel.value = country;
    country_select.appendChild(sel); 
  });
  unique_edu.forEach(edu => {
    var sel = document.createElement("option");
    sel.textContent = edu;
    sel.value = edu;
    edu_select.appendChild(sel); 
  });

  const margin = {top: 30, right: 80, bottom: 50, left: 80};
  var width = 900 - margin.left - margin.right;
  var height = 500 - margin.top - margin.bottom;

  var svg = d3.select(".line-graph")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  const salaryScale = d3.scaleLinear()
    // .exponent(.2)
    .domain([250000, 0])
    .range([0, height]);
  
  const experienceScale = d3.scaleLinear()
    .domain([0,30])
    .range([0, width]);

  var salaryAxis = d3.axisLeft(salaryScale)
    .tickSize(-width)
    .tickFormat(d3.format("$,"));

  svg.append("g")
    .attr("class", "expaxis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(experienceScale).tickSize(0));

  svg.append("text")
    .attr("class", "label-style")          
    .attr("transform", "translate(" + (width/2) + " ," + (height + 40) + ")")
    .style("text-anchor", "middle")
    .text("Years of Experience");

  svg.append("g")
    .attr("class", "salaxis")
    .attr("width", width)
    .call(salaryAxis)
    .select(".domain").remove()
    .selectAll(".tick text")
      .attr("x", 25)
      .attr("dy", -4);

  var line = d3.line()
    .x(function(d) {return experienceScale(d.key);})
    .y(function(d) {return salaryScale(d.value);})
    // .attr("class")
    .curve(d3.curveMonotoneX);

  
  var tooltip = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);

  update("United Kingdom", "Female", "Master", "Full-stack developer");

  d3.selectAll(".line_input").on("change", function(){
    console.log(d3.select("#qCountry").property("value"))
    update(d3.select("#qCountry").property("value"), d3.select("#qGender").property("value"), d3.select("#qEdu").property("value"), d3.select("#qDev").property("value"));
  });

  
  function update(countryVal, genderVal, eduVal, devVal){
    var countryVals = getAverageFor("Country", countryVal, countryData, experienceArray);
    var genderVals = getAverageFor("Gender", genderVal, genderData, experienceArray);
    var eduVals = getAverageFor("FormalEducation", eduVal, eduData, experienceArray);
    var jobVals = getAverageFor("DevType", devVal, jobData, experienceArray);
    var youVals = [];
    var i=0;
    var sums;
    console.log(countryVals);
    experienceArray.forEach(year => {
      sums = 0;
      sums = countryVals[i].value*3 + genderVals[i].value + eduVals[i].value + jobVals[i].value;
      var avg = sums/6;
      console.log(avg)
      youVals.push({
        "key": year,
        'value': avg, 
      });
      i = i+1;
    });

    var allDataArrays = [[countryVals,'gray', '.15em', .3, "gray", "Country"],[genderVals,'gray', '.15em', .3, "gray", "Gender"], [eduVals, 'gray', '.15em', .3, "gray", "Education"], [jobVals, 'gray', '.15em', .3, "gray", "Developer"], [youVals, "#3b18b5", '.3em', 1, "#3b18b5", "Predicted"]];

    d3.selectAll("path.line").remove()
    
    allDataArrays.forEach(set => {
      addLine(set[0], svg, set[1], set[2], set[3], set[4], set[5])
    });

    function addLine(dataArray, svg, color, width, opacity, secondcolor, inner_text){
      svg.append("path")
      .datum(dataArray)
      .attr("class", "line")
      .attr("d", line)
      .attr("fill", "none")
      .attr("stroke", color)
      .attr("opacity", opacity)
      .attr("stroke-width", width)
      .attr("z-index", "-1")
      .on("mouseover", function() { 
        tooltip.transition()		
          .duration(100)		
          .style("opacity", .9);
        tooltip.style("display", "inline")
          .style("background-color", color);
        tooltip.text(inner_text + " ")
          .style("left", (d3.event.pageX - 34) + "px")
          .style("top", (d3.event.pageY - 12) + "px");	
        d3.select(this)
          .attr("opacity", "1")
          .attr("stroke", secondcolor);
      })
      .on("mouseout", function() { 
        d3.select(this).attr('stroke', color)
          .attr("opacity", opacity)
          .attr("stroke", color);
        tooltip.transition()		
          .duration(1000)		
          .style("opacity", 0);
      });
    };

  };

  // calculate the line for this one set of data

  function getAverageFor(field, value, appendArray, experienceArray){
    appendArray = [];
    var add;
    experienceArray.forEach(year=> {
      var sum = 0;
      var count = 0;
      var personfield;
      allData.forEach(person =>{
        personfield = person[field].split(";");
        if (personfield.includes(value) && parseInt(person["YearsCoding"]) == year){
          sum = sum + parseInt(person["ConvertedSalary"]);
          count = count + 1;
        };
      });
      if (count == 0){
        var newval = 10000
        console.log("newval")
        add = {
          "key" : year,
          'value': newval
        }
      } else{ 
        add = {
          "key": year,
          'value': sum/count, 
        }
      }
      appendArray.push(add);
    });
    return appendArray;
  };
});