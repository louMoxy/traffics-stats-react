import React, {Component} from 'react';
import DeckGL, {PathLayer} from 'deck.gl';
const d3 = require('d3');
const sourceColor = [0, 255, 128];
const targetColor = [255, 50, 50];
let trafficVolumeScale = d3.scaleLinear();
function getWidthSize(d){
  if(d <= 50) {
    return 30;
  } else if(d <= 200) {
    return 50
  } else if(d <= 500) {
    return 80
  } else {
    return 100
  }
}

function getSize(type) {
  if (type.search('major') >= 0) {
    return 100;
  }
  if (type.search('small') >= 0) {
    return 30;
  }
  return 60;
}
export default class DeckGLOverlay extends Component {

  static get defaultViewport() {
    return {
      latitude: 52.4862,
      longitude: 0.1278,
      zoom: 6.5,
      maxZoom: 16,
      pitch: 50,
      bearing: 0
    };
  }
  _initialize(gl) {
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE, gl.ONE_MINUS_DST_ALPHA, gl.ONE);
    gl.blendEquation(gl.FUNC_ADD);
  }

  render() {
    const {viewport,strokeWidth, roads} = this.props;
    if (!roads) {
      return null;
    } else {
      // console.log(roads);
      trafficVolumeScale= d3.scaleLinear()
        .domain([d3.min(roads, d=> d.properties['AADF-data-by-direction-major-roads_FdHGV']),
          d3.mean(roads, d=> d.properties['AADF-data-by-direction-major-roads_FdHGV']),
           d3.max(roads, d=> d.properties['AADF-data-by-direction-major-roads_FdHGV'])])
        .interpolate(d3.interpolateRgb)
        .range([d3.rgb('#008000'), d3.rgb('#a46a00'), d3.rgb('#ff0000')]);
    }

    const layers = [
      new PathLayer({
        id: 'cars',
        data: roads,
        widthMinPixels: 4,
        widthMaxPixels: 10,
        getPath: d => d.geometry.coordinates,
        getColor: d =>  trafficVolumeScale(d.properties['AADF-data-by-direction-major-roads_FdHGV']).replace('rgb(', '').replace(')', '').split(',')
        // getWidth: d => trafficVolumeScale(d.properties['AADF-data-by-direction-major-roads_FdCar'])
      })
    ];

    return (
      <DeckGL {...viewport} layers={ layers } onWebGLInitialized={this._initialize} />
    );
  }
}
