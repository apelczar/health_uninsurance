import {select, pointer, create} from 'd3-selection';
import {scaleLinear, scaleBand, scaleTime} from 'd3-scale';
import {line} from 'd3-shape';
import {axisBottom, axisLeft} from 'd3-axis';
import {max, least, range} from 'd3-array';
import {transition} from 'd3-transition';
import {timeFormat} from 'd3-time-format';
import {scaleQuantize} from 'd3-scale';
import {schemeBlues} from 'd3-scale-chromatic';
import {format} from 'd3-format';


export function lineChart(data) {
  var lineMargin = {top: 10, right: 30, bottom: 30, left: 60};
  const lineWidth = 750 - lineMargin.left - lineMargin.right;
  const lineHeight = 300 - lineMargin.top - lineMargin.bottom;

  const lineGroups = data.reduce((acc, row) => {
    acc[row.NAME] = (acc[row.NAME] || []).concat(row);
    return acc;
  }, {});

  const lineData = Object.values(lineGroups);

  // append the svg object to the body of the page
  var svgLine = select("#lineChart")
  .append("svg")
    .attr("width", lineWidth + lineMargin.left + lineMargin.right)
    .attr("height", lineHeight + lineMargin.top + lineMargin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + lineMargin.left + "," + lineMargin.top + ")");
  
  const xAcc = d => new Date(d.time, 0, 1);
  const yAcc = d => Number(d.percent_uninsured);

  const xFormat = timeFormat("%Y")
  const x = scaleTime()
    .domain([new Date("2008-01-01"), new Date("2018-01-02")])
    .range([0, lineWidth])
  svgLine.append("g")
    .attr("transform", "translate(0," + lineHeight + ")")
    .call(axisBottom(x).tickFormat(xFormat));

  const yMax = max(data, function(d) {return Number(d.percent_uninsured)});
  const y = scaleLinear()
    .domain([0, yMax + 0.02]).nice()
    .range([lineHeight, 0 ]);
  svgLine.append("g")
    .call(axisLeft(y).ticks(5));

  const lineFunc = line()
    .x(d => x(xAcc(d)))
    .y(d => y(yAcc(d)));

  const path = svgLine.append("g")
    .attr("fill", "none")
    .attr("stroke", "#BBBBBB")
    .attr("stroke-width", "1.5px")
    .attr("class", "timeChart")
    .selectAll("path")
    .data(lineData)
    .join("path")
    .attr("d", d => lineFunc(d))
    .attr("class", function (d) {return d[0].highlight1})

  svgLine.append("g").attr("transform", `translate(-30, ${lineHeight/2})`)
    .append("text")
    .text("Uninsured Rate (%)")
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle");

}

export function lineChart2(data) {
  var lineMargin = {top: 10, right: 30, bottom: 30, left: 60};
  const lineWidth = 750 - lineMargin.left - lineMargin.right;
  const lineHeight = 300 - lineMargin.top - lineMargin.bottom;

  const lineGroups = data.reduce((acc, row) => {
    acc[row.NAME] = (acc[row.NAME] || []).concat(row);
    return acc;
  }, {});

  const lineData = Object.values(lineGroups);

  // append the svg object to the body of the page
  var svgLine2 = select("#lineChart2")
  .append("svg")
    .attr("width", lineWidth + lineMargin.left + lineMargin.right)
    .attr("height", lineHeight + lineMargin.top + lineMargin.bottom)
    .style("overflow", "visible")
    .attr("transform",
          "translate(" + lineMargin.left + "," + lineMargin.top + ")")
    .attr("class", "lineAlone");
  
  const xAcc = d => new Date(d.time, 0, 1);
  const yAcc = d => Number(d.percent_uninsured);

  const xFormat = timeFormat("%Y")
  const x = scaleTime()
    .domain([new Date("2008-01-01"), new Date("2018-01-02")])
    .range([0, lineWidth])
  svgLine2.append("g")
    .attr("transform", "translate(0," + lineHeight + ")")
    .call(axisBottom(x).tickFormat(xFormat));

  const yMax = max(data, function(d) {return Number(d.percent_uninsured)});
  const y = scaleLinear()
    .domain([0, yMax + 0.02]).nice()
    .range([lineHeight, 0 ]);
  svgLine2.append("g")
    .call(axisLeft(y).ticks(5));

  const lineFunc = line()
    .x(d => x(xAcc(d)))
    .y(d => y(yAcc(d)));

  const path = svgLine2.append("g")
    .attr("fill", "none")
    .attr("stroke", "#BBBBBB")
    .attr("stroke-width", "1.5px")
    //.attr("class", "timeChart")
    .selectAll("path")
    .data(lineData)
    .join("path")
    .attr("d", d => lineFunc(d))

  svgLine2.append("g").attr("transform", `translate(-30, ${lineHeight/2})`)
    .append("text")
    .text("Uninsured Rate (%)")
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle");

  svgLine2.call(hover, path)

  function hover(svgLine2, path) {

    svgLine2
        .on("mousemove", moved)
        .on("mouseenter", entered)
        .on("mouseleave", left);
  
    const dot = svgLine2.append("g")
        .attr("display", "none");
  
    dot.append("circle")
        .attr("r", 2.5);
  
    dot.append("text")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "middle")
        .attr("y", -8);

    function moved(event) {
      event.preventDefault();
      const pointerObj = pointer(event, this);
      const xm = x.invert(pointerObj[0]);
      const ym = y.invert(pointerObj[1]);
      const i = Number(xm.getFullYear()) - 2008;
      const s = least(lineData, d => Math.abs(d[i].percent_uninsured - ym));
      path.attr("stroke", d => d === s ? "#08306B" : "#ddd").filter(d => d === s).raise();
      dot.attr("transform", `translate(${x(xAcc(s[i]))},${y(s[i].percent_uninsured)})`);
      dot.select("text").text(s[0].NAME);
    }
  
    function entered() {
      path.style("mix-blend-mode", null).attr("stroke", "#ddd");
      dot.attr("display", null);
    }
  
    function left() {
      path.attr("stroke", null);
      dot.attr("display", "none");
    }
  }

}


