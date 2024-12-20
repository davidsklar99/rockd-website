import { isDetailPanelRouteInternal } from "#/map/map-interface/app-state";
import h from "@macrostrat/hyper";
import { parse } from "path";
import React, { useEffect, useState, useRef } from 'react';
import { usePageContext } from 'vike-react/usePageContext';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { BlankImage, Image } from "../index";
import {
    DarkModeButton,
    Spacer,
    useAPIResult,
    useDarkMode,
  } from "@macrostrat/ui-components";

function getTrip() {
    const pageContext = usePageContext();
    console.log(pageContext.urlParsed);
    let trip = 'urlParsed' in pageContext && pageContext.urlParsed.search.trip;
    console.log(trip);
    return parseInt(trip);
}

export function App() {
    const pageContext = usePageContext();
    const [userData, setUserData] = useState(null);
    const [tripNum, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const mapContainerRef = useRef(null);
    const [center, setCenter] = useState();
    const mapRef = useRef(null);

    let trip;

    useEffect(() => {
        if (pageContext.urlParsed) {
            trip = parseInt(pageContext.urlParsed.search.trip);
            setTrip(trip);
        } else {
            setTrip(0);
        }
        console.log(`Fetching data for trip ID: ` + trip);

        // Ensure trip ID is valid
        if (isNaN(trip)) {
            setLoading(false);
            setError('Invalid trip ID.');
            return;
        }

        fetch(`https://rockd.org/api/v2/trips/${trip}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('Fetched data:', data); // Log fetched data for debugging
                if (data.success && data.success.data.length > 0) {
                    setUserData(data.success.data[0]);

                    return data.success.data[0];
                } else {
                    setUserData(null);
                }
            })
            .catch(error => {
                console.error('Fetch error:', error);
                setError(error.message);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []); 

    useEffect(() => {
        // Check if the map instance already exists
        if (mapRef.current || !mapContainerRef.current) return;

        try {
            // Initialize Mapbox map
            mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_API_TOKEN;

            mapRef.current = new mapboxgl.Map({
                container: mapContainerRef.current,
                style: 'mapbox://styles/jczaplewski/cje04mr9l3mo82spihpralr4i',
                center: [10, 10],
                zoom: 12,
            });

            // Add navigation controls
            mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-left');

        } catch (error) {
            console.error("Error initializing the map:", error);
        }

        let lats = [];
        let lngs = [];
        const map = mapRef.current;
        userData.stops.forEach((stop, index) => {
            const count = index + 1;
            const el = document.createElement('div');
            el.className = 'marker';
            el.style.backgroundImage = `url(https://storage.macrostrat.org/assets/rockd/marker_red.png)`;
            el.style.width = `60px`;
            el.style.height = `60px`;
            el.style.backgroundSize = '50%';
            el.style.display = 'block';
            el.style.border = 'none';
            el.style.cursor = 'pointer';
            el.style.backgroundRepeat = 'no-repeat';
            el.style.backgroundPosition = 'center';

            const number = document.createElement('span');
            number.innerText = count;
            number.style.position = 'absolute';
            number.style.top = '48%'; // Move it up by 2 pixels
            number.style.left = '50%';
            number.style.transform = 'translate(-50%, -50%)'; // Center the number
            number.style.color = 'white'; // Change the color as needed
            number.style.fontSize = '12px'; // Adjust font size
            number.style.fontWeight = 'bold'; // Optional: make it bold; 
            number.style.position = 'absolute';
            number.style.top = '45%'; 
            number.style.left = '50%';
            number.style.transform = 'translate(-50%, -50%)'; 
            number.style.color = 'white'; 
            number.style.fontSize = '12px'; 
            number.style.fontWeight = 'bold'; 

            // Append the number to the marker
            el.appendChild(number);

            // Create marker
            new mapboxgl.Marker(el)
                .setLngLat([stop.checkin.lng, stop.checkin.lat])
                .addTo(map);

            el.addEventListener('click', () => {
                map.flyTo({
                    center: [stop.checkin.lng, stop.checkin.lat],
                    zoom: 12,
                });
            });

            // add to array
            lats.push(stop.checkin.lat);
            lngs.push(stop.checkin.lng);
        });

        
         // set center locaiton
         mapRef.current.fitBounds([
            [ Math.max(...lngs), Math.max(...lats) ],
            [ Math.min(...lngs), Math.min(...lats) ]
        ], {
            maxZoom: 12,
            duration: 0,
            padding: 75
        });
    }, [userData]);

    // when outside marker is clicked
    useEffect(() => {
        if (mapRef.current && center) {
            mapRef.current.flyTo({
                center: [center.lng, center.lat],
                zoom: 12,
                speed: 1,
                curve: 1,
            });
        }
    }, [center]);

    if (loading) {
        if(tripNum == null) {
            return h("div", { className: 'loading' }, [
                h("h1", "Loading trip..."),
            ]);
        } else {
            return h("div", { className: 'loading' }, [
                h("h1", "Loading trip " + tripNum + "..."),
            ]);
        }

    }

    if (error) {
        return h("div", { className: 'error-main' }, [
            h("div", { className: 'error' }, [
                h("h1", "Error"),
                h("p", error)
            ]),
        ]);
    }

    if (!userData) {
        return h("div", { className: 'error' }, [
            h(BlankImage, {className: "error-img", src: "https://rockd.org/assets/img/404.jpg"}),
            h("h1", "Trip " + tripNum + " not found!"),  
        ]);
    }

    

    // Data found correctly
    let data = userData;

    // format date
    let date = new Date(data.updated);
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    data.updated = date.toLocaleDateString('en-US', options);

    // profile pic
    let profile_pic = h(BlankImage, {src: "https://rockd.org/api/v2/protected/gravatar/" + data.person_id, className: "profile-pic"});

    // create stops
    let stops = [];
    let temp;
    for(var i = 0; i < data.stops.length; i++) {
        let stop = data.stops[i];

        temp = h('div', {className: 'stop-description'}, [
            h('h2', {className: 'stop-title'}, data.stops[i].name),
            h('p', {className: 'stop-text'}, data.stops[i].description),
                h('div', {className: 'stop-box'},[
                    h('div', {className: 'box-header'},[
                        h(BlankImage, {src: "https://rockd.org/api/v2/protected/gravatar/" + data.person_id, className: "profile-pic-checkin"}),
                        h('div', {className: 'checkin-details'}, [
                            h('h4', {className: 'rock'}, data.stops[i].checkin.observations[0].rocks.strat_name.strat_name_long),
                            h('h4', {className: 'location'}, data.stops[i].checkin.near),
                            h('h4', {className: 'name'}, data.stops[i].checkin.first_name + " " + data.stops[i].checkin.last_name),
                        ]),
                        h('div', {className: 'marker-container',
                            onClick: (event) => {
                                console.log('Clicked. Stop data:', stop); // Use 'stop' instead of data.stops[i]
                                setCenter({ lat: stop.checkin.lat, lng: stop.checkin.lng }); // Update center if needed
                            }
                        }, [
                            h(Image, { src: "marker_red.png", className: "marker" }),
                            h('span', { className: 'marker-number' }, i + 1), 
                        ]),   
                    ]),
                    h('a', {className: 'stop-link', href: "/dev/test-site/checkin?checkin=" + data.stops[i].checkin_id}, [
                        h(BlankImage, {src: "https://rockd.org/api/v2/protected/image/"+ data.person_id + "/banner/" + data.stops[i].checkin.photo, className: "checkin-card-img"}),
                    ]),
                ]),
        ])
        stops.push(temp);
    }

    return h("div", {className: 'map'}, [
            h("div", { ref: mapContainerRef, className: 'map-container', style: { width: '100%', height: '100vh' } }),
            h('div', { className: 'stop-container', style: { width: '100%' } }, [
                h('div', { className: 'stop-header' }, [
                    h('h3', {className: 'profile-pic'}, profile_pic),
                    h('div', {className: 'stop-main-info'}, [
                        h('h3', {className: 'name'}, data.first_name + " " + data.last_name),
                        h('h3', {className: 'edited'}, "Edited " + data.updated),
                    ]),
                ]),
                h('h1', {className: 'park'}, data.name),
                h('p', {className: 'download-button'}, [
                    h('a', {className: 'kmz', href: "https://rockd.org/api/v2/trips/" + data.trip_id + "?format=kmz"}, "DOWNLOAD KMZ"),
                ]),
                h('div', {className: 'stop-list'}, stops),
            ])
        ]);
}
