import { z } from "zod";
import TitleOutputType from "./title_generator.output";
import IsRelevantType from "./user_info.output";

const outputTypesRegistry: Record<string, z.ZodObject > = {
    TitleOutputType,
    IsRelevantType
}

export default outputTypesRegistry