import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api"
import "../css/nearby.css"
import { useContext, useState } from "react"
import Geocode from "react-geocode"
import { LocationProps } from "../functions/types";
import { FlatContext } from "../components/context";

type LibrariesType = "places" | "drawing" | "geometry" | "localContext" | "visualization";

type GeocodeResult = {
  location: {
    lat: number;
    lng: number;
  };
  address: string;
}

// TODO add more attributes if needed
type Facility = {
  lat: number;
  lng: number;
  name?: string;
  vicinity: string,
  opening_hours?: google.maps.places.PlaceOpeningHours,
  rating: number,
  types: string[],
  photos: google.maps.places.PlacePhoto[]
}

const libraries: LibrariesType[] = ['places'];
const placeTypes = "hospital,restaurant,train_station,shopping_mall"

const Nearby = (props: LocationProps) => {
  const apiKey = process.env.REACT_APP_GOOGLE_MAP_API_KEY ?? ""
  Geocode.setApiKey(apiKey)

  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [result, setResult] = useState<GeocodeResult | null>(null);
  const [location, setLocation] = useState<string>('');
  const [streets, setStreets] = useState<string[]>([]);
  const [street, setStreet] = useState<string>('');
  const [dropdownLocation, setDropdownLocation] = useState<boolean>(false);
  const [dropdownStreet, setDropdownStreet] = useState<boolean>(false);
  const [map, setMap] = useState<google.maps.Map>();
  const [submitError, setSubmitError] = useState<boolean>();

  const flats = useContext(FlatContext);

  const handleSubmit = () => {
    setSubmitError(!street)
    if (street) {
      Geocode.fromAddress(street).then(
        (response) => {
          const {lat, lng} = response.results[0].geometry.location
          const address = response.results[0].formatted_address;

          // Set the result in the state
          setResult({ location: { lat: lat, lng: lng }, address });
        },
        (err) => {
          console.error(err)
        });
    }
  };

  const getNearbyFacilities = (map: google.maps.Map) => {
    const service = new window.google.maps.places.PlacesService(map);
    const request = {
      location: map.getCenter(),
      type: placeTypes,
      rankBy: google.maps.places.RankBy.DISTANCE,
      maxResults: 10
    };
    service.nearbySearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
        console.log(results)
        setFacilities(
          results.map((place) => ({
            lat: place.geometry?.location?.lat() || 0,
            lng: place.geometry?.location?.lng() || 0,
            name: place.name,
            vicinity: place.vicinity || "",
            opening_hours: place.opening_hours,
            rating: place.rating || 0,
            types: place.types || [],
            photos: place.photos || []
          }))
        );
      }
    });
  }

  const handleLoad = (map: google.maps.Map) => {
    setMap(map);
    getNearbyFacilities(map);
  }

  const handleDropdownLocation = () => {
    setDropdownLocation(!dropdownLocation);
  }

  const handleDropdownStreet = () => {
    setDropdownStreet(!dropdownStreet);
  }

  const updateStreets = (location: string) => {
    setStreets(
      flats.filter((flat) => flat.town === location).map((flat) => flat.street_name).filter((x, i, a) => a.indexOf(x) === i)
    )
  }

  const dropdownLocationItems = props.locationList.map((newLocation) =>
    <div className={newLocation === location ? "nearby-option selected" : "nearby-option"} onClick={() => { setLocation(newLocation); updateStreets(newLocation); handleDropdownLocation(); }}>{newLocation}</div>
  );

  const dropdownStreetItems = streets.map((newStreet) =>
    <div className={newStreet === street ? "nearby-option selected" : "nearby-option"} onClick={() => { setStreet(newStreet); handleDropdownStreet(); }}>{newStreet}</div>
  );

  const FacilitiesList = facilities.map((facility) =>
    <div className = "nearby-location">
      {<div className="nearby-location-name">{facility.name}</div>}
      {<div>{facility.vicinity}</div>}
      {<div>{facility.rating ? "Rating: " + facility.rating : "No Rating"}</div>}
      {<div>{facility.types.toString()}</div>}
      {facility.photos.length > 0 && <img className="nearby-location-img" src={facility.photos[0].getUrl()} alt=""></img>}
      {/* {facility.opening_hours?.periods?.map((period) => period.open)} */}
    </div>
  )

  return (
    <div className="nearby-container">
      <div className="nearby-header">
        <div>Choose</div>
        <div className="nearby-inputs">
          <div className="nearby-input-field">
            <div> Town </div>
            <div className="nearby-dropdown" onClick={() => handleDropdownLocation()}>
              {location ? <div className="nearby-input">{location}</div> : <div className="nearby-input default">Select Town</div>}
              {dropdownLocation &&
              <div className="nearby-menu">
                {dropdownLocationItems}
              </div>}
              <img className="dropdown-icon" src='img/dropdown.png' alt=''></img>
            </div>
          </div>

          <div className="nearby-input-field">
            {location &&
            <>
            <div> Street </div>
            <div className="nearby-dropdown" onClick={() => handleDropdownStreet()}>
              {street ? <div className="nearby-input">{street}</div> : <div className="nearby-input default">Select Street</div>}
              {dropdownStreet &&
              <div className="nearby-menu">
                {dropdownStreetItems}
              </div>}
              <img className="dropdown-icon" src='img/dropdown.png' alt=''></img>
            </div>
            </>
            }
          </div>
        </div>

        <div className="nearby-submit-btn" onClick={() => handleSubmit()}>Search</div>
        {submitError && <div> Please select a town and a street first! </div>}
      </div>
      <div className="nearby-body">
        {result &&
        <div className="nearby-map">
          <LoadScript
            googleMapsApiKey={apiKey}
            libraries={libraries}
          >
            <GoogleMap
              options={
                {draggable: false}
              }
              mapContainerStyle={{width: "100%", height: "100%"}}
              center={{ lat: result.location.lat, lng: result.location.lng }}
              zoom={17}
              onLoad={(map) => handleLoad(map)}
              onCenterChanged={() => map && getNearbyFacilities(map)}
            >
              {facilities.map((facility, index) => (
                <Marker key={index} position={{ lat: facility.lat, lng: facility.lng }} />
              ))}
            </GoogleMap>
          </LoadScript>
        </div>
        }
        { result &&
        <div className="nearby-locations">
          {FacilitiesList}
        </div>
        }
      </div>
    </div>
  )
}

export {Nearby}