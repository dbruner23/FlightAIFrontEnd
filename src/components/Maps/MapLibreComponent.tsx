import React, { useEffect, useRef, useState } from 'react';
import { MapLayerMouseEvent, PointLike, Marker } from 'mapbox-gl';
// import maplibregl from 'maplibre-gl';
// import 'maplibre-gl/dist/maplibre-gl.css';
import Map, { Layer, MapRef, NavigationControl, Popup, Source } from 'react-map-gl';
import { useSelector } from 'react-redux';
import { MapStyle } from './MapStyle';
import GeoApi from '../../data/geo/Api';
import { libreDataState } from '../../data/geo/Reducer';
import LocalAirportIcon from '@mui/icons-material/LocalAirport';

interface IPopupData {
    label: string;
    latitude: number;
    longitude: number;
}

const MapLibreComponent = () => {
    const mapRef = useRef<MapRef>(null);
    const initialViewState = {
        latitude: -43.5,
        longitude: 172.6,
        zoom: 10,
        pitch: 0
    }

    const [popupData, setPopupData] = useState<IPopupData | null>(null);
    const data = useSelector(libreDataState);
    const equipmentLayerId = 'equipmentLayer';

    // const createCustomMarker = (marker: any) => {
    //     const el = document.createElement('div');
    //     el.className = 'marker';
    //     // Use SVG as a background image
    //     el.style.backgroundImage = url('../../assets/airplaneIcon.png'); // Ensure the path is correct
    //     el.style.width = `25px`;
    //     el.style.height = `25px`;
    //     el.style.backgroundSize = '100%';

    //     el.addEventListener('click', () => {
    //         window.alert(marker.properties.message);
    //     });

    //     return el;
    // }

    useEffect(() => {
        if (!data) {
            GeoApi.loadLibreData(() => {
                console.log('loaded data')
            })
        }
    }, [data])

    // useEffect(() => {
    //     if (data && mapRef.current) {
    //         for (const marker of data.features) {
    //             const customMarkerEl = createCustomMarker(marker);

    //             // Add markers to the map.
    //             new Marker(customMarkerEl)
    //                 .setLngLat(marker.geometry.coordinates)
    //                 .addTo(mapRef.current.getMap()); // Ensure you're adding to the current map instance
    //         }
    //     }
    // }, [data]);

    const getBoundingBoxFromMouseEvent = (e: MapLayerMouseEvent, radius?: number): [PointLike, PointLike] => {
        let extension = radius ? radius : 2.5;
        return [
            [e.point.x - extension, e.point.y - extension],
            [e.point.x + extension, e.point.y + extension]
        ]
    }


    const handleClick = (e: MapLayerMouseEvent) => {
        const bbox = getBoundingBoxFromMouseEvent(e);
        const features = mapRef.current?.queryRenderedFeatures(bbox);
        if (features && features.length > 0) {
            const firstEquipment: any = features[0];
            console.log(firstEquipment);
            setPopupData({
                latitude: firstEquipment.geometry.coordinates[1],
                longitude: firstEquipment.geometry.coordinates[0],
                label: firstEquipment.properties['Type']
            })
        }
    }

    return (
        <div style={{
            display: 'flex',
            flexGrow: 1
        }}>
            <Map
                mapStyle={MapStyle}
                ref={mapRef}
                mapboxAccessToken='pk.eyJ1IjoiZGJydW5lcjIzIiwiYSI6ImNsYXI3c2IxcTFpMG0zd21xZThhNGtlMGsifQ.DZCj-DgPgGM-2sVemYGSnw'
                initialViewState={initialViewState}
                interactiveLayerIds={[equipmentLayerId]}
                onClick={handleClick}
            >
                <NavigationControl position='bottom-right' showZoom visualizePitch />

                {data &&
                    <Source
                        id='dataSrc'
                        type='geojson'
                        data={data}
                    >
                        <Layer
                            id={equipmentLayerId}
                            type='circle'
                            // layout={{
                            //     'icon-image': 'airplane-icon', // Reference the image by the ID you gave it
                            //     'icon-size': 0.25, // Adjust size as needed
                            // }}
                            paint={{
                                'circle-color': 'red',
                                'circle-radius': 5,
                                'circle-stroke-color': 'black',
                                'circle-stroke-width': .5

                            }}
                        />
                    </Source>
                }

                {popupData &&
                    <Popup latitude={popupData.latitude} longitude={popupData.longitude} onClose={() => setPopupData(null)}>
                        {popupData.label}
                    </Popup>
                }

            </Map >
        </div>
    );
}

export default MapLibreComponent;