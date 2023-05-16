
export interface entityFoundIn {
    url: URL;
    title: string;
    domain: string;
}

export interface location {
    type: string;
    originalcontent: string;
    location: string; // google returns two types of location: address and simple location string. Location string still may contain wikipeadia url
    street_number: string;
    locality: string;
    street_name: string;
    postal_code: string;
    country: string;
    broad_region: string; // administrative area, such as the state, if detected
    narrow_region: string; // smaller administrative area, such as county, if detected
    sublocality: string; //  used in Asian addresses to demark a district within a city, if detected
    wikipedia_url: URL;
}

export interface phone_number {
    type: string;
    originalcontent: string;
    number: string;
    national_prefix: string;
    area_code: string;
    extension: string;
}

export interface person {
    type: string;
    originalcontent: string;
    name: string;
    wikipedia_url: URL;
}

export class person implements person {
    type: string = "PERSON";
    originalcontent: string;
    name: string;
    wikipedia_url: URL;

    setPersonFromEntity (entity: any): void {
        this.originalcontent = entity.originalcontent;
        this.name = entity.name;
        this.wikipedia_url = entity.wikipedia_url;
    }
}

export class location implements location {
    type: string = "LOCATION";
    originalcontent: string;
    location: string; // google returns two types of location: address and simple location string. Location string still may contain wikipeadia url
    street_number: string;
    locality: string;
    street_name: string;
    postal_code: string;
    country: string;
    broad_region: string; // administrative area, such as the state, if detected
    narrow_region: string; // smaller administrative area, such as county, if detected
    sublocality: string; //  used in Asian addresses to demark a district within a city, if detected
    wikipedia_url: URL;

    setAddressFromEntity(entity: any): void {
        this.originalcontent = entity.originalcontent;
        this.location = entity.name;
        this.wikipedia_url = entity.wikipedia_url;
        this.street_number = entity.street_number;
        this.locality = entity.locality;
        this.street_name = entity.street_name;
        this.postal_code = entity.postal_code;
        this.country = entity.country;
        this.broad_region = entity.broad_region;
        this.narrow_region = entity.narrow_region;
        this.sublocality = entity.sublocality;
    }
}

export class phone_number {
    type: string = "PHONE_NUMBER";
    originalcontent: string;
    number: string;
    national_prefix: string;
    area_code: string;
    extension: string;

    setPhoneNumberFromEntity(entity: any): void{
        this.originalcontent = entity.originalcontent;
        this.number = entity.number;
        this.national_prefix = entity.national_prefix;
        this.area_code = entity.area_code;
        this.extension = entity.extension;
    }
}