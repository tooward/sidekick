declare class entityFoundIn {
    /**
     * Class for storing data about where an entity was found in a document
     * domain allows for indexing to show all entities found from a specific website
     */

    url : URL;
    title : string;
    domain : URL;

    setDomain(): void;
}

declare class ENTITY {
  /**
   * Base class for entities returned by Google NLP API
   */
    id: string;
    userId: string;
    type: string;
    collection: string;
    name: string;
    wikipedia_url: string;
    savedTime: Date;
    updatedTime: Date;
    found_in: entityFoundIn[];

    /**
     * converts a generic NLP entity to a class
     * @param element returned by Google NLP API
     * @returns void as operates on an object in place
     */
    public genericToClass(element: any): void;
    public static plainToClass(element: any): ENTITY;
}

declare class PERSON extends ENTITY {
    /**
     * Class for PERSON entities 
     * Maps to entity returned by Google NLP API
     * https://cloud.google.com/natural-language/docs/reference/rest/v1/Entity#Type
     */
    constructor();
}

declare class LOCATION extends ENTITY {
    /**
     * Class for LOCATION entities returned by Google NLP API
     * https://cloud.google.com/natural-language/docs/reference/rest/v1/Entity#Type
     * 
     */

    street_number: string;
    locality : string;
    street_name: string;
    postal_code : string;
    country : string;
    broad_region : string; // administrative area, such as the state, if detected
    narrow_region : string; // smaller administrative area, such as county, if detected
    sublocality : string; //  used in Asian addresses to demark a district within a city, if detected

    constructor();
    /**
     * Override of entity genericToClass adding additional fields
     * @param element is the entity returned by Google NLP API with type LOCATION fields (see https://cloud.google.com/natural-language/docs/reference/rest/v1/Entity#Type)
     */
    genericToClass(element: any): void;
    isValid(): boolean;
}

declare class ORGANIZATION extends ENTITY {
    /**
     * Class for ORGANIZATION entities returned by Google NLP API
     * https://cloud.google.com/natural-language/docs/reference/rest/v1/Entity#Type
     */
     
    constructor();
}

declare class CONSUMER_GOOD extends ENTITY {
    /**
     * Class for CONSUMER_GOOD entities returned by Google NLP API
     * https://cloud.google.com/natural-language/docs/reference/rest/v1/Entity#Type
     */

    constructor();
}

declare class WORK_OF_ART extends ENTITY {
    /**
     * Class for WORK_OF_ART entities returned by Google NLP API
     * https://cloud.google.com/natural-language/docs/reference/rest/v1/Entity#Type
     */

    constructor();
}

export { entityTypes, ENTITY, PERSON, LOCATION, ORGANIZATION, CONSUMER_GOOD, WORK_OF_ART }