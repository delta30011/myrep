import {useEffect, useState, useRef} from "react";
import axios from "axios";
import useLocalStorage from "./UseLocalStorage.ts";
import DragList from "./DragList.tsx";
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { RabbitIcon, XIcon, SettingsIcon } from 'lucide-react';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

interface PlaceLocation {
    long?: string
    latt?: string
    title?: string
}

type Dir = 0 | 45 | 90 | 135 | 180 | 225 | 270 | 315;

export default function WeatherWidget() {
    const isInit = useRef(true);

    const [stored, setStored] = useLocalStorage('locations', []);
    const [locations, setLocations] = useState([]);
    const [newPlace, setNewPlaceVal] = useState('');

    useEffect(() => {
        if (isInit.current) {
            isInit.current = false;
            return;
        }
        setStored(locations.map((i: any) => ({title: i.title, long: i.coord.lon, latt: i.coord.lat})))
    }, [locations]);

    const [modalShow, setModalShow] = useState(true);

    const windDirections = {
        0: 'N',
        45: 'NE',
        90: 'E',
        135: 'SE',
        180: 'S',
        225: 'SW',
        270: 'W',
        315: 'NW'
    }

    async function getData(location: PlaceLocation) {
        const {data} = await axios.get(`data.json`/* URL here */, {params: {...location}});
        return data;
    }

    async function setNewPlace(place: PlaceLocation) {
        const data = await getData(place);
        setLocations((prev:any):any => [{title: place.title || data.name, ...data}, ...prev]);
    }

    useEffect(() => {

        if (!stored.length) {
            navigator.geolocation.getCurrentPosition(
                async function (position) {
                    const {latitude, longitude} = position.coords;
                    console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
                    setNewPlace({latt: `${latitude}`, long: `${longitude}`});
                },
                (e) => {
                    console.log(e)
                }
            );

        } else {
            stored.map((place: PlaceLocation) => setNewPlace(place))
        }

    }, [])

    return (
        <div className="inline-block placesList rounded-md border shadow-md p-5 min-w-[300px] relative">
            <Button variant="ghost" class="absolute top-5 right-5 cursor-pointer" size="icon" onClick={()=>{setModalShow(true)}}><SettingsIcon/></Button>
            <h2 className="text-xl">WeatherWidget</h2>

            <Dialog open={modalShow}>
                <DialogContent className="sm:max-w-[425px] [&>button:last-child]:hidden" onInteractOutside={(e) => { setModalShow(false); e.preventDefault(); }}>

                        <div className="flex justify-end"><Button variant="ghost" size="icon" className="cursor-pointer" onClick={() => {
                            setModalShow(false)}}><XIcon  /></Button></div>

                <DragList list={{items: locations, setItems: setLocations}}></DragList>
                    <Input value={newPlace} placeholder="Добавить ...." onChange={(e) => {
                    setNewPlaceVal(e.target.value)
                }} type="text" onKeyUp={(e)=>{if (e.key === 'Enter') {setNewPlace({title: newPlace}); setNewPlaceVal('')}}}/>
                 <Button disabled={!newPlace} type="submit" onClick={() => {
                    setNewPlace({title: newPlace}); setNewPlaceVal('')
                }}>Добавить</Button>
                </DialogContent>
            </Dialog>

            <div>
                {locations.map((place: any, i: number) => (

                        <div key={i}>
                            <strong>{place.name}, {place.sys.country}</strong>
                            <div className="flex items-center">
          <span><img src={'http://openweathermap.org/img/wn/' + place.weather[0]?.icon + '@2x.png'}
                     title={place.weather[0].description}/></span>
                                <h3 style={{margin: 0, fontWeight: 'bold'}}>{place.main.temp}</h3>
                            </div>
                            <div className="row">
                                <div className="col-6">
                                    <p className="row"><small className="col">Feels like: {place.main.feels_like}
                                        {place.weather[0].description}</small></p>
                                    <p className="grid grid-cols-2">
                                        <small
                                            className="col">{place.wind.speed}m/s {windDirections[(place.wind.deg as Dir)]}</small>
                                        <small className="col"> {place.main.pressure}hPa </small>
                                    </p>
                                    <p className="grid grid-cols-2">
                                        <small className="col">Humidity {place.main.humidity}%</small>
                                        <small className="col"> Dew point: <sup>o</sup>C</small>
                                    </p>
                                    <p><small>Visibility {(place.visibility * 10 / 10000).toFixed(1)}km</small></p>
                                    {/*<small>{ JSON.stringify(place) }</small>*/}
                                </div>
                            </div>

                        </div>)
                )}
            </div>
        </div>
    )
}