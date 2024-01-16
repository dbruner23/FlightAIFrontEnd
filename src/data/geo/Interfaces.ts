export interface Flight {
    hex: string;
    reg_number: string;
    flag: string;
    lat: number;
    lng: number;
    alt: number;
    dir: number;
    speed: number;
    v_speed: number;
    squawk: string;
    flight_number: string;
    flight_icao: string;
    flight_iata: string;
    dep_icao: string;
    dep_iata: string;
    arr_icao: string;
    arr_iata: string;
    airline_icao: string;
    airline_iata: string;
    aircraft_icao: string;
    updated: number;
    status: string;
    type: string;
} 