/*
*
*   plot_milk_products.js
*   Economics Data Project
*
*/

// constructor function
StackedBar = function(_parentElement, _svgHeight, _svgWidth, _GEO) {
    this.parentElement = _parentElement;
    this.svgHeight = _svgHeight;
    this.svgWidth = _svgWidth;
    this.GEO = _GEO;

    this.initVis();
}

// initialize
StackedBar.prototype.initVis = function() {
    var vis = this;

    vis.margin = {top: 70, right: 210, bottom: 70, left: 70};
    vis.height = vis.svgHeight - vis.margin.top - vis.margin.bottom;
    vis.width = vis.svgWidth - vis.margin.left - vis.margin.right;

    vis.colour = d3.scaleOrdinal(d3.schemeCategory10);

    vis.svg = d3.select(vis.parentElement).append('svg')
        .attr('height', vis.svgHeight).attr('width', vis.svgWidth);

    vis.g = vis.svg.append('g')
        .attr('transform', 'translate(' + vis.margin.left + ' ' + vis.margin.top + ')');

    // X Axis
    vis.x = d3.scaleTime()
        //.padding([0.01])
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

    // Add Legend
    vis.legendGroup = vis.svg.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(" + (vis.margin.left * 1.5) + " " + vis.margin.top/2 + ")");
    vis.sizes = ["small", "medium", "large"];
    vis.legend = vis.legendGroup.selectAll("g")
        .data(vis.GEO).enter();

    vis.legendBox = vis.legend.append("g")
        .attr("transform", function(d,i) {
            var str = "translate(" + vis.width + " " + (i*50 + 50) + ")"
            return str;
        });
    vis.legendBox.append("rect")
        //.attr("stroke", "#000")
        //.attr("stroke-width", "2px")
        .attr("height", 10).attr("width", 10)
        .attr("fill", function(d) { return vis.colour(d); });

    vis.legendBox.append("text")
        .attr("text-anchor", "start")
        .attr("font-size", "15px")
        .style("fill", "#222D8F")
        .attr("x", 15).attr("y", 10)
        .text(function(d) { return capitalizeFirstLetter(d); });


    vis.wrangleData();
}

// wrangle data
StackedBar.prototype.wrangleData = function() {
    var vis = this;

    vis.date1 = parseTime($("#dateLabel1").text());
    vis.date2 = parseTime($("#dateLabel2").text());
    vis.Commodity = selectedCommodity;

    // filter by date
    vis.data = selectedData2.filter(function(d) {
        //console.log('filter', d);
        return d.date >= 83020800000;
    });

    // unit of measure
    vis.uom = vis.data[0]['UOM']
    //console.log(vis.uom);

    // fix pre-processing
    vis.keys = [];
    for (key in vis.data[0]){
        if (key != "date" && key != "UOM")
        vis.keys.push(key);
    }
    //console.log('GEOs', vis.keys);
    vis.data.forEach(function(d){
        d.total = 0;
        vis.keys.forEach(function(k){
            d.total += d[k];
        })
    });
    //console.log('VIS.DATA', vis.data);

    vis.updateVis();
}

// update visualization
StackedBar.prototype.updateVis = function() {
    var vis = this;

    // Set Domains and Axes
    vis.x.domain([
        d3.min(vis.data, function(d) { return d3.timeDay.offset(d.date, -30); }),
        d3.max(vis.data, function(d) { return d3.timeDay.offset(d.date, 15); })
    ])
    vis.y.domain([0, d3.max(vis.data, function(d) { return d.total; }) * 1.005]).nice();
    vis.colour.domain(vis.keys);

    vis.xAxisCall.scale(vis.x);
    vis.yAxisCall.scale(vis.y);
    vis.xAxis.transition(transTime).call(vis.xAxisCall);
    vis.yAxis.transition(transTime).call(vis.yAxisCall);
    vis.xAxis.selectAll("text").attr("font-size", "15px");
    vis.yAxis.selectAll("text").attr("font-size", "15px");

    // Set Axes Names
    vis.g.append("g")
        .attr("transform", "translate(" + (vis.width/2 - vis.margin.left/2) + " " + (vis.height + vis.margin.bottom/4*3) + ")")
        .append("text")
            .attr("font-size", "20px")
            .style("fill", "#222D8F")
            .text("Date");
    vis.g.append("g")
        .attr("transform", "translate(" + (-vis.margin.left + 15) + " " + vis.height/2 + ")")
        .append("text")
            .attr("transform", "rotate(-90)")
            .attr("font-size", "20px")
            .style("fill", "#222D8F")
            .text(vis.uom);

    // Set Title
    vis.g.append("g")
        .attr("transform", "translate(" + (vis.width/2 - vis.margin.left) + " " + -25 + ")")
        .append("text")
            .attr("font-size", "30px")
            .style("fill", "#222D8F")
            .text(vis.Commodity)

    //stack the data? --> stack per subgroup
    vis.stackedData = d3.stack()
        .keys(vis.keys)
        (vis.data)
    //console.log('STACK', vis.stackedData);

    vis.g.append("g")
        .selectAll("g")
        .data(vis.stackedData)
        .enter().append("g")
            .attr("fill", function(d) { return vis.colour(d.key); })
            .selectAll("rect")
            .data(function(d) {
                //console.log('data', d);
                return d;
            })
            .enter().append("rect")
                .attr("x", function(d) {
                    //console.log(d3.timeDay.offset(d.data.date, -25))
                    return vis.x(d3.timeDay.offset(d.data.date, -15));
                })
                .attr("y", function(d) {
                    return vis.y(d[1]);
                })
                .attr("height", function(d) {
                    return vis.y(d[0]) - vis.y(d[1]);
                })
                .attr("width", function(d) {
                    return vis.x(d.data.date) - vis.x(d3.timeDay.offset(d.data.date, -25));
                });

}
