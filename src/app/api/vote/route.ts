import { ActionGetResponse, ACTIONS_CORS_HEADERS } from "@solana/actions"



export async function GET(request: Request) {

  const actionMetadata: ActionGetResponse = {
    icon: "https://a.storyblok.com/f/178900/1504x846/0fef8ea4a6/demon-slayer-kimetsu-no-yaiba-infinity-castle-first-movie-zenitus-locking-in.jpg",
    title: "Vote for your favorite demon slayer character ",
    description:"Vote between Zenitsu and Gyomei",
    label: "Vote",
  };
  
  return  Response.json(actionMetadata, {headers: ACTIONS_CORS_HEADERS}); 
}
