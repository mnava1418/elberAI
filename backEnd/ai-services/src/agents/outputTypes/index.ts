import { z } from "zod";
import TitleOutputType from "./title_generator.output";
import IsRelevantType from "./user_info.output";
import LTMList from "./long_memory.output";

const outputTypesRegistry: Record<string, z.ZodObject > = {
    TitleOutputType,
    IsRelevantType,
    LTMList
}

export default outputTypesRegistry