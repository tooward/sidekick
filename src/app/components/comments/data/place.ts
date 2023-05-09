export interface iPlace {
    country: string;
    city?: string;
    name?: string;
    state?: string;
    placeid?: string;
}

export class oPlace implements iPlace {

    country: string = "";
    city?: string;
    name?: string;
    state?: string;
    placeid?: string;
 
    constructor(countryIn: string, cityIn?: string, stateIn?: string, nameIn?: string, placeidIn?: string,){ 
        this.country = countryIn;
        // set name to a default value if not provided

        if (cityIn){
            this.city = cityIn;
        }
        if (stateIn){
            this.state = stateIn;
        }
        if (nameIn){
            this.name = nameIn;
        }
        if (nameIn === 'undefined'){
            this.name = oPlace.returnNameFromPlaceDetails(this);
        }
        if (placeidIn){
            this.placeid = placeidIn;
        }
    }

    public static jsonToClass(jsonPlace: string){
        if(typeof jsonPlace !== 'undefined'){
            return (this.plainToClass(JSON.parse(jsonPlace)));
        }
        else{
            throw new Error('undefined JSON input');
            
        }
    }

    public static plainToClass(plain: any): oPlace{
        if(plain){
            let place = new oPlace(plain.country);
            // check mandatory properties exist
            if (typeof plain.country === 'undefined'){
                throw new Error('Mandatory property (country) not set for constructor on plain object');
            }
            else{
                place.country = plain.country;
            }
            if (typeof plain.state !== 'undefined'){
                place.state = plain.state;
            }

            if (typeof plain.city !== 'undefined'){
                place.city = plain.city;
            }
            if (typeof plain.name !== 'undefined'){
                place.name = plain.name;
            }
            else{
                place.name = this.returnNameFromPlaceDetails(place);
            }
            if (typeof plain.placeid !== 'undefined'){
                place.placeid = plain.placeid;
            }
            return place;
        }
        else{
            return null;
        }

    }

    public static returnNameFromPlaceDetails(place: oPlace): string{
        let name = '';
        if (place.city === 'undefined'){
            if (place.state === 'undefined'){
                name = place.country ?? "";
            }
            else{
                name = place.state ?? "";
            }
        }
        else{
            name = place.city ?? "";
        }

        return name;
    }
}