var width = 300,
	height = 300,
	radius = Math.min(width, height) / 2;
	//color = d3.scale.category20c();

var vis = d3.select("#chart").append("svg").attr("width", width).attr("height", height).append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var partition = d3.layout.partition().sort(null).size([2 * Math.PI, radius * radius]).value(function(d) {
	return 1;
});

var arc = d3.svg.arc().startAngle(function(d) {
	return d.x;
}).endAngle(function(d) {
	return d.x + d.dx;
}).innerRadius(function(d) {
	return Math.sqrt(d.y);
}).outerRadius(function(d) {
	return Math.sqrt(d.y + d.dy);
});

d3.json("flare.json", function(json) {
	var path = vis.data([json]).selectAll("path").data(partition.nodes).enter().append("path")
	.attr("display", function(d) {
		if (d.depth == 1 || d.depth == 0 || d.key == "empty"){
			return "none"; // hide inner 2 rings
		} //return d.depth ? null : "none";
	}) 
	.attr("d", arc)
	.attr("fill-rule", "evenodd")
	.style("fill", function(d) {
		if (d.parent){
			return getcolor(d);
		}
	})	//return color((d.children ? d : d.parent).name);
	.attr("d", arc)
	.attr("stroke", function(d){
		if (d.parent){
			return getcolor(d);
		}
	})
	.each(stash);

	//labels
	var text = vis.data([json]).selectAll("text").data(partition.nodes).enter().append("text")
	.attr("transform", function(d) { return "rotate(" + (d.x + d.dx / 2 - Math.PI / 2) / Math.PI * 180 + ")"; })
    .attr("x", function(d) { return Math.sqrt(d.y); })
    .attr("dx", "6") // margin
    .attr("dy", ".35em") // vertical-align
	.text(function(d) { 
    	if (d.name){
    		return d.name; 
    	}
    })
    .style("fill", function(d){
		if (d.parent){
    		return getcolor(d);
    	}
    });

	startSize();

	d3.select("#size").on("click", function() {
		startSize();
	});

	d3.select("#count").on("click", function() {
		path.data(partition.value(function(d) {
			return 1;
		})).transition().duration(1500).attrTween("d", arcTween);

		d3.select("#size").classed("active", false);
		d3.select("#count").classed("active", true);
	});

	function startSize(){
		path.data(partition.value(function(d) {
			return d.size;
		})).transition().duration(1500).attrTween("d", arcTween);

		d3.select("#size").classed("active", true);
		d3.select("#count").classed("active", false);
	}
});

function getcolor(d){
	var parent = d.parent;
	var node = d;

	//SCHOOLS
	if (parent.key == "school" || node.key == "school"){
		return d3.rgb("#8b796d");
	}
	//WORK
	else if (node.key == "work"){
		return d3.rgb("#d95377");
	}
}

// Stash the old values for transition.


function stash(d) {
	d.x0 = d.x;
	d.dx0 = d.dx;
}

// Interpolate the arcs in data space.


function arcTween(a) {
	var i = d3.interpolate({
		x: a.x0,
		dx: a.dx0
	}, a);
	return function(t) {
		var b = i(t);
		a.x0 = b.x;
		a.dx0 = b.dx;
		return arc(b);
	};
}