export function barChart(data) {
  var barMargin = {top: 10, right: 30, bottom: 40, left: 60};
  const barWidth = 300 - barMargin.left - barMargin.right;
  const barHeight = 400 - barMargin.top - barMargin.bottom;

  const allStates = [...new Set(data.map(item => item.Location))];
  let stateShow = "United States";
  let useData = data.filter(x => x.Location === stateShow && x.detail != "Total");
  let dataTotals = data.filter(x => x.Location === stateShow && x.detail === "Total");

  //set chart size
  const height = barHeight + barMargin.top + barMargin.bottom;
  const width = barWidth + barMargin.left + barMargin.right;

  //create dropdown menu
  const dropdown = select("#demographics")
    .append("div")
    .attr("class", "stateMenu")
    .selectAll('.drop-down').data(['Select a location: ']).join('div').text(d => d);

  dropdown.append('select')
    .on('change', (event, row) => {
      stateShow = event.target.value;
      renderChart();
    })
    .selectAll('option')
    .data(dim => allStates.map(s => ({s, dim})))
    .join('option')
    .text(d => d.s);
  
  //set up chart container, svg, and text
  const chartContainer = select("#demographics")
    .append("div")
    .attr("class", "barCharts");

  const svg = select(".barCharts")
    .append("svg")
    .attr("height", height)
    .attr("width", width*3)
    .append("g")
    .attr('transform', `translate(${barMargin.left}, ${barMargin.top})`);

  // var x = scaleBand()
  //   .range([0, barWidth])
  //   .domain(useData.map(function(d) {return d.detail}));

  const raceData = useData.filter(x => x.category === "Race");
  var raceScale = scaleBand()
    .range([0, barWidth])
    .domain(raceData.map(function(d) {return d.detail}));
  
  const incomeData = useData.filter(x => x.category === "Income");
  var incomeScale = scaleBand()
    .range([0, barWidth])
    .domain(incomeData.map(function(d) {return d.detail}));
  
  const ageData = useData.filter(x => x.category === "Age");
  var ageScale = scaleBand()
    .range([0, barWidth])
    .domain(ageData.map(function(d) {return d.detail}));
  const scaleCats = {"Race": raceScale, "Income": incomeScale, "Age": ageScale}
  
  const yMax = max(data, function(d) {return Number(d.percent_uninsured)});
  var y = scaleLinear()
    .range([barHeight, 0])
    .domain([0, Number(yMax) + 2.8]);
  
  svg.append("text").attr("x", width/3).attr("y", height - 20)
    .text("Race").attr("text-anchor", "middle")
  svg.append("text").attr("x", width + width/3).attr("y", height - 20)
    .text("Income*").attr("text-anchor", "middle")
  svg.append("text").attr("x", width*2 + width/3).attr("y", height - 20)
    .text("Age").attr("text-anchor", "middle")
  svg.append("g").attr("transform", `translate(-30, ${barHeight / 2})`)
    .append("text")
    .text("Uninsured Rate (%)")
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle");

  //Total text box
  const textBox = select(".barCharts")
    .append("text")
    .attr("class", "totalText");

  function renderChart() {
    const t = transition().duration(300);
    let dataTotals = data.filter(x => x.Location === stateShow && x.detail === "Total");
    let useData = data.filter(x => x.Location === stateShow && x.detail != "Total");
    //console.log(useData);
    const groups = useData.reduce((acc, row) => {
      acc[row.category] = (acc[row.category] || []).concat(row);
      return acc;
    }, {});

    //update text
    let overallUninsured = Number(dataTotals[0].percent_uninsured).toFixed(1)
    textBox.text(`In 2018, ${overallUninsured}% of ${stateShow} residents did not have health insurance.`);

    //update charts
    const container = svg.selectAll('g.container')
      .data(Object.values(groups))
      .join('g')
      .attr('class', 'container')
      .attr('transform', (d, idx) => {
        const xShift = (idx % 3) * width;
        return `translate(${xShift}, 0)`;
      });
    
    container.selectAll("rect")
      .data(d => d)
      .join(enter => enter.append('rect')
                          .attr('x', d => scaleCats[d['category']](d['detail']))
                          .attr("width", d => scaleCats[d['category']].bandwidth())
                          .attr("y", d => y(d['percent_uninsured']))
                          .attr("height", d => barHeight - y(d['percent_uninsured'])),
            update => update.call(el =>
                          el.transition(t)
                          .attr("x", d => scaleCats[d['category']](d['detail']))
                          .attr("width", d => scaleCats[d['category']].bandwidth())
                          .attr("y", d => y(d['percent_uninsured']))
                          .attr("height", d => barHeight - y(d['percent_uninsured']))))
      .attr("fill", "#08306B")
      .attr("stroke", "#f3f3f3");

  }
  renderChart();


  const container = svg.selectAll('g.container');

  container.append("g")
    .each(function(d) {
      let cat = d[0]["category"]
      select(this)
      .attr("transform", `translate(0, ${barHeight})`)
        .call(axisBottom(scaleCats[cat]))
    });

  container.append("g")
    .call(axisLeft(y));
}


