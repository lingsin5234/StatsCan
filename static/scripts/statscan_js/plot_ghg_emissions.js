/*
*
*   plot_ghg_emissions.js
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

    vis.margin = {top: 70, right: 270, bottom: 70, left: 100};
    vis.height = vis.svgHeight - vis.margin.top - vis.margin.bottom;
    vis.width = vis.svgWidth - vis.margin.left - vis.margin.right;

    vis.colour = d3.scaleOrdinal()
        .range(['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33', '#a65628',
        '#f781bf', '#999999', '#990000', '#003366', '#028482', '#d4Af37', '#333333']);

    vis.svg = d3.select(vis.parentElement).append('svg')
        .attr('height', vis.svgHeight).attr('width', vis.svgWidth);

    vis.g = vis.svg.append('g')
        .attr('transform', 'translate(' + vis.margin.left + ' ' + vis.margin.top + ')');

    // X Axis
    vis.x = d3.scaleBand()
        .padding([0.05])
        .range([0, vis.width]);

    vis.xAxisCall = d3.axisBottom()
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
        .attr("transform", "translate(" + (vis.margin.left * 1.1) + " " + vis.margin.top/2 + ")");
    vis.sizes = ["small", "medium", "large"];
    vis.legend = vis.legendGroup.selectAll("g")
        .data(vis.GEO).enter();

    vis.legendBox = vis.legend.append("g")
        .attr("transform", function(d,i) {
            var str = "translate(" + vis.width + " " + (i*25 + 50) + ")"
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
        //.style("fill", "#FFF")
        .style("fill", "#222D8F")
        .attr("x", 15).attr("y", 10)
        .text(function(d) { return capitalizeFirstLetter(d); });

    // Create Tooltip
    vis.tooltip = d3.tip().attr('class', 'd3-tip').direction('e').offset([0,5])
        .html(function(d) {
            // get year, GEO and height (value)
            var thisYear = d.data.date
            var thisGEO = d.key;
            var GEOvalue = d.data[d.key];
            var barHeight = d[1] - d[0];
            // formulate content
            var content = "<span style='margin-left: 2.5px;'><b>" + thisGEO + " " + thisYear + "</b></span><br>";
            content +=`
                <table style="margin-top: 2.5px;">
                    <tr><td>` + d3.format(",.0f")(GEOvalue) + ` kilotonnes</td></tr>
                </table>
                `;
            return content;
        });
    vis.svg.call(vis.tooltip);

    vis.wrangleData();
}

// wrangle data
StackedBar.prototype.wrangleData = function() {
    var vis = this;

    vis.date1 = parseTime($("#dateLabel1").text());
    vis.date2 = parseTime($("#dateLabel2").text());

    // filter data -- use GRAND TOTAL for now
    sectorSelected = $('#sector-select').val()
    vis.data = ghgData.filter(function(d) {
        return d.Sector == sectorSelected;
    })

    // unit of measure
    vis.uom = vis.data[0]['UOM']
    //console.log(vis.uom);

    // grab all keys: non-zero GEOs
    vis.keys = [];
    for (row in vis.data) {
        //console.log(vis.data[row]);
        for (key in vis.data[row]) {
            // skip date, UOM, sector; skip zeros; skip keys (GEOs) that have already been added.
            if (!['date', 'UOM', 'Sector', 'total'].includes(key) && vis.data[row][key] != 0 && !vis.keys.includes(key)) {
                vis.keys.push(key);
            }
        }
        if (vis.keys.length >= 14) { break; }
    }
    //console.log('GEOs', vis.keys);
    vis.data.forEach(function(d){
        d.total = 0;
        vis.keys.forEach(function(k){
            d.total += d[k];
        })
    });
    // console.log('VIS.DATA', vis.data);

    vis.updateVis();
}

// update visualization
StackedBar.prototype.updateVis = function() {
    var vis = this;

    // Set Domains and Axes
    vis.x.domain(vis.data.map(function(d) { return d.date; }))
    vis.y.domain([0, d3.max(vis.data, function(d) { return d.total; }) * 1.005]).nice();
    vis.colour.domain(vis.GEO);

    vis.xAxisCall.scale(vis.x)
        .tickValues(vis.x.domain().filter(function(d,i){
            // one shown tick per 5 ticks
            return !(i%5)
        }));;
    vis.yAxisCall.scale(vis.y);
    vis.xAxis.transition(transTime).call(vis.xAxisCall);
    vis.yAxis.transition(transTime).call(vis.yAxisCall);
    vis.xAxis.selectAll("text").attr("font-size", "15px");
    vis.yAxis.selectAll("text").attr("font-size", "15px");

    // Remove all existing Axes names
    vis.g.selectAll(".axis-text").remove();

    // Set Axes Names
    vis.g.append("g")
        .attr("transform", "translate(" + (vis.width/2 - vis.margin.left/2) + " " + (vis.height + vis.margin.bottom/4*3) + ")")
        .append("text")
            .attr("class", "axis-text x-axis")
            .attr("font-size", "20px")
            //.style("fill", "#FFF")
            .style("fill", "#222D8F")
            .text("Year");
    vis.g.append("g")
        .attr("class", "axis-text y-axis")
        .attr("transform", "translate(" + (-vis.margin.left + 15) + " " + vis.height/2 + ")")
        .append("text")
            .attr("class", "axis x-axis")
            .attr("transform", "rotate(-90)")
            .attr("font-size", "20px")
            //.style("fill", "#FFF")
            .style("fill", "#222D8F")
            .text(vis.uom);

    // Set Title
    vis.g.append("g")
        .attr("transform", "translate(" + (vis.width/4 - vis.margin.left) + " " + -25 + ")")
        .append("text")
            .attr("class", "axis-text title")
            .attr("font-size", "30px")
            //.style("fill", "#FFF")
            .style("fill", "#222D8F")
            .text('Total GreenHouse Gas Emissions By Province')

    //stack the data? --> stack per subgroup
    vis.stackedData = d3.stack()
        .keys(vis.keys)
        (vis.data)
    //console.log(vis.stackedData);

    // if no data
    if (vis.stackedData.length == 0) {
        vis.g.append("g")
            .attr("transform", "translate(" + (vis.width/2 - vis.margin.left) + " " + vis.height/2 + ")")
            .append("text")
                .attr("class", "no-data")
                .attr("font-size", "30px")
                //.style("fill", "#FFF")
                .style("fill", "#222D8F")
                .text('NO DATA');
    } else {
        vis.g.selectAll(".no-data").remove();
    }

    //add the key (GEO) back in to the data set too
    vis.stackedData.forEach((d,i) => {
        vis.stackedData[i].forEach((D,I) => {
            vis.stackedData[i][I]['key'] = d.key;
        })
    })

    vis.barChart = vis.g.append("g")
        .attr("class", "bar-chart");

    // remove ALL bars
    d3.select(".bar-chart").selectAll(".bar").remove()

    vis.bars = d3.select(".bar-chart").selectAll(".bar")
        .data(vis.stackedData.flat(), d => d.key)

    // exit individual bars
    //vis.bars.exit().remove();

    // enter individual bars
    vis.barEnter = vis.bars.enter().append("g")
        .attr("class", "bar")
        .append("rect")
            .attr("fill", function(d) {
                return vis.colour(d.key);
            })
            .attr("x", function(d) {
                return vis.x(d.data.date);
            })
            .attr("y", function(d) {
                return vis.height;
            })
            .attr("height", 0) /*function(d) {
                return vis.y(d[0]);
            })*/
            .attr("width", 20)
            // tooltip
            .on("mouseover", function(d, i) { vis.tooltip.show(d, this); })
            .on("mouseout", function(d, i) { vis.tooltip.hide(d, this); });

    vis.barEnter.merge(vis.bars);

    vis.barEnter.transition().duration(1000)
        //.attr('class', d => d.key)
        .attr("fill", d => vis.colour(d.key))
        .attr("x", d => vis.x(d.data.date))
        //.attr("width", d => 20)
        .attr("y", d => vis.y(d[1]))
        .attr("height", d => vis.y(d[0]) - vis.y(d[1]))
}
