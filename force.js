// Tick and Drag code adapted from https://bl.ocks.org/heybignick/3faf257bbbbc7743bb72310d03b86ee8


var width = 1000;
var height = 600;
var svg = d3.select("#force").insert("svg:svg").attr("width",width).attr("height",height);


var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.name; }))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2));

const requestData = async() => {
 var edges = await d3.csv("stack_network_links.csv");
 var nodes = await d3.csv("stack_network_nodes.csv");

 const colorScale = d3.scaleOrdinal(d3.schemeSet1);

  var link = svg.append("g")
      .attr("class", "links")
    .selectAll("line")
    .data(edges)
    .enter().append("line")
      .attr("stroke-width", function(d) { return Math.sqrt(d.value); });

  var node = svg.append("g")
      .attr("class", "nodes")
    .selectAll("g")
    .data(nodes)
    .enter()
    .append("g");

  var circles = node.append("circle")
      .attr("r", function(d){
        var size = d.nodesize;
        if (size < 1000)
          return size/8;
        return size/2;
      })
      .attr("fill", function(d) { return colorScale(d.group) })
      .call(d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended));

  var lables = node.append("text")
      .text(function(d) {
        return d.name;
      })
      .attr('x', 7)
      .attr('y', 4);

  node.append("title")
      .text(function(d) { return d.name; });

  simulation
      .nodes(nodes)
      .on("tick", ticked);

  simulation.force("link")
      .links(edges);

  function ticked() {
    link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node
        .attr("transform", function(d) {
          return "translate(" + d.x + "," + d.y + ")";
        })

  }

};
requestData();

function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}
