class entityFoundIn {
    url;
    title;
    domain;
}

class ENTITY {
    type;
    collection;
    id;
    name;
    wikipedia_url;
    foundIn;

    // Creates a unique ID for the entity based on the wikipedia URL.
    // If there is no wikipedia URL uses GUID generated on the server.
    genereateId () {
        var hash = 0, i, chr;
        if (this.length === 0) return hash;

        for (i = 0; i < this.length; i++) {
            chr = this.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return hash + 2147483647 + 1;
    }

    genericToClass(element){
        this.id = element.id ? element.id : null;
        this.name = element.name ? element.name : null;
        this.wikipedia_url = element.wikipedia_url ? element.wikipedia_url : null;
        this.foundIn = element.foundIn ? element.foundIn : null;
    }

}

class PERSON extends ENTITY {
    constructor() {
        super();
        this.type = 'PERSON';
        this.collection = "people";
    }
}

class LOCATION extends ENTITY {
    street_number;
    locality;
    street_name;
    postal_code;
    country;
    broad_region; // administrative area, such as the state, if detected
    narrow_region; // smaller administrative area, such as county, if detected
    sublocality; //  used in Asian addresses to demark a district within a city, if detected

    constructor() {
        super();
        this.type = 'LOCATION';
        this.collection = "locations";
    }

    genericToClass(element){
        super.genericToClass(element);
        this.street_number = element.street_number ? element.street_number : null;
        this.locality = element.locality ? element.locality : null;
        this.street_name = element.street_name ? element.street_name : null;
        this.postal_code = element.postal_code ? element.postal_code : null;
        this.country = element.country ? element.country : null;
        this.broad_region = element.broad_region ? element.broad_region : null;
        this.narrow_region = element.narrow_region ? element.narrow_region : null;
        this.sublocality = element.sublocality ? element.sublocality : null;
    }

    isValid() {
        if (this.street_number || this.locality || this.street_name 
         || this.postal_code || this.country || this.broad_region 
         || this.narrow_region || this.sublocality)
            return true;
        else
            return false;
    }
}

class ORGANIZATION extends ENTITY {

    constructor() {
        super();
        this.type = 'ORGANIZATION';
        this.collection = "organizations";
    }
}

class CONSUMER_GOOD extends ENTITY {

    constructor() {
        super();
        this.type = 'CONSUMER_GOOD';
        this.collection = "consumer_goods";
    }
}

class WORK_OF_ART extends ENTITY {

    constructor() {
        super();
        this.type = 'WORK_OF_ART';
        this.collection = "artworks";
    }
}

export { ENTITY, PERSON, LOCATION, ORGANIZATION, CONSUMER_GOOD, WORK_OF_ART }