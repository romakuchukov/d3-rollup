import data from './data';

const height = 500;
const width = 1000;
const margin = { top: 20, right: 30, bottom: 30, left: 30 };

const x = d3
  .scaleLinear()
  .domain(d3.extent(data, d => d.year))
  .range([margin.left, width - margin.right]);

const y = d3
  .scaleLinear()
  .domain([0, d3.max(data, d => d.value+1)])
  .range([height - margin.bottom, margin.top]);

const line = d3.line()
  .curve(d3.curveBasis)
  .defined(d => !isNaN(d.value))
  .x(d => x(d.year))
  .y(d => y(d.value));

const bisect = mx => {
  const year = x.invert(mx);
  const index = d3.bisector(d => d.year).left(data, year, 1);
  const a = data[index - 1];
  const b = data[index];

  return b && (year - a.year > b.year - year) ? b : a;
}

const xAxis = g => g
  .attr('transform', `translate(0,${height - margin.bottom})`)
  .call(d3.axisBottom(x).tickFormat(x => !(x % 2) ? `Yr ${x}`:null).tickSize(0))
  .attr('transform', `translate(0,${height-margin.top})`)
  .call(g => g.select('.domain').remove())

const yAxis = g => g
  .attr('transform', `translate(${margin.left},0)`)
  .call(d3.axisLeft(y).ticks(d3.max(data, d => d.value+1), '$1f'))
  .attr('stroke-opacity', 0)
  .attr('transform', `translate(20,0)`)
  .call(g => g.select('.domain').remove())
  .call(
    g => g.select('.tick:last-of-type text')
      .clone()
      .attr('x', -height/2)
      .attr('y', -margin.left)
      .attr('transform', 'rotate(-90)')
      .classed('y-label', true)
      .text('Millions')
  ).call(
    g => g.selectAll('.tick line')
      .clone()
      .attr('x2', width - margin.right - margin.left)
      .attr('stroke-opacity', 0.1)
  );

const svg = d3.select('body')
  .append('div')
  .classed('svg', true)
  .append('svg')
  .attr('preserveAspectRatio', 'xMinYMin meet')
  .attr('viewBox', '0 0 400 490')
  .classed('responsive', true);

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

svg.node();

const dispatch = d3.dispatch('eventDropDownClose');

const eventHandler = (e = {}) => {

  const { value } = e.currentTarget || { value: '' };

  // console.log(value);

  if(!value.length) return;

  console.log(value, 'redraw line');
}

dispatch.on('eventDropDownClose', eventHandler);