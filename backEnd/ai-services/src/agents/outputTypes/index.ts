import { z } from "zod";
import TitleOutputType from "./title_generator.output";

const outputTypesRegistry: Record<string, z.ZodObject > = {
    TitleOutputType
}

export default outputTypesRegistry