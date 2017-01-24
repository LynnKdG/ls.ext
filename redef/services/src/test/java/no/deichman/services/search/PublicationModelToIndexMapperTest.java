package no.deichman.services.search;

import no.deichman.services.rdf.RDFModelUtil;
import no.deichman.services.uridefaults.XURI;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.riot.Lang;
import org.junit.Assert;
import org.junit.Test;

import static uk.co.datumedge.hamcrest.json.SameJSONAs.sameJSONAs;

/**
 * Responsibility: unit test WorkModelToIndexMapper.
 */
public class PublicationModelToIndexMapperTest {
    private String comparisonJsonDocument = "{\n"
            + "    \"ageLimit\": \"42\",\n"
            + "    \"agents\": [\n"
            + "        \"Ragde, Anne B.\",\n"
            + "        \"Falcinella, Cristina\",\n"
            + "        \"Frankenstein, Casanova\"\n"
            + "    ],\n"
            + "    \"audiences\": [\n"
            + "        \"http://data.deichman.no/audience#adult\"\n"
            + "    ],\n"
            + "    \"author\": [\n"
            + "        \"Ragde, Anne B.\",\n"
            + "        \"Falcinella, Cristina\",\n"
            + "        \"Frankenstein, Casanova\"\n"
            + "    ],\n"
            + "    \"bio\": \"Biografisk innhold\",\n"
            + "    \"contributors\": [\n"
            + "        {\n"
            + "            \"agent\": {\n"
            + "                \"name\": \"Falcinella, Cristina\",\n"
            + "                \"uri\": \"http://data.deichman.no/person/h11234\"\n"
            + "            },\n"
            + "            \"role\": \"http://data.deichman.no/role#adaptor\"\n"
            + "        },\n"
            + "        {\n"
            + "            \"agent\": {\n"
            + "                \"birthYear\": \"1957\",\n"
            + "                \"name\": \"Ragde, Anne B.\",\n"
            + "                \"uri\": \"http://data.deichman.no/person/h10834700\"\n"
            + "            },\n"
            + "            \"mainEntry\": true,\n"
            + "            \"role\": \"http://data.deichman.no/role#author\"\n"
            + "        }\n"
            + "    ],\n"
            + "    \"ean\": \"7023060119782\",\n"
            + "    \"desc\": \"rather good\",\n"
            + "    \"dewey\": \"929.209484213\",\n"
            + "    \"fictionNonfiction\": \"http://data.deichman.no/fictionNonfiction#fiction\",\n"
            + "    \"firstPublicationYear\": \"2004\",\n"
            + "    \"format\": \"E-bok\",\n"
            + "    \"formatAdaptation\": \"Storskrift\",\n"
            + "    \"formats\": [\n"
            + "        \"http://data.deichman.no/format#E-Book\"\n"
            + "    ],\n"
            + "    \"genre\": [\n"
            + "        \"Krim (spesial)\"\n"
            + "    ],\n"
            + "    \"image\": \"http://static.deichman.no/1549895/bk/1_thumb.jpg\",\n"
            + "    \"inst\": \"Tverrfløyte\",\n"
            + "    \"isbn\": \"978-88-545-0662-6\",\n"
            + "    \"ismn\": \"M 23000399-5\",\n"
            + "    \"kd\": \"ITA\",\n"
            + "    \"langTitles\": {\n"
            + "        \"http://lexvo.org/id/iso639-3/ita\": [\n"
            + "            {\n"
            + "                \"image\": \"http://static.deichman.no/1549895/bk/1_thumb.jpg\",\n"
            + "                \"mainTitle\": \"La casa delle bugie\",\n"
            + "                \"partTitle\": \"abc\",\n"
            + "                \"pubUri\": \"http://data.deichman.no/publication/p594502562255\",\n"
            + "                \"subtitle\": \"xyz\"\n"
            + "            },\n"
            + "            {\n"
            + "                \"mainTitle\": \"La casa delle bugie\",\n"
            + "                \"partTitle\": \"abc\",\n"
            + "                \"pubUri\": \"http://data.deichman.no/publication/p5945025622551\",\n"
            + "                \"subtitle\": \"xyz2\"\n"
            + "            }\n"
            + "        ],\n"
            + "        \"http://lexvo.org/id/iso639-3/nob\": [\n"
            + "            {\n"
            + "                \"image\": \"http://static.deichman.no/626460/kr/1_thumb.jpg\",\n"
            + "                \"mainTitle\": \"Berlinerpoplene\",\n"
            + "                \"partNumber\": \"1\",\n"
            + "                \"partTitle\": \"deltittel\",\n"
            + "                \"pubUri\": \"http://data.deichman.no/publication/p735933031021\",\n"
            + "                \"subtitle\": \"roman\"\n"
            + "            }\n"
            + "        ],\n"
            + "        \"uri\": \"http://ignore\"\n"
            + "    },\n"
            + "    \"language\": \"ita\",\n"
            + "    \"languages\": [\n"
            + "        \"http://lexvo.org/id/iso639-3/ita\"\n"
            + "    ],\n"
            + "    \"litform\": \"Roman\",\n"
            + "    \"mainEntryName\": \"Ragde, Anne B.\",\n"
            + "    \"mainTitle\": \"La casa delle bugie\",\n"
            + "    \"mediaTypesFromAllPublications\": [\n"
            + "        {\n"
            + "            \"formats\": [\n"
            + "                \"http://data.deichman.no/format#E-Book\",\n"
            + "                \"http://data.deichman.no/format#Book\"\n"
            + "            ],\n"
            + "            \"uri\": \"http://data.deichman.no/mediaType#Book\"\n"
            + "        }\n"
            + "    ],\n"
            + "    \"mediatype\": \"http://data.deichman.no/mediaType#Book\",\n"
            + "    \"mt\": \"bok\",\n"
            + "    \"nationality\": \"Norge\",\n"
            + "    \"partTitle\": \"abc\",\n"
            + "    \"publicationYear\": \"2013\",\n"
            + "    \"publishedBy\": \"Verdamt Verlag\",\n"
            + "    \"recordId\": \"3\",\n"
            + "    \"series\": [\n"
            + "        \"italiano norveigano\"\n"
            + "    ],\n"
            + "    \"subject\": [\n"
            + "        \"Trondheim\"\n"
            + "    ],\n"
            + "    \"subtitle\": \"xyz\",\n"
            + "    \"summary\": \"En bok...\",\n"
            + "    \"title\": [\n"
            + "        \"La casa delle bugie\",\n"
            + "        \"xyz\",\n"
            + "        \"abc\",\n"
            + "        \"Part one\",\n"
            + "        \"Part two\"\n"
            + "    ],\n"
            + "    \"adaptor\": \"Falcinella, Cristina\",\n"
            + "    \"uri\": \"http://data.deichman.no/publication/p594502562255\",\n"
            + "    \"writingSystem\": \"Latinsk\",\n"
            + "    \"workMainTitle\": \"Berlinerpoplene\",\n"
            + "    \"workUri\": \"http://data.deichman.no/work/w4e5db3a95caa282e5968f68866774e20\"\n"
            + "}";

