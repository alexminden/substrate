export enum ApiMethods {
    GET = 'GET',
    POST = 'POST',
}

export type FunctionInfo = {
    id: string,
    functions: Method[]
}

export type Method = {
    functionName: string,
    apiResource: string,
    apiName: string,
    apiMethod: ApiMethods,
    memory: number,
}

export const TpsFunctions: Method[] = [
    { 
        functionName: 'create-instance', 
        apiName: 'newInstance', 
        apiResource: 'instance', 
        apiMethod: ApiMethods.POST, 
        memory: 256 
    }
]