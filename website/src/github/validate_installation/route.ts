// import User  from "@/models/User";
// import connectDB from "@/lib/connectDB";
// import { NextRequest, NextResponse } from 'next/server'
// import validateInstallation from "@/utils/validate_installation";

// export async function GET(request: NextRequest) {
//     await connectDB();
//     const access_token = request.nextUrl.searchParams.get("access_token");
//     const installation_id = request.nextUrl.searchParams.get("installation_id");
//     if (!access_token) {
//         return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
//     }
//     const installation = await validateInstallation(access_token, parseInt(installation_id as string));
//     if (!installation) {
//         return NextResponse.json({ message: "Invalid Installation" }, { status: 400 });
//     }
//     return NextResponse.json({ installation });




// } 