import data from './average';
import average from './average';
import { transpose } from 'd3-array';

const height = 500;
const width = 1000;
const margin = { top: 20, right: 30, bottom: 30, left: 30 };
const { compColor, avgColor } = { compColor: '#375347', avgColor: '#000' };

const x = d3
  .scaleLinear()
  .domain(d3.extent(average, d => d.year))
  .range([margin.left, width - margin.right]);

const y = d3
  .scaleLinear()
  .domain([0, d3.max(average, d => d.value+1)])
  .range([height - margin.bottom, margin.top]);

const line = d3.line()
  .curve(d3.curveBasis)
  .defined(d => !isNaN(d.value))
  .x(d => x(d.year-0.1))
  .y(d => y(d.value));

const bisect = mx => {
  const year = x.invert(mx);
  const index = d3.bisector(d => d.year).left(average, year, 1);
  const a = average[index - 1];
  const b = average[index];

  return b && (year - a.year > b.year - year) ? b : a;
}

const xAxis = g => g
  .attr('transform', `translate(0,${height - margin.bottom})`)
  .call(d3.axisBottom(x).tickFormat(x => !(x % 2) ? `Yr ${x}`:null).tickSize(0))
  .attr('transform', `translate(0,${height-margin.top})`)
  .call(g => g.select('.domain').remove())

  const yAxis = g => g
  .attr('transform', `translate(${margin.left},0)`)
  .call(d3.axisLeft(y).ticks(d3.max(average, d => d.value+1), '$1f'))
  .attr('stroke-opacity', 0)
  .attr('transform', `translate(${margin.left},0)`)
  .call(g => g.select('.domain').remove())
  .call(
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
  .attr('viewBox', '0 0 400 530')
  .classed('responsive', true);

svg.append('g').call(xAxis);

svg.append('g').call(yAxis);

svg.append('path')
  .datum(average)
  .attr('fill', 'none')
  .attr('stroke', avgColor)
  .attr('stroke-width', 3)
  .attr('stroke-linejoin', 'round')
  .attr('stroke-linecap', 'round')
  .attr('transform', 'translate(10, 0)')
  .attr('d', line);

const legendY = svg.append('g');
legendY.append('text').attr('transform', 'rotate(-90)').text('Millions');

const legendYOffset = legendY.select('text').node().getBBox().width/2;
legendY.classed('legendY', true).attr('transform', `translate(${0},${(height/2) + legendYOffset-5})`)


const legendX = svg.append('g');

legendX.classed('legendX', true).attr('transform', `translate(${width/2},${height})`);

legendX.append('text').classed('average', true).text('Industrial Average');
legendX.append('text').classed('company', true).text('Your Company');

const lineWidth = 40;

legendX.append('rect').classed('comp-color', true).attr('width', lineWidth).attr('height', 3).style('fill', compColor)
legendX.append('rect').classed('avg-color', true).attr('width', lineWidth).attr('height', 3).style('fill', avgColor)

const legendOffset = legendX.node().getBBox().width/2;

const avgW = legendX.select('.average').node().getBBox().width;
const compW = legendX.select('.company').node().getBBox().width;


legendX.select('.comp-color').attr('x', -lineWidth-2).attr('y', -4);
legendX.select('.avg-color').attr('x', compW+15).attr('y', -4);
legendX.select('.average').attr('x', compW+lineWidth+17);

legendX.attr('transform', `translate(${width/2-legendOffset},${height+10})`);

const dispatch = d3.dispatch('eventDropDownClose');

const eventHandler = (e = {}) => {

  const { value } = e.currentTarget || { value: '' };

  // console.log(value);

  if(!value.length) return;

  console.log(value, 'redraw line');
}

dispatch.on('eventDropDownClose', eventHandler);