import { ActionGetResponse, ActionPostRequest, ACTIONS_CORS_HEADERS } from "@solana/actions"
import { Connection, PublicKey } from "@solana/web3.js";
import { IconBrandLinkedin } from "@tabler/icons-react";


export const OPTION  = GET;

export async function GET(request: Request) {

  const actionMetadata: ActionGetResponse = {
    icon: "https://a.storyblok.com/f/178900/1504x846/0fef8ea4a6/demon-slayer-kimetsu-no-yaiba-infinity-castle-first-movie-zenitus-locking-in.jpg",
    title: "Vote for your favorite demon slayer character ",
    description:"Vote between Zenitsu and Gyomei",
    label: "Vote",
    links: {
      actions: [
        {
          type: "post",
          label: "Vote Zenistu",
          href: "/api/vote?candidate=Oscar"
        },
        {
          type: "post",
          label: "Vote Gyomei",
          href: "/api/vote?candidate=Crunch"
        }
      ]
    },
  };
  
  return  Response.json(actionMetadata, {headers: ACTIONS_CORS_HEADERS}); 
}


export async function POST(request: Request) {

  const url = new URL(request.url);
  const candidate = url.searchParams.get("candidate");// Vas permettre de vérifiée si candidat existe

  if (candidate != "Oscar" && candidate != "Crunch"){
    return new Response("Invalid candidate",{ status:400, headers: ACTIONS_CORS_HEADERS});
  }
  
  const connection = new Connection("http://127.0.0.1:8899","confirmed");
  const body : ActionPostRequest = await request.json()

  let voter;

  try {
    //Doit renvoyé une public Key
      voter = new PublicKey(body.account);
  } catch (error) {
    return new Response("Invalid account",{status:400, headers: ACTIONS_CORS_HEADERS});
  }
}