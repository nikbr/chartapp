import React, { PureComponent } from 'react';
import {  ReferenceLine, AreaChart, Area,  XAxis, YAxis, CartesianGrid,  Tooltip, Legend, ResponsiveContainer, type TooltipProps } from 'recharts';
const data = [
  {
    name: 'Page A',
    uv: 4000,
    pv: 2400,
    amt: 2400,
  },
  {
    name: 'Page B',
    uv: 3000,
    pv: 1398,
    amt: 2210,
  },
  {
    name: 'Page C',
    uv: 2000,
    pv: 9800,
    amt: 2290,
  },
  {
    name: 'Page D',
    uv: 2780,
    pv: 3908,
    amt: 2000,
  },
  {
    name: 'Page E',
    uv: 1890,
    pv: 4800,
    amt: 2181,
  },
  {
    name: 'Page F',
    uv: 2390,
    pv: 3800,
    amt: 2500,
  },
  {
    name: 'Page G',
    uv: 3490,
    pv: 4300,
    amt: 2100,
  },
];
const pvValues = data.map((d) => d.pv)
    const uvValues = data.map((d) => d.uv)

    const pvMean = pvValues.reduce((sum, val) => sum + val, 0) / pvValues.length
    const uvMean = uvValues.reduce((sum, val) => sum + val, 0) / uvValues.length

    // Calculate standard deviation for each series
    const pvSquaredDiffs = pvValues.map((val) => Math.pow(val - pvMean, 2))
    const uvSquaredDiffs = uvValues.map((val) => Math.pow(val - uvMean, 2))

    const pvStdDev = Math.sqrt(pvSquaredDiffs.reduce((sum, val) => sum + val, 0) / pvValues.length)
    const uvStdDev = Math.sqrt(uvSquaredDiffs.reduce((sum, val) => sum + val, 0) / uvValues.length)

    // Calculate z-scores and enhance data
    const scoredData = data.map((item) => ({
      ...item,
      pvZScore: (item.pv - pvMean) / pvStdDev,
      uvZScore: (item.uv - uvMean) / uvStdDev,
    }))

    const pvRefLinePos = pvMean + pvStdDev
  const uvRefLinePos = uvMean + uvStdDev
  const pvRefLineNeg = pvMean - pvStdDev
  const uvRefLineNeg = uvMean - uvStdDev
  const renderDot = (dataKey: string, zScoreKey: string) => (props: any) => {
    const { cx, cy, payload } = props
    const zScore = payload[zScoreKey]
    const fill = Math.abs(zScore) > 1 ? "#ef4444" : dataKey === "pv" ? "#8884d8" : "#82ca9d"

    return <circle cx={cx} cy={cy} r={Math.abs(zScore) > 1 ? 8 : 5} fill={fill} stroke="none" />
  }

  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
        const filteredPayload = payload.filter((entry:any)=> entry.name !== 'hide')
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-md">
          <p className="font-bold">{`${label}`}</p>
          {filteredPayload.map((entry, index) => {
            const dataKey = entry.dataKey as string
            const zScoreKey = dataKey === "pv" ? "pvZScore" : "uvZScore"
            const zScore = entry.payload[zScoreKey]
            const color = dataKey === "pv" ? "#8884d8" : "#82ca9d"
            const isOutlier = Math.abs(zScore) > 1
  
            return (
              <p key={`item-${index}`} style={{ color: isOutlier ? "#ef4444" : color }}>
                {`${dataKey === "pv" ? "pv" : "uv"}: ${entry.value} (z-score: ${zScore.toFixed(2)})`}
                {isOutlier && "Outlier"}
              </p>
            )
          })}
        </div>
      )
    }
    return null
  }

  const gradientOffsetUV = () => {
    const dataMax = Math.max(...data.map((i) => i.uv));
    const dataMin = Math.min(...data.map((i) => i.uv));
  
    if (dataMax <= 0) {
      return 0;
    }
    if (dataMin >= 0) {
      return 1;
    }
  
    return dataMax / (dataMax - dataMin);
  };

 
  const dataMaxPV = Math.max(...data.map((i) => i.pv));
    const dataMinPV = Math.min(...data.map((i) => i.pv));
    const dataMaxUV = Math.max(...data.map((i) => i.uv));
    const dataMinUV = Math.min(...data.map((i) => i.uv));
  const gradientOffsetPV = () => {
    const dataMax = Math.max(...data.map((i) => i.pv));
    const dataMin = Math.min(...data.map((i) => i.pv));
  
    if (dataMax <= 0) {
      return 0;
    }
    if (dataMin >= 0) {
      return 1;
    }
  
    return dataMax / (dataMax - dataMin);
  };