export function legend({
  color,
  title,
  tickSize = 6,
  width = 320, 
  height = 44 + tickSize,
  marginTop = 18,
  marginRight = 0,
  marginBottom = 16 + tickSize,
  marginLeft = 0,
  ticks = width / 64,
  tickFormat,
  tickValues
} = {}) {

  //This function was created by Mike Bostock: https://observablehq.com/@d3/color-legend

  const svg = select("#mapLegend").append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .style("overflow", "visible")
      .style("display", "block");

  let tickAdjust = g => g.selectAll(".tick line").attr("y1", marginTop + marginBottom - height);
  let x;

    const thresholds
        = color.thresholds ? color.thresholds() // scaleQuantize
        : color.quantiles ? color.quantiles() // scaleQuantile
        : color.domain(); // scaleThreshold


    const thresholdFormat
        = tickFormat === undefined ? d => d
        : typeof tickFormat === "string" ? format(tickFormat)
        : tickFormat;

    x = scaleLinear()
        .domain([-1, color.range().length - 1])
        .rangeRound([marginLeft, width - marginRight]);

    svg.append("g")
      .selectAll("rect")
      .data(color.range())
      .join("rect")
        .attr("x", (d, i) => x(i - 1))
        .attr("y", marginTop)
        .attr("width", (d, i) => x(i) - x(i - 1))
        .attr("height", height - marginTop - marginBottom)
        .attr("fill", d => d);

    tickValues = range(thresholds.length);
    tickFormat = i => thresholdFormat(thresholds[i], i);
  

  svg.append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(axisBottom(x)
        .ticks(ticks, typeof tickFormat === "string" ? tickFormat : undefined)
        .tickFormat(typeof tickFormat === "function" ? tickFormat : undefined)
        .tickSize(tickSize)
        .tickValues(tickValues))
      .call(tickAdjust)
      .call(g => g.select(".domain").remove())
      .call(g => g.append("text")
        .attr("x", marginLeft)
        .attr("y", marginTop + marginBottom - height - 6)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .attr("class", "title")
        .text(title));

  return svg.node();
}