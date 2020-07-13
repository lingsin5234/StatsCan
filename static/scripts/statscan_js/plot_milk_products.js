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

    vis.margin = {top: 80, right: 70, bottom: 30, left: 70};
    vis.height = vis.svgHeight - vis.margin.top - vis.margin.bottom;
    vis.width = vis.svgWidth - vis.margin.left - vis.margin.right;

    vis.colour = d3.scaleOrdinal(d3.schemePastel1);

    vis.svg = d3.select(vis.parentElement).append('svg')
        .attr('height', vis.svgHeight).attr('width', vis.svgWidth);

    vis.g = vis.svg.append('g')
        .attr('transform', 'translate(' + vis.margin.left + ' ' + vis.margin.top + ')');

    // X Axis -- not scaleTime since we are not plotting continuous
    vis.x = d3.scaleBand()
        .padding([0.2])
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
        .keys(vis.GEO);

    // Add Legend
    vis.legendGroup = vis.svg.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(" + (vis.margin.left * 2) + " " + vis.margin.top/2 + ")");
    vis.sizes = ["small", "medium", "large"];
    vis.legend = vis.legendGroup.selectAll("g")
        .data(vis.GEO).enter();

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
StackedBar.prototype.wrangleData = function() {
    var vis = this;

    vis.date1 = parseTime($("#dateLabel1").text());
    vis.date2 = parseTime($("#dateLabel2").text());
    //vis.yVariable = $("#var-select-proj4").val();
    //console.log(vis.date1, vis.date2, vis.yVariable)

    // filter the dates, then map each GEO's value, as individual key-val pairs
    // due to the conversion between python to_json and formatTime, the date used is end of the month?!!?
    /*vis.data = {}
    vis.byDate = d3.nest()
        .key(function(d){ return formatTime(d.date); })
        .entries(selectedData.filter(function(d) {
            return d;
        }));
    for (var eachDate in vis.byDate) {
        //console.log(vis.byDate[eachDate].values);
        vis.data[vis.byDate[eachDate].key] = vis.byDate[eachDate].values.map(function(d) {
            //console.log(d)
            return {
                GEO: d.GEO,
                value: d.value
            };
        })
    }*/
    vis.data = selectedData2.filter(function(d) {
        //console.log('filter', d);
        return d.date <= 1083020800000;
    });
    console.log('json', vis.data);
    // fix pre-processing
    vis.keys = [];
    for (key in vis.data[0]){
        if (key != "date")
        vis.keys.push(key);
    }
    console.log('GEOs', vis.keys);
    vis.data.forEach(function(d){
        d.total = 0;
        vis.keys.forEach(function(k){
            d.total += d[k];
        })
    });
    /*vis.data.sort(function(a, b) {
        return b.total - a.total;
    });*/
    console.log('VIS.DATA', vis.data);

    // get dates
    /*vis.dates = Object.keys(vis.data);
    console.log(vis.dates);*/

    vis.updateVis();
}

// update visualization
StackedBar.prototype.updateVis = function() {
    var vis = this;

    // Set Domains and Axes
    vis.x.domain(vis.data.map(function(d) { return formatTime(d.date); }));
    vis.y.domain([0, d3.max(vis.data, function(d) { return d.total; }) * 1.005]).nice();
    vis.colour.domain(vis.keys);

    vis.xAxisCall.scale(vis.x);
    vis.yAxisCall.scale(vis.y);
    vis.xAxis.transition(transTime).call(vis.xAxisCall);
    vis.yAxis.transition(transTime).call(vis.yAxisCall);
    vis.xAxis.selectAll("text").attr("font-size", "15px");
    vis.yAxis.selectAll("text").attr("font-size", "15px");

    //stack the data? --> stack per subgroup
    vis.stackedData = d3.stack()
        .keys(vis.keys)
        (vis.data)
    console.log('STACK', vis.stackedData);

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
                    return vis.x(formatTime(d.data.date));
                })
                .attr("y", function(d) {
                    return vis.y(d[1]);
                })
                .attr("height", function(d) {
                    return vis.y(d[0]) - vis.y(d[1]);
                })
                .attr("width", vis.x.bandwidth())

    /*
    // Show the bars
    svg.append("g")
        .selectAll("g")
        // Enter in the stack data = loop key per key = group per group
        .data(vis.data)
        .enter().append("g")
        .attr("fill", function(d) { return color(d.data.GEO); })
        .selectAll("rect")
            // enter a second time = loop subgroup per subgroup to add all rectangles
            .data(function(d) { return d; })
            .enter().append("rect")
            .attr("x", function(d) { return x(d.data.group); })
            .attr("y", function(d) { return y(d[1]); })
            .attr("height", function(d) { return y(d[0]) - y(d[1]); })
            .attr("width",x.bandwidth())*/
}
