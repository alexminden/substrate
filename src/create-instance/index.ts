import { Context } from 'aws-lambda';

export async function handler(event: any, context: Context): Promise<void> {
    try{
        console.log('test');
    } catch(err) {
        throw new Error(`Function error: ${err}`);
    }
}