export default class Example extends PureComponent {
    
  render() {
    return (
        <div style={{width:"800px", height:"600px"}}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          width={500}
          height={300}
          data={scoredData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip content = {<CustomTooltip/>}/>
          <Legend />
  
          <ReferenceLine
            y={pvRefLinePos}
            stroke="#8884d8"
            strokeDasharray="3 3"
            label={{ value: "PV z-score = 1", position: "right" }}
          />
          <ReferenceLine
            y={uvRefLinePos}
            stroke="#82ca9d"
            strokeDasharray="3 3"
            label={{ value: "UV z-score = 1", position: "right" }}
          />

          {/* Reference lines for z-score = -1 */}
          <ReferenceLine
            y={pvRefLineNeg}
            stroke="#8884d8"
            strokeDasharray="3 3"
            label={{ value: "PV z-score = -1", position: "left" }}
          />
          <ReferenceLine
            y={uvRefLineNeg}
            stroke="#82ca9d"
            strokeDasharray="3 3"
            label={{ value: "UV z-score = -1", position: "left" }}
          />

            <Area type="monotone" dataKey="pv" stroke="#8884d8" fill="url(#splitColorPV)" dot={renderDot("pv", "pvZScore")} name="pv"
              activeDot={{ r: 10 }}/>
            <Area type="monotone" dataKey="pv" stroke="#8884d8" name="hide" fill="url(#splitColorPV2)" baseValue={10000} legendType="none"/>
            <Area type="monotone" dataKey="uv" stroke="#82ca9d" fill="url(#splitColorUV)" dot={renderDot("uv", "uvZScore")} name="uv"
              activeDot={{ r: 10 }}/>
              <Area type="monotone" dataKey="uv" stroke="#82ca9d" name="hide" fill="url(#splitColorUV2)" baseValue={10000} legendType="none"/>
            <defs>
            <linearGradient id="splitColorUV" x1="0" y1="0" x2="0" y2={(dataMaxUV-uvRefLinePos)/dataMaxUV}>
              <stop offset={gradientOffsetUV()} stopColor="red" stopOpacity={1} />
              <stop offset={gradientOffsetUV()} stopColor="green" stopOpacity={0} />
            </linearGradient>
            
            <linearGradient id="splitColorPV" x1="0" y1="0" x2="0" y2={(dataMaxPV-pvRefLinePos)/dataMaxPV}>
              <stop offset={gradientOffsetPV()} stopColor="red" stopOpacity={1} />
              <stop offset={gradientOffsetPV()} stopColor="green" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="splitColorPV2" x1="0" y1="0" x2="0" y2={1-(pvRefLineNeg-dataMinPV)/(10000-dataMinPV)}>
              <stop offset={gradientOffsetPV()} stopColor="green" stopOpacity={0} />
              <stop offset={gradientOffsetPV()} stopColor="red" stopOpacity={1} />
            </linearGradient>
            <linearGradient id="splitColorUV2" x1="0" y1="0" x2="0" y2={1-(uvRefLineNeg-dataMinUV)/(10000-dataMinUV)}>
              <stop offset={gradientOffsetPV()} stopColor="green" stopOpacity={0} />
              <stop offset={gradientOffsetPV()} stopColor="red" stopOpacity={1} />
            </linearGradient>
          </defs>
        </AreaChart>
      </ResponsiveContainer>
      </div>
    );
  }
}
