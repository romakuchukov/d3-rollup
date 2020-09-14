import data from './data';

//https://stackoverflow.com/questions/16265123/resize-svg-when-window-is-resized-in-d3-js
// https://www.d3-graph-gallery.com/graph/line_basic.html
// https://developers.google.com/chart/interactive/docs/gallery/linechart
// d3.csv('./aapl.csv').then(data => {});

const height = 500;
const width = 1000;
const margin = { top: 20, right: 30, bottom: 30, left: 40 };

const x = d3.scaleUtc().domain(d3.extent(data, d => new Date(d.date))).range([margin.left, width - margin.right]);
const y = d3.scaleLinear().domain([0, d3.max(data, d => +d.value)]).nice().range([height - margin.bottom, margin.top]);

const formatValue = (value) => {
  return (+value).toLocaleString('en', {
    style: 'currency',
    currency: 'USD'
  });
};

const formatDate = (date) => {
  return date.toLocaleString('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  });
};

const popup = (g, value) => {
  if (!value) return g.style('display', 'none');

  g.style('display', null).style('pointer-events', 'none').style('font-size', '8px');

  const path = g.selectAll('path')
    .data([null])
    .join('path')
    .attr('fill', 'white')
    .attr('stroke', 'black');

  const text = g.selectAll('text')
    .data([null])
    .join('text')
    .call(text => text
      .selectAll('tspan')
      .data(value.trim().split(/\s(.+)/).filter(el => !!el))
      .join('tspan')
      .attr('x', 0)
      .attr('y', (d, i) => `${i * 1.1}em`)
      .style('font-weight', (_, i) => i ? null : 'bold')
      .text(d => d));

  const { x, y, width: w, height: h } = text.node().getBBox();

  text.attr('transform', `translate(${-w / 2},${15 - y})`);
  path.attr('d', `M${-w / 2 - 10},5H-5l5,-5l5,5H${w / 2 + 10}v${h + 20}h-${w + 20}z`);
}

const line = d3.line().curve(d3.curveStep).defined(d => !isNaN(+d.value)).x(d => x(new Date(d.date))).y(d => y(+d.value));

const bisect = mx => {
  const date = x.invert(mx);
  const index = d3.bisector(d => new Date(d.date)).left(data, date, 1);
  const a = data[index - 1];
  const b = data[index];

  return b && (date - new Date(a.date) > new Date(b.date) - date) ? b : a;
}

const xAxis = g => g
  .attr('transform', `translate(0,${height - margin.bottom})`)
  .style('font-family', 'monospace')
  .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0));

const yAxis = g => g
  .attr('transform', `translate(${margin.left},0)`)
  .style('font-family', 'monospace')
  .call(d3.axisLeft(y))
  .call(g => g.select('.domain').remove())
  .call(g => g.select('.tick:last-of-type text')
  .clone()
  .attr('x', 3)
  .style('text-anchor', 'start')
  .style('font-weight', 'bold')
  .text('$ Close'));

const svg = d3.select('body')
  .append('div')
  .classed('svg', true)
  .append('svg')
  .attr('preserveAspectRatio', 'xMinYMin meet')
  .attr('viewBox', '0 0 400 490')
  .classed('responsive', true)
  .style('-webkit-tap-highlight-color', 'transparent')
  .style('overflow', 'visible')
  .style('height', '100%')
  .style('width', '100%');

svg.append('g').call(xAxis);

svg.append('g').call(yAxis);

svg.append('path')
  .datum(data)
  .attr('fill', 'none')
  .attr('stroke', 'steelblue')
  .attr('stroke-width', 1.5)
  .attr('stroke-linejoin', 'round')
  .attr('stroke-linecap', 'round')
  .attr('d', line);

const tooltip = svg.append('g');

svg.on('touchmove mousemove', event => {
  const { date, value } = bisect(d3.pointer(event, event.currentTarget)[0]);
  tooltip.attr('transform', `translate(${x(new Date(date))},${y(value)})`).call(popup, `${formatValue(value)} ${formatDate(new Date(date))}`);
});

svg.node();

const dispatch = d3.dispatch('eventDropDownClose');

const eventHandler = (e) => {

  const { value } = e.currentTarget;

  if(!value.length) return;

  console.log(value);
  console.log('redraw line');
}

dispatch.on('eventDropDownClose', eventHandler);