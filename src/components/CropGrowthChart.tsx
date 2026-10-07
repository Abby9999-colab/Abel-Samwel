/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { Crop, GrowthStagePoint } from '../types';
import { TrendingUp, Leaf, Ruler, Calendar, CheckCircle2, Info } from 'lucide-react';

interface CropGrowthChartProps {
  crop: Crop;
  swahiliPreference: boolean;
}

export default function CropGrowthChart({ crop, swahiliPreference }: CropGrowthChartProps) {
  const [metric, setMetric] = useState<'height' | 'leaves'>('height');
  const [hoveredPoint, setHoveredPoint] = useState<GrowthStagePoint | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Generate realistic agronomic growth curve data based on crop requirements
  const growthData: GrowthStagePoint[] = useMemo(() => {
    const timeStr = crop.requirements.timeToHarvest.toLowerCase();
    
    // Parse duration in days
    let totalDays = 90; // baseline default
    if (timeStr.includes('year') || timeStr.includes('miaka')) {
      totalDays = 365; // visualize year 1 establishment cycle
    } else {
      const numbers = timeStr.match(/\d+/g);
      if (numbers && numbers.length > 0) {
        const parsed = parseInt(numbers[numbers.length - 1], 10);
        if (parsed > 0) {
          totalDays = timeStr.includes('month') || timeStr.includes('miezi') ? parsed * 30 : parsed;
        }
      }
    }
    totalDays = Math.max(45, Math.min(365, totalDays));

    // Determine scale factors based on crop type
    let maxHeight = 180;
    let maxLeaves = 18;

    if (crop.category === 'cereals') {
      maxHeight = crop.name.toLowerCase().includes('maize') ? 220 : crop.name.toLowerCase().includes('sorghum') ? 240 : 110;
      maxLeaves = 16;
    } else if (crop.category === 'vegetables') {
      maxHeight = crop.name.toLowerCase().includes('tomato') ? 130 : crop.name.toLowerCase().includes('spinach') ? 35 : 55;
      maxLeaves = crop.name.toLowerCase().includes('spinach') ? 24 : 14;
    } else {
      // Fruits
      maxHeight = crop.name.toLowerCase().includes('banana') ? 280 : 150;
      maxLeaves = 22;
    }

    const d1 = Math.round(totalDays * 0.08); // Germination
    const d2 = Math.round(totalDays * 0.25); // Early Vegetative
    const d3 = Math.round(totalDays * 0.45); // Active Tillering / Stem Elongation
    const d4 = Math.round(totalDays * 0.65); // Flowering / Heading
    const d5 = Math.round(totalDays * 0.85); // Grain/Fruit filling
    const d6 = totalDays;                   // Mature Harvest

    return [
      {
        day: 0,
        stageName: 'Sowing / Seed Planting',
        stageNameSw: 'Upandaji wa Mbegu',
        heightCm: 0,
        leafCount: 0,
        agronomicNote: 'Optimal soil moisture and loose tilth required for seed emergence.',
        agronomicNoteSw: 'Unyevu wa udongo na ardhi tifutifu inahitajika kwa uotaji mzuri.',
        keyAction: 'Basal fertilizer & initial watering'
      },
      {
        day: d1,
        stageName: 'Germination & Emergence',
        stageNameSw: 'Kuota & Chipukizi',
        heightCm: Math.round(maxHeight * 0.06),
        leafCount: 2,
        agronomicNote: 'Cotyledons break soil crust; radical root system starts downward foraging.',
        agronomicNoteSw: 'Majani ya kwanza yanajitokeza; mizizi ya awali inatafuta virutubisho.',
        keyAction: 'Monitor moisture; watch for cutworms'
      },
      {
        day: d2,
        stageName: 'Early Vegetative Stage',
        stageNameSw: 'Ukuaji wa Majani ya Awali',
        heightCm: Math.round(maxHeight * 0.22),
        leafCount: Math.round(maxLeaves * 0.35),
        agronomicNote: 'Vigorous leaf node production; accelerated cellular expansion begins.',
        agronomicNoteSw: 'Uzalishaji wa majani unaongezeka; mmea unapanua umbo lake kwa haraka.',
        keyAction: 'Weeding & first nitrogen top-dressing'
      },
      {
        day: d3,
        stageName: 'Stem Extension / Tillering',
        stageNameSw: 'Kutanuka Shina & Matawi',
        heightCm: Math.round(maxHeight * 0.55),
        leafCount: Math.round(maxLeaves * 0.65),
        agronomicNote: 'Peak photosynthetic leaf area index; rapid vascular stalk strengthening.',
        agronomicNoteSw: 'Kilele cha eneo la majani kwa usanisinuru; shina linajenga nguvu.',
        keyAction: 'Second top-dressing & pest scouting'
      },
      {
        day: d4,
        stageName: 'Flowering & Anthesis',
        stageNameSw: 'Kutoa Maua & Uchavushaji',
        heightCm: Math.round(maxHeight * 0.88),
        leafCount: maxLeaves,
        agronomicNote: 'Pollination and reproductive organ set. Critical sensitivity to drought stress.',
        agronomicNoteSw: 'Uchavushaji na utungaji wa mbegu/matunda; usikose maji katika kipindi hiki.',
        keyAction: 'Maintain steady irrigation; fungicide defense'
      },
      {
        day: d5,
        stageName: 'Maturation / Grain Filling',
        stageNameSw: 'Kujaza Nafaka / Matunda',
        heightCm: Math.round(maxHeight * 0.98),
        leafCount: Math.round(maxLeaves * 0.92),
        agronomicNote: 'Sucrose and starches translocate into kernels or harvestable fruit structures.',
        agronomicNoteSw: 'Virutubisho vinajaza punje au matunda; uzito na ubora unakomaa.',
        keyAction: 'Gradual irrigation taper; harvest prep'
      },
      {
        day: d6,
        stageName: 'Harvest Readiness',
        stageNameSw: 'Uvunaji / Kukomaa Kamili',
        heightCm: maxHeight,
        leafCount: maxLeaves,
        agronomicNote: 'Physiological maturity reached. Ideal moisture content achieved for picking.',
        agronomicNoteSw: 'Zao limekomaa kikamilifu. Unyevu sahihi umefikiwa kuanza kuvuna.',
        keyAction: 'Field harvest & post-harvest drying'
      }
    ];
  }, [crop]);

  // Set default hovered point to middle stage
  useEffect(() => {
    if (growthData.length > 3) {
      setHoveredPoint(growthData[3]);
    }
  }, [growthData]);

  // Render D3 SVG Chart
  useEffect(() => {
    if (!svgRef.current || growthData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // clear prior elements

    const width = 640;
    const height = 240;
    const margin = { top: 25, right: 35, bottom: 40, left: 45 };

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const maxDay = d3.max(growthData, d => d.day) || 90;
    const maxY = d3.max(growthData, d => metric === 'height' ? d.heightCm : d.leafCount) || 100;

    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, maxDay])
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, maxY * 1.15])
      .range([innerHeight, 0]);

    // Defs: Gradients and Glow filters
    const defs = svg.append('defs');

    const areaGradient = defs.append('linearGradient')
      .attr('id', 'growthAreaGrad')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');

    areaGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', metric === 'height' ? '#3b82f6' : '#10b981')
      .attr('stop-opacity', 0.45);

    areaGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', metric === 'height' ? '#1e3a8a' : '#064e3b')
      .attr('stop-opacity', 0.0);

    const lineGradient = defs.append('linearGradient')
      .attr('id', 'growthLineGrad')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '100%').attr('y2', '0%');

    lineGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', metric === 'height' ? '#60a5fa' : '#34d399');

    lineGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', metric === 'height' ? '#3b82f6' : '#10b981');

    // Chart Group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Horizontal Grid Lines
    const yAxisTicks = yScale.ticks(5);
    g.selectAll('.grid-line')
      .data(yAxisTicks)
      .enter()
      .append('line')
      .attr('class', 'grid-line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', d => yScale(d))
      .attr('y2', d => yScale(d))
      .attr('stroke', '#1e293b')
      .attr('stroke-dasharray', '3,3')
      .attr('stroke-width', 1);

    // Area Generator
    const area = d3.area<GrowthStagePoint>()
      .x(d => xScale(d.day))
      .y0(innerHeight)
      .y1(d => yScale(metric === 'height' ? d.heightCm : d.leafCount))
      .curve(d3.curveMonotoneX);

    // Line Generator
    const line = d3.line<GrowthStagePoint>()
      .x(d => xScale(d.day))
      .y(d => yScale(metric === 'height' ? d.heightCm : d.leafCount))
      .curve(d3.curveMonotoneX);

    // Append Area Path
    g.append('path')
      .datum(growthData)
      .attr('d', area)
      .attr('fill', 'url(#growthAreaGrad)');

    // Append Line Path with stroke animation
    const path = g.append('path')
      .datum(growthData)
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', 'url(#growthLineGrad)')
      .attr('stroke-width', 3)
      .attr('stroke-linecap', 'round');

    const totalLength = path.node()?.getTotalLength() || 1000;
    path
      .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(1200)
      .ease(d3.easeCubicOut)
      .attr('stroke-dashoffset', 0);

    // X Axis Ticks & Labels
    const xAxis = d3.axisBottom(xScale)
      .ticks(6)
      .tickFormat(d => `Day ${d}`);

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .call(axisG => {
        axisG.select('.domain').attr('stroke', '#334155');
        axisG.selectAll('.tick line').attr('stroke', '#334155');
        axisG.selectAll('.tick text')
          .attr('fill', '#94a3b8')
          .attr('font-size', '10px')
          .attr('font-family', 'monospace');
      });

    // Y Axis Ticks & Labels
    const yAxis = d3.axisLeft(yScale)
      .ticks(5)
      .tickFormat(d => `${d} ${metric === 'height' ? 'cm' : 'lvs'}`);

    g.append('g')
      .call(yAxis)
      .call(axisG => {
        axisG.select('.domain').remove();
        axisG.selectAll('.tick line').remove();
        axisG.selectAll('.tick text')
          .attr('fill', '#94a3b8')
          .attr('font-size', '10px')
          .attr('font-family', 'monospace');
      });

    // Milestone Data Points
    const circlesGroup = g.selectAll('.point')
      .data(growthData)
      .enter()
      .append('g')
      .attr('class', 'point')
      .attr('transform', d => `translate(${xScale(d.day)},${yScale(metric === 'height' ? d.heightCm : d.leafCount)})`)
      .style('cursor', 'pointer')
      .on('mouseenter', (_, d) => {
        setHoveredPoint(d);
      });

    // Outer glow ring
    circlesGroup.append('circle')
      .attr('r', 8)
      .attr('fill', metric === 'height' ? '#3b82f6' : '#10b981')
      .attr('fill-opacity', 0.2);

    // Inner solid point
    circlesGroup.append('circle')
      .attr('r', 4.5)
      .attr('fill', '#0f172a')
      .attr('stroke', metric === 'height' ? '#60a5fa' : '#34d399')
      .attr('stroke-width', 2.5);

    // Vertical guideline for active hovered point
    if (hoveredPoint) {
      g.append('line')
        .attr('x1', xScale(hoveredPoint.day))
        .attr('x2', xScale(hoveredPoint.day))
        .attr('y1', 0)
        .attr('y2', innerHeight)
        .attr('stroke', metric === 'height' ? '#60a5fa' : '#34d399')
        .attr('stroke-dasharray', '2,2')
        .attr('stroke-opacity', 0.6)
        .attr('pointer-events', 'none');
    }

  }, [growthData, metric, hoveredPoint]);

  return (
    <div className="bg-slate-950/80 border border-blue-950/80 rounded-2xl p-5 space-y-4 shadow-xl">
      {/* Chart Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-blue-950/60">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs uppercase font-mono font-bold tracking-wider text-white">
              {swahiliPreference ? 'Mwenendo wa Ukuaji wa Zao (D3 Progression)' : 'Growth Progression Over Harvest Cycle'}
            </h4>
            <span className="text-[9px] font-mono bg-blue-950 text-blue-300 border border-blue-800/40 px-2 py-0.5 rounded-full">
              D3.js Vector Engine
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {swahiliPreference 
              ? 'Tathmini ya kisayansi ya kimo cha mmea na idadi ya majani kwa kila hatua ya ukuaji hadi kukomaa.' 
              : `Optimal agronomic curve modeled over typical ${crop.requirements.timeToHarvest} cycle.`}
          </p>
        </div>

        {/* Metric Selector Buttons */}
        <div className="flex bg-slate-900 border border-blue-950 rounded-xl p-1 shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setMetric('height')}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              metric === 'height'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Ruler className="w-3 h-3" />
            {swahiliPreference ? 'Kimo (cm)' : 'Height (cm)'}
          </button>
          <button
            type="button"
            onClick={() => setMetric('leaves')}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              metric === 'leaves'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Leaf className="w-3 h-3" />
            {swahiliPreference ? 'Majani' : 'Leaf Count'}
          </button>
        </div>
      </div>

      {/* D3 SVG Container */}
      <div className="w-full overflow-x-auto">
        <div className="min-w-[580px]">
          <svg
            ref={svgRef}
            viewBox="0 0 640 240"
            className="w-full h-auto overflow-visible select-none"
          />
        </div>
      </div>

      {/* Interactive Milestone Stage Callout Card */}
      {hoveredPoint && (
        <div className="p-4 bg-slate-900/90 border border-blue-900/40 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fade-in text-xs">
          {/* Col 1: Stage & Day */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-blue-400 font-mono text-[10px] uppercase tracking-wider">
              <Calendar className="w-3 h-3" />
              <span>Day {hoveredPoint.day} / Milestone</span>
            </div>
            <p className="font-semibold text-white text-sm font-display">
              {swahiliPreference ? hoveredPoint.stageNameSw : hoveredPoint.stageName}
            </p>
          </div>

          {/* Col 2: Metric Values */}
          <div className="space-y-1">
            <span className="text-slate-400 font-mono text-[10px] uppercase tracking-wider">Expected Progression</span>
            <div className="flex items-center gap-3">
              <span className="text-white font-mono font-bold text-xs bg-slate-950 px-2.5 py-1 rounded-lg border border-blue-950">
                Height: <strong className="text-blue-400">{hoveredPoint.heightCm} cm</strong>
              </span>
              <span className="text-white font-mono font-bold text-xs bg-slate-950 px-2.5 py-1 rounded-lg border border-blue-950">
                Leaves: <strong className="text-emerald-400">{hoveredPoint.leafCount}</strong>
              </span>
            </div>
          </div>

          {/* Col 3: Agronomic Action */}
          <div className="space-y-1">
            <span className="text-amber-400 font-mono text-[10px] uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              {swahiliPreference ? 'Hatua ya Mkulima' : 'Recommended Farm Action'}
            </span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {hoveredPoint.keyAction}
            </p>
          </div>
        </div>
      )}

      {/* Footer Hint */}
      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1">
        <span className="flex items-center gap-1">
          <Info className="w-3 h-3 text-slate-400" />
          {swahiliPreference ? 'Gusa nukta kwenye mstari kutazama hatua mahususi.' : 'Hover or tap nodes along the curve to inspect each developmental stage.'}
        </span>
        <span>Based on East African agro-ecological norms</span>
      </div>
    </div>
  );
}
