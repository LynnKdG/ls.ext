package no.deichman.services.entity.repository;

import no.deichman.services.entity.patch.Patch;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Statement;

import java.util.List;
import java.util.Optional;
import java.util.function.Consumer;

/**
 * Responsibility: TODO.
 */
public interface RDFRepository {

    String createWork(Model model);
    String createPublication(Model model, String recordID);
    String createPerson(Model inputModel);
    String createPlaceOfPublication(Model inputModel);

    void updateWork(String work);
    Model retrieveWorkByURI(String uri);

    Model retrieveWorkAndLinkedResourcesByURI(String uri);

    Model retrievePublicationByURI(String uri);
    Model retrievePersonByURI(String uri);
    Model retrievePersonAndLinkedResourcesByURI(String uri);

    Model retrievePlaceOfPublicationByURI(String uri);

    boolean askIfResourceExists(String uri);

    boolean askIfStatementExists(Statement statement);

    void delete(Model inputModel);

    void patch(List<Patch> patches);

    Optional<String> getResourceURIByBibliofilId(String personId);

    Optional<String> getPlaceOfPublicationResourceURIByBibliofilId(String id);

    Model retrieveWorksByCreator(String creatorUri);

    Model retrievePublicationsByWork(String work);

    void findAllUrisOfType(String type, Consumer<String> uriConsumer);
}
