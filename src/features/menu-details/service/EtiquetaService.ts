import {Tag} from "@/types/Tag";
import {TagRequest} from "@/types/TagRequest";
import axiosInstance from "@/shared/api/axiosInstance";

export const getTags = async (body: TagRequest): Promise<Tag[]> => {
    const response = await axiosInstance.post('/etiquetas/consulta', body);
    return response.data.data;
}
