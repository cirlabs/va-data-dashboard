var isUNDEFINED = function(val){
    if(typeof val === "undefined")
        return true;
    return false;
};
var cir = {
    chartz: {
        utils: {
            getIEVersion: function(){
               var rv = -1; // Return value assumes failure.
               if (navigator.appName == 'Microsoft Internet Explorer'){
                  var ua = navigator.userAgent;
                  var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
                  if (re.exec(ua) != null)
                     rv = parseFloat( RegExp.$1 );
               }
               return rv;
            },
            ADD_COMMAS: function(value){
                nStr = value.toString() + '';
                x = nStr.split('.');
                x1 = x[0];
                x2 = x.length > 1 ? '.' + x[1] : '';
                var rgx = /(\d+)(\d{3})/;
                while (rgx.test(x1)) {
                    x1 = x1.replace(rgx, '$1' + ',' + '$2');
                }
                return x1 + x2;
            },
            KEYCOERCION: function(value){if(!isNaN(parseInt(value))){return parseInt(value);}else{return value;}},
            KEY: function(entry) { return cir.chartz.utils.KEYCOERCION(d3.keys(entry)[0]); },//how I should get ahold of the entry's id 
            VAL: function(entry) {
                //IE8 crap
                try{return entry[d3.keys(entry)[0]];}catch(err){return -1;}
            },//how I should get ahold of the entry's data
            comparator: function(a, b) {
                return cir.chartz.utils.VAL(b) - cir.chartz.utils.VAL(a);
            },
            mapColorDomain: function(data, options){
                var retVal = [];
                data.forEach(function(d){
                    retVal.push(options.KEY(d));
                });
                return retVal;
            },
            getOptions: function(opts){
                /* get some default options if they don't exist */
                var options;
                if(typeof opts === "undefined"){
                    options = {};
                }else { 
                    options = opts;
                }

                /* set some accessors if they exist */
                options.KEY = !isUNDEFINED(options.key) ? options.key : cir.chartz.utils.KEY;
                options.VAL = !isUNDEFINED(options.value) ? options.value : cir.chartz.utils.VAL;
                options.invert = !isUNDEFINED(options.invert) ? options.invert : false;
                return options;
            },
            getYAxis: function(svg, scale, options){
                var options = cir.chartz.utils.getOptions(options);
                var yAxis = d3.svg.axis()
                    .scale(scale)
                    .orient(options.orientation || "right")
                    .tickFormat(options.tickFormat || d3.format(",.0f"))

                svg.append("g")
                    .attr('transform', options.transform || "translate(0,0)")
                    .attr("class", "y-axis")
                    .call(yAxis)
                    .append("text")
                    .attr('transform', options.textTransform || "rotate(-90)")
                    .attr('y', options.y || 33)
                    .attr('dy', options.dy || ".71em")
                    .style("text-anchor", "end")
                    .text(options.text || "");
                return yAxis;
            },
            getXAxis: function(svg, scale, height, options){
                var formatTime = d3.time.format("%m/%Y");
                var format = function(d) { return formatTime(new Date(d)); };
                var xAxis = d3.svg.axis()
                .scale(scale)
                .orient("bottom")
                .tickFormat(format);

                svg.append("g")
                .attr("class", "x-axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis)
                .selectAll("text")  
                .attr('class', 'x-axis-text')
                .style("text-anchor", "end")
                .style('font-size', "75%")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", function(d) {
                    return "rotate(-25)" 
                    });

                return xAxis; 
            },
            getLinearDimensions: function(container, data, options){
                var minY = !isUNDEFINED(options.minY) ? options.minY : d3.min(data, options.invert === false ? options.VAL : options.KEY);
                var maxY = !isUNDEFINED(options.maxY) ? options.maxY : d3.max(data, options.invert === false ? options.VAL : options.KEY);
                var minX = !isUNDEFINED(options.minX) ? options.minX : d3.min(data, options.invert === false ? options.KEY : options.VAL);
                var maxX = !isUNDEFINED(options.maxX) ? options.maxX : d3.max(data, options.invert === false ? options.KEY : options.VAL);
                var y0 = Math.max(-d3.min(data, options.VAL), d3.max(data, options.VAL));


                options.top = !isUNDEFINED(options.top) ? options.top : 20;
                options.right = !isUNDEFINED(options.right) ? options.right : 20;
                options.bottom = !isUNDEFINED(options.bottom) ? options.bottom : 30;
                options.left = !isUNDEFINED(options.left) ? options.left : 20;
                options.barPadding = !isUNDEFINED(options.barPadding) ? options.barPadding : 0;

                var WIDTH = !isUNDEFINED(options.width) ? options.width : container.width() - options.right - options.left,
                    HEIGHT = !isUNDEFINED(options.height) ? options.height :  container.height() - options.top - options.bottom,
                    XX = d3.scale.linear()
                        .domain([minX, maxX])
                        .range([options.left, WIDTH])
                        .nice(),
                    YY = d3.scale.linear()
                        .domain([minY, maxY])
                        .range([0, HEIGHT])
                        .nice();
                var height = {
                    'false': function(d){
                        return YY(options.VAL(d));},
                    'true': function(d){
                        var val = Math.abs(YY(options.VAL(d)) - YY(0));
                        return val;}
                };
                var yPos = {
                    'false': function(d){return options.top + (HEIGHT - YY(options.VAL(d)));},
                    'true': function(d){
                        var yp = options.VAL(d) < 0 ? YY(0) : YY(0) - height[true](d);
                        return yp;}
                };

                var retval = {
                    'zero': y0,
                    'yPosition': yPos[(d3.min(data, options.VAL) < 0).toString()],
                    'heightScaler': height[(d3.min(data, options.VAL) < 0).toString()],
                    'maxY': maxY,
                    'minY': minY,
                    'minX': minX,
                    'maxX': maxX,
                    'width': WIDTH,
                    'height': HEIGHT,
                    'top': options.top,
                    'right': options.right,
                    'bottom': options.bottom,
                    'left': options.left,
                    'xscale': XX,
                    'yscale': YY,
                    'barPadding': options.barPadding
                };

                return retval;
            },
            getRadialArea: function(value){
                return Math.sqrt(value/Math.PI);
            },
            getRadialDimensions: function(container, data, options){
                options.top = !isUNDEFINED(options.top) ? options.top : 20;
                options.right = !isUNDEFINED(options.right) ? options.right : 20;
                options.bottom = !isUNDEFINED(options.bottom) ? options.bottom : 30;
                options.left = !isUNDEFINED(options.left) ? options.left : 20;


                var WIDTH = !isUNDEFINED(options.width) ? options.width : container.width() - options.right - options.left,
                    HEIGHT = !isUNDEFINED(options.height) ? options.height :  container.height() - options.top - options.bottom;

                var maxCircleDiameter = WIDTH / data.length;

                options.minRange = !isUNDEFINED(options.minRange) ? options.minRange : 5;
                options.maxRange = !isUNDEFINED(options.maxRange) ? options.maxRange : (maxCircleDiameter/2) - options.top;

                var minSize = !isUNDEFINED(options.minSize) ? options.minSize : cir.chartz.utils.getRadialArea(d3.min(data, options.VAL));
                var maxSize = !isUNDEFINED(options.maxSize) ? options.maxSize : cir.chartz.utils.getRadialArea(d3.max(data, options.VAL));

                var scale = d3.scale.linear()
                .domain([minSize, maxSize])
                .range([options.minRange, options.maxRange]);


                var retval = {
                    'scale' : scale,
                    'maxSize': maxSize,
                    'minSize': minSize,
                    'width': WIDTH,
                    'height': HEIGHT,
                    'top': options.top,
                    'right': options.right,
                    'bottom': options.bottom,
                    'left': options.left,
                    'minRange': options.minRange,
                    'maxRange': options.maxRange,
                    'maxCircleDiameter': maxCircleDiameter
                }
                return retval;
            }
        },
        bar: function(container, data, opts){
            var options = cir.chartz.utils.getOptions(opts);
            var dim = cir.chartz.utils.getLinearDimensions($(container), data, options);
            var colWidth = (dim.width / data.length) - dim.barPadding;
            var colSpace = dim.width / data.length;
            var colCenterOffset = dim.barPadding / 2;

            var paper = Raphael($(container).get(0), $(container).width(), $(container).height());

            tBars = [];
            data.forEach(function(val, i){
                var ht = dim.heightScaler(val);
                var topLeftY = dim.yPosition(val);
                var tBar = paper.rect(dim.left + colCenterOffset + (colSpace * i), topLeftY, colWidth, ht)
                .attr('fill', '#98abc5');
                tBar.data('key', options.KEY(val));
                tBar.data('value', options.VAL(val));
                tBars.push(tBar);
            });
            paper.bars = tBars;
            paper.dimensions = dim;
            return paper;
        },
        column: function(container, data, opts){
            var options = cir.chartz.utils.getOptions(opts);
            var dim = cir.chartz.utils.getLinearDimensions($(container), data, options);

            var colHeight = dim.height / data.length;
            var paper = Raphael($(container).get(0), $(container).width(), $(container).height());

            tBars = [];
            data.forEach(function(val, i){
                var width = dim.xscale(options.VAL(val));
                var tBar = paper.rect(dim.left, (dim.top + (colHeight * i)), width, colHeight)
                .attr('fill', '#98abc5');
                tBar.data('key', options.KEY(val));
                tBar.data('value', options.VAL(val));
                tBars.push(tBar);
            });
            paper.bars = tBars;
            paper.dimensions = dim;
            return paper;
        },
        d3column: function(container, data, opts){
            var options = cir.chartz.utils.getOptions(opts);
            var dim = cir.chartz.utils.getLinearDimensions($(container), data, options);

            var colHeight = dim.height / data.length;
            var colWidth = (dim.height / data.length) - dim.barPadding;
            var colSpace = dim.height / data.length;

            var colCenterOffset = dim.barPadding / 2;

            var w = dim.width + dim.left + dim.right;
            var h = dim.height + dim.top + dim.bottom;

            var svg = d3.select(container)
                        .append("svg")
                        .attr("width", w)
                        .attr("height", h);

            svg.append('g').attr('class', 'bars').selectAll("rect")
               .data(data, function(d, i){
                d.height = dim.yscale(options.VAL(d));
                d.width = colWidth;
                if(options.dataRef !== undefined && options.dataRef.length == data.length)
                    d.obj = options.dataRef[i];
                return d;})
               .enter().append("g")
               .attr('class', 'bar')
               .append("rect")
               .attr("x", function(d, i){return dim.left;})
               .attr("y", function(d, i){
                return dim.top + (colHeight * i);})
               .attr("width", function(d){
                return dim.xscale(options.KEY(d));})
               .attr("height", function(d){
                return colHeight;})
               .style("fill", "#98abc5");

            return {'svg':svg, 'options': options, 'dimensions': dim};
        },
        representValuesColumn: function(container, data, opts){
            var options = cir.chartz.utils.getOptions(opts);
            var dim = cir.chartz.utils.getLinearDimensions($(container), data, options);

            var valueWidth = !isUNDEFINED(options.valueWidth) ? options.valueWidth : 5;
            var valueHeight = !isUNDEFINED(options.valueHeight) ? options.valueHeight : 5;
            var valueSpacing = !isUNDEFINED(options.valueSpacing) ? options.valueSpacing: 2;
            var valueColor = !isUNDEFINED(options.valueColor) ? options.valueColor : 'red';
            var valueBorderW = !isUNDEFINED(options.valueBorderW) ? options.valueBorderW : 2;
            var valuesPerElement = !isUNDEFINED(options.valuesPerElement) ? options.valuesPerElement : 50;

            var valueSpace = valueBorderW;

            var w = dim.width + dim.left + dim.right;
            var h = dim.height + dim.top + dim.bottom;
            var minNumElements = Math.floor(data / valuesPerElement);

            var eleHW = Math.floor(Math.sqrt(w*h/minNumElements));

            var elementsPerCol = Math.floor(w / eleHW);
            var elementsPerRow = Math.floor(h / eleHW);

            $('<style type="text/css"> '+container+' .table-column-ele{margin:.75px;border-radius:50%;display:inline-block;background-color:'+ valueColor+';width:'+(eleHW-valueSpace)+'px;height:'+(eleHW-valueSpace)+'px;}</style>"').appendTo("head");
            $('<style type="text/css"> '+container+' .table-row{width:'+w+'px;height:'+eleHW+'px;}</style>').appendTo("head");
            $('<style type="text/css"> '+container+' .table-container{width:'+w+'px;height:'+h+'px;}</style>').appendTo("head");
            var table = $('<div/>', {
                "class": "table-container"
            });
            var totalRow = 0;
            var totalCnt = 0;
            for(var i = 0; i < elementsPerRow; i++){
                var row = $('<div/>', {
                    "class": "table-row"
                });
                for(var x = 0; x < elementsPerCol; x++){
                    var column = $('<div/>', {
                        "class": "table-column-ele"
                    });
                    row.append(column);
                    totalCnt++;
                }
                table.append(row);
            }
            $(container).append(table);

            return {'table':table, 'options': options, 'dimensions': dim, 'actualBlocksPerElement': totalCnt};
        },
        d3bar: function(container, data, opts){
            var options = cir.chartz.utils.getOptions(opts);
            var dim = cir.chartz.utils.getLinearDimensions($(container), data, options);
            var colWidth = (dim.width / data.length) - dim.barPadding;
            var colSpace = dim.width / data.length;
            var colCenterOffset = dim.barPadding / 2;

            dim.columnSpace = colSpace;
            dim.columnWidth = colWidth;
            dim.columnCenterOffset = colCenterOffset;

            var colorKey = !isUNDEFINED(options.colorKey) ? options.colorKey : options.KEY;
            var colorDomain = !isUNDEFINED(options.colorDomain) ? options.colorDomain : cir.chartz.utils.mapColorDomain(data, options);
            var colorRange = !isUNDEFINED(options.colorRange) ? options.colorRange : colorbrewer.YlGnBu[3];
            var color = d3.scale.ordinal().range(colorRange).domain(colorDomain);


            var w = dim.width + dim.left + dim.right;
            var h = dim.height + dim.top + dim.bottom;

            var svg = d3.select(container)
                        .append("svg")
                        .attr("width", w)
                        .attr("height", h);

            dim.columnCalculator = function(idx){
                return this.left + this.columnCenterOffset + (this.columnSpace * idx);
            };

            svg.append('g').attr('class', 'bars')
               .selectAll("rect")
               .data(data)
               .enter().append("g")
               .attr('class', 'bar')
               .append("rect")
               .attr("y", function(d){return dim.yPosition(d);})
               .attr("x", function(d, i){return dim.columnCalculator(i);})
               .attr("width", colWidth)
               .attr("height", function(d){return dim.heightScaler(d);})
               .style("fill", function(d, i) { 
                    return color(colorKey(d)); })

            return {'svg':svg, 'options': options, 'dimensions': dim};
        },
        stackedBar: function(container, data, opts){
            /*
            data is expected to be a list of [{key: val}, ...]
            where val = [{stackkey: stackval}, {stackkey2: stackval2}, ...] and so on
            each {stackkey: stackval} is a new stack in the overall bar for the {key: val} obj
            */
            var options = cir.chartz.utils.getOptions(opts);
            iVal = options.VAL;
            barVal = function(entry){
                var sum = 0;
                iVal(entry).forEach(function(d){
                    sum += iVal(d);
                });
                return sum;
            };
            yz = [];
            data.forEach(function(d){
                yz.push(barVal(d));
            });
            options.minY = 3;
            options.maxY = d3.max(yz);
            options.top = 50;
            var dim = cir.chartz.utils.getLinearDimensions($(container), data, options);

            var colWidth = dim.width / data.length;
            var paper = Raphael($(container).get(0), $(container).width(), $(container).height());

            var colors = [];
            var colorOptions = !isUNDEFINED(options.colorOptions) ? options.colorOptions : colorbrewer.YlGnBu[iVal(data[0]).length]
            var color = d3.scale.ordinal().range(colorOptions);

            iVal(data[0]).forEach(function(val, i){
                colors.push(options.KEY(val));
            });
            color.domain(colors);

            tBars = [];
            data.forEach(function(val, i){
                var lastHeight = 0;
                var barHeight = dim.yscale(barVal(val));
                iVal(val).forEach(function(d){
                    var ht = dim.yscale(iVal(d));
                    var topLeftY = options.top + dim.height - lastHeight - ht;
                    lastHeight += ht;
                    var tBar = paper.rect(dim.left + (colWidth * i), topLeftY, colWidth, ht)
                    .attr('fill', color(options.KEY(d)));
                    tBar.data('key', [options.KEY(val), options.KEY(d)]);
                    tBar.data('value', iVal(d));
                    tBars.push(tBar);
                });
            });
            paper.bars = tBars;
            paper.dimensions = dim;

            return paper;
        },
        stackedColumn: function(container, data, opts){
            /*
            data is expected to be a list of [{key: val}, ...]
            where val = [{stackkey: stackval}, {stackkey2: stackval2}, ...] and so on
            each {stackkey: stackval} is a new stack in the overall bar for the {key: val} obj
            */
            var options = cir.chartz.utils.getOptions(opts);
            iVal = options.VAL;
            barVal = function(entry){
                var sum = 0;
                iVal(entry).forEach(function(d){
                    sum += iVal(d);
                });
                return sum;
            };
            yz = [];
            data.forEach(function(d){
                yz.push(barVal(d));
            });
            options.minX = 3;
            options.maxX = d3.max(yz);
            options.top = 50;
            var dim = cir.chartz.utils.getLinearDimensions($(container), data, options);

            var colHeight = dim.height / data.length;
            var paper = Raphael($(container).get(0), $(container).width(), $(container).height());

            var colors = [];
            var colorOptions = !isUNDEFINED(options.colorOptions) ? options.colorOptions : colorbrewer.YlGnBu[iVal(data[0]).length]
            var color = d3.scale.ordinal().range(colorOptions);

            iVal(data[0]).forEach(function(val, i){
                colors.push(options.KEY(val));
            });
            color.domain(colors);

            tBars = [];
            data.forEach(function(val, i){
                var lastWidth = 0;
                iVal(val).forEach(function(d){
                    var width = dim.xscale(iVal(d));
                    var tBar = paper.rect(dim.left + lastWidth, (dim.top + (colHeight * i)), width, colHeight)
                    .attr('fill', color(options.KEY(d)));
                    lastWidth += width;
                    tBar.data('key', [options.KEY(val), options.KEY(d)]);
                    tBar.data('value', iVal(d));
                    tBars.push(tBar);
                });
            });
            paper.bars = tBars;
            paper.dimensions = dim;

            return paper;
        },
        seriesCircles: function(container, data, opts){
            /* get a circle, data = [{key: value}, ...] */
            var options = cir.chartz.utils.getOptions(opts);
            if(isUNDEFINED(options.spacing))
                options.spacing = 20;
            var dim = cir.chartz.utils.getRadialDimensions($(container), data, options);

            var paper = Raphael($(container).get(0), $(container).width(), $(container).height());

            var circles = [];

            var colors = [];
            var colorOptions = !isUNDEFINED(options.colorOptions) ? options.colorOptions : colorbrewer.YlGnBu[data.length]
            var color = d3.scale.ordinal().range(colorOptions);

            data.forEach(function(val, i){
                colors.push(options.KEY(val));
            });
            color.domain(colors);

            var offset = options.left;
            var y = dim.height / 2;
            var x = options.left + (dim.maxCircleDiameter / 2);
            data.forEach(function(d, idx){
                var radius = dim.scale(cir.chartz.utils.getRadialArea(options.VAL(d)));
                var c = paper.circle(x, y, radius);
                x += dim.maxCircleDiameter;
                c.attr('fill', color(options.KEY(d)));
                offset += options.spacing + (dim.maxCircleDiameter * idx);
                c.data('key', options.KEY(d));
                c.data('value', options.VAL(d));
                circles.push(c);
            });
            paper.dimensions = dim;
            paper.circles = circles;
            return paper;
        },
        d3Force: function(container, data, opts){
            /* thanks to Jim http://vallandingham.me/bubble_charts_in_d3.html */
            var options = cir.chartz.utils.getOptions(opts);

            options.gravity = !isUNDEFINED(options.gravity) ? options.gravity : -0.01;
            options.charge = !isUNDEFINED(options.charge) ? options.charge : function(d){return -Math.pow(dim.scale(options.VAL(d)), 2.0);};
            options.friction = !isUNDEFINED(options.friction) ? options.friction : 0.9;
            options.damper = !isUNDEFINED(options.damper) ? options.damper : 0.1;

            var dim = cir.chartz.utils.getRadialDimensions($(container), data, options);
            //override scale
            dim.scale = d3.scale.pow().exponent(0.5)
            .domain([d3.min(data, options.VAL), d3.max(data, options.VAL)])
            .range([options.minRange, options.maxRange])

            var vis = d3.select(container).append("svg:svg")
                .attr("width", dim.width)
                .attr("height", dim.height);

            var nodes = data;

            var colorKey = !isUNDEFINED(options.colorKey) ? options.colorKey : options.KEY;
            var colorDomain = !isUNDEFINED(options.colorDomain) ? options.colorDomain : cir.chartz.utils.mapColorDomain(data, options);
            var colorRange = !isUNDEFINED(options.colorRange) ? options.colorRange : colorbrewer.YlGnBu[3];
            var color = d3.scale.ordinal().range(colorRange).domain(colorDomain);

            var center = {x: dim.width / 2, y: dim.height / 2};

            var force = d3.layout.force()
            .nodes(nodes)
            .size([dim.width, dim.height])
            .gravity(options.gravity)
            .charge(options.charge)
            .friction(options.friction)
            .start();

            var node = vis.selectAll("circle.node")
                .data(nodes)
              .enter().append("svg:circle")
                .attr("class", "node")
                .attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; })
                .attr("r", function(d){return dim.scale(options.VAL(d));})
                .attr("id", function(d){return options.KEY(d);})
                .style("fill", function(d, i) { 
                    return color(colorKey(d)); })
                .style("stroke", function(d, i) { return options.strokeColor || 'black'; })
                .style("stroke-width", 1.5)
                .call(force.drag);

            vis.style("opacity", 1e-6)
              .transition()
                .duration(1000)
                .style("opacity", options.fillOpacity || 1);

            force.on("tick", function(e) {
              var k = 6 * e.alpha;
              nodes.forEach(function(o, i) {
                o.x = o.x + (center.x - o.x) * (options.damper + 0.02) * k;
                o.y = o.y + (center.y - o.y) * (options.damper + 0.02) * k;
              });
              node.attr("cx", function(d) { return d.x; })
              .attr("cy", function(d) { return d.y; });
            });

            var retval = {
                'nodes': nodes,
                'node': node,
                'force': force,
                'options': options,
                'dimensions': dim,
                'center': center
            }
            return retval;
        },
        d3CirclePacking: function(container, data, opts){
            /* thanks d3 http://bl.ocks.org/4063530 */
            var options = cir.chartz.utils.getOptions(opts);
            options.minRange = 5;
            options.maxRange = 30;

            if(isUNDEFINED(options.spacing))
                options.spacing = 20;
            var dim = cir.chartz.utils.getRadialDimensions($(container), data, options);

            var diameter = dim.width,
            format = d3.format(",d");

            var pack = d3.layout.pack()
                .size([diameter - 4, diameter - 4])
                .value(function(d) { 
                    return options.VAL(d); });

            var comparator = function(a, b){return options.VAL(b) - options.VAL(a);};
            if(!isUNDEFINED(options.comparator))
                comparator = options.comparator;

            pack.sort(comparator);

            var svg = d3.select(container).append("svg")
                .attr("width", diameter)
                .attr("height", diameter)
            .append("g")
                .attr("transform", "translate(2,2)");

            var node = svg.datum(data).selectAll(".node")
              .data(pack.nodes)
            .enter().append("g")
              .attr("class", function(d) { return d.children ? "node" : "leaf node"; })
              .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

            node.append("circle")
              .attr("r", function(d) { return d.r; });

            var retval = {
                'nodes': node,
                'dimensions': dim
            }
            return retval;
        },
        concentricCircles: function(container, data, opts){
            /* get a circle, data = [[{key: value}, {key2: value2}], ...] */

            var options = cir.chartz.utils.getOptions(opts);
            var comparator = isUNDEFINED(options.comparator) ? cir.chartz.utils.comparator : options.comparator;
            iVal = options.VAL;
            minVal = function(entry){
                return d3.min(options.VAL(entry), iVal);
            };
            maxVal = function(entry){
                return d3.max(options.VAL(entry), iVal);
            };
            data.forEach(function(d){
                d = options.VAL(d).sort(comparator);
            });
            options.minSize = cir.chartz.utils.getRadialArea(d3.min(data, minVal));
            options.maxSize = cir.chartz.utils.getRadialArea(d3.max(data, maxVal));

            var colors = [];
            var colorOptions = !isUNDEFINED(options.colorOptions) ? options.colorOptions : colorbrewer.YlGnBu[iVal(data[0]).length]
            var color = d3.scale.ordinal().range(colorOptions);

            iVal(data[0]).forEach(function(val, i){
                colors.push(options.KEY(val));
            });
            color.domain(colors);

            if(isUNDEFINED(options.spacing))
                options.spacing = 20;

            var dim = cir.chartz.utils.getRadialDimensions($(container), data, options);

            var paper = Raphael($(container).get(0), $(container).width(), $(container).height());

            var circles = [];
            var offset = options.left;
            var y = dim.height / 2;
            var x = options.left + (dim.maxCircleDiameter / 2);

            data.forEach(function(d){
                var maxRadius = options.VAL(options.VAL(d)[0]);//biggest should be first
                options.VAL(d).forEach(function(z){
                    var radius = dim.scale(cir.chartz.utils.getRadialArea(options.VAL(z)));
                    var c = paper.circle(x, y, radius);
                    c.attr('fill', color(options.KEY(z)));
                    c.data('key', [options.KEY(d), options.KEY(z)]);
                    c.data('value', options.VAL(z));
                    circles.push(c);
                });
                x += dim.maxCircleDiameter;
                offset += options.spacing + (maxRadius * 2);
            });

            paper.dimensions = dim;
            paper.circles = circles;
            return paper;
        },
        lineChart: function(container, data, opts){
            var options = cir.chartz.utils.getOptions(opts);

            var oldKeyCoercion = options.KEYCOERCION;
            if(!(isUNDEFINED(options.keyCoercion)))
                options.KEYCOERCION = options.keyCoercion;//how to interpret keys

            var dim = cir.chartz.utils.getLinearDimensions($(container), data, options);

            var paper = Raphael($(container).get(0), $(container).width(), $(container).height());

            var comparator = function(a, b) {
                return options.KEY(a) - options.KEY(b);
            };

            data = data.sort(comparator);

            points = [];
            var xx = 0;
            var dots = paper.set();
            data.forEach(function(d){
                var x = dim.xscale(options.KEY(d)),
                    y = (dim.height + dim.top) - dim.yscale(options.VAL(d));
                points.push({x: x, y: y});
                var dot = paper.circle(x, y);
                    dot.data('key', options.KEY(d));
                    dot.data('value', options.VAL(d));
                dots.push(dot);
            });

            var line = paper.path(points.map(function(p, i) {
                    return [(i === 0) ? "M" : "L", p.x, ",", p.y].join("");
                }).join(","))
                .attr("fill", "none")
                .attr("stroke-width", 1.5)
                .attr("stroke", 'red');

            dots.attr("fill", 'black')
                .attr("stroke", "none")
                .attr("r", !isUNDEFINED(options.radius) ? options.radius : 3.5);

            dim.startXPos = dots[0].attr().cx;
            dim.endXPos = dots[dots.length -1].attr().cx;
            paper.dots = dots;
            paper.dimensions = dim;
            paper.line = line;

            options.KEYCOERCION = oldKeyCoercion;
            return paper;
        }
    }
};