package no.deichman.services.entity;

import com.google.gson.Gson;
import no.deichman.services.circulation.CirculationProfile;

import javax.servlet.ServletConfig;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.core.Response;
import com.google.gson.GsonBuilder;
import no.deichman.services.entity.kohaadapter.KohaAdapter;
import no.deichman.services.search.SearchService;

import static javax.ws.rs.core.Response.ok;

/**
 * Responsibility: Handle requests for data about circulation.
 */
@Path("circulation")
public class CirculationResource extends ResourceBase {

    private static final Gson GSON = new GsonBuilder().excludeFieldsWithoutExposeAnnotation().serializeNulls().setPrettyPrinting().create();

    public CirculationResource() {}

    CirculationResource(EntityService entityService, SearchService searchService, KohaAdapter kohaAdapter) {
        super(entityService, searchService, kohaAdapter);
    }

    @GET
    @Path("/{borrowerId: [0-9]+}")
    public final Response get(@PathParam("borrowerId") String borrowerId) throws Exception {
        return ok().entity(GSON.toJson(getEntityService().getProfile(borrowerId), CirculationProfile.class)).build();
    }

    @Override
    protected final ServletConfig getConfig() {
        return null;
    }
}
