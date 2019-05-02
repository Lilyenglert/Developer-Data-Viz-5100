// custom axis adapted from:  https://bl.ocks.org/mbostock/3371592

// average salery for country based on experience 
let allData;
// dictionaries for line values
var raceData = {};
var genderData = {};
var jobData = {};
var eduData = {};
// input values: 
const experienceArray = [0, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30]

const margin = {top: 30, right: 80, bottom: 30, left: 80};
var width = 900 - margin.left - margin.right;
var height = 500 - margin.top - margin.bottom;


d3.csv("salarydata.csv").then(function (data) {
  allData = data;
  const salaryMin = d3.min(allData, function (d) {return parseInt(d["ConvertedSalary"])});
  const salaryMax = d3.max(allData, function (d) {return parseInt(d["ConvertedSalary"])});

  var svg = d3.select(".line-graph")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  const salaryScale = d3.scaleLinear()
    // .exponent(.2)
    .domain([200000, 20000])
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
    .curve(d3.curveMonotoneX);

  update("Female", "Master", "Full-stack developer");

  d3.selectAll(".line_input").on("change", function(){
    // console.log(d3.select("#qGender").property("value"));
    update(d3.select("#qGender").property("value"), d3.select("#qEdu").property("value"), d3.select("#qDev").property("value"));
  });
  
  function update(genderVal, eduVal, devVal){
    console.log(devVal);
    var genderVals = getAverageFor("Gender", genderVal, genderData, experienceArray);
    var eduVals = getAverageFor("FormalEducation", eduVal, eduData, experienceArray);
    var jobVals = getAverageFor("DevType", devVal, jobData, experienceArray);
    var youVals = [];
    var i=0;
    var sums;
    experienceArray.forEach(year => {
      sums = 0;
      sums = genderVals[i].value + eduVals[i].value + jobVals[i].value;
      var avg = sums/3;
      youVals.push({
        "key": year,
        'value': avg, 
      });
      i = i+1;
    });

    var allDataArrays = [[genderVals,'gray', '.15em', .3, "blue"], [eduVals, 'gray', '.15em', .3, "pink"], [jobVals, 'gray', '.15em', .3, "yellow"], [youVals, "#3b18b5", '.3em', 1, "#3b18b5"]];

    d3.selectAll("path.line").remove()
    
    allDataArrays.forEach(set => {
      addLine(set[0], svg, set[1], set[2], set[3], set[4])
    });

    function addLine(dataArray, svg, color, width, opacity, secondcolor){
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
        d3.select(this)
          .attr("opacity", "1")
          .attr("stroke", secondcolor);
      })
      .on("mouseout", function() { 
        d3.select(this).attr('stroke', color)
          .attr("opacity", opacity)
          .attr("stroke", color);
      });
    };

  };

  // append the axis to the svg

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
        var newval = add.value
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