    @Test
    public void testModelToIndexDocument() throws Exception {
        XURI workXuri = new XURI("http://data.deichman.no/work/w4e5db3a95caa282e5968f68866774e20");
        XURI personXuri = new XURI("http://data.deichman.no/person/h10834700");
        XURI publicationXuri1 = new XURI("http://data.deichman.no/publication/p594502562255");
        XURI publicationXuri2 = new XURI("http://data.deichman.no/publication/p735933031021");
        XURI subjectXuri = new XURI("http://deichman.no/subject/e1200005");

        String inputGraph = "@prefix ns1: <http://data.deichman.no/duo#> .\n"
                + "@prefix ns2: <http://data.deichman.no/ontology#> .\n"
                + "@prefix ns4: <http://data.deichman.no/raw#> .\n"
                + "@prefix ns5: <http://data.deichman.no/role#> .\n"
                + "@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .\n"
                + "@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .\n"
                + "@prefix xml: <http://www.w3.org/XML/1998/namespace> .\n"
                + "@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .\n"
                + "\n"
                + "<http://data.deichman.no/publication/p594502562255> rdf:type ns2:Publication ;\n"
                + "    ns2:bibliofilPublicationID \"1549895\" ;\n"
                + "    ns2:contributor [ rdf:type ns2:Contribution ;\n"
                + "            ns2:agent <http://data.deichman.no/person/h11234> ;\n"
                + "            ns2:role ns5:adaptor ] ;\n"
                + "    ns2:hasPublicationPart [ rdf:type ns2:PublicationPart ;\n"
                + "            ns2:agent <http://data.deichman.no/person/h11234> ;\n"
                + "            ns2:mainTitle \"Part one\" ;\n"
                + "            ns2:role ns5:author ] ;\n"
                + "    ns2:hasPublicationPart [ rdf:type ns2:PublicationPart ;\n"
                + "            ns2:agent <http://data.deichman.no/person/h77635> ;\n"
                + "            ns2:mainTitle \"Part two\" ;\n"
                + "            ns2:role ns5:author ] ;\n"
                + "    ns2:inSerial [ rdf:type ns2:SerialIssue ;\n"
                + "            ns2:serial <http://data.deichman.no/serial/s1> ] ;\n"
                + "    ns2:format <http://data.deichman.no/format#E-Book> ;\n"
                + "    ns2:hasMediaType <http://data.deichman.no/mediaType#Book> ;\n"
                + "    ns2:isbn \"978-88-545-0662-6\" ;\n"
                + "    ns2:ismn \"M 23000399-5\" ;\n"
                + "    ns2:ean \"7023060119782\" ;\n"
                + "    ns2:language <http://lexvo.org/id/iso639-3/ita> ;\n"
                + "    ns2:mainTitle \"La casa delle bugie\" ;\n"
                + "    ns2:partTitle \"abc\" ;\n"
                + "    ns2:subtitle \"xyz\" ;\n"
                + "    ns2:publishedBy <http://data.deichman.no/corporation/c999> ;\n"
                + "    ns2:publicationOf <http://data.deichman.no/work/w4e5db3a95caa282e5968f68866774e20> ;\n"
                + "    ns2:publicationYear \"2013\"^^xsd:gYear ;\n"
                + "    ns2:recordId \"3\" ;\n"
                + "    ns2:hasImage \"http://static.deichman.no/1549895/bk/1_thumb.jpg\" ;\n"
                + "    ns2:ageLimit \"42\" ;\n"
                + "    ns2:hasFormatAdaptation  <http://data.deichman.no/formatAdaptation#largePrint> ;\n"
                + "    ns2:fictionNonfiction \"http://data.deichman.no/fictionNonfiction#fiction\" ;\n"
                + "    ns2:locationClassNumber\"ITA\" ;\n"
                + "    ns2:writingSystem <http://data.deichman.no/writingSystem#latin> ;\n"
                + "    ns2:hasDescription \"rather good\" ;\n"
                + "    ns4:locationSignature \"Rag\" ;\n"
                + "    ns4:statementOfResponsibility \"Anne B. Ragde ; traduzione di Cristina Falcinella\" .\n"
                + "\n"
                + "<http://data.deichman.no/publication/p5945025622551> rdf:type ns2:Publication ;\n"
                + "    ns2:bibliofilPublicationID \"15498951\" ;\n"
                + "    ns2:contributor [ rdf:type ns2:Contribution ;\n"
                + "            ns2:agent <http://data.deichman.no/person/h11234> ;\n"
                + "            ns2:role ns5:adaptor ] ;\n"
                + "    ns2:inSerial [ rdf:type ns2:SerialIssue ;\n"
                + "            ns2:serial <http://data.deichman.no/serial/s1> ] ;\n"
                + "    ns2:format <http://data.deichman.no/format#E-Book> ;\n"
                + "    ns2:hasMediaType <http://data.deichman.no/mediaType#Book> ;\n"
                + "    ns2:isbn \"978-88-545-0662-6\" ;\n"
                + "    ns2:language <http://lexvo.org/id/iso639-3/ita> ;\n"
                + "    ns2:mainTitle \"La casa delle bugie\" ;\n"
                + "    ns2:partTitle \"abc\" ;\n"
                + "    ns2:subtitle \"xyz2\" ;\n"
                + "    ns2:publicationOf <http://data.deichman.no/work/w4e5db3a95caa282e5968f68866774e20> ;\n"
                + "    ns2:publicationYear \"2016\"^^xsd:gYear ;\n"
                + "    ns2:recordId \"33\" ;\n"
                + "    ns2:ageLimit \"42\" ;\n"
                + "    ns2:fictionNonfiction \"http://data.deichman.no/fictionNonfiction#fiction\" ;\n"
                + "    ns4:locationDewey \"ITA\" ;\n"
                + "    ns4:locationSignature \"Rag\" ;\n"
                + "    ns4:statementOfResponsibility \"Anne B. Ragde ; traduzione di Cristina Falcinella\" .\n"
                + "\n"
                + "<http://data.deichman.no/publication/p735933031021> rdf:type ns2:Publication ;\n"
                + "    ns2:bibliofilPublicationID \"0626460\" ;\n"
                + "    ns2:format <http://data.deichman.no/format#Book> ;\n"
                + "    ns2:hasMediaType <http://data.deichman.no/mediaType#Book> ;\n"
                + "    ns2:isbn \"82-495-0272-8\" ;\n"
                + "    ns2:language <http://lexvo.org/id/iso639-3/nob> ;\n"
                + "    ns2:mainTitle \"Berlinerpoplene\" ; ns2:partTitle \"deltittel\" ; ns2:partNumber \"1\" ;\n"
                + "    ns2:publicationOf <http://data.deichman.no/work/w4e5db3a95caa282e5968f68866774e20> ;\n"
                + "    ns2:publicationYear \"2004\"^^xsd:gYear ;\n"
                + "    ns2:recordId \"11\" ;\n"
                + "    ns2:hasImage \"http://static.deichman.no/626460/kr/1_thumb.jpg\" ;\n"
                + "    ns2:hasHoldingBranch \"hutl\", \"fgry\" ;"
                + "    ns2:subtitle \"roman\" ;\n"
                + "    ns4:locationSignature \"Rag\" ;\n"
                + "    ns4:publicationHistory \"Forts. i: Eremittkrepsene\" ;\n"
                + "    ns4:statementOfResponsibility \"Anne Birkefeldt Ragde\" .\n"
                + "\n"
                + "\n"
                + "<http://data.deichman.no/work/w4e5db3a95caa282e5968f68866774e20> rdf:type ns2:Work ;\n"
                + "    ns2:audience <http://data.deichman.no/audience#adult> ;\n"
                + "    ns2:contributor [ rdf:type ns2:Contribution,\n"
                + "                ns2:MainEntry ;\n"
                + "            ns2:agent <http://data.deichman.no/person/h10834700> ;\n"
                + "            ns2:role ns5:author ] ;\n"
                + "    ns2:language <http://lexvo.org/id/iso639-3/nob> ;\n"
                + "    ns2:literaryForm <http://data.deichman.no/literaryForm#novel> ;\n"
                + "    ns2:mainTitle \"Berlinerpoplene\" ;\n"
                + "    ns2:publicationYear \"2004\"^^xsd:gYear ;\n"
                + "    ns2:genre <http://deichman.no/genre/g1> ;\n"
                + "    ns2:hasClassification [ a ns2:ClassificationEntry ;\n"
                + "      ns2:hasClassificationNumber  \"929.209484213\" ;\n"
                + "      ns2:hasClassificationSource  <http://data.deichman.no/classificationSource#ddk5> ] ;\n"
                + "    ns2:subject <http://deichman.no/subject/e1200005> ;\n"
                + "    ns2:biography <http://data.deichman.no/biography#biographicalContent> ;\n"
                + "    ns2:hasSummary \"En bok...\" ;\n"
                + "    ns2:hasInstrumentation [ ns2:hasInstrument <http://data.deichman.no/instrument/i1> ] .\n"
                + "\n"
                + "<http://data.deichman.no/corporation/c999> rdf:type ns2:Corporation ;\n"
                + "    ns2:name \"Verdamt Verlag\" .\n"
                + "\n"
                + "<http://data.deichman.no/person/h10834700> rdf:type ns2:Person ;\n"
                + "    ns2:birthYear \"1957\" ;\n"
                + "    ns2:name \"Ragde, Anne B.\" ;\n"
                + "    ns2:nationality <http://data.deichman.no/nationality#n> ;\n"
                + "    ns2:personTitle \"forfatter\" ;\n"
                + "    ns4:lifeSpan \"1957-\" ;\n"
                + "    ns1:bibliofilPersonId \"10834700\" .\n"
                + "\n"
                + "<http://data.deichman.no/nationality#n> rdfs:label \"Norge\"@no, \"Norway\"@en ."
                + ""
                + "<http://data.deichman.no/person/h11234> rdf:type ns2:Person ;\n"
                + "    ns2:name \"Falcinella, Cristina\" ;\n"
                + "    ns2:nationality <http://data.deichman.no/nationality#ita> .\n"
                + "\n"
                + ""
                + "<http://data.deichman.no/person/h77635> rdf:type ns2:Person ;\n"
                + "    ns2:name \"Frankenstein, Casanova\" ;\n"
                + "    ns2:nationality <http://data.deichman.no/nationality#ita> .\n"
                + "\n"
                + "<http://deichman.no/subject/e1200005> rdf:type ns2:Subject ;\n"
                + "    ns2:prefLabel \"Trondheim\" ."
                + "\n"
                + "<http://deichman.no/genre/g1> rdf:type ns2:Genre ;\n"
                + "    ns2:prefLabel \"Krim\" ;\n"
                + "    ns2:specification \"spesial\" ."
                + "\n"
                + "<http://data.deichman.no/format#E-Book> rdfs:label \"E-bok\"@no ."
                + "<http://data.deichman.no/mediaType#Book> rdfs:label \"bok\"@no ."
                + "\n"
                + "<http://data.deichman.no/serial/s1> rdf:type ns2:Serial ;\n"
                + "     ns2:mainTitle \"italiano norveigano\" .\n"
                + "<http://data.deichman.no/literaryForm#novel> rdfs:label \"Roman\"@no, \"Novel\"@en .\n"
                + "\n"
                + "<http://data.deichman.no/writingSystem#latin> rdfs:label \"Latinsk\"@no, \"Latin\"@en .\n"
                + "\n"
                + "<http://data.deichman.no/formatAdaptation#largePrint> rdfs:label \"Storskrift\"@no, \"Large print\"@en ."
                + "\n"
                + "<http://data.deichman.no/instrument/i1> ns2:prefLabel \"Tverrfløyte\" ."
                + "\n"
                + "<http://data.deichman.no/biography#biographicalContent> rdfs:label \"Biografisk innhold\"@no, \"Biographical content\"@en .";

        Model model = RDFModelUtil.modelFrom(inputGraph, Lang.TURTLE);
        String jsonDocument = new ModelToIndexMapper("publication").createIndexDocument(model, publicationXuri1);

        Assert.assertThat(jsonDocument, sameJSONAs(String.format(
                comparisonJsonDocument,
                workXuri.getUri(),
                personXuri.getUri(),
                publicationXuri1.getUri(),
                publicationXuri2.getUri(),
                subjectXuri.getUri())
        ).allowingAnyArrayOrdering());
    }
}
