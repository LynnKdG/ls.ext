package no.deichman.services.entity;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import no.deichman.services.circulation.Loan;
import no.deichman.services.entity.kohaadapter.KohaAdapter;
import no.deichman.services.search.SearchService;

import javax.inject.Singleton;
import javax.servlet.ServletConfig;
import javax.ws.rs.DefaultValue;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.Response;
import java.util.ArrayList;

import static javax.ws.rs.core.Response.ok;

/**
 * Responsibility: Handle requests for data about circulation.
 */
@Singleton
@Path("history")
public final class History extends ResourceBase {

    private static final Gson GSON = new GsonBuilder().excludeFieldsWithoutExposeAnnotation().serializeNulls().setPrettyPrinting().create();

    @Context
    private ServletConfig servletConfig;

    public History() {}

    History(EntityService entityService, SearchService searchService, KohaAdapter kohaAdapter) {
        super(entityService, searchService, kohaAdapter);
    }

    @GET
    @Path("/{borrowerId: [0-9]+}")
    public Response get(@PathParam("borrowerId") String borrowerId,
                        @QueryParam("offset") @DefaultValue("0") int offset,
                        @QueryParam("limit") @DefaultValue("20") int limit) throws Exception {
        return ok().entity(GSON.toJson(
                getEntityService().getHistoricalLoans(borrowerId, offset, limit), new ArrayList<Loan>().getClass())
        ).build();
    }

    @Override
    protected ServletConfig getConfig() {
        return servletConfig;
    }
}
