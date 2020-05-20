
import React, {PureComponent} from 'react';
import {render} from 'react-dom';
import DeckGL from '@deck.gl/react';
import {TileLayer} from '@deck.gl/geo-layers';
import {BitmapLayer} from '@deck.gl/layers';


//import {StaticMap} from 'react-map-gl';

import {TextLayer} from '@deck.gl/layers';
import TagmapLayer from './tagmap-layer';

// sample data
const DATA_URL = 'https://rivulet-zhang.github.io/dataRepo/tagmap/hashtags10k.json';

const DEFAULT_COLOR = [29, 145, 192];

const INITIAL_VIEW_STATE = {
  latitude: 40.73097,
  longitude: -73.9864,
  zoom: 3.8,
  maxZoom: 16,
  pitch: 0,
  bearing: 0
};

export default class App extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
    this._onHover = this._onHover.bind(this);
    this._renderTooltip = this._renderTooltip.bind(this);
  }

  _onHover({x, y, sourceLayer, tile}) {
    this.setState({x, y, hoveredObject: {sourceLayer, tile}});
  }

  _renderTooltip() {
    const {x, y, hoveredObject} = this.state;
    const {sourceLayer, tile} = hoveredObject || {};
    return (
      sourceLayer &&
      tile && (
        <div className="tooltip" style={{left: x, top: y}}>
          tile: x: {tile.x}, y: {tile.y}, z: {tile.z}
        </div>
      )
    );
  }

  _renderLayers() {
    //const {autoHighlight = true, highlightColor = [60, 60, 60, 40]} = this.props;
     const {data = DATA_URL, cluster = false, fontSize = 32} = this.props;

    return [

          new TileLayer({
            // https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Tile_servers
            data: 'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',

            pickable: true,
            onHover: this._onHover,
            //autoHighlight,
            //highlightColor,
            // https://wiki.openstreetmap.org/wiki/Zoom_levels
            minZoom: 0,
            maxZoom: 19,

            renderSubLayers: props => {
              const {
                bbox: {west, south, east, north}
              } = props.tile;

              return new BitmapLayer(props, {
                data: null,
                image: props.data,
                bounds: [west, south, east, north]
              });
            }
          }),
          cluster
           ? new TagmapLayer({
                id: 'twitter-topics-tagmap',
                data,
                getLabel: x => x.label,
                getPosition: x => x.coordinates,
                minFontSize: 14,
                maxFontSize: fontSize * 2 - 14
              })
            : new TextLayer({
                id: 'twitter-topics-raw',
                data,
                getText: d => d.label,
                getPosition: x => x.coordinates,
                getColor: d => DEFAULT_COLOR,
                getSize: d => 20,
                sizeScale: fontSize / 20
              })
    ];
  }

  render() {
    return (
      <DeckGL layers={this._renderLayers()} initialViewState={INITIAL_VIEW_STATE} controller={true}>
        {this._renderTooltip}
      </DeckGL>
    );
  }
}

export function renderToDOM(container) {
  render(<App />, container);
}
