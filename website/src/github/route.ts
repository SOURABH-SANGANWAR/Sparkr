import { NextRequest, NextResponse } from 'next/server'
 

export function GET(
  req: NextRequest
) {
    console.log("params", req.nextUrl.searchParams.toString()) // Fix: Access the params property correctly
    console.log(req.headers)
    console.log(req.cookies)
    let response =  NextResponse.json({message: "Hello World"})
    return response
}
export function POST(
    req: NextRequest
) {
        console.log(req.body)
        // Print all params, headers, cookies, and the body
        console.log("params", req.nextUrl.searchParams.toString()) // Fix: Access the params property correctly
        console.log(req.headers)
        console.log(req.cookies)
        
        return NextResponse.json({message: "Hello World"})
}