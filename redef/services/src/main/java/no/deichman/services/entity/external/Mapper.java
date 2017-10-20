package no.deichman.services.entity.external;

/**
 * Responsibility: map data from external resources to internal anonymous RDF.
 */
public final class Mapper {

    public Result map(String sourceName, SearchResultInfo resultInfo) throws Exception {
        Target target = Target.valueOf(sourceName.toUpperCase());
        Result result = new Result(resultInfo);
        MARCMapper marcMapper;
        switch (target) {
            case DFB:
                marcMapper = new DFBMarcMapper(target.getCataloguingSourceUri(), true);
                break;
            case BIBBI:
                default:
                marcMapper = new BSMarcMapper(target.getCataloguingSourceUri(), true);
                break;
        }
        result.setSource(target.getDatabaseName());

        if (target.getDataFormat().contains("marc")) {
            result.setHits(marcMapper.getMapping(resultInfo.getMarcXmlContent()));
        } else {
            throw new Exception("No mapper identified for this resource");
        }
        return result;
    }
}
