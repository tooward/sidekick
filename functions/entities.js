class LOCATION {
    type;
    originalcontent;
    street_number;
    locality;
    street_name;
    postal_code;
    country;
    broad_region; // administrative area, such as the state, if detected
    narrow_region; // smaller administrative area, such as county, if detected
    sublocality; //  used in Asian addresses to demark a district within a city, if detected
    wikipedia_url;
}

class PHONE_NUMBER {
    type;
    originalcontent;
    number;
    national_prefix;
    area_code;
    extension;
}

class PERSON {
    type;
    originalcontent;
    name;
    wikipedia_url
}