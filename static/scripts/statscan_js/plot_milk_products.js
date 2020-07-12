/*
*
*   plot_milk_products.js
*   Economics Data Project
*
*/

// constructor function
StackedArea = function(_parentElement, _svgHeight, _svgWidth, _Commodity) {
    this.parentElement = _parentElement;
    this.svgHeight = _svgHeight;
    this.svgWidth = _svgWidth;
    this.Commodity = _Commodity;

    this.initVis();
}

// initialize
StackedArea.prototype.initVis = function() {
    var vis = this;

    vis.margin = {top: 80, right: 70, bottom: 30, left: 70};
    vis.height = vis.svgHeight - vis.margin.top - vis.margin.bottom;
    vis.width = vis.svgWidth - vis.margin.left - vis.margin.right;

    vis.colour = d3.scaleOrdinal(d3.schemePastel1);

    vis.svg = d3.select(vis.parentElement).append('svg')
        .attr('height', vis.svgHeight).attr('width', vis.svgWidth);

    vis.g = vis.svg.append('g')
        .attr('transform', 'translate(' + vis.margin.left + ' ' + vis.margin.top + ')');

    // X Axis
    vis.x = d3.scaleTime()
        .range([0, vis.width]);

    vis.xAxisCall = d3.axisBottom().ticks(5);
    vis.xAxis = vis.g.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(' + 0 + ' ' + vis.height + ')');

    // Y Axis
    vis.y = d3.scaleLinear()
        .range([vis.height, 0]);

    vis.yAxisCall = d3.axisLeft();
    vis.yAxis = vis.g.append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate(0 0)');

    // Stack - set the keys here.
    vis.stack = d3.stack()
        .keys(vis.Commodity);

    // Add Legend
    vis.legendGroup = vis.svg.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(" + (vis.margin.left * 2) + " " + vis.margin.top/2 + ")");
    vis.sizes = ["small", "medium", "large"];
    vis.legend = vis.legendGroup.selectAll("g")
        .data(vis.Commodity).enter();

    vis.legendBox = vis.legend.append("g")
        .attr("transform", function(d,i) {
            var str = "translate(" + (i*200 + 25) + " 0)"
            return str;
        });
    vis.legendBox.append("rect")
        //.attr("stroke", "#000")
        //.attr("stroke-width", "2px")
        .attr("height", 20).attr("width", 20)
        .attr("fill", function(d) { return vis.colour(d); });

    vis.legendBox.append("text")
        .attr("text-anchor", "start")
        .attr("font-size", "20px")
        .attr("x", 25).attr("y", 18)
        .text(function(d) { return capitalizeFirstLetter(d); });


    vis.wrangleData();
}

// wrangle data
StackedArea.prototype.wrangleData = function() {
    var vis = this;

    vis.date1 = parseTime($("#dateLabel1").text());
    vis.date2 = parseTime($("#dateLabel2").text());
    //vis.yVariable = $("#var-select-proj4").val();
    //console.log(vis.date1, vis.date2, vis.yVariable)

    // filter the dates, then map with date as key along with the variable value from all 4 teams
    vis.data = d3.nest()
        .key(function(d){ return formatTime(d.date); })
        .entries(productData.filter(function(d) {
            console.log(formatTime(d.date), vis.date1, vis.date2)
            return (d.date >= vis.date1 && d.date <= vis.date2);
        }))
        /*.map(function(d) {
            return d.values.reduce(function(accumulator, current){
                accumulator.date = d.key
                // for EACH fo the teams, add the yVariable
                accumulator[current.Commodity] = accumulator[current.Commodity]
                return accumulator;
            }, {
                // pass these to the function so that we only worry about "TEAMS" and not all variables
                "northeast": 0,
                "midwest": 0,
                "south": 0,
                "west": 0
            })
        })*/
    //console.log(allCalls);
    console.log(vis.data);

    vis.updateVis();
}

// update visualization
StackedArea.prototype.updateVis = function() {
    var vis = this;

    // Set Domains and Axes
    vis.x.domain(d3.extent(vis.data, function(d) { return parseTime(d.date); }));
    vis.y.domain([0, d3.max(vis.data, function(d) {
        // get arrays of totals -- excluding "date"
        var vals = d3.keys(d).map(function(key) { return key !== 'date' ? d[key] : 0  })
        //console.log(vals);
        // then add them up, and d3.max will find the max
        return d3.sum(vals);
    }) * 1.005]);

    vis.xAxisCall.scale(vis.x);
    vis.yAxisCall.scale(vis.y);
    vis.xAxis.transition(transTime).call(vis.xAxisCall);
    vis.yAxis.transition(transTime).call(vis.yAxisCall);
    vis.xAxis.selectAll("text").attr("font-size", "15px");
    vis.yAxis.selectAll("text").attr("font-size", "15px");

    // Area
    vis.area = d3.area()
        .x(function(d) { return vis.x(parseTime(d.data.date)); })
        .y0(function(d) { return vis.y(d[0]); })
        .y1(function(d) { return vis.y(d[1]); });

    // use the vis.stack to sort data by the teams (keys)
    vis.teams = vis.g.selectAll(".team")
        .data(vis.stack(vis.data));

    // Update the path for each team
    vis.teams.select(".area")
        .attr("d", vis.area)

    //console.log(vis.area);
    // append each group (path area) for each team
    vis.teams.enter().append("g")
        .attr("class", function(d){ return "team " + d.key })
        .append("path")
            .attr("class", "area")
            .attr("d", vis.area)
            .style("fill", function(d){
                return vis.colour(d.key)
            })
            .style("fill-opacity", 0.9)
}
