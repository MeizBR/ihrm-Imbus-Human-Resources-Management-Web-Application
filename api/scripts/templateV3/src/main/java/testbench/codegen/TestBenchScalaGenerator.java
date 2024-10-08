package testbench.codegen;

import io.swagger.codegen.v3.*;
import io.swagger.codegen.v3.generators.DefaultCodegenConfig;

import java.util.*;
import java.io.File;

public class TestBenchScalaGenerator extends AbstractScalaCodegenV3 {

        // source folder where to write the files
        protected String sourceFolder = "";
        protected String apiVersion = "1.0.0";

        /**
         * Configures the type of generator.
         *
         * @return  the CodegenType for this generator
         * @see     io.swagger.codegen.CodegenType
         */
        public CodegenType getTag() {
            return CodegenType.CLIENT;
        }

        /**
         * Configures a friendly name for the generator.  This will be used by the generator
         * to select the library with the -l flag.
         *
         * @return the friendly name for the generator
         */
        public String getName() {
            return "testbenchScala";
        }

        /**
         * Returns human-friendly help for the generator.  Provide the consumer with help
         * tips, parameters here
         *
         * @return A string value for the help message
         */
        public String getHelp() {
            return "Generate testbench backend scala case classes.";
        }

        public TestBenchScalaGenerator() {
            super();

            // set the output folder here
            outputFolder = "generated-code/testbenchScala";

            /**
             * Models.  You can write model files using the modelTemplateFiles map.
             * if you want to create one template for file, you can do so here.
             * for multiple files for model, just put another entry in the `modelTemplateFiles` with
             * a different extension
             */
            modelTemplateFiles.put(
                    "model.mustache", // the template to use
                    ".scala");       // the extension for each file to write

            /**
             * Api classes.  You can write classes for each Api file with the apiTemplateFiles map.
             * as with models, add multiple entries with different extensions for multiple files per
             * class
             */
//            apiTemplateFiles.put(
//                    "api.mustache",   // the template to use
//                    ".sample");       // the extension for each file to write

            /**
             * Template Location.  This is the location which templates will be read from.  The generator
             * will use the resource stream to attempt to read the templates.
             */
            templateDir = "testbenchScala";

            /**
             * Api Package.  Optional, if needed, this can be used in templates
             */
//            apiPackage = "testbench.microservice.api";

            /**
             * Model Package.  Optional, if needed, this can be used in templates
             */
//            modelPackage = "api.models";

            /**
             * Reserved words.  Override this with reserved words specific to your language
             */
            reservedWords = new HashSet<String> (
                    Arrays.asList(
                            "sample1",  // replace with static values
                            "sample2")
            );

            /**
             * Additional Properties.  These values can be passed to the templates and
             * are available in models, apis, and supporting files
             */
            additionalProperties.put("apiVersion", apiVersion);

            /**
             * Supporting Files.  You can write single files for the generator with the
             * entire object tree available.  If the input file has a suffix of `.mustache
             * it will be processed by the template engine.  Otherwise, it will be copied
             */
            supportingFiles.add(new SupportingFile("myFile.mustache",   // the input template or file
                    "",                                                       // the destination folder, relative `outputFolder`
                    "myFile.scala")                                          // the output file
            );

            /**
             * Language Specific Primitives.  These types will not trigger imports by
             * the client generator
             */
            languageSpecificPrimitives = new HashSet<String>(
                    Arrays.asList(
                            "Type1",      // replace these with your types
                            "Type2")
            );
        }

        /**
         * Escapes a reserved word as defined in the `reservedWords` array. Handle escaping
         * those terms here.  This logic is only called if a variable matches the reserved words
         *
         * @return the escaped term
         */
        @Override
        public String escapeReservedWord(String name) {
            return "_" + name;  // add an underscore to the name
        }

        /**
         * Location to write model files.  You can use the modelPackage() as defined when the class is
         * instantiated
         */
        public String modelFileFolder() {
            if (sourceFolder.isEmpty())
                return outputFolder + "/" + modelPackage().replace('.', File.separatorChar);

            return outputFolder + "/" + sourceFolder + "/" + modelPackage().replace('.', File.separatorChar);
        }

        /**
         * Location to write api files.  You can use the apiPackage() as defined when the class is
         * instantiated
         */
        @Override
        public String apiFileFolder() {
            if (sourceFolder.isEmpty())
                return outputFolder + "/" + apiPackage().replace('.', File.separatorChar);

            return outputFolder + "/" + sourceFolder + "/" + apiPackage().replace('.', File.separatorChar);
        }

        @Override
        public String getArgumentsLocation() {
            return null;
        }

        @Override
        protected String getTemplateDir() {
            return templateDir;
        }

        @Override
        public String getDefaultTemplateDir() {
            return templateDir;
        }
}
