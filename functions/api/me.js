import {json,validSession} from '../_shared.js';
export async function onRequestGet({request,env}){return json({authenticated:await validSession(request,env)},await validSession(request,env)?200:401)}