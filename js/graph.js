var width = 960,
  height = 900,
  N = 20,
  edgeLength = 500;

var svg = d3
  .select("body")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

var force = d3.layout
  .force()
  //   .gravity(0.05)
  //   .distance(edgeLength)
  //   .charge(-100)
  .charge(-80)
  .linkDistance(edgeLength)
  .linkStrength(0.2)
  .size([width, height]);

var nodes = d3.range(0, N).map(function(i) {
  return {
    userID: i,
    in: 0,
    out: 0,
    name: "Name",
    S: "",
    I: "",
    R: "",
    D: ""
  };
});

var links = [
  { source: 0, target: 1 },
  { source: 1, target: 2 }
];

links = [];
for (let i = 0; i < N; i++) {
  for (let j = i + 1; j < N; j++) {
    links.push({ source: i, target: j });
  }
}

links.forEach(function(d, i) {
  nodes[d.source].out++;
  nodes[d.target].in++;
});

force
  .nodes(nodes)
  .links(links)
  .start();

var link = svg
  .selectAll(".link")
  .data(links)
  .enter()
  .append("line")
  .attr("class", "link");

var node = svg
  .selectAll(".node")
  .data(nodes)
  .enter()
  .append("g")
  .attr("class", "node")
  .call(force.drag);

node
  .append("image")
  .attr("xlink:href", "https://img.icons8.com/color/96/000000/coronavirus.png")
  .attr("x", -8)
  .attr("y", -8)
  .attr("width", 16)
  .attr("height", 16);

node
  .append("text")
  .attr("dx", 12)
  .attr("dy", ".35em")
  .text(function(d) {
    return d.name;
  });
node
  .append("text")
  .attr("dx", 12)
  .attr("dy", "1.35em")
  .text(function(d) {
    return d.S;
  });
node
  .append("text")
  .attr("dx", 12)
  .attr("dy", "2.35em")
  .text(function(d) {
    return d.I;
  });

node
  .append("text")
  .attr("dx", 12)
  .attr("dy", "3.35em")
  .text(function(d) {
    return d.R;
  });

node
  .append("text")
  .attr("dx", 12)
  .attr("dy", "4.35em")
  .text(function(d) {
    return d.D;
  });

force.on("tick", function() {
  link
    .attr("x1", function(d) {
      return d.source.x;
    })
    .attr("y1", function(d) {
      return d.source.y;
    })
    .attr("x2", function(d) {
      return d.target.x;
    })
    .attr("y2", function(d) {
      return d.target.y;
    });

  node.attr("transform", function(d) {
    return "translate(" + d.x + "," + d.y + ")";
  });
});
