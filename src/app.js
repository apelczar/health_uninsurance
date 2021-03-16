import {lineChart, lineChart2, barChart, legend} from './utils';
import {select, selectAll} from 'd3-selection';
import {csv, json} from 'd3-fetch';
import {scaleQuantize} from 'd3-scale';
import {schemeBlues} from 'd3-scale-chromatic';
import {geoPath} from 'd3-geo';
import {zoom, zoomIdentity, zoomTransform} from 'd3-zoom';
import {feature, mesh} from 'topojson';
import scrollama from 'scrollama';
import './main.css';

csv('./data/linechart_df.csv')
  .then(lineChart)
  .catch(e => {
    console.log(e);
  });

//Scrolling
var scroller = scrollama();

var scrolly = select('#scrolly');
var figure = scrolly.select('figure');
var article = scrolly.select('article');
var step = article.selectAll('.step');

function handleResize() {
  // update height of step elements
  var stepH = Math.floor(window.innerHeight * 0.75);
  step.style('height', `${stepH}px`);

  var figureHeight = window.innerHeight / 2;
  var figureMarginTop = (window.innerHeight - figureHeight) / 2;

  figure
    .style('height', figureHeight + 'px')
    .style('top', figureMarginTop + 'px');

  //tell scrollama to update new element dimensions
  scroller.resize();
}

// scrollama event handlers
function handleStepEnter(response) {
  // add color to current step only
  step.classed('is-active', function(d, i) {
    return i === response.index;
  });

  // update line chart highlight based on step
  let chartLines = selectAll('.noHighlight, .Highlight');
  chartLines.attr('class', null);
  chartLines.attr('class', function(d) {
    return d[0][`highlight${response.index + 1}`];
  });
}

function setupStickyfill() {
  selectAll('.sticky').each(function() {
    Stickyfill.add(this);
  });
}

function initScroll() {
  setupStickyfill();

  handleResize();
  scroller
    .setup({
      step: '#scrolly article .step',
      offset: 0.5,
      debug: false,
    })
    .onStepEnter(handleStepEnter);

  window.addEventListener('resize', handleResize);
}

initScroll();

//Interactive line chart
csv('./data/linechart_df.csv')
  .then(lineChart2)
  .catch(e => {
    console.log(e);
  });

//Map Legend
legend({
  color: scaleQuantize([0, 35], schemeBlues[7]),
  title: 'Uninsured Rate (%)',
});

//Map
const uninsuredDataUse = new Map();
const countyNames = new Map();

Promise.all([
  json('https://d3js.org/us-10m.v1.json'),
  csv('data/df_county.csv', function(d) {
    uninsuredDataUse.set(d.GEOID, d.percent_uninsured);
    countyNames.set(d.GEOID, d.NAME);
  }),
]).then(results => {
  const [result1, result2] = results;
  createMap(results);
});

function createMap(us) {
  const mapData = us[0];

  const mapWidth = 975;
  const mapHeight = 610;

  const mapContainer = select('#countyMap2');

  var path = geoPath();

  const colorScale = scaleQuantize([0, 35], schemeBlues[7]);
  const zoomFunc = zoom()
    .scaleExtent([1, 6])
    .extent([
      [0, 0],
      [mapWidth, mapHeight],
    ])
    .on('zoom', event => {
      svgMap.attr('transform', event.transform);
    });

  const svgMap = mapContainer
    .append('svg')
    .attr('viewBox', [0, 0, mapWidth, mapHeight])
    .on('click', resetMap)
    .call(zoomFunc);

  const counties = svgMap
    .append('g')
    .selectAll('path')
    .data(feature(mapData, mapData.objects.counties).features)
    .enter()
    .append('path')
    .attr('fill', d => colorScale(uninsuredDataUse.get(d.id)))
    .attr('d', path)
    .attr('class', 'counties')
    .attr('cursor', 'pointer')
    .on('click', clickedMap)
    .append('title')
    .text(d => `${countyNames.get(d.id)}: ${uninsuredDataUse.get(d.id)}%`);

  svgMap
    .append('path')
    .datum(
      mesh(mapData, mapData.objects.states, function(a, b) {
        return a !== b;
      }),
    )
    .attr('class', 'states')
    .attr('d', path);

  function resetMap() {
    counties.transition().style('fill', null);
    svgMap
      .transition()
      .duration(500)
      .call(
        zoomFunc.transform,
        zoomIdentity,
        zoomTransform(svgMap.node()).invert([mapWidth / 2, mapHeight / 2]),
      );
  }

  function clickedMap(event, d) {
    const [[x0, y0], [x1, y1]] = path.bounds(d);
    event.stopPropagation();
    svgMap
      .transition()
      .duration(750)
      .call(
        zoomFunc.transform,
        zoomIdentity
          .scale(
            Math.min(
              4,
              0.9 / Math.max((x1 - x0) / mapWidth, (y1 - y0) / mapHeight),
            ),
          )
          .translate(
            mapWidth / 2 - (x0 + x1) / 2,
            mapHeight / 2 - (y0 + y1) / 2,
          ),
      );
  }
}

// Bar charts at bottom
csv('./data/app_master_df.csv')
  .then(barChart)
  .catch(e => {
    console.log(e);
  });
