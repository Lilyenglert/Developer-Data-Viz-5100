// $("#slider").slider({
// 	value:2013,
// 	min: 2013,
// 	max: 2018,
// 	step: 1,
// 	slide: function( event, ui ) {
// 		$("#year").val(ui.value);
// 		redraw(ui.value.toString());
// 	}
// });
// $("#year").val($("#slider").slider("value") );

var w = 1200;
var h = 500;

var xy = d3.geo.equirectangular()
          .scale(1000);

var path = d3.geo.path()
    .projection(xy);

var svg = d3.select("#graph").insert("svg:svg")
	.attr("width", w)
        .attr("height", h);

var states = svg.append("svg:g")
    .attr("id", "states");

var circles = svg.append("svg:g")
    .attr("id", "circles");

var labels = svg.append("svg:g")
    .attr("id", "labels");


d3.json("world-countries.json").then(function (collection){
  console.log("real try")
  states.selectAll("path")
      .data(collection.features)
      .enter().append("svg:path")
      .attr("d", path)
      .on("mouseover", function(d) {
                d3.select(this).style("fill","#6C0")
                    .append("svg:title")
                    .text(d.properties.name);})
      .on("mouseout", function(d) {
        d3.select(this).style("fill","#ccc");})
// console.log("data:");
// console.log(collection.features);

var scalefactor=1./50. ;

var arr = {};
d3.csv("full_data.csv").then(function (data) {
  for(var i = 0; i < data.length; i++){
    var key = data[i].Country;
    if(arr[key] != undefined)
      arr[key]++;
    else
      arr[key] = 1;
  }


for (var i in arr){
      var locationData;
      var loc;
      var x,y;
      var country = i;

      circles
        .append("circle")
        .attr("cx",function(){
            if (i=="United States of America"){
              x = xy([-104.83147,39.45328])[0];
            return x;
          } 
          locationData = collection.features.filter( m =>m.properties.name == i );
          locationData = locationData.filter(function(e){
            loc = e.geometry.coordinates[0][0];
            return e.geometry !== undefined && e.geometry.coordinates !== undefined;
          })
          if(Boolean(loc) && Boolean(xy([loc[0],loc[1]])[0])){
            x = xy([loc[0],loc[1]])[0];

          }
          else if (Boolean(loc)&& Boolean(xy([loc[0][0],loc[0][1]])[0]))
            x = xy([loc[0][0],loc[0][1]])[0];
          return x;
        })
        .attr("cy",function(){
          if (i=="United States of America"){
          y = xy([-104.83147,39.45328])[1];
          return y;
        } 
       if(Boolean(loc) && Boolean(xy([loc[0],loc[1]])[1]))
            y = xy([loc[0],loc[1]])[1];
       else if (Boolean(loc)&& Boolean(xy([loc[0][0],loc[0][1]])[1]))
            y = xy([loc[0][0],loc[0][1]])[1];
          return y;
        })
        .attr("r",function(){
        if(arr[i] > 500)
          return arr[i]/100;
        return arr[i]/20;
      })
        .attr("id",""+i)
        .on("mouseover",function(d){
          // console.log(d3.select(this)[0][0].attributes[1]);
          // console.log(d3.select(this)[0][0].attributes[0]);
          console.log(this.id);
          var name = "" + this.id;
          console.log(name);
          // console.log(d3.select(this)[0]);
          var locX = this;
          var locY = this.attributes[1].nodeValue;
          // console.log(locX);
          // console.log(locY);

          // var x = xy([locX,locY])[0];
          //console.log(locX);
          if (name=="United States of America"){
            console.log("us:");
            console.log(arr[name]);
          }
          d3.select(this).style("opacity","0.4");  
          circles.append("text").attr("x",900).attr("y",400).text(""+name+":"+arr[name])
          .attr("fill","steelblue");
        })
        .on("mouseout",function(){
          d3.select(this).style("opacity","0.8");
          circles.select("text").remove();
        });

}

});

  // labels.selectAll("labels")
  //     .data(csv)
  //   .enter()
  //   .append("svg:text")
  //       .attr("x", function(d, i) { return xy([+d["longitude"],+d["latitude"]])[0]; })
  //       .attr("y", function(d, i) { return xy([+d["longitude"],+d["latitude"]])[1]; })
  //       .attr("dy", "0.3em")
  //       .attr("text-anchor", "middle")
  //       .text(function(d) { return Math.round(d["1990"]); });


});
function redraw(year){

}



