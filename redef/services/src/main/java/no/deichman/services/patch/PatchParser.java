package no.deichman.services.patch;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonParseException;
import com.google.gson.reflect.TypeToken;

import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.List;
import no.deichman.services.error.PatchParserException;

/**
 * Responsibility: TODO.
 */
public final class PatchParser {

    private String patchInput;
    private List<PatchObject> rawParseObject = new ArrayList<>();
    private static final Type PATCH_OBJECT_LIST_TYPE = new TypeToken<List<PatchObject>>() {}.getType();

    PatchParser(String input){
        setPatchData(input);
    }

    public PatchParser() {
    }

    public List<PatchObject> parsePatch() throws PatchParserException {
        Gson gson = new GsonBuilder()
                .registerTypeAdapter(PATCH_OBJECT_LIST_TYPE, new PatchObjectTypeAdapter())
                .create();
        List<PatchObject> rawPatches;
        try {
            rawPatches = gson.fromJson(patchInput, PATCH_OBJECT_LIST_TYPE);
        } catch (JsonParseException jpe) {
            throw new PatchParserException("Error parsing patch" + patchInput, jpe);
        }
        rawParseObject.addAll(rawPatches);
        return rawPatches;
    }

    public void setPatchData(String input){
        patchInput = input;
    }

    public String getPatchInput() {
        return patchInput;
    }

    public List<PatchObject> getRawPatchObject() {
        return rawParseObject;
    }
}
