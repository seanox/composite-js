#import io/xml

/**
 * Interface for data access to the material data.
 * The namespace io.material is created at the end with the macro #export.
 */
const material = {
    
    /**
     * Loads the data and simulates a REST interface.
     * @return XMLDocument
     */
    list() {
        return DataSource.fetch("xml://data/materials.xml");
    }
}

#export material@io;