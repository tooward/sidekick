
class entityFoundIn {
    url;
    title;
    domain;

    constructor(url, title) {
        this.url = url;
        this.title = title;

        if(this.url){
            this.setDomain();
        }
    }

    setDomain() {
        if(this.url){
            try{
              let comurl = new URL(this.url.toString());
              this.domain = comurl.host ? comurl.host : ""; 
            }
            catch(err){
              console.log("Unable to get domain from url. error: ")
            }
          }
    }
}

class ENTITY {
    id;
    userId;
    type;
    collection="entities";
    name;
    wikipedia_url;
    savedTime;
    updatedTime;
    foundIn;

    // Creates a unique ID for the entity based on the wikipedia URL.
    // If there is no wikipedia URL uses GUID generated on the server.
    genereateId (input) {
        var hash = 0, i, chr;
        if (this.length === 0) return hash;

        for (i = 0; i < input.length; i++) {
            chr = input.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return hash + 2147483647 + 1;
    }

    genericToClass(element){
        this.type = element.type ? element.type : null;
        this.collection = element.collection ? element.collection : null;
        this.id = element.id ? element.id : null;
        this.name = element.name ? element.name : null;
        this.wikipedia_url = element.wikipedia_url ? element.wikipedia_url : null;
        this.savedTime = element.savedTime ? new Date(Date.parse(element.savedTime)) : null;
        this.updatedTime = element.updatedTime ? new Date (Date.parse(element.updatedTime)) : null;
        this.foundIn = element.foundIn ? element.foundIn : null;
    }

    static plainToClass(element){
        let entity = new ENTITY();
        entity.genericToClass(element);
        return entity;
    }
}

class PERSON extends ENTITY {
    constructor() {
        super();
        this.type = 'PERSON';
        this.collection = "entities";
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
        this.collection = "entities";
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

class phone_number extends ENTITY {
    numbering;
    national_prefix;
    area_code;
    extension;

    constructor() {
        super();
        this.type = 'PHONE_NUMBER';
        this.collection = "entities";
    }

    genericToClass(entity) {
        super.genericToClass(entity);
        this.number = entity.number ? entity.number : null;
        this.national_prefix = entity.national_prefix ? entity.national_prefix : null;
        this.area_code = entity.area_code ? entity.area_code : null;
        this.extension = entity.extension ? entity.extension : null;
    }
}

class ORGANIZATION extends ENTITY {

    constructor() {
        super();
        this.type = 'ORGANIZATION';
        this.collection = "entities";
    }
}

class CONSUMER_GOOD extends ENTITY {

    constructor() {
        super();
        this.type = 'CONSUMER_GOOD';
        this.collection = "entities";
    }
}

class WORK_OF_ART extends ENTITY {

    constructor() {
        super();
        this.type = 'WORK_OF_ART';
        this.collection = "entities";
    }
}

export { ENTITY, PERSON, LOCATION, ORGANIZATION, CONSUMER_GOOD, WORK_OF_